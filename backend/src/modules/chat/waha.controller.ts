import { Router, Request, Response } from 'express';
import WAHAService from './waha.service';
import { ChatService } from './chat.service';

const router = Router();
const chatService = new ChatService();

// Configuração WAHA do .env
const wahaConfig = {
  baseUrl: process.env.WAHA_API_URL || 'https://apiwts.nexusatemporal.com.br',
  apiKey: process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87',
  sessionName: process.env.WAHA_SESSION_NAME || 'session_01k8ypeykyzcxjxp9p59821v56',
};

const wahaService = new WAHAService(wahaConfig);

/**
 * ===== STATUS E INFORMAÇÕES =====
 */

// GET /api/chat/waha/status - Status da sessão WAHA
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await wahaService.getSessionStatus();
    res.json(status);
  } catch (error: any) {
    console.error('[WAHA Status] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao obter status da sessão WAHA' });
  }
});

/**
 * ===== CONVERSAS (CHATS) =====
 */

// GET /api/chat/waha/chats - Listar todas as conversas do WhatsApp
router.get('/chats', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const chats = await wahaService.listChats({
      limit,
      offset,
      sortBy: 'messageTimestamp',
      sortOrder: 'desc',
    });

    // Mapear chats WAHA para formato do sistema
    const mappedChats = chats.map((chat) => ({
      id: chat.id,
      phoneNumber: wahaService.extractPhoneFromChatId(chat.id),
      contactName: chat.name || wahaService.extractPhoneFromChatId(chat.id),
      lastMessageAt: new Date(chat.conversationTimestamp * 1000),
      whatsappInstanceId: wahaConfig.sessionName,
      isGroup: wahaService.isGroupChat(chat.id),
    }));

    res.json({ data: mappedChats, total: chats.length });
  } catch (error: any) {
    console.error('[WAHA Chats] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao listar chats' });
  }
});

// GET /api/chat/waha/chats/:chatId - Detalhes de uma conversa
router.get('/chats/:chatId', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    // Buscar overview do chat
    const overview = await wahaService.getChatOverview({ ids: [chatId] });

    if (!overview || overview.length === 0) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }

    const chat = overview[0];
    res.json({
      id: chat.id,
      name: chat.name,
      phoneNumber: wahaService.extractPhoneFromChatId(chat.id),
      picture: chat.picture,
      lastMessage: chat.lastMessage,
    });
  } catch (error: any) {
    console.error('[WAHA Chat Details] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao obter detalhes do chat' });
  }
});

/**
 * ===== MENSAGENS =====
 */

// GET /api/chat/waha/chats/:chatId/messages - Listar mensagens de uma conversa
router.get('/chats/:chatId/messages', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const downloadMedia = req.query.downloadMedia === 'true';

    const messages = await wahaService.listMessages(chatId, {
      limit,
      downloadMedia,
    });

    // Mapear mensagens WAHA para formato do sistema
    const mappedMessages = messages.map((msg) => ({
      id: msg.id,
      chatId: chatId,
      phoneNumber: wahaService.extractPhoneFromChatId(msg.from),
      direction: msg.fromMe ? 'outgoing' : 'incoming',
      type: msg.hasMedia ? 'image' : 'text', // Simplificado - melhorar depois
      content: msg.body,
      mediaUrl: msg.mediaUrl,
      status: wahaService.mapAckToStatus(msg.ack || 0),
      timestamp: new Date(msg.timestamp * 1000),
      ack: msg.ack,
      ackName: msg.ackName,
      quotedMsg: msg.quotedMsg,
    }));

    res.json({ data: mappedMessages, total: messages.length });
  } catch (error: any) {
    console.error('[WAHA Messages] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// POST /api/chat/waha/chats/:chatId/messages/read - Marcar mensagens como lidas
router.post('/chats/:chatId/messages/read', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { messages, days } = req.body;

    await wahaService.markMessagesAsRead(chatId, { messages, days });

    res.json({ success: true, message: 'Mensagens marcadas como lidas' });
  } catch (error: any) {
    console.error('[WAHA Mark Read] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao marcar mensagens como lidas' });
  }
});

/**
 * ===== ENVIO DE MENSAGENS =====
 */

// POST /api/chat/waha/send-text - Enviar mensagem de texto
router.post('/send-text', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, chatId, text, reply_to } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto é obrigatório' });
    }

    // Usar chatId se fornecido, senão formatar phoneNumber
    const targetChatId = chatId || wahaService.formatPhoneToChatId(phoneNumber);

    const result = await wahaService.sendText({
      chatId: targetChatId,
      text,
      reply_to,
    });

    // Salvar mensagem no banco de dados
    const conversation = await chatService.findOrCreateConversation({
      phoneNumber: wahaService.extractPhoneFromChatId(targetChatId),
      contactName: wahaService.extractPhoneFromChatId(targetChatId),
      whatsappInstanceId: wahaConfig.sessionName,
    });

    const message = await chatService.createMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      type: 'text',
      content: text,
      whatsappMessageId: result.id,
    });

    res.json({
      success: true,
      wahaResponse: result,
      message: message,
    });
  } catch (error: any) {
    console.error('[WAHA Send Text] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao enviar mensagem de texto', details: error.message });
  }
});

// POST /api/chat/waha/send-image - Enviar imagem
router.post('/send-image', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, chatId, fileUrl, caption, mimetype, filename } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL da imagem é obrigatória' });
    }

    const targetChatId = chatId || wahaService.formatPhoneToChatId(phoneNumber);

    const result = await wahaService.sendImage({
      
      chatId: targetChatId,
      file: {
        url: fileUrl,
        mimetype: mimetype || 'image/jpeg',
        filename: filename || 'image.jpg',
      },
      caption,
    });

    // Salvar mensagem no banco
    const conversation = await chatService.findOrCreateConversation({
      phoneNumber: wahaService.extractPhoneFromChatId(targetChatId),
      contactName: wahaService.extractPhoneFromChatId(targetChatId),
      whatsappInstanceId: wahaConfig.sessionName,
    });

    const message = await chatService.createMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      type: 'image',
      content: caption || '',
      
      
      whatsappMessageId: result.id,
    });

    res.json({
      success: true,
      wahaResponse: result,
      message: message,
    });
  } catch (error: any) {
    console.error('[WAHA Send Image] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao enviar imagem', details: error.message });
  }
});

// POST /api/chat/waha/send-audio - Enviar áudio
router.post('/send-audio', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, chatId, fileUrl, mimetype } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL do áudio é obrigatória' });
    }

    const targetChatId = chatId || wahaService.formatPhoneToChatId(phoneNumber);

    const result = await wahaService.sendVoice({
      
      chatId: targetChatId,
      file: {
        url: fileUrl,
        mimetype: mimetype || 'audio/ogg; codecs=opus',
      },
      convert: true, // Converter para formato OPUS se necessário
    });

    // Salvar no banco
    const conversation = await chatService.findOrCreateConversation({
      phoneNumber: wahaService.extractPhoneFromChatId(targetChatId),
      contactName: wahaService.extractPhoneFromChatId(targetChatId),
      whatsappInstanceId: wahaConfig.sessionName,
    });

    const message = await chatService.createMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      type: 'audio',
      
      
      whatsappMessageId: result.id,
    });

    res.json({
      success: true,
      wahaResponse: result,
      message: message,
    });
  } catch (error: any) {
    console.error('[WAHA Send Audio] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao enviar áudio', details: error.message });
  }
});

// POST /api/chat/waha/send-video - Enviar vídeo
router.post('/send-video', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, chatId, fileUrl, caption, mimetype, filename } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL do vídeo é obrigatória' });
    }

    const targetChatId = chatId || wahaService.formatPhoneToChatId(phoneNumber);

    const result = await wahaService.sendVideo({
      
      chatId: targetChatId,
      file: {
        url: fileUrl,
        mimetype: mimetype || 'video/mp4',
        filename: filename || 'video.mp4',
      },
      caption,
      convert: true,
    });

    // Salvar no banco
    const conversation = await chatService.findOrCreateConversation({
      phoneNumber: wahaService.extractPhoneFromChatId(targetChatId),
      contactName: wahaService.extractPhoneFromChatId(targetChatId),
      whatsappInstanceId: wahaConfig.sessionName,
    });

    const message = await chatService.createMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      type: 'video',
      content: caption || '',
      
      
      whatsappMessageId: result.id,
    });

    res.json({
      success: true,
      wahaResponse: result,
      message: message,
    });
  } catch (error: any) {
    console.error('[WAHA Send Video] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao enviar vídeo', details: error.message });
  }
});

// POST /api/chat/waha/send-file - Enviar arquivo/documento
router.post('/send-file', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, chatId, fileUrl, caption, mimetype, filename } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL do arquivo é obrigatória' });
    }

    const targetChatId = chatId || wahaService.formatPhoneToChatId(phoneNumber);

    const result = await wahaService.sendFile({
      
      chatId: targetChatId,
      file: {
        url: fileUrl,
        mimetype: mimetype || 'application/pdf',
        filename: filename || 'document.pdf',
      },
      caption,
    });

    // Salvar no banco
    const conversation = await chatService.findOrCreateConversation({
      phoneNumber: wahaService.extractPhoneFromChatId(targetChatId),
      contactName: wahaService.extractPhoneFromChatId(targetChatId),
      whatsappInstanceId: wahaConfig.sessionName,
    });

    const message = await chatService.createMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      type: 'document',
      content: caption || filename || '',
      
      
      whatsappMessageId: result.id,
    });

    res.json({
      success: true,
      wahaResponse: result,
      message: message,
    });
  } catch (error: any) {
    console.error('[WAHA Send File] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao enviar arquivo', details: error.message });
  }
});

export default router;
