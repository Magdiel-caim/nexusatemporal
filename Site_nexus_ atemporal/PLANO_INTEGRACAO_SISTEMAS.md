# 🔗 Plano de Integração entre Sistemas

**Data:** 05/11/2025
**Objetivo:** Integrar Site de Checkout com Sistema Principal

---

## 📊 SITUAÇÃO ATUAL

### Sistema 1: Site de Checkout (Novo)
**Localização:** `/root/nexusatemporalv1/Site_nexus_ atemporal/`
- ✅ Frontend React com páginas de planos
- ✅ Backend Node.js com API de pagamentos
- ✅ Integração Stripe 100% funcional
- ✅ Webhook configurado
- ✅ Banco de dados: tabela `orders`

**Endpoints disponíveis:**
- `POST /api/payments/intent` - Criar sessão de checkout
- `POST /api/payments/webhook/stripe` - Receber eventos Stripe

### Sistema 2: Sistema Principal (Em produção)
**Localização:** `/root/nexusatemporalv1/` (backend e frontend)
- ✅ CRM completo com múltiplos módulos
- ✅ Backend com módulo `payment-gateway` completo
- ✅ Suporte a Asaas e PagBank
- ✅ Sistema de usuários e autenticação
- ✅ Em produção: https://nexusatemporal.com

**Módulos identificados:**
- `payment-gateway/` - Gerenciamento de pagamentos
- `users/` - Gerenciamento de usuários
- `auth/` - Autenticação

---

## 🎯 ESTRATÉGIAS DE INTEGRAÇÃO

### OPÇÃO 1: Webhook do Site → Sistema Principal (Recomendado)

**Fluxo:**
```
1. Cliente acessa site de checkout
2. Seleciona plano e paga
3. Stripe envia webhook para Site Backend
4. Site Backend processa pagamento
5. Site Backend chama API do Sistema Principal
6. Sistema Principal cria usuário/ativa assinatura
7. Sistema Principal envia email de boas-vindas
```

**Vantagens:**
- ✅ Sistemas desacoplados
- ✅ Site de checkout independente
- ✅ Fácil manutenção
- ✅ Sistema principal recebe dados prontos

**Arquitetura:**
```
┌─────────────────┐
│  Site Checkout  │
│   (Port 5173)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Webhook       ┌──────────────────┐
│  Site Backend   │─────────────────────▶│ Sistema Principal│
│   (Port 3001)   │   POST /api/users   │   (Port 3000)    │
└────────┬────────┘                      └────────┬─────────┘
         │                                        │
         ▼                                        ▼
  ┌──────────────┐                        ┌──────────────┐
  │ Orders Table │                        │ Users Table  │
  └──────────────┘                        └──────────────┘
```

---

### OPÇÃO 2: Sistema Principal Aponta para Site de Checkout

**Fluxo:**
```
1. Cliente acessa Sistema Principal
2. Clica em "Assinar" ou "Upgrade"
3. É redirecionado para Site de Checkout
4. Completa pagamento
5. Retorna ao Sistema Principal
```

**Vantagens:**
- ✅ Reutiliza Site de Checkout pronto
- ✅ Checkout isolado e otimizado
- ✅ Fácil de implementar

**Desvantagens:**
- ⚠️ Usuário sai do sistema principal
- ⚠️ Precisa de URL de retorno

---

## 🛠️ IMPLEMENTAÇÃO RECOMENDADA (Opção 1)

### PASSO 1: Criar Endpoint no Sistema Principal

**Arquivo:** `/root/nexusatemporalv1/backend/src/modules/users/users.controller.ts`

```typescript
@Post('/external/create-from-payment')
async createUserFromPayment(@Body() data: {
  email: string;
  name: string;
  planId: string;
  stripeSessionId: string;
  amount: number;
}) {
  // 1. Verificar se usuário já existe
  // 2. Criar usuário se não existir
  // 3. Criar tenant/assinatura
  // 4. Enviar email de boas-vindas
  // 5. Retornar credenciais de acesso
}
```

### PASSO 2: Adicionar Chamada no Site Backend

**Arquivo:** `/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api/src/modules/payments/stripe.ts`

Adicionar no webhook handler:

```typescript
export async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Atualizar order no banco local
    await updateOrder(session.id, 'paid');

    // **NOVO:** Chamar Sistema Principal
    await axios.post(`${process.env.ONE_NEXUS_API_URL}/users/external/create-from-payment`, {
      email: session.customer_email,
      name: session.customer_details?.name,
      planId: session.metadata?.planId,
      stripeSessionId: session.id,
      amount: session.amount_total,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ONE_NEXUS_API_KEY}`
      }
    });
  }
}
```

### PASSO 3: Configurar Variáveis de Ambiente

**Arquivo:** `.env` do Site Backend

```env
# Já existe:
ONE_NEXUS_API_URL=https://one.nexusatemporal.com.br/api
ONE_NEXUS_API_KEY=
```

**Ação necessária:**
- Gerar API Key no Sistema Principal
- Adicionar no `.env` do Site Backend

### PASSO 4: Proteger Endpoint com API Key

**Arquivo:** Sistema Principal

```typescript
// Middleware de autenticação para chamadas externas
export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (apiKey !== process.env.EXTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Aplicar no endpoint:
router.post('/users/external/create-from-payment', apiKeyAuth, createUserFromPayment);
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### No Sistema Principal (Backend):
- [ ] Criar endpoint `/api/users/external/create-from-payment`
- [ ] Implementar lógica de criação de usuário
- [ ] Implementar lógica de criação de tenant
- [ ] Implementar lógica de ativação de assinatura
- [ ] Gerar API Key para chamadas externas
- [ ] Adicionar middleware de autenticação
- [ ] Implementar envio de email de boas-vindas
- [ ] Testar endpoint manualmente

### No Site Backend:
- [ ] Instalar axios: `npm install axios`
- [ ] Adicionar chamada para Sistema Principal no webhook
- [ ] Adicionar tratamento de erros
- [ ] Adicionar retry logic
- [ ] Adicionar logging
- [ ] Configurar ONE_NEXUS_API_KEY no `.env`
- [ ] Testar integração end-to-end

### Testes:
- [ ] Teste 1: Criar pedido no Site de Checkout
- [ ] Teste 2: Verificar webhook recebido
- [ ] Teste 3: Verificar usuário criado no Sistema Principal
- [ ] Teste 4: Verificar email de boas-vindas enviado
- [ ] Teste 5: Verificar usuário consegue fazer login
- [ ] Teste 6: Verificar assinatura ativa no sistema

---

## 🔐 SEGURANÇA

### API Key Management:
1. Gerar key forte: `openssl rand -hex 32`
2. Armazenar em variável de ambiente
3. NUNCA commitar no git
4. Rotacionar periodicamente

### Validação de Dados:
- ✅ Validar email
- ✅ Validar formato de dados
- ✅ Sanitizar inputs
- ✅ Verificar duplicatas

### Logs e Auditoria:
- ✅ Logar todas chamadas
- ✅ Logar sucessos e falhas
- ✅ Incluir timestamp e IP
- ✅ Monitorar taxa de erros

---

## 🚨 TRATAMENTO DE ERROS

### Cenários a considerar:

**1. Sistema Principal offline:**
```typescript
try {
  await callSystemAPI(data);
} catch (error) {
  // Salvar na fila de retry
  await saveToRetryQueue(data);
  // Notificar admin
  await notifyAdmin('Sistema Principal offline', error);
}
```

**2. Usuário já existe:**
```typescript
// No Sistema Principal:
const existingUser = await findUserByEmail(email);
if (existingUser) {
  // Atualizar assinatura ao invés de criar usuário
  await updateSubscription(existingUser.id, planId);
  return existingUser;
}
```

**3. Pagamento duplicado:**
```typescript
// Verificar se session_id já foi processada
const processed = await checkIfProcessed(stripeSessionId);
if (processed) {
  return { success: true, message: 'Already processed' };
}
```

---

## 📊 MONITORAMENTO

### Métricas a acompanhar:
- Taxa de sucesso de criação de usuários
- Tempo de resposta da API
- Taxa de retry
- Erros por tipo

### Alertas a configurar:
- ⚠️ Taxa de erro > 5%
- ⚠️ Tempo de resposta > 5s
- ⚠️ Sistema Principal offline > 5min

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Fase 1: Desenvolvimento (2-3 horas)
1. Criar endpoint no Sistema Principal
2. Adicionar chamada no Site Backend
3. Configurar API Key
4. Testes unitários

### Fase 2: Testes (1 hora)
1. Teste end-to-end completo
2. Teste de falha (Sistema Principal offline)
3. Teste de usuário duplicado
4. Teste de pagamento duplicado

### Fase 3: Deploy (30 min)
1. Deploy do Sistema Principal
2. Atualizar variáveis de ambiente
3. Testar em produção
4. Monitorar por 24h

---

## 📞 SUPORTE E DOCUMENTAÇÃO

### Endpoints importantes:

**Site Backend:**
- POST `/api/payments/intent` - Criar checkout
- POST `/api/payments/webhook/stripe` - Webhook Stripe

**Sistema Principal:**
- POST `/api/users/external/create-from-payment` - Criar usuário (a criar)
- GET `/api/users/:id` - Buscar usuário
- POST `/api/auth/login` - Login

### Logs importantes:
- `/var/log/nexus-site/webhook.log`
- `/var/log/nexus-system/api.log`

---

## ✅ CONCLUSÃO

**Estratégia recomendada:** Opção 1 (Webhook)

**Razões:**
- ✅ Desacoplamento entre sistemas
- ✅ Site de checkout independente
- ✅ Fácil manutenção
- ✅ Escalável

**Tempo estimado:** 3-4 horas para implementação completa

**Próximo passo:** Implementar endpoint no Sistema Principal

---

**Criado em:** 05/11/2025
**Status:** Aguardando aprovação

© 2025 Nexus Atemporal. Todos os direitos reservados.
