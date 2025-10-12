# 📋 GUIA PARA PRÓXIMA SESSÃO - Nexus Atemporal v33

**Data desta sessão:** 2025-10-12
**Versão atual:** v33
**Status:** ✅ INFRAESTRUTURA DUAL-DB CONFIGURADA
**Última validação:** Bancos separados, código atualizado, aguardando deploy final

---

## ✅ O QUE FOI IMPLEMENTADO NA v33

### 1. Separação de Bancos de Dados

**VPS Atual (72.60.5.29) - Chat/WhatsApp:**
```
PostgreSQL: nexus_master
Tabelas (2):
├── chat_messages (14 mensagens)
└── whatsapp_sessions (1 sessão ativa: atemporal_main)
```

**VPS Nova (46.202.144.210) - CRM Dedicado:**
```
PostgreSQL: nexus_crm
Tabelas (6):
├── users (1 registro)
├── pipelines (1 registro)
├── stages (7 registros)
├── procedures (5 registros)
├── leads (7 registros)
└── lead_activities (104 registros)

Total: 125 registros
```

### 2. Conexão e Segurança

**PostgreSQL CRM (VPS Nova):**
- Host: `46.202.144.210`
- Port: `5432`
- Database: `nexus_crm`
- User: `nexus_admin`
- Password: `nexus2024@secure`

**Firewall UFW:**
```bash
✅ SSH (22/tcp): Liberado para todos
✅ PostgreSQL (5432/tcp): APENAS 72.60.5.29 (VPS atual)
❌ Outros: Bloqueado
```

**Teste de Conexão:**
```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT version();"
# ✅ PostgreSQL 16.10 on x86_64-pc-linux-musl
```

### 3. Código Backend Atualizado

**Dual DataSource Configurado:**
- `AppDataSource` → Chat/WhatsApp (VPS atual)
- `CrmDataSource` → CRM (VPS nova)

**Arquivos Modificados:**
```
backend/src/
├── database/data-source.ts
│   └── CrmDataSource adicionado (+42 linhas)
├── server.ts
│   └── Promise.all([AppDataSource, CrmDataSource]) (+10 linhas)
└── modules/
    ├── leads/
    │   ├── lead.service.ts → CrmDataSource
    │   ├── pipeline.service.ts → CrmDataSource
    │   └── procedure.service.ts → CrmDataSource
    └── auth/
        └── auth.service.ts → CrmDataSource
```

**Variáveis de Ambiente (já configuradas no service):**
```bash
CRM_DB_HOST=46.202.144.210
CRM_DB_PORT=5432
CRM_DB_USERNAME=nexus_admin
CRM_DB_PASSWORD=nexus2024@secure
CRM_DB_DATABASE=nexus_crm
```

---

## 📊 ESTRUTURA DO BANCO DE DADOS - ESTADO ATUAL

### Tabelas Existentes (8 total)

#### VPS Atual - Chat (2 tabelas):
1. **chat_messages**
   - Armazena mensagens do WhatsApp
   - Campos: id, session_name, phone_number, direction, content, waha_message_id, created_at

2. **whatsapp_sessions**
   - Gerencia sessões WhatsApp conectadas
   - Relacionamento: `user_id → users.id` (FK)

#### VPS Nova - CRM (6 tabelas):
3. **users**
   - Usuários do sistema
   - 1 registro (admin)

4. **pipelines**
   - Funis de vendas customizados
   - 1 registro (pipeline padrão)

5. **stages**
   - Estágios dos pipelines
   - 7 registros
   - Relacionamento: `pipelineId → pipelines.id` (FK)

6. **procedures**
   - Procedimentos/Serviços oferecidos
   - 5 registros

7. **leads**
   - Leads/Clientes potenciais
   - 7 registros
   - Relacionamentos:
     - `stageId → stages.id` (FK)
     - `procedureId → procedures.id` (FK)
     - `assignedToId → users.id` (FK)
     - `createdById → users.id` (FK)

8. **lead_activities**
   - Histórico de atividades dos leads
   - 104 registros
   - Relacionamentos:
     - `leadId → leads.id` (FK)
     - `userId → users.id` (FK)

### ENUMs Criados (9):
```sql
- lead_activities_type_enum (13 valores)
- leads_attendancelocation_enum (4 valores)
- leads_channel_enum (9 valores)
- leads_clientstatus_enum (6 valores)
- leads_priority_enum (4 valores)
- leads_source_enum (9 valores)
- leads_status_enum (7 valores)
- users_role_enum (6 valores)
- users_status_enum (3 valores)
```

---

## ⚠️ MÓDULOS SEM ESTRUTURA DE BANCO (CRÍTICO!)

Durante a validação, identificamos que existem **13 módulos** no código mas apenas **8 tabelas** no banco. Isso significa que vários módulos estão vazios ou incompletos.

### Entities Definidas mas SEM Tabela (5 do Chat):
```
backend/src/modules/chat/
├── attachment.entity.ts       ❌ Tabela não existe
├── conversation.entity.ts     ❌ Tabela não existe
├── message.entity.ts          ❌ Tabela não existe (usa chat_messages)
├── quick-reply.entity.ts      ❌ Tabela não existe
└── tag.entity.ts              ❌ Tabela não existe
```

### Módulos COMPLETAMENTE VAZIOS (7):
```
backend/src/modules/
├── agenda/           ❌ SEM ARQUIVOS - CRÍTICO!
├── bi/               ❌ SEM ARQUIVOS
├── colaboracao/      ❌ SEM ARQUIVOS
├── estoque/          ❌ SEM ARQUIVOS
├── financeiro/       ❌ SEM ARQUIVOS
├── marketing/        ❌ SEM ARQUIVOS
└── prontuarios/      ❌ SEM ARQUIVOS
```

### ⚠️ PROBLEMA CRÍTICO: Módulo Agenda

**SITUAÇÃO:**
- Pasta `/backend/src/modules/agenda/` existe mas está **VAZIA**
- Não há tabela de agendamentos no banco
- Não há relacionamento Lead → Agendamentos
- Sistema não pode agendar consultas/procedimentos

**IMPACTO:**
- ❌ Leads não podem ser convertidos em agendamentos
- ❌ Não há calendário de atendimentos
- ❌ Não há controle de horários disponíveis
- ❌ Não há gestão de profissionais/salas

**SOLUÇÃO NECESSÁRIA:**
Criar estrutura completa do módulo Agenda (ver seção "Próximos Passos").

---

## 🚀 PRÓXIMOS PASSOS OBRIGATÓRIOS

### 1. Deploy do Backend com Dual-DB

**Status:** ⚠️ Código atualizado mas NÃO deployado

**Comandos:**
```bash
cd /root/nexusatemporal/backend

# Compilar TypeScript
npm run build

# Build imagem Docker
docker build -t nexus_backend:v33-dual-db -f Dockerfile .

# Atualizar serviço
docker service update --image nexus_backend:v33-dual-db nexus_backend

# Aguardar convergência
docker service ls | grep nexus_backend

# Verificar logs
docker service logs nexus_backend --tail 50 | grep -E "Database|CRM|✅"
```

**Log esperado:**
```
✅ Chat Database connected successfully (chat_messages, whatsapp_sessions)
✅ CRM Database connected successfully (leads, users, pipelines, etc)
   CRM DB Host: 46.202.144.210
🚀 Server running on port 3001
```

### 2. Criar Módulo de Agendamentos (URGENTE!)

**Objetivo:** Integrar Leads com Agenda

**Estrutura Necessária:**

**a) Entity: `appointment.entity.ts`**
```typescript
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leadId: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column()
  procedureId: string;

  @ManyToOne(() => Procedure)
  @JoinColumn({ name: 'procedureId' })
  procedure: Procedure;

  @Column()
  professionalId: string;  // userId do profissional

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professionalId' })
  professional: User;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;  // Data/hora do agendamento

  @Column({ type: 'int' })
  duration: number;  // Duração em minutos

  @Column({
    type: 'enum',
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  tenantId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

**b) Criar Migration:**
```bash
# Gerar migration
npm run typeorm migration:create src/database/migrations/CreateAppointments

# Executar migration
npm run typeorm migration:run
```

**c) Service e Controller:**
```
backend/src/modules/agenda/
├── appointment.entity.ts
├── appointment.service.ts
├── appointment.controller.ts
└── agenda.routes.ts
```

**d) Endpoints Necessários:**
```
POST   /api/agenda/appointments         # Criar agendamento
GET    /api/agenda/appointments         # Listar agendamentos
GET    /api/agenda/appointments/:id     # Detalhes
PUT    /api/agenda/appointments/:id     # Atualizar
DELETE /api/agenda/appointments/:id     # Cancelar
GET    /api/agenda/available-slots      # Horários disponíveis
GET    /api/agenda/calendar             # Calendário do dia/semana
```

### 3. Validar Sistema Completo

**Checklist de Validação:**

**a) Conexão com Bancos:**
```bash
# Testar Chat DB
curl -s https://api.nexusatemporal.com.br/health | jq

# Testar CRM DB (via API)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -s "https://api.nexusatemporal.com.br/api/leads/pipelines" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**b) Criar Lead de Teste:**
```bash
curl -X POST "https://api.nexusatemporal.com.br/api/leads" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Dual DB",
    "phone": "11999999999",
    "email": "teste@teste.com",
    "stageId": "uuid-do-stage",
    "tenantId": "default"
  }'
```

**c) Verificar no Banco CRM:**
```bash
ssh root@46.202.144.210
docker ps -q -f name=nexus_crm_postgres | head -1 | \
  xargs docker exec -it {} psql -U nexus_admin -d nexus_crm -c \
  "SELECT id, name, phone FROM leads ORDER BY created_at DESC LIMIT 5;"
```

**d) Verificar Chat:**
```bash
# Na VPS atual
CONTAINER=$(docker ps -q -f name=nexus_postgres)
docker exec $CONTAINER psql -U nexus_admin -d nexus_master -c \
  "SELECT COUNT(*) FROM chat_messages;"
```

### 4. Implementar Outros Módulos (Futuro)

**Prioridade Alta:**
1. **agenda** - Agendamentos (URGENTE)
2. **prontuarios** - Prontuários médicos
3. **financeiro** - Controle de pagamentos

**Prioridade Média:**
4. **estoque** - Produtos/Materiais
5. **marketing** - Campanhas e automações
6. **bi** - Relatórios e dashboards

**Prioridade Baixa:**
7. **colaboracao** - Notas compartilhadas

---

## 🔧 COMANDOS ÚTEIS DE DIAGNÓSTICO

### Verificar Status Geral
```bash
# 1. Serviços Docker
docker service ls

# 2. PostgreSQL Chat (VPS Atual)
docker ps -q -f name=nexus_postgres | head -1 | \
  xargs docker exec {} psql -U nexus_admin -d nexus_master -c "\dt"

# 3. PostgreSQL CRM (VPS Nova)
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "\dt"

# 4. Logs Backend
docker service logs nexus_backend --tail 100 | grep -E "Database|ERROR|CRM"

# 5. Testar API
curl -I https://api.nexusatemporal.com.br/health
```

### Verificar Conectividade entre VPS
```bash
# Da VPS Atual → VPS Nova
ping -c 3 46.202.144.210
telnet 46.202.144.210 5432

# Testar PostgreSQL
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT 1;"
```

### Verificar Dados Migrados
```bash
# VPS Nova - Contagem de registros
ssh root@46.202.144.210 << 'EOF'
CONTAINER=$(docker ps -q -f name=nexus_crm_postgres | head -1)
docker exec $CONTAINER psql -U nexus_admin -d nexus_crm -c "
  SELECT 'leads' as tabela, COUNT(*) FROM leads
  UNION ALL SELECT 'users', COUNT(*) FROM users
  UNION ALL SELECT 'pipelines', COUNT(*) FROM pipelines
  UNION ALL SELECT 'procedures', COUNT(*) FROM procedures
  UNION ALL SELECT 'stages', COUNT(*) FROM stages
  UNION ALL SELECT 'lead_activities', COUNT(*) FROM lead_activities;
"
EOF
```

---

## 🚨 SE ALGO DER ERRADO

### Problema: Backend não conecta no CRM DB

**Diagnóstico:**
```bash
# 1. Verificar se serviço PostgreSQL está rodando na VPS nova
ssh root@46.202.144.210 "docker ps | grep nexus_crm_postgres"

# 2. Verificar firewall
ssh root@46.202.144.210 "ufw status | grep 5432"

# 3. Testar conexão da VPS atual
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT 1;"

# 4. Ver logs do backend
docker service logs nexus_backend --tail 50 | grep -i error
```

**Soluções:**
```bash
# Se PostgreSQL não está rodando:
ssh root@46.202.144.210 "docker service ls | grep nexus_crm"
ssh root@46.202.144.210 "docker service update --force nexus_crm_postgres"

# Se firewall bloqueando:
ssh root@46.202.144.210 "ufw allow from 72.60.5.29 to any port 5432"

# Se variáveis de ambiente erradas:
docker service inspect nexus_backend --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | grep CRM_DB
```

### Problema: Dados não aparecem no CRM

**Verificar se tabelas existem:**
```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "\dt"
```

**Se tabelas vazias, reimportar:**
```bash
# 1. Backup está em:
ls -lh /tmp/nexus_crm_complete.sql

# 2. Reimportar
ssh root@46.202.144.210 << 'EOF'
CONTAINER=$(docker ps -q -f name=nexus_crm_postgres | head -1)
cat /tmp/nexus_crm_complete.sql | docker exec -i $CONTAINER psql -U nexus_admin -d nexus_crm
EOF
```

### Problema: Chat parou de funcionar

**Verificar banco Chat:**
```bash
docker ps -q -f name=nexus_postgres | head -1 | \
  xargs docker exec {} psql -U nexus_admin -d nexus_master -c \
  "SELECT COUNT(*) FROM chat_messages;"
```

**Se erro de conexão:**
```bash
# Ver logs
docker service logs nexus_backend --tail 100 | grep -i "appDataSource\|chat"

# Reiniciar backend
docker service update --force nexus_backend
```

---

## 📦 BACKUPS REALIZADOS

### Banco de Dados Completo
```
Local: /tmp/nexus_backup_separacao_db_20251012_004058.sql (65KB)
iDrive e2: s3://backupsistemaonenexus/backups/database/nexus_backup_separacao_db_20251012_004058.sql
```

### Arquivos SQL de Migração
```
/tmp/nexus_crm_schema.sql (9.1KB)
/tmp/nexus_crm_data.sql (28KB)
/tmp/nexus_crm_complete.sql (38KB)
/tmp/all_enums.sql (78 linhas)
```

### Código no GitHub
```
Branch: main
Commits pendentes: Sim (v33 - separação de bancos)
```

---

## 📚 ARQUITETURA FINAL DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Atual (72.60.5.29)                    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PostgreSQL: nexus_master                             │  │
│  │  ├── chat_messages (14)                               │  │
│  │  └── whatsapp_sessions (1)                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↑                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Backend NestJS (nexus_backend)                       │  │
│  │  ├── AppDataSource → Chat DB (local)                  │  │
│  │  └── CrmDataSource → CRM DB (46.202.144.210:5432) ───┼──┼─┐
│  └───────────────────────────────────────────────────────┘  │ │
│                                                               │ │
│  Frontend, Redis, RabbitMQ, WAHA, Traefik                    │ │
└───────────────────────────────────────────────────────────────┘ │
                                                                  │
                        Firewall: 5432/tcp ← 72.60.5.29          │
                                                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                 VPS Nova (46.202.144.210)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  PostgreSQL: nexus_crm                                │    │
│  │  ├── users (1)                                        │    │
│  │  ├── pipelines (1)                                    │    │
│  │  ├── stages (7)                                       │    │
│  │  ├── procedures (5)                                   │    │
│  │  ├── leads (7)                                        │    │
│  │  └── lead_activities (104)                            │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE INÍCIO DE SESSÃO

Antes de começar qualquer modificação, sempre verificar:

- [ ] Backend está rodando (curl https://api.nexusatemporal.com.br/health)
- [ ] Frontend acessível (https://one.nexusatemporal.com.br)
- [ ] PostgreSQL Chat funcionando (VPS atual)
- [ ] PostgreSQL CRM funcionando (VPS nova - 46.202.144.210)
- [ ] Firewall UFW ativo na VPS nova
- [ ] Sessão WhatsApp conectada (atemporal_main)
- [ ] Git status limpo ou entender modificações pendentes

**Comandos rápidos:**
```bash
# Status geral
docker service ls
curl -I https://api.nexusatemporal.com.br/health
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT COUNT(*) FROM leads;"

# Git status
cd /root/nexusatemporal && git status --short
```

---

## 📝 NOTAS FINAIS

### O que NÃO FAZER

❌ **NÃO** deletar tabelas sem backup
❌ **NÃO** mudar credenciais do PostgreSQL sem atualizar backend
❌ **NÃO** desativar firewall na VPS nova
❌ **NÃO** fazer deploy sem testar conexão com CRM DB
❌ **NÃO** criar tabelas no banco errado (Chat vs CRM)

### O que SEMPRE FAZER

✅ **SEMPRE** fazer backup antes de modificar estrutura do banco
✅ **SEMPRE** testar conexão CRM DB após alterações de rede
✅ **SEMPRE** verificar logs após deploy
✅ **SEMPRE** commitar código antes de testar em produção
✅ **SEMPRE** documentar mudanças no CHANGELOG

### Perguntas Críticas para Claude na Próxima Sessão

1. **O módulo agenda foi criado?**
   - Se não, essa é a PRIORIDADE MÁXIMA
   - Sem agenda, não há integração Lead → Agendamento

2. **O backend foi deployado com dual-DB?**
   - Verificar logs mostrando "CRM Database connected"
   - Testar criação de lead e verificar no banco da VPS nova

3. **Todos os módulos que precisam de banco estão usando CrmDataSource?**
   - Verificar se novos módulos estão usando o datasource correto

4. **As entities do chat (attachment, conversation, etc) serão implementadas?**
   - Decidir se mantém no Chat DB ou move para CRM DB

---

**Criado em:** 2025-10-12 04:00 UTC
**Versão do Sistema:** v33
**Status:** ⚠️ CÓDIGO ATUALIZADO - AGUARDANDO DEPLOY

🚀 **Próximo passo obrigatório:** Deploy do backend e criação do módulo Agenda!
