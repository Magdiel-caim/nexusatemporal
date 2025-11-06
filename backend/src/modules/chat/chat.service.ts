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

  /**
   * Busca ou cria conversa (útil para webhooks)
   */
  async findOrCreateConversation(data: {
    phoneNumber: string;
    contactName: string;
    whatsappInstanceId?: string;
    leadId?: string;
  }) {
    // Busca por phone + whatsappInstanceId (para múltiplas sessões)
    let conversation = await this.conversationRepository.findOne({
      where: {
        phoneNumber: data.phoneNumber,
        whatsappInstanceId: data.whatsappInstanceId || IsNull(),
      },
    });

    if (!conversation) {
      conversation = await this.createConversation(data);
    } else {
      // Atualiza nome do contato se mudou
      if (conversation.contactName !== data.contactName) {
        conversation = await this.updateConversation(conversation.id, {
          contactName: data.contactName,
        }) as Conversation;
      }
    }

    return conversation;
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

  async assignConversation(conversationId: string, userId: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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
  async addParticipant(conversationId: string, userId: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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
  async removeParticipant(conversationId: string, userId: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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

  async addTagToConversation(conversationId: string, tagName: string, userId?: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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

  async removeTagFromConversation(conversationId: string, tagName: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const currentTags = conversation.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagName);
    await this.updateConversation(conversationId, { tags: updatedTags });

    return this.getConversationById(conversationId);
  }

  async archiveConversation(conversationId: string, userId?: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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

  async unarchiveConversation(conversationId: string) {
    // TEMPORARIAMENTE DESABILITADO - archived column removed from Entity
    // return this.updateConversation(conversationId, { archived: false });
    return this.updateConversation(conversationId, { status: 'active' });
  }

  async resolveConversation(conversationId: string) {
    return this.updateConversation(conversationId, {
      status: 'closed',
    });
  }

  async reopenConversation(conversationId: string, userId?: string, userName?: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

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

  async setPriority(conversationId: string, priority: 'low' | 'medium' | 'high' | null) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // TEMPORARIAMENTE DESABILITADO - priority column removed from Entity
    // Workaround: salvar priority no metadata
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

  /**
   * Buscar conversas recentes (últimas X horas)
   */
  async getRecentConversations(phoneNumber: string, hours: number = 6) {
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
    // Se for mensagem outgoing e não tiver senderName, buscar do usuário
    if (data.direction === 'outgoing' && data.senderId && !data.senderName) {
      try {
        const { AppDataSource } = await import('@/database/data-source');
        const userRepo = AppDataSource.getRepository('User');
        const user = await userRepo.findOne({ where: { id: data.senderId } });
        if (user) {
          data.senderName = user.name || 'Atendente';
        }
      } catch (error) {
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

  async getMessageByWhatsappId(whatsappMessageId: string) {
    return this.messageRepository.findOne({
      where: { whatsappMessageId, isDeleted: false },
      relations: ['attachments'],
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

  /**
   * Cria mensagem com attachment (helper para webhooks)
   */
  async createMessageWithAttachment(messageData: {
    conversationId: string;
    direction: 'incoming' | 'outgoing';
    type: 'audio' | 'image' | 'video' | 'document';
    content?: string;
    whatsappMessageId?: string;
    metadata?: Record<string, any>;
  }, attachmentData?: {
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    thumbnailUrl?: string;
  }) {
    // Cria mensagem
    const message = await this.createMessage(messageData);

    // Se tiver attachment, cria
    if (attachmentData) {
      await this.createAttachment({
        messageId: message.id,
        type: messageData.type as 'audio' | 'image' | 'video' | 'document',
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
