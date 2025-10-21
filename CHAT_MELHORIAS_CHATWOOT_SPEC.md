# 🎯 Especificação de Melhorias do Módulo de Chat Nexus
## Baseado no Chatwoot

**Data:** 21 de Outubro de 2025
**Sessão:** B - Chat Improvements
**Objetivo:** Transformar o módulo de Chat do Nexus em uma experiência completa similar ao Chatwoot

---

## 📊 ANÁLISE COMPARATIVA: Nexus vs Chatwoot

### ✅ O que JÁ TEMOS no Nexus

| Funcionalidade | Status | Localização |
|---------------|--------|-------------|
| Conversas básicas | ✅ Implementado | conversation.entity.ts |
| Mensagens de texto | ✅ Implementado | message.entity.ts |
| Anexos (structure) | ✅ Implementado | attachment.entity.ts |
| Tags básicas | ✅ Implementado | conversation.entity.ts:49-50 |
| Quick Replies | ✅ Implementado | quick-reply.entity.ts |
| Status (active/closed/waiting) | ✅ Implementado | conversation.entity.ts:34-35 |
| WhatsApp Integration | ✅ Implementado | whatsapp.service.ts |
| WebSocket real-time | ✅ Implementado | websocket.service.ts |
| Envio de mídia | ✅ Implementado | ChatPage.tsx:470-505 |

### ❌ O que FALTA no Nexus (baseado no Chatwoot)

| Funcionalidade | Prioridade | Chatwoot tem? |
|---------------|-----------|---------------|
| **CRÍTICO: Recebimento de arquivos** | 🔴 CRÍTICA | ✅ Sim |
| **CRÍTICO: Filtro por número/canal** | 🔴 CRÍTICA | ✅ Sim |
| Prioridade de conversas | 🟠 Alta | ✅ Sim (low/medium/high/urgent) |
| Snooze de conversas | 🟠 Alta | ✅ Sim (snoozed_until) |
| Custom Attributes (Contato) | 🟠 Alta | ✅ Sim (JSONB) |
| Macros/Canned Responses | 🟠 Alta | ✅ Sim |
| Informações da conversa | 🟠 Alta | ✅ Sim (painel direito) |
| Conversas anteriores | 🟡 Média | ✅ Sim |
| Participantes da conversa | 🟡 Média | ✅ Sim |
| Teams (equipes) | 🟡 Média | ✅ Sim |
| Agent bots 24/7 | 🟠 Alta | ✅ Sim |
| Notas privadas | 🟡 Média | ✅ Sim |
| Message templates | 🟡 Média | ✅ Sim |
| SLA tracking | 🟢 Baixa | ✅ Sim |

---

## 🚨 PROBLEMAS CRÍTICOS A CORRIGIR

### 1. **Recebimento de Arquivos não Funciona** 🔴

**Problema:**
- Frontend envia arquivos via `sendWhatsAppMedia()` ✅
- Backend WAHA recebe arquivos via webhook ❌
- Mensagens com mídia recebidas não aparecem no chat ❌

**Causa Raiz:**
- O webhook `n8n-webhook.controller.ts` não está salvando attachments no banco
- A entity `Attachment` existe mas não está sendo usada
- Messages.mediaUrl é salvo mas attachment record não é criado

**Solução:**
1. Modificar `n8n-webhook.controller.ts` para detectar mensagens com mídia
2. Baixar arquivo da URL do WAHA
3. Fazer upload para S3/iDrive E2
4. Criar registro em `Attachment` com URL do S3
5. Associar attachment à message
6. Frontend já renderiza mídias se tiver `message.attachments[]`

**Arquivos a Modificar:**
- `backend/src/modules/chat/n8n-webhook.controller.ts` (processamento webhook)
- `backend/src/modules/chat/chat.service.ts` (criar attachment)
- Possível novo service: `backend/src/modules/chat/media-upload.service.ts` (S3 upload)

---

### 2. **Separação de Conversas por Número não Funciona** 🔴

**Problema:**
- Frontend tem `ChannelSelector` component (ChatPage.tsx:691-694) ✅
- Tem estado `selectedChannel` ✅
- Filtra conversas pelo `whatsappInstanceId` ✅
- **MAS**: O filtro não está sendo aplicado corretamente

**Causa Raiz:**
Linha 570-573 do ChatPage.tsx:
```typescript
// Filtrar por canal selecionado
if (selectedChannel && conv.whatsappInstanceId !== selectedChannel) {
  return false;
}
```
- Funciona APENAS se `selectedChannel` estiver setado
- Não filtra automaticamente ao carregar conversas
- Não há UI clara de qual canal está selecionado

**Solução:**
1. Melhorar UI do `ChannelSelector` para mostrar canais disponíveis
2. Adicionar contador de conversas por canal
3. Adicionar botão "Todos os canais" que limpa o filtro
4. Persists seleção no localStorage
5. Criar endpoint `/api/chat/channels` que retorna lista de canais ativos

**Arquivos a Modificar:**
- `frontend/src/components/chat/ChannelSelector.tsx` (UI melhorada)
- `backend/src/modules/chat/chat.controller.ts` (novo endpoint /channels)
- `frontend/src/services/chatService.ts` (getChannels method)

---

## 📋 MELHORIAS POR PRIORIDADE

### 🔴 PRIORIDADE CRÍTICA (Implementar HOJE)

#### 1. **Recebimento de Arquivos (Áudio, Vídeo, Foto, Documento)**

**Backend Tasks:**
- [ ] Criar `MediaUploadService` para upload S3
- [ ] Modificar webhook para detectar mensagens com mídia
- [ ] Baixar arquivo do WAHA
- [ ] Upload para S3/iDrive E2
- [ ] Criar record em `Attachment`
- [ ] Testar com todos os tipos (audio, video, image, document)

**Frontend Tasks:**
- [ ] Verificar se `MessageBubble` renderiza attachments corretamente
- [ ] Adicionar preview de vídeo
- [ ] Adicionar player de áudio
- [ ] Adicionar download de documentos
- [ ] Testar recebimento em tempo real

**Estimativa:** 3-4 horas

---

#### 2. **Filtro de Conversas por Número/Canal**

**Backend Tasks:**
- [ ] Criar endpoint `GET /api/chat/channels`
- [ ] Retornar lista de canais ativos com:
  - sessionName
  - phoneNumber
  - status (WORKING, FAILED, etc.)
  - conversationCount (quantas conversas)
  - unreadCount (quantas não lidas)
- [ ] Otimizar query para contar conversas

**Frontend Tasks:**
- [ ] Melhorar UI do `ChannelSelector`
- [ ] Mostrar lista de canais com contadores
- [ ] Adicionar botão "Todos" para remover filtro
- [ ] Highlight canal selecionado
- [ ] Persistir seleção no localStorage
- [ ] Auto-selecionar se tiver apenas 1 canal

**Estimativa:** 2-3 horas

---

### 🟠 PRIORIDADE ALTA (Implementar esta semana)

#### 3. **Prioridade de Conversas**

**Database Migration:**
```sql
ALTER TABLE conversations ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
-- Valores: 'low', 'medium', 'high', 'urgent'

CREATE INDEX idx_conversations_priority ON conversations(priority);
```

**Backend Tasks:**
- [ ] Adicionar campo `priority` na entity
- [ ] Endpoint para alterar prioridade
- [ ] Filtrar conversas por prioridade
- [ ] Ordenar conversas (urgent first)

**Frontend Tasks:**
- [ ] Dropdown para selecionar prioridade
- [ ] Badges coloridos (urgent=vermelho, high=laranja, medium=amarelo, low=verde)
- [ ] Filtro de prioridade na sidebar
- [ ] Ordenação automática

**Estimativa:** 2 horas

---

#### 4. **Snooze de Conversas**

**Database Migration:**
```sql
ALTER TABLE conversations ADD COLUMN snoozed_until TIMESTAMP NULL;

CREATE INDEX idx_conversations_snoozed ON conversations(snoozed_until);
```

**Backend Tasks:**
- [ ] Adicionar campo `snoozed_until` na entity
- [ ] Endpoint `POST /api/chat/conversations/:id/snooze`
- [ ] Endpoint `POST /api/chat/conversations/:id/unsnooze`
- [ ] Filtrar conversas em snooze
- [ ] Cron job para reativar conversas (quando snooze_until <= now)

**Frontend Tasks:**
- [ ] Botão "Snooze" no header da conversa
- [ ] Modal com opções: 1h, 4h, 1 dia, 1 semana, custom
- [ ] Badge "Em snooze até DD/MM HH:mm"
- [ ] Filtro "Snoozed" na sidebar

**Estimativa:** 3 horas

---

#### 5. **Custom Attributes (Atributos do Contato)**

**Nova Estrutura:**

**Tabela `contact_attributes`:**
```sql
CREATE TABLE contact_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'text', 'number', 'checkbox', 'dropdown', 'link', 'date'
  options JSONB NULL, -- Para dropdown: ["Opção 1", "Opção 2"]
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_attributes_tenant ON contact_attributes(tenant_id);
```

**Tabela `contact_attribute_values`:**
```sql
CREATE TABLE contact_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES contact_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(conversation_id, attribute_id)
);

CREATE INDEX idx_attribute_values_conversation ON contact_attribute_values(conversation_id);
CREATE INDEX idx_attribute_values_attribute ON contact_attribute_values(attribute_id);
```

**Backend Tasks:**
- [ ] Criar entities `ContactAttribute` e `ContactAttributeValue`
- [ ] CRUD de atributos customizados
- [ ] Salvar valores dos atributos por conversa
- [ ] Buscar conversas por atributos

**Frontend Tasks:**
- [ ] Seção "Atributos do Contato" no painel direito
- [ ] Form dinâmico baseado nos atributos criados
- [ ] Gerenciamento de atributos (Settings)
- [ ] Salvar/editar valores

**Estimativa:** 4-5 horas

---

#### 6. **Macros/Canned Responses Melhoradas**

**Atual:**
- Já existe `QuickReply` entity ✅
- Já tem UI básica no ChatPage ✅

**Melhorias Necessárias:**
- [ ] Adicionar categorias (Vendas, Suporte, Financeiro)
- [ ] Adicionar atalhos de teclado (ex: `/obrigado` insere "Muito obrigado pelo contato!")
- [ ] Adicionar variáveis dinâmicas: `{{contact_name}}`, `{{agent_name}}`, `{{company_name}}`
- [ ] Suporte a anexos em quick replies
- [ ] UI melhorada: grid com search, categorias

**Database Migration:**
```sql
ALTER TABLE quick_replies ADD COLUMN category VARCHAR(50) NULL;
ALTER TABLE quick_replies ADD COLUMN shortcut_trigger VARCHAR(50) NULL;
ALTER TABLE quick_replies ADD COLUMN attachment_url TEXT NULL;

CREATE INDEX idx_quick_replies_category ON quick_replies(category);
```

**Estimativa:** 3 horas

---

#### 7. **Agentes para Atendimento 24/7 (Chatwoot Captain)**

**Conceito:**
- Bot baseado em IA (OpenAI) que responde automaticamente
- Ativado quando nenhum agente humano está online
- Pode responder perguntas frequentes
- Pode coletar informações (nome, email, necessidade)
- Pode criar leads automaticamente

**Nova Estrutura:**

**Tabela `agent_bots`:**
```sql
CREATE TABLE agent_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ai_provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic'
  ai_model VARCHAR(100) NOT NULL, -- 'gpt-4', 'gpt-3.5-turbo'
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_activate BOOLEAN DEFAULT FALSE, -- Ativar quando nenhum agente online
  active_hours JSONB NULL, -- {"start": "08:00", "end": "18:00", "days": [1,2,3,4,5]}
  fallback_message TEXT, -- Mensagem quando bot não sabe responder
  handoff_keywords TEXT[], -- Keywords que transferem para humano
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela `agent_bot_conversations`:**
```sql
CREATE TABLE agent_bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES agent_bots(id),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP NULL,
  handoff_reason VARCHAR(100) NULL, -- 'agent_online', 'keyword_detected', 'manual'
  messages_sent INT DEFAULT 0,
  was_helpful BOOLEAN NULL,

  UNIQUE(conversation_id)
);
```

**Backend Tasks:**
- [ ] Criar entities `AgentBot` e `AgentBotConversation`
- [ ] Service para detectar quando ativar bot (nenhum agente online)
- [ ] Integração com OpenAI para gerar respostas
- [ ] Lógica de handoff (transferir para humano)
- [ ] Webhook listener para mensagens entrantes
- [ ] Auto-resposta quando bot está ativo

**Frontend Tasks:**
- [ ] Página de gerenciamento de bots (Settings)
- [ ] Badge "🤖 Bot ativo" nas conversas
- [ ] Botão "Assumir conversa" para agentes
- [ ] Histórico de conversas do bot

**Estimativa:** 6-8 horas

---

### 🟡 PRIORIDADE MÉDIA (Próxima semana)

#### 8. **Painel de Informações da Conversa (Direita)**

**Atual:**
- Já existe `ConversationDetailsPanel` component ✅

**Melhorias:**
- [ ] Informações do contato (nome, email, telefone, avatar)
- [ ] Custom attributes (se implementado)
- [ ] Conversas anteriores (histórico)
- [ ] Labels/tags
- [ ] Participantes (se grupo WhatsApp)
- [ ] Ações rápidas: Resolver, Snooze, Transferir

**Estimativa:** 2-3 horas

---

#### 9. **Conversas Anteriores (Histórico)**

**Backend:**
- Endpoint `GET /api/chat/conversations/:id/previous`
- Retorna conversas anteriores do mesmo phoneNumber
- Ordenadas por data (mais recente primeiro)

**Frontend:**
- Seção "Conversas Anteriores" no painel direito
- Lista de conversas passadas
- Click abre conversa em modal

**Estimativa:** 2 horas

---

#### 10. **Participantes da Conversa (Grupos WhatsApp)**

**Desafio:**
- WAHA precisa fornecer lista de participantes
- Endpoint: `GET /api/{session}/chats/{chatId}/participants`

**Backend:**
- Chamar WAHA para obter participantes
- Cachear no banco (tabela `conversation_participants`)

**Frontend:**
- Lista de participantes no painel direito
- Avatar + nome
- Badge "admin" para admins do grupo

**Estimativa:** 3 horas

---

#### 11. **Teams (Equipes de Atendimento)**

**Estrutura:**

**Tabela `teams`:**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela `team_users`:**
```sql
CREATE TABLE team_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- 'member', 'leader'
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);
```

**Alteração em conversations:**
```sql
ALTER TABLE conversations ADD COLUMN team_id UUID NULL REFERENCES teams(id);
```

**Funcionalidades:**
- Atribuir conversa a equipe
- Filtrar conversas por equipe
- Round-robin assignment dentro da equipe

**Estimativa:** 4 horas

---

#### 12. **Notas Privadas**

**Conceito:**
- Mensagens que só agentes veem
- Não aparecem para o cliente
- Úteis para colaboração interna

**Database:**
```sql
ALTER TABLE messages ADD COLUMN is_private BOOLEAN DEFAULT FALSE;
```

**Backend:**
- Filtrar mensagens privadas ao enviar para cliente
- Apenas enviar ao frontend de agentes

**Frontend:**
- Botão "Nota Privada" ao lado de "Enviar"
- Background diferente (amarelo)
- Ícone de cadeado 🔒

**Estimativa:** 2 horas

---

## 📅 ROADMAP DE IMPLEMENTAÇÃO

### **Fase 1: Correções Críticas (1-2 dias)**

**Dia 1:**
- ✅ Análise completa do código atual
- ✅ Estudo do Chatwoot
- ✅ Criação deste documento de especificação
- 🔲 Implementar recebimento de arquivos (backend + frontend)

**Dia 2:**
- 🔲 Implementar filtro de conversas por número/canal
- 🔲 Testes completos de mídia e filtros
- 🔲 Deploy e validação

---

### **Fase 2: Funcionalidades Essenciais (3-4 dias)**

**Dias 3-4:**
- 🔲 Prioridade de conversas
- 🔲 Snooze de conversas
- 🔲 Custom Attributes (backend)
- 🔲 Macros melhoradas

**Dias 5-6:**
- 🔲 Custom Attributes (frontend)
- 🔲 Agentes 24/7 (backend)
- 🔲 Agentes 24/7 (frontend)
- 🔲 Testes e deploy

---

### **Fase 3: Melhorias UX (2-3 dias)**

**Dias 7-8:**
- 🔲 Painel de informações melhorado
- 🔲 Conversas anteriores
- 🔲 Participantes de grupos

**Dia 9:**
- 🔲 Teams
- 🔲 Notas privadas
- 🔲 Testes finais

---

## 🎯 OBJETIVOS DE SUCESSO

### **Métricas de Sucesso:**

1. **Recebimento de Mídias:** 100% das mídias recebidas devem aparecer no chat
2. **Filtro por Canal:** Conversas filtradas corretamente por número conectado
3. **Bot 24/7:** Respostas automáticas fora do horário de atendimento
4. **Custom Attributes:** Mínimo 5 atributos customizados configuráveis
5. **Macros:** Reduzir tempo de resposta em 50% com atalhos

### **Testes Obrigatórios:**

- [ ] Receber imagem via WhatsApp e visualizar no chat
- [ ] Receber áudio via WhatsApp e tocar no chat
- [ ] Receber vídeo via WhatsApp e visualizar no chat
- [ ] Receber documento via WhatsApp e fazer download
- [ ] Filtrar conversas por canal específico
- [ ] Bot responder automaticamente mensagem recebida
- [ ] Criar 3 custom attributes e preencher
- [ ] Usar macro com atalho `/obrigado`
- [ ] Fazer snooze de conversa por 1 hora
- [ ] Marcar conversa como "urgente"

---

## 📚 REFERÊNCIAS

### **Documentação Consultada:**
- [Chatwoot GitHub](https://github.com/chatwoot/chatwoot)
- [Chatwoot API Docs](https://developers.chatwoot.com)
- [Chatwoot Data Models](https://deepwiki.com/chatwoot/chatwoot/2.1-data-models)
- [DrawSQL Chatwoot Schema](https://drawsql.app/templates/chatwoot)

### **Arquivos do Nexus:**
- `backend/src/modules/chat/conversation.entity.ts`
- `backend/src/modules/chat/message.entity.ts`
- `backend/src/modules/chat/attachment.entity.ts`
- `backend/src/modules/chat/chat.service.ts`
- `backend/src/modules/chat/whatsapp.service.ts`
- `frontend/src/pages/ChatPage.tsx`
- `frontend/src/services/chatService.ts`

---

## ✅ PRÓXIMOS PASSOS

1. **Revisar este documento com a equipe**
2. **Aprovar escopo e prioridades**
3. **Começar Fase 1: Correções Críticas**
4. **Deploy incremental (não esperar tudo pronto)**
5. **Coletar feedback dos usuários**

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Versão:** 1.0
**Status:** 📝 Aguardando aprovação

🚀 **Vamos transformar o Chat do Nexus em uma ferramenta profissional de atendimento!**
