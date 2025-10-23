/**
 * Meta Messaging Controller
 * Handles sending and receiving Instagram/Messenger messages
 *
 * @module modules/meta
 */

import { Request, Response } from 'express';
import { Pool } from 'pg';
import { MetaMessagingService } from './meta-messaging.service';

export class MetaMessagingController {
  private messagingService: MetaMessagingService;

  constructor(db: Pool) {
    this.messagingService = new MetaMessagingService(db);
  }

  /**
   * POST /api/meta/send-message
   * Send a message (text, image, or button template)
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, recipientId, message, type, imageUrl, buttons } = req.body;

      if (!accountId || !recipientId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: accountId, recipientId',
        });
        return;
      }

      let result;

      // Send image message
      if (type === 'image' && imageUrl) {
        result = await this.messagingService.sendImageMessage({
          accountId,
          recipientId,
          imageUrl,
        });
      }
      // Send button template
      else if (type === 'button' && buttons) {
        result = await this.messagingService.sendButtonTemplate({
          accountId,
          recipientId,
          text: message,
          buttons,
        });
      }
      // Send text message (default)
      else {
        if (!message) {
          res.status(400).json({
            success: false,
            error: 'Missing message text',
          });
          return;
        }

        result = await this.messagingService.sendTextMessage({
          accountId,
          recipientId,
          message,
        });
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[MetaMessaging] Error in sendMessage:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/conversations/:accountId
   * Get all conversations for an account
   */
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const conversations = await this.messagingService.getConversations(
        parseInt(accountId),
        limit
      );

      res.json({ success: true, data: conversations });
    } catch (error: any) {
      console.error('[MetaMessaging] Error in getConversations:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/messages/:accountId/:contactId
   * Get messages from a specific conversation
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, contactId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await this.messagingService.getMessages(
        parseInt(accountId),
        contactId,
        limit
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      console.error('[MetaMessaging] Error in getMessages:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
