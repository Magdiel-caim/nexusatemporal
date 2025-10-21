"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcedureProductService = void 0;
const procedure_product_entity_1 = require("./procedure-product.entity");
const stock_movement_service_1 = require("./stock-movement.service");
const product_service_1 = require("./product.service");
const stock_movement_entity_1 = require("./stock-movement.entity");
class ProcedureProductService {
    repository;
    movementService;
    productService;
    constructor() {
        const AppDataSource = require('../../shared/database/data-source').AppDataSource;
        this.repository = AppDataSource.getRepository(procedure_product_entity_1.ProcedureProduct);
        this.movementService = new stock_movement_service_1.StockMovementService();
        this.productService = new product_service_1.ProductService();
    }
    /**
     * Adicionar produto a um procedimento
     */
    async addProductToProcedure(data) {
        const procedureProduct = this.repository.create(data);
        return await this.repository.save(procedureProduct);
    }
    /**
     * Listar produtos de um procedimento
     */
    async getProductsByProcedure(procedureId, tenantId) {
        return await this.repository.find({
            where: {
                procedureId,
                tenantId,
            },
            relations: ['product'],
            order: {
                createdAt: 'ASC',
            },
        });
    }
    /**
     * Remover produto de um procedimento
     */
    async removeProductFromProcedure(id, tenantId) {
        const procedureProduct = await this.repository.findOne({
            where: { id, tenantId },
        });
        if (!procedureProduct) {
            throw new Error('Vínculo produto-procedimento não encontrado');
        }
        await this.repository.remove(procedureProduct);
    }
    /**
     * Validar se há estoque suficiente para todos os produtos do procedimento
     */
    async validateStockForProcedure(procedureId, tenantId) {
        const procedureProducts = await this.getProductsByProcedure(procedureId, tenantId);
        const insufficientStock = [];
        for (const pp of procedureProducts) {
            if (!pp.isOptional && pp.product) {
                if (pp.product.currentStock < pp.quantityUsed) {
                    insufficientStock.push({
                        productId: pp.productId,
                        productName: pp.product.name,
                        required: Number(pp.quantityUsed),
                        available: pp.product.currentStock,
                    });
                }
            }
        }
        return {
            valid: insufficientStock.length === 0,
            insufficientStock,
        };
    }
    /**
     * Consumir estoque ao finalizar procedimento
     * Cria movimentações de saída para todos os produtos vinculados
     */
    async consumeStockForProcedure(procedureId, tenantId, userId, medicalRecordId) {
        const procedureProducts = await this.getProductsByProcedure(procedureId, tenantId);
        const movements = [];
        const errors = [];
        // Validar estoque primeiro
        const validation = await this.validateStockForProcedure(procedureId, tenantId);
        if (!validation.valid) {
            const insufficientItems = validation.insufficientStock
                .map((item) => `${item.productName}: necessário ${item.required}, disponível ${item.available}`)
                .join('; ');
            throw new Error(`Estoque insuficiente para: ${insufficientItems}`);
        }
        // Criar movimentações de saída para cada produto
        for (const pp of procedureProducts) {
            try {
                // Pular produtos opcionais se não houver estoque
                if (pp.isOptional && pp.product && pp.product.currentStock < pp.quantityUsed) {
                    continue;
                }
                const movement = await this.movementService.createMovement({
                    productId: pp.productId,
                    type: stock_movement_entity_1.MovementType.SAIDA,
                    reason: stock_movement_entity_1.MovementReason.PROCEDIMENTO,
                    quantity: Number(pp.quantityUsed),
                    procedureId: procedureId,
                    medicalRecordId: medicalRecordId,
                    notes: pp.notes || `Consumo automático - Procedimento ${procedureId}`,
                    tenantId,
                    userId,
                });
                movements.push(movement);
            }
            catch (error) {
                errors.push(`Erro ao dar baixa em ${pp.product?.name}: ${error.message}`);
            }
        }
        return {
            success: errors.length === 0,
            movements,
            errors,
        };
    }
    /**
     * Atualizar quantidade de produto em um procedimento
     */
    async updateProductQuantity(id, tenantId, quantityUsed) {
        const procedureProduct = await this.repository.findOne({
            where: { id, tenantId },
        });
        if (!procedureProduct) {
            throw new Error('Vínculo produto-procedimento não encontrado');
        }
        procedureProduct.quantityUsed = quantityUsed;
        return await this.repository.save(procedureProduct);
    }
}
exports.ProcedureProductService = ProcedureProductService;
//# sourceMappingURL=procedure-product.service.js.map