# Guia de Configuração do Stripe - Nexus Atemporal

## 📋 Passo 1: Criar Conta no Stripe

1. Acesse https://stripe.com
2. Clique em "Sign up" ou "Criar conta"
3. Preencha os dados da empresa (Nexus Atemporal)
4. Ative o modo de teste para desenvolvimento

## 🔑 Passo 2: Obter Chaves de API

1. Acesse o Dashboard do Stripe: https://dashboard.stripe.com
2. Vá em **Developers** → **API keys**
3. Você verá duas chaves:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)
4. Copie essas chaves e adicione no arquivo `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_AQUI
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
```

## 📦 Passo 3: Criar Produtos no Stripe

### 3.1 Acessar Catálogo de Produtos

1. No Dashboard do Stripe, vá em **Product catalog** → **Products**
2. Clique em **+ Add product**

### 3.2 Criar Produto: Essencial

1. **Product name**: Nexus Atemporal - Essencial
2. **Description**: Plano Essencial para clínicas iniciantes
3. Em **Pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: 297.00 BRL
   - **Billing period**: Monthly
   - Marque a opção **Recurring**
4. Clique em **Save product**
5. **COPIE O PRICE ID** (começa com `price_`) e adicione no `.env.local`:
   ```
   STRIPE_PRICE_ESSENCIAL_MONTHLY=price_ID_AQUI
   ```

6. Crie outro preço para o plano anual:
   - Clique em **Add another price** no mesmo produto
   - **Price**: 2970.00 BRL
   - **Billing period**: Yearly
   - Salve e copie o Price ID:
   ```
   STRIPE_PRICE_ESSENCIAL_YEARLY=price_ID_AQUI
   ```

### 3.3 Criar Produto: Profissional

1. **Product name**: Nexus Atemporal - Profissional
2. **Description**: Plano Profissional para clínicas em crescimento
3. **Price mensal**: 697.00 BRL
4. **Price anual**: 6970.00 BRL
5. Copie os Price IDs:
   ```
   STRIPE_PRICE_PROFISSIONAL_MONTHLY=price_ID_AQUI
   STRIPE_PRICE_PROFISSIONAL_YEARLY=price_ID_AQUI
   ```

### 3.4 Criar Produto: Empresarial

1. **Product name**: Nexus Atemporal - Empresarial
2. **Description**: Plano Empresarial para clínicas estabelecidas
3. **Price mensal**: 1497.00 BRL
4. **Price anual**: 14970.00 BRL
5. Copie os Price IDs:
   ```
   STRIPE_PRICE_EMPRESARIAL_MONTHLY=price_ID_AQUI
   STRIPE_PRICE_EMPRESARIAL_YEARLY=price_ID_AQUI
   ```

### 3.5 Criar Produto: Enterprise

1. **Product name**: Nexus Atemporal - Enterprise
2. **Description**: Plano Enterprise para redes de clínicas
3. **Price mensal**: 2997.00 BRL (apenas mensal)
4. Copie o Price ID:
   ```
   STRIPE_PRICE_ENTERPRISE_MONTHLY=price_ID_AQUI
   ```

## 🎁 Passo 4: Configurar Trial Period

O trial period de 10 dias já está configurado automaticamente no código (`trial_period_days: 10`).
Isso significa que o cliente terá 10 dias grátis antes de ser cobrado.

## 🔔 Passo 5: Configurar Webhooks

1. No Dashboard do Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. **Endpoint URL**: Adicione a URL do seu site + `/api/webhook`
   - Exemplo desenvolvimento: `http://localhost:3000/api/webhook`
   - Exemplo produção: `https://site.nexusatemporal.com.br/api/webhook`
4. **Events to send**: Selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Clique em **Add endpoint**
6. **COPIE O WEBHOOK SECRET** (começa com `whsec_`) e adicione no `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_SEU_SECRET_AQUI
   ```

## 🌐 Passo 6: Atualizar URL do Site

No arquivo `.env.local`, atualize a URL do site:

```bash
# Para desenvolvimento
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Para produção
NEXT_PUBLIC_SITE_URL=https://site.nexusatemporal.com.br
```

## ✅ Passo 7: Testar a Integração

### 7.1 Iniciar o servidor de desenvolvimento

```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/website"
npm run dev
```

### 7.2 Acessar o site

Abra o navegador em: http://localhost:3000

### 7.3 Testar o fluxo de checkout

1. Vá na página de planos
2. Clique em um dos botões (Trial Gratuito ou Comprar Agora)
3. Preencha o formulário com dados de teste
4. No último passo, clique em "Ir para Pagamento"
5. Você será redirecionado para a página de checkout do Stripe
6. Use os cartões de teste do Stripe:
   - **Sucesso**: `4242 4242 4242 4242`
   - **Falha**: `4000 0000 0000 0002`
   - **Requer autenticação**: `4000 0027 6000 3184`
   - **Data de expiração**: Qualquer data futura
   - **CVC**: Qualquer 3 dígitos
   - **CEP**: Qualquer CEP

### 7.4 Verificar no Dashboard

Após o teste, verifique:
1. **Customers**: Novo cliente criado
2. **Subscriptions**: Nova assinatura criada
3. **Events**: Eventos de webhook recebidos

## 🚀 Passo 8: Ir para Produção

Quando estiver pronto para produção:

1. No Dashboard do Stripe, ative o modo **Production**
2. Obtenha as chaves de API de produção (começam com `pk_live_` e `sk_live_`)
3. Atualize as variáveis de ambiente no servidor de produção
4. Reconfigure os webhooks com a URL de produção
5. Teste novamente com cartões reais

## 📄 Arquivo .env.local Completo

```bash
# Stripe Keys (TESTE - substitua pelas suas)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe Product IDs
STRIPE_PRICE_ESSENCIAL_MONTHLY=price_ID_AQUI
STRIPE_PRICE_ESSENCIAL_YEARLY=price_ID_AQUI
STRIPE_PRICE_PROFISSIONAL_MONTHLY=price_ID_AQUI
STRIPE_PRICE_PROFISSIONAL_YEARLY=price_ID_AQUI
STRIPE_PRICE_EMPRESARIAL_MONTHLY=price_ID_AQUI
STRIPE_PRICE_EMPRESARIAL_YEARLY=price_ID_AQUI
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_ID_AQUI
```

## 🔧 Próximos Passos (Opcional)

1. **Integrar com banco de dados**: Salvar dados do cliente no PostgreSQL
2. **Enviar emails de boas-vindas**: Usar Zoho Mail ou SendGrid
3. **Provisionar acesso ao sistema**: Criar conta automaticamente no CRM
4. **Dashboard de assinaturas**: Área do cliente para gerenciar assinatura
5. **Cupons e promoções**: Configurar cupons de desconto no Stripe

## 📚 Documentação Útil

- **Stripe Docs**: https://stripe.com/docs
- **Testing Cards**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks
- **Subscriptions**: https://stripe.com/docs/billing/subscriptions/overview

---

✅ **Integração Stripe configurada e pronta para uso!**
