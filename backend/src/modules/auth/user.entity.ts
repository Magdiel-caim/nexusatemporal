import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcryptjs';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  SUPER_ADMIN = 'super_admin', // Compatibilidade
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager', // Compatibilidade - equivalente a OWNER
  USER = 'user',
  RECEPTIONIST = 'receptionist', // Compatibilidade - equivalente a USER
  PROFESSIONAL = 'professional',
  DOCTOR = 'doctor', // Compatibilidade - equivalente a PROFESSIONAL
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true, type: 'varchar' })
  tenantId: string | null;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @Column({ default: false, type: 'boolean' })
  emailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken: string | null;

  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any> | null;

  @Column({ nullable: true, type: 'timestamp' })
  lastLoginAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  lastLoginIp: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Accept both $2a$ (bcryptjs) and $2y$ (bcrypt) formats
    const isAlreadyHashed = this.password && (
      this.password.startsWith('$2a$') ||
      this.password.startsWith('$2y$') ||
      this.password.startsWith('$2b$')
    );

    if (this.password && !isAlreadyHashed) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      this.password = await bcrypt.hash(this.password, rounds);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const { password, refreshToken, emailVerificationToken, passwordResetToken, ...user } = this;
    return user;
  }
}
