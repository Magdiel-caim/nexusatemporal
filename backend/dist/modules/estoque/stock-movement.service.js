"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../database/data-source");
const stock_movement_entity_1 = require("./stock-movement.entity");
const product_entity_1 = require("./product.entity");
const product_service_1 = require("./product.service");
class StockMovementService {
    movementRepository;
    productRepository;
    productService;
    constructor() {
        this.movementRepository = data_source_1.CrmDataSource.getRepository(stock_movement_entity_1.StockMovement);
        this.productRepository = data_source_1.CrmDataSource.getRepository(product_entity_1.Product);
        this.productService = new product_service_1.ProductService();
    }
    async createMovement(data) {
        // Buscar produto
        const product = await this.productService.findOne(data.productId, data.tenantId);
        if (!product.trackStock) {
            throw new Error('Este produto não possui controle de estoque');
        }
        // Validar quantidade
        if (data.quantity <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }
        // Validar saída (não pode ficar negativo)
        if (data.type === stock_movement_entity_1.MovementType.SAIDA && product.currentStock < data.quantity) {
            throw new Error(`Estoque insuficiente. Disponível: ${product.currentStock} ${product.unit}`);
        }
        const previousStock = product.currentStock;
        let newStock;
        // Calcular novo estoque
        switch (data.type) {
            case stock_movement_entity_1.MovementType.ENTRADA:
            case stock_movement_entity_1.MovementType.DEVOLUCAO:
                newStock = previousStock + data.quantity;
                break;
            case stock_movement_entity_1.MovementType.SAIDA:
            case stock_movement_entity_1.MovementType.PERDA:
                newStock = previousStock - data.quantity;
                break;
            case stock_movement_entity_1.MovementType.AJUSTE:
                newStock = data.quantity; // No ajuste, a quantidade é o novo valor absoluto
                break;
            default:
                throw new Error('Tipo de movimentação inválido');
        }
        // Criar movimentação
        const movement = this.movementRepository.create({
            ...data,
            previousStock,
            newStock,
            totalPrice: data.unitPrice ? data.unitPrice * data.quantity : undefined,
        });
        // Salvar movimentação
        const savedMovement = await this.movementRepository.save(movement);
        // Atualizar estoque do produto
        await this.productService.updateStock(product.id, data.tenantId, newStock);
        return savedMovement;
    }
    async createEntryFromPurchaseOrder(productId, purchaseOrderId, quantity, unitPrice, invoiceNumber, batchNumber, expirationDate, userId, tenantId) {
        return await this.createMovement({
            productId,
            type: stock_movement_entity_1.MovementType.ENTRADA,
            reason: stock_movement_entity_1.MovementReason.COMPRA,
            quantity,
            unitPrice,
            purchaseOrderId,
            invoiceNumber,
            batchNumber: batchNumber || undefined,
            expirationDate: expirationDate || undefined,
            userId,
            tenantId,
            notes: `Entrada via ordem de compra #${purchaseOrderId}`,
        });
    }
    async createExitFromProcedure(productId, quantity, medicalRecordId, procedureId, userId, tenantId) {
        return await this.createMovement({
            productId,
            type: stock_movement_entity_1.MovementType.SAIDA,
            reason: stock_movement_entity_1.MovementReason.PROCEDIMENTO,
            quantity,
            medicalRecordId,
            procedureId,
            userId,
            tenantId,
            notes: `Saída automática por procedimento`,
        });
    }
    async findAll(filters) {
        const query = this.movementRepository
            .createQueryBuilder('movement')
            .leftJoinAndSelect('movement.product', 'product')
            .leftJoinAndSelect('movement.user', 'user')
            .leftJoinAndSelect('movement.purchaseOrder', 'purchaseOrder')
            .where('movement.tenantId = :tenantId', { tenantId: filters.tenantId });
        // Product filter
        if (filters.productId) {
            query.andWhere('movement.productId = :productId', { productId: filters.productId });
        }
        // Type filter
        if (filters.type) {
            query.andWhere('movement.type = :type', { type: filters.type });
        }
        // Reason filter
        if (filters.reason) {
            query.andWhere('movement.reason = :reason', { reason: filters.reason });
        }
        // Date range filter
        if (filters.startDate && filters.endDate) {
            query.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        }
        // Count total
        const total = await query.getCount();
        // Pagination
        if (filters.limit) {
            query.limit(filters.limit);
        }
        if (filters.offset) {
            query.offset(filters.offset);
        }
        // Order by date (most recent first)
        query.orderBy('movement.createdAt', 'DESC');
        const data = await query.getMany();
        return { data, total };
    }
    async findOne(id, tenantId) {
        const movement = await this.movementRepository.findOne({
            where: { id, tenantId },
            relations: ['product', 'user', 'purchaseOrder'],
        });
        if (!movement) {
            throw new Error('Movimentação não encontrada');
        }
        return movement;
    }
    async getMovementsByProduct(productId, tenantId, limit = 50) {
        return await this.movementRepository.find({
            where: { productId, tenantId },
            relations: ['user', 'purchaseOrder'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getMovementsByMedicalRecord(medicalRecordId, tenantId) {
        return await this.movementRepository.find({
            where: { medicalRecordId, tenantId },
            relations: ['product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
    async getMovementsSummary(tenantId, startDate, endDate) {
        const movements = await this.movementRepository.find({
            where: {
                tenantId,
                createdAt: (0, typeorm_1.Between)(startDate, endDate),
            },
        });
        let totalEntries = 0;
        let totalExits = 0;
        let totalValueEntries = 0;
        let totalValueExits = 0;
        const movementsByType = {};
        movements.forEach((movement) => {
            // Contabilizar por tipo
            if (!movementsByType[movement.type]) {
                movementsByType[movement.type] = 0;
            }
            movementsByType[movement.type]++;
            // Contabilizar entradas/saídas
            if (movement.type === stock_movement_entity_1.MovementType.ENTRADA || movement.type === stock_movement_entity_1.MovementType.DEVOLUCAO) {
                totalEntries += parseFloat(movement.quantity.toString());
                if (movement.totalPrice) {
                    totalValueEntries += parseFloat(movement.totalPrice.toString());
                }
            }
            else if (movement.type === stock_movement_entity_1.MovementType.SAIDA || movement.type === stock_movement_entity_1.MovementType.PERDA) {
                totalExits += parseFloat(movement.quantity.toString());
                if (movement.totalPrice) {
                    totalValueExits += parseFloat(movement.totalPrice.toString());
                }
            }
        });
        return {
            totalEntries,
            totalExits,
            totalValueEntries,
            totalValueExits,
            movementsByType,
        };
    }
    async getMostUsedProducts(tenantId, limit = 10) {
        const result = await this.movementRepository
            .createQueryBuilder('movement')
            .select('movement.productId', 'productId')
            .addSelect('SUM(movement.quantity)', 'totalQuantity')
            .addSelect('COUNT(movement.id)', 'movementCount')
            .where('movement.tenantId = :tenantId', { tenantId })
            .andWhere('movement.type = :type', { type: stock_movement_entity_1.MovementType.SAIDA })
            .groupBy('movement.productId')
            .orderBy('totalQuantity', 'DESC')
            .limit(limit)
            .getRawMany();
        const productsData = await Promise.all(result.map(async (item) => {
            const product = await this.productService.findOne(item.productId, tenantId);
            return {
                product,
                totalQuantity: parseFloat(item.totalQuantity),
                movementCount: parseInt(item.movementCount),
            };
        }));
        return productsData;
    }
    // Método para query raw (relatórios)
    async executeRawQuery(query, parameters) {
        return await this.movementRepository.query(query, parameters);
    }
}
exports.StockMovementService = StockMovementService;
//# sourceMappingURL=stock-movement.service.js.map