# 🤖 EXEMPLOS DE AUTOMAÇÕES - Nexus CRM

## 📋 ÍNDICE

1. [Triggers Prontos](#triggers-prontos)
2. [Workflows n8n](#workflows-n8n)
3. [Integrações WhatsApp](#integrações-whatsapp)
4. [Automações com IA](#automações-com-ia)
5. [Casos de Uso Completos](#casos-de-uso-completos)

---

## 🎯 TRIGGERS PRONTOS

### 1. Boas-vindas automáticas (Lead Criado)

**Descrição:** Envia mensagem de boas-vindas no WhatsApp quando um novo lead é criado.

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Boas-vindas - Novo Lead',
  'Envia mensagem de boas-vindas automaticamente quando lead é criado',
  'default',
  'lead.created',
  '[]'::jsonb,
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "SEU_INTEGRATION_ID_AQUI",
        "template": "Olá {{lead.name}}! 👋\n\nSeja bem-vindo(a) à Nexus!\n\nRecebemos seu contato e em breve nossa equipe entrará em contato.\n\nEnquanto isso, se tiver alguma dúvida, estamos à disposição! 😊"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### 2. Análise automática de lead com IA

**Descrição:** Analisa o lead com OpenAI para classificar qualidade, sentimento e urgência.

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Análise IA - Novo Lead',
  'Analisa lead automaticamente com IA para classificar qualidade',
  'default',
  'lead.created',
  '[]'::jsonb,
  '[
    {
      "type": "openai.analyze_lead",
      "config": {
        "integrationId": "SEU_OPENAI_INTEGRATION_ID",
        "updateLead": true,
        "fields": ["sentiment", "quality", "urgency", "tags"]
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### 3. Lembrete 24h antes do agendamento

**Descrição:** Envia lembrete no WhatsApp 24h antes do agendamento.

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Lembrete 24h - Agendamento',
  'Envia lembrete 24h antes do agendamento confirmado',
  'default',
  'appointment.confirmed',
  '[]'::jsonb,
  '[
    {
      "type": "schedule",
      "config": {
        "delay": "-24h"
      }
    },
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "SEU_INTEGRATION_ID_AQUI",
        "template": "⏰ *Lembrete de Agendamento*\n\nOlá {{lead.name}}!\n\nLembrando que você tem um agendamento amanhã:\n\n📅 Data: {{appointment.date}}\n⏱️ Horário: {{appointment.time}}\n📍 Local: {{appointment.location}}\n\nNos vemos em breve! 😊"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### 4. Notificação de pagamento recebido

**Descrição:** Notifica equipe quando pagamento é confirmado.

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Notificação - Pagamento Recebido',
  'Notifica equipe quando pagamento é confirmado',
  'default',
  'payment.received',
  '[]'::jsonb,
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "SEU_INTEGRATION_ID_AQUI",
        "to": "5511999999999",
        "template": "💰 *Pagamento Confirmado!*\n\nCliente: {{customer.name}}\nValor: R$ {{payment.value}}\nData: {{payment.confirmedDate}}\n\n✅ Agendamento liberado!"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### 5. Cobrança automática (Pagamento Atrasado)

**Descrição:** Envia mensagem de cobrança quando pagamento está atrasado.

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Cobrança - Pagamento Atrasado',
  'Envia mensagem de cobrança quando pagamento está em atraso',
  'default',
  'payment.overdue',
  '[]'::jsonb,
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "SEU_INTEGRATION_ID_AQUI",
        "template": "Olá {{customer.name}},\n\nIdentificamos que o pagamento referente ao agendamento está em atraso.\n\n💳 Valor: R$ {{payment.value}}\n📅 Vencimento: {{payment.dueDate}}\n\nPara manter seu agendamento, realize o pagamento o quanto antes.\n\nQualquer dúvida, estamos à disposição! 😊"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### 6. Mudança de estágio → Lead Quente

**Descrição:** Notifica vendedor quando lead passa para estágio "Quente".

```sql
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  conditions,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Notificação - Lead Quente',
  'Notifica vendedor quando lead muda para estágio quente',
  'default',
  'lead.stage_changed',
  '[
    {
      "field": "newStage",
      "operator": "equals",
      "value": "ID_DO_ESTAGIO_QUENTE"
    }
  ]'::jsonb,
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "SEU_INTEGRATION_ID_AQUI",
        "to": "{{lead.assignedTo.phone}}",
        "template": "🔥 *Lead Quente!*\n\nNome: {{lead.name}}\nTelefone: {{lead.phone}}\nProcedimento: {{lead.procedure}}\n\n⚡ Priorize o contato!"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

## 🔄 WORKFLOWS N8N

### Workflow 1: Funil de Nutrição de Leads

**Arquivo:** `workflows/lead-nurturing.json`

```json
{
  "name": "Funil de Nutrição - 3 dias",
  "nodes": [
    {
      "name": "Webhook - Lead Criado",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "lead-created",
        "responseMode": "onReceived",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Aguardar 1 dia",
      "type": "n8n-nodes-base.wait",
      "position": [450, 300],
      "parameters": {
        "amount": 1,
        "unit": "days"
      }
    },
    {
      "name": "Mensagem Dia 1",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "parameters": {
        "url": "https://api.nexusatemporal.com.br/api/automation/whatsapp/send",
        "method": "POST",
        "bodyParameters": {
          "to": "={{$json.lead.phone}}",
          "message": "Olá {{$json.lead.name}}! Como você está? Gostaria de saber mais sobre nossos procedimentos?"
        }
      }
    },
    {
      "name": "Aguardar 2 dias",
      "type": "n8n-nodes-base.wait",
      "position": [850, 300],
      "parameters": {
        "amount": 2,
        "unit": "days"
      }
    },
    {
      "name": "Mensagem Dia 3",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "url": "https://api.nexusatemporal.com.br/api/automation/whatsapp/send",
        "method": "POST",
        "bodyParameters": {
          "to": "={{$json.lead.phone}}",
          "message": "Oi {{$json.lead.name}}! Vi que você se interessou por {{$json.lead.procedure}}. Posso te ajudar a agendar uma avaliação? 😊"
        }
      }
    }
  ],
  "connections": {
    "Webhook - Lead Criado": {
      "main": [[{"node": "Aguardar 1 dia", "type": "main", "index": 0}]]
    },
    "Aguardar 1 dia": {
      "main": [[{"node": "Mensagem Dia 1", "type": "main", "index": 0}]]
    },
    "Mensagem Dia 1": {
      "main": [[{"node": "Aguardar 2 dias", "type": "main", "index": 0}]]
    },
    "Aguardar 2 dias": {
      "main": [[{"node": "Mensagem Dia 3", "type": "main", "index": 0}]]
    }
  }
}
```

---

### Workflow 2: Pesquisa de Satisfação Pós-Atendimento

```json
{
  "name": "Pesquisa de Satisfação",
  "nodes": [
    {
      "name": "Webhook - Atendimento Finalizado",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "appointment-completed",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Aguardar 2 horas",
      "type": "n8n-nodes-base.wait",
      "position": [450, 300],
      "parameters": {
        "amount": 2,
        "unit": "hours"
      }
    },
    {
      "name": "Enviar Pesquisa",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "parameters": {
        "url": "https://api.nexusatemporal.com.br/api/automation/whatsapp/send",
        "method": "POST",
        "bodyParameters": {
          "to": "={{$json.lead.phone}}",
          "message": "Olá {{$json.lead.name}}! 😊\n\nEsperamos que tenha gostado do atendimento!\n\nPor favor, avalie sua experiência de 1 a 5:\n\n⭐ 1 - Muito insatisfeito\n⭐⭐ 2 - Insatisfeito\n⭐⭐⭐ 3 - Neutro\n⭐⭐⭐⭐ 4 - Satisfeito\n⭐⭐⭐⭐⭐ 5 - Muito satisfeito\n\nSua opinião é muito importante!"
        }
      }
    }
  ],
  "connections": {
    "Webhook - Atendimento Finalizado": {
      "main": [[{"node": "Aguardar 2 horas", "type": "main", "index": 0}]]
    },
    "Aguardar 2 horas": {
      "main": [[{"node": "Enviar Pesquisa", "type": "main", "index": 0}]]
    }
  }
}
```

---

## 💬 INTEGRAÇÕES WHATSAPP

### Configurar Integração WAHA

```sql
-- 1. Criar integração WAHA
INSERT INTO integrations (
  "tenantId",
  name,
  type,
  config,
  credentials,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'default',
  'WhatsApp Principal',
  'waha',
  '{
    "baseUrl": "https://waha.nexusatemporal.com.br",
    "session": "default",
    "webhookUrl": "https://api.nexusatemporal.com.br/api/webhooks/waha"
  }'::jsonb,
  '{
    "apiKey": "SUA_API_KEY_WAHA"
  }'::jsonb,
  true,
  NOW(),
  NOW()
) RETURNING id;
```

### Exemplos de Uso via API

```bash
# Enviar mensagem de texto
curl -X POST https://api.nexusatemporal.com.br/api/automation/whatsapp/send \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "INTEGRATION_ID",
    "to": "5511999999999",
    "message": "Olá! Esta é uma mensagem automática."
  }'

# Enviar mensagem com mídia
curl -X POST https://api.nexusatemporal.com.br/api/automation/whatsapp/send-media \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "INTEGRATION_ID",
    "to": "5511999999999",
    "mediaUrl": "https://example.com/image.jpg",
    "caption": "Confira nossa promoção!"
  }'

# Verificar status da sessão
curl https://api.nexusatemporal.com.br/api/automation/whatsapp/status \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🤖 AUTOMAÇÕES COM IA

### Configurar Integração OpenAI

```sql
INSERT INTO integrations (
  "tenantId",
  name,
  type,
  config,
  credentials,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'default',
  'OpenAI GPT-4',
  'openai',
  '{
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 500
  }'::jsonb,
  '{
    "apiKey": "sk-..."
  }'::jsonb,
  true,
  NOW(),
  NOW()
);
```

### Exemplo: Análise Automática de Lead

```sql
-- Trigger que analisa lead e atualiza campos automaticamente
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'IA - Análise e Classificação',
  'Analisa lead com IA e classifica automaticamente',
  'default',
  'lead.created',
  '[
    {
      "type": "openai.analyze_lead",
      "config": {
        "integrationId": "OPENAI_INTEGRATION_ID",
        "prompt": "Analise este lead e retorne: sentimento (positivo/neutro/negativo), qualidade (alta/média/baixa), urgência (alta/média/baixa) e 3 tags relevantes",
        "updateFields": {
          "sentiment": "{{ai.sentiment}}",
          "quality": "{{ai.quality}}",
          "urgency": "{{ai.urgency}}",
          "tags": "{{ai.tags}}"
        }
      }
    },
    {
      "type": "condition",
      "config": {
        "if": "{{ai.quality}} === ''alta'' && {{ai.urgency}} === ''alta''",
        "then": [
          {
            "type": "update_lead",
            "config": {
              "priority": "high",
              "status": "hot"
            }
          },
          {
            "type": "notify_team",
            "config": {
              "message": "🔥 Lead quente detectado pela IA!"
            }
          }
        ]
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

### Exemplo: Geração de Resposta Automática

```sql
-- Trigger que gera resposta personalizada com IA
INSERT INTO triggers (
  name,
  description,
  "tenantId",
  event,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'IA - Resposta Automática',
  'Gera resposta personalizada usando IA quando lead envia mensagem',
  'default',
  'whatsapp.message.received',
  '[
    {
      "type": "openai.generate_response",
      "config": {
        "integrationId": "OPENAI_INTEGRATION_ID",
        "tone": "friendly",
        "context": "Você é um atendente da clínica Nexus. Seja prestativo e agende avaliações.",
        "variables": {
          "leadName": "{{lead.name}}",
          "message": "{{whatsapp.message}}"
        }
      }
    },
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "WAHA_INTEGRATION_ID",
        "to": "{{lead.phone}}",
        "message": "{{ai.response}}"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

## 🎯 CASOS DE USO COMPLETOS

### Caso 1: Jornada Completa do Lead

**Objetivo:** Automatizar toda a jornada desde criação até agendamento.

```sql
-- Passo 1: Lead criado → Boas-vindas + Análise IA
INSERT INTO triggers (name, "tenantId", event, actions, active, "createdAt", "updatedAt")
VALUES (
  'Jornada - 1. Boas-vindas',
  'default',
  'lead.created',
  '[
    {
      "type": "openai.analyze_lead",
      "config": {"integrationId": "OPENAI_ID"}
    },
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "WAHA_ID",
        "template": "Olá {{lead.name}}! Seja bem-vindo à Nexus! 🎉"
      }
    },
    {
      "type": "schedule_followup",
      "config": {"delay": "24h"}
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Passo 2: Lead mudou para "Interessado" → Enviar detalhes
INSERT INTO triggers (name, "tenantId", event, conditions, actions, active, "createdAt", "updatedAt")
VALUES (
  'Jornada - 2. Enviar Detalhes',
  'default',
  'lead.stage_changed',
  '[{"field": "newStage", "operator": "equals", "value": "STAGE_INTERESSADO"}]'::jsonb,
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "WAHA_ID",
        "template": "Ótimo {{lead.name}}! 😊\n\nVou te enviar mais informações sobre {{lead.procedure}}...\n\n[Detalhes do procedimento]"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);

-- Passo 3: Agendamento criado → Enviar confirmação
INSERT INTO triggers (name, "tenantId", event, actions, active, "createdAt", "updatedAt")
VALUES (
  'Jornada - 3. Confirmação Agendamento',
  'default',
  'appointment.scheduled',
  '[
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "WAHA_ID",
        "template": "✅ Agendamento confirmado!\n\n📅 {{appointment.date}}\n⏰ {{appointment.time}}\n📍 {{appointment.location}}\n\nAguardamos ansiosamente! 😊"
      }
    },
    {
      "type": "schedule_reminder",
      "config": {"beforeHours": 24}
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### Caso 2: Recuperação de Leads Inativos

**Objetivo:** Reengajar leads que não interagiram em 7 dias.

```sql
-- Criar workflow n8n que roda diariamente
INSERT INTO workflows (
  name,
  description,
  "tenantId",
  "n8nWorkflowId",
  config,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Recuperação - Leads Inativos',
  'Busca leads sem interação há 7+ dias e envia mensagem',
  'default',
  'N8N_WORKFLOW_ID',
  '{
    "schedule": "0 9 * * *",
    "actions": [
      {
        "type": "query_leads",
        "config": {
          "where": {
            "lastContactAt": {"$lt": "NOW() - INTERVAL ''7 days''"},
            "status": {"$in": ["new", "contacted"]}
          }
        }
      },
      {
        "type": "foreach_lead",
        "actions": [
          {
            "type": "openai.generate_response",
            "config": {
              "prompt": "Gere uma mensagem personalizada para reengajar este lead: {{lead.name}}, interessado em {{lead.procedure}}"
            }
          },
          {
            "type": "whatsapp.send_message",
            "config": {
              "to": "{{lead.phone}}",
              "message": "{{ai.message}}"
            }
          }
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

### Caso 3: Upsell Pós-Procedimento

**Objetivo:** Oferecer procedimentos complementares após atendimento.

```sql
INSERT INTO triggers (
  name,
  "tenantId",
  event,
  actions,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  'Upsell - Pós-Procedimento',
  'default',
  'appointment.completed',
  '[
    {
      "type": "wait",
      "config": {"days": 7}
    },
    {
      "type": "openai.generate_recommendation",
      "config": {
        "integrationId": "OPENAI_ID",
        "prompt": "Com base no procedimento {{appointment.procedure}}, sugira um tratamento complementar"
      }
    },
    {
      "type": "whatsapp.send_message",
      "config": {
        "integrationId": "WAHA_ID",
        "template": "Olá {{lead.name}}! 😊\n\nEsperamos que tenha gostado do resultado do {{appointment.procedure}}!\n\nPara potencializar ainda mais os resultados, recomendamos:\n\n{{ai.recommendation}}\n\nGostaria de saber mais?"
      }
    }
  ]'::jsonb,
  true,
  NOW(),
  NOW()
);
```

---

## 📊 MÉTRICAS E MONITORAMENTO

### Consultar eventos de automação

```sql
-- Ver eventos das últimas 24h
SELECT
  event_type,
  entity_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE processed = true) as processed,
  COUNT(*) FILTER (WHERE processed = false) as pending
FROM automation_events
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND "tenantId" = 'default'
GROUP BY event_type, entity_type
ORDER BY total DESC;

-- Ver triggers mais ativos
SELECT
  t.name,
  t.event,
  t.execution_count,
  t.last_executed_at,
  ROUND(AVG(t.avg_execution_time_ms), 2) as avg_time_ms
FROM triggers t
WHERE t."tenantId" = 'default'
  AND t.active = true
ORDER BY t.execution_count DESC
LIMIT 10;

-- Ver integrações e status
SELECT
  name,
  type,
  "isActive",
  last_tested_at,
  last_test_status,
  last_test_message
FROM integrations
WHERE "tenantId" = 'default'
ORDER BY type, name;
```

---

## 🚀 DEPLOY RÁPIDO

### Script completo para popular sistema com exemplos

```sql
-- Salvar como: seed-automations.sql
BEGIN;

-- 1. Criar integrações básicas
INSERT INTO integrations ("tenantId", name, type, config, credentials, "isActive", "createdAt", "updatedAt")
VALUES
  ('default', 'WhatsApp Principal', 'waha', '{"baseUrl": "https://waha.nexusatemporal.com.br", "session": "default"}'::jsonb, '{"apiKey": "CONFIGURAR"}'::jsonb, false, NOW(), NOW()),
  ('default', 'OpenAI GPT-4', 'openai', '{"model": "gpt-4", "temperature": 0.7}'::jsonb, '{"apiKey": "CONFIGURAR"}'::jsonb, false, NOW(), NOW()),
  ('default', 'n8n Workflows', 'n8n', '{"baseUrl": "https://n8n.nexusatemporal.com.br"}'::jsonb, '{"apiKey": "CONFIGURAR"}'::jsonb, false, NOW(), NOW());

-- 2. Criar triggers essenciais (desabilitados por padrão)
INSERT INTO triggers (name, description, "tenantId", event, actions, active, "createdAt", "updatedAt")
VALUES
  ('Boas-vindas - Novo Lead', 'Mensagem automática para novos leads', 'default', 'lead.created', '[]'::jsonb, false, NOW(), NOW()),
  ('Lembrete - 24h antes', 'Lembrete de agendamento', 'default', 'appointment.confirmed', '[]'::jsonb, false, NOW(), NOW()),
  ('Notificação - Pagamento', 'Aviso de pagamento recebido', 'default', 'payment.received', '[]'::jsonb, false, NOW(), NOW());

COMMIT;
```

---

## 📞 SUPORTE

**Dúvidas?** Consulte:
- INTEGRACAO_EVENT_EMITTER.md - Guia de integração
- RELATORIO_SESSAO_A_FINAL.md - Documentação técnica
- API: `GET /api/automation/events/v2/types` - Lista todos os eventos disponíveis

---

**Versão:** 1.0
**Data:** 20/10/2025
**Autor:** Claude (Sessão A)
