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
exports.PatientMigrationLog = void 0;
const typeorm_1 = require("typeorm");
let PatientMigrationLog = class PatientMigrationLog {
    id;
    tenantId;
    batchNumber;
    sourceSystem;
    sourcePatientId;
    targetPatientId;
    status; // success/error/skipped
    errorMessage;
    migratedFields;
    migratedAt;
    migratedBy;
};
exports.PatientMigrationLog = PatientMigrationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientMigrationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PatientMigrationLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_number', type: 'int' }),
    __metadata("design:type", Number)
], PatientMigrationLog.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_system', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PatientMigrationLog.prototype, "sourceSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_patient_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], PatientMigrationLog.prototype, "sourcePatientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_patient_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientMigrationLog.prototype, "targetPatientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PatientMigrationLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMigrationLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'migrated_fields', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PatientMigrationLog.prototype, "migratedFields", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'migrated_at' }),
    __metadata("design:type", Date)
], PatientMigrationLog.prototype, "migratedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'migrated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientMigrationLog.prototype, "migratedBy", void 0);
exports.PatientMigrationLog = PatientMigrationLog = __decorate([
    (0, typeorm_1.Entity)('patient_migration_log'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['batchNumber'])
], PatientMigrationLog);
//# sourceMappingURL=patient-migration-log.entity.js.map