import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../financeiro/supplier.entity';
import { StockMovement } from './stock-movement.entity';

export enum ProductUnit {
  UNIDADE = 'unidade',
  CAIXA = 'caixa',
  FRASCO = 'frasco',
  AMPOLA = 'ampola',
  ML = 'ml',
  G = 'g',
  KG = 'kg',
  LITRO = 'litro',
  METRO = 'metro',
  OUTRO = 'outro',
}

export enum ProductCategory {
  INSUMO = 'insumo',
  MEDICAMENTO = 'medicamento',
  MATERIAL = 'material',
  EQUIPAMENTO = 'equipamento',
  DESCARTAVEL = 'descartavel',
  COSMETICO = 'cosmetico',
  OUTRO = 'outro',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.INSUMO,
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    default: ProductUnit.UNIDADE,
  })
  unit: ProductUnit;

  // Estoque
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumStock: number;

  // Preços
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  // Fornecedor principal
  @Column({ type: 'varchar', nullable: true })
  mainSupplierId: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'mainSupplierId' })
  mainSupplier: Supplier;

  // Localização no estoque
  @Column({ type: 'varchar', nullable: true })
  location: string;

  // Validade
  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  // Lote
  @Column({ type: 'varchar', nullable: true })
  batchNumber: string;

  // Controle
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  trackStock: boolean; // Se deve controlar estoque

  @Column({ type: 'boolean', default: false })
  requiresPrescription: boolean;

  // Alertas
  @Column({ type: 'boolean', default: false })
  hasLowStockAlert: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAlertDate: Date;

  @Column({ type: 'varchar' })
  tenantId: string;

  @OneToMany(() => StockMovement, (movement) => movement.product)
  movements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campo calculado para verificar se está abaixo do estoque mínimo
  get isLowStock(): boolean {
    return this.currentStock <= this.minimumStock;
  }
}
