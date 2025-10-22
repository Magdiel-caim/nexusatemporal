import { Request, Response } from 'express';
import { AppDataSource } from '@/database/data-source';
import { MediaUploadService } from '@/services/media-upload.service';
import { logger } from '@/shared/utils/logger';
import { ChatService } from './chat.service';

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
    revokedMessageId?: string; // Para evento message.revoked
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

interface WAHAResponse {
  id: string;
  timestamp?: number;
  [key: string]: any;
}

export class N8NWebhookController {
  private mediaUploadService = new MediaUploadService();
  private chatService = new ChatService();
  /**
   * Recebe mensagens do N8N com mídia em base64 e faz upload no S3
   * POST /api/chat/webhook/n8n/message-media
   */
  async receiveMessageWithMedia(req: Request, res: Response) {
    try {
      const { sessionName, phoneNumber, contactName, messageType, content, mediaBase64, direction, wahaMessageId, timestamp } = req.body;

      console.log('📨 Mensagem com mídia recebida do N8N:', {
        session: sessionName,
        from: phoneNumber,
        type: messageType,
        direction: direction,
        hasMediaBase64: !!mediaBase64,
      });

      if (!mediaBase64) {
        return res.status(400).json({
          success: false,
          error: 'mediaBase64 is required for media messages',
        });
      }

      // Importar funções S3
      const { uploadFile } = await import('@/integrations/idrive/s3-client');

      // Converter base64 para Buffer
      const base64Data = mediaBase64.replace(/^data:.+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Determinar extensão e contentType
      let extension = 'bin';
      let contentType = 'application/octet-stream';

      if (messageType === 'image') {
        extension = 'jpg';
        contentType = 'image/jpeg';
      } else if (messageType === 'video') {
        extension = 'mp4';
        contentType = 'video/mp4';
      } else if (messageType === 'audio' || messageType === 'ptt') {
        extension = 'ogg';
        contentType = 'audio/ogg';
      } else if (messageType === 'sticker') {
        extension = 'webp';
        contentType = 'image/webp';
      }

      // Upload no S3
      const timestamp_str = new Date().toISOString().replace(/[:.]/g, '-');
      const s3Key = `whatsapp/${sessionName}/${timestamp_str}-${wahaMessageId || Date.now()}.${extension}`;

      console.log('☁️ Fazendo upload no S3:', s3Key);

      const s3Url = await uploadFile(
        s3Key,
        buffer,
        contentType,
        {
          source: 'whatsapp',
          session: sessionName,
          type: messageType,
          messageId: wahaMessageId || '',
          phoneNumber: phoneNumber,
        }
      );

      console.log('✅ Upload S3 concluído:', s3Url);

      // 1. Buscar ou criar conversa
      const conversation = await this.chatService.findOrCreateConversation({
        phoneNumber: phoneNumber,
        contactName: contactName || phoneNumber,
        whatsappInstanceId: sessionName,
      });

      console.log('✅ Conversa encontrada/criada:', conversation.id);

      // 2. Criar mensagem com attachment
      const savedMessage = await this.chatService.createMessageWithAttachment(
        {
          conversationId: conversation.id,
          direction: direction as 'incoming' | 'outgoing',
          type: messageType as 'audio' | 'image' | 'video' | 'document',
          content: content || '',
          whatsappMessageId: wahaMessageId || undefined,
          metadata: {
            timestamp: timestamp,
            uploadedToS3: true,
          },
        },
        {
          fileName: `${sessionName}_${Date.now()}.${extension}`,
          fileUrl: s3Url,
          mimeType: contentType,
          fileSize: buffer.length,
        }
      );

      console.log('✅ Mensagem criada com attachment:', savedMessage?.id);

      // Emitir via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('chat:new-message', {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: sessionName,
          phoneNumber: phoneNumber,
          contactName: contactName || phoneNumber,
          direction: direction,
          messageType: messageType,
          content: content || '',
          mediaUrl: s3Url,
          attachments: savedMessage?.attachments || [],
          createdAt: new Date(),
        });

        console.log('✅ Mensagem emitida via WebSocket');
      }

      res.json({
        success: true,
        message: 'Media uploaded to S3 and message saved',
        data: {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: sessionName,
          phoneNumber: phoneNumber,
          mediaUrl: s3Url,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao processar mídia do N8N:', error.message || error);
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

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
        hasMedia: !!payload.mediaUrl,
      });

      // ESTRATÉGIA ANTI-DUPLICAÇÃO:
      // N8N processa APENAS mensagens COM MÍDIA
      // Mensagens de texto são processadas pelo webhook direto do WAHA
      const hasMedia = payload.mediaUrl && payload.mediaUrl.trim() !== '';

      if (!hasMedia) {
        console.log('⏭️ Mensagem de texto ignorada pelo N8N (já processada pelo WAHA direto)');
        return res.json({
          success: true,
          message: 'Text message skipped (already processed by direct WAHA webhook)',
          skipped: true,
        });
      }

      console.log('📷 Mensagem com mídia - processando e salvando com URL S3');

      // 1. Download e Upload de mídia para S3 (se tiver mediaUrl)
      let uploadedFileInfo: { fileUrl: string; fileName: string; fileSize: number; mimeType: string } | null = null;

      if (payload.mediaUrl) {
        try {
          logger.info('[Webhook] Iniciando processamento de mídia:', payload.mediaUrl);
          uploadedFileInfo = await this.mediaUploadService.uploadMediaFromUrl(
            payload.mediaUrl,
            undefined // mimeType será detectado automaticamente
          );
          logger.info('[Webhook] Mídia uploadada com sucesso:', uploadedFileInfo.fileUrl);
        } catch (error: any) {
          logger.error('[Webhook] Erro ao processar mídia:', error.message);
          // Continua sem bloquear a mensagem
        }
      }

      // 2. Buscar ou criar conversa
      const conversation = await this.chatService.findOrCreateConversation({
        phoneNumber: payload.phoneNumber,
        contactName: payload.contactName || payload.phoneNumber,
        whatsappInstanceId: payload.sessionName,
      });

      logger.info('[Webhook] Conversa encontrada/criada:', conversation.id);

      // 3. Salvar mensagem com attachment (se houver mídia)
      const savedMessage = await this.chatService.createMessageWithAttachment(
        {
          conversationId: conversation.id,
          direction: payload.direction as 'incoming' | 'outgoing',
          type: payload.messageType as any,
          content: payload.content || '',
          whatsappMessageId: payload.wahaMessageId,
          metadata: {
            timestamp: payload.timestamp,
            status: payload.status,
            rawPayload: payload.rawPayload,
          },
        },
        uploadedFileInfo
          ? {
              fileName: uploadedFileInfo.fileName,
              fileUrl: uploadedFileInfo.fileUrl,
              mimeType: uploadedFileInfo.mimeType,
              fileSize: uploadedFileInfo.fileSize,
            }
          : undefined
      );

      logger.info('[Webhook] Mensagem salva:', savedMessage?.id);

      // Emitir via WebSocket para frontend (se io estiver disponível)
      const io = req.app.get('io');
      if (io) {
        io.emit('chat:new-message', {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: payload.sessionName,
          phoneNumber: payload.phoneNumber,
          contactName: payload.contactName || payload.phoneNumber,
          direction: payload.direction,
          messageType: payload.messageType,
          content: payload.content || '',
          mediaUrl: uploadedFileInfo?.fileUrl || payload.mediaUrl,
          attachments: savedMessage?.attachments || [],
          createdAt: new Date(),
        });

        console.log('✅ Mensagem com mídia emitida via WebSocket');
      }

      res.json({
        success: true,
        message: 'Message with media received, uploaded to S3, and saved',
        data: {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: payload.sessionName,
          phoneNumber: payload.phoneNumber,
          mediaUrl: uploadedFileInfo?.fileUrl || payload.mediaUrl,
          hasAttachment: !!uploadedFileInfo,
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
   *
   * IMPORTANTE: Lista apenas conversas de sessões criadas pelo sistema (tabela whatsapp_sessions)
   * Ignora mensagens de sessões externas (ex: Chatwoot)
   */
  async getConversations(req: Request, res: Response) {
    try {
      const conversations = await AppDataSource.query(`
        WITH latest_messages AS (
          SELECT DISTINCT ON (cm.session_name, cm.phone_number)
            cm.session_name,
            cm.phone_number,
            cm.contact_name,
            cm.content,
            cm.created_at
          FROM chat_messages cm
          INNER JOIN whatsapp_sessions ws ON cm.session_name = ws.session_name
          ORDER BY cm.session_name, cm.phone_number, cm.created_at DESC
        ),
        unread_counts AS (
          SELECT
            cm.session_name,
            cm.phone_number,
            COUNT(*) FILTER (WHERE cm.is_read = false AND cm.direction = 'incoming') as unread_count
          FROM chat_messages cm
          INNER JOIN whatsapp_sessions ws ON cm.session_name = ws.session_name
          GROUP BY cm.session_name, cm.phone_number
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

      const wahaData = (await wahaResponse.json()) as WAHAResponse;
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
   * Envia mídia (imagem, vídeo, áudio, documento) via WhatsApp
   * POST /api/chat/n8n/send-media
   * Body: multipart/form-data com file + sessionName + phoneNumber + caption (opcional)
   */
  async sendMedia(req: Request, res: Response) {
    try {
      const { sessionName, phoneNumber, caption, messageType, fileUrl, quotedMessageId } = req.body;

      if (!sessionName || !phoneNumber || !fileUrl) {
        return res.status(400).json({
          success: false,
          error: 'sessionName, phoneNumber and fileUrl are required',
        });
      }

      console.log('📤 Enviando mídia via WAHA:', {
        session: sessionName,
        phone: phoneNumber,
        type: messageType,
        hasQuote: !!quotedMessageId,
      });

      const wahaApiKey = 'bd0c416348b2f04d198ff8971b608a87';
      let wahaUrl = '';
      let requestBody: any = {
        session: sessionName,
        chatId: `${phoneNumber}@c.us`,
      };

      // Adicionar quoted message se fornecido
      if (quotedMessageId) {
        requestBody.reply_to = quotedMessageId;
      }

      // Detectar se fileUrl é base64 ou URL
      const isBase64 = fileUrl.startsWith('data:');
      let filePayload: any;

      if (isBase64) {
        // Extrair mimetype e data do base64
        const match = fileUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
          return res.status(400).json({
            success: false,
            error: 'Invalid base64 format',
          });
        }

        const mimetype = match[1];
        const data = match[2];

        // Determinar filename baseado no tipo
        const extension = mimetype.split('/')[1] || 'bin';
        const filename = `media_${Date.now()}.${extension}`;

        filePayload = {
          mimetype,
          filename,
          data,
        };
      } else {
        // URL pública
        filePayload = { url: fileUrl };
      }

      // Determinar endpoint WAHA baseado no tipo de mídia
      switch (messageType) {
        case 'image':
          wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendImage';
          requestBody.file = filePayload;
          if (caption) requestBody.caption = caption;
          break;

        case 'video':
          wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendVideo';
          requestBody.file = filePayload;
          if (caption) requestBody.caption = caption;
          break;

        case 'audio':
        case 'ptt':
          // Áudio/PTT - usar sendVoice com conversão automática do WAHA Plus
          wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendVoice';
          requestBody.file = filePayload;
          requestBody.convert = true; // WAHA Plus converte automaticamente para OPUS/OGG
          break;

        case 'document':
          wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendFile';
          requestBody.file = filePayload;
          if (caption) requestBody.caption = caption;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: `Unsupported media type: ${messageType}`,
          });
      }

      // Enviar via WAHA
      const wahaResponse = await fetch(wahaUrl, {
        method: 'POST',
        headers: {
          'X-Api-Key': wahaApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!wahaResponse.ok) {
        const errorText = await wahaResponse.text();
        throw new Error(`WAHA API error: ${wahaResponse.status} - ${errorText}`);
      }

      const wahaData = (await wahaResponse.json()) as WAHAResponse;
      console.log('✅ Mídia enviada via WAHA:', wahaData.id);

      // Salvar no banco
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
          created_at,
          is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          sessionName,
          phoneNumber,
          phoneNumber, // contactName
          'outgoing',
          messageType,
          caption || '',
          fileUrl,
          wahaData.id,
          'sent',
          new Date(),
          true, // outgoing sempre lida
        ]
      );

      const savedMessage = result[0];

      console.log('✅ Mídia salva no banco:', savedMessage.id);

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
          mediaUrl: savedMessage.media_url,
          createdAt: savedMessage.created_at,
        });
        console.log('🔊 Mídia emitida via WebSocket');
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
          mediaUrl: savedMessage.media_url,
          status: savedMessage.status,
          createdAt: savedMessage.created_at,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao enviar mídia:', error);
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
          // Buscar mensagem usando TypeORM
          const messageToDelete = await this.chatService.getMessageByWhatsappId(revokedMessageId);

          if (messageToDelete) {
            console.log('🗑️ Deletando mensagem TypeORM:', messageToDelete.id);

            // Deletar mensagem (cascade deleta attachments automaticamente)
            await this.chatService.deleteMessage(messageToDelete.id);

            console.log('✅ Mensagem deletada do banco:', messageToDelete.id);

            // Emitir via WebSocket para o frontend remover da UI
            const io = req.app.get('io');
            if (io) {
              io.emit('chat:message-deleted', {
                messageId: messageToDelete.id,
                conversationId: messageToDelete.conversationId,
                whatsappMessageId: revokedMessageId,
              });
              console.log('🔊 Evento de exclusão emitido via WebSocket');
            }

            return res.json({
              success: true,
              message: 'Message revoked and deleted with TypeORM',
              deletedMessageId: messageToDelete.id,
            });
          } else {
            console.log('⚠️ Mensagem não encontrada no banco (TypeORM):', revokedMessageId);
          }
        }

        return res.json({ success: true, message: 'Message revoked event processed' });
      }

      // Filtrar apenas eventos de mensagem (só processar 'message', ignorar 'message.any' para evitar duplicação)
      if (wahaPayload.event !== 'message') {
        console.log('⏭️ Evento ignorado (não é "message"):', wahaPayload.event);
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
      // IMPORTANTE: Ignorar base64 - apenas N8N processa mídias e faz upload no S3
      let mediaUrl = payload._data?.mediaUrl || null;

      // Se mediaUrl for base64, definir como null (N8N processará e fará upload no S3)
      if (mediaUrl && mediaUrl.startsWith('data:')) {
        console.log('🔄 Base64 detectado - será processado pelo N8N workflow');
        mediaUrl = null;
      }

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

      // Salvar mensagem usando ChatService (TypeORM) para criar attachments
      // 1. Buscar ou criar conversa
      const conversation = await this.chatService.findOrCreateConversation({
        phoneNumber: phoneNumber,
        contactName: contactName,
        whatsappInstanceId: session,
      });

      logger.info('[WAHA Webhook] Conversa encontrada/criada:', conversation.id);

      // 2. Determinar se tem mídia para criar attachment
      const hasMedia = mediaUrl && mediaUrl.trim() !== '' && !mediaUrl.startsWith('data:');
      const isMediaType = ['audio', 'image', 'video', 'document', 'ptt', 'sticker'].includes(messageType);

      let savedMessage: any = null;

      if (hasMedia && isMediaType) {
        // Mensagem com mídia: criar com attachment
        console.log('📷 Mensagem com mídia - criando attachment');

        const actualMediaType = messageType === 'ptt' || messageType === 'sticker'
          ? (messageType === 'ptt' ? 'audio' : 'image')
          : messageType;

        savedMessage = await this.chatService.createMessageWithAttachment(
          {
            conversationId: conversation.id,
            direction: direction as 'incoming' | 'outgoing',
            type: actualMediaType as 'audio' | 'image' | 'video' | 'document',
            content: content || '',
            whatsappMessageId: payload.id,
            metadata: {
              timestamp: timestamp,
              status: 'received',
              rawPayload: wahaPayload,
              isGroup: isGroup,
            },
          },
          {
            fileName: `${session}_${Date.now()}.${messageType}`,
            fileUrl: mediaUrl,
            mimeType: payload._data?.mimetype || undefined,
            fileSize: payload._data?.size || undefined,
          }
        );
      } else {
        // Mensagem de texto ou sem mídia processável
        savedMessage = await this.chatService.createMessage({
          conversationId: conversation.id,
          direction: direction as 'incoming' | 'outgoing',
          type: 'text',
          content: content || '',
          whatsappMessageId: payload.id,
          metadata: {
            timestamp: timestamp,
            status: 'received',
            rawPayload: wahaPayload,
            isGroup: isGroup,
            messageType: messageType, // preservar tipo original
          },
        });
      }

      // 3. Atualizar conversation (última mensagem, unread)
      await this.chatService.updateConversation(conversation.id, {
        lastMessage: content || `[${messageType}]`,
        lastMessageAt: new Date(timestamp),
        isUnread: direction === 'incoming',
        unreadCount: direction === 'incoming' ? (conversation.unreadCount || 0) + 1 : conversation.unreadCount || 0,
      });

      console.log('✅ Mensagem salva com TypeORM:', {
        id: savedMessage?.id,
        conversationId: conversation.id,
        hasAttachments: savedMessage?.attachments?.length > 0,
      });

      // Emitir via WebSocket para frontend
      const io = req.app.get('io');
      if (io) {
        io.emit('chat:new-message', {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: session,
          phoneNumber: phoneNumber,
          contactName: contactName,
          direction: direction,
          messageType: messageType,
          content: content || '',
          mediaUrl: hasMedia ? mediaUrl : null,
          attachments: savedMessage?.attachments || [],
          createdAt: new Date(timestamp),
        });

        console.log('🔊 Mensagem emitida via WebSocket com attachments:', savedMessage?.attachments?.length || 0);
      }

      res.json({
        success: true,
        message: 'WAHA webhook received and processed with TypeORM',
        data: {
          id: savedMessage?.id,
          conversationId: conversation.id,
          sessionName: session,
          phoneNumber: phoneNumber,
          hasAttachments: savedMessage?.attachments?.length > 0,
          attachmentsCount: savedMessage?.attachments?.length || 0,
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
