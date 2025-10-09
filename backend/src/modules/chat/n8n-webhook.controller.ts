import { Request, Response } from 'express';
import { AppDataSource } from '@/database/data-source';

interface N8NMessagePayload {
  sessionName: string;
  phoneNumber: string;
  contactName?: string;
  direction: 'incoming' | 'outgoing';
  messageType: string;
  content: string;
  mediaUrl?: string;
  wahaMessageId?: string;
  status?: string;
  timestamp?: number;
  rawPayload?: any;
}

export class N8NWebhookController {
  /**
   * Recebe mensagens do N8N (vindas da WAHA)
   * POST /api/chat/webhook/n8n/message
   */
  async receiveMessage(req: Request, res: Response) {
    try {
      const payload: N8NMessagePayload = req.body;

      console.log('📨 Mensagem recebida do N8N:', {
        session: payload.sessionName,
        from: payload.phoneNumber,
        type: payload.messageType,
        direction: payload.direction,
      });

      // Salvar mensagem no banco
      const result = await AppDataSource.query(
        `INSERT INTO chat_messages (
          session_name,
          phone_number,
          contact_name,
          direction,
          message_type,
          content,
          media_url,
          waha_message_id,
          status,
          metadata,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          payload.sessionName,
          payload.phoneNumber,
          payload.contactName || payload.phoneNumber,
          payload.direction,
          payload.messageType,
          payload.content,
          payload.mediaUrl || null,
          payload.wahaMessageId || null,
          payload.status || 'received',
          JSON.stringify(payload.rawPayload || {}),
          payload.timestamp ? new Date(payload.timestamp) : new Date(),
        ]
      );

      const savedMessage = result[0];

      // Emitir via WebSocket para frontend (se io estiver disponível)
      const io = req.app.get('io');
      if (io) {
        io.emit('chat:new-message', {
          id: savedMessage.id,
          sessionName: savedMessage.session_name,
          phoneNumber: savedMessage.phone_number,
          contactName: savedMessage.contact_name,
          direction: savedMessage.direction,
          messageType: savedMessage.message_type,
          content: savedMessage.content,
          mediaUrl: savedMessage.media_url,
          createdAt: savedMessage.created_at,
        });

        console.log('✅ Mensagem emitida via WebSocket');
      }

      res.json({
        success: true,
        message: 'Message received and saved',
        data: {
          id: savedMessage.id,
          sessionName: savedMessage.session_name,
          phoneNumber: savedMessage.phone_number,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao processar mensagem do N8N:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Lista mensagens de uma sessão
   * GET /api/chat/messages/:sessionName
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { sessionName } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await AppDataSource.query(
        `SELECT
          id,
          session_name as "sessionName",
          phone_number as "phoneNumber",
          contact_name as "contactName",
          direction,
          message_type as "messageType",
          content,
          media_url as "mediaUrl",
          status,
          created_at as "createdAt"
        FROM chat_messages
        WHERE session_name = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [sessionName, limit, offset]
      );

      res.json({
        success: true,
        data: messages.reverse(), // Reverter para ordem cronológica
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Lista todas as conversas (sessões com última mensagem)
   * GET /api/chat/conversations
   */
  async getConversations(req: Request, res: Response) {
    try {
      const conversations = await AppDataSource.query(`
        SELECT DISTINCT ON (session_name, phone_number)
          session_name as "sessionName",
          phone_number as "phoneNumber",
          contact_name as "contactName",
          content as "lastMessage",
          created_at as "lastMessageAt",
          COUNT(*) OVER (PARTITION BY session_name, phone_number) as "messageCount"
        FROM chat_messages
        ORDER BY session_name, phone_number, created_at DESC
      `);

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar conversas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
