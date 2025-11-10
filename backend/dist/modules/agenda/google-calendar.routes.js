"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const google_calendar_service_1 = require("./google-calendar.service");
const logger_1 = require("../../shared/utils/logger");
const router = (0, express_1.Router)();
// Lazy initialization
let googleCalendarService = null;
function getGoogleCalendarService() {
    if (!googleCalendarService) {
        googleCalendarService = new google_calendar_service_1.GoogleCalendarService();
    }
    return googleCalendarService;
}
// ============================================
// GOOGLE CALENDAR INTEGRATION ROUTES
// ============================================
/**
 * GET /api/agenda/google-calendar/auth-url
 * Obtém URL para autorização OAuth2
 */
router.get('/auth-url', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        if (!userId || !tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Verificar se credenciais Google estão configuradas
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return res.status(503).json({
                error: 'Google Calendar integration not configured',
                message: 'Por favor, configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nas variáveis de ambiente',
            });
        }
        const service = getGoogleCalendarService();
        const authUrl = service.getAuthUrl(userId, tenantId);
        res.json({
            authUrl,
            message: 'Redirecione o usuário para esta URL para autorizar acesso ao Google Calendar',
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating Google Calendar auth URL:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/agenda/google-calendar/callback
 * Callback OAuth2 do Google
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        if (!state || typeof state !== 'string') {
            return res.status(400).json({ error: 'State parameter is required' });
        }
        // Decodificar state para obter userId e tenantId
        const { userId, tenantId } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        if (!userId || !tenantId) {
            return res.status(400).json({ error: 'Invalid state parameter' });
        }
        const service = getGoogleCalendarService();
        const integration = await service.exchangeCodeForTokens(code, userId, tenantId);
        // Redirecionar para frontend com sucesso
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/agenda/configuracoes?google_calendar=success`);
    }
    catch (error) {
        logger_1.logger.error('Error in Google Calendar OAuth callback:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/agenda/configuracoes?google_calendar=error&message=${encodeURIComponent(error.message)}`);
    }
});
/**
 * GET /api/agenda/google-calendar/status
 * Verifica status da integração do usuário
 */
router.get('/status', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        if (!userId || !tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const service = getGoogleCalendarService();
        const status = await service.getIntegrationStatus(userId, tenantId);
        res.json(status);
    }
    catch (error) {
        logger_1.logger.error('Error getting Google Calendar integration status:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * POST /api/agenda/google-calendar/sync/:appointmentId
 * Sincroniza agendamento específico com Google Calendar
 */
router.post('/sync/:appointmentId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const service = getGoogleCalendarService();
        await service.syncAppointmentToGoogle(appointmentId, tenantId);
        res.json({
            success: true,
            message: 'Agendamento sincronizado com Google Calendar com sucesso',
        });
    }
    catch (error) {
        logger_1.logger.error('Error syncing appointment to Google Calendar:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * DELETE /api/agenda/google-calendar/disconnect
 * Desconecta integração com Google Calendar
 */
router.delete('/disconnect', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        if (!userId || !tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const service = getGoogleCalendarService();
        await service.disconnectIntegration(userId, tenantId);
        res.json({
            success: true,
            message: 'Integração com Google Calendar desconectada com sucesso',
        });
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting Google Calendar:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * Health check
 */
router.get('/health', (req, res) => {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    res.json({
        module: 'google-calendar',
        status: isConfigured ? 'configured' : 'not_configured',
        message: isConfigured
            ? 'Google Calendar integration is configured and ready'
            : 'Google Calendar integration requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=google-calendar.routes.js.map