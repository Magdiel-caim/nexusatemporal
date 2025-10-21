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
exports.PurchaseOrder = exports.PurchaseOrderPriority = exports.PurchaseOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const supplier_entity_1 = require("./supplier.entity");
const user_entity_1 = require("../auth/user.entity");
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["ORCAMENTO"] = "orcamento";
    PurchaseOrderStatus["APROVADO"] = "aprovado";
    PurchaseOrderStatus["PEDIDO_REALIZADO"] = "pedido_realizado";
    PurchaseOrderStatus["EM_TRANSITO"] = "em_transito";
    PurchaseOrderStatus["RECEBIDO"] = "recebido";
    PurchaseOrderStatus["PARCIALMENTE_RECEBIDO"] = "parcialmente_recebido";
    PurchaseOrderStatus["CANCELADO"] = "cancelado";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
var PurchaseOrderPriority;
(function (PurchaseOrderPriority) {
    PurchaseOrderPriority["BAIXA"] = "baixa";
    PurchaseOrderPriority["NORMAL"] = "normal";
    PurchaseOrderPriority["ALTA"] = "alta";
    PurchaseOrderPriority["URGENTE"] = "urgente";
})(PurchaseOrderPriority || (exports.PurchaseOrderPriority = PurchaseOrderPriority = {}));
let PurchaseOrder = class PurchaseOrder {
    id;
    orderNumber;
    supplierId;
    supplier;
    status;
    priority;
    orderDate;
    expectedDeliveryDate;
    actualDeliveryDate;
    receivedDate;
    totalAmount;
    shippingCost;
    discount;
    items;
    attachments;
    notes;
    shippingAddress;
    trackingCode;
    carrier; // Transportadora
    nfeNumber; // Número da Nota Fiscal Eletrônica
    nfeKey; // Chave de acesso da NFe
    tenantId;
    createdById;
    createdBy;
    approvedById;
    approvedBy;
    approvedAt;
    receivedById;
    receivedBy;
    canceledAt;
    canceledById;
    cancelReason;
    createdAt;
    updatedAt;
};
exports.PurchaseOrder = PurchaseOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier),
    (0, typeorm_1.JoinColumn)({ name: 'supplierId' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], PurchaseOrder.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PurchaseOrderStatus,
        default: PurchaseOrderStatus.ORCAMENTO,
    }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PurchaseOrderPriority,
        default: PurchaseOrderPriority.NORMAL,
    }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "receivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "shippingCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "shippingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "trackingCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "carrier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "nfeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "nfeKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], PurchaseOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "approvedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approvedById' }),
    __metadata("design:type", user_entity_1.User)
], PurchaseOrder.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "receivedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'receivedById' }),
    __metadata("design:type", user_entity_1.User)
], PurchaseOrder.prototype, "receivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "canceledById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PurchaseOrder.prototype, "updatedAt", void 0);
exports.PurchaseOrder = PurchaseOrder = __decorate([
    (0, typeorm_1.Entity)('purchase_orders')
], PurchaseOrder);
//# sourceMappingURL=purchase-order.entity.js.map