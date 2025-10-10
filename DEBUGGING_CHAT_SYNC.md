# Debug Session - Chat/WhatsApp Synchronization
**Data:** 2025-10-09
**Hora:** 11:00 - 14:30

## 🎯 Objetivo Inicial
Sincronizar mensagens WhatsApp com o sistema:
- ✅ Conexão WAHA funcionando
- ✅ QR Code funcionando
- ❌ Mensagens não sincronizavam

## 🔍 Problemas Identificados

### 1. Backend rodando em modo DEV
**Arquivo:** `backend/Dockerfile`
```dockerfile
CMD ["npm", "run", "dev"]  # ← Roda tsx watch, ignora dist/
```
**Impacto:** Alterações no código compilado (dist/) não têm efeito

### 2. WebSocket reconectava a cada mudança de conversa
**Arquivo:** `frontend/src/pages/ChatPage.tsx` (linha 146)
```typescript
}, [selectedConversation]); // ← ERRADO: reconecta sempre
```
**Solução aplicada:**
```typescript
const selectedConversationRef = useRef<Conversation | null>(null);
}, []); // ← Conecta uma vez só
```

### 3. Backend não aceitava evento `message.any`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linha 365)
```typescript
if (wahaPayload.event !== 'message') {  // ← Só aceitava 'message'
```
**Solução:**
```typescript
if (wahaPayload.event !== 'message' && wahaPayload.event !== 'message.any') {
```

### 4. Webhooks perdidos após restart/deploy
**Problema:** Toda vez que o backend é deployado, os webhooks do WAHA são desconfigurados
**Verificação:**
```bash
curl https://apiwts.../api/sessions/session_xxx -H "X-Api-Key: xxx"
# Resposta: "webhooks": null
```
**Reconfiguração necessária:**
```bash
curl -X PUT https://apiwts.../api/sessions/session_xxx \
  -H "X-Api-Key: xxx" \
  -d '{
    "config": {
      "webhooks": [{
        "url": "https://api.../api/chat/webhook/waha/message",
        "events": ["message", "message.any", "message.revoked"]
      }]
    }
  }'
```

### 5. Mensagens status@broadcast sendo salvas
**Problema:** WhatsApp status eram salvos como conversas
**Solução:** Filtrar no backend
```typescript
const isStatus = payload.from && payload.from.includes('status@broadcast');
if (isGroup || isStatus) {
  return res.json({ success: true, ignored: true });
}
```

### 6. Sessão WAHA precisa restart após cada deploy
**Problema:** WAHA mantém conexão com container antigo do backend
**Solução temporária:** Restart manual da sessão após deploy

## ✅ O Que Funcionou (Momentaneamente)

1. **Webhooks chegando:** Visto nos logs `🔔 Webhook WAHA recebido:`
2. **Mensagens salvas no banco:** Confirmado via API endpoint
3. **WebSocket emitindo:** Visto nos logs `🔊 Mensagem emitida via WebSocket`
4. **API retornando mensagens:** 11 mensagens na base de dados

## ❌ O Que NÃO Funcionou

1. **Frontend não exibia mensagens em tempo real** - Corrigido mas não testado completamente
2. **Envio de mensagens pelo sistema** - Backend em modo DEV, endpoint não ativo
3. **Webhooks perdidos constantemente** - Precisam reconfiguração manual
4. **Mensagens do usuário não chegavam** - Webhooks desconfigurados

## 🎓 Lições Aprendidas

1. **Backend em modo DEV é problemático** - Dificulta debug de código compilado
2. **WAHA não persiste webhooks** - Precisam ser reconfigurados após restarts
3. **WebSocket com dependências erradas** - Causa reconexões e perda de listeners
4. **Múltiplos deploys sem testar** - Dificulta identificar qual mudança funcionou

## 📊 Estado Atual

**Banco de Dados:**
- 11 mensagens salvas
- Última mensagem "incoming": 2025-10-09T13:02:17 (11:02)
- Todas após isso são "outgoing" (testes via API)

**WAHA Session:**
- Status: WORKING
- Webhooks: Reconfigurados (podem ter sido perdidos novamente)
- ID: session_01k74cqnky2pv9bn8m8wctad9t

**Frontend:**
- Build: nexus_frontend:websocket-fix
- WebSocket fix aplicado (não testado completamente)

**Backend:**
- Build: nexus_backend:send-whatsapp
- Rodando em modo DEV
- Endpoint sendMessage criado mas não ativo

## 🔄 Próximos Passos (Recomeçar)

1. **Verificar estado limpo:**
   - WAHA funcionando?
   - Webhooks configurados?
   - Backend respondendo?

2. **Teste básico:**
   - Enviar mensagem via API WAHA
   - Verificar se webhook chega no backend
   - Verificar se salva no banco
   - Verificar se emite via WebSocket

3. **Frontend:**
   - Abrir DevTools no navegador
   - Ver console logs
   - Verificar WebSocket conectado
   - Enviar mensagem do WhatsApp
   - Ver se chega no frontend

4. **Solução permanente para webhooks:**
   - Hook no backend para reconfigurar webhooks ao iniciar
   - Ou script de health check que valida webhooks

## 🛠️ Comandos Úteis

**Verificar logs backend:**
```bash
docker service logs nexus_backend --since 5m --follow | grep -E "(🔔|📝|WebSocket)"
```

**Verificar sessão WAHA:**
```bash
curl -X GET "https://apiwts.../api/sessions/session_xxx" -H "X-Api-Key: xxx" | jq .
```

**Reconfigurar webhooks:**
```bash
curl -X PUT "https://apiwts.../api/sessions/session_xxx" \
  -H "X-Api-Key: xxx" \
  -d '{"config":{"webhooks":[{"url":"https://api.../webhook/waha/message","events":["message","message.any","message.revoked"]}]}}'
```

**Ver mensagens no banco:**
```bash
curl "https://api.../api/chat/n8n/messages/session_xxx?phoneNumber=XXX" \
  -H "Authorization: Bearer TOKEN" | jq '.data | length'
```

**Testar webhook manualmente:**
```bash
curl -X POST "https://api.../api/chat/webhook/waha/message" \
  -H "Content-Type: application/json" \
  -d '{"event":"message.any","session":"session_xxx","payload":{"id":"test","from":"XXX@c.us","body":"teste"}}'
```

---
**Conclusão:** Sistema está próximo de funcionar, mas precisa de abordagem mais limpa e testes incrementais.
