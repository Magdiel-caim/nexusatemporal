"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogService = exports.AuditLogService = void 0;
const data_source_1 = require("../../database/data-source");
const audit_log_entity_1 = require("./audit-log.entity");
class AuditLogService {
    auditLogRepository;
    constructor() {
        this.auditLogRepository = data_source_1.CrmDataSource.getRepository(audit_log_entity_1.StockAuditLog);
    }
    async createLog(data) {
        const log = this.auditLogRepository.create(data);
        return await this.auditLogRepository.save(log);
    }
    async findAll(filters) {
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
    async findByEntity(entityType, entityId, tenantId, limit = 50) {
        return await this.auditLogRepository.find({
            where: { entityType, entityId, tenantId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getEntityHistory(entityType, entityId, tenantId) {
        return await this.findByEntity(entityType, entityId, tenantId, 100);
    }
    async getUserActivity(userId, tenantId, days = 30) {
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
    async getAuditSummary(tenantId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const logs = await this.auditLogRepository.find({
            where: { tenantId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        const recentLogs = logs.filter(log => new Date(log.createdAt) >= startDate);
        const actionsByType = {};
        const actionsByUser = {};
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
exports.AuditLogService = AuditLogService;
exports.auditLogService = new AuditLogService();
//# sourceMappingURL=audit-log.service.js.map