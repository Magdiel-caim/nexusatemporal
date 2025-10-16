import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { User } from '../auth/user.entity';

export enum PurchaseOrderStatus {
  ORCAMENTO = 'orcamento',
  APROVADO = 'aprovado',
  PEDIDO_REALIZADO = 'pedido_realizado',
  EM_TRANSITO = 'em_transito',
  RECEBIDO = 'recebido',
  PARCIALMENTE_RECEBIDO = 'parcialmente_recebido',
  CANCELADO = 'cancelado',
}

export enum PurchaseOrderPriority {
  BAIXA = 'baixa',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  orderNumber: string;

  @Column({ type: 'varchar' })
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.ORCAMENTO,
  })
  status: PurchaseOrderStatus;

  @Column({
    type: 'enum',
    enum: PurchaseOrderPriority,
    default: PurchaseOrderPriority.NORMAL,
  })
  priority: PurchaseOrderPriority;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount: number;

  @Column({ type: 'jsonb' })
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity?: number;
    sku?: string;
    category?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: 'nf' | 'orcamento' | 'pedido' | 'danfe' | 'outro';
    filename: string;
    url: string;
    uploadedAt: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ type: 'varchar', nullable: true })
  trackingCode: string;

  @Column({ type: 'varchar', nullable: true })
  carrier: string; // Transportadora

  @Column({ type: 'varchar', nullable: true })
  nfeNumber: string; // Número da Nota Fiscal Eletrônica

  @Column({ type: 'varchar', nullable: true })
  nfeKey: string; // Chave de acesso da NFe

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

  @Column({ type: 'varchar', nullable: true })
  receivedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receivedById' })
  receivedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ type: 'varchar', nullable: true })
  canceledById: string;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
