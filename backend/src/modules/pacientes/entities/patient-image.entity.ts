import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { PatientMedicalRecord } from './patient-medical-record.entity';

@Entity('patient_images')
@Index(['patientId'])
@Index(['tenantId'])
@Index(['type'])
export class PatientImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'medical_record_id', type: 'uuid', nullable: true })
  medicalRecordId: string | null;

  @Column({ length: 20 })
  type: string; // before/after/profile/document/procedure

  @Column({ length: 50, nullable: true })
  category: string | null;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 's3_key', length: 500 })
  s3Key: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'thumbnail_s3_key', length: 500, nullable: true })
  thumbnailS3Key: string | null;

  @Column({ length: 255, nullable: true })
  filename: string | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'procedure_name', length: 255, nullable: true })
  procedureName: string | null;

  @Column({ name: 'taken_at', type: 'date', nullable: true })
  takenAt: Date | null;

  @Column({ name: 'paired_image_id', type: 'uuid', nullable: true })
  pairedImageId: string | null;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Patient, (patient) => patient.images)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => PatientMedicalRecord, (record) => record.images)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: PatientMedicalRecord | null;
}
