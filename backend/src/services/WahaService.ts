/**
 * WAHA Service - WhatsApp Integration
 *
 * Serviço de integração com WAHA (WhatsApp HTTP API)
 * Permite envio de mensagens, gerenciamento de sessões e webhooks
 *
 * @see https://waha.devlike.pro/
 */

import axios, { AxiosInstance } from 'axios';

export interface WahaConfig {
  apiUrl: string;
  apiKey: string;
  sessionName: string;
}

export interface SendMessageDTO {
  chatId: string; // Formato: 5511999999999@c.us
  text: string;
  session?: string;
}

export interface SendMediaDTO {
  chatId: string;
  file: {
    mimetype: string;
    filename: string;
    url: string;
  };
  caption?: string;
  session?: string;
}

export interface SessionStatus {
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED' | 'SCAN_QR_CODE';
  qr?: string;
  me?: {
    id: string;
    pushName: string;
  };
}

export interface WahaMessage {
  id: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  body: string;
  hasMedia: boolean;
  ack?: number;
}

export interface WebhookPayload {
  event: 'message' | 'message.ack' | 'session.status';
  session: string;
  engine: string;
  payload: any;
}

export class WahaService {
  private client: AxiosInstance;
  private config: WahaConfig;
  private sessionCache: Map<string, SessionStatus> = new Map();

  constructor(config: WahaConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'X-Api-Key': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Interceptor para logs
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[WahaService] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`[WahaService] Error:`, {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  /**
   * Envia mensagem de texto
   */
  async sendTextMessage(dto: SendMessageDTO): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const session = dto.session || this.config.sessionName;

      const response = await this.client.post(`/api/sendText`, {
        session,
        chatId: dto.chatId,
        text: dto.text
      });

      return {
        success: true,
        messageId: response.data.id
      };
    } catch (error: any) {
      console.error('[WahaService] Error sending text message:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Envia mensagem com mídia (imagem, vídeo, documento)
   */
  async sendMediaMessage(dto: SendMediaDTO): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const session = dto.session || this.config.sessionName;

      const response = await this.client.post(`/api/sendFile`, {
        session,
        chatId: dto.chatId,
        file: dto.file,
        caption: dto.caption || ''
      });

      return {
        success: true,
        messageId: response.data.id
      };
    } catch (error: any) {
      console.error('[WahaService] Error sending media message:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Obtém status da sessão
   */
  async getSessionStatus(session?: string): Promise<SessionStatus> {
    try {
      const sessionName = session || this.config.sessionName;

      // Verifica cache (válido por 10 segundos)
      const cached = this.sessionCache.get(sessionName);
      if (cached && Date.now() - (cached as any).cachedAt < 10000) {
        return cached;
      }

      const response = await this.client.get(`/api/sessions/${sessionName}`);
      const status: SessionStatus = {
        name: response.data.name,
        status: response.data.status,
        qr: response.data.qr,
        me: response.data.me
      };

      // Atualiza cache
      (status as any).cachedAt = Date.now();
      this.sessionCache.set(sessionName, status);

      return status;
    } catch (error: any) {
      console.error('[WahaService] Error getting session status:', error);
      return {
        name: session || this.config.sessionName,
        status: 'FAILED'
      };
    }
  }

  /**
   * Inicia sessão do WhatsApp
   */
  async startSession(session?: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      const sessionName = session || this.config.sessionName;

      const response = await this.client.post(`/api/sessions`, {
        name: sessionName,
        config: {
          proxy: null,
          webhooks: [
            {
              url: `https://api.nexusatemporal.com.br/webhooks/whatsapp`,
              events: ['message', 'session.status'],
              hmac: null,
              retries: null,
              customHeaders: null
            }
          ]
        }
      });

      return {
        success: true,
        qr: response.data.qr
      };
    } catch (error: any) {
      console.error('[WahaService] Error starting session:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Para sessão do WhatsApp
   */
  async stopSession(session?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sessionName = session || this.config.sessionName;

      await this.client.delete(`/api/sessions/${sessionName}`);

      // Remove do cache
      this.sessionCache.delete(sessionName);

      return { success: true };
    } catch (error: any) {
      console.error('[WahaService] Error stopping session:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Obtém QR Code para conectar
   */
  async getQRCode(session?: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      const status = await this.getSessionStatus(session);

      if (status.status === 'SCAN_QR_CODE' && status.qr) {
        return {
          success: true,
          qr: status.qr
        };
      }

      if (status.status === 'CONNECTED') {
        return {
          success: false,
          error: 'Session is already connected'
        };
      }

      // Tenta iniciar sessão para gerar novo QR
      return await this.startSession(session);
    } catch (error: any) {
      console.error('[WahaService] Error getting QR code:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Logout da sessão
   */
  async logout(session?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sessionName = session || this.config.sessionName;

      await this.client.post(`/api/sessions/${sessionName}/logout`);

      // Remove do cache
      this.sessionCache.delete(sessionName);

      return { success: true };
    } catch (error: any) {
      console.error('[WahaService] Error logging out:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Processa webhook recebido do WAHA
   */
  async processWebhook(payload: WebhookPayload): Promise<void> {
    console.log(`[WahaService] Webhook received:`, {
      event: payload.event,
      session: payload.session
    });

    switch (payload.event) {
      case 'message':
        await this.handleMessageWebhook(payload);
        break;

      case 'message.ack':
        await this.handleAckWebhook(payload);
        break;

      case 'session.status':
        await this.handleSessionStatusWebhook(payload);
        break;

      default:
        console.log(`[WahaService] Unknown webhook event: ${payload.event}`);
    }
  }

  /**
   * Processa webhook de mensagem recebida
   */
  private async handleMessageWebhook(payload: WebhookPayload): Promise<void> {
    const message: WahaMessage = payload.payload;

    // Ignora mensagens enviadas por nós
    if (message.fromMe) {
      return;
    }

    console.log(`[WahaService] New message from ${message.from}:`, message.body);

    // TODO: Emitir evento para o sistema de automações
    // EventEmitter.emit('whatsapp.message.received', {
    //   session: payload.session,
    //   from: message.from,
    //   message: message.body,
    //   timestamp: message.timestamp
    // });
  }

  /**
   * Processa webhook de confirmação de mensagem
   */
  private async handleAckWebhook(payload: WebhookPayload): Promise<void> {
    console.log(`[WahaService] Message ACK:`, payload.payload);
    // TODO: Atualizar status de envio no banco
  }

  /**
   * Processa webhook de mudança de status da sessão
   */
  private async handleSessionStatusWebhook(payload: WebhookPayload): Promise<void> {
    const status = payload.payload.status;
    console.log(`[WahaService] Session ${payload.session} status changed to: ${status}`);

    // Limpa cache
    this.sessionCache.delete(payload.session);

    // TODO: Emitir evento
    // if (status === 'CONNECTED') {
    //   EventEmitter.emit('whatsapp.session.connected', { session: payload.session });
    // } else if (status === 'DISCONNECTED') {
    //   EventEmitter.emit('whatsapp.session.disconnected', { session: payload.session });
    // }
  }

  /**
   * Formata número de telefone para o formato WhatsApp
   * @param phone - Número no formato: +5511999999999 ou 11999999999
   * @returns Número no formato: 5511999999999@c.us
   */
  static formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Adiciona código do Brasil se não tiver
    if (cleaned.length === 11) {
      cleaned = '55' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '55' + cleaned;
    }

    return `${cleaned}@c.us`;
  }

  /**
   * Verifica se a sessão está conectada
   */
  async isConnected(session?: string): Promise<boolean> {
    try {
      const status = await this.getSessionStatus(session);
      return status.status === 'CONNECTED';
    } catch (error) {
      return false;
    }
  }

  /**
   * Aguarda até que a sessão esteja conectada
   * @param session - Nome da sessão
   * @param timeout - Tempo máximo de espera em ms (padrão: 60000)
   * @param checkInterval - Intervalo entre verificações em ms (padrão: 2000)
   */
  async waitForConnection(session?: string, timeout = 60000, checkInterval = 2000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isConnected(session)) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }
}
