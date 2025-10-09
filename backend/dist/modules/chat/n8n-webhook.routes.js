"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const n8n_webhook_controller_1 = require("./n8n-webhook.controller");
const router = (0, express_1.Router)();
const controller = new n8n_webhook_controller_1.N8NWebhookController();
// Webhook para receber mensagens do N8N
router.post('/webhook/n8n/message', (req, res) => controller.receiveMessage(req, res));
// Listar mensagens de uma sessão
router.get('/messages/:sessionName', (req, res) => controller.getMessages(req, res));
// Listar conversas
router.get('/conversations', (req, res) => controller.getConversations(req, res));
exports.default = router;
//# sourceMappingURL=n8n-webhook.routes.js.map