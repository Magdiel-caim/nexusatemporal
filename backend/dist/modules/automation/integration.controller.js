"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = void 0;
const integration_service_1 = require("./integration.service");
class IntegrationController {
    integrationService;
    constructor(db) {
        this.integrationService = new integration_service_1.IntegrationService(db);
    }
    /**
     * GET /api/automation/integrations
     * Lista integrações
     */
    async findAll(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const type = req.query.type;
            const integrations = await this.integrationService.findAll(tenantId, type);
            res.json({
                success: true,
                data: integrations,
                total: integrations.length
            });
        }
        catch (error) {
            console.error('Error fetching integrations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch integrations',
                error: error.message
            });
        }
    }
    /**
     * GET /api/automation/integrations/:id
     * Busca integração por ID
     */
    async findById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const integration = await this.integrationService.findById(id, tenantId);
            if (!integration) {
                res.status(404).json({
                    success: false,
                    message: 'Integration not found'
                });
                return;
            }
            res.json({
                success: true,
                data: integration
            });
        }
        catch (error) {
            console.error('Error fetching integration:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch integration',
                error: error.message
            });
        }
    }
    /**
     * POST /api/automation/integrations
     * Cria nova integração
     */
    async create(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const integration = await this.integrationService.create(req.body, tenantId);
            res.status(201).json({
                success: true,
                message: 'Integration created successfully',
                data: integration
            });
        }
        catch (error) {
            console.error('Error creating integration:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to create integration',
                error: error.message
            });
        }
    }
    /**
     * PUT /api/automation/integrations/:id
     * Atualiza integração
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const integration = await this.integrationService.update(id, req.body, tenantId);
            if (!integration) {
                res.status(404).json({
                    success: false,
                    message: 'Integration not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Integration updated successfully',
                data: integration
            });
        }
        catch (error) {
            console.error('Error updating integration:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update integration',
                error: error.message
            });
        }
    }
    /**
     * DELETE /api/automation/integrations/:id
     * Deleta integração
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const deleted = await this.integrationService.delete(id, tenantId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Integration not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Integration deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting integration:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete integration',
                error: error.message
            });
        }
    }
    /**
     * POST /api/automation/integrations/:id/test
     * Testa integração
     */
    async test(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const result = await this.integrationService.testIntegration(id, tenantId);
            res.json({
                success: result.success,
                message: result.message,
                details: result.details,
                tested_at: result.tested_at
            });
        }
        catch (error) {
            console.error('Error testing integration:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test integration',
                error: error.message
            });
        }
    }
}
exports.IntegrationController = IntegrationController;
//# sourceMappingURL=integration.controller.js.map