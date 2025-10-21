# CHANGELOG - Nexus Atemporal

## Visão Geral
Sistema de CRM completo para gestão de leads, pacientes e procedimentos estéticos.

---

## [v30] - 2025-10-08

### Added
- **Módulo de Chat/WhatsApp Completo + Integração WAHA**: Sistema completo de mensageria com integração WhatsApp direta via WAHA API
  - **Backend**:
    - 5 Entidades do banco de dados:
      - `conversation.entity.ts`: Conversas com leads/clientes
      - `message.entity.ts`: Mensagens com status de entrega
      - `attachment.entity.ts`: Anexos (áudio, imagem, vídeo, documento)
      - `tag.entity.ts`: Etiquetas personalizadas para conversas
      - `quick-reply.entity.ts`: Templates de respostas rápidas
    - `chat.service.ts`: Serviço principal de gerenciamento de conversas e mensagens
    - `whatsapp.service.ts`: Integração completa com WhatsApp API (WAHA)
    - `websocket.service.ts`: Serviço de WebSocket para mensagens em tempo real
    - `chat.controller.ts`: REST API para operações de chat
    - `whatsapp.controller.ts`: Webhook para receber mensagens do WhatsApp
    - `chat.routes.ts`: Rotas configuradas em `/api/chat`
  - **Frontend**:
    - `ChatPage.tsx`: Interface completa de chat com 3 painéis
      - Painel esquerdo: Lista de conversas com busca e filtros
      - Painel central: Mensagens em tempo real
      - Suporte a badges de mensagens não lidas
    - `chatService.ts`: Service para comunicação com API de chat
    - WebSocket integrado com Socket.IO para mensagens em tempo real
  - **Integração WAHA (WhatsApp API)**:
    - `waha-session.service.ts`: Gerenciamento completo de sessões WAHA
    - `waha-session.controller.ts`: Endpoints para criar/iniciar sessões e obter QR Code
    - `WhatsAppConnectionPanel.tsx`: Componente React para conectar WhatsApp
    - Fluxo completo de conexão:
      1. Usuário clica em "Conectar WhatsApp"
      2. Digita nome da sessão
      3. Sistema cria sessão na WAHA
      4. QR Code é exibido em tempo real
      5. Usuário escaneia com WhatsApp
      6. WebSocket detecta conexão automaticamente
      7. Sistema fica pronto para enviar/receber mensagens
    - Suporte a múltiplas conexões WhatsApp simultâneas
    - Webhook para receber status de conexão em tempo real
    - Gerenciamento de sessões: criar, iniciar, parar, desconectar, deletar
  - **Funcionalidades do Chat**:
    - Chat em tempo real via WebSocket
    - Integração direta com WhatsApp (sem Chatwoot necessário)
    - Sistema de tags/etiquetas para conversas
    - Respostas rápidas (quick replies)
    - Status de mensagens (enviado, entregue, lido)
    - Suporte a múltiplos tipos de mídia (texto, áudio, imagem, vídeo, documento)
    - Busca e filtros de conversas
    - Atribuição de conversas a usuários
    - Indicadores de digitação (typing indicators)
    - Webhooks para receber mensagens
    - Painel visual para conectar WhatsApp com QR Code
  - **Arquivos criados/modificados**:
    - Backend: `backend/src/modules/chat/` (13 arquivos novos):
      - Entidades: conversation, message, attachment, tag, quick-reply
      - Serviços: chat.service, whatsapp.service, waha-session.service, websocket.service
      - Controllers: chat.controller, whatsapp.controller, waha-session.controller
      - Routes: chat.routes (com endpoints WAHA)
    - Frontend:
      - `frontend/src/pages/ChatPage.tsx` (interface completa + modal de conexão)
      - `frontend/src/services/chatService.ts` (service de API)
      - `frontend/src/components/chat/WhatsAppConnectionPanel.tsx` (painel de conexão)
    - Routes: `backend/src/routes/index.ts` (adicionada rota /api/chat)
    - Server: `backend/src/server.ts` (inicialização do WebSocketService)
    - App: `frontend/src/App.tsx` (rota /chat ativada)
  - **Configuração**:
    - WAHA URL: https://apiwts.nexusatemporal.com.br
    - Variáveis de ambiente configuradas (.env)
    - Webhook endpoint: `/api/chat/webhook/waha/status`

### Fixed
- **🚨 CRÍTICO: Recuperação Total do Sistema após Perda de Dados**: Sistema completamente restaurado
  - **Problema**: Deploy criou novo volume PostgreSQL vazio, perdendo todos os dados (usuários, leads, pipelines)
  - **Causa**: docker-compose.yml criando volume local ao invés de usar volume externo existente
  - **Solução**:
    1. Identificado volume antigo: `nexusatemporal_postgres_data`
    2. Atualizado docker-compose.yml para usar volume externo
    3. Resetada senha PostgreSQL via container temporário com trust auth
    4. Resolvido conflito de 2 serviços PostgreSQL simultâneos
  - **Resultado**: ✅ Todos os dados recuperados (usuários, leads, atividades)
  - **Arquivo modificado**: `/root/nexusatemporal/docker-compose.yml:9-11`
  - **Documentação**: Ver `/root/nexusatemporal/prompt/TROUBLESHOOTING.md#problema-critico-1`

- **🚨 CRÍTICO: Login Travando após Update**: Senha não mudava mais após login
  - **Problema**: Senha resetada manualmente não funcionava; login falhava mesmo com senha correta
  - **Causa**: Hook `@BeforeUpdate()` re-hashava senha a cada login (ao atualizar lastLoginAt)
  - **Sintoma**: Hook só aceitava formato `$2a$`, rejeitava `$2y$` e `$2b$`
  - **Solução**: Atualizado hook para aceitar todos os formatos bcrypt válidos
  - **Arquivo modificado**: `/root/nexusatemporal/backend/src/modules/auth/user.entity.ts:97-111`
  - **Documentação**: Ver `/root/nexusatemporal/prompt/TROUBLESHOOTING.md#problema-critico-2`

- **Sistema de Backup Automático**: Criado para prevenir perda de dados
  - **Scripts criados**:
    - `scripts/backup-database.sh`: Backup manual com upload para IDrive E2
    - `scripts/pre-deploy.sh`: Verificações + backup obrigatório antes de deploy
    - `scripts/deploy.sh`: Deploy seguro (aborta se backup falhar)
  - **Configuração IDrive E2**:
    - Endpoint: https://c1k7.va.idrivee2-46.com
    - Bucket: onenexus
    - Path: backups/database/
    - Retenção local: 7 dias
  - **Documentação completa**: `/root/nexusatemporal/BACKUP.md`

- **Frontend em Modo Produção**: Substituído Vite dev server por Nginx
  - **Antes**: Frontend rodava em modo desenvolvimento (VITE v5.4.20)
  - **Depois**: Build otimizado servido por Nginx Alpine
  - **Arquivos criados**:
    - `frontend/Dockerfile.prod`: Multi-stage build
    - `frontend/nginx.conf`: Configuração SPA com cache
  - **Mudanças**: docker-compose.yml agora usa Dockerfile.prod e porta 80

---

## [v29] - 2025-10-08

### Added
- **Branding Visual**: Implementação da identidade visual completa do sistema
  - Logo completa adicionada na página de Login
  - Logo completa adicionada na página de Registro
  - Logo completa no sidebar quando expandido
  - Ícone da logo no sidebar quando colapsado
  - Favicon atualizado no navegador
  - Arquivos de logo:
    - `frontend/src/assets/images/logo-full.png` (logo completa)
    - `frontend/src/assets/images/logo-full-alt.png` (logo alternativa)
    - `frontend/src/assets/images/logo-icon.png` (ícone)
    - `frontend/src/assets/images/logo-icon-alt.png` (ícone alternativo)
    - `frontend/favicon.png` (favicon)
  - Arquivos modificados:
    - `frontend/src/pages/LoginPage.tsx`: Logo no topo do formulário
    - `frontend/src/pages/RegisterPage.tsx`: Logo no topo do formulário
    - `frontend/src/components/layout/MainLayout.tsx`: Logo dinâmica no sidebar
    - `frontend/index.html`: Atualizado favicon e meta description

---

## [v28] - 2025-10-08

### Fixed
- **Drag & Drop**: Correção definitiva do problema onde arrastar cards abria o modal
  - Implementado sistema de detecção com `useRef` e `useEffect`
  - Flag `dragDetected` persiste durante todo o ciclo de drag
  - Timeout de 100ms após drag para garantir bloqueio do onClick
  - Arquivo: `frontend/src/components/leads/DraggableLeadCard.tsx`

---

## [v27] - 2025-10-08

### Fixed
- **Drag & Drop**: Cards agora movem visualmente entre estágios em tempo real
  - Correção da atualização simultânea de `leads` e `filteredLeads`
  - Ambos arrays são atualizados com a função `updateLeadStage`
  - Arquivo: `frontend/src/pages/LeadsPage.tsx:handleDragEnd`

---

## [v26] - 2025-10-08

### Attempted Fix
- Primeira tentativa de corrigir abertura de modal ao arrastar
  - Implementado detecção baseada em `transform` (não funcionou completamente)
  - Transform reseta para zero após drag, causando falha na detecção

---

## [v25] - 2025-10-08

### Added
- **Navegação Dashboard → Lead**: Clique no nome do lead abre o card automaticamente
  - Implementado `useLocation` e `location.state` no React Router
  - Dashboard passa `openLeadId` via navigation state
  - LeadsPage detecta e auto-abre modal do lead específico
  - Limpa history após abrir para evitar reabertura
  - Arquivos:
    - `frontend/src/pages/DashboardPage.tsx`: Navigate com state
    - `frontend/src/pages/LeadsPage.tsx`: useEffect para detectar state

---

## [v24] - 2025-10-08

### Added
- **Dashboard Completa**: Implementação do painel principal do sistema
  - **KPIs**:
    - Novos Leads Hoje (clicável com popup)
    - Total de Pacientes
    - Tempo Médio de Atendimento
    - Taxa de Conversão (%)
    - Ticket Médio (R$)
    - Uptime do Sistema
  - **Popup de Novos Leads**:
    - Lista os 10 leads mais recentes do dia
    - Mostra nome, procedimento, valor estimado, canal
    - Clique no lead navega para página de leads
  - **Breakdown por Clínica**:
    - Moema: contagem de atendimentos
    - AV Paulista: contagem de atendimentos
  - **Alertas**:
    - Leads sem resposta há mais de 24h
  - **Atividades Recentes**:
    - Timeline de últimas 5 atividades
  - **Tabela de Atendimentos**:
    - Colunas: Paciente, Médico, Sala, Procedimento, Status
    - Paginação
  - Arquivo: `frontend/src/pages/DashboardPage.tsx` (reescrita completa)

---

## [v23] - 2025-10-08

### Added
- **Sistema de Filtros Avançado**: Painel lateral completo de filtros
  - **Filtros disponíveis**:
    - Busca por nome (com ícone de lupa)
    - Estágio do pipeline
    - Procedimento
    - Responsável (usuário atribuído)
    - Status do Cliente (novo, recorrente, VIP, retorno)
    - Canal de Comunicação (WhatsApp, telefone, email, etc)
    - Local de Atendimento (clínica, domicílio, online, hospital)
    - Faixa de Valor (mínimo e máximo)
  - **Features**:
    - Badge mostrando quantidade de filtros ativos
    - Botão "Limpar Filtros"
    - Botão "Aplicar Filtros"
    - Sidebar deslizante da direita
    - Integração com leadsService e userService
  - **Arquivos**:
    - NOVO: `frontend/src/components/leads/LeadsFilter.tsx`
    - MODIFICADO: `frontend/src/pages/LeadsPage.tsx`:
      - Estado `filteredLeads`, `isFilterOpen`, `filters`
      - Função `applyFilters` com lógica de filtragem
      - Função `clearFilters`
      - Renderização condicional do componente LeadsFilter

---

## [v22 e anteriores] - 2025-10-07

### Added
- **Ajustes de Pipeline**: Reestruturação dos estágios de vendas
  - Removida etapa "Proposta"
  - Adicionadas novas etapas:
    - "Lead Esfriou": Para leads que perderam interesse temporariamente
    - "Em Negociação": Substitui "Proposta"
    - "Pagamento Pendente": Para leads que fecharam mas aguardam pagamento
  - Ordem final do pipeline:
    1. Novo Lead
    2. Contato Inicial
    3. Lead Esfriou
    4. Qualificado
    5. Em Negociação
    6. Pagamento Pendente
    7. Fechado
    8. Perdido

### Added
- **Sistema de Rastreamento de Alterações**: Histórico automático de mudanças
  - Registra todas as alterações em campos do lead
  - Mostra campo alterado, valor anterior, valor novo
  - Timestamp de cada alteração
  - Identificação do usuário responsável
  - Exibição na aba "Atividades" do modal
  - Arquivo: `frontend/src/components/leads/LeadModal.tsx`

### Added
- **Sistema de Atividades/Follow-up**: Gestão de tarefas por lead
  - Aba dedicada "Atividades" no modal do lead
  - Formulário para adicionar novas atividades
  - Lista de atividades com título, descrição, data
  - Integração com backend
  - Arquivo: `frontend/src/components/leads/LeadModal.tsx`

### Added
- **5 Modos de Visualização**: Flexibilidade na visualização dos leads
  - Kanban (drag & drop entre estágios)
  - Lista (tabela tradicional)
  - Cards (grade de cards)
  - Timeline (linha do tempo)
  - Calendário (visualização por datas)
  - Seletor de view no cabeçalho
  - Arquivo: `frontend/src/pages/LeadsPage.tsx`

### Added
- **Drag & Drop no Kanban**: Arrastar cards entre estágios
  - Biblioteca @dnd-kit/core
  - Atualização otimista da UI
  - Sincronização com backend
  - Toast de confirmação/erro
  - Arquivo: `frontend/src/pages/LeadsPage.tsx`

### Added
- **Campos Adicionais no Formulário de Lead**:
  - Canal de comunicação (WhatsApp, telefone, email, etc)
  - Status do cliente (novo, recorrente, VIP, retorno)
  - Local de atendimento (clínica, domicílio, online, hospital)
  - Tags personalizadas
  - Arquivo: `frontend/src/components/leads/LeadModal.tsx`

### Fixed
- **Bug procedure.price.toFixed**: Correção de erro em cards de lead
  - Problema: `procedure.price` poderia ser undefined
  - Solução: Adicionado optional chaining e fallback
  - Arquivo: `frontend/src/components/leads/DraggableLeadCard.tsx`

---

## Estrutura Técnica Atual

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Roteamento**: React Router v6
- **Estilização**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **Ícones**: lucide-react
- **Notificações**: react-hot-toast
- **WebSocket**: Socket.IO Client
- **Datas**: date-fns
- **Containerização**: Docker

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL 16 + TypeORM
- **Cache**: Redis 7
- **Mensageria**: RabbitMQ 3
- **WebSocket**: Socket.IO Server
- **Autenticação**: JWT
- **Storage**: S3 (iDrive)
- **Email**: SMTP Zoho
- **WhatsApp**: WAHA API Integration

### Infraestrutura
- **Reverse Proxy**: Traefik v2.10
- **SSL**: Let's Encrypt (automático)
- **Orquestração**: Docker Compose
- **Network**: Bridge (nexusatnet)

---

## Próximos Módulos (Planejados)

Baseado em `/root/nexusatemporal/prompt/Especificacoesdosistema.pdf`:

### 1. Chat Nexus Atemporal ✅ (Implementado em v30)
- ✅ Integração com WhatsApp Business API
- ✅ Chat em tempo real
- ✅ Templates de mensagens (respostas rápidas)
- ✅ Histórico de conversas

### 2. Agenda
- Calendário de agendamentos
- Gestão de salas e recursos
- Notificações automáticas
- Integração com Google Calendar

### 3. Prontuários
- Fichas de pacientes
- Histórico médico
- Anexos de documentos
- Assinatura digital

### 4. Financeiro
- Controle de receitas e despesas
- Contas a pagar/receber
- Relatórios financeiros
- Integração com meios de pagamento

### 5. Estoque
- Controle de produtos
- Entrada/saída
- Alertas de estoque mínimo
- Relatórios de movimentação

### 6. Colaboração
- Chat interno entre equipes
- Compartilhamento de arquivos
- Notificações in-app
- Feed de atividades

### 7. BI (Business Intelligence)
- Dashboards analíticos
- Gráficos de performance
- Relatórios personalizados
- Exportação de dados

### 8. Marketing
- Campanhas de email
- Automação de marketing
- Segmentação de leads
- Métricas de ROI

### 9. Configurações
- Gestão de usuários e permissões
- Configuração de pipeline
- Customização de campos
- Integrações externas

### 10. Redes Sociais
- Integração com Instagram
- Integração com Facebook
- Agendamento de posts
- Análise de engajamento

---

## Variáveis de Ambiente

### Frontend
```
VITE_API_URL=http://72.60.5.29:3001/api
```

### Backend
```
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=nexus_admin
DB_PASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP
DB_DATABASE=nexus_master
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=86Bj2r94OyfxdVqklbvKNAiSVgYRJvUg
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=nexus_mq
RABBITMQ_PASSWORD=ZSGbN3hQJnl3Rnq6TE1wsFVQCi47EJgR
JWT_SECRET=7Kp9mNqR4tXwZaB2cDeF5gHj8kLnMpQrStUvWxYz1A3bCdEf6GhI0JkLmNo
JWT_REFRESH_SECRET=9TuVwXyZ2aBcDeFgHiJkLmNoPqRsTuVwXyZ1AbCdEfGhIjKlMnOpQr3StU
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
S3_ENDPOINT=https://c1k7.va.idrivee2-46.com
S3_ACCESS_KEY_ID=ZaIdY59FGaL8BdtRjZtL
BACKEND_URL=https://api.nexusatemporal.com.br
FRONTEND_URL=https://one.nexusatemporal.com.br
```

---

## Domínios Configurados

- **Frontend**: https://one.nexusatemporal.com.br
- **Backend API**: https://api.nexusatemporal.com.br
- **Traefik Dashboard**: https://traefik.nexusatemporal.com.br

---

## Portas Expostas

- 80: HTTP (Traefik)
- 443: HTTPS (Traefik)
- 8080: Traefik Dashboard
- 3000: Frontend (interno)
- 3001: Backend (interno)
- 15672: RabbitMQ Management

---

## Convenções de Código

### Nomenclatura
- Componentes: PascalCase (ex: `DraggableLeadCard.tsx`)
- Funções: camelCase (ex: `handleDragEnd`)
- Interfaces: PascalCase com sufixo Props quando aplicável
- Variáveis de estado: camelCase

### Estrutura de Arquivos
```
frontend/src/
├── components/
│   └── leads/
│       ├── DraggableLeadCard.tsx
│       ├── LeadModal.tsx
│       └── LeadsFilter.tsx
├── pages/
│   ├── DashboardPage.tsx
│   └── LeadsPage.tsx
├── services/
│   ├── leadsService.ts
│   └── userService.ts
└── App.tsx
```

### Commits e Builds
- Cada alteração significativa gera uma nova versão do frontend
- Versões seguem numeração sequencial: v1, v2, v3...
- Builds são feitas via Docker com tag da versão
- Docker Compose atualizado para refletir versão atual

---

## Notas de Desenvolvimento

### Performance
- Filtragem de leads ocorre no frontend para resposta imediata
- Drag & drop usa atualização otimista (UI primeiro, API depois)
- Imagens Docker em Alpine para menor tamanho

### UX/UI
- Tailwind CSS para consistência visual
- Feedback visual em todas as ações (toasts)
- Loading states em operações assíncronas
- Responsividade mobile-first

### Segurança
- JWT para autenticação
- Senhas em variáveis de ambiente
- HTTPS obrigatório em produção
- CORS configurado

---

## Últimas Modificações em Destaque

1. **ChatPage.tsx + Backend Chat Module** (v30): Módulo completo de Chat/WhatsApp com WebSocket
2. **DraggableLeadCard.tsx** (v28): Sistema de detecção de drag com useRef
3. **LeadsPage.tsx** (v27): Sincronização de arrays leads/filteredLeads
4. **DashboardPage.tsx** (v24-25): Dashboard completa com navegação

---

**Mantido por**: Claude Code
**Última atualização**: 2025-10-08
