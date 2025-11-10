"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = exports.GoogleCalendarIntegration = exports.CalendarSyncStatus = void 0;
const googleapis_1 = require("googleapis");
const logger_1 = require("../../shared/utils/logger");
const appointment_entity_1 = require("./appointment.entity");
const data_source_1 = require("../../database/data-source");
/**
 * Google Calendar Integration Entity
 * Armazena tokens OAuth2 e configurações por profissional
 */
const typeorm_1 = require("typeorm");
var CalendarSyncStatus;
(function (CalendarSyncStatus) {
    CalendarSyncStatus["ACTIVE"] = "active";
    CalendarSyncStatus["INACTIVE"] = "inactive";
    CalendarSyncStatus["ERROR"] = "error";
})(CalendarSyncStatus || (exports.CalendarSyncStatus = CalendarSyncStatus = {}));
let GoogleCalendarIntegration = class GoogleCalendarIntegration {
    id;
    userId; // Professional/User ID
    tenantId;
    accessToken;
    refreshToken;
    tokenExpiry;
    calendarId; // ID do calendário no Google (geralmente 'primary')
    status;
    syncEnabled;
    settings;
    lastSyncAt;
    lastError;
    createdAt;
    updatedAt;
};
exports.GoogleCalendarIntegration = GoogleCalendarIntegration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], GoogleCalendarIntegration.prototype, "tokenExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "calendarId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CalendarSyncStatus,
        default: CalendarSyncStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GoogleCalendarIntegration.prototype, "syncEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], GoogleCalendarIntegration.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GoogleCalendarIntegration.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GoogleCalendarIntegration.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GoogleCalendarIntegration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GoogleCalendarIntegration.prototype, "updatedAt", void 0);
exports.GoogleCalendarIntegration = GoogleCalendarIntegration = __decorate([
    (0, typeorm_1.Entity)('google_calendar_integrations')
], GoogleCalendarIntegration);
/**
 * Google Calendar Service
 * Gerencia sincronização bidirecional com Google Calendar
 */
class GoogleCalendarService {
    oauth2Client;
    integrationRepo;
    appointmentRepo;
    constructor() {
        // Configurar OAuth2 Client
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL}/api/agenda/google-calendar/callback`);
        this.integrationRepo = data_source_1.CrmDataSource.getRepository(GoogleCalendarIntegration);
        this.appointmentRepo = data_source_1.CrmDataSource.getRepository(appointment_entity_1.Appointment);
    }
    /**
     * Gera URL de autorização OAuth2
     */
    getAuthUrl(userId, tenantId) {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ];
        const state = Buffer.from(JSON.stringify({ userId, tenantId })).toString('base64');
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline', // Necessário para refresh token
            scope: scopes,
            state, // Para identificar o usuário no callback
            prompt: 'consent', // Força solicitação de consent para obter refresh token
        });
    }
    /**
     * Troca código de autorização por tokens
     */
    async exchangeCodeForTokens(code, userId, tenantId) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token || !tokens.refresh_token) {
                throw new Error('Failed to obtain tokens from Google');
            }
            // Salvar ou atualizar integração
            let integration = await this.integrationRepo.findOne({
                where: { userId, tenantId },
            });
            if (integration) {
                // Atualizar tokens existentes
                integration.accessToken = tokens.access_token;
                integration.refreshToken = tokens.refresh_token;
                integration.tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000);
                integration.status = CalendarSyncStatus.ACTIVE;
                integration.syncEnabled = true;
                integration.lastError = undefined;
            }
            else {
                // Criar nova integração
                integration = this.integrationRepo.create({
                    userId,
                    tenantId,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
                    calendarId: 'primary',
                    status: CalendarSyncStatus.ACTIVE,
                    syncEnabled: true,
                    settings: {
                        colorId: '9', // Azul padrão
                        defaultReminders: true,
                        sendNotifications: true,
                    },
                });
            }
            await this.integrationRepo.save(integration);
            logger_1.logger.info(`✅ Google Calendar integration configured for user ${userId}`);
            return integration;
        }
        catch (error) {
            logger_1.logger.error('❌ Error exchanging code for tokens:', { error: error.message });
            throw error;
        }
    }
    /**
     * Obtém cliente autenticado do Google Calendar
     */
    async getAuthenticatedClient(userId, tenantId) {
        const integration = await this.integrationRepo.findOne({
            where: { userId, tenantId, syncEnabled: true },
        });
        if (!integration) {
            throw new Error('Google Calendar integration not found or disabled');
        }
        // Verificar se token está expirado
        const now = new Date();
        if (integration.tokenExpiry <= now) {
            // Renovar token
            await this.refreshAccessToken(integration);
        }
        // Configurar cliente com tokens
        this.oauth2Client.setCredentials({
            access_token: integration.accessToken,
            refresh_token: integration.refreshToken,
        });
        return googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
    }
    /**
     * Renova access token usando refresh token
     */
    async refreshAccessToken(integration) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: integration.refreshToken,
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            if (credentials.access_token) {
                integration.accessToken = credentials.access_token;
                integration.tokenExpiry = credentials.expiry_date
                    ? new Date(credentials.expiry_date)
                    : new Date(Date.now() + 3600000);
                await this.integrationRepo.save(integration);
                logger_1.logger.info(`🔄 Access token refreshed for user ${integration.userId}`);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error refreshing access token:', { error: error.message });
            integration.status = CalendarSyncStatus.ERROR;
            integration.lastError = error.message;
            await this.integrationRepo.save(integration);
            throw error;
        }
    }
    /**
     * Sincroniza agendamento do Nexus → Google Calendar
     * Cria ou atualiza evento no Google Calendar
     */
    async syncAppointmentToGoogle(appointmentId, tenantId) {
        try {
            const appointment = await this.appointmentRepo.findOne({
                where: { id: appointmentId, tenantId },
                relations: ['lead', 'professional', 'procedure'],
            });
            if (!appointment) {
                throw new Error('Appointment not found');
            }
            // Verificar se há integração configurada para o profissional
            if (!appointment.professionalId) {
                logger_1.logger.warn('⚠️  Appointment has no professional assigned, skipping Google Calendar sync');
                return;
            }
            const calendar = await this.getAuthenticatedClient(appointment.professionalId, tenantId);
            const integration = await this.integrationRepo.findOne({
                where: { userId: appointment.professionalId, tenantId },
            });
            if (!integration) {
                logger_1.logger.warn(`⚠️  No Google Calendar integration for user ${appointment.professionalId}`);
                return;
            }
            // Calcular horário de término
            const startTime = new Date(appointment.scheduledDate);
            const endTime = new Date(startTime.getTime() + (appointment.estimatedDuration || 60) * 60000);
            // Preparar evento
            const event = {
                summary: `${appointment.lead?.name || 'Cliente'} - ${appointment.procedure?.name || 'Procedimento'}`,
                description: appointment.notes || '',
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Sao_Paulo',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Sao_Paulo',
                },
                location: appointment.location,
                colorId: integration.settings?.colorId || '9',
                reminders: integration.settings?.defaultReminders
                    ? {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 24h antes
                            { method: 'popup', minutes: 30 }, // 30 min antes
                        ],
                    }
                    : undefined,
            };
            // Verificar se já existe evento associado
            const googleEventId = appointment.googleEventId; // Precisaria adicionar esta coluna no entity
            if (googleEventId) {
                // Atualizar evento existente
                await calendar.events.update({
                    calendarId: integration.calendarId || 'primary',
                    eventId: googleEventId,
                    requestBody: event,
                });
                logger_1.logger.info(`📅 Updated Google Calendar event ${googleEventId} for appointment ${appointmentId}`);
            }
            else {
                // Criar novo evento
                const response = await calendar.events.insert({
                    calendarId: integration.calendarId || 'primary',
                    requestBody: event,
                });
                // Salvar ID do evento no agendamento
                // Nota: Isso requer adicionar campo googleEventId no entity Appointment
                // await this.appointmentRepo.update(appointmentId, { googleEventId: response.data.id });
                logger_1.logger.info(`📅 Created Google Calendar event ${response.data.id} for appointment ${appointmentId}`);
            }
            // Atualizar último sync
            integration.lastSyncAt = new Date();
            await this.integrationRepo.save(integration);
        }
        catch (error) {
            logger_1.logger.error('❌ Error syncing appointment to Google Calendar:', {
                appointmentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Deleta evento do Google Calendar quando agendamento é cancelado
     */
    async deleteAppointmentFromGoogle(appointmentId, tenantId) {
        try {
            const appointment = await this.appointmentRepo.findOne({
                where: { id: appointmentId, tenantId },
            });
            if (!appointment || !appointment.professionalId) {
                return;
            }
            const googleEventId = appointment.googleEventId;
            if (!googleEventId) {
                logger_1.logger.warn('⚠️  Appointment has no associated Google Calendar event');
                return;
            }
            const calendar = await this.getAuthenticatedClient(appointment.professionalId, tenantId);
            const integration = await this.integrationRepo.findOne({
                where: { userId: appointment.professionalId, tenantId },
            });
            if (!integration) {
                return;
            }
            await calendar.events.delete({
                calendarId: integration.calendarId || 'primary',
                eventId: googleEventId,
            });
            logger_1.logger.info(`🗑️  Deleted Google Calendar event ${googleEventId} for appointment ${appointmentId}`);
            // Atualizar último sync
            integration.lastSyncAt = new Date();
            await this.integrationRepo.save(integration);
        }
        catch (error) {
            logger_1.logger.error('❌ Error deleting appointment from Google Calendar:', {
                appointmentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Desconecta integração com Google Calendar
     */
    async disconnectIntegration(userId, tenantId) {
        const integration = await this.integrationRepo.findOne({
            where: { userId, tenantId },
        });
        if (!integration) {
            throw new Error('Integration not found');
        }
        // Revogar token no Google
        try {
            await this.oauth2Client.revokeToken(integration.accessToken);
        }
        catch (error) {
            logger_1.logger.warn('Failed to revoke token (may already be revoked):', error.message);
        }
        // Desativar integração
        integration.syncEnabled = false;
        integration.status = CalendarSyncStatus.INACTIVE;
        await this.integrationRepo.save(integration);
        logger_1.logger.info(`🔌 Disconnected Google Calendar integration for user ${userId}`);
    }
    /**
     * Verifica status da integração
     */
    async getIntegrationStatus(userId, tenantId) {
        const integration = await this.integrationRepo.findOne({
            where: { userId, tenantId },
        });
        if (!integration) {
            return {
                connected: false,
                lastSync: null,
                status: null,
                error: null,
            };
        }
        return {
            connected: integration.syncEnabled,
            lastSync: integration.lastSyncAt,
            status: integration.status,
            error: integration.lastError,
        };
    }
}
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=google-calendar.service.js.map