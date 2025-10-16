import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Appointment } from '../agenda/appointment.entity';
import { Procedure } from '../leads/procedure.entity';
import { User } from '../auth/user.entity';
import { Supplier } from './supplier.entity';

export enum TransactionType {
  RECEITA = 'receita',
  DESPESA = 'despesa',
  TRANSFERENCIA = 'transferencia',
}

export enum TransactionCategory {
  // RECEITAS
  PROCEDIMENTO = 'procedimento',
  CONSULTA = 'consulta',
  RETORNO = 'retorno',
  PRODUTO = 'produto',
  OUTROS_RECEITAS = 'outros_receitas',

  // DESPESAS
  SALARIO = 'salario',
  FORNECEDOR = 'fornecedor',
  ALUGUEL = 'aluguel',
  ENERGIA = 'energia',
  AGUA = 'agua',
  INTERNET = 'internet',
  TELEFONE = 'telefone',
  MARKETING = 'marketing',
  MATERIAL_ESCRITORIO = 'material_escritorio',
  MATERIAL_MEDICO = 'material_medico',
  IMPOSTOS = 'impostos',
  MANUTENCAO = 'manutencao',
  CONTABILIDADE = 'contabilidade',
  SOFTWARE = 'software',
  LIMPEZA = 'limpeza',
  SEGURANCA = 'seguranca',
  OUTROS_DESPESAS = 'outros_despesas',
}

export enum PaymentMethod {
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  LINK_PAGAMENTO = 'link_pagamento',
  TRANSFERENCIA_BANCARIA = 'transferencia_bancaria',
  BOLETO = 'boleto',
  CHEQUE = 'cheque',
}

export enum TransactionStatus {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  ESTORNADA = 'estornada',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDENTE,
  })
  status: TransactionStatus;

  // Relacionamentos
  @Column({ type: 'varchar', nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'varchar', nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ type: 'varchar', nullable: true })
  procedureId: string;

  @ManyToOne(() => Procedure, { nullable: true })
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure;

  @Column({ type: 'varchar', nullable: true })
  supplierId: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  // Datas
  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'date' })
  referenceDate: Date;

  // Comprovantes e anexos
  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: 'nf' | 'recibo' | 'comprovante' | 'outro';
    filename: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Observações
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Parcelamento
  @Column({ type: 'boolean', default: false })
  isInstallment: boolean;

  @Column({ type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ type: 'int', nullable: true })
  totalInstallments: number;

  @Column({ type: 'varchar', nullable: true })
  parentTransactionId: string;

  // Recorrência
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', nullable: true })
  recurringFrequency: string;

  @Column({ type: 'varchar', nullable: true })
  recurringGroupId: string;

  // Tenant e auditoria
  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'varchar', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
