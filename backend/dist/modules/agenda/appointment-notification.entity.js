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
exports.AppointmentNotification = exports.NotificationChannel = exports.NotificationStatus = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const appointment_entity_1 = require("./appointment.entity");
const appointment_return_entity_1 = require("./appointment-return.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["AGENDAMENTO_CRIADO"] = "agendamento_criado";
    NotificationType["PAGAMENTO_LINK"] = "pagamento_link";
    NotificationType["PAGAMENTO_CONFIRMADO"] = "pagamento_confirmado";
    NotificationType["ANAMNESE_ENVIADA"] = "anamnese_enviada";
    NotificationType["LEMBRETE_1_DIA"] = "lembrete_1_dia";
    NotificationType["LEMBRETE_5_HORAS"] = "lembrete_5_horas";
    NotificationType["CONFIRMACAO_SOLICITADA"] = "confirmacao_solicitada";
    NotificationType["CONFIRMACAO_RECEBIDA"] = "confirmacao_recebida";
    NotificationType["REAGENDAMENTO_CONFIRMADO"] = "reagendamento_confirmado";
    NotificationType["CANCELAMENTO"] = "cancelamento";
    NotificationType["RETORNO_1_SEMANA"] = "retorno_1_semana";
    NotificationType["RETORNO_CONFIRMADO"] = "retorno_confirmado";
    NotificationType["ATENDIMENTO_FINALIZADO"] = "atendimento_finalizado";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDENTE"] = "pendente";
    NotificationStatus["ENVIADA"] = "enviada";
    NotificationStatus["ENTREGUE"] = "entregue";
    NotificationStatus["LIDA"] = "lida";
    NotificationStatus["FALHA"] = "falha";
    NotificationStatus["ERRO"] = "erro";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["WHATSAPP"] = "whatsapp";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["PUSH"] = "push";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
let AppointmentNotification = class AppointmentNotification {
    id;
    // Relacionamento com agendamento
    appointmentId;
    appointment;
    // Relacionamento com retorno (se aplicável)
    appointmentReturnId;
    appointmentReturn;
    // Tipo de notificação
    type;
    // Canal de envio
    channel;
    // Status da notificação
    status;
    // Destinatário
    recipientPhone;
    recipientEmail;
    recipientName;
    // Conteúdo da mensagem
    message;
    // Template usado (se aplicável)
    templateName;
    // Variáveis do template
    templateVariables;
    // Dados da resposta do serviço de envio
    deliveryData;
    // ID da mensagem no serviço externo (WhatsApp, etc)
    externalMessageId;
    // Data de envio
    sentAt;
    // Data de entrega
    deliveredAt;
    // Data de leitura
    readAt;
    // Data de falha
    failedAt;
    // Motivo da falha
    failureReason;
    // Número de tentativas
    retryCount;
    // Última tentativa
    lastRetryAt;
    // Tenant
    tenantId;
    // Data de criação
    createdAt;
};
exports.AppointmentNotification = AppointmentNotification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, (appointment) => appointment.notifications),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", appointment_entity_1.Appointment)
], AppointmentNotification.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "appointmentReturnId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_return_entity_1.AppointmentReturn),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentReturnId' }),
    __metadata("design:type", appointment_return_entity_1.AppointmentReturn)
], AppointmentNotification.prototype, "appointmentReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationType,
    }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationChannel,
        default: NotificationChannel.WHATSAPP,
    }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "recipientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "recipientEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "templateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AppointmentNotification.prototype, "templateVariables", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AppointmentNotification.prototype, "deliveryData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "externalMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AppointmentNotification.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "lastRetryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AppointmentNotification.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentNotification.prototype, "createdAt", void 0);
exports.AppointmentNotification = AppointmentNotification = __decorate([
    (0, typeorm_1.Entity)('appointment_notifications')
], AppointmentNotification);
//# sourceMappingURL=appointment-notification.entity.js.map