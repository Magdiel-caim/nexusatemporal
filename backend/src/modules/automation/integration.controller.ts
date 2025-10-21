import { Request, Response } from 'express';
import { IntegrationService } from './integration.service';
import { Pool } from 'pg';

export class IntegrationController {
  private integrationService: IntegrationService;

  constructor(db: Pool) {
    this.integrationService = new IntegrationService(db);
  }

  /**
   * GET /api/automation/integrations
   * Lista integrações
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';
      const type = req.query.type as string;

      const integrations = await this.integrationService.findAll(tenantId, type);

      res.json({
        success: true,
        data: integrations,
        total: integrations.length
      });
    } catch (error: any) {
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
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
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
  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId || 'default';

      const integration = await this.integrationService.create(req.body, tenantId);

      res.status(201).json({
        success: true,
        message: 'Integration created successfully',
        data: integration
      });
    } catch (error: any) {
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
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
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
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

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
    } catch (error: any) {
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
  async test(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId || 'default';

      const result = await this.integrationService.testIntegration(id, tenantId);

      res.json({
        success: result.success,
        message: result.message,
        details: result.details,
        tested_at: result.tested_at
      });
    } catch (error: any) {
      console.error('Error testing integration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test integration',
        error: error.message
      });
    }
  }
}
