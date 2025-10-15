import { Request, Response } from 'express';
import appointmentService from './appointment.service';
import { AppointmentStatus } from './appointment.entity';

export class AppointmentController {
  /**
   * POST /api/appointments
   * Criar novo agendamento
   */
  async create(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.create({
        ...req.body,
        tenantId: req.user?.tenantId || 'default',
        createdById: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/appointments
   * Listar todos os agendamentos com filtros
   */
  async findAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // Filtros por data
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);

        const appointments = await appointmentService.findByDate(
          tenantId,
          startDate,
          endDate
        );

        return res.json({
          success: true,
          data: appointments,
          total: appointments.length,
        });
      }

      // Lista geral com paginação
      const result = await appointmentService.findAll(tenantId, page, limit);

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page,
        limit,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/appointments/today
   * Agendamentos do dia
   */
  async findToday(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const appointments = await appointmentService.findToday(tenantId);

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/appointments/:id
   * Buscar agendamento por ID
   */
  async findById(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado',
        });
      }

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/appointments/lead/:leadId
   * Buscar agendamentos de um lead
   */
  async findByLead(req: Request, res: Response) {
    try {
      const appointments = await appointmentService.findByLead(req.params.leadId);

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/appointments/professional/:professionalId
   * Buscar agendamentos de um profissional
   */
  async findByProfessional(req: Request, res: Response) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const appointments = await appointmentService.findByProfessional(
        req.params.professionalId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/appointments/:id
   * Atualizar agendamento
   */
  async update(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/confirm-payment
   * Confirmar pagamento
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentProof, paymentMethod } = req.body;

      const appointment = await appointmentService.confirmPayment(
        req.params.id,
        paymentProof,
        paymentMethod
      );

      res.json({
        success: true,
        data: appointment,
        message: 'Pagamento confirmado e ficha de anamnese enviada',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/send-anamnesis
   * Reenviar ficha de anamnese
   */
  async sendAnamnesis(req: Request, res: Response) {
    try {
      await appointmentService.sendAnamnesisForm(req.params.id);

      res.json({
        success: true,
        message: 'Ficha de anamnese enviada',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/confirm
   * Paciente confirma ou reagenda
   */
  async confirm(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.confirmByPatient(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: appointment,
        message: req.body.confirmed
          ? 'Agendamento confirmado'
          : 'Agendamento reagendado',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/check-in
   * Check-in do paciente
   */
  async checkIn(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.checkIn(
        req.params.id,
        req.user?.userId || ''
      );

      res.json({
        success: true,
        data: appointment,
        message: 'Check-in realizado',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/start
   * Iniciar atendimento
   */
  async startAttendance(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.startAttendance(req.params.id);

      res.json({
        success: true,
        data: appointment,
        message: 'Atendimento iniciado',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/appointments/:id/finalize
   * Finalizar atendimento
   */
  async finalizeAttendance(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.finalizeAttendance(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: appointment,
        message: 'Atendimento finalizado',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/appointments/:id
   * Cancelar agendamento
   */
  async cancel(req: Request, res: Response) {
    try {
      const { reason } = req.body;

      const appointment = await appointmentService.cancel(
        req.params.id,
        req.user?.userId || '',
        reason || 'Sem motivo informado'
      );

      res.json({
        success: true,
        data: appointment,
        message: 'Agendamento cancelado',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AppointmentController();
