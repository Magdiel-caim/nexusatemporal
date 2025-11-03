# 🔄 WEBHOOK WAHA → N8N CONFIGURADO - v126.4

**Data**: 02/11/2025 22:00
**Versão**: v1.26.4-n8n-flow
**Status**: ✅ **WEBHOOK REDIRECIONADO PARA N8N**

---

## 🐛 PROBLEMA IDENTIFICADO

### Situação Anterior (v126.3):
- ❌ Webhook WAHA enviava direto para backend: `https://api.nexusatemporal.com.br/api/chat/webhook/waha/message`
- ❌ Backend tentava processar base64 diretamente
- ❌ N8N workflow não estava sendo acionado
- ❌ Imagens não chegavam no N8N para processamento

### Erro no Console Frontend:
```
Erro ao carregar imagem: https://api.nexusatemporal.com.br/apidata:image/png;base64,iVBORw0KGgo...
```

**Causa Raiz**:
1. Webhook pulava o N8N (que deveria processar mídia e fazer upload no S3)
2. Backend recebia base64 e tentava processar sozinho
3. Frontend concatenava URL incorretamente

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Novo Fluxo (Correto):

```
📱 WhatsApp (Usuário envia imagem)
  ↓
🔗 WAHA (Recebe via WhatsApp Web)
  ↓ [Webhook POST]
🔄 N8N (https://webhook.nexusatemporal.com/webhook/waha-receive-message)
  ↓ [Processa mídia, faz upload S3]
💾 Backend (https://api.nexusatemporal.com.br/api/chat/n8n/message-media)
  ↓ [Salva no banco com URL do S3]
🌐 Frontend (Exibe imagem via URL do S3)
```

### Configuração do Webhook WAHA:

```bash
curl -X POST "https://apiwts.nexusatemporal.com.br/api/sessions/start" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "session_01k8ypeykyzcxjxp9p59821v56",
    "config": {
      "webhooks": [
        {
          "url": "https://webhook.nexusatemporal.com/webhook/waha-receive-message",
          "events": ["message", "message.any"]
        }
      ]
    }
  }'
```

### Status Atual:
```json
{
  "name": "session_01k8ypeykyzcxjxp9p59821v56",
  "status": "WORKING",
  "config": {
    "webhooks": [{
      "url": "https://webhook.nexusatemporal.com/webhook/waha-receive-message",
      "events": ["message", "message.any"]
    }]
  }
}
```

---

## 🔧 RESPONSABILIDADES DE CADA COMPONENTE

### 1. WAHA
- ✅ Recebe mensagens do WhatsApp Web
- ✅ Envia webhook para N8N com payload completo
- ✅ Inclui base64 da mídia no campo `_data.mediaUrl`

### 2. N8N Workflow
**Deve fazer:**
- ⚠️ Receber webhook do WAHA
- ⚠️ Detectar se tem mídia (base64)
- ⚠️ Fazer upload da mídia no S3
- ⚠️ Enviar para backend com URL do S3

**Endpoint N8N:** `https://webhook.nexusatemporal.com/webhook/waha-receive-message`

### 3. Backend
**Endpoints:**
- `POST /api/chat/n8n/message-media` - Recebe do N8N com mídia processada
- `POST /api/chat/webhook/waha/message` - Recebe direto do WAHA (apenas texto)

**Responsabilidades:**
- ✅ Salvar mensagem no banco
- ✅ Criar attachment com URL do S3
- ✅ Emitir via WebSocket para frontend

### 4. Frontend
- ✅ Recebe via WebSocket
- ⚠️ Exibe imagem usando URL do S3 (precisa verificar se está correto)

---

## ⚠️ PROBLEMAS PENDENTES

### 1. Verificar N8N Workflow
**Checklist:**
- [ ] N8N está recebendo webhooks do WAHA?
- [ ] N8N está processando base64 corretamente?
- [ ] N8N está fazendo upload no S3?
- [ ] N8N está enviando para o backend?

### 2. Frontend - Exibição de Imagem
**Erro identificado:**
```javascript
// MessageBubble.tsx linha 101
// URL concatenada incorretamente:
https://api.nexusatemporal.com.br/apidata:image/png;base64,...
```

**Deve ser:**
```javascript
// URL do S3 direta:
https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/...

// OU base64 puro para preview:
data:image/png;base64,iVBORw0KGgo...
```

---

## 🧪 TESTES NECESSÁRIOS

### Teste 1: Enviar Imagem
1. ✅ Envie imagem para +55 41 9243-1011
2. ⚠️ Verifique logs N8N: webhook chegou?
3. ⚠️ Verifique logs backend: mensagem recebida do N8N?
4. ⚠️ Verifique frontend: imagem aparece?

### Teste 2: Verificar Logs

**N8N:**
```bash
# Acessar https://webhook.nexusatemporal.com
# Verificar execuções do workflow "waha-receive-message"
```

**Backend:**
```bash
docker service logs nexus_backend --follow | grep "N8N"
```

**Esperado:**
```
📨 Mensagem com mídia recebida do N8N: {...}
☁️ Fazendo upload no S3: whatsapp/session_xxx/...
✅ Upload S3 concluído: https://o0m5.va.idrivee2-26.com/...
💾 Mensagem salva no banco: message-id-xxx
🔊 Mensagem emitida via WebSocket
```

---

## 📋 PRÓXIMOS PASSOS

1. ⚠️ **URGENTE**: Verificar se N8N workflow está ativo e funcionando
2. ⚠️ Corrigir exibição de imagem no frontend (MessageBubble.tsx)
3. ✅ Testar envio de imagem completo
4. ✅ Documentar fluxo completo

---

## 🔍 DEBUGGING

### Ver Configuração Atual:
```bash
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k8ypeykyzcxjxp9p59821v56" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87"
```

### Reconfigurar Webhook (se necessário):
```bash
# 1. Parar sessão
curl -X POST "https://apiwts.nexusatemporal.com.br/api/sessions/stop" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -d '{"name": "session_01k8ypeykyzcxjxp9p59821v56"}'

# 2. Aguardar 5 segundos

# 3. Iniciar com webhook N8N
curl -X POST "https://apiwts.nexusatemporal.com.br/api/sessions/start" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -d '{
    "name": "session_01k8ypeykyzcxjxp9p59821v56",
    "config": {
      "webhooks": [{
        "url": "https://webhook.nexusatemporal.com/webhook/waha-receive-message",
        "events": ["message", "message.any"]
      }]
    }
  }'
```

---

## ✅ STATUS FINAL

- ✅ Webhook WAHA reconfigurado para N8N
- ✅ Sessão WhatsApp ativa e funcionando
- ⚠️ Aguardando verificação do N8N workflow
- ⚠️ Frontend precisa correção na exibição de imagem

**Próximo teste**: Envie uma imagem para +55 41 9243-1011 e verifique os logs do N8N!
