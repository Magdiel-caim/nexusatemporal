import axios, { AxiosInstance } from 'axios';

/**
 * WAHA Service - Integração completa com WAHA WhatsApp API
 * Baseado na documentação oficial: https://waha.devlike.pro/docs
 */

export interface WAHAConfig {
  baseUrl: string;
  apiKey: string;
  sessionName: string;
}

export interface WAHAChat {
  id: string; // Format: 123123@c.us ou 123123@g.us
  name: string;
  conversationTimestamp: number;
}

export interface WAHAMessage {
  id: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  body: string;
  hasMedia: boolean;
  ack?: number; // -1=ERROR, 0=PENDING, 1=SERVER, 2=DEVICE, 3=READ, 4=PLAYED
  ackName?: string;
  mediaUrl?: string;
  mimetype?: string;
  filename?: string;
  caption?: string;
  quotedMsg?: {
    body: string;
    from: string;
  };
}

export interface WAHASendTextRequest {
  session: string;
  chatId: string; // Format: 554192431011@c.us
  text: string;
  reply_to?: string;
  mentions?: string[];
  linkPreview?: boolean;
}

export interface WAHASendMediaRequest {
  session: string;
  chatId: string;
  file: {
    mimetype: string;
    url: string;
    filename?: string;
  };
  caption?: string;
  reply_to?: string;
  convert?: boolean;
}

export class WAHAService {
  private client: AxiosInstance;
  private sessionName: string;

  constructor(config: WAHAConfig) {
    this.sessionName = config.sessionName;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-Api-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * ===== SESSION MANAGEMENT =====
   */

  async getSessionInfo() {
    const { data } = await this.client.get(`/api/sessions/${this.sessionName}`);
    return data;
  }

  async getSessionStatus() {
    const session = await this.getSessionInfo();
    return {
      name: session.name,
      status: session.status, // STOPPED, STARTING, SCAN_QR_CODE, WORKING, FAILED
      me: session.me,
    };
  }

  /**
   * ===== CHATS (CONVERSAS) =====
   */

  async listChats(params?: {
    limit?: number;
    offset?: number;
    sortBy?: 'messageTimestamp' | 'id' | 'name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<WAHAChat[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const { data } = await this.client.get(
      `/api/${this.sessionName}/chats?${queryParams.toString()}`
    );
    return data;
  }

  async getChatOverview(params?: {
    limit?: number;
    offset?: number;
    ids?: string[];
  }) {
    if (params?.ids && params.ids.length > 0) {
      // POST para grandes volumes ou filtros
      const { data } = await this.client.post(
        `/api/${this.sessionName}/chats/overview`,
        {
          pagination: {
            limit: params.limit || 20,
            offset: params.offset || 0,
          },
          filter: {
            ids: params.ids,
          },
        }
      );
      return data;
    }

    // GET para queries simples
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const { data } = await this.client.get(
      `/api/${this.sessionName}/chats/overview?${queryParams.toString()}`
    );
    return data;
  }

  async archiveChat(chatId: string) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/archive`
    );
    return data;
  }

  async unarchiveChat(chatId: string) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/unarchive`
    );
    return data;
  }

  async markChatAsUnread(chatId: string) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/unread`
    );
    return data;
  }

  async deleteChat(chatId: string) {
    const { data } = await this.client.delete(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}`
    );
    return data;
  }

  /**
   * ===== MESSAGES =====
   */

  async listMessages(
    chatId: string,
    params?: {
      limit?: number;
      offset?: number;
      downloadMedia?: boolean;
      filter?: {
        'timestamp.gte'?: number;
        'timestamp.lte'?: number;
        fromMe?: boolean;
        ack?: 'ERROR' | 'PENDING' | 'SERVER' | 'DEVICE' | 'READ' | 'PLAYED';
      };
    }
  ): Promise<WAHAMessage[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.downloadMedia !== undefined)
      queryParams.append('downloadMedia', params.downloadMedia.toString());

    if (params?.filter) {
      if (params.filter['timestamp.gte'])
        queryParams.append('filter.timestamp.gte', params.filter['timestamp.gte'].toString());
      if (params.filter['timestamp.lte'])
        queryParams.append('filter.timestamp.lte', params.filter['timestamp.lte'].toString());
      if (params.filter.fromMe !== undefined)
        queryParams.append('filter.fromMe', params.filter.fromMe.toString());
      if (params.filter.ack) queryParams.append('filter.ack', params.filter.ack);
    }

    const { data } = await this.client.get(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages?${queryParams.toString()}`
    );
    return data;
  }

  async getMessage(chatId: string, messageId: string, downloadMedia = false): Promise<WAHAMessage> {
    const { data } = await this.client.get(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}?downloadMedia=${downloadMedia}`
    );
    return data;
  }

  async markMessagesAsRead(chatId: string, options?: { messages?: number; days?: number }) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/read`,
      options || {}
    );
    return data;
  }

  async editMessage(chatId: string, messageId: string, newText: string) {
    const { data } = await this.client.put(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}`,
      { text: newText }
    );
    return data;
  }

  async deleteMessage(chatId: string, messageId: string) {
    const { data } = await this.client.delete(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}`
    );
    return data;
  }

  async pinMessage(chatId: string, messageId: string, durationSeconds?: number) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}/pin`,
      { duration: durationSeconds }
    );
    return data;
  }

  async unpinMessage(chatId: string, messageId: string) {
    const { data } = await this.client.post(
      `/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}/unpin`
    );
    return data;
  }

  /**
   * ===== SEND MESSAGES =====
   */

  async sendText(request: Omit<WAHASendTextRequest, 'session'>) {
    const { data } = await this.client.post('/api/sendText', {
      session: this.sessionName,
      ...request,
    });
    return data;
  }

  async sendImage(request: Omit<WAHASendMediaRequest, 'session'>) {
    const { data } = await this.client.post('/api/sendImage', {
      session: this.sessionName,
      ...request,
    });
    return data;
  }

  async sendVideo(request: Omit<WAHASendMediaRequest, 'session'> & { asNote?: boolean }) {
    const { data } = await this.client.post('/api/sendVideo', {
      session: this.sessionName,
      ...request,
    });
    return data;
  }

  async sendVoice(request: Omit<WAHASendMediaRequest, 'session'>) {
    const { data } = await this.client.post('/api/sendVoice', {
      session: this.sessionName,
      ...request,
    });
    return data;
  }

  async sendFile(request: Omit<WAHASendMediaRequest, 'session'>) {
    const { data} = await this.client.post('/api/sendFile', {
      session: this.sessionName,
      ...request,
    });
    return data;
  }

  async sendLocation(chatId: string, latitude: number, longitude: number, title?: string) {
    const { data } = await this.client.post('/api/sendLocation', {
      session: this.sessionName,
      chatId,
      latitude,
      longitude,
      title,
    });
    return data;
  }

  async sendSeen(chatId: string, messageId?: string) {
    const { data } = await this.client.post('/api/sendSeen', {
      session: this.sessionName,
      chatId,
      messageId,
    });
    return data;
  }

  /**
   * ===== UTILS =====
   */

  /**
   * Escape @ symbol in chatId for URL
   * Example: 123123@c.us -> 123123%40c.us
   */
  private escapeId(id: string): string {
    return id.replace(/@/g, '%40');
  }

  /**
   * Formata número de telefone para chatId WhatsApp
   * Example: 5541992431011 -> 5541992431011@c.us
   */
  formatPhoneToChatId(phone: string): string {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    return `${cleanPhone}@c.us`;
  }

  /**
   * Extrai número de telefone do chatId
   * Example: 5541992431011@c.us -> 5541992431011
   */
  extractPhoneFromChatId(chatId: string): string {
    return chatId.replace(/@.*/, '');
  }

  /**
   * Verifica se é um chat de grupo
   */
  isGroupChat(chatId: string): boolean {
    return chatId.endsWith('@g.us');
  }

  /**
   * Mapeia ACK number para status string
   */
  mapAckToStatus(ack: number): 'pending' | 'sent' | 'delivered' | 'read' | 'failed' {
    switch (ack) {
      case -1:
        return 'failed'; // ERROR
      case 0:
        return 'pending'; // PENDING
      case 1:
      case 2:
        return 'sent'; // SERVER or DEVICE
      case 3:
        return 'delivered'; // READ (marca dupla)
      case 4:
        return 'read'; // PLAYED (azul)
      default:
        return 'pending';
    }
  }
}

export default WAHAService;
