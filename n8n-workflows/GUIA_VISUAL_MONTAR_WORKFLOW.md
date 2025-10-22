# 🎨 Guia Visual - Montar Workflow OAuth NotificaMe no n8n

**Data**: 2025-10-22
**Dificuldade**: ⭐⭐⭐ Intermediário
**Tempo estimado**: 15 minutos

---

## 📊 VISÃO GERAL DO WORKFLOW

```
┌──────────────────────────────────────────────────────────────────┐
│                     FLUXO DE OAUTH                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] Webhook Start ──→ [2] Code ──→ [3] HTTP Request ──→ [4] Respond │
│       (POST)              Preparar      Get OAuth URL        Retornar │
│                           Dados                                URL    │
│                                                                  │
│  [5] Webhook Callback ──→ [6] Code ──→ [7] HTTP ──→ [8] HTTP ──→ [9] Respond │
│       (GET)                 Processar    Trocar    Notificar    Sucesso │
│                             Callback     Token     Nexus       (HTML)  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ PARTE 1: CRIAR NOVO WORKFLOW

### Passo 1: Criar Workflow

1. No n8n, clique em **"New workflow"** (canto superior direito)
2. Nome do workflow: **"NotificaMe OAuth Instagram"**
3. Clique em **"Save"**

---

## 📦 PARTE 2: ADICIONAR NODES (9 NODES NO TOTAL)

### NODE 1: Webhook - Iniciar OAuth

1. Clique no **"+"** para adicionar node
2. Busque: **"Webhook"**
3. Selecione: **"Webhook"**
4. Configure:

```
┌─────────────────────────────────────┐
│ Webhook - Iniciar OAuth             │
├─────────────────────────────────────┤
│ HTTP Method: POST                   │
│ Path: notificame-oauth-start        │
│ Response Mode: Using Respond to     │
│               Webhook Node          │
│ Options: (deixar padrão)            │
└─────────────────────────────────────┘
```

5. Clique em **"Execute Node"** para ativar
6. **COPIE A URL** que aparece (vai precisar depois!)
   - Exemplo: `https://seu-n8n.com/webhook/notificame-oauth-start`

---

### NODE 2: Code - Preparar Dados

1. Arraste uma **linha** do Node 1 para o canvas (conectar)
2. Clique no **"+"** que aparece
3. Busque: **"Code"**
4. Selecione: **"Code"**
5. Configure:

```
┌─────────────────────────────────────┐
│ Code - Preparar Dados               │
├─────────────────────────────────────┤
│ Mode: Run Once for All Items        │
│ Language: JavaScript                │
└─────────────────────────────────────┘
```

6. No campo **"JavaScript Code"**, COLE este código:

```javascript
// Extrair dados do body do webhook
const items = $input.all();
const body = items[0].json.body;

const platform = body.platform; // 'instagram' ou 'messenger'
const tenantId = body.tenantId;
const userId = body.userId;

// Criar state (contexto) codificado em base64
const state = Buffer.from(JSON.stringify({
  platform,
  tenantId,
  userId,
  timestamp: Date.now()
})).toString('base64');

// URL de callback (webhook 2 que vamos criar)
const callbackUrl = `${$env.WEBHOOK_URL}/webhook/notificame-oauth-callback`;

return [{
  json: {
    platform,
    tenantId,
    userId,
    state,
    callbackUrl
  }
}];
```

7. Clique em **"Test step"** para validar

---

### NODE 3: HTTP Request - Obter URL OAuth

1. Conecte uma linha do Node 2
2. Adicione node: **"HTTP Request"**
3. Configure:

```
┌─────────────────────────────────────────────────────┐
│ HTTP Request - Obter URL OAuth                      │
├─────────────────────────────────────────────────────┤
│ Method: GET                                         │
│ URL: https://app.notificame.com.br/api/oauth/      │
│      authorize                                      │
│                                                     │
│ Authentication: Generic Credential Type            │
│   ↳ Generic Auth Type: Header Auth                │
│      ↳ Credential: (criar nova)                    │
│         Name: apikey                               │
│         Value: 0fb8e168-9331-11f0-88f5-0e386dc8... │
│                                                     │
│ Send Query Parameters: ✅ ON                        │
│   ↳ Specify Query Parameters: Using Fields Below  │
│      Parameter 1:                                  │
│        Name: platform                              │
│        Value: ={{ $json.platform }}                │
│      Parameter 2:                                  │
│        Name: redirect_uri                          │
│        Value: ={{ $json.callbackUrl }}             │
│      Parameter 3:                                  │
│        Name: state                                 │
│        Value: ={{ $json.state }}                   │
└─────────────────────────────────────────────────────┘
```

**⚠️ IMPORTANTE**: Se este endpoint retornar erro 404, vamos testar outros:
- Tente: `/api/connect/instagram`
- Tente: `/api/channels/authorize`
- Tente: `/api/oauth/url`

4. Clique em **"Test step"** para ver se funciona

---

### NODE 4: Respond to Webhook - Retornar URL

1. Conecte do Node 3
2. Adicione: **"Respond to Webhook"**
3. Configure:

```
┌─────────────────────────────────────┐
│ Respond to Webhook - URL OAuth      │
├─────────────────────────────────────┤
│ Respond With: JSON                  │
│ Response Body:                      │
└─────────────────────────────────────┘
```

4. No campo **"Response Body"**, cole:

```json
{
  "success": true,
  "data": {
    "authUrl": "={{ $json.authorization_url || $json.authUrl || $json.url }}",
    "platform": "={{ $json.platform }}"
  }
}
```

---

## 🔄 PARTE 3: SEGUNDO FLUXO (CALLBACK)

### NODE 5: Webhook - Callback OAuth

1. Adicione um **novo Webhook** (não conectado aos anteriores)
2. Configure:

```
┌─────────────────────────────────────┐
│ Webhook - Callback OAuth            │
├─────────────────────────────────────┤
│ HTTP Method: GET                    │
│ Path: notificame-oauth-callback     │
│ Response Mode: Using Respond to     │
│               Webhook Node          │
└─────────────────────────────────────┘
```

3. Ative e **COPIE A URL**
   - Exemplo: `https://seu-n8n.com/webhook/notificame-oauth-callback`

---

### NODE 6: Code - Processar Callback

1. Conecte do Node 5
2. Adicione: **"Code"**
3. Cole este código:

```javascript
// Extrair query parameters da URL
const items = $input.all();
const query = items[0].json.query;

const code = query.code;
const state = query.state;
const error = query.error;

// Se houver erro no OAuth
if (error) {
  return [{
    json: {
      success: false,
      error: error,
      error_description: query.error_description
    }
  }];
}

// Decodificar state para recuperar contexto
const context = JSON.parse(Buffer.from(state, 'base64').toString());

return [{
  json: {
    code,
    platform: context.platform,
    tenantId: context.tenantId,
    userId: context.userId
  }
}];
```

---

### NODE 7: HTTP Request - Trocar Code por Token

1. Conecte do Node 6
2. Adicione: **"HTTP Request"**
3. Configure:

```
┌─────────────────────────────────────────────────────┐
│ HTTP Request - Trocar Code por Token                │
├─────────────────────────────────────────────────────┤
│ Method: POST                                        │
│ URL: https://app.notificame.com.br/api/oauth/token │
│                                                     │
│ Authentication: Header Auth (mesma credencial)     │
│   Name: apikey                                      │
│   Value: 0fb8e168-9331-11f0-88f5-0e386dc8b623      │
│                                                     │
│ Send Body: ✅ ON                                     │
│   Body Content Type: JSON                          │
│   Specify Body: Using JSON                         │
│                                                     │
│ JSON Body:                                          │
│ {                                                   │
│   "code": "={{ $json.code }}",                      │
│   "platform": "={{ $json.platform }}"               │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

### NODE 8: HTTP Request - Notificar Nexus CRM

1. Conecte do Node 7
2. Adicione: **"HTTP Request"**
3. Configure:

```
┌─────────────────────────────────────────────────────┐
│ HTTP Request - Notificar Nexus                      │
├─────────────────────────────────────────────────────┤
│ Method: POST                                        │
│ URL: https://api.nexusatemporal.com.br/api/        │
│      notificame/oauth/complete                      │
│                                                     │
│ Authentication: Generic Credential Type            │
│   ↳ Generic Auth Type: Header Auth                │
│      ↳ Name: Authorization                         │
│         Value: Bearer SEU_TOKEN_JWT_AQUI           │
│                                                     │
│ Send Body: ✅ ON                                     │
│   Body Content Type: JSON                          │
│                                                     │
│ JSON Body:                                          │
│ {                                                   │
│   "tenantId": "={{ $json.tenantId }}",              │
│   "userId": "={{ $json.userId }}",                  │
│   "platform": "={{ $json.platform }}",              │
│   "instanceId": "={{ $json.instance_id }}",         │
│   "status": "connected"                            │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

**⚠️ NOTA**: Você pode pular este node por enquanto e testar sem ele.

---

### NODE 9: Respond to Webhook - Página de Sucesso

1. Conecte do Node 8 (ou Node 7 se pulou o 8)
2. Adicione: **"Respond to Webhook"**
3. Configure:

```
┌─────────────────────────────────────┐
│ Respond to Webhook - Sucesso        │
├─────────────────────────────────────┤
│ Respond With: HTML                  │
└─────────────────────────────────────┘
```

4. No campo **"HTML"**, cole este código:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Conexão Bem-sucedida! ✅</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: #fff;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      color: #333;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
    }
    h1 { color: #1f2937; margin-bottom: 10px; }
    p { color: #6b7280; margin-bottom: 20px; }
    .countdown { font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Instagram Conectado!</h1>
    <p>Sua conta foi sincronizada com sucesso.</p>
    <p>Fechando em <span class="countdown" id="timer">3</span>s...</p>
  </div>
  <script>
    let seconds = 3;
    const timer = document.getElementById('timer');
    const interval = setInterval(() => {
      seconds--;
      timer.textContent = seconds;
      if (seconds === 0) {
        clearInterval(interval);
        if (window.opener) {
          window.opener.postMessage({type: 'notificame_oauth_success', platform: 'instagram'}, '*');
        }
        window.close();
      }
    }, 1000);
  </script>
</body>
</html>
```

---

## ✅ PARTE 4: ATIVAR WORKFLOW

1. No topo do workflow, clique em **"Inactive"** para mudar para **"Active"**
2. Verifique se ambos os webhooks estão com ✅ verde
3. Copie as 2 URLs dos webhooks e salve

---

## 🧪 PARTE 5: TESTAR NO TERMINAL

### Teste 1: Chamar Webhook Start

```bash
curl -X POST https://seu-n8n.com/webhook/notificame-oauth-start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "tenantId": 1,
    "userId": 1
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.instagram.com/oauth/authorize?client_id=...",
    "platform": "instagram"
  }
}
```

### Teste 2: Abrir URL OAuth

Se retornou `authUrl`:
1. Copie a URL
2. Abra no navegador
3. Deve mostrar tela de login do Instagram

---

## 🐛 TROUBLESHOOTING

### ❌ Erro: "code": "Hub404"

**Problema**: Endpoint `/api/oauth/authorize` não existe

**Solução**: Tente estes endpoints alternativos no Node 3:

1. `/api/connect/instagram`
2. `/api/channels/instagram/authorize`
3. `/api/oauth/url?platform=instagram`
4. `/api/auth/instagram`

### ❌ Erro: "apikey invalid"

**Problema**: API Key incorreta

**Solução**: Verifique se usou exatamente:
```
0fb8e168-9331-11f0-88f5-0e386dc8b623
```

### ❌ Webhook não responde

**Problema**: Workflow não está ativo

**Solução**: Ative o workflow no topo da tela

---

## 📸 LAYOUT FINAL DO WORKFLOW

```
START FLOW (Iniciar OAuth):
┌─────────┐    ┌──────┐    ┌──────────┐    ┌─────────┐
│Webhook 1│───▶│Code 2│───▶│HTTP Req 3│───▶│Respond 4│
│  (POST) │    │      │    │Get OAuth │    │  (JSON) │
└─────────┘    └──────┘    └──────────┘    └─────────┘

CALLBACK FLOW (Processar Autorização):
┌─────────┐    ┌──────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│Webhook 5│───▶│Code 6│───▶│HTTP Req 7│───▶│HTTP Req 8│───▶│Respond 9│
│  (GET)  │    │      │    │Get Token │    │Notify    │    │  (HTML) │
└─────────┘    └──────┘    └──────────┘    └──────────┘    └─────────┘
```

---

## 📝 PRÓXIMOS PASSOS APÓS MONTAR

1. [ ] Montar workflow com os 9 nodes
2. [ ] Ativar workflow
3. [ ] Testar com cURL
4. [ ] Ver se retorna URL OAuth
5. [ ] Se funcionar, integrar com Nexus CRM
6. [ ] Se não funcionar, me avisar qual erro apareceu!

---

## ❓ DÚVIDAS FREQUENTES

**Q: Preciso do node NotificaMe Hub?**
A: NÃO! Use apenas HTTP Request nodes com autenticação Header Auth.

**Q: Onde coloco a API Key?**
A: No HTTP Request, em Authentication → Header Auth → Name: "apikey" → Value: "sua-key"

**Q: Os webhooks funcionam sem estar ativo?**
A: NÃO! Precisa ativar o workflow primeiro.

---

**Criado por**: Claude Code
**Data**: 2025-10-22
**Versão**: v118
**Status**: 📋 GUIA PRONTO - PODE MONTAR NO N8N!
