import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { WhatsAppService } from './whatsapp.service';

export class ChatController {
  private chatService = new ChatService();
  private whatsappService = new WhatsAppService();

  // ===== CONVERSATION ENDPOINTS =====

  getConversations = async (req: Request, res: Response) => {
    try {
      // TODO: Implement normal conversations when needed
      // For now, return empty array (WhatsApp conversations are handled by n8n-webhook.controller)
      res.json([]);
    } catch (error: any) {
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
      const conversation = await this.chatService.assignConversation(id, userId);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  addTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tagName } = req.body;
      const conversation = await this.chatService.addTagToConversation(id, tagName);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  removeTag = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tagName } = req.body;
      const conversation = await this.chatService.removeTagFromConversation(id, tagName);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== MESSAGE ENDPOINTS =====

  getMessages = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const messages = await this.chatService.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { type, content, senderId, senderName } = req.body;
      const { id: userId } = req.user as any;

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

  // ===== QUICK REPLY ENDPOINTS =====

  getQuickReplies = async (req: Request, res: Response) => {
    try {
      // TODO: Implement quick replies when needed
      // For now, return empty array
      res.json([]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createQuickReply = async (req: Request, res: Response) => {
    try {
      const { id: userId } = req.user as any;
      const quickReply = await this.chatService.createQuickReply({
        ...req.body,
        createdBy: userId,
      });
      res.status(201).json(quickReply);
    } catch (error: any) {
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
}
