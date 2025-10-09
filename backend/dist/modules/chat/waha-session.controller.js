"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAHASessionController = void 0;
const waha_session_service_1 = require("./waha-session.service");
const websocket_service_1 = require("./websocket.service");
class WAHASessionController {
    wahaSessionService = new waha_session_service_1.WAHASessionService();
    /**
     * POST /api/chat/whatsapp/sessions/create
     * Cria uma nova sessão WhatsApp
     */
    createSession = async (req, res) => {
        try {
            const { sessionName } = req.body;
            const { id: userId } = req.user;
            if (!sessionName) {
                return res.status(400).json({ error: 'Session name is required' });
            }
            // Validar nome da sessão (apenas letras, números e underscores)
            if (!/^[a-zA-Z0-9_]+$/.test(sessionName)) {
                return res.status(400).json({
                    error: 'Session name must contain only letters, numbers and underscores',
                });
            }
            const session = await this.wahaSessionService.createSession(sessionName, userId);
            res.status(201).json({
                success: true,
                session,
                message: 'Session created successfully',
            });
        }
        catch (error) {
            console.error('Error creating session:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * POST /api/chat/whatsapp/sessions/:sessionName/start
     * Inicia uma sessão e gera QR Code
     */
    startSession = async (req, res) => {
        try {
            const { sessionName } = req.params;
            const session = await this.wahaSessionService.startSession(sessionName);
            // Aguardar um pouco para o QR Code ser gerado
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Obter QR Code
            let qrCode = null;
            try {
                qrCode = await this.wahaSessionService.getQRCode(sessionName);
            }
            catch (error) {
                console.log('QR Code not ready yet, will retry...');
            }
            res.json({
                success: true,
                session,
                qrCode,
                message: 'Session started. Scan QR code to connect.',
            });
        }
        catch (error) {
            console.error('Error starting session:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * GET /api/chat/whatsapp/sessions/:sessionName/qr
     * Obtém o QR Code da sessão
     */
    getQRCode = async (req, res) => {
        try {
            const { sessionName } = req.params;
            const qrCode = await this.wahaSessionService.getQRCode(sessionName);
            res.json({
                success: true,
                qrCode,
            });
        }
        catch (error) {
            console.error('Error getting QR code:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * GET /api/chat/whatsapp/sessions/:sessionName/status
     * Obtém status da sessão
     */
    getStatus = async (req, res) => {
        try {
            const { sessionName } = req.params;
            const session = await this.wahaSessionService.getSessionStatus(sessionName);
            res.json({
                success: true,
                session,
            });
        }
        catch (error) {
            console.error('Error getting session status:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * GET /api/chat/whatsapp/sessions
     * Lista todas as sessões
     */
    listSessions = async (req, res) => {
        try {
            const sessions = await this.wahaSessionService.listSessions();
            res.json({
                success: true,
                sessions,
            });
        }
        catch (error) {
            console.error('Error listing sessions:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * POST /api/chat/whatsapp/sessions/:sessionName/stop
     * Para uma sessão
     */
    stopSession = async (req, res) => {
        try {
            const { sessionName } = req.params;
            await this.wahaSessionService.stopSession(sessionName);
            res.json({
                success: true,
                message: 'Session stopped successfully',
            });
        }
        catch (error) {
            console.error('Error stopping session:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * POST /api/chat/whatsapp/sessions/:sessionName/logout
     * Faz logout de uma sessão
     */
    logoutSession = async (req, res) => {
        try {
            const { sessionName } = req.params;
            await this.wahaSessionService.logoutSession(sessionName);
            res.json({
                success: true,
                message: 'Session logged out successfully',
            });
        }
        catch (error) {
            console.error('Error logging out session:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * DELETE /api/chat/whatsapp/sessions/:sessionName
     * Deleta uma sessão
     */
    deleteSession = async (req, res) => {
        try {
            const { sessionName } = req.params;
            await this.wahaSessionService.deleteSession(sessionName);
            res.json({
                success: true,
                message: 'Session deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting session:', error);
            res.status(400).json({ error: error.message });
        }
    };
    /**
     * POST /api/chat/webhook/waha/status
     * Webhook para receber atualizações de status do WAHA
     */
    handleStatusWebhook = async (req, res) => {
        try {
            console.log('WAHA Status Webhook received:', JSON.stringify(req.body, null, 2));
            const { event, session, payload } = req.body;
            if (event === 'session.status') {
                const { status } = payload;
                // Atualizar status no banco
                await this.wahaSessionService.handleStatusChange(session, status);
                // Emitir evento via WebSocket para atualizar frontend em tempo real
                try {
                    const wsService = (0, websocket_service_1.getWebSocketService)();
                    wsService.broadcast('whatsapp:status', {
                        sessionName: session,
                        status,
                        timestamp: new Date(),
                    });
                }
                catch (error) {
                    console.error('Error emitting WebSocket event:', error);
                }
                console.log(`Session ${session} status changed to: ${status}`);
            }
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error handling status webhook:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.WAHASessionController = WAHASessionController;
//# sourceMappingURL=waha-session.controller.js.map