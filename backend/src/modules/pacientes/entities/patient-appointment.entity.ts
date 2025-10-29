import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('patient_appointments')
@Index(['patientId'])
@Index(['appointmentId'])
export class PatientAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'appointment_date', type: 'timestamp', nullable: true })
  appointmentDate: Date | null;

  @Column({ name: 'professional_name', length: 255, nullable: true })
  professionalName: string | null;

  @Column({ name: 'procedure_name', length: 255, nullable: true })
  procedureName: string | null;

  @Column({ length: 50, nullable: true })
  status: string | null;

  @Column({ name: 'patient_notes', type: 'text', nullable: true })
  patientNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
