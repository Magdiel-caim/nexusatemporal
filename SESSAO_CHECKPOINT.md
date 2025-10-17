# 📋 Checkpoint de Sessão - Nexus Atemporal

**Data da última atualização:** 2025-10-17
**Versão atual:** v75-users-crud
**Branch:** feature/leads-procedures-config

---

## 🎯 Estado Atual do Sistema

### ✅ Funcionalidades Implementadas

#### 1. **Sistema de Permissões RBAC (v73)**
- Sistema completo de Role-Based Access Control
- 81 permissões granulares em 12 módulos
- 5 roles hierárquicos: SUPERADMIN → OWNER → ADMIN → USER → PROFESSIONAL
- Tabelas: `permissions`, `role_permissions`, `audit_logs`
- Backend: Middleware de autorização, service de permissões, audit logs
- Frontend: Hook `usePermissions`, componente `Protected`

#### 2. **Interface de Gerenciamento de Usuários (v74-v75)**
- Lista de usuários com busca
- Badges de roles com cores
- Indicadores de status (Ativo/Inativo)
- Cards de resumo estatístico
- **CRUD Completo:**
  - ✅ Criar usuário (modal com validação)
  - ✅ Editar usuário (modal pré-preenchido)
  - ✅ Excluir usuário (soft delete com confirmação)
- Botões protegidos por permissões
- Toast notifications

#### 3. **Módulo Financeiro (v63-v70)**
- Transações (receitas/despesas)
- Contas a receber/pagar
- Fluxo de caixa
- Relatórios financeiros
- Dashboard com gráficos

#### 4. **Outros Módulos**
- Leads (com exportação/importação v61)
- Agenda/Calendário (v62)
- Prontuários médicos
- Chat WhatsApp (WAHA API integrado)
- Fornecedores, Notas Fiscais, Ordens de Compra

---

## 🗂️ Estrutura de Arquivos Principais

### Backend (`/root/nexusatemporal/backend/`)

```
backend/src/
├── modules/
│   ├── auth/
│   │   └── user.entity.ts              # Enum UserRole atualizado
│   ├── permissions/
│   │   ├── permission.types.ts         # 81 permissões (enum)
│   │   └── permissions.service.ts      # Verificação de permissões
│   └── users/
│       ├── users.controller.ts         # CRUD de usuários
│       └── users.routes.ts             # Rotas /api/users
├── shared/middlewares/
│   └── authorize.middleware.ts         # Middleware de autorização
└── migrations/
    └── create_permissions_system.sql   # Migration completa RBAC
```

### Frontend (`/root/nexusatemporal/frontend/`)

```
frontend/src/
├── components/
│   ├── permissions/
│   │   └── Protected.tsx               # Componente de proteção por permissão
│   └── users/
│       ├── UsersManagement.tsx         # Página principal de usuários
│       ├── UserFormModal.tsx           # Modal criar/editar (320 linhas)
│       └── DeleteUserModal.tsx         # Modal de confirmação exclusão
├── hooks/
│   └── usePermissions.ts               # Hook de permissões (can, canAll, canAny)
├── types/
│   └── permissions.ts                  # Types e enums (sync com backend)
└── pages/
    └── ConfiguracoesPage.tsx           # Página de configurações
```

---

## 🔐 Credenciais e Configurações

### Banco de Dados PostgreSQL
```bash
Host: 46.202.144.210
Port: 5432
Database: nexus_crm
User: nexus_admin
Password: nexus2024@secure
```

### API Backend
```
URL Produção: https://api.nexusatemporal.com.br
Porta Interna: 3001
```

### Frontend
```
URL Produção: https://nexusatemporal.com.br
Porta Interna: 3000
VITE_API_URL: https://api.nexusatemporal.com.br/api
```

### WhatsApp API (WAHA)
```
URL: http://161.35.101.237:3000
Session: default
Status: ✅ Conectado
```

### Backup S3 (IDrive e2)
```bash
AWS_ACCESS_KEY_ID: qFzk5gw00zfSRvj5BQwm
AWS_SECRET_ACCESS_KEY: bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8
Endpoint: https://o0m5.va.idrivee2-26.com
Bucket: backupsistemaonenexus
Path: backups/database/
```

### GitHub
```
Repo: https://github.com/Magdiel-caim/nexusatemporal
Branch Atual: feature/leads-procedures-config
Último Commit: 7bbcef6
```

---

## 🐳 Docker Services

### Serviços Rodando

```bash
# Listar serviços
docker service ls

# Status detalhado
docker service ps nexus_frontend
docker service ps nexus_backend

# Logs
docker service logs nexus_frontend --tail 50
docker service logs nexus_backend --tail 50
```

### Imagens Atuais

```
Backend:  nexus_backend:v73-permissions-system
Frontend: nexus_frontend:v75-users-crud
```

---

## 🚀 Comandos Úteis

### Build e Deploy Frontend

```bash
# Build
cd /root/nexusatemporal/frontend
npm run build

# Docker Build
cd /root/nexusatemporal
docker build -f frontend/Dockerfile -t nexus_frontend:vXX-nome frontend/

# Deploy
docker service update --image nexus_frontend:vXX-nome nexus_frontend

# Verificar status
docker service ps nexus_frontend --no-trunc
```

### Build e Deploy Backend

```bash
# Build
cd /root/nexusatemporal/backend
npm run build

# Docker Build
cd /root/nexusatemporal
docker build -f backend/Dockerfile -t nexus_backend:vXX-nome backend/

# Deploy
docker service update --image nexus_backend:vXX-nome nexus_backend

# Verificar
docker service ps nexus_backend --no-trunc
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Listar tabelas
\dt

# Executar migration
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -f backend/migrations/nome_migration.sql

# Backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PGPASSWORD='nexus2024@secure' pg_dump -h 46.202.144.210 -U nexus_admin -d nexus_crm -F c -f /tmp/nexus_backup_${TIMESTAMP}.backup

# Upload para S3
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" aws s3 cp /tmp/nexus_backup_${TIMESTAMP}.backup s3://backupsistemaonenexus/backups/database/ --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl
```

### Git

```bash
# Status
git status

# Commit
git add .
git commit -m "feat: Descrição da feature"

# Push
git push origin feature/leads-procedures-config

# Tag
git tag vXX-nome
git push origin vXX-nome

# GitHub Release
gh release create vXX-nome --title "vXX - Título" --notes "Descrição..."
```

---

## 📊 Dados Importantes

### Usuários Administrativos

```
Email: ti.nexus@nexusatemporal.com.br
Role: superadmin
Status: active

Email: daniel@clinicaempireexcellence.com.br
Role: owner
Status: active

Email: automacao@nexusatemporal.com.br
Role: admin
Status: active
```

### Estrutura de Permissões

**Módulos com Permissões:**
1. Dashboard (2 permissões)
2. Leads (10 permissões)
3. Agenda (9 permissões)
4. Prontuários (9 permissões)
5. Financeiro (12 permissões)
6. Usuários (8 permissões)
7. Configurações (4 permissões)
8. BI & Analytics (4 permissões)
9. Marketing (7 permissões)
10. Estoque (8 permissões)
11. Chat (6 permissões)
12. SuperAdmin (12 permissões)

**Total: 81 permissões**

### Hierarquia de Roles

```
SUPERADMIN (todas as permissões)
    ↓
OWNER (exceto superadmin permissions)
    ↓
ADMIN (gerenciamento do sistema)
    ↓
MANAGER (equivalente a OWNER, compatibilidade)
    ↓
USER / RECEPTIONIST (acesso básico)
    ↓
PROFESSIONAL / DOCTOR (profissionais)
```

---

## 🔧 Problemas Resolvidos Recentemente

### v74.1 - Erro ERR_CONNECTION_REFUSED
**Problema:** Frontend tentava conectar a `localhost:3000` ao invés da API em produção
**Causa:** Arquivo `.env` estava no `.dockerignore`
**Solução:** Removido `.env` do `.dockerignore`, mantido apenas `.env.local` e `.env.*.local`

### v75 - Botões Não Clicáveis
**Problema:** Botões de Editar/Excluir/Novo Usuário não funcionavam
**Causa:** Faltavam handlers `onClick` e modais
**Solução:** Criados `UserFormModal` e `DeleteUserModal` com handlers completos

---

## 🎯 Próximos Passos Sugeridos

### Prioridade Alta

1. **Sistema de Configurações Personalizadas**
   - Configuração de procedimentos por tenant
   - Valores padrão de procedimentos
   - Mapeamento leads → procedimentos
   - Interface em: `/configuracoes` → seção "Sistema"

2. **Melhorias no Módulo de Leads**
   - Associar procedimentos aos leads
   - Cálculo automático de valor estimado baseado em procedimentos
   - Filtros por procedimento

3. **Dashboard Personalizado por Role**
   - Owner vê tudo
   - Admin vê métricas gerenciais
   - User/Receptionist vê apenas seus leads/agendamentos
   - Professional vê seus atendimentos

### Prioridade Média

4. **Sistema de Notificações**
   - Email notifications (verificação, recuperação de senha)
   - WhatsApp notifications via WAHA
   - Notificações in-app
   - Interface em: `/configuracoes` → seção "Notificações"

5. **Logs de Auditoria UI**
   - Interface para visualizar `audit_logs`
   - Filtros por usuário, módulo, ação, data
   - Exportação de logs
   - Página: `/configuracoes/auditoria`

6. **Permissões Customizadas**
   - UI para atribuir permissões específicas a usuários
   - Override de permissões de role
   - Gestão de permissões temporárias

### Prioridade Baixa

7. **Integrações Adicionais**
   - Gateway Asaas (estrutura já existe em v71)
   - PagBank
   - Email Marketing (SendGrid/Mailchimp)
   - Google Analytics
   - SMS (Twilio/Zenvia)

8. **Melhorias de Performance**
   - Paginação no frontend
   - Lazy loading de componentes
   - Cache de permissões
   - Otimização de queries

---

## 📚 Documentos de Referência

### Localizados em `/root/nexusatemporal/prompt/`

1. **permissoesnexusatemporal.pdf** (1.4MB)
   - Especificação completa do sistema RBAC
   - 81 permissões documentadas
   - Regras de negócio
   - Casos de uso

2. **Especificacoesdosistema.pdf** (1.3MB)
   - Especificações gerais do sistema
   - Arquitetura
   - Módulos planejados

3. **Ações.pdf** (412KB)
   - Ações e workflows do sistema

4. **PLANO_INTEGRACAO_WAHA.md** (16KB)
   - Integração WhatsApp completa

5. **CHANGELOG.md** (19KB)
   - Histórico de versões

6. **TROUBLESHOOTING.md** (8.7KB)
   - Soluções de problemas comuns

---

## 🧪 Como Testar as Funcionalidades

### Testar Gerenciamento de Usuários

```bash
# 1. Fazer login como admin
Acesse: https://nexusatemporal.com.br
Email: ti.nexus@nexusatemporal.com.br
ou outro admin/owner

# 2. Ir para Configurações → Usuários e Permissões

# 3. Testar criação
- Clicar "Novo Usuário"
- Preencher formulário
- Salvar
- Verificar toast de sucesso
- Verificar usuário na lista

# 4. Testar edição
- Clicar ícone lápis azul
- Modificar dados
- Salvar
- Verificar atualização

# 5. Testar exclusão
- Clicar ícone lixeira vermelho
- Confirmar
- Verificar status mudou para "Inativo"
```

### Testar Permissões

```bash
# Via API
TOKEN="seu_token_jwt"

# Obter permissões do usuário
curl -H "Authorization: Bearer $TOKEN" https://api.nexusatemporal.com.br/api/users/permissions/me

# Listar usuários (requer users.view_all)
curl -H "Authorization: Bearer $TOKEN" https://api.nexusatemporal.com.br/api/users

# Criar usuário (requer users.create)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@example.com","password":"123456","role":"user"}' \
  https://api.nexusatemporal.com.br/api/users
```

---

## 🔍 Troubleshooting Rápido

### Frontend não atualiza após deploy
```bash
# Verificar se serviço está rodando nova imagem
docker service ps nexus_frontend

# Limpar cache do navegador
Ctrl + Shift + R (ou Cmd + Shift + R no Mac)

# Verificar logs
docker service logs nexus_frontend --tail 50
```

### API retornando 500
```bash
# Verificar logs do backend
docker service logs nexus_backend --tail 100

# Verificar conexão com banco
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT 1"

# Verificar variáveis de ambiente
docker service inspect nexus_backend --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}'
```

### Permissões não funcionando
```bash
# Verificar se tabelas foram criadas
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "\dt"

# Verificar permissões na tabela
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT COUNT(*) FROM permissions"
# Deve retornar 81

# Verificar role_permissions
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT role, COUNT(*) FROM role_permissions GROUP BY role"
```

---

## 📞 Contatos e Links Úteis

**GitHub Repository:**
https://github.com/Magdiel-caim/nexusatemporal

**Releases:**
https://github.com/Magdiel-caim/nexusatemporal/releases

**Produção:**
- Frontend: https://nexusatemporal.com.br
- API: https://api.nexusatemporal.com.br

**Servidor:**
- Host: servernexus
- Docker Swarm Mode

---

## 📝 Notas Finais

### Convenções de Versionamento

**Pattern:** `vXX-nome-descritivo`

Exemplos:
- v73-permissions-system
- v74-users-ui
- v74.1-env-fix
- v75-users-crud

### Workflow de Deploy

1. Fazer alterações no código
2. Build (frontend ou backend)
3. Build Docker image com tag versionada
4. Deploy via `docker service update`
5. Criar backup do banco
6. Upload backup para S3
7. Commit + push para GitHub
8. Criar tag Git
9. Criar GitHub Release

### Mensagens de Commit

**Pattern:**
```
<tipo>: <descrição curta>

<corpo detalhado>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Tipos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

**🤖 Documento gerado em 2025-10-17 10:45 UTC-3**
**Última versão deployada: v75-users-crud**
**Status: ✅ Sistema estável em produção**
