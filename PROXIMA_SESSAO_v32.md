# 📋 GUIA PARA PRÓXIMA SESSÃO - Nexus Atemporal v32

**Data desta sessão:** 2025-10-11 (Madrugada)
**Versão atual:** v32
**Status:** ✅ PRODUÇÃO - FUNCIONANDO 100%
**Última validação:** Usuário confirmou "maravilha funcionou 100% parabens"

---

## ✅ O QUE ESTÁ FUNCIONANDO 100%

### 1. WhatsApp - Envio e Recebimento de Mensagens
- ✅ **Envio:** Sistema → WhatsApp (funcionando perfeitamente)
- ✅ **Recebimento:** WhatsApp → Sistema (funcionando perfeitamente)
- ✅ **Sem duplicação:** Backend ignora evento `message.any`
- ✅ **Sem duplicação visual:** Frontend filtra mensagens outgoing do WebSocket

### 2. Sessão WhatsApp Conectada
- **Nome:** `atemporal_main` (Atemporal Principal)
- **Status:** WORKING
- **Número conectado:** 554192431011 (Atemporal)
- **Engine:** GOWS (Go WhatsApp)
- **Webhook:** Configurado corretamente
  - URL: `https://api.nexusatemporal.com.br/api/chat/webhook/waha/message`
  - Events: `["message", "message.revoked"]` ✅ SEM `message.any`

### 3. Infraestrutura
- ✅ **Backend:** Rodando com correção de duplicação
- ✅ **Frontend:** `nexus_frontend:no-dup-v32` (porta 3000)
- ✅ **Traefik:** Configurado para porta 3000
- ✅ **URLs acessíveis:**
  - Frontend: https://one.nexusatemporal.com.br (HTTP 200)
  - Backend: https://api.nexusatemporal.com.br (HTTP 200)
  - WAHA: https://apiwts.nexusatemporal.com.br (HTTP 200)

---

## 🔧 CORREÇÕES APLICADAS NA v32

### Problema 1: Mensagens Recebidas Duplicadas no Banco
**O que era:** Cada mensagem aparecia 2 vezes no banco de dados

**Causa:**
- Webhook com eventos `["message", "message.any", "message.revoked"]`
- Backend processava AMBOS `message` e `message.any`
- Resultado: 2 INSERTs por mensagem

**Correção:**
```typescript
// backend/src/modules/chat/n8n-webhook.controller.ts (linha 490)
// ANTES
if (wahaPayload.event !== 'message' && wahaPayload.event !== 'message.any')

// DEPOIS
if (wahaPayload.event !== 'message')
```

**Webhook reconfigurado:**
```json
{
  "events": ["message", "message.revoked"]  // ✅ Removido message.any
}
```

---

### Problema 2: Mensagens Enviadas Duplicadas Visualmente
**O que era:** Mensagem enviada aparecia 2 vezes na tela (mas só 1 vez no banco)

**Causa:**
- Frontend adicionava mensagem localmente ao enviar
- Backend emitia via WebSocket
- Frontend recebia WebSocket e adicionava novamente

**Correção:**
```typescript
// frontend/src/pages/ChatPage.tsx (linha 89-93)
socketInstance.on('chat:new-message', (whatsappMessage: any) => {
  // IMPORTANTE: Ignorar mensagens OUTGOING do WebSocket
  if (whatsappMessage.direction === 'outgoing') {
    return;  // Já foi adicionada localmente
  }
  // Processar apenas INCOMING...
});
```

---

### Problema 3: Bad Gateway 502 no Frontend
**O que era:** Frontend retornava erro 502 após deploy

**Causa:**
- Traefik configurado para porta 80
- Vite dev server roda na porta 3000

**Correção:**
```bash
docker service update \
  --label-add "traefik.http.services.nexusfrontend.loadbalancer.server.port=3000" \
  nexus_frontend
```

---

## 🗄️ ESTADO DO BANCO DE DADOS

### Tabela: whatsapp_sessions
```sql
SELECT session_name, friendly_name, status FROM whatsapp_sessions;

-- Resultado esperado:
-- session_name: atemporal_main
-- friendly_name: Atemporal Principal
-- status: WORKING
```

### Tabela: chat_messages
- Mensagens sem duplicação
- Cada mensagem tem `waha_message_id` único
- Campos: `id`, `session_name`, `phone_number`, `direction`, `content`, `created_at`

**Comando de verificação:**
```bash
docker exec nexus_postgres.1.xxx psql -U nexus_admin -d nexus_master \
  -c "SELECT id, direction, LEFT(content, 30), created_at FROM chat_messages ORDER BY created_at DESC LIMIT 10;"
```

---

## 📦 BACKUPS REALIZADOS

### Banco de Dados
```bash
# Arquivo local
/tmp/nexus_backup_v32_fix-duplicacao_20251011_010236.sql (64KB)

# iDrive e2
s3://backupsistemaonenexus/backups/database/nexus_backup_v32_fix-duplicacao_20251011_010236.sql
Status: ✅ Uploaded (2025-10-11 01:02)
```

### Git/GitHub
```bash
Commit 1: bd2a351 - "fix: Corrige duplicação de mensagens WhatsApp (v32)"
Commit 2: 6a674a1 - "docs: Atualiza CHANGELOG com correções v32"
Branch: main
Status: ✅ Pushed
```

---

## 🔍 COMANDOS ÚTEIS DE DIAGNÓSTICO

### Verificar Status Geral
```bash
# 1. Sessão WhatsApp
curl -s "https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k | python3 -m json.tool | grep -E "status|webhooks" -A 5

# 2. Mensagens no banco (últimas 10)
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT id, direction, LEFT(content, 30), created_at FROM chat_messages ORDER BY created_at DESC LIMIT 10;"

# 3. Logs do backend (webhooks)
docker service logs nexus_backend --tail 50 2>&1 | grep -E "Webhook WAHA|Evento ignorado"

# 4. Frontend status
curl -I https://one.nexusatemporal.com.br

# 5. Verificar porta Traefik
docker service inspect nexus_frontend --format '{{json .Spec.Labels}}' | python3 -m json.tool | grep port
```

---

## 🚨 SE ALGO DER ERRADO

### Problema: Mensagens duplicando novamente no banco

**Diagnóstico:**
```bash
# Ver eventos webhook nos logs
docker service logs nexus_backend --tail 100 | grep "Webhook WAHA"

# Verificar se message.any está sendo processado
docker service logs nexus_backend | grep "message.any"
```

**Solução:**
- Se aparecer "Evento ignorado: message.any" = ✅ Funcionando
- Se NÃO aparecer essa linha = ❌ Código foi revertido, reaplicar correção

**Reaplicar correção:**
```bash
# 1. Verificar código
docker exec $(docker ps -q -f name=nexus_backend) \
  grep -A 2 "Filtrar apenas eventos de mensagem" \
  /app/src/modules/chat/n8n-webhook.controller.ts

# 2. Se estiver errado, corrigir
docker exec $(docker ps -q -f name=nexus_backend) \
  sed -i "s/wahaPayload.event !== 'message' && wahaPayload.event !== 'message.any'/wahaPayload.event !== 'message'/g" \
  /app/src/modules/chat/n8n-webhook.controller.ts

# 3. Reiniciar backend
docker service update --force nexus_backend
```

---

### Problema: Mensagens enviadas duplicando visualmente

**Diagnóstico:**
```bash
# Abrir console do navegador (F12)
# Enviar mensagem
# Procurar por: "Mensagem outgoing ignorada"
```

**Solução:**
- Se aparecer "ignorada" = ✅ Funcionando
- Se NÃO aparecer = ❌ Frontend desatualizado

**Reaplicar correção:**
```bash
# 1. Verificar código frontend
grep -A 5 "IMPORTANTE: Ignorar mensagens OUTGOING" \
  /root/nexusatemporal/frontend/src/pages/ChatPage.tsx

# 2. Se estiver errado, corrigir manualmente e rebuild
cd /root/nexusatemporal/frontend
npm run build
docker build -t nexus_frontend:fix -f Dockerfile .
docker service update --image nexus_frontend:fix nexus_frontend
```

---

### Problema: Frontend retornando 502 Bad Gateway

**Diagnóstico:**
```bash
# 1. Container rodando?
docker ps -f name=nexus_frontend

# 2. Vite respondendo na porta 3000?
docker exec $(docker ps -q -f name=nexus_frontend) netstat -tlnp | grep 3000

# 3. Traefik configurado para porta correta?
docker service inspect nexus_frontend --format '{{json .Spec.Labels}}' | grep port
```

**Solução:**
```bash
# Se porta estiver errada (80 ao invés de 3000):
docker service update \
  --label-add "traefik.http.services.nexusfrontend.loadbalancer.server.port=3000" \
  nexus_frontend

# Aguardar 10 segundos e testar
sleep 10
curl -I https://one.nexusatemporal.com.br
```

---

### Problema: Sessão WhatsApp desconectou

**Diagnóstico:**
```bash
curl -s "https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k | python3 -m json.tool | grep status
```

**Status possíveis:**
- `WORKING` = ✅ Conectada
- `SCAN_QR_CODE` = ⚠️ Esperando reconexão
- `STOPPED` = ❌ Parada
- `FAILED` = ❌ Falhou

**Solução para reconectar:**
```bash
# 1. Se STOPPED ou FAILED, reiniciar:
curl -X POST "https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main/start" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k

# 2. Atualizar banco
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "UPDATE whatsapp_sessions SET status = 'SCAN_QR_CODE' WHERE session_name = 'atemporal_main';"

# 3. Usuário precisa acessar frontend e reconectar:
# - Ir em https://one.nexusatemporal.com.br/chat
# - Clicar em "Conectar WhatsApp"
# - Clicar em "Reconectar" na sessão "Atemporal Principal"
# - Escanear QR Code
```

---

## 🎯 PRÓXIMAS FUNCIONALIDADES SUGERIDAS

### 1. Sistema de Sincronização de Mensagens Históricas
**Objetivo:** Buscar mensagens antigas do WhatsApp ao abrir uma conversa

**Implementação:**
- Endpoint: `GET /api/sessions/{session}/chats/{chatId}/messages?limit=50`
- Sincronizar apenas quando usuário abrir conversa
- Armazenar no banco para histórico

**Arquivos a modificar:**
- `backend/src/modules/chat/waha-session.service.ts` (novo método)
- `frontend/src/pages/ChatPage.tsx` (chamar ao abrir conversa)

---

### 2. Notificações Push via WebSocket
**Objetivo:** Notificar usuário quando receber mensagem em conversa não aberta

**Implementação:**
- Frontend já escuta `chat:new-message`
- Adicionar toast/notificação visual
- Badge com contador de não lidas

**Arquivos a modificar:**
- `frontend/src/pages/ChatPage.tsx` (linha 115-117)

---

### 3. Envio de Mídia (Imagens, Documentos, Áudio)
**Objetivo:** Permitir envio de arquivos além de texto

**Implementação:**
- Upload para storage (S3 ou local)
- Endpoint WAHA: `POST /api/sendFile`
- Interface de upload no frontend

**Arquivos a criar:**
- `backend/src/modules/chat/media-upload.service.ts`
- `frontend/src/components/chat/MediaUpload.tsx`

---

### 4. Respostas Rápidas Personalizadas
**Objetivo:** Usuário criar templates de respostas

**Implementação:**
- CRUD de quick replies
- Variáveis dinâmicas (ex: {{nome}}, {{hora}})
- Interface de gerenciamento

**Arquivos a criar:**
- `backend/src/modules/chat/quick-reply.entity.ts`
- `backend/src/modules/chat/quick-reply.controller.ts`

---

### 5. Dashboard de Métricas WhatsApp
**Objetivo:** Visualizar estatísticas de uso

**Métricas:**
- Mensagens enviadas/recebidas (dia/semana/mês)
- Tempo médio de resposta
- Conversas ativas
- Taxa de resposta

**Arquivos a criar:**
- `backend/src/modules/chat/analytics.service.ts`
- `frontend/src/pages/ChatAnalytics.tsx`

---

## 📚 DOCUMENTAÇÃO IMPORTANTE

### Arquitetura do Sistema de Chat

```
┌─────────────┐
│  WhatsApp   │
│   (User)    │
└──────┬──────┘
       │ 1. Envia mensagem
       ↓
┌─────────────┐
│    WAHA     │ Webhook: message, message.revoked
│  (Gateway)  │
└──────┬──────┘
       │ 2. Dispara webhook
       ↓
┌─────────────────────────────────────┐
│ Backend (Node.js + NestJS)          │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ n8n-webhook.controller.ts   │   │
│ │ - Recebe webhook            │   │
│ │ - Filtra apenas 'message'   │ ← CORREÇÃO v32
│ │ - Salva no PostgreSQL       │   │
│ │ - Emite via WebSocket       │   │
│ └─────────────────────────────┘   │
│                                     │
└──────┬──────────────────────────────┘
       │ 3. Emite evento WebSocket
       ↓
┌─────────────────────────────────────┐
│ Frontend (React + Vite)             │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ ChatPage.tsx                │   │
│ │ - Escuta WebSocket          │   │
│ │ - Filtra outgoing messages  │ ← CORREÇÃO v32
│ │ - Atualiza UI apenas INCOMING│   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Fluxo de Envio de Mensagem

```
1. Usuário digita mensagem no frontend
   ↓
2. Frontend adiciona mensagem localmente (setMessages)
   ↓
3. Frontend chama backend: POST /api/chat/n8n/send-message
   ↓
4. Backend envia para WAHA: POST /api/sendText
   ↓
5. Backend salva no PostgreSQL
   ↓
6. Backend emite WebSocket: chat:new-message (direction: outgoing)
   ↓
7. Frontend recebe WebSocket MAS IGNORA (já adicionou localmente) ← v32
   ↓
8. WAHA envia para WhatsApp
   ↓
9. WhatsApp entrega para destinatário
```

### Fluxo de Recebimento de Mensagem

```
1. WhatsApp recebe mensagem do usuário
   ↓
2. WAHA recebe via WhatsApp Web
   ↓
3. WAHA dispara webhook: POST /api/chat/webhook/waha/message
   - Evento: "message"
   ↓
4. Backend processa webhook (n8n-webhook.controller.ts)
   - Verifica event === 'message' ← v32 (ignora message.any)
   - Salva no PostgreSQL
   - Emite WebSocket: chat:new-message (direction: incoming)
   ↓
5. Frontend recebe WebSocket
   - Verifica direction !== 'outgoing' ← v32
   - Adiciona mensagem na UI
   ↓
6. Usuário vê mensagem no frontend
```

---

## 🔐 CREDENCIAIS E CONFIGURAÇÕES

### WAHA API
```bash
URL: https://apiwts.nexusatemporal.com.br
API Key: bd0c416348b2f04d198ff8971b608a87
Sessão Ativa: atemporal_main
```

### PostgreSQL
```bash
Host: localhost (via Docker)
Port: 5432
Database: nexus_master
User: nexus_admin
Container: nexus_postgres.1.xxx
```

### iDrive e2 (Backup)
```bash
Endpoint: https://o0m5.va.idrivee2-26.com
Bucket: backupsistemaonenexus
Path: /backups/database/
Access Key: qFzk5gw00zfSRvj5BQwm
Secret Key: (ver variável de ambiente)
```

### GitHub
```bash
Repo: https://github.com/Magdiel-caim/nexusatemporal.git
Branch: main
Último Commit: 6a674a1
```

---

## ✅ CHECKLIST DE INÍCIO DE SESSÃO

Antes de começar qualquer modificação, sempre verificar:

- [ ] Frontend está acessível (https://one.nexusatemporal.com.br)
- [ ] Backend está respondendo (curl https://api.nexusatemporal.com.br/health)
- [ ] Sessão WhatsApp está WORKING
- [ ] Mensagens NÃO estão duplicando (verificar banco)
- [ ] Logs do backend não mostram erros críticos
- [ ] Git status está limpo ou entender modificações pendentes

**Comandos rápidos:**
```bash
# Status geral
curl -I https://one.nexusatemporal.com.br && \
curl -I https://api.nexusatemporal.com.br && \
curl -s https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k | grep -o '"status":"[^"]*"'

# Git status
cd /root/nexusatemporal && git status --short
```

---

## 📝 NOTAS FINAIS

### O que NÃO FAZER

❌ **NÃO** adicionar evento `message.any` ao webhook novamente
❌ **NÃO** remover filtro de `direction === 'outgoing'` no frontend
❌ **NÃO** mudar porta do Traefik de volta para 80
❌ **NÃO** deletar tabela `whatsapp_sessions` sem backup
❌ **NÃO** fazer deploy sem testar localmente primeiro

### O que SEMPRE FAZER

✅ **SEMPRE** verificar logs após deploy
✅ **SEMPRE** fazer backup antes de modificar banco
✅ **SEMPRE** commitar código antes de testar em produção
✅ **SEMPRE** validar webhook está com eventos corretos
✅ **SEMPRE** pedir confirmação do usuário após correções

---

**Criado em:** 2025-10-11 01:05 UTC
**Versão do Sistema:** v32
**Status:** ✅ PRODUÇÃO - FUNCIONANDO 100%

🚀 **Sistema pronto para continuar desenvolvimento!**
