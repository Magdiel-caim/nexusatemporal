"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const data_source_1 = require("../../database/data-source");
const purchase_order_entity_1 = require("./purchase-order.entity");
const typeorm_1 = require("typeorm");
class PurchaseOrderService {
    purchaseOrderRepository = data_source_1.CrmDataSource.getRepository(purchase_order_entity_1.PurchaseOrder);
    async generateOrderNumber(tenantId) {
        const year = new Date().getFullYear();
        const prefix = 'PO';
        const lastOrder = await this.purchaseOrderRepository
            .createQueryBuilder('po')
            .where('po.tenantId = :tenantId', { tenantId })
            .andWhere('po.orderNumber LIKE :pattern', {
            pattern: `${prefix}-${year}%`,
        })
            .orderBy('po.orderNumber', 'DESC')
            .getOne();
        let number = 1;
        if (lastOrder) {
            const lastNumber = parseInt(lastOrder.orderNumber.split('-').pop() || '0');
            number = lastNumber + 1;
        }
        return `${prefix}-${year}-${number.toString().padStart(6, '0')}`;
    }
    async createPurchaseOrder(data) {
        const orderNumber = await this.generateOrderNumber(data.tenantId);
        const purchaseOrder = this.purchaseOrderRepository.create({
            ...data,
            orderNumber,
            status: purchase_order_entity_1.PurchaseOrderStatus.ORCAMENTO,
            priority: data.priority || purchase_order_entity_1.PurchaseOrderPriority.NORMAL,
        });
        const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);
        return this.getPurchaseOrderById(savedOrder.id, data.tenantId);
    }
    async getPurchaseOrdersByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.supplierId)
            where.supplierId = filters.supplierId;
        if (filters?.dateFrom && filters?.dateTo) {
            where.orderDate = (0, typeorm_1.Between)(filters.dateFrom, filters.dateTo);
        }
        const query = this.purchaseOrderRepository
            .createQueryBuilder('po')
            .where(where)
            .leftJoinAndSelect('po.supplier', 'supplier')
            .leftJoinAndSelect('po.createdBy', 'createdBy')
            .leftJoinAndSelect('po.approvedBy', 'approvedBy')
            .leftJoinAndSelect('po.receivedBy', 'receivedBy');
        if (filters?.search) {
            query.andWhere('(po.orderNumber ILIKE :search OR po.notes ILIKE :search)', { search: `%${filters.search}%` });
        }
        query.orderBy('po.orderDate', 'DESC');
        return query.getMany();
    }
    async getPurchaseOrderById(id, tenantId) {
        return this.purchaseOrderRepository.findOne({
            where: { id, tenantId },
            relations: ['supplier', 'createdBy', 'approvedBy', 'receivedBy'],
        });
    }
    async updatePurchaseOrder(id, tenantId, data) {
        const order = await this.purchaseOrderRepository.findOne({
            where: { id, tenantId },
        });
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        if (order.status === purchase_order_entity_1.PurchaseOrderStatus.CANCELADO ||
            order.status === purchase_order_entity_1.PurchaseOrderStatus.RECEBIDO) {
            throw new Error('Ordem de compra cancelada ou já recebida não pode ser editada');
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, data);
        return this.getPurchaseOrderById(id, tenantId);
    }
    async approvePurchaseOrder(id, tenantId, approvedById) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        if (order.status !== purchase_order_entity_1.PurchaseOrderStatus.ORCAMENTO) {
            throw new Error('Apenas orçamentos podem ser aprovados');
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, {
            status: purchase_order_entity_1.PurchaseOrderStatus.APROVADO,
            approvedById,
            approvedAt: new Date(),
        });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async markAsSent(id, tenantId, data) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        if (order.status !== purchase_order_entity_1.PurchaseOrderStatus.APROVADO) {
            throw new Error('Apenas pedidos aprovados podem ser marcados como enviados');
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, {
            status: purchase_order_entity_1.PurchaseOrderStatus.PEDIDO_REALIZADO,
            ...data,
        });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async markAsInTransit(id, tenantId) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, {
            status: purchase_order_entity_1.PurchaseOrderStatus.EM_TRANSITO,
        });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async receivePurchaseOrder(id, tenantId, data) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        if (order.status === purchase_order_entity_1.PurchaseOrderStatus.RECEBIDO) {
            throw new Error('Ordem de compra já foi recebida');
        }
        // Verificar se todos os itens foram recebidos
        let status = purchase_order_entity_1.PurchaseOrderStatus.RECEBIDO;
        if (data.items) {
            const allReceived = data.items.every((item) => item.receivedQuantity === item.quantity);
            if (!allReceived) {
                status = purchase_order_entity_1.PurchaseOrderStatus.PARCIALMENTE_RECEBIDO;
            }
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, {
            status,
            receivedById: data.receivedById,
            receivedDate: data.receivedDate || new Date(),
            actualDeliveryDate: data.actualDeliveryDate || new Date(),
            nfeNumber: data.nfeNumber,
            nfeKey: data.nfeKey,
            items: data.items || order.items,
        });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async cancelPurchaseOrder(id, tenantId, data) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        if (order.status === purchase_order_entity_1.PurchaseOrderStatus.RECEBIDO ||
            order.status === purchase_order_entity_1.PurchaseOrderStatus.PARCIALMENTE_RECEBIDO) {
            throw new Error('Ordem de compra já recebida não pode ser cancelada');
        }
        await this.purchaseOrderRepository.update({ id, tenantId }, {
            status: purchase_order_entity_1.PurchaseOrderStatus.CANCELADO,
            canceledAt: new Date(),
            canceledById: data.canceledById,
            cancelReason: data.cancelReason,
        });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async addAttachment(id, tenantId, attachment) {
        const order = await this.getPurchaseOrderById(id, tenantId);
        if (!order) {
            throw new Error('Ordem de compra não encontrada');
        }
        const attachments = order.attachments || [];
        attachments.push({
            ...attachment,
            uploadedAt: new Date(),
        });
        await this.purchaseOrderRepository.update({ id, tenantId }, { attachments });
        return this.getPurchaseOrderById(id, tenantId);
    }
    async getPurchaseOrderStats(tenantId) {
        const orders = await this.purchaseOrderRepository.find({
            where: { tenantId },
        });
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const byStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        const byPriority = orders.reduce((acc, order) => {
            acc[order.priority] = (acc[order.priority] || 0) + 1;
            return acc;
        }, {});
        const pendingDeliveries = orders.filter((o) => o.status === purchase_order_entity_1.PurchaseOrderStatus.PEDIDO_REALIZADO ||
            o.status === purchase_order_entity_1.PurchaseOrderStatus.EM_TRANSITO).length;
        return {
            totalOrders,
            totalAmount,
            byStatus,
            byPriority,
            pendingDeliveries,
        };
    }
}
exports.PurchaseOrderService = PurchaseOrderService;
//# sourceMappingURL=purchase-order.service.js.map