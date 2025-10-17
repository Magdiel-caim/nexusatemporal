import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

/**
 * Permission Entity
 *
 * Representa uma permissão granular do sistema.
 * Cada permissão é uma ação específica que pode ser realizada em um módulo.
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // Ex: 'leads.create', 'financial.view_all'

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  module: string; // Ex: 'leads', 'financial', 'users'

  @Column({ type: 'varchar', length: 50 })
  action: string; // Ex: 'create', 'read', 'update', 'delete'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];
}
