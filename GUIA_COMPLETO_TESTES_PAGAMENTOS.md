# 🧪 GUIA COMPLETO DE TESTES - PAGAMENTOS ASAAS

**Data:** 2025-11-07
**Status:** ✅ Asaas Configurado e Funcionando

═══════════════════════════════════════════════════════════════════════════

## 🎯 O QUE VAMOS TESTAR

1. ✅ Criar um cliente (customer)
2. ✅ Criar uma cobrança (PIX, Boleto, Cartão)
3. ✅ Simular pagamento no sandbox
4. ✅ Verificar webhook sendo recebido
5. ✅ Verificar sincronização no banco de dados
6. ✅ Verificar eventos do sistema

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 1: CRIAR UM CLIENTE (CUSTOMER)

### Via API direta:

```bash
POST https://api.nexusatemporal.com.br/api/payment-gateway/asaas/customers

Headers:
  Authorization: Bearer SEU_TOKEN_JWT
  Content-Type: application/json

Body:
{
  "name": "João da Silva",
  "email": "joao.teste@example.com",
  "cpfCnpj": "12345678901",
  "phone": "11987654321",
  "mobilePhone": "11987654321",
  "address": "Rua Teste",
  "addressNumber": "123",
  "province": "Centro",
  "postalCode": "01234567",
  "externalReference": "LEAD-001"
}
```

### Ou via Postman/Insomnia:

1. Crie uma requisição POST
2. URL: `https://api.nexusatemporal.com.br/api/payment-gateway/asaas/customers`
3. Headers: Authorization com seu JWT token
4. Body: JSON acima

### ✅ Resultado Esperado:

```json
{
  "id": "cus_123456789",
  "name": "João da Silva",
  "email": "joao.teste@example.com",
  ...
}
```

Anote o `id` do cliente (ex: `cus_123456789`) para usar no próximo teste!

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 2: CRIAR COBRANÇA PIX

### Via API:

```bash
POST https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges

Headers:
  Authorization: Bearer SEU_TOKEN_JWT
  Content-Type: application/json

Body:
{
  "customer": "cus_123456789",  ← Use o ID do teste anterior
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2025-11-15",
  "description": "Teste de cobrança PIX",
  "externalReference": "TESTE-PIX-001"
}
```

### ✅ Resultado Esperado:

```json
{
  "id": "pay_123456789",
  "customer": "cus_123456789",
  "billingType": "PIX",
  "value": 50.00,
  "status": "PENDING",
  "invoiceUrl": "https://...",
  "pixQrCode": "00020126...",  ← QR Code para pagamento
  "pixCopyPaste": "00020126..."  ← Código Pix Copia e Cola
}
```

Guarde o `id` da cobrança (ex: `pay_123456789`)!

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 3: SIMULAR PAGAMENTO NO SANDBOX ASAAS

### Opção A: Via Painel do Asaas

1. Acesse: https://sandbox.asaas.com/
2. Menu: **Cobranças**
3. Encontre a cobrança que você criou
4. Clique em **"Ações"** → **"Confirmar Pagamento"**
5. Clique em **"Confirmar"**

### Opção B: Via API do Asaas (Simulação)

```bash
POST https://sandbox.asaas.com/api/v3/payments/{paymentId}/receiveInCash

Headers:
  access_token: SUA_API_KEY_ASAAS
  Content-Type: application/json

Body:
{
  "paymentDate": "2025-11-07",
  "value": 50.00,
  "notifyCustomer": false
}
```

### ✅ Resultado Esperado:

1. Status da cobrança muda para `RECEIVED` ou `CONFIRMED`
2. Webhook é disparado automaticamente
3. Nosso sistema recebe e processa o webhook

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 4: VERIFICAR WEBHOOK RECEBIDO

### Via Banco de Dados:

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT
  id,
  gateway,
  event,
  status,
  \"createdAt\"
FROM payment_webhooks
WHERE gateway = 'asaas'
ORDER BY \"createdAt\" DESC
LIMIT 5;
"
```

### ✅ Resultado Esperado:

```
id         | gateway | event               | status    | createdAt
-----------|---------|---------------------|-----------|-------------------
abc123...  | asaas   | PAYMENT_RECEIVED    | processed | 2025-11-07 15:30
abc124...  | asaas   | PAYMENT_CONFIRMED   | processed | 2025-11-07 15:30
```

### Via Logs do Backend:

```bash
docker service logs nexus_backend -f | grep -i "asaas\|webhook"
```

### ✅ Resultado Esperado:

```
Asaas webhook received: { event: 'PAYMENT_RECEIVED', payment: { id: 'pay_123...' } }
Webhook abc123 processed successfully for payment pay_123456789
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 5: VERIFICAR DADOS SINCRONIZADOS

### Verificar Cobrança Salva:

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT
  id,
  gateway,
  \"gatewayChargeId\",
  \"billingType\",
  value,
  status,
  \"paymentDate\",
  \"webhookReceived\"
FROM payment_charges
WHERE gateway = 'asaas'
ORDER BY \"createdAt\" DESC
LIMIT 3;
"
```

### ✅ Resultado Esperado:

```
id     | gateway | gatewayChargeId | billingType | value | status   | paymentDate | webhookReceived
-------|---------|-----------------|-------------|-------|----------|-------------|----------------
xyz... | asaas   | pay_123456789   | PIX         | 50.00 | RECEIVED | 2025-11-07  | t
```

### Verificar Cliente Salvo:

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT
  id,
  gateway,
  name,
  email,
  \"gatewayCustomerId\"
FROM payment_customers
WHERE gateway = 'asaas'
ORDER BY \"createdAt\" DESC
LIMIT 3;
"
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 6: CRIAR COBRANÇA DE BOLETO

```bash
POST https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges

Body:
{
  "customer": "cus_123456789",
  "billingType": "BOLETO",
  "value": 100.00,
  "dueDate": "2025-11-20",
  "description": "Teste de Boleto Bancário"
}
```

### ✅ Resultado:

```json
{
  "id": "pay_987654321",
  "billingType": "BOLETO",
  "bankSlipUrl": "https://www.asaas.com/b/...",  ← Link do boleto
  "invoiceUrl": "https://...",
  "status": "PENDING"
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 7: CRIAR COBRANÇA DE CARTÃO DE CRÉDITO

**IMPORTANTE:** Para cartão, você precisa tokenizar antes!

### Passo 1: Tokenizar Cartão (via frontend ou Asaas)

No sandbox Asaas, use estes dados de teste:

```
Número: 5162306219378829
Validade: 12/2030
CVV: 318
Nome: João da Silva
```

### Passo 2: Criar Cobrança com Token

```bash
POST https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges

Body:
{
  "customer": "cus_123456789",
  "billingType": "CREDIT_CARD",
  "value": 75.50,
  "dueDate": "2025-11-07",
  "description": "Teste Cartão de Crédito",
  "creditCard": {
    "holderName": "João da Silva",
    "number": "5162306219378829",
    "expiryMonth": "12",
    "expiryYear": "2030",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "João da Silva",
    "email": "joao@example.com",
    "cpfCnpj": "12345678901",
    "postalCode": "01234567",
    "addressNumber": "123",
    "phone": "11987654321"
  }
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 8: LISTAR COBRANÇAS

```bash
GET https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges?status=PENDING

Headers:
  Authorization: Bearer SEU_TOKEN_JWT
```

### ✅ Resultado:

```json
{
  "data": [
    {
      "id": "pay_123456789",
      "customer": "cus_123456789",
      "billingType": "PIX",
      "value": 50.00,
      "status": "PENDING",
      ...
    }
  ],
  "totalCount": 10
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 9: VERIFICAR EVENTOS DO SISTEMA

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT
  id,
  \"eventType\",
  \"entityType\",
  \"entityId\",
  data::text,
  \"createdAt\"
FROM events
WHERE \"eventType\" LIKE 'payment%'
ORDER BY \"createdAt\" DESC
LIMIT 5;
"
```

### ✅ Eventos Esperados:

```
eventType            | entityType | data
---------------------|------------|------------------------------
payment.received     | payment    | {"chargeId":"xyz","value":50}
payment.pending      | payment    | {"chargeId":"abc","value":100}
payment.authorized   | payment    | {"chargeId":"def","value":75}
```

═══════════════════════════════════════════════════════════════════════════

## 🔧 TESTE 10: CANCELAR COBRANÇA

```bash
DELETE https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges/pay_123456789

Headers:
  Authorization: Bearer SEU_TOKEN_JWT
```

### ✅ Resultado:

```json
{
  "id": "pay_123456789",
  "status": "CANCELED",
  "deleted": true
}
```

═══════════════════════════════════════════════════════════════════════════

## 📊 FLUXO COMPLETO DE TESTE

### Cenário: Cliente realiza compra e paga com PIX

```
1. Criar Cliente
   POST /api/payment-gateway/asaas/customers
   → Retorna: cus_123456789

2. Criar Cobrança PIX
   POST /api/payment-gateway/asaas/charges
   Body: { customer: "cus_123456789", billingType: "PIX", value: 50 }
   → Retorna: pay_987654321 + QR Code PIX

3. Cliente Paga (Simular no Painel Asaas)
   → Asaas confirma pagamento

4. Webhook é Disparado
   → Asaas envia POST para: /api/payment-gateway/webhooks/asaas

5. Sistema Processa Webhook
   → Salva em payment_webhooks (status: pending)
   → Atualiza payment_charges (status: RECEIVED)
   → Emite evento: payment.received
   → Se houver transactionId, atualiza transactions (status: confirmada)

6. Verificar Dados
   → SELECT * FROM payment_webhooks (status: processed)
   → SELECT * FROM payment_charges (status: RECEIVED, webhookReceived: true)
   → SELECT * FROM events (eventType: payment.received)
```

═══════════════════════════════════════════════════════════════════════════

## 🐛 TROUBLESHOOTING

### Webhook não está sendo recebido?

1. **Verifique a URL configurada no Asaas:**
   ```
   https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
   ```

2. **Verifique se a URL está acessível:**
   ```bash
   curl -X POST https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas \
     -H "Content-Type: application/json" \
     -d '{"event":"TEST","payment":{"id":"test"}}'
   ```

3. **Verifique os logs:**
   ```bash
   docker service logs nexus_backend -f | grep webhook
   ```

### Cobrança não está aparecendo?

```bash
# Verificar no banco
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT COUNT(*) FROM payment_charges WHERE gateway = 'asaas';
"
```

### Status não está atualizando?

1. Webhook foi processado?
   ```sql
   SELECT status, "errorMessage" FROM payment_webhooks
   WHERE gateway = 'asaas' ORDER BY "createdAt" DESC LIMIT 1;
   ```

2. Verificar se há erro:
   ```bash
   docker service logs nexus_backend --tail 50 | grep -i error
   ```

═══════════════════════════════════════════════════════════════════════════

## 📱 TESTE VIA POSTMAN (COLLECTION)

Você pode criar uma Collection no Postman com:

### 1. Variáveis de Ambiente:

```
base_url: https://api.nexusatemporal.com.br
jwt_token: SEU_TOKEN_AQUI
customer_id: (será preenchido após criar cliente)
charge_id: (será preenchido após criar cobrança)
```

### 2. Requisições:

```
1. Login (se necessário)
2. Criar Cliente
3. Criar Cobrança PIX
4. Criar Cobrança Boleto
5. Listar Cobranças
6. Cancelar Cobrança
7. Listar Webhooks
```

═══════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST DE TESTES COMPLETOS

- [ ] Configuração Asaas salva e ativa
- [ ] Teste de conexão passou
- [ ] Cliente criado com sucesso
- [ ] Cobrança PIX criada
- [ ] QR Code PIX gerado
- [ ] Cobrança Boleto criada
- [ ] URL do boleto gerada
- [ ] Pagamento simulado no sandbox
- [ ] Webhook recebido e salvo (status: pending)
- [ ] Webhook processado (status: processed)
- [ ] Cobrança atualizada (status: RECEIVED)
- [ ] Evento emitido (payment.received)
- [ ] Dados sincronizados no banco
- [ ] Listagem de cobranças funciona
- [ ] Cancelamento funciona

═══════════════════════════════════════════════════════════════════════════

## 🚀 PRÓXIMOS PASSOS

1. **Integrar com seu sistema de vendas**
   - Criar cobrança automaticamente ao criar venda
   - Vincular lead_id ou transaction_id

2. **Criar interface de gestão de cobranças**
   - Listar todas as cobranças
   - Filtrar por status
   - Ver detalhes do pagamento
   - Reenviar boleto/PIX

3. **Implementar notificações**
   - Email quando pagamento confirmado
   - SMS/WhatsApp com link de pagamento
   - Notificação de pagamento vencido

4. **Migrar para produção**
   - Obter API Key de produção
   - Atualizar configuração
   - Testar com valor real pequeno

═══════════════════════════════════════════════════════════════════════════

**🎉 SISTEMA PRONTO PARA USO!**

Qualquer dúvida durante os testes, me avise!
