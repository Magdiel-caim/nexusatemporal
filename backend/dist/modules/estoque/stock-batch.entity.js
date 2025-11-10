"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockBatch = exports.BatchStatus = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const stock_movement_entity_1 = require("./stock-movement.entity");
var BatchStatus;
(function (BatchStatus) {
    BatchStatus["ACTIVE"] = "active";
    BatchStatus["EXPIRED"] = "expired";
    BatchStatus["EXPIRING_SOON"] = "expiring_soon";
    BatchStatus["DEPLETED"] = "depleted";
})(BatchStatus || (exports.BatchStatus = BatchStatus = {}));
/**
 * Stock Batch Entity
 * Representa um lote específico de produto com data de vencimento
 * Permite rastreabilidade completa do estoque por lote
 */
let StockBatch = class StockBatch {
    id;
    // Produto
    productId;
    product;
    // Identificação do Lote
    batchNumber; // Número do lote (ex: L20240115-001)
    manufacturerBatchNumber; // Número do lote do fabricante (se diferente)
    // Datas
    manufactureDate; // Data de fabricação
    expirationDate; // Data de validade
    receiptDate; // Data de recebimento
    // Quantidade
    currentStock; // Estoque atual deste lote
    initialStock; // Estoque inicial ao cadastrar o lote
    // Custo/Preço
    unitCost; // Custo unitário deste lote
    totalCost; // Custo total do lote
    // Status
    status;
    // Fornecedor/Origem
    supplierId; // Fornecedor deste lote
    invoiceNumber; // Número da nota fiscal
    // Localização
    location; // Localização física no estoque
    // Observações
    notes;
    // Alertas
    alertSent; // Se já foi enviado alerta de vencimento
    alertSentAt; // Quando foi enviado o alerta
    // Rastreabilidade
    originMovementId; // ID da movimentação de entrada que criou este lote
    // Movimentações deste lote
    movements;
    // Tenant
    tenantId;
    // Timestamps
    createdAt;
    updatedAt;
    // Virtual/Computed fields
    /**
     * Calcula dias até o vencimento
     */
    get daysUntilExpiration() {
        const today = new Date();
        const expiration = new Date(this.expirationDate);
        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    /**
     * Verifica se o lote está vencido
     */
    get isExpired() {
        return this.daysUntilExpiration < 0;
    }
    /**
     * Verifica se o lote está próximo do vencimento (< 30 dias)
     */
    get isExpiringSoon() {
        return this.daysUntilExpiration > 0 && this.daysUntilExpiration <= 30;
    }
    /**
     * Verifica se o lote está zerado
     */
    get isDepleted() {
        return this.currentStock <= 0;
    }
    /**
     * Atualiza o status automaticamente baseado nas condições
     */
    updateStatus() {
        if (this.isDepleted) {
            this.status = BatchStatus.DEPLETED;
        }
        else if (this.isExpired) {
            this.status = BatchStatus.EXPIRED;
        }
        else if (this.isExpiringSoon) {
            this.status = BatchStatus.EXPIRING_SOON;
        }
        else {
            this.status = BatchStatus.ACTIVE;
        }
    }
};
exports.StockBatch = StockBatch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockBatch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockBatch.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], StockBatch.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], StockBatch.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "manufacturerBatchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockBatch.prototype, "manufactureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], StockBatch.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockBatch.prototype, "receiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], StockBatch.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], StockBatch.prototype, "initialStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockBatch.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockBatch.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BatchStatus,
        default: BatchStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], StockBatch.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StockBatch.prototype, "alertSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], StockBatch.prototype, "alertSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockBatch.prototype, "originMovementId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_movement_entity_1.StockMovement, (movement) => movement.batch),
    __metadata("design:type", Array)
], StockBatch.prototype, "movements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockBatch.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockBatch.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StockBatch.prototype, "updatedAt", void 0);
exports.StockBatch = StockBatch = __decorate([
    (0, typeorm_1.Entity)('stock_batches')
], StockBatch);
//# sourceMappingURL=stock-batch.entity.js.map