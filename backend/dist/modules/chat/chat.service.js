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
exports.ChatService = void 0;
const data_source_1 = require("../../database/data-source");
const conversation_entity_1 = require("./conversation.entity");
const message_entity_1 = require("./message.entity");
const attachment_entity_1 = require("./attachment.entity");
const tag_entity_1 = require("./tag.entity");
const quick_reply_entity_1 = require("./quick-reply.entity");
const typeorm_1 = require("typeorm");
class ChatService {
    conversationRepository = data_source_1.AppDataSource.getRepository(conversation_entity_1.Conversation);
    messageRepository = data_source_1.AppDataSource.getRepository(message_entity_1.Message);
    attachmentRepository = data_source_1.AppDataSource.getRepository(attachment_entity_1.Attachment);
    tagRepository = data_source_1.AppDataSource.getRepository(tag_entity_1.ChatTag);
    quickReplyRepository = data_source_1.AppDataSource.getRepository(quick_reply_entity_1.QuickReply);
    // ===== CONVERSATION OPERATIONS =====
    async createConversation(data) {
        const conversation = this.conversationRepository.create(data);
        return this.conversationRepository.save(conversation);
    }
    async getConversations(filters) {
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.assignedUserId)
            where.assignedUserId = filters.assignedUserId;
        if (filters?.unreadOnly)
            where.isUnread = true;
        if (filters?.search) {
            where.contactName = (0, typeorm_1.Like)(`%${filters.search}%`);
        }
        return this.conversationRepository.find({
            where,
            order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
        });
    }
    async getConversationById(id) {
        return this.conversationRepository.findOne({
            where: { id },
        });
    }
    async getConversationByPhone(phoneNumber) {
        return this.conversationRepository.findOne({
            where: { phoneNumber },
        });
    }
    /**
     * Busca ou cria conversa (útil para webhooks)
     */
    async findOrCreateConversation(data) {
        // Busca por phone + whatsappInstanceId (para múltiplas sessões)
        let conversation = await this.conversationRepository.findOne({
            where: {
                phoneNumber: data.phoneNumber,
                whatsappInstanceId: data.whatsappInstanceId || (0, typeorm_1.IsNull)(),
            },
        });
        if (!conversation) {
            conversation = await this.createConversation(data);
        }
        else {
            // Atualiza nome do contato se mudou
            if (conversation.contactName !== data.contactName) {
                conversation = await this.updateConversation(conversation.id, {
                    contactName: data.contactName,
                });
            }
        }
        return conversation;
    }
    async updateConversation(id, data) {
        await this.conversationRepository.update({ id }, data);
        return this.getConversationById(id);
    }
    async markAsRead(conversationId) {
        return this.updateConversation(conversationId, {
            isUnread: false,
            unreadCount: 0,
        });
    }
    async markAsUnread(conversationId) {
        const messages = await this.getMessagesByConversation(conversationId);
        const unreadCount = messages.filter((m) => m.direction === 'incoming' && m.status !== 'read').length;
        return this.updateConversation(conversationId, {
            isUnread: true,
            unreadCount,
        });
    }
    async assignConversation(conversationId, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        // Adicionar ao log de atividades
        const activityLog = conversation.activityLog || [];
        activityLog.push({
            type: 'assigned',
            userId,
            userName: userName || 'Usuário',
            timestamp: new Date().toISOString(),
            details: { previousUser: conversation.assignedUserId },
        });
        return this.updateConversation(conversationId, {
            assignedUserId: userId,
            activityLog,
        });
    }
    /**
     * Adicionar participante à conversa
     */
    async addParticipant(conversationId, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const participants = conversation.participants || [];
        if (!participants.includes(userId)) {
            participants.push(userId);
        }
        // Log de atividade
        const activityLog = conversation.activityLog || [];
        activityLog.push({
            type: 'assigned',
            userId,
            userName: userName || 'Participante',
            timestamp: new Date().toISOString(),
            details: { action: 'participant_added' },
        });
        return this.updateConversation(conversationId, {
            participants,
            activityLog,
        });
    }
    /**
     * Remover participante da conversa
     */
    async removeParticipant(conversationId, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const participants = (conversation.participants || []).filter(id => id !== userId);
        // Log de atividade
        const activityLog = conversation.activityLog || [];
        activityLog.push({
            type: 'unassigned',
            userId,
            userName: userName || 'Participante',
            timestamp: new Date().toISOString(),
            details: { action: 'participant_removed' },
        });
        return this.updateConversation(conversationId, {
            participants,
            activityLog,
        });
    }
    async addTagToConversation(conversationId, tagName, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const currentTags = conversation.tags || [];
        if (!currentTags.includes(tagName)) {
            currentTags.push(tagName);
            // Log de atividade
            const activityLog = conversation.activityLog || [];
            activityLog.push({
                type: 'tagged',
                userId: userId || 'system',
                userName: userName || 'Sistema',
                timestamp: new Date().toISOString(),
                details: { tag: tagName, action: 'added' },
            });
            await this.updateConversation(conversationId, { tags: currentTags, activityLog });
        }
        return this.getConversationById(conversationId);
    }
    async removeTagFromConversation(conversationId, tagName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const currentTags = conversation.tags || [];
        const updatedTags = currentTags.filter((t) => t !== tagName);
        await this.updateConversation(conversationId, { tags: updatedTags });
        return this.getConversationById(conversationId);
    }
    async archiveConversation(conversationId, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        // Log de atividade
        const activityLog = conversation.activityLog || [];
        activityLog.push({
            type: 'archived',
            userId: userId || 'system',
            userName: userName || 'Sistema',
            timestamp: new Date().toISOString(),
            details: {},
        });
        return this.updateConversation(conversationId, { status: 'archived', activityLog });
    }
    async unarchiveConversation(conversationId) {
        // TEMPORARIAMENTE DESABILITADO - archived column removed from Entity
        // return this.updateConversation(conversationId, { archived: false });
        return this.updateConversation(conversationId, { status: 'active' });
    }
    async resolveConversation(conversationId) {
        return this.updateConversation(conversationId, {
            status: 'closed',
        });
    }
    async reopenConversation(conversationId, userId, userName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        // Log de atividade
        const activityLog = conversation.activityLog || [];
        activityLog.push({
            type: 'reopened',
            userId: userId || 'system',
            userName: userName || 'Sistema',
            timestamp: new Date().toISOString(),
            details: { previousStatus: conversation.status },
        });
        return this.updateConversation(conversationId, {
            status: 'active',
            activityLog,
        });
    }
    async setPriority(conversationId, priority) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        // TEMPORARIAMENTE DESABILITADO - priority column removed from Entity
        // Workaround: salvar priority no metadata
        const metadata = conversation.metadata || {};
        metadata.priority = priority;
        return this.updateConversation(conversationId, { metadata });
    }
    async setCustomAttribute(conversationId, key, value) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const metadata = conversation.metadata || {};
        if (!metadata.customAttributes) {
            metadata.customAttributes = {};
        }
        metadata.customAttributes[key] = value;
        return this.updateConversation(conversationId, { metadata });
    }
    async removeCustomAttribute(conversationId, key) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const metadata = conversation.metadata || {};
        if (metadata.customAttributes) {
            delete metadata.customAttributes[key];
        }
        return this.updateConversation(conversationId, { metadata });
    }
    async getConversationHistory(phoneNumber, limit = 10) {
        return this.conversationRepository.find({
            where: { phoneNumber },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    /**
     * Buscar conversas recentes (últimas X horas)
     */
    async getRecentConversations(phoneNumber, hours = 6) {
        const since = new Date();
        since.setHours(since.getHours() - hours);
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .where('conversation.phoneNumber = :phoneNumber', { phoneNumber })
            .andWhere('conversation.lastMessageAt >= :since', { since })
            .orderBy('conversation.lastMessageAt', 'DESC')
            .getMany();
    }
    // ===== MESSAGE OPERATIONS =====
    async createMessage(data) {
        // Se for mensagem outgoing e não tiver senderName, buscar do usuário
        if (data.direction === 'outgoing' && data.senderId && !data.senderName) {
            try {
                const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('../../database/data-source')));
                const userRepo = AppDataSource.getRepository('User');
                const user = await userRepo.findOne({ where: { id: data.senderId } });
                if (user) {
                    data.senderName = user.name || 'Atendente';
                }
            }
            catch (error) {
                console.error('Erro ao buscar nome do usuário:', error);
            }
        }
        const message = this.messageRepository.create({
            ...data,
            status: data.direction === 'outgoing' ? 'pending' : 'delivered',
            sentAt: new Date(),
        });
        const savedMessage = await this.messageRepository.save(message);
        // Update conversation last message
        await this.conversationRepository.update({ id: data.conversationId }, {
            lastMessageAt: new Date(),
            lastMessagePreview: data.content?.substring(0, 100) || '[Mídia]',
            isUnread: data.direction === 'incoming',
            unreadCount: data.direction === 'incoming'
                ? () => 'unreadCount + 1'
                : undefined,
        });
        return savedMessage;
    }
    async getMessagesByConversation(conversationId) {
        return this.messageRepository.find({
            where: { conversationId, isDeleted: false },
            relations: ['attachments'],
            order: { createdAt: 'ASC' },
        });
    }
    async getMessageByWhatsappId(whatsappMessageId) {
        return this.messageRepository.findOne({
            where: { whatsappMessageId, isDeleted: false },
            relations: ['attachments'],
        });
    }
    async updateMessageStatus(messageId, status) {
        const updateData = { status };
        if (status === 'sent')
            updateData.sentAt = new Date();
        if (status === 'delivered')
            updateData.deliveredAt = new Date();
        if (status === 'read')
            updateData.readAt = new Date();
        await this.messageRepository.update({ id: messageId }, updateData);
        return this.messageRepository.findOne({ where: { id: messageId } });
    }
    async deleteMessage(messageId) {
        await this.messageRepository.update({ id: messageId }, { isDeleted: true });
        return { success: true };
    }
    // ===== ATTACHMENT OPERATIONS =====
    async createAttachment(data) {
        const attachment = this.attachmentRepository.create(data);
        return this.attachmentRepository.save(attachment);
    }
    /**
     * Cria mensagem com attachment (helper para webhooks)
     */
    async createMessageWithAttachment(messageData, attachmentData) {
        // Cria mensagem
        const message = await this.createMessage(messageData);
        // Se tiver attachment, cria
        if (attachmentData) {
            await this.createAttachment({
                messageId: message.id,
                type: messageData.type,
                ...attachmentData,
            });
        }
        // Retorna mensagem com attachments
        return this.messageRepository.findOne({
            where: { id: message.id },
            relations: ['attachments'],
        });
    }
    // ===== TAG OPERATIONS =====
    async createTag(data) {
        const tag = this.tagRepository.create(data);
        return this.tagRepository.save(tag);
    }
    async getTags() {
        return this.tagRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async updateTag(id, data) {
        await this.tagRepository.update({ id }, data);
        return this.tagRepository.findOne({ where: { id } });
    }
    async deleteTag(id) {
        await this.tagRepository.update({ id }, { isActive: false });
        return { success: true };
    }
    // ===== QUICK REPLY OPERATIONS =====
    async createQuickReply(data) {
        const quickReply = this.quickReplyRepository.create(data);
        return this.quickReplyRepository.save(quickReply);
    }
    async getQuickReplies(filters) {
        const where = { isActive: true };
        if (filters?.category)
            where.category = filters.category;
        // Get global replies OR user-specific replies
        const globalReplies = await this.quickReplyRepository.find({
            where: { ...where, isGlobal: true },
            order: { title: 'ASC' },
        });
        const userReplies = filters?.userId
            ? await this.quickReplyRepository.find({
                where: { ...where, createdBy: filters.userId, isGlobal: false },
                order: { title: 'ASC' },
            })
            : [];
        return [...globalReplies, ...userReplies];
    }
    async updateQuickReply(id, data) {
        await this.quickReplyRepository.update({ id }, data);
        return this.quickReplyRepository.findOne({ where: { id } });
    }
    async deleteQuickReply(id) {
        await this.quickReplyRepository.update({ id }, { isActive: false });
        return { success: true };
    }
    // ===== STATISTICS =====
    async getConversationStats() {
        const conversations = await this.conversationRepository.find();
        const totalConversations = conversations.length;
        const activeConversations = conversations.filter((c) => c.status === 'active').length;
        const unreadConversations = conversations.filter((c) => c.isUnread).length;
        const waitingConversations = conversations.filter((c) => c.status === 'waiting').length;
        const byStatus = conversations.reduce((acc, conv) => {
            acc[conv.status] = (acc[conv.status] || 0) + 1;
            return acc;
        }, {});
        return {
            totalConversations,
            activeConversations,
            unreadConversations,
            waitingConversations,
            byStatus,
        };
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map