/**
 * CONTRATO: WAHA Service (WhatsApp Integration)
 *
 * Serviço de integração com WhatsApp via WAHA API.
 *
 * SESSÃO A: Implementará este serviço
 * SESSÃO B: NÃO PRECISA TOCAR - Apenas usar depois
 */

export interface SendWhatsAppMessageDto {
  tenantId: string;
  to: string; // Número no formato: 5511999999999@c.us
  message: string;
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
}

export interface SendWhatsAppMessageResponse {
  success: boolean;
  messageId?: string;
  timestamp: Date;
  error?: string;
}

export interface WhatsAppSessionStatus {
  sessionName: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  lastSeen?: Date;
}

export interface WhatsAppWebhookPayload {
  event: 'message' | 'message.ack' | 'session' | 'error';
  session: string;
  payload: any;
}

/**
 * MÉTODOS DO SERVIÇO (Sessão A implementará):
 *
 * - sendTextMessage(dto: SendWhatsAppMessageDto)
 * - sendMediaMessage(dto: SendWhatsAppMessageDto)
 * - getSessionStatus(tenantId: string)
 * - startSession(tenantId: string)
 * - stopSession(tenantId: string)
 * - getQRCode(tenantId: string)
 * - handleWebhook(payload: WhatsAppWebhookPayload)
 */
