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
exports.StockMovement = exports.MovementReason = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const user_entity_1 = require("../auth/user.entity");
const purchase_order_entity_1 = require("../financeiro/purchase-order.entity");
const stock_batch_entity_1 = require("./stock-batch.entity");
var MovementType;
(function (MovementType) {
    MovementType["ENTRADA"] = "entrada";
    MovementType["SAIDA"] = "saida";
    MovementType["AJUSTE"] = "ajuste";
    MovementType["DEVOLUCAO"] = "devolucao";
    MovementType["PERDA"] = "perda";
    MovementType["TRANSFERENCIA"] = "transferencia";
})(MovementType || (exports.MovementType = MovementType = {}));
var MovementReason;
(function (MovementReason) {
    MovementReason["COMPRA"] = "compra";
    MovementReason["PROCEDIMENTO"] = "procedimento";
    MovementReason["AJUSTE_INVENTARIO"] = "ajuste_inventario";
    MovementReason["DEVOLUCAO_FORNECEDOR"] = "devolucao_fornecedor";
    MovementReason["DEVOLUCAO_CLIENTE"] = "devolucao_cliente";
    MovementReason["VENCIMENTO"] = "vencimento";
    MovementReason["PERDA"] = "perda";
    MovementReason["DANO"] = "dano";
    MovementReason["TRANSFERENCIA"] = "transferencia";
    MovementReason["OUTRO"] = "outro";
})(MovementReason || (exports.MovementReason = MovementReason = {}));
let StockMovement = class StockMovement {
    id;
    productId;
    product;
    type;
    reason;
    quantity;
    unitPrice;
    totalPrice;
    // Estoque antes e depois da movimentação
    previousStock;
    newStock;
    // Referência à ordem de compra (se for entrada)
    purchaseOrderId;
    purchaseOrder;
    // Referência ao prontuário (se for saída por procedimento)
    medicalRecordId;
    // Referência ao procedimento (se for saída por procedimento)
    procedureId;
    // Número da NF (se tiver)
    invoiceNumber;
    // Lote (campo antigo - mantido para compatibilidade)
    batchNumber;
    // Referência ao lote (novo sistema de controle)
    batchId;
    batch;
    // Validade (campo antigo - mantido para compatibilidade)
    expirationDate;
    // Observações
    notes;
    tenantId;
    userId;
    user;
    createdAt;
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.movements),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], StockMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MovementType,
    }),
    __metadata("design:type", String)
], StockMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MovementReason,
    }),
    __metadata("design:type", String)
], StockMovement.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockMovement.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockMovement.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], StockMovement.prototype, "previousStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], StockMovement.prototype, "newStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_order_entity_1.PurchaseOrder, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'purchaseOrderId' }),
    __metadata("design:type", purchase_order_entity_1.PurchaseOrder)
], StockMovement.prototype, "purchaseOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "medicalRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_batch_entity_1.StockBatch, (batch) => batch.movements, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'batchId' }),
    __metadata("design:type", stock_batch_entity_1.StockBatch)
], StockMovement.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockMovement.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockMovement.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], StockMovement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)('stock_movements')
], StockMovement);
//# sourceMappingURL=stock-movement.entity.js.map