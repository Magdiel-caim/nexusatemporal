# 📥 Instruções: Importar Workflow de Recebimento de Mensagens WhatsApp

## 🎯 Objetivo
Importar o workflow N8N que receberá mensagens do WAHA e salvará no backend Nexus.

---

## 📝 Passo a Passo

### 1. Acessar o N8N
```
URL: https://workflow.nexusatemporal.com
```

### 2. Importar Workflow
1. Clique no menu superior direito (3 linhas)
2. Selecione **"Import from File"** ou **"Importar de Arquivo"**
3. Selecione o arquivo: `n8n_workflow_2_receber_mensagens.json`
4. Clique em **"Import"**

### 3. Verificar Configuração do Workflow

O workflow importado tem 4 nós:

#### **Nó 1: Webhook WAHA**
- **Tipo:** Webhook
- **Path:** `waha-receive-message`
- **URL Completa:** `https://workflow.nexusatemporal.com/webhook/waha-receive-message`
- **HTTP Method:** POST
- ✅ **Ação:** Nenhuma - já está configurado

#### **Nó 2: Filtrar Mensagens**
- **Tipo:** Filter
- **Condição:** `{{ $json.body.event }} equals "message"`
- ✅ **Ação:** Nenhuma - já está configurado

#### **Nó 3: Processar Mensagem**
- **Tipo:** Code (JavaScript)
- **Função:** Extrair dados da mensagem WAHA
- ✅ **Ação:** Nenhuma - já está configurado

#### **Nó 4: Enviar para Nexus Backend**
- **Tipo:** HTTP Request
- **URL:** `https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message`
- **Method:** POST
- **Content-Type:** `application/json`
- ✅ **Ação:** Nenhuma - já está configurado

### 4. Ativar o Workflow
1. No canto superior direito, clique no botão toggle **"Active"** (deve ficar verde)
2. Confirme que está ativo

### 5. Copiar URL do Webhook
1. Clique no nó **"Webhook WAHA"**
2. No painel direito, você verá a **"Production URL"**
3. Copie a URL completa:
   ```
   https://workflow.nexusatemporal.com/webhook/waha-receive-message
   ```

---

## 🔧 Configurar Webhook no WAHA

Agora que o workflow N8N está importado e ativo, precisamos configurar o WAHA para enviar mensagens para ele.

### Opção 1: Via CURL (Linha de Comando)

```bash
# Configurar webhook no WAHA para enviar todas as mensagens ao N8N
curl -X POST "https://apiwts.nexusatemporal.com.br/api/webhooks" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
    "events": ["message"],
    "webhookId": "nexus-receive-messages",
    "session": "all"
  }'
```

**Resposta esperada:**
```json
{
  "id": "...",
  "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
  "events": ["message"],
  "status": "active"
}
```

### Opção 2: Via API do WAHA (Swagger UI)

1. Acesse: `https://apiwts.nexusatemporal.com.br/swagger`
2. Clique em **"Authorize"** e insira:
   - **API Key:** `bd0c416348b2f04d198ff8971b608a87`
3. Vá para a seção **"Webhooks"**
4. Clique em **"POST /api/webhooks"**
5. Clique em **"Try it out"**
6. Cole no body:
   ```json
   {
     "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
     "events": ["message"],
     "webhookId": "nexus-receive-messages",
     "session": "all"
   }
   ```
7. Clique em **"Execute"**

---

## 🧪 Testar Configuração

### 1. Listar Webhooks Configurados

```bash
curl -X GET "https://apiwts.nexusatemporal.com.br/api/webhooks" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k
```

**Resposta esperada:**
```json
[
  {
    "id": "...",
    "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
    "events": ["message"],
    "webhookId": "nexus-receive-messages",
    "session": "all",
    "status": "active"
  }
]
```

### 2. Enviar Mensagem de Teste

1. Envie uma mensagem para o número WhatsApp conectado via WAHA
2. Verifique os logs do N8N:
   - Acesse `https://workflow.nexusatemporal.com`
   - Clique em **"Executions"** no menu superior
   - Veja se aparece uma nova execução do workflow **"WAHA - Receber Mensagens"**
   - Status deve ser **Verde (Success)**

3. Verifique os logs do backend:
   ```bash
   docker logs $(docker ps -q -f name=nexus_backend) --tail 50 | grep "Mensagem recebida"
   ```

   **Saída esperada:**
   ```
   📨 Mensagem recebida do N8N: { session: 'session_...', from: '5511999999999', type: 'text', direction: 'incoming' }
   ✅ Mensagem emitida via WebSocket
   ```

### 3. Verificar no Frontend

1. Acesse: `https://one.nexusatemporal.com.br`
2. Faça login
3. Vá para **Chat**
4. Você deve ver a conversa aparecer na lista de conversas
5. Clique na conversa e veja a mensagem recebida

---

## ❌ Troubleshooting

### Problema: Webhook não dispara no N8N

**Solução:**
1. Verifique se o workflow está **Ativo** (toggle verde)
2. Verifique se o webhook no WAHA está configurado:
   ```bash
   curl -X GET "https://apiwts.nexusatemporal.com.br/api/webhooks" \
     -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" -k
   ```
3. Teste manualmente o webhook do N8N:
   ```bash
   curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
     -H "Content-Type: application/json" \
     -d '{
       "body": {
         "event": "message",
         "session": "test",
         "payload": {
           "id": "test123",
           "from": "5511999999999@c.us",
           "body": "Teste manual",
           "type": "text",
           "timestamp": 1696800000,
           "fromMe": false,
           "_data": {
             "notifyName": "Contato Teste"
           }
         }
       }
     }'
   ```

### Problema: Mensagem não aparece no backend

**Solução:**
1. Verifique logs do backend:
   ```bash
   docker logs $(docker ps -q -f name=nexus_backend) -f | grep -E "Mensagem|ERROR"
   ```
2. Verifique se a rota está registrada:
   ```bash
   docker exec $(docker ps -q -f name=nexus_backend) cat /app/src/modules/chat/n8n-webhook.routes.ts
   ```

### Problema: Mensagem não aparece no frontend

**Solução:**
1. Abra o DevTools (F12) → Console
2. Verifique se há evento `chat:new-message`:
   ```javascript
   // Deve aparecer no console quando chegar mensagem
   ```
3. Verifique conexão WebSocket:
   ```javascript
   // No console do navegador
   socket.connected // deve ser true
   ```

---

## ✅ Checklist de Validação

- [ ] Workflow N8N importado e **ATIVO**
- [ ] Webhook WAHA configurado apontando para N8N
- [ ] Teste manual do webhook N8N funciona
- [ ] Mensagem de teste enviada via WhatsApp
- [ ] Execução do workflow N8N aparece como **Success**
- [ ] Log do backend mostra "Mensagem recebida do N8N"
- [ ] Conversa aparece na lista do frontend
- [ ] Mensagem aparece dentro da conversa

---

## 📋 Próximos Passos

Após validar o recebimento de mensagens:

1. ✅ **Receber Mensagens** (este guia)
2. ⏳ **Enviar Mensagens** para WhatsApp
3. ⏳ **Histórico de Conversas** completo
4. ⏳ **Notificações em Tempo Real**
5. ⏳ **Reconexão Automática**

---

**📅 Data:** 2025-10-09
**👤 Autor:** Magdiel Caim + Claude Code
**📌 Versão:** v30.4
