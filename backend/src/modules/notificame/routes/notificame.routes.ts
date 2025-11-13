import { Router } from 'express';
import { oauthController, channelController } from '../controllers';

const router = Router();

// ============================================
// OAuth Routes
// ============================================

// Instagram
router.get('/oauth/authorize/instagram', (req, res) =>
    oauthController.authorizeInstagram(req, res)
);
router.get('/oauth/callback/instagram', (req, res) =>
    oauthController.callbackInstagram(req, res)
);

// Facebook
router.get('/oauth/authorize/facebook', (req, res) =>
    oauthController.authorizeFacebook(req, res)
);

// ============================================
// Channel Management Routes
// ============================================

// Listar conexões
router.get('/channels', (req, res) =>
    channelController.list(req, res)
);

// Desconectar
router.delete('/channels/:id', (req, res) =>
    channelController.disconnect(req, res)
);

// Testar conexão
router.post('/channels/:id/test', (req, res) =>
    channelController.test(req, res)
);

export default router;
