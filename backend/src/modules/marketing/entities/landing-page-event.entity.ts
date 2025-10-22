import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LandingPage } from './landing-page.entity';

export enum LandingPageEventType {
  VIEW = 'view',
  CLICK = 'click',
  CONVERSION = 'conversion',
  FORM_SUBMIT = 'form_submit',
}

@Entity('landing_page_events')
export class LandingPageEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'landing_page_id', type: 'uuid' })
  landingPageId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: LandingPageEventType;

  @Column({ name: 'visitor_id', type: 'varchar', length: 255, nullable: true })
  visitorId?: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'text', nullable: true })
  referrer?: string;

  @Column({ name: 'utm_source', type: 'varchar', length: 255, nullable: true })
  utmSource?: string;

  @Column({ name: 'utm_medium', type: 'varchar', length: 255, nullable: true })
  utmMedium?: string;

  @Column({ name: 'utm_campaign', type: 'varchar', length: 255, nullable: true })
  utmCampaign?: string;

  @Column({ name: 'utm_term', type: 'varchar', length: 255, nullable: true })
  utmTerm?: string;

  @Column({ name: 'utm_content', type: 'varchar', length: 255, nullable: true })
  utmContent?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => LandingPage, (landingPage) => landingPage.events)
  @JoinColumn({ name: 'landing_page_id' })
  landingPage?: LandingPage;
}
