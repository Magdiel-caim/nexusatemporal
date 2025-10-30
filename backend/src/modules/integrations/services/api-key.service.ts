import { Repository } from 'typeorm';
import { ApiKey, ApiKeyStatus } from '../entities/api-key.entity';
import crypto from 'crypto';

export class ApiKeyService {
  private repository: Repository<ApiKey>;

  constructor(repository: Repository<ApiKey>) {
    this.repository = repository;
  }

  /**
   * Gera uma nova API Key segura
   */
  private generateSecureKey(): string {
    const prefix = 'nxs'; // Nexus prefix
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  /**
   * Cria uma nova API Key
   */
  async create(data: {
    name: string;
    description?: string;
    scopes: string[];
    allowedIps?: string[];
    allowedOrigins?: string[];
    rateLimit?: number;
    expiresAt?: Date;
    tenantId: string;
    createdById: string;
  }): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateSecureKey();

    // Hash da chave para armazenamento seguro
    const hashedKey = crypto.createHash('sha256').update(plainKey).digest('hex');

    const apiKey = this.repository.create({
      name: data.name,
      key: hashedKey,
      description: data.description,
      scopes: data.scopes,
      allowedIps: data.allowedIps,
      allowedOrigins: data.allowedOrigins,
      rateLimit: data.rateLimit || 1000,
      expiresAt: data.expiresAt,
      tenantId: data.tenantId,
      createdById: data.createdById,
      status: ApiKeyStatus.ACTIVE,
    });

    await this.repository.save(apiKey);

    // Retorna a chave plain apenas uma vez (para o usuário copiar)
    return { apiKey, plainKey };
  }

  /**
   * Lista API Keys do tenant
   */
  async findAll(tenantId: string): Promise<ApiKey[]> {
    return this.repository
      .createQueryBuilder('apiKey')
      .leftJoinAndSelect('apiKey.createdBy', 'user')
      .where('apiKey.tenantId = :tenantId', { tenantId })
      .andWhere('apiKey.deletedAt IS NULL')
      .orderBy('apiKey.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Busca API Key por ID
   */
  async findById(id: string, tenantId: string): Promise<ApiKey | null> {
    const apiKey = await this.repository
      .createQueryBuilder('apiKey')
      .leftJoinAndSelect('apiKey.createdBy', 'user')
      .where('apiKey.id = :id', { id })
      .andWhere('apiKey.tenantId = :tenantId', { tenantId })
      .andWhere('apiKey.deletedAt IS NULL')
      .getOne();

    return apiKey;
  }

  /**
   * Valida uma API Key (para autenticação)
   */
  async validate(plainKey: string): Promise<ApiKey | null> {
    try {
      // Hash da chave fornecida
      const hashedKey = crypto.createHash('sha256').update(plainKey).digest('hex');

      const apiKey = await this.repository
        .createQueryBuilder('apiKey')
        .where('apiKey.key = :key', { key: hashedKey })
        .andWhere('apiKey.status = :status', { status: ApiKeyStatus.ACTIVE })
        .andWhere('apiKey.deletedAt IS NULL')
        .getOne();

      if (!apiKey) {
        return null;
      }

      // Verifica expiração
      if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
        return null;
      }

      // Atualiza uso
      await this.repository.update(apiKey.id, {
        lastUsedAt: new Date(),
        usageCount: apiKey.usageCount + 1,
      });

      return apiKey;
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Atualiza status da API Key
   */
  async updateStatus(
    id: string,
    status: ApiKeyStatus,
    tenantId: string
  ): Promise<ApiKey | null> {
    const apiKey = await this.findById(id, tenantId);
    if (!apiKey) {
      return null;
    }

    apiKey.status = status;
    await this.repository.save(apiKey);

    return apiKey;
  }

  /**
   * Revoga uma API Key
   */
  async revoke(id: string, tenantId: string): Promise<boolean> {
    const apiKey = await this.findById(id, tenantId);
    if (!apiKey) {
      return false;
    }

    apiKey.status = ApiKeyStatus.REVOKED;
    await this.repository.save(apiKey);

    return true;
  }

  /**
   * Atualiza configurações da API Key
   */
  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      scopes?: string[];
      allowedIps?: string[];
      allowedOrigins?: string[];
      rateLimit?: number;
      expiresAt?: Date;
    }
  ): Promise<ApiKey | null> {
    const apiKey = await this.findById(id, tenantId);
    if (!apiKey) {
      return null;
    }

    Object.assign(apiKey, data);
    await this.repository.save(apiKey);

    return apiKey;
  }

  /**
   * Deleta (soft delete) uma API Key
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const apiKey = await this.findById(id, tenantId);
    if (!apiKey) {
      return false;
    }

    apiKey.deletedAt = new Date();
    await this.repository.save(apiKey);

    return true;
  }

  /**
   * Verifica rate limit
   */
  async checkRateLimit(apiKey: ApiKey): Promise<boolean> {
    // Implementação simplificada - em produção usar Redis
    // Por agora, retorna true (permitir)
    return true;
  }

  /**
   * Obtém estatísticas de uso
   */
  async getUsageStats(tenantId: string): Promise<{
    total: number;
    active: number;
    revoked: number;
    totalUsage: number;
  }> {
    const apiKeys = await this.repository
      .createQueryBuilder('apiKey')
      .where('apiKey.tenantId = :tenantId', { tenantId })
      .andWhere('apiKey.deletedAt IS NULL')
      .getMany();

    return {
      total: apiKeys.length,
      active: apiKeys.filter((k) => k.status === ApiKeyStatus.ACTIVE).length,
      revoked: apiKeys.filter((k) => k.status === ApiKeyStatus.REVOKED).length,
      totalUsage: apiKeys.reduce((sum, k) => sum + k.usageCount, 0),
    };
  }
}
