# ✅ AJUSTE FINAL - Workflow criar_sessao_waha

## 🎯 RESULTADO DOS TESTES

✅ **Sessão criada:** `session_01k737c5mqjndm1875x21yswfm`
✅ **Status:** `SCAN_QR_CODE`
✅ **Engine GOWS:** Conectada
✅ **QR Code:** **CONFIRMADO FUNCIONANDO!** (PNG 4.7KB, 276x276px)

**Endpoint correto:**
```
GET /api/screenshot?session=SESSION_NAME&screenshotType=qr
```

---

## ⚠️ PROBLEMA ATUAL

O workflow cria a sessão corretamente, mas **não retorna o QR Code** na resposta.

**Resposta atual:**
```json
{
  "success": true,
  "sessionName": "session_...",
  "status": "STARTING"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "sessionName": "session_...",
  "status": "SCAN_QR_CODE",
  "qrCode": "data:image/png;base64,iVBORw0KG..."
}
```

---

## 🔧 AJUSTE NECESSÁRIO NO N8N

### Opção 1: Retornar URL do QR Code (Mais Simples) ⭐

**No workflow `criar_sessao_waha`:**

1. **Abra o nó "Responder com QR Code"**
2. **Em "Response Body", altere para:**

```javascript
{{
  {
    "success": true,
    "sessionName": $('1. Criar Sessão WAHA').item.json.name,
    "status": $('2. Iniciar Sessão').item.json.status,
    "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=" + $('1. Criar Sessão WAHA').item.json.name + "&screenshotType=qr&api_key=bd0c416348b2f04d198ff8971b608a87"
  }
}}
```

3. **Salvar workflow**

**Vantagem:** Frontend recebe URL e pode exibir como `<img src="qrCodeUrl" />`

---

### Opção 2: Baixar QR e Retornar Base64 (Mais Completo)

**No workflow `criar_sessao_waha`:**

1. **Edite o nó "3. Obter QR Code":**
   - **URL:**
   ```
   https://apiwts.nexusatemporal.com.br/api/screenshot?session={{ $('1. Criar Sessão WAHA').item.json.name }}&screenshotType=qr
   ```
   - **Headers:** Adicionar
     ```
     Name: X-Api-Key
     Value: bd0c416348b2f04d198ff8971b608a87
     ```
   - **Response Format:** Alterar para "File"
   - **Binary Property:** `qrImage`

2. **Adicione um novo nó "Convert to Base64"** (Code node):
   ```javascript
   const qrBuffer = $input.item.binary.qrImage.data;
   const base64 = qrBuffer.toString('base64');

   return {
     qrCodeBase64: `data:image/png;base64,${base64}`
   };
   ```

3. **Edite o nó "Responder com QR Code":**
   ```javascript
   {{
     {
       "success": true,
       "sessionName": $('1. Criar Sessão WAHA').item.json.name,
       "status": $('2. Iniciar Sessão').item.json.status,
       "qrCode": $('Convert to Base64').item.json.qrCodeBase64
     }
   }}
   ```

4. **Salvar workflow**

---

## 🧪 TESTE RÁPIDO

Depois de salvar, teste assim:

```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-create-session" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"teste_ajuste"}'
```

**Resposta esperada (Opção 1):**
```json
{
  "success": true,
  "sessionName": "session_...",
  "status": "SCAN_QR_CODE",
  "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=..."
}
```

**Resposta esperada (Opção 2):**
```json
{
  "success": true,
  "sessionName": "session_...",
  "status": "SCAN_QR_CODE",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## 📱 TESTE NO FRONTEND

**Opção 1 (URL):** Atualizar `WhatsAppConnectionPanel.tsx`:

```typescript
// Linha 100
if (n8nData.success && n8nData.qrCodeUrl) {
  setQrCodeData(n8nData.qrCodeUrl);  // Já é uma URL válida
  setStatus('qr_ready');
  // ...
}
```

**Opção 2 (Base64):** Manter como está:

```typescript
// Linha 99-100
if (n8nData.success && n8nData.qrCode) {
  setQrCodeData(n8nData.qrCode);  // Data URI base64
  setStatus('qr_ready');
  // ...
}
```

---

## 📊 FLUXO COMPLETO APÓS AJUSTE

```
1. Usuario clica "Conectar WhatsApp"
   ↓
2. Frontend chama N8N Workflow
   POST /webhook/waha-create-session
   ↓
3. N8N cria sessão na WAHA
   POST /api/sessions
   ↓
4. N8N inicia sessão
   POST /api/sessions/{name}/start
   ↓
5. N8N aguarda 3 segundos
   ↓
6. N8N obtém QR Code
   GET /api/screenshot?session={name}&screenshotType=qr
   ↓
7. N8N retorna para frontend:
   {
     "success": true,
     "qrCodeUrl": "..." OU "qrCode": "data:image/png;base64,..."
   }
   ↓
8. Frontend exibe QR Code
   <img src={qrCodeData} />
   ↓
9. Usuario escaneia com WhatsApp
   ↓
10. WAHA detecta conexão
    Webhook → N8N → Backend Nexus
    ↓
11. Sistema pronto para receber/enviar mensagens!
```

---

## ✅ RECOMENDAÇÃO

Use **Opção 1 (URL)** porque:
- ✅ Mais simples
- ✅ Menos processamento no N8N
- ✅ QR Code sempre atualizado
- ✅ Funciona diretamente no `<img src="" />`

---

## 🆘 SE NÃO FUNCIONAR

Verifique:
1. Workflow está **ativo e salvo** ✅
2. Headers `X-Api-Key` configurado ✅
3. URL do screenshot está correta ✅
4. Aguardar 3s antes de pegar QR ✅

---

**Data:** 2025-10-08
**Status:** Pronto para ajuste final
**QR Code confirmado:** ✅ Funcionando!
