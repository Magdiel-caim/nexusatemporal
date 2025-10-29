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
exports.PatientAppointment = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
let PatientAppointment = class PatientAppointment {
    id;
    patientId;
    appointmentId;
    tenantId;
    appointmentDate;
    professionalName;
    procedureName;
    status;
    patientNotes;
    createdAt;
    updatedAt;
    patient;
};
exports.PatientAppointment = PatientAppointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientAppointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientAppointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_id', type: 'uuid' }),
    __metadata("design:type", String)
], PatientAppointment.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PatientAppointment.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appointment_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PatientAppointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], PatientAppointment.prototype, "professionalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'procedure_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], PatientAppointment.prototype, "procedureName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], PatientAppointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PatientAppointment.prototype, "patientNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatientAppointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PatientAppointment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], PatientAppointment.prototype, "patient", void 0);
exports.PatientAppointment = PatientAppointment = __decorate([
    (0, typeorm_1.Entity)('patient_appointments'),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['appointmentId'])
], PatientAppointment);
//# sourceMappingURL=patient-appointment.entity.js.map