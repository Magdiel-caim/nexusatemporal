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

interface WAHAWebhookPayload {
  id: string;
  timestamp: number;
  event: string;
  session: string;
  me?: {
    id: string;
    pushName: string;
  };
  payload: {
    id: string;
    timestamp: number;
    from: string;
    fromMe: boolean;
    body: string;
    type?: string;
    to?: string;
    participant?: string;
    hasMedia: boolean;
    media?: any;
    _data?: {
      Info?: {
        PushName?: string;
      };
      notifyName?: string;
      mediaUrl?: string;
    };
  };
  environment?: any;
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
   * Lista mensagens de uma sessão (com filtro opcional de phoneNumber)
   * GET /api/chat/n8n/messages/:sessionName?phoneNumber=xxx
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { sessionName } = req.params;
      const { limit = 50, offset = 0, phoneNumber } = req.query;

      let query = `SELECT
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
        WHERE session_name = $1`;

      const params: any[] = [sessionName];

      // Se phoneNumber for fornecido, adicionar ao filtro
      if (phoneNumber) {
        query += ` AND phone_number = $${params.length + 1}`;
        params.push(phoneNumber);
      }

      query += ` ORDER BY created_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const messages = await AppDataSource.query(query, params);

      res.json({
        success: true,
        data: messages, // Já está em ordem cronológica (ASC)
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
        WITH latest_messages AS (
          SELECT DISTINCT ON (session_name, phone_number)
            session_name,
            phone_number,
            contact_name,
            content,
            created_at
          FROM chat_messages
          ORDER BY session_name, phone_number, created_at DESC
        ),
        unread_counts AS (
          SELECT
            session_name,
            phone_number,
            COUNT(*) FILTER (WHERE is_read = false AND direction = 'incoming') as unread_count
          FROM chat_messages
          GROUP BY session_name, phone_number
        )
        SELECT
          lm.session_name as "sessionName",
          lm.phone_number as "phoneNumber",
          lm.contact_name as "contactName",
          lm.content as "lastMessage",
          lm.created_at as "lastMessageAt",
          COALESCE(uc.unread_count, 0) as "unreadCount",
          CASE
            WHEN lm.phone_number LIKE '%@g.us' THEN 'group'
            ELSE 'individual'
          END as "chatType"
        FROM latest_messages lm
        LEFT JOIN unread_counts uc ON lm.session_name = uc.session_name AND lm.phone_number = uc.phone_number
        ORDER BY lm.created_at DESC
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

  /**
   * Marca todas as mensagens de uma conversa como lidas
   * POST /api/chat/n8n/messages/:sessionName/mark-read?phoneNumber=xxx
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { sessionName } = req.params;
      const { phoneNumber } = req.query;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'phoneNumber is required',
        });
      }

      await AppDataSource.query(
        `UPDATE chat_messages
         SET is_read = true
         WHERE session_name = $1
         AND phone_number = $2
         AND direction = 'incoming'
         AND is_read = false`,
        [sessionName, phoneNumber]
      );

      res.json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error: any) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Deleta uma mensagem específica
   * DELETE /api/chat/n8n/messages/:messageId
   */
  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;

      const result = await AppDataSource.query(
        `DELETE FROM chat_messages WHERE id = $1 RETURNING id`,
        [messageId]
      );

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      res.json({
        success: true,
        message: 'Message deleted successfully',
        id: result[0].id,
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar mensagem:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Envia mensagem via WhatsApp
   * POST /api/chat/n8n/send-message
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { sessionName, phoneNumber, content } = req.body;

      if (!sessionName || !phoneNumber || !content) {
        return res.status(400).json({
          success: false,
          error: 'sessionName, phoneNumber and content are required',
        });
      }

      console.log('📤 Enviando mensagem via WAHA:', {
        session: sessionName,
        phone: phoneNumber,
      });

      // Enviar via WAHA API
      const wahaUrl = `https://apiwts.nexusatemporal.com.br/api/sendText`;
      const wahaApiKey = 'bd0c416348b2f04d198ff8971b608a87';

      const wahaResponse = await fetch(wahaUrl, {
        method: 'POST',
        headers: {
          'X-Api-Key': wahaApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionName,
          chatId: `${phoneNumber}@c.us`,
          text: content,
        }),
      });

      if (!wahaResponse.ok) {
        const errorText = await wahaResponse.text();
        throw new Error(`WAHA API error: ${wahaResponse.status} - ${errorText}`);
      }

      const wahaData = await wahaResponse.json();
      console.log('✅ Mensagem enviada via WAHA:', wahaData.id);

      // Salvar no banco
      const result = await AppDataSource.query(
        `INSERT INTO chat_messages (
          session_name,
          phone_number,
          contact_name,
          direction,
          message_type,
          content,
          waha_message_id,
          status,
          created_at,
          is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          sessionName,
          phoneNumber,
          phoneNumber, // contactName
          'outgoing',
          'text',
          content,
          wahaData.id,
          'sent',
          new Date(),
          true, // outgoing sempre lida
        ]
      );

      const savedMessage = result[0];

      console.log('✅ Mensagem salva no banco:', savedMessage.id);

      // Emitir via WebSocket
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
          createdAt: savedMessage.created_at,
        });
        console.log('🔊 Mensagem emitida via WebSocket');
      }

      res.json({
        success: true,
        data: {
          id: savedMessage.id,
          sessionName: savedMessage.session_name,
          phoneNumber: savedMessage.phone_number,
          direction: savedMessage.direction,
          messageType: savedMessage.message_type,
          content: savedMessage.content,
          status: savedMessage.status,
          createdAt: savedMessage.created_at,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Recebe webhooks DIRETAMENTE do WAHA (sem passar pelo N8N)
   * POST /api/chat/webhook/waha/message
   */
  async receiveWAHAWebhook(req: Request, res: Response) {
    try {
      const wahaPayload: WAHAWebhookPayload = req.body;

      console.log('🔔 Webhook WAHA recebido:', {
        event: wahaPayload.event,
        session: wahaPayload.session,
        from: wahaPayload.payload?.from,
      });

      // Processar evento de mensagem revogada (deletada)
      if (wahaPayload.event === 'message.revoked') {
        console.log('🗑️ Mensagem revogada recebida:', {
          session: wahaPayload.session,
          revokedMessageId: wahaPayload.payload?.revokedMessageId
        });

        const revokedMessageId = wahaPayload.payload?.revokedMessageId;

        if (revokedMessageId) {
          // Deletar a mensagem do banco usando o waha_message_id
          const deletedResult = await AppDataSource.query(
            `DELETE FROM chat_messages WHERE waha_message_id = $1 RETURNING id, session_name, phone_number`,
            [revokedMessageId]
          );

          if (deletedResult.length > 0) {
            const deletedMessage = deletedResult[0];
            console.log('✅ Mensagem deletada do banco:', deletedMessage.id);

            // Emitir via WebSocket para o frontend remover da UI
            const io = req.app.get('io');
            if (io) {
              io.emit('chat:message-deleted', {
                messageId: deletedMessage.id,
                sessionName: deletedMessage.session_name,
                phoneNumber: deletedMessage.phone_number,
              });
              console.log('🔊 Evento de exclusão emitido via WebSocket');
            }

            return res.json({
              success: true,
              message: 'Message revoked and deleted',
              deletedMessageId: deletedMessage.id,
            });
          } else {
            console.log('⚠️ Mensagem não encontrada no banco:', revokedMessageId);
          }
        }

        return res.json({ success: true, message: 'Message revoked event processed' });
      }

      // Filtrar apenas eventos de mensagem
      if (wahaPayload.event !== 'message' && wahaPayload.event !== 'message.any') {
        console.log('⏭️ Evento ignorado (não é mensagem):', wahaPayload.event);
        return res.json({ success: true, message: 'Event ignored (not a message)' });
      }

      const payload = wahaPayload.payload;
      const session = wahaPayload.session;

      // Detectar se é grupo ou conversa individual
      const isGroup = payload.from && payload.from.includes('@g.us');
      const isStatus = payload.from && payload.from.includes('status@broadcast');

      // IMPORTANTE: Ignorar apenas status do WhatsApp (grupos são permitidos)
      if (isStatus) {
        console.log('⏭️ Status ignorado:', payload.from);
        return res.json({
          success: true,
          message: 'Status messages ignored',
          ignored: true
        });
      }

      // Extrair phoneNumber (mantém sufixo @g.us para grupos)
      let phoneNumber = '';
      if (payload.from) {
        if (isGroup) {
          // Para grupos, manter @g.us
          phoneNumber = payload.from;
        } else {
          // Para individuais, remover sufixos @c.us, @lid, @s.whatsapp.net
          phoneNumber = payload.from.replace(/@c\.us|@lid|@s\.whatsapp\.net/g, '');
        }
      }

      // Nome do contato
      const contactName =
        payload._data?.Info?.PushName ||
        payload._data?.notifyName ||
        phoneNumber;

      // Tipo de mensagem
      const messageType = payload.type || 'text';

      // Conteúdo da mensagem
      const content = payload.body || '';

      // URL de mídia (se houver)
      const mediaUrl = payload._data?.mediaUrl || null;

      // Direção (incoming ou outgoing)
      const direction = payload.fromMe ? 'outgoing' : 'incoming';

      // Timestamp (converter de segundos para milissegundos)
      const timestamp = payload.timestamp ? payload.timestamp * 1000 : Date.now();

      console.log('📝 Mensagem processada:', {
        sessionName: session,
        phoneNumber,
        contactName,
        messageType,
        direction,
        isGroup,
      });

      // Salvar mensagem no banco
      // Mensagens incoming = não lidas (false), outgoing = lidas (true)
      const isRead = direction === 'outgoing';

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
          created_at,
          is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          session,
          phoneNumber,
          contactName,
          direction,
          messageType,
          content,
          mediaUrl,
          payload.id,
          'received',
          JSON.stringify(wahaPayload),
          new Date(timestamp),
          isRead,
        ]
      );

      const savedMessage = result[0];

      console.log('✅ Mensagem salva no banco:', {
        id: savedMessage.id,
        session: savedMessage.session_name,
        phone: savedMessage.phone_number,
      });

      // Emitir via WebSocket para frontend
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

        console.log('🔊 Mensagem emitida via WebSocket');
      }

      res.json({
        success: true,
        message: 'WAHA webhook received and processed',
        data: {
          id: savedMessage.id,
          sessionName: savedMessage.session_name,
          phoneNumber: savedMessage.phone_number,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao processar webhook WAHA:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
