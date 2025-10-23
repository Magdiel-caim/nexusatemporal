/**
 * Meta Instagram & Messenger Routes
 * Direct integration with Meta Graph API
 *
 * @module modules/meta
 */

import { Router } from 'express';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { CrmDataSource } from '@/database/data-source';
import { MetaOAuthController } from './meta-oauth.controller';
import { MetaWebhookController } from './meta-webhook.controller';
import { MetaMessagingController } from './meta-messaging.controller';

const router = Router();

// Get database pool from CRM DataSource
const getDbPool = () => {
  const driver = CrmDataSource.driver as any;
  if (!driver || !driver.master) {
    throw new Error('CrmDataSource not initialized');
  }
  return driver.master;
};

// Lazy initialization of controllers to avoid accessing DB before initialization
let oauthController: MetaOAuthController;
let webhookController: MetaWebhookController;
let messagingController: MetaMessagingController;

const getControllers = () => {
  if (!oauthController) {
    oauthController = new MetaOAuthController(getDbPool());
    webhookController = new MetaWebhookController(getDbPool());
    messagingController = new MetaMessagingController(getDbPool());
  }
  return { oauthController, webhookController, messagingController };
};

// ============================================
// OAUTH ROUTES (Protected)
// ============================================

/**
 * GET /api/meta/oauth/start
 * Start OAuth flow - returns authorization URL
 */
router.get(
  '/oauth/start',
  authenticate,
  (req, res) => getControllers().oauthController.startOAuth(req, res)
);

/**
 * GET /api/meta/oauth/callback
 * OAuth callback - Meta redirects here after user authorization
 * This is called by Meta, not the frontend, so no authentication
 */
router.get(
  '/oauth/callback',
  (req, res) => getControllers().oauthController.oauthCallback(req, res)
);

/**
 * GET /api/meta/accounts
 * List all connected Instagram accounts for tenant
 */
router.get(
  '/accounts',
  authenticate,
  (req, res) => getControllers().oauthController.listAccounts(req, res)
);

/**
 * DELETE /api/meta/accounts/:id
 * Disconnect an Instagram account
 */
router.delete(
  '/accounts/:id',
  authenticate,
  (req, res) => getControllers().oauthController.disconnectAccount(req, res)
);

// ============================================
// WEBHOOK ROUTES (Public - Meta calls these)
// ============================================

/**
 * GET /api/meta/webhook
 * Webhook verification endpoint
 * Meta calls this to verify the webhook URL during setup
 */
router.get(
  '/webhook',
  (req, res) => getControllers().webhookController.verify(req, res)
);

/**
 * POST /api/meta/webhook
 * Receive webhook events from Meta
 * Meta sends messages and other events here
 */
router.post(
  '/webhook',
  (req, res) => getControllers().webhookController.receive(req, res)
);

// ============================================
// MESSAGING ROUTES (Protected)
// ============================================

/**
 * POST /api/meta/send-message
 * Send a message (text, image, or button template)
 *
 * Body:
 * - accountId: number (Meta Instagram account ID from database)
 * - recipientId: string (Instagram User ID to send to)
 * - message: string (text message)
 * - type?: 'text' | 'image' | 'button' (default: 'text')
 * - imageUrl?: string (for type='image')
 * - buttons?: Array<{type, title, payload}> (for type='button')
 */
router.post(
  '/send-message',
  authenticate,
  (req, res) => getControllers().messagingController.sendMessage(req, res)
);

/**
 * GET /api/meta/conversations/:accountId
 * Get all conversations for an account
 *
 * Query params:
 * - limit?: number (default: 20)
 */
router.get(
  '/conversations/:accountId',
  authenticate,
  (req, res) => getControllers().messagingController.getConversations(req, res)
);

/**
 * GET /api/meta/messages/:accountId/:contactId
 * Get messages from a specific conversation
 *
 * Query params:
 * - limit?: number (default: 50)
 */
router.get(
  '/messages/:accountId/:contactId',
  authenticate,
  (req, res) => getControllers().messagingController.getMessages(req, res)
);

export default router;
