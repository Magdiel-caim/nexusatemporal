"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const whatsapp_controller_1 = require("./whatsapp.controller");
const waha_session_controller_1 = require("./waha-session.controller");
const n8n_webhook_controller_1 = require("./n8n-webhook.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
const whatsappController = new whatsapp_controller_1.WhatsAppController();
const wahaSessionController = new waha_session_controller_1.WAHASessionController();
const n8nWebhookController = new n8n_webhook_controller_1.N8NWebhookController();
// WhatsApp webhooks (no authentication required)
router.post('/webhook/whatsapp', whatsappController.handleWebhook);
router.post('/webhook/waha/status', wahaSessionController.handleStatusWebhook);
// WAHA webhook direto (no authentication required)
router.post('/webhook/waha/message', (req, res) => n8nWebhookController.receiveWAHAWebhook(req, res));
// N8N webhooks (no authentication required - LEGADO)
router.post('/webhook/n8n/message', (req, res) => n8nWebhookController.receiveMessage(req, res));
// All other routes require authentication
router.use(auth_middleware_1.authenticate);
// Conversation routes
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.post('/conversations', chatController.createConversation);
router.put('/conversations/:id', chatController.updateConversation);
router.post('/conversations/:id/mark-read', chatController.markAsRead);
router.post('/conversations/:id/mark-unread', chatController.markAsUnread);
router.post('/conversations/:id/assign', chatController.assignConversation);
router.post('/conversations/:id/tags', chatController.addTag);
router.delete('/conversations/:id/tags', chatController.removeTag);
// Message routes
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);
// Tag routes
router.get('/tags', chatController.getTags);
router.post('/tags', chatController.createTag);
router.put('/tags/:id', chatController.updateTag);
router.delete('/tags/:id', chatController.deleteTag);
// Quick reply routes
router.get('/quick-replies', chatController.getQuickReplies);
router.post('/quick-replies', chatController.createQuickReply);
router.put('/quick-replies/:id', chatController.updateQuickReply);
router.delete('/quick-replies/:id', chatController.deleteQuickReply);
// Statistics
router.get('/stats', chatController.getStats);
// QR Code Proxy (authenticated)
router.get('/whatsapp/qrcode-proxy', chatController.getQRCodeProxy);
// N8N Chat Routes (authenticated)
router.get('/n8n/messages/:sessionName', (req, res) => n8nWebhookController.getMessages(req, res));
router.get('/n8n/conversations', (req, res) => n8nWebhookController.getConversations(req, res));
router.post('/n8n/messages/:sessionName/mark-read', (req, res) => n8nWebhookController.markAsRead(req, res));
router.post('/n8n/send-message', (req, res) => n8nWebhookController.sendMessage(req, res));
router.delete('/n8n/messages/:messageId', (req, res) => n8nWebhookController.deleteMessage(req, res));
// WAHA Session Management (WhatsApp Connection)
router.post('/whatsapp/sessions/create', wahaSessionController.createSession);
router.post('/whatsapp/sessions/register', wahaSessionController.registerSession);
router.post('/whatsapp/sessions/:sessionName/start', wahaSessionController.startSession);
router.post('/whatsapp/sessions/:sessionName/reconnect', wahaSessionController.reconnectSession);
router.get('/whatsapp/sessions/:sessionName/qr', wahaSessionController.getQRCode);
router.get('/whatsapp/sessions/:sessionName/status', wahaSessionController.getStatus);
router.get('/whatsapp/sessions', wahaSessionController.listSessions);
router.post('/whatsapp/sessions/:sessionName/stop', wahaSessionController.stopSession);
router.post('/whatsapp/sessions/:sessionName/logout', wahaSessionController.logoutSession);
router.delete('/whatsapp/sessions/:sessionName', wahaSessionController.deleteSession);
// Legacy WhatsApp session management (mantido para compatibilidade)
router.get('/whatsapp/sessions/legacy/:instanceId', whatsappController.getSessionStatus);
router.post('/whatsapp/sessions/legacy/:instanceId/start', whatsappController.startSession);
router.post('/whatsapp/sessions/legacy/:instanceId/stop', whatsappController.stopSession);
// WhatsApp media download
router.get('/whatsapp/media/:mediaId', whatsappController.downloadMedia);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map