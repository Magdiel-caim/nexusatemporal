import { Request, Response } from 'express';
import { WAHASessionService } from './waha-session.service';
import { getWebSocketService } from './websocket.service';
import { WhatsAppSessionDBService } from '@/services/whatsapp-session-db.service';

export class WAHASessionController {
  private wahaSessionService = new WAHASessionService();
  private sessionDBService = new WhatsAppSessionDBService();

  /**
   * POST /api/chat/whatsapp/sessions/create
   * Cria uma nova sessão WhatsApp
   */
  createSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.body;
      const { id: userId } = req.user as any;

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
    } catch (error: any) {
      console.error('Error creating session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/whatsapp/sessions/:sessionName/start
   * Inicia uma sessão e gera QR Code
   */
  startSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      const session = await this.wahaSessionService.startSession(sessionName);

      // Aguardar um pouco para o QR Code ser gerado
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Obter QR Code
      let qrCode = null;
      try {
        qrCode = await this.wahaSessionService.getQRCode(sessionName);
      } catch (error) {
        console.log('QR Code not ready yet, will retry...');
      }

      res.json({
        success: true,
        session,
        qrCode,
        message: 'Session started. Scan QR code to connect.',
      });
    } catch (error: any) {
      console.error('Error starting session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * GET /api/chat/whatsapp/sessions/:sessionName/qr
   * Obtém o QR Code da sessão
   */
  getQRCode = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      const qrCode = await this.wahaSessionService.getQRCode(sessionName);

      res.json({
        success: true,
        qrCode,
      });
    } catch (error: any) {
      console.error('Error getting QR code:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * GET /api/chat/whatsapp/sessions/:sessionName/status
   * Obtém status da sessão
   */
  getStatus = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      const session = await this.wahaSessionService.getSessionStatus(sessionName);

      res.json({
        success: true,
        session,
      });
    } catch (error: any) {
      console.error('Error getting session status:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * GET /api/chat/whatsapp/sessions
   * Lista sessões do banco + sessões "atemporal" da WAHA
   */
  listSessions = async (req: Request, res: Response) => {
    try {
      // 1. Buscar sessões do banco (criadas pelo usuário)
      const dbSessions = await this.sessionDBService.listSessions();

      // 2. Buscar TODAS as sessões do WAHA
      let wahaSessions: any[] = [];
      try {
        wahaSessions = await this.wahaSessionService.getAllSessions();
      } catch (error) {
        console.log('Could not fetch WAHA sessions:', error);
      }

      // 3. Filtrar sessões WAHA que contenham "atemporal" no pushName ou nome
      const atemporalSessions = wahaSessions.filter((session) => {
        const sessionName = (session.name || '').toLowerCase();
        const pushName = (session.me?.pushName || '').toLowerCase();
        return pushName.includes('atemporal') || sessionName.includes('atemporal');
      });

      console.log('📱 Sessões Atemporal encontradas na WAHA:', atemporalSessions.length);

      // 4. Combinar sessões do banco com as do WAHA
      const sessionMap = new Map();

      // Adicionar sessões do banco
      for (const dbSession of dbSessions) {
        try {
          // Tentar obter dados do WAHA para esta sessão
          const wahaSession = await this.wahaSessionService.getSessionStatus(dbSession.session_name);

          sessionMap.set(dbSession.session_name, {
            name: dbSession.session_name,
            friendlyName: dbSession.friendly_name,
            status: wahaSession.status || dbSession.status,
            config: wahaSession.config || {},
            me: wahaSession.me || null,
          });
        } catch (error) {
          // Se sessão não existe no WAHA, retornar apenas dados do banco
          sessionMap.set(dbSession.session_name, {
            name: dbSession.session_name,
            friendlyName: dbSession.friendly_name,
            status: dbSession.status,
            config: {},
            me: null,
          });
        }
      }

      // Adicionar sessões "atemporal" da WAHA (se não estiverem no banco)
      for (const wahaSession of atemporalSessions) {
        if (!sessionMap.has(wahaSession.name)) {
          console.log('✅ Adicionando sessão Atemporal da WAHA:', wahaSession.name);
          sessionMap.set(wahaSession.name, {
            name: wahaSession.name,
            friendlyName: wahaSession.me?.pushName || wahaSession.name,
            status: wahaSession.status,
            config: wahaSession.config || {},
            me: wahaSession.me || null,
          });
        }
      }

      const combinedSessions = Array.from(sessionMap.values());

      res.json({
        success: true,
        sessions: combinedSessions,
      });
    } catch (error: any) {
      console.error('Error listing sessions:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/whatsapp/sessions/:sessionName/stop
   * Para uma sessão
   */
  stopSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      await this.wahaSessionService.stopSession(sessionName);

      res.json({
        success: true,
        message: 'Session stopped successfully',
      });
    } catch (error: any) {
      console.error('Error stopping session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/whatsapp/sessions/:sessionName/logout
   * Faz logout de uma sessão
   */
  logoutSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      await this.wahaSessionService.logoutSession(sessionName);

      // Atualizar status no banco
      await this.sessionDBService.updateStatus(sessionName, 'STOPPED');

      res.json({
        success: true,
        message: 'Session logged out successfully',
      });
    } catch (error: any) {
      console.error('Error logging out session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * DELETE /api/chat/whatsapp/sessions/:sessionName
   * Deleta uma sessão
   */
  deleteSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      await this.wahaSessionService.deleteSession(sessionName);

      res.json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/webhook/waha/status
   * Webhook para receber atualizações de status do WAHA
   */
  handleStatusWebhook = async (req: Request, res: Response) => {
    try {
      console.log('WAHA Status Webhook received:', JSON.stringify(req.body, null, 2));

      const { event, session, payload } = req.body;

      if (event === 'session.status') {
        const { status } = payload;

        // Atualizar status no banco (service)
        await this.wahaSessionService.handleStatusChange(session, status);

        // Atualizar status no banco (DB)
        await this.sessionDBService.updateStatus(session, status);

        // Emitir evento via WebSocket para atualizar frontend em tempo real
        try {
          const wsService = getWebSocketService();
          wsService.broadcast('whatsapp:status', {
            sessionName: session,
            status,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Error emitting WebSocket event:', error);
        }

        console.log(`Session ${session} status changed to: ${status}`);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error handling status webhook:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/whatsapp/sessions/register
   * Registra uma sessão criada externamente (via N8N) no banco local
   */
  registerSession = async (req: Request, res: Response) => {
    try {
      const { sessionName, friendlyName, userId } = req.body;

      if (!sessionName || !friendlyName) {
        return res.status(400).json({ error: 'sessionName and friendlyName are required' });
      }

      // Salvar no banco
      await this.sessionDBService.upsertSession(sessionName, friendlyName, 'SCAN_QR_CODE', userId);

      res.json({
        success: true,
        message: 'Session registered successfully',
      });
    } catch (error: any) {
      console.error('Error registering session:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * POST /api/chat/whatsapp/sessions/:sessionName/reconnect
   * Reconecta uma sessão desconectada gerando novo QR Code
   */
  reconnectSession = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.params;

      // Reiniciar sessão no WAHA
      const session = await this.wahaSessionService.startSession(sessionName);

      // Atualizar status no banco
      await this.sessionDBService.updateStatus(sessionName, 'SCAN_QR_CODE');

      res.json({
        success: true,
        session,
        message: 'Session reconnecting. Scan QR code to connect.',
      });
    } catch (error: any) {
      console.error('Error reconnecting session:', error);
      res.status(400).json({ error: error.message });
    }
  };
}
