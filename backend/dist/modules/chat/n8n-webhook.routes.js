"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const n8n_webhook_controller_1 = require("./n8n-webhook.controller");
const router = (0, express_1.Router)();
const controller = new n8n_webhook_controller_1.N8NWebhookController();
// Webhook para receber mensagens do N8N (legado)
router.post('/webhook/n8n/message', (req, res) => controller.receiveMessage(req, res));
// Webhook para receber mensagens do N8N com mídia em base64
router.post('/webhook/n8n/message-media', (req, res) => controller.receiveMessageWithMedia(req, res));
// Webhook para receber mensagens DIRETO do WAHA (sem N8N)
router.post('/webhook/waha/message', (req, res) => controller.receiveWAHAWebhook(req, res));
// Listar mensagens de uma sessão
router.get('/messages/:sessionName', (req, res) => controller.getMessages(req, res));
// Listar conversas
router.get('/conversations', (req, res) => controller.getConversations(req, res));
// Listar sessões WhatsApp disponíveis
// TODO: Implementar método getSessions no controller
// router.get('/sessions', (req, res) => controller.getSessions(req, res));
// Download de mídia via WAHA
// TODO: Implementar método downloadMedia no controller
// router.get('/media/:sessionName/:messageId', (req, res) => controller.downloadMedia(req, res));
// Enviar mensagem via WhatsApp
router.post('/send-message', (req, res) => controller.sendMessage(req, res));
// Enviar mídia via WhatsApp
router.post('/send-media', (req, res) => controller.sendMedia(req, res));
// Marcar mensagens como lidas
router.post('/messages/:sessionName/mark-read', (req, res) => controller.markAsRead(req, res));
// Deletar mensagem
router.delete('/messages/:messageId', (req, res) => controller.deleteMessage(req, res));
exports.default = router;
//# sourceMappingURL=n8n-webhook.routes.js.map