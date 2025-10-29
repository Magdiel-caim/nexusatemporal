import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('tenant_s3_configs')
@Index(['tenantId'], { unique: true })
export class TenantS3Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @Column()
  endpoint: string;

  @Column({ name: 'access_key_id', type: 'text' })
  accessKeyId: string; // Criptografado

  @Column({ name: 'secret_access_key', type: 'text' })
  secretAccessKey: string; // Criptografado

  @Column({ name: 'bucket_name' })
  bucketName: string;

  @Column({ default: 'us-east-1' })
  region: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
