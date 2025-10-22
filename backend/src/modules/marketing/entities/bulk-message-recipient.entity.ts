import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BulkMessage } from './bulk-message.entity';

export enum RecipientStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('bulk_message_recipients')
export class BulkMessageRecipient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bulk_message_id', type: 'uuid' })
  bulkMessageId!: string;

  @Column({ name: 'recipient_identifier', type: 'varchar', length: 255 })
  recipientIdentifier!: string; // phone, email, or instagram_id

  @Column({ name: 'recipient_name', type: 'varchar', length: 255, nullable: true })
  recipientName?: string;

  @Column({ type: 'varchar', length: 50, default: RecipientStatus.PENDING })
  status!: RecipientStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt?: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'platform_message_id', type: 'varchar', length: 255, nullable: true })
  platformMessageId?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => BulkMessage, (bulkMessage) => bulkMessage.recipientTracking)
  @JoinColumn({ name: 'bulk_message_id' })
  bulkMessage?: BulkMessage;
}
