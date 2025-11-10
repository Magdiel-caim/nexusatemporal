"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../database/data-source");
const appointment_entity_1 = require("./appointment.entity");
const appointment_return_entity_1 = require("./appointment-return.entity");
const appointment_notification_entity_1 = require("./appointment-notification.entity");
const lead_entity_1 = require("../leads/lead.entity");
const EventEmitterService_1 = require("../../services/EventEmitterService");
const database_1 = require("../../modules/marketing/automation/database");
class AppointmentService {
    appointmentRepo;
    returnRepo;
    notificationRepo;
    leadRepo;
    _eventEmitter;
    get eventEmitter() {
        if (!this._eventEmitter) {
            this._eventEmitter = (0, EventEmitterService_1.getEventEmitterService)((0, database_1.getAutomationDbPool)());
        }
        return this._eventEmitter;
    }
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
            procedureIds: data.procedureIds, // Múltiplos procedimentos
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
        // Emit appointment.scheduled event
        try {
            await this.eventEmitter.emitAppointmentScheduled(data.tenantId, saved.id, saved);
        }
        catch (error) {
            console.error('[AppointmentService] Failed to emit appointment.scheduled event:', error);
        }
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
            // Emit appointment.confirmed event
            try {
                await this.eventEmitter.emit({
                    eventType: 'appointment.confirmed',
                    tenantId: appointment.tenantId,
                    entityType: 'appointment',
                    entityId: id,
                    data: appointment
                });
            }
            catch (error) {
                console.error('[AppointmentService] Failed to emit appointment.confirmed event:', error);
            }
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
        // Emit appointment.completed event
        try {
            await this.eventEmitter.emitAppointmentCompleted(appointment.tenantId, id, saved);
        }
        catch (error) {
            console.error('[AppointmentService] Failed to emit appointment.completed event:', error);
        }
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
        // Emit appointment.cancelled event
        try {
            await this.eventEmitter.emit({
                eventType: 'appointment.cancelled',
                tenantId: appointment.tenantId,
                entityType: 'appointment',
                entityId: id,
                data: {
                    ...saved,
                    cancelReason: reason,
                    canceledBy: userId
                }
            });
        }
        catch (error) {
            console.error('[AppointmentService] Failed to emit appointment.cancelled event:', error);
        }
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
    /**
     * Verificar se um horário está disponível
     * Considera conflitos de horários com base na duração do procedimento
     */
    async checkAvailability(tenantId, scheduledDate, duration, location, professionalId, excludeAppointmentId) {
        const startTime = new Date(scheduledDate);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        // Buscar agendamentos que possam conflitar
        const where = {
            tenantId,
            location,
            status: (0, typeorm_1.In)([
                appointment_entity_1.AppointmentStatus.AGUARDANDO_PAGAMENTO,
                appointment_entity_1.AppointmentStatus.PAGAMENTO_CONFIRMADO,
                appointment_entity_1.AppointmentStatus.AGUARDANDO_CONFIRMACAO,
                appointment_entity_1.AppointmentStatus.CONFIRMADO,
                appointment_entity_1.AppointmentStatus.EM_ATENDIMENTO,
            ]),
        };
        if (professionalId) {
            where.professionalId = professionalId;
        }
        const appointments = await this.appointmentRepo.find({
            where,
            relations: ['lead', 'procedure'],
        });
        // Verificar conflitos
        const conflicts = [];
        for (const apt of appointments) {
            // Pular o próprio agendamento se estiver editando
            if (excludeAppointmentId && apt.id === excludeAppointmentId) {
                continue;
            }
            const aptStart = new Date(apt.scheduledDate);
            const aptDuration = apt.estimatedDuration || apt.procedure?.duration || 60;
            const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
            // Verificar se há sobreposição de horários
            if ((startTime >= aptStart && startTime < aptEnd) || // Início do novo está dentro de um existente
                (endTime > aptStart && endTime <= aptEnd) || // Fim do novo está dentro de um existente
                (startTime <= aptStart && endTime >= aptEnd) // Novo engloba um existente completamente
            ) {
                conflicts.push(apt);
            }
        }
        return {
            available: conflicts.length === 0,
            conflicts,
        };
    }
    /**
     * Obter horários ocupados para uma data específica
     * Retorna lista de horários em formato HH:MM
     */
    async getOccupiedSlots(tenantId, date, // YYYY-MM-DD
    location, professionalId, interval = 5 // Intervalo em minutos
    ) {
        const startOfDay = new Date(date + 'T00:00:00');
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date + 'T23:59:59');
        endOfDay.setHours(23, 59, 59, 999);
        const where = {
            tenantId,
            location,
            scheduledDate: (0, typeorm_1.Between)(startOfDay, endOfDay),
            status: (0, typeorm_1.In)([
                appointment_entity_1.AppointmentStatus.AGUARDANDO_PAGAMENTO,
                appointment_entity_1.AppointmentStatus.PAGAMENTO_CONFIRMADO,
                appointment_entity_1.AppointmentStatus.AGUARDANDO_CONFIRMACAO,
                appointment_entity_1.AppointmentStatus.CONFIRMADO,
                appointment_entity_1.AppointmentStatus.EM_ATENDIMENTO,
            ]),
        };
        if (professionalId) {
            where.professionalId = professionalId;
        }
        const appointments = await this.appointmentRepo.find({
            where,
            relations: ['procedure'],
            order: { scheduledDate: 'ASC' },
        });
        // Gerar todos os slots ocupados baseado na duração de cada agendamento
        const occupiedSlots = [];
        for (const apt of appointments) {
            const start = new Date(apt.scheduledDate);
            const duration = apt.estimatedDuration || apt.procedure?.duration || 60;
            const totalSlots = Math.ceil(duration / interval);
            for (let i = 0; i < totalSlots; i++) {
                const slotTime = new Date(start.getTime() + i * interval * 60000);
                const hours = slotTime.getHours().toString().padStart(2, '0');
                const minutes = slotTime.getMinutes().toString().padStart(2, '0');
                const timeString = `${hours}:${minutes}`;
                if (!occupiedSlots.includes(timeString)) {
                    occupiedSlots.push(timeString);
                }
            }
        }
        return occupiedSlots.sort();
    }
    /**
     * Obter slots disponíveis para uma data
     */
    async getAvailableSlots(tenantId, date, // YYYY-MM-DD
    location, professionalId, startHour = 7, endHour = 20, interval = 5) {
        const occupiedSlots = await this.getOccupiedSlots(tenantId, date, location, professionalId, interval);
        // Gerar todos os slots possíveis
        const totalMinutes = (endHour - startHour) * 60;
        const numberOfSlots = Math.floor(totalMinutes / interval);
        const slots = [];
        for (let i = 0; i <= numberOfSlots; i++) {
            const totalMinutesFromStart = startHour * 60 + i * interval;
            const hours = Math.floor(totalMinutesFromStart / 60);
            const minutes = totalMinutesFromStart % 60;
            if (hours >= endHour && minutes > 0)
                break;
            if (hours > endHour)
                break;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            slots.push({
                time: timeString,
                available: !occupiedSlots.includes(timeString),
            });
        }
        return slots;
    }
}
exports.AppointmentService = AppointmentService;
exports.default = new AppointmentService();
//# sourceMappingURL=appointment.service.js.map