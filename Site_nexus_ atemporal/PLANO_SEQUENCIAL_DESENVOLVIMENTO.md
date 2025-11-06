# 📋 Plano Sequencial de Desenvolvimento - Site Nexus Atemporal

**Data:** 05/11/2025
**Versão Atual:** v2.0 (Stripe integrado)
**Objetivo:** Finalizar funcionalidades e preparar para produção

---

## 🎯 VISÃO GERAL DO PLANO

Baseado na sessão anterior (04/11/2025), este plano define a sequência exata de desenvolvimento para levar o site do estado atual (70% frontend, 95% backend) até 100% pronto para produção.

**Tempo total estimado:** 12-16 horas
**Sessões sugeridas:** 2-3 sessões de 4-6 horas cada

---

## 📊 ESTADO ATUAL (Checkpoint)

### ✅ O que está COMPLETO:
- Frontend React + TypeScript + Vite (70%)
- Backend Node.js + Express + TypeORM (95%)
- Integração Stripe 100% funcional
- Design system completo (TailwindCSS)
- 12 logos implementadas
- Documentação completa (40+ páginas)
- Banco de dados PostgreSQL conectado

### ⚠️ O que precisa ser FINALIZADO:
- Teste completo end-to-end do fluxo de checkout
- Webhook permanente do Stripe
- Sistema de envio de emails (SMTP)
- Modal de checkout com coleta de dados
- Analytics e tracking de conversões
- Integração n8n
- Deploy em produção

---

## 🗺️ FASES DO DESENVOLVIMENTO

```
FASE 1 (CRÍTICA) → FASE 2 (IMPORTANTE) → FASE 3 (MELHORIAS) → FASE 4 (PRODUÇÃO)
   2-3 horas          2-3 horas            3-4 horas          3-4 horas
     🔴                  🟡                    🟢                 🔵
```

---

## 🔴 FASE 1: VALIDAÇÃO CRÍTICA (2-3 horas)

**Objetivo:** Garantir que o core do sistema está 100% funcional

### TAREFA 1.1: Validar Ambiente (30 min)

**Checklist de Validação:**
```bash
# 1. Verificar Node.js e npm
node -v    # Deve ser >= 18.x
npm -v     # Deve ser >= 9.x

# 2. Verificar PostgreSQL
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT 1;"

# 3. Verificar Stripe CLI
stripe version    # Deve ser >= 1.32.x

# 4. Verificar dependências Backend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"
npm install
npm run build   # Verificar se compila sem erros

# 5. Verificar dependências Frontend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"
npm install
npm run build   # Verificar se compila sem erros
```

**Critérios de sucesso:**
- [ ] Todos os comandos executam sem erro
- [ ] Build do backend gera arquivos em `dist/`
- [ ] Build do frontend gera arquivos em `dist/`
- [ ] Conexão com banco de dados funciona

---

### TAREFA 1.2: Testar Fluxo Completo de Checkout (1 hora)

**Passo 1: Iniciar Backend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Verificar .env
cat .env | grep -E "STRIPE|DB_|PORT"

# Iniciar em modo dev
npm run dev

# Deve mostrar:
# ✓ Database connected
# ✓ Server running on port 3001
```

**Passo 2: Iniciar Frontend**
```bash
# Novo terminal
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

# Verificar .env
cat .env | grep VITE_

# Iniciar em modo dev
npm run dev

# Deve mostrar:
# VITE v5.x.x ready in Xms
# ➜ Local: http://localhost:5173
```

**Passo 3: Executar Testes Manuais**
```
1. Abrir: http://localhost:5173
2. Verificar carregamento correto do site
3. Scroll até seção "Planos"
4. Clicar no botão "Começar Agora" de qualquer plano
5. Verificar redirecionamento para Stripe Checkout
6. Preencher dados de teste:
   - Email: test@example.com
   - Cartão: 4242 4242 4242 4242
   - Data: 12/34
   - CVC: 123
7. Clicar em "Pay"
8. Verificar redirecionamento para página de sucesso
9. Verificar no dashboard Stripe: https://dashboard.stripe.com/test/payments
10. Verificar no banco de dados:
```

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT id, email, plan_name, amount, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
"
```

**Critérios de sucesso:**
- [ ] Site carrega sem erros no console
- [ ] Botão de plano funciona
- [ ] Redirecionamento para Stripe funciona
- [ ] Pagamento de teste é aprovado
- [ ] Redireciona para página de sucesso
- [ ] Pedido aparece no dashboard Stripe
- [ ] Pedido aparece no banco de dados

**Se algum passo falhar:** Documentar o erro e seguir para troubleshooting

---

### TAREFA 1.3: Configurar Webhook Permanente (30 min)

**Passo 1: Autenticar Stripe CLI**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Login no Stripe
stripe login

# Deve abrir navegador para autorização
# Após autorizar, voltar ao terminal
```

**Passo 2: Configurar Webhook Local**
```bash
# Iniciar listener
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe

# Copiar o webhook secret que aparece (whsec_...)
# Exemplo: whsec_1234567890abcdef...
```

**Passo 3: Atualizar .env**
```bash
# Fazer backup do .env atual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar webhook secret
nano .env

# Alterar linha:
STRIPE_WEBHOOK_SECRET=whsec_[COLAR_AQUI_O_SECRET]

# Salvar: Ctrl+O, Enter, Ctrl+X
```

**Passo 4: Reiniciar Backend**
```bash
# Ctrl+C no terminal do backend
npm run dev

# Verificar logs:
# ✓ Webhook endpoint: /api/payments/webhook/stripe
```

**Passo 5: Testar Webhook**
```bash
# Fazer novo pagamento de teste (repetir TAREFA 1.2, Passo 3)
# Verificar logs do backend, deve aparecer:
# → Received webhook: checkout.session.completed
# → Order updated: ord_xxx → paid
```

**Critérios de sucesso:**
- [ ] Stripe CLI autenticado
- [ ] Webhook secret copiado
- [ ] .env atualizado
- [ ] Backend reiniciado com novo secret
- [ ] Pagamento de teste aciona webhook
- [ ] Logs mostram evento processado
- [ ] Status do pedido muda para "paid" no banco

---

### TAREFA 1.4: Troubleshooting (se necessário)

**Problema 1: Backend não inicia**
```bash
# Verificar porta em uso
lsof -i :3001

# Se houver processo, matar:
kill -9 [PID]

# Ou usar porta alternativa
PORT=3002 npm run dev
```

**Problema 2: CORS Error**
```bash
# Verificar .env do backend
cat .env | grep CORS_ORIGIN

# Deve conter:
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Se não, adicionar e reiniciar
```

**Problema 3: Stripe API Key inválida**
```bash
# Testar key diretamente
node test-stripe.js

# Verificar resposta
# Se erro, gerar novas keys em:
# https://dashboard.stripe.com/test/apikeys
```

**Problema 4: Webhook não funciona**
```bash
# Verificar se listener está rodando
ps aux | grep "stripe listen"

# Verificar logs do webhook
stripe logs tail

# Testar manualmente
stripe trigger checkout.session.completed
```

---

## 🟡 FASE 2: FUNCIONALIDADES IMPORTANTES (2-3 horas)

**Objetivo:** Adicionar funcionalidades essenciais para UX profissional

### TAREFA 2.1: Configurar SMTP para Emails (1 hora)

**Opção A: Gmail (Recomendado para teste)**

**Passo 1: Obter App Password do Gmail**
```
1. Acessar: https://myaccount.google.com/security
2. Ativar "Verificação em 2 etapas"
3. Ir em "Senhas de app" (App passwords)
4. Selecionar "Email" como app
5. Selecionar "Outro" como dispositivo
6. Digitar: "Nexus Atemporal Site"
7. Clicar "Gerar"
8. Copiar a senha de 16 dígitos
```

**Passo 2: Configurar .env do Backend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Editar
nano .env

# Adicionar/atualizar:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=[COLAR_AQUI_APP_PASSWORD]
SMTP_FROM=Nexus Atemporal <contato@nexusatemporal.com.br>

# Salvar: Ctrl+O, Enter, Ctrl+X
```

**Passo 3: Verificar Módulo de Email**
```bash
# Verificar se arquivo existe
cat src/modules/email/email.service.ts

# Deve conter configuração do Nodemailer
```

**Passo 4: Testar Envio de Email**
```bash
# Criar script de teste
cat > test-email.js << 'EOF'
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'seu-email@example.com',
  subject: 'Teste Nexus Atemporal',
  html: '<h1>Email funcionando!</h1>',
}, (error, info) => {
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Email enviado:', info.messageId);
  }
});
EOF

# Executar teste
node test-email.js
```

**Passo 5: Integrar com Webhook**
```bash
# Verificar se webhook chama email service
cat src/index.ts | grep -A 10 "webhook/stripe"

# Deve conter:
# - Envio de email de boas-vindas
# - Dados do cliente
# - Link de acesso
```

**Critérios de sucesso:**
- [ ] App Password do Gmail gerado
- [ ] .env configurado com credenciais SMTP
- [ ] Script de teste envia email com sucesso
- [ ] Email chega na caixa de entrada (verificar spam também)
- [ ] Webhook envia email automaticamente após pagamento

---

**Opção B: SendGrid (Recomendado para produção)**

```bash
# 1. Criar conta em: https://sendgrid.com/
# 2. Verificar domínio
# 3. Gerar API Key
# 4. Configurar .env:

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=Nexus Atemporal <noreply@nexusatemporal.com.br>
```

---

### TAREFA 2.2: Criar Modal de Checkout (1-1.5 horas)

**Passo 1: Criar Componente de Modal**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

# Criar arquivo
touch src/components/CheckoutModal.tsx
```

**Passo 2: Implementar Modal** *(código será criado)*

Componente deve ter:
- [ ] Campo: Nome completo (obrigatório)
- [ ] Campo: Email (obrigatório, validação)
- [ ] Campo: Telefone (opcional, máscara)
- [ ] Validação de formulário
- [ ] Loading state durante redirecionamento
- [ ] Tratamento de erros
- [ ] Design consistente com site

**Passo 3: Integrar com Plans.tsx**
```typescript
// Alterar botão "Começar Agora" para abrir modal
// Modal coleta dados → chama API → redireciona
```

**Passo 4: Testar Novo Fluxo**
```
1. Clicar em plano
2. Modal abre
3. Preencher dados
4. Clicar "Continuar para Pagamento"
5. Verifica loading
6. Redireciona para Stripe com dados pré-preenchidos
```

**Critérios de sucesso:**
- [ ] Modal abre ao clicar em plano
- [ ] Validação de campos funciona
- [ ] Email inválido é rejeitado
- [ ] Loading state aparece
- [ ] Dados são passados para Stripe
- [ ] Stripe pré-preenche email

---

## 🟢 FASE 3: MELHORIAS E OTIMIZAÇÕES (3-4 horas)

**Objetivo:** Adicionar analytics, integrações e melhorar conversão

### TAREFA 3.1: Implementar Google Analytics (1 hora)

**Passo 1: Criar Conta GA4**
```
1. Acessar: https://analytics.google.com/
2. Criar propriedade "Nexus Atemporal Site"
3. Configurar stream de dados web
4. Copiar ID de medição (G-XXXXXXXXXX)
```

**Passo 2: Adicionar GA no Frontend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

# Editar index.html
nano index.html
```

Adicionar no `<head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Passo 3: Criar Serviço de Analytics**
```bash
touch src/services/analytics.service.ts
```

Implementar tracking de eventos:
```typescript
// - plan_view: Usuário viu plano
// - plan_clicked: Usuário clicou em plano
// - begin_checkout: Modal abriu
// - checkout_started: Redirecionou para Stripe
// - purchase: Pagamento confirmado
```

**Passo 4: Integrar com Componentes**
```bash
# Plans.tsx: trackEvent('plan_clicked', { plan_name })
# CheckoutModal.tsx: trackEvent('begin_checkout', { plan_name })
# payment.service.ts: trackEvent('checkout_started', { plan_name, amount })
# CheckoutSuccessPage.tsx: trackEvent('purchase', { plan_name, amount })
```

**Passo 5: Testar Tracking**
```
1. Abrir site
2. Abrir GA4 Real-time
3. Clicar em plano
4. Preencher modal
5. Iniciar checkout
6. Verificar eventos aparecendo no GA4
```

**Critérios de sucesso:**
- [ ] GA4 configurado
- [ ] Script adicionado ao site
- [ ] Serviço de analytics criado
- [ ] Eventos implementados em todos componentes
- [ ] Eventos aparecem em tempo real no GA4
- [ ] Funil de conversão visualizável

---

### TAREFA 3.2: Configurar n8n Webhooks (1.5 horas)

**Passo 1: Preparar n8n** *(assumindo que n8n já está instalado)*
```
1. Acessar n8n: https://n8n.seudominio.com
2. Criar novo workflow: "Nexus Site - New Purchase"
3. Adicionar nó Webhook
4. Configurar:
   - Method: POST
   - Path: nexus-site-purchase
   - Authentication: Header Auth
5. Copiar URL do webhook
6. Gerar token de autenticação
```

**Passo 2: Configurar Backend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Editar .env
nano .env

# Adicionar:
N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/nexus-site-purchase
N8N_WEBHOOK_TOKEN=seu-token-secreto-aqui
N8N_ENABLED=true
```

**Passo 3: Verificar Módulo n8n**
```bash
cat src/modules/webhook/n8n.ts

# Deve conter:
# - Função de envio de webhook
# - Retry logic
# - Error handling
```

**Passo 4: Criar Workflow n8n**
```
Fluxo sugerido:

1. [Webhook Trigger] Recebe dados do pedido
   ↓
2. [Function] Formatar dados
   ↓
3. [HTTP Request] Criar usuário no sistema principal
   ↓
4. [Send Email] Enviar email personalizado
   ↓
5. [Slack/Discord] Notificar equipe
   ↓
6. [Set] Retornar sucesso
```

**Passo 5: Testar Integração**
```bash
# Fazer pagamento de teste
# Verificar logs n8n
# Verificar se workflow executou
# Verificar se ações foram realizadas
```

**Critérios de sucesso:**
- [ ] n8n configurado e acessível
- [ ] Webhook criado e URL copiada
- [ ] Backend configurado com URL e token
- [ ] Workflow n8n criado e ativado
- [ ] Pagamento de teste aciona workflow
- [ ] Todas ações do workflow executam
- [ ] Erros são tratados gracefully

---

### TAREFA 3.3: Implementar Cupons de Desconto (1 hora)

**Passo 1: Criar Cupons no Stripe**
```bash
# Acessar dashboard: https://dashboard.stripe.com/test/coupons
# Criar cupons de exemplo:
# - BEMVINDO10: 10% de desconto
# - BLACKFRIDAY: 20% de desconto
# - PRIMEIRACOMPRA: R$ 50 de desconto
```

**Passo 2: Adicionar Campo no Modal**
```typescript
// CheckoutModal.tsx
// Adicionar:
// - Input para código do cupom
// - Botão "Aplicar cupom"
// - Feedback visual de cupom aplicado
// - Mostrar valor com desconto
```

**Passo 3: Validar Cupom no Backend**
```typescript
// stripe.ts
// Adicionar endpoint: POST /api/payments/validate-coupon
// - Verifica se cupom existe
// - Verifica se está ativo
// - Retorna dados do cupom
```

**Passo 4: Aplicar Cupom no Checkout**
```typescript
// payment.service.ts
// Passar coupon code para API
// Backend inclui coupon na session
```

**Critérios de sucesso:**
- [ ] Cupons criados no Stripe
- [ ] Campo de cupom no modal
- [ ] Validação de cupom funciona
- [ ] Cupom inválido mostra erro
- [ ] Cupom válido mostra desconto
- [ ] Checkout aplica desconto corretamente

---

## 🔵 FASE 4: PREPARAÇÃO PARA PRODUÇÃO (3-4 horas)

**Objetivo:** Deploy seguro e monitorado em produção

### TAREFA 4.1: Criar Builds de Produção (30 min)

**Backend:**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Build
npm run build

# Verificar dist/
ls -lah dist/

# Teste local de produção
NODE_ENV=production node dist/index.js
```

**Frontend:**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

# Build
npm run build

# Verificar dist/
ls -lah dist/

# Testar preview
npm run preview
```

**Critérios de sucesso:**
- [ ] Backend compila sem erros
- [ ] Frontend compila sem erros
- [ ] Arquivos gerados em dist/
- [ ] Builds funcionam localmente

---

### TAREFA 4.2: Configurar Variáveis de Produção (30 min)

**Criar .env.production para Backend:**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

cat > .env.production << 'EOF'
# Environment
NODE_ENV=production
PORT=3001

# Database
DB_HOST=46.202.144.210
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=nexus2024@secure

# Stripe PRODUCTION (PRECISA OBTER KEYS LIVE)
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX

# SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.XXXXXXXXXXXXXXXXXXXXXXXX

# n8n
N8N_WEBHOOK_URL=https://n8n.nexusatemporal.com/webhook/nexus-site-purchase
N8N_WEBHOOK_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX

# Security
CORS_ORIGIN=https://nexusatemporal.com
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
EOF
```

**Criar .env.production para Frontend:**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

cat > .env.production << 'EOF'
VITE_API_URL=https://api.nexusatemporal.com
VITE_STRIPE_PUBLIC_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
EOF
```

---

### TAREFA 4.3: Obter Credenciais Stripe LIVE (1 hora)

**⚠️ ATENÇÃO: Este passo requer aprovação e ativação da conta Stripe**

**Passo 1: Ativar Conta Stripe**
```
1. Acessar: https://dashboard.stripe.com/account
2. Completar "Account Setup":
   - Business details
   - Banking information
   - Identity verification
3. Aguardar aprovação (pode levar 1-2 dias)
```

**Passo 2: Obter API Keys LIVE**
```
1. Acessar: https://dashboard.stripe.com/apikeys
2. Toggle: "View test data" → OFF (modo LIVE)
3. Copiar:
   - Publishable key (pk_live_...)
   - Secret key (sk_live_...) [Revelar]
4. GUARDAR KEYS EM LOCAL SEGURO
```

**Passo 3: Configurar Webhook LIVE**
```
1. Acessar: https://dashboard.stripe.com/webhooks
2. Toggle: "View test data" → OFF
3. "Add endpoint"
4. URL: https://api.nexusatemporal.com/api/payments/webhook/stripe
5. Events to send:
   - checkout.session.completed
   - payment_intent.succeeded
   - payment_intent.payment_failed
6. Copiar Signing secret (whsec_...)
```

**Passo 4: Testar em Modo LIVE (com cautela)**
```bash
# Usar cartão real com valor mínimo (ex: R$ 1,00)
# Verificar se:
# - Checkout funciona
# - Webhook é recebido
# - Email é enviado
# - n8n é acionado
# - Valor é cobrado corretamente

# FAZER ESTORNO IMEDIATAMENTE APÓS TESTE
```

---

### TAREFA 4.4: Dockerizar Aplicações (1 hora)

**Passo 1: Criar Dockerfile do Backend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
EOF
```

**Passo 2: Criar Dockerfile do Frontend**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EOF

# Criar nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
```

**Passo 3: Build de Imagens**
```bash
# Backend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"
docker build -t nexus-site-backend:latest .

# Frontend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"
docker build -t nexus-site-frontend:latest .

# Verificar imagens
docker images | grep nexus-site
```

---

### TAREFA 4.5: Deploy com Docker Swarm (1 hora)

**Passo 1: Atualizar docker-compose.yml**
```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal"

cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: nexus-site-backend:latest
    env_file:
      - apps/backend-site-api/.env.production
    networks:
      - nexus-network
    deploy:
      replicas: 2
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nexus-site-api.rule=Host(`api.nexusatemporal.com`)"
        - "traefik.http.routers.nexus-site-api.entrypoints=websecure"
        - "traefik.http.routers.nexus-site-api.tls.certresolver=letsencrypt"
        - "traefik.http.services.nexus-site-api.loadbalancer.server.port=3001"

  frontend:
    image: nexus-site-frontend:latest
    networks:
      - nexus-network
    deploy:
      replicas: 2
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nexus-site.rule=Host(`nexusatemporal.com`)"
        - "traefik.http.routers.nexus-site.entrypoints=websecure"
        - "traefik.http.routers.nexus-site.tls.certresolver=letsencrypt"
        - "traefik.http.services.nexus-site.loadbalancer.server.port=80"

networks:
  nexus-network:
    external: true
EOF
```

**Passo 2: Deploy**
```bash
# Deploy stack
docker stack deploy -c docker-compose.prod.yml nexus-site

# Verificar serviços
docker service ls | grep nexus-site

# Verificar logs
docker service logs nexus-site_backend -f
docker service logs nexus-site_frontend -f
```

**Passo 3: Verificar DNS**
```bash
# Verificar se domínios apontam para servidor
dig nexusatemporal.com +short
dig api.nexusatemporal.com +short

# Ambos devem retornar IP do servidor
```

**Passo 4: Testar em Produção**
```bash
# Teste básico
curl https://api.nexusatemporal.com/health
curl https://nexusatemporal.com

# Teste completo no navegador
# Abrir: https://nexusatemporal.com
# Executar fluxo completo de checkout
```

---

### TAREFA 4.6: Monitoramento e Logs (30 min)

**Configurar Health Checks:**
```bash
# Verificar endpoint de health
curl https://api.nexusatemporal.com/health

# Deve retornar:
# {
#   "status": "healthy",
#   "database": "connected",
#   "timestamp": "..."
# }
```

**Configurar UptimeRobot:**
```
1. Acessar: https://uptimerobot.com/
2. Adicionar monitor:
   - Type: HTTP(s)
   - URL: https://api.nexusatemporal.com/health
   - Interval: 5 minutes
3. Configurar alertas por email/SMS
```

**Configurar Logs Centralizados:**
```bash
# Já deve estar configurado no Docker Swarm
# Verificar:
docker service logs nexus-site_backend --tail=100
docker service logs nexus-site_frontend --tail=100

# Configurar rotação de logs
# (se não estiver configurado globalmente)
```

---

## 📋 CHECKLIST FINAL DE VALIDAÇÃO

### Frontend:
- [ ] Build de produção sem warnings
- [ ] Todas as páginas carregam
- [ ] Design responsivo (mobile/tablet/desktop)
- [ ] Dark/Light mode funciona
- [ ] Internacionalização funciona
- [ ] Formulários validam corretamente
- [ ] Loading states visíveis
- [ ] Tratamento de erros implementado
- [ ] Analytics tracking funcionando
- [ ] Performance otimizada (Lighthouse > 90)

### Backend:
- [ ] Build de produção sem warnings
- [ ] Todas as rotas funcionam
- [ ] Conexão com banco estável
- [ ] Stripe integration funcionando
- [ ] Webhooks processando corretamente
- [ ] Emails sendo enviados
- [ ] n8n integration funcionando
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Logs estruturados

### Segurança:
- [ ] HTTPS ativo (certificado SSL válido)
- [ ] Variáveis sensíveis em .env
- [ ] API keys não expostas no frontend
- [ ] Webhook signatures validadas
- [ ] SQL injection protegido (TypeORM)
- [ ] XSS protegido (React sanitization)
- [ ] CSRF tokens (se necessário)
- [ ] Rate limiting configurado
- [ ] Helmet.js ativo
- [ ] CORS restritivo

### DevOps:
- [ ] Docker images criadas
- [ ] Docker Swarm deploy funcionando
- [ ] Traefik configurado
- [ ] DNS apontando corretamente
- [ ] Health checks respondendo
- [ ] Logs acessíveis
- [ ] Monitoring configurado
- [ ] Backup automático configurado
- [ ] Rollback plan definido
- [ ] Documentação de deploy atualizada

### Negócio:
- [ ] Todos os planos cadastrados no Stripe
- [ ] Preços corretos configurados
- [ ] Emails de boas-vindas personalizados
- [ ] Fluxo de onboarding definido
- [ ] Suporte técnico preparado
- [ ] Termos de uso e privacidade atualizados
- [ ] LGPD compliance verificado
- [ ] Analytics e métricas configuradas

---

## 🚀 CRONOGRAMA SUGERIDO

### **Sessão 1: Validação e Funcionalidades Core** (4-5 horas)
```
🔴 FASE 1: Validação Crítica (2-3h)
├─ Validar ambiente (30min)
├─ Testar checkout completo (1h)
├─ Configurar webhook (30min)
└─ Troubleshooting (se necessário)

🟡 FASE 2: Funcionalidades Importantes (2h)
├─ Configurar SMTP (1h)
└─ Criar modal de checkout (1h)

📝 Checkpoint: Fluxo completo funcionando com emails
```

### **Sessão 2: Melhorias e Analytics** (3-4 horas)
```
🟢 FASE 3: Melhorias (3-4h)
├─ Google Analytics (1h)
├─ n8n Webhooks (1.5h)
├─ Cupons de desconto (1h)
└─ Testes e ajustes (0.5h)

📝 Checkpoint: Analytics e integrações funcionando
```

### **Sessão 3: Deploy em Produção** (4-5 horas)
```
🔵 FASE 4: Produção (4-5h)
├─ Builds de produção (30min)
├─ Variáveis de produção (30min)
├─ Obter Stripe LIVE keys (1h)
├─ Dockerizar aplicações (1h)
├─ Deploy Docker Swarm (1h)
└─ Monitoramento e validação final (1h)

📝 Checkpoint: Site em produção e monitorado
```

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Técnicos:
- **Uptime:** > 99.9%
- **Response time:** < 500ms (API)
- **Page load:** < 2s (Frontend)
- **Error rate:** < 0.1%
- **Build success:** 100%

### KPIs de Negócio:
- **Checkout completion rate:** > 80%
- **Email delivery rate:** > 95%
- **Payment success rate:** > 98%
- **Bounce rate:** < 40%
- **Time to purchase:** < 5min

---

## 🆘 PLANO DE CONTINGÊNCIA

### Se algo der errado em produção:

**Rollback Rápido:**
```bash
# Voltar para versão anterior
docker service update --image nexus-site-backend:previous nexus-site_backend
docker service update --image nexus-site-frontend:previous nexus-site_frontend

# Ou remover stack completo
docker stack rm nexus-site
```

**Modo de Manutenção:**
```bash
# Redirecionar tráfego para página de manutenção
# (configurar no Traefik ou Nginx)
```

**Backup e Restore:**
```bash
# Restaurar do último backup
# (ver PROXIMA_SESSAO_DETALHADO.md para comandos)
```

---

## 📞 CONTATOS E RECURSOS

### Suporte:
- **Stripe Support:** https://support.stripe.com/
- **n8n Docs:** https://docs.n8n.io/
- **Google Analytics:** https://support.google.com/analytics/

### Dashboards:
- **Stripe:** https://dashboard.stripe.com/
- **n8n:** https://n8n.nexusatemporal.com/ (configurar)
- **Analytics:** https://analytics.google.com/ (configurar)
- **UptimeRobot:** https://uptimerobot.com/ (configurar)

---

## ✅ APROVAÇÃO DO PLANO

**Antes de começar, validar com o cliente:**

- [ ] Prioridades estão corretas?
- [ ] Estimativas de tempo são realistas?
- [ ] Alguma funcionalidade deve ser adicionada/removida?
- [ ] Alguma mudança de ordem/prioridade?
- [ ] Credenciais necessárias estão disponíveis?
- [ ] Domínios DNS estão configurados?
- [ ] Aprovação para usar Stripe LIVE?

---

## 📝 DOCUMENTAÇÃO QUE SERÁ GERADA

Ao final de cada fase, documentar:

1. **RELATORIO_FASE_1.md** - Validação crítica
2. **RELATORIO_FASE_2.md** - Funcionalidades importantes
3. **RELATORIO_FASE_3.md** - Melhorias e integrações
4. **RELATORIO_FASE_4.md** - Deploy produção
5. **MANUAL_OPERACIONAL.md** - Como operar o site
6. **TROUBLESHOOTING.md** - Problemas comuns e soluções

---

**Criado em:** 05/11/2025
**Baseado em:** PROXIMA_SESSAO_DETALHADO.md
**Status:** ✅ Pronto para revisão e aprovação

© 2025 Nexus Atemporal. Todos os direitos reservados.
