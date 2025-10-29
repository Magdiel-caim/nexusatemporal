import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PatientMedicalRecord } from './patient-medical-record.entity';
import { PatientImage } from './patient-image.entity';
import { PatientAppointment } from './patient-appointment.entity';
import { PatientTransaction } from './patient-transaction.entity';

@Entity('patients')
@Index(['tenantId'])
@Index(['name'])
@Index(['cpf'])
@Index(['whatsapp'])
@Index(['email'])
@Index(['status'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 255 })
  @Index()
  tenantId: string;

  // Dados Pessoais
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'varchar', length: 14, nullable: true, unique: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rg: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null; // male/female/other

  @Column({ name: 'skin_color', type: 'varchar', length: 50, nullable: true })
  skinColor: string | null;

  // Contatos
  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string | null;

  @Column({ name: 'emergency_phone', type: 'varchar', length: 20, nullable: true })
  emergencyPhone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // Endereço
  @Column({ name: 'zip_code', type: 'varchar', length: 9, nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  number: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Brasil', nullable: true })
  country: string;

  // Saúde e Convênio
  @Column({ name: 'health_card', type: 'varchar', length: 50, nullable: true })
  healthCard: string | null;

  @Column({ name: 'health_insurance', type: 'varchar', length: 255, nullable: true })
  healthInsurance: string | null;

  @Column({ name: 'health_insurance_number', type: 'varchar', length: 100, nullable: true })
  healthInsuranceNumber: string | null;

  @Column({ name: 'health_insurance_validity', type: 'date', nullable: true })
  healthInsuranceValidity: Date | null;

  @Column({ name: 'health_insurance_holder', type: 'varchar', length: 255, nullable: true })
  healthInsuranceHolder: string | null;

  // Mídia
  @Column({ name: 'profile_photo_url', type: 'text', nullable: true })
  profilePhotoUrl: string | null;

  @Column({ name: 'profile_photo_s3_key', type: 'varchar', length: 500, nullable: true })
  profilePhotoS3Key: string | null;

  // Origem e Status
  @Column({ type: 'varchar', length: 50, default: 'manual' })
  source: string; // prodoctor/manual/lead/import

  @Column({ name: 'source_id', type: 'varchar', length: 100, nullable: true })
  sourceId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  @Index()
  status: string; // active/inactive

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'registration_number', type: 'varchar', length: 50, nullable: true })
  registrationNumber: string | null;

  // Controle
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Relações
  @OneToMany(() => PatientMedicalRecord, (record) => record.patient)
  medicalRecords: PatientMedicalRecord[];

  @OneToMany(() => PatientImage, (image) => image.patient)
  images: PatientImage[];

  @OneToMany(() => PatientAppointment, (appointment) => appointment.patient)
  appointments: PatientAppointment[];

  @OneToMany(() => PatientTransaction, (transaction) => transaction.patient)
  transactions: PatientTransaction[];
}
