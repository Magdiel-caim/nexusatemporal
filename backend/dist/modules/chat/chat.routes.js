"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const whatsapp_controller_1 = require("./whatsapp.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
const whatsappController = new whatsapp_controller_1.WhatsAppController();
// WhatsApp webhook (no authentication required)
router.post('/webhook/whatsapp', whatsappController.handleWebhook);
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
// WhatsApp session management
router.get('/whatsapp/sessions/:instanceId', whatsappController.getSessionStatus);
router.post('/whatsapp/sessions/:instanceId/start', whatsappController.startSession);
router.post('/whatsapp/sessions/:instanceId/stop', whatsappController.stopSession);
// WhatsApp media download
router.get('/whatsapp/media/:mediaId', whatsappController.downloadMedia);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map