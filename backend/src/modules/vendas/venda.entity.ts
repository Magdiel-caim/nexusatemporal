import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Vendedor } from './vendedor.entity';
import { Lead } from '../leads/lead.entity';
import { Appointment } from '../agenda/appointment.entity';
import { Procedure } from '../leads/procedure.entity';
import { Transaction } from '../financeiro/transaction.entity';
import { User } from '../auth/user.entity';
import { Comissao } from './comissao.entity';

export enum VendaStatus {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
}

/**
 * Entidade Venda
 *
 * Representa uma venda realizada por um vendedor.
 * Uma venda pode estar vinculada a um Lead, Agendamento e/ou Procedimento.
 * Quando confirmada, gera automaticamente uma Comissão.
 *
 * @example
 * {
 *   id: "uuid",
 *   numeroVenda: "VND-2025-0001",
 *   vendedorId: "vendedor-uuid",
 *   leadId: "lead-uuid",
 *   valorBruto: 5000.00,
 *   desconto: 500.00,
 *   valorLiquido: 4500.00,
 *   percentualComissao: 10.00,
 *   valorComissao: 450.00,
 *   status: "confirmada",
 *   dataVenda: "2025-10-20T10:00:00Z",
 *   dataConfirmacao: "2025-10-20T14:30:00Z"
 * }
 */
@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Número único da venda (auto-gerado)
   * Formato: VND-YYYY-NNNN
   */
  @Column({ type: 'varchar', length: 30, unique: true })
  numeroVenda: string;

  /**
   * Relacionamento com Vendedor
   */
  @Column({ type: 'varchar' })
  vendedorId: string;

  @ManyToOne(() => Vendedor, (vendedor) => vendedor.vendas, { nullable: false })
  @JoinColumn({ name: 'vendedorId' })
  vendedor: Vendedor;

  /**
   * Relacionamento com Lead (cliente)
   */
  @Column({ type: 'varchar', nullable: true })
  leadId: string | null;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead | null;

  /**
   * Relacionamento com Agendamento (opcional)
   */
  @Column({ type: 'varchar', nullable: true })
  appointmentId: string | null;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment | null;

  /**
   * Relacionamento com Procedimento vendido
   */
  @Column({ type: 'varchar', nullable: true })
  procedureId: string | null;

  @ManyToOne(() => Procedure, { nullable: true })
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure | null;

  /**
   * Valores da venda
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorBruto: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  desconto: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorLiquido: number;

  /**
   * Comissão
   * Percentual pode ser diferente do padrão do vendedor
   */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  percentualComissao: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorComissao: number | null;

  /**
   * Datas importantes
   */
  @Column({ type: 'timestamp' })
  dataVenda: Date;

  /**
   * Data de confirmação (quando pagamento foi confirmado)
   * Gatilho para gerar comissão
   */
  @Column({ type: 'timestamp', nullable: true })
  dataConfirmacao: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  dataCancelamento: Date | null;

  /**
   * Status da venda
   */
  @Column({
    type: 'enum',
    enum: VendaStatus,
    default: VendaStatus.PENDENTE,
  })
  status: VendaStatus;

  @Column({ type: 'text', nullable: true })
  motivoCancelamento: string | null;

  /**
   * Relacionamento com Transaction (financeiro)
   */
  @Column({ type: 'varchar', nullable: true })
  transactionId: string | null;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction | null;

  /**
   * Forma de pagamento
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  formaPagamento: string | null;

  /**
   * Observações
   */
  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  /**
   * Metadata adicional (JSONB)
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  /**
   * Tenant ID (multi-tenancy)
   */
  @Column({ type: 'varchar' })
  tenantId: string;

  /**
   * Usuário que criou a venda
   */
  @Column({ type: 'varchar', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  /**
   * Relacionamento com Comissões geradas
   */
  @OneToMany(() => Comissao, (comissao) => comissao.venda)
  comissoes: Comissao[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Gera número da venda automaticamente antes de inserir
   */
  @BeforeInsert()
  async gerarNumeroVenda() {
    if (!this.numeroVenda) {
      // Será implementado no service para buscar último número
      const ano = new Date().getFullYear();
      this.numeroVenda = `VND-${ano}-temp`;
    }

    // Calcula valor líquido se não foi informado
    if (!this.valorLiquido && this.valorBruto) {
      this.valorLiquido = this.valorBruto - (this.desconto || 0);
    }
  }

  /**
   * Verifica se a venda está confirmada
   */
  isConfirmada(): boolean {
    return this.status === VendaStatus.CONFIRMADA && !!this.dataConfirmacao;
  }

  /**
   * Verifica se a venda está cancelada
   */
  isCancelada(): boolean {
    return this.status === VendaStatus.CANCELADA && !!this.dataCancelamento;
  }

  /**
   * Verifica se a venda está pendente
   */
  isPendente(): boolean {
    return this.status === VendaStatus.PENDENTE;
  }

  /**
   * Calcula o valor líquido baseado no bruto e desconto
   */
  calcularValorLiquido(): number {
    return this.valorBruto - (this.desconto || 0);
  }

  /**
   * Retorna JSON formatado
   */
  toJSON() {
    return {
      id: this.id,
      numeroVenda: this.numeroVenda,
      vendedorId: this.vendedorId,
      vendedor: this.vendedor,
      leadId: this.leadId,
      lead: this.lead,
      appointmentId: this.appointmentId,
      procedureId: this.procedureId,
      valorBruto: this.valorBruto,
      desconto: this.desconto,
      valorLiquido: this.valorLiquido,
      percentualComissao: this.percentualComissao,
      valorComissao: this.valorComissao,
      dataVenda: this.dataVenda,
      dataConfirmacao: this.dataConfirmacao,
      dataCancelamento: this.dataCancelamento,
      status: this.status,
      formaPagamento: this.formaPagamento,
      transactionId: this.transactionId,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
