import { Request, Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';

export class PurchaseOrderController {
  private purchaseOrderService = new PurchaseOrderService();

  createPurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.user as any;
      const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder({
        ...req.body,
        tenantId,
        createdById: userId,
      });
      res.status(201).json(purchaseOrder);
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        supplierId: req.query.supplierId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        search: req.query.search as string,
      };

      const orders = await this.purchaseOrderService.getPurchaseOrdersByTenant(tenantId, filters);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getPurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const order = await this.purchaseOrderService.getPurchaseOrderById(id, tenantId);

      if (!order) {
        return res.status(404).json({ error: 'Ordem de compra não encontrada' });
      }

      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updatePurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const order = await this.purchaseOrderService.updatePurchaseOrder(id, tenantId, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  approvePurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user as any;
      const order = await this.purchaseOrderService.approvePurchaseOrder(id, tenantId, userId);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  markAsSent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const order = await this.purchaseOrderService.markAsSent(id, tenantId, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  markAsInTransit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const order = await this.purchaseOrderService.markAsInTransit(id, tenantId);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  receivePurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user as any;
      const order = await this.purchaseOrderService.receivePurchaseOrder(id, tenantId, {
        ...req.body,
        receivedById: userId,
      });
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelPurchaseOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user as any;
      const { cancelReason } = req.body;
      const order = await this.purchaseOrderService.cancelPurchaseOrder(id, tenantId, {
        canceledById: userId,
        cancelReason,
      });
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  addAttachment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const order = await this.purchaseOrderService.addAttachment(id, tenantId, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getPurchaseOrderStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const stats = await this.purchaseOrderService.getPurchaseOrderStats(tenantId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
