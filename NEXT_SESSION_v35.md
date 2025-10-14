# 📋 NEXT SESSION v35 - Início Rápido

**Gerado em:** 2025-10-13
**Versão Atual:** v34-media-complete
**Branch:** main
**Commit:** affa7b0

---

## 🎯 Estado Atual do Sistema

### ✅ Funcionalidades Implementadas (v34)

1. **Envio de Mídias WhatsApp**
   - ✅ Imagens (PNG, JPG, GIF)
   - ✅ Vídeos (MP4, MOV, AVI)
   - ✅ Áudios/PTT (MP3, WAV, OGG)
   - ✅ Documentos (PDF, DOC, XLS, etc)

2. **Interface de Usuário**
   - ✅ Preview de mídia antes de enviar
   - ✅ Campo de caption para descrição
   - ✅ Gravador de áudio integrado com visualização de onda
   - ✅ Resposta a mensagens com mídia (quote)
   - ✅ Display de mídias recebidas no chat

3. **Backend**
   - ✅ Rota `/api/chat/n8n/send-media` implementada
   - ✅ Conversão automática base64 → formato WAHA
   - ✅ Suporte a URLs públicas e base64
   - ✅ Integração com WAHA API completa

---

## ⚠️ ISSUES CONHECIDOS - PRIORIDADE ALTA

### 1. 🔴 Mídias não aparecem no WhatsApp
**Problema:** Backend envia com sucesso (200 OK), WAHA aceita (201 Created), mas a mídia não aparece no aplicativo WhatsApp do destinatário.

**Evidências:**
```
✅ Backend: POST /api/chat/n8n/send-media → 200 OK
✅ WAHA: POST /api/sendImage → 201 Created (2.5s)
✅ Session: WORKING, engine: READY
❌ WhatsApp: Mídia não aparece no app
```

**Causas Possíveis:**
1. **Base64 muito grande** - WhatsApp tem limite de ~16MB
2. **Rate limiting** - WhatsApp bloqueia envio excessivo
3. **Problema de sincronização** - WAHA vs WhatsApp servers
4. **Formato base64** - WAHA pode não estar convertendo corretamente

**Próximos Passos para Investigar:**
```bash
# 1. Testar com imagem PEQUENA (< 500KB)
# 2. Verificar logs detalhados do WAHA
docker service logs nexus_waha --tail 100

# 3. Verificar status da sessão
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k77wpm5edhch4b97qbgenk7p" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k

# 4. Testar com URL pública (ao invés de base64)
# Usar serviço como imgur.com ou S3 para hospedar imagem
```

**Solução Sugerida:**
Implementar upload de mídia para storage externo (AWS S3, MinIO, etc) e enviar URLs ao invés de base64.

---

### 2. 🟠 Recebimento de Mídias não testado
**Problema:** Webhook configurado mas não foi testado envio de mídia PARA o sistema.

**Webhook Atual:**
```
URL: https://workflow.nexusatemporal.com/webhook/waha-receive-message
Events: message, message.any
ID: nexus-receive-messages
```

**Teste Necessário:**
1. Enviar imagem de OUTRO número para o número do sistema
2. Verificar se webhook recebe o evento
3. Verificar se n8n processa corretamente
4. Verificar se mídia aparece no chat do sistema

**Logs para monitorar:**
```bash
# Backend
docker service logs nexus_backend --tail 50 --follow | grep -i "webhook"

# n8n
docker service logs nexus_n8n --tail 50 --follow

# WAHA
docker service logs nexus_waha --tail 50 --follow | grep -i "message"
```

---

### 3. 🟡 Cache do navegador causando problemas
**Problema:** Usuário relatou que alterações não apareciam após deploy.

**Solução:** Instruir usuário a fazer **CTRL+SHIFT+R** (hard refresh) após cada deploy.

**Melhor prática:** Implementar cache-busting no build:
```js
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
}
```

---

## 🔧 Comandos Úteis

### Monitoramento de Logs
```bash
# Backend (filtrado para mídia)
docker service logs nexus_backend --tail 50 --follow | grep -E "(send-media|Mídia|Error)"

# Frontend (erros do navegador)
# Abrir DevTools (F12) → Console

# WAHA (todas as requisições)
docker service logs nexus_waha --tail 100 --follow

# Todos os serviços
docker service ls
docker service ps nexus_backend nexus_frontend nexus_waha
```

### Deploy Rápido
```bash
# Backend
cd /root/nexusatemporal/backend
npm run build
docker build -t nexus_backend:v35 .
docker service update --image nexus_backend:v35 nexus_backend

# Frontend
cd /root/nexusatemporal/frontend
npm run build
docker build -t nexus_frontend:v35 .
docker service update --image nexus_frontend:v35 nexus_frontend

# Verificar deploy
docker service ps nexus_backend nexus_frontend
```

### Backup de Banco de Dados
```bash
# Backup completo
PGPASSWORD='nexus2024@secure' pg_dump -h localhost -U nexus_admin -d nexus_crm \
  > /tmp/nexus_backup_v35_$(date +%Y%m%d_%H%M%S).sql

# Upload para S3 (IDrive e2)
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 cp /tmp/nexus_backup_v35_*.sql \
  s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl
```

---

## 📁 Arquivos Principais Modificados (v34)

### Backend
1. **`src/modules/chat/chat.routes.ts`** (linha 66)
   - Adicionado rota POST `/n8n/send-media`

2. **`src/modules/chat/n8n-webhook.controller.ts`** (linhas 473-535)
   - Método `sendMedia()` com conversão base64
   - Suporte a URLs públicas
   - Integração com WAHA API

3. **`src/modules/chat/entities/message.entity.ts`**
   - Campo `mediaUrl` adicionado

### Frontend
1. **`src/services/chatService.ts`** (linha 299)
   - Adicionado `mediaUrl` no retorno de `sendWhatsAppMedia()`

2. **`src/pages/ChatPage.tsx`**
   - Linha 406-411: Handler `handleKeyDown` para Enter
   - Linha 441-509: Handler `handleSendFile` para mídias
   - Linha 843: Binding `onKeyDown` no input

3. **Novos Componentes:**
   - `src/components/AudioRecorder.tsx` - Gravador de áudio PTT
   - `src/components/MediaUploadButton.tsx` - Botão de upload com preview
   - `src/components/MessageBubble.tsx` - Mensagem com suporte a mídia

---

## 🚀 Sugestões para v35

### 1. **Prioridade ALTA: Corrigir envio de mídias**
   - [ ] Implementar upload para S3/MinIO
   - [ ] Substituir base64 por URLs públicas
   - [ ] Testar com imagens pequenas (< 500KB)
   - [ ] Adicionar validação de tamanho de arquivo no frontend

### 2. **Prioridade MÉDIA: Testar recebimento**
   - [ ] Enviar mídias de outro número
   - [ ] Verificar webhook n8n
   - [ ] Garantir que mídias recebidas aparecem no chat

### 3. **Prioridade BAIXA: Melhorias de UX**
   - [ ] Adicionar indicador de progresso no upload
   - [ ] Mostrar tamanho do arquivo antes de enviar
   - [ ] Implementar compressão de imagens no frontend
   - [ ] Adicionar galeria de mídias na conversa

### 4. **Infraestrutura**
   - [ ] Implementar cache-busting no build
   - [ ] Adicionar health checks nos serviços
   - [ ] Configurar alerts para falhas de envio
   - [ ] Implementar retry automático para mídias

---

## 🔐 Credenciais e Endpoints

### WAHA API
- **URL:** `https://apiwts.nexusatemporal.com.br`
- **API Key:** `bd0c416348b2f04d198ff8971b608a87`
- **Sessão Padrão:** `session_01k77wpm5edhch4b97qbgenk7p`

### PostgreSQL (CRM)
- **Host:** `localhost:5432`
- **User:** `nexus_admin`
- **Password:** `nexus2024@secure`
- **Database:** `nexus_crm`

### PostgreSQL (Chat) - SEPARADO
- **Host:** `46.202.144.210:5432`
- **User:** `nexus_admin`
- **Password:** `GpFh8923#nx2024!`
- **Database:** `nexus_chat`

### IDrive e2 (S3 Backup)
- **Endpoint:** `https://o0m5.va.idrivee2-26.com`
- **Access Key:** `qFzk5gw00zfSRvj5BQwm`
- **Secret Key:** `bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8`
- **Bucket:** `backupsistemaonenexus`

---

## 📊 Estatísticas do Sistema

### Serviços Docker Swarm
```
nexus_backend (NestJS) - Porta 3001
nexus_frontend (React) - Porta 80/443
nexus_waha (WhatsApp API) - Porta 3000
nexus_postgres (PostgreSQL 16) - Porta 5432
nexus_redis (Redis 7) - Porta 6379
nexus_rabbitmq (RabbitMQ 3) - Porta 5672/15672
nexus_traefik (Proxy) - Porta 80/443
nexus_n8n (Automação) - Porta 5678
```

### Repositório GitHub
- **URL:** https://github.com/Magdiel-caim/nexusatemporal
- **Branch Principal:** main
- **Última Tag:** v34-media-complete
- **Último Commit:** affa7b0 (2025-10-13)

---

## 🐛 Debugging Rápido

### Problema: Mídia não envia
```bash
# 1. Verificar status WAHA
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k77wpm5edhch4b97qbgenk7p" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k | jq '.status, .engine'

# 2. Verificar logs do backend
docker service logs nexus_backend --tail 50 | grep -i "send-media"

# 3. Testar endpoint direto
TOKEN="eyJhbGc..."  # Token do usuário
curl -X POST "http://localhost:3001/api/chat/n8n/send-media" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "session_01k77wpm5edhch4b97qbgenk7p",
    "phoneNumber": "554198549563",
    "fileUrl": "https://i.imgur.com/test.jpg",
    "messageType": "image",
    "caption": "Teste"
  }'
```

### Problema: Frontend não atualiza
```bash
# 1. Rebuild completo
cd /root/nexusatemporal/frontend
rm -rf dist node_modules/.vite
npm run build

# 2. Deploy
docker build -t nexus_frontend:v35-fix .
docker service update --image nexus_frontend:v35-fix nexus_frontend

# 3. Verificar se aplicou
docker service ps nexus_frontend | head -5

# 4. Instruir usuário: CTRL+SHIFT+R no navegador
```

### Problema: Webhook não recebe
```bash
# 1. Verificar configuração
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k77wpm5edhch4b97qbgenk7p" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k | jq '.config.webhooks'

# 2. Verificar logs n8n
docker service logs nexus_n8n --tail 100 | grep -i "waha-receive"

# 3. Testar webhook manualmente
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message",
    "session": "session_01k77wpm5edhch4b97qbgenk7p",
    "payload": {
      "from": "554198549563@c.us",
      "body": "Teste",
      "type": "chat"
    }
  }'
```

---

## 📝 Checklist Início de Sessão

- [ ] Verificar todos os serviços rodando: `docker service ls`
- [ ] Verificar logs de erros: `docker service logs nexus_backend --tail 20`
- [ ] Confirmar branch: `git branch` (deve estar em `main`)
- [ ] Verificar último commit: `git log -1 --oneline`
- [ ] Ler issues conhecidos acima
- [ ] Fazer backup antes de mudanças críticas
- [ ] Instruir usuário sobre CTRL+SHIFT+R se houver deploy

---

## 🎓 Lições Aprendidas (v34)

1. **Docker Swarm:** `docker service update --force` recria do IMAGE, não copia arquivos locais
2. **WAHA API:** Requer formato específico - `{url}` OU `{data, mimetype, filename}`
3. **Base64:** Pode não funcionar para arquivos grandes no WhatsApp
4. **Cache:** Sempre instruir usuário a fazer hard refresh após deploy
5. **Event Handlers:** `onKeyPress` está deprecated, usar `onKeyDown`
6. **WebSocket:** Mensagens devem ter `mediaUrl` para aparecer com preview
7. **Rotas:** Sempre registrar em `chat.routes.ts` antes de testar

---

**Boa sorte na sessão v35! 🚀**

Foque em resolver o problema de envio de mídias primeiro - é o mais crítico.
