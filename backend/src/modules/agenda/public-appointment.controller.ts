import { Request, Response } from 'express';
import appointmentService from './appointment.service';
import { CrmDataSource } from '../../database/data-source';

/**
 * Controlador para API pública de agendamentos
 * Permite que sites externos integrem o sistema de agendamentos
 */
export class PublicAppointmentController {
  /**
   * GET /api/public/appointments/available-slots
   * Obter slots disponíveis (público - sem autenticação)
   */
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const {
        date,
        location,
        tenantId = 'default',
        professionalId,
        startHour,
        endHour,
        interval,
      } = req.query;

      if (!date || !location) {
        return res.status(400).json({
          success: false,
          message: 'Data e local são obrigatórios',
        });
      }

      const slots = await appointmentService.getAvailableSlots(
        tenantId as string,
        date as string,
        location as string,
        professionalId as string,
        startHour ? parseInt(startHour as string) : 7,
        endHour ? parseInt(endHour as string) : 20,
        interval ? parseInt(interval as string) : 5
      );

      res.json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/public/appointments/occupied-slots
   * Obter horários ocupados (público - sem autenticação)
   */
  async getOccupiedSlots(req: Request, res: Response) {
    try {
      const {
        date,
        location,
        tenantId = 'default',
        professionalId,
        interval,
      } = req.query;

      if (!date || !location) {
        return res.status(400).json({
          success: false,
          message: 'Data e local são obrigatórios',
        });
      }

      const slots = await appointmentService.getOccupiedSlots(
        tenantId as string,
        date as string,
        location as string,
        professionalId as string,
        interval ? parseInt(interval as string) : 5
      );

      res.json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/public/appointments/check-availability
   * Verificar disponibilidade de um horário (público - sem autenticação)
   */
  async checkAvailability(req: Request, res: Response) {
    try {
      const {
        scheduledDate,
        duration,
        location,
        tenantId = 'default',
        professionalId,
      } = req.body;

      if (!scheduledDate || !duration || !location) {
        return res.status(400).json({
          success: false,
          message: 'Data, duração e local são obrigatórios',
        });
      }

      const result = await appointmentService.checkAvailability(
        tenantId as string,
        new Date(scheduledDate),
        duration,
        location,
        professionalId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/public/appointments
   * Criar agendamento externo (requer API key)
   */
  async createAppointment(req: Request, res: Response) {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      const tenantId = req.body.tenantId || 'default';

      // Validar API key
      const isValid = await this.validateApiKey(apiKey, tenantId);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'API key inválida ou não autorizada',
        });
      }

      // Criar agendamento
      const appointment = await appointmentService.create({
        ...req.body,
        tenantId,
        source: 'external_api',
      });

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Agendamento criado com sucesso',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/public/appointments/locations
   * Listar locais disponíveis (público - sem autenticação)
   */
  async getLocations(req: Request, res: Response) {
    try {
      const locations = [
        { value: 'moema', label: 'Moema' },
        { value: 'av_paulista', label: 'Av. Paulista' },
      ];

      res.json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Validar API key
   * Verifica se a chave de API é válida para o tenant
   */
  private async validateApiKey(apiKey: string, tenantId: string): Promise<boolean> {
    if (!apiKey) {
      return false;
    }

    try {
      // Buscar configuração de API key no banco
      const apiKeyRepo = CrmDataSource.getRepository('api_keys');
      const keyRecord = await apiKeyRepo.findOne({
        where: {
          key: apiKey,
          tenantId,
          active: true,
        },
      });

      return !!keyRecord;
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      // Se a tabela não existir, permite qualquer key temporariamente
      // (será criada posteriormente)
      return apiKey.startsWith('nexus_');
    }
  }
}

export default new PublicAppointmentController();
