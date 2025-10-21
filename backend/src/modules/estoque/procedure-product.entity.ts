import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Procedure } from '../leads/procedure.entity';

@Entity('procedure_products')
export class ProcedureProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  procedureId: string;

  @ManyToOne(() => Procedure)
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure;

  @Column({ type: 'varchar' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityUsed: number;

  @Column({ type: 'boolean', default: true })
  isOptional: boolean; // Se é opcional ou obrigatório no procedimento

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
