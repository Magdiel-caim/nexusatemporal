import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SocialPost } from './social-post.entity';
import { BulkMessage } from './bulk-message.entity';
import { LandingPage } from './landing-page.entity';
import { CampaignMetric } from './campaign-metric.entity';

export enum CampaignType {
  SOCIAL = 'social',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  LANDING_PAGE = 'landing_page',
  MULTI = 'multi',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('marketing_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  type!: CampaignType;

  @Column({ type: 'varchar', length: 50, default: CampaignStatus.DRAFT })
  status!: CampaignStatus;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spent!: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => SocialPost, (post) => post.campaign)
  socialPosts?: SocialPost[];

  @OneToMany(() => BulkMessage, (message) => message.campaign)
  bulkMessages?: BulkMessage[];

  @OneToMany(() => LandingPage, (page) => page.campaign)
  landingPages?: LandingPage[];

  @OneToMany(() => CampaignMetric, (metric) => metric.campaign)
  metrics?: CampaignMetric[];
}
