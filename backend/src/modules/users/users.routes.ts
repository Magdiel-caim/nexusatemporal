/**
 * Users Management Routes
 *
 * API routes for user management and permissions
 */

import { Router } from 'express';
import { CrmDataSource } from '@/database/data-source';
import { UsersController } from './users.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { authenticateApiKey } from '@/shared/middleware/api-key-auth.middleware';
import { authorize, auditLog } from '@/shared/middlewares/authorize.middleware';
import { Permission } from '../permissions/permission.types';

const router = Router();

// Get database connection pool from CrmDataSource
const getPool = () => {
  if (!CrmDataSource.isInitialized) {
    throw new Error('CRM Database not initialized');
  }
  return (CrmDataSource.driver as any).master; // Get underlying pg Pool
};

// Initialize controller (will be done when routes are accessed)
let controller: UsersController;

const initController = () => {
  if (!controller) {
    const pool = getPool();
    controller = new UsersController(pool);
  }
};

/**
 * POST /api/users/external/create-from-payment
 * Rota externa para criar usuário após pagamento no Site de Checkout
 * Autenticação: API Key (sem JWT)
 * IMPORTANTE: Esta rota deve vir ANTES do middleware authenticate
 */
router.post('/external/create-from-payment', authenticateApiKey, (req, res) => {
  initController();
  controller.createUserFromPayment(req, res);
});

// Todas as outras rotas requerem autenticação JWT
router.use(authenticate);

/**
 * GET /api/users/permissions/me
 * Obtém permissões do usuário atual
 * Sem restrição - qualquer usuário autenticado pode ver suas próprias permissões
 */
router.get('/permissions/me', (req, res) => {
  initController();
  controller.getMyPermissions(req, res);
});

/**
 * GET /api/users/audit-logs
 * Lista logs de auditoria
 * Permissão: users.view_logs
 */
router.get('/audit-logs', (req, res, next) => {
  initController();
  const pool = getPool();
  authorize([Permission.USERS_VIEW_LOGS], pool)(req, res, () => {
    controller.getAuditLogs(req, res);
  });
});

/**
 * GET /api/users
 * Lista todos os usuários
 * Permissão: users.view_all
 */
router.get('/', (req, res, next) => {
  initController();
  const pool = getPool();
  authorize([Permission.USERS_VIEW_ALL], pool)(req, res, () => {
    controller.listUsers(req, res);
  });
});

/**
 * GET /api/users/:id
 * Obtém detalhes de um usuário
 * Permissão: users.view_all
 */
router.get('/:id', (req, res, next) => {
  initController();
  const pool = getPool();
  authorize([Permission.USERS_VIEW_ALL], pool)(req, res, () => {
    controller.getUser(req, res);
  });
});

/**
 * POST /api/users
 * Cria um novo usuário
 * Permissão: users.create ou users.create_basic (validado no controller)
 */
router.post('/', (req, res, next) => {
  initController();
  const pool = getPool();
  auditLog('users', 'create', pool)(req, res, () => {
    controller.createUser(req, res);
  });
});

/**
 * PUT /api/users/:id
 * Atualiza um usuário
 * Permissão: users.update ou users.update_basic (validado no controller)
 */
router.put('/:id', (req, res, next) => {
  initController();
  const pool = getPool();
  auditLog('users', 'update', pool)(req, res, () => {
    controller.updateUser(req, res);
  });
});

/**
 * POST /api/users/:id/resend-welcome-email
 * Reenvia email de boas-vindas
 * Permissão: users.update ou users.update_basic
 */
router.post('/:id/resend-welcome-email', (req, res, next) => {
  initController();
  const pool = getPool();
  auditLog('users', 'resend_email', pool)(req, res, () => {
    controller.resendWelcomeEmail(req, res);
  });
});

/**
 * DELETE /api/users/:id
 * Exclui um usuário (soft delete)
 * Permissão: users.delete
 */
router.delete('/:id', (req, res, next) => {
  initController();
  const pool = getPool();
  authorize([Permission.USERS_DELETE], pool)(req, res, () => {
    auditLog('users', 'delete', pool)(req, res, () => {
      controller.deleteUser(req, res);
    });
  });
});

export default router;
