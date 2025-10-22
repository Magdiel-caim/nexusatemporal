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
import { LandingPageEvent } from './landing-page-event.entity';

export enum LandingPageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('landing_pages')
export class LandingPage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string;

  @Column({ name: 'html_content', type: 'text', nullable: true })
  htmlContent?: string;

  @Column({ name: 'css_content', type: 'text', nullable: true })
  cssContent?: string;

  @Column({ name: 'js_content', type: 'text', nullable: true })
  jsContent?: string;

  @Column({ name: 'grapesjs_data', type: 'jsonb', default: {} })
  grapesjsData!: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: LandingPageStatus.DRAFT })
  status!: LandingPageStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount!: number;

  @Column({ name: 'unique_visitors', type: 'int', default: 0 })
  uniqueVisitors!: number;

  @Column({ name: 'conversions_count', type: 'int', default: 0 })
  conversionsCount!: number;

  @Column({ name: 'bounce_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  bounceRate?: number;

  @Column({ name: 'avg_time_on_page', type: 'int', nullable: true })
  avgTimeOnPage?: number; // seconds

  // SEO
  @Column({ name: 'seo_title', type: 'varchar', length: 255, nullable: true })
  seoTitle?: string;

  @Column({ name: 'seo_description', type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ name: 'seo_keywords', type: 'text', array: true, nullable: true })
  seoKeywords?: string[];

  @Column({ name: 'og_image', type: 'varchar', length: 500, nullable: true })
  ogImage?: string;

  @Column({ name: 'og_title', type: 'varchar', length: 255, nullable: true })
  ogTitle?: string;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription?: string;

  // Settings
  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Campaign, (campaign) => campaign.landingPages)
  @JoinColumn({ name: 'campaign_id' })
  campaign?: Campaign;

  @OneToMany(() => LandingPageEvent, (event) => event.landingPage)
  events?: LandingPageEvent[];
}
