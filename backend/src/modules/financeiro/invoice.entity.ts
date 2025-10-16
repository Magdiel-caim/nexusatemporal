import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Lead } from '../leads/lead.entity';
import { User } from '../auth/user.entity';

export enum InvoiceType {
  RECIBO = 'recibo',
  NOTA_FISCAL = 'nota_fiscal',
  NOTA_SERVICO = 'nota_servico',
}

export enum InvoiceStatus {
  RASCUNHO = 'rascunho',
  EMITIDA = 'emitida',
  ENVIADA = 'enviada',
  CANCELADA = 'cancelada',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.RECIBO,
  })
  type: InvoiceType;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.RASCUNHO,
  })
  status: InvoiceStatus;

  @Column({ type: 'varchar' })
  transactionId: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'varchar', nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', nullable: true })
  pdfUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'varchar', nullable: true })
  sentTo: string; // Email ou telefone

  @Column({ type: 'varchar', nullable: true })
  sentMethod: string; // 'email', 'whatsapp', 'manual'

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  issuedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'issuedById' })
  issuedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
