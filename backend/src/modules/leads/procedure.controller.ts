import { Request, Response } from 'express';
import { procedureService } from './procedure.service';

export class ProcedureController {
  async getProcedures(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const procedures = await procedureService.getProcedures(tenantId);
      return res.json(procedures);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getProcedure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const procedure = await procedureService.getProcedure(id, tenantId);

      if (!procedure) {
        return res.status(404).json({ message: 'Procedure not found' });
      }

      return res.json(procedure);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createProcedure(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as any;
      const procedure = await procedureService.createProcedure({
        ...req.body,
        tenantId,
      });
      return res.status(201).json(procedure);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateProcedure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const procedure = await procedureService.updateProcedure(
        id,
        tenantId,
        req.body
      );

      if (!procedure) {
        return res.status(404).json({ message: 'Procedure not found' });
      }

      return res.json(procedure);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteProcedure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const success = await procedureService.deleteProcedure(id, tenantId);

      if (!success) {
        return res.status(404).json({ message: 'Procedure not found' });
      }

      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
