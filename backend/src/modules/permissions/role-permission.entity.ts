import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Permission } from './permission.entity';
import { UserRole } from '../auth/user.entity';

/**
 * RolePermission Entity
 *
 * Tabela de relacionamento entre roles e permissões.
 * Define quais permissões cada role possui.
 */
@Entity('role_permissions')
@Unique(['role', 'permissionId'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => Permission, permission => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @CreateDateColumn()
  createdAt: Date;
}
