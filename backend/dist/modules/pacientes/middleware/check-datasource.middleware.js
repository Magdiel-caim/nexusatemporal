"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPatientDataSource = void 0;
const patient_datasource_1 = require("../database/patient.datasource");
/**
 * Middleware para verificar se o PatientDataSource está inicializado
 * Retorna erro 503 (Service Unavailable) se o banco não estiver disponível
 */
const checkPatientDataSource = (req, res, next) => {
    if (!patient_datasource_1.PatientDataSource.isInitialized) {
        return res.status(503).json({
            error: 'Módulo de Pacientes Indisponível',
            message: 'O banco de dados de pacientes não está acessível no momento. Por favor, contate o administrador do sistema.',
            details: 'Patient database connection is not available',
            timestamp: new Date().toISOString()
        });
    }
    next();
};
exports.checkPatientDataSource = checkPatientDataSource;
//# sourceMappingURL=check-datasource.middleware.js.map