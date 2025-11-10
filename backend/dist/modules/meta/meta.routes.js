"use strict";
/**
 * Meta Instagram & Messenger Routes
 * Direct integration with Meta Graph API
 *
 * @module modules/meta
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const data_source_1 = require("@/database/data-source");
const meta_oauth_controller_1 = require("./meta-oauth.controller");
const meta_webhook_controller_1 = require("./meta-webhook.controller");
const meta_messaging_controller_1 = require("./meta-messaging.controller");
const router = (0, express_1.Router)();
// Get database pool from CRM DataSource
const getDbPool = () => {
    const driver = data_source_1.CrmDataSource.driver;
    if (!driver || !driver.master) {
        throw new Error('CrmDataSource not initialized');
    }
    return driver.master;
};
// Lazy initialization of controllers to avoid accessing DB before initialization
let oauthController;
let webhookController;
let messagingController;
const getControllers = () => {
    if (!oauthController) {
        oauthController = new meta_oauth_controller_1.MetaOAuthController(getDbPool());
        webhookController = new meta_webhook_controller_1.MetaWebhookController(getDbPool());
        messagingController = new meta_messaging_controller_1.MetaMessagingController(getDbPool());
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
router.get('/oauth/start', auth_middleware_1.authenticate, (req, res) => getControllers().oauthController.startOAuth(req, res));
/**
 * GET /api/meta/oauth/callback
 * OAuth callback - Meta redirects here after user authorization
 * This is called by Meta, not the frontend, so no authentication
 */
router.get('/oauth/callback', (req, res) => getControllers().oauthController.oauthCallback(req, res));
/**
 * GET /api/meta/accounts
 * List all connected Instagram accounts for tenant
 */
router.get('/accounts', auth_middleware_1.authenticate, (req, res) => getControllers().oauthController.listAccounts(req, res));
/**
 * DELETE /api/meta/accounts/:id
 * Disconnect an Instagram account
 */
router.delete('/accounts/:id', auth_middleware_1.authenticate, (req, res) => getControllers().oauthController.disconnectAccount(req, res));
// ============================================
// WEBHOOK ROUTES (Public - Meta calls these)
// ============================================
/**
 * GET /api/meta/webhook
 * Webhook verification endpoint
 * Meta calls this to verify the webhook URL during setup
 */
router.get('/webhook', (req, res) => getControllers().webhookController.verify(req, res));
/**
 * POST /api/meta/webhook
 * Receive webhook events from Meta
 * Meta sends messages and other events here
 */
router.post('/webhook', (req, res) => getControllers().webhookController.receive(req, res));
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
router.post('/send-message', auth_middleware_1.authenticate, (req, res) => getControllers().messagingController.sendMessage(req, res));
/**
 * GET /api/meta/conversations/:accountId
 * Get all conversations for an account
 *
 * Query params:
 * - limit?: number (default: 20)
 */
router.get('/conversations/:accountId', auth_middleware_1.authenticate, (req, res) => getControllers().messagingController.getConversations(req, res));
/**
 * GET /api/meta/messages/:accountId/:contactId
 * Get messages from a specific conversation
 *
 * Query params:
 * - limit?: number (default: 50)
 */
router.get('/messages/:accountId/:contactId', auth_middleware_1.authenticate, (req, res) => getControllers().messagingController.getMessages(req, res));
exports.default = router;
//# sourceMappingURL=meta.routes.js.map