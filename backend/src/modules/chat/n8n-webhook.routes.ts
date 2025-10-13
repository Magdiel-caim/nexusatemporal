import { Router } from 'express';
import { N8NWebhookController } from './n8n-webhook.controller';

const router = Router();
const controller = new N8NWebhookController();

// Webhook para receber mensagens do N8N (legado)
router.post('/webhook/n8n/message', (req, res) => controller.receiveMessage(req, res));

// Webhook para receber mensagens DIRETO do WAHA (sem N8N)
router.post('/webhook/waha/message', (req, res) => controller.receiveWAHAWebhook(req, res));

// Listar mensagens de uma sessão
router.get('/messages/:sessionName', (req, res) => controller.getMessages(req, res));

// Listar conversas
router.get('/conversations', (req, res) => controller.getConversations(req, res));

// Enviar mensagem via WhatsApp
router.post('/send-message', (req, res) => controller.sendMessage(req, res));

// Enviar mídia via WhatsApp
router.post('/send-media', (req, res) => controller.sendMedia(req, res));

// Marcar mensagens como lidas
router.post('/messages/:sessionName/mark-read', (req, res) => controller.markAsRead(req, res));

// Deletar mensagem
router.delete('/messages/:messageId', (req, res) => controller.deleteMessage(req, res));

export default router;
