import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../auth/user.entity';
import { PurchaseOrder } from '../financeiro/purchase-order.entity';
import { StockBatch } from './stock-batch.entity';

export enum MovementType {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  DEVOLUCAO = 'devolucao',
  PERDA = 'perda',
  TRANSFERENCIA = 'transferencia',
}

export enum MovementReason {
  COMPRA = 'compra',
  PROCEDIMENTO = 'procedimento',
  AJUSTE_INVENTARIO = 'ajuste_inventario',
  DEVOLUCAO_FORNECEDOR = 'devolucao_fornecedor',
  DEVOLUCAO_CLIENTE = 'devolucao_cliente',
  VENCIMENTO = 'vencimento',
  PERDA = 'perda',
  DANO = 'dano',
  TRANSFERENCIA = 'transferencia',
  OUTRO = 'outro',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.movements)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({
    type: 'enum',
    enum: MovementReason,
  })
  reason: MovementReason;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  // Estoque antes e depois da movimentação
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newStock: number;

  // Referência à ordem de compra (se for entrada)
  @Column({ type: 'varchar', nullable: true })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  // Referência ao prontuário (se for saída por procedimento)
  @Column({ type: 'varchar', nullable: true })
  medicalRecordId: string;

  // Referência ao procedimento (se for saída por procedimento)
  @Column({ type: 'varchar', nullable: true })
  procedureId: string;

  // Número da NF (se tiver)
  @Column({ type: 'varchar', nullable: true })
  invoiceNumber: string;

  // Lote (campo antigo - mantido para compatibilidade)
  @Column({ type: 'varchar', nullable: true })
  batchNumber: string;

  // Referência ao lote (novo sistema de controle)
  @Column({ type: 'varchar', nullable: true })
  batchId: string;

  @ManyToOne(() => StockBatch, (batch) => batch.movements, { nullable: true })
  @JoinColumn({ name: 'batchId' })
  batch: StockBatch;

  // Validade (campo antigo - mantido para compatibilidade)
  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  // Observações
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
