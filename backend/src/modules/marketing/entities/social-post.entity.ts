import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
}

export enum SocialPostType {
  FEED = 'feed',
  STORY = 'story',
  REEL = 'reel',
  CAROUSEL = 'carousel',
}

export enum SocialPostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
}

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ type: 'varchar', length: 50 })
  platform!: SocialPlatform;

  @Column({ name: 'post_type', type: 'varchar', length: 50, default: SocialPostType.FEED })
  postType!: SocialPostType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'media_urls', type: 'text', array: true, nullable: true })
  mediaUrls?: string[];

  @Column({ name: 'media_type', type: 'varchar', length: 20, nullable: true })
  mediaType?: MediaType;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'varchar', length: 50, default: SocialPostStatus.DRAFT })
  status!: SocialPostStatus;

  @Column({ name: 'platform_post_id', type: 'varchar', length: 255, nullable: true })
  platformPostId?: string;

  @Column({ name: 'platform_url', type: 'text', nullable: true })
  platformUrl?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', default: {} })
  metrics!: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
    reach?: number;
    saves?: number;
    [key: string]: any;
  };

  @Column({ type: 'text', array: true, nullable: true })
  hashtags?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  mentions?: string[];

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Campaign, (campaign) => campaign.socialPosts)
  @JoinColumn({ name: 'campaign_id' })
  campaign?: Campaign;
}
