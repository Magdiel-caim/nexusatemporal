import axios from 'axios';
import { ChatService } from './chat.service';

export interface WhatsAppWebhookMessage {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  timestamp: number;
  text?: {
    body: string;
  };
  audio?: {
    id: string;
    mimetype: string;
  };
  image?: {
    id: string;
    mimetype: string;
    caption?: string;
  };
  video?: {
    id: string;
    mimetype: string;
    caption?: string;
  };
  document?: {
    id: string;
    mimetype: string;
    filename: string;
  };
}

export class WhatsAppService {
  private chatService = new ChatService();
  private wahaBaseUrl: string;
  private wahaApiKey: string;

  constructor() {
    this.wahaBaseUrl = process.env.WAHA_URL || 'http://localhost:3000';
    this.wahaApiKey = process.env.WAHA_API_KEY || '';
  }

  // ===== SEND MESSAGES =====

  async sendTextMessage(to: string, message: string, instanceId: string = 'default') {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sendText`,
        {
          chatId: `${to}@c.us`,
          text: message,
          session: instanceId,
        },
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string,
    instanceId: string = 'default'
  ) {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sendImage`,
        {
          chatId: `${to}@c.us`,
          file: {
            url: imageUrl,
          },
          caption,
          session: instanceId,
        },
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp image:', error);
      throw new Error('Failed to send WhatsApp image');
    }
  }

  async sendAudioMessage(
    to: string,
    audioUrl: string,
    instanceId: string = 'default'
  ) {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sendAudio`,
        {
          chatId: `${to}@c.us`,
          file: {
            url: audioUrl,
          },
          session: instanceId,
        },
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp audio:', error);
      throw new Error('Failed to send WhatsApp audio');
    }
  }

  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string,
    instanceId: string = 'default'
  ) {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sendFile`,
        {
          chatId: `${to}@c.us`,
          file: {
            url: documentUrl,
            filename,
          },
          caption,
          session: instanceId,
        },
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp document:', error);
      throw new Error('Failed to send WhatsApp document');
    }
  }

  // ===== RECEIVE MESSAGES (Webhook Handler) =====

  async handleIncomingMessage(webhookData: WhatsAppWebhookMessage) {
    try {
      const phoneNumber = webhookData.from.replace('@c.us', '');

      // Find or create conversation
      let conversation = await this.chatService.getConversationByPhone(phoneNumber);

      if (!conversation) {
        conversation = await this.chatService.createConversation({
          contactName: phoneNumber, // Will be updated with real name later
          phoneNumber,
          whatsappInstanceId: 'default',
        });
      }

      // Determine message type and content
      let messageType: 'text' | 'audio' | 'image' | 'video' | 'document' = 'text';
      let content = '';
      let metadata: Record<string, any> = {};

      if (webhookData.type === 'text' && webhookData.text) {
        messageType = 'text';
        content = webhookData.text.body;
      } else if (webhookData.type === 'audio' && webhookData.audio) {
        messageType = 'audio';
        metadata = {
          mediaId: webhookData.audio.id,
          mimeType: webhookData.audio.mimetype,
        };
      } else if (webhookData.type === 'image' && webhookData.image) {
        messageType = 'image';
        content = webhookData.image.caption || '';
        metadata = {
          mediaId: webhookData.image.id,
          mimeType: webhookData.image.mimetype,
        };
      } else if (webhookData.type === 'video' && webhookData.video) {
        messageType = 'video';
        content = webhookData.video.caption || '';
        metadata = {
          mediaId: webhookData.video.id,
          mimeType: webhookData.video.mimetype,
        };
      } else if (webhookData.type === 'document' && webhookData.document) {
        messageType = 'document';
        metadata = {
          mediaId: webhookData.document.id,
          mimeType: webhookData.document.mimetype,
          filename: webhookData.document.filename,
        };
      }

      // Create message
      const message = await this.chatService.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        type: messageType,
        content,
        whatsappMessageId: webhookData.id,
        metadata,
      });

      return {
        conversation,
        message,
      };
    } catch (error) {
      console.error('Error handling incoming WhatsApp message:', error);
      throw error;
    }
  }

  // ===== MEDIA OPERATIONS =====

  async downloadMedia(mediaId: string, instanceId: string = 'default'): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.wahaBaseUrl}/api/files/${mediaId}`,
        {
          params: { session: instanceId },
          headers: {
            'X-Api-Key': this.wahaApiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading WhatsApp media:', error);
      throw new Error('Failed to download media');
    }
  }

  // ===== STATUS UPDATES =====

  async handleStatusUpdate(data: {
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }) {
    // Find message by whatsappMessageId and update status
    // This would need to be implemented in ChatService
    console.log('Status update received:', data);
  }

  // ===== SESSION MANAGEMENT =====

  async getSessionStatus(instanceId: string = 'default') {
    try {
      const response = await axios.get(
        `${this.wahaBaseUrl}/api/sessions/${instanceId}`,
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting WhatsApp session status:', error);
      return { status: 'unknown' };
    }
  }

  async startSession(instanceId: string = 'default') {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sessions/${instanceId}/start`,
        {},
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error starting WhatsApp session:', error);
      throw new Error('Failed to start session');
    }
  }

  async stopSession(instanceId: string = 'default') {
    try {
      const response = await axios.post(
        `${this.wahaBaseUrl}/api/sessions/${instanceId}/stop`,
        {},
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error stopping WhatsApp session:', error);
      throw new Error('Failed to stop session');
    }
  }
}
