# 🏢 Guia Completo de Infraestrutura SaaS Multi-Tenant

**Sistema:** Nexus Atemporal CRM
**Versão:** v34-media-complete
**Data:** 2025-10-13
**Autor:** Claude Code

---

## 📑 Índice

1. [Multi-Tenancy (SaaS)](#1-multi-tenancy-saas)
2. [Disaster Recovery](#2-disaster-recovery)
3. [Migração Entre VPS](#3-migração-entre-vps)
4. [Escalabilidade e Performance](#4-escalabilidade-e-performance)
5. [Problemas Comuns e Soluções](#5-problemas-comuns-e-soluções)
6. [Monitoramento e Alertas](#6-monitoramento-e-alertas)
7. [Planos de Contingência](#7-planos-de-contingência)

---

## 1. Multi-Tenancy (SaaS)

### 🎯 O que é Multi-Tenant?

Multi-tenancy (ou "tenant" = inquilino) é a arquitetura onde **um único sistema serve múltiplos clientes** (tenants), mantendo os dados isolados entre eles.

**Exemplo:**
```
Tenant 1: Clínica de Estética "Beleza Total" (São Paulo)
Tenant 2: Clínica "Corpo & Rosto" (Rio de Janeiro)
Tenant 3: Spa "Zen" (Curitiba)

Cada uma tem:
- Seus próprios leads
- Seus próprios usuários
- Seus próprios pipelines
- Dados completamente isolados
```

### 🔧 Implementação Atual

O Nexus Atemporal **JÁ ESTÁ PREPARADO** para multi-tenancy:

#### 1.1 Estrutura de Dados

```typescript
// user.entity.ts (linha 62)
@Column({ nullable: true, type: 'varchar' })
tenantId: string | null;

// Cada usuário pertence a um tenant
// tenantId = null → Super Admin (acesso global)
// tenantId = "tenant-123" → Usuário da Clínica XYZ
```

#### 1.2 Todos os Dados Têm Isolamento

```sql
-- Leads
SELECT * FROM leads WHERE tenantId = 'tenant-123';

-- Users
SELECT * FROM users WHERE tenantId = 'tenant-123';

-- Pipelines
SELECT * FROM pipelines WHERE tenantId = 'tenant-123';

-- Messages
SELECT * FROM messages WHERE tenantId = 'tenant-123';
```

#### 1.3 Middleware de Autenticação

O sistema automaticamente filtra dados por `tenantId` em cada requisição:

```typescript
// auth.middleware.ts
interface Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    tenantId?: string | null;  // ← Aqui!
    permissions: string[];
  };
}
```

### 📊 Modelo de Banco de Dados

**Opção Atual:** Banco Único com Isolamento por `tenantId` (Shared Database)

```
┌─────────────────────────────────────┐
│      PostgreSQL nexus_master        │
├─────────────────────────────────────┤
│  users (tenantId)                   │
│  leads (tenantId)                   │
│  pipelines (tenantId)               │
│  messages (tenantId)                │
│  procedures (tenantId)              │
└─────────────────────────────────────┘

Vantagens:
✅ Simples de gerenciar
✅ Backup único
✅ Atualizações simultâneas
✅ Menor custo de infraestrutura

Desvantagens:
⚠️ Todos os tenants afetados se banco cair
⚠️ Precisa garantir isolamento no código
⚠️ Mais difícil customizar por cliente
```

**Opção Futura:** Banco por Tenant (Database per Tenant)

```
┌──────────────────────┐  ┌──────────────────────┐
│ tenant_123_db        │  │ tenant_456_db        │
├──────────────────────┤  ├──────────────────────┤
│ users                │  │ users                │
│ leads                │  │ leads                │
│ pipelines            │  │ pipelines            │
└──────────────────────┘  └──────────────────────┘

Vantagens:
✅ Isolamento total
✅ Fácil customizar por cliente
✅ Se um banco cair, outros continuam
✅ Facilita vendas/migrações

Desvantagens:
⚠️ Mais complexo de gerenciar
⚠️ Backup de múltiplos bancos
⚠️ Atualizações em múltiplos lugares
⚠️ Maior custo de infraestrutura
```

### 🚀 Como Adicionar Novo Tenant

```bash
# 1. Criar organização/tenant no banco
psql -h localhost -U nexus_admin -d nexus_master

INSERT INTO tenants (id, name, domain, status, created_at)
VALUES (
  'tenant-clinica-sp',
  'Clínica Beleza Total',
  'clinica-sp.nexusatemporal.com',
  'active',
  NOW()
);

# 2. Criar usuário admin do tenant
INSERT INTO users (id, email, password, name, role, tenant_id, status)
VALUES (
  uuid_generate_v4(),
  'admin@clinica-sp.com',
  '$2a$12$hashed_password',
  'Admin Clínica SP',
  'admin',
  'tenant-clinica-sp',
  'active'
);

# 3. Criar pipelines padrão para o tenant
INSERT INTO pipelines (id, name, tenant_id)
VALUES (
  uuid_generate_v4(),
  'Pipeline Padrão',
  'tenant-clinica-sp'
);
```

### 🔐 Níveis de Acesso

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',    // Acesso a TODOS os tenants
  ADMIN = 'admin',                 // Admin do tenant
  MANAGER = 'manager',             // Gerente do tenant
  DOCTOR = 'doctor',               // Médico/especialista
  RECEPTIONIST = 'receptionist',   // Recepcionista
  USER = 'user',                   // Usuário comum
}
```

**Hierarquia de Permissões:**

```
SUPER_ADMIN (tenantId = null)
    └── Acessa todos os tenants
    └── Gerencia sistema global
    └── Cria novos tenants

ADMIN (tenantId = 'tenant-123')
    └── Acessa apenas seu tenant
    └── Gerencia usuários do tenant
    └── Configura pipelines e procedimentos

MANAGER, DOCTOR, RECEPTIONIST, USER
    └── Acesso limitado ao tenant
    └── Permissões específicas por role
```

---

## 2. Disaster Recovery

### 🆘 O que Fazer se a VPS Cair?

#### Cenários de Desastre

| Problema | Impacto | Tempo de Recuperação |
|----------|---------|---------------------|
| Serviço Docker parado | ⚠️ Baixo | 1-5 min |
| VPS reiniciada | ⚠️ Médio | 5-10 min |
| VPS corrompida | 🔴 Alto | 30-60 min |
| Datacenter offline | 🔴 Crítico | 1-4 horas |

### 📦 Sistema de Backups

#### Backup Automático Diário

```bash
# Cron job (executar diariamente às 3h AM)
0 3 * * * /root/scripts/backup_nexus.sh

# /root/scripts/backup_nexus.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup banco principal
docker ps -q -f name=nexus_postgres | head -1 | \
  xargs -I {} docker exec {} pg_dump -U nexus_admin nexus_master \
  > /tmp/nexus_backup_${TIMESTAMP}.sql

# Backup banco chat (remoto)
sshpass -p 'k+cRtS3F6k1@' ssh root@46.202.144.210 \
  "docker ps -q -f name=nexus_crm_postgres | head -1 | \
  xargs -I {} docker exec {} pg_dump -U nexus_admin nexus_chat" \
  > /tmp/nexus_chat_backup_${TIMESTAMP}.sql

# Upload para S3 (IDrive e2)
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 cp /tmp/nexus_backup_${TIMESTAMP}.sql \
  s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl

aws s3 cp /tmp/nexus_chat_backup_${TIMESTAMP}.sql \
  s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl

# Limpar arquivos locais antigos (manter últimos 7 dias)
find /tmp -name "nexus_backup_*.sql" -mtime +7 -delete
```

#### Backup de Arquivos Docker

```bash
# Backup de volumes Docker
docker run --rm -v nexus_crm_pgdata:/data \
  -v /backup:/backup alpine \
  tar czf /backup/nexus_pgdata_${TIMESTAMP}.tar.gz /data

# Backup de imagens Docker
docker save nexus_backend:v34-media-complete \
  nexus_frontend:v34-media-complete \
  > /backup/nexus_images_v34.tar
```

### 🔄 Retenção de Backups

```
Local (/tmp): 7 dias
IDrive e2 S3: 90 dias
```

---

## 3. Migração Entre VPS

### 🚚 Como Migrar Sistema Completo para Nova VPS

#### 3.1 Pré-Requisitos Nova VPS

```bash
# Especificações mínimas recomendadas
CPU: 4 cores
RAM: 8GB (16GB recomendado)
Disco: 100GB SSD
OS: Ubuntu 22.04 LTS

# Software necessário
- Docker 24.x
- Docker Swarm
- Git
- AWS CLI
- sshpass, curl, jq
```

#### 3.2 Passo a Passo de Migração

##### **PASSO 1: Preparar Nova VPS**

```bash
# Conectar na nova VPS
ssh root@NEW_VPS_IP

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Inicializar Docker Swarm
docker swarm init --advertise-addr NEW_VPS_IP

# Instalar ferramentas
apt update
apt install -y git sshpass postgresql-client awscli jq

# Configurar firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 2377/tcp   # Docker Swarm
ufw allow 7946/tcp   # Docker overlay
ufw allow 7946/udp
ufw allow 4789/udp   # VXLAN
echo "y" | ufw enable
```

##### **PASSO 2: Baixar Repositório**

```bash
cd /root
git clone https://github.com/Magdiel-caim/nexusatemporal.git
cd nexusatemporal
git checkout main
```

##### **PASSO 3: Restaurar Backups**

```bash
# Baixar último backup do S3
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 cp s3://backupsistemaonenexus/backups/database/nexus_backup_v34_master_20251013_122930.sql \
  /tmp/restore.sql \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl

# Criar volume para PostgreSQL
docker volume create nexus_crm_pgdata

# Subir PostgreSQL temporário
docker service create \
  --name nexus_postgres_temp \
  --mount type=volume,source=nexus_crm_pgdata,target=/var/lib/postgresql/data \
  -e POSTGRES_USER=nexus_admin \
  -e POSTGRES_PASSWORD=nexus2024@secure \
  -e POSTGRES_DB=nexus_master \
  -p 5432:5432 \
  postgres:16-alpine

# Aguardar PostgreSQL iniciar (30 segundos)
sleep 30

# Restaurar backup
docker ps -q -f name=nexus_postgres_temp | head -1 | \
  xargs -I {} docker exec -i {} psql -U nexus_admin -d nexus_master < /tmp/restore.sql

# Parar serviço temporário
docker service rm nexus_postgres_temp
```

##### **PASSO 4: Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env no backend
cat > /root/nexusatemporal/backend/.env <<'EOF'
NODE_ENV=production
PORT=3001

# Database
DB_TYPE=postgres
DB_HOST=nexus_postgres
DB_PORT=5432
DB_USERNAME=nexus_admin
DB_PASSWORD=nexus2024@secure
DB_DATABASE=nexus_master

# JWT
JWT_SECRET=nx2024!SecureJWT@Random#Key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Redis
REDIS_HOST=nexus_redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://nexus_admin:nexus2024@nexus_rabbitmq:5672

# WAHA
WAHA_URL=https://apiwts.nexusatemporal.com.br
WAHA_API_KEY=bd0c416348b2f04d198ff8971b608a87

# IDrive e2 (S3)
S3_ENDPOINT=https://o0m5.va.idrivee2-26.com
S3_ACCESS_KEY_ID=qFzk5gw00zfSRvj5BQwm
S3_SECRET_ACCESS_KEY=bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8
S3_BUCKET=backupsistemaonenexus
S3_REGION=us-east-1
EOF

# Frontend .env
cat > /root/nexusatemporal/frontend/.env <<'EOF'
VITE_API_URL=https://api.nexusatemporal.com.br
VITE_WS_URL=wss://api.nexusatemporal.com.br
EOF
```

##### **PASSO 5: Build e Deploy**

```bash
# Backend
cd /root/nexusatemporal/backend
npm install
npm run build
docker build -t nexus_backend:v34-migration .

# Frontend
cd /root/nexusatemporal/frontend
npm install
npm run build
docker build -t nexus_frontend:v34-migration .

# Criar networks
docker network create --driver overlay nexus_network
docker network create --driver overlay traefik_public

# Subir stack completa (usar docker-compose.yml do repo)
docker stack deploy -c docker-stack.yml nexus

# Verificar serviços
docker service ls
```

##### **PASSO 6: Atualizar DNS**

```bash
# Atualizar registros DNS para apontar para o novo IP
painel.nexusatemporal.com.br → NEW_VPS_IP
api.nexusatemporal.com.br → NEW_VPS_IP
```

##### **PASSO 7: Validação**

```bash
# Testar backend
curl -k https://api.nexusatemporal.com.br/health

# Testar frontend
curl -k https://painel.nexusatemporal.com.br

# Testar login
curl -X POST https://api.nexusatemporal.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@nexusatemporal.com.br",
    "password": "senha_teste"
  }'

# Verificar logs
docker service logs nexus_backend --tail 50
docker service logs nexus_frontend --tail 50
```

### ⏱️ Tempo Estimado de Migração

```
Preparar VPS: 15 min
Clonar repositório: 2 min
Restaurar backups: 10 min
Configurar ambiente: 5 min
Build e deploy: 20 min
Atualizar DNS: 5 min (propagação: 5-60 min)
Validação: 10 min
───────────────────
TOTAL: ~1h 07min
```

---

## 4. Escalabilidade e Performance

### 📊 Recursos Atuais

```
VPS Atual (72.60.5.29):
- RAM: 31GB (7.3GB usado - 23%)
- CPU: Múltiplos cores
- Disco: 387GB (53GB usado - 14%)
- Status: ✅ SAUDÁVEL
```

### 🔥 Problemas de Sobrecarga

#### 4.1 Alta Carga de CPU

**Sintomas:**
```bash
# CPU > 80% constantemente
docker stats --no-stream | grep nexus

NAME                    CPU %
nexus_backend           85.5%  ← ALERTA!
nexus_frontend          12.3%
```

**Causas Comuns:**
1. Muitas requisições simultâneas
2. Queries SQL ineficientes
3. Processamento de mídias pesadas
4. Loops infinitos no código

**Soluções Imediatas:**

```bash
# 1. Escalar serviço (adicionar réplicas)
docker service scale nexus_backend=3

# 2. Limitar recursos por container
docker service update \
  --limit-cpu 2 \
  --reserve-cpu 0.5 \
  nexus_backend

# 3. Identificar queries lentas
docker exec -it $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT query, calls, total_time, mean_time
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT 10;"
```

#### 4.2 Falta de Memória RAM

**Sintomas:**
```bash
# RAM > 90%
free -h
              total        used        free
Mem:            31Gi        28Gi        1.2Gi  ← CRÍTICO!

# OOM Killer matando processos
dmesg | grep -i "out of memory"
```

**Soluções Imediatas:**

```bash
# 1. Limitar memória por serviço
docker service update \
  --limit-memory 2G \
  --reserve-memory 512M \
  nexus_backend

# 2. Aumentar RAM da VPS
# Contatar provedor para upgrade

# 3. Limpar cache Redis
docker exec $(docker ps -q -f name=nexus_redis) redis-cli FLUSHDB

# 4. Reiniciar serviços pesados
docker service update --force nexus_backend
```

#### 4.3 Disco Cheio

**Sintomas:**
```bash
df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       387G  380G    7G  98% /  ← CRÍTICO!
```

**Soluções:**

```bash
# 1. Limpar logs antigos
docker system prune -af --volumes
find /var/lib/docker/containers/ -name "*.log" -type f -delete

# 2. Limpar imagens não usadas
docker image prune -af

# 3. Rotacionar logs
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# 4. Mover backups para S3
find /tmp -name "nexus_backup_*.sql" -exec \
  aws s3 cp {} s3://bucket/ \; -delete
```

### 🚀 Estratégias de Escalabilidade

#### Escala Vertical (VPS maior)

```
Atual: 4 CPU, 31GB RAM, 387GB SSD
   ↓ Upgrade
Futuro: 8 CPU, 64GB RAM, 500GB NVMe

Vantagens:
✅ Simples (só aumentar recursos)
✅ Sem mudanças no código

Desvantagens:
⚠️ Limite de crescimento
⚠️ Single point of failure
⚠️ Mais caro por recurso
```

#### Escala Horizontal (Múltiplos Servidores)

```
            ┌─────────────┐
            │ Load Bal    │
            └──────┬──────┘
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
   ┌────────┐ ┌────────┐ ┌────────┐
   │ VPS 1  │ │ VPS 2  │ │ VPS 3  │
   │Backend │ │Backend │ │Backend │
   └────────┘ └────────┘ └────────┘
        └──────────┬──────────┘
                   ↓
            ┌──────────┐
            │PostgreSQL│
            │  Master  │
            └──────────┘

Vantagens:
✅ Escala ilimitada
✅ Alta disponibilidade
✅ Redundância

Desvantagens:
⚠️ Complexo de gerenciar
⚠️ Precisa load balancer
⚠️ Sincronização de estado
```

#### Docker Swarm Multi-Node

```bash
# No servidor master (72.60.5.29)
docker swarm init --advertise-addr 72.60.5.29

# Adicionar worker nodes
docker swarm join-token worker
# Copiar comando e executar em cada VPS nova

# Escalar automaticamente
docker service scale nexus_backend=5
# Docker distribui entre os nodes

# Verificar
docker node ls
ID      HOSTNAME    STATUS  AVAILABILITY  MANAGER STATUS
abc123  vps-1       Ready   Active        Leader
def456  vps-2       Ready   Active
ghi789  vps-3       Ready   Active
```

---

## 5. Problemas Comuns e Soluções

### 🔧 Matriz de Problemas

| Problema | Diagnóstico | Solução Rápida | Tempo |
|----------|-------------|----------------|-------|
| Site não abre | `curl https://painel.nexus...` | `docker service ls` + restart | 5 min |
| Login não funciona | Logs backend | Verificar JWT/DB | 10 min |
| Mensagens não enviam | Logs WAHA | Verificar sessão WhatsApp | 15 min |
| Lentidão geral | `docker stats` | Escalar serviços | 5 min |
| Banco travado | `pg_stat_activity` | Kill queries longas | 2 min |
| Disco cheio | `df -h` | Limpar logs/backups | 10 min |

### 🚨 Comandos SOS

```bash
# Verificar saúde geral
docker service ls
docker service ps nexus_backend nexus_frontend
docker stats --no-stream

# Logs de erro
docker service logs nexus_backend --tail 100 | grep -i error
docker service logs nexus_frontend --tail 100 | grep -i error

# Reiniciar serviço travado
docker service update --force nexus_backend

# Rollback para versão anterior
docker service update --rollback nexus_backend

# Verificar conexão com banco
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master -c "SELECT 1;"

# Liberar memória
docker system prune -af
sync && echo 3 > /proc/sys/vm/drop_caches
```

---

## 6. Monitoramento e Alertas

### 📊 Ferramentas Instaladas

#### Uptime Kuma (Monitoramento)
```
URL: https://monitor.nexusatemporal.com
Porta: 3001

Monitors ativos:
- Frontend (HTTPS)
- Backend API (HTTPS)
- WAHA API (HTTPS)
- PostgreSQL (TCP)
```

#### Portainer (Gerenciamento Docker)
```
URL: https://portainer.nexusatemporal.com
Porta: 9000

Features:
- Ver logs em tempo real
- Restart de serviços
- Estatísticas de recursos
- Terminal para containers
```

### 🔔 Configurar Alertas

#### Telegram Bot

```bash
# Criar bot de alertas
# 1. Falar com @BotFather no Telegram
# 2. Criar bot /newbot
# 3. Copiar token

# Script de alerta
cat > /root/scripts/alert_telegram.sh <<'EOF'
#!/bin/bash
BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
CHAT_ID="YOUR_CHAT_ID"
MESSAGE="$1"

curl -s -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="${MESSAGE}" \
  -d parse_mode="HTML"
EOF

chmod +x /root/scripts/alert_telegram.sh

# Testar
/root/scripts/alert_telegram.sh "🚨 Sistema Nexus: Teste de alerta"
```

#### Monitoramento Contínuo

```bash
# Criar monitor de recursos
cat > /root/scripts/resource_monitor.sh <<'EOF'
#!/bin/bash

# Thresholds
CPU_THRESHOLD=80
MEM_THRESHOLD=85
DISK_THRESHOLD=85

# Verificar CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
  /root/scripts/alert_telegram.sh "🔥 CPU Alta: ${CPU_USAGE}%"
fi

# Verificar Memória
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}' | cut -d'.' -f1)
if [ "$MEM_USAGE" -gt "$MEM_THRESHOLD" ]; then
  /root/scripts/alert_telegram.sh "🔥 RAM Alta: ${MEM_USAGE}%"
fi

# Verificar Disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
  /root/scripts/alert_telegram.sh "💾 Disco Cheio: ${DISK_USAGE}%"
fi

# Verificar serviços
SERVICES=("nexus_backend" "nexus_frontend" "nexus_postgres")
for SERVICE in "${SERVICES[@]}"; do
  REPLICAS=$(docker service ls --filter name=$SERVICE --format "{{.Replicas}}")
  if [[ "$REPLICAS" != "1/1" ]]; then
    /root/scripts/alert_telegram.sh "⚠️ Serviço $SERVICE: $REPLICAS"
  fi
done
EOF

chmod +x /root/scripts/resource_monitor.sh

# Adicionar ao crontab (executar a cada 5 minutos)
crontab -l | { cat; echo "*/5 * * * * /root/scripts/resource_monitor.sh"; } | crontab -
```

---

## 7. Planos de Contingência

### 🎯 Cenário 1: Serviço Individual Caiu

```bash
# Identificar qual serviço
docker service ls

# Ver detalhes do problema
docker service ps nexus_backend --no-trunc

# Verificar logs
docker service logs nexus_backend --tail 100

# Tentar restart
docker service update --force nexus_backend

# Se não resolver, rollback
docker service update --rollback nexus_backend

# Último recurso: recriar serviço
docker service rm nexus_backend
docker service create \
  --name nexus_backend \
  --image nexus_backend:v34-media-complete \
  --network nexus_network \
  -e NODE_ENV=production \
  nexus_backend
```

### 🎯 Cenário 2: Banco de Dados Travou

```bash
# Ver queries rodando
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT pid, age(clock_timestamp(), query_start), usename, query
      FROM pg_stat_activity
      WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%'
      ORDER BY query_start desc;"

# Matar query específica
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT pg_terminate_backend(PID_DA_QUERY);"

# Reiniciar PostgreSQL (último recurso)
docker service update --force nexus_postgres
```

### 🎯 Cenário 3: VPS Não Responde

```bash
# 1. Acessar painel do provedor (Contabo, DigitalOcean, etc)
# 2. Verificar console VNC/KVM
# 3. Forçar reboot

# Após reboot, verificar serviços
docker service ls

# Se serviços não subiram automaticamente
docker stack deploy -c /root/nexusatemporal/docker-stack.yml nexus
```

### 🎯 Cenário 4: Ataque DDoS

```bash
# Bloquear IPs suspeitos
iptables -A INPUT -s IP_ATACANTE -j DROP

# Limitar conexões por IP
iptables -A INPUT -p tcp --dport 443 \
  -m connlimit --connlimit-above 50 -j REJECT

# Ativar proteção Cloudflare (se configurado)
# Ou usar Fail2Ban

apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 🎯 Cenário 5: Migração Emergencial

**Se precisar migrar URGENTEMENTE:**

```bash
# 1. Backup rápido (5 min)
/root/scripts/backup_nexus.sh

# 2. Preparar nova VPS em paralelo (30 min)
# Seguir passos da seção "Migração Entre VPS"

# 3. Atualizar DNS para nova VPS (5 min)

# 4. Validar novo sistema (10 min)

# TEMPO TOTAL DE DOWNTIME: ~50 minutos
```

---

## 📞 Contatos de Emergência

```
Provedor VPS: [ADICIONAR]
DNS Provider: [ADICIONAR]
Suporte Docker: https://docs.docker.com/support/
PostgreSQL: https://www.postgresql.org/support/
```

---

## 📚 Recursos Adicionais

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/azure/architecture/guide/multitenant/overview)

---

## ✅ Checklist de Manutenção Semanal

- [ ] Verificar espaço em disco: `df -h`
- [ ] Verificar uso de RAM: `free -h`
- [ ] Verificar logs de erro: `docker service logs`
- [ ] Fazer backup manual: `/root/scripts/backup_nexus.sh`
- [ ] Verificar backups no S3: `aws s3 ls s3://bucket/`
- [ ] Atualizar pacotes: `apt update && apt upgrade`
- [ ] Verificar uptime dos serviços: Uptime Kuma
- [ ] Revisar alertas da semana: Logs do Telegram Bot

---

**Última Atualização:** 2025-10-13
**Versão do Documento:** 1.0
**Próxima Revisão:** 2025-11-13
