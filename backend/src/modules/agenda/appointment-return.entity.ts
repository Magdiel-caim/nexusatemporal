import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { User } from '../auth/user.entity';

export enum ReturnStatus {
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  REAGENDADO = 'reagendado',
  EM_ATENDIMENTO = 'em_atendimento',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
  NAO_COMPARECEU = 'nao_compareceu',
}

@Entity('appointment_returns')
export class AppointmentReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacionamento com agendamento original
  @Column({ type: 'varchar' })
  appointmentId: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.returns)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  // Número do retorno (1, 2, 3, 4...)
  @Column({ type: 'int' })
  returnNumber: number;

  // Data e hora agendada
  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  // Data original (para rastrear reagendamentos)
  @Column({ type: 'timestamp', nullable: true })
  originalScheduledDate: Date;

  // Status do retorno
  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.AGENDADO,
  })
  status: ReturnStatus;

  // Confirmação do paciente
  @Column({ type: 'boolean', default: false })
  confirmedByPatient: boolean;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  // Lembretes enviados
  @Column({ type: 'boolean', default: false })
  reminder1DaySent: boolean;

  @Column({ type: 'boolean', default: false })
  reminder1WeekSent: boolean; // 1 semana antes (conforme especificação)

  // Check-in na clínica
  @Column({ type: 'boolean', default: false })
  checkedIn: boolean;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt: Date;

  // Informações do atendimento
  @Column({ type: 'timestamp', nullable: true })
  attendanceStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  attendanceEndedAt: Date;

  // Profissional que atenderá
  @Column({ type: 'varchar', nullable: true })
  professionalId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professionalId' })
  professional: User;

  // Localização do atendimento
  @Column({ type: 'varchar', nullable: true })
  location: string;

  // Observações
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Tenant
  @Column({ type: 'varchar' })
  tenantId: string;

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
