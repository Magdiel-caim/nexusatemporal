"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("./chat.service");
const whatsapp_service_1 = require("./whatsapp.service");
class ChatController {
    chatService = new chat_service_1.ChatService();
    whatsappService = new whatsapp_service_1.WhatsAppService();
    // ===== CONVERSATION ENDPOINTS =====
    getConversations = async (req, res) => {
        try {
            // TODO: Implement normal conversations when needed
            // For now, return empty array (WhatsApp conversations are handled by n8n-webhook.controller)
            res.json([]);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getConversation = async (req, res) => {
        try {
            const { id } = req.params;
            const conversation = await this.chatService.getConversationById(id);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    createConversation = async (req, res) => {
        try {
            const conversation = await this.chatService.createConversation(req.body);
            res.status(201).json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateConversation = async (req, res) => {
        try {
            const { id } = req.params;
            const conversation = await this.chatService.updateConversation(id, req.body);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    markAsRead = async (req, res) => {
        try {
            const { id } = req.params;
            const conversation = await this.chatService.markAsRead(id);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    markAsUnread = async (req, res) => {
        try {
            const { id } = req.params;
            const conversation = await this.chatService.markAsUnread(id);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    assignConversation = async (req, res) => {
        try {
            const { id } = req.params;
            const { userId } = req.body;
            const conversation = await this.chatService.assignConversation(id, userId);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    addTag = async (req, res) => {
        try {
            const { id } = req.params;
            const { tagName } = req.body;
            const conversation = await this.chatService.addTagToConversation(id, tagName);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    removeTag = async (req, res) => {
        try {
            const { id } = req.params;
            const { tagName } = req.body;
            const conversation = await this.chatService.removeTagFromConversation(id, tagName);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== MESSAGE ENDPOINTS =====
    getMessages = async (req, res) => {
        try {
            const { conversationId } = req.params;
            const messages = await this.chatService.getMessagesByConversation(conversationId);
            res.json(messages);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    sendMessage = async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { type, content, senderId, senderName } = req.body;
            const { id: userId } = req.user;
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
                    await this.whatsappService.sendTextMessage(conversation.phoneNumber, content, conversation.whatsappInstanceId);
                }
                // Add other message types as needed
            }
            // Update message status to sent
            const updatedMessage = await this.chatService.updateMessageStatus(message.id, 'sent');
            res.status(201).json(updatedMessage);
        }
        catch (error) {
            console.error('Error sending message:', error);
            res.status(400).json({ error: error.message });
        }
    };
    deleteMessage = async (req, res) => {
        try {
            const { messageId } = req.params;
            await this.chatService.deleteMessage(messageId);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== TAG ENDPOINTS =====
    getTags = async (req, res) => {
        try {
            // TODO: Implement tags when needed
            // For now, return empty array
            res.json([]);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    createTag = async (req, res) => {
        try {
            const tag = await this.chatService.createTag(req.body);
            res.status(201).json(tag);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateTag = async (req, res) => {
        try {
            const { id } = req.params;
            const tag = await this.chatService.updateTag(id, req.body);
            res.json(tag);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteTag = async (req, res) => {
        try {
            const { id } = req.params;
            await this.chatService.deleteTag(id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== QUICK REPLY ENDPOINTS =====
    getQuickReplies = async (req, res) => {
        try {
            // TODO: Implement quick replies when needed
            // For now, return empty array
            res.json([]);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    createQuickReply = async (req, res) => {
        try {
            const { id: userId } = req.user;
            const quickReply = await this.chatService.createQuickReply({
                ...req.body,
                createdBy: userId,
            });
            res.status(201).json(quickReply);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateQuickReply = async (req, res) => {
        try {
            const { id } = req.params;
            const quickReply = await this.chatService.updateQuickReply(id, req.body);
            res.json(quickReply);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteQuickReply = async (req, res) => {
        try {
            const { id } = req.params;
            await this.chatService.deleteQuickReply(id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== STATISTICS =====
    getStats = async (req, res) => {
        try {
            // TODO: Implement stats when needed
            // For now, return empty stats
            res.json({
                total: 0,
                active: 0,
                archived: 0,
                unread: 0,
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== WHATSAPP QR CODE PROXY =====
    getQRCodeProxy = async (req, res) => {
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
            let lastError = null;
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
        }
        catch (error) {
            console.error('[QR Proxy] Error:', error);
            res.status(500).json({ error: error.message });
        }
    };
    // ===== CHANNELS ENDPOINT =====
    /**
     * Lista todos os canais (sessões WhatsApp) com contadores
     * GET /api/chat/channels
     */
    getChannels = async (req, res) => {
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
            const sessions = await response.json();
            console.log(`[Channels] ${sessions.length} sessões encontradas no WAHA`);
            // Importar AppDataSource para queries
            const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('../../database/data-source')));
            // 2. Para cada sessão, contar conversas
            const channels = await Promise.all(sessions.map(async (session) => {
                try {
                    // Contar conversas únicas (chat_id) desta sessão em whatsapp_messages
                    const countResult = await AppDataSource.query(`SELECT COUNT(DISTINCT chat_id) as count
               FROM whatsapp_messages
               WHERE session_id = (
                 SELECT id FROM whatsapp_sessions
                 WHERE session_name = $1
                 LIMIT 1
               )`, [session.name]);
                    const conversationCount = parseInt(countResult[0]?.count || '0');
                    // Contar não lidas
                    const unreadResult = await AppDataSource.query(`SELECT COUNT(DISTINCT chat_id) as count
               FROM whatsapp_messages wm
               WHERE wm.session_id = (
                 SELECT id FROM whatsapp_sessions
                 WHERE session_name = $1
                 LIMIT 1
               )
               AND wm.direction = 'incoming'
               AND wm.read_at IS NULL`, [session.name]);
                    const unreadCount = parseInt(unreadResult[0]?.count || '0');
                    return {
                        sessionName: session.name,
                        phoneNumber: session.config?.phoneNumber || session.me?.id || 'N/A',
                        status: session.status, // WORKING, FAILED, STARTING, STOPPED, etc.
                        conversationCount,
                        unreadCount,
                    };
                }
                catch (error) {
                    console.error(`[Channels] Erro ao processar sessão ${session.name}:`, error.message);
                    return {
                        sessionName: session.name,
                        phoneNumber: session.config?.phoneNumber || 'N/A',
                        status: session.status,
                        conversationCount: 0,
                        unreadCount: 0,
                    };
                }
            }));
            console.log(`[Channels] ${channels.length} canais processados`);
            res.json(channels);
        }
        catch (error) {
            console.error('[Channels] Erro ao buscar canais:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map