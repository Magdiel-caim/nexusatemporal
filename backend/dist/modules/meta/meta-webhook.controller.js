"use strict";
/**
 * Meta Webhook Controller
 * Handles webhooks from Meta for Instagram & Messenger messages
 *
 * @module modules/meta
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaWebhookController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const meta_oauth_service_1 = require("./meta-oauth.service");
class MetaWebhookController {
    verifyToken;
    appSecret;
    db;
    metaService;
    constructor(db) {
        this.verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'nexus_meta_webhook_token_2025';
        this.appSecret = process.env.META_APP_SECRET || '';
        this.db = db;
        this.metaService = new meta_oauth_service_1.MetaOAuthService();
        if (!this.appSecret) {
            console.warn('[MetaWebhook] Warning: META_APP_SECRET not configured');
        }
    }
    /**
     * GET /api/meta/webhook
     * Webhook verification (Meta calls this during setup)
     */
    verify(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' && token === this.verifyToken) {
            console.log('[MetaWebhook] Webhook verified successfully');
            res.status(200).send(challenge);
        }
        else {
            console.error('[MetaWebhook] Webhook verification failed');
            res.sendStatus(403);
        }
    }
    /**
     * POST /api/meta/webhook
     * Receive webhook events
     */
    async receive(req, res) {
        try {
            // Validate signature (security)
            const signature = req.headers['x-hub-signature-256'];
            if (!this.validateSignature(signature, req.body)) {
                console.error('[MetaWebhook] Invalid signature');
                res.sendStatus(403);
                return;
            }
            const body = req.body;
            // Process events
            if (body.object === 'instagram') {
                for (const entry of body.entry) {
                    // Messages
                    if (entry.messaging) {
                        for (const event of entry.messaging) {
                            await this.handleMessagingEvent(event);
                        }
                    }
                    // Changes (e.g., message read)
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            await this.handleChangeEvent(change);
                        }
                    }
                }
            }
            // Always return 200 quickly (Meta expects fast response)
            res.sendStatus(200);
        }
        catch (error) {
            console.error('[MetaWebhook] Error processing webhook:', error);
            res.sendStatus(500);
        }
    }
    /**
     * Validate webhook signature
     */
    validateSignature(signature, body) {
        if (!signature)
            return false;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.appSecret)
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === `sha256=${expectedSignature}`;
    }
    /**
     * Handle messaging event
     */
    async handleMessagingEvent(event) {
        try {
            const senderId = event.sender?.id;
            const recipientId = event.recipient?.id;
            const timestamp = event.timestamp;
            if (!senderId || !recipientId) {
                console.warn('[MetaWebhook] Missing sender or recipient ID');
                return;
            }
            // Received message
            if (event.message) {
                await this.handleIncomingMessage(event.message, senderId, recipientId, timestamp);
            }
            // Postback (button click)
            if (event.postback) {
                await this.handlePostback(event.postback, senderId, recipientId, timestamp);
            }
            // Message read
            if (event.read) {
                await this.handleMessageRead(event.read, senderId);
            }
        }
        catch (error) {
            console.error('[MetaWebhook] Error handling messaging event:', error);
        }
    }
    /**
     * Handle incoming message
     */
    async handleIncomingMessage(message, senderId, recipientId, timestamp) {
        try {
            // Find connected account
            const accountResult = await this.db.query(`SELECT id, tenant_id FROM meta_instagram_accounts
         WHERE instagram_account_id = $1 AND status = 'active'`, [recipientId]);
            if (accountResult.rows.length === 0) {
                console.warn('[MetaWebhook] Account not found:', recipientId);
                return;
            }
            const account = accountResult.rows[0];
            // Extract message content
            const messageText = message.text || '';
            const attachments = message.attachments || [];
            // Determine message type
            let messageType = 'text';
            if (attachments.length > 0) {
                messageType = attachments[0].type; // 'image', 'video', 'audio', etc.
            }
            // Save message in database
            await this.db.query(`INSERT INTO instagram_messages (
          tenant_id, account_id, message_id, from_id, to_id,
          message_text, message_type, attachments, direction,
          status, sent_at, raw_payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'inbound', 'received', $9, $10)
        ON CONFLICT (message_id) DO NOTHING`, [
                account.tenant_id,
                account.id,
                message.mid,
                senderId,
                recipientId,
                messageText,
                messageType,
                JSON.stringify(attachments),
                new Date(timestamp),
                JSON.stringify(message),
            ]);
            console.log(`[MetaWebhook] Message received from ${senderId}: ${messageText}`);
            // TODO: Emit event for real-time notification (WebSocket)
            // TODO: Trigger automation if configured
        }
        catch (error) {
            console.error('[MetaWebhook] Error saving message:', error);
        }
    }
    /**
     * Handle postback (button click)
     */
    async handlePostback(postback, senderId, recipientId, timestamp) {
        console.log('[MetaWebhook] Postback received:', postback.payload);
        // TODO: Implement button logic
    }
    /**
     * Handle message read status
     */
    async handleMessageRead(read, senderId) {
        try {
            // Update message status to 'read'
            await this.db.query(`UPDATE instagram_messages
         SET status = 'read'
         WHERE from_id = $1 AND direction = 'outbound' AND status = 'delivered'`, [senderId]);
        }
        catch (error) {
            console.error('[MetaWebhook] Error updating read status:', error);
        }
    }
    /**
     * Handle change event
     */
    async handleChangeEvent(change) {
        console.log('[MetaWebhook] Change event:', change.field);
        // TODO: Handle other types of changes if needed
    }
}
exports.MetaWebhookController = MetaWebhookController;
//# sourceMappingURL=meta-webhook.controller.js.map