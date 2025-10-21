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
exports.Invoice = exports.InvoiceStatus = exports.InvoiceType = void 0;
const typeorm_1 = require("typeorm");
const transaction_entity_1 = require("./transaction.entity");
const lead_entity_1 = require("../leads/lead.entity");
const user_entity_1 = require("../auth/user.entity");
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["RECIBO"] = "recibo";
    InvoiceType["NOTA_FISCAL"] = "nota_fiscal";
    InvoiceType["NOTA_SERVICO"] = "nota_servico";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["RASCUNHO"] = "rascunho";
    InvoiceStatus["EMITIDA"] = "emitida";
    InvoiceStatus["ENVIADA"] = "enviada";
    InvoiceStatus["CANCELADA"] = "cancelada";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
let Invoice = class Invoice {
    id;
    invoiceNumber;
    type;
    status;
    transactionId;
    transaction;
    leadId;
    lead;
    amount;
    description;
    items;
    issueDate;
    dueDate;
    pdfUrl;
    metadata;
    sentAt;
    sentTo; // Email ou telefone
    sentMethod; // 'email', 'whatsapp', 'manual'
    tenantId;
    issuedById;
    issuedBy;
    canceledAt;
    cancelReason;
    createdAt;
    updatedAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceType,
        default: InvoiceType.RECIBO,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.RASCUNHO,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Invoice.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Invoice.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.Lead)
], Invoice.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Invoice.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "sentTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "sentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Invoice.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "issuedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'issuedById' }),
    __metadata("design:type", user_entity_1.User)
], Invoice.prototype, "issuedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "updatedAt", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices')
], Invoice);
//# sourceMappingURL=invoice.entity.js.map