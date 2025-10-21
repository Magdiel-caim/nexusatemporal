# Organização de Trabalho Paralelo

## 📋 Mapeamento de Áreas e Branches

### 🔴 SESSÃO 1 (Outra aba) - feature/chat-improvements
**Área: Chat e WhatsApp**

#### Backend
```
backend/src/modules/chat/
├── chat.routes.ts
├── chat.service.ts
├── n8n-webhook.controller.ts
├── n8n-webhook.routes.ts
├── waha-session.controller.ts
├── waha-session.service.ts
└── websocket.service.ts

backend/src/services/
├── media-storage.service.ts (novo)
├── WhatsAppSyncService.ts
└── whatsapp-session-db.service.ts

backend/src/integrations/idrive/
└── s3-client.ts
```

#### Frontend
```
frontend/src/pages/
└── ChatPage.tsx

frontend/src/services/
└── chatService.ts

frontend/src/components/chat/ (novos)
├── ChannelSelector.tsx
└── ConversationDetailsPanel.tsx
```

#### Workflows
```
n8n-workflows/
├── *.json
└── *.md
```

---

### 🟢 SESSÃO 2 (Esta aba) - feature/leads-procedures-config
**Áreas: Leads, Procedures, Pipelines, Config e Auth**

#### Backend - Leads
```
backend/src/modules/leads/
├── lead.service.ts
├── leads.routes.ts
├── pipeline.service.ts
└── procedure.service.ts
```

#### Backend - Config
```
backend/src/modules/config/
├── data.controller.ts
└── data.routes.ts
```

#### Backend - Auth
```
backend/src/modules/auth/
├── auth.controller.ts
├── auth.routes.ts
└── auth.service.ts
```

#### Frontend - Leads (futuro)
```
frontend/src/pages/
├── LeadsPage.tsx
├── DashboardPage.tsx
└── PipelinePage.tsx

frontend/src/services/
├── leadService.ts
├── pipelineService.ts
└── procedureService.ts
```

---

## ⚠️ ZONA DE CONFLITO - Coordenar entre sessões

### Arquivos Compartilhados
```
backend/src/routes/index.ts         # Importa TODAS as rotas
backend/src/server.ts                # Configuração do servidor
backend/src/shared/middleware/       # Middleware usado por todos
```

### Regra
- Evite modificar esses arquivos simultaneamente
- Se precisar modificar, faça commit imediatamente
- Comunique entre as sessões antes de tocar

---

## 🔄 Fluxo de Trabalho com Branches

### Criar branches
```bash
# Sessão 1 (Chat)
git checkout -b feature/chat-improvements

# Sessão 2 (Leads/Config)
git checkout -b feature/leads-procedures-config
```

### Durante o desenvolvimento
```bash
# Commits frequentes
git add [arquivos-da-sua-area]
git commit -m "feat: descrição concisa"
```

### Sincronização
```bash
# Se precisar das mudanças da outra branch
git fetch origin
git merge main  # ou a outra branch, se já foi mergeada
```

### Merge final
```bash
# Quando terminar uma área
git checkout main
git merge feature/chat-improvements
git merge feature/leads-procedures-config
```

---

## 📊 Status Atual (checkpoint)

### Modificados (precisam ser alocados)
```
✓ Chat (Sessão 1)
  - backend/src/modules/chat/* (2 arquivos)
  - backend/dist/modules/chat/* (8 arquivos)
  - frontend/src/pages/ChatPage.tsx
  - frontend/src/services/chatService.ts
  - frontend/src/components/chat/* (2 novos)
  - backend/dist/services/media-storage.service.js (novo)
  - backend/dist/integrations/idrive/s3-client.js

✓ Leads/Config/Auth (Sessão 2)
  - backend/dist/modules/leads/* (4 arquivos)
  - backend/dist/modules/config/* (2 arquivos)
  - backend/dist/modules/auth/* (3 arquivos)

⚠️ Compartilhados (coordenar)
  - backend/dist/routes/index.js
  - backend/dist/server.js
  - backend/dist/shared/middleware/* (2 arquivos)
  - backend/dist/services/WhatsAppSyncService.js

📄 Documentação (qualquer sessão)
  - n8n-workflows/* (10 arquivos novos)
  - scripts/* (4 arquivos novos)
  - prompt/* (2 capturas novas)
```

---

## 🎯 Próximos Passos

1. **Sessão Chat (outra aba)**
   ```bash
   git checkout -b feature/chat-improvements
   git add backend/src/modules/chat/
   git add frontend/src/pages/ChatPage.tsx
   git add frontend/src/services/chatService.ts
   git add frontend/src/components/chat/
   git commit -m "feat: melhorias no chat"
   ```

2. **Sessão Leads (esta aba)**
   ```bash
   git checkout -b feature/leads-procedures-config
   git add backend/src/modules/leads/
   git add backend/src/modules/config/
   git add backend/src/modules/auth/
   git commit -m "feat: melhorias em leads, config e auth"
   ```

3. **Merge quando pronto**
   ```bash
   git checkout main
   git merge feature/chat-improvements
   git merge feature/leads-procedures-config
   git push origin main
   ```

---

## 💡 Dicas

- Use `git status` frequentemente para ver o que está modificado
- Commits pequenos e frequentes evitam conflitos
- Se tocar em arquivos compartilhados, comunique entre sessões
- Cada sessão mantém foco na sua área = menos conflitos
- Build após merge para garantir que tudo funciona junto
