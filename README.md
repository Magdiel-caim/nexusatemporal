# One Nexus Atemporal

Sistema CRM completo para gestão de clínicas médicas com módulos integrados de leads, agendamentos, prontuários eletrônicos, chat com WhatsApp, financeiro e muito mais.

## 🚀 Stack Tecnológica

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Zustand (State Management)
- TanStack Query (React Query)
- Socket.IO Client
- ExcelJS, Papa Parse (Export/Import)

### Backend
- Node.js + Express + TypeScript
- TypeORM + PostgreSQL 16
- JWT Authentication
- Redis (Cache)
- RabbitMQ (Message Queue)
- Socket.IO (Real-time)
- Nodemailer (SMTP)

### Infraestrutura
- Docker Swarm
- Traefik (Reverse Proxy + SSL)
- iDrive E2 (S3 Storage)
- PostgreSQL 16

### Integrações
- WhatsApp (Waha)
- Chatwoot
- n8n (Automações)
- Mautic (Marketing)
- OpenAI (BI e IA)
- Gateways de Pagamento (Stripe, Mercado Pago, Asaas, PagSeguro)

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🔧 Instalação

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd nexusatemporal
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 3. Criar a rede externa do Docker

```bash
docker network create nexusatnet
```

### 4. Instalar dependências (desenvolvimento)

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## 🐳 Deploy com Docker Swarm

### 1. Inicializar Docker Swarm

```bash
docker swarm init
```

### 2. Deploy do stack

```bash
docker stack deploy -c docker-compose.yml nexus
```

### 3. Verificar serviços

```bash
docker stack services nexus
docker stack ps nexus
```

### 4. Ver logs

```bash
docker service logs nexus_backend -f
docker service logs nexus_frontend -f
```

### 5. Remover stack

```bash
docker stack rm nexus
```

## 🔨 Desenvolvimento Local

### Backend

```bash
cd backend
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 📦 Build para Produção

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🗄️ Banco de Dados

### Executar migrations

```bash
cd backend
npm run migration:run
```

### Criar nova migration

```bash
npm run migration:generate -- -n MigrationName
```

### Reverter migration

```bash
npm run migration:revert
```

### Popular banco (seeds)

```bash
npm run seed
```

## 🌐 Domínios

- **Frontend**: `https://one.nexusatemporal.com.br`
- **Backend API**: `https://api.nexusatemporal.com.br`
- **Traefik Dashboard**: `https://traefik.nexusatemporal.com.br`

## 📡 Endpoints API

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify-email/:token` - Verificar email
- `POST /api/auth/request-password-reset` - Solicitar reset de senha
- `POST /api/auth/reset-password/:token` - Resetar senha
- `GET /api/auth/me` - Obter usuário atual (protegida)

### Data

- `GET /api/data` - Obter data/hora do servidor (protegida)

### Health Check

- `GET /health` - Verificar saúde da API
- `GET /api/health` - Verificar saúde da API (rota alternativa)

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_token_aqui>
```

## 🏗️ Estrutura do Projeto

```
nexusatemporal/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── leads/
│   │   │   ├── agenda/
│   │   │   ├── chat/
│   │   │   ├── prontuarios/
│   │   │   ├── financeiro/
│   │   │   ├── estoque/
│   │   │   ├── colaboracao/
│   │   │   ├── bi/
│   │   │   ├── marketing/
│   │   │   └── config/
│   │   ├── shared/
│   │   ├── database/
│   │   └── integrations/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🎯 Módulos do Sistema

### 1. Dashboard
- KPIs em tempo real
- Gráficos e métricas
- Alertas e notificações
- Atividades recentes

### 2. Leads/Pipeline
- Gestão de leads (Kanban, Lista, Grade, Timeline, Divisão)
- Qualificação automática
- Integração com chat
- Tags e etiquetas

### 3. Chat Nexus Atemporal
- Integração WhatsApp (Waha)
- Integração Chatwoot
- Bot de atendimento com IA
- Filas e automações
- Backup automático

### 4. Agenda
- Calendário de agendamentos
- Sincronização Google Calendar
- Retornos automáticos
- Notificações programadas

### 5. Prontuários
- Fichas de anamnese
- Histórico de procedimentos
- Documentos anexados
- Prescrições

### 6. Financeiro
- Controle de caixa
- Contas a pagar/receber
- Integração com gateways de pagamento
- Relatórios fiscais

### 7. Estoque
- Controle de produtos
- Inventário
- Alertas de estoque baixo

### 8. Colaboração
- Feed interno
- Mensageiro
- Drive (iDrive E2)
- Calendário da equipe

### 9. BI (Business Intelligence)
- Relatórios personalizados
- Análises com IA (OpenAI)
- Exportação de dados
- Dashboards dinâmicos

### 10. Marketing
- Integração Mautic
- Campanhas
- Redes sociais (Instagram, Facebook)

### 11. Configurações
- Gerenciamento de usuários
- Permissões e níveis de acesso
- Integrações
- Logs de sistema

## 📤 Export/Import

O sistema suporta exportação e importação de dados nos formatos:

- CSV
- XLSX (Excel)
- HTML
- PDF
- JSON
- XML

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Autenticação 2FA por email
- Rate limiting
- Helmet (Security headers)
- CORS configurável
- Bcrypt para senhas (12 rounds)
- SSL/TLS com Let's Encrypt via Traefik

## 🎨 Temas

O sistema suporta temas claro e escuro (Dark/Light mode).

## 🌍 Multi-tenancy

Cada clínica possui seu próprio banco de dados isolado. O sistema cria automaticamente o banco ao registrar uma nova clínica.

Formato do banco: `nexus_tenant_{tenantId}`

## 🔄 Atualizações

### Atualizar stack em produção

```bash
docker stack deploy -c docker-compose.yml nexus
```

### Atualizar apenas um serviço

```bash
docker service update nexus_backend
docker service update nexus_frontend
```

## 📊 Monitoramento

### Ver logs em tempo real

```bash
docker service logs -f nexus_backend
docker service logs -f nexus_frontend
docker service logs -f nexus_postgres
```

### Ver status dos serviços

```bash
docker stack services nexus
```

### Escalar serviços

```bash
docker service scale nexus_backend=3
docker service scale nexus_frontend=2
```

## 🆘 Troubleshooting

### Problema: Serviço não inicia

```bash
docker service ps nexus_backend --no-trunc
docker service logs nexus_backend
```

### Problema: Banco de dados não conecta

Verifique se o PostgreSQL está rodando:

```bash
docker service ps nexus_postgres
docker service logs nexus_postgres
```

### Problema: Frontend não carrega

Verifique os logs do Traefik e frontend:

```bash
docker service logs nexus_traefik
docker service logs nexus_frontend
```

### Resetar tudo

```bash
docker stack rm nexus
docker volume rm nexusatemporal_postgres_data
docker volume rm nexusatemporal_redis_data
docker volume rm nexusatemporal_rabbitmq_data
docker stack deploy -c docker-compose.yml nexus
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Suporte

Para suporte, entre em contato através de: contato@nexusatemporal.com.br

---

**One Nexus Atemporal** - Sistema de Gestão para Clínicas Médicas 🏥
