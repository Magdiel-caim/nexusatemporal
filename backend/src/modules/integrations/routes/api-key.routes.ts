import { Router } from 'express';
import { CrmDataSource } from '../../../database/data-source';
import { ApiKey } from '../entities/api-key.entity';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyController } from '../controllers/api-key.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Inicializa service e controller
const apiKeyRepository = CrmDataSource.getRepository(ApiKey);
const apiKeyService = new ApiKeyService(apiKeyRepository);
const apiKeyController = new ApiKeyController(apiKeyService);

// Todas as rotas exigem autenticação
router.use(authenticate);

// ========== ROTAS DE API KEYS ==========

// Estatísticas (antes do :id para não conflitar)
router.get('/stats', apiKeyController.getStats);

// CRUD básico
router.get('/', apiKeyController.list);
router.post('/', apiKeyController.create);
router.get('/:id', apiKeyController.getById);
router.put('/:id', apiKeyController.update);
router.delete('/:id', apiKeyController.delete);

// Ações específicas
router.post('/:id/revoke', apiKeyController.revoke);
router.post('/:id/activate', apiKeyController.activate);

export default router;
