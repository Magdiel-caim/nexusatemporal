import { Request, Response } from 'express';
import { PipelineService } from './pipeline.service';

export class PipelineController {
  private pipelineService = new PipelineService();

  createPipeline = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const pipeline = await this.pipelineService.createPipeline({
        ...req.body,
        tenantId,
      });
      res.status(201).json(pipeline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getPipelines = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const pipelines = await this.pipelineService.getPipelinesByTenant(tenantId);
      res.json(pipelines);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getPipeline = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const pipeline = await this.pipelineService.getPipelineById(id, tenantId);

      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }

      res.json(pipeline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updatePipeline = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const pipeline = await this.pipelineService.updatePipeline(
        id,
        tenantId,
        req.body
      );
      res.json(pipeline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deletePipeline = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      await this.pipelineService.deletePipeline(id, tenantId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Stage operations
  createStage = async (req: Request, res: Response) => {
    try {
      const stage = await this.pipelineService.createStage(req.body);
      res.status(201).json(stage);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateStage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const stage = await this.pipelineService.updateStage(id, req.body);
      res.json(stage);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteStage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.pipelineService.deleteStage(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  reorderStages = async (req: Request, res: Response) => {
    try {
      const { stageOrders } = req.body;
      await this.pipelineService.reorderStages(stageOrders);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
