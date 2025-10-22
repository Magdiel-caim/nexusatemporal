import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import notificaMeController from './notificame.controller';

const router = Router();

/**
 * Rotas Protegidas (requerem autenticação)
 */

// Teste de conexão
router.post(
  '/test-connection',
  authenticate,
  (req, res) => notificaMeController.testConnection(req, res)
);

// Envio de mensagens
router.post(
  '/send-message',
  authenticate,
  (req, res) => notificaMeController.sendMessage(req, res)
);

router.post(
  '/send-media',
  authenticate,
  (req, res) => notificaMeController.sendMedia(req, res)
);

router.post(
  '/send-template',
  authenticate,
  (req, res) => notificaMeController.sendTemplate(req, res)
);

router.post(
  '/send-buttons',
  authenticate,
  (req, res) => notificaMeController.sendButtons(req, res)
);

router.post(
  '/send-list',
  authenticate,
  (req, res) => notificaMeController.sendList(req, res)
);

// Gerenciamento de instâncias
router.get(
  '/instances',
  authenticate,
  (req, res) => notificaMeController.getInstances(req, res)
);

router.get(
  '/instances/platform/:platform',
  authenticate,
  (req, res) => notificaMeController.getInstancesByPlatform(req, res)
);

router.post(
  '/instances/create',
  authenticate,
  (req, res) => notificaMeController.createInstance(req, res)
);

router.get(
  '/instances/:instanceId',
  authenticate,
  (req, res) => notificaMeController.getInstance(req, res)
);

router.get(
  '/instances/:instanceId/qrcode',
  authenticate,
  (req, res) => notificaMeController.getQRCode(req, res)
);

router.post(
  '/instances/:instanceId/authorize',
  authenticate,
  (req, res) => notificaMeController.getAuthorizationUrl(req, res)
);

router.post(
  '/instances/:instanceId/callback',
  authenticate,
  (req, res) => notificaMeController.processCallback(req, res)
);

router.get(
  '/instances/:instanceId/sync',
  authenticate,
  (req, res) => notificaMeController.syncInstance(req, res)
);

router.post(
  '/instances/:instanceId/disconnect',
  authenticate,
  (req, res) => notificaMeController.disconnectInstance(req, res)
);

// Histórico de mensagens
router.get(
  '/messages/history',
  authenticate,
  (req, res) => notificaMeController.getMessageHistory(req, res)
);

router.post(
  '/messages/:messageId/mark-read',
  authenticate,
  (req, res) => notificaMeController.markAsRead(req, res)
);

// Estatísticas
router.get(
  '/stats',
  authenticate,
  (req, res) => notificaMeController.getStats(req, res)
);

router.get(
  '/stats/dashboard',
  authenticate,
  (req, res) => notificaMeController.getDashboardStats(req, res)
);

router.get(
  '/stats/history',
  authenticate,
  (req, res) => notificaMeController.getMessageHistoryStats(req, res)
);

// NotificaMe Hub - Canais e Mensagens Instagram
router.get(
  '/channels',
  authenticate,
  (req, res) => notificaMeController.listChannels(req, res)
);

router.post(
  '/send-instagram-message',
  authenticate,
  (req, res) => notificaMeController.sendInstagramMessage(req, res)
);

/**
 * Rota Pública (webhook - sem autenticação)
 * Notifica.me enviará eventos para esta rota
 */
router.post(
  '/webhook',
  (req, res) => notificaMeController.webhook(req, res)
);

export default router;
