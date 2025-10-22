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

export enum ContactStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CLICKED = 'clicked',
}

@Entity('bulk_message_contacts')
export class BulkMessageContact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'bulk_message_id', type: 'uuid' })
  bulkMessageId!: string;

  @ManyToOne(() => BulkMessage)
  @JoinColumn({ name: 'bulk_message_id' })
  bulkMessage!: BulkMessage;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 50, default: ContactStatus.PENDING })
  status!: ContactStatus;

  @Column({ name: 'personalized_content', type: 'text', nullable: true })
  personalizedContent?: string;

  @Column({ name: 'waha_message_id', type: 'varchar', length: 255, nullable: true })
  wahaMessageId?: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt?: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: {
    sessionName?: string;
    mediaUrl?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
