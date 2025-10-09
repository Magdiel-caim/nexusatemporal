"use strict";
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
            const filters = {
                status: req.query.status,
                assignedUserId: req.query.assignedUserId,
                search: req.query.search,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                unreadOnly: req.query.unreadOnly === 'true',
            };
            const conversations = await this.chatService.getConversations(filters);
            res.json(conversations);
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
            const tags = await this.chatService.getTags();
            res.json(tags);
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
            const { id: userId } = req.user;
            const filters = {
                category: req.query.category,
                userId,
                search: req.query.search,
            };
            const quickReplies = await this.chatService.getQuickReplies(filters);
            res.json(quickReplies);
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
            const stats = await this.chatService.getConversationStats();
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map