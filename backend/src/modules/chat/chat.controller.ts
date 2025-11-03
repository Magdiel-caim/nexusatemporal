import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { WhatsAppService } from './whatsapp.service';
import { WAHASessionService } from './waha-session.service';

export class ChatController {
  private chatService = new ChatService();
  private whatsappService = new WhatsAppService();
  private wahaService = new WAHASessionService();

  /**
   * Helper: Garante que uma conversa existe no banco para conversas WhatsApp
   * Se o ID começar com "whatsapp-", extrai sessionName e phoneNumber e cria/busca conversa
   */
  private async ensureConversationExists(conversationId: string): Promise<string> {
    // Se não for conversa WhatsApp, retorna o ID como está
    if (!conversationId.startsWith('whatsapp-')) {
      return conversationId;
    }

    // Parse: whatsapp-sessionName-phoneNumber
    const parts = conversationId.split('-');
    if (parts.length < 3) {
      throw new Error('Invalid WhatsApp conversation ID format');
    }

    const sessionName = parts[1];
    const phoneNumber = parts.slice(2).join('-'); // Reconstrói phoneNumber (pode conter hífens)

    // Buscar conversa existente por whatsappInstanceId + phoneNumber
    const existingConversation = await this.chatService.getConversations({
      search: phoneNumber,
    });

    const found = existingConversation.find(
      (c) => c.whatsappInstanceId === sessionName && c.phoneNumber === phoneNumber
    );

    if (found) {
      console.log(`✅ Conversa WhatsApp encontrada no banco:`, found.id);
      return found.id;
    }

    // Não existe - criar nova conversa
    console.log(`➕ Criando nova conversa WhatsApp:`, { sessionName, phoneNumber });
    const newConversation = await this.chatService.createConversation({
      contactName: phoneNumber, // Será atualizado depois com nome real
      phoneNumber: phoneNumber,
      whatsappInstanceId: sessionName,
    });

    console.log(`✅ Conversa WhatsApp criada:`, newConversation.id);
    return newConversation.id;
  }

  // ===== CONVERSATION ENDPOINTS =====

  getConversations = async (req: Request, res: Response) => {
    try {
      const { sessionName } = req.query;

      console.log('[getConversations] Buscando conversas do BANCO...', { sessionName });

      // ⚠️ IMPORTANTE: NÃO buscar do WAHA (histórico antigo)
      // Apenas retornar conversas que já foram salvas via WEBHOOK
      // Isso garante que apenas NOVAS mensagens apareçam no sistema

      // Buscar conversas do banco de dados (apenas as que vieram via webhook)
      const filters: any = {};

      if (sessionName) {
        filters.whatsappInstanceId = sessionName;
      }

      const conversations = await this.chatService.getConversations(filters);

      console.log(`[getConversations] ${conversations.length} conversas encontradas no banco`);

      res.json(conversations);
    } catch (error: any) {
      console.error('[getConversations] Erro:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await this.chatService.getConversationById(id);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createConversation = async (req: Request, res: Response) => {
    try {
      const conversation = await this.chatService.createConversation(req.body);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await this.chatService.updateConversation(id, req.body);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await this.chatService.markAsRead(id);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  markAsUnread = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await this.chatService.markAsUnread(id);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  assignConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.assignConversation(conversationId, userId);
      res.json(conversation);
    } catch (error: any) {
      console.error('[assignConversation] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  addTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tagName } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.addTagToConversation(conversationId, tagName);
      res.json(conversation);
    } catch (error: any) {
      console.error('[addTag] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  removeTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tagName } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.removeTagFromConversation(conversationId, tagName);
      res.json(conversation);
    } catch (error: any) {
      console.error('[removeTag] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  // ===== MESSAGE ENDPOINTS =====

  getMessages = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { sessionName, chatId } = req.query;

      console.log('[getMessages] Buscando mensagens...', { conversationId, sessionName, chatId });

      // Se tiver sessionName e chatId, buscar do WAHA diretamente
      if (sessionName && chatId) {
        const messages = await this.wahaService.getMessages(
          sessionName as string,
          chatId as string,
          100
        );
        console.log(`[getMessages] ${messages.length} mensagens encontradas no WAHA`);
        res.json(messages);
        return;
      }

      // Caso contrário, buscar do banco local
      const messages = await this.chatService.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error: any) {
      console.error('[getMessages] Erro:', error);
      res.status(400).json({ error: error.message });
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { type, content, senderId, senderName } = req.body;
      const userId = (req.user as any)?.userId;

      // Create message in database
      const message = await this.chatService.createMessage({
        conversationId,
        direction: 'outgoing',
        type,
        content,
        senderId: senderId || userId,
        senderName,
      });

      // Get conversation to send via WhatsApp
      const conversation = await this.chatService.getConversationById(conversationId);

      if (conversation) {
        // Send via WhatsApp based on message type
        if (type === 'text' && content) {
          await this.whatsappService.sendTextMessage(
            conversation.phoneNumber,
            content,
            conversation.whatsappInstanceId
          );
        }
        // Add other message types as needed
      }

      // Update message status to sent
      const updatedMessage = await this.chatService.updateMessageStatus(message.id, 'sent');

      res.status(201).json(updatedMessage);
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Envia mensagem WhatsApp via WAHA
   * POST /api/chat/whatsapp/send
   */
  sendWhatsAppMessage = async (req: Request, res: Response) => {
    try {
      const { sessionName, chatId, text } = req.body;

      console.log('[sendWhatsAppMessage] Enviando mensagem...', { sessionName, chatId });

      if (!sessionName || !chatId || !text) {
        return res.status(400).json({ error: 'sessionName, chatId and text are required' });
      }

      // Enviar via WAHA
      const result = await this.wahaService.sendTextMessage(sessionName, chatId, text);
      console.log('[sendWhatsAppMessage] Mensagem enviada com sucesso');

      res.status(201).json(result);
    } catch (error: any) {
      console.error('[sendWhatsAppMessage] Erro:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Deleta mensagem WhatsApp via WAHA
   * DELETE /api/chat/whatsapp/messages/:messageId
   */
  deleteWhatsAppMessage = async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { sessionName, chatId } = req.body;

      console.log('[deleteWhatsAppMessage] Deletando mensagem...', { messageId, sessionName, chatId });

      if (!sessionName || !chatId) {
        return res.status(400).json({ error: 'sessionName and chatId are required' });
      }

      // Deletar via WAHA
      await this.wahaService.deleteMessage(sessionName, chatId, messageId);
      console.log('[deleteWhatsAppMessage] Mensagem deletada com sucesso');

      res.json({ success: true });
    } catch (error: any) {
      console.error('[deleteWhatsAppMessage] Erro:', error);
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Edita mensagem WhatsApp via WAHA
   * PATCH /api/chat/whatsapp/messages/:messageId
   */
  editWhatsAppMessage = async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { sessionName, chatId, text } = req.body;

      console.log('[editWhatsAppMessage] Editando mensagem...', { messageId, sessionName, chatId });

      if (!sessionName || !chatId || !text) {
        return res.status(400).json({ error: 'sessionName, chatId and text are required' });
      }

      // Editar via WAHA
      const result = await this.wahaService.editMessage(sessionName, chatId, messageId, text);
      console.log('[editWhatsAppMessage] Mensagem editada com sucesso');

      res.json(result);
    } catch (error: any) {
      console.error('[editWhatsAppMessage] Erro:', error);
      res.status(400).json({ error: error.message });
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      await this.chatService.deleteMessage(messageId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== TAG ENDPOINTS =====

  getTags = async (req: Request, res: Response) => {
    try {
      // TODO: Implement tags when needed
      // For now, return empty array
      res.json([]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createTag = async (req: Request, res: Response) => {
    try {
      const tag = await this.chatService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tag = await this.chatService.updateTag(id, req.body);
      res.json(tag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.chatService.deleteTag(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== CONVERSATION ACTIONS =====

  archiveConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.archiveConversation(conversationId);
      res.json(conversation);
    } catch (error: any) {
      console.error('[archiveConversation] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  unarchiveConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.unarchiveConversation(conversationId);
      res.json(conversation);
    } catch (error: any) {
      console.error('[unarchiveConversation] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  resolveConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.resolveConversation(conversationId);
      res.json(conversation);
    } catch (error: any) {
      console.error('[resolveConversation] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  reopenConversation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.reopenConversation(conversationId);
      res.json(conversation);
    } catch (error: any) {
      console.error('[reopenConversation] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  setPriority = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.setPriority(conversationId, priority);
      res.json(conversation);
    } catch (error: any) {
      console.error('[setPriority] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  setCustomAttribute = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { key, value } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.setCustomAttribute(conversationId, key, value);
      res.json(conversation);
    } catch (error: any) {
      console.error('[setCustomAttribute] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  removeCustomAttribute = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { key } = req.body;
      const conversationId = await this.ensureConversationExists(id);
      const conversation = await this.chatService.removeCustomAttribute(conversationId, key);
      res.json(conversation);
    } catch (error: any) {
      console.error('[removeCustomAttribute] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  getConversationHistory = async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const conversations = await this.chatService.getConversationHistory(phoneNumber, limit);
      res.json(conversations);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== QUICK REPLY ENDPOINTS =====

  getQuickReplies = async (req: Request, res: Response) => {
    try {
      const { category, search } = req.query;

      // req.user pode ser undefined se autenticação falhou, mas quick replies são globais
      const userId = (req.user as any)?.id || undefined;

      const quickReplies = await this.chatService.getQuickReplies({
        category: category as string,
        userId,
        search: search as string,
      });

      res.json(quickReplies);
    } catch (error: any) {
      console.error('[getQuickReplies] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  createQuickReply = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.userId;
      const quickReply = await this.chatService.createQuickReply({
        ...req.body,
        createdBy: userId,
      });
      res.status(201).json(quickReply);
    } catch (error: any) {
      console.error('[createQuickReply] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  };

  updateQuickReply = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const quickReply = await this.chatService.updateQuickReply(id, req.body);
      res.json(quickReply);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteQuickReply = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.chatService.deleteQuickReply(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== STATISTICS =====

  getStats = async (req: Request, res: Response) => {
    try {
      // TODO: Implement stats when needed
      // For now, return empty stats
      res.json({
        total: 0,
        active: 0,
        archived: 0,
        unread: 0,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== WHATSAPP QR CODE PROXY =====

  getQRCodeProxy = async (req: Request, res: Response) => {
    try {
      console.log('[QR Proxy] Request received:', req.query);
      const { session } = req.query;

      if (!session) {
        console.log('[QR Proxy] Error: Session name not provided');
        return res.status(400).json({ error: 'Session name is required' });
      }

      // Fetch QR Code from WAHA with authentication and retry logic
      const wahaUrl = `https://apiwts.nexusatemporal.com.br/api/screenshot?session=${session}&screenshotType=qr`;
      const wahaApiKey = 'bd0c416348b2f04d198ff8971b608a87';

      let lastError: any = null;
      const maxRetries = 5; // Tentar até 5 vezes
      const retryDelay = 2000; // 2 segundos entre tentativas

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`[QR Proxy] Attempt ${attempt}/${maxRetries} - Fetching from WAHA:`, wahaUrl);

        const response = await fetch(wahaUrl, {
          headers: {
            'X-Api-Key': wahaApiKey,
          },
        });

        console.log(`[QR Proxy] Attempt ${attempt}/${maxRetries} - WAHA response status:`, response.status);

        if (response.ok) {
          // Sucesso!
          const imageBuffer = await response.arrayBuffer();
          console.log('[QR Proxy] Image buffer size:', imageBuffer.byteLength);

          // Set proper headers for image
          res.set('Content-Type', 'image/jpeg');
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.send(Buffer.from(imageBuffer));
          console.log('[QR Proxy] Image sent successfully');
          return;
        }

        // Se recebeu 422 (QR Code não pronto) e ainda tem tentativas, espera e tenta novamente
        if (response.status === 422 && attempt < maxRetries) {
          console.log(`[QR Proxy] QR Code not ready yet (422), waiting ${retryDelay}ms before retry ${attempt + 1}...`);
          lastError = { status: response.status, message: 'QR Code not ready' };
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // Outros erros ou última tentativa falhou
        lastError = { status: response.status, message: await response.text() };
        if (attempt === maxRetries) {
          break;
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      console.log('[QR Proxy] All retry attempts failed:', lastError);
      return res.status(lastError.status || 500).json({
        error: 'Failed to fetch QR Code from WAHA after multiple attempts',
        details: lastError.message
      });

    } catch (error: any) {
      console.error('[QR Proxy] Error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ===== CHANNELS ENDPOINT =====

  /**
   * Lista todos os canais (sessões WhatsApp) com contadores
   * GET /api/chat/channels
   */
  getChannels = async (req: Request, res: Response) => {
    try {
      console.log('[Channels] Buscando canais disponíveis...');

      // 1. Buscar sessões ativas do WAHA
      const wahaUrl = process.env.WAHA_URL || 'https://apiwts.nexusatemporal.com.br';
      const wahaApiKey = process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87';

      const response = await fetch(`${wahaUrl}/api/sessions`, {
        headers: { 'X-Api-Key': wahaApiKey },
      });

      if (!response.ok) {
        throw new Error(`WAHA API error: ${response.status}`);
      }

      const sessions = await response.json() as any[];
      console.log(`[Channels] ${sessions.length} sessões encontradas no WAHA`);

      // 🔍 Filtrar apenas sessões "Atemporal"
      const atemporalSessions = sessions.filter((session) => {
        const sessionName = (session.name || '').toLowerCase();
        const pushName = (session.me?.pushName || '').toLowerCase();
        return pushName.includes('atemporal') || sessionName.includes('atemporal');
      });

      console.log(`[Channels] ${atemporalSessions.length} sessões Atemporal filtradas`);

      // Importar AppDataSource para queries
      const { AppDataSource } = await import('@/database/data-source');

      // 2. Para cada sessão Atemporal, contar conversas
      const channels = await Promise.all(
        atemporalSessions.map(async (session: any) => {
          try {
            // Contar conversas únicas (chat_id) desta sessão em whatsapp_messages
            const countResult = await AppDataSource.query(
              `SELECT COUNT(DISTINCT chat_id) as count
               FROM whatsapp_messages
               WHERE session_id = (
                 SELECT id FROM whatsapp_sessions
                 WHERE session_name = $1
                 LIMIT 1
               )`,
              [session.name]
            );

            const conversationCount = parseInt(countResult[0]?.count || '0');

            // Contar não lidas
            const unreadResult = await AppDataSource.query(
              `SELECT COUNT(DISTINCT chat_id) as count
               FROM whatsapp_messages wm
               WHERE wm.session_id = (
                 SELECT id FROM whatsapp_sessions
                 WHERE session_name = $1
                 LIMIT 1
               )
               AND wm.direction = 'incoming'
               AND wm.read_at IS NULL`,
              [session.name]
            );

            const unreadCount = parseInt(unreadResult[0]?.count || '0');

            return {
              sessionName: session.name,
              friendlyName: session.me?.pushName || session.name, // ✨ Nome amigável (ex: "Atemporal")
              phoneNumber: session.config?.phoneNumber || session.me?.id || 'N/A',
              status: session.status, // WORKING, FAILED, STARTING, STOPPED, etc.
              conversationCount,
              unreadCount,
            };
          } catch (error: any) {
            console.error(`[Channels] Erro ao processar sessão ${session.name}:`, error.message);
            return {
              sessionName: session.name,
              friendlyName: session.me?.pushName || session.name, // ✨ Nome amigável (ex: "Atemporal")
              phoneNumber: session.config?.phoneNumber || 'N/A',
              status: session.status,
              conversationCount: 0,
              unreadCount: 0,
            };
          }
        })
      );

      console.log(`[Channels] ${channels.length} canais processados`);

      res.json(channels);
    } catch (error: any) {
      console.error('[Channels] Erro ao buscar canais:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
