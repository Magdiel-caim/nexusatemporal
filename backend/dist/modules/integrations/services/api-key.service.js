"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = void 0;
const api_key_entity_1 = require("../entities/api-key.entity");
const crypto_1 = __importDefault(require("crypto"));
class ApiKeyService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Gera uma nova API Key segura
     */
    generateSecureKey() {
        const prefix = 'nxs'; // Nexus prefix
        const randomBytes = crypto_1.default.randomBytes(32).toString('hex');
        return `${prefix}_${randomBytes}`;
    }
    /**
     * Cria uma nova API Key
     */
    async create(data) {
        const plainKey = this.generateSecureKey();
        // Hash da chave para armazenamento seguro
        const hashedKey = crypto_1.default.createHash('sha256').update(plainKey).digest('hex');
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
            status: api_key_entity_1.ApiKeyStatus.ACTIVE,
        });
        await this.repository.save(apiKey);
        // Retorna a chave plain apenas uma vez (para o usuário copiar)
        return { apiKey, plainKey };
    }
    /**
     * Lista API Keys do tenant
     */
    async findAll(tenantId) {
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
    async findById(id, tenantId) {
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
    async validate(plainKey) {
        try {
            // Hash da chave fornecida
            const hashedKey = crypto_1.default.createHash('sha256').update(plainKey).digest('hex');
            const apiKey = await this.repository
                .createQueryBuilder('apiKey')
                .where('apiKey.key = :key', { key: hashedKey })
                .andWhere('apiKey.status = :status', { status: api_key_entity_1.ApiKeyStatus.ACTIVE })
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
        }
        catch (error) {
            console.error('Error validating API key:', error);
            return null;
        }
    }
    /**
     * Atualiza status da API Key
     */
    async updateStatus(id, status, tenantId) {
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
    async revoke(id, tenantId) {
        const apiKey = await this.findById(id, tenantId);
        if (!apiKey) {
            return false;
        }
        apiKey.status = api_key_entity_1.ApiKeyStatus.REVOKED;
        await this.repository.save(apiKey);
        return true;
    }
    /**
     * Atualiza configurações da API Key
     */
    async update(id, tenantId, data) {
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
    async delete(id, tenantId) {
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
    async checkRateLimit(apiKey) {
        // Implementação simplificada - em produção usar Redis
        // Por agora, retorna true (permitir)
        return true;
    }
    /**
     * Obtém estatísticas de uso
     */
    async getUsageStats(tenantId) {
        const apiKeys = await this.repository
            .createQueryBuilder('apiKey')
            .where('apiKey.tenantId = :tenantId', { tenantId })
            .andWhere('apiKey.deletedAt IS NULL')
            .getMany();
        return {
            total: apiKeys.length,
            active: apiKeys.filter((k) => k.status === api_key_entity_1.ApiKeyStatus.ACTIVE).length,
            revoked: apiKeys.filter((k) => k.status === api_key_entity_1.ApiKeyStatus.REVOKED).length,
            totalUsage: apiKeys.reduce((sum, k) => sum + k.usageCount, 0),
        };
    }
}
exports.ApiKeyService = ApiKeyService;
//# sourceMappingURL=api-key.service.js.map