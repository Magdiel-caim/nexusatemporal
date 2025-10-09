# 📋 CHANGELOG - Nexus Atemporal CRM

## 🔄 SESSÃO: 2025-10-08/09 - Integração WhatsApp via N8N + WAHA

---

## 📝 RESUMO EXECUTIVO

**Objetivo:** Implementar integração completa do WhatsApp usando N8N como middleware e WAHA como API do WhatsApp.

**Status Final:** ✅ **FUNCIONANDO** - QR Code aparecendo e WhatsApp conectando com sucesso!

**Versão:** v30.3

**Commits:**
- Commit principal: `26e61d8` - "feat: Integração completa WhatsApp via N8N + WAHA (v30.3)"
- Tag: `v30.3` - "WhatsApp Integration via N8N + WAHA - QR Code Working"

---

## 🎯 O QUE FOI IMPLEMENTADO (FUNCIONANDO)

### 1. Workflow N8N Simplificado ✅
- **Arquivo:** `n8n-workflows/n8n_workflow_1_criar_sessao_SIMPLES.json`
- **URL Webhook:** `https://workflow.nexusatemporal.com/webhook/waha-create-session-v2`
- **Nós:** 4 (Webhook → Criar Sessão → Iniciar Sessão → Responder)
- **Engine:** GOWS (GO-based, mais rápido que WEBJS/NOWEB)
- **Retorno:** JSON com `sessionName` e `qrCodeUrl`

### 2. Backend - QR Code Proxy com Retry Logic ✅
- **Endpoint:** `GET /api/chat/whatsapp/qrcode-proxy?session={sessionName}`
- **Arquivo:** `backend/src/modules/chat/chat.controller.ts` (linhas 282-350)
- **Funcionalidade:**
  - Busca QR Code do WAHA com header `X-Api-Key`
  - Retry: 5 tentativas com 2 segundos de intervalo
  - Retorna imagem JPEG
- **Por que precisa de retry?** WAHA demora 2-4 segundos para gerar QR Code após criar sessão

### 3. Backend - N8N Webhook Controller ✅
- **Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts`
- **Endpoint:** `POST /api/chat/webhook/n8n/message`
- **Funcionalidade:** Recebe mensagens do N8N e salva no PostgreSQL
- **Tabela:** `chat_messages` (criada via SQL direto)

### 4. Frontend - Fetch + Blob URL ✅
- **Arquivo:** `frontend/src/components/chat/WhatsAppConnectionPanel.tsx` (linhas 98-125)
- **Funcionalidade:**
  - Usa `fetch()` com header `Authorization: Bearer {token}`
  - Converte resposta em Blob
  - Cria Blob URL: `blob:https://one.nexusatemporal.com.br/abc-123`
  - Exibe em `<img src="blob:...">`
  - Cleanup automático com `URL.revokeObjectURL()`

### 5. Rate Limiter Ajustado ✅
- **Arquivo:** `backend/src/shared/middleware/rate-limiter.ts`
- **Limites:**
  - Geral: 100 → **1000 requests/15min**
  - Login: 5 → **20 tentativas/15min**

---

## ❌ PROBLEMAS ENCONTRADOS E SOLUÇÕES

### ❌ PROBLEMA 1: Workflow N8N Travando

**Erro:**
```
Workflow executions: Finished: False
Travava no nó "Aguardar 3s" (Wait node)
```

**Causa:**
- Nó "Wait" com webhook precisa de configuração especial
- Estava causando timeout e não completava execução

**Solução:** ✅
- Criado workflow SIMPLIFICADO sem nó Wait
- Removido nó "Obter QR Code" (não precisa)
- Retorna URL direta do QR Code
- Workflow reduzido: 6 nós → 4 nós

**Arquivos:**
- ❌ Antigo: `n8n-workflows/n8n_workflow_1_criar_sessao.json` (com Wait)
- ✅ Novo: `n8n-workflows/n8n_workflow_1_criar_sessao_SIMPLES.json` (sem Wait)

---

### ❌ PROBLEMA 2: QR Code Não Aparecia (Tag `<img>` Não Envia Headers)

**Erro:**
```
Frontend mostrava: "QR Code Gerado!"
Mas imagem não carregava (ícone quebrado)
```

**Causa:**
- Tag HTML `<img src="...">` NÃO envia headers HTTP customizados
- URL do WAHA precisa do header `X-Api-Key`
- Frontend tentava: `<img src="https://apiwts.../api/screenshot?session=...&api_key=...">`
- WAHA retornava HTTP 422 (api_key no query string não funciona)

**Tentativas que NÃO funcionaram:**
1. ❌ URL direta do WAHA com `api_key` no query string
2. ❌ Proxy do backend mas usando `<img src>` direto (não envia Authorization header)

**Solução Final:** ✅
```typescript
// 1. Fetch com Authorization header
const qrResponse = await fetch(qrCodeProxyUrl, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Converter para Blob
const qrBlob = await qrResponse.blob();

// 3. Criar Blob URL (local no navegador)
const qrBlobUrl = URL.createObjectURL(qrBlob);
// Exemplo: "blob:https://one.nexusatemporal.com.br/abc-123-def"

// 4. Usar no <img>
<img src={qrBlobUrl} />

// 5. Cleanup quando não precisar mais
URL.revokeObjectURL(qrBlobUrl);
```

**Arquivos modificados:**
- `frontend/src/components/chat/WhatsAppConnectionPanel.tsx` (linhas 98-125, 177-187)
- `backend/src/modules/chat/chat.controller.ts` (método `getQRCodeProxy`)
- `backend/src/modules/chat/chat.routes.ts` (rota `/whatsapp/qrcode-proxy`)

---

### ❌ PROBLEMA 3: WAHA Retorna HTTP 422 (QR Code Não Pronto)

**Erro:**
```
[QR Proxy] WAHA response status: 422
```

**Causa:**
- WAHA demora ~2-4 segundos para gerar QR Code após criar sessão
- Backend tentava buscar imediatamente
- WAHA retornava 422 (Unprocessable Entity) = "QR Code ainda não está pronto"

**Solução:** ✅ Retry Logic no Backend
```typescript
const maxRetries = 5; // 5 tentativas
const retryDelay = 2000; // 2 segundos entre tentativas

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const response = await fetch(wahaUrl, {
    headers: { 'X-Api-Key': wahaApiKey }
  });

  if (response.ok) {
    // Sucesso! Retorna imagem
    return imageBuffer;
  }

  if (response.status === 422 && attempt < maxRetries) {
    // QR não pronto, espera 2s e tenta novamente
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    continue;
  }
}
```

**Fluxo:**
1. Tentativa 1 → 422 → Espera 2s
2. Tentativa 2 → 422 → Espera 2s
3. Tentativa 3 → 200 → Retorna QR Code ✅

**Arquivo:** `backend/src/modules/chat/chat.controller.ts` (linhas 296-344)

---

### ❌ PROBLEMA 4: Rate Limiter Bloqueando Login

**Erro:**
```
POST /api/auth/login HTTP/1.1" 429 55
"Too many requests from this IP, please try again later."
```

**Causa:**
- Durante testes, fizemos muitas requisições
- Rate limiter muito restritivo:
  - 100 requests/15min (geral)
  - 5 tentativas de login/15min
- Ultrapassamos limites durante desenvolvimento

**Solução:** ✅ Aumentar Limites
```typescript
// ANTES (muito restritivo)
max: 100, // requests/15min
authMax: 5, // login attempts/15min

// DEPOIS (mais razoável)
max: 1000, // requests/15min
authMax: 20, // login attempts/15min
```

**Arquivo:** `backend/src/shared/middleware/rate-limiter.ts`

---

### ❌ PROBLEMA 5: Código Atualizado Não Carregava no Container

**Erro:**
- Logs `[QR Proxy]` não apareciam
- Método `getQRCodeProxy` não executava
- Container rodando código antigo

**Causa:**
- Docker Swarm não recriava container mesmo com `docker service update`
- Container antigo continuava rodando

**Solução:** ✅
```bash
# Forçar rebuild da imagem
docker build -t nexus_backend:latest -f backend/Dockerfile backend/

# Forçar restart do serviço
docker service update nexus_backend --image nexus_backend:latest --force

# Verificar novo container
docker ps -q -f name=nexus_backend
docker exec {container_id} grep "maxRetries" /app/src/modules/chat/chat.controller.ts
```

---

## 🔄 FLUXO COMPLETO FUNCIONANDO

```
1. Usuario clica "Conectar WhatsApp" no frontend
   ↓
2. Frontend → N8N Webhook
   POST https://workflow.nexusatemporal.com/webhook/waha-create-session-v2
   Body: { "sessionName": "atendimento" }
   ↓
3. N8N Nó 1: Criar Sessão WAHA
   POST https://apiwts.nexusatemporal.com.br/api/sessions
   Headers: X-Api-Key: bd0c416348b2f04d198ff8971b608a87
   Body: { "name": "session_01k...", "config": { "engine": "GOWS" } }
   ↓
4. N8N Nó 2: Iniciar Sessão
   POST https://apiwts.nexusatemporal.com.br/api/sessions/{name}/start
   ↓
5. N8N Nó 3: Responder Webhook
   Retorna: {
     "success": true,
     "sessionName": "session_01k...",
     "status": "SCAN_QR_CODE",
     "qrCodeUrl": "https://apiwts.../api/screenshot?session=...&screenshotType=qr&api_key=..."
   }
   ↓
6. Frontend recebe resposta N8N
   Extrai: sessionName = "session_01k..."
   ↓
7. Frontend → Backend Proxy (com retry)
   GET https://api.nexusatemporal.com.br/api/chat/whatsapp/qrcode-proxy?session=session_01k...
   Headers: Authorization: Bearer {token}
   ↓
8. Backend tenta buscar QR Code (retry logic)
   Tentativa 1: WAHA retorna 422 (não pronto) → Espera 2s
   Tentativa 2: WAHA retorna 422 (não pronto) → Espera 2s
   Tentativa 3: WAHA retorna 200 (pronto!) → Retorna JPEG
   ↓
9. Frontend recebe imagem JPEG
   Converte para Blob: await response.blob()
   Cria Blob URL: URL.createObjectURL(blob)
   ↓
10. Frontend exibe QR Code
    <img src="blob:https://one.nexusatemporal.com.br/abc-123" />
    ✅ QR CODE APARECE!
    ↓
11. Usuario escaneia QR Code com WhatsApp
    ↓
12. WAHA detecta conexão
    Status muda: SCAN_QR_CODE → WORKING
    ↓
13. WhatsApp Conectado! 🎉
```

---

## 📁 ARQUIVOS MODIFICADOS NESTA SESSÃO

### Backend:
```
✅ backend/src/modules/chat/chat.controller.ts (método getQRCodeProxy)
✅ backend/src/modules/chat/chat.routes.ts (rota /whatsapp/qrcode-proxy)
✅ backend/src/modules/chat/n8n-webhook.controller.ts (NOVO)
✅ backend/src/modules/chat/n8n-webhook.routes.ts (NOVO)
✅ backend/src/shared/middleware/rate-limiter.ts (limites aumentados)
```

### Frontend:
```
✅ frontend/src/components/chat/WhatsAppConnectionPanel.tsx
   - Linha 81: URL do webhook (-v2)
   - Linhas 98-125: Fetch + Blob URL logic
   - Linhas 177-187: Cleanup de Blob URLs
```

### N8N Workflows:
```
✅ n8n-workflows/n8n_workflow_1_criar_sessao_SIMPLES.json (NOVO - SEM WAIT)
✅ n8n-workflows/n8n_workflow_2_receber_mensagens.json
✅ n8n-workflows/n8n_workflow_3_enviar_mensagens.json
```

### Documentação:
```
✅ n8n-workflows/SOLUCAO_DEFINITIVA.md
✅ n8n-workflows/SOLUCAO_FINAL_QR_CODE.md
✅ n8n-workflows/CORRECAO_QR_CODE_PROXY.md
✅ n8n-workflows/CORRECAO_RATE_LIMITER.md
✅ prompt/PLANO_INTEGRACAO_WAHA.md
✅ CHANGELOG.md (ESTE ARQUIVO)
```

---

## 🔑 CREDENCIAIS E URLS IMPORTANTES

### WAHA API:
- **URL:** `https://apiwts.nexusatemporal.com.br`
- **API Key:** `bd0c416348b2f04d198ff8971b608a87`
- **Engine:** GOWS (GO-based)
- **Endpoints:**
  - Criar sessão: `POST /api/sessions`
  - Iniciar: `POST /api/sessions/{name}/start`
  - QR Code: `GET /api/screenshot?session={name}&screenshotType=qr`
  - Status: `GET /api/sessions/{name}`

### N8N:
- **URL:** `https://workflow.nexusatemporal.com`
- **Webhook Criar Sessão:** `https://workflow.nexusatemporal.com/webhook/waha-create-session-v2`
- **Workflow ID:** (importar JSON do arquivo)

### Frontend:
- **URL:** `https://one.nexusatemporal.com.br`
- **Login:** `teste@nexusatemporal.com.br` / `123456`

### Backend API:
- **URL:** `https://api.nexusatemporal.com.br`
- **QR Proxy:** `GET /api/chat/whatsapp/qrcode-proxy?session={sessionName}`

---

## 🧪 COMO TESTAR

### Teste Completo do Fluxo:

1. **Acesse o sistema:**
   ```
   URL: https://one.nexusatemporal.com.br
   Login: teste@nexusatemporal.com.br
   Senha: 123456
   ```

2. **Navegue até Chat:**
   - Menu lateral → Chat
   - Clique em "Conectar WhatsApp"

3. **Crie conexão:**
   - Digite qualquer nome (ex: "atendimento")
   - Clique "Conectar WhatsApp"
   - Aguarde 4-6 segundos (tempo do retry)

4. **Verifique:**
   - ✅ Deve aparecer: "QR Code Gerado!"
   - ✅ Imagem do QR Code deve aparecer
   - ✅ QR Code é escaneável

5. **Escaneie com WhatsApp:**
   - Abra WhatsApp no celular
   - Configurações → Aparelhos conectados
   - Conectar um aparelho
   - Escaneie o QR Code
   - ✅ Deve conectar!

### Teste Manual dos Endpoints:

```bash
# 1. Criar sessão via N8N
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-create-session-v2" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"teste_manual"}'
# Deve retornar: { "success": true, "sessionName": "session_...", "qrCodeUrl": "..." }

# 2. Buscar QR Code via WAHA direto (com API Key)
curl -s "https://apiwts.nexusatemporal.com.br/api/screenshot?session=session_01k...&screenshotType=qr" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k -o qrcode.png
# Deve baixar: qrcode.png (imagem JPEG ou PNG)

# 3. Buscar via Proxy Backend (precisa de token)
TOKEN="eyJhbGc..." # Token JWT obtido no login
curl "https://api.nexusatemporal.com.br/api/chat/whatsapp/qrcode-proxy?session=session_01k..." \
  -H "Authorization: Bearer $TOKEN" \
  -k -o qrcode_via_proxy.jpeg
# Deve baixar: qrcode_via_proxy.jpeg
```

---

## 🐛 DEBUG: Como Ver Logs

### Backend Logs (QR Proxy):
```bash
# Ver logs do backend em tempo real
docker logs $(docker ps -q -f name=nexus_backend) -f

# Filtrar logs do QR Proxy
docker logs $(docker ps -q -f name=nexus_backend) --tail 100 | grep "\[QR Proxy\]"

# Exemplo de saída esperada:
# [QR Proxy] Request received: { session: 'session_01k...' }
# [QR Proxy] Attempt 1/5 - Fetching from WAHA: https://apiwts...
# [QR Proxy] Attempt 1/5 - WAHA response status: 422
# [QR Proxy] QR Code not ready yet (422), waiting 2000ms before retry 2...
# [QR Proxy] Attempt 2/5 - Fetching from WAHA: https://apiwts...
# [QR Proxy] Attempt 2/5 - WAHA response status: 200
# [QR Proxy] Image buffer size: 4815
# [QR Proxy] Image sent successfully
```

### N8N Workflow Logs:
```
1. Acesse: https://workflow.nexusatemporal.com
2. Login com credenciais do N8N
3. Abra workflow "WAHA - Criar Sessão SIMPLES"
4. Clique em "Executions" (canto superior direito)
5. Veja execuções recentes:
   - ✅ Verde = Sucesso
   - ❌ Vermelho = Erro
   - ⏸️ Cinza = Aguardando
6. Clique em uma execução para ver detalhes de cada nó
```

### Frontend Console (F12):
```javascript
// Abra DevTools (F12) → Console
// Procure por:
console.log('N8N Response:', n8nData);
// Deve mostrar: { success: true, sessionName: "session_...", ... }

// Procure por requisições em Network (F12 → Network):
// POST waha-create-session-v2 → Status 200
// GET qrcode-proxy?session=... → Status 200 (Content-Type: image/jpeg)
```

---

## 🚨 PROBLEMAS CONHECIDOS E WORKAROUNDS

### 1. Rate Limiter Bloqueando Durante Desenvolvimento
**Sintoma:** HTTP 429 "Too many requests"
**Workaround:**
```bash
# Opção 1: Esperar 15 minutos para resetar contador
# Opção 2: Desabilitar rate limiter temporariamente
# backend/src/server.ts linha 40-42:
# if (process.env.NODE_ENV === 'production') {
#   app.use(rateLimiter);  // ← Comentar esta linha
# }

# Opção 3: Aumentar ainda mais os limites (já feito: 1000 req/15min)
```

### 2. Container Docker Não Atualiza Código
**Sintoma:** Mudanças no código não aparecem
**Workaround:**
```bash
# Rebuild forçado
docker build -t nexus_backend:latest -f backend/Dockerfile backend/
docker service update nexus_backend --image nexus_backend:latest --force

# Verificar se código novo está no container
CONTAINER_ID=$(docker ps -q -f name=nexus_backend)
docker exec $CONTAINER_ID grep "algum_texto_do_codigo_novo" /app/src/...
```

### 3. QR Code Demora Muito (mais de 10 segundos)
**Sintoma:** Loading infinito
**Causa Provável:** WAHA pode estar lento ou sessão travada
**Workaround:**
```bash
# Verificar status da sessão no WAHA
curl "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k.../status" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k

# Se status = FAILED, deletar e criar nova
curl -X DELETE "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k..." \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k
```

---

## 📋 PRÓXIMOS PASSOS (PARA FUTURAS SESSÕES)

### Funcionalidades Pendentes:

1. **Receber Mensagens do WhatsApp:**
   - ✅ Workflow N8N criado (`n8n_workflow_2_receber_mensagens.json`)
   - ⏳ Pendente: Configurar webhook no WAHA apontando para N8N
   - ⏳ Pendente: Testar recebimento de mensagens
   - ⏳ Pendente: Exibir mensagens no frontend

2. **Enviar Mensagens para WhatsApp:**
   - ✅ Workflow N8N criado (`n8n_workflow_3_enviar_mensagens.json`)
   - ⏳ Pendente: Integrar com UI do chat
   - ⏳ Pendente: Testar envio de texto, imagem, áudio

3. **Persistência de Conversas:**
   - ✅ Tabela `chat_messages` criada
   - ⏳ Pendente: Criar relacionamento com `leads`
   - ⏳ Pendente: Histórico completo de conversas

4. **Monitoramento de Conexão:**
   - ⏳ Pendente: Webhook de status do WAHA
   - ⏳ Pendente: Reconectar automaticamente se cair
   - ⏳ Pendente: Notificar usuário se desconectar

5. **Múltiplas Sessões:**
   - ⏳ Pendente: Permitir múltiplos WhatsApp conectados
   - ⏳ Pendente: Seletor de sessão na UI
   - ⏳ Pendente: Gerenciamento de sessões ativas

---

## 💡 DICAS PARA PRÓXIMA SESSÃO

### Ao Abrir Nova Sessão do Claude Code:

1. **Leia este arquivo primeiro:**
   ```
   cat /root/nexusatemporal/CHANGELOG.md
   ```

2. **Verifique status atual:**
   ```bash
   # Serviços rodando
   docker service ls

   # Último commit
   git log -1 --oneline

   # Branch atual
   git branch
   ```

3. **Se precisar debugar:**
   ```bash
   # Logs backend
   docker logs $(docker ps -q -f name=nexus_backend) --tail 50

   # Logs frontend
   docker logs $(docker ps -q -f name=nexus_frontend) --tail 50
   ```

4. **Referência rápida de arquivos importantes:**
   ```
   Backend QR Proxy: backend/src/modules/chat/chat.controller.ts (linha 282)
   Frontend WhatsApp: frontend/src/components/chat/WhatsAppConnectionPanel.tsx (linha 98)
   Workflow N8N: n8n-workflows/n8n_workflow_1_criar_sessao_SIMPLES.json
   Rate Limiter: backend/src/shared/middleware/rate-limiter.ts
   ```

---

## 🎯 CONTEXTO COMPLETO PARA IA

**Quando iniciar nova sessão, esta é a situação:**

### Sistema Atual:
- ✅ Frontend React rodando em: `https://one.nexusatemporal.com.br`
- ✅ Backend Node.js rodando em: `https://api.nexusatemporal.com.br`
- ✅ N8N rodando em: `https://workflow.nexusatemporal.com`
- ✅ WAHA rodando em: `https://apiwts.nexusatemporal.com.br`
- ✅ Todos em Docker Swarm
- ✅ SSL via Traefik com Let's Encrypt

### Integração WhatsApp:
- ✅ **FUNCIONANDO:** Criar sessão + Exibir QR Code
- ⏳ **PENDENTE:** Receber mensagens
- ⏳ **PENDENTE:** Enviar mensagens
- ⏳ **PENDENTE:** Histórico de conversas

### Stack Tecnológica:
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + NestJS + TypeORM + PostgreSQL
- Middleware: N8N (workflows de automação)
- WhatsApp API: WAHA (engine GOWS)
- Infra: Docker Swarm + Traefik + PostgreSQL 16 + Redis 7

### Arquitetura da Integração WhatsApp:
```
Frontend ←→ N8N ←→ WAHA ←→ WhatsApp
    ↓        ↓
Backend ←→ PostgreSQL
    ↓
WebSocket (Socket.IO)
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de considerar a integração completa:

- [x] QR Code aparece no frontend
- [x] QR Code é escaneável
- [x] WhatsApp conecta com sucesso
- [x] Status de conexão é exibido
- [ ] Mensagens recebidas aparecem no frontend
- [ ] Mensagens enviadas chegam no WhatsApp
- [ ] Histórico de conversas é salvo
- [ ] Reconexão automática funciona
- [ ] Múltiplas sessões funcionam
- [ ] Notificações em tempo real via WebSocket

---

## 📞 CONTATO E REFERÊNCIAS

**Repositório:** https://github.com/Magdiel-caim/nexusatemporal

**Documentação WAHA:** https://waha.devlike.pro/

**Documentação N8N:** https://docs.n8n.io/

**Últimas Modificações:**
- Commit: `26e61d8`
- Tag: `v30.3`
- Data: 2025-10-08/09
- Autor: Magdiel Caim + Claude Code

---

**🎉 STATUS: INTEGRAÇÃO WHATSAPP QR CODE FUNCIONANDO!**

**📅 Última Atualização:** 2025-10-09 01:45 UTC

---
