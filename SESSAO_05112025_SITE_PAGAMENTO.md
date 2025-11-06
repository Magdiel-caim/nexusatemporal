# 📋 SESSÃO 05/11/2025 - INTEGRAÇÃO SITE DE PAGAMENTO

**Data:** 05/11/2025
**Versão:** v2-integration
**Status:** ⚠️ Parcialmente Concluído (necessita ajustes)

---

## 🎯 OBJETIVO DA SESSÃO

Integrar o site de checkout (https://nexusatemporal.com/) com o sistema de pagamentos Stripe, permitindo que usuários comprem planos e sejam automaticamente criados no sistema principal (https://one.nexusatemporal.com.br/).

---

## ✅ O QUE FOI REALIZADO

### 1. Correção do Frontend 502 Error (Sistema Principal)

**Problema:** https://one.nexusatemporal.com.br/ estava retornando erro 502

**Causa:** Traefik configurado para rotear para porta 3000, mas nginx rodando na porta 80

**Solução:**
```yaml
# Arquivo: /root/nexusatemporalv1/docker-compose.yml (linha 129)
# ANTES:
- "traefik.http.services.nexusfrontend.loadbalancer.server.port=3000"

# DEPOIS:
- "traefik.http.services.nexusfrontend.loadbalancer.server.port=80"
```

**Status:** ✅ RESOLVIDO - Sistema principal online e acessível

---

### 2. Integração da API de Criação de Usuários

**Implementado:** Endpoint para criar usuários a partir de pagamentos

**Arquivo:** `/root/nexusatemporalv1/backend/src/routes/external-users.routes.ts`

**Endpoint:**
```
POST https://api.nexusatemporal.com.br/api/users/external/create-from-payment
Authorization: Bearer a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
```

**Payload:**
```json
{
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "planId": "essencial|profissional|empresarial|enterprise",
  "stripeSessionId": "cs_test_...",
  "amount": 24700
}
```

**Funcionalidades:**
- ✅ Verifica duplicação de email
- ✅ Cria usuário com role OWNER
- ✅ Status ACTIVE
- ✅ Gera token de reset de senha (válido por 7 dias)
- ✅ Registra pedido no banco de dados
- ✅ Envia email de boas-vindas (se SMTP configurado)

**Status:** ✅ FUNCIONANDO - Testado com sucesso

---

### 3. Atualização do Site Frontend

**Problema:** Frontend chamando API em `localhost` ao invés de produção

**Arquivo Modificado:** `/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend/.env`

**ANTES:**
```env
VITE_API_URL=http://localhost:3001
```

**DEPOIS:**
```env
VITE_API_URL=https://api.nexusatemporal.com
```

**Arquivos Alterados:**
1. `.env` - Variável de ambiente atualizada
2. `src/services/payment.service.ts` - Fix TypeScript error

**Fix TypeScript:**
```typescript
// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// DEPOIS:
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.nexusatemporal.com';
```

**Status:** ✅ CORRIGIDO - Build passou com sucesso

---

### 4. Rebuild das Imagens Docker

**Imagens Criadas:**

1. **Frontend do Site:**
```bash
Image: nexus-site-frontend:v2-integration
Build: Sucesso
Size: ~154MB
Status: Deployed
```

2. **Backend do Site:**
```bash
Image: nexus-site-backend:v2-integration
Build: Sucesso
Status: Deployed com env vars explícitas
```

**Comandos Executados:**
```bash
# Frontend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"
docker build -t nexus-site-frontend:v2-integration -f Dockerfile .

# Backend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"
docker build -t nexus-site-backend:v2-integration -f Dockerfile .
```

**Status:** ✅ CONCLUÍDO

---

### 5. Deploy em Produção

**Serviços Atualizados:**

```bash
# Frontend
docker service update --image nexus-site-frontend:v2-integration nexus-site_frontend
Status: 1/1 Running ✅

# Backend (com env vars explícitas)
docker service update nexus-site_backend \
  --env-add DB_HOST=46.202.144.210 \
  --env-add DB_PORT=5432 \
  --env-add DB_NAME=nexus_crm \
  --env-add DB_USER=nexus_admin \
  --env-add DB_PASS=nexus2024@secure \
  --env-add STRIPE_SECRET_KEY=sk_test_51SJIavKWR76PRrCODB8m6Sl7472AyasUv7Whhar7pSPFvbqeFWUD3uR7Zw1s7AAQ7d17jkx46PsDG3YGIYAlxNsw001Uomfv1w \
  --env-add ONE_NEXUS_API_URL=https://api.nexusatemporal.com.br/api \
  --env-add ONE_NEXUS_API_KEY=a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8 \
  --image nexus-site-backend:v2-integration

Status: 1/1 Running ✅
```

**Logs do Backend (Última Verificação):**
```
✅ Database connected
✅ Migrations executed
🚀 Server running on port 3001
📍 Environment: production
🌐 CORS Origin: https://nexusatemporal.com
```

**Status:** ✅ DEPLOYED

---

## ⚠️ PROBLEMAS IDENTIFICADOS (NÃO RESOLVIDOS)

### 1. Processos em Background Rodando

Há vários processos Node.js rodando em background que podem causar conflitos:

```bash
# Processos identificados:
- Background Bash 104218: backend-site-api em dev mode
- Background Bash 771784: backend principal em dev mode
- Background Bash 964145: backend-site-api (duplicado)
- Background Bash 97edc8: backend-site-api (duplicado)
- Background Bash 9c3391: backend-site-api (duplicado)
- Background Bash b2be7c: frontend em dev mode
- Background Bash 49b2ba: Stripe webhook listener
```

**Ação Necessária:** Matar todos esses processos antes de testar

**Comando:**
```bash
pkill -f "npm run dev"
pkill -f "stripe listen"
```

---

### 2. Webhook do Stripe Não Configurado para Produção

**Problema:** Webhook listener rodando em localhost, não receberá eventos do Stripe em produção

**Configuração Atual:**
```bash
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe
```

**Ação Necessária:**
1. Configurar webhook no Stripe Dashboard
2. Apontar para: `https://api.nexusatemporal.com/api/payments/webhook/stripe`
3. Copiar webhook secret e atualizar no .env
4. Rebuild e redeploy do backend

**URL do Stripe Dashboard:**
https://dashboard.stripe.com/test/webhooks

---

### 3. Variáveis de Ambiente do docker-compose.yml

**Problema:** O arquivo `docker-compose.yml` tenta ler do `.env` mas o Docker Swarm não carrega automaticamente

**Solução Aplicada:** Passamos as env vars explicitamente via `docker service update --env-add`

**Problema Futuro:** Se fizer `docker stack deploy` novamente, as env vars serão perdidas

**Ação Necessária:**
1. Atualizar `docker-compose.yml` para incluir env vars diretamente, OU
2. Sempre usar `docker service update` com `--env-add` para atualizar

---

### 4. SMTP Não Configurado

**Status Atual:** Email de boas-vindas não será enviado

**Variáveis Faltando:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=??? # Senha de aplicativo do Gmail
```

**Ação Necessária:**
1. Criar senha de aplicativo no Gmail
2. Atualizar variável SMTP_PASS
3. Rebuild e redeploy

---

### 5. Teste End-to-End Não Realizado

**Status:** Deploy feito, mas fluxo completo não foi testado

**Falta Testar:**
1. Clicar em "Iniciar trial gratuito" no site
2. Inserir email
3. Redirecionar para Stripe
4. Completar pagamento com cartão de teste
5. Webhook receber evento
6. Usuário ser criado automaticamente
7. Login no sistema principal

---

## 📂 ARQUIVOS MODIFICADOS NESTA SESSÃO

### Frontend do Site
```
/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend/.env
/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend/src/services/payment.service.ts
```

### Backend do Site
```
/root/nexusatemporalv1/Site_nexus_ atemporal/.env
```

### Sistema Principal (Backend)
```
/root/nexusatemporalv1/backend/src/routes/external-users.routes.ts
/root/nexusatemporalv1/backend/src/index.ts (registro da rota)
/root/nexusatemporalv1/docker-compose.yml (correção porta frontend)
```

---

## 🚀 PRÓXIMOS PASSOS (PRÓXIMA SESSÃO)

### PRIORIDADE ALTA

#### 1. Limpar Processos em Background
```bash
# Matar todos os processos dev
pkill -f "npm run dev"
pkill -f "stripe listen"

# Verificar portas
lsof -i :3000
lsof -i :3001
lsof -i :5173
```

#### 2. Configurar Webhook do Stripe em Produção

**Passos:**
1. Acessar: https://dashboard.stripe.com/test/webhooks
2. Clicar em "Add endpoint"
3. URL: `https://api.nexusatemporal.com/api/payments/webhook/stripe`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copiar o "Signing secret" (whsec_...)
6. Atualizar no .env:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX
   ```
7. Rebuild e redeploy:
   ```bash
   cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"
   docker build -t nexus-site-backend:v2.1-webhook -f Dockerfile .
   docker service update --image nexus-site-backend:v2.1-webhook nexus-site_backend
   ```

#### 3. Testar Fluxo End-to-End

**Teste Manual:**
1. Abrir https://nexusatemporal.com/
2. Clicar em "Iniciar trial gratuito" em qualquer plano
3. Inserir email de teste (ex: teste-05nov@example.com)
4. Deve redirecionar para Stripe Checkout
5. Preencher com dados de teste:
   - Cartão: 4242 4242 4242 4242
   - Data: 12/34
   - CVV: 123
6. Completar pagamento
7. Verificar logs do backend:
   ```bash
   docker service logs -f nexus-site_backend
   ```
8. Verificar se usuário foi criado:
   ```bash
   PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
     -c "SELECT id, email, name, role, status FROM users WHERE email = 'teste-05nov@example.com';"
   ```
9. Pegar token de reset:
   ```bash
   PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
     -c "SELECT \"passwordResetToken\" FROM users WHERE email = 'teste-05nov@example.com';"
   ```
10. Acessar: https://one.nexusatemporal.com.br/reset-password?token=TOKEN_AQUI
11. Definir senha
12. Fazer login
13. Verificar acesso ao sistema

#### 4. Configurar SMTP (Opcional mas Recomendado)

**Gmail App Password:**
1. Acessar: https://myaccount.google.com/apppasswords
2. Criar senha de aplicativo para "Mail"
3. Copiar senha gerada
4. Atualizar .env:
   ```env
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```
5. Rebuild e redeploy

---

### PRIORIDADE MÉDIA

#### 5. Corrigir docker-compose.yml para Usar Env Vars

**Problema:** Env vars sendo passadas manualmente via `docker service update`

**Solução:** Atualizar docker-compose.yml

```yaml
# /root/nexusatemporalv1/Site_nexus_ atemporal/docker-compose.yml

backend:
  # ... outras configs ...
  environment:
    - DB_HOST=46.202.144.210
    - DB_PORT=5432
    - DB_NAME=nexus_crm
    - DB_USER=nexus_admin
    - DB_PASS=nexus2024@secure
    - JWT_SECRET=nexus-atemporal-jwt-secret-key-2025-secure
    - STRIPE_SECRET_KEY=sk_test_51SJIavKWR76PRrCODB8m6Sl7472AyasUv7Whhar7pSPFvbqeFWUD3uR7Zw1s7AAQ7d17jkx46PsDG3YGIYAlxNsw001Uomfv1w
    - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    - ONE_NEXUS_API_URL=https://api.nexusatemporal.com.br/api
    - ONE_NEXUS_API_KEY=a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
    - CORS_ORIGIN=https://nexusatemporal.com
    - SMTP_HOST=smtp.gmail.com
    - SMTP_PORT=587
    - SMTP_USER=contato@nexusatemporal.com.br
    - SMTP_PASS=${SMTP_PASS}
    - SMTP_FROM=contato@nexusatemporal.com.br
```

**Depois:**
```bash
docker stack deploy -c docker-compose.yml nexus-site
```

#### 6. Implementar Logs Estruturados

**Adicionar Winston ou Pino** para logs mais detalhados:
- Identificar requests de pagamento
- Rastrear webhooks recebidos
- Monitorar criação de usuários
- Debugar erros facilmente

#### 7. Adicionar Tratamento de Erros Robusto

**No backend do site:**
- Retry logic para chamadas à API do sistema principal
- Dead letter queue para webhooks que falharam
- Notificações de erro (Slack, Discord, Email)

---

### PRIORIDADE BAIXA

#### 8. Monitoramento e Alertas

**Implementar:**
- Health checks mais detalhados
- Métricas de pagamentos (Prometheus/Grafana)
- Alertas de erro (PagerDuty, Sentry)

#### 9. Documentação

**Criar:**
- API documentation (Swagger/OpenAPI)
- User manual para checkout
- Admin guide para gerenciar webhooks

#### 10. Migrar para Modo Produção

**Quando pronto:**
1. Trocar chaves Stripe de test para live
2. Atualizar URLs de callback
3. Configurar domínio customizado (se necessário)
4. SSL certificates (já configurado via Traefik)

---

## 🔍 VERIFICAÇÕES DE SAÚDE DO SISTEMA

### Comando Rápido de Diagnóstico

```bash
# Status dos serviços
docker service ls | grep nexus

# Logs do backend do site
docker service logs --tail 50 nexus-site_backend 2>&1 | grep -E "(✅|❌|Error|Database|Server running)"

# Logs do frontend do site
docker service logs --tail 20 nexus-site_frontend

# Testar API
curl -s https://api.nexusatemporal.com/health | jq

# Testar frontend
curl -I https://nexusatemporal.com/

# Verificar processos em background
ps aux | grep -E "(npm|node|stripe)" | grep -v grep

# Verificar portas em uso
lsof -i :3000,3001,5173
```

---

## 📊 ESTADO ATUAL DO SISTEMA

### URLs e Status

| Serviço | URL | Status |
|---------|-----|--------|
| Site Frontend | https://nexusatemporal.com/ | ✅ Online |
| Site Backend API | https://api.nexusatemporal.com/ | ✅ Online |
| Sistema Principal | https://one.nexusatemporal.com.br/ | ✅ Online |
| API Principal | https://api.nexusatemporal.com.br/ | ✅ Online |

### Serviços Docker

| Serviço | Imagem | Replicas | Status |
|---------|--------|----------|--------|
| nexus-site_frontend | nexus-site-frontend:v2-integration | 1/1 | ✅ Running |
| nexus-site_backend | nexus-site-backend:v2-integration | 1/1 | ✅ Running |
| nexus_backend | nexus-backend:v128-integration | 1/1 | ✅ Running |
| nexus_frontend | nginx:alpine | 1/1 | ✅ Running |

### Banco de Dados

| Propriedade | Valor |
|-------------|-------|
| Host | 46.202.144.210 |
| Port | 5432 |
| Database | nexus_crm |
| User | nexus_admin |
| Status | ✅ Conectado |

### Integrações

| Integração | Status | Config |
|------------|--------|--------|
| Stripe | ⚠️ Test Mode | sk_test_... |
| Webhook Stripe | ❌ Não Configurado | localhost only |
| SMTP | ⚠️ Parcial | Sem senha |
| API Principal | ✅ Funcionando | Com auth key |

---

## 🎓 APRENDIZADOS DESTA SESSÃO

### 1. Docker Swarm e Environment Variables

**Problema:** Docker Swarm não lê `.env` automaticamente ao fazer `docker stack deploy`

**Solução:**
- Opção 1: Passar env vars explicitamente via `docker service update --env-add`
- Opção 2: Hardcode no docker-compose.yml
- Opção 3: Usar Docker Secrets (mais seguro)

### 2. TypeScript e Vite

**Problema:** `import.meta.env` não tem tipos por padrão

**Solução:**
```typescript
(import.meta as any).env?.VITE_API_URL
```

Ou criar arquivo `vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3. Traefik Load Balancer Port

**Problema:** Container expondo porta X, mas Traefik tentando conectar em porta Y

**Solução:** Sempre verificar qual porta o container REALMENTE está escutando:
```bash
docker exec <container> netstat -tlnp
```

E configurar Traefik corretamente:
```yaml
traefik.http.services.myservice.loadbalancer.server.port=<porta_real>
```

### 4. Multi-stage Docker Builds

**Vantagem:** Reduz tamanho da imagem significativamente

**Exemplo:**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

Resultado: ~1GB → ~50MB

---

## 📦 ESTRUTURA DO PROJETO SITE

```
/root/nexusatemporalv1/Site_nexus_ atemporal/
├── apps/
│   ├── backend-site-api/          # Backend da API de pagamentos
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.ts
│   │   │   ├── entities/
│   │   │   │   ├── Order.ts
│   │   │   │   └── PaymentEvent.ts
│   │   │   ├── modules/
│   │   │   │   ├── email/
│   │   │   │   │   └── email.service.ts
│   │   │   │   ├── payments/
│   │   │   │   │   ├── stripe.ts
│   │   │   │   │   ├── asaas.ts
│   │   │   │   │   └── pagseguro.ts
│   │   │   │   └── webhook/
│   │   │   │       └── n8n.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # Frontend do site de checkout
│       ├── src/
│       │   ├── components/
│       │   │   └── sections/
│       │   │       ├── Hero.tsx
│       │   │       ├── Plans.tsx      # 🔴 Botão "trial gratuito" aqui
│       │   │       ├── Benefits.tsx
│       │   │       ├── FAQ.tsx
│       │   │       └── Contact.tsx
│       │   ├── services/
│       │   │   └── payment.service.ts # 🔴 API calls aqui
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       ├── .env                        # 🔴 VITE_API_URL configurado
│       ├── package.json
│       └── vite.config.ts
│
├── docker-compose.yml                  # 🔴 Configuração Docker Swarm
└── .env                                # 🔴 Env vars backend
```

---

## 🔐 CREDENCIAIS E CHAVES

### Stripe (Test Mode)

```env
# Publishable Key (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SJIavKWR76PRrCOQcIP6cAVbm5VXQRpMY8rUtiZ5fxKMH6yurnPQw6OtInoMaWzUhBVun7Jd8dvfLszyU4ych1d005B2uNIK2

# Secret Key (Backend)
STRIPE_SECRET_KEY=sk_test_51SJIavKWR76PRrCODB8m6Sl7472AyasUv7Whhar7pSPFvbqeFWUD3uR7Zw1s7AAQ7d17jkx46PsDG3YGIYAlxNsw001Uomfv1w

# Webhook Secret (Não configurado ainda)
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

### API Principal

```env
# URL da API
ONE_NEXUS_API_URL=https://api.nexusatemporal.com.br/api

# API Key para autenticação
ONE_NEXUS_API_KEY=a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
```

### Banco de Dados

```env
DB_HOST=46.202.144.210
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=nexus2024@secure
```

### JWT

```env
JWT_SECRET=nexus-atemporal-jwt-secret-key-2025-secure
```

---

## 🧪 COMANDOS DE TESTE ÚTEIS

### Testar Criação de Usuário via API

```bash
curl -X POST https://api.nexusatemporal.com.br/api/users/external/create-from-payment \
  -H "Authorization: Bearer a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-manual@example.com",
    "name": "Teste Manual",
    "planId": "essencial",
    "stripeSessionId": "cs_test_manual_'$(date +%s)'",
    "amount": 24700
  }'
```

### Verificar Usuário Criado

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
  -c "SELECT id, email, name, role, status, \"createdAt\" FROM users WHERE email = 'teste-manual@example.com';"
```

### Pegar Token de Reset

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
  -c "SELECT \"passwordResetToken\", \"passwordResetExpires\" FROM users WHERE email = 'teste-manual@example.com';"
```

### Testar Stripe Checkout (Desenvolvimento)

```bash
curl -X POST http://localhost:3001/api/payments/create-session \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "essencial",
    "userEmail": "teste@example.com",
    "userName": "Teste",
    "successUrl": "https://one.nexusatemporal.com.br/success",
    "cancelUrl": "https://nexusatemporal.com/"
  }'
```

### Monitorar Logs em Tempo Real

```bash
# Backend do site
docker service logs -f --tail 100 nexus-site_backend

# Frontend do site
docker service logs -f --tail 50 nexus-site_frontend

# Sistema principal
docker service logs -f --tail 100 nexus_backend

# Todos juntos
docker service logs -f nexus-site_backend nexus-site_frontend nexus_backend 2>&1 | grep -E "(Error|✅|❌|POST|GET)"
```

---

## 📝 NOTAS IMPORTANTES

### Usuário de Teste Criado

Conforme documento `TESTE_VISUAL_PRONTO.md`:

```
Email: teste-visual-1762376182@example.com
Token: db0db48c7d6dceedd93d8f6b5f19a1ade79405109ec31d7946410957576acddb
Válido até: 12/11/2025 às 20:56
User ID: d63259a9-9d16-44e0-b082-83d2f99f9da4
Role: owner
Status: active
Plano: essencial (R$ 247,00/mês)
```

Para testar:
1. https://one.nexusatemporal.com.br/reset-password?token=db0db48c7d6dceedd93d8f6b5f19a1ade79405109ec31d7946410957576acddb
2. Definir senha
3. Login em https://one.nexusatemporal.com.br/

---

## 🎯 CHECKLIST PRÓXIMA SESSÃO

Antes de começar a próxima sessão:

- [ ] Matar processos em background (`pkill -f "npm run dev"`)
- [ ] Verificar serviços Docker (`docker service ls`)
- [ ] Configurar webhook do Stripe
- [ ] Testar fluxo end-to-end
- [ ] Configurar SMTP (opcional)
- [ ] Atualizar docker-compose.yml com env vars
- [ ] Fazer backup final

Durante a sessão:

- [ ] Sempre verificar logs antes de rebuild
- [ ] Não mexer no que já está funcionando
- [ ] Fazer backup antes de mudanças críticas
- [ ] Testar cada passo antes de prosseguir
- [ ] Documentar problemas encontrados

---

## 📞 REFERÊNCIAS RÁPIDAS

### Documentação
- Stripe: https://stripe.com/docs
- TypeORM: https://typeorm.io/
- Docker Swarm: https://docs.docker.com/engine/swarm/
- Traefik: https://doc.traefik.io/traefik/

### Dashboards
- Stripe Test: https://dashboard.stripe.com/test
- Traefik: http://46.202.144.210:8080 (se configurado)

### URLs Produção
- Site: https://nexusatemporal.com/
- API Site: https://api.nexusatemporal.com/
- Sistema: https://one.nexusatemporal.com.br/
- API Sistema: https://api.nexusatemporal.com.br/

---

**Desenvolvido por:** Claude Code
**Versão:** v2-integration
**Data:** 05/11/2025
**Próxima Revisão:** Próxima sessão

---

© 2025 Nexus Atemporal. Todos os direitos reservados.
