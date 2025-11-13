import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { StockMovement } from './stock-movement.entity';

export enum BatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon', // < 30 dias
  DEPLETED = 'depleted', // Estoque zerado
}

/**
 * Stock Batch Entity
 * Representa um lote específico de produto com data de vencimento
 * Permite rastreabilidade completa do estoque por lote
 */
@Entity('stock_batches')
export class StockBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Produto
  @Column({ type: 'varchar' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Identificação do Lote
  @Column({ type: 'varchar', length: 100 })
  batchNumber: string; // Número do lote (ex: L20240115-001)

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturerBatchNumber: string; // Número do lote do fabricante (se diferente)

  // Datas
  @Column({ type: 'date', nullable: true })
  manufactureDate: Date; // Data de fabricação

  @Column({ type: 'date' })
  expirationDate: Date; // Data de validade

  @Column({ type: 'date', nullable: true })
  receiptDate: Date; // Data de recebimento

  // Quantidade
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number; // Estoque atual deste lote

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialStock: number; // Estoque inicial ao cadastrar o lote

  // Custo/Preço
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number; // Custo unitário deste lote

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number; // Custo total do lote

  // Status
  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.ACTIVE,
  })
  status: BatchStatus;

  // Fornecedor/Origem
  @Column({ type: 'varchar', nullable: true })
  supplierId: string; // Fornecedor deste lote

  @Column({ type: 'varchar', nullable: true })
  invoiceNumber: string; // Número da nota fiscal

  // Localização
  @Column({ type: 'varchar', nullable: true })
  location: string; // Localização física no estoque

  // Observações
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Alertas
  @Column({ type: 'boolean', default: false })
  alertSent: boolean; // Se já foi enviado alerta de vencimento

  @Column({ type: 'timestamp', nullable: true })
  alertSentAt: Date; // Quando foi enviado o alerta

  // Rastreabilidade
  @Column({ type: 'varchar', nullable: true })
  originMovementId: string; // ID da movimentação de entrada que criou este lote

  // Movimentações deste lote
  @OneToMany(() => StockMovement, (movement) => movement.batch)
  movements: StockMovement[];

  // Tenant
  @Column({ type: 'varchar' })
  tenantId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual/Computed fields
  /**
   * Calcula dias até o vencimento
   */
  get daysUntilExpiration(): number {
    const today = new Date();
    const expiration = new Date(this.expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Verifica se o lote está vencido
   */
  get isExpired(): boolean {
    return this.daysUntilExpiration < 0;
  }

  /**
   * Verifica se o lote está próximo do vencimento (< 30 dias)
   */
  get isExpiringSoon(): boolean {
    return this.daysUntilExpiration > 0 && this.daysUntilExpiration <= 30;
  }

  /**
   * Verifica se o lote está zerado
   */
  get isDepleted(): boolean {
    return this.currentStock <= 0;
  }

  /**
   * Atualiza o status automaticamente baseado nas condições
   */
  updateStatus(): void {
    if (this.isDepleted) {
      this.status = BatchStatus.DEPLETED;
    } else if (this.isExpired) {
      this.status = BatchStatus.EXPIRED;
    } else if (this.isExpiringSoon) {
      this.status = BatchStatus.EXPIRING_SOON;
    } else {
      this.status = BatchStatus.ACTIVE;
    }
  }
}
