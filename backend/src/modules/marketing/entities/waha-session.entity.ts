import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WahaSessionStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  SCAN_QR_CODE = 'scan_qr_code',
  WORKING = 'working',
  FAILED = 'failed',
}

@Entity('waha_sessions')
export class WahaSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 50, default: WahaSessionStatus.STOPPED })
  status!: WahaSessionStatus;

  @Column({ type: 'text', nullable: true })
  qrCode?: string;

  @Column({ name: 'waha_server_url', type: 'varchar', length: 255 })
  wahaServerUrl!: string;

  @Column({ name: 'waha_api_key', type: 'varchar', length: 255 })
  wahaApiKey!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Failover configuration
  @Column({ name: 'failover_enabled', type: 'boolean', default: false })
  failoverEnabled!: boolean;

  @Column({ name: 'failover_priority', type: 'int', default: 0 })
  failoverPriority!: number; // Higher = higher priority

  // Sending configuration
  @Column({ name: 'max_messages_per_minute', type: 'int', default: 30 })
  maxMessagesPerMinute!: number;

  @Column({ name: 'min_delay_seconds', type: 'int', default: 1 })
  minDelaySeconds!: number;

  @Column({ name: 'max_delay_seconds', type: 'int', default: 5 })
  maxDelaySeconds!: number;

  // Metadata
  @Column({ type: 'jsonb', default: {} })
  metadata!: {
    wabaId?: string;
    webhookUrl?: string;
    engine?: string; // GOWS, NOWEB, etc
    [key: string]: any;
  };

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'last_connected_at', type: 'timestamp', nullable: true })
  lastConnectedAt?: Date;

  @Column({ name: 'last_error_at', type: 'timestamp', nullable: true })
  lastErrorAt?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
