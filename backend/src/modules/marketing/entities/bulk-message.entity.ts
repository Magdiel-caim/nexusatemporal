import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { BulkMessageRecipient } from './bulk-message-recipient.entity';

export enum BulkMessagePlatform {
  WHATSAPP = 'whatsapp',
  INSTAGRAM_DM = 'instagram_dm',
  EMAIL = 'email',
}

export enum BulkMessageType {
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  NOTIFICATION = 'notification',
}

export enum BulkMessageStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('bulk_messages')
export class BulkMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ type: 'varchar', length: 50 })
  platform!: BulkMessagePlatform;

  @Column({ name: 'message_type', type: 'varchar', length: 50, default: BulkMessageType.MARKETING })
  messageType!: BulkMessageType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string; // for emails

  @Column({ name: 'template_id', type: 'varchar', length: 255, nullable: true })
  templateId?: string;

  @Column({ name: 'template_name', type: 'varchar', length: 255, nullable: true })
  templateName?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'media_urls', type: 'text', array: true, nullable: true })
  mediaUrls?: string[];

  @Column({ type: 'jsonb', default: [] })
  recipients!: Array<{
    phone?: string;
    email?: string;
    instagram_id?: string;
    name?: string;
    vars?: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', default: {} })
  variables!: Record<string, any>;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'varchar', length: 50, default: BulkMessageStatus.DRAFT })
  status!: BulkMessageStatus;

  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients!: number;

  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount!: number;

  @Column({ name: 'delivered_count', type: 'int', default: 0 })
  deliveredCount!: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount!: number;

  @Column({ name: 'opened_count', type: 'int', default: 0 })
  openedCount!: number;

  @Column({ name: 'clicked_count', type: 'int', default: 0 })
  clickedCount!: number;

  @Column({ name: 'bounced_count', type: 'int', default: 0 })
  bouncedCount!: number;

  @Column({ name: 'unsubscribed_count', type: 'int', default: 0 })
  unsubscribedCount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost!: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Campaign, (campaign) => campaign.bulkMessages)
  @JoinColumn({ name: 'campaign_id' })
  campaign?: Campaign;

  @OneToMany(() => BulkMessageRecipient, (recipient) => recipient.bulkMessage)
  recipientTracking?: BulkMessageRecipient[];
}
