import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

/**
 * AuditLog Entity
 *
 * Registra todas as ações sensíveis realizadas no sistema.
 * Usado para auditoria, compliance e segurança.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'tenant_id', type: 'varchar', nullable: true })
  tenantId: string | null;

  @Column({ type: 'varchar', length: 100 })
  action: string; // Ex: 'create', 'update', 'delete', 'approve', 'cancel'

  @Column({ type: 'varchar', length: 50 })
  module: string; // Ex: 'leads', 'financial', 'users', 'records'

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string | null; // Ex: 'Lead', 'Transaction', 'User'

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: Record<string, any> | null;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: Record<string, any> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
