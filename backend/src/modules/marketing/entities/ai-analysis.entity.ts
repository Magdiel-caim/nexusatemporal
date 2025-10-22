import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AIProvider {
  GROQ = 'groq',
  OPENROUTER = 'openrouter',
  DEEPSEEK = 'deepseek',
  MISTRAL = 'mistral',
  QWEN = 'qwen',
  OLLAMA = 'ollama',
}

export enum AnalysisType {
  SENTIMENT = 'sentiment',
  OPTIMIZATION = 'optimization',
  PREDICTION = 'prediction',
  IMAGE_GEN = 'image_gen',
  COPYWRITING = 'copywriting',
  AB_TEST = 'ab_test',
}

export enum RelatedType {
  CAMPAIGN = 'campaign',
  POST = 'post',
  MESSAGE = 'message',
  LANDING_PAGE = 'landing_page',
  GENERAL = 'general',
}

@Entity('ai_analyses')
export class AIAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'related_type', type: 'varchar', length: 50, nullable: true })
  relatedType?: RelatedType;

  @Column({ name: 'related_id', type: 'uuid', nullable: true })
  relatedId?: string;

  @Column({ name: 'ai_provider', type: 'varchar', length: 100 })
  aiProvider!: AIProvider;

  @Column({ name: 'ai_model', type: 'varchar', length: 100 })
  aiModel!: string;

  @Column({ name: 'analysis_type', type: 'varchar', length: 50 })
  analysisType!: AnalysisType;

  @Column({ name: 'input_data', type: 'jsonb', default: {} })
  inputData!: Record<string, any>;

  @Column({ name: 'output_data', type: 'jsonb', default: {} })
  outputData!: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  suggestions?: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  score?: number; // 0.00-1.00

  @Column({ name: 'tokens_used', type: 'int', nullable: true })
  tokensUsed?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  cost?: number;

  @Column({ name: 'processing_time_ms', type: 'int', nullable: true })
  processingTimeMs?: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
