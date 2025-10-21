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

/**
 * Rota Pública (webhook - sem autenticação)
 * Notifica.me enviará eventos para esta rota
 */
router.post(
  '/webhook',
  (req, res) => notificaMeController.webhook(req, res)
);

export default router;
