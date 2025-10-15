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
exports.ProcedureHistory = exports.Anamnesis = exports.MedicalRecord = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../leads/lead.entity");
const user_entity_1 = require("../auth/user.entity");
let MedicalRecord = class MedicalRecord {
    id;
    recordNumber;
    leadId;
    // Informações Pessoais
    fullName;
    birthDate;
    cpf;
    rg;
    phone;
    email;
    address;
    city;
    state;
    zipCode;
    // Informações Médicas
    bloodType;
    allergies;
    chronicDiseases;
    currentMedications;
    previousSurgeries;
    familyHistory;
    // Informações de Emergência
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelationship;
    // Observações
    generalNotes;
    medicalNotes;
    // Metadata
    createdBy;
    updatedBy;
    tenantId;
    isActive;
    createdAt;
    updatedAt;
    // Relacionamentos
    lead;
    creator;
    anamnesisList;
    procedureHistory;
};
exports.MedicalRecord = MedicalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'record_number', unique: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "recordNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name' }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birth_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "rg", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'zip_code', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blood_type', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "bloodType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chronic_diseases', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "chronicDiseases", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_medications', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "currentMedications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_surgeries', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "previousSurgeries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'family_history', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "familyHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_name', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_phone', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_relationship', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'general_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "generalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "medicalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], MedicalRecord.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MedicalRecord.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], MedicalRecord.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], MedicalRecord.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Anamnesis, anamnesis => anamnesis.medicalRecord),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "anamnesisList", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProcedureHistory, history => history.medicalRecord),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "procedureHistory", void 0);
exports.MedicalRecord = MedicalRecord = __decorate([
    (0, typeorm_1.Entity)('medical_records')
], MedicalRecord);
let Anamnesis = class Anamnesis {
    id;
    medicalRecordId;
    appointmentId;
    // Informações da Anamnese
    complaintMain;
    complaintHistory;
    // Hábitos de Vida
    smoker;
    alcoholConsumption;
    physicalActivity;
    sleepHours;
    waterIntake;
    // Estética Específica
    skinType;
    skinIssues;
    cosmeticsUsed;
    previousAestheticProcedures;
    expectations;
    // Saúde Geral
    hasDiabetes;
    hasHypertension;
    hasHeartDisease;
    hasThyroidIssues;
    isPregnant;
    isBreastfeeding;
    menstrualCycleRegular;
    usesContraceptive;
    // Observações
    professionalObservations;
    treatmentPlan;
    // Anexos
    photos;
    documents;
    // Metadata
    performedBy;
    tenantId;
    createdAt;
    updatedAt;
    // Relacionamentos
    medicalRecord;
    professional;
};
exports.Anamnesis = Anamnesis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Anamnesis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_record_id', type: 'uuid' }),
    __metadata("design:type", String)
], Anamnesis.prototype, "medicalRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'complaint_main', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "complaintMain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'complaint_history', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "complaintHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "smoker", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alcohol_consumption', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "alcoholConsumption", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'physical_activity', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "physicalActivity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sleep_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Anamnesis.prototype, "sleepHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'water_intake', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Anamnesis.prototype, "waterIntake", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skin_type', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "skinType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skin_issues', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Anamnesis.prototype, "skinIssues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cosmetics_used', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Anamnesis.prototype, "cosmeticsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_aesthetic_procedures', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Anamnesis.prototype, "previousAestheticProcedures", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "expectations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_diabetes', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "hasDiabetes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_hypertension', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "hasHypertension", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_heart_disease', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "hasHeartDisease", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_thyroid_issues', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "hasThyroidIssues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_pregnant', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "isPregnant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_breastfeeding', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "isBreastfeeding", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'menstrual_cycle_regular', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "menstrualCycleRegular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uses_contraceptive', nullable: true }),
    __metadata("design:type", Boolean)
], Anamnesis.prototype, "usesContraceptive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_observations', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "professionalObservations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'treatment_plan', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Anamnesis.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Anamnesis.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Anamnesis.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], Anamnesis.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Anamnesis.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Anamnesis.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MedicalRecord, record => record.anamnesisList),
    (0, typeorm_1.JoinColumn)({ name: 'medical_record_id' }),
    __metadata("design:type", MedicalRecord)
], Anamnesis.prototype, "medicalRecord", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'performed_by' }),
    __metadata("design:type", user_entity_1.User)
], Anamnesis.prototype, "professional", void 0);
exports.Anamnesis = Anamnesis = __decorate([
    (0, typeorm_1.Entity)('anamnesis')
], Anamnesis);
let ProcedureHistory = class ProcedureHistory {
    id;
    medicalRecordId;
    appointmentId;
    procedureId;
    // Informações do Procedimento
    procedureDate;
    durationMinutes;
    professionalId;
    // Detalhes da Execução
    productsUsed;
    equipmentUsed;
    techniqueDescription;
    areasTreated;
    // Observações
    beforePhotos;
    afterPhotos;
    patientReaction;
    professionalNotes;
    // Resultados e Follow-up
    resultsDescription;
    complications;
    nextSessionRecommendation;
    // Metadata
    tenantId;
    createdAt;
    updatedAt;
    // Relacionamentos
    medicalRecord;
    professional;
};
exports.ProcedureHistory = ProcedureHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_record_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "medicalRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'procedure_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'procedure_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], ProcedureHistory.prototype, "procedureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_minutes', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProcedureHistory.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'products_used', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ProcedureHistory.prototype, "productsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'equipment_used', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ProcedureHistory.prototype, "equipmentUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technique_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "techniqueDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'areas_treated', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ProcedureHistory.prototype, "areasTreated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'before_photos', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ProcedureHistory.prototype, "beforePhotos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'after_photos', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ProcedureHistory.prototype, "afterPhotos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_reaction', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "patientReaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "professionalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'results_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "resultsDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "complications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_session_recommendation', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "nextSessionRecommendation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProcedureHistory.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProcedureHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProcedureHistory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MedicalRecord, record => record.procedureHistory),
    (0, typeorm_1.JoinColumn)({ name: 'medical_record_id' }),
    __metadata("design:type", MedicalRecord)
], ProcedureHistory.prototype, "medicalRecord", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'professional_id' }),
    __metadata("design:type", user_entity_1.User)
], ProcedureHistory.prototype, "professional", void 0);
exports.ProcedureHistory = ProcedureHistory = __decorate([
    (0, typeorm_1.Entity)('procedure_history')
], ProcedureHistory);
//# sourceMappingURL=medical-record.entity.js.map