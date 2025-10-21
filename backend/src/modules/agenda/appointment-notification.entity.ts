import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentReturn } from './appointment-return.entity';

export enum NotificationType {
  AGENDAMENTO_CRIADO = 'agendamento_criado',
  PAGAMENTO_LINK = 'pagamento_link',
  PAGAMENTO_CONFIRMADO = 'pagamento_confirmado',
  ANAMNESE_ENVIADA = 'anamnese_enviada',
  LEMBRETE_1_DIA = 'lembrete_1_dia',
  LEMBRETE_5_HORAS = 'lembrete_5_horas',
  CONFIRMACAO_SOLICITADA = 'confirmacao_solicitada',
  CONFIRMACAO_RECEBIDA = 'confirmacao_recebida',
  REAGENDAMENTO_CONFIRMADO = 'reagendamento_confirmado',
  CANCELAMENTO = 'cancelamento',
  RETORNO_1_SEMANA = 'retorno_1_semana',
  RETORNO_CONFIRMADO = 'retorno_confirmado',
  ATENDIMENTO_FINALIZADO = 'atendimento_finalizado',
}

export enum NotificationStatus {
  PENDENTE = 'pendente',
  ENVIADA = 'enviada',
  ENTREGUE = 'entregue',
  LIDA = 'lida',
  FALHA = 'falha',
  ERRO = 'erro',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

@Entity('appointment_notifications')
export class AppointmentNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacionamento com agendamento
  @Column({ type: 'varchar', nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.notifications)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  // Relacionamento com retorno (se aplicável)
  @Column({ type: 'varchar', nullable: true })
  appointmentReturnId: string;

  @ManyToOne(() => AppointmentReturn)
  @JoinColumn({ name: 'appointmentReturnId' })
  appointmentReturn: AppointmentReturn;

  // Tipo de notificação
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  // Canal de envio
  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.WHATSAPP,
  })
  channel: NotificationChannel;

  // Status da notificação
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDENTE,
  })
  status: NotificationStatus;

  // Destinatário
  @Column({ type: 'varchar' })
  recipientPhone: string;

  @Column({ type: 'varchar', nullable: true })
  recipientEmail: string;

  @Column({ type: 'varchar', nullable: true })
  recipientName: string;

  // Conteúdo da mensagem
  @Column({ type: 'text' })
  message: string;

  // Template usado (se aplicável)
  @Column({ type: 'varchar', nullable: true })
  templateName: string;

  // Variáveis do template
  @Column({ type: 'jsonb', nullable: true })
  templateVariables: Record<string, any>;

  // Dados da resposta do serviço de envio
  @Column({ type: 'jsonb', nullable: true })
  deliveryData: Record<string, any>;

  // ID da mensagem no serviço externo (WhatsApp, etc)
  @Column({ type: 'varchar', nullable: true })
  externalMessageId: string;

  // Data de envio
  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  // Data de entrega
  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  // Data de leitura
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  // Data de falha
  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  // Motivo da falha
  @Column({ type: 'text', nullable: true })
  failureReason: string;

  // Número de tentativas
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  // Última tentativa
  @Column({ type: 'timestamp', nullable: true })
  lastRetryAt: Date;

  // Tenant
  @Column({ type: 'varchar' })
  tenantId: string;

  // Data de criação
  @CreateDateColumn()
  createdAt: Date;
}
