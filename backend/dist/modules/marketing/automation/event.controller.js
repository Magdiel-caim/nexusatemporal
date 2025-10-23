"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("./event.service");
class EventController {
    eventService;
    constructor(db) {
        this.eventService = new event_service_1.EventService(db);
    }
    /**
     * GET /api/automation/events
     * Lista eventos com filtros
     */
    async findAll(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const dto = {
                tenant_id: tenantId,
                event_type: req.query.event_type,
                entity_type: req.query.entity_type,
                entity_id: req.query.entity_id,
                start_date: req.query.start_date ? new Date(req.query.start_date) : undefined,
                end_date: req.query.end_date ? new Date(req.query.end_date) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0
            };
            const result = await this.eventService.findAll(dto);
            res.json({
                success: true,
                data: result.events,
                total: result.total,
                limit: dto.limit,
                offset: dto.offset
            });
        }
        catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch events',
                error: error.message
            });
        }
    }
    /**
     * GET /api/automation/events/:id
     * Busca evento por ID
     */
    async findById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            const event = await this.eventService.findById(id, tenantId);
            if (!event) {
                res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
                return;
            }
            res.json({
                success: true,
                data: event
            });
        }
        catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch event',
                error: error.message
            });
        }
    }
    /**
     * GET /api/automation/events/stats
     * Obtém estatísticas de eventos
     */
    async getStats(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const stats = await this.eventService.getStats(tenantId, startDate, endDate);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching event stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch event stats',
                error: error.message
            });
        }
    }
    /**
     * GET /api/automation/events/types
     * Lista tipos de eventos disponíveis
     */
    async getEventTypes(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const eventTypes = await this.eventService.getEventTypes(tenantId);
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
    /**
     * DELETE /api/automation/events/cleanup
     * Limpa eventos antigos (admin only)
     */
    async cleanup(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const daysToKeep = req.query.days ? parseInt(req.query.days) : 90;
            const deletedCount = await this.eventService.deleteOldEvents(tenantId, daysToKeep);
            res.json({
                success: true,
                message: `Deleted ${deletedCount} old events`,
                deleted: deletedCount
            });
        }
        catch (error) {
            console.error('Error cleaning up events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cleanup events',
                error: error.message
            });
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=event.controller.js.map