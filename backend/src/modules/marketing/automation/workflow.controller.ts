import { Request, Response } from 'express';
import { WorkflowService } from './workflow.service';
import { Pool } from 'pg';

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor(db: Pool) {
    this.workflowService = new WorkflowService(db);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';
      const filters = {
        is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
        workflow_type: req.query.workflow_type as string
      };

      const workflows = await this.workflowService.findAll(tenantId, filters);

      res.json({
        success: true,
        data: workflows,
        total: workflows.length
      });
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workflows',
        error: error.message
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
      console.error('Error fetching workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workflow',
        error: error.message
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const tenantId = (req as any).user?.tenantId || 'default';

      const workflow = await this.workflowService.create(req.body, userId, tenantId);

      res.status(201).json({
        success: true,
        message: 'Workflow created successfully',
        data: workflow
      });
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create workflow',
        error: error.message
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
      console.error('Error updating workflow:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update workflow',
        error: error.message
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete workflow',
        error: error.message
      });
    }
  }

  async execute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

      const result = await this.workflowService.execute(
        {
          workflow_id: id,
          input_data: req.body
        },
        tenantId
      );

      res.json({
        success: true,
        message: 'Workflow executed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to execute workflow',
        error: error.message
      });
    }
  }

  async getExecutionLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await this.workflowService.getExecutionLogs(id, tenantId, limit);

      res.json({
        success: true,
        data: logs,
        total: logs.length
      });
    } catch (error: any) {
      console.error('Error fetching execution logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch execution logs',
        error: error.message
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';

      const stats = await this.workflowService.getStats(tenantId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching workflow stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workflow stats',
        error: error.message
      });
    }
  }
}
