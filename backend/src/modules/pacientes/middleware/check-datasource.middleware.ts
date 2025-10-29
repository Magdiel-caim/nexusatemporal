import { Request, Response, NextFunction } from 'express';
import { PatientDataSource } from '../database/patient.datasource';

/**
 * Middleware para verificar se o PatientDataSource está inicializado
 * Retorna erro 503 (Service Unavailable) se o banco não estiver disponível
 */
export const checkPatientDataSource = (req: Request, res: Response, next: NextFunction) => {
  if (!PatientDataSource.isInitialized) {
    return res.status(503).json({
      error: 'Módulo de Pacientes Indisponível',
      message: 'O banco de dados de pacientes não está acessível no momento. Por favor, contate o administrador do sistema.',
      details: 'Patient database connection is not available',
      timestamp: new Date().toISOString()
    });
  }

  next();
};
