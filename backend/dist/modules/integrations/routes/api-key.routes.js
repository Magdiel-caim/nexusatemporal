"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../../database/data-source");
const api_key_entity_1 = require("../entities/api-key.entity");
const api_key_service_1 = require("../services/api-key.service");
const api_key_controller_1 = require("../controllers/api-key.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Inicializa service e controller
const apiKeyRepository = data_source_1.CrmDataSource.getRepository(api_key_entity_1.ApiKey);
const apiKeyService = new api_key_service_1.ApiKeyService(apiKeyRepository);
const apiKeyController = new api_key_controller_1.ApiKeyController(apiKeyService);
// Todas as rotas exigem autenticação
router.use(auth_middleware_1.authenticate);
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
exports.default = router;
//# sourceMappingURL=api-key.routes.js.map