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
import { Stage } from './stage.entity';
import { User } from '../auth/user.entity';
import { Activity } from './activity.entity';
import { Procedure } from './procedure.entity';

export enum LeadSource {
  WEBSITE = 'website',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PHONE = 'phone',
  REFERRAL = 'referral',
  WALK_IN = 'walk_in',
  OTHER = 'other',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadChannel {
  WHATSAPP = 'whatsapp',
  PHONE = 'phone',
  EMAIL = 'email',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WEBSITE = 'website',
  IN_PERSON = 'in_person',
  OTHER = 'other',
}

export enum ClientStatus {
  CONVERSA_INICIADA = 'conversa_iniciada',
  AGENDAMENTO_PENDENTE = 'agendamento_pendente',
  AGENDADO = 'agendado',
  EM_TRATAMENTO = 'em_tratamento',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export enum AttendanceLocation {
  MOEMA = 'moema',
  PERDIZES = 'perdizes',
  ONLINE = 'online',
  A_DOMICILIO = 'a_domicilio',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  phone2: string;

  @Column({ type: 'varchar', nullable: true })
  whatsapp: string;

  @Column({ type: 'varchar', nullable: true })
  neighborhood: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({
    type: 'enum',
    enum: LeadChannel,
    nullable: true,
  })
  channel: LeadChannel;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    nullable: true,
  })
  clientStatus: ClientStatus;

  @Column({
    type: 'enum',
    enum: AttendanceLocation,
    nullable: true,
  })
  attendanceLocation: AttendanceLocation;

  @Column({ type: 'varchar', nullable: true })
  company: string;

  @Column({ type: 'varchar', nullable: true })
  position: string;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar' })
  stageId: string;

  @ManyToOne(() => Stage, (stage) => stage.leads)
  @JoinColumn({ name: 'stageId' })
  stage: Stage;

  @Column({ type: 'varchar', nullable: true })
  procedureId: string;

  @ManyToOne(() => Procedure)
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure;

  @Column({ type: 'varchar', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.OTHER,
  })
  source: LeadSource;

  @Column({
    type: 'enum',
    enum: LeadPriority,
    default: LeadPriority.MEDIUM,
  })
  priority: LeadPriority;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  probability: number; // Probabilidade de conversão (0-100%)

  @Column({ type: 'timestamp', nullable: true })
  expectedCloseDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextFollowUpDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  score: number; // Lead scoring

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Activity, (activity) => activity.lead, { cascade: true })
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  // Integração com módulo de Vendas
  @Column({ type: 'uuid', nullable: true })
  vendedor_id: string;
}
