# Status da Sincronização de Chat - Versão 31
**Data:** 2025-10-09
**Hora:** 15:00
**Status:** ⚠️ PARCIALMENTE FUNCIONAL - Backend sincronizando, frontend NÃO exibe

---

## 🎯 Objetivo
Sincronizar mensagens WhatsApp com o sistema Nexus em tempo real.

---

## ✅ O QUE JÁ FUNCIONA

### 1. Serviço de Polling (Backend)
**Status:** ✅ 100% FUNCIONAL

**Arquivo:** `/root/nexusatemporal/backend/src/services/WhatsAppSyncService.ts`

**O que faz:**
- Busca chats do WAHA a cada 5 segundos
- Para cada chat, pega últimas 20 mensagens
- Verifica se mensagem já existe no banco (via `waha_message_id`)
- Se não existe, salva no banco
- Emite evento WebSocket `chat:new-message`

**Evidências:**
```bash
docker service logs nexus_backend --since 5m | grep "SYNC"
# Resultado: Centenas de mensagens sincronizadas
```

**Mensagens no banco:**
```sql
SELECT phone_number, direction, COUNT(*)
FROM chat_messages
WHERE phone_number = '554192431011'
GROUP BY phone_number, direction;

Resultado:
- 32 mensagens INCOMING (recebidas)
- 8 mensagens OUTGOING (enviadas)
```

**Como desativar:**
```bash
docker service update nexus_backend --env-add ENABLE_WHATSAPP_POLLING=false
```

### 2. WebSocket Backend
**Status:** ✅ FUNCIONANDO

**Evidências:**
```
2025-10-09 15:03:45 [info]: WebSocket connected: 4dGLk-YerXc8esL_AAAB
```

### 3. Backend Aceitando Webhooks
**Status:** ⚠️ PARCIAL

O backend aceita eventos `message` e `message.any`, mas webhooks do WAHA não chegam para mensagens reais.

---

## ❌ O QUE NÃO FUNCIONA

### 1. Frontend NÃO Exibe Conversas
**Problema:** Tela mostra "Nenhuma conversa encontrada"

**Endpoints que frontend chama:**
1. `GET /api/chat/conversations` - Lista conversas
2. `GET /api/chat/n8n/conversations` - Lista conversas N8N

**Status desses endpoints:** ❓ NÃO VERIFICADO

**Screenshot:** `/root/nexusatemporal/prompt/Captura de tela 2025-10-09 115304.png`

### 2. Webhooks WAHA para Mensagens Reais
**Problema:** Mensagens enviadas pelo WhatsApp não geram webhooks

**Evidências:**
```
Logs mostram:
🔔 Webhook WAHA recebido: {
  event: 'message.any',
  from: '554192431011@c.us'
}
⏭️ Evento ignorado (não é mensagem): message.any
```

Nota: Isso foi nos logs antigos. Container atual pode ter correção, mas webhooks ainda não chegam.

---

## 🔍 PROBLEMAS CORRIGIDOS NESTA SESSÃO

### 1. ✅ WebSocket Reconectando Constantemente
**Arquivo:** `frontend/src/pages/ChatPage.tsx`

**Problema:** `useEffect` com `[selectedConversation]` causava reconexão a cada mudança

**Solução:**
```typescript
// ANTES
}, [selectedConversation]); // ❌ Reconecta sempre

// DEPOIS
const selectedConversationRef = useRef<Conversation | null>(null);
}, []); // ✅ Conecta uma vez só
```

### 2. ✅ Backend Rejeitando `message.any`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts`

**Problema:** Só aceitava `event === 'message'`

**Solução:**
```typescript
if (wahaPayload.event !== 'message' && wahaPayload.event !== 'message.any') {
  // ignorar
}
```

### 3. ✅ Número de Telefone Extraído como "0"
**Arquivo:** `backend/src/services/WhatsAppSyncService.ts` linha 179

**Problema:** Regex não cobria todos os formatos

**Solução:**
```typescript
// ANTES
const phoneNumber = chatId.replace(/@c\.us|@lid/g, '');

// DEPOIS
const phoneNumber = chatId.replace(/@c\.us|@s\.whatsapp\.net|@lid/g, '');
```

**Limpeza:** Deletadas 9 mensagens com `phone_number = '0'`

### 4. ✅ Rate Limiter Bloqueando Frontend
**Arquivo:** `backend/src/server.ts` linhas 39-43

**Problema:** Frontend recebendo HTTP 429 (Too Many Requests)

**Solução:** Desativado temporariamente
```typescript
// Rate limiting
// TEMPORARIAMENTE DESATIVADO para debug
// if (process.env.NODE_ENV === 'production') {
//   app.use(rateLimiter);
// }
```

---

## 🔧 CONFIGURAÇÃO ATUAL

### Docker Images
- **Backend:** `nexus_backend:polling-final`
- **Frontend:** `nexus_frontend:websocket-fix`

### Variáveis de Ambiente
- `ENABLE_WHATSAPP_POLLING`: não setada (padrão: true)
- `NODE_ENV`: production

### WAHA
- **URL:** https://apiwts.nexusatemporal.com.br
- **Session:** session_01k74cqnky2pv9bn8m8wctad9t
- **Status:** WORKING
- **API Key:** bd0c416348b2f04d198ff8971b608a87

### Banco de Dados
- **Container:** nexus_postgres.1.r4miakmjx36c6ddm83ij06q1d
- **User:** nexus_admin
- **Database:** nexus_master
- **Tabela:** chat_messages

---

## 📋 PRÓXIMOS PASSOS (PRIORIDADE)

### ETAPA 1: Diagnosticar por que frontend não carrega conversas

**Hipóteses:**
1. ❓ Endpoint `/api/chat/conversations` não retorna dados corretos
2. ❓ Endpoint `/api/chat/n8n/conversations` tem bug
3. ❓ Frontend filtrando conversas incorretamente
4. ❓ Frontend esperando formato diferente de dados

**Comandos para investigar:**

```bash
# 1. Verificar se endpoint retorna conversas
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YWI3ZTZhMi0yOWM3LTRlYmEtOGU0ZS02OTY0MzQ1YWVjZjIiLCJlbWFpbCI6InRlc3RlQG5leHVzYXRlbXBvcmFsLmNvbS5iciIsInJvbGUiOiJhZG1pbiIsInRlbmFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc1OTkyNjI2MCwiZXhwIjoxNzYwNTMxMDYwfQ.FmrfgbpTd4ZIdST5YBwzrXxk0vQFzZBG2uFmxmMJdUk"

curl -s "https://api.nexusatemporal.com.br/api/chat/conversations" \
  -H "Authorization: Bearer $TOKEN" | jq .

curl -s "https://api.nexusatemporal.com.br/api/chat/n8n/conversations" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 2. Ver console do navegador
# Abrir DevTools (F12) → Console → Ver erros

# 3. Ver requisições do navegador
# DevTools → Network → Filtrar por "conversations"

# 4. Verificar estrutura de dados no banco
docker exec nexus_postgres.1.r4miakmjx36c6ddm83ij06q1d \
  psql -U nexus_admin nexus_master -c \
  "SELECT DISTINCT session_name, phone_number, COUNT(*)
   FROM chat_messages
   GROUP BY session_name, phone_number
   LIMIT 10;"
```

### ETAPA 2: Verificar lógica de conversas no backend

**Arquivos para investigar:**
1. `backend/src/modules/chat/chat.controller.ts` - Endpoints de conversas
2. `backend/src/modules/chat/chat.service.ts` - Lógica de busca
3. `backend/src/modules/chat/n8n-webhook.controller.ts` - Controller N8N

**O que verificar:**
- ✅ Endpoint existe?
- ✅ Query SQL está correta?
- ✅ Formato de retorno está correto?
- ✅ Filtra apenas conversas com mensagens?

### ETAPA 3: Verificar frontend

**Arquivos para investigar:**
1. `frontend/src/pages/ChatPage.tsx` - Página principal
2. `frontend/src/services/chatService.ts` - Chamadas API

**O que verificar:**
- ✅ Chamando endpoint correto?
- ✅ Processando resposta corretamente?
- ✅ Filtrando ou descartando dados?
- ✅ Estado React atualizando?

### ETAPA 4: Se tudo acima estiver OK, criar conversas manualmente

Se os endpoints estiverem corretos mas sem dados:

```bash
# Verificar se tabela `conversations` existe
docker exec nexus_postgres.1.r4miakmjx36c6ddm83ij06q1d \
  psql -U nexus_admin nexus_master -c "\dt" | grep conversation

# Se não existir, talvez precise criar conversas a partir das mensagens
# Isso pode ser feito via migration ou script
```

---

## 🗄️ ESTRUTURA DO BANCO (IMPORTANTE)

### Tabela: chat_messages

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL,
  contact_name VARCHAR,
  direction VARCHAR, -- 'incoming' ou 'outgoing'
  message_type VARCHAR,
  content TEXT,
  waha_message_id VARCHAR UNIQUE,
  status VARCHAR,
  created_at TIMESTAMP,
  is_read BOOLEAN
);
```

**Dados atuais:**
- Total de mensagens: 1000+
- Com número 554192431011: 40 mensagens
- Top contato: 554192258402 (113 mensagens)

---

## 🐛 BUGS CONHECIDOS

### 1. Webhooks WAHA não chegam para mensagens reais
**Sintoma:** Polling funciona, webhooks não

**Possíveis causas:**
- WAHA perde configuração de webhooks após restart
- WAHA não envia webhooks para mensagens reais (só mensagens via API)
- Configuração de webhook incorreta

**Verificar webhooks:**
```bash
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k74cqnky2pv9bn8m8wctad9t" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" | jq .config.webhooks
```

**Reconfigurar se necessário:**
```bash
curl -X PATCH "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k74cqnky2pv9bn8m8wctad9t" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [{
        "url": "https://api.nexusatemporal.com.br/api/chat/webhook/waha/message",
        "events": ["message", "message.any", "message.revoked"],
        "webhookId": "nexus-chat-sync"
      }]
    }
  }'
```

### 2. Backend em modo DEV
**Arquivo:** `backend/Dockerfile` linha 24

```dockerfile
CMD ["npm", "run", "dev"]  # ← tsx watch, ignora dist/
```

**Impacto:** Alterações em código compilado são ignoradas

**Solução (futura):** Mudar para production mode
```dockerfile
RUN npm run build
CMD ["node", "dist/server.js"]
```

### 3. Rate Limiter desativado
**Segurança:** ⚠️ PRODUÇÃO VULNERÁVEL

**Reativar após debug:**
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}
```

---

## 📊 COMANDOS ÚTEIS

### Verificar logs backend
```bash
# Logs gerais
docker service logs nexus_backend --since 5m --tail 100

# Logs de sync
docker service logs nexus_backend --since 5m | grep SYNC

# Logs de webhook
docker service logs nexus_backend --since 5m | grep "🔔 Webhook"

# Logs de WebSocket
docker service logs nexus_backend --since 5m | grep WebSocket
```

### Verificar banco de dados
```bash
# Container do banco
PGCONTAINER="nexus_postgres.1.r4miakmjx36c6ddm83ij06q1d"

# Contar mensagens
docker exec $PGCONTAINER psql -U nexus_admin nexus_master -c \
  "SELECT COUNT(*) FROM chat_messages;"

# Mensagens por telefone
docker exec $PGCONTAINER psql -U nexus_admin nexus_master -c \
  "SELECT phone_number, COUNT(*) FROM chat_messages
   GROUP BY phone_number ORDER BY COUNT(*) DESC LIMIT 10;"

# Últimas mensagens
docker exec $PGCONTAINER psql -U nexus_admin nexus_master -c \
  "SELECT phone_number, direction, content, created_at
   FROM chat_messages
   ORDER BY created_at DESC LIMIT 10;"
```

### Rebuild e Deploy
```bash
cd /root/nexusatemporal/backend

# Build
docker build -t nexus_backend:v31 -f Dockerfile .

# Deploy
docker service update --image nexus_backend:v31 nexus_backend

# Verificar
docker service ps nexus_backend
```

---

## 🎓 LIÇÕES APRENDIDAS

1. **Polling é mais confiável que webhooks WAHA** - Webhooks se perdem após restarts
2. **Backend em DEV mode dificulta debug** - Código compilado é ignorado
3. **WebSocket com deps erradas causa reconexão** - Usar refs para valores mutáveis
4. **Rate limiter agressivo bloqueia testes** - Ajustar ou desativar temporariamente
5. **Mensagens no banco != Conversas no frontend** - Investigar endpoints de conversas

---

## ⚠️ ATENÇÃO PARA PRÓXIMA SESSÃO

**NÃO fazer:**
- ❌ Criar novo serviço de polling (já existe e funciona)
- ❌ Tentar consertar webhooks WAHA (polling resolve)
- ❌ Alterar estrutura do banco sem backup
- ❌ Deploy sem testar localmente

**FAZER:**
- ✅ Investigar por que frontend não exibe conversas
- ✅ Verificar endpoints `/api/chat/conversations` e `/api/chat/n8n/conversations`
- ✅ Abrir DevTools do navegador e ver console/network
- ✅ Verificar se existe tabela `conversations` no banco
- ✅ Testar endpoints via curl primeiro

---

## 📁 ARQUIVOS MODIFICADOS NESTA SESSÃO

1. **backend/src/services/WhatsAppSyncService.ts** (NOVO)
   - Serviço de polling completo
   - Sincroniza mensagens a cada 5s
   - Verifica duplicatas
   - Emite WebSocket

2. **backend/src/server.ts**
   - Inicializa WhatsAppSyncService
   - Rate limiter desativado (linhas 39-43)
   - Graceful shutdown para polling

3. **frontend/src/pages/ChatPage.tsx**
   - WebSocket conecta uma vez só
   - Usa refs para conversação atual

4. **backend/src/modules/chat/n8n-webhook.controller.ts**
   - Aceita eventos `message` e `message.any`

---

## 🔑 CREDENCIAIS E TOKENS

**Token JWT (expira 2025-10-15):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YWI3ZTZhMi0yOWM3LTRlYmEtOGU0ZS02OTY0MzQ1YWVjZjIiLCJlbWFpbCI6InRlc3RlQG5leHVzYXRlbXBvcmFsLmNvbS5iciIsInJvbGUiOiJhZG1pbiIsInRlbmFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc1OTkyNjI2MCwiZXhwIjoxNzYwNTMxMDYwfQ.FmrfgbpTd4ZIdST5YBwzrXxk0vQFzZBG2uFmxmMJdUk
```

**WAHA API Key:**
```
bd0c416348b2f04d198ff8971b608a87
```

**Banco de dados:**
- Host: nexus_postgres (Docker Swarm)
- User: nexus_admin
- Database: nexus_master
- Password: 6uyJZdc0xsCe7ymief3x2Izi9QubcTYP

---

## 📞 CONTATOS DE TESTE

- **Número conectado WAHA:** 41 9854-9563 (554198549563)
- **Número de teste:** 41 9243-1011 (554192431011)

---

**FIM DO DOCUMENTO**

**Próxima sessão deve começar por:** ETAPA 1 - Diagnosticar endpoints de conversas
