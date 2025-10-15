"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../database/data-source");
const appointment_entity_1 = require("./appointment.entity");
const appointment_return_entity_1 = require("./appointment-return.entity");
const appointment_notification_entity_1 = require("./appointment-notification.entity");
const lead_entity_1 = require("../leads/lead.entity");
class AppointmentService {
    appointmentRepo;
    returnRepo;
    notificationRepo;
    leadRepo;
    constructor() {
        this.appointmentRepo = data_source_1.CrmDataSource.getRepository(appointment_entity_1.Appointment);
        this.returnRepo = data_source_1.CrmDataSource.getRepository(appointment_return_entity_1.AppointmentReturn);
        this.notificationRepo = data_source_1.CrmDataSource.getRepository(appointment_notification_entity_1.AppointmentNotification);
        this.leadRepo = data_source_1.CrmDataSource.getRepository(lead_entity_1.Lead);
    }
    /**
     * Criar novo agendamento
     */
    async create(data) {
        const appointment = this.appointmentRepo.create({
            leadId: data.leadId,
            procedureId: data.procedureId,
            professionalId: data.professionalId,
            scheduledDate: data.scheduledDate,
            estimatedDuration: data.estimatedDuration,
            location: data.location,
            paymentAmount: data.paymentAmount,
            paymentMethod: data.paymentMethod,
            hasReturn: data.hasReturn,
            returnCount: data.returnCount,
            returnFrequency: data.returnFrequency,
            notes: data.notes,
            createdById: data.createdById,
            tenantId: data.tenantId,
            status: appointment_entity_1.AppointmentStatus.AGUARDANDO_PAGAMENTO,
            paymentStatus: appointment_entity_1.PaymentStatus.PENDENTE,
            anamnesisStatus: appointment_entity_1.AnamnesisStatus.PENDENTE,
        });
        const saved = await this.appointmentRepo.save(appointment);
        // Atualizar status do lead
        await this.leadRepo.update(data.leadId, {
            clientStatus: lead_entity_1.ClientStatus.AGENDAMENTO_PENDENTE,
        });
        // Criar notificação de agendamento criado
        await this.createNotification({
            appointmentId: saved.id,
            type: appointment_notification_entity_1.NotificationType.AGENDAMENTO_CRIADO,
            recipientPhone: '', // Será preenchido pelo controller com dados do lead
            message: 'Agendamento criado com sucesso',
            tenantId: data.tenantId,
        });
        return saved;
    }
    /**
     * Confirmar pagamento e liberar agenda
     */
    async confirmPayment(id, paymentProof, paymentMethod) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.paymentStatus = appointment_entity_1.PaymentStatus.PAGO;
        appointment.paymentProof = paymentProof;
        appointment.paymentMethod = paymentMethod;
        appointment.status = appointment_entity_1.AppointmentStatus.AGUARDANDO_CONFIRMACAO;
        const saved = await this.appointmentRepo.save(appointment);
        // Atualizar status do lead
        await this.leadRepo.update(appointment.leadId, {
            clientStatus: lead_entity_1.ClientStatus.AGENDADO,
        });
        // Criar notificação de pagamento confirmado
        await this.createNotification({
            appointmentId: id,
            type: appointment_notification_entity_1.NotificationType.PAGAMENTO_CONFIRMADO,
            recipientPhone: '',
            message: 'Pagamento confirmado',
            tenantId: appointment.tenantId,
        });
        // Enviar ficha de anamnese
        await this.sendAnamnesisForm(id);
        return saved;
    }
    /**
     * Enviar ficha de anamnese
     */
    async sendAnamnesisForm(id) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.anamnesisStatus = appointment_entity_1.AnamnesisStatus.ENVIADA;
        appointment.anamnesisSentAt = new Date();
        await this.appointmentRepo.save(appointment);
        // Criar notificação
        await this.createNotification({
            appointmentId: id,
            type: appointment_notification_entity_1.NotificationType.ANAMNESE_ENVIADA,
            recipientPhone: '',
            message: 'Ficha de anamnese enviada',
            tenantId: appointment.tenantId,
        });
    }
    /**
     * Confirmar agendamento (pelo paciente)
     */
    async confirmByPatient(id, dto) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        if (dto.confirmed) {
            // Paciente confirmou
            appointment.confirmedByPatient = true;
            appointment.confirmedAt = new Date();
            appointment.status = appointment_entity_1.AppointmentStatus.CONFIRMADO;
            await this.appointmentRepo.save(appointment);
            // Criar notificação
            await this.createNotification({
                appointmentId: id,
                type: appointment_notification_entity_1.NotificationType.CONFIRMACAO_RECEBIDA,
                recipientPhone: '',
                message: 'Paciente confirmou o agendamento',
                tenantId: appointment.tenantId,
            });
        }
        else if (dto.reschedule) {
            // Paciente quer reagendar
            appointment.status = appointment_entity_1.AppointmentStatus.REAGENDADO;
            appointment.scheduledDate = dto.reschedule.newDate;
            await this.appointmentRepo.save(appointment);
            // Criar notificação
            await this.createNotification({
                appointmentId: id,
                type: appointment_notification_entity_1.NotificationType.REAGENDAMENTO_CONFIRMADO,
                recipientPhone: '',
                message: `Agendamento reagendado para ${dto.reschedule.newDate}`,
                tenantId: appointment.tenantId,
            });
        }
        return appointment;
    }
    /**
     * Check-in do paciente na clínica
     */
    async checkIn(id, userId) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.checkedIn = true;
        appointment.checkedInAt = new Date();
        appointment.checkedInBy = userId;
        return this.appointmentRepo.save(appointment);
    }
    /**
     * Iniciar atendimento
     */
    async startAttendance(id) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.status = appointment_entity_1.AppointmentStatus.EM_ATENDIMENTO;
        appointment.attendanceStartedAt = new Date();
        // Atualizar status do lead
        await this.leadRepo.update(appointment.leadId, {
            clientStatus: lead_entity_1.ClientStatus.EM_TRATAMENTO,
        });
        return this.appointmentRepo.save(appointment);
    }
    /**
     * Finalizar atendimento
     */
    async finalizeAttendance(id, dto) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.status = appointment_entity_1.AppointmentStatus.FINALIZADO;
        appointment.attendanceEndedAt = new Date();
        appointment.hasReturn = dto.hasReturn;
        if (dto.returnCount !== undefined) {
            appointment.returnCount = dto.returnCount;
        }
        if (dto.returnFrequency !== undefined) {
            appointment.returnFrequency = dto.returnFrequency;
        }
        appointment.notes = dto.notes || appointment.notes;
        const saved = await this.appointmentRepo.save(appointment);
        // Criar retornos automáticos se necessário
        if (dto.hasReturn && dto.returnCount && dto.returnFrequency) {
            await this.createAutomaticReturns(appointment, dto.returnCount, dto.returnFrequency);
        }
        // Notificar finalização
        await this.createNotification({
            appointmentId: id,
            type: appointment_notification_entity_1.NotificationType.ATENDIMENTO_FINALIZADO,
            recipientPhone: '',
            message: 'Atendimento finalizado',
            tenantId: appointment.tenantId,
        });
        return saved;
    }
    /**
     * Criar retornos automáticos
     */
    async createAutomaticReturns(appointment, count, frequency) {
        if (!count || !frequency) {
            return;
        }
        const baseDate = appointment.scheduledDate;
        for (let i = 1; i <= count; i++) {
            const returnDate = new Date(baseDate);
            returnDate.setDate(returnDate.getDate() + frequency * i);
            const returnAppt = this.returnRepo.create({
                appointmentId: appointment.id,
                returnNumber: i,
                scheduledDate: returnDate,
                originalScheduledDate: returnDate,
                status: appointment_return_entity_1.ReturnStatus.AGENDADO,
                professionalId: appointment.professionalId,
                location: appointment.location,
                tenantId: appointment.tenantId,
            });
            await this.returnRepo.save(returnAppt);
        }
    }
    /**
     * Buscar agendamentos por data
     */
    async findByDate(tenantId, startDate, endDate) {
        return this.appointmentRepo.find({
            where: {
                tenantId,
                scheduledDate: (0, typeorm_1.Between)(startDate, endDate),
            },
            relations: ['lead', 'procedure', 'professional'],
            order: { scheduledDate: 'ASC' },
        });
    }
    /**
     * Buscar agendamentos por lead
     */
    async findByLead(leadId) {
        return this.appointmentRepo.find({
            where: { leadId },
            relations: ['procedure', 'professional', 'returns'],
            order: { scheduledDate: 'DESC' },
        });
    }
    /**
     * Buscar agendamentos por profissional
     */
    async findByProfessional(professionalId, startDate, endDate) {
        return this.appointmentRepo.find({
            where: {
                professionalId,
                scheduledDate: (0, typeorm_1.Between)(startDate, endDate),
            },
            relations: ['lead', 'procedure'],
            order: { scheduledDate: 'ASC' },
        });
    }
    /**
     * Buscar agendamentos do dia (para dashboard)
     */
    async findToday(tenantId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return this.findByDate(tenantId, startOfDay, endOfDay);
    }
    /**
     * Buscar agendamentos que precisam de lembrete
     */
    async findNeedingReminders() {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in5Hours = new Date(now.getTime() + 5 * 60 * 60 * 1000);
        return this.appointmentRepo.find({
            where: [
                // Lembrete de 1 dia
                {
                    scheduledDate: (0, typeorm_1.Between)(now, in24Hours),
                    reminder1DaySent: false,
                    status: (0, typeorm_1.In)([
                        appointment_entity_1.AppointmentStatus.CONFIRMADO,
                        appointment_entity_1.AppointmentStatus.AGUARDANDO_CONFIRMACAO,
                    ]),
                },
                // Lembrete de 5 horas
                {
                    scheduledDate: (0, typeorm_1.Between)(now, in5Hours),
                    reminder5HoursSent: false,
                    status: (0, typeorm_1.In)([
                        appointment_entity_1.AppointmentStatus.CONFIRMADO,
                        appointment_entity_1.AppointmentStatus.AGUARDANDO_CONFIRMACAO,
                    ]),
                },
            ],
        });
    }
    /**
     * Marcar lembrete como enviado
     */
    async markReminderSent(id, type) {
        const field = type === '1day' ? 'reminder1DaySent' : 'reminder5HoursSent';
        await this.appointmentRepo.update(id, { [field]: true });
    }
    /**
     * Criar notificação
     */
    async createNotification(data) {
        const notification = this.notificationRepo.create({
            ...data,
            channel: appointment_notification_entity_1.NotificationChannel.WHATSAPP,
            status: appointment_notification_entity_1.NotificationStatus.PENDENTE,
        });
        return this.notificationRepo.save(notification);
    }
    /**
     * Atualizar agendamento
     */
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.location) {
            updateData.location = updateData.location;
        }
        await this.appointmentRepo.update(id, updateData);
        const updated = await this.appointmentRepo.findOne({ where: { id } });
        if (!updated) {
            throw new Error('Agendamento não encontrado');
        }
        return updated;
    }
    /**
     * Cancelar agendamento
     */
    async cancel(id, userId, reason) {
        const appointment = await this.appointmentRepo.findOne({ where: { id } });
        if (!appointment) {
            throw new Error('Agendamento não encontrado');
        }
        appointment.status = appointment_entity_1.AppointmentStatus.CANCELADO;
        appointment.canceledAt = new Date();
        appointment.canceledById = userId;
        appointment.cancelReason = reason;
        const saved = await this.appointmentRepo.save(appointment);
        // Cancelar retornos automáticos
        await this.returnRepo.update({ appointmentId: id }, {
            status: appointment_return_entity_1.ReturnStatus.CANCELADO,
            canceledAt: new Date(),
            canceledById: userId,
            cancelReason: 'Agendamento principal cancelado',
        });
        // Notificar cancelamento
        await this.createNotification({
            appointmentId: id,
            type: appointment_notification_entity_1.NotificationType.CANCELAMENTO,
            recipientPhone: '',
            message: `Agendamento cancelado: ${reason}`,
            tenantId: appointment.tenantId,
        });
        return saved;
    }
    /**
     * Buscar por ID
     */
    async findById(id) {
        return this.appointmentRepo.findOne({
            where: { id },
            relations: ['lead', 'procedure', 'professional', 'returns', 'notifications'],
        });
    }
    /**
     * Listar todos os agendamentos com paginação
     */
    async findAll(tenantId, page = 1, limit = 50) {
        const [data, total] = await this.appointmentRepo.findAndCount({
            where: { tenantId },
            relations: ['lead', 'procedure', 'professional'],
            order: { scheduledDate: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
}
exports.AppointmentService = AppointmentService;
exports.default = new AppointmentService();
//# sourceMappingURL=appointment.service.js.map