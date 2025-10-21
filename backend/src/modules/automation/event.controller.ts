import { Request, Response } from 'express';
import { EventService } from './event.service';
import { Pool } from 'pg';

export class EventController {
  private eventService: EventService;

  constructor(db: Pool) {
    this.eventService = new EventService(db);
  }

  /**
   * GET /api/automation/events
   * Lista eventos com filtros
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';

      const dto = {
        tenant_id: tenantId,
        event_type: req.query.event_type as string,
        entity_type: req.query.entity_type as string,
        entity_id: req.query.entity_id as string,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await this.eventService.findAll(dto);

      res.json({
        success: true,
        data: result.events,
        total: result.total,
        limit: dto.limit,
        offset: dto.offset
      });
    } catch (error: any) {
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
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
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
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

      const stats = await this.eventService.getStats(tenantId, startDate, endDate);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
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
  async getEventTypes(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';

      const eventTypes = await this.eventService.getEventTypes(tenantId);

      res.json({
        success: true,
        data: eventTypes
      });
    } catch (error: any) {
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
  async cleanup(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';
      const daysToKeep = req.query.days ? parseInt(req.query.days as string) : 90;

      const deletedCount = await this.eventService.deleteOldEvents(tenantId, daysToKeep);

      res.json({
        success: true,
        message: `Deleted ${deletedCount} old events`,
        deleted: deletedCount
      });
    } catch (error: any) {
      console.error('Error cleaning up events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup events',
        error: error.message
      });
    }
  }
}
