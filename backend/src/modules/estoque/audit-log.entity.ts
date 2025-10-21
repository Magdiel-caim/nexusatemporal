import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ADJUST = 'ADJUST',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

export enum AuditEntityType {
  PRODUCT = 'PRODUCT',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
  INVENTORY_COUNT = 'INVENTORY_COUNT',
  INVENTORY_COUNT_ITEM = 'INVENTORY_COUNT_ITEM',
  STOCK_ALERT = 'STOCK_ALERT',
  PROCEDURE_PRODUCT = 'PROCEDURE_PRODUCT',
}

@Entity('stock_audit_logs')
export class StockAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}
