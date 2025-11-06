# 🧪 Guia de Teste Visual - Integração de Pagamento

**Data:** 05/11/2025
**Versão:** v128-integration
**Objetivo:** Testar visualmente o fluxo completo de pagamento integrado

---

## 🎯 O QUE VOCÊ VAI TESTAR

Quando um cliente faz um pagamento no Stripe, o sistema automaticamente:

1. ✅ Cria o usuário no sistema principal
2. ✅ Define a role como OWNER
3. ✅ Registra o pedido no banco de dados
4. ✅ Envia email de boas-vindas com link para definir senha
5. ✅ Cliente pode acessar o sistema em https://one.nexusatemporal.com.br/

---

## 📝 MÉTODO 1: Teste Manual com Cartão de Teste

### Passo 1: Criar Sessão de Checkout

Execute este comando no servidor para criar uma URL de pagamento de teste:

```bash
# Variáveis
EMAIL_TESTE="teste-visual-$(date +%s)@example.com"
NOME_TESTE="Teste Visual"

# Criar sessão (se o backend do site estiver rodando)
curl -X POST http://localhost:3001/api/payments/create-session \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "essencial",
    "userEmail": "'"$EMAIL_TESTE"'",
    "userName": "'"$NOME_TESTE"'",
    "successUrl": "https://one.nexusatemporal.com.br/success",
    "cancelUrl": "https://one.nexusatemporal.com.br/cancel"
  }'
```

**Resposta esperada:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### Passo 2: Acessar URL de Pagamento

1. Copie a URL retornada no campo `url`
2. Abra em seu navegador
3. Você verá a página de checkout do Stripe

### Passo 3: Preencher Dados de Teste

Use estes dados de teste do Stripe:

**Dados do Cartão:**
- **Número:** `4242 4242 4242 4242`
- **Data:** `12/34` (qualquer data futura)
- **CVV:** `123` (qualquer 3 dígitos)
- **Nome:** Seu nome de teste
- **Email:** O email que você usou acima
- **CEP:** `12345-678`

### Passo 4: Completar Pagamento

Clique em **"Pagar"** ou **"Pay"**

### Passo 5: Aguardar Processamento

O Stripe processará o pagamento e:
- Redirecionará para a URL de sucesso
- Enviará webhook para o backend do site
- O backend do site chamará o sistema principal

### Passo 6: Verificar Criação do Usuário

Execute no servidor:

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
  -c "SELECT id, email, name, role, status FROM users ORDER BY \"createdAt\" DESC LIMIT 5;"
```

Você deve ver o usuário criado com:
- **Email:** O email usado no teste
- **Role:** `owner`
- **Status:** `active`

### Passo 7: Verificar Pedido

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
  -c "SELECT id, user_email, plan, amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;"
```

Deve mostrar o pedido com:
- **Plan:** `essencial`
- **Amount:** `24700` (R$ 247,00 em centavos)
- **Status:** `paid`

### Passo 8: Verificar Email (Se SMTP Estiver Configurado)

Verifique a caixa de entrada do email usado. Você deve receber:

**Assunto:** "Bem-vindo ao Nexus Atemporal - Defina sua Senha"

**Conteúdo:**
- Link para definir senha (válido por 7 dias)
- Informações do plano contratado
- Instruções de acesso

---

## 🚀 MÉTODO 2: Teste Rápido com Stripe CLI

Se você tem o Stripe CLI instalado, pode simular um pagamento instantaneamente:

### Passo 1: Disparar Evento de Teste

```bash
cd "/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api"

stripe trigger checkout.session.completed \
  --api-key sk_test_51SJIavKWR76PRrCODB8m6Sl7472AyasUv7Whhar7pSPFvbqeFWUD3uR7Zw1s7AAQ7d17jkx46PsDG3YGIYAlxNsw001Uomfv1w
```

### Passo 2: Verificar Logs

**Backend do Site:**
```bash
tail -50 /tmp/backend-with-webhook.log | grep "Stripe Webhook"
```

Você deve ver:
```
[Stripe Webhook] Calling main system API...
[Stripe Webhook] Main system API response: { success: true, userId: '...' }
```

**Backend Principal:**
```bash
docker service logs nexus_backend --tail 20 | grep "External API"
```

Você deve ver:
```
[External API] Creating user from payment...
[External API] User created successfully
```

### Passo 3: Verificar Banco de Dados

Mesmos comandos do Método 1 - Passos 6 e 7

---

## 🔍 MÉTODO 3: Teste Direto via API (Mais Rápido)

Execute este comando para testar diretamente o endpoint de criação de usuário:

```bash
curl -X POST https://api.nexusatemporal.com.br/api/users/external/create-from-payment \
  -H "Authorization: Bearer a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-direto-'$(date +%s)'@example.com",
    "name": "Teste Direto API",
    "planId": "essencial",
    "stripeSessionId": "cs_test_manual_'$(date +%s)'",
    "amount": 24700
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Usuário criado e assinatura ativada com sucesso",
  "data": {
    "userId": "uuid-do-usuario",
    "tenantId": null,
    "email": "teste-direto-...",
    "isNewUser": true
  }
}
```

Depois verifique o banco de dados conforme Passos 6 e 7 do Método 1.

---

## 🎨 TESTE VISUAL NO FRONTEND

### Após Criar o Usuário:

1. **Acesse:** https://one.nexusatemporal.com.br/

2. **Faça login:**
   - Email: O email usado no teste
   - Senha: Você precisará primeiro definir a senha usando o link do email

3. **Se não recebeu email, crie a senha manualmente:**

```bash
# Obter o token de reset
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \
  -c "SELECT email, \"passwordResetToken\" FROM users WHERE email = 'SEU_EMAIL_DE_TESTE';"

# Use o token para acessar:
# https://one.nexusatemporal.com.br/reset-password?token=TOKEN_AQUI
```

4. **Defina a senha** e faça login

5. **Verifique no sistema:**
   - Você deve estar logado como usuário OWNER
   - Deve ter acesso completo ao sistema
   - Deve ver o plano "Essencial" ativo

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após executar os testes, verifique:

- [ ] Sessão de checkout criada com sucesso
- [ ] Pagamento processado (ou evento simulado)
- [ ] Webhook recebido pelo backend do site
- [ ] Log mostra chamada à API do sistema principal
- [ ] Usuário criado no banco de dados com role OWNER
- [ ] Pedido registrado na tabela orders com status 'paid'
- [ ] Email enviado (se SMTP configurado)
- [ ] Link de senha válido por 7 dias
- [ ] Possível fazer login em https://one.nexusatemporal.com.br/
- [ ] Sistema mostra plano ativo

---

## 📊 MONITORAMENTO EM TEMPO REAL

### Ver logs em tempo real enquanto testa:

**Terminal 1 - Backend do Site:**
```bash
tail -f /tmp/backend-with-webhook.log
```

**Terminal 2 - Backend Principal:**
```bash
docker service logs -f nexus_backend
```

**Terminal 3 - Stripe Webhook:**
```bash
tail -f /tmp/stripe-webhook.log
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Usuário não foi criado

**Solução 1:** Verificar logs do backend do site
```bash
tail -100 /tmp/backend-with-webhook.log | grep -i error
```

**Solução 2:** Verificar logs do sistema principal
```bash
docker service logs nexus_backend --tail 100 | grep -i "external api"
```

### Problema: Email não foi enviado

**Solução:** Verificar configuração SMTP
```bash
docker exec $(docker ps | grep nexus_backend | awk '{print $1}') env | grep SMTP
```

### Problema: Pagamento duplicado

Se você testar com o mesmo `stripeSessionId`, o sistema irá detectar e retornar:
```json
{
  "success": true,
  "message": "Pagamento já processado anteriormente",
  "alreadyProcessed": true
}
```

Isso é o comportamento esperado - proteção contra duplicação.

---

## 🎯 PRÓXIMOS PASSOS

Após validar que tudo está funcionando:

1. Configure o webhook do Stripe em produção:
   - Acesse: https://dashboard.stripe.com/webhooks
   - Adicione endpoint: `https://site-api.nexusatemporal.com/api/payments/webhook/stripe`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`

2. Atualize as chaves do Stripe para produção (quando estiver pronto)

3. Teste com pagamento real em pequeno valor

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs conforme seção de Monitoramento
2. Execute os comandos de verificação do banco de dados
3. Consulte o arquivo `DEPLOY_INTEGRACAO_COMPLETO.md` para mais detalhes

---

**Versão:** v128-integration
**Data:** 05/11/2025
**Status:** ✅ Pronto para Teste
