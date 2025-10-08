# CHANGELOG - Nexus Atemporal

## Visão Geral
Sistema de CRM completo para gestão de leads, pacientes e procedimentos estéticos.

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
- **Containerização**: Docker

### Backend
- **Framework**: Node.js + NestJS (presumido)
- **Banco de Dados**: PostgreSQL 16
- **Cache**: Redis 7
- **Mensageria**: RabbitMQ 3
- **Autenticação**: JWT
- **Storage**: S3 (iDrive)
- **Email**: SMTP Zoho

### Infraestrutura
- **Reverse Proxy**: Traefik v2.10
- **SSL**: Let's Encrypt (automático)
- **Orquestração**: Docker Compose
- **Network**: Bridge (nexusatnet)

---

## Próximos Módulos (Planejados)

Baseado em `/root/nexusatemporal/prompt/Especificacoesdosistema.pdf`:

### 1. Chat Nexus Atemporal
- Integração com WhatsApp Business API
- Chat em tempo real
- Templates de mensagens
- Histórico de conversas

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

1. **DraggableLeadCard.tsx** (v28): Sistema de detecção de drag com useRef
2. **LeadsPage.tsx** (v27): Sincronização de arrays leads/filteredLeads
3. **DashboardPage.tsx** (v24-25): Dashboard completa com navegação
4. **LeadsFilter.tsx** (v23): Sistema de filtros avançado

---

**Mantido por**: Claude Code
**Última atualização**: 2025-10-08
