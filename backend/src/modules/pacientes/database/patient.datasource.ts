import { DataSource } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientMedicalRecord } from '../entities/patient-medical-record.entity';
import { PatientImage } from '../entities/patient-image.entity';
import { PatientAppointment } from '../entities/patient-appointment.entity';
import { PatientTransaction } from '../entities/patient-transaction.entity';
import { TenantS3Config } from '../entities/tenant-s3-config.entity';
import { PatientMigrationLog } from '../entities/patient-migration-log.entity';

/**
 * DataSource para o banco de dados de pacientes
 * VPS: 72.60.139.52
 * Database: nexus_pacientes
 */
export const PatientDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PATIENT_DB_HOST || '72.60.139.52',
  port: parseInt(process.env.PATIENT_DB_PORT || '5432'),
  username: process.env.PATIENT_DB_USERNAME || 'nexus_pacientes_user',
  password: process.env.PATIENT_DB_PASSWORD || 'Nexus@Pacientes2024!Secure',
  database: process.env.PATIENT_DB_DATABASE || 'nexus_pacientes',
  entities: [
    Patient,
    PatientMedicalRecord,
    PatientImage,
    PatientAppointment,
    PatientTransaction,
    TenantS3Config,
    PatientMigrationLog,
  ],
  synchronize: false, // Usar migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});

/**
 * Inicializa a conexão com o banco de pacientes
 */
export const initializePatientDataSource = async (): Promise<void> => {
  try {
    if (!PatientDataSource.isInitialized) {
      await PatientDataSource.initialize();
      console.log('✅ PatientDataSource inicializado com sucesso (VPS 72.60.139.52)');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar PatientDataSource:', error);
    throw error;
  }
};

/**
 * Fecha a conexão com o banco de pacientes
 */
export const closePatientDataSource = async (): Promise<void> => {
  try {
    if (PatientDataSource.isInitialized) {
      await PatientDataSource.destroy();
      console.log('✅ PatientDataSource fechado com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar PatientDataSource:', error);
    throw error;
  }
};
