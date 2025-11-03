# 🔧 INSTRUÇÕES: Implementar Opção 2 no N8N

**Data**: 02/11/2025 22:25
**Objetivo**: Usar base64 direto do payload WAHA sem fazer download

---

## 📋 PASSO A PASSO

### **Passo 1: Acessar o N8N**

1. Acesse: `https://webhook.nexusatemporal.com`
2. Faça login
3. Abra o workflow: **"waha-receive-message"** (ou o nome que você deu)

---

### **Passo 2: Modificar o nó "Processar Mensagem1"**

1. Clique no nó **"Processar Mensagem1"**
2. Substitua TODO o código JavaScript pelo código do arquivo: `n8n-processar-mensagem-corrigido.js`
3. Ou copie e cole este código:

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

  console.log('✅ Base64 encontrado no payload:', {
    id: payload.id,
    base64Length: mediaBase64.length,
    base64Preview: mediaBase64.substring(0, 50) + '...'
  });

  // Detectar tipo pela mimetype do base64
  if (mediaBase64.includes('image')) {
    messageType = 'image';
  } else if (mediaBase64.includes('video')) {
    messageType = 'video';
  } else if (mediaBase64.includes('audio')) {
    messageType = 'audio';
  } else if (mediaBase64.includes('application')) {
    messageType = 'document';
  }
} else if (payload.media && payload.media.mimetype) {
  // Tem mídia mas não tem base64 (cenário incomum)
  hasMedia = true;

  console.log('⚠️ Mídia detectada mas sem base64:', {
    id: payload.id,
    mimetype: payload.media.mimetype,
    hasUrl: !!payload.media.url
  });

  // Detectar tipo pelo mimetype
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
  type: messageType,
  phoneNumber: phoneNumber,
  contactName: contactName
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

4. Clique em **"Execute Node"** para testar
5. Salve o nó

---

### **Passo 3: Modificar o nó "Tem Mídia?"**

1. Clique no nó **"Tem Mídia?"**
2. Modifique a condição de:
   ```
   {{ $json.mediaUrl }} não está vazio
   ```
   Para:
   ```
   {{ $json.hasMedia }} é igual a true
   ```

3. Ou em formato JSON:
   ```json
   {
     "conditions": [
       {
         "leftValue": "={{ $json.hasMedia }}",
         "rightValue": true,
         "operator": {
           "type": "boolean",
           "operation": "equals"
         }
       }
     ]
   }
   ```

4. Salve o nó

---

### **Passo 4: REMOVER o nó "Baixar Mídia do WAHA1"**

1. Clique no nó **"Baixar Mídia do WAHA1"**
2. Pressione **Delete** ou clique no ícone de lixeira
3. Confirme a exclusão

---

### **Passo 5: REMOVER o nó "Converter para Base64"**

1. Clique no nó **"Converter para Base64"**
2. Pressione **Delete** ou clique no ícone de lixeira
3. Confirme a exclusão

---

### **Passo 6: Reconectar os nós**

Agora você deve conectar:

```
Processar Mensagem1
  ↓
Tem Mídia?
  ↓ [TRUE]
Enviar Base64 para Backend
  ↓ [FALSE]
Enviar para Backend (SEM MÍDIA)1
```

**Arrastar conexões:**

1. Arraste a saída (círculo à direita) do nó **"Tem Mídia?" [TRUE]** (saída superior)
2. Conecte na entrada do nó **"Enviar Base64 para Backend"**

---

### **Passo 7: Salvar o Workflow**

1. Clique em **"Save"** (canto superior direito)
2. O workflow será salvo automaticamente
3. Ele já está ativo (porque o webhook está configurado)

---

## 🧪 TESTAR

### Teste 1: Enviar Mensagem de Texto

1. Envie uma mensagem de **texto** para: `+55 41 9243-1011`
2. No N8N, verifique se:
   - ✅ Webhook recebe
   - ✅ Processa mensagem
   - ✅ "Tem Mídia?" vai para FALSE
   - ✅ Envia para backend (sem mídia)
3. Verifique o sistema: mensagem deve aparecer

### Teste 2: Enviar Imagem

1. Envie uma **imagem** para: `+55 41 9243-1011`
2. No N8N, verifique se:
   - ✅ Webhook recebe
   - ✅ Processa mensagem com `hasMedia: true`
   - ✅ `mediaBase64` está preenchido
   - ✅ "Tem Mídia?" vai para TRUE
   - ✅ Envia para backend (com base64)
3. No console do N8N, deve aparecer:
   ```
   ✅ Base64 encontrado no payload: { id: '...', base64Length: 123456 }
   📥 Mensagem processada: { hasMedia: true, hasBase64: true, type: 'image' }
   ```
4. Verifique o backend:
   ```bash
   docker service logs nexus_backend --follow | grep "N8N"
   ```
   Deve aparecer:
   ```
   📨 Mensagem com mídia recebida do N8N
   ☁️ Fazendo upload no S3
   ✅ Upload S3 concluído
   ✅ Mensagem criada com attachment
   ```
5. Verifique o sistema: **imagem deve aparecer!**

---

## ✅ CHECKLIST FINAL

- [ ] Código do nó "Processar Mensagem1" atualizado
- [ ] Condição do nó "Tem Mídia?" modificada
- [ ] Nó "Baixar Mídia do WAHA1" removido
- [ ] Nó "Converter para Base64" removido
- [ ] Conexões reconectadas
- [ ] Workflow salvo
- [ ] Teste 1 (texto) funcionou
- [ ] Teste 2 (imagem) funcionou
- [ ] Imagem aparece no sistema

---

## 🆘 TROUBLESHOOTING

### Se a imagem não aparecer:

1. **Verifique o console do N8N:**
   - Tem log "✅ Base64 encontrado no payload"?
   - `mediaBase64` tem conteúdo?

2. **Verifique os logs do backend:**
   ```bash
   docker service logs nexus_backend --follow | grep "mídia"
   ```
   - Upload no S3 aconteceu?
   - Mensagem foi criada com attachment?

3. **Verifique o frontend:**
   - Abra o DevTools (F12)
   - Vá na aba Console
   - Tem algum erro?

4. **Se ainda não funcionar:**
   - Me envie o output do nó "Processar Mensagem1"
   - Me envie os logs do backend
   - Vou ajudar a debugar!

---

## 📝 ESTRUTURA FINAL DO WORKFLOW

```
┌─────────────────────┐
│ Webhook WAHA1       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Filtrar Mensagens1  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Processar Mensagem1 │ ← ✅ MODIFICADO
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Tem Mídia?          │ ← ✅ MODIFICADO
└──────┬──────────┬───┘
       ↓          ↓
     TRUE       FALSE
       ↓          ↓
┌──────────┐  ┌──────────────────────────┐
│ Enviar   │  │ Enviar para Backend      │
│ Base64   │  │ (SEM MÍDIA)1             │
│ para     │  └──────────────────────────┘
│ Backend  │
└──────────┘
```

**Nós REMOVIDOS:**
- ❌ Baixar Mídia do WAHA1
- ❌ Converter para Base64

---

Pronto! Agora implemente essas mudanças no N8N e teste! 🚀
