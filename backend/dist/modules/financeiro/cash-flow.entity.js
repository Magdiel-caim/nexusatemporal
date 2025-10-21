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
exports.CashFlow = exports.CashFlowType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/user.entity");
var CashFlowType;
(function (CashFlowType) {
    CashFlowType["ABERTURA"] = "abertura";
    CashFlowType["FECHAMENTO"] = "fechamento";
    CashFlowType["SANGRIA"] = "sangria";
    CashFlowType["REFORCO"] = "reforco";
})(CashFlowType || (exports.CashFlowType = CashFlowType = {}));
let CashFlow = class CashFlow {
    id;
    date;
    type;
    openingBalance;
    totalIncome;
    totalExpense;
    closingBalance;
    // Detalhamento por forma de pagamento
    cashAmount; // Dinheiro
    pixAmount;
    creditCardAmount;
    debitCardAmount;
    transferAmount;
    otherAmount;
    // Sangrias e reforços
    withdrawals; // Sangrias
    deposits; // Reforços
    notes;
    isClosed;
    closedAt;
    closedById;
    closedBy;
    tenantId;
    openedById;
    openedBy;
    openedAt;
    createdAt;
    updatedAt;
};
exports.CashFlow = CashFlow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CashFlow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', unique: true }),
    __metadata("design:type", Date)
], CashFlow.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CashFlowType,
        nullable: true,
    }),
    __metadata("design:type", String)
], CashFlow.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "totalIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "totalExpense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "closingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "cashAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "pixAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "creditCardAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "debitCardAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "transferAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "otherAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "withdrawals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashFlow.prototype, "deposits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CashFlow.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CashFlow.prototype, "isClosed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CashFlow.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], CashFlow.prototype, "closedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'closedById' }),
    __metadata("design:type", user_entity_1.User)
], CashFlow.prototype, "closedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], CashFlow.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], CashFlow.prototype, "openedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'openedById' }),
    __metadata("design:type", user_entity_1.User)
], CashFlow.prototype, "openedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CashFlow.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CashFlow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CashFlow.prototype, "updatedAt", void 0);
exports.CashFlow = CashFlow = __decorate([
    (0, typeorm_1.Entity)('cash_flow')
], CashFlow);
//# sourceMappingURL=cash-flow.entity.js.map