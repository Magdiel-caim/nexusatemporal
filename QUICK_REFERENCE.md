# 🚀 Quick Reference - Nexus Atemporal

Referência rápida de comandos e procedimentos mais usados.

---

## 📦 Backup e Restore

### Backup Rápido
```bash
/root/scripts/backup_nexus.sh
```

### Backup Manual
```bash
# Banco local
docker exec $(docker ps -q -f name=nexus_postgres) \
  pg_dump -U nexus_admin nexus_master \
  > /tmp/backup_$(date +%Y%m%d).sql

# Upload para S3
export AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm"
export AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8"
aws s3 cp /tmp/backup_*.sql \
  s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl
```

### Restore
```bash
# Download do S3
aws s3 cp s3://backupsistemaonenexus/backups/database/nexus_backup_v34_master_20251013_122930.sql \
  /tmp/restore.sql \
  --endpoint-url https://o0m5.va.idrivee2-26.com --no-verify-ssl

# Restaurar
docker exec -i $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master < /tmp/restore.sql
```

---

## 🔍 Monitoramento

### Status dos Serviços
```bash
docker service ls
docker service ps nexus_backend nexus_frontend
```

### Logs em Tempo Real
```bash
# Backend
docker service logs -f nexus_backend --tail 50

# Frontend
docker service logs -f nexus_frontend --tail 50

# Erros apenas
docker service logs nexus_backend --tail 100 | grep -i error
```

### Recursos (CPU/RAM)
```bash
docker stats --no-stream
free -h
df -h
```

---

## 🔄 Deploy e Atualização

### Atualizar Backend
```bash
cd /root/nexusatemporal/backend
git pull
npm run build
docker build -t nexus_backend:v35 .
docker service update --image nexus_backend:v35 nexus_backend
```

### Atualizar Frontend
```bash
cd /root/nexusatemporal/frontend
git pull
npm run build
docker build -t nexus_frontend:v35 .
docker service update --image nexus_frontend:v35 nexus_frontend
```

### Rollback
```bash
docker service update --rollback nexus_backend
```

---

## 🆘 Troubleshooting

### Serviço não inicia
```bash
# Ver detalhes
docker service ps nexus_backend --no-trunc

# Forçar restart
docker service update --force nexus_backend

# Recriar
docker service rm nexus_backend
# Depois rodar docker stack deploy novamente
```

### Site não abre
```bash
# Verificar Traefik
docker service logs traefik_traefik --tail 50

# Testar direto (bypass Traefik)
curl http://localhost:3001/health  # Backend
curl http://localhost/             # Frontend
```

### Banco travado
```bash
# Ver queries rodando
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT pid, age(clock_timestamp(), query_start), query
      FROM pg_stat_activity
      WHERE query != '<IDLE>'
      ORDER BY query_start desc;"

# Matar query específica
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT pg_terminate_backend(PID);"
```

### Disco cheio
```bash
# Limpar logs Docker
docker system prune -af
find /var/lib/docker/containers/ -name "*.log" -delete

# Limpar backups locais
find /tmp -name "nexus_backup_*.sql" -mtime +7 -delete
```

### RAM cheia
```bash
# Limpar cache
sync && echo 3 > /proc/sys/vm/drop_caches

# Limpar Redis
docker exec $(docker ps -q -f name=nexus_redis) redis-cli FLUSHDB

# Reiniciar serviços pesados
docker service update --force nexus_backend
```

---

## 🔐 Banco de Dados

### Conectar ao PostgreSQL
```bash
docker exec -it $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master
```

### Queries Úteis
```sql
-- Ver todas as tabelas
\dt

-- Contar registros
SELECT 'leads' as tabela, COUNT(*) FROM leads
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Ver tenants
SELECT DISTINCT tenant_id, COUNT(*)
FROM users
GROUP BY tenant_id;

-- Usuários ativos
SELECT email, name, role, tenant_id, last_login_at
FROM users
WHERE status = 'active'
ORDER BY last_login_at DESC
LIMIT 10;
```

---

## 🌐 Multi-Tenant (SaaS)

### Criar Novo Tenant
```sql
-- 1. Criar tenant (se table existir)
INSERT INTO tenants (id, name, domain, status)
VALUES ('tenant-nova-clinica', 'Nova Clínica', 'nova.nexus.com', 'active');

-- 2. Criar admin do tenant
INSERT INTO users (id, email, password, name, role, tenant_id, status)
VALUES (
  gen_random_uuid(),
  'admin@novaclinica.com',
  '$2a$12$...hash...', -- Usar bcrypt
  'Admin Nova',
  'admin',
  'tenant-nova-clinica',
  'active'
);
```

### Isolar Dados por Tenant
```sql
-- Sempre adicionar filtro tenantId nas queries
SELECT * FROM leads WHERE tenant_id = 'tenant-abc123';
SELECT * FROM users WHERE tenant_id = 'tenant-abc123';
```

---

## 🚚 Migração Entre VPS

### Comando Único
```bash
/root/scripts/migrate_vps.sh NEW_VPS_IP
```

### Manual
```bash
# 1. Backup
/root/scripts/backup_nexus.sh

# 2. Na NOVA VPS
curl -fsSL https://get.docker.com | sh
docker swarm init
git clone https://github.com/Magdiel-caim/nexusatemporal.git
cd nexusatemporal

# 3. Transferir backup
scp /tmp/backup.sql root@NEW_VPS:/tmp/

# 4. Restaurar e deploy
# Seguir passos completos em SAAS_INFRASTRUCTURE_GUIDE.md
```

---

## 📊 Performance

### Escalar Serviço
```bash
# Adicionar réplicas
docker service scale nexus_backend=3

# Ver distribuição
docker service ps nexus_backend
```

### Limitar Recursos
```bash
docker service update \
  --limit-cpu 2 \
  --limit-memory 2G \
  --reserve-cpu 0.5 \
  --reserve-memory 512M \
  nexus_backend
```

---

## 🔔 Alertas e Monitoramento

### Uptime Kuma
```
URL: https://monitor.nexusatemporal.com
```

### Portainer
```
URL: https://portainer.nexusatemporal.com
```

### Health Checks
```bash
curl -k https://api.nexusatemporal.com.br/health
curl -k https://painel.nexusatemporal.com.br
```

---

## 📝 Git

### Commit e Push
```bash
cd /root/nexusatemporal
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main
```

### Criar Tag
```bash
git tag -a v35-nome -m "Descrição da release"
git push origin main --tags
```

### Ver Histórico
```bash
git log --oneline --graph -10
git show HEAD
```

---

## 🔑 Credenciais Rápidas

### PostgreSQL Local
```
Host: localhost:5432
User: nexus_admin
Pass: nexus2024@secure
DB: nexus_master
```

### PostgreSQL Remoto (Chat)
```
Host: 46.202.144.210:5432
User: nexus_admin
Pass: GpFh8923#nx2024!
DB: nexus_chat
```

### IDrive e2 (S3)
```
Endpoint: https://o0m5.va.idrivee2-26.com
Access Key: qFzk5gw00zfSRvj5BQwm
Secret: bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8
Bucket: backupsistemaonenexus
```

### WAHA
```
URL: https://apiwts.nexusatemporal.com.br
API Key: bd0c416348b2f04d198ff8971b608a87
Session: session_01k77wpm5edhch4b97qbgenk7p
```

---

## ⚡ Comandos de Emergência

```bash
# Reiniciar tudo
docker stack rm nexus
sleep 10
docker stack deploy -c docker-stack.yml nexus

# Reiniciar Docker
systemctl restart docker

# Reiniciar VPS (último recurso!)
reboot
```

---

**Atualizado:** 2025-10-13
**Versão:** 1.0
