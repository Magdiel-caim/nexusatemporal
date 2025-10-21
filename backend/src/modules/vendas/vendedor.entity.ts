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
import { User } from '../auth/user.entity';
import { Venda } from './venda.entity';

export enum TipoComissao {
  PERCENTUAL = 'percentual',
  FIXO = 'fixo',
  MISTO = 'misto',
}

/**
 * Entidade Vendedor
 *
 * Representa um vendedor no sistema com suas configurações de comissionamento.
 * Um vendedor está vinculado a um usuário do sistema.
 *
 * @example
 * {
 *   id: "uuid",
 *   codigoVendedor: "VND-0001",
 *   userId: "user-uuid",
 *   percentualComissaoPadrao: 10.00, // 10%
 *   tipoComissao: "percentual",
 *   metaMensal: 50000.00,
 *   ativo: true
 * }
 */
@Entity('vendedores')
export class Vendedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Código único do vendedor (auto-gerado)
   * Formato: VND-0001, VND-0002, etc.
   */
  @Column({ type: 'varchar', length: 20, unique: true })
  codigoVendedor: string;

  /**
   * Relacionamento com User
   * Um vendedor é sempre um usuário do sistema
   */
  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Percentual de comissão padrão (em decimais)
   * Exemplo: 10.00 = 10%, 5.50 = 5.5%
   */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  percentualComissaoPadrao: number;

  /**
   * Tipo de comissionamento
   */
  @Column({
    type: 'enum',
    enum: TipoComissao,
    default: TipoComissao.PERCENTUAL,
  })
  tipoComissao: TipoComissao;

  /**
   * Valor fixo de comissão (se tipoComissao = 'fixo' ou 'misto')
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorFixoComissao: number | null;

  /**
   * Meta mensal de vendas (em reais)
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  metaMensal: number | null;

  /**
   * Status do vendedor
   */
  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  /**
   * Data de início como vendedor
   */
  @Column({ type: 'date' })
  dataInicio: Date;

  /**
   * Data de término (se inativo)
   */
  @Column({ type: 'date', nullable: true })
  dataFim: Date | null;

  /**
   * Observações sobre o vendedor
   */
  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  /**
   * Tenant ID (multi-tenancy)
   */
  @Column({ type: 'varchar' })
  tenantId: string;

  /**
   * Relacionamento com Vendas
   */
  @OneToMany(() => Venda, (venda) => venda.vendedor)
  vendas: Venda[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Gera código do vendedor automaticamente antes de inserir
   */
  @BeforeInsert()
  async gerarCodigoVendedor() {
    if (!this.codigoVendedor) {
      // Será implementado no service para buscar último número
      // Formato: VND-YYYY-NNNN
      const ano = new Date().getFullYear();
      this.codigoVendedor = `VND-${ano}-temp`;
    }
  }

  /**
   * Calcula comissão baseada em um valor
   *
   * @param valorVenda - Valor da venda
   * @returns Valor da comissão calculada
   */
  calcularComissao(valorVenda: number): number {
    switch (this.tipoComissao) {
      case TipoComissao.PERCENTUAL:
        return (valorVenda * this.percentualComissaoPadrao) / 100;

      case TipoComissao.FIXO:
        return this.valorFixoComissao || 0;

      case TipoComissao.MISTO:
        const percentual = (valorVenda * this.percentualComissaoPadrao) / 100;
        const fixo = this.valorFixoComissao || 0;
        return percentual + fixo;

      default:
        return 0;
    }
  }

  /**
   * Retorna JSON sem campos sensíveis
   */
  toJSON() {
    return {
      id: this.id,
      codigoVendedor: this.codigoVendedor,
      userId: this.userId,
      user: this.user,
      percentualComissaoPadrao: this.percentualComissaoPadrao,
      tipoComissao: this.tipoComissao,
      valorFixoComissao: this.valorFixoComissao,
      metaMensal: this.metaMensal,
      ativo: this.ativo,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
