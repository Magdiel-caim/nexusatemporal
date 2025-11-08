"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const purchase_order_service_1 = require("./purchase-order.service");
class PurchaseOrderController {
    purchaseOrderService = new purchase_order_service_1.PurchaseOrderService();
    createPurchaseOrder = async (req, res) => {
        try {
            const { tenantId, userId } = req.user;
            const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder({
                ...req.body,
                tenantId,
                createdById: userId,
            });
            res.status(201).json(purchaseOrder);
        }
        catch (error) {
            console.error('Error creating purchase order:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getPurchaseOrders = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                supplierId: req.query.supplierId,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
                search: req.query.search,
            };
            const orders = await this.purchaseOrderService.getPurchaseOrdersByTenant(tenantId, filters);
            res.json(orders);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getPurchaseOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const order = await this.purchaseOrderService.getPurchaseOrderById(id, tenantId);
            if (!order) {
                return res.status(404).json({ error: 'Ordem de compra não encontrada' });
            }
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updatePurchaseOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const order = await this.purchaseOrderService.updatePurchaseOrder(id, tenantId, req.body);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    approvePurchaseOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const order = await this.purchaseOrderService.approvePurchaseOrder(id, tenantId, userId);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    markAsSent = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const order = await this.purchaseOrderService.markAsSent(id, tenantId, req.body);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    markAsInTransit = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const order = await this.purchaseOrderService.markAsInTransit(id, tenantId);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    receivePurchaseOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const order = await this.purchaseOrderService.receivePurchaseOrder(id, tenantId, {
                ...req.body,
                receivedById: userId,
            });
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    cancelPurchaseOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const { cancelReason } = req.body;
            const order = await this.purchaseOrderService.cancelPurchaseOrder(id, tenantId, {
                canceledById: userId,
                cancelReason,
            });
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    addAttachment = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const order = await this.purchaseOrderService.addAttachment(id, tenantId, req.body);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getPurchaseOrderStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const stats = await this.purchaseOrderService.getPurchaseOrderStats(tenantId);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.PurchaseOrderController = PurchaseOrderController;
//# sourceMappingURL=purchase-order.controller.js.map