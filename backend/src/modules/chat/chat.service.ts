import { AppDataSource } from '@/database/data-source';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Attachment } from './attachment.entity';
import { ChatTag } from './tag.entity';
import { QuickReply } from './quick-reply.entity';
import { Like, In, IsNull, Not } from 'typeorm';

export class ChatService {
  private conversationRepository = AppDataSource.getRepository(Conversation);
  private messageRepository = AppDataSource.getRepository(Message);
  private attachmentRepository = AppDataSource.getRepository(Attachment);
  private tagRepository = AppDataSource.getRepository(ChatTag);
  private quickReplyRepository = AppDataSource.getRepository(QuickReply);

  // ===== CONVERSATION OPERATIONS =====

  async createConversation(data: {
    contactName: string;
    phoneNumber: string;
    leadId?: string;
    whatsappInstanceId?: string;
    assignedUserId?: string;
  }) {
    const conversation = this.conversationRepository.create(data);
    return this.conversationRepository.save(conversation);
  }

  async getConversations(filters?: {
    status?: string;
    assignedUserId?: string;
    search?: string;
    tags?: string[];
    unreadOnly?: boolean;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.assignedUserId) where.assignedUserId = filters.assignedUserId;
    if (filters?.unreadOnly) where.isUnread = true;

    if (filters?.search) {
      where.contactName = Like(`%${filters.search}%`);
    }

    return this.conversationRepository.find({
      where,
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async getConversationById(id: string) {
    return this.conversationRepository.findOne({
      where: { id },
    });
  }

  async getConversationByPhone(phoneNumber: string) {
    return this.conversationRepository.findOne({
      where: { phoneNumber },
    });
  }

  async updateConversation(id: string, data: Partial<Conversation>) {
    await this.conversationRepository.update({ id }, data);
    return this.getConversationById(id);
  }

  async markAsRead(conversationId: string) {
    return this.updateConversation(conversationId, {
      isUnread: false,
      unreadCount: 0,
    });
  }

  async markAsUnread(conversationId: string) {
    const messages = await this.getMessagesByConversation(conversationId);
    const unreadCount = messages.filter((m) => m.direction === 'incoming' && m.status !== 'read').length;

    return this.updateConversation(conversationId, {
      isUnread: true,
      unreadCount,
    });
  }

  async assignConversation(conversationId: string, userId: string) {
    return this.updateConversation(conversationId, {
      assignedUserId: userId,
    });
  }

  async addTagToConversation(conversationId: string, tagName: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const currentTags = conversation.tags || [];
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
      await this.updateConversation(conversationId, { tags: currentTags });
    }

    return this.getConversationById(conversationId);
  }

  async removeTagFromConversation(conversationId: string, tagName: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const currentTags = conversation.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagName);
    await this.updateConversation(conversationId, { tags: updatedTags });

    return this.getConversationById(conversationId);
  }

  async archiveConversation(conversationId: string) {
    return this.updateConversation(conversationId, {
      status: 'archived',
    });
  }

  async unarchiveConversation(conversationId: string) {
    return this.updateConversation(conversationId, {
      status: 'active',
    });
  }

  async resolveConversation(conversationId: string) {
    return this.updateConversation(conversationId, {
      status: 'closed',
    });
  }

  async reopenConversation(conversationId: string) {
    return this.updateConversation(conversationId, {
      status: 'active',
    });
  }

  async setPriority(conversationId: string, priority: 'low' | 'normal' | 'high' | 'urgent') {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const metadata = conversation.metadata || {};
    metadata.priority = priority;

    return this.updateConversation(conversationId, { metadata });
  }

  async setCustomAttribute(conversationId: string, key: string, value: any) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const metadata = conversation.metadata || {};
    if (!metadata.customAttributes) {
      metadata.customAttributes = {};
    }
    metadata.customAttributes[key] = value;

    return this.updateConversation(conversationId, { metadata });
  }

  async removeCustomAttribute(conversationId: string, key: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const metadata = conversation.metadata || {};
    if (metadata.customAttributes) {
      delete metadata.customAttributes[key];
    }

    return this.updateConversation(conversationId, { metadata });
  }

  async getConversationHistory(phoneNumber: string, limit: number = 10) {
    return this.conversationRepository.find({
      where: { phoneNumber },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ===== MESSAGE OPERATIONS =====

  async createMessage(data: {
    conversationId: string;
    direction: 'incoming' | 'outgoing';
    type: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location' | 'contact';
    content?: string;
    senderId?: string;
    senderName?: string;
    whatsappMessageId?: string;
    metadata?: Record<string, any>;
  }) {
    const message = this.messageRepository.create({
      ...data,
      status: data.direction === 'outgoing' ? 'pending' : 'delivered',
      sentAt: new Date(),
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation last message
    await this.conversationRepository.update(
      { id: data.conversationId },
      {
        lastMessageAt: new Date(),
        lastMessagePreview: data.content?.substring(0, 100) || '[Mídia]',
        isUnread: data.direction === 'incoming',
        unreadCount: data.direction === 'incoming'
          ? () => 'unreadCount + 1'
          : undefined as any,
      }
    );

    return savedMessage;
  }

  async getMessagesByConversation(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId, isDeleted: false },
      relations: ['attachments'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateMessageStatus(
    messageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed'
  ) {
    const updateData: any = { status };

    if (status === 'sent') updateData.sentAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (status === 'read') updateData.readAt = new Date();

    await this.messageRepository.update({ id: messageId }, updateData);
    return this.messageRepository.findOne({ where: { id: messageId } });
  }

  async deleteMessage(messageId: string) {
    await this.messageRepository.update({ id: messageId }, { isDeleted: true });
    return { success: true };
  }

  // ===== ATTACHMENT OPERATIONS =====

  async createAttachment(data: {
    messageId: string;
    type: 'audio' | 'image' | 'video' | 'document';
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    thumbnailUrl?: string;
  }) {
    const attachment = this.attachmentRepository.create(data);
    return this.attachmentRepository.save(attachment);
  }

  // ===== TAG OPERATIONS =====

  async createTag(data: {
    name: string;
    color?: string;
    description?: string;
  }) {
    const tag = this.tagRepository.create(data);
    return this.tagRepository.save(tag);
  }

  async getTags() {
    return this.tagRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async updateTag(id: string, data: Partial<ChatTag>) {
    await this.tagRepository.update({ id }, data);
    return this.tagRepository.findOne({ where: { id } });
  }

  async deleteTag(id: string) {
    await this.tagRepository.update({ id }, { isActive: false });
    return { success: true };
  }

  // ===== QUICK REPLY OPERATIONS =====

  async createQuickReply(data: {
    title: string;
    content: string;
    shortcut?: string;
    category?: string;
    createdBy?: string;
    isGlobal?: boolean;
  }) {
    const quickReply = this.quickReplyRepository.create(data);
    return this.quickReplyRepository.save(quickReply);
  }

  async getQuickReplies(filters?: {
    category?: string;
    userId?: string;
    search?: string;
  }) {
    const where: any = { isActive: true };

    if (filters?.category) where.category = filters.category;

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

  async updateQuickReply(id: string, data: Partial<QuickReply>) {
    await this.quickReplyRepository.update({ id }, data);
    return this.quickReplyRepository.findOne({ where: { id } });
  }

  async deleteQuickReply(id: string) {
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
    }, {} as Record<string, number>);

    return {
      totalConversations,
      activeConversations,
      unreadConversations,
      waitingConversations,
      byStatus,
    };
  }
}
