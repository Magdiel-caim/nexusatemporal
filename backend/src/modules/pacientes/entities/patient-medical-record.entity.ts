import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Patient } from './patient.entity';
import { PatientImage } from './patient-image.entity';

@Entity('patient_medical_records')
@Index(['patientId'])
@Index(['tenantId'])
@Index(['serviceDate'])
export class PatientMedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 255 })
  tenantId: string;

  // Data do atendimento
  @Column({ name: 'service_date', type: 'date' })
  serviceDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty: string | null;

  // Anamnese
  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint: string | null;

  @Column({ name: 'history_present_illness', type: 'text', nullable: true })
  historyPresentIllness: string | null;

  @Column({ name: 'past_medical_history', type: 'text', nullable: true })
  pastMedicalHistory: string | null;

  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  @Column({ type: 'text', nullable: true })
  medications: string | null;

  @Column({ name: 'family_history', type: 'text', nullable: true })
  familyHistory: string | null;

  @Column({ name: 'social_history', type: 'text', nullable: true })
  socialHistory: string | null;

  // Exame Físico
  @Column({ name: 'physical_examination', type: 'text', nullable: true })
  physicalExamination: string | null;

  @Column({ name: 'vital_signs', type: 'jsonb', nullable: true })
  vitalSigns: Record<string, any> | null;

  // Diagnóstico e Tratamento
  @Column({ type: 'text', nullable: true })
  diagnosis: string | null;

  @Column({ name: 'treatment_plan', type: 'text', nullable: true })
  treatmentPlan: string | null;

  @Column({ type: 'text', nullable: true })
  prescriptions: string | null;

  // Evolução (migrado do ProDoctor)
  @Column({ name: 'evolution_text', type: 'text', nullable: true })
  evolutionText: string | null;

  // Anexos e Documentos
  @Column({ type: 'jsonb', nullable: true })
  documents: Record<string, any>[] | null;

  // Assinatura digital
  @Column({ name: 'signature_url', type: 'text', nullable: true })
  signatureUrl: string | null;

  @Column({ name: 'signature_s3_key', type: 'varchar', length: 500, nullable: true })
  signatureS3Key: string | null;

  @Column({ name: 'signed_at', type: 'timestamp', nullable: true })
  signedAt: Date | null;

  @Column({ name: 'signed_by', type: 'uuid', nullable: true })
  signedBy: string | null;

  // Metadata
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Revisão
  @Column({ name: 'revision_number', type: 'int', default: 1 })
  revisionNumber: number;

  @Column({ name: 'revised_at', type: 'timestamp', nullable: true })
  revisedAt: Date | null;

  @Column({ name: 'revised_by', type: 'uuid', nullable: true })
  revisedBy: string | null;

  // Relações
  @ManyToOne(() => Patient, (patient) => patient.medicalRecords)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => PatientImage, (image) => image.medicalRecord)
  images: PatientImage[];
}
