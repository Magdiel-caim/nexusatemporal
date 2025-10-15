import { Repository, Between, In, LessThan, MoreThan } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
  AnamnesisStatus,
} from './appointment.entity';
import { AppointmentReturn, ReturnStatus } from './appointment-return.entity';
import {
  AppointmentNotification,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
} from './appointment-notification.entity';
import { Lead, ClientStatus } from '../leads/lead.entity';

export interface CreateAppointmentDto {
  leadId: string;
  procedureId: string;
  professionalId?: string;
  scheduledDate: Date;
  estimatedDuration?: number;
  location: string;
  paymentAmount?: number;
  paymentMethod?: string;
  hasReturn?: boolean;
  returnCount?: number;
  returnFrequency?: number;
  notes?: string;
  createdById?: string;
  tenantId: string;
}

export interface UpdateAppointmentDto {
  professionalId?: string;
  scheduledDate?: Date;
  estimatedDuration?: number;
  location?: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  paymentProof?: string;
  paymentAmount?: number;
  notes?: string;
  privateNotes?: string;
}

export interface ConfirmAppointmentDto {
  confirmed: boolean;
  reschedule?: {
    newDate: Date;
    reason?: string;
  };
}

export interface FinalizeAppointmentDto {
  hasReturn: boolean;
  returnCount?: number;
  returnFrequency?: number;
  notes?: string;
}

export class AppointmentService {
  private appointmentRepo: Repository<Appointment>;
  private returnRepo: Repository<AppointmentReturn>;
  private notificationRepo: Repository<AppointmentNotification>;
  private leadRepo: Repository<Lead>;

  constructor() {
    this.appointmentRepo = CrmDataSource.getRepository(Appointment);
    this.returnRepo = CrmDataSource.getRepository(AppointmentReturn);
    this.notificationRepo = CrmDataSource.getRepository(AppointmentNotification);
    this.leadRepo = CrmDataSource.getRepository(Lead);
  }

  /**
   * Criar novo agendamento
   */
  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepo.create({
      leadId: data.leadId,
      procedureId: data.procedureId,
      professionalId: data.professionalId,
      scheduledDate: data.scheduledDate,
      estimatedDuration: data.estimatedDuration,
      location: data.location as any,
      paymentAmount: data.paymentAmount,
      paymentMethod: data.paymentMethod,
      hasReturn: data.hasReturn,
      returnCount: data.returnCount,
      returnFrequency: data.returnFrequency,
      notes: data.notes,
      createdById: data.createdById,
      tenantId: data.tenantId,
      status: AppointmentStatus.AGUARDANDO_PAGAMENTO,
      paymentStatus: PaymentStatus.PENDENTE,
      anamnesisStatus: AnamnesisStatus.PENDENTE,
    });

    const saved = await this.appointmentRepo.save(appointment);

    // Atualizar status do lead
    await this.leadRepo.update(data.leadId, {
      clientStatus: ClientStatus.AGENDAMENTO_PENDENTE,
    });

    // Criar notificação de agendamento criado
    await this.createNotification({
      appointmentId: saved.id,
      type: NotificationType.AGENDAMENTO_CRIADO,
      recipientPhone: '', // Será preenchido pelo controller com dados do lead
      message: 'Agendamento criado com sucesso',
      tenantId: data.tenantId,
    });

    return saved;
  }

  /**
   * Confirmar pagamento e liberar agenda
   */
  async confirmPayment(
    id: string,
    paymentProof: string,
    paymentMethod: string
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    appointment.paymentStatus = PaymentStatus.PAGO;
    appointment.paymentProof = paymentProof;
    appointment.paymentMethod = paymentMethod;
    appointment.status = AppointmentStatus.AGUARDANDO_CONFIRMACAO;

    const saved = await this.appointmentRepo.save(appointment);

    // Atualizar status do lead
    await this.leadRepo.update(appointment.leadId, {
      clientStatus: ClientStatus.AGENDADO,
    });

    // Criar notificação de pagamento confirmado
    await this.createNotification({
      appointmentId: id,
      type: NotificationType.PAGAMENTO_CONFIRMADO,
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
  async sendAnamnesisForm(id: string): Promise<void> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    appointment.anamnesisStatus = AnamnesisStatus.ENVIADA;
    appointment.anamnesisSentAt = new Date();

    await this.appointmentRepo.save(appointment);

    // Criar notificação
    await this.createNotification({
      appointmentId: id,
      type: NotificationType.ANAMNESE_ENVIADA,
      recipientPhone: '',
      message: 'Ficha de anamnese enviada',
      tenantId: appointment.tenantId,
    });
  }

  /**
   * Confirmar agendamento (pelo paciente)
   */
  async confirmByPatient(
    id: string,
    dto: ConfirmAppointmentDto
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    if (dto.confirmed) {
      // Paciente confirmou
      appointment.confirmedByPatient = true;
      appointment.confirmedAt = new Date();
      appointment.status = AppointmentStatus.CONFIRMADO;

      await this.appointmentRepo.save(appointment);

      // Criar notificação
      await this.createNotification({
        appointmentId: id,
        type: NotificationType.CONFIRMACAO_RECEBIDA,
        recipientPhone: '',
        message: 'Paciente confirmou o agendamento',
        tenantId: appointment.tenantId,
      });
    } else if (dto.reschedule) {
      // Paciente quer reagendar
      appointment.status = AppointmentStatus.REAGENDADO;
      appointment.scheduledDate = dto.reschedule.newDate;

      await this.appointmentRepo.save(appointment);

      // Criar notificação
      await this.createNotification({
        appointmentId: id,
        type: NotificationType.REAGENDAMENTO_CONFIRMADO,
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
  async checkIn(id: string, userId: string): Promise<Appointment> {
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
  async startAttendance(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    appointment.status = AppointmentStatus.EM_ATENDIMENTO;
    appointment.attendanceStartedAt = new Date();

    // Atualizar status do lead
    await this.leadRepo.update(appointment.leadId, {
      clientStatus: ClientStatus.EM_TRATAMENTO,
    });

    return this.appointmentRepo.save(appointment);
  }

  /**
   * Finalizar atendimento
   */
  async finalizeAttendance(
    id: string,
    dto: FinalizeAppointmentDto
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    appointment.status = AppointmentStatus.FINALIZADO;
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
      type: NotificationType.ATENDIMENTO_FINALIZADO,
      recipientPhone: '',
      message: 'Atendimento finalizado',
      tenantId: appointment.tenantId,
    });

    return saved;
  }

  /**
   * Criar retornos automáticos
   */
  private async createAutomaticReturns(
    appointment: Appointment,
    count: number,
    frequency: number
  ): Promise<void> {
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
        status: ReturnStatus.AGENDADO,
        professionalId: appointment.professionalId,
        location: appointment.location as any,
        tenantId: appointment.tenantId,
      });

      await this.returnRepo.save(returnAppt);
    }
  }

  /**
   * Buscar agendamentos por data
   */
  async findByDate(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: {
        tenantId,
        scheduledDate: Between(startDate, endDate),
      },
      relations: ['lead', 'procedure', 'professional'],
      order: { scheduledDate: 'ASC' },
    });
  }

  /**
   * Buscar agendamentos por lead
   */
  async findByLead(leadId: string): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: { leadId },
      relations: ['procedure', 'professional', 'returns'],
      order: { scheduledDate: 'DESC' },
    });
  }

  /**
   * Buscar agendamentos por profissional
   */
  async findByProfessional(
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: {
        professionalId,
        scheduledDate: Between(startDate, endDate),
      },
      relations: ['lead', 'procedure'],
      order: { scheduledDate: 'ASC' },
    });
  }

  /**
   * Buscar agendamentos do dia (para dashboard)
   */
  async findToday(tenantId: string): Promise<Appointment[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDate(tenantId, startOfDay, endOfDay);
  }

  /**
   * Buscar agendamentos que precisam de lembrete
   */
  async findNeedingReminders(): Promise<Appointment[]> {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in5Hours = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    return this.appointmentRepo.find({
      where: [
        // Lembrete de 1 dia
        {
          scheduledDate: Between(now, in24Hours),
          reminder1DaySent: false,
          status: In([
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.AGUARDANDO_CONFIRMACAO,
          ]),
        },
        // Lembrete de 5 horas
        {
          scheduledDate: Between(now, in5Hours),
          reminder5HoursSent: false,
          status: In([
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.AGUARDANDO_CONFIRMACAO,
          ]),
        },
      ],
    });
  }

  /**
   * Marcar lembrete como enviado
   */
  async markReminderSent(id: string, type: '1day' | '5hours'): Promise<void> {
    const field = type === '1day' ? 'reminder1DaySent' : 'reminder5HoursSent';
    await this.appointmentRepo.update(id, { [field]: true });
  }

  /**
   * Criar notificação
   */
  private async createNotification(data: Partial<AppointmentNotification>): Promise<AppointmentNotification> {
    const notification = this.notificationRepo.create({
      ...data,
      channel: NotificationChannel.WHATSAPP,
      status: NotificationStatus.PENDENTE,
    });

    return this.notificationRepo.save(notification);
  }

  /**
   * Atualizar agendamento
   */
  async update(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    const updateData: any = { ...data };
    if (updateData.location) {
      updateData.location = updateData.location as any;
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
  async cancel(id: string, userId: string, reason: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    appointment.status = AppointmentStatus.CANCELADO;
    appointment.canceledAt = new Date();
    appointment.canceledById = userId;
    appointment.cancelReason = reason;

    const saved = await this.appointmentRepo.save(appointment);

    // Cancelar retornos automáticos
    await this.returnRepo.update(
      { appointmentId: id },
      {
        status: ReturnStatus.CANCELADO,
        canceledAt: new Date(),
        canceledById: userId,
        cancelReason: 'Agendamento principal cancelado',
      }
    );

    // Notificar cancelamento
    await this.createNotification({
      appointmentId: id,
      type: NotificationType.CANCELAMENTO,
      recipientPhone: '',
      message: `Agendamento cancelado: ${reason}`,
      tenantId: appointment.tenantId,
    });

    return saved;
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<Appointment | null> {
    return this.appointmentRepo.findOne({
      where: { id },
      relations: ['lead', 'procedure', 'professional', 'returns', 'notifications'],
    });
  }

  /**
   * Listar todos os agendamentos com paginação
   */
  async findAll(
    tenantId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: Appointment[]; total: number }> {
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

export default new AppointmentService();
