# 🚀 PagBank - Guia Rápido de Início

## ⚡ Setup em 5 Minutos

### 1️⃣ Obter Credenciais (2 min)

1. Acesse: https://dev.pagseguro.uol.com.br/
2. Faça login ou crie uma conta
3. Gere um **Token de API Sandbox**
4. Copie o token gerado

---

### 2️⃣ Configurar Ambiente (1 min)

```bash
cd backend

# Copiar arquivo de configuração
cp .env.pagbank.example .env.pagbank

# Editar e adicionar suas credenciais
nano .env.pagbank
```

**Preencha:**
```env
PAGBANK_SANDBOX_TOKEN=seu-token-aqui
PAGBANK_DEVELOPER_EMAIL=seu-email@example.com
```

---

### 3️⃣ Executar Setup (1 min)

```bash
# Executar configuração automática
npm run setup:pagbank-test
```

Será solicitado:
- ✅ Email do desenvolvedor
- ✅ Token da API
- ✅ Webhook Secret (opcional)

---

### 4️⃣ Validar Integração (1 min)

```bash
# Executar testes automatizados
npm run test:pagbank
```

**Resultado esperado:**
```
=== RESUMO DOS TESTES ===

Total de testes: 6
✅ Passou: 6
❌ Falhou: 0
Taxa de sucesso: 100.0%
```

---

## 🧪 Testes Via API

### Iniciar servidor

```bash
npm run dev
```

### Testar conexão

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

### Criar pagamento PIX de teste

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank/pix \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "description": "Teste de pagamento PIX"
  }'
```

### Executar bateria completa

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank/full \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📋 Endpoints Disponíveis

### Configuração

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment-gateway/config` | Salvar configuração |
| GET | `/api/payment-gateway/config` | Listar configurações |
| GET | `/api/payment-gateway/config/:gateway/:environment` | Obter configuração |
| DELETE | `/api/payment-gateway/config/:gateway/:environment` | Deletar configuração |

### Testes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment-gateway/test/pagbank` | Testar conexão |
| POST | `/api/payment-gateway/test/pagbank/full` | Bateria completa |
| POST | `/api/payment-gateway/test/pagbank/pix` | Criar PIX teste |
| GET | `/api/payment-gateway/test/pagbank/orders` | Listar pedidos teste |

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment-gateway/customers` | Criar/sincronizar cliente |
| GET | `/api/payment-gateway/customers/lead/:leadId` | Obter por lead |

### Cobranças

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment-gateway/charges` | Criar cobrança |
| GET | `/api/payment-gateway/charges/:gateway` | Listar cobranças |
| GET | `/api/payment-gateway/charges/:gateway/:chargeId` | Obter cobrança |
| GET | `/api/payment-gateway/charges/:gateway/:chargeId/pix` | Obter QR Code PIX |
| POST | `/api/payment-gateway/charges/:gateway/:chargeId/refund` | Estornar |

### Webhooks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment-gateway/webhooks/pagbank` | Receber webhook (público) |
| GET | `/api/payment-gateway/webhooks/logs` | Listar logs |
| POST | `/api/payment-gateway/webhooks/:id/retry` | Reprocessar |

---

## 📊 Dados de Teste

### Cartões de Crédito

| Bandeira | Número | CVV | Resultado |
|----------|--------|-----|-----------|
| Visa | 4111111111111111 | 123 | ✅ Aprovado |
| Mastercard | 5555555555554444 | 123 | ✅ Aprovado |
| Visa | 4000000000000002 | 123 | ❌ Recusado |

### Outros Dados

- **CPF:** 123.456.789-09
- **Telefone:** (11) 99999-9999
- **CEP:** 01310-100

### Valores (em centavos)

- R$ 10,00 = `1000`
- R$ 50,00 = `5000`
- R$ 100,00 = `10000`

---

## 🔧 Troubleshooting Rápido

### ❌ "Configuration not found"

```bash
# Executar setup novamente
npm run setup:pagbank-test
```

### ❌ "Unauthorized"

1. Verificar token em `.env.pagbank`
2. Gerar novo token no painel PagBank
3. Executar setup novamente

### ❌ "Connection timeout"

Verificar:
- [ ] Conexão com internet
- [ ] Firewall/Proxy bloqueando
- [ ] URL da API correta

---

## 📚 Documentação Completa

Acesse a documentação completa em:

```
backend/docs/PAGBANK_TESTING.md
```

---

## 🎯 Checklist de Validação

- [ ] ✅ Credenciais configuradas
- [ ] ✅ Setup executado com sucesso
- [ ] ✅ Teste de conexão passou
- [ ] ✅ Cliente criado com sucesso
- [ ] ✅ Pedido PIX criado
- [ ] ✅ QR Code PIX gerado
- [ ] ✅ Checkout criado
- [ ] ✅ Testes automatizados passaram 100%

---

## 🆘 Suporte

**Documentação PagBank:**
- https://developer.pagbank.com.br/

**Arquivos do Projeto:**
- Serviço: `backend/src/modules/payment-gateway/pagbank.service.ts`
- Controller: `backend/src/modules/payment-gateway/payment-gateway.controller.ts`
- Testes: `backend/scripts/test-pagbank-integration.ts`

---

**Pronto! 🎉**

Você agora tem um ambiente de testes completo para validar a integração PagBank.

**Próximos passos:**
1. Integrar com o frontend
2. Implementar fluxo de pagamento completo
3. Configurar webhooks
4. Migrar para produção

---

**Última atualização:** 04/11/2025
