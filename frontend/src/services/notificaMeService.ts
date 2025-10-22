/**
 * Notifica.me Service
 * Serviço para integração com Notifica.me (WhatsApp/Instagram)
 */

import api from './api';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface NotificaMeInstance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  platform: 'whatsapp' | 'instagram';
  phone?: string;
  qrCode?: string;
}

export interface SendMessagePayload {
  phone: string;
  message: string;
  instanceId?: string;
}

export interface SendMediaPayload {
  phone: string;
  message?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  filename?: string;
  instanceId?: string;
}

export interface SendButtonsPayload {
  phone: string;
  message: string;
  buttons: Array<{
    id: string;
    text: string;
  }>;
  footerText?: string;
  instanceId?: string;
}

export interface SendListPayload {
  phone: string;
  message: string;
  buttonText: string;
  sections: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  instanceId?: string;
}

export interface WebhookMessage {
  id: string;
  from: string;
  to: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: string;
  mediaUrl?: string;
  caption?: string;
}

// ==========================================
// SERVICE CLASS
// ==========================================

class NotificaMeService {
  /**
   * Testar conexão com Notifica.me
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    const { data } = await api.post('/notificame/test-connection');
    return data;
  }

  /**
   * Enviar mensagem de texto
   */
  async sendMessage(payload: SendMessagePayload): Promise<any> {
    const { data } = await api.post('/notificame/send-message', payload);
    return data;
  }

  /**
   * Enviar mídia (imagem, vídeo, áudio, documento)
   */
  async sendMedia(payload: SendMediaPayload): Promise<any> {
    const { data } = await api.post('/notificame/send-media', payload);
    return data;
  }

  /**
   * Enviar mensagem com botões
   */
  async sendButtons(payload: SendButtonsPayload): Promise<any> {
    const { data } = await api.post('/notificame/send-buttons', payload);
    return data;
  }

  /**
   * Enviar mensagem com lista
   */
  async sendList(payload: SendListPayload): Promise<any> {
    const { data } = await api.post('/notificame/send-list', payload);
    return data;
  }

  /**
   * Listar instâncias (WhatsApp/Instagram)
   */
  async getInstances(): Promise<{ success: boolean; data: NotificaMeInstance[] }> {
    const { data } = await api.get('/notificame/instances');
    return data;
  }

  /**
   * Obter informações de uma instância
   */
  async getInstance(instanceId: string): Promise<{ success: boolean; data: NotificaMeInstance }> {
    const { data } = await api.get(`/notificame/instances/${instanceId}`);
    return data;
  }

  /**
   * Obter QR Code para conexão
   */
  async getQRCode(instanceId: string): Promise<{ success: boolean; data: { qrCode: string } }> {
    const { data } = await api.get(`/notificame/instances/${instanceId}/qrcode`);
    return data;
  }

  /**
   * Desconectar instância
   */
  async disconnectInstance(instanceId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/notificame/instances/${instanceId}/disconnect`);
    return data;
  }

  /**
   * Obter histórico de mensagens
   */
  async getMessageHistory(phone: string, limit: number = 50): Promise<{ success: boolean; data: WebhookMessage[] }> {
    const { data } = await api.get('/notificame/messages/history', {
      params: { phone, limit }
    });
    return data;
  }

  /**
   * Marcar mensagem como lida
   */
  async markAsRead(messageId: string, instanceId?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post(`/notificame/messages/${messageId}/mark-read`, { instanceId });
    return data;
  }

  /**
   * Criar nova instância Instagram/Messenger
   */
  async createInstance(platform: 'instagram' | 'messenger', name: string): Promise<{ success: boolean; data: { instanceId: string; authUrl: string } }> {
    const { data } = await api.post('/notificame/instances/create', { platform, name });
    return data;
  }

  /**
   * Obter URL de autorização OAuth
   */
  async getAuthorizationUrl(instanceId: string): Promise<{ success: boolean; data: { authUrl: string } }> {
    const { data } = await api.post(`/notificame/instances/${instanceId}/authorize`);
    return data;
  }

  /**
   * Processar callback OAuth
   */
  async processCallback(instanceId: string, code: string, state?: string): Promise<{ success: boolean; data: any }> {
    const { data } = await api.post(`/notificame/instances/${instanceId}/callback`, { code, state });
    return data;
  }

  /**
   * Sincronizar status da instância
   */
  async syncInstance(instanceId: string): Promise<{ success: boolean; data: NotificaMeInstance }> {
    const { data } = await api.get(`/notificame/instances/${instanceId}/sync`);
    return data;
  }

  /**
   * Listar instâncias por plataforma
   */
  async getInstancesByPlatform(platform: 'instagram' | 'messenger' | 'whatsapp'): Promise<{ success: boolean; data: NotificaMeInstance[] }> {
    const { data } = await api.get(`/notificame/instances/platform/${platform}`);
    return data;
  }
}

export default new NotificaMeService();
