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
exports.AppointmentReturn = exports.ReturnStatus = void 0;
const typeorm_1 = require("typeorm");
const appointment_entity_1 = require("./appointment.entity");
const user_entity_1 = require("../auth/user.entity");
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["AGENDADO"] = "agendado";
    ReturnStatus["CONFIRMADO"] = "confirmado";
    ReturnStatus["REAGENDADO"] = "reagendado";
    ReturnStatus["EM_ATENDIMENTO"] = "em_atendimento";
    ReturnStatus["FINALIZADO"] = "finalizado";
    ReturnStatus["CANCELADO"] = "cancelado";
    ReturnStatus["NAO_COMPARECEU"] = "nao_compareceu";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
let AppointmentReturn = class AppointmentReturn {
    id;
    // Relacionamento com agendamento original
    appointmentId;
    appointment;
    // Número do retorno (1, 2, 3, 4...)
    returnNumber;
    // Data e hora agendada
    scheduledDate;
    // Data original (para rastrear reagendamentos)
    originalScheduledDate;
    // Status do retorno
    status;
    // Confirmação do paciente
    confirmedByPatient;
    confirmedAt;
    // Lembretes enviados
    reminder1DaySent;
    reminder1WeekSent; // 1 semana antes (conforme especificação)
    // Check-in na clínica
    checkedIn;
    checkedInAt;
    // Informações do atendimento
    attendanceStartedAt;
    attendanceEndedAt;
    // Profissional que atenderá
    professionalId;
    professional;
    // Localização do atendimento
    location;
    // Observações
    notes;
    // Tenant
    tenantId;
    // Campos de auditoria
    createdAt;
    updatedAt;
    // Cancelamento
    canceledAt;
    canceledById;
    cancelReason;
};
exports.AppointmentReturn = AppointmentReturn;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, (appointment) => appointment.returns),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", appointment_entity_1.Appointment)
], AppointmentReturn.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AppointmentReturn.prototype, "returnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "originalScheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReturnStatus,
        default: ReturnStatus.AGENDADO,
    }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AppointmentReturn.prototype, "confirmedByPatient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AppointmentReturn.prototype, "reminder1DaySent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AppointmentReturn.prototype, "reminder1WeekSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AppointmentReturn.prototype, "checkedIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "checkedInAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "attendanceStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "attendanceEndedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'professionalId' }),
    __metadata("design:type", user_entity_1.User)
], AppointmentReturn.prototype, "professional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentReturn.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "canceledById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentReturn.prototype, "cancelReason", void 0);
exports.AppointmentReturn = AppointmentReturn = __decorate([
    (0, typeorm_1.Entity)('appointment_returns')
], AppointmentReturn);
//# sourceMappingURL=appointment-return.entity.js.map