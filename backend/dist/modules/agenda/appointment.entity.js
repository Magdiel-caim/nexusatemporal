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
exports.Appointment = exports.AppointmentLocation = exports.AnamnesisStatus = exports.PaymentStatus = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../leads/lead.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
const user_entity_1 = require("../auth/user.entity");
const appointment_return_entity_1 = require("./appointment-return.entity");
const appointment_notification_entity_1 = require("./appointment-notification.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["AGUARDANDO_PAGAMENTO"] = "aguardando_pagamento";
    AppointmentStatus["PAGAMENTO_CONFIRMADO"] = "pagamento_confirmado";
    AppointmentStatus["AGUARDANDO_CONFIRMACAO"] = "aguardando_confirmacao";
    AppointmentStatus["CONFIRMADO"] = "confirmado";
    AppointmentStatus["REAGENDADO"] = "reagendado";
    AppointmentStatus["EM_ATENDIMENTO"] = "em_atendimento";
    AppointmentStatus["FINALIZADO"] = "finalizado";
    AppointmentStatus["CANCELADO"] = "cancelado";
    AppointmentStatus["NAO_COMPARECEU"] = "nao_compareceu";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDENTE"] = "pendente";
    PaymentStatus["PAGO"] = "pago";
    PaymentStatus["REEMBOLSADO"] = "reembolsado";
    PaymentStatus["CANCELADO"] = "cancelado";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var AnamnesisStatus;
(function (AnamnesisStatus) {
    AnamnesisStatus["PENDENTE"] = "pendente";
    AnamnesisStatus["ENVIADA"] = "enviada";
    AnamnesisStatus["PREENCHIDA"] = "preenchida";
    AnamnesisStatus["ASSINADA"] = "assinada";
})(AnamnesisStatus || (exports.AnamnesisStatus = AnamnesisStatus = {}));
var AppointmentLocation;
(function (AppointmentLocation) {
    AppointmentLocation["MOEMA"] = "moema";
    AppointmentLocation["AV_PAULISTA"] = "av_paulista";
    AppointmentLocation["PERDIZES"] = "perdizes";
    AppointmentLocation["ONLINE"] = "online";
    AppointmentLocation["A_DOMICILIO"] = "a_domicilio";
})(AppointmentLocation || (exports.AppointmentLocation = AppointmentLocation = {}));
let Appointment = class Appointment {
    id;
    // Relacionamento com Lead/Paciente
    leadId;
    lead;
    // Relacionamento com Procedimento
    procedureId;
    procedure;
    // Relacionamento com Profissional (médico/biomédico)
    professionalId;
    professional;
    // Data e hora do agendamento
    scheduledDate;
    // Duração estimada em minutos
    estimatedDuration;
    // Localização do atendimento
    location;
    // Status do agendamento
    status;
    // Status do pagamento
    paymentStatus;
    // Link ou comprovante de pagamento
    paymentProof;
    // Valor do pagamento
    paymentAmount;
    // Método de pagamento (PIX, Cartão, Débito, Dinheiro)
    paymentMethod;
    // Link para pagamento (se aplicável)
    paymentLink;
    // Ficha de anamnese
    anamnesisFormUrl;
    anamnesisStatus;
    // Data de envio da anamnese
    anamnesisSentAt;
    // Data de preenchimento da anamnese
    anamnesisCompletedAt;
    // Data de assinatura da anamnese
    anamnesisSignedAt;
    // Controle de retornos
    hasReturn;
    returnCount; // Quantos retornos
    returnFrequency; // A cada quantos dias (30, 60, 90, 15, etc)
    // Confirmação do paciente
    confirmedByPatient;
    confirmedAt;
    // Lembretes enviados
    reminder1DaySent;
    reminder5HoursSent;
    // Check-in na clínica
    checkedIn;
    checkedInAt;
    checkedInBy; // ID do usuário que fez o check-in (recepcionista)
    // Informações do atendimento
    attendanceStartedAt;
    attendanceEndedAt;
    // Observações do atendimento
    notes;
    // Observações privadas (visíveis apenas para equipe)
    privateNotes;
    // Tenant
    tenantId;
    // Relacionamentos
    returns;
    notifications;
    // Usuário que criou o agendamento
    createdById;
    createdBy;
    // Campos de auditoria
    createdAt;
    updatedAt;
    // Cancelamento
    canceledAt;
    canceledById;
    cancelReason;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Appointment.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.Lead)
], Appointment.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Appointment.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", procedure_entity_1.Procedure)
], Appointment.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "professionalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'professionalId' }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "professional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "estimatedDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentLocation,
        default: AppointmentLocation.MOEMA,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.AGUARDANDO_PAGAMENTO,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "paymentProof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "paymentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "paymentLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "anamnesisFormUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AnamnesisStatus,
        default: AnamnesisStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "anamnesisStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "anamnesisSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "anamnesisCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "anamnesisSignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "hasReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "returnCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "returnFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "confirmedByPatient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminder1DaySent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminder5HoursSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "checkedIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "checkedInAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "checkedInBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "attendanceStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "attendanceEndedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "privateNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Appointment.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_return_entity_1.AppointmentReturn, (returnAppt) => returnAppt.appointment, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Appointment.prototype, "returns", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_notification_entity_1.AppointmentNotification, (notification) => notification.appointment, { cascade: true }),
    __metadata("design:type", Array)
], Appointment.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], Appointment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "canceledById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "cancelReason", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments')
], Appointment);
//# sourceMappingURL=appointment.entity.js.map