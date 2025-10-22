import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IntegrationPlatform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  GOOGLE_ADS = 'google_ads',
  GOOGLE_ANALYTICS = 'google_analytics',
  TIKTOK = 'tiktok',
  LINKEDIN = 'linkedin',
  SENDGRID = 'sendgrid',
  RESEND = 'resend',
  WHATSAPP = 'whatsapp',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  ERROR = 'error',
}

@Entity('marketing_integrations')
export class MarketingIntegration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 50 })
  platform!: IntegrationPlatform;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'jsonb', default: {} })
  credentials!: {
    access_token?: string;
    refresh_token?: string;
    api_key?: string;
    api_secret?: string;
    expires_in?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  config!: {
    account_id?: string;
    page_id?: string;
    pixel_id?: string;
    property_id?: string;
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 50, default: IntegrationStatus.ACTIVE })
  status!: IntegrationStatus;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
