"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const user_entity_1 = require("../auth/user.entity");
/**
 * PermissionsService
 *
 * Serviço responsável por gerenciar permissões e logs de auditoria.
 */
class PermissionsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Verifica se um usuário tem uma permissão específica
     */
    async hasPermission(userId, permission) {
        try {
            const result = await this.pool.query('SELECT has_permission($1, $2) as has_permission', [userId, permission]);
            return result.rows[0]?.has_permission || false;
        }
        catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }
    /**
     * Verifica se um usuário tem múltiplas permissões (AND lógico)
     */
    async hasAllPermissions(userId, permissions) {
        if (permissions.length === 0)
            return true;
        const checks = await Promise.all(permissions.map(p => this.hasPermission(userId, p)));
        return checks.every(check => check === true);
    }
    /**
     * Verifica se um usuário tem pelo menos uma das permissões (OR lógico)
     */
    async hasAnyPermission(userId, permissions) {
        if (permissions.length === 0)
            return true;
        const checks = await Promise.all(permissions.map(p => this.hasPermission(userId, p)));
        return checks.some(check => check === true);
    }
    /**
     * Obtém todas as permissões de um usuário baseado em seu role
     */
    async getUserPermissions(userId) {
        try {
            const result = await this.pool.query(`SELECT DISTINCT p.name
         FROM users u
         JOIN role_permissions rp ON rp.role = u.role
         JOIN permissions p ON p.id = rp.permission_id
         WHERE u.id = $1`, [userId]);
            return result.rows.map(row => row.name);
        }
        catch (error) {
            console.error('Error getting user permissions:', error);
            return [];
        }
    }
    /**
     * Verifica se um usuário tem um role específico
     */
    async hasRole(userId, roles) {
        try {
            const rolesArray = Array.isArray(roles) ? roles : [roles];
            const result = await this.pool.query('SELECT role FROM users WHERE id = $1', [userId]);
            const userRole = result.rows[0]?.role;
            return rolesArray.includes(userRole);
        }
        catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    }
    /**
     * Verifica se um usuário é super admin
     */
    async isSuperAdmin(userId) {
        return this.hasRole(userId, [user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.SUPER_ADMIN]);
    }
    /**
     * Cria um log de auditoria
     */
    async createAuditLog(input) {
        const client = await this.pool.connect();
        try {
            await client.query(`INSERT INTO audit_logs (
          user_id,
          tenant_id,
          action,
          module,
          entity_type,
          entity_id,
          old_data,
          new_data,
          ip_address,
          user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
                input.userId,
                input.tenantId,
                input.action,
                input.module,
                input.entityType || null,
                input.entityId || null,
                input.oldData ? JSON.stringify(input.oldData) : null,
                input.newData ? JSON.stringify(input.newData) : null,
                input.ipAddress || null,
                input.userAgent || null,
            ]);
        }
        catch (error) {
            console.error('Error creating audit log:', error);
            // Não queremos que falha no audit log quebre a operação principal
        }
        finally {
            client.release();
        }
    }
    /**
     * Obtém logs de auditoria com filtros
     */
    async getAuditLogs(filters) {
        const { tenantId, userId, module, action, startDate, endDate, limit = 50, offset = 0, } = filters;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (tenantId) {
            conditions.push(`tenant_id = $${paramIndex++}`);
            params.push(tenantId);
        }
        if (userId) {
            conditions.push(`user_id = $${paramIndex++}`);
            params.push(userId);
        }
        if (module) {
            conditions.push(`module = $${paramIndex++}`);
            params.push(module);
        }
        if (action) {
            conditions.push(`action = $${paramIndex++}`);
            params.push(action);
        }
        if (startDate) {
            conditions.push(`"createdAt" >= $${paramIndex++}`);
            params.push(startDate);
        }
        if (endDate) {
            conditions.push(`"createdAt" <= $${paramIndex++}`);
            params.push(endDate);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(limit, offset);
        const result = await this.pool.query(`SELECT
        al.*,
        u.name as user_name,
        u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al."createdAt" DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, params);
        const countResult = await this.pool.query(`SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`, params.slice(0, -2) // Remove limit and offset
        );
        return {
            logs: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit,
            offset,
        };
    }
    /**
     * Obtém todas as permissões disponíveis
     */
    async getAllPermissions() {
        const result = await this.pool.query(`SELECT id, name, description, module, action
       FROM permissions
       ORDER BY module, name`);
        return result.rows;
    }
    /**
     * Obtém permissões por role
     */
    async getPermissionsByRole(role) {
        const result = await this.pool.query(`SELECT p.id, p.name, p.description, p.module, p.action
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role = $1
       ORDER BY p.module, p.name`, [role]);
        return result.rows;
    }
}
exports.PermissionsService = PermissionsService;
//# sourceMappingURL=permissions.service.js.map