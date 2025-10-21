# Chat v114 - Database Tables Fix

**Data**: 2025-10-21
**Versão**: Backend v113-auth-fix (sem mudanças de código)
**Status**: ✅ TABELAS CRIADAS

---

## 🐛 PROBLEMA ROOT CAUSE IDENTIFICADO

**TODOS** os erros 400 eram causados por:

```
[getQuickReplies] Error: relation "quick_replies" does not exist
[setPriority] Error: relation "conversations" does not exist
[assignConversation] Error: relation "conversations" does not exist
[resolveConversation] Error: relation "conversations" does not exist
```

### Causa Raiz

**AS TABELAS DO CHAT NÃO EXISTIAM NO BANCO DE DADOS!**

- ❌ Tabela `conversations` não existia
- ❌ Tabela `quick_replies` não existia
- ❌ Tabela `chat_tags` não existia
- ❌ Tabela `messages` não existia
- ❌ Tabela `attachments` não existia

### Por que isso aconteceu?

1. As entities foram criadas no código
2. Mas `synchronize: false` estava configurado em produção (data-source.ts:35)
3. Nunca rodamos uma migration para criar essas tabelas
4. Backend tentava salvar dados em tabelas inexistentes → Erro SQL → HTTP 400

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Migration Criada

**Arquivo**: `backend/src/database/migrations/011_create_chat_tables.sql`

**Tabelas criadas**:
1. `conversations` - Conversas do chat
2. `messages` - Mensagens trocadas
3. `attachments` - Anexos de mídia
4. `chat_tags` - Tags/etiquetas
5. `quick_replies` - Respostas rápidas

**Features da Migration**:
- ✅ Todos os campos mapeados das entities
- ✅ Foreign keys com ON DELETE CASCADE
- ✅ Índices para performance (phone_number, conversation_id, etc)
- ✅ Triggers para updated_at automático
- ✅ CHECK constraints para validações

### Mudança Importante: phoneNumber

**Antes** (entity):
```typescript
@Column({ type: 'varchar', unique: true })
phoneNumber: string;
```

**Depois** (migration):
```sql
phone_number VARCHAR NOT NULL,
-- Sem UNIQUE constraint
CREATE INDEX idx_conversations_phone_number ON conversations(phone_number);
CREATE INDEX idx_conversations_whatsapp_phone ON conversations(whatsapp_instance_id, phone_number);
```

**Motivo**: O mesmo número pode aparecer em diferentes sessões WhatsApp.

### 2. Migration Executada

```bash
# 1. Copiar migration para container postgres
docker cp 011_create_chat_tables.sql ce4bddfec9a4:/tmp/

# 2. Executar migration
docker exec ce4bddfec9a4 psql -U nexus_admin -d nexus_master -f /tmp/011_create_chat_tables.sql

# Resultado:
CREATE TABLE  ← conversations
CREATE TABLE  ← messages
CREATE TABLE  ← attachments
CREATE TABLE  ← chat_tags
CREATE TABLE  ← quick_replies
CREATE FUNCTION ← update_updated_at_column()
CREATE TRIGGER (x4) ← Triggers para updated_at
```

### 3. Verificação

```bash
docker exec postgres psql -U nexus_admin -d nexus_master -c "\dt"

Resultado:
✅ public | attachments      | table | nexus_admin
✅ public | chat_tags        | table | nexus_admin
✅ public | conversations    | table | nexus_admin
✅ public | messages         | table | nexus_admin
✅ public | quick_replies    | table | nexus_admin
```

---

## 📦 BANCO DE DADOS

### Localização
- **Host**: postgres (container Docker)
- **User**: nexus_admin
- **Database**: nexus_master
- **Password**: 6uyJZdc0xsCe7ymief3x2Izi9QubcTYP

### DataSource
O backend usa `AppDataSource` (data-source.ts:22) que aponta para `nexus_master`.

---

## 🧪 TESTE AGORA

### Passo 1: Recarregar Página
Apenas **F5** ou **Ctrl+R** no navegador

### Passo 2: Testar Ações
Selecione uma conversa WhatsApp e teste:

1. **Quick Replies**: Console **NÃO deve mostrar** erro
2. **Arquivar**: Deve funcionar ✅
3. **Tags**: Deve funcionar ✅
4. **Prioridade**: Deve funcionar ✅
5. **Atribuir usuário**: Deve funcionar ✅
6. **Resolver/Reabrir**: Deve funcionar ✅

### O que vai acontecer agora?

**Primeira vez** que usar uma ação em uma conversa WhatsApp:
1. Backend detecta ID virtual `whatsapp-session-phoneNumber`
2. `ensureConversationExists()` cria registro na tabela `conversations`
3. Ação é executada com sucesso
4. Dados ficam salvos no banco

**Próximas vezes**:
1. Backend encontra conversa existente
2. Ação é executada imediatamente

---

## 📊 ESTRUTURA DAS TABELAS

### Conversations (Conversas)
```sql
id                    UUID PRIMARY KEY
lead_id               VARCHAR
contact_name          VARCHAR NOT NULL
phone_number          VARCHAR NOT NULL
whatsapp_instance_id  VARCHAR
assigned_user_id      VARCHAR
status                VARCHAR (active/archived/closed/waiting)
is_unread             BOOLEAN
unread_count          INTEGER
last_message_at       TIMESTAMP
last_message_preview  TEXT
tags                  TEXT[]
metadata              JSONB (priority, custom attributes)
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

### Messages (Mensagens)
```sql
id                   UUID PRIMARY KEY
conversation_id      UUID → FK conversations
direction            VARCHAR (incoming/outgoing)
type                 VARCHAR (text/audio/image/video/document/location/contact)
content              TEXT
sender_id            VARCHAR
sender_name          VARCHAR
whatsapp_message_id  VARCHAR
status               VARCHAR (pending/sent/delivered/read/failed)
sent_at              TIMESTAMP
delivered_at         TIMESTAMP
read_at              TIMESTAMP
metadata             JSONB
is_deleted           BOOLEAN
created_at           TIMESTAMP
updated_at           TIMESTAMP
```

### Quick Replies (Respostas Rápidas)
```sql
id          UUID PRIMARY KEY
title       VARCHAR
content     TEXT
shortcut    VARCHAR (ex: "/oi")
category    VARCHAR
created_by  VARCHAR
is_active   BOOLEAN
is_global   BOOLEAN
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Chat Tags (Etiquetas)
```sql
id          UUID PRIMARY KEY
name        VARCHAR UNIQUE
color       VARCHAR (hex color)
description TEXT
is_active   BOOLEAN
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Attachments (Anexos)
```sql
id            UUID PRIMARY KEY
message_id    UUID → FK messages
type          VARCHAR (audio/image/video/document)
file_name     VARCHAR
file_url      VARCHAR
mime_type     VARCHAR
file_size     BIGINT
duration      INTEGER
thumbnail_url VARCHAR
created_at    TIMESTAMP
```

---

## 🔄 RESUMO DA SESSÃO

### Bugs Corrigidos (3 versões)

| Versão | Bug | Solução |
|--------|-----|---------|
| v112 | WhatsApp conversations não existiam no banco | `ensureConversationExists()` helper |
| v113 | `req.user.id` vs `req.user.userId` | Corrigido acesso à propriedade correta |
| v114 | **Tabelas não existiam** | Migration 011 criada e executada |

### Timeline

1. **v111** (46min atrás): Deploy frontend dark mode fix
2. **v112** (30min atrás): Deploy backend WhatsApp actions fix
3. **v113** (5min atrás): Deploy backend auth fix
4. **v114** (agora): Database tables created

---

## 💡 LIÇÃO APRENDIDA

### Problema
Criamos entities no código, mas esquecemos de criar as tabelas no banco.

### Por que não detectamos antes?
- `synchronize: false` em produção (correto)
- Nunca testamos criar uma conversa nova
- Apenas testávamos conversas WhatsApp (IDs virtuais)
- Código nunca chegava a tentar INSERT no banco

### Prevenção Futura
- ✅ Sempre criar migration ao criar entity
- ✅ Testar fluxo completo (incluindo INSERT) em dev
- ✅ Verificar se tabelas existem antes do deploy

---

**Desenvolvido por**: Claude Code (Sessão B)
**Migration criada**: 2025-10-21 20:10 UTC
**Tabelas criadas**: 2025-10-21 20:11 UTC
**Status**: ✅ PRONTO PARA USAR
