# ✅ SOLUÇÃO - Workflow v3.1 CORRIGIDO

## 🎯 Problema Identificado

O workflow v3 estava procurando a URL da mídia no lugar **ERRADO**:

```javascript
// ❌ ERRADO (v3):
mediaUrl: payload._data?.mediaUrl || null  // Sempre retorna null
messageType: payload.type || 'text'         // Sempre retorna 'text'
```

Mas o WAHA envia a mídia em:
```javascript
payload.media.url = "https://apiwts.nexusatemporal.com.br/api/files/atemporal_main/3EB095B80D2817B4B6A51D.jpeg"
payload.media.mimetype = "image/jpeg"
```

---

## ✅ Correção Aplicada (v3.1)

O novo código **busca no lugar certo**:

```javascript
// ✅ CORRETO (v3.1):
if (payload.media && payload.media.url) {
  mediaUrl = payload.media.url;  // ✅ URL correta do WAHA

  // Detectar tipo pela mimetype
  if (payload.media.mimetype.includes('image')) {
    messageType = 'image';  // ✅ Tipo correto
  }
  // ... outros tipos ...
}
```

---

## 📋 PASSOS PARA INSTALAR v3.1

### 1️⃣ DELETAR WORKFLOW v3 ANTIGO

No N8N:
1. Abra o workflow **"WAHA - Receber Mensagens (COM S3) v3 FINAL"**
2. **DESATIVE** o workflow (toggle no canto superior direito)
3. Clique no menu (3 pontos) → **Delete**
4. Confirme a exclusão

### 2️⃣ IMPORTAR WORKFLOW v3.1 CORRIGIDO

1. No N8N, clique em **Menu** (3 linhas) → **Import from File**
2. Selecione o arquivo:
   ```
   /root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_v3.1_CORRIGIDO.json
   ```
3. Clique em **Import**

### 3️⃣ CONFIGURAR CREDENCIAL S3

Abra o nó **"Upload para S3 IDrive"** e configure:

```
Credential: IDrive S3 - Nexus (ou S3 account)
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ ATIVADO (toggle VERDE à direita)
Ignore SSL Issues: ✅ ATIVADO (toggle VERDE à direita)
```

**IMPORTANTE:** O toggle **Force Path Style** deve estar à DIREITA (verde/azul).

### 4️⃣ VERIFICAR NÓS "Enviar para Backend"

**AMBOS os nós** (COM URL S3 e SEM MÍDIA) devem ter:

1. **Method**: POST
2. **URL**: `https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message`
3. **Send Headers**: ✅ Ativado
   - Header: `Content-Type: application/json`
4. **Send Body**: ✅ Ativado
5. **Body Content Type**: JSON
6. **Specify Body**: Using JSON
7. **JSON Body**: `={{ $json }}`

### 5️⃣ ATIVAR WORKFLOW v3.1

1. No canto superior direito, **ATIVE o workflow** (toggle deve ficar verde)
2. Clique em **Save** para salvar
3. Verifique que aparece **"Active"** em verde no nome do workflow

---

## 🧪 TESTAR

### Teste com Imagem

1. Envie uma **NOVA imagem** pelo WhatsApp para **+55 41 9243-1011**
   - ⚠️ Deve ser uma imagem nova, não a mesma anterior

2. Aguarde 5-10 segundos

3. Verifique no N8N:
   - Vá em **Executions** (menu lateral esquerdo)
   - Clique na última execução
   - **TODOS os nós devem estar VERDES**
   - Clique no nó "Processar Mensagem" e veja o output:
     - `mediaUrl` deve ter valor (não null)
     - `messageType` deve ser "image" (não "text")

4. Verifique no sistema:
   - Abra o chat no frontend
   - A imagem deve aparecer carregando do S3

---

## 🔍 O QUE MUDOU NO v3.1

### Nó "Processar Mensagem" - Código Corrigido:

**ANTES (v3) - ERRADO:**
```javascript
return {
  messageType: payload.type || 'text',           // ❌ Sempre 'text'
  mediaUrl: payload._data?.mediaUrl || null,     // ❌ Sempre null
  // ...
};
```

**AGORA (v3.1) - CORRETO:**
```javascript
// Extrair URL da mídia do campo correto
let mediaUrl = null;
let messageType = 'text';

if (payload.media && payload.media.url) {
  mediaUrl = payload.media.url;  // ✅ Pega do lugar certo

  // Detectar tipo pela mimetype
  if (payload.media.mimetype) {
    if (payload.media.mimetype.includes('image')) {
      messageType = 'image';  // ✅ Tipo correto
    } else if (payload.media.mimetype.includes('video')) {
      messageType = 'video';
    } else if (payload.media.mimetype.includes('audio')) {
      messageType = 'audio';
    }
  }
}

console.log('📥 Mensagem processada:', {
  hasMedia: !!mediaUrl,
  mediaUrl: mediaUrl,
  type: messageType
});

return {
  messageType: messageType,  // ✅ 'image', 'video', etc.
  mediaUrl: mediaUrl,        // ✅ URL do WAHA
  // ...
};
```

---

## 📊 FLUXO ESPERADO COM v3.1

```
1. WhatsApp → WAHA recebe imagem
2. WAHA baixa mídia do WhatsApp
3. WAHA armazena em /api/files/atemporal_main/XXXXX.jpeg
4. WAHA envia webhook com:
   {
     "hasMedia": true,
     "media": {
       "url": "https://apiwts.nexusatemporal.com.br/api/files/atemporal_main/XXXXX.jpeg",
       "mimetype": "image/jpeg"
     }
   }
5. N8N Workflow v3.1:
   ✅ Detecta mediaUrl = payload.media.url
   ✅ Detecta messageType = "image"
   ✅ Baixa mídia do WAHA
   ✅ Upload para S3
   ✅ Envia ao backend com URL S3
6. Backend salva com media_url apontando para S3
7. Frontend exibe imagem do S3
```

---

## 📝 SOBRE A IDEIA DO BASE64

Você sugeriu converter a mídia para base64 e armazenar no banco. Essa é uma opção válida para o futuro, mas tem prós e contras:

### ✅ Vantagens:
- Não depende de servidor externo (S3)
- Mídia sempre acessível (mesmo se S3 cair)
- Sem custos de armazenamento S3

### ❌ Desvantagens:
- Base64 aumenta tamanho em ~33% (imagem de 100KB vira 133KB)
- Banco de dados fica MUITO maior
- Queries SQL mais lentas (dados maiores)
- Pode causar problemas de memória/performance
- PostgreSQL tem limite de 1GB por campo

### 💡 Recomendação:
Mantenha a solução S3 atual. É mais escalável e performática. Base64 no banco só vale para arquivos MUITO pequenos (ícones, avatares < 50KB).

---

## ✅ RESUMO RÁPIDO

1. ❌ **DELETE** workflow v3
2. ✅ **IMPORT** workflow v3.1
3. ✅ **CONFIGURE** S3 credentials (Force Path Style = ON)
4. ✅ **ACTIVATE** workflow v3.1
5. ✅ **TEST** com uma nova imagem
6. ✅ **REPORT** resultado

Quando estiver pronto, me avise e acompanho o teste em tempo real! 🚀
