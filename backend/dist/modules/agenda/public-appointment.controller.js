"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicAppointmentController = void 0;
const appointment_service_1 = __importDefault(require("./appointment.service"));
const data_source_1 = require("../../database/data-source");
/**
 * Controlador para API pública de agendamentos
 * Permite que sites externos integrem o sistema de agendamentos
 */
class PublicAppointmentController {
    /**
     * GET /api/public/appointments/available-slots
     * Obter slots disponíveis (público - sem autenticação)
     */
    async getAvailableSlots(req, res) {
        try {
            const { date, location, tenantId = 'default', professionalId, startHour, endHour, interval, } = req.query;
            if (!date || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Data e local são obrigatórios',
                });
            }
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
    /**
     * GET /api/public/appointments/occupied-slots
     * Obter horários ocupados (público - sem autenticação)
     */
    async getOccupiedSlots(req, res) {
        try {
            const { date, location, tenantId = 'default', professionalId, interval, } = req.query;
            if (!date || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Data e local são obrigatórios',
                });
            }
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
     * POST /api/public/appointments/check-availability
     * Verificar disponibilidade de um horário (público - sem autenticação)
     */
    async checkAvailability(req, res) {
        try {
            const { scheduledDate, duration, location, tenantId = 'default', professionalId, } = req.body;
            if (!scheduledDate || !duration || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Data, duração e local são obrigatórios',
                });
            }
            const result = await appointment_service_1.default.checkAvailability(tenantId, new Date(scheduledDate), duration, location, professionalId);
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
     * POST /api/public/appointments
     * Criar agendamento externo (requer API key)
     */
    async createAppointment(req, res) {
        try {
            const apiKey = req.headers['x-api-key'];
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
            const appointment = await appointment_service_1.default.create({
                ...req.body,
                tenantId,
                source: 'external_api',
            });
            res.status(201).json({
                success: true,
                data: appointment,
                message: 'Agendamento criado com sucesso',
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
     * GET /api/public/appointments/locations
     * Listar locais disponíveis (público - sem autenticação)
     */
    async getLocations(req, res) {
        try {
            const locations = [
                { value: 'moema', label: 'Moema' },
                { value: 'av_paulista', label: 'Av. Paulista' },
            ];
            res.json({
                success: true,
                data: locations,
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
     * Validar API key
     * Verifica se a chave de API é válida para o tenant
     */
    async validateApiKey(apiKey, tenantId) {
        if (!apiKey) {
            return false;
        }
        try {
            // Buscar configuração de API key no banco
            const apiKeyRepo = data_source_1.CrmDataSource.getRepository('api_keys');
            const keyRecord = await apiKeyRepo.findOne({
                where: {
                    key: apiKey,
                    tenantId,
                    active: true,
                },
            });
            return !!keyRecord;
        }
        catch (error) {
            console.error('Erro ao validar API key:', error);
            // Se a tabela não existir, permite qualquer key temporariamente
            // (será criada posteriormente)
            return apiKey.startsWith('nexus_');
        }
    }
}
exports.PublicAppointmentController = PublicAppointmentController;
exports.default = new PublicAppointmentController();
//# sourceMappingURL=public-appointment.controller.js.map