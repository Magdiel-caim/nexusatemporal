-- ============================================
-- MIGRATION: Tabelas Integração Notifica.me OAuth
-- Data: 2025-01-12
-- Versão: 1.0
-- Descrição: Adiciona suporte OAuth para Instagram, Facebook e WhatsApp
-- ============================================

-- ⚠️ IMPORTANTE: As tabelas notificame_accounts, notificame_channels e notificame_messages
--    já existem e não serão alteradas para preservar dados existentes.

BEGIN;

-- --------------------------------------------
-- 1. TABELA: notificame_social_connections
-- Armazena conexões OAuth (Instagram, Facebook, WhatsApp)
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS notificame_social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relacionamento com sistema existente
    cliente_id UUID NOT NULL,
    empresa_id UUID NOT NULL,

    -- Tipo de rede social
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'whatsapp')),

    -- Dados da plataforma
    platform_user_id VARCHAR(255) NOT NULL,
    platform_username VARCHAR(255),
    platform_page_id VARCHAR(255),

    -- Tokens OAuth (SEMPRE CRIPTOGRAFADOS)
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,

    -- Dados do Notifica.me
    notificame_channel_id VARCHAR(255) UNIQUE,
    notificame_channel_status VARCHAR(50) DEFAULT 'active',

    -- Status da conexão
    connection_status VARCHAR(50) DEFAULT 'active' CHECK (
        connection_status IN ('active', 'expired', 'disconnected', 'error')
    ),
    last_sync_at TIMESTAMP WITH TIME ZONE,

    -- Permissões concedidas pelo usuário
    granted_permissions JSONB DEFAULT '[]',

    -- Metadados adicionais
    metadata JSONB DEFAULT '{}',
    error_log TEXT,

    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    -- Índice único: um cliente não pode ter duas conexões ativas da mesma conta
    UNIQUE (cliente_id, platform, platform_user_id)
);

-- Comentários da tabela
COMMENT ON TABLE notificame_social_connections IS
    'Armazena conexões de redes sociais via Notifica.me OAuth (Instagram, Facebook, WhatsApp)';

COMMENT ON COLUMN notificame_social_connections.access_token_encrypted IS
    'Token de acesso criptografado com AES-256 - NUNCA armazenar em plain text';

COMMENT ON COLUMN notificame_social_connections.platform_user_id IS
    'ID do usuário na plataforma (Instagram User ID, Facebook Page ID, etc)';

COMMENT ON COLUMN notificame_social_connections.notificame_channel_id IS
    'ID do canal no sistema Notifica.me - usado para enviar mensagens';

COMMENT ON COLUMN notificame_social_connections.connection_status IS
    'Status da conexão: active (ativa), expired (token expirado), disconnected (desconectada), error (erro)';

-- Índices para performance
CREATE INDEX idx_notificame_social_cliente ON notificame_social_connections(cliente_id);
CREATE INDEX idx_notificame_social_empresa ON notificame_social_connections(empresa_id);
CREATE INDEX idx_notificame_social_platform ON notificame_social_connections(platform);
CREATE INDEX idx_notificame_social_status ON notificame_social_connections(connection_status);
CREATE INDEX idx_notificame_social_channel ON notificame_social_connections(notificame_channel_id);
CREATE INDEX idx_notificame_social_expires ON notificame_social_connections(token_expires_at)
    WHERE token_expires_at IS NOT NULL;

-- Índice composto para consultas frequentes
CREATE INDEX idx_notificame_social_cliente_platform_status
    ON notificame_social_connections(cliente_id, platform, connection_status);

-- --------------------------------------------
-- 2. TABELA: notificame_webhook_logs
-- Log de webhooks recebidos para auditoria
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS notificame_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relacionamento
    connection_id UUID REFERENCES notificame_social_connections(id) ON DELETE SET NULL,

    -- Tipo de evento
    event_type VARCHAR(100) NOT NULL,  -- 'message', 'status', 'error', etc
    platform VARCHAR(20) NOT NULL,

    -- Dados do webhook
    payload JSONB NOT NULL,

    -- Processamento
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentários
COMMENT ON TABLE notificame_webhook_logs IS
    'Log de webhooks recebidos do Notifica.me para auditoria e reprocessamento';

COMMENT ON COLUMN notificame_webhook_logs.processed IS
    'Indica se o webhook já foi processado pela aplicação';

COMMENT ON COLUMN notificame_webhook_logs.retry_count IS
    'Número de tentativas de reprocessamento em caso de erro';

-- Índices
CREATE INDEX idx_webhook_social_connection ON notificame_webhook_logs(connection_id);
CREATE INDEX idx_webhook_social_processed ON notificame_webhook_logs(processed) WHERE processed = false;
CREATE INDEX idx_webhook_social_created ON notificame_webhook_logs(created_at);
CREATE INDEX idx_webhook_social_event_type ON notificame_webhook_logs(event_type);
CREATE INDEX idx_webhook_social_platform ON notificame_webhook_logs(platform);

-- Índice para cleanup de logs antigos
CREATE INDEX idx_webhook_social_cleanup ON notificame_webhook_logs(created_at)
    WHERE processed = true;

-- --------------------------------------------
-- 3. TRIGGER: Atualização automática de updated_at
-- --------------------------------------------

-- Função para atualizar timestamp (reutilizar se já existir)
CREATE OR REPLACE FUNCTION update_notificame_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER update_notificame_social_connections_updated_at
    BEFORE UPDATE ON notificame_social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_notificame_social_updated_at();

-- --------------------------------------------
-- 4. FUNÇÃO: Limpar webhooks antigos
-- --------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_old_notificame_webhook_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notificame_webhook_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
      AND processed = true;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_notificame_webhook_logs IS
    'Remove logs de webhook processados mais antigos que X dias (padrão: 30)';

-- --------------------------------------------
-- 5. VIEW: Estatísticas de conexões OAuth
-- --------------------------------------------

CREATE OR REPLACE VIEW notificame_social_connection_stats AS
SELECT
    platform,
    connection_status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE last_sync_at > NOW() - INTERVAL '24 hours') as synced_24h,
    COUNT(*) FILTER (WHERE token_expires_at < NOW() + INTERVAL '7 days') as expiring_soon,
    MIN(created_at) as oldest_connection,
    MAX(created_at) as newest_connection
FROM notificame_social_connections
GROUP BY platform, connection_status;

COMMENT ON VIEW notificame_social_connection_stats IS
    'Estatísticas agregadas de conexões OAuth por plataforma e status';

-- --------------------------------------------
-- 6. VIEW: Webhooks não processados
-- --------------------------------------------

CREATE OR REPLACE VIEW notificame_social_pending_webhooks AS
SELECT
    w.id,
    w.event_type,
    w.platform,
    w.created_at,
    w.retry_count,
    c.cliente_id,
    c.platform_username
FROM notificame_webhook_logs w
LEFT JOIN notificame_social_connections c ON w.connection_id = c.id
WHERE w.processed = false
  AND w.retry_count < 5
ORDER BY w.created_at ASC;

COMMENT ON VIEW notificame_social_pending_webhooks IS
    'Lista webhooks pendentes de processamento com informações da conexão';

COMMIT;

-- ============================================
-- VERIFICAÇÃO PÓS-MIGRATION
-- ============================================

-- Verificar se tabelas foram criadas
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'notificame%'
ORDER BY table_name;

-- ============================================
-- FIM DA MIGRATION
-- ============================================
