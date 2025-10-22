# 🚀 ORIENTAÇÃO SESSÃO B - Melhorias do Chat v104
## Implementação Baseada no Chatwoot

**Data de Criação:** 21 de Outubro de 2025
**Última Atualização:** 21 de Outubro de 2025
**Sessão:** B (Chat Improvements)
**Branch Atual:** `feature/automation-backend`
**Branch Recomendada:** `feature/chat-improvements` (criar nova)
**Próxima Versão:** v104

---

## 📊 CONTEXTO DA SESSÃO

### ✅ O QUE FOI FEITO NESTA SESSÃO

1. **Análise Completa do Chat Atual**
   - Explorado código frontend (`ChatPage.tsx`, components)
   - Explorado código backend (entities, services, controllers)
   - Identificados 2 problemas críticos
   - Mapeadas 12 funcionalidades faltantes

2. **Estudo do Chatwoot**
   - Analisado repositório GitHub do Chatwoot
   - Estudado data models e arquitetura
   - Mapeado funcionalidades a implementar
   - Criado comparativo Nexus vs Chatwoot

3. **Documentação Criada**
   - ✅ `CHAT_MELHORIAS_CHATWOOT_SPEC.md` (500+ linhas)
     - Análise comparativa completa
     - 2 problemas críticos identificados
     - 12 melhorias priorizadas
     - Roadmap de 3 fases (9 dias)
     - Database migrations necessárias
     - Arquivos a modificar

### 📋 ARQUIVOS IMPORTANTES CRIADOS

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `CHAT_MELHORIAS_CHATWOOT_SPEC.md` | Especificação completa | 500+ |
| `ORIENTACAO_SESSAO_B_CHAT_IMPROVEMENTS_v104.md` | Este arquivo | - |

---

## 🤝 COORDENAÇÃO COM SESSÃO A

### **Estado da Sessão A:**

**Branch:** `feature/bi-module`
**Última Versão:** v103
**Status:** ✅ DEPLOYED EM PRODUÇÃO

**Trabalho Recente:**
- ✅ Módulo de Business Intelligence (BI) completo
- ✅ Dashboards executivo e de vendas
- ✅ Integração com Notifica.me (WhatsApp/Instagram)
- ✅ Dark mode em todos os componentes BI
- ✅ Correções de validação e performance

**Arquivos Principais (NÃO MODIFICAR):**
```
backend/src/modules/bi/              # Módulo BI completo
backend/src/modules/integracoes/     # Notifica.me
frontend/src/components/bi/          # Componentes BI
frontend/src/services/biService.ts   # Service BI
```

### **Arquivos Seguros para Modificar (Sessão B):**

**Backend:**
```
backend/src/modules/chat/              # TODO SEGURO
  ├── conversation.entity.ts           # Adicionar campos
  ├── message.entity.ts                # Adicionar campos
  ├── attachment.entity.ts             # OK modificar
  ├── chat.service.ts                  # OK modificar
  ├── chat.controller.ts               # OK modificar
  ├── whatsapp.service.ts              # OK modificar
  ├── n8n-webhook.controller.ts        # MODIFICAR (fix crítico)
  └── (novos arquivos)                 # OK criar

backend/src/services/
  └── (novos services)                 # OK criar
```

**Frontend:**
```
frontend/src/pages/ChatPage.tsx        # OK modificar
frontend/src/components/chat/          # TODO SEGURO
frontend/src/services/chatService.ts   # OK modificar
```

**Migrations:**
```
backend/migrations/
  └── XXX_chat_improvements.sql        # Criar novas
```

### **⚠️ PONTOS DE ATENÇÃO:**

1. **NÃO modificar nada em:**
   - `/backend/src/modules/bi/`
   - `/backend/src/modules/integracoes/`
   - `/frontend/src/components/bi/`

2. **Coordenar antes de:**
   - Modificar `backend/src/routes/index.ts` (rotas principais)
   - Modificar `frontend/src/App.tsx` (se necessário)
   - Fazer merge para `main`

3. **Branch Strategy:**
   - Sessão A: `feature/bi-module`
   - Sessão B: `feature/automation-backend` (atual) ou criar `feature/chat-improvements`
   - Fazer merges incrementais, não esperar tudo pronto

---

## 🔴 PROBLEMAS CRÍTICOS A RESOLVER

### **1. Recebimento de Arquivos NÃO FUNCIONA**

**Severidade:** 🔴 CRÍTICA
**Impacto:** Usuários não veem mídias recebidas no WhatsApp
**Tempo Estimado:** 3-4 horas

#### **Problema Detalhado:**

Quando alguém envia uma **imagem, áudio, vídeo ou documento** via WhatsApp:
- ✅ Webhook do WAHA recebe a mensagem
- ✅ Webhook salva a mensagem no banco
- ❌ Attachment NÃO é criado
- ❌ Arquivo NÃO é baixado
- ❌ Frontend NÃO exibe a mídia

**Causa Raiz:**

Arquivo: `backend/src/modules/chat/n8n-webhook.controller.ts`

Quando mensagem com mídia chega:
```typescript
// ATUAL (PROBLEMA):
if (messageData.mediaUrl) {
  newMessage.mediaUrl = messageData.mediaUrl;  // Salva URL mas não cria Attachment
}
```

**O que deveria fazer:**
1. Detectar que tem `mediaUrl`
2. Baixar arquivo da URL do WAHA
3. Upload para S3/iDrive E2
4. Criar registro em tabela `attachments`
5. Associar attachment à message

#### **Solução:**

**PASSO 1:** Criar `MediaUploadService`

Arquivo: `backend/src/services/media-upload.service.ts` (NOVO)

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class MediaUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: 'https://o0m5.va.idrivee2-26.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.IDRIVE_ACCESS_KEY || 'qFzk5gw00zfSRvj5BQwm',
        secretAccessKey: process.env.IDRIVE_SECRET_KEY || 'bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8',
      },
    });
    this.bucketName = 'backupsistemaonenexus';
  }

  async uploadMediaFromUrl(mediaUrl: string, mimeType?: string): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }> {
    try {
      // 1. Baixar arquivo da URL do WAHA
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          'X-Api-Key': process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87',
        },
      });

      const buffer = Buffer.from(response.data);
      const fileSize = buffer.length;

      // 2. Determinar extensão do arquivo
      const ext = this.getExtensionFromMimeType(mimeType || response.headers['content-type']);
      const fileName = `chat-media/${uuidv4()}.${ext}`;

      // 3. Upload para S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: mimeType || response.headers['content-type'],
          ACL: 'public-read',
        })
      );

      // 4. Retornar URL pública
      const fileUrl = `https://${this.bucketName}.o0m5.va.idrivee2-26.com/${fileName}`;

      return { fileUrl, fileName, fileSize };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    };
    return map[mimeType] || 'bin';
  }
}
```

**PASSO 2:** Modificar `n8n-webhook.controller.ts`

Arquivo: `backend/src/modules/chat/n8n-webhook.controller.ts`

Adicionar:
```typescript
import { MediaUploadService } from '@/services/media-upload.service';
import { AppDataSource } from '@/database/data-source';
import { Attachment } from './attachment.entity';

// No início da classe:
private mediaUploadService = new MediaUploadService();
private attachmentRepository = AppDataSource.getRepository(Attachment);

// Modificar onde salva mensagem (por volta da linha 150):
const newMessage = await messageRepository.save({
  // ... campos existentes
});

// ADICIONAR: Se tem mídia, processar attachment
if (messageData.mediaUrl) {
  try {
    console.log('📎 Processando attachment:', messageData.mediaUrl);

    // 1. Upload para S3
    const uploaded = await this.mediaUploadService.uploadMediaFromUrl(
      messageData.mediaUrl,
      messageData.mimeType
    );

    // 2. Determinar tipo
    let attachmentType: 'audio' | 'image' | 'video' | 'document' = 'document';
    if (messageData.messageType === 'image') attachmentType = 'image';
    else if (messageData.messageType === 'video') attachmentType = 'video';
    else if (messageData.messageType === 'audio' || messageData.messageType === 'ptt') {
      attachmentType = 'audio';
    }

    // 3. Criar attachment
    const attachment = await this.attachmentRepository.save({
      messageId: newMessage.id,
      type: attachmentType,
      fileName: uploaded.fileName,
      fileUrl: uploaded.fileUrl,
      mimeType: messageData.mimeType,
      fileSize: uploaded.fileSize,
    });

    console.log('✅ Attachment criado:', attachment.id);
  } catch (error) {
    console.error('❌ Erro ao processar attachment:', error);
    // Não falhar a mensagem se attachment falhar
  }
}
```

**PASSO 3:** Testar

```bash
# 1. Rebuild backend
cd /root/nexusatemporal/backend
npm run build

# 2. Deploy
docker build -t nexus-backend:v104-chat-media-fix -f backend/Dockerfile backend/
docker service update --image nexus-backend:v104-chat-media-fix nexus_backend

# 3. Enviar imagem via WhatsApp e verificar
# - Deve aparecer no chat
# - Deve estar salva no S3
```

---

### **2. Filtro de Conversas por Número/Canal**

**Severidade:** 🔴 CRÍTICA
**Impacto:** Com múltiplos números, conversas ficam misturadas
**Tempo Estimado:** 2-3 horas

#### **Problema Detalhado:**

Quando empresa tem **2 ou mais números** WhatsApp conectados:
- ✅ `ChannelSelector` component existe
- ✅ Estado `selectedChannel` existe
- ❌ UI não mostra canais disponíveis claramente
- ❌ Não tem contador de conversas por canal
- ❌ Não persiste seleção

**Experiência do Usuário:**

Atual (RUIM):
- Usuário vê TODAS as conversas misturadas
- Não sabe qual número recebeu a mensagem
- Difícil gerenciar múltiplos atendimentos

Desejado (BOM):
- Dropdown mostrando: "📱 Atendimento (11 99999-9999) - 5 conversas"
- Seleção persiste ao recarregar página
- Badge no header mostrando canal ativo

#### **Solução:**

**PASSO 1:** Criar endpoint `/api/chat/channels`

Arquivo: `backend/src/modules/chat/chat.controller.ts`

Adicionar método:
```typescript
getChannels = async (req: Request, res: Response) => {
  try {
    // Buscar sessões ativas do WAHA
    const wahaUrl = process.env.WAHA_URL || 'https://apiwts.nexusatemporal.com.br';
    const wahaApiKey = process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87';

    const response = await fetch(`${wahaUrl}/api/sessions`, {
      headers: { 'X-Api-Key': wahaApiKey },
    });

    const sessions = await response.json();

    // Para cada sessão, contar conversas
    const channels = await Promise.all(
      sessions.map(async (session: any) => {
        // Contar conversas desta sessão
        const count = await AppDataSource.getRepository(Conversation).count({
          where: { whatsappInstanceId: session.name },
        });

        // Contar não lidas
        const unreadCount = await AppDataSource.getRepository(Conversation).count({
          where: {
            whatsappInstanceId: session.name,
            isUnread: true,
          },
        });

        return {
          sessionName: session.name,
          phoneNumber: session.config?.phoneNumber || 'N/A',
          status: session.status, // WORKING, FAILED, etc.
          conversationCount: count,
          unreadCount,
        };
      })
    );

    res.json(channels);
  } catch (error: any) {
    console.error('Error getting channels:', error);
    res.status(500).json({ error: error.message });
  }
};
```

Adicionar rota em `chat.routes.ts`:
```typescript
router.get('/channels', authenticate, chatController.getChannels);
```

**PASSO 2:** Melhorar `ChannelSelector` component

Arquivo: `frontend/src/components/chat/ChannelSelector.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Smartphone, ChevronDown } from 'lucide-react';
import chatService from '../../services/chatService';

interface Channel {
  sessionName: string;
  phoneNumber: string;
  status: string;
  conversationCount: number;
  unreadCount: number;
}

interface Props {
  selectedChannel: string | null;
  onChannelSelect: (sessionName: string | null) => void;
}

const ChannelSelector: React.FC<Props> = ({ selectedChannel, onChannelSelect }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const data = await chatService.getChannels();
      setChannels(data);

      // Auto-selecionar se tiver apenas 1 canal
      if (data.length === 1 && !selectedChannel) {
        onChannelSelect(data[0].sessionName);
      }

      // Restaurar seleção do localStorage
      const saved = localStorage.getItem('selectedChannel');
      if (saved && data.find(c => c.sessionName === saved)) {
        onChannelSelect(saved);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const handleSelect = (sessionName: string | null) => {
    onChannelSelect(sessionName);
    localStorage.setItem('selectedChannel', sessionName || '');
    setIsOpen(false);
  };

  const selected = channels.find(c => c.sessionName === selectedChannel);

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {selected ? `${selected.phoneNumber}` : 'Todos os canais'}
            </span>
            {selected && selected.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {selected.unreadCount}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <button
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between"
            >
              <span className="text-gray-700 dark:text-gray-200">Todos os canais</span>
              <span className="text-gray-500 text-xs">
                {channels.reduce((sum, c) => sum + c.conversationCount, 0)} conversas
              </span>
            </button>
            {channels.map((channel) => (
              <button
                key={channel.sessionName}
                onClick={() => handleSelect(channel.sessionName)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center"
              >
                <div>
                  <div className="text-gray-700 dark:text-gray-200">{channel.phoneNumber}</div>
                  <div className="text-xs text-gray-500">
                    {channel.status} • {channel.conversationCount} conversas
                  </div>
                </div>
                {channel.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSelector;
```

**PASSO 3:** Adicionar método em `chatService.ts`

```typescript
async getChannels(): Promise<Channel[]> {
  const response = await api.get('/chat/channels');
  return response.data;
}
```

**PASSO 4:** Testar

```bash
# Frontend
cd /root/nexusatemporal/frontend
npm run build
docker build -t nexus-frontend:v104-chat-channels -f frontend/Dockerfile frontend/
docker service update --image nexus-frontend:v104-chat-channels nexus_frontend
```

---

## 📋 PRÓXIMAS MELHORIAS (Após Críticos)

### **Fase 2: Funcionalidades Essenciais (3-4 dias)**

1. **Prioridade de Conversas** (2h)
   - Adicionar campo `priority` (low/medium/high/urgent)
   - Badges coloridos
   - Filtro por prioridade

2. **Snooze de Conversas** (3h)
   - Adicionar campo `snoozed_until`
   - Modal de snooze (1h, 4h, 1 dia, 1 semana)
   - Cron job para reativar

3. **Custom Attributes** (5h)
   - Tabela `contact_attributes` (definições)
   - Tabela `contact_attribute_values` (valores)
   - CRUD completo
   - UI no painel direito

4. **Macros Melhoradas** (3h)
   - Adicionar categorias
   - Atalhos de teclado (`/obrigado`)
   - Variáveis dinâmicas (`{{contact_name}}`)
   - Anexos em macros

5. **Agent Bots 24/7** (8h)
   - Tabela `agent_bots`
   - Integração OpenAI
   - Auto-resposta quando sem agentes
   - Handoff para humano
   - UI de gerenciamento

### **Fase 3: Melhorias UX (2-3 dias)**

6. **Painel de Informações** (3h)
   - Informações completas do contato
   - Custom attributes
   - Conversas anteriores
   - Labels/tags

7. **Conversas Anteriores** (2h)
   - Endpoint `/conversations/:id/previous`
   - Lista no painel direito

8. **Participantes de Grupos** (3h)
   - Chamar WAHA para lista
   - Cachear no banco
   - UI com avatares

9. **Teams** (4h)
   - Tabelas `teams` e `team_users`
   - Atribuição por equipe
   - Filtros por equipe

10. **Notas Privadas** (2h)
    - Campo `is_private` em messages
    - Botão "Nota Privada"
    - Background diferenciado

---

## 🗄️ DATABASE MIGRATIONS NECESSÁRIAS

### **Para Fase 1 (Críticos):**

✅ Nenhuma migration necessária (usar tabelas existentes)

### **Para Fase 2:**

Criar arquivo: `backend/migrations/012_chat_improvements.sql`

```sql
-- Prioridade de conversas
ALTER TABLE conversations ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
CREATE INDEX idx_conversations_priority ON conversations(priority);

-- Snooze de conversas
ALTER TABLE conversations ADD COLUMN snoozed_until TIMESTAMP NULL;
CREATE INDEX idx_conversations_snoozed ON conversations(snoozed_until);

-- Custom Attributes
CREATE TABLE contact_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  options JSONB NULL,
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES contact_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, attribute_id)
);

CREATE INDEX idx_contact_attributes_tenant ON contact_attributes(tenant_id);
CREATE INDEX idx_attribute_values_conversation ON contact_attribute_values(conversation_id);

-- Macros melhoradas
ALTER TABLE quick_replies ADD COLUMN category VARCHAR(50) NULL;
ALTER TABLE quick_replies ADD COLUMN shortcut_trigger VARCHAR(50) NULL;
ALTER TABLE quick_replies ADD COLUMN attachment_url TEXT NULL;
CREATE INDEX idx_quick_replies_category ON quick_replies(category);

-- Agent Bots
CREATE TABLE agent_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ai_provider VARCHAR(50) NOT NULL,
  ai_model VARCHAR(100) NOT NULL,
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_activate BOOLEAN DEFAULT FALSE,
  active_hours JSONB NULL,
  fallback_message TEXT,
  handoff_keywords TEXT[],
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES agent_bots(id),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP NULL,
  handoff_reason VARCHAR(100) NULL,
  messages_sent INT DEFAULT 0,
  was_helpful BOOLEAN NULL,
  UNIQUE(conversation_id)
);

CREATE INDEX idx_agent_bots_tenant ON agent_bots(tenant_id);
CREATE INDEX idx_agent_bot_conversations_bot ON agent_bot_conversations(bot_id);
```

### **Para Fase 3:**

```sql
-- Notas privadas
ALTER TABLE messages ADD COLUMN is_private BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_messages_private ON messages(is_private);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE conversations ADD COLUMN team_id UUID NULL REFERENCES teams(id);
CREATE INDEX idx_conversations_team ON conversations(team_id);
```

---

## 🚀 COMANDOS RÁPIDOS

### **Git Workflow:**

```bash
# 1. Verificar branch atual
git branch

# 2. Criar nova branch (recomendado)
git checkout -b feature/chat-improvements

# 3. Fazer commit
git add .
git commit -m "feat(chat): Implementa recebimento de arquivos e filtro por canal (v104)"

# 4. Push
git push origin feature/chat-improvements
```

### **Build e Deploy:**

```bash
# Backend
cd /root/nexusatemporal/backend
npm run build
cd /root/nexusatemporal
docker build -t nexus-backend:v104-chat-improvements -f backend/Dockerfile backend/
docker service update --image nexus-backend:v104-chat-improvements nexus_backend

# Frontend
cd /root/nexusatemporal/frontend
npm run build
cd /root/nexusatemporal
docker build -t nexus-frontend:v104-chat-improvements -f frontend/Dockerfile frontend/
docker service update --image nexus-frontend:v104-chat-improvements nexus_frontend

# Verificar
docker service ps nexus_backend
docker service ps nexus_frontend
docker service logs nexus_backend --tail 50
```

### **Database Migration:**

```bash
# Conectar ao PostgreSQL
PGPASSWORD=nexus2024@secure psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Executar migration
\i /path/to/012_chat_improvements.sql

# Verificar tabelas
\dt contact_attributes
\dt agent_bots
```

---

## ✅ CHECKLIST ANTES DE COMEÇAR

**Preparação:**
- [ ] Ler este documento completo
- [ ] Ler `CHAT_MELHORIAS_CHATWOOT_SPEC.md`
- [ ] Verificar que Sessão A não está trabalhando em chat
- [ ] Criar branch `feature/chat-improvements` (opcional)
- [ ] Fazer backup antes de começar

**Fase 1 - Críticos:**
- [ ] Implementar `MediaUploadService`
- [ ] Modificar `n8n-webhook.controller.ts`
- [ ] Testar recebimento de imagem
- [ ] Testar recebimento de áudio
- [ ] Testar recebimento de vídeo
- [ ] Testar recebimento de documento
- [ ] Criar endpoint `/api/chat/channels`
- [ ] Melhorar `ChannelSelector` component
- [ ] Testar filtro por canal
- [ ] Deploy e validação
- [ ] Commit e push

**Após Fase 1:**
- [ ] Atualizar CHANGELOG
- [ ] Criar release notes
- [ ] Notificar usuários das correções

---

## 📚 REFERÊNCIAS

### **Documentação do Projeto:**
- `CHAT_MELHORIAS_CHATWOOT_SPEC.md` - Especificação completa
- `GUIA_USUARIO_CHAT.md` - Guia do usuário atual
- `backend/src/modules/chat/` - Código atual do chat

### **Documentação Externa:**
- [Chatwoot GitHub](https://github.com/chatwoot/chatwoot)
- [Chatwoot API Docs](https://developers.chatwoot.com)
- [WAHA API Docs](https://waha.devlike.pro/)
- [AWS S3 SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)

### **Credenciais:**
- **WAHA URL:** `https://apiwts.nexusatemporal.com.br`
- **WAHA API Key:** `bd0c416348b2f04d198ff8971b608a87`
- **iDrive E2:**
  - Access Key: `qFzk5gw00zfSRvj5BQwm`
  - Secret Key: `bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8`
  - Endpoint: `https://o0m5.va.idrivee2-26.com`
  - Bucket: `backupsistemaonenexus`
- **Chatwoot Instance (Referência):**
  - Host: `46.202.144.210`
  - User: `root`
  - Password: `k+cRtS3F6k1@`

---

## 🎯 MÉTRICAS DE SUCESSO

### **Fase 1 (Críticos):**
- ✅ 100% das mídias recebidas aparecem no chat
- ✅ Filtro por canal funciona perfeitamente
- ✅ Zero erros no console relacionados a mídia
- ✅ Upload para S3 com sucesso
- ✅ Attachments criados corretamente

### **Fase 2 (Essenciais):**
- ✅ Bot responde automaticamente fora do horário
- ✅ Custom attributes funcionando (mínimo 3 atributos)
- ✅ Macros com atalhos (`/obrigado` funciona)
- ✅ Snooze de conversas funciona
- ✅ Prioridades visíveis e funcionais

### **Fase 3 (UX):**
- ✅ Painel de informações completo
- ✅ Histórico de conversas visível
- ✅ Teams funcionando
- ✅ Notas privadas operacionais

---

## ⚠️ AVISOS IMPORTANTES

1. **SEMPRE testar em desenvolvimento primeiro**
   - Não fazer deploy direto em produção
   - Usar docker compose local se possível

2. **Fazer backups antes de migrations**
   ```bash
   pg_dump -h 46.202.144.210 -U nexus_admin nexus_crm > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Deploy incremental**
   - Não esperar todas as features prontas
   - Deploy após cada correção crítica
   - Coleta feedback dos usuários

4. **Coordenar com Sessão A**
   - Avisar antes de modificar rotas principais
   - Não modificar nada em `/modules/bi/`
   - Sincronizar horários de deploy

5. **Documentar tudo**
   - Atualizar CHANGELOG a cada deploy
   - Criar release notes
   - Atualizar guias do usuário

---

## 🆘 TROUBLESHOOTING

### **Erro ao baixar mídia do WAHA:**
```
Error: Request failed with status code 404
```
**Solução:** Verificar se WAHA_API_KEY está correta e URL está acessível.

### **Erro ao upload S3:**
```
Error: Access Denied
```
**Solução:** Verificar credenciais iDrive E2 no .env.

### **Attachment não aparece no frontend:**
**Solução:**
1. Verificar se `message.attachments` está sendo carregado (include no TypeORM)
2. Verificar console do navegador
3. Testar URL do S3 manualmente

### **Filtro por canal não funciona:**
**Solução:**
1. Verificar endpoint `/api/chat/channels` retorna dados
2. Verificar `localStorage.getItem('selectedChannel')`
3. Console.log no `filteredConversations`

---

## ✨ BOA SORTE!

Esta sessão vai transformar o Chat do Nexus em uma ferramenta profissional de atendimento!

**Lembre-se:**
- 🔴 Priorize os 2 problemas críticos primeiro
- 📝 Documente tudo
- 🧪 Teste antes de fazer deploy
- 🤝 Coordene com Sessão A
- 🚀 Deploy incremental

**Qualquer dúvida:**
- Consulte `CHAT_MELHORIAS_CHATWOOT_SPEC.md`
- Reveja este documento
- Analise código existente em `backend/src/modules/chat/`

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Hora:** $(date '+%H:%M UTC')
**Versão:** 1.0
**Status:** ✅ PRONTO PARA USO

🚀 **Vamos melhorar o Chat!**
