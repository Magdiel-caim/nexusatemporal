import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { User } from '../auth/user.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'record_number', unique: true, type: 'varchar' })
  recordNumber: string;

  @Column({ name: 'lead_id', type: 'uuid' })
  leadId: string;

  // Informações Pessoais
  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  cpf?: string;

  @Column({ type: 'varchar', nullable: true })
  rg?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ name: 'zip_code', type: 'varchar', nullable: true })
  zipCode?: string;

  // Informações Médicas
  @Column({ name: 'blood_type', type: 'varchar', nullable: true })
  bloodType?: string;

  @Column({ type: 'text', array: true, nullable: true })
  allergies?: string[];

  @Column({ name: 'chronic_diseases', type: 'text', array: true, nullable: true })
  chronicDiseases?: string[];

  @Column({ name: 'current_medications', type: 'text', array: true, nullable: true })
  currentMedications?: string[];

  @Column({ name: 'previous_surgeries', type: 'text', array: true, nullable: true })
  previousSurgeries?: string[];

  @Column({ name: 'family_history', type: 'text', nullable: true })
  familyHistory?: string;

  // Informações de Emergência
  @Column({ name: 'emergency_contact_name', type: 'varchar', nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relationship', type: 'varchar', nullable: true })
  emergencyContactRelationship?: string;

  // Observações
  @Column({ name: 'general_notes', type: 'text', nullable: true })
  generalNotes?: string;

  @Column({ name: 'medical_notes', type: 'text', nullable: true })
  medicalNotes?: string;

  // Metadata
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'lead_id' })
  lead?: Lead;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => Anamnesis, anamnesis => anamnesis.medicalRecord)
  anamnesisList?: Anamnesis[];

  @OneToMany(() => ProcedureHistory, history => history.medicalRecord)
  procedureHistory?: ProcedureHistory[];
}

@Entity('anamnesis')
export class Anamnesis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id', type: 'uuid' })
  medicalRecordId: string;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId?: string;

  // Informações da Anamnese
  @Column({ name: 'complaint_main', type: 'text', nullable: true })
  complaintMain?: string;

  @Column({ name: 'complaint_history', type: 'text', nullable: true })
  complaintHistory?: string;

  // Hábitos de Vida
  @Column({ type: 'boolean', nullable: true })
  smoker?: boolean;

  @Column({ name: 'alcohol_consumption', type: 'varchar', nullable: true })
  alcoholConsumption?: string;

  @Column({ name: 'physical_activity', type: 'varchar', nullable: true })
  physicalActivity?: string;

  @Column({ name: 'sleep_hours', type: 'int', nullable: true })
  sleepHours?: number;

  @Column({ name: 'water_intake', type: 'int', nullable: true })
  waterIntake?: number;

  // Estética Específica
  @Column({ name: 'skin_type', type: 'varchar', nullable: true })
  skinType?: string;

  @Column({ name: 'skin_issues', type: 'text', array: true, nullable: true })
  skinIssues?: string[];

  @Column({ name: 'cosmetics_used', type: 'text', array: true, nullable: true })
  cosmeticsUsed?: string[];

  @Column({ name: 'previous_aesthetic_procedures', type: 'text', array: true, nullable: true })
  previousAestheticProcedures?: string[];

  @Column({ type: 'text', nullable: true })
  expectations?: string;

  // Saúde Geral
  @Column({ name: 'has_diabetes', type: 'boolean', nullable: true })
  hasDiabetes?: boolean;

  @Column({ name: 'has_hypertension', type: 'boolean', nullable: true })
  hasHypertension?: boolean;

  @Column({ name: 'has_heart_disease', type: 'boolean', nullable: true })
  hasHeartDisease?: boolean;

  @Column({ name: 'has_thyroid_issues', type: 'boolean', nullable: true })
  hasThyroidIssues?: boolean;

  @Column({ name: 'is_pregnant', type: 'boolean', nullable: true })
  isPregnant?: boolean;

  @Column({ name: 'is_breastfeeding', type: 'boolean', nullable: true })
  isBreastfeeding?: boolean;

  @Column({ name: 'menstrual_cycle_regular', type: 'boolean', nullable: true })
  menstrualCycleRegular?: boolean;

  @Column({ name: 'uses_contraceptive', type: 'boolean', nullable: true })
  usesContraceptive?: boolean;

  // Observações
  @Column({ name: 'professional_observations', type: 'text', nullable: true })
  professionalObservations?: string;

  @Column({ name: 'treatment_plan', type: 'text', nullable: true })
  treatmentPlan?: string;

  // Anexos
  @Column({ type: 'text', array: true, nullable: true })
  photos?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  documents?: string[];

  // Metadata
  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy?: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => MedicalRecord, record => record.anamnesisList)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  professional?: User;
}

@Entity('procedure_history')
export class ProcedureHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_record_id', type: 'uuid' })
  medicalRecordId: string;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId?: string;

  @Column({ name: 'procedure_id', type: 'uuid' })
  procedureId: string;

  // Informações do Procedimento
  @Column({ name: 'procedure_date', type: 'timestamp' })
  procedureDate: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ name: 'professional_id', type: 'uuid', nullable: true })
  professionalId?: string;

  // Detalhes da Execução
  @Column({ name: 'products_used', type: 'text', array: true, nullable: true })
  productsUsed?: string[];

  @Column({ name: 'equipment_used', type: 'text', array: true, nullable: true })
  equipmentUsed?: string[];

  @Column({ name: 'technique_description', type: 'text', nullable: true })
  techniqueDescription?: string;

  @Column({ name: 'areas_treated', type: 'text', array: true, nullable: true })
  areasTreated?: string[];

  // Observações
  @Column({ name: 'before_photos', type: 'text', array: true, nullable: true })
  beforePhotos?: string[];

  @Column({ name: 'after_photos', type: 'text', array: true, nullable: true })
  afterPhotos?: string[];

  @Column({ name: 'patient_reaction', type: 'text', nullable: true })
  patientReaction?: string;

  @Column({ name: 'professional_notes', type: 'text', nullable: true })
  professionalNotes?: string;

  // Resultados e Follow-up
  @Column({ name: 'results_description', type: 'text', nullable: true })
  resultsDescription?: string;

  @Column({ type: 'text', nullable: true })
  complications?: string;

  @Column({ name: 'next_session_recommendation', type: 'text', nullable: true })
  nextSessionRecommendation?: string;

  // Metadata
  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => MedicalRecord, record => record.procedureHistory)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professional_id' })
  professional?: User;
}
