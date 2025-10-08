# Guia de Deploy - Nexus Atemporal

## Pré-requisitos

- Docker 24.0+
- Docker Compose v2
- Git
- Domínio configurado (DNS apontando para o servidor)
- Servidor Linux (Ubuntu 22.04+ recomendado)
- Mínimo 4GB RAM, 2 CPU cores, 20GB disco

## Configuração Inicial

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/nexusatemporal.git
cd nexusatemporal
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo de .env
cp .env.example .env

# Editar com suas configurações
nano .env
```

**Variáveis importantes para alterar:**
- `DB_PASSWORD`: Senha do PostgreSQL
- `REDIS_PASSWORD`: Senha do Redis
- `RABBITMQ_DEFAULT_PASS`: Senha do RabbitMQ
- `JWT_SECRET`: Chave secreta JWT (gerar nova)
- `JWT_REFRESH_SECRET`: Chave secreta refresh token (gerar nova)
- `SMTP_PASSWORD`: Senha do email
- `S3_ACCESS_KEY_ID`: Chave S3
- `S3_SECRET_ACCESS_KEY`: Chave secreta S3

### 3. Gerar Secrets Seguros

```bash
# JWT Secret
openssl rand -base64 64

# JWT Refresh Secret
openssl rand -base64 64

# Postgres Password
openssl rand -base64 32

# Redis Password
openssl rand -base64 32

# RabbitMQ Password
openssl rand -base64 32
```

## Deploy em Produção

### Opção 1: Docker Compose (Recomendado)

```bash
# Build das imagens
cd backend
docker build -t nexus_backend:latest .

cd ../frontend
docker build -t nexus_frontend:latest .

cd ..

# Subir todos os serviços
docker compose -f docker-compose.yml up -d

# Verificar logs
docker compose logs -f

# Verificar status
docker compose ps
```

### Opção 2: Docker Stack (Swarm)

```bash
# Inicializar Swarm (se ainda não estiver)
docker swarm init

# Deploy do stack
docker stack deploy -c docker-stack-complete.yml nexus

# Verificar serviços
docker stack services nexus

# Verificar logs
docker service logs -f nexus_frontend
docker service logs -f nexus_backend
```

## Atualizações

### Frontend

```bash
# Build nova versão
cd frontend
docker build -t nexus_frontend:v29 .

# Atualizar docker-compose.yml
# Trocar image: nexus_frontend:v28 para nexus_frontend:v29

# Recriar container
docker compose up -d frontend

# Verificar
docker logs nexus_frontend
```

### Backend

```bash
# Build nova versão
cd backend
docker build -t nexus_backend:latest .

# Recriar container
docker compose up -d backend

# Verificar
docker logs nexus_backend
```

## Backup

### Banco de Dados

```bash
# Backup manual
docker exec nexus_postgres pg_dump -U nexus_admin nexus_master > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
cat backup_20251008_120000.sql | docker exec -i nexus_postgres psql -U nexus_admin nexus_master
```

### Automatizar Backup (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 3h da manhã)
0 3 * * * docker exec nexus_postgres pg_dump -U nexus_admin nexus_master | gzip > /backups/nexus_$(date +\%Y\%m\%d).sql.gz
```

### Volumes Docker

```bash
# Backup de todos os volumes
docker run --rm -v nexusatnet_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
docker run --rm -v nexusatnet_redis_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
docker run --rm -v nexusatnet_rabbitmq_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/rabbitmq_data.tar.gz -C /data .
```

## Monitoramento

### Logs

```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

# Últimas 100 linhas
docker compose logs --tail=100 backend
```

### Status dos Containers

```bash
# Listar containers
docker compose ps

# Estatísticas de uso
docker stats

# Verificar saúde
docker inspect nexus_backend | grep -A 5 Health
```

### Traefik Dashboard

Acessar: `https://traefik.nexusatemporal.com.br`

## Troubleshooting

### Container não inicia

```bash
# Ver logs completos
docker logs nexus_backend --tail 200

# Verificar configurações
docker inspect nexus_backend

# Recriar container
docker compose up -d --force-recreate backend
```

### Erro de conexão com banco

```bash
# Verificar se Postgres está rodando
docker compose ps postgres

# Ver logs do Postgres
docker compose logs postgres

# Testar conexão manual
docker exec -it nexus_postgres psql -U nexus_admin -d nexus_master

# Verificar health check
docker inspect nexus_postgres | grep -A 10 Health
```

### Erro SSL/Certificado

```bash
# Ver logs do Traefik
docker compose logs traefik

# Verificar certificados
docker exec nexus_traefik ls -la /letsencrypt

# Forçar renovação (apagar acme.json)
docker compose down traefik
docker volume rm nexusatnet_traefik_certs
docker compose up -d traefik
```

### Alto uso de memória

```bash
# Verificar uso
docker stats --no-stream

# Limpar recursos não utilizados
docker system prune -a --volumes

# Reiniciar serviço específico
docker compose restart redis
```

## Segurança

### Firewall

```bash
# Permitir apenas portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Verificar status
ufw status
```

### Atualizar Sistema

```bash
# Atualizar pacotes do sistema
apt update && apt upgrade -y

# Atualizar Docker
apt install --only-upgrade docker-ce docker-ce-cli containerd.io
```

### Rotação de Secrets

```bash
# 1. Gerar novos secrets
NEW_JWT_SECRET=$(openssl rand -base64 64)

# 2. Atualizar .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env

# 3. Recriar containers
docker compose up -d --force-recreate backend
```

## Domínios e SSL

### Configurar DNS

Apontar os seguintes registros A para o IP do servidor:
- `one.nexusatemporal.com.br` → Frontend
- `api.nexusatemporal.com.br` → Backend
- `traefik.nexusatemporal.com.br` → Dashboard Traefik

### Verificar SSL

```bash
# Testar certificado
openssl s_client -connect api.nexusatemporal.com.br:443 -servername api.nexusatemporal.com.br

# Verificar expiração
echo | openssl s_client -connect api.nexusatemporal.com.br:443 -servername api.nexusatemporal.com.br 2>/dev/null | openssl x509 -noout -dates
```

## Performance

### Otimização de Imagens Docker

```bash
# Frontend - Multi-stage build já implementado
# Tamanho atual: ~200MB

# Backend - Usar Alpine quando possível
# Tamanho atual: ~300MB

# Verificar tamanhos
docker images | grep nexus
```

### Cache Redis

```bash
# Monitorar Redis
docker exec -it nexus_redis redis-cli -a 86Bj2r94OyfxdVqklbvKNAiSVgYRJvUg
> INFO stats
> MONITOR

# Limpar cache se necessário
> FLUSHDB
```

### Database Performance

```bash
# Conectar ao Postgres
docker exec -it nexus_postgres psql -U nexus_admin nexus_master

# Ver queries lentas
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

# Ver tamanho das tabelas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Vacuum
VACUUM ANALYZE;
```

## Comandos Úteis

```bash
# Parar tudo
docker compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker compose down -v

# Rebuild completo
docker compose build --no-cache
docker compose up -d

# Ver uso de disco
docker system df

# Limpar tudo não utilizado
docker system prune -a --volumes

# Exportar/Importar imagens
docker save nexus_frontend:v28 | gzip > nexus_frontend_v28.tar.gz
docker load < nexus_frontend_v28.tar.gz

# Escalar serviços (Swarm)
docker service scale nexus_frontend=3
```

## Checklist de Deploy

- [ ] DNS configurado e propagado
- [ ] Secrets gerados e configurados no .env
- [ ] Firewall configurado
- [ ] Docker e Docker Compose instalados
- [ ] Imagens buildadas
- [ ] Volumes persistentes criados
- [ ] Containers iniciados
- [ ] SSL certificados gerados (Let's Encrypt)
- [ ] Acesso frontend funcionando
- [ ] Acesso backend/API funcionando
- [ ] Banco de dados acessível
- [ ] Redis conectado
- [ ] RabbitMQ funcionando
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados

## Suporte

Para problemas ou dúvidas:
- Documentação: `/root/nexusatemporal/prompt/`
- Changelog: `/root/nexusatemporal/prompt/CHANGELOG.md`
- Issues: GitHub Issues
- Email: contato@nexusatemporal.com.br

---

**Última atualização**: 2025-10-08
