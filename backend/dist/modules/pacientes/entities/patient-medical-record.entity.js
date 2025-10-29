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
exports.PatientMedicalRecord = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const patient_image_entity_1 = require("./patient-image.entity");
let PatientMedicalRecord = class PatientMedicalRecord {
    id;
    patientId;
    tenantId;
    // Data do atendimento
    serviceDate;
    specialty;
    // Anamnese
    chiefComplaint;
    historyPresentIllness;
    pastMedicalHistory;
    allergies;
    medications;
    familyHistory;
    socialHistory;
    // Exame Físico
    physicalExamination;
    vitalSigns;
    // Diagnóstico e Tratamento
    diagnosis;
    treatmentPlan;
    prescriptions;
    // Evolução (migrado do ProDoctor)
    evolutionText;
    // Anexos e Documentos
    documents;
    // Assinatura digital
    signatureUrl;
    signatureS3Key;
    signedAt;
    signedBy;
    // Metadata
    createdBy;
    createdAt;
    updatedAt;
    deletedAt;
    // Revisão
    revisionNumber;
    revisedAt;
    revisedBy;
    // Relações
    patient;
    images;
};
exports.PatientMedicalRecord = PatientMedicalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientMedicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientMedicalRecord.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PatientMedicalRecord.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_date', type: 'date' }),
    __metadata("design:type", Date)
], PatientMedicalRecord.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chief_complaint', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "chiefComplaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'history_present_illness', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "historyPresentIllness", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'past_medical_history', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "pastMedicalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'family_history', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "familyHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_history', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "socialHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'physical_examination', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "physicalExamination", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vital_signs', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "vitalSigns", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'treatment_plan', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "prescriptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evolution_text', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "evolutionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "signatureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_s3_key', length: 500, nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "signatureS3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "signedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "signedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], PatientMedicalRecord.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientMedicalRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PatientMedicalRecord.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revision_number', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PatientMedicalRecord.prototype, "revisionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revised_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "revisedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revised_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientMedicalRecord.prototype, "revisedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.medicalRecords),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], PatientMedicalRecord.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_image_entity_1.PatientImage, (image) => image.medicalRecord),
    __metadata("design:type", Array)
], PatientMedicalRecord.prototype, "images", void 0);
exports.PatientMedicalRecord = PatientMedicalRecord = __decorate([
    (0, typeorm_1.Entity)('patient_medical_records'),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['serviceDate'])
], PatientMedicalRecord);
//# sourceMappingURL=patient-medical-record.entity.js.map