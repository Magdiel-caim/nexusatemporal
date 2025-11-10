"use strict";
/**
 * Users Management Routes
 *
 * API routes for user management and permissions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("@/database/data-source");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const authorize_middleware_1 = require("@/shared/middlewares/authorize.middleware");
const permission_types_1 = require("../permissions/permission.types");
const router = (0, express_1.Router)();
// Get database connection pool from CrmDataSource
const getPool = () => {
    if (!data_source_1.CrmDataSource.isInitialized) {
        throw new Error('CRM Database not initialized');
    }
    return data_source_1.CrmDataSource.driver.master; // Get underlying pg Pool
};
// Initialize controller (will be done when routes are accessed)
let controller;
const initController = () => {
    if (!controller) {
        const pool = getPool();
        controller = new users_controller_1.UsersController(pool);
    }
};
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
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
    (0, authorize_middleware_1.authorize)([permission_types_1.Permission.USERS_VIEW_LOGS], pool)(req, res, () => {
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
    (0, authorize_middleware_1.authorize)([permission_types_1.Permission.USERS_VIEW_ALL], pool)(req, res, () => {
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
    (0, authorize_middleware_1.authorize)([permission_types_1.Permission.USERS_VIEW_ALL], pool)(req, res, () => {
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
    (0, authorize_middleware_1.auditLog)('users', 'create', pool)(req, res, () => {
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
    (0, authorize_middleware_1.auditLog)('users', 'update', pool)(req, res, () => {
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
    (0, authorize_middleware_1.auditLog)('users', 'resend_email', pool)(req, res, () => {
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
    (0, authorize_middleware_1.authorize)([permission_types_1.Permission.USERS_DELETE], pool)(req, res, () => {
        (0, authorize_middleware_1.auditLog)('users', 'delete', pool)(req, res, () => {
            controller.deleteUser(req, res);
        });
    });
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map