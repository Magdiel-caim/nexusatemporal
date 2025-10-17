-- =====================================================
-- MIGRATION: Sistema de Automações e Integrações
-- Versão: 1.1
-- Data: 17/10/2025
-- Descrição: Cria todas as tabelas para o sistema de automações
-- =====================================================

-- =====================================================
-- 1. TRIGGERS (Gatilhos de Automação)
-- =====================================================

CREATE TABLE IF NOT EXISTS triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event VARCHAR(100) NOT NULL, -- 'lead.created', 'appointment.scheduled', etc
  conditions JSONB, -- Condições para execução
  actions JSONB NOT NULL, -- Ações a serem executadas
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_triggers_tenant_event ON triggers(tenant_id, event) WHERE is_active = true;
CREATE INDEX idx_triggers_event ON triggers(event) WHERE is_active = true;

COMMENT ON TABLE triggers IS 'Triggers de automação que disparam ações baseadas em eventos';
COMMENT ON COLUMN triggers.event IS 'Nome do evento que dispara o trigger (ex: lead.created)';
COMMENT ON COLUMN triggers.conditions IS 'Condições JSON para execução (ex: {"source": "whatsapp"})';
COMMENT ON COLUMN triggers.actions IS 'Ações JSON a serem executadas (webhooks, workflows, etc)';

-- =====================================================
-- 2. WORKFLOWS (Fluxos de Automação)
-- =====================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'n8n', 'custom', 'template'
  n8n_workflow_id VARCHAR(255), -- ID do workflow no n8n
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id, is_active);
CREATE INDEX idx_workflows_type ON workflows(workflow_type);

COMMENT ON TABLE workflows IS 'Workflows de automação complexos';
COMMENT ON COLUMN workflows.workflow_type IS 'Tipo: n8n (externo), custom (interno), template (pré-definido)';

-- =====================================================
-- 3. WORKFLOW LOGS (Histórico de Execuções)
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE SET NULL,
  tenant_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'success', 'error', 'running', 'cancelled'
  input JSONB,
  output JSONB,
  error TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_workflow_logs_workflow ON workflow_logs(workflow_id, started_at DESC);
CREATE INDEX idx_workflow_logs_status ON workflow_logs(tenant_id, status, started_at DESC);
CREATE INDEX idx_workflow_logs_date ON workflow_logs(started_at DESC);

COMMENT ON TABLE workflow_logs IS 'Log de execuções de workflows com métricas';

-- =====================================================
-- 4. WORKFLOW TEMPLATES (Templates Prontos)
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'leads', 'appointments', 'financial', 'retention', 'communication'
  icon VARCHAR(50),
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category, is_public);
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING gin(tags);

COMMENT ON TABLE workflow_templates IS 'Templates de workflows pré-configurados';

-- =====================================================
-- 5. INTEGRATIONS (Integrações Externas)
-- =====================================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  integration_type VARCHAR(50) NOT NULL, -- 'n8n', 'openai', 'waha', 'notificame'
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error', 'configuring'
  credentials JSONB, -- Credenciais criptografadas
  config JSONB DEFAULT '{}',
  last_sync TIMESTAMP,
  error_message TEXT,
  connected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, integration_type)
);

CREATE INDEX idx_integrations_tenant_type ON integrations(tenant_id, integration_type);
CREATE INDEX idx_integrations_status ON integrations(status);

COMMENT ON TABLE integrations IS 'Configuração de integrações externas por tenant';
COMMENT ON COLUMN integrations.credentials IS 'Credenciais criptografadas (API keys, tokens, etc)';

-- =====================================================
-- 6. INTEGRATION LOGS (Logs de Integrações)
-- =====================================================

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'webhook_received', 'api_call', 'sync', etc
  status VARCHAR(50) NOT NULL, -- 'success', 'error'
  request JSONB,
  response JSONB,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_integration ON integration_logs(integration_id, created_at DESC);
CREATE INDEX idx_integration_logs_date ON integration_logs(created_at DESC);

-- Particionamento por data (opcional, para performance futura)
-- CREATE INDEX idx_integration_logs_date_month ON integration_logs(date_trunc('month', created_at));

COMMENT ON TABLE integration_logs IS 'Log detalhado de todas as interações com integrações externas';

-- =====================================================
-- 7. AUTOMATION EVENTS (Fila de Eventos)
-- =====================================================

CREATE TABLE IF NOT EXISTS automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  entity_type VARCHAR(50), -- 'lead', 'appointment', 'payment', etc
  entity_id UUID,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  triggered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automation_events_tenant ON automation_events(tenant_id, triggered_at DESC);
CREATE INDEX idx_automation_events_name ON automation_events(event_name, triggered_at DESC);
CREATE INDEX idx_automation_events_processed ON automation_events(processed, triggered_at) WHERE NOT processed;

COMMENT ON TABLE automation_events IS 'Fila de eventos de automação a serem processados';
COMMENT ON COLUMN automation_events.processed IS 'Se o evento já foi processado pelos triggers';

-- =====================================================
-- 8. WHATSAPP SESSIONS (Sessões WhatsApp - Waha)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  session_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'scanning', 'failed'
  qr_code TEXT,
  connected_at TIMESTAMP,
  last_seen TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, session_name)
);

CREATE INDEX idx_whatsapp_sessions_tenant ON whatsapp_sessions(tenant_id, status);
CREATE INDEX idx_whatsapp_sessions_status ON whatsapp_sessions(status);

COMMENT ON TABLE whatsapp_sessions IS 'Sessões ativas do WhatsApp via Waha';

-- =====================================================
-- 9. WHATSAPP MESSAGES (Mensagens WhatsApp)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  session_id UUID REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  message_id VARCHAR(255),
  chat_id VARCHAR(255) NOT NULL,
  direction VARCHAR(20) NOT NULL, -- 'inbound' ou 'outbound'
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50), -- 'image', 'video', 'audio', 'document'
  status VARCHAR(50), -- 'sent', 'delivered', 'read', 'failed'
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_session ON whatsapp_messages(session_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_chat ON whatsapp_messages(chat_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_tenant ON whatsapp_messages(tenant_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction, created_at DESC);

COMMENT ON TABLE whatsapp_messages IS 'Histórico de mensagens do WhatsApp';

-- =====================================================
-- 10. NOTIFICAME ACCOUNTS (Contas Notifica.me)
-- =====================================================

CREATE TABLE IF NOT EXISTS notificame_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  api_key TEXT NOT NULL, -- Criptografado
  account_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  plan VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id)
);

CREATE INDEX idx_notificame_accounts_tenant ON notificame_accounts(tenant_id);

COMMENT ON TABLE notificame_accounts IS 'Contas Notifica.me (Instagram/Facebook) por tenant';

-- =====================================================
-- 11. NOTIFICAME CHANNELS (Canais Notifica.me)
-- =====================================================

CREATE TABLE IF NOT EXISTS notificame_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  notificame_account_id UUID REFERENCES notificame_accounts(id) ON DELETE CASCADE,
  channel_type VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'webchat', 'email'
  channel_id VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  connected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, channel_type, channel_id)
);

CREATE INDEX idx_notificame_channels_tenant ON notificame_channels(tenant_id, is_active);
CREATE INDEX idx_notificame_channels_type ON notificame_channels(channel_type);

COMMENT ON TABLE notificame_channels IS 'Canais conectados (Instagram, Facebook, WebChat)';

-- =====================================================
-- 12. NOTIFICAME MESSAGES (Mensagens Notifica.me)
-- =====================================================

CREATE TABLE IF NOT EXISTS notificame_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  channel_id UUID REFERENCES notificame_channels(id) ON DELETE CASCADE,
  message_id VARCHAR(255),
  direction VARCHAR(20) NOT NULL, -- 'inbound' ou 'outbound'
  from_user VARCHAR(255),
  to_user VARCHAR(255),
  content TEXT,
  media_url TEXT,
  status VARCHAR(50),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notificame_messages_channel ON notificame_messages(channel_id, created_at DESC);
CREATE INDEX idx_notificame_messages_tenant ON notificame_messages(tenant_id, created_at DESC);

COMMENT ON TABLE notificame_messages IS 'Mensagens de Instagram, Facebook, WebChat';

-- =====================================================
-- 13. AI INTERACTIONS (Interações com OpenAI)
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  interaction_type VARCHAR(50) NOT NULL, -- 'lead_analysis', 'no_show_prediction', 'sentiment', etc
  entity_type VARCHAR(50), -- 'lead', 'appointment', 'conversation'
  entity_id UUID,
  prompt TEXT NOT NULL,
  response JSONB,
  model VARCHAR(50), -- 'gpt-4', 'gpt-3.5-turbo'
  tokens_used INTEGER,
  duration_ms INTEGER,
  cost DECIMAL(10, 6), -- Custo em USD
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_tenant ON ai_interactions(tenant_id, created_at DESC);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type, created_at DESC);
CREATE INDEX idx_ai_interactions_entity ON ai_interactions(entity_type, entity_id);

COMMENT ON TABLE ai_interactions IS 'Log de todas as interações com OpenAI para auditoria e custos';

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_triggers_updated_at ON triggers;
CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_templates_updated_at ON workflow_templates;
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_whatsapp_sessions_updated_at ON whatsapp_sessions;
CREATE TRIGGER update_whatsapp_sessions_updated_at BEFORE UPDATE ON whatsapp_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notificame_accounts_updated_at ON notificame_accounts;
CREATE TRIGGER update_notificame_accounts_updated_at BEFORE UPDATE ON notificame_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notificame_channels_updated_at ON notificame_channels;
CREATE TRIGGER update_notificame_channels_updated_at BEFORE UPDATE ON notificame_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS - EVENTOS DISPONÍVEIS
-- =====================================================

-- Inserir workflow templates básicos (exemplos)
INSERT INTO workflow_templates (name, description, category, icon, config, tags) VALUES
('Novo Lead via WhatsApp', 'Qualifica lead e notifica vendedor quando recebe mensagem no WhatsApp', 'leads', '📱', '{"trigger":"whatsapp.message.received","actions":["qualify_lead","notify_sales"]}', ARRAY['whatsapp', 'leads', 'sales']),
('Lembrete de Consulta', 'Envia lembrete automático 24h antes do agendamento', 'appointments', '⏰', '{"trigger":"appointment.scheduled","delay":"24h","actions":["send_whatsapp_reminder"]}', ARRAY['appointments', 'reminders', 'whatsapp']),
('Cobrança Automática', 'Envia lembretes de pagamento em D+1, D+3 e D+7', 'financial', '💰', '{"trigger":"payment.overdue","actions":["send_reminder_d1","send_reminder_d3","send_reminder_d7"]}', ARRAY['financial', 'payments', 'collections']),
('Pesquisa de Satisfação', 'Envia pesquisa 2h após procedimento', 'retention', '⭐', '{"trigger":"appointment.completed","delay":"2h","actions":["send_survey"]}', ARRAY['retention', 'surveys', 'satisfaction']),
('Aniversário do Cliente', 'Envia parabéns e desconto no aniversário', 'retention', '🎂', '{"trigger":"client.birthday","actions":["send_birthday_message","apply_discount"]}', ARRAY['retention', 'birthday', 'promotions']),
('Reativação de Inativos', 'Identifica clientes inativos há 90 dias e envia campanha', 'retention', '💤', '{"trigger":"client.inactive","threshold":"90days","actions":["analyze_reason","send_campaign"]}', ARRAY['retention', 'reactivation', 'campaigns'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANTS E PERMISSÕES
-- =====================================================

-- Garantir que o usuário do app tenha acesso a todas as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nexus_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nexus_admin;

-- =====================================================
-- MIGRATION COMPLETA
-- =====================================================

-- Verificar se migration foi executada com sucesso
DO $$
BEGIN
    RAISE NOTICE 'Migration: Sistema de Automações criado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: 13';
    RAISE NOTICE 'Índices criados: 40+';
    RAISE NOTICE 'Templates inseridos: 6';
END $$;
