-- Migration 013: Criar Todos os Triggers Notifica.me
-- Data: 2025-10-21
-- Descrição: Cria os 7 triggers principais para automação via Instagram/Messenger

-- ========================================
-- TRIGGER 1: Boas-vindas (já criado, skip se existir)
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Boas-vindas Instagram/Messenger',
  'Mensagem de boas-vindas para novos leads',
  'lead.created',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]}]'::jsonb,
  '[{"type":"notificame.send_message","config":{"phone":"{{lead.phone}}","message":"Olá {{lead.name}}! 👋 Seja bem-vindo(a)!"}}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 2: Confirmação de Agendamento
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Confirmação de Agendamento - Instagram/Messenger',
  'Confirma agendamento quando consulta é criada',
  'appointment.created',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.phone","operator":"not_empty"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"✅ Agendamento Confirmado!\n\n🗓️ Data: {{appointment.date}}\n⏰ Horário: {{appointment.time}}\n📍 Local: {{appointment.location}}\n👨‍⚕️ Profissional: {{appointment.professional}}\n\nNos vemos em breve! 😊",
        "delay":1
      }
    }
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 3: Lembrete 24h Antes
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Lembrete 24h Antes - Instagram/Messenger',
  'Lembra o cliente 24h antes da consulta',
  'appointment.reminder_24h',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.phone","operator":"not_empty"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"⏰ Lembrete de Consulta!\n\n{{lead.name}}, sua consulta está agendada para amanhã:\n\n🗓️ Data: {{appointment.date}}\n⏰ Horário: {{appointment.time}}\n📍 Local: {{appointment.location}}\n\nPor favor, chegue com 15 minutos de antecedência.\n\nSe precisar remarcar, entre em contato conosco! 😊",
        "delay":0
      }
    }
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 4: Pós-Procedimento
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Pós-Procedimento - Orientações',
  'Envia orientações após procedimento',
  'procedure.completed',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.phone","operator":"not_empty"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"🎉 Procedimento Concluído!\n\n{{lead.name}}, obrigado por confiar em nossos serviços!\n\n📋 Orientações Importantes:\n\n• Evite exposição solar nas próximas 48h\n• Mantenha a área limpa e hidratada\n• Em caso de dúvidas, entre em contato\n\n📄 Documentos e orientações detalhadas foram enviados para seu e-mail.\n\nDesejamos uma ótima recuperação! 💙",
        "delay":30
      }
    }
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 5: Solicitação de Feedback
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Feedback Pós-Atendimento',
  'Solicita feedback 7 dias após atendimento',
  'appointment.feedback_request',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.phone","operator":"not_empty"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"⭐ Avalie Nossa Experiência!\n\nOlá {{lead.name}}! 😊\n\nGostou do atendimento? Sua opinião é muito importante para nós!\n\nPor favor, avalie sua experiência de 1 a 5 estrelas.\n\nResposta rápida:\n1️⃣ - Muito Insatisfeito\n2️⃣ - Insatisfeito  \n3️⃣ - Neutro\n4️⃣ - Satisfeito\n5️⃣ - Muito Satisfeito\n\nObrigado por nos ajudar a melhorar! 💙",
        "delay":0
      }
    }
  ]'::jsonb,
  false
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 6: Aniversário do Cliente
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Feliz Aniversário - Instagram/Messenger',
  'Parabeniza cliente no aniversário',
  'lead.birthday',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.phone","operator":"not_empty"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"🎉 FELIZ ANIVERSÁRIO! 🎂\n\n{{lead.name}}, a equipe Nexus Atemporal deseja um dia incrível!\n\n🎁 Como presente, preparamos uma oferta especial só para você!\n\n💝 20% de desconto em qualquer procedimento agendado este mês.\n\nAproveite seu dia! 🎈🎊",
        "delay":0
      }
    }
  ]'::jsonb,
  false
) ON CONFLICT DO NOTHING;

-- ========================================
-- TRIGGER 7: Follow-up Lead Sem Resposta
-- ========================================
INSERT INTO triggers (
  tenant_id,
  name,
  description,
  event,
  conditions,
  actions,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000000',
  'Follow-up Lead Sem Resposta',
  'Envia mensagem de follow-up se lead não responde em 48h',
  'lead.no_response_48h',
  '[{"field":"lead.source","operator":"in","value":["instagram","messenger"]},{"field":"lead.status","operator":"equals","value":"new"}]'::jsonb,
  '[
    {
      "type":"notificame.send_message",
      "config":{
        "phone":"{{lead.phone}}",
        "message":"Olá {{lead.name}}! 👋\n\nNotamos que você demonstrou interesse em nossos serviços.\n\nAinda está interessado(a)? Podemos ajudar com alguma dúvida?\n\nNossa equipe está à disposição para oferecer o melhor atendimento! 😊\n\n📞 Responda essa mensagem ou ligue para nós!",
        "delay":0
      }
    },
    {
      "type":"lead.update",
      "config":{
        "nextFollowUpDate":"{{now+7d}}",
        "notes":"Follow-up automático enviado após 48h sem resposta"
      }
    }
  ]'::jsonb,
  false
) ON CONFLICT DO NOTHING;

-- ========================================
-- Verificar todos os triggers criados
-- ========================================
SELECT
  id,
  name,
  event,
  is_active,
  execution_count,
  created_at
FROM triggers
WHERE tenant_id = 'c0000000-0000-0000-0000-000000000000'
AND name LIKE '%Instagram%' OR name LIKE '%Messenger%' OR name LIKE '%Pós%' OR name LIKE '%Follow%'
ORDER BY created_at DESC;

-- ========================================
-- RESUMO DOS TRIGGERS CRIADOS
-- ========================================
-- TOTAL: 7 triggers
--
-- ATIVOS (is_active = true):
--   ✅ Boas-vindas Instagram/Messenger
--   ✅ Confirmação de Agendamento
--   ✅ Lembrete 24h Antes
--   ✅ Pós-Procedimento
--
-- INATIVOS (is_active = false) - Requerem configuração adicional:
--   ⏸️ Feedback Pós-Atendimento (requer sistema de feedback)
--   ⏸️ Feliz Aniversário (requer campo de data de nascimento)
--   ⏸️ Follow-up Lead Sem Resposta (requer cron job para detectar)
--
-- Para ativar triggers inativos, execute:
-- UPDATE triggers SET is_active = true WHERE name = 'NOME_DO_TRIGGER';
