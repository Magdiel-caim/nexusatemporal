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
exports.PatientImage = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const patient_medical_record_entity_1 = require("./patient-medical-record.entity");
let PatientImage = class PatientImage {
    id;
    patientId;
    tenantId;
    medicalRecordId;
    type; // before/after/profile/document/procedure
    category;
    imageUrl;
    s3Key;
    thumbnailUrl;
    thumbnailS3Key;
    filename;
    fileSize;
    mimeType;
    width;
    height;
    description;
    procedureName;
    takenAt;
    pairedImageId;
    uploadedBy;
    createdAt;
    deletedAt;
    patient;
    medicalRecord;
};
exports.PatientImage = PatientImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientImage.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PatientImage.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_record_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "medicalRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PatientImage.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', type: 'text' }),
    __metadata("design:type", String)
], PatientImage.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_key', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], PatientImage.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_s3_key', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "thumbnailS3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'procedure_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "procedureName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taken_at', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "takenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paired_image_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "pairedImageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientImage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], PatientImage.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.images),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], PatientImage.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_medical_record_entity_1.PatientMedicalRecord, (record) => record.images),
    (0, typeorm_1.JoinColumn)({ name: 'medical_record_id' }),
    __metadata("design:type", Object)
], PatientImage.prototype, "medicalRecord", void 0);
exports.PatientImage = PatientImage = __decorate([
    (0, typeorm_1.Entity)('patient_images'),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['type'])
], PatientImage);
//# sourceMappingURL=patient-image.entity.js.map