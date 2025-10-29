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
exports.PatientTransaction = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
let PatientTransaction = class PatientTransaction {
    id;
    patientId;
    transactionId;
    tenantId;
    transactionDate;
    amount;
    type;
    category;
    description;
    status;
    createdAt;
    updatedAt;
    patient;
};
exports.PatientTransaction = PatientTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientTransaction.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientTransaction.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PatientTransaction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], PatientTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PatientTransaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], PatientTransaction.prototype, "patient", void 0);
exports.PatientTransaction = PatientTransaction = __decorate([
    (0, typeorm_1.Entity)('patient_transactions'),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['transactionId'])
], PatientTransaction);
//# sourceMappingURL=patient-transaction.entity.js.map