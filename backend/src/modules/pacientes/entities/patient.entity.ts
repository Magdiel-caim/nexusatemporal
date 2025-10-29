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

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  // Dados Pessoais
  @Column()
  name: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ length: 14, nullable: true, unique: true })
  cpf: string | null;

  @Column({ length: 20, nullable: true })
  rg: string | null;

  @Column({ length: 10, nullable: true })
  gender: string | null; // male/female/other

  @Column({ name: 'skin_color', length: 50, nullable: true })
  skinColor: string | null;

  // Contatos
  @Column({ length: 20, nullable: true })
  whatsapp: string | null;

  @Column({ name: 'emergency_phone', length: 20, nullable: true })
  emergencyPhone: string | null;

  @Column({ length: 255, nullable: true })
  email: string | null;

  // Endereço
  @Column({ name: 'zip_code', length: 9, nullable: true })
  zipCode: string | null;

  @Column({ length: 255, nullable: true })
  street: string | null;

  @Column({ length: 20, nullable: true })
  number: string | null;

  @Column({ length: 100, nullable: true })
  complement: string | null;

  @Column({ length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ length: 2, nullable: true })
  state: string | null;

  @Column({ length: 50, default: 'Brasil', nullable: true })
  country: string;

  // Saúde e Convênio
  @Column({ name: 'health_card', length: 50, nullable: true })
  healthCard: string | null;

  @Column({ name: 'health_insurance', length: 255, nullable: true })
  healthInsurance: string | null;

  @Column({ name: 'health_insurance_number', length: 100, nullable: true })
  healthInsuranceNumber: string | null;

  @Column({ name: 'health_insurance_validity', type: 'date', nullable: true })
  healthInsuranceValidity: Date | null;

  @Column({ name: 'health_insurance_holder', length: 255, nullable: true })
  healthInsuranceHolder: string | null;

  // Mídia
  @Column({ name: 'profile_photo_url', type: 'text', nullable: true })
  profilePhotoUrl: string | null;

  @Column({ name: 'profile_photo_s3_key', length: 500, nullable: true })
  profilePhotoS3Key: string | null;

  // Origem e Status
  @Column({ length: 50, default: 'manual' })
  source: string; // prodoctor/manual/lead/import

  @Column({ name: 'source_id', length: 100, nullable: true })
  sourceId: string | null;

  @Column({ length: 20, default: 'active' })
  @Index()
  status: string; // active/inactive

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'registration_number', length: 50, nullable: true })
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
