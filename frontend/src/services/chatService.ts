import api from './api';

export interface Conversation {
  id: string;
  leadId?: string;
  contactName: string;
  phoneNumber: string;
  whatsappInstanceId?: string;
  assignedUserId?: string;
  status: 'active' | 'archived' | 'closed' | 'waiting';
  isUnread: boolean;
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'incoming' | 'outgoing';
  type: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location' | 'contact' | 'ptt';
  content?: string;
  mediaUrl?: string;
  senderId?: string;
  senderName?: string;
  whatsappMessageId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  quotedMsg?: {
    content: string;
    senderName: string;
  };
  createdAt: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  type: 'audio' | 'image' | 'video' | 'document';
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface ChatTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  category?: string;
  createdBy?: string;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
}

class ChatService {
  // ===== CONVERSATIONS =====

  async getConversations(filters?: {
    status?: string;
    assignedUserId?: string;
    search?: string;
    tags?: string[];
    unreadOnly?: boolean;
  }): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedUserId) params.append('assignedUserId', filters.assignedUserId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');

    const { data } = await api.get(`/chat/conversations?${params.toString()}`);
    return data;
  }

  async getConversation(id: string): Promise<Conversation> {
    const { data } = await api.get(`/chat/conversations/${id}`);
    return data;
  }

  async createConversation(conversationData: Partial<Conversation>): Promise<Conversation> {
    const { data } = await api.post('/chat/conversations', conversationData);
    return data;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data } = await api.put(`/chat/conversations/${id}`, updates);
    return data;
  }

  async markAsRead(conversationId: string): Promise<Conversation> {
    const { data } = await api.post(`/chat/conversations/${conversationId}/mark-read`);
    return data;
  }

  async markAsUnread(conversationId: string): Promise<Conversation> {
    const { data } = await api.post(`/chat/conversations/${conversationId}/mark-unread`);
    return data;
  }

  async assignConversation(conversationId: string, userId: string): Promise<Conversation> {
    const { data } = await api.post(`/chat/conversations/${conversationId}/assign`, { userId });
    return data;
  }

  async addTag(conversationId: string, tagName: string): Promise<Conversation> {
    const { data } = await api.post(`/chat/conversations/${conversationId}/tags`, { tagName });
    return data;
  }

  async removeTag(conversationId: string, tagName: string): Promise<Conversation> {
    const { data } = await api.delete(`/chat/conversations/${conversationId}/tags`, {
      data: { tagName }
    });
    return data;
  }

  // ===== MESSAGES =====

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
    return data;
  }

  async sendMessage(conversationId: string, messageData: {
    type: 'text' | 'audio' | 'image' | 'video' | 'document';
    content?: string;
    senderId?: string;
    senderName?: string;
  }): Promise<Message> {
    const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, messageData);
    return data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chat/messages/${messageId}`);
  }

  // ===== TAGS =====

  async getTags(): Promise<ChatTag[]> {
    const { data } = await api.get('/chat/tags');
    return data;
  }

  async createTag(tagData: Partial<ChatTag>): Promise<ChatTag> {
    const { data } = await api.post('/chat/tags', tagData);
    return data;
  }

  async updateTag(id: string, updates: Partial<ChatTag>): Promise<ChatTag> {
    const { data } = await api.put(`/chat/tags/${id}`, updates);
    return data;
  }

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/chat/tags/${id}`);
  }

  // ===== QUICK REPLIES =====

  async getQuickReplies(filters?: { category?: string; search?: string }): Promise<QuickReply[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const { data} = await api.get(`/chat/quick-replies?${params.toString()}`);
    return data;
  }

  async createQuickReply(replyData: Partial<QuickReply>): Promise<QuickReply> {
    const { data } = await api.post('/chat/quick-replies', replyData);
    return data;
  }

  async updateQuickReply(id: string, updates: Partial<QuickReply>): Promise<QuickReply> {
    const { data } = await api.put(`/chat/quick-replies/${id}`, updates);
    return data;
  }

  async deleteQuickReply(id: string): Promise<void> {
    await api.delete(`/chat/quick-replies/${id}`);
  }

  // ===== STATISTICS =====

  async getStats(): Promise<any> {
    const { data } = await api.get('/chat/stats');
    return data;
  }

  // ===== WHATSAPP =====

  /**
   * Busca canais (sessões WhatsApp) com contadores de conversas
   */
  async getChannels(): Promise<Array<{
    sessionName: string;
    phoneNumber: string;
    status: string;
    conversationCount: number;
    unreadCount: number;
  }>> {
    const { data } = await api.get('/chat/channels');
    const result = data.data || data;
    return Array.isArray(result) ? result : [];
  }

  async getWhatsAppSessions(): Promise<Array<{
    sessionName: string;
    totalContacts: number;
    totalMessages: number;
    unreadMessages: number;
    lastActivity: string;
  }>> {
    const { data } = await api.get('/chat/whatsapp/sessions');
    const result = data.data || data;
    return Array.isArray(result) ? result : [];
  }

  async getWhatsAppConversations(): Promise<Conversation[]> {
    const { data } = await api.get('/chat/n8n/conversations');
    const result = data.data || data;
    return Array.isArray(result) ? result : [];
  }

  async getWhatsAppMessages(sessionName: string, phoneNumber?: string): Promise<Message[]> {
    const params = new URLSearchParams();
    if (phoneNumber) params.append('phoneNumber', phoneNumber);

    console.log('🌐 Chamando API:', `/chat/n8n/messages/${sessionName}?${params.toString()}`);
    const { data } = await api.get(`/chat/n8n/messages/${sessionName}?${params.toString()}`);
    console.log('📦 Resposta da API:', data);
    const result = data.data || data;
    return Array.isArray(result) ? result : [];
  }

  async markWhatsAppAsRead(sessionName: string, phoneNumber: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('phoneNumber', phoneNumber);

    await api.post(`/chat/n8n/messages/${sessionName}/mark-read?${params.toString()}`);
  }

  async deleteWhatsAppMessage(messageId: string): Promise<void> {
    await api.delete(`/chat/n8n/messages/${messageId}`);
  }

  async sendWhatsAppMessage(sessionName: string, phoneNumber: string, content: string, quotedMessageId?: string): Promise<Message> {
    const payload: any = {
      sessionName,
      phoneNumber,
      content,
    };

    if (quotedMessageId) {
      payload.quotedMessageId = quotedMessageId;
    }

    const { data } = await api.post('/chat/n8n/send-message', payload);

    // Converter resposta do backend para formato Message
    const messageData = data.data || data;
    return {
      id: messageData.id,
      conversationId: `whatsapp-${messageData.sessionName}-${messageData.phoneNumber}`,
      direction: messageData.direction || 'outgoing',
      type: messageData.messageType || 'text',
      content: messageData.content,
      status: messageData.status || 'sent',
      createdAt: messageData.createdAt || new Date().toISOString(),
    };
  }

  async sendWhatsAppMedia(
    sessionName: string,
    phoneNumber: string,
    fileUrl: string,
    messageType: 'image' | 'video' | 'audio' | 'ptt' | 'document',
    caption?: string,
    quotedMessageId?: string
  ): Promise<Message> {
    const payload: any = {
      sessionName,
      phoneNumber,
      fileUrl,
      messageType,
    };

    if (caption) {
      payload.caption = caption;
    }

    if (quotedMessageId) {
      payload.quotedMessageId = quotedMessageId;
    }

    const { data } = await api.post('/chat/n8n/send-media', payload);

    // Converter resposta do backend para formato Message
    const messageData = data.data || data;
    return {
      id: messageData.id,
      conversationId: `whatsapp-${messageData.sessionName}-${messageData.phoneNumber}`,
      direction: messageData.direction || 'outgoing',
      type: messageData.messageType || messageType,
      content: messageData.content || caption,
      mediaUrl: messageData.mediaUrl,
      status: messageData.status || 'sent',
      createdAt: messageData.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Converte arquivo para base64 (WAHA aceita base64 inline)
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default new ChatService();
