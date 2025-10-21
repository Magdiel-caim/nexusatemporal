"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = __importDefault(require("./appointment.service"));
class AppointmentController {
    /**
     * POST /api/appointments
     * Criar novo agendamento
     */
    async create(req, res) {
        try {
            const appointment = await appointment_service_1.default.create({
                ...req.body,
                tenantId: req.user?.tenantId || 'default',
                createdById: req.user?.userId,
            });
            res.status(201).json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
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
    async findAll(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            // Filtros por data
            if (req.query.startDate && req.query.endDate) {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
                const appointments = await appointment_service_1.default.findByDate(tenantId, startDate, endDate);
                return res.json({
                    success: true,
                    data: appointments,
                    total: appointments.length,
                });
            }
            // Lista geral com paginação
            const result = await appointment_service_1.default.findAll(tenantId, page, limit);
            res.json({
                success: true,
                data: result.data,
                total: result.total,
                page,
                limit,
            });
        }
        catch (error) {
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
    async findToday(req, res) {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const appointments = await appointment_service_1.default.findToday(tenantId);
            res.json({
                success: true,
                data: appointments,
            });
        }
        catch (error) {
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
    async findById(req, res) {
        try {
            const appointment = await appointment_service_1.default.findById(req.params.id);
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
        }
        catch (error) {
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
    async findByLead(req, res) {
        try {
            const appointments = await appointment_service_1.default.findByLead(req.params.leadId);
            res.json({
                success: true,
                data: appointments,
            });
        }
        catch (error) {
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
    async findByProfessional(req, res) {
        try {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            const appointments = await appointment_service_1.default.findByProfessional(req.params.professionalId, startDate, endDate);
            res.json({
                success: true,
                data: appointments,
            });
        }
        catch (error) {
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
    async update(req, res) {
        try {
            const appointment = await appointment_service_1.default.update(req.params.id, req.body);
            res.json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
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
    async confirmPayment(req, res) {
        try {
            const { paymentProof, paymentMethod } = req.body;
            const appointment = await appointment_service_1.default.confirmPayment(req.params.id, paymentProof, paymentMethod);
            res.json({
                success: true,
                data: appointment,
                message: 'Pagamento confirmado e ficha de anamnese enviada',
            });
        }
        catch (error) {
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
    async sendAnamnesis(req, res) {
        try {
            await appointment_service_1.default.sendAnamnesisForm(req.params.id);
            res.json({
                success: true,
                message: 'Ficha de anamnese enviada',
            });
        }
        catch (error) {
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
    async confirm(req, res) {
        try {
            const appointment = await appointment_service_1.default.confirmByPatient(req.params.id, req.body);
            res.json({
                success: true,
                data: appointment,
                message: req.body.confirmed
                    ? 'Agendamento confirmado'
                    : 'Agendamento reagendado',
            });
        }
        catch (error) {
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
    async checkIn(req, res) {
        try {
            const appointment = await appointment_service_1.default.checkIn(req.params.id, req.user?.userId || '');
            res.json({
                success: true,
                data: appointment,
                message: 'Check-in realizado',
            });
        }
        catch (error) {
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
    async startAttendance(req, res) {
        try {
            const appointment = await appointment_service_1.default.startAttendance(req.params.id);
            res.json({
                success: true,
                data: appointment,
                message: 'Atendimento iniciado',
            });
        }
        catch (error) {
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
    async finalizeAttendance(req, res) {
        try {
            const appointment = await appointment_service_1.default.finalizeAttendance(req.params.id, req.body);
            res.json({
                success: true,
                data: appointment,
                message: 'Atendimento finalizado',
            });
        }
        catch (error) {
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
    async cancel(req, res) {
        try {
            const { reason } = req.body;
            const appointment = await appointment_service_1.default.cancel(req.params.id, req.user?.userId || '', reason || 'Sem motivo informado');
            res.json({
                success: true,
                data: appointment,
                message: 'Agendamento cancelado',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    /**
     * POST /api/appointments/check-availability
     * Verificar disponibilidade de um horário
     */
    async checkAvailability(req, res) {
        try {
            const { scheduledDate, duration, location, professionalId, excludeAppointmentId, } = req.body;
            const tenantId = req.user?.tenantId || 'default';
            const result = await appointment_service_1.default.checkAvailability(tenantId, new Date(scheduledDate), duration || 60, location, professionalId, excludeAppointmentId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    /**
     * GET /api/appointments/occupied-slots
     * Obter horários ocupados para uma data
     */
    async getOccupiedSlots(req, res) {
        try {
            const { date, location, professionalId, interval } = req.query;
            const tenantId = req.user?.tenantId || 'default';
            const slots = await appointment_service_1.default.getOccupiedSlots(tenantId, date, location, professionalId, interval ? parseInt(interval) : 5);
            res.json({
                success: true,
                data: slots,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    /**
     * GET /api/appointments/available-slots
     * Obter slots disponíveis para uma data
     */
    async getAvailableSlots(req, res) {
        try {
            const { date, location, professionalId, startHour, endHour, interval, } = req.query;
            const tenantId = req.user?.tenantId || 'default';
            const slots = await appointment_service_1.default.getAvailableSlots(tenantId, date, location, professionalId, startHour ? parseInt(startHour) : 7, endHour ? parseInt(endHour) : 20, interval ? parseInt(interval) : 5);
            res.json({
                success: true,
                data: slots,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.default = new AppointmentController();
//# sourceMappingURL=appointment.controller.js.map