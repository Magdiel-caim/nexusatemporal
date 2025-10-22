# NotificaMe OAuth - Setup Manual n8n (SEM Community Node)

**Data**: 2025-10-22
**Problema**: Community node `n8n-nodes-notificame-hub` **NÃO TEM** action para OAuth
**Solução**: Usar **HTTP Request** nodes para chamar API NotificaMe diretamente

---

## 🎯 WORKFLOW SIMPLIFICADO

Como o node NotificaMe Hub não tem OAuth, vamos criar workflow usando nodes básicos do n8n.

---

## 📦 NODES NECESSÁRIOS

### **Node 1: Webhook - Iniciar OAuth**
- **Type**: Webhook
- **Path**: `notificame-oauth-start`
- **Method**: POST
- **Response Mode**: Using 'Respond to Webhook' Node

### **Node 2: Code - Extrair Dados**
- **Type**: Code
- **Language**: JavaScript

**Código**:
```javascript
// Extrair dados do body
const platform = $input.item.json.body.platform; // 'instagram' ou 'messenger'
const tenantId = $input.item.json.body.tenantId;
const userId = $input.item.json.body.userId;

// Gerar state único
const state = Buffer.from(JSON.stringify({
  platform,
  tenantId,
  userId,
  timestamp: Date.now()
})).toString('base64');

return {
  json: {
    platform,
    tenantId,
    userId,
    state
  }
};
```

### **Node 3: HTTP Request - Obter URL OAuth**
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `https://app.notificame.com.br/api/connect/{{ $json.platform }}`
- **Authentication**: Header Auth
  - **Name**: `apikey`
  - **Value**: `0fb8e168-9331-11f0-88f5-0e386dc8b623`
- **Query Parameters**:
  - `redirect_uri` = `{{ $env.N8N_WEBHOOK_URL }}/webhook/notificame-oauth-callback`
  - `state` = `{{ $json.state }}`

### **Node 4: Respond to Webhook - Retornar URL**
- **Type**: Respond to Webhook
- **Respond With**: JSON

**Body**:
```javascript
{
  "success": true,
  "data": {
    "authUrl": "{{ $json.authorization_url || $json.authUrl || $json.url }}",
    "platform": "{{ $json.platform }}"
  }
}
```

---

### **Node 5: Webhook - Callback OAuth**
- **Type**: Webhook
- **Path**: `notificame-oauth-callback`
- **Method**: GET
- **Response Mode**: Using 'Respond to Webhook' Node

### **Node 6: Code - Processar Callback**
- **Type**: Code
- **Language**: JavaScript

**Código**:
```javascript
// Extrair query params
const code = $input.item.json.query.code;
const state = $input.item.json.query.state;
const error = $input.item.json.query.error;

// Se houver erro
if (error) {
  return {
    json: {
      success: false,
      error: error,
      error_description: $input.item.json.query.error_description
    }
  };
}

// Decodificar state
const context = JSON.parse(Buffer.from(state, 'base64').toString());

return {
  json: {
    code,
    platform: context.platform,
    tenantId: context.tenantId,
    userId: context.userId
  }
};
```

### **Node 7: HTTP Request - Trocar Code por Token**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://app.notificame.com.br/api/connect/token`
- **Authentication**: Header Auth
  - **Name**: `apikey`
  - **Value**: `0fb8e168-9331-11f0-88f5-0e386dc8b623`
- **Body Type**: JSON
- **Body**:
```json
{
  "code": "{{ $json.code }}",
  "platform": "{{ $json.platform }}"
}
```

### **Node 8: HTTP Request - Notificar Nexus**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://api.nexusatemporal.com.br/api/notificame/oauth/complete`
- **Authentication**: Header Auth
  - **Name**: `Authorization`
  - **Value**: `Bearer {{ $env.NEXUS_API_TOKEN }}`
- **Body Type**: JSON
- **Body**:
```json
{
  "tenantId": "{{ $json.tenantId }}",
  "userId": "{{ $json.userId }}",
  "platform": "{{ $json.platform }}",
  "instanceId": "{{ $json.instance_id || $json.instanceId }}",
  "status": "connected"
}
```

### **Node 9: Respond to Webhook - Página Sucesso**
- **Type**: Respond to Webhook
- **Respond With**: HTML

**HTML** (copie completo):
```html
<!DOCTYPE html>
<html>
<head>
  <title>Conexão Bem-sucedida</title>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 450px;
      animation: slideUp 0.5s ease-out;
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      animation: scaleIn 0.5s ease-out 0.2s both;
    }
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    .success-icon svg {
      width: 50px;
      height: 50px;
      fill: white;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 12px;
      font-size: 24px;
      font-weight: 600;
    }
    .platform {
      display: inline-block;
      background: #f3f4f6;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 20px;
    }
    p {
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .close-info {
      font-size: 14px;
      color: #9ca3af;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .countdown {
      font-weight: 600;
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    </div>

    <h1>Conta Conectada com Sucesso!</h1>

    <div class="platform" id="platformName">Instagram</div>

    <p>Sua conta foi conectada e sincronizada com o <strong>Nexus CRM</strong>.</p>

    <div class="close-info">
      Esta janela fechará automaticamente em <span class="countdown" id="countdown">3</span> segundos
    </div>
  </div>

  <script>
    // Obter platform da URL (se disponível)
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');

    // Decodificar state para pegar platform
    if (state) {
      try {
        const context = JSON.parse(atob(state));
        const platformEl = document.getElementById('platformName');
        platformEl.textContent = context.platform === 'instagram' ? 'Instagram' : 'Messenger';
      } catch (e) {
        console.error('Erro ao decodificar state:', e);
      }
    }

    // Countdown
    let seconds = 3;
    const countdownEl = document.getElementById('countdown');

    const interval = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds;

      if (seconds === 0) {
        clearInterval(interval);

        // Notificar janela pai
        if (window.opener) {
          window.opener.postMessage({
            type: 'notificame_oauth_success',
            platform: state ? JSON.parse(atob(state)).platform : 'instagram'
          }, '*');
        }

        // Fechar janela
        window.close();
      }
    }, 1000);
  </script>
</body>
</html>
```

---

## 🔗 CONEXÕES ENTRE NODES

```
Webhook (Start OAuth)
    ↓
Code (Extrair Dados)
    ↓
HTTP Request (Obter URL OAuth)
    ↓
Respond to Webhook (Retornar URL)
```

```
Webhook (Callback OAuth)
    ↓
Code (Processar Callback)
    ↓
HTTP Request (Trocar Code por Token)
    ↓
HTTP Request (Notificar Nexus)
    ↓
Respond to Webhook (Página Sucesso)
```

---

## ⚙️ VARIÁVEIS DE AMBIENTE N8N

Configure estas variáveis no n8n:

```bash
# No n8n Settings → Environments
N8N_WEBHOOK_URL=https://seu-n8n.com
NEXUS_API_TOKEN=seu_token_jwt_nexus
```

---

## 🧪 TESTAR WORKFLOW

### Teste 1: Chamar webhook start

```bash
curl -X POST https://seu-n8n.com/webhook/notificame-oauth-start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "tenantId": 1,
    "userId": 1
  }'
```

**Deve retornar**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.instagram.com/oauth/authorize?...",
    "platform": "instagram"
  }
}
```

### Teste 2: Abrir URL OAuth

Copie a `authUrl` retornada e abra no navegador. Deve mostrar tela de login do Instagram.

---

## 🐛 PROBLEMAS COMUNS

### Erro: "Cannot read property 'body'"
**Causa**: Body do webhook vazio
**Solução**: Certifique-se de enviar JSON no body do POST

### Erro: "apikey invalid"
**Causa**: API Key incorreta
**Solução**: Verifique se usou: `0fb8e168-9331-11f0-88f5-0e386dc8b623`

### URL OAuth não retorna
**Causa**: Endpoint `/api/connect/{platform}` pode não existir
**Solução**: Testar endpoint diretamente:
```bash
curl -X GET "https://app.notificame.com.br/api/connect/instagram" \
  -H "apikey: 0fb8e168-9331-11f0-88f5-0e386dc8b623"
```

---

## 📝 PRÓXIMOS PASSOS

1. [ ] Criar workflow no n8n com os 9 nodes acima
2. [ ] Configurar variáveis de ambiente
3. [ ] Ativar workflow
4. [ ] Testar com cURL
5. [ ] Se funcionar, integrar com Nexus CRM

---

**Desenvolvido por**: Claude Code
**Data**: 2025-10-22
**Status**: Aguardando teste de endpoints NotificaMe API
