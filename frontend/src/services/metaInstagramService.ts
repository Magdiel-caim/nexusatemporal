/**
 * Meta Instagram Service
 * Service for Meta Instagram & Messenger direct API integration
 *
 * @module services
 */

import api from './api';

interface InstagramAccount {
  id: number;
  instagram_account_id: string;
  instagram_username: string;
  instagram_name: string;
  profile_picture_url: string;
  facebook_page_id?: string;
  facebook_page_name?: string;
  platform: string;
  status: string;
  connected_at: string;
  token_expires_at: string;
  user_id: number;
}

interface SendMessageParams {
  accountId: number;
  recipientId: string;
  message: string;
  type?: 'text' | 'image' | 'button';
  imageUrl?: string;
  buttons?: Array<{ type: string; title: string; payload: string }>;
}

interface Conversation {
  from_id: string;
  from_username: string;
  message_text: string;
  sent_at: string;
  direction: 'inbound' | 'outbound';
}

interface Message {
  id: number;
  message_id: string;
  from_id: string;
  from_username: string;
  to_id: string;
  message_text: string;
  message_type: string;
  attachments: any;
  direction: 'inbound' | 'outbound';
  status: string;
  sent_at: string;
  created_at: string;
}

export const metaInstagramService = {
  /**
   * Start OAuth flow
   * Returns authorization URL to open in popup
   */
  async startOAuth(): Promise<{ success: boolean; data: { authUrl: string; state: string } }> {
    const response = await api.get('/api/meta/oauth/start');
    return response.data;
  },

  /**
   * List all connected Instagram accounts
   */
  async listAccounts(): Promise<{ success: boolean; data: InstagramAccount[] }> {
    const response = await api.get('/api/meta/accounts');
    return response.data;
  },

  /**
   * Disconnect an Instagram account
   * @param accountId - Account ID from database
   */
  async disconnectAccount(accountId: number): Promise<{ success: boolean }> {
    const response = await api.delete(`/api/meta/accounts/${accountId}`);
    return response.data;
  },

  /**
   * Send a message
   * @param params - Message parameters
   */
  async sendMessage(params: SendMessageParams): Promise<{ success: boolean; data: any }> {
    const response = await api.post('/api/meta/send-message', params);
    return response.data;
  },

  /**
   * Get all conversations for an account
   * @param accountId - Account ID from database
   * @param limit - Maximum number of conversations (default: 20)
   */
  async getConversations(accountId: number, limit: number = 20): Promise<{ success: boolean; data: Conversation[] }> {
    const response = await api.get(`/api/meta/conversations/${accountId}`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get messages from a specific conversation
   * @param accountId - Account ID from database
   * @param contactId - Instagram User ID of the contact
   * @param limit - Maximum number of messages (default: 50)
   */
  async getMessages(accountId: number, contactId: string, limit: number = 50): Promise<{ success: boolean; data: Message[] }> {
    const response = await api.get(`/api/meta/messages/${accountId}/${contactId}`, {
      params: { limit }
    });
    return response.data;
  },
};
