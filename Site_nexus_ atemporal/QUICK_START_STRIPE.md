# 🚀 Quick Start - Integração Stripe (5 minutos)

**Última atualização:** 04/11/2025

---

## ⚡ Setup Rápido (Desenvolvimento Local)

### 1. Criar Conta Stripe (2 minutos)

```bash
# Acesse e crie sua conta:
https://dashboard.stripe.com/register

# Após login, vá para:
https://dashboard.stripe.com/test/apikeys

# Copie a SECRET KEY (começa com sk_test_...)
```

---

### 2. Configurar Backend (1 minuto)

```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api

# Criar .env
cat > .env << 'EOF'
# Database
DB_HOST=72.60.139.52
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=nexus2024@secure

# Stripe (COLE SUA KEY AQUI)
STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
STRIPE_WEBHOOK_SECRET=whsec_temp

# CORS
CORS_ORIGIN=http://localhost:5173

# SMTP (opcional para teste)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=
EOF

# Instalar e rodar
npm install
npm run dev
```

**Você verá:**
```
✅ Database connected
🚀 Server running on port 3001
```

---

### 3. Configurar Frontend (30 segundos)

```bash
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/frontend

# Criar .env
echo "VITE_API_URL=http://localhost:3001" > .env

# Instalar e rodar
npm install
npm run dev
```

**Você verá:**
```
VITE v5.4.8  ready in 500 ms
➜  Local:   http://localhost:5173/
```

---

### 4. Configurar Webhook Local (1 minuto)

**Opção A: Stripe CLI (recomendado)**
```bash
# Instalar (se não tiver)
# Mac: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Escutar webhooks
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe

# ⚠️ IMPORTANTE: Copie o webhook secret que aparecer!
# Exemplo: whsec_xxxxxxxxxxxxx
# Cole no .env do backend (STRIPE_WEBHOOK_SECRET)
```

**Opção B: Sem CLI (para teste rápido)**
```bash
# O webhook não vai funcionar, mas você pode testar o checkout
# Apenas pule esta etapa
```

---

### 5. Testar! (30 segundos)

```bash
# Abra no navegador:
http://localhost:5173

# Passos:
1. Scroll até "Planos" ou clique em #pricing
2. Clique em "Começar Teste Grátis" (qualquer plano)
3. Digite um email (pode ser fake para teste)
4. Use o cartão de teste:
   Número: 4242 4242 4242 4242
   Data: Qualquer data futura (ex: 12/25)
   CVV: 123
   Nome: Teste
5. Confirmar
6. Você será redirecionado para /checkout/success
```

---

## 🎯 Resumo dos Comandos

```bash
# Terminal 1 - Backend
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/backend-site-api
npm install && npm run dev

# Terminal 2 - Frontend
cd /root/nexusatemporalv1/Site_nexus_atemporal/apps/frontend
npm install && npm run dev

# Terminal 3 - Webhooks (opcional)
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe
```

---

## 🧪 Cartões de Teste

| Situação | Número | CVV | Data | Resultado |
|----------|--------|-----|------|-----------|
| ✅ Sucesso | 4242 4242 4242 4242 | 123 | Futuro | Aprovado |
| ❌ Recusado | 4000 0000 0000 0002 | 123 | Futuro | Negado |
| 🔐 3D Secure | 4000 0025 0000 3155 | 123 | Futuro | Requer autenticação |

**Mais cartões:** https://stripe.com/docs/testing

---

## 🔍 Como Verificar se Funcionou

### **No Terminal (Backend):**
```
✅ Webhook received: checkout.session.completed
✅ Order updated: <uuid> → paid
```

### **No Dashboard Stripe:**
```
https://dashboard.stripe.com/test/payments
→ Você verá o pagamento listado
```

### **No Banco de Dados:**
```bash
# Conectar ao PostgreSQL
PGPASSWORD='nexus2024@secure' psql -h 72.60.139.52 -U nexus_admin -d nexus_crm

# Ver pedidos
SELECT id, user_email, plan, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;
```

---

## ⚠️ Problemas Comuns

### "Cannot connect to Stripe"
```bash
# Verifique sua STRIPE_SECRET_KEY no .env
cat apps/backend-site-api/.env | grep STRIPE_SECRET_KEY

# Deve começar com sk_test_ (não pode estar vazio)
```

### "Webhook signature verification failed"
```bash
# Você precisa configurar o webhook local (passo 4)
# Ou temporariamente comentar a validação para teste

# Alternativa: No stripe.ts, comente temporariamente a validação
# (NÃO fazer em produção!)
```

### "CORS error"
```bash
# Verifique CORS_ORIGIN no backend
echo "CORS_ORIGIN=http://localhost:5173" >> apps/backend-site-api/.env

# Reinicie o backend
```

---

## 📚 Próximos Passos

Após testar localmente:

1. **Ler documentação completa:** `INTEGRACAO_STRIPE_GUIA.md`
2. **Configurar webhook produção:** Ver seção "Deploy em Produção"
3. **Obter credenciais LIVE:** Quando estiver pronto para ir ao ar

---

## 🆘 Precisa de Ajuda?

**Documentação completa:** `INTEGRACAO_STRIPE_GUIA.md`
**Resumo da sessão:** `RESUMO_SESSAO_04112025.md`

**Stripe Docs:** https://stripe.com/docs
**Stripe Testing:** https://stripe.com/docs/testing

---

**✨ Desenvolvido em 04/11/2025**
**⏱️ Tempo estimado: 5 minutos**
**🚀 Dificuldade: Fácil**

Boa sorte! 🎉
