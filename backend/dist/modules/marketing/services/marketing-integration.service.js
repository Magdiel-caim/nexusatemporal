"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingIntegrationService = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
class MarketingIntegrationService {
    repository = (0, typeorm_1.getRepository)(entities_1.MarketingIntegration);
    /**
     * Create or update integration
     */
    async upsert(tenantId, platform, data, userId) {
        // Check if integration already exists
        let integration = await this.repository.findOne({
            where: { tenantId, platform },
        });
        if (integration) {
            // Update existing
            integration.name = data.name || integration.name;
            integration.credentials = { ...integration.credentials, ...data.credentials };
            integration.config = { ...integration.config, ...data.config };
            integration.status = data.status || integration.status;
            integration.lastSyncAt = new Date();
        }
        else {
            // Create new
            integration = this.repository.create({
                tenantId,
                platform,
                name: data.name || platform,
                credentials: data.credentials || {},
                config: data.config || {},
                status: data.status || entities_1.IntegrationStatus.ACTIVE,
                createdBy: userId,
            });
        }
        return await this.repository.save(integration);
    }
    /**
     * Get integration by platform
     */
    async getByPlatform(tenantId, platform) {
        const result = await this.repository.findOne({
            where: { tenantId, platform },
        });
        return result || undefined;
    }
    /**
     * Get all integrations for a tenant
     */
    async getAll(tenantId, filters) {
        const query = { tenantId };
        if (filters?.status) {
            query.status = filters.status;
        }
        return await this.repository.find({
            where: query,
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Get all AI provider integrations
     */
    async getAIProviders(tenantId) {
        const aiPlatforms = [
            entities_1.IntegrationPlatform.GROQ,
            entities_1.IntegrationPlatform.OPENROUTER,
            entities_1.IntegrationPlatform.DEEPSEEK,
            entities_1.IntegrationPlatform.MISTRAL,
            entities_1.IntegrationPlatform.QWEN,
            entities_1.IntegrationPlatform.OLLAMA,
        ];
        return await this.repository
            .createQueryBuilder('integration')
            .where('integration.tenantId = :tenantId', { tenantId })
            .andWhere('integration.platform IN (:...platforms)', { platforms: aiPlatforms })
            .andWhere('integration.status = :status', { status: entities_1.IntegrationStatus.ACTIVE })
            .getMany();
    }
    /**
     * Test integration connection
     */
    async testConnection(integrationId, tenantId) {
        const integration = await this.repository.findOne({
            where: { id: integrationId, tenantId },
        });
        if (!integration) {
            return { success: false, message: 'Integration not found' };
        }
        try {
            // Test based on platform
            switch (integration.platform) {
                case entities_1.IntegrationPlatform.GROQ:
                case entities_1.IntegrationPlatform.OPENROUTER:
                case entities_1.IntegrationPlatform.DEEPSEEK:
                case entities_1.IntegrationPlatform.MISTRAL:
                case entities_1.IntegrationPlatform.QWEN:
                    // Test API key by making a simple request
                    if (!integration.credentials.api_key) {
                        throw new Error('API key not configured');
                    }
                    // TODO: Make actual API test request
                    break;
                case entities_1.IntegrationPlatform.OLLAMA:
                    // Test Ollama connection
                    if (!integration.config.base_url) {
                        throw new Error('Base URL not configured');
                    }
                    // TODO: Make actual API test request
                    break;
                case entities_1.IntegrationPlatform.WAHA:
                    // Test WAHA connection
                    if (!integration.credentials.api_key || !integration.config.server_url) {
                        throw new Error('WAHA credentials not configured');
                    }
                    // TODO: Make actual API test request
                    break;
                default:
                    throw new Error(`Testing not implemented for platform: ${integration.platform}`);
            }
            // Update integration
            integration.status = entities_1.IntegrationStatus.ACTIVE;
            integration.errorMessage = undefined;
            integration.lastSyncAt = new Date();
            await this.repository.save(integration);
            return { success: true, message: 'Connection successful' };
        }
        catch (error) {
            // Update integration with error
            integration.status = entities_1.IntegrationStatus.ERROR;
            integration.errorMessage = error.message;
            await this.repository.save(integration);
            return { success: false, message: error.message };
        }
    }
    /**
     * Delete integration
     */
    async delete(integrationId, tenantId) {
        const result = await this.repository.delete({
            id: integrationId,
            tenantId,
        });
        return (result.affected || 0) > 0;
    }
    /**
     * Update integration status
     */
    async updateStatus(integrationId, tenantId, status) {
        const integration = await this.repository.findOne({
            where: { id: integrationId, tenantId },
        });
        if (!integration) {
            return undefined;
        }
        integration.status = status;
        return await this.repository.save(integration);
    }
    /**
     * Get credentials for AI provider (safe method that only returns if active)
     */
    async getAIProviderCredentials(tenantId, provider) {
        const integration = await this.repository.findOne({
            where: {
                tenantId,
                platform: provider,
                status: entities_1.IntegrationStatus.ACTIVE,
            },
        });
        if (!integration) {
            return null;
        }
        return {
            apiKey: integration.credentials.api_key,
            baseUrl: integration.config.base_url,
        };
    }
}
exports.MarketingIntegrationService = MarketingIntegrationService;
//# sourceMappingURL=marketing-integration.service.js.map