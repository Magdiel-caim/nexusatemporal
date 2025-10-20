import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
}

export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
}

@Entity('stock_alerts')
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  suggestedOrderQuantity: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  resolvedBy: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @CreateDateColumn()
  createdAt: Date;
}
