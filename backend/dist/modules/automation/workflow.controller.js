"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const workflow_service_1 = require("./workflow.service");
class WorkflowController {
    workflowService;
    constructor(db) {
        this.workflowService = new workflow_service_1.WorkflowService(db);
    }
    async findAll(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                workflow_type: req.query.workflow_type
            };
            const workflows = await this.workflowService.findAll(tenantId, filters);
            res.json({
                success: true,
                data: workflows,
                total: workflows.length
            });
        }
        catch (error) {
            console.error('Error fetching workflows:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch workflows',
                error: error.message
            });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const workflow = await this.workflowService.findById(id, tenantId);
            if (!workflow) {
                res.status(404).json({
                    success: false,
                    message: 'Workflow not found'
                });
                return;
            }
            res.json({
                success: true,
                data: workflow
            });
        }
        catch (error) {
            console.error('Error fetching workflow:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch workflow',
                error: error.message
            });
        }
    }
    async create(req, res) {
        try {
            const userId = req.user?.userId;
            const tenantId = req.user?.tenantId || 'default';
            const workflow = await this.workflowService.create(req.body, userId, tenantId);
            res.status(201).json({
                success: true,
                message: 'Workflow created successfully',
                data: workflow
            });
        }
        catch (error) {
            console.error('Error creating workflow:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to create workflow',
                error: error.message
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const workflow = await this.workflowService.update(id, req.body, tenantId);
            if (!workflow) {
                res.status(404).json({
                    success: false,
                    message: 'Workflow not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Workflow updated successfully',
                data: workflow
            });
        }
        catch (error) {
            console.error('Error updating workflow:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update workflow',
                error: error.message
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const deleted = await this.workflowService.delete(id, tenantId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Workflow not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Workflow deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting workflow:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete workflow',
                error: error.message
            });
        }
    }
    async execute(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const result = await this.workflowService.execute({
                workflow_id: id,
                input_data: req.body
            }, tenantId);
            res.json({
                success: true,
                message: 'Workflow executed successfully',
                data: result
            });
        }
        catch (error) {
            console.error('Error executing workflow:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to execute workflow',
                error: error.message
            });
        }
    }
    async getExecutionLogs(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const limit = parseInt(req.query.limit) || 50;
            const logs = await this.workflowService.getExecutionLogs(id, tenantId, limit);
            res.json({
                success: true,
                data: logs,
                total: logs.length
            });
        }
        catch (error) {
            console.error('Error fetching execution logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch execution logs',
                error: error.message
            });
        }
    }
    async getStats(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const stats = await this.workflowService.getStats(tenantId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching workflow stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch workflow stats',
                error: error.message
            });
        }
    }
}
exports.WorkflowController = WorkflowController;
//# sourceMappingURL=workflow.controller.js.map