# Credenciais do Sistema de Automações - Nexus Atemporal

## Data de Deploy: 17/10/2025
## Última Atualização: 17/10/2025 - Domínios corrigidos

---

## n8n - Workflow Automation

### URLs
- **Editor/UI**: https://automacao.nexusatemporal.com.br
- **Webhooks**: https://automahook.nexusatemporal.com.br

### Credenciais de Acesso
- Username: `admin`
- Password: `NexusN8n2025!Secure`

### Configurações
- Basic Auth Ativo: Sim
- Webhook URL: https://automahook.nexusatemporal.com.br
- Protocol: HTTPS
- Encryption Key: NexusEncryptionKey2025SecureRandom32Chars
- Execution Mode: Regular

### Uso dos Domínios
- **automacao.nexusatemporal.com.br**: Interface visual para criar e gerenciar workflows
- **automahook.nexusatemporal.com.br**: Endpoint para receber webhooks de sistemas externos

---

## Waha - WhatsApp HTTP API (Existente)

### URL Existente
- **API**: https://apiwts.nexusatemporal.com.br

### Status
✅ **Serviço já existente na stack 'waha'**
- Serviço: `waha_waha`
- Versão: Waha Plus (latest)
- Status: 1/1 replicas running

### Token/Credenciais
⏳ **Aguardando token do usuário**

### Domínio Alternativo Disponível
Se necessário configurar webhook específico para automações:
- **whats.nexusatemporal.com.br** (disponível)

---

## Database - Tabelas de Automação

**Tabelas Criadas** (13 total):
1. `triggers` - Gatilhos de automação
2. `workflows` - Fluxos de trabalho
3. `workflow_logs` - Logs de execução
4. `workflow_templates` - Templates pré-configurados (6 templates)
5. `integrations` - Integrações externas
6. `integration_logs` - Logs de integrações
7. `automation_events` - Fila de eventos
8. `whatsapp_sessions` - Sessões WhatsApp
9. `whatsapp_messages` - Mensagens WhatsApp
10. `notificame_accounts` - Contas Notifica.me
11. `notificame_channels` - Canais sociais
12. `notificame_messages` - Mensagens redes sociais
13. `ai_interactions` - Interações com OpenAI

---

## Workflow Templates Disponíveis

1. **Novo Lead via WhatsApp**
   - Categoria: leads
   - Descrição: Qualifica lead e notifica vendedor
   - Tags: whatsapp, leads, sales

2. **Lembrete de Consulta**
   - Categoria: appointments
   - Descrição: Envia lembrete 24h antes
   - Tags: appointments, reminders, whatsapp

3. **Cobrança Automática**
   - Categoria: financial
   - Descrição: Lembretes D+1, D+3, D+7
   - Tags: financial, payments, collections

4. **Pesquisa de Satisfação**
   - Categoria: retention
   - Descrição: Envia pesquisa 2h após procedimento
   - Tags: retention, surveys, satisfaction

5. **Aniversário do Cliente**
   - Categoria: retention
   - Descrição: Parabéns + desconto
   - Tags: retention, birthday, promotions

6. **Reativação de Inativos**
   - Categoria: retention
   - Descrição: Campanha para clientes 90+ dias inativos
   - Tags: retention, reactivation, campaigns

---

## Serviços Docker

### Stack n8n: nexus-automation
**Serviços Ativos**:
- `nexus-automation_n8n` (1/1 replicas) ✅

**Volumes**:
- `n8n_data` - Dados persistentes do n8n

### Stack Waha: waha (Existente)
**Serviços Ativos**:
- `waha_waha` (1/1 replicas) ✅
- `waha_postgreswaha` (1/1 replicas) ✅

**Network**: nexusatnet (compartilhada)

---

## Configuração DNS Necessária

Para ativar os serviços, adicione os seguintes registros DNS:

### Registros A ou CNAME:
```
automacao.nexusatemporal.com.br → IP do servidor
automahook.nexusatemporal.com.br → IP do servidor
```

Opcional (se necessário webhook específico):
```
whats.nexusatemporal.com.br → IP do servidor
```

---

## Próximos Passos

### Fase 1 - Concluída ✅
1. ✅ Migration do banco aplicada (13 tabelas)
2. ✅ n8n deployado com domínios corretos
3. ✅ Waha existente identificado e integrado

### Fase 2 - DNS
1. ⏳ Configurar DNS (automacao e automahook)
2. ⏳ Aguardar propagação DNS
3. ⏳ Let's Encrypt obterá certificados automaticamente

### Fase 3 - Backend
1. ⏳ Token do Waha (fornecido pelo usuário)
2. ⏳ Implementar EventEmitter + RabbitMQ Service
3. ⏳ Criar APIs REST (Triggers, Workflows, Integrations)
4. ⏳ Serviços de integração (n8n, Waha, OpenAI)

### Fase 4 - Frontend
1. ⏳ Dashboard de automações
2. ⏳ Builder de triggers visual
3. ⏳ Biblioteca de workflows

### Typebot
⏳ Aguardando orientações específicas do usuário

---

## Arquitetura de Comunicação

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  automacao.nexusatemporal.com.br (n8n Editor)          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                  BACKEND API                            │
│       api.nexusatemporal.com.br/api/*                   │
│  - /api/triggers    - /api/workflows                    │
│  - /api/integrations - /api/whatsapp/webhook            │
└─────┬────────┬────────┬──────────┬──────────────────────┘
      │        │        │          │
      │        │        │          │
┌─────▼────┐ ┌▼────────▼──┐ ┌─────▼────────┐ ┌──────────┐
│ RabbitMQ │ │ PostgreSQL │ │   n8n        │ │  Waha    │
│  Events  │ │  Database  │ │  Workflows   │ │ WhatsApp │
└──────────┘ └────────────┘ └──────────────┘ └──────────┘
                               │                    │
                               ▼                    ▼
                        automahook.*         apiwts.*
                        (Webhooks)          (WhatsApp)
```

---

## Segurança

⚠️ **IMPORTANTE**: Este arquivo contém credenciais sensíveis.

**Permissões atuais**: -rw------- (600) ✅

Mantenha seguro e não faça commit no repositório Git.

---

## ⚠️ CONFIGURAÇÕES PENDENTES - LEMBRETE

### 1. Token Waha ✅
- **Token**: `dckr_pat_AwZ9EnyGOTseBUaEPb4Yj384leA`
- **Status**: Recebido
- **Próximo passo**: Configurar no backend para integração com Waha API

### 2. DNS Cloudflare ✅
- **Status**: Registros tipo A criados
- **Domínios configurados**:
  - automacao.nexusatemporal.com.br
  - automahook.nexusatemporal.com.br
- **Aguardando**: Propagação DNS (pode levar alguns minutos)

### 3. Typebot ⏳
- **Status**: Aguardando orientações específicas do usuário
- **Quando disponível**: Adicionar ao docker-compose.automation.yml

### 4. Integração Waha com Backend ⏳
- Configurar Waha Service para consumir API
- Implementar webhook receiver
- Testar envio/recebimento de mensagens

### 5. Integração OpenAI ⏳
- Adicionar API key do OpenAI nas variáveis de ambiente
- Implementar OpenAI Service
- Configurar modelos (GPT-4, GPT-3.5-turbo)

### 6. Testes de Conectividade ⏳
- Após DNS propagar, testar: https://automacao.nexusatemporal.com.br
- Verificar certificado SSL do Let's Encrypt
- Fazer login no n8n (admin / NexusN8n2025!Secure)
- Criar primeiro workflow de teste

### 7. OpenAI API Key ✅
- **API Key**: `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`
- **Status**: Recebida
- **Modelos disponíveis**: GPT-4, GPT-3.5-turbo
- **Uso previsto**: 
  - Análise de leads
  - Previsão de no-show
  - Análise de sentimento
  - Qualificação automática
  - Sugestões de resposta
