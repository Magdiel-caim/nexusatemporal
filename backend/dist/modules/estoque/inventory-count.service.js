"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCountService = void 0;
const data_source_1 = require("../../database/data-source");
const inventory_count_entity_1 = require("./inventory-count.entity");
const product_entity_1 = require("./product.entity");
const product_service_1 = require("./product.service");
const stock_movement_service_1 = require("./stock-movement.service");
const stock_movement_entity_1 = require("./stock-movement.entity");
const email_service_1 = require("../../shared/services/email.service");
const logger_1 = require("../../shared/utils/logger");
const audit_log_service_1 = require("./audit-log.service");
const audit_log_entity_1 = require("./audit-log.entity");
class InventoryCountService {
    inventoryCountRepository;
    inventoryCountItemRepository;
    productRepository;
    productService;
    stockMovementService;
    constructor() {
        this.inventoryCountRepository = data_source_1.CrmDataSource.getRepository(inventory_count_entity_1.InventoryCount);
        this.inventoryCountItemRepository = data_source_1.CrmDataSource.getRepository(inventory_count_entity_1.InventoryCountItem);
        this.productRepository = data_source_1.CrmDataSource.getRepository(product_entity_1.Product);
        this.productService = new product_service_1.ProductService();
        this.stockMovementService = new stock_movement_service_1.StockMovementService();
    }
    async createInventoryCount(data) {
        const inventoryCount = this.inventoryCountRepository.create({
            ...data,
            status: inventory_count_entity_1.InventoryCountStatus.IN_PROGRESS,
        });
        const saved = await this.inventoryCountRepository.save(inventoryCount);
        // Audit log
        audit_log_service_1.auditLogService.createLog({
            entityType: audit_log_entity_1.AuditEntityType.INVENTORY_COUNT,
            entityId: saved.id,
            action: audit_log_entity_1.AuditAction.CREATE,
            userId: data.userId,
            newValues: {
                description: saved.description,
                location: saved.location,
                status: saved.status,
            },
            description: `Contagem de inventário criada: ${saved.description}`,
            tenantId: data.tenantId,
        }).catch(err => logger_1.logger.error('Failed to create audit log:', err));
        return saved;
    }
    async addCountItem(data) {
        // Buscar produto para obter estoque atual
        const product = await this.productService.findOne(data.productId, data.tenantId);
        // Verificar se item já existe nesta contagem
        const existing = await this.inventoryCountItemRepository.findOne({
            where: {
                inventoryCountId: data.inventoryCountId,
                productId: data.productId,
                tenantId: data.tenantId,
            },
        });
        if (existing) {
            throw new Error('Produto já foi contado nesta contagem');
        }
        const systemStock = product.currentStock;
        const countedStock = data.countedStock;
        const difference = countedStock - systemStock;
        let discrepancyType;
        if (difference > 0) {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.SURPLUS;
        }
        else if (difference < 0) {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.SHORTAGE;
        }
        else {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.MATCH;
        }
        const item = this.inventoryCountItemRepository.create({
            ...data,
            systemStock,
            countedStock,
            difference,
            discrepancyType,
            adjusted: false,
        });
        return await this.inventoryCountItemRepository.save(item);
    }
    async updateCountItem(id, tenantId, countedStock, notes) {
        const item = await this.inventoryCountItemRepository.findOne({
            where: { id, tenantId },
            relations: ['product'],
        });
        if (!item) {
            throw new Error('Item de contagem não encontrado');
        }
        if (item.adjusted) {
            throw new Error('Item já foi ajustado e não pode ser modificado');
        }
        const difference = countedStock - item.systemStock;
        let discrepancyType;
        if (difference > 0) {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.SURPLUS;
        }
        else if (difference < 0) {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.SHORTAGE;
        }
        else {
            discrepancyType = inventory_count_entity_1.DiscrepancyType.MATCH;
        }
        item.countedStock = countedStock;
        item.difference = difference;
        item.discrepancyType = discrepancyType;
        if (notes !== undefined) {
            item.notes = notes;
        }
        return await this.inventoryCountItemRepository.save(item);
    }
    async deleteCountItem(id, tenantId) {
        const item = await this.inventoryCountItemRepository.findOne({
            where: { id, tenantId },
        });
        if (!item) {
            throw new Error('Item de contagem não encontrado');
        }
        if (item.adjusted) {
            throw new Error('Item já foi ajustado e não pode ser excluído');
        }
        await this.inventoryCountItemRepository.remove(item);
    }
    async adjustInventoryItem(id, tenantId, userId) {
        const item = await this.inventoryCountItemRepository.findOne({
            where: { id, tenantId },
            relations: ['product', 'inventoryCount'],
        });
        if (!item) {
            throw new Error('Item de contagem não encontrado');
        }
        if (item.adjusted) {
            throw new Error('Item já foi ajustado');
        }
        if (item.discrepancyType === inventory_count_entity_1.DiscrepancyType.MATCH) {
            item.adjusted = true;
            item.adjustedAt = new Date();
            await this.inventoryCountItemRepository.save(item);
            return {
                item,
                message: 'Nenhum ajuste necessário - estoque correto',
            };
        }
        // Criar movimento de ajuste
        const movementData = {
            productId: item.productId,
            type: stock_movement_entity_1.MovementType.AJUSTE,
            reason: stock_movement_entity_1.MovementReason.AJUSTE_INVENTARIO,
            quantity: item.countedStock, // O ajuste define o novo valor absoluto
            notes: `Ajuste de inventário: ${item.notes || 'Contagem física'}`,
            userId,
            tenantId,
        };
        await this.stockMovementService.createMovement(movementData);
        // Marcar item como ajustado
        const oldValues = {
            adjusted: item.adjusted,
            adjustedAt: item.adjustedAt,
        };
        item.adjusted = true;
        item.adjustedAt = new Date();
        const savedItem = await this.inventoryCountItemRepository.save(item);
        // Audit log
        audit_log_service_1.auditLogService.createLog({
            entityType: audit_log_entity_1.AuditEntityType.INVENTORY_COUNT_ITEM,
            entityId: item.id,
            action: audit_log_entity_1.AuditAction.ADJUST,
            userId,
            oldValues,
            newValues: {
                adjusted: savedItem.adjusted,
                adjustedAt: savedItem.adjustedAt,
                systemStock: item.systemStock,
                countedStock: item.countedStock,
                difference: item.difference,
            },
            metadata: {
                productId: item.productId,
                productName: item.product.name,
                discrepancyType: item.discrepancyType,
                inventoryCountId: item.inventoryCountId,
            },
            description: `Estoque ajustado: ${item.product.name} - ${item.discrepancyType === inventory_count_entity_1.DiscrepancyType.SURPLUS ? 'Sobra' : 'Falta'} de ${Math.abs(item.difference)} ${item.product.unit}`,
            tenantId,
        }).catch(err => logger_1.logger.error('Failed to create audit log:', err));
        const typeText = item.discrepancyType === inventory_count_entity_1.DiscrepancyType.SURPLUS
            ? 'sobra'
            : 'falta';
        return {
            item: savedItem,
            message: `Ajuste realizado: ${typeText} de ${Math.abs(item.difference)} ${item.product.unit}`,
        };
    }
    async batchAdjustInventory(inventoryCountId, tenantId, userId) {
        const items = await this.inventoryCountItemRepository.find({
            where: {
                inventoryCountId,
                tenantId,
                adjusted: false,
            },
            relations: ['product'],
        });
        let adjusted = 0;
        let skipped = 0;
        const errors = [];
        for (const item of items) {
            try {
                await this.adjustInventoryItem(item.id, tenantId, userId);
                adjusted++;
            }
            catch (error) {
                errors.push(`${item.product?.name}: ${error.message}`);
                skipped++;
            }
        }
        return { adjusted, skipped, errors };
    }
    async completeInventoryCount(id, tenantId) {
        const inventoryCount = await this.inventoryCountRepository.findOne({
            where: { id, tenantId },
            relations: ['items', 'items.product', 'user'],
        });
        if (!inventoryCount) {
            throw new Error('Contagem de inventário não encontrada');
        }
        if (inventoryCount.status === inventory_count_entity_1.InventoryCountStatus.COMPLETED) {
            throw new Error('Contagem já foi concluída');
        }
        // Verificar se todos os itens foram ajustados
        const unadjustedCount = inventoryCount.items.filter((item) => !item.adjusted).length;
        if (unadjustedCount > 0) {
            throw new Error(`Ainda existem ${unadjustedCount} itens não ajustados. Ajuste todos antes de finalizar.`);
        }
        inventoryCount.status = inventory_count_entity_1.InventoryCountStatus.COMPLETED;
        inventoryCount.completedAt = new Date();
        const savedCount = await this.inventoryCountRepository.save(inventoryCount);
        // Audit log
        const report = await this.getDiscrepancyReport(id, tenantId);
        audit_log_service_1.auditLogService.createLog({
            entityType: audit_log_entity_1.AuditEntityType.INVENTORY_COUNT,
            entityId: id,
            action: audit_log_entity_1.AuditAction.COMPLETE,
            userId: inventoryCount.userId,
            newValues: {
                status: savedCount.status,
                completedAt: savedCount.completedAt,
            },
            metadata: {
                totalItems: report.total,
                matches: report.matches,
                surpluses: report.surpluses,
                shortages: report.shortages,
                totalDifference: report.totalDifference,
            },
            description: `Contagem finalizada: ${savedCount.description} - ${report.total} itens, ${report.shortages} faltas, ${report.surpluses} sobras`,
            tenantId,
        }).catch(err => logger_1.logger.error('Failed to create audit log:', err));
        // Enviar email de notificação (não bloquear a resposta se falhar)
        if (inventoryCount.user?.email) {
            email_service_1.emailService.sendInventoryCompletedEmail(inventoryCount.user.email, inventoryCount.user.name || 'Usuário', {
                description: inventoryCount.description,
                location: inventoryCount.location,
                totalItems: report.total,
                matches: report.matches,
                surpluses: report.surpluses,
                shortages: report.shortages,
                totalDifference: report.totalDifference,
                completedAt: inventoryCount.completedAt,
            }).catch(error => {
                logger_1.logger.error('Failed to send inventory completion email:', error);
            });
        }
        return savedCount;
    }
    async cancelInventoryCount(id, tenantId) {
        const inventoryCount = await this.inventoryCountRepository.findOne({
            where: { id, tenantId },
            relations: ['items'],
        });
        if (!inventoryCount) {
            throw new Error('Contagem de inventário não encontrada');
        }
        if (inventoryCount.status === inventory_count_entity_1.InventoryCountStatus.COMPLETED) {
            throw new Error('Não é possível cancelar uma contagem concluída');
        }
        // Verificar se há itens ajustados
        const adjustedCount = inventoryCount.items.filter((item) => item.adjusted).length;
        if (adjustedCount > 0) {
            throw new Error(`Não é possível cancelar: ${adjustedCount} itens já foram ajustados no estoque`);
        }
        inventoryCount.status = inventory_count_entity_1.InventoryCountStatus.CANCELLED;
        return await this.inventoryCountRepository.save(inventoryCount);
    }
    async findAll(filters) {
        const query = this.inventoryCountRepository
            .createQueryBuilder('count')
            .leftJoinAndSelect('count.user', 'user')
            .leftJoinAndSelect('count.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .where('count.tenantId = :tenantId', { tenantId: filters.tenantId });
        if (filters.status) {
            query.andWhere('count.status = :status', { status: filters.status });
        }
        if (filters.location) {
            query.andWhere('count.location ILIKE :location', {
                location: `%${filters.location}%`,
            });
        }
        if (filters.startDate && filters.endDate) {
            query.andWhere('count.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        }
        const total = await query.getCount();
        if (filters.limit) {
            query.limit(filters.limit);
        }
        if (filters.offset) {
            query.offset(filters.offset);
        }
        query.orderBy('count.createdAt', 'DESC');
        const data = await query.getMany();
        return { data, total };
    }
    async findOne(id, tenantId) {
        const inventoryCount = await this.inventoryCountRepository.findOne({
            where: { id, tenantId },
            relations: ['user', 'items', 'items.product'],
        });
        if (!inventoryCount) {
            throw new Error('Contagem de inventário não encontrada');
        }
        return inventoryCount;
    }
    async getDiscrepancyReport(id, tenantId) {
        const inventoryCount = await this.findOne(id, tenantId);
        const total = inventoryCount.items.length;
        const matches = inventoryCount.items.filter((item) => item.discrepancyType === inventory_count_entity_1.DiscrepancyType.MATCH).length;
        const surpluses = inventoryCount.items.filter((item) => item.discrepancyType === inventory_count_entity_1.DiscrepancyType.SURPLUS).length;
        const shortages = inventoryCount.items.filter((item) => item.discrepancyType === inventory_count_entity_1.DiscrepancyType.SHORTAGE).length;
        const totalDifference = inventoryCount.items.reduce((sum, item) => sum + parseFloat(item.difference.toString()), 0);
        return {
            total,
            matches,
            surpluses,
            shortages,
            totalDifference,
            items: inventoryCount.items,
        };
    }
}
exports.InventoryCountService = InventoryCountService;
//# sourceMappingURL=inventory-count.service.js.map