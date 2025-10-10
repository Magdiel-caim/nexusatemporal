# 🧪 Guia de Teste - Recebimento de Mensagens WhatsApp

## 📋 Status da Implementação

✅ **IMPLEMENTADO v30.4** - Recebimento de Mensagens WhatsApp

---

## 🎯 O Que Foi Implementado

### 1. Workflow N8N para Recebimento ✅
- **Arquivo:** `n8n_workflow_2_receber_mensagens.json`
- **Webhook:** `https://workflow.nexusatemporal.com/webhook/waha-receive-message`
- **Fluxo:**
  1. Webhook recebe evento do WAHA
  2. Filtra apenas eventos tipo "message"
  3. Processa e estrutura dados da mensagem
  4. Envia para backend Nexus via POST

### 2. Workflow de Criação Atualizado ✅
- **Arquivo:** `n8n_workflow_1_criar_sessao_SIMPLES.json`
- **Mudança:** Agora cria sessões WAHA com webhooks pré-configurados
- **Webhook automático:** Todas as novas sessões já vêm configuradas para enviar mensagens ao N8N

### 3. Backend - Recebimento via N8N ✅
- **Endpoint:** `POST /api/chat/webhook/n8n/message`
- **Controller:** `n8n-webhook.controller.ts`
- **Funcionalidades:**
  - Recebe mensagens do N8N
  - Salva no PostgreSQL (`chat_messages`)
  - Emite via WebSocket (`chat:new-message`)

### 4. Backend - Listagem de Conversas WhatsApp ✅
- **Endpoint:** `GET /api/chat/conversations`
- **Controller:** `n8n-webhook.controller.ts` (método `getConversations`)
- **Retorna:** Lista de conversas WhatsApp agrupadas por número

### 5. Frontend - ChatPage com WhatsApp ✅
- **Arquivo:** `frontend/src/pages/ChatPage.tsx`
- **Funcionalidades:**
  - Carrega conversas WhatsApp + conversas normais
  - Listener WebSocket `chat:new-message`
  - Atualiza lista em tempo real
  - Exibe mensagens WhatsApp no chat
  - Toast notification para novas mensagens

### 6. Frontend - ChatService ✅
- **Arquivo:** `frontend/src/services/chatService.ts`
- **Métodos adicionados:**
  - `getWhatsAppConversations()` - Lista conversas WhatsApp
  - `getWhatsAppMessages(sessionName, phoneNumber)` - Lista mensagens de uma conversa

---

## 🧪 Como Testar (Passo a Passo)

### **PRÉ-REQUISITO: Importar Workflow N8N**

1. Acesse `https://workflow.nexusatemporal.com`
2. Faça login no N8N
3. Clique em **"Import from File"**
4. Selecione: `n8n_workflow_2_receber_mensagens.json`
5. Clique em **"Import"**
6. **ATIVE** o workflow (toggle no canto superior direito deve ficar verde)
7. Copie a URL do webhook:
   ```
   https://workflow.nexusatemporal.com/webhook/waha-receive-message
   ```

---

### **TESTE 1: Criar Nova Sessão WhatsApp (com webhook automático)**

Desde a atualização v30.4, todas as novas sessões já são criadas com webhook configurado automaticamente.

#### Passos:
1. Acesse `https://one.nexusatemporal.com.br`
2. Faça login: `teste@nexusatemporal.com.br` / `123456`
3. Vá para **Chat** no menu
4. Clique em **"Conectar WhatsApp"**
5. Digite nome da sessão (ex: `teste_receber`)
6. Clique em **"Conectar WhatsApp"**
7. Escaneie o QR Code com seu WhatsApp
8. Aguarde conectar ✅

#### Verificar webhook configurado:
```bash
SESSION="teste_receber"
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k -s | python3 -m json.tool | grep -A 5 "webhooks"
```

**Saída esperada:**
```json
"webhooks": [
  {
    "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
    "events": ["message", "message.any"]
  }
]
```

---

### **TESTE 2: Enviar Mensagem via WhatsApp**

#### Passos:
1. **Do seu celular**, envie uma mensagem **PARA** o número WhatsApp conectado
2. Aguarde 2-3 segundos

#### Verificar logs do N8N:
1. Acesse `https://workflow.nexusatemporal.com`
2. Clique em **"Executions"** no menu superior
3. Procure execução do workflow **"WAHA - Receber Mensagens"**
4. Status deve estar **Verde (Success)** ✅
5. Clique na execução para ver detalhes de cada nó

#### Verificar logs do backend:
```bash
docker logs $(docker ps -q -f name=nexus_backend) --tail 100 | grep -A 5 "Mensagem recebida"
```

**Saída esperada:**
```
📨 Mensagem recebida do N8N: { session: 'teste_receber', from: '5511999999999', type: 'text', direction: 'incoming' }
✅ Mensagem emitida via WebSocket
```

#### Verificar no banco de dados:
```bash
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U postgres -d nexusatemporal -c \
  "SELECT id, phone_number, contact_name, content, direction, created_at
   FROM chat_messages ORDER BY created_at DESC LIMIT 5;"
```

**Saída esperada:**
```
 id | phone_number  |  contact_name  |     content      | direction |      created_at
----+---------------+----------------+------------------+-----------+---------------------
  1 | 5511999999999 | João Silva     | Olá, tudo bem?   | incoming  | 2025-10-09 10:30:45
```

---

### **TESTE 3: Ver Mensagem no Frontend**

#### Passos:
1. Acesse `https://one.nexusatemporal.com.br/chat`
2. Faça login se necessário
3. Aguarde 2-3 segundos para carregar conversas
4. Você deve ver a conversa na lista à esquerda:
   - **Nome:** Nome do contato ou número
   - **Última mensagem:** Preview da mensagem
   - **Horário:** Timestamp da mensagem

#### Verificar:
- [ ] Conversa aparece na lista de conversas ✅
- [ ] Preview da mensagem está correto ✅
- [ ] Ao clicar na conversa, mensagens são carregadas ✅
- [ ] Mensagens aparecem com balão à esquerda (incoming) ✅

#### DevTools (F12) - Console:
```javascript
// Você deve ver este log quando abrir o chat:
📱 Nova mensagem WhatsApp recebida: {
  id: "...",
  phoneNumber: "5511999999999",
  contactName: "João Silva",
  content: "Olá, tudo bem?",
  direction: "incoming",
  messageType: "text"
}
```

---

### **TESTE 4: Recebimento em Tempo Real**

#### Passos:
1. Abra o frontend no navegador: `https://one.nexusatemporal.com.br/chat`
2. Selecione uma conversa WhatsApp
3. **Do seu celular**, envie outra mensagem para o número conectado
4. **Aguarde 2-3 segundos**

#### Verificar:
- [ ] Mensagem aparece automaticamente no chat ✅
- [ ] Toast notification aparece (se estiver em outra conversa) ✅
- [ ] Lista de conversas é atualizada ✅
- [ ] Não precisa dar refresh na página ✅

---

## 🐛 Troubleshooting

### Problema: Mensagem não aparece no N8N

**Possíveis causas:**
1. Workflow não está ativo
2. Webhook não está configurado no WAHA
3. Sessão WhatsApp foi criada antes da atualização v30.4

**Soluções:**

#### 1. Verificar se workflow está ativo:
```
- Acesse https://workflow.nexusatemporal.com
- Workflow "WAHA - Receber Mensagens" deve ter toggle VERDE
```

#### 2. Verificar webhook configurado:
```bash
curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -k -s | python3 -m json.tool | grep -A 5 "webhooks"
```

Se não retornar webhooks, **desconecte e reconecte o WhatsApp** (criar nova sessão).

#### 3. Testar webhook manualmente:
```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "event": "message",
      "session": "teste",
      "payload": {
        "id": "test123",
        "from": "5511999999999@c.us",
        "body": "Teste manual",
        "type": "text",
        "timestamp": 1696800000,
        "fromMe": false,
        "_data": {
          "notifyName": "Teste Manual"
        }
      }
    }
  }'
```

**Resposta esperada:** HTTP 200

---

### Problema: Mensagem aparece no N8N mas não no backend

**Verificar logs do backend:**
```bash
docker logs $(docker ps -q -f name=nexus_backend) -f | grep -E "Mensagem|ERROR"
```

**Possíveis erros:**
```
❌ Erro ao processar mensagem do N8N: ...
```

**Soluções:**
1. Verificar se tabela `chat_messages` existe:
```bash
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U postgres -d nexusatemporal -c "\d chat_messages"
```

2. Verificar se backend está rodando:
```bash
docker service ps nexus_backend
```

3. Verificar se rota está registrada:
```bash
curl -X POST "https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message" \
  -H "Content-Type: application/json" \
  -k -s \
  -d '{"sessionName":"test","phoneNumber":"5511999999999","content":"Teste","direction":"incoming","messageType":"text"}'
```

---

### Problema: Mensagem salva no banco mas não aparece no frontend

**Verificar WebSocket:**
1. Abra DevTools (F12) → Network → WS
2. Procure por conexão WebSocket
3. Status deve ser **101 Switching Protocols** ✅

**Verificar console:**
```javascript
// No console do navegador, digite:
socket.connected // deve retornar: true
```

**Verificar emissão do evento:**
```bash
docker logs $(docker ps -q -f name=nexus_backend) --tail 50 | grep "Mensagem emitida via WebSocket"
```

**Saída esperada:**
```
✅ Mensagem emitida via WebSocket
```

---

## 📊 Checklist de Validação Completa

- [ ] ✅ Workflow N8N importado e ativo
- [ ] ✅ Webhook WAHA configurado automaticamente (nova sessão)
- [ ] ✅ Enviar mensagem via WhatsApp
- [ ] ✅ Execução do N8N aparece como Success
- [ ] ✅ Log do backend: "Mensagem recebida do N8N"
- [ ] ✅ Mensagem salva no PostgreSQL (`chat_messages`)
- [ ] ✅ Log do backend: "Mensagem emitida via WebSocket"
- [ ] ✅ Conversa aparece na lista do frontend
- [ ] ✅ Mensagem aparece dentro da conversa
- [ ] ✅ Recebimento em tempo real funciona (sem refresh)
- [ ] ✅ Toast notification aparece
- [ ] ✅ WebSocket conectado (DevTools → WS)

---

## 🔄 Fluxo Completo Funcionando

```
1. WhatsApp (Celular) → Envia mensagem
   ↓
2. WAHA (API WhatsApp) → Recebe mensagem
   ↓
3. WAHA Webhook → Envia evento para N8N
   POST https://workflow.nexusatemporal.com/webhook/waha-receive-message
   ↓
4. N8N Workflow "Receber Mensagens"
   → Nó 1: Recebe webhook
   → Nó 2: Filtra evento "message"
   → Nó 3: Processa e estrutura dados
   → Nó 4: Envia para backend Nexus
   ↓
5. Backend Nexus (/api/chat/webhook/n8n/message)
   → Salva no PostgreSQL (chat_messages)
   → Emite via Socket.IO (chat:new-message)
   ↓
6. Frontend ChatPage
   → Listener Socket.IO recebe evento
   → Atualiza lista de conversas
   → Adiciona mensagem no chat
   → Exibe toast notification
   ↓
7. ✅ Mensagem aparece em tempo real!
```

---

## 📝 Próximos Passos

### Funcionalidades Pendentes:

1. **Enviar Mensagens para WhatsApp** ⏳
   - Workflow N8N já criado: `n8n_workflow_3_enviar_mensagens.json`
   - Precisa integrar com input de mensagens no frontend
   - Endpoint backend para enviar via N8N

2. **Tipos de Mensagem** ⏳
   - Receber/enviar imagens
   - Receber/enviar áudios
   - Receber/enviar documentos
   - Receber/enviar vídeos

3. **Histórico Completo** ⏳
   - Sincronizar conversas antigas do WhatsApp
   - Buscar mensagens antigas do WAHA

4. **Relacionamento com Leads** ⏳
   - Vincular conversas WhatsApp com leads
   - Criar leads automaticamente a partir de conversas

5. **Múltiplas Sessões** ⏳
   - Gerenciar múltiplos WhatsApp conectados
   - Seletor de sessão na UI

6. **Monitoramento** ⏳
   - Webhook de status do WAHA (desconexão)
   - Reconexão automática
   - Alertas de falha

---

**📅 Data:** 2025-10-09
**👤 Autor:** Magdiel Caim + Claude Code
**📌 Versão:** v30.4
**✅ Status:** RECEBIMENTO DE MENSAGENS FUNCIONANDO!
