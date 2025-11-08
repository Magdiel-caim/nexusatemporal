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
exports.Transaction = exports.TransactionStatus = exports.PaymentMethod = exports.TransactionCategory = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../leads/lead.entity");
const appointment_entity_1 = require("../agenda/appointment.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
const user_entity_1 = require("../auth/user.entity");
const supplier_entity_1 = require("./supplier.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["RECEITA"] = "receita";
    TransactionType["DESPESA"] = "despesa";
    TransactionType["TRANSFERENCIA"] = "transferencia";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionCategory;
(function (TransactionCategory) {
    // RECEITAS
    TransactionCategory["PROCEDIMENTO"] = "procedimento";
    TransactionCategory["CONSULTA"] = "consulta";
    TransactionCategory["RETORNO"] = "retorno";
    TransactionCategory["PRODUTO"] = "produto";
    TransactionCategory["OUTROS_RECEITAS"] = "outros_receitas";
    // DESPESAS
    TransactionCategory["SALARIO"] = "salario";
    TransactionCategory["FORNECEDOR"] = "fornecedor";
    TransactionCategory["ALUGUEL"] = "aluguel";
    TransactionCategory["ENERGIA"] = "energia";
    TransactionCategory["AGUA"] = "agua";
    TransactionCategory["INTERNET"] = "internet";
    TransactionCategory["TELEFONE"] = "telefone";
    TransactionCategory["MARKETING"] = "marketing";
    TransactionCategory["MATERIAL_ESCRITORIO"] = "material_escritorio";
    TransactionCategory["MATERIAL_MEDICO"] = "material_medico";
    TransactionCategory["IMPOSTOS"] = "impostos";
    TransactionCategory["MANUTENCAO"] = "manutencao";
    TransactionCategory["CONTABILIDADE"] = "contabilidade";
    TransactionCategory["SOFTWARE"] = "software";
    TransactionCategory["LIMPEZA"] = "limpeza";
    TransactionCategory["SEGURANCA"] = "seguranca";
    TransactionCategory["OUTROS_DESPESAS"] = "outros_despesas";
})(TransactionCategory || (exports.TransactionCategory = TransactionCategory = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["PIX"] = "pix";
    PaymentMethod["DINHEIRO"] = "dinheiro";
    PaymentMethod["CARTAO_CREDITO"] = "cartao_credito";
    PaymentMethod["CARTAO_DEBITO"] = "cartao_debito";
    PaymentMethod["LINK_PAGAMENTO"] = "link_pagamento";
    PaymentMethod["TRANSFERENCIA_BANCARIA"] = "transferencia_bancaria";
    PaymentMethod["BOLETO"] = "boleto";
    PaymentMethod["CHEQUE"] = "cheque";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDENTE"] = "pendente";
    TransactionStatus["CONFIRMADA"] = "confirmada";
    TransactionStatus["CANCELADA"] = "cancelada";
    TransactionStatus["ESTORNADA"] = "estornada";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
    id;
    type;
    category;
    amount;
    description;
    paymentMethod;
    status;
    // Relacionamentos
    leadId;
    lead;
    appointmentId;
    appointment;
    procedureId;
    procedure;
    supplierId;
    supplier;
    // Datas - armazenadas como VARCHAR(10) no formato YYYY-MM-DD
    // Sem conversão de timezone - PostgreSQL trata como texto puro
    dueDate;
    paymentDate;
    referenceDate;
    // Comprovantes e anexos
    attachments;
    // Observações
    notes;
    // Parcelamento
    isInstallment;
    installmentNumber;
    totalInstallments;
    parentTransactionId;
    // Recorrência
    isRecurring;
    recurringFrequency;
    recurringGroupId;
    // Tenant e auditoria
    tenantId;
    createdById;
    createdBy;
    approvedById;
    approvedBy;
    approvedAt;
    createdAt;
    updatedAt;
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionCategory,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.Lead)
], Transaction.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", appointment_entity_1.Appointment)
], Transaction.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", procedure_entity_1.Procedure)
], Transaction.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'supplierId' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], Transaction.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "referenceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Transaction.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "isInstallment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "installmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "totalInstallments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "parentTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "recurringFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "recurringGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Transaction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "approvedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approvedById' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map