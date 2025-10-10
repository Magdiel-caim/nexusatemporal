# 📱 Status de Integração WhatsApp - Mensagens (v32)

**Data:** 2025-10-10
**Versão:** v32.0 (em desenvolvimento)

---

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### 1. **Banco de Dados** ✅

**Tabela:** `chat_messages`

**Estrutura:**
```sql
- id (UUID) - Chave primária
- session_name (VARCHAR 255) - Nome técnico da sessão WAHA
- phone_number (VARCHAR 50) - Número de telefone (sem @c.us para individuais, com @g.us para grupos)
- contact_name (VARCHAR 255) - Nome do contato
- direction ('incoming' | 'outgoing') - Direção da mensagem
- message_type (VARCHAR 50) - Tipo: 'text', 'image', 'audio', 'video', etc
- content (TEXT) - Conteúdo da mensagem
- media_url (TEXT) - URL da mídia (se houver)
- waha_message_id (VARCHAR 255) - ID único do WAHA
- status (VARCHAR 50) - Status: 'received', 'sent', 'delivered', 'read'
- created_at (TIMESTAMP) - Data de criação
- metadata (JSONB) - Dados adicionais em JSON
- is_read (BOOLEAN) - Se foi lida (default: false para incoming, true para outgoing)
```

**Índices:**
- `idx_chat_messages_session` - session_name
- `idx_chat_messages_phone` - phone_number
- `idx_chat_messages_created` - created_at DESC
- `idx_chat_messages_is_read` - is_read

**Status:** ✅ **100% FUNCIONAL** - Tabela criada e funcional

---

### 2. **Backend - Receber Mensagens** ✅

#### a) Webhook WAHA Direto
**Endpoint:** `POST /api/chat/webhook/waha/message` (sem autenticação)
**Controller:** `N8NWebhookController.receiveWAHAWebhook()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 427-627)

**Funcionalidades:**
- ✅ Recebe webhooks diretamente do WAHA
- ✅ Filtra eventos de mensagem (`message`, `message.any`)
- ✅ Processa mensagens revogadas (`message.revoked`)
- ✅ Ignora status do WhatsApp (`status@broadcast`)
- ✅ Diferencia grupos (`@g.us`) vs individuais
- ✅ Extrai phoneNumber, contactName, messageType, content
- ✅ Salva no banco de dados
- ✅ Emite via WebSocket (`chat:new-message`)
- ✅ Emite deletar via WebSocket (`chat:message-deleted`)

**Eventos Suportados:**
- `message` - Mensagem nova
- `message.any` - Mensagem qualquer
- `message.revoked` - Mensagem deletada

**Status:** ✅ **100% FUNCIONAL**

---

#### b) Polling Service (Backup)
**Service:** `WhatsAppSyncService`
**Arquivo:** `backend/src/services/WhatsAppSyncService.ts`

**Funcionalidades:**
- ✅ Polling a cada 5 segundos
- ✅ Busca chats ativos do WAHA
- ✅ Busca últimas 20 mensagens de cada chat
- ✅ Verifica duplicatas via `waha_message_id`
- ✅ Salva no banco
- ✅ Emite via WebSocket
- ✅ Pode ser desativado via `ENABLE_WHATSAPP_POLLING=false`

**Limitações:**
- ❌ Hardcoded para uma sessão específica: `session_01k74cqnky2pv9bn8m8wctad9t`
- ⚠️ Ignora grupos (`@g.us`)

**Status:** ✅ **FUNCIONAL** mas precisa ser **atualizado para suportar múltiplas sessões**

---

### 3. **Backend - Enviar Mensagens** ✅

**Endpoint:** `POST /api/chat/n8n/send-message` (autenticado)
**Controller:** `N8NWebhookController.sendMessage()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 314-424)

**Payload:**
```json
{
  "sessionName": "session_01k...",
  "phoneNumber": "554199999999",
  "content": "Olá!"
}
```

**Funcionalidades:**
- ✅ Envia mensagem via WAHA API (`/api/sendText`)
- ✅ Salva mensagem enviada no banco
- ✅ Marca como `direction: 'outgoing'`, `status: 'sent'`, `is_read: true`
- ✅ Emite via WebSocket (`chat:new-message`)
- ✅ Retorna ID da mensagem salva

**Status:** ✅ **100% FUNCIONAL**

---

### 4. **Backend - Listar Conversas** ✅

**Endpoint:** `GET /api/chat/n8n/conversations` (autenticado)
**Controller:** `N8NWebhookController.getConversations()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 187-235)

**SQL Query:**
```sql
- Agrupa mensagens por session_name + phone_number
- Busca última mensagem de cada conversa
- Conta mensagens não lidas (WHERE is_read = false AND direction = 'incoming')
- Detecta tipo de chat (grupo se phone_number LIKE '%@g.us')
- Ordena por data da última mensagem (DESC)
```

**Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "sessionName": "session_01k...",
      "phoneNumber": "554199999999",
      "contactName": "João",
      "lastMessage": "Olá!",
      "lastMessageAt": "2025-10-10T19:00:00Z",
      "unreadCount": 3,
      "chatType": "individual"
    }
  ]
}
```

**Status:** ✅ **100% FUNCIONAL**

---

### 5. **Backend - Listar Mensagens** ✅

**Endpoint:** `GET /api/chat/n8n/messages/:sessionName?phoneNumber=xxx` (autenticado)
**Controller:** `N8NWebhookController.getMessages()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 138-181)

**Parâmetros:**
- `sessionName` (path) - Nome da sessão
- `phoneNumber` (query) - Número do telefone
- `limit` (query, default: 50) - Limite de mensagens
- `offset` (query, default: 0) - Offset para paginação

**Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sessionName": "session_01k...",
      "phoneNumber": "554199999999",
      "contactName": "João",
      "direction": "incoming",
      "messageType": "text",
      "content": "Olá!",
      "mediaUrl": null,
      "status": "received",
      "createdAt": "2025-10-10T19:00:00Z"
    }
  ]
}
```

**Status:** ✅ **100% FUNCIONAL**

---

### 6. **Backend - Marcar como Lido** ✅

**Endpoint:** `POST /api/chat/n8n/messages/:sessionName/mark-read?phoneNumber=xxx` (autenticado)
**Controller:** `N8NWebhookController.markAsRead()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 241-274)

**Funcionalidades:**
- ✅ Marca todas as mensagens `incoming` como lidas
- ✅ Filtra por sessionName + phoneNumber
- ✅ Apenas mensagens não lidas (`is_read = false`)

**Status:** ✅ **100% FUNCIONAL**

---

### 7. **Backend - Deletar Mensagem** ✅

**Endpoint:** `DELETE /api/chat/n8n/messages/:messageId` (autenticado)
**Controller:** `N8NWebhookController.deleteMessage()`
**Arquivo:** `backend/src/modules/chat/n8n-webhook.controller.ts` (linhas 280-308)

**Funcionalidades:**
- ✅ Deleta mensagem do banco por ID
- ✅ Retorna 404 se não encontrada
- ❌ **NÃO deleta no WhatsApp via WAHA** (apenas no banco local)

**Status:** ✅ **FUNCIONAL** (deleta apenas do banco)

---

### 8. **Frontend - Listar Conversas** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**Função:** `loadConversations()` (linhas 195-240)

**Funcionalidades:**
- ✅ Carrega conversas normais
- ✅ Carrega conversas WhatsApp via `/api/chat/n8n/conversations`
- ✅ Mescla e ordena por última mensagem
- ✅ Diferencia individuais vs grupos (filtro)
- ✅ Mostra contador de não lidas

**Status:** ✅ **100% FUNCIONAL**

---

### 9. **Frontend - Listar Mensagens** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**Função:** `loadMessages()` (linhas 242-281)

**Funcionalidades:**
- ✅ Detecta se é conversa WhatsApp (ID começa com `whatsapp-`)
- ✅ Busca mensagens via `/api/chat/n8n/messages/:sessionName?phoneNumber=xxx`
- ✅ Converte para formato `Message`
- ✅ Exibe em ordem cronológica

**Status:** ✅ **100% FUNCIONAL**

---

### 10. **Frontend - Receber Mensagens em Tempo Real** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**WebSocket Event:** `chat:new-message` (linhas 83-122)

**Funcionalidades:**
- ✅ Escuta evento `chat:new-message` via Socket.IO
- ✅ Atualiza lista de conversas
- ✅ Se conversa está selecionada: adiciona mensagem ao chat
- ✅ Se não: exibe toast notification
- ✅ Usa ref para evitar closure stale

**Status:** ✅ **100% FUNCIONAL**

---

### 11. **Frontend - Deletar Mensagens em Tempo Real** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**WebSocket Event:** `chat:message-deleted` (linhas 125-141)

**Funcionalidades:**
- ✅ Escuta evento `chat:message-deleted` via Socket.IO
- ✅ Remove mensagem da UI
- ✅ Atualiza lista de conversas
- ✅ Exibe toast notification

**Status:** ✅ **100% FUNCIONAL**

---

### 12. **Frontend - Deletar Mensagem (Manual)** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**Função:** `handleDeleteMessage()` (linhas 365-379)

**Funcionalidades:**
- ✅ Confirmação antes de deletar
- ✅ Chama endpoint `/api/chat/n8n/messages/:messageId`
- ✅ Remove da UI
- ✅ Atualiza lista de conversas
- ✅ Toast de sucesso/erro

**Status:** ✅ **FUNCIONAL** (deleta apenas do banco local, não do WhatsApp)

---

### 13. **Frontend - Marcar como Lido** ✅

**Arquivo:** `frontend/src/pages/ChatPage.tsx`
**Função:** `markConversationAsRead()` (linhas 292-313)

**Funcionalidades:**
- ✅ Detecta se é conversa WhatsApp
- ✅ Chama endpoint correto
- ✅ Recarrega lista de conversas

**Status:** ✅ **100% FUNCIONAL**

---

## ❌ O QUE AINDA FALTA IMPLEMENTAR

### 1. **Enviar Mensagens do Frontend** ❌

**Problema:**
- Frontend tem input de mensagem (`ChatPage.tsx` linhas 706-734)
- Função `sendMessage()` existe (linhas 315-341)
- **MAS:** Chama `chatService.sendMessage(conversationId, ...)` que é para conversas **normais**, não WhatsApp

**O que falta:**
```typescript
// No frontend/src/pages/ChatPage.tsx
const sendMessage = async () => {
  if (!messageInput.trim() || !selectedConversation) return;

  try {
    // ❌ FALTA: Detectar se é conversa WhatsApp
    if (selectedConversation.id.startsWith('whatsapp-')) {
      // ❌ FALTA: Chamar endpoint WhatsApp
      const sessionName = selectedConversation.whatsappInstanceId;
      const phoneNumber = selectedConversation.phoneNumber;

      const newMessage = await chatService.sendWhatsAppMessage(sessionName, phoneNumber, messageInput);

      setMessages((prev) => [...prev, newMessage]);
      setMessageInput('');
      scrollToBottom();
      toast.success('Mensagem enviada');
    } else {
      // Conversa normal (código atual)
      const newMessage = await chatService.sendMessage(selectedConversation.id, {
        type: 'text',
        content: messageInput,
      });
      // ...
    }
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erro ao enviar mensagem');
  }
};
```

**Arquivo:** `frontend/src/services/chatService.ts`
```typescript
// ❌ FALTA: Adicionar método
async sendWhatsAppMessage(sessionName: string, phoneNumber: string, content: string) {
  const { data } = await api.post('/chat/n8n/send-message', {
    sessionName,
    phoneNumber,
    content,
  });
  return data.data; // Retorna a mensagem salva
}
```

**Status:** ❌ **NÃO IMPLEMENTADO**

---

### 2. **Editar Mensagem** ❌

**O que falta:**

#### Backend:
```typescript
// ❌ FALTA: Endpoint para editar mensagem
// PUT /api/chat/n8n/messages/:messageId

async updateMessage(req: Request, res: Response) {
  const { messageId } = req.params;
  const { content } = req.body;

  // 1. Atualizar no banco
  await AppDataSource.query(
    `UPDATE chat_messages SET content = $1 WHERE id = $2`,
    [content, messageId]
  );

  // 2. ❌ PROBLEMA: WAHA não tem API para editar mensagens
  // WhatsApp Web API não suporta editar mensagens enviadas
  // Apenas deletar e reenviar

  // 3. Emitir via WebSocket
  io.emit('chat:message-updated', { messageId, content });

  res.json({ success: true });
}
```

**⚠️ LIMITAÇÃO DO WAHA/WhatsApp:**
- WhatsApp Web API **NÃO suporta** editar mensagens enviadas
- Apenas deletar e reenviar
- Solução: Marcar como "editada" no banco e exibir histórico de edições

**Status:** ❌ **NÃO IMPLEMENTADO** (e limitado pelo WAHA)

---

### 3. **Responder Mensagem (Reply)** ❌

**O que falta:**

#### Backend:
```typescript
// ❌ FALTA: Suporte a quotedMessage no endpoint de envio

async sendMessage(req: Request, res: Response) {
  const { sessionName, phoneNumber, content, quotedMessageId } = req.body;

  // Enviar via WAHA com reply
  const wahaResponse = await fetch(`${wahaUrl}/api/sendText`, {
    method: 'POST',
    headers: { 'X-Api-Key': wahaApiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: sessionName,
      chatId: `${phoneNumber}@c.us`,
      text: content,
      // ❌ FALTA: Adicionar reply
      reply_to: quotedMessageId, // ID da mensagem sendo respondida
    }),
  });

  // Salvar no banco com referência à mensagem respondida
  await AppDataSource.query(
    `INSERT INTO chat_messages (
      ...
      metadata
    ) VALUES (..., $11)`,
    [
      // ...
      JSON.stringify({ quotedMessageId }), // Salvar ID da mensagem respondida
    ]
  );
}
```

#### Frontend:
```typescript
// ❌ FALTA: UI para responder mensagem

const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);

// Botão "Responder" ao lado de cada mensagem
<button onClick={() => setQuotedMessage(message)}>
  Responder
</button>

// Exibir preview da mensagem sendo respondida
{quotedMessage && (
  <div className="bg-gray-100 p-2 border-l-4 border-indigo-600">
    <p className="text-xs text-gray-600">Respondendo a:</p>
    <p className="text-sm">{quotedMessage.content}</p>
    <button onClick={() => setQuotedMessage(null)}>
      <X className="h-4 w-4" />
    </button>
  </div>
)}

// Enviar com quotedMessageId
await chatService.sendWhatsAppMessage(sessionName, phoneNumber, content, quotedMessage?.id);
```

**Status:** ❌ **NÃO IMPLEMENTADO**

---

### 4. **Pesquisar Mensagens** ❌

**O que falta:**

#### Backend:
```typescript
// ❌ FALTA: Endpoint de pesquisa
// GET /api/chat/n8n/messages/search?query=xxx&sessionName=xxx&phoneNumber=xxx

async searchMessages(req: Request, res: Response) {
  const { query, sessionName, phoneNumber } = req.query;

  const messages = await AppDataSource.query(
    `SELECT * FROM chat_messages
     WHERE session_name = $1
     AND phone_number = $2
     AND content ILIKE $3
     ORDER BY created_at DESC
     LIMIT 50`,
    [sessionName, phoneNumber, `%${query}%`]
  );

  res.json({ success: true, data: messages });
}
```

#### Frontend:
```typescript
// ❌ FALTA: UI de pesquisa dentro da conversa

const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<Message[]>([]);

// Input de pesquisa
<input
  type="text"
  placeholder="Pesquisar mensagens..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// Buscar ao digitar
useEffect(() => {
  if (searchQuery.length >= 3) {
    searchMessages(searchQuery);
  }
}, [searchQuery]);

// Destacar resultados na conversa
{messages.map((message) => (
  <div className={searchResults.includes(message) ? 'bg-yellow-100' : ''}>
    {message.content}
  </div>
))}
```

**Status:** ❌ **NÃO IMPLEMENTADO**

---

### 5. **Polling Service - Múltiplas Sessões** ⚠️

**Problema Atual:**
```typescript
// backend/src/services/WhatsAppSyncService.ts
private readonly SESSION_NAME = 'session_01k74cqnky2pv9bn8m8wctad9t'; // ❌ HARDCODED
```

**O que falta:**
```typescript
// ✅ Buscar todas as sessões ativas do banco
async getActiveSessions(): Promise<string[]> {
  const sessions = await AppDataSource.query(
    `SELECT session_name FROM whatsapp_sessions WHERE status = 'WORKING'`
  );
  return sessions.map(s => s.session_name);
}

// ✅ Sincronizar todas as sessões
private async syncMessages() {
  const sessions = await this.getActiveSessions();

  for (const sessionName of sessions) {
    const chats = await this.getWAHAChats(sessionName);
    for (const chat of chats) {
      await this.syncChatMessages(sessionName, chat.id);
    }
  }
}
```

**Status:** ⚠️ **PARCIAL** (funciona apenas para 1 sessão)

---

### 6. **Suporte a Grupos** ⚠️

**O que já funciona:**
- ✅ Backend salva grupos (phoneNumber com `@g.us`)
- ✅ Frontend detecta grupos (`chatType: 'group'`)
- ✅ Filtro de grupos funciona

**O que falta:**
- ⚠️ Polling Service ignora grupos (`if (chatId.includes('@g.us')) return;`)
- ❌ UI não mostra nome do participante em grupos
- ❌ Não mostra avatar de grupo

**Status:** ⚠️ **PARCIAL**

---

### 7. **Mídia (Imagens, Áudio, Vídeo, Documentos)** ❌

**O que falta:**

#### Receber Mídia:
- ✅ Webhook já recebe `media_url` do WAHA
- ✅ Banco já tem coluna `media_url`
- ❌ Frontend não exibe imagens/áudios/vídeos

#### Enviar Mídia:
```typescript
// ❌ FALTA: Endpoint para enviar mídia
// POST /api/chat/n8n/send-media

async sendMedia(req: Request, res: Response) {
  const { sessionName, phoneNumber, mediaType, mediaUrl } = req.body;

  const wahaResponse = await fetch(`${wahaUrl}/api/sendImage`, {
    method: 'POST',
    body: JSON.stringify({
      session: sessionName,
      chatId: `${phoneNumber}@c.us`,
      file: {
        url: mediaUrl, // ou base64
      },
      caption: 'Legenda opcional',
    }),
  });
}
```

#### Frontend:
```typescript
// ❌ FALTA: Upload de arquivos
<input type="file" onChange={handleFileUpload} />

// ❌ FALTA: Exibir imagens
{message.messageType === 'image' && (
  <img src={message.mediaUrl} alt="Imagem" className="max-w-sm" />
)}

// ❌ FALTA: Player de áudio
{message.messageType === 'ptt' && (
  <audio src={message.mediaUrl} controls />
)}
```

**Status:** ❌ **NÃO IMPLEMENTADO**

---

## 📋 PLANO DE IMPLEMENTAÇÃO (PRIORIZADO)

### 🔴 **Prioridade 1: Enviar Mensagens do Frontend**
**Por que:** Funcionalidade básica e mais importante
**Complexidade:** Baixa
**Tempo estimado:** 30 minutos

**Tarefas:**
1. Adicionar `sendWhatsAppMessage()` em `chatService.ts`
2. Modificar `sendMessage()` em `ChatPage.tsx` para detectar WhatsApp
3. Testar envio de mensagem de texto

---

### 🔴 **Prioridade 2: Pesquisar Mensagens**
**Por que:** Funcionalidade solicitada explicitamente
**Complexidade:** Baixa
**Tempo estimado:** 1 hora

**Tarefas:**
1. Criar endpoint `GET /api/chat/n8n/messages/search`
2. Adicionar UI de pesquisa no `ChatPage.tsx`
3. Destacar resultados de pesquisa na conversa

---

### 🟡 **Prioridade 3: Responder Mensagem (Reply)**
**Por que:** Funcionalidade solicitada explicitamente
**Complexidade:** Média
**Tempo estimado:** 1.5 horas

**Tarefas:**
1. Adicionar suporte a `quotedMessageId` no backend
2. Modificar endpoint `/api/chat/n8n/send-message`
3. Adicionar UI de "Responder" no frontend
4. Exibir preview da mensagem sendo respondida
5. Salvar referência no banco (coluna `metadata`)

---

### 🟡 **Prioridade 4: Polling para Múltiplas Sessões**
**Por que:** Sistema precisa suportar múltiplas conexões
**Complexidade:** Média
**Tempo estimado:** 1 hora

**Tarefas:**
1. Modificar `WhatsAppSyncService` para buscar sessões ativas do banco
2. Iterar sobre todas as sessões
3. Testar com 2+ sessões conectadas

---

### 🟢 **Prioridade 5: Suporte a Grupos (Completo)**
**Por que:** Nice to have
**Complexidade:** Média
**Tempo estimado:** 1 hora

**Tarefas:**
1. Remover filtro de grupos no Polling Service
2. Adicionar coluna `participant_name` na tabela (para quem enviou no grupo)
3. Exibir nome do participante na UI

---

### ⚪ **Prioridade 6: Mídia (Imagens, Áudio, etc)**
**Por que:** Funcionalidade avançada
**Complexidade:** Alta
**Tempo estimado:** 3-4 horas

**Tarefas:**
1. Upload de arquivos no frontend
2. Endpoint para enviar mídia
3. Exibir imagens/áudios/vídeos no chat
4. Download de mídia

---

### ⚪ **Prioridade 7: Editar Mensagem**
**Por que:** Limitado pelo WAHA (não suporta editar)
**Complexidade:** Alta (workaround necessário)
**Tempo estimado:** 2 horas

**Tarefas:**
1. Criar coluna `edit_history` (JSONB)
2. UI para editar mensagem
3. Marcar como "editada" no frontend
4. Exibir histórico de edições

---

## 🎯 RESUMO

### Funcional:
- ✅ Receber mensagens (webhook + polling)
- ✅ Listar conversas
- ✅ Listar mensagens
- ✅ Marcar como lido
- ✅ Deletar mensagem (banco local)
- ✅ WebSocket em tempo real
- ✅ Filtros (individuais vs grupos)

### Falta Implementar:
- ❌ Enviar mensagens do frontend
- ❌ Pesquisar mensagens
- ❌ Responder mensagem (reply)
- ⚠️ Polling para múltiplas sessões
- ⚠️ Suporte completo a grupos
- ❌ Mídia (imagens, áudio, vídeo)
- ❌ Editar mensagem (limitado)

---

**📅 Próximo Passo Sugerido:** Implementar **envio de mensagens do frontend** (Prioridade 1)
