import { Request, Response } from 'express';
import { SupplierService } from './supplier.service';

export class SupplierController {
  private supplierService = new SupplierService();

  createSupplier = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const supplier = await this.supplierService.createSupplier({
        ...req.body,
        tenantId,
      });
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getSuppliers = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined
          ? req.query.isActive === 'true'
          : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
      };

      const suppliers = await this.supplierService.getSuppliersByTenant(tenantId, filters);
      res.json(suppliers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getSupplier = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const supplier = await this.supplierService.getSupplierById(id, tenantId);

      if (!supplier) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      res.json(supplier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateSupplier = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const supplier = await this.supplierService.updateSupplier(id, tenantId, req.body);
      res.json(supplier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteSupplier = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const result = await this.supplierService.deleteSupplier(id, tenantId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  activateSupplier = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const supplier = await this.supplierService.activateSupplier(id, tenantId);
      res.json(supplier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deactivateSupplier = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const supplier = await this.supplierService.deactivateSupplier(id, tenantId);
      res.json(supplier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getSupplierStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const stats = await this.supplierService.getSupplierStats(tenantId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
