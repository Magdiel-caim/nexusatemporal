import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { UserRole } from '../../modules/auth/user.entity';
import { Permission } from '../../modules/permissions/permission.types';
import { PermissionsService } from '../../modules/permissions/permissions.service';

/**
 * Middleware de autorização baseado em permissões
 *
 * Verifica se o usuário autenticado possui as permissões necessárias.
 *
 * @param permissions - Permissões requeridas (AND lógico - todas devem ser atendidas)
 * @param pool - Pool de conexão com o banco de dados
 * @returns Middleware function
 *
 * @example
 * // Requerer uma única permissão
 * router.post('/leads', authenticate, authorize([Permission.LEADS_CREATE], pool), controller.create);
 *
 * // Requerer múltiplas permissões (usuário deve ter TODAS)
 * router.delete('/leads/:id', authenticate, authorize([Permission.LEADS_DELETE, Permission.LEADS_UPDATE], pool), controller.delete);
 */
export const authorize = (
  permissions: (Permission | string)[],
  pool: Pool
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
        });
      }

      const permissionsService = new PermissionsService(pool);

      // Super admin sempre passa
      if (await permissionsService.isSuperAdmin(user.userId)) {
        return next();
      }

      // Verifica se o usuário tem todas as permissões requeridas
      const hasPermissions = await permissionsService.hasAllPermissions(
        user.userId,
        permissions
      );

      if (!hasPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para realizar esta ação',
          required: permissions,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões',
      });
    }
  };
};

/**
 * Middleware de autorização baseado em roles
 *
 * Verifica se o usuário possui um dos roles especificados.
 *
 * @param roles - Roles permitidos (OR lógico - pelo menos um deve ser atendido)
 * @param pool - Pool de conexão com o banco de dados
 * @returns Middleware function
 *
 * @example
 * // Apenas OWNER pode acessar
 * router.post('/billing', authenticate, requireRole([UserRole.OWNER], pool), controller.updateBilling);
 *
 * // OWNER ou ADMIN podem acessar
 * router.get('/reports', authenticate, requireRole([UserRole.OWNER, UserRole.ADMIN], pool), controller.getReports);
 */
export const requireRole = (
  roles: UserRole[],
  pool: Pool
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
        });
      }

      const permissionsService = new PermissionsService(pool);

      // Super admin sempre passa
      if (await permissionsService.isSuperAdmin(user.userId)) {
        return next();
      }

      // Verifica se o usuário tem algum dos roles requeridos
      const hasRole = await permissionsService.hasRole(user.userId, roles);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Role insuficiente para realizar esta ação',
          required: roles,
          current: user.role,
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar role',
      });
    }
  };
};

/**
 * Middleware para verificar se é super admin
 */
export const requireSuperAdmin = (pool: Pool) => {
  return requireRole([UserRole.SUPERADMIN, UserRole.SUPER_ADMIN], pool);
};

/**
 * Middleware para verificar se é owner do tenant
 */
export const requireOwner = (pool: Pool) => {
  return requireRole([UserRole.OWNER, UserRole.MANAGER], pool);
};

/**
 * Middleware para audit log automático
 *
 * Cria um log de auditoria após a execução bem-sucedida de uma rota.
 *
 * @param module - Módulo da ação (ex: 'leads', 'financial')
 * @param action - Ação realizada (ex: 'create', 'update', 'delete')
 * @param pool - Pool de conexão com o banco de dados
 * @returns Middleware function
 *
 * @example
 * router.delete('/leads/:id', authenticate, authorize([Permission.LEADS_DELETE], pool), auditLog('leads', 'delete', pool), controller.delete);
 */
export const auditLog = (
  module: string,
  action: string,
  pool: Pool
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data: any): Response {
      // Só loga se a operação foi bem-sucedida (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user;
        const permissionsService = new PermissionsService(pool);

        // Cria o log de forma assíncrona sem bloquear a resposta
        permissionsService.createAuditLog({
          userId: user?.userId || null,
          tenantId: user?.tenantId || null,
          action,
          module,
          entityType: req.params?.id ? 'unknown' : undefined,
          entityId: req.params?.id,
          newData: req.body,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }).catch(err => console.error('Audit log error:', err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
};
