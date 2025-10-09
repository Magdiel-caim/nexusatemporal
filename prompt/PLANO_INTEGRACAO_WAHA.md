# 📋 PLANO DE INTEGRAÇÃO WAHA - NEXUS ATEMPORAL

**Data:** 2025-10-08
**Versão:** v30.1
**Status:** Em Planejamento

---

## 🔍 ANÁLISE DO PAINEL WAHA ATUAL

Baseado na captura de tela do painel WAHA:

### ✅ O que o WAHA JÁ TEM:

1. **Dashboard Completo:**
   - Visão geral de sessões (working/stopped)
   - Gerenciamento de Workers
   - Monitoramento de status

2. **Gerenciamento de Sessões:**
   - Botão "Start New" para criar sessões
   - Interface visual para cada sessão
   - Status em tempo real (STOPPED/WORKING)
   - Campos: Name, Metadata, Account, Status, Server

3. **Workers:**
   - 1 Worker WAHA ativo
   - URL: https://apiwts.nexusatemporal.com.br
   - Engine: GOWS (2025.9.8 PLUS) ✅
   - Status: Connected

4. **Sessão Existente:**
   - Nome: "teste"
   - Status: STOPPED
   - Server: WAHA

### ⚠️ Problema Atual:

**Erro:** `relation "conversations" does not exist`

**Causa:** Tabelas do banco de dados não foram criadas (faltam migrations do TypeORM)

---

## 🎯 OPÇÕES DE INTEGRAÇÃO

### OPÇÃO 1: INTEGRAÇÃO BACKEND DIRETA (Atual - Precisa Correção)

**Como funciona:**
```
Usuario → Frontend Nexus → Backend Nexus API → WAHA API
                                ↓
                         Banco de dados
                         (conversations, messages)
```

**Implementação:**
1. ✅ Backend faz chamadas diretas à API WAHA
2. ✅ Cria/gerencia sessões via código
3. ❌ Armazena conversations/messages no PostgreSQL (faltam migrations)
4. ❌ Frontend mostra chat integrado no CRM

**Vantagens:**
- ✅ Tudo integrado no CRM (UX unificado)
- ✅ Controle total sobre sessões e mensagens
- ✅ Histórico de conversas no banco próprio
- ✅ Pode criar automações personalizadas
- ✅ Relatórios e analytics de atendimento

**Desvantagens:**
- ❌ Mais código para manter
- ❌ Precisa criar migrations do TypeORM
- ❌ Duplica funcionalidades que WAHA já tem
- ❌ Mais complexo de debuggar

**O que falta fazer:**
1. Criar migrations para tabelas:
   - `conversations`
   - `messages`
   - `attachments`
   - `tags`
   - `quick_replies`
2. Executar migrations no banco
3. Testar criação de sessão
4. Implementar recebimento de mensagens via webhook

**Tempo estimado:** 2-3 horas
**Complexidade:** Alta

---

### OPÇÃO 2: N8N COMO MIDDLEWARE (Recomendado)

**Como funciona:**
```
Usuario → Frontend Nexus → N8N Workflow → WAHA API
                               ↓
                    Backend Nexus (webhook)
                               ↓
                        Banco de dados
```

**Implementação:**
1. ✅ N8N gerencia sessões WAHA via API
2. ✅ N8N recebe webhooks de mensagens do WAHA
3. ✅ N8N processa e envia para Backend Nexus
4. ✅ Backend armazena apenas mensagens (tabela simples)
5. ✅ Frontend exibe mensagens do banco

**Workflow N8N (exemplo):**

```
[Webhook Trigger] → [WAHA Create Session] → [Response]
                          ↓
                    [Save to Database]

[WAHA Message Webhook] → [Process Message] → [Send to Nexus Backend]
                               ↓
                        [Trigger Automations]
```

**Vantagens:**
- ✅ Low-code (fácil modificar workflows)
- ✅ Automações visuais (não-dev pode mexer)
- ✅ WAHA isolado da aplicação principal
- ✅ Pode adicionar integrações extras (ChatGPT, etc)
- ✅ Menos código no backend Nexus
- ✅ N8N já está configurado no sistema

**Desvantagens:**
- ⚠️ Mais um sistema na arquitetura
- ⚠️ Dependência do N8N estar rodando
- ⚠️ Latência adicional (minimal)

**O que fazer:**
1. Criar workflow N8N para gerenciar sessões WAHA
2. Criar webhook no backend Nexus para receber mensagens
3. Simplificar frontend (apenas exibir mensagens)
4. Criar tabela simples de mensagens (sem conversations complexas)

**Tempo estimado:** 1-2 horas
**Complexidade:** Média

---

### OPÇÃO 3: WAHA DASHBOARD + WEBHOOK PARA NEXUS (Mais Simples)

**Como funciona:**
```
Admin → WAHA Dashboard (gerencia sessões)
            ↓
        WAHA API
            ↓ (webhook)
    Backend Nexus (recebe mensagens)
            ↓
    Frontend Nexus (exibe chat)
```

**Implementação:**
1. ✅ Admin cria sessões no painel WAHA (já existe!)
2. ✅ WAHA envia webhook de mensagens para Backend Nexus
3. ✅ Backend armazena e processa mensagens
4. ✅ Frontend exibe apenas conversas ativas

**Vantagens:**
- ✅ Mais simples de implementar
- ✅ Usa interface WAHA que já existe
- ✅ Menos código no Nexus
- ✅ WAHA gerencia QR Codes e sessões
- ✅ Separação de responsabilidades clara

**Desvantagens:**
- ❌ Gerenciamento de sessões fora do CRM
- ❌ Admin precisa acessar 2 painéis (WAHA + Nexus)
- ❌ Menos integrado visualmente

**O que fazer:**
1. Remover código de criação de sessões do frontend
2. Configurar webhooks WAHA → Backend Nexus
3. Criar tabela simples de mensagens
4. Frontend apenas exibe conversas recebidas

**Tempo estimado:** 1 hora
**Complexidade:** Baixa

---

## 🏆 RECOMENDAÇÃO: OPÇÃO 2 (N8N Middleware)

### Por quê?

1. **Flexibilidade:** N8N permite criar automações visuais
2. **Escalabilidade:** Fácil adicionar novos canais (Telegram, Instagram)
3. **Manutenibilidade:** Low-code, qualquer um pode ajustar workflows
4. **Separação:** WAHA focado em WhatsApp, Nexus focado em CRM
5. **Integração:** N8N pode conectar com outros sistemas (Chatwoot, Mautic, etc)

### Arquitetura Proposta:

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXUS ATEMPORAL CRM                     │
│  ┌──────────────┐                                           │
│  │   Frontend   │ ← Exibe conversas e permite enviar        │
│  └──────┬───────┘                                           │
│         │                                                    │
│  ┌──────▼───────┐                                           │
│  │   Backend    │ ← Recebe webhooks do N8N                  │
│  └──────┬───────┘                                           │
│         │                                                    │
│  ┌──────▼───────┐                                           │
│  │  PostgreSQL  │ ← Armazena apenas mensagens               │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ Webhook
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                   N8N WORKFLOWS                              │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │  Workflow 1: Criar Sessão WhatsApp           │           │
│  │  [HTTP Request] → [WAHA Create] → [Response] │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │  Workflow 2: Receber Mensagens               │           │
│  │  [Webhook] → [Process] → [Send to Nexus]     │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │  Workflow 3: Enviar Mensagens                │           │
│  │  [Webhook] → [WAHA Send] → [Confirm]         │           │
│  └──────────────────────────────────────────────┘           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ API Calls
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                      WAHA API (GOWS)                         │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Session 1 │  │  Session 2 │  │  Session 3 │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  Dashboard: https://apiexcellence.nexusatemporal.com.br/    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 PLANO DE IMPLEMENTAÇÃO (OPÇÃO 2)

### Fase 1: Preparar Backend Nexus (30 min)

**1.1 Criar tabela simplificada de mensagens:**

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  contact_name VARCHAR(255),
  direction VARCHAR(20) NOT NULL, -- 'incoming' ou 'outgoing'
  message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'audio', etc
  content TEXT,
  media_url TEXT,
  waha_message_id VARCHAR(255),
  status VARCHAR(50), -- 'sent', 'delivered', 'read'
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_name);
CREATE INDEX idx_chat_messages_phone ON chat_messages(phone_number);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
```

**1.2 Criar endpoint webhook:**

```typescript
// backend/src/modules/chat/n8n-webhook.controller.ts
@Post('/webhook/n8n/message')
async receiveMessage(@Body() data: any) {
  // Receber mensagem do N8N
  // Salvar no banco
  // Emitir via WebSocket para frontend
}
```

### Fase 2: Criar Workflows N8N (45 min)

**Workflow 1: Criar Sessão WhatsApp**

```
Trigger: Webhook (POST /n8n/create-session)
  ↓
HTTP Request: POST https://apiwts.nexusatemporal.com.br/api/sessions
  Body: {
    "name": "{{$json.sessionName}}",
    "config": {
      "engine": "GOWS",
      "webhooks": [{
        "url": "{{$env.N8N_WEBHOOK_URL}}/waha-message",
        "events": ["message", "session.status"]
      }]
    }
  }
  Headers: {
    "X-Api-Key": "bd0c416348b2f04d198ff8971b608a87"
  }
  ↓
HTTP Request: POST https://apiwts.nexusatemporal.com.br/api/sessions/{{$json.name}}/start
  ↓
HTTP Request: GET https://apiwts.nexusatemporal.com.br/api/sessions/{{$json.name}}/auth/qr
  ↓
Response: Retornar QR Code para frontend
```

**Workflow 2: Receber Mensagens WAHA**

```
Trigger: Webhook (POST /waha-message)
  ↓
Function: Processar dados da mensagem
  ↓
HTTP Request: POST https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message
  Body: {
    "sessionName": "{{$json.session}}",
    "phoneNumber": "{{$json.from}}",
    "content": "{{$json.body}}",
    "messageType": "{{$json.type}}",
    "direction": "incoming",
    "wahaMessageId": "{{$json.id}}"
  }
```

**Workflow 3: Enviar Mensagens**

```
Trigger: Webhook (POST /n8n/send-message)
  ↓
HTTP Request: POST https://apiwts.nexusatemporal.com.br/api/sendText
  Body: {
    "session": "{{$json.sessionName}}",
    "chatId": "{{$json.phoneNumber}}@c.us",
    "text": "{{$json.content}}"
  }
  Headers: {
    "X-Api-Key": "bd0c416348b2f04d198ff8971b608a87"
  }
  ↓
HTTP Request: POST https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message
  Body: {
    "sessionName": "{{$json.session}}",
    "phoneNumber": "{{$json.phoneNumber}}",
    "content": "{{$json.content}}",
    "messageType": "text",
    "direction": "outgoing",
    "status": "sent"
  }
```

### Fase 3: Atualizar Frontend (30 min)

**3.1 Simplificar WhatsAppConnectionPanel:**

```typescript
// frontend/src/components/chat/WhatsAppConnectionPanel.tsx

const handleCreateSession = async () => {
  // Chamar N8N ao invés da API direta
  const response = await fetch('https://workflow.nexusatemporal.com/webhook/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionName })
  });

  const data = await response.json();
  setQrCode(data.qrCode);
};
```

**3.2 Atualizar ChatPage para receber via WebSocket:**

```typescript
// Receber mensagens do backend (que recebe do N8N)
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

---

## 🎯 RESULTADO ESPERADO

### Para o Usuário Final:

1. **Conectar WhatsApp:**
   - Clica em "Conectar WhatsApp"
   - Digita nome da sessão
   - QR Code aparece (gerenciado pelo N8N → WAHA)
   - Escaneia com WhatsApp
   - Sessão ativa!

2. **Receber Mensagens:**
   - Cliente envia mensagem no WhatsApp
   - WAHA → N8N → Backend Nexus → WebSocket → Frontend
   - Mensagem aparece no chat do CRM
   - Notificação visual

3. **Enviar Mensagens:**
   - Atendente digita no CRM
   - Frontend → Backend → N8N → WAHA → WhatsApp
   - Cliente recebe no WhatsApp

### Para o Admin:

- Pode ver sessões ativas no painel WAHA
- Pode gerenciar sessões diretamente no WAHA se necessário
- Workflows N8N fáceis de modificar
- Logs centralizados no N8N

---

## 🔄 OPÇÃO ALTERNATIVA: HÍBRIDA

Combinar Opção 2 + Opção 3:

- **N8N:** Gerencia automações e regras de negócio
- **WAHA Dashboard:** Gerencia sessões manualmente se necessário
- **Nexus CRM:** Exibe conversas e permite atendimento

**Vantagem:** Melhor dos dois mundos
**Desvantagem:** Mais complexo inicialmente

---

## 🚀 PRÓXIMOS PASSOS

**Me diga qual opção você prefere e eu implemento:**

1. **Opção 1** - Backend direto (precisa criar migrations)
2. **Opção 2** - N8N Middleware ⭐ **RECOMENDADO**
3. **Opção 3** - WAHA Dashboard + Webhook simples
4. **Opção 4** - Híbrida (2 + 3)

**Para decidir, considere:**
- Você quer gerenciar tudo dentro do CRM? → Opção 1
- Você quer flexibilidade e automações? → Opção 2 ⭐
- Você quer o mais simples possível? → Opção 3
- Você quer o melhor dos mundos? → Opção 4

---

**Documentação WAHA:** https://waha.devlike.pro/docs/
**N8N URL:** https://workflow.nexusatemporal.com
**N8N API Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Aguardando sua decisão para implementar! 🎯
