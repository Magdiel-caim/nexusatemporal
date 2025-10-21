import { Repository } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import { StockAuditLog, AuditAction, AuditEntityType } from './audit-log.entity';

export interface CreateAuditLogDto {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
}

export interface AuditLogFilters {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  tenantId: string;
  limit?: number;
  offset?: number;
}

export class AuditLogService {
  private auditLogRepository: Repository<StockAuditLog>;

  constructor() {
    this.auditLogRepository = CrmDataSource.getRepository(StockAuditLog);
  }

  async createLog(data: CreateAuditLogDto): Promise<StockAuditLog> {
    const log = this.auditLogRepository.create(data);
    return await this.auditLogRepository.save(log);
  }

  async findAll(filters: AuditLogFilters): Promise<{ data: StockAuditLog[]; total: number }> {
    const query = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.tenantId = :tenantId', { tenantId: filters.tenantId });

    if (filters.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const total = await query.getCount();

    if (filters.limit) {
      query.limit(filters.limit);
    }
    if (filters.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('log.createdAt', 'DESC');

    const data = await query.getMany();

    return { data, total };
  }

  async findByEntity(
    entityType: AuditEntityType,
    entityId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<StockAuditLog[]> {
    return await this.auditLogRepository.find({
      where: { entityType, entityId, tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getEntityHistory(
    entityType: AuditEntityType,
    entityId: string,
    tenantId: string
  ): Promise<StockAuditLog[]> {
    return await this.findByEntity(entityType, entityId, tenantId, 100);
  }

  async getUserActivity(
    userId: string,
    tenantId: string,
    days: number = 30
  ): Promise<StockAuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: { userId, tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return logs.filter(log => new Date(log.createdAt) >= startDate);
  }

  async getAuditSummary(
    tenantId: string,
    days: number = 30
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    recentLogs: StockAuditLog[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const recentLogs = logs.filter(log => new Date(log.createdAt) >= startDate);

    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};

    recentLogs.forEach(log => {
      // Count by action
      if (!actionsByType[log.action]) {
        actionsByType[log.action] = 0;
      }
      actionsByType[log.action]++;

      // Count by user
      const userName = log.userName || log.user?.name || 'Unknown';
      if (!actionsByUser[userName]) {
        actionsByUser[userName] = 0;
      }
      actionsByUser[userName]++;
    });

    return {
      totalActions: recentLogs.length,
      actionsByType,
      actionsByUser,
      recentLogs: recentLogs.slice(0, 20),
    };
  }
}

export const auditLogService = new AuditLogService();
