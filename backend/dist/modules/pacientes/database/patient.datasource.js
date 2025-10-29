"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePatientDataSource = exports.initializePatientDataSource = exports.PatientDataSource = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../entities/patient.entity");
const patient_medical_record_entity_1 = require("../entities/patient-medical-record.entity");
const patient_image_entity_1 = require("../entities/patient-image.entity");
const patient_appointment_entity_1 = require("../entities/patient-appointment.entity");
const patient_transaction_entity_1 = require("../entities/patient-transaction.entity");
const tenant_s3_config_entity_1 = require("../entities/tenant-s3-config.entity");
const patient_migration_log_entity_1 = require("../entities/patient-migration-log.entity");
/**
 * DataSource para o banco de dados de pacientes
 * VPS: 72.60.139.52
 * Database: nexus_pacientes
 */
exports.PatientDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.PATIENT_DB_HOST || '72.60.139.52',
    port: parseInt(process.env.PATIENT_DB_PORT || '5432'),
    username: process.env.PATIENT_DB_USERNAME || 'nexus_pacientes_user',
    password: process.env.PATIENT_DB_PASSWORD || 'NexusPacientes2024Secure',
    database: process.env.PATIENT_DB_DATABASE || 'nexus_pacientes',
    entities: [
        patient_entity_1.Patient,
        patient_medical_record_entity_1.PatientMedicalRecord,
        patient_image_entity_1.PatientImage,
        patient_appointment_entity_1.PatientAppointment,
        patient_transaction_entity_1.PatientTransaction,
        tenant_s3_config_entity_1.TenantS3Config,
        patient_migration_log_entity_1.PatientMigrationLog,
    ],
    synchronize: false, // Usar migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: false, // Mesmo padrão do CrmDataSource
    extra: {
        max: 20, // Máximo de conexões no pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    },
});
/**
 * Inicializa a conexão com o banco de pacientes
 */
const initializePatientDataSource = async () => {
    try {
        if (!exports.PatientDataSource.isInitialized) {
            await exports.PatientDataSource.initialize();
            console.log('✅ PatientDataSource inicializado com sucesso (VPS 72.60.139.52)');
        }
    }
    catch (error) {
        console.error('❌ Erro ao inicializar PatientDataSource:', error);
        throw error;
    }
};
exports.initializePatientDataSource = initializePatientDataSource;
/**
 * Fecha a conexão com o banco de pacientes
 */
const closePatientDataSource = async () => {
    try {
        if (exports.PatientDataSource.isInitialized) {
            await exports.PatientDataSource.destroy();
            console.log('✅ PatientDataSource fechado com sucesso');
        }
    }
    catch (error) {
        console.error('❌ Erro ao fechar PatientDataSource:', error);
        throw error;
    }
};
exports.closePatientDataSource = closePatientDataSource;
//# sourceMappingURL=patient.datasource.js.map