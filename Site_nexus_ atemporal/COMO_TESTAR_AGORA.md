# 🚀 Como Testar a Integração Stripe AGORA

**Status:** ✅ Tudo validado e pronto!
**Tempo estimado:** 3 minutos

---

## 📋 Pré-requisitos (já feitos!)

- ✅ Credenciais Stripe configuradas
- ✅ Conexão API validada
- ✅ Stripe CLI instalado
- ✅ Backend configurado
- ✅ Frontend configurado

---

## 🎯 Teste Rápido (3 passos)

### **Passo 1: Iniciar Backend** (Terminal 1)

```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Se não tiver dependências instaladas:
npm install

# Iniciar servidor
npm run dev
```

**Você deve ver:**
```
✅ Database connected
🚀 Server running on port 3001
📍 Environment: development
🌐 CORS Origin: http://localhost:5173,https://nexusatemporal.com
```

---

### **Passo 2: Iniciar Frontend** (Terminal 2)

```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/frontend"

# Se não tiver dependências instaladas:
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Você deve ver:**
```
VITE v5.4.8  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Passo 3: Testar no Navegador**

1. **Abra:** http://localhost:5173

2. **Navegue até "Planos":**
   - Scroll para baixo OU
   - Clique em "Pricing" no menu

3. **Clique em "Começar Teste Grátis"** (qualquer plano)

4. **Digite um email de teste:**
   - Exemplo: `teste@example.com`
   - Pressione OK

5. **Você será redirecionado para Stripe Checkout!** 🎉

6. **Use o cartão de teste:**
   ```
   Número: 4242 4242 4242 4242
   Data: 12/30 (qualquer data futura)
   CVV: 123
   Nome: Teste
   ```

7. **Clique em "Pagar"**

8. **Você será redirecionado para:**
   ```
   http://localhost:5173/checkout/success
   ```

---

## 🎊 Pronto! Funcionou!

Se você chegou na página de sucesso, **tudo está funcionando perfeitamente!**

---

## 🔍 Como Ver o Pagamento no Stripe

1. **Dashboard Stripe:**
   ```
   https://dashboard.stripe.com/test/payments
   ```

2. **Você verá o pagamento listado com:**
   - Status: Succeeded
   - Valor: R$ 247, R$ 580, R$ 1.247 ou R$ 2.997
   - Email: teste@example.com

---

## 🐛 Troubleshooting

### **Backend não inicia?**

```bash
# Verificar se porta 3001 está ocupada
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>

# Verificar .env
cat .env | grep STRIPE_SECRET_KEY
```

### **Frontend não inicia?**

```bash
# Verificar se porta 5173 está ocupada
lsof -i :5173

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **CORS Error?**

```bash
# Verificar CORS_ORIGIN no backend
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"
echo "CORS_ORIGIN=http://localhost:5173" >> .env

# Reiniciar backend
```

### **"Cannot POST /api/payments/intent"?**

Verifique se o backend está rodando:
```bash
curl http://localhost:3001/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

---

## 🎯 Teste Avançado (com Webhooks)

Se quiser testar webhooks também:

### **Terminal 3: Webhook**

```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

# Opção 1: Script automático
./setup-webhook.sh

# Opção 2: Manualmente
stripe login
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe
```

**Copie o webhook secret que aparecer e atualize o .env:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Reinicie o backend (Terminal 1)** depois de atualizar o webhook secret.

---

## 📊 Verificar no Banco de Dados

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Ver pedidos
SELECT id, user_email, plan, amount, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

# Sair
\q
```

---

## 🎨 Outros Cartões de Teste

| Cenário | Número | Resultado |
|---------|--------|-----------|
| ✅ Sucesso | 4242 4242 4242 4242 | Aprovado |
| ❌ Recusado | 4000 0000 0000 0002 | Negado |
| 🔐 3D Secure | 4000 0025 0000 3155 | Autenticação |
| 💳 Mastercard | 5555 5555 5555 4444 | Aprovado |

**Mais:** https://stripe.com/docs/testing

---

## ✅ Checklist de Teste

- [ ] Backend iniciado (Terminal 1)
- [ ] Frontend iniciado (Terminal 2)
- [ ] Site aberto no navegador
- [ ] Clicou em um plano
- [ ] Informou email
- [ ] Redirecionado para Stripe
- [ ] Usou cartão 4242 4242 4242 4242
- [ ] Pagamento aprovado
- [ ] Redirecionado para página de sucesso
- [ ] Viu pagamento no dashboard Stripe

---

## 🎉 Próximos Passos

Depois de testar:

1. **Ler documentação completa:**
   - `INTEGRACAO_STRIPE_GUIA.md`
   - `VALIDACAO_STRIPE_COMPLETA.md`

2. **Configurar para produção:**
   - Obter credenciais LIVE
   - Configurar webhook produção
   - Deploy no servidor

3. **Implementar melhorias:**
   - Modal de checkout personalizado
   - Analytics
   - Cupons de desconto

---

## 🆘 Precisa de Ajuda?

**Documentação:**
- `INTEGRACAO_STRIPE_GUIA.md` - Guia completo
- `QUICK_START_STRIPE.md` - Setup rápido
- `VALIDACAO_STRIPE_COMPLETA.md` - Validação

**Stripe:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Testing: https://stripe.com/docs/testing

---

**Criado em:** 04/11/2025
**Tempo para testar:** ~3 minutos
**Dificuldade:** 🟢 Fácil

**Boa sorte! 🚀**
