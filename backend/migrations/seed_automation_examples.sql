-- =====================================================
-- SEED: Exemplos de Automações - Nexus CRM
-- =====================================================
-- Arquivo: seed_automation_examples.sql
-- Descrição: Popula banco com exemplos práticos de automações
-- Uso: psql -h HOST -U USER -d DATABASE -f seed_automation_examples.sql
-- =====================================================

BEGIN;

-- =====================================================
-- 1. INTEGRAÇÕES (Desabilitadas por padrão - configurar credentials)
-- =====================================================

INSERT INTO integrations (
  "tenantId", name, type, config, credentials, "isActive",
  last_test_status, last_test_message, "createdAt", "updatedAt"
) VALUES
  -- WhatsApp via WAHA
  (
    'default',
    'WhatsApp Principal',
    'waha',
    '{
      "baseUrl": "https://waha.nexusatemporal.com.br",
      "session": "default",
      "webhookUrl": "https://api.nexusatemporal.com.br/api/webhooks/waha"
    }'::jsonb,
    '{
      "apiKey": "CONFIGURE_SUA_API_KEY_AQUI"
    }'::jsonb,
    false,
    'pending',
    'Configurar API Key para ativar',
    NOW(),
    NOW()
  ),

  -- OpenAI para IA
  (
    'default',
    'OpenAI GPT-4',
    'openai',
    '{
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 500
    }'::jsonb,
    '{
      "apiKey": "CONFIGURE_SUA_API_KEY_AQUI"
    }'::jsonb,
    false,
    'pending',
    'Configurar API Key para ativar',
    NOW(),
    NOW()
  ),

  -- n8n para workflows complexos
  (
    'default',
    'n8n Workflows',
    'n8n',
    '{
      "baseUrl": "https://n8n.nexusatemporal.com.br",
      "webhookUrl": "https://api.nexusatemporal.com.br/api/webhooks/n8n"
    }'::jsonb,
    '{
      "apiKey": "CONFIGURE_SUA_API_KEY_AQUI"
    }'::jsonb,
    false,
    'pending',
    'Configurar API Key para ativar',
    NOW(),
    NOW()
  );

-- =====================================================
-- 2. TRIGGERS DE EXEMPLO
-- =====================================================

-- Trigger 1: Boas-vindas Novo Lead
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '📩 Boas-vindas - Novo Lead',
  'Envia mensagem de boas-vindas automaticamente quando um novo lead é criado no sistema',
  'default',
  'lead.created',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Log da criação do lead",
      "config": {
        "message": "Novo lead criado: {{lead.name}}"
      }
    }
  ]'::jsonb,
  false,
  10,
  0,
  NOW(),
  NOW()
);

-- Trigger 2: Análise IA de Lead
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '🤖 Análise IA - Classificação de Lead',
  'Analisa automaticamente qualidade, sentimento e urgência do lead usando IA',
  'default',
  'lead.created',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Preparar análise IA",
      "config": {
        "message": "Iniciando análise IA para lead: {{lead.id}}"
      }
    }
  ]'::jsonb,
  false,
  20,
  0,
  NOW(),
  NOW()
);

-- Trigger 3: Lead mudou para Quente
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '🔥 Notificação - Lead Quente',
  'Notifica vendedor quando lead muda para estágio "Quente" ou "Alta Prioridade"',
  'default',
  'lead.stage_changed',
  '[
    {
      "field": "data.newStage",
      "operator": "contains",
      "value": "quente"
    }
  ]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Lead quente detectado",
      "config": {
        "message": "🔥 Lead QUENTE: {{lead.name}} - Priorizar contato!"
      }
    }
  ]'::jsonb,
  false,
  50,
  0,
  NOW(),
  NOW()
);

-- Trigger 4: Lembrete 24h antes do agendamento
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '⏰ Lembrete - 24h antes do Agendamento',
  'Envia lembrete automático no WhatsApp 24h antes do agendamento confirmado',
  'default',
  'appointment.confirmed',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Agendar lembrete",
      "config": {
        "message": "Lembrete agendado para: {{appointment.scheduledDate}}"
      }
    }
  ]'::jsonb,
  false,
  30,
  0,
  NOW(),
  NOW()
);

-- Trigger 5: Agendamento Finalizado - Pesquisa Satisfação
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '⭐ Pesquisa de Satisfação',
  'Envia pesquisa de satisfação 2h após finalização do atendimento',
  'default',
  'appointment.completed',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Agendar pesquisa",
      "config": {
        "message": "Pesquisa agendada para cliente: {{lead.name}}"
      }
    }
  ]'::jsonb,
  false,
  20,
  0,
  NOW(),
  NOW()
);

-- Trigger 6: Pagamento Recebido
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '💰 Notificação - Pagamento Confirmado',
  'Notifica equipe quando pagamento é confirmado e libera agendamento',
  'default',
  'payment.received',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Pagamento confirmado",
      "config": {
        "message": "💰 Pagamento confirmado: R$ {{payment.value}}"
      }
    }
  ]'::jsonb,
  false,
  40,
  0,
  NOW(),
  NOW()
);

-- Trigger 7: Pagamento Atrasado
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '⚠️ Cobrança - Pagamento em Atraso',
  'Envia mensagem de cobrança educada quando pagamento está atrasado',
  'default',
  'payment.overdue',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Pagamento atrasado",
      "config": {
        "message": "⚠️ Cobrança enviada - Vencimento: {{payment.dueDate}}"
      }
    }
  ]'::jsonb,
  false,
  60,
  0,
  NOW(),
  NOW()
);

-- Trigger 8: Lead Atribuído a Vendedor
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '👤 Notificação - Lead Atribuído',
  'Notifica vendedor quando um lead é atribuído a ele',
  'default',
  'lead.assigned',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Lead atribuído",
      "config": {
        "message": "Lead {{lead.name}} atribuído a {{user.name}}"
      }
    }
  ]'::jsonb,
  false,
  25,
  0,
  NOW(),
  NOW()
);

-- Trigger 9: Agendamento Cancelado
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '❌ Notificação - Agendamento Cancelado',
  'Notifica equipe quando agendamento é cancelado e tenta reagendar',
  'default',
  'appointment.cancelled',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Agendamento cancelado",
      "config": {
        "message": "Agendamento cancelado: {{appointment.id}} - Motivo: {{cancelReason}}"
      }
    }
  ]'::jsonb,
  false,
  35,
  0,
  NOW(),
  NOW()
);

-- Trigger 10: Lead Atualizado (Mudança Importante)
INSERT INTO triggers (
  name, description, "tenantId", event, conditions, actions,
  active, priority, "executionCount", "createdAt", "updatedAt"
) VALUES (
  '📝 Log - Lead Atualizado',
  'Registra atualizações importantes no lead para auditoria',
  'default',
  'lead.updated',
  '[]'::jsonb,
  '[
    {
      "type": "log",
      "description": "Lead atualizado",
      "config": {
        "message": "Lead {{lead.id}} atualizado por {{user.name}}"
      }
    }
  ]'::jsonb,
  false,
  5,
  0,
  NOW(),
  NOW()
);

-- =====================================================
-- 3. WORKFLOW TEMPLATES
-- =====================================================

INSERT INTO workflow_templates (
  name, description, category, tags, config, "isPublic",
  "usageCount", "createdAt", "updatedAt"
) VALUES
  -- Template 1: Nutrição de Leads
  (
    'Funil de Nutrição - 3 dias',
    'Sequência automática de 3 mensagens em 3 dias para nutrir leads novos',
    'marketing',
    ARRAY['nutrição', 'leads', 'follow-up', 'whatsapp'],
    '{
      "steps": [
        {
          "day": 0,
          "action": "send_welcome",
          "message": "Olá! Seja bem-vindo!"
        },
        {
          "day": 1,
          "action": "send_info",
          "message": "Veja nossos procedimentos"
        },
        {
          "day": 3,
          "action": "send_offer",
          "message": "Agenda disponível!"
        }
      ]
    }'::jsonb,
    true,
    0,
    NOW(),
    NOW()
  ),

  -- Template 2: Pesquisa Satisfação
  (
    'Pesquisa de Satisfação Pós-Atendimento',
    'Envia pesquisa automática após atendimento finalizado',
    'customer_success',
    ARRAY['satisfação', 'nps', 'feedback', 'qualidade'],
    '{
      "trigger": "appointment.completed",
      "delay": "2h",
      "questions": [
        "Como foi sua experiência? (1-5)",
        "Recomendaria nossos serviços?"
      ]
    }'::jsonb,
    true,
    0,
    NOW(),
    NOW()
  ),

  -- Template 3: Recuperação Leads Inativos
  (
    'Recuperação de Leads Inativos',
    'Reengaja leads que não interagiram nos últimos 7 dias',
    'sales',
    ARRAY['reengajamento', 'leads', 'vendas', 'recuperação'],
    '{
      "schedule": "daily",
      "condition": "last_contact > 7 days",
      "action": "send_personalized_message"
    }'::jsonb,
    true,
    0,
    NOW(),
    NOW()
  );

-- =====================================================
-- 4. EVENTOS DE EXEMPLO (Para teste)
-- =====================================================

-- Alguns eventos históricos para dashboard ter dados
INSERT INTO automation_events (
  "tenantId", event_type, entity_type, entity_id, payload, processed,
  triggered_at, processed_at, "createdAt", "updatedAt"
) VALUES
  ('default', 'lead.created', 'lead', gen_random_uuid(), '{"test": true}'::jsonb, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('default', 'lead.created', 'lead', gen_random_uuid(), '{"test": true}'::jsonb, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW(), NOW()),
  ('default', 'appointment.scheduled', 'appointment', gen_random_uuid(), '{"test": true}'::jsonb, true, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW(), NOW()),
  ('default', 'payment.received', 'payment', gen_random_uuid(), '{"test": true}'::jsonb, true, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', NOW(), NOW()),
  ('default', 'lead.stage_changed', 'lead', gen_random_uuid(), '{"test": true}'::jsonb, false, NOW() - INTERVAL '10 minutes', NULL, NOW(), NOW());

COMMIT;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Contar recursos criados
SELECT 'Integrações criadas' as recurso, COUNT(*) as total FROM integrations WHERE "tenantId" = 'default'
UNION ALL
SELECT 'Triggers criados', COUNT(*) FROM triggers WHERE "tenantId" = 'default'
UNION ALL
SELECT 'Templates criados', COUNT(*) FROM workflow_templates WHERE "isPublic" = true
UNION ALL
SELECT 'Eventos de exemplo', COUNT(*) FROM automation_events WHERE "tenantId" = 'default';

-- =====================================================
-- INSTRUÇÕES PÓS-SEED
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED COMPLETO! ✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Recursos criados:';
  RAISE NOTICE '  - 3 Integrações (DESABILITADAS)';
  RAISE NOTICE '  - 10 Triggers (DESABILITADOS)';
  RAISE NOTICE '  - 3 Templates de Workflow';
  RAISE NOTICE '  - 5 Eventos de exemplo';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Configurar API Keys nas integrações';
  RAISE NOTICE '2. Testar integrações via API:';
  RAISE NOTICE '   POST /api/automation/integrations/:id/test';
  RAISE NOTICE '3. Ativar triggers desejados';
  RAISE NOTICE '4. Monitorar eventos:';
  RAISE NOTICE '   GET /api/automation/events/v2';
  RAISE NOTICE '';
  RAISE NOTICE 'Documentação: EXEMPLOS_AUTOMACOES.md';
  RAISE NOTICE '========================================';
END $$;
