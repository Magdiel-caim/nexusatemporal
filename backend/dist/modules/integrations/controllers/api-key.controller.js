"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyController = void 0;
const api_key_entity_1 = require("../entities/api-key.entity");
class ApiKeyController {
    apiKeyService;
    constructor(apiKeyService) {
        this.apiKeyService = apiKeyService;
    }
    /**
     * Lista todas as API Keys do tenant
     * GET /api/integrations/api-keys
     */
    list = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const apiKeys = await this.apiKeyService.findAll(tenantId);
            // Remove as chaves do response (só retorna metadata)
            const sanitized = apiKeys.map((key) => ({
                id: key.id,
                name: key.name,
                description: key.description,
                status: key.status,
                scopes: key.scopes,
                allowedIps: key.allowedIps,
                allowedOrigins: key.allowedOrigins,
                rateLimit: key.rateLimit,
                expiresAt: key.expiresAt,
                lastUsedAt: key.lastUsedAt,
                usageCount: key.usageCount,
                createdBy: key.createdBy,
                createdAt: key.createdAt,
                updatedAt: key.updatedAt,
                // key field é OMITIDO por segurança
            }));
            res.json(sanitized);
        }
        catch (error) {
            console.error('Error listing API keys:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Cria uma nova API Key
     * POST /api/integrations/api-keys
     */
    create = async (req, res) => {
        try {
            const { tenantId, userId } = req.user;
            const { name, description, scopes, allowedIps, allowedOrigins, rateLimit, expiresAt, } = req.body;
            // Validações
            if (!name || !scopes || scopes.length === 0) {
                return res.status(400).json({
                    error: 'Nome e escopos são obrigatórios',
                });
            }
            const validScopes = ['read', 'write', 'full'];
            const invalidScopes = scopes.filter((s) => !validScopes.includes(s));
            if (invalidScopes.length > 0) {
                return res.status(400).json({
                    error: `Escopos inválidos: ${invalidScopes.join(', ')}`,
                });
            }
            const { apiKey, plainKey } = await this.apiKeyService.create({
                name,
                description,
                scopes,
                allowedIps,
                allowedOrigins,
                rateLimit,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                tenantId,
                createdById: userId,
            });
            // IMPORTANTE: A chave plain só é retornada aqui, uma única vez
            res.status(201).json({
                apiKey: {
                    id: apiKey.id,
                    name: apiKey.name,
                    description: apiKey.description,
                    status: apiKey.status,
                    scopes: apiKey.scopes,
                    allowedIps: apiKey.allowedIps,
                    allowedOrigins: apiKey.allowedOrigins,
                    rateLimit: apiKey.rateLimit,
                    expiresAt: apiKey.expiresAt,
                    createdAt: apiKey.createdAt,
                },
                key: plainKey, // Única vez que a chave é retornada!
                message: 'API Key criada com sucesso! Copie e guarde a chave, ela não será exibida novamente.',
            });
        }
        catch (error) {
            console.error('Error creating API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Busca uma API Key por ID
     * GET /api/integrations/api-keys/:id
     */
    getById = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const apiKey = await this.apiKeyService.findById(id, tenantId);
            if (!apiKey) {
                return res.status(404).json({ error: 'API Key não encontrada' });
            }
            // Remove a chave do response
            const sanitized = {
                id: apiKey.id,
                name: apiKey.name,
                description: apiKey.description,
                status: apiKey.status,
                scopes: apiKey.scopes,
                allowedIps: apiKey.allowedIps,
                allowedOrigins: apiKey.allowedOrigins,
                rateLimit: apiKey.rateLimit,
                expiresAt: apiKey.expiresAt,
                lastUsedAt: apiKey.lastUsedAt,
                usageCount: apiKey.usageCount,
                createdBy: apiKey.createdBy,
                createdAt: apiKey.createdAt,
                updatedAt: apiKey.updatedAt,
            };
            res.json(sanitized);
        }
        catch (error) {
            console.error('Error getting API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Atualiza uma API Key
     * PUT /api/integrations/api-keys/:id
     */
    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const { name, description, scopes, allowedIps, allowedOrigins, rateLimit, expiresAt, } = req.body;
            const apiKey = await this.apiKeyService.update(id, tenantId, {
                name,
                description,
                scopes,
                allowedIps,
                allowedOrigins,
                rateLimit,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            });
            if (!apiKey) {
                return res.status(404).json({ error: 'API Key não encontrada' });
            }
            res.json({
                id: apiKey.id,
                name: apiKey.name,
                description: apiKey.description,
                status: apiKey.status,
                scopes: apiKey.scopes,
                allowedIps: apiKey.allowedIps,
                allowedOrigins: apiKey.allowedOrigins,
                rateLimit: apiKey.rateLimit,
                expiresAt: apiKey.expiresAt,
                updatedAt: apiKey.updatedAt,
            });
        }
        catch (error) {
            console.error('Error updating API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Revoga uma API Key
     * POST /api/integrations/api-keys/:id/revoke
     */
    revoke = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const success = await this.apiKeyService.revoke(id, tenantId);
            if (!success) {
                return res.status(404).json({ error: 'API Key não encontrada' });
            }
            res.json({ message: 'API Key revogada com sucesso' });
        }
        catch (error) {
            console.error('Error revoking API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Ativa uma API Key
     * POST /api/integrations/api-keys/:id/activate
     */
    activate = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const apiKey = await this.apiKeyService.updateStatus(id, api_key_entity_1.ApiKeyStatus.ACTIVE, tenantId);
            if (!apiKey) {
                return res.status(404).json({ error: 'API Key não encontrada' });
            }
            res.json({ message: 'API Key ativada com sucesso' });
        }
        catch (error) {
            console.error('Error activating API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Deleta uma API Key (soft delete)
     * DELETE /api/integrations/api-keys/:id
     */
    delete = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const success = await this.apiKeyService.delete(id, tenantId);
            if (!success) {
                return res.status(404).json({ error: 'API Key não encontrada' });
            }
            res.json({ message: 'API Key deletada com sucesso' });
        }
        catch (error) {
            console.error('Error deleting API key:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Obtém estatísticas de uso
     * GET /api/integrations/api-keys/stats
     */
    getStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const stats = await this.apiKeyService.getUsageStats(tenantId);
            res.json(stats);
        }
        catch (error) {
            console.error('Error getting API key stats:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.ApiKeyController = ApiKeyController;
//# sourceMappingURL=api-key.controller.js.map