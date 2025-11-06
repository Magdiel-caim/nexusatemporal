# 🔐 Guia Completo de Integração Stripe - Nexus Atemporal

**Data:** 2025-11-04
**Status:** ✅ Implementação Completa
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [O que Você Precisa](#o-que-você-precisa)
3. [Arquitetura da Integração](#arquitetura-da-integração)
4. [Configuração Passo a Passo](#configuração-passo-a-passo)
5. [Testando a Integração](#testando-a-integração)
6. [Deploy em Produção](#deploy-em-produção)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A integração Stripe está **100% implementada** no Site Nexus Atemporal, permitindo:

- ✅ Checkout seguro com Stripe Checkout
- ✅ Assinaturas recorrentes mensais/anuais
- ✅ Webhooks para processamento automático
- ✅ Integração com n8n para automações
- ✅ Emails transacionais
- ✅ 3 Gateways (Stripe, Asaas, PagSeguro) com seleção automática
- ✅ Páginas de sucesso e cancelamento

---

## 📦 O que Você Precisa

### 1. **Credenciais Stripe**

Você precisa criar uma conta no [Stripe](https://dashboard.stripe.com) e obter:

#### **Modo Teste** (para desenvolvimento):
```bash
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **Modo Produção**:
```bash
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Como obter:**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie a **Secret key** (começa com `sk_test_` ou `sk_live_`)
3. Configure o webhook (veja seção [Configuração de Webhooks](#4-configurar-webhooks-stripe))

### 2. **Banco de Dados PostgreSQL**

Já configurado em:
- Host: `72.60.139.52`
- Database: `nexus_crm`
- User: `nexus_admin`

As tabelas `orders` e `payment_events` serão criadas automaticamente pelo TypeORM.

### 3. **Variáveis de Ambiente**

#### Backend (`.env`):
```env
# Database
DB_HOST=72.60.139.52
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=your-password

# Stripe
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# n8n (opcional)
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/nexus-purchase
N8N_WEBHOOK_TOKEN=your-token

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=https://nexusatemporal.com

# System
ONE_NEXUS_API_URL=https://one.nexusatemporal.com.br/api
ONE_NEXUS_API_KEY=your-api-key
```

#### Frontend (`.env`):
```env
VITE_API_URL=https://api.nexusatemporal.com
```

---

## 🏗️ Arquitetura da Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUXO COMPLETO                          │
└─────────────────────────────────────────────────────────────────┘

1. USUÁRIO ESCOLHE PLANO
   └─> Frontend (Plans.tsx)
       └─> Clica em "Começar Teste Grátis"
           └─> Informa email

2. CRIAÇÃO DE SESSÃO DE CHECKOUT
   └─> Frontend (payment.service.ts)
       └─> POST /api/payments/intent
           {
             planId: "profissional",
             userEmail: "user@example.com",
             countryCode: "BR"
           }

3. BACKEND PROCESSA PEDIDO
   └─> Backend (index.ts)
       └─> Cria registro em `orders` (status: pending)
       └─> Chama Stripe.checkout.sessions.create()
       └─> Retorna { url: "https://checkout.stripe.com/..." }

4. REDIRECIONAMENTO PARA STRIPE
   └─> Frontend redireciona usuário para checkout.stripe.com
       └─> Usuário preenche dados do cartão
       └─> Stripe processa pagamento

5. WEBHOOK STRIPE → BACKEND
   └─> Stripe envia evento checkout.session.completed
       └─> POST /api/payments/webhook/stripe
           └─> Backend valida assinatura
           └─> Atualiza order (status: paid)
           └─> Envia webhook para n8n
           └─> Envia email de boas-vindas
           └─> Cria usuário no sistema principal

6. REDIRECIONAMENTO FINAL
   └─> Stripe redireciona para:
       └─> /checkout/success?session_id={ID}
       └─> Página de confirmação
```

---

## ⚙️ Configuração Passo a Passo

### 1. **Instalar Dependências**

#### Backend:
```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api
npm install
```

**Dependências principais já no package.json:**
- `stripe@^14.10.0` - SDK Stripe
- `express@^4.18.2` - Framework web
- `typeorm@^0.3.19` - ORM
- `pg@^8.11.3` - Driver PostgreSQL
- `nodemailer@^6.9.7` - Envio de emails

#### Frontend:
```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/frontend
npm install
```

**Dependências principais já no package.json:**
- `axios@^1.6.2` - HTTP client
- `react-router-dom` - Rotas

### 2. **Configurar Variáveis de Ambiente**

```bash
# Backend
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api
cp .env.example .env
nano .env  # Editar e preencher suas credenciais

# Frontend
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/frontend
cp .env.example .env
nano .env  # Configurar VITE_API_URL
```

### 3. **Inicializar Banco de Dados**

O TypeORM criará as tabelas automaticamente na primeira execução:

```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api
npm run dev
```

Você verá:
```
✅ Database connected
🚀 Server running on port 3001
```

### 4. **Configurar Webhooks Stripe**

**IMPORTANTE:** Webhooks são essenciais para processar pagamentos!

#### **Modo Teste (Desenvolvimento Local):**

Use o Stripe CLI para testar webhooks localmente:

```bash
# 1. Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Encaminhar webhooks para localhost
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe

# 4. O CLI vai gerar um webhook secret
# Copie e cole no .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### **Modo Produção:**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. Configure:
   ```
   Endpoint URL: https://api.nexusatemporal.com/api/payments/webhook/stripe
   Description: Nexus Atemporal - Production
   Events to send:
     ✓ checkout.session.completed
     ✓ invoice.payment_succeeded
     ✓ invoice.payment_failed
     ✓ customer.subscription.updated
     ✓ customer.subscription.deleted
   ```
4. Copie o **Signing secret** (whsec_...) e adicione ao `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 5. **Testar Localmente**

#### Terminal 1 - Backend:
```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/frontend
npm run dev
```

#### Terminal 3 - Stripe CLI (se usando webhook local):
```bash
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe
```

Acesse: http://localhost:5173

---

## 🧪 Testando a Integração

### 1. **Testar Fluxo de Checkout**

1. Acesse o site: http://localhost:5173
2. Navegue até seção **"Planos"** (#pricing)
3. Clique em **"Começar Teste Grátis"** em qualquer plano
4. Digite um email de teste
5. Você será redirecionado para o Stripe Checkout

### 2. **Cartões de Teste Stripe**

Use estes cartões de teste (modo teste apenas):

| Cartão | Número | CVV | Data | Resultado |
|--------|--------|-----|------|-----------|
| **Visa** | 4242 4242 4242 4242 | 123 | Futuro | ✅ Sucesso |
| **Mastercard** | 5555 5555 5555 4444 | 123 | Futuro | ✅ Sucesso |
| **Decline** | 4000 0000 0000 0002 | 123 | Futuro | ❌ Recusado |
| **Require Auth** | 4000 0025 0000 3155 | 123 | Futuro | 🔐 3D Secure |

**Mais cartões de teste:** https://stripe.com/docs/testing

### 3. **Verificar Webhook**

Após completar o pagamento, verifique:

#### **Logs do Backend:**
```
✅ Webhook received: checkout.session.completed
✅ Order updated: <uuid> → paid
✅ n8n webhook sent
✅ Welcome email sent
```

#### **Dashboard Stripe:**
- Acesse: https://dashboard.stripe.com/test/payments
- Verifique se o pagamento aparece
- Clique em **"Events"** para ver webhooks

#### **Banco de Dados:**
```sql
-- Conectar ao PostgreSQL
psql -h 72.60.139.52 -U nexus_admin -d nexus_crm

-- Ver pedidos
SELECT id, user_email, plan, amount, provider, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Ver eventos de pagamento
SELECT id, provider, event_type, created_at
FROM payment_events
ORDER BY created_at DESC
LIMIT 10;
```

### 4. **Testar Páginas de Sucesso/Cancelamento**

#### **Sucesso:**
```
http://localhost:5173/checkout/success?session_id=cs_test_xxx
```

#### **Cancelamento:**
```
http://localhost:5173/checkout/cancel
```

---

## 🚀 Deploy em Produção

### 1. **Configurar DNS**

Adicione os registros A no seu provedor DNS:

```
nexusatemporal.com       A    72.60.5.29
api.nexusatemporal.com   A    72.60.5.29
```

### 2. **Build das Imagens Docker**

```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal

# Backend
cd apps/backend-site-api
docker build -t nexus-site-backend:latest .

# Frontend
cd ../frontend
docker build -t nexus-site-frontend:latest .
```

### 3. **Deploy no Docker Swarm**

```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal

# Criar rede (se não existir)
docker network create --driver overlay nexusatnet

# Deploy stack
docker stack deploy -c docker-compose.yml nexus-site

# Verificar serviços
docker stack services nexus-site

# Logs
docker service logs nexus-site_backend -f
docker service logs nexus-site_frontend -f
```

### 4. **Configurar Webhook Produção**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint:
   ```
   URL: https://api.nexusatemporal.com/api/payments/webhook/stripe
   ```
3. Selecione eventos (ver seção anterior)
4. Copie o **Signing secret** e atualize `.env` em produção
5. Redeploy:
   ```bash
   docker service update --env-add STRIPE_WEBHOOK_SECRET=whsec_xxxxx nexus-site_backend
   ```

### 5. **Alternar para Modo Live**

⚠️ **IMPORTANTE:** Só faça isso após testar tudo em modo teste!

```bash
# Atualizar .env com credenciais LIVE
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_... (da webhook produção)

# Redeploy
docker service update nexus-site_backend
```

---

## 🔍 Troubleshooting

### Problema: "Webhook signature verification failed"

**Causa:** `STRIPE_WEBHOOK_SECRET` incorreto ou ausente.

**Solução:**
1. Verifique o `.env`:
   ```bash
   cat .env | grep STRIPE_WEBHOOK_SECRET
   ```
2. Regenere o secret no dashboard Stripe
3. Atualize e reinicie o servidor

---

### Problema: "Failed to create payment intent"

**Causa:** Stripe API key inválida ou erro de conexão.

**Solução:**
1. Verifique a key:
   ```bash
   echo $STRIPE_SECRET_KEY
   ```
2. Teste a conexão:
   ```bash
   curl https://api.stripe.com/v1/balance \
     -u sk_test_51xxxxx:
   ```

---

### Problema: Pagamento aprovado mas webhook não chega

**Causas possíveis:**
- Webhook não configurado no Stripe
- URL incorreta
- Firewall bloqueando IP do Stripe

**Solução:**
1. Verifique webhooks no dashboard: https://dashboard.stripe.com/webhooks
2. Clique no webhook e veja "Recent events"
3. Verifique se há erros (401, 404, 500, timeout)
4. Teste manualmente:
   ```bash
   # Reenviar evento de teste
   stripe trigger checkout.session.completed
   ```

---

### Problema: CORS error no frontend

**Causa:** Backend não permite origem do frontend.

**Solução:**
```bash
# Atualizar .env do backend
CORS_ORIGIN=https://nexusatemporal.com

# Ou permitir múltiplas origens no código
CORS_ORIGIN=https://nexusatemporal.com,http://localhost:5173
```

---

### Problema: "Cannot POST /api/payments/intent"

**Causa:** Backend não está rodando ou rota não existe.

**Solução:**
1. Verifique se o backend está online:
   ```bash
   curl http://localhost:3001/health
   ```
2. Verifique logs:
   ```bash
   docker service logs nexus-site_backend -f
   ```

---

## 📊 Planos e Preços

Os preços estão configurados no backend (`stripe.ts:33-38`):

| Plano | Mensal | Anual | ID |
|-------|--------|-------|-----|
| **Essencial** | R$ 247 | R$ 197 | `essencial` |
| **Profissional** | R$ 580 | R$ 464 | `profissional` |
| **Empresarial** | R$ 1.247 | R$ 997 | `empresarial` |
| **Enterprise** | R$ 2.997 | R$ 2.397 | `enterprise` |

Para alterar preços:
1. Edite `apps/backend-site-api/src/modules/payments/stripe.ts` (linhas 33-38)
2. Edite `apps/frontend/src/services/payment.service.ts` (linhas 95-108)
3. Redeploy ambos os serviços

---

## 🎓 Recursos Adicionais

- **Stripe Docs:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe Testing:** https://stripe.com/docs/testing
- **Webhook Best Practices:** https://stripe.com/docs/webhooks/best-practices
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## ✅ Checklist de Implementação

- [x] ✅ Backend configurado com Express + TypeORM
- [x] ✅ Entidades Order e PaymentEvent criadas
- [x] ✅ Módulo Stripe com createSession e handleWebhook
- [x] ✅ Rotas `/api/payments/intent` e `/api/payments/webhook/stripe`
- [x] ✅ Frontend service `payment.service.ts` criado
- [x] ✅ Componente Plans integrado com API
- [x] ✅ Páginas de sucesso e cancelamento
- [x] ✅ Rotas configuradas no App.tsx
- [x] ✅ Logos atualizadas (Header e Footer)
- [x] ✅ Documentação completa
- [ ] ⏳ Configurar credenciais Stripe (você precisa fazer)
- [ ] ⏳ Configurar webhook produção (você precisa fazer)
- [ ] ⏳ Testar fluxo completo
- [ ] ⏳ Deploy produção

---

## 🎉 Próximos Passos

1. **Obter credenciais Stripe:**
   - Criar conta em https://dashboard.stripe.com
   - Copiar API keys (teste e produção)
   - Configurar webhook

2. **Testar localmente:**
   - Seguir seção [Testando a Integração](#testando-a-integração)
   - Usar cartões de teste
   - Verificar webhooks

3. **Implementar melhorias (opcional):**
   - Modal para coletar email antes do checkout
   - Validação de CPF/CNPJ para gateway Asaas
   - Analytics de conversão
   - Cupons de desconto

4. **Deploy produção:**
   - Seguir seção [Deploy em Produção](#deploy-em-produção)
   - Configurar DNS
   - Alternar para modo live

---

**Desenvolvido para:** Nexus Atemporal
**Última atualização:** 04/11/2025
**Versão:** 1.0

© 2025 Nexus Atemporal. Todos os direitos reservados.
