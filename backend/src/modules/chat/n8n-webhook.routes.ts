import { Router } from 'express';
import { N8NWebhookController } from './n8n-webhook.controller';

const router = Router();
const controller = new N8NWebhookController();

// Webhook para receber mensagens do N8N
router.post('/webhook/n8n/message', (req, res) => controller.receiveMessage(req, res));

// Listar mensagens de uma sessão
router.get('/messages/:sessionName', (req, res) => controller.getMessages(req, res));

// Listar conversas
router.get('/conversations', (req, res) => controller.getConversations(req, res));

export default router;
