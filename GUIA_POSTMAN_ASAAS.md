# 🧪 GUIA PRÁTICO - POSTMAN ASAAS

**Data:** 2025-11-07
**Status:** ✅ JWT Funcionando - Pronto para testar

═══════════════════════════════════════════════════════════════════════════

## ✅ PRÉ-REQUISITOS

- [x] JWT Token obtido com sucesso
- [x] Teste `/api/auth/me` passou (200 OK)
- [x] Asaas configurado e ativo no sistema
- [x] Postman instalado

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 1: CRIAR UM CLIENTE NO ASAAS

### Configuração no Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/customers
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "João da Silva Teste",
  "email": "joao.teste@example.com",
  "cpfCnpj": "12345678901",
  "phone": "11987654321",
  "mobilePhone": "11987654321",
  "address": "Rua Teste",
  "addressNumber": "123",
  "province": "Centro",
  "postalCode": "01234567"
}
```

### ✅ Resposta Esperada (200 OK):

```json
{
  "id": "cus_000123456789",
  "dateCreated": "2025-11-07",
  "name": "João da Silva Teste",
  "email": "joao.teste@example.com",
  "cpfCnpj": "12345678901",
  "phone": "11987654321",
  "mobilePhone": "11987654321",
  "address": "Rua Teste",
  "addressNumber": "123",
  "province": "Centro",
  "postalCode": "01234567",
  "externalReference": null,
  "notificationDisabled": false,
  "deleted": false
}
```

### 📝 IMPORTANTE:
**ANOTE O `id` DO CLIENTE!** Exemplo: `cus_000123456789`

Você vai precisar desse ID para criar a cobrança no próximo passo!

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 2: CRIAR COBRANÇA PIX

### Configuração no Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "customer": "cus_000123456789",
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2025-11-15",
  "description": "Teste de cobrança PIX via Postman",
  "externalReference": "TESTE-PIX-001"
}
```

⚠️ **SUBSTITUA `cus_000123456789` pelo ID que você recebeu no Teste 1!**

### ✅ Resposta Esperada (200 OK):

```json
{
  "id": "pay_123456789",
  "dateCreated": "2025-11-07",
  "customer": "cus_000123456789",
  "billingType": "PIX",
  "value": 50.00,
  "netValue": 49.01,
  "originalValue": null,
  "interestValue": null,
  "description": "Teste de cobrança PIX via Postman",
  "dueDate": "2025-11-15",
  "status": "PENDING",
  "invoiceUrl": "https://www.asaas.com/i/...",
  "pixTransaction": {
    "encodedImage": "iVBORw0KGgoAAAANSUhEUgAA...",
    "payload": "00020126580014br.gov.bcb.pix...",
    "expirationDate": "2025-11-15 23:59:59"
  },
  "externalReference": "TESTE-PIX-001",
  "confirmedDate": null,
  "paymentDate": null,
  "clientPaymentDate": null,
  "originalDueDate": "2025-11-15",
  "invoiceNumber": "00000001",
  "deleted": false,
  "postalService": false
}
```

### 📝 IMPORTANTE:
**ANOTE O `id` DA COBRANÇA!** Exemplo: `pay_123456789`

**Dados do PIX:**
- `pixTransaction.payload` → Código PIX Copia e Cola
- `pixTransaction.encodedImage` → QR Code em Base64
- `invoiceUrl` → Link da fatura

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 3: CONSULTAR A COBRANÇA CRIADA

### Configuração no Postman:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges/pay_123456789
```

⚠️ **SUBSTITUA `pay_123456789` pelo ID da cobrança do Teste 2!**

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### ✅ Resposta Esperada (200 OK):

Mesma resposta do Teste 2, com status atual da cobrança.

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 4: LISTAR TODAS AS COBRANÇAS

### Configuração no Postman:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges?status=PENDING
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Parâmetros de Query Opcionais:

```
?status=PENDING          → Cobranças pendentes
?status=RECEIVED         → Cobranças pagas
?billingType=PIX         → Apenas PIX
?customer=cus_123        → De um cliente específico
?limit=10                → Limitar resultados
```

### ✅ Resposta Esperada (200 OK):

```json
{
  "object": "list",
  "hasMore": false,
  "totalCount": 1,
  "limit": 10,
  "offset": 0,
  "data": [
    {
      "id": "pay_123456789",
      "customer": "cus_000123456789",
      "billingType": "PIX",
      "value": 50.00,
      "status": "PENDING",
      ...
    }
  ]
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 5: SIMULAR PAGAMENTO (NO PAINEL ASAAS)

Agora vamos simular que o cliente pagou a cobrança PIX:

### Passo a Passo:

1. **Acesse o painel do Asaas:**
   ```
   https://sandbox.asaas.com/
   ```

2. **Faça login** com suas credenciais Asaas

3. **Menu lateral esquerdo:** Clique em **"Cobranças"**

4. **Procure pela cobrança** que você criou:
   - Busque pelo ID: `pay_123456789`
   - Ou pelo cliente: "João da Silva Teste"
   - Ou pelo valor: R$ 50,00

5. **Clique na cobrança** para abrir os detalhes

6. **Clique em "Ações"** (botão no canto superior direito)

7. **Selecione "Confirmar Pagamento"**

8. **Preencha os dados:**
   - Data de Pagamento: `07/11/2025` (hoje)
   - Valor Pago: `50.00`
   - Notificar Cliente: `Não` (desmarque)

9. **Clique em "Confirmar"**

### ✅ O que vai acontecer:

1. ✅ Status da cobrança muda para `RECEIVED` ou `CONFIRMED`
2. ✅ Asaas dispara um webhook para nossa API
3. ✅ Nosso sistema recebe e processa o webhook
4. ✅ Dados são salvos no banco de dados
5. ✅ Evento `payment.received` é emitido

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 6: VERIFICAR WEBHOOK RECEBIDO

### Via Logs do Backend:

```bash
docker service logs nexus_backend --tail 50 | grep -i "asaas\|webhook"
```

### ✅ Logs Esperados:

```
[Webhook] Asaas webhook received: { event: 'PAYMENT_RECEIVED', payment: { id: 'pay_123456789' } }
[Webhook] Processing Asaas webhook: abc123...
[Webhook] Webhook abc123 processed successfully for payment pay_123456789
[Event] payment.received emitted for charge pay_123456789
```

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
id         | gateway | event              | status    | createdAt
-----------|---------|--------------------|-----------|-----------------------
abc123...  | asaas   | PAYMENT_RECEIVED   | processed | 2025-11-07 15:30:00
abc124...  | asaas   | PAYMENT_CONFIRMED  | processed | 2025-11-07 15:30:01
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 7: VERIFICAR COBRANÇA ATUALIZADA

### Via Postman - Consultar cobrança novamente:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges/pay_123456789
```

### ✅ Agora o status deve estar:

```json
{
  "id": "pay_123456789",
  "status": "RECEIVED",        ← Mudou de PENDING para RECEIVED
  "paymentDate": "2025-11-07", ← Data do pagamento
  "confirmedDate": "2025-11-07",
  ...
}
```

### Via Banco de Dados:

```bash
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "
SELECT
  id,
  gateway,
  \"gatewayChargeId\",
  value,
  status,
  \"paymentDate\",
  \"webhookReceived\"
FROM payment_charges
WHERE gateway = 'asaas'
  AND \"gatewayChargeId\" = 'pay_123456789';
"
```

### ✅ Resultado Esperado:

```
id     | gateway | gatewayChargeId | value | status   | paymentDate | webhookReceived
-------|---------|-----------------|-------|----------|-------------|----------------
xyz... | asaas   | pay_123456789   | 50.00 | RECEIVED | 2025-11-07  | t
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 8: CRIAR COBRANÇA DE BOLETO

### Configuração no Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "customer": "cus_000123456789",
  "billingType": "BOLETO",
  "value": 100.00,
  "dueDate": "2025-11-20",
  "description": "Teste de Boleto Bancário",
  "externalReference": "TESTE-BOLETO-001"
}
```

### ✅ Resposta Esperada:

```json
{
  "id": "pay_987654321",
  "billingType": "BOLETO",
  "value": 100.00,
  "status": "PENDING",
  "bankSlipUrl": "https://www.asaas.com/b/pdf/...",  ← Link do boleto PDF
  "identificationField": "34191.79001 01043.510047 91020.150008 1 91340000010000",  ← Linha digitável
  "nossoNumero": "000000001",
  "barCode": "34191793400000100001790010104351004912010500",
  "invoiceUrl": "https://www.asaas.com/i/...",
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 9: CANCELAR UMA COBRANÇA

### Configuração no Postman:

**Método:** `DELETE`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/charges/pay_123456789
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### ✅ Resposta Esperada:

```json
{
  "id": "pay_123456789",
  "status": "CANCELED",
  "deleted": true
}
```

═══════════════════════════════════════════════════════════════════════════

## 🎯 COLEÇÃO POSTMAN (IMPORTAR)

Salve isso como `Nexus_Asaas.postman_collection.json`:

```json
{
  "info": {
    "name": "Nexus - Asaas Payment Gateway",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.nexusatemporal.com.br",
      "type": "string"
    },
    {
      "key": "jwt_token",
      "value": "",
      "type": "string"
    },
    {
      "key": "customer_id",
      "value": "",
      "type": "string"
    },
    {
      "key": "charge_id",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"teste@nexusatemporal.com.br\",\n  \"password\": \"sua_senha\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        },
        {
          "name": "Get User Info",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/auth/me",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Asaas - Customers",
      "item": [
        {
          "name": "Create Customer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"João da Silva Teste\",\n  \"email\": \"joao.teste@example.com\",\n  \"cpfCnpj\": \"12345678901\",\n  \"phone\": \"11987654321\",\n  \"mobilePhone\": \"11987654321\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/customers",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "customers"]
            }
          }
        },
        {
          "name": "Get Customer",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/customers/{{customer_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "customers", "{{customer_id}}"]
            }
          }
        },
        {
          "name": "List Customers",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/customers",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "customers"]
            }
          }
        }
      ]
    },
    {
      "name": "Asaas - Charges",
      "item": [
        {
          "name": "Create PIX Charge",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customer\": \"{{customer_id}}\",\n  \"billingType\": \"PIX\",\n  \"value\": 50.00,\n  \"dueDate\": \"2025-11-15\",\n  \"description\": \"Teste PIX\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/charges",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "charges"]
            }
          }
        },
        {
          "name": "Create BOLETO Charge",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customer\": \"{{customer_id}}\",\n  \"billingType\": \"BOLETO\",\n  \"value\": 100.00,\n  \"dueDate\": \"2025-11-20\",\n  \"description\": \"Teste Boleto\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/charges",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "charges"]
            }
          }
        },
        {
          "name": "Get Charge",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/charges/{{charge_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "charges", "{{charge_id}}"]
            }
          }
        },
        {
          "name": "List Charges",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/charges?status=PENDING",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "charges"],
              "query": [
                {
                  "key": "status",
                  "value": "PENDING"
                }
              ]
            }
          }
        },
        {
          "name": "Delete Charge",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/payment-gateway/asaas/charges/{{charge_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "payment-gateway", "asaas", "charges", "{{charge_id}}"]
            }
          }
        }
      ]
    }
  ]
}
```

### Como importar:
1. Postman → Import → Cole o JSON acima
2. Edite as variáveis:
   - `jwt_token` → Cole seu JWT
   - Outras variáveis serão preenchidas automaticamente

═══════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST DE TESTES

- [ ] JWT Token obtido com sucesso
- [ ] Teste `/api/auth/me` passou (200 OK)
- [ ] Cliente criado no Asaas
- [ ] Customer ID anotado
- [ ] Cobrança PIX criada
- [ ] Charge ID anotado
- [ ] QR Code PIX recebido
- [ ] Pagamento simulado no painel Asaas
- [ ] Webhook recebido nos logs
- [ ] Webhook processado com sucesso
- [ ] Status da cobrança atualizado para RECEIVED
- [ ] Dados salvos no banco (payment_charges)
- [ ] Evento emitido (payment.received)
- [ ] Cobrança Boleto criada (opcional)
- [ ] Cancelamento de cobrança testado (opcional)

═══════════════════════════════════════════════════════════════════════════

## 🎉 PRONTO PARA TESTAR!

Comece pelo **TESTE 1** (Criar Cliente) e vá seguindo em ordem!

Qualquer erro, me avise com a resposta completa que recebeu! 🚀
