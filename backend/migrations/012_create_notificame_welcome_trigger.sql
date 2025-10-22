-- Migration 012: Criar Trigger de Boas-vindas Notifica.me
-- Data: 2025-10-21
-- Descrição: Cria trigger automático para enviar mensagem de boas-vindas via Instagram/Messenger quando novo lead é criado

-- ========================================
-- TRIGGER: Boas-vindas Instagram/Messenger
-- ========================================

-- Inserir trigger de boas-vindas
-- NOTA: Este trigger será criado para o tenant principal
-- Para outros tenants, ajuste o tenant_id conforme necessário

INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active,
  created_at,
  updated_at
) VALUES (
  'c0000000-0000-0000-0000-000000000000', -- Tenant ID principal
  'Boas-vindas Instagram/Messenger',
  'Envia mensagem automática de boas-vindas quando um novo lead é criado via Instagram ou Messenger',
  'lead.created',
  '[
    {
      "field": "lead.source",
      "operator": "in",
      "value": ["instagram", "messenger", "facebook"]
    },
    {
      "field": "lead.phone",
      "operator": "not_empty",
      "value": null
    }
  ]'::jsonb,
  '[
    {
      "type": "notificame.send_message",
      "config": {
        "phone": "{{lead.phone}}",
        "message": "Olá {{lead.name}}! 👋\n\nSeja bem-vindo(a) à Nexus Atemporal! 🌟\n\nRecebemos seu contato e em breve nossa equipe entrará em contato para oferecer o melhor atendimento.\n\nEnquanto isso, você pode nos enviar suas dúvidas que teremos prazer em ajudar! 😊\n\n✨ Estamos aqui para você!",
        "delay": 2
      }
    },
    {
      "type": "lead.update",
      "config": {
        "status": "contacted",
        "lastContactDate": "{{now}}",
        "notes": "Mensagem de boas-vindas enviada automaticamente via Instagram/Messenger"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Comentário informativo
COMMENT ON TABLE triggers IS 'Armazena triggers automáticos para o sistema de automação';

-- Verificar se o trigger foi criado
SELECT
  id,
  name,
  event,
  is_active,
  created_at
FROM triggers
WHERE name = 'Boas-vindas Instagram/Messenger'
AND tenant_id = 'c0000000-0000-0000-0000-000000000000';

-- ========================================
-- Resultado Esperado:
-- ========================================
-- Trigger criado com sucesso!
-- Quando um lead for criado via Instagram/Messenger com telefone válido:
--   1. Sistema envia mensagem de boas-vindas automaticamente
--   2. Atualiza status do lead para "contacted"
--   3. Registra data do último contato
--   4. Adiciona nota sobre a mensagem enviada
