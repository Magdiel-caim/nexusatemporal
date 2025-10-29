import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('patient_migration_log')
@Index(['tenantId'])
@Index(['batchNumber'])
export class PatientMigrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'batch_number', type: 'int' })
  batchNumber: number;

  @Column({ name: 'source_system', length: 50 })
  sourceSystem: string;

  @Column({ name: 'source_patient_id', length: 100, nullable: true })
  sourcePatientId: string | null;

  @Column({ name: 'target_patient_id', type: 'uuid', nullable: true })
  targetPatientId: string | null;

  @Column({ length: 20 })
  status: string; // success/error/skipped

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'migrated_fields', type: 'jsonb', nullable: true })
  migratedFields: Record<string, any> | null;

  @CreateDateColumn({ name: 'migrated_at' })
  migratedAt: Date;

  @Column({ name: 'migrated_by', type: 'uuid', nullable: true })
  migratedBy: string | null;
}
