"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const data_source_1 = require("@/database/data-source");
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
    async assignConversation(conversationId, userId) {
        return this.updateConversation(conversationId, {
            assignedUserId: userId,
        });
    }
    async addTagToConversation(conversationId, tagName) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const currentTags = conversation.tags || [];
        if (!currentTags.includes(tagName)) {
            currentTags.push(tagName);
            await this.updateConversation(conversationId, { tags: currentTags });
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
    // ===== MESSAGE OPERATIONS =====
    async createMessage(data) {
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