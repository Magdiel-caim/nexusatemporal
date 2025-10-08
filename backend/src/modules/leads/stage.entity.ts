import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { Lead } from './lead.entity';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  pipelineId: string;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipelineId' })
  pipeline: Pipeline;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  probability: number; // Probabilidade de conversão (0-100%)

  @Column({ type: 'boolean', default: false })
  isWon: boolean; // Estágio de vitória

  @Column({ type: 'boolean', default: false })
  isLost: boolean; // Estágio de perda

  @OneToMany(() => Lead, (lead) => lead.stage)
  leads: Lead[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
