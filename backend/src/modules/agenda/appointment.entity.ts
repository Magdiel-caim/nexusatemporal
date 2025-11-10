import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Procedure } from '../leads/procedure.entity';
import { User } from '../auth/user.entity';
import { AppointmentReturn } from './appointment-return.entity';
import { AppointmentNotification } from './appointment-notification.entity';

export enum AppointmentStatus {
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
  PAGAMENTO_CONFIRMADO = 'pagamento_confirmado',
  AGUARDANDO_CONFIRMACAO = 'aguardando_confirmacao',
  CONFIRMADO = 'confirmado',
  REAGENDADO = 'reagendado',
  EM_ATENDIMENTO = 'em_atendimento',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
  NAO_COMPARECEU = 'nao_compareceu',
}

export enum PaymentStatus {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  REEMBOLSADO = 'reembolsado',
  CANCELADO = 'cancelado',
}

export enum AnamnesisStatus {
  PENDENTE = 'pendente',
  ENVIADA = 'enviada',
  PREENCHIDA = 'preenchida',
  ASSINADA = 'assinada',
}

export enum AppointmentLocation {
  MOEMA = 'moema',
  AV_PAULISTA = 'av_paulista',
  PERDIZES = 'perdizes',
  ONLINE = 'online',
  A_DOMICILIO = 'a_domicilio',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacionamento com Lead/Paciente
  @Column({ type: 'varchar' })
  leadId: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  // Relacionamento com Procedimento
  @Column({ type: 'varchar' })
  procedureId: string;

  @ManyToOne(() => Procedure)
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure;

  // Múltiplos procedimentos (opcional - para procedimentos combinados)
  @Column({ type: 'json', nullable: true })
  procedureIds: string[];

  // Relacionamento com Profissional (médico/biomédico)
  @Column({ type: 'varchar', nullable: true })
  professionalId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professionalId' })
  professional: User;

  // Data e hora do agendamento
  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  // Duração estimada em minutos
  @Column({ type: 'int', nullable: true })
  estimatedDuration: number;

  // Localização do atendimento
  @Column({
    type: 'enum',
    enum: AppointmentLocation,
    default: AppointmentLocation.MOEMA,
  })
  location: AppointmentLocation;

  // Status do agendamento
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.AGUARDANDO_PAGAMENTO,
  })
  status: AppointmentStatus;

  // Status do pagamento
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDENTE,
  })
  paymentStatus: PaymentStatus;

  // Link ou comprovante de pagamento
  @Column({ type: 'text', nullable: true })
  paymentProof: string;

  // Valor do pagamento
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  paymentAmount: number;

  // Método de pagamento (PIX, Cartão, Débito, Dinheiro)
  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string;

  // Link para pagamento (se aplicável)
  @Column({ type: 'text', nullable: true })
  paymentLink: string;

  // Ficha de anamnese
  @Column({ type: 'text', nullable: true })
  anamnesisFormUrl: string;

  @Column({
    type: 'enum',
    enum: AnamnesisStatus,
    default: AnamnesisStatus.PENDENTE,
  })
  anamnesisStatus: AnamnesisStatus;

  // Data de envio da anamnese
  @Column({ type: 'timestamp', nullable: true })
  anamnesisSentAt: Date;

  // Data de preenchimento da anamnese
  @Column({ type: 'timestamp', nullable: true })
  anamnesisCompletedAt: Date;

  // Data de assinatura da anamnese
  @Column({ type: 'timestamp', nullable: true })
  anamnesisSignedAt: Date;

  // Controle de retornos
  @Column({ type: 'boolean', default: false })
  hasReturn: boolean;

  @Column({ type: 'int', nullable: true })
  returnCount: number; // Quantos retornos

  @Column({ type: 'int', nullable: true })
  returnFrequency: number; // A cada quantos dias (30, 60, 90, 15, etc)

  // Confirmação do paciente
  @Column({ type: 'boolean', default: false })
  confirmedByPatient: boolean;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  // Lembretes enviados
  @Column({ type: 'boolean', default: false })
  reminder1DaySent: boolean;

  @Column({ type: 'boolean', default: false })
  reminder5HoursSent: boolean;

  // Check-in na clínica
  @Column({ type: 'boolean', default: false })
  checkedIn: boolean;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column({ type: 'varchar', nullable: true })
  checkedInBy: string; // ID do usuário que fez o check-in (recepcionista)

  // Informações do atendimento
  @Column({ type: 'timestamp', nullable: true })
  attendanceStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  attendanceEndedAt: Date;

  // Observações do atendimento
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Observações privadas (visíveis apenas para equipe)
  @Column({ type: 'text', nullable: true })
  privateNotes: string;

  // Tenant
  @Column({ type: 'varchar' })
  tenantId: string;

  // Relacionamentos
  @OneToMany(() => AppointmentReturn, (returnAppt) => returnAppt.appointment, {
    cascade: true,
  })
  returns: AppointmentReturn[];

  @OneToMany(
    () => AppointmentNotification,
    (notification) => notification.appointment,
    { cascade: true }
  )
  notifications: AppointmentNotification[];

  // Usuário que criou o agendamento
  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  // Campos de auditoria
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Cancelamento
  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ type: 'varchar', nullable: true })
  canceledById: string;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;
}
