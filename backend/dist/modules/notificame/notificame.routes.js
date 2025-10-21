"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const notificame_controller_1 = __importDefault(require("./notificame.controller"));
const router = (0, express_1.Router)();
/**
 * Rotas Protegidas (requerem autenticação)
 */
// Teste de conexão
router.post('/test-connection', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.testConnection(req, res));
// Envio de mensagens
router.post('/send-message', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.sendMessage(req, res));
router.post('/send-media', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.sendMedia(req, res));
router.post('/send-template', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.sendTemplate(req, res));
router.post('/send-buttons', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.sendButtons(req, res));
router.post('/send-list', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.sendList(req, res));
// Gerenciamento de instâncias
router.get('/instances', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.getInstances(req, res));
router.get('/instances/:instanceId', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.getInstance(req, res));
router.get('/instances/:instanceId/qrcode', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.getQRCode(req, res));
router.post('/instances/:instanceId/disconnect', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.disconnectInstance(req, res));
// Histórico de mensagens
router.get('/messages/history', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.getMessageHistory(req, res));
router.post('/messages/:messageId/mark-read', auth_middleware_1.authenticate, (req, res) => notificame_controller_1.default.markAsRead(req, res));
/**
 * Rota Pública (webhook - sem autenticação)
 * Notifica.me enviará eventos para esta rota
 */
router.post('/webhook', (req, res) => notificame_controller_1.default.webhook(req, res));
exports.default = router;
//# sourceMappingURL=notificame.routes.js.map