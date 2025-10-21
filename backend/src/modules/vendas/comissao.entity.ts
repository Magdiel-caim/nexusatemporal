import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venda } from './venda.entity';
import { Vendedor } from './vendedor.entity';
import { Transaction } from '../financeiro/transaction.entity';

export enum ComissaoStatus {
  PENDENTE = 'pendente',
  PAGA = 'paga',
  CANCELADA = 'cancelada',
}

/**
 * Entidade Comissao
 *
 * Representa uma comissão gerada a partir de uma venda confirmada.
 * Comissões são agrupadas por mês de competência para relatórios.
 *
 * @example
 * {
 *   id: "uuid",
 *   vendaId: "venda-uuid",
 *   vendedorId: "vendedor-uuid",
 *   valorBaseCalculo: 4500.00,
 *   percentualAplicado: 10.00,
 *   valorComissao: 450.00,
 *   mesCompetencia: 10,
 *   anoCompetencia: 2025,
 *   status: "pendente"
 * }
 */
@Entity('comissoes')
export class Comissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Relacionamento com Venda
   * Uma comissão está sempre vinculada a uma venda
   */
  @Column({ type: 'varchar' })
  vendaId: string;

  @ManyToOne(() => Venda, (venda) => venda.comissoes, { nullable: false })
  @JoinColumn({ name: 'vendaId' })
  venda: Venda;

  /**
   * Relacionamento com Vendedor
   * Facilita consultas diretas por vendedor
   */
  @Column({ type: 'varchar' })
  vendedorId: string;

  @ManyToOne(() => Vendedor, { nullable: false })
  @JoinColumn({ name: 'vendedorId' })
  vendedor: Vendedor;

  /**
   * Valores para cálculo
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorBaseCalculo: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  percentualAplicado: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorComissao: number;

  /**
   * Período de competência
   * Usado para agrupar comissões nos relatórios mensais
   */
  @Column({ type: 'int' })
  mesCompetencia: number; // 1-12

  @Column({ type: 'int' })
  anoCompetencia: number; // 2025

  /**
   * Status da comissão
   */
  @Column({
    type: 'enum',
    enum: ComissaoStatus,
    default: ComissaoStatus.PENDENTE,
  })
  status: ComissaoStatus;

  /**
   * Pagamento da comissão
   */
  @Column({ type: 'timestamp', nullable: true })
  dataPagamento: Date | null;

  /**
   * Relacionamento com Transaction (quando paga)
   */
  @Column({ type: 'varchar', nullable: true })
  transactionId: string | null;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction | null;

  /**
   * Observações
   */
  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  /**
   * Tenant ID (multi-tenancy)
   */
  @Column({ type: 'varchar' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Verifica se a comissão está pendente
   */
  isPendente(): boolean {
    return this.status === ComissaoStatus.PENDENTE;
  }

  /**
   * Verifica se a comissão foi paga
   */
  isPaga(): boolean {
    return this.status === ComissaoStatus.PAGA && !!this.dataPagamento;
  }

  /**
   * Verifica se a comissão foi cancelada
   */
  isCancelada(): boolean {
    return this.status === ComissaoStatus.CANCELADA;
  }

  /**
   * Retorna descrição do período de competência
   */
  getPeriodoCompetencia(): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    return `${meses[this.mesCompetencia - 1]}/${this.anoCompetencia}`;
  }

  /**
   * Retorna JSON formatado
   */
  toJSON() {
    return {
      id: this.id,
      vendaId: this.vendaId,
      venda: this.venda,
      vendedorId: this.vendedorId,
      vendedor: this.vendedor,
      valorBaseCalculo: this.valorBaseCalculo,
      percentualAplicado: this.percentualAplicado,
      valorComissao: this.valorComissao,
      mesCompetencia: this.mesCompetencia,
      anoCompetencia: this.anoCompetencia,
      periodoCompetencia: this.getPeriodoCompetencia(),
      status: this.status,
      dataPagamento: this.dataPagamento,
      transactionId: this.transactionId,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
