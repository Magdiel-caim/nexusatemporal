# 📥 COMO IMPORTAR WORKFLOWS NO N8N

## 🎯 Workflows Criados

Foram criados 3 workflows para integração WAHA + Nexus:

1. **`n8n_workflow_1_criar_sessao.json`** - Criar Sessão WhatsApp
2. **`n8n_workflow_2_receber_mensagens.json`** - Receber Mensagens WAHA
3. **`n8n_workflow_3_enviar_mensagens.json`** - Enviar Mensagens

---

## 📋 PASSO A PASSO PARA IMPORTAR

### 1️⃣ Acessar N8N

Acesse: **https://workflow.nexusatemporal.com**

### 2️⃣ Importar Workflows

Para CADA arquivo JSON:

1. **Clique no menu** (canto superior esquerdo)
2. **Selecione**: `Workflows` → `Import from File`
3. **Selecione o arquivo**:
   - Primeiro: `n8n_workflow_1_criar_sessao.json`
   - Depois: `n8n_workflow_2_receber_mensagens.json`
   - Por último: `n8n_workflow_3_enviar_mensagens.json`
4. **Clique em**: `Import`
5. **Salve o workflow** (botão Save)

### 3️⃣ Ativar Workflows

Depois de importar os 3 workflows:

1. Abra cada workflow
2. **Ative o toggle no canto superior direito** (deve ficar verde/azul)
3. Clique em **Save**

---

## 🔧 VERIFICAR URLs DOS WEBHOOKS

### Workflow 1: Criar Sessão

✅ **Webhook URL:**
```
https://workflow.nexusatemporal.com/webhook/waha-create-session
```

### Workflow 2: Receber Mensagens

✅ **Webhook URL:**
```
https://workflow.nexusatemporal.com/webhook/waha-receive-message
```

### Workflow 3: Enviar Mensagens

✅ **Webhook URL:**
```
https://workflow.nexusatemporal.com/webhook/waha-send-message
```

**Como verificar:**
1. Abra cada workflow
2. Clique no nó "Webhook Trigger" ou "Webhook WAHA"
3. Copie a URL exibida (Production URL)
4. Confirme que está correta

---

## 🧪 TESTAR WORKFLOWS

### Teste 1: Criar Sessão WhatsApp

```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-create-session" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"teste-n8n"}' \
  -k
```

**Resposta esperada:**
```json
{
  "success": true,
  "sessionName": "teste-n8n",
  "status": "SCAN_QR_CODE",
  "qrCode": "data:image/png;base64,..."
}
```

### Teste 2: Enviar Mensagem

```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "teste-n8n",
    "phoneNumber": "5511999999999",
    "content": "Teste via N8N"
  }' \
  -k
```

**Resposta esperada:**
```json
{
  "success": true,
  "messageId": "...",
  "status": "sent"
}
```

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (one.nexusatemporal.com.br)                   │
│  Usuario clica "Conectar WhatsApp"                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  N8N WORKFLOW 1: Criar Sessão                           │
│  POST /webhook/waha-create-session                      │
│                                                          │
│  1. Cria sessão na WAHA (engine GOWS)                   │
│  2. Inicia sessão (start)                               │
│  3. Aguarda 3 segundos                                  │
│  4. Obtém QR Code                                       │
│  5. Retorna QR Code para frontend                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  WAHA (apiwts.nexusatemporal.com.br)                    │
│  - Sessão criada com engine GOWS                        │
│  - QR Code gerado                                       │
│  - Webhook configurado para N8N                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Usuário escaneia QR Code
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Cliente envia mensagem via WhatsApp                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  N8N WORKFLOW 2: Receber Mensagens                      │
│  POST /webhook/waha-receive-message (webhook WAHA)      │
│                                                          │
│  1. Recebe webhook da WAHA                              │
│  2. Filtra apenas eventos "message"                     │
│  3. Processa dados da mensagem                          │
│  4. Envia para Backend Nexus                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND NEXUS (api.nexusatemporal.com.br)              │
│  POST /api/chat/webhook/n8n/message                     │
│                                                          │
│  1. Recebe mensagem do N8N                              │
│  2. Salva no PostgreSQL (tabela chat_messages)          │
│  3. Emite via WebSocket para frontend                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (WebSocket)                                   │
│  - Recebe mensagem em tempo real                        │
│  - Exibe no chat                                        │
│  - Notifica atendente                                   │
└─────────────────────────────────────────────────────────┘


ENVIAR MENSAGEM (Atendente → Cliente):
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                               │
│  Usuario digita mensagem e envia                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  N8N WORKFLOW 3: Enviar Mensagens                       │
│  POST /webhook/waha-send-message                        │
│                                                          │
│  1. Recebe dados da mensagem                            │
│  2. Envia via WAHA API (sendText)                       │
│  3. Salva no Backend Nexus (histórico)                  │
│  4. Retorna sucesso                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Cliente recebe mensagem no WhatsApp                    │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### WAHA API Key
```
bd0c416348b2f04d198ff8971b608a87
```

### URLs do Sistema
```
WAHA:     https://apiwts.nexusatemporal.com.br
N8N:      https://workflow.nexusatemporal.com
Backend:  https://api.nexusatemporal.com.br
Frontend: https://one.nexusatemporal.com.br
```

---

## 🚨 PRÓXIMOS PASSOS APÓS IMPORTAR

Depois de importar os workflows no N8N:

1. ✅ **Criar tabela de mensagens no backend** (Claude fará)
2. ✅ **Criar endpoint webhook no backend** (Claude fará)
3. ✅ **Atualizar frontend para chamar N8N** (Claude fará)
4. ✅ **Testar fluxo completo**

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Verificar execuções dos workflows no N8N (aba "Executions")
2. Verificar logs do backend: `docker service logs nexus_backend`
3. Consultar documentação WAHA: https://waha.devlike.pro/docs/

---

**Data:** 2025-10-08
**Versão:** v30.1
**Status:** Pronto para importar
