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

@Entity('campaign_metrics')
export class CampaignMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform?: string;

  @Column({ name: 'metric_date', type: 'date' })
  metricDate!: Date;

  @Column({ type: 'int', default: 0 })
  impressions!: number;

  @Column({ type: 'int', default: 0 })
  reach!: number;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @Column({ type: 'int', default: 0 })
  engagements!: number;

  @Column({ type: 'int', default: 0 })
  conversions!: number;

  @Column({ type: 'int', default: 0 })
  leads!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spend!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ctr?: number; // click-through rate

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cpc?: number; // cost per click

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cpm?: number; // cost per mille

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cpa?: number; // cost per acquisition

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  roas?: number; // return on ad spend

  @Column({ name: 'raw_data', type: 'jsonb', default: {} })
  rawData!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Campaign, (campaign) => campaign.metrics)
  @JoinColumn({ name: 'campaign_id' })
  campaign?: Campaign;
}
