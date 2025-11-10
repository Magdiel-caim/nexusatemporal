"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const user_entity_1 = require("../auth/user.entity");
const permissions_service_1 = require("../permissions/permissions.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_1 = require("@/shared/utils/email");
const crypto_1 = __importDefault(require("crypto"));
/**
 * UsersController
 *
 * Controller para gerenciamento de usuários.
 * Rotas protegidas por permissões conforme documento RBAC.
 */
class UsersController {
    pool;
    permissionsService;
    constructor(pool) {
        this.pool = pool;
        this.permissionsService = new permissions_service_1.PermissionsService(pool);
    }
    /**
     * GET /api/users
     * Lista todos os usuários do tenant
     * Permissão: users.view_all
     */
    listUsers = async (req, res) => {
        try {
            const user = req.user;
            const { page = 1, limit = 50, role, status, search } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const conditions = [];
            const params = [];
            let paramIndex = 1;
            // Filtrar por tenant (exceto superadmin)
            if (!await this.permissionsService.isSuperAdmin(user.userId)) {
                conditions.push(`"tenantId" = $${paramIndex++}`);
                params.push(user.tenantId);
            }
            if (role) {
                conditions.push(`role = $${paramIndex++}`);
                params.push(role);
            }
            if (status) {
                conditions.push(`status = $${paramIndex++}`);
                params.push(status);
            }
            if (search) {
                conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            params.push(limit, offset);
            const result = await this.pool.query(`SELECT id, email, name, phone, avatar, role, status, "tenantId", "emailVerified", "lastLoginAt", "createdAt", "updatedAt"
         FROM users
         ${whereClause}
         ORDER BY "createdAt" DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, params);
            const countResult = await this.pool.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params.slice(0, -2));
            res.json({
                success: true,
                data: {
                    users: result.rows,
                    total: parseInt(countResult.rows[0].total),
                    page: Number(page),
                    limit: Number(limit),
                },
            });
        }
        catch (error) {
            console.error('Error listing users:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao listar usuários',
            });
        }
    };
    /**
     * GET /api/users/:id
     * Obtém detalhes de um usuário
     * Permissão: users.view_all
     */
    getUser = async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;
            const result = await this.pool.query(`SELECT id, email, name, phone, avatar, role, status, "tenantId", "emailVerified", "lastLoginAt", permissions, preferences, "createdAt", "updatedAt"
         FROM users
         WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado',
                });
            }
            const targetUser = result.rows[0];
            // Verificar se pode acessar este usuário (mesmo tenant ou superadmin)
            if (!await this.permissionsService.isSuperAdmin(user.userId)) {
                if (targetUser.tenantId !== user.tenantId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Sem permissão para acessar este usuário',
                    });
                }
            }
            res.json({
                success: true,
                data: targetUser,
            });
        }
        catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar usuário',
            });
        }
    };
    /**
     * POST /api/users
     * Cria um novo usuário
     * Permissão: users.create ou users.create_basic
     */
    createUser = async (req, res) => {
        const client = await this.pool.connect();
        try {
            const user = req.user;
            const { email, password, name, phone, role, status = user_entity_1.UserStatus.ACTIVE } = req.body;
            // Validação básica
            if (!email || !password || !name || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, senha, nome e role são obrigatórios',
                });
            }
            // Verificar se pode criar este tipo de role
            const hasFullCreate = await this.permissionsService.hasPermission(user.userId, 'users.create');
            const hasBasicCreate = await this.permissionsService.hasPermission(user.userId, 'users.create_basic');
            const basicRoles = [user_entity_1.UserRole.USER, user_entity_1.UserRole.RECEPTIONIST, user_entity_1.UserRole.PROFESSIONAL, user_entity_1.UserRole.DOCTOR];
            if (!hasFullCreate && hasBasicCreate) {
                // Pode criar apenas roles básicos
                if (!basicRoles.includes(role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Sem permissão para criar este tipo de usuário',
                    });
                }
            }
            else if (!hasFullCreate) {
                return res.status(403).json({
                    success: false,
                    message: 'Sem permissão para criar usuários',
                });
            }
            await client.query('BEGIN');
            // Verificar se email já existe
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    success: false,
                    message: 'Email já cadastrado',
                });
            }
            // Criar usuário
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const tenantId = user.tenantId; // Herda o tenant do criador
            // Gerar token de primeiro acesso (válido por 24 horas)
            const firstAccessToken = crypto_1.default.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 24 * 3600000); // 24 horas
            const result = await client.query(`INSERT INTO users (email, password, name, phone, role, status, "tenantId", "passwordResetToken", "passwordResetExpires")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, name, phone, role, status, "tenantId", "createdAt"`, [email, hashedPassword, name, phone || null, role, status, tenantId, firstAccessToken, tokenExpires]);
            await client.query('COMMIT');
            // Enviar email de boas-vindas com link de primeiro acesso
            try {
                const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${firstAccessToken}`;
                await (0, email_1.sendEmail)({
                    to: email,
                    subject: 'Bem-vindo ao Nexus Atemporal - Primeiro Acesso',
                    html: `
            <h1>Bem-vindo ao Nexus Atemporal!</h1>
            <p>Olá <strong>${name}</strong>,</p>
            <p>Uma conta foi criada para você no sistema Nexus Atemporal CRM.</p>
            <p><strong>Suas credenciais de acesso:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Senha temporária:</strong> ${password}</li>
            </ul>
            <p>Por segurança, recomendamos que você altere sua senha no primeiro acesso.</p>
            <p>Clique no link abaixo para definir uma nova senha:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Definir Nova Senha</a>
            <p>Ou acesse diretamente o sistema em: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
            <p>Este link de redefinição de senha expira em 24 horas.</p>
            <p>Se você não solicitou esta conta, por favor ignore este email.</p>
            <br>
            <p>Atenciosamente,<br>Equipe Nexus Atemporal</p>
          `,
                });
            }
            catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // Não falha a criação do usuário se o email falhar
            }
            // Criar audit log
            await this.permissionsService.createAuditLog({
                userId: user.userId,
                tenantId: user.tenantId || null,
                action: 'create',
                module: 'users',
                entityType: 'User',
                entityId: result.rows[0].id,
                newData: { email, name, role, status },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            res.status(201).json({
                success: true,
                data: result.rows[0],
                message: 'Usuário criado com sucesso',
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar usuário',
            });
        }
        finally {
            client.release();
        }
    };
    /**
     * PUT /api/users/:id
     * Atualiza um usuário
     * Permissão: users.update ou users.update_basic
     */
    updateUser = async (req, res) => {
        const client = await this.pool.connect();
        try {
            const user = req.user;
            const { id } = req.params;
            const { name, phone, role, status, password } = req.body;
            // Buscar usuário atual
            const currentUser = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            if (currentUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado',
                });
            }
            const targetUser = currentUser.rows[0];
            // Verificar permissões
            const hasFullUpdate = await this.permissionsService.hasPermission(user.userId, 'users.update');
            const hasBasicUpdate = await this.permissionsService.hasPermission(user.userId, 'users.update_basic');
            const basicRoles = [user_entity_1.UserRole.USER, user_entity_1.UserRole.RECEPTIONIST, user_entity_1.UserRole.PROFESSIONAL, user_entity_1.UserRole.DOCTOR];
            const privilegedRoles = [user_entity_1.UserRole.OWNER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MANAGER, user_entity_1.UserRole.SUPERADMIN, user_entity_1.UserRole.SUPER_ADMIN];
            // ADMIN não pode editar OWNER ou outros ADMIN
            if (!hasFullUpdate && hasBasicUpdate) {
                if (privilegedRoles.includes(targetUser.role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Sem permissão para editar este usuário',
                    });
                }
            }
            else if (!hasFullUpdate) {
                return res.status(403).json({
                    success: false,
                    message: 'Sem permissão para editar usuários',
                });
            }
            await client.query('BEGIN');
            const updates = [];
            const params = [];
            let paramIndex = 1;
            if (name) {
                updates.push(`name = $${paramIndex++}`);
                params.push(name);
            }
            if (phone !== undefined) {
                updates.push(`phone = $${paramIndex++}`);
                params.push(phone);
            }
            if (role && hasFullUpdate) {
                updates.push(`role = $${paramIndex++}`);
                params.push(role);
            }
            if (status && hasFullUpdate) {
                updates.push(`status = $${paramIndex++}`);
                params.push(status);
            }
            if (password) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 12);
                updates.push(`password = $${paramIndex++}`);
                params.push(hashedPassword);
            }
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum campo para atualizar',
                });
            }
            updates.push(`"updatedAt" = NOW()`);
            params.push(id);
            const result = await client.query(`UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, email, name, phone, role, status, "tenantId", "updatedAt"`, params);
            await client.query('COMMIT');
            // Criar audit log
            await this.permissionsService.createAuditLog({
                userId: user.userId,
                tenantId: user.tenantId || null,
                action: 'update',
                module: 'users',
                entityType: 'User',
                entityId: id,
                oldData: targetUser,
                newData: result.rows[0],
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Usuário atualizado com sucesso',
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar usuário',
            });
        }
        finally {
            client.release();
        }
    };
    /**
     * DELETE /api/users/:id
     * Exclui um usuário (soft delete)
     * Permissão: users.delete
     */
    deleteUser = async (req, res) => {
        const client = await this.pool.connect();
        try {
            const user = req.user;
            const { id } = req.params;
            // Não pode excluir a si mesmo
            if (id === user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível excluir seu próprio usuário',
                });
            }
            // Buscar usuário
            const targetUser = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            if (targetUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado',
                });
            }
            await client.query('BEGIN');
            // Soft delete - marca como inativo e registra data de exclusão
            const deletedAt = new Date();
            await client.query(`UPDATE users
         SET status = $1, "deletedAt" = $2, "updatedAt" = NOW()
         WHERE id = $3`, [user_entity_1.UserStatus.INACTIVE, deletedAt, id]);
            await client.query('COMMIT');
            // Criar audit log
            await this.permissionsService.createAuditLog({
                userId: user.userId,
                tenantId: user.tenantId || null,
                action: 'delete',
                module: 'users',
                entityType: 'User',
                entityId: id,
                oldData: targetUser.rows[0],
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            res.json({
                success: true,
                message: 'Usuário desativado com sucesso. O usuário será removido permanentemente do sistema após 30 dias. Seus leads e atendimentos serão automaticamente transferidos para o gerente.',
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao excluir usuário',
            });
        }
        finally {
            client.release();
        }
    };
    /**
     * GET /api/users/permissions/me
     * Obtém permissões do usuário atual
     */
    getMyPermissions = async (req, res) => {
        try {
            const user = req.user;
            const permissions = await this.permissionsService.getUserPermissions(user.userId);
            const isSuperAdmin = await this.permissionsService.isSuperAdmin(user.userId);
            res.json({
                success: true,
                data: {
                    userId: user.userId,
                    role: user.role,
                    isSuperAdmin,
                    permissions,
                },
            });
        }
        catch (error) {
            console.error('Error getting permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar permissões',
            });
        }
    };
    /**
     * GET /api/users/audit-logs
     * Lista logs de auditoria
     * Permissão: users.view_logs
     */
    getAuditLogs = async (req, res) => {
        try {
            const user = req.user;
            const { userId, module, action, startDate, endDate, page = 1, limit = 50, } = req.query;
            const result = await this.permissionsService.getAuditLogs({
                tenantId: user.tenantId || undefined,
                userId: userId,
                module: module,
                action: action,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit: Number(limit),
                offset: (Number(page) - 1) * Number(limit),
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Error getting audit logs:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar logs de auditoria',
            });
        }
    };
    /**
     * POST /api/users/:id/resend-welcome-email
     * Reenvia email de boas-vindas
     * Permissão: users.update ou users.update_basic
     */
    resendWelcomeEmail = async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;
            // Buscar usuário
            const result = await this.pool.query('SELECT id, email, name, "passwordResetToken", "passwordResetExpires" FROM users WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado',
                });
            }
            const targetUser = result.rows[0];
            // Gerar novo token se não existir ou estiver expirado
            let token = targetUser.passwordResetToken;
            let tokenExpires = targetUser.passwordResetExpires;
            if (!token || !tokenExpires || new Date(tokenExpires) < new Date()) {
                token = crypto_1.default.randomBytes(32).toString('hex');
                tokenExpires = new Date(Date.now() + 24 * 3600000); // 24 horas
                await this.pool.query(`UPDATE users
           SET "passwordResetToken" = $1, "passwordResetExpires" = $2, "updatedAt" = NOW()
           WHERE id = $3`, [token, tokenExpires, id]);
            }
            // Gerar senha temporária aleatória para mostrar no email
            const tempPassword = crypto_1.default.randomBytes(8).toString('hex');
            // Enviar email
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await (0, email_1.sendEmail)({
                to: targetUser.email,
                subject: 'Bem-vindo ao Nexus Atemporal - Acesso ao Sistema',
                html: `
          <h1>Bem-vindo ao Nexus Atemporal!</h1>
          <p>Olá <strong>${targetUser.name}</strong>,</p>
          <p>Este é seu email de acesso ao sistema Nexus Atemporal CRM.</p>
          <p><strong>Suas credenciais:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${targetUser.email}</li>
            <li><strong>Link de primeiro acesso:</strong> Clique no botão abaixo</li>
          </ul>
          <p>Por segurança, recomendamos que você defina sua própria senha no primeiro acesso.</p>
          <p>Clique no link abaixo para definir sua senha:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Definir Minha Senha</a>
          <p>Ou acesse diretamente o sistema em: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          <p>Este link expira em 24 horas.</p>
          <p>Se você não solicitou esta conta, por favor ignore este email.</p>
          <br>
          <p>Atenciosamente,<br>Equipe Nexus Atemporal</p>
        `,
            });
            // Criar audit log
            await this.permissionsService.createAuditLog({
                userId: user.userId,
                tenantId: user.tenantId || null,
                action: 'resend_email',
                module: 'users',
                entityType: 'User',
                entityId: id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            res.json({
                success: true,
                message: 'Email de boas-vindas reenviado com sucesso',
            });
        }
        catch (error) {
            console.error('Error resending welcome email:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao reenviar email',
            });
        }
    };
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map