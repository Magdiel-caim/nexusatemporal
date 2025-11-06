# 🚀 Guia de Deploy - Site Nexus Atemporal

## 📋 Pré-requisitos

- Docker Swarm inicializado
- Rede `nexusatnet` criada
- Traefik configurado e rodando
- DNS apontando para o servidor:
  - `nexusatemporal.com` → IP do servidor
  - `www.nexusatemporal.com` → IP do servidor
  - `api.nexusatemporal.com` → IP do servidor
- Arquivo `.env` configurado com todas as credenciais

## 🔧 Configuração Inicial

### 1. Clonar/Acessar o repositório

```bash
cd "/root/nexusatemporalv1/Site nexus atemporal"
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar e preencher todas as credenciais
nano .env
```

**Variáveis obrigatórias:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

**Variáveis opcionais:**
- `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`
- `PAGSEGURO_TOKEN`, `PAGSEGURO_EMAIL`
- `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_TOKEN`
- `ONE_NEXUS_API_URL`, `ONE_NEXUS_API_KEY`

### 3. Verificar rede Docker

```bash
# Criar rede se não existir
docker network create --driver overlay nexusatnet

# Verificar
docker network ls | grep nexusatnet
```

## 🏗️ Build das Imagens

### Opção A: Build automático via Stack Deploy

O `docker stack deploy` faz o build automaticamente:

```bash
docker stack deploy -c docker-compose.yml nexus-site
```

### Opção B: Build manual (recomendado para primeira vez)

```bash
# Build Frontend
docker build -t nexus-site-frontend:latest ./apps/frontend

# Build Backend
docker build -t nexus-site-backend:latest ./apps/backend-site-api

# Verificar imagens
docker images | grep nexus-site
```

## 🚢 Deploy em Produção

### Deploy completo

```bash
# Deploy da stack
docker stack deploy -c docker-compose.yml nexus-site

# Aguardar serviços subirem (30-60 segundos)
watch docker stack services nexus-site
```

### Verificar status

```bash
# Listar serviços
docker stack services nexus-site

# Logs do frontend
docker service logs nexus-site_frontend -f --tail 50

# Logs do backend
docker service logs nexus-site_backend -f --tail 50

# Verificar health checks
docker ps | grep nexus-site
```

### Saída esperada:

```
NAME                    REPLICAS   IMAGE
nexus-site_frontend     1/1        nexus-site-frontend:latest
nexus-site_backend      1/1        nexus-site-backend:latest
```

## 🔍 Testes Pós-Deploy

### 1. Verificar Frontend

```bash
# Via curl
curl -I https://nexusatemporal.com

# Deve retornar: HTTP/2 200
```

### 2. Verificar Backend

```bash
# Health check
curl https://api.nexusatemporal.com/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

### 3. Testar endpoints

```bash
# Teste de CORS
curl -H "Origin: https://nexusatemporal.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.nexusatemporal.com/api/payments/intent

# Teste de contact form
curl -X POST https://api.nexusatemporal.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## 🔄 Atualização (Update)

### Atualizar código

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker build -t nexus-site-frontend:latest ./apps/frontend
docker build -t nexus-site-backend:latest ./apps/backend-site-api

# Update services
docker service update --image nexus-site-frontend:latest nexus-site_frontend
docker service update --image nexus-site-backend:latest nexus-site_backend
```

### Ou redeployar stack completa

```bash
docker stack deploy -c docker-compose.yml nexus-site
```

## 🗃️ Banco de Dados

### Criar tabelas manualmente (se necessário)

```bash
# Conectar ao PostgreSQL
PGPASSWORD='your-password' psql -h 72.60.139.52 -U nexus_admin -d nexus_crm

# Executar SQL
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  plan TEXT,
  amount INTEGER,
  provider TEXT,
  status TEXT DEFAULT 'pending',
  external_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id SERIAL PRIMARY KEY,
  order_id UUID,
  provider TEXT,
  event_type TEXT,
  event JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

## 🔐 Configurar Webhooks

### 1. Stripe

**URL:** `https://api.nexusatemporal.com/api/payments/webhook/stripe`

**Events:**
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Header:** `stripe-signature`

### 2. Asaas

**URL:** `https://api.nexusatemporal.com/api/payments/webhook/asaas`

**Header:** `asaas-access-token: YOUR_TOKEN`

**Events:**
- `PAYMENT_CONFIRMED`
- `PAYMENT_RECEIVED`

### 3. PagSeguro

**URL:** `https://api.nexusatemporal.com/api/payments/webhook/pagseguro`

**Method:** POST

**Body:** `notificationCode=<code>`

## 📧 Configurar DNS

**Registrar:** Seu provedor de domínio

**Tipo A Records:**

```
nexusatemporal.com         → 72.60.5.29
www.nexusatemporal.com     → 72.60.5.29
api.nexusatemporal.com     → 72.60.5.29
```

**Aguardar propagação:** 5 minutos a 48 horas

## 🛡️ SSL/TLS

Traefik gerencia automaticamente certificados Let's Encrypt.

Verificar:
```bash
docker logs traefik | grep letsencrypt
```

## 🧹 Manutenção

### Logs

```bash
# Ver logs em tempo real
docker service logs nexus-site_frontend -f
docker service logs nexus-site_backend -f

# Ver últimas 100 linhas
docker service logs nexus-site_backend --tail 100
```

### Remover stack

```bash
docker stack rm nexus-site
```

### Limpar imagens antigas

```bash
docker image prune -a
```

## 🆘 Troubleshooting

### Serviço não inicia

```bash
# Ver estado detalhado
docker service ps nexus-site_frontend --no-trunc
docker service ps nexus-site_backend --no-trunc

# Ver logs de erro
docker service logs nexus-site_backend --tail 100
```

### Erro de conexão com banco

1. Verificar credenciais em `.env`
2. Testar conexão direta:
   ```bash
   PGPASSWORD='password' psql -h 72.60.139.52 -U nexus_admin -d nexus_crm -c "SELECT 1"
   ```

### Certificado SSL não criado

1. Verificar DNS está apontando corretamente
2. Verificar Traefik está rodando
3. Ver logs do Traefik:
   ```bash
   docker logs traefik | grep nexusatemporal
   ```

### CORS errors no frontend

1. Verificar `CORS_ORIGIN` no backend está correto
2. Verificar requests estão vindo de `https://nexusatemporal.com`

## 📊 Monitoramento

### Health checks automáticos

Frontend: `http://localhost/` (a cada 30s)
Backend: `http://localhost:3001/health` (a cada 30s)

### Métricas

```bash
# CPU e memória
docker stats --no-stream | grep nexus-site
```

## 📞 Suporte

Em caso de problemas:

1. Verificar logs primeiro
2. Verificar variáveis de ambiente
3. Verificar conectividade com serviços externos (DB, SMTP, etc)
4. Consultar documentação em `README.md` e `STATUS_IMPLEMENTACAO.md`

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] DNS apontando para servidor
- [ ] Rede Docker criada
- [ ] Traefik rodando
- [ ] Build das imagens concluído
- [ ] Stack deployed
- [ ] Serviços em running (1/1)
- [ ] Frontend acessível via HTTPS
- [ ] Backend respondendo em /health
- [ ] Certificados SSL criados
- [ ] Webhooks configurados nos gateways
- [ ] Teste de envio de email funcionando
- [ ] Banco de dados acessível

**Deploy concluído com sucesso!** 🎉
