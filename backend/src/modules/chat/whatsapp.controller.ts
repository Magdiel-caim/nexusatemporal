import { Request, Response } from 'express';
import { WhatsAppService, WhatsAppWebhookMessage } from './whatsapp.service';
import { getWebSocketService } from './websocket.service';

export class WhatsAppController {
  private whatsappService = new WhatsAppService();

  // ===== WEBHOOK ENDPOINT =====

  handleWebhook = async (req: Request, res: Response) => {
    try {
      console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));

      const { event, payload } = req.body;

      // Handle different event types
      if (event === 'message' && payload) {
        const messageData: WhatsAppWebhookMessage = payload;
        const result = await this.whatsappService.handleIncomingMessage(messageData);

        // Emit WebSocket event to notify frontend
        try {
          const wsService = getWebSocketService();
          wsService.emitNewMessage(result.conversation.id, result.message);

          // Notify assigned user if exists
          if (result.conversation.assignedUserId) {
            wsService.notifyUser(result.conversation.assignedUserId, 'conversation:newMessage', {
              conversationId: result.conversation.id,
              message: result.message,
            });
          }
        } catch (error) {
          console.error('Error emitting WebSocket event:', error);
        }

        return res.json({ success: true, data: result });
      }

      if (event === 'message.ack' && payload) {
        // Handle message status updates
        await this.whatsappService.handleStatusUpdate({
          messageId: payload.id,
          status: payload.ack === 1 ? 'sent' : payload.ack === 2 ? 'delivered' : 'read',
        });

        return res.json({ success: true });
      }

      // Default response for unknown events
      res.json({ success: true, message: 'Event received' });
    } catch (error: any) {
      console.error('Error handling WhatsApp webhook:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ===== SESSION MANAGEMENT =====

  getSessionStatus = async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const status = await this.whatsappService.getSessionStatus(instanceId);
      res.json(status);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  startSession = async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const result = await this.whatsappService.startSession(instanceId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  stopSession = async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const result = await this.whatsappService.stopSession(instanceId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // ===== MEDIA DOWNLOAD =====

  downloadMedia = async (req: Request, res: Response) => {
    try {
      const { mediaId } = req.params;
      const { instanceId } = req.query;

      const mediaBuffer = await this.whatsappService.downloadMedia(
        mediaId,
        instanceId as string || 'default'
      );

      // Set appropriate headers
      res.set('Content-Type', 'application/octet-stream');
      res.send(mediaBuffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
