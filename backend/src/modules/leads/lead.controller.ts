import { Request, Response } from 'express';
import { LeadService } from './lead.service';

export class LeadController {
  private leadService = new LeadService();

  createLead = async (req: Request, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user as any;
      console.log('Creating lead with data:', req.body);
      const lead = await this.leadService.createLead({
        ...req.body,
        tenantId,
        createdById: userId,
      });
      res.status(201).json(lead);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getLeads = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        stageId: req.query.stageId as string,
        assignedToId: req.query.assignedToId as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        source: req.query.source as any,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      };

      const leads = await this.leadService.getLeadsByTenant(tenantId, filters);
      res.json(leads);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const lead = await this.leadService.getLeadById(id, tenantId);

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, id: userId } = req.user as any;
      const lead = await this.leadService.updateLead(id, tenantId, req.body, userId);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteLead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      await this.leadService.deleteLead(id, tenantId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  moveLeadToStage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { stageId } = req.body;
      const { tenantId, id: userId } = req.user as any;
      const lead = await this.leadService.moveLeadToStage(id, stageId, tenantId, userId);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  bulkUpdateLeads = async (req: Request, res: Response) => {
    try {
      const { leadIds, data } = req.body;
      const { tenantId, id: userId } = req.user as any;
      const leads = await this.leadService.bulkUpdateLeads(leadIds, tenantId, data, userId);
      res.json(leads);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Activity operations
  createActivity = async (req: Request, res: Response) => {
    try {
      const { id: leadId } = req.params;
      const { id: userId } = req.user as any;
      const activity = await this.leadService.createActivity({
        ...req.body,
        leadId,
        userId,
      });
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getLeadActivities = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const activities = await this.leadService.getLeadActivities(id);
      res.json(activities);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  completeActivity = async (req: Request, res: Response) => {
    try {
      const { activityId } = req.params;
      const activity = await this.leadService.completeActivity(activityId);
      res.json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Analytics
  getLeadStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const stats = await this.leadService.getLeadStats(tenantId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
