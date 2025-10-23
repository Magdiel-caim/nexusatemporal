/**
 * Meta Messaging Service
 * Handles sending messages via Meta Graph API
 *
 * @module modules/meta
 */

import axios from 'axios';
import { Pool } from 'pg';
import { MetaOAuthService } from './meta-oauth.service';

interface SendMessageParams {
  accountId: number;
  recipientId: string;
  message: string;
}

interface SendImageParams {
  accountId: number;
  recipientId: string;
  imageUrl: string;
}

interface SendButtonTemplateParams {
  accountId: number;
  recipientId: string;
  text: string;
  buttons: Array<{ type: string; title: string; payload: string }>;
}

export class MetaMessagingService {
  private db: Pool;
  private metaService: MetaOAuthService;
  private graphApiVersion: string = 'v21.0';

  constructor(db: Pool) {
    this.db = db;
    this.metaService = new MetaOAuthService();
  }

  /**
   * Send text message
   */
  async sendTextMessage(params: SendMessageParams): Promise<any> {
    try {
      // Get account and token
      const accountResult = await this.db.query(
        `SELECT instagram_account_id, access_token, tenant_id
         FROM meta_instagram_accounts
         WHERE id = $1 AND status = 'active'`,
        [params.accountId]
      );

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found or inactive');
      }

      const account = accountResult.rows[0];

      // Decrypt token
      const accessToken = this.metaService.decryptToken(account.access_token);

      // Send message via Graph API
      const response = await axios.post(
        `https://graph.facebook.com/${this.graphApiVersion}/me/messages`,
        {
          recipient: { id: params.recipientId },
          message: { text: params.message },
        },
        {
          params: { access_token: accessToken },
        }
      );

      // Save sent message in database
      await this.db.query(
        `INSERT INTO instagram_messages (
          tenant_id, account_id, message_id, from_id, to_id,
          message_text, message_type, direction, status, sent_at, raw_payload
        ) VALUES ($1, $2, $3, $4, $5, $6, 'text', 'outbound', 'sent', NOW(), $7)`,
        [
          account.tenant_id,
          params.accountId,
          response.data.message_id,
          account.instagram_account_id,
          params.recipientId,
          params.message,
          JSON.stringify(response.data),
        ]
      );

      console.log(`[MetaMessaging] Message sent to ${params.recipientId}`);

      return response.data;
    } catch (error: any) {
      console.error('[MetaMessaging] Error sending message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send message');
    }
  }

  /**
   * Send image message
   */
  async sendImageMessage(params: SendImageParams): Promise<any> {
    try {
      const accountResult = await this.db.query(
        `SELECT instagram_account_id, access_token, tenant_id
         FROM meta_instagram_accounts
         WHERE id = $1 AND status = 'active'`,
        [params.accountId]
      );

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found or inactive');
      }

      const account = accountResult.rows[0];
      const accessToken = this.metaService.decryptToken(account.access_token);

      const response = await axios.post(
        `https://graph.facebook.com/${this.graphApiVersion}/me/messages`,
        {
          recipient: { id: params.recipientId },
          message: {
            attachment: {
              type: 'image',
              payload: { url: params.imageUrl },
            },
          },
        },
        {
          params: { access_token: accessToken },
        }
      );

      // Save sent message in database
      await this.db.query(
        `INSERT INTO instagram_messages (
          tenant_id, account_id, message_id, from_id, to_id,
          message_type, attachments, direction, status, sent_at, raw_payload
        ) VALUES ($1, $2, $3, $4, $5, 'image', $6, 'outbound', 'sent', NOW(), $7)`,
        [
          account.tenant_id,
          params.accountId,
          response.data.message_id,
          account.instagram_account_id,
          params.recipientId,
          JSON.stringify([{ type: 'image', url: params.imageUrl }]),
          JSON.stringify(response.data),
        ]
      );

      console.log(`[MetaMessaging] Image sent to ${params.recipientId}`);

      return response.data;
    } catch (error: any) {
      console.error('[MetaMessaging] Error sending image:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send image');
    }
  }

  /**
   * Send button template
   */
  async sendButtonTemplate(params: SendButtonTemplateParams): Promise<any> {
    try {
      const accountResult = await this.db.query(
        `SELECT instagram_account_id, access_token, tenant_id
         FROM meta_instagram_accounts
         WHERE id = $1 AND status = 'active'`,
        [params.accountId]
      );

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found or inactive');
      }

      const account = accountResult.rows[0];
      const accessToken = this.metaService.decryptToken(account.access_token);

      const response = await axios.post(
        `https://graph.facebook.com/${this.graphApiVersion}/me/messages`,
        {
          recipient: { id: params.recipientId },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: params.text,
                buttons: params.buttons,
              },
            },
          },
        },
        {
          params: { access_token: accessToken },
        }
      );

      console.log(`[MetaMessaging] Button template sent to ${params.recipientId}`);

      return response.data;
    } catch (error: any) {
      console.error('[MetaMessaging] Error sending button template:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send button template');
    }
  }

  /**
   * Get conversations for an account
   */
  async getConversations(accountId: number, limit: number = 20): Promise<any[]> {
    try {
      const result = await this.db.query(
        `SELECT DISTINCT ON (from_id)
          from_id, from_username, message_text, sent_at, direction
         FROM instagram_messages
         WHERE account_id = $1
         ORDER BY from_id, sent_at DESC
         LIMIT $2`,
        [accountId, limit]
      );

      return result.rows;
    } catch (error: any) {
      console.error('[MetaMessaging] Error getting conversations:', error);
      throw new Error('Failed to get conversations');
    }
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(accountId: number, contactId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await this.db.query(
        `SELECT *
         FROM instagram_messages
         WHERE account_id = $1
           AND (from_id = $2 OR to_id = $2)
         ORDER BY sent_at DESC
         LIMIT $3`,
        [accountId, contactId, limit]
      );

      // Return in ascending order (oldest first)
      return result.rows.reverse();
    } catch (error: any) {
      console.error('[MetaMessaging] Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  }
}
