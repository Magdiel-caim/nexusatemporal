import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../auth/user.entity';

export enum InventoryCountStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('inventory_counts')
export class InventoryCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: InventoryCountStatus,
    default: InventoryCountStatus.IN_PROGRESS,
  })
  status: InventoryCountStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'timestamp', nullable: true })
  countDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  tenantId: string;

  @OneToMany(() => InventoryCountItem, (item) => item.inventoryCount, {
    cascade: true,
  })
  items: InventoryCountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum DiscrepancyType {
  SURPLUS = 'SURPLUS', // Sobra (contado > sistema)
  SHORTAGE = 'SHORTAGE', // Falta (contado < sistema)
  MATCH = 'MATCH', // Igual
}

@Entity('inventory_count_items')
export class InventoryCountItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventoryCountId: string;

  @ManyToOne(() => InventoryCount, (count) => count.items)
  @JoinColumn({ name: 'inventoryCountId' })
  inventoryCount: InventoryCount;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  systemStock: number; // Estoque no sistema no momento da contagem

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  countedStock: number; // Estoque contado fisicamente

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  difference: number; // Diferença (contado - sistema)

  @Column({
    type: 'enum',
    enum: DiscrepancyType,
  })
  discrepancyType: DiscrepancyType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  adjusted: boolean; // Se já foi ajustado no estoque

  @Column({ type: 'timestamp', nullable: true })
  adjustedAt: Date;

  @Column({ type: 'uuid' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
