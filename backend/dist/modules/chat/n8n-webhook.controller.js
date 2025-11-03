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
exports.N8NWebhookController = void 0;
const media_upload_service_1 = require("../../services/media-upload.service");
const logger_1 = require("../../shared/utils/logger");
const chat_service_1 = require("./chat.service");
class N8NWebhookController {
    mediaUploadService = new media_upload_service_1.MediaUploadService();
    chatService = new chat_service_1.ChatService();
    /**
     * Recebe mensagens do N8N com mídia em base64 e faz upload no S3
     * POST /api/chat/webhook/n8n/message-media
     */
    async receiveMessageWithMedia(req, res) {
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
            const { uploadFile } = await Promise.resolve().then(() => __importStar(require('../../integrations/idrive/s3-client')));
            // Converter base64 para Buffer
            const base64Data = mediaBase64.replace(/^data:.+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            // Determinar extensão e contentType
            let extension = 'bin';
            let contentType = 'application/octet-stream';
            if (messageType === 'image') {
                extension = 'jpg';
                contentType = 'image/jpeg';
            }
            else if (messageType === 'video') {
                extension = 'mp4';
                contentType = 'video/mp4';
            }
            else if (messageType === 'audio' || messageType === 'ptt') {
                extension = 'ogg';
                contentType = 'audio/ogg';
            }
            else if (messageType === 'sticker') {
                extension = 'webp';
                contentType = 'image/webp';
            }
            // Upload no S3
            const timestamp_str = new Date().toISOString().replace(/[:.]/g, '-');
            const s3Key = `whatsapp/${sessionName}/${timestamp_str}-${wahaMessageId || Date.now()}.${extension}`;
            console.log('☁️ Fazendo upload no S3:', s3Key);
            const s3Url = await uploadFile(s3Key, buffer, contentType, {
                source: 'whatsapp',
                session: sessionName,
                type: messageType,
                messageId: wahaMessageId || '',
                phoneNumber: phoneNumber,
            });
            console.log('✅ Upload S3 concluído:', s3Url);
            // 1. Buscar ou criar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber: phoneNumber,
                contactName: contactName || phoneNumber,
                whatsappInstanceId: sessionName,
            });
            console.log('✅ Conversa encontrada/criada:', conversation.id);
            // 2. Criar mensagem com attachment
            const savedMessage = await this.chatService.createMessageWithAttachment({
                conversationId: conversation.id,
                direction: direction,
                type: messageType,
                content: content || '',
                whatsappMessageId: wahaMessageId || undefined,
                metadata: {
                    timestamp: timestamp,
                    uploadedToS3: true,
                },
            }, {
                fileName: `${sessionName}_${Date.now()}.${extension}`,
                fileUrl: s3Url,
                mimeType: contentType,
                fileSize: buffer.length,
            });
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
        }
        catch (error) {
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
    async receiveMessage(req, res) {
        try {
            const payload = req.body;
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
            let uploadedFileInfo = null;
            if (payload.mediaUrl) {
                try {
                    logger_1.logger.info('[Webhook] Iniciando processamento de mídia:', payload.mediaUrl);
                    uploadedFileInfo = await this.mediaUploadService.uploadMediaFromUrl(payload.mediaUrl, undefined // mimeType será detectado automaticamente
                    );
                    logger_1.logger.info('[Webhook] Mídia uploadada com sucesso:', uploadedFileInfo.fileUrl);
                }
                catch (error) {
                    logger_1.logger.error('[Webhook] Erro ao processar mídia:', error.message);
                    // Continua sem bloquear a mensagem
                }
            }
            // 2. Buscar ou criar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber: payload.phoneNumber,
                contactName: payload.contactName || payload.phoneNumber,
                whatsappInstanceId: payload.sessionName,
            });
            logger_1.logger.info('[Webhook] Conversa encontrada/criada:', conversation.id);
            // 3. Salvar mensagem com attachment (se houver mídia)
            const savedMessage = await this.chatService.createMessageWithAttachment({
                conversationId: conversation.id,
                direction: payload.direction,
                type: payload.messageType,
                content: payload.content || '',
                whatsappMessageId: payload.wahaMessageId,
                metadata: {
                    timestamp: payload.timestamp,
                    status: payload.status,
                    rawPayload: payload.rawPayload,
                },
            }, uploadedFileInfo
                ? {
                    fileName: uploadedFileInfo.fileName,
                    fileUrl: uploadedFileInfo.fileUrl,
                    mimeType: uploadedFileInfo.mimeType,
                    fileSize: uploadedFileInfo.fileSize,
                }
                : undefined);
            logger_1.logger.info('[Webhook] Mensagem salva:', savedMessage?.id);
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
        }
        catch (error) {
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
     *
     * REFATORADO: Agora usa TypeORM em vez de queries SQL diretas
     */
    async getMessages(req, res) {
        try {
            const { sessionName } = req.params;
            const { phoneNumber } = req.query;
            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    error: 'phoneNumber query parameter is required',
                });
            }
            // Buscar ou criar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber: phoneNumber,
                contactName: phoneNumber,
                whatsappInstanceId: sessionName,
            });
            // Buscar mensagens da conversa usando TypeORM
            const messages = await this.chatService.getMessagesByConversation(conversation.id);
            // Transformar para formato esperado pelo frontend
            const formattedMessages = messages.map((msg) => ({
                id: msg.id,
                sessionName: conversation.whatsappInstanceId,
                phoneNumber: conversation.phoneNumber,
                contactName: conversation.contactName,
                direction: msg.direction,
                messageType: msg.type,
                content: msg.content || '',
                mediaUrl: msg.attachments && msg.attachments.length > 0 ? msg.attachments[0].fileUrl : undefined,
                status: msg.status,
                createdAt: msg.createdAt,
                attachments: msg.attachments || [],
            }));
            res.json({
                success: true,
                data: formattedMessages,
            });
        }
        catch (error) {
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
     * REFATORADO: Agora usa TypeORM em vez de queries SQL diretas
     */
    async getConversations(req, res) {
        try {
            // Usar ChatService para buscar conversas com TypeORM
            const conversations = await this.chatService.getConversations();
            // Transformar para formato esperado pelo frontend
            const formattedConversations = conversations.map((conv) => ({
                id: conv.id,
                sessionName: conv.whatsappInstanceId || 'default',
                phoneNumber: conv.phoneNumber,
                contactName: conv.contactName,
                lastMessage: conv.lastMessagePreview || '',
                lastMessageAt: conv.lastMessageAt,
                unreadCount: conv.unreadCount || 0,
                chatType: conv.phoneNumber.includes('@g.us') ? 'group' : 'individual',
                status: conv.status,
                tags: conv.tags || [],
            }));
            res.json({
                success: true,
                data: formattedConversations,
            });
        }
        catch (error) {
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
     *
     * REFATORADO: Agora usa TypeORM
     */
    async markAsRead(req, res) {
        try {
            const { sessionName } = req.params;
            const { phoneNumber } = req.query;
            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    error: 'phoneNumber is required',
                });
            }
            // Buscar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber: phoneNumber,
                contactName: phoneNumber,
                whatsappInstanceId: sessionName,
            });
            // Marcar como lida usando TypeORM
            await this.chatService.markAsRead(conversation.id);
            res.json({
                success: true,
                message: 'Messages marked as read',
            });
        }
        catch (error) {
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
     *
     * REFATORADO: Agora usa TypeORM
     */
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            // Deletar usando ChatService (TypeORM)
            await this.chatService.deleteMessage(messageId);
            res.json({
                success: true,
                message: 'Message deleted successfully',
                id: messageId,
            });
        }
        catch (error) {
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
     *
     * REFATORADO: Agora usa TypeORM
     */
    async sendMessage(req, res) {
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
            const wahaData = (await wahaResponse.json());
            console.log('✅ Mensagem enviada via WAHA:', wahaData.id);
            // Buscar ou criar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber,
                contactName: phoneNumber,
                whatsappInstanceId: sessionName,
            });
            // Salvar mensagem usando TypeORM
            const savedMessage = await this.chatService.createMessage({
                conversationId: conversation.id,
                direction: 'outgoing',
                type: 'text',
                content,
                whatsappMessageId: wahaData.id,
            });
            console.log('✅ Mensagem salva no banco:', savedMessage.id);
            // Emitir via WebSocket
            const io = req.app.get('io');
            if (io) {
                io.emit('chat:new-message', {
                    id: savedMessage.id,
                    conversationId: conversation.id,
                    sessionName: sessionName,
                    phoneNumber: phoneNumber,
                    contactName: conversation.contactName,
                    direction: savedMessage.direction,
                    messageType: savedMessage.type,
                    content: savedMessage.content,
                    createdAt: savedMessage.createdAt,
                });
                console.log('🔊 Mensagem emitida via WebSocket');
            }
            res.json({
                success: true,
                data: {
                    id: savedMessage.id,
                    conversationId: conversation.id,
                    sessionName: sessionName,
                    phoneNumber: phoneNumber,
                    direction: savedMessage.direction,
                    messageType: savedMessage.type,
                    content: savedMessage.content,
                    status: savedMessage.status,
                    createdAt: savedMessage.createdAt,
                },
            });
        }
        catch (error) {
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
    async sendMedia(req, res) {
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
            let requestBody = {
                session: sessionName,
                chatId: `${phoneNumber}@c.us`,
            };
            // Adicionar quoted message se fornecido
            if (quotedMessageId) {
                requestBody.reply_to = quotedMessageId;
            }
            // Detectar se fileUrl é base64 ou URL
            const isBase64 = fileUrl.startsWith('data:');
            let filePayload;
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
            }
            else {
                // URL pública
                filePayload = { url: fileUrl };
            }
            // Determinar endpoint WAHA baseado no tipo de mídia
            switch (messageType) {
                case 'image':
                    wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendImage';
                    requestBody.file = filePayload;
                    if (caption)
                        requestBody.caption = caption;
                    break;
                case 'video':
                    wahaUrl = 'https://apiwts.nexusatemporal.com.br/api/sendVideo';
                    requestBody.file = filePayload;
                    if (caption)
                        requestBody.caption = caption;
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
                    if (caption)
                        requestBody.caption = caption;
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
            const wahaData = (await wahaResponse.json());
            console.log('✅ Mídia enviada via WAHA:', wahaData.id);
            // Buscar ou criar conversa
            const conversation = await this.chatService.findOrCreateConversation({
                phoneNumber,
                contactName: phoneNumber,
                whatsappInstanceId: sessionName,
            });
            // Salvar mensagem com mídia usando TypeORM
            // Detectar tipo de mídia para criar attachment
            const actualMediaType = messageType === 'ptt' ? 'audio' : messageType;
            const savedMessage = await this.chatService.createMessageWithAttachment({
                conversationId: conversation.id,
                direction: 'outgoing',
                type: actualMediaType,
                content: caption || '',
                whatsappMessageId: wahaData.id,
            }, {
                fileName: `${sessionName}_${Date.now()}.${messageType}`,
                fileUrl: fileUrl,
                mimeType: 'application/octet-stream', // WAHA retorna mimetype correto no webhook
            });
            console.log('✅ Mídia salva no banco:', savedMessage?.id);
            // Emitir via WebSocket
            const io = req.app.get('io');
            if (io) {
                io.emit('chat:new-message', {
                    id: savedMessage?.id,
                    conversationId: conversation.id,
                    sessionName: sessionName,
                    phoneNumber: phoneNumber,
                    contactName: conversation.contactName,
                    direction: savedMessage?.direction,
                    messageType: messageType,
                    content: caption || '',
                    mediaUrl: fileUrl,
                    attachments: savedMessage?.attachments || [],
                    createdAt: savedMessage?.createdAt,
                });
                console.log('🔊 Mídia emitida via WebSocket');
            }
            res.json({
                success: true,
                data: {
                    id: savedMessage?.id,
                    conversationId: conversation.id,
                    sessionName: sessionName,
                    phoneNumber: phoneNumber,
                    direction: savedMessage?.direction,
                    messageType: messageType,
                    content: caption || '',
                    mediaUrl: fileUrl,
                    status: savedMessage?.status,
                    createdAt: savedMessage?.createdAt,
                    attachments: savedMessage?.attachments || [],
                },
            });
        }
        catch (error) {
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
    async receiveWAHAWebhook(req, res) {
        try {
            const wahaPayload = req.body;
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
                    }
                    else {
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
                }
                else {
                    // Para individuais, remover sufixos @c.us, @lid, @s.whatsapp.net
                    phoneNumber = payload.from.replace(/@c\.us|@lid|@s\.whatsapp\.net/g, '');
                }
            }
            // Nome do contato - extrair de forma mais robusta
            let contactName = phoneNumber; // fallback padrão
            // Tentar extrair o nome de várias fontes possíveis do WAHA
            if (payload._data?.notifyName && typeof payload._data.notifyName === 'string' && payload._data.notifyName.trim()) {
                contactName = payload._data.notifyName.trim();
            }
            else if (payload._data?.Info?.PushName && typeof payload._data.Info.PushName === 'string' && payload._data.Info.PushName.trim()) {
                contactName = payload._data.Info.PushName.trim();
            }
            else if (wahaPayload.me?.pushName && typeof wahaPayload.me.pushName === 'string' && wahaPayload.me.pushName.trim()) {
                contactName = wahaPayload.me.pushName.trim();
            }
            // Validar se o nome não é um código estranho (não deve ter apenas números/símbolos)
            // Se o nome extraído for igual ao phoneNumber ou contiver apenas dígitos, usar phoneNumber
            if (contactName === phoneNumber || /^\d+$/.test(contactName)) {
                contactName = phoneNumber;
            }
            console.log('📝 Nome do contato extraído:', {
                phoneNumber,
                contactName,
                notifyName: payload._data?.notifyName,
                pushName: payload._data?.Info?.PushName,
            });
            // Tipo de mensagem
            const messageType = payload.type || 'text';
            // Conteúdo da mensagem
            const content = payload.body || '';
            // URL de mídia (se houver)
            let mediaUrl = payload._data?.mediaUrl || null;
            let processedMediaInfo = null;
            // Se mediaUrl for base64, fazer upload no S3
            if (mediaUrl && mediaUrl.startsWith('data:') && payload.hasMedia) {
                console.log('📷 Base64 detectado - fazendo upload no S3...');
                try {
                    // Usar MediaUploadService para fazer upload do base64
                    const base64Data = mediaUrl.replace(/^data:.+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    // Detectar mimetype do base64
                    const mimetypeMatch = mediaUrl.match(/^data:([^;]+);base64,/);
                    const mimetype = mimetypeMatch ? mimetypeMatch[1] : 'application/octet-stream';
                    // Determinar extensão
                    let extension = 'bin';
                    if (messageType === 'image')
                        extension = 'jpg';
                    else if (messageType === 'video')
                        extension = 'mp4';
                    else if (messageType === 'audio' || messageType === 'ptt')
                        extension = 'ogg';
                    else if (messageType === 'sticker')
                        extension = 'webp';
                    else if (messageType === 'document')
                        extension = 'pdf';
                    // Upload no S3
                    const { uploadFile } = await Promise.resolve().then(() => __importStar(require('../../integrations/idrive/s3-client')));
                    const timestamp_str = new Date().toISOString().replace(/[:.]/g, '-');
                    const s3Key = `whatsapp/${session}/${timestamp_str}-${payload.id}.${extension}`;
                    console.log('☁️ Fazendo upload no S3:', s3Key);
                    const s3Url = await uploadFile(s3Key, buffer, mimetype, {
                        source: 'whatsapp',
                        session: session,
                        type: messageType,
                        messageId: payload.id,
                        phoneNumber: phoneNumber,
                    });
                    console.log('✅ Upload S3 concluído:', s3Url);
                    processedMediaInfo = {
                        fileUrl: s3Url,
                        fileName: `${session}_${Date.now()}.${extension}`,
                        fileSize: buffer.length,
                        mimeType: mimetype,
                    };
                    // Atualizar mediaUrl para a URL do S3
                    mediaUrl = s3Url;
                }
                catch (error) {
                    console.error('❌ Erro ao fazer upload de mídia base64 no S3:', error.message);
                    // Continuar sem bloquear - mensagem será salva sem mídia
                    mediaUrl = null;
                }
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
            logger_1.logger.info('[WAHA Webhook] Conversa encontrada/criada:', conversation.id);
            // 2. Determinar se tem mídia para criar attachment
            const hasMedia = (mediaUrl && mediaUrl.trim() !== '' && !mediaUrl.startsWith('data:')) || processedMediaInfo;
            const isMediaType = ['audio', 'image', 'video', 'document', 'ptt', 'sticker'].includes(messageType);
            let savedMessage = null;
            if (hasMedia && isMediaType) {
                // Mensagem com mídia: criar com attachment
                console.log('📷 Mensagem com mídia - criando attachment');
                const actualMediaType = messageType === 'ptt' || messageType === 'sticker'
                    ? (messageType === 'ptt' ? 'audio' : 'image')
                    : messageType;
                // Usar processedMediaInfo se disponível (upload S3 de base64), senão usar dados do payload
                const attachmentInfo = processedMediaInfo || (mediaUrl ? {
                    fileName: `${session}_${Date.now()}.${messageType}`,
                    fileUrl: mediaUrl,
                    mimeType: payload._data?.mimetype || undefined,
                    fileSize: payload._data?.size || undefined,
                } : undefined);
                savedMessage = await this.chatService.createMessageWithAttachment({
                    conversationId: conversation.id,
                    direction: direction,
                    type: actualMediaType,
                    content: content || '',
                    whatsappMessageId: payload.id,
                    metadata: {
                        timestamp: timestamp,
                        status: 'received',
                        rawPayload: wahaPayload,
                        isGroup: isGroup,
                        uploadedToS3: !!processedMediaInfo,
                    },
                }, attachmentInfo);
            }
            else {
                // Mensagem de texto ou sem mídia processável
                savedMessage = await this.chatService.createMessage({
                    conversationId: conversation.id,
                    direction: direction,
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
                lastMessagePreview: content || `[${messageType}]`,
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
        }
        catch (error) {
            console.error('❌ Erro ao processar webhook WAHA:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
exports.N8NWebhookController = N8NWebhookController;
//# sourceMappingURL=n8n-webhook.controller.js.map