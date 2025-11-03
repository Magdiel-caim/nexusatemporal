# 🔧 CORREÇÃO N8N WORKFLOW - Download de Mídia

**Data**: 02/11/2025 22:20
**Problema**: Nó "Baixar Mídia do WAHA1" retorna 404

---

## 🐛 ERRO IDENTIFICADO

```json
{
  "errorMessage": "The resource you are requesting could not be found",
  "errorDescription": "Not Found",
  "errorDetails": {
    "rawErrorMessage": [
      "404 - ENOENT: no such file or directory, stat '/tmp/whatsapp-files/index.html'"
    ],
    "httpCode": "404"
  },
  "nodeName": "Baixar Mídia do WAHA1"
}
```

**Causa:** O campo `payload.media.url` não contém uma URL válida para download.

---

## ✅ SOLUÇÃO

### Opção 1: Usar Endpoint Correto do WAHA

A WAHA fornece um endpoint específico para download de mídias:

```
GET https://apiwts.nexusatemporal.com.br/api/{session}/messages/{messageId}/media
```

**Alterar o nó "Baixar Mídia do WAHA1":**

```javascript
// URL corrigida:
https://apiwts.nexusatemporal.com.br/api/{{ $json.sessionName }}/messages/{{ $json.wahaMessageId }}/media

// Headers:
X-Api-Key: bd0c416348b2f04d198ff8971b608a87
```

### Opção 2: Usar Base64 Direto do Payload

Se o WAHA já envia a mídia em base64, podemos usar diretamente sem baixar:

**Modificar nó "Processar Mensagem1":**

```javascript
// Processar dados da mensagem WAHA
const payload = $input.item.json.body.payload;
const session = $input.item.json.body.session;

// Detectar se é grupo ou conversa individual
const isGroup = payload.from && payload.from.includes('@g.us');

// Para grupos, usar participant; para individual, usar from
let phoneNumber = '';
if (isGroup && payload.participant) {
  phoneNumber = payload.participant.replace(/@lid|@s.whatsapp.net|@c.us/g, '');
} else if (payload.from) {
  phoneNumber = payload.from.replace(/@c.us|@lid/g, '');
}

// Nome do contato
const contactName = payload._data?.Info?.PushName || payload._data?.notifyName || phoneNumber;

// ✅ CORREÇÃO: Verificar se mídia já vem em base64
let mediaBase64 = null;
let messageType = 'text';
let hasMedia = false;

// Verificar se tem mídia em base64 diretamente no payload
if (payload._data && payload._data.mediaUrl && payload._data.mediaUrl.startsWith('data:')) {
  // Mídia já vem em base64
  mediaBase64 = payload._data.mediaUrl;
  hasMedia = true;

  // Detectar tipo pela mimetype do base64
  if (mediaBase64.includes('image')) {
    messageType = 'image';
  } else if (mediaBase64.includes('video')) {
    messageType = 'video';
  } else if (mediaBase64.includes('audio')) {
    messageType = 'audio';
  }
} else if (payload.media && payload.media.mimetype) {
  // Tem mídia mas precisa baixar
  hasMedia = true;

  if (payload.media.mimetype.includes('image')) {
    messageType = 'image';
  } else if (payload.media.mimetype.includes('video')) {
    messageType = 'video';
  } else if (payload.media.mimetype.includes('audio')) {
    messageType = 'audio';
  } else if (payload.media.mimetype.includes('application')) {
    messageType = 'document';
  }
}

console.log('📥 Mensagem processada:', {
  id: payload.id,
  hasMedia: hasMedia,
  hasBase64: !!mediaBase64,
  type: messageType
});

return {
  sessionName: session,
  wahaMessageId: payload.id,
  phoneNumber: phoneNumber,
  contactName: contactName,
  messageType: messageType,
  content: payload.body || '',
  mediaBase64: mediaBase64,  // ✅ Já inclui base64 se disponível
  hasMedia: hasMedia,
  direction: payload.fromMe ? 'outgoing' : 'incoming',
  timestamp: payload.timestamp ? payload.timestamp * 1000 : Date.now(),
  rawPayload: payload
};
```

### Opção 3: Fluxo Simplificado (Recomendado)

**Remover o nó "Baixar Mídia do WAHA1" e "Converter para Base64"**

**Modificar fluxo:**

```
Webhook WAHA
  ↓
Filtrar Mensagens
  ↓
Processar Mensagem (extrai base64 de payload._data.mediaUrl)
  ↓
Tem Mídia? (verifica se tem mediaBase64)
  ↓ [TRUE]
Enviar para Backend (/api/chat/webhook/n8n/message-media)
  ↓ [FALSE]
Enviar para Backend (/api/chat/webhook/n8n/message) [texto apenas]
```

---

## 🔍 DEBUGGING

### Verificar Payload WAHA

No nó "Webhook WAHA1", adicione logging para ver o payload completo:

```javascript
console.log('🔍 Payload WAHA completo:', JSON.stringify($input.all(), null, 2));
return $input.all();
```

Verifique se:
- ✅ `payload._data.mediaUrl` existe e é base64?
- ✅ `payload.media.url` existe e é uma URL válida?
- ✅ `payload.id` está correto para usar no endpoint de download?

---

## 📝 IMPLEMENTAÇÃO RÁPIDA

### Passo 1: Testar endpoint WAHA manualmente

```bash
curl -X GET "https://apiwts.nexusatemporal.com.br/api/session_01k8ypeykyzcxjxp9p59821v56/messages/[MESSAGE_ID]/media" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  --output test-media.jpg
```

Substitua `[MESSAGE_ID]` pelo ID real da mensagem.

### Passo 2: Se funcionar, atualizar o nó

Se o comando acima baixar a imagem corretamente, use essa URL no nó "Baixar Mídia do WAHA1":

```
URL: https://apiwts.nexusatemporal.com.br/api/{{ $json.sessionName }}/messages/{{ $json.wahaMessageId }}/media

Headers:
  X-Api-Key: bd0c416348b2f04d198ff8971b608a87

Response Format: file
Output Property: mediaFile
```

### Passo 3: Se não funcionar, usar base64 direto

Se o endpoint não funcionar, modifique o workflow para usar o base64 que já vem no payload:

1. Remova o nó "Baixar Mídia do WAHA1"
2. Modifique "Processar Mensagem1" para incluir `mediaBase64` extraído de `payload._data.mediaUrl`
3. Conecte direto para "Enviar Base64 para Backend"

---

## ✅ TESTE FINAL

Depois de implementar qualquer uma das soluções:

1. Envie uma imagem para +55 41 9243-1011
2. Verifique o N8N: todos os nós devem ficar verdes ✅
3. Verifique o backend: deve aparecer "✅ Upload S3 concluído"
4. Verifique o frontend: imagem deve aparecer

---

## 🆘 SE NADA FUNCIONAR

Entre em contato com a documentação da WAHA:
- https://waha.devlike.pro/docs/how-to/media/

Ou verifique o payload exato que está sendo enviado pelo WAHA para entender qual campo usar.
