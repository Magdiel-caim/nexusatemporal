import axios, { AxiosInstance } from 'axios';

/**
 * Notifica.me Service
 * Serviço para integração com Notifica.me (WhatsApp e Instagram)
 */

export interface NotificaMeConfig {
  apiKey: string;
  baseURL?: string;
}

export interface SendMessagePayload {
  phone: string; // Formato: 5511999999999
  message: string;
  instanceId?: string; // ID da instância do WhatsApp/Instagram
}

export interface SendMediaPayload {
  phone: string;
  message?: string; // Opcional para mídia
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  filename?: string;
  instanceId?: string;
}

export interface SendTemplatePayload {
  phone: string;
  templateName: string;
  templateParams: Record<string, string>;
  instanceId?: string;
}

export interface SendButtonsPayload extends SendMessagePayload {
  buttons: Array<{
    id: string;
    text: string;
  }>;
  footerText?: string;
}

export interface SendListPayload extends SendMessagePayload {
  buttonText: string;
  sections: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface WebhookMessage {
  id: string;
  from: string;
  to: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  text?: string;
  mediaUrl?: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
}

export interface InstanceInfo {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  platform: 'whatsapp' | 'instagram';
  phone?: string;
  qrCode?: string;
}

export class NotificaMeService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: NotificaMeConfig) {
    this.apiKey = config.apiKey;

    this.client = axios.create({
      baseURL: config.baseURL || 'https://app.notificame.com.br/api',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      timeout: 30000,
    });

    // Interceptor para log de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[NotificaMe] API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
        });
        throw error;
      }
    );
  }

  /**
   * Teste de conectividade com a API
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await this.client.get('/me');
      return {
        success: true,
        message: 'Conexão com Notifica.me estabelecida com sucesso',
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar com Notifica.me',
        data: error.response?.data,
      };
    }
  }

  /**
   * Envia mensagem de texto
   */
  async sendMessage(payload: SendMessagePayload): Promise<any> {
    try {
      const response = await this.client.post('/messages/send', {
        phone: payload.phone,
        message: payload.message,
        instance_id: payload.instanceId,
      });

      console.log('[NotificaMe] Mensagem enviada:', {
        phone: payload.phone,
        messageId: response.data?.id,
      });

      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao enviar mensagem:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao enviar mensagem via Notifica.me'
      );
    }
  }

  /**
   * Envia mídia (imagem, vídeo, áudio, documento)
   */
  async sendMedia(payload: SendMediaPayload): Promise<any> {
    try {
      const response = await this.client.post('/messages/send-media', {
        phone: payload.phone,
        media_url: payload.mediaUrl,
        media_type: payload.mediaType,
        caption: payload.caption,
        filename: payload.filename,
        instance_id: payload.instanceId,
      });

      console.log('[NotificaMe] Mídia enviada:', {
        phone: payload.phone,
        mediaType: payload.mediaType,
        messageId: response.data?.id,
      });

      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao enviar mídia:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao enviar mídia via Notifica.me'
      );
    }
  }

  /**
   * Envia template de mensagem (HSM)
   */
  async sendTemplate(payload: SendTemplatePayload): Promise<any> {
    try {
      const response = await this.client.post('/messages/send-template', {
        phone: payload.phone,
        template_name: payload.templateName,
        template_params: payload.templateParams,
        instance_id: payload.instanceId,
      });

      console.log('[NotificaMe] Template enviado:', {
        phone: payload.phone,
        template: payload.templateName,
        messageId: response.data?.id,
      });

      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao enviar template:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao enviar template via Notifica.me'
      );
    }
  }

  /**
   * Envia mensagem com botões
   */
  async sendButtons(payload: SendButtonsPayload): Promise<any> {
    try {
      const response = await this.client.post('/messages/send-buttons', {
        phone: payload.phone,
        message: payload.message,
        buttons: payload.buttons,
        footer: payload.footerText,
        instance_id: payload.instanceId,
      });

      console.log('[NotificaMe] Mensagem com botões enviada:', {
        phone: payload.phone,
        buttonsCount: payload.buttons.length,
        messageId: response.data?.id,
      });

      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao enviar botões:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao enviar botões via Notifica.me'
      );
    }
  }

  /**
   * Envia mensagem com lista
   */
  async sendList(payload: SendListPayload): Promise<any> {
    try {
      const response = await this.client.post('/messages/send-list', {
        phone: payload.phone,
        message: payload.message,
        button_text: payload.buttonText,
        sections: payload.sections,
        instance_id: payload.instanceId,
      });

      console.log('[NotificaMe] Lista enviada:', {
        phone: payload.phone,
        sectionsCount: payload.sections.length,
        messageId: response.data?.id,
      });

      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao enviar lista:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao enviar lista via Notifica.me'
      );
    }
  }

  /**
   * Lista instâncias (WhatsApp/Instagram)
   */
  async getInstances(): Promise<InstanceInfo[]> {
    try {
      const response = await this.client.get('/instances');
      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao listar instâncias:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao listar instâncias'
      );
    }
  }

  /**
   * Obtém informações de uma instância específica
   */
  async getInstance(instanceId: string): Promise<InstanceInfo> {
    try {
      const response = await this.client.get(`/instances/${instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao obter instância:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao obter informações da instância'
      );
    }
  }

  /**
   * Gera QR Code para conectar instância
   */
  async getQRCode(instanceId: string): Promise<{ qrCode: string }> {
    try {
      const response = await this.client.get(`/instances/${instanceId}/qrcode`);
      return response.data;
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao obter QR Code:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao gerar QR Code'
      );
    }
  }

  /**
   * Desconecta instância
   */
  async disconnectInstance(instanceId: string): Promise<void> {
    try {
      await this.client.post(`/instances/${instanceId}/disconnect`);
      console.log('[NotificaMe] Instância desconectada:', instanceId);
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao desconectar instância:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao desconectar instância'
      );
    }
  }

  /**
   * Processa webhook recebido
   */
  processWebhook(webhookData: any): WebhookMessage {
    // Normaliza dados do webhook para formato padrão
    return {
      id: webhookData.id || webhookData.message_id,
      from: webhookData.from || webhookData.sender,
      to: webhookData.to || webhookData.recipient,
      timestamp: webhookData.timestamp || Date.now(),
      type: webhookData.type || 'text',
      text: webhookData.text || webhookData.message,
      mediaUrl: webhookData.media_url || webhookData.mediaUrl,
      caption: webhookData.caption,
      latitude: webhookData.latitude,
      longitude: webhookData.longitude,
      contactName: webhookData.contact_name || webhookData.contactName,
      contactPhone: webhookData.contact_phone || webhookData.contactPhone,
    };
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId: string, instanceId?: string): Promise<void> {
    try {
      await this.client.post('/messages/mark-read', {
        message_id: messageId,
        instance_id: instanceId,
      });
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao marcar como lida:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao marcar mensagem como lida'
      );
    }
  }

  /**
   * Obtém histórico de mensagens
   */
  async getMessageHistory(phone: string, limit: number = 50): Promise<WebhookMessage[]> {
    try {
      const response = await this.client.get('/messages/history', {
        params: { phone, limit },
      });
      return response.data.map((msg: any) => this.processWebhook(msg));
    } catch (error: any) {
      console.error('[NotificaMe] Erro ao obter histórico:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao obter histórico de mensagens'
      );
    }
  }
}

export default NotificaMeService;
