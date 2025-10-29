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
exports.Patient = void 0;
const typeorm_1 = require("typeorm");
const patient_medical_record_entity_1 = require("./patient-medical-record.entity");
const patient_image_entity_1 = require("./patient-image.entity");
const patient_appointment_entity_1 = require("./patient-appointment.entity");
const patient_transaction_entity_1 = require("./patient-transaction.entity");
let Patient = class Patient {
    id;
    tenantId;
    // Dados Pessoais
    name;
    birthDate;
    cpf;
    rg;
    gender; // male/female/other
    skinColor;
    // Contatos
    whatsapp;
    emergencyPhone;
    email;
    // Endereço
    zipCode;
    street;
    number;
    complement;
    neighborhood;
    city;
    state;
    country;
    // Saúde e Convênio
    healthCard;
    healthInsurance;
    healthInsuranceNumber;
    healthInsuranceValidity;
    healthInsuranceHolder;
    // Mídia
    profilePhotoUrl;
    profilePhotoS3Key;
    // Origem e Status
    source; // prodoctor/manual/lead/import
    sourceId;
    status; // active/inactive
    // Metadata
    notes;
    registrationNumber;
    // Controle
    createdBy;
    createdAt;
    updatedAt;
    deletedAt;
    // Relações
    medicalRecords;
    images;
    appointments;
    transactions;
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Patient.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Patient.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birth_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 14, nullable: true, unique: true }),
    __metadata("design:type", Object)
], Patient.prototype, "cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "rg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skin_color', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "skinColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "whatsapp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_phone', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "emergencyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'zip_code', type: 'varchar', length: 9, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "complement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'Brasil', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_card', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "healthCard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_insurance', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "healthInsurance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_insurance_number', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "healthInsuranceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_insurance_validity', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "healthInsuranceValidity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_insurance_holder', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "healthInsuranceHolder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_photo_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "profilePhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_photo_s3_key', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "profilePhotoS3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'manual' }),
    __metadata("design:type", String)
], Patient.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'active' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Patient.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_number', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_medical_record_entity_1.PatientMedicalRecord, (record) => record.patient),
    __metadata("design:type", Array)
], Patient.prototype, "medicalRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_image_entity_1.PatientImage, (image) => image.patient),
    __metadata("design:type", Array)
], Patient.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_appointment_entity_1.PatientAppointment, (appointment) => appointment.patient),
    __metadata("design:type", Array)
], Patient.prototype, "appointments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_transaction_entity_1.PatientTransaction, (transaction) => transaction.patient),
    __metadata("design:type", Array)
], Patient.prototype, "transactions", void 0);
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)('patients'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['name']),
    (0, typeorm_1.Index)(['cpf']),
    (0, typeorm_1.Index)(['whatsapp']),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['status'])
], Patient);
//# sourceMappingURL=patient.entity.js.map