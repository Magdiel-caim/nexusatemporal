"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerController = void 0;
const trigger_service_1 = require("./trigger.service");
class TriggerController {
    triggerService;
    constructor(db) {
        this.triggerService = new trigger_service_1.TriggerService(db);
    }
    async findAll(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                event: req.query.event
            };
            const triggers = await this.triggerService.findAll(tenantId, filters);
            res.json({
                success: true,
                data: triggers,
                total: triggers.length
            });
        }
        catch (error) {
            console.error('Error fetching triggers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch triggers',
                error: error.message
            });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const trigger = await this.triggerService.findById(id, tenantId);
            if (!trigger) {
                res.status(404).json({
                    success: false,
                    message: 'Trigger not found'
                });
                return;
            }
            res.json({
                success: true,
                data: trigger
            });
        }
        catch (error) {
            console.error('Error fetching trigger:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch trigger',
                error: error.message
            });
        }
    }
    async create(req, res) {
        try {
            const userId = req.user?.userId;
            const tenantId = req.user?.tenantId || 'default';
            const trigger = await this.triggerService.create(req.body, userId, tenantId);
            res.status(201).json({
                success: true,
                message: 'Trigger created successfully',
                data: trigger
            });
        }
        catch (error) {
            console.error('Error creating trigger:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to create trigger',
                error: error.message
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const trigger = await this.triggerService.update(id, req.body, tenantId);
            if (!trigger) {
                res.status(404).json({
                    success: false,
                    message: 'Trigger not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Trigger updated successfully',
                data: trigger
            });
        }
        catch (error) {
            console.error('Error updating trigger:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update trigger',
                error: error.message
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const deleted = await this.triggerService.delete(id, tenantId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Trigger not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Trigger deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting trigger:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete trigger',
                error: error.message
            });
        }
    }
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const trigger = await this.triggerService.toggleActive(id, tenantId);
            if (!trigger) {
                res.status(404).json({
                    success: false,
                    message: 'Trigger not found'
                });
                return;
            }
            res.json({
                success: true,
                message: `Trigger ${trigger.is_active ? 'activated' : 'deactivated'} successfully`,
                data: trigger
            });
        }
        catch (error) {
            console.error('Error toggling trigger:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle trigger',
                error: error.message
            });
        }
    }
    async getStats(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const stats = await this.triggerService.getStats(tenantId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching trigger stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch trigger stats',
                error: error.message
            });
        }
    }
    async getEventTypes(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const eventTypes = await this.triggerService.getEventTypes(tenantId);
            res.json({
                success: true,
                data: eventTypes
            });
        }
        catch (error) {
            console.error('Error fetching event types:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch event types',
                error: error.message
            });
        }
    }
}
exports.TriggerController = TriggerController;
//# sourceMappingURL=trigger.controller.js.map