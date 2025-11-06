# 🚀 Quick Start - Site Nexus Atemporal

## ⚡ Deploy Rápido (5 minutos)

### 1️⃣ Configurar Variáveis de Ambiente

```bash
cd "/root/nexusatemporalv1/Site nexus atemporal"

# Copiar exemplo
cp .env.example .env

# Editar (usar nano ou vim)
nano .env
```

**Mínimo necessário para funcionar:**
```env
DB_HOST=72.60.139.52
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=your-password

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=your-smtp-password

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

JWT_SECRET=change-this-secret-key
```

### 2️⃣ Deploy com Docker Swarm

```bash
# Garantir que a rede existe
docker network create --driver overlay nexusatnet || true

# Deploy
docker stack deploy -c docker-compose.yml nexus-site

# Aguardar (30-60 segundos)
watch docker stack services nexus-site
```

### 3️⃣ Verificar

```bash
# Ver logs
docker service logs nexus-site_frontend -f --tail 20
docker service logs nexus-site_backend -f --tail 20

# Testar endpoints
curl -I https://nexusatemporal.com
curl https://api.nexusatemporal.com/health
```

---

## 🧪 Teste Local (Desenvolvimento)

### Frontend

```bash
cd apps/frontend

# Instalar (se ainda não instalou)
npm install

# Desenvolvimento
npm run dev
# Abrir: http://localhost:5173

# Build de produção
npm run build
```

### Backend

```bash
cd apps/backend-site-api

# Instalar
npm install

# Criar .env local
cp .env.example .env
# Editar .env com suas credenciais locais

# Desenvolvimento
npm run dev
# API em: http://localhost:3001

# Build
npm run build
npm start
```

---

## 📋 Checklist Pré-Deploy

- [ ] Arquivo `.env` configurado com todas credenciais
- [ ] DNS apontando para servidor (nexusatemporal.com, api.nexusatemporal.com)
- [ ] Rede Docker `nexusatnet` criada
- [ ] Traefik rodando no servidor
- [ ] Banco de dados PostgreSQL acessível
- [ ] SMTP configurado e testado
- [ ] Webhooks Stripe configurados (opcional no início)

---

## 🛠️ Comandos Úteis

### Ver Status
```bash
docker stack services nexus-site
docker stack ps nexus-site
```

### Ver Logs
```bash
# Frontend
docker service logs nexus-site_frontend -f

# Backend
docker service logs nexus-site_backend -f

# Últimas 100 linhas
docker service logs nexus-site_backend --tail 100
```

### Atualizar
```bash
# Rebuild images
docker build -t nexus-site-frontend:latest ./apps/frontend
docker build -t nexus-site-backend:latest ./apps/backend-site-api

# Update services
docker service update --image nexus-site-frontend:latest nexus-site_frontend
docker service update --image nexus-site-backend:latest nexus-site_backend
```

### Remover
```bash
docker stack rm nexus-site
```

---

## 🔗 URLs de Produção

- **Site:** https://nexusatemporal.com
- **API:** https://api.nexusatemporal.com
- **Health Check:** https://api.nexusatemporal.com/health
- **Dashboard Principal:** https://one.nexusatemporal.com.br

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **README.md** - Visão geral e arquitetura
- **STATUS_IMPLEMENTACAO.md** - Status detalhado (100% completo)
- **DEPLOY_GUIDE.md** - Guia completo de deploy
- **IMPLEMENTACAO_FINAL.md** - Relatório final de implementação

---

## 🆘 Problemas Comuns

### Serviço não inicia
```bash
docker service ps nexus-site_frontend --no-trunc
docker service ps nexus-site_backend --no-trunc
```

### Erro de conexão com banco
```bash
# Testar conexão
PGPASSWORD='your-pass' psql -h 72.60.139.52 -U nexus_admin -d nexus_crm -c "SELECT 1"
```

### Certificado SSL não criado
- Verificar DNS está apontando corretamente
- Verificar Traefik está rodando: `docker ps | grep traefik`
- Ver logs: `docker logs traefik | grep nexusatemporal`

---

## ✅ Sucesso!

Se tudo funcionou:
- ✅ Frontend acessível em HTTPS
- ✅ Backend respondendo em /health
- ✅ Certificados SSL criados
- ✅ Serviços em estado "Running 1/1"

**Parabéns! Site Nexus Atemporal está no ar!** 🎉

---

**Implementado conforme:** site nexus.pdf
**Versão:** 1.0.0
**Data:** 2025-10-30
