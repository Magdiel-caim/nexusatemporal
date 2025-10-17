-- ================================================
-- Sistema de Permissões RBAC - Nexus Atemporal
-- ================================================

-- 1. Adicionar novos roles ao enum existente (se não existirem)
DO $$
BEGIN
    -- Adicionar 'owner' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'owner' AND enumtypid = 'users_role_enum'::regtype) THEN
        ALTER TYPE users_role_enum ADD VALUE 'owner';
    END IF;

    -- Adicionar 'professional' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'professional' AND enumtypid = 'users_role_enum'::regtype) THEN
        ALTER TYPE users_role_enum ADD VALUE 'professional';
    END IF;

    -- Adicionar 'superadmin' se não existir (alternativo a super_admin)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'superadmin' AND enumtypid = 'users_role_enum'::regtype) THEN
        ALTER TYPE users_role_enum ADD VALUE 'superadmin';
    END IF;
END$$;

-- 2. Criar tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE permissions IS 'Permissões granulares do sistema';
COMMENT ON COLUMN permissions.name IS 'Nome único da permissão (ex: leads.create)';
COMMENT ON COLUMN permissions.module IS 'Módulo do sistema (ex: leads, financial, users)';
COMMENT ON COLUMN permissions.action IS 'Ação da permissão (ex: create, read, update, delete)';

-- 3. Criar tabela de relacionamento role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role users_role_enum NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Mapeamento entre roles e permissões';

-- 4. Criar tabela de audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações sensíveis';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada (ex: create, update, delete, approve)';

-- 5. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs("createdAt");
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 6. Popular permissões padrão
INSERT INTO permissions (name, description, module, action) VALUES
-- Dashboard
('dashboard.view_all', 'Ver dashboard completo', 'dashboard', 'view_all'),
('dashboard.view_personal', 'Ver dashboard pessoal', 'dashboard', 'view_personal'),
('dashboard.view_operational', 'Ver métricas operacionais', 'dashboard', 'view_operational'),

-- Leads
('leads.create', 'Criar leads', 'leads', 'create'),
('leads.read', 'Visualizar leads', 'leads', 'read'),
('leads.read_all', 'Visualizar todos os leads', 'leads', 'read_all'),
('leads.read_assigned', 'Visualizar leads atribuídos', 'leads', 'read_assigned'),
('leads.update', 'Editar leads', 'leads', 'update'),
('leads.update_all', 'Editar todos os leads', 'leads', 'update_all'),
('leads.update_own', 'Editar próprios leads', 'leads', 'update_own'),
('leads.delete', 'Excluir leads', 'leads', 'delete'),
('leads.assign', 'Atribuir leads', 'leads', 'assign'),
('leads.export', 'Exportar leads', 'leads', 'export'),
('leads.import', 'Importar leads', 'leads', 'import'),
('leads.configure', 'Configurar funis e etapas', 'leads', 'configure'),

-- Agenda
('agenda.view_all', 'Ver agenda de todos', 'agenda', 'view_all'),
('agenda.view_own', 'Ver própria agenda', 'agenda', 'view_own'),
('agenda.create', 'Criar agendamentos', 'agenda', 'create'),
('agenda.create_for_others', 'Criar agendamentos para outros', 'agenda', 'create_for_others'),
('agenda.update', 'Editar agendamentos', 'agenda', 'update'),
('agenda.update_own', 'Editar próprios agendamentos', 'agenda', 'update_own'),
('agenda.delete', 'Cancelar agendamentos', 'agenda', 'delete'),
('agenda.configure', 'Configurar horários e recursos', 'agenda', 'configure'),
('agenda.block_times', 'Bloquear horários', 'agenda', 'block_times'),

-- Prontuários
('records.view_all', 'Ver todos os prontuários', 'records', 'view_all'),
('records.view_own_patients', 'Ver prontuários dos próprios pacientes', 'records', 'view_own_patients'),
('records.create', 'Criar prontuários', 'records', 'create'),
('records.update', 'Editar prontuários', 'records', 'update'),
('records.delete', 'Excluir prontuários', 'records', 'delete'),
('records.sign', 'Assinar prontuários digitalmente', 'records', 'sign'),
('records.export', 'Exportar prontuários', 'records', 'export'),
('records.attach_files', 'Anexar documentos', 'records', 'attach_files'),

-- Financeiro
('financial.view_all', 'Ver todos os dados financeiros', 'financial', 'view_all'),
('financial.view_summary', 'Ver resumo financeiro', 'financial', 'view_summary'),
('financial.view_own_commissions', 'Ver próprias comissões', 'financial', 'view_own_commissions'),
('financial.create_revenue', 'Lançar receitas', 'financial', 'create_revenue'),
('financial.create_expense', 'Lançar despesas', 'financial', 'create_expense'),
('financial.approve_payments', 'Aprovar pagamentos', 'financial', 'approve_payments'),
('financial.configure_gateways', 'Configurar gateways de pagamento', 'financial', 'configure_gateways'),
('financial.manage_cash_flow', 'Gerenciar fluxo de caixa', 'financial', 'manage_cash_flow'),
('financial.export_reports', 'Exportar relatórios financeiros', 'financial', 'export_reports'),

-- Usuários
('users.view_all', 'Ver todos os usuários', 'users', 'view_all'),
('users.create', 'Criar usuários', 'users', 'create'),
('users.create_basic', 'Criar usuários básicos (USER/PROFESSIONAL)', 'users', 'create_basic'),
('users.update', 'Editar usuários', 'users', 'update'),
('users.update_basic', 'Editar usuários básicos', 'users', 'update_basic'),
('users.delete', 'Excluir usuários', 'users', 'delete'),
('users.change_roles', 'Alterar roles de usuários', 'users', 'change_roles'),
('users.reset_password', 'Redefinir senhas', 'users', 'reset_password'),
('users.view_logs', 'Ver logs de atividade', 'users', 'view_logs'),
('users.block', 'Bloquear/desbloquear usuários', 'users', 'block'),

-- Configurações
('config.view', 'Ver configurações', 'config', 'view'),
('config.update', 'Atualizar configurações', 'config', 'update'),
('config.manage_integrations', 'Gerenciar integrações', 'config', 'manage_integrations'),
('config.manage_billing', 'Gerenciar planos e billing', 'config', 'manage_billing'),
('config.backup', 'Fazer backup e exportação', 'config', 'backup'),
('config.security', 'Configurações de segurança', 'config', 'security'),
('config.white_label', 'Configurar white label', 'config', 'white_label'),

-- BI & Analytics
('bi.view_all', 'Ver todos os dashboards', 'bi', 'view_all'),
('bi.view_operational', 'Ver métricas operacionais', 'bi', 'view_operational'),
('bi.view_personal', 'Ver métricas pessoais', 'bi', 'view_personal'),
('bi.export', 'Exportar relatórios', 'bi', 'export'),
('bi.use_ai', 'Usar IA para análises', 'bi', 'use_ai'),

-- Marketing
('marketing.view', 'Ver campanhas', 'marketing', 'view'),
('marketing.create', 'Criar campanhas', 'marketing', 'create'),
('marketing.update', 'Editar campanhas', 'marketing', 'update'),
('marketing.delete', 'Excluir campanhas', 'marketing', 'delete'),

-- Estoque
('inventory.view', 'Ver estoque', 'inventory', 'view'),
('inventory.create', 'Adicionar produtos', 'inventory', 'create'),
('inventory.update', 'Editar produtos', 'inventory', 'update'),
('inventory.delete', 'Excluir produtos', 'inventory', 'delete'),
('inventory.manage', 'Gerenciar estoque completo', 'inventory', 'manage'),

-- Chat/WhatsApp
('chat.view_all', 'Ver todos os chats', 'chat', 'view_all'),
('chat.view_assigned', 'Ver chats atribuídos', 'chat', 'view_assigned'),
('chat.view_own_patients', 'Ver chats dos próprios pacientes', 'chat', 'view_own_patients'),
('chat.send', 'Enviar mensagens', 'chat', 'send'),
('chat.configure', 'Configurar integrações', 'chat', 'configure'),

-- Super Admin (cross-tenant)
('superadmin.access_all_tenants', 'Acessar todos os tenants', 'superadmin', 'access_all_tenants'),
('superadmin.manage_tenants', 'Gerenciar tenants', 'superadmin', 'manage_tenants'),
('superadmin.view_logs', 'Ver logs globais', 'superadmin', 'view_logs'),
('superadmin.manage_infrastructure', 'Gerenciar infraestrutura', 'superadmin', 'manage_infrastructure')

ON CONFLICT (name) DO NOTHING;

-- 7. Mapear permissões para roles
-- SUPERADMIN / super_admin (acesso total)
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'superadmin', id FROM permissions
ON CONFLICT DO NOTHING;

-- OWNER (controle total do tenant)
INSERT INTO role_permissions (role, permission_id)
SELECT 'owner', id FROM permissions
WHERE module != 'superadmin'
ON CONFLICT DO NOTHING;

-- ADMIN (gestão operacional)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
WHERE name IN (
    -- Dashboard
    'dashboard.view_operational',
    -- Leads
    'leads.create', 'leads.read_all', 'leads.update_all', 'leads.assign',
    'leads.export', 'leads.import', 'leads.configure',
    -- Agenda
    'agenda.view_all', 'agenda.create', 'agenda.create_for_others',
    'agenda.update', 'agenda.delete', 'agenda.configure',
    -- Prontuários
    'records.view_all', 'records.create', 'records.update', 'records.sign', 'records.attach_files',
    -- Financeiro (sem aprovação e gateway)
    'financial.view_summary', 'financial.create_revenue', 'financial.create_expense',
    'financial.manage_cash_flow',
    -- Usuários
    'users.view_all', 'users.create_basic', 'users.update_basic',
    -- Config
    'config.view',
    -- BI
    'bi.view_operational', 'bi.export',
    -- Marketing
    'marketing.view', 'marketing.create', 'marketing.update', 'marketing.delete',
    -- Estoque
    'inventory.manage',
    -- Chat
    'chat.view_all', 'chat.send'
)
ON CONFLICT DO NOTHING;

-- USER / receptionist (operação dia a dia)
INSERT INTO role_permissions (role, permission_id)
SELECT 'user', id FROM permissions
WHERE name IN (
    -- Dashboard
    'dashboard.view_personal',
    -- Leads
    'leads.create', 'leads.read_assigned', 'leads.update_own',
    -- Agenda
    'agenda.view_all', 'agenda.create', 'agenda.update_own',
    -- Prontuários
    'records.view_all',
    -- Financeiro
    'financial.create_revenue',
    -- Chat
    'chat.view_assigned', 'chat.send'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'receptionist', id FROM permissions
WHERE name IN (
    -- Dashboard
    'dashboard.view_personal',
    -- Leads
    'leads.create', 'leads.read_assigned', 'leads.update_own',
    -- Agenda
    'agenda.view_all', 'agenda.create', 'agenda.update_own',
    -- Prontuários
    'records.view_all',
    -- Financeiro
    'financial.create_revenue',
    -- Chat
    'chat.view_assigned', 'chat.send'
)
ON CONFLICT DO NOTHING;

-- PROFESSIONAL / doctor (foco clínico)
INSERT INTO role_permissions (role, permission_id)
SELECT 'professional', id FROM permissions
WHERE name IN (
    -- Dashboard
    'dashboard.view_personal',
    -- Agenda
    'agenda.view_own', 'agenda.block_times',
    -- Prontuários (acesso total)
    'records.view_own_patients', 'records.create', 'records.update',
    'records.sign', 'records.export', 'records.attach_files',
    -- Financeiro
    'financial.view_own_commissions',
    -- BI
    'bi.view_personal', 'bi.use_ai',
    -- Chat
    'chat.view_own_patients', 'chat.send'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'doctor', id FROM permissions
WHERE name IN (
    -- Dashboard
    'dashboard.view_personal',
    -- Agenda
    'agenda.view_own', 'agenda.block_times',
    -- Prontuários (acesso total)
    'records.view_own_patients', 'records.create', 'records.update',
    'records.sign', 'records.export', 'records.attach_files',
    -- Financeiro
    'financial.view_own_commissions',
    -- BI
    'bi.view_personal', 'bi.use_ai',
    -- Chat
    'chat.view_own_patients', 'chat.send'
)
ON CONFLICT DO NOTHING;

-- 8. Criar função para verificar permissão
CREATE OR REPLACE FUNCTION has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    user_role users_role_enum;
    has_perm BOOLEAN;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO user_role FROM users WHERE id = p_user_id;

    -- Super admin sempre tem permissão
    IF user_role IN ('super_admin', 'superadmin') THEN
        RETURN TRUE;
    END IF;

    -- Verificar se o role tem a permissão
    SELECT EXISTS(
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = user_role
        AND p.name = p_permission_name
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_permission IS 'Verifica se um usuário tem uma permissão específica baseado em seu role';

-- ================================================
-- Fim da Migration
-- ================================================
