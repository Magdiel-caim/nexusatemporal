# 🔧 GUIA POSTMAN CORRIGIDO - ROTAS CORRETAS

**Data:** 2025-11-07
**Status:** ✅ Rotas corretas identificadas

═══════════════════════════════════════════════════════════════════════════

## ⚠️ CORREÇÃO IMPORTANTE

As rotas do payment gateway **NÃO incluem o nome do gateway na URL**!

### ❌ ERRADO (não funciona):
```
POST /api/payment-gateway/asaas/customers
POST /api/payment-gateway/pagbank/orders
```

### ✅ CORRETO:
```
POST /api/payment-gateway/customers
POST /api/payment-gateway/charges
```

**O gateway é especificado NO BODY do JSON:**
```json
{
  "gateway": "asaas",    ← Aqui você especifica qual gateway usar
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 1: CRIAR CLIENTE (SYNCUSTOMER)

### Configuração Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/customers
```
⚠️ SEM "/asaas" na URL!

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "gateway": "asaas",
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
  ...
}
```

**📝 ANOTE O `id` DO CLIENTE!** (ex: `cus_000123456789`)

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 2: CRIAR COBRANÇA PIX

### Configuração Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges
```
⚠️ SEM "/asaas" na URL!

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "gateway": "asaas",
  "customer": "cus_000123456789",
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2025-11-15",
  "description": "Teste PIX Postman"
}
```

⚠️ **SUBSTITUA `cus_000123456789` pelo ID do Teste 1!**

### ✅ Resposta Esperada (200 OK):

```json
{
  "id": "pay_123456789",
  "customer": "cus_000123456789",
  "billingType": "PIX",
  "value": 50.00,
  "status": "PENDING",
  "invoiceUrl": "https://www.asaas.com/i/...",
  "pixTransaction": {
    "payload": "00020126580014br.gov.bcb.pix...",
    "encodedImage": "iVBORw0KGgo...",
    "expirationDate": "2025-11-15 23:59:59"
  },
  ...
}
```

**📝 ANOTE O `id` DA COBRANÇA!** (ex: `pay_123456789`)

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 3: CONSULTAR COBRANÇA

### Configuração Postman:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges/asaas/pay_123456789
```
⚠️ Aqui o gateway VAI na URL: `/charges/{gateway}/{chargeId}`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### ✅ Resposta Esperada (200 OK):

Retorna os detalhes da cobrança com status atual.

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 4: LISTAR TODAS AS COBRANÇAS

### Configuração Postman:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges/asaas?status=PENDING
```
⚠️ Gateway na URL: `/charges/{gateway}`
⚠️ Filtros via query params: `?status=PENDING`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

**Query Params opcionais:**
```
status=PENDING          → Cobranças pendentes
status=RECEIVED         → Cobranças pagas
billingType=PIX         → Apenas PIX
customer=cus_123        → De um cliente específico
limit=10                → Limitar resultados
offset=0                → Paginação
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

## 📋 TESTE 5: OBTER QR CODE PIX

### Configuração Postman:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges/asaas/pay_123456789/pix
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### ✅ Resposta Esperada (200 OK):

```json
{
  "encodedImage": "iVBORw0KGgoAAAANSUhEUgAA...",
  "payload": "00020126580014br.gov.bcb.pix...",
  "expirationDate": "2025-11-15 23:59:59"
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 6: CRIAR COBRANÇA BOLETO

### Configuração Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "gateway": "asaas",
  "customer": "cus_000123456789",
  "billingType": "BOLETO",
  "value": 100.00,
  "dueDate": "2025-11-20",
  "description": "Teste Boleto Bancário"
}
```

### ✅ Resposta Esperada:

```json
{
  "id": "pay_987654321",
  "billingType": "BOLETO",
  "value": 100.00,
  "status": "PENDING",
  "bankSlipUrl": "https://www.asaas.com/b/pdf/...",
  "identificationField": "34191.79001 01043.510047...",
  "barCode": "34191793400000100001790010104...",
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 7: ESTORNAR COBRANÇA (REFUND)

### Configuração Postman:

**Método:** `POST`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges/asaas/pay_123456789/refund
```

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "value": 50.00,
  "description": "Estorno solicitado pelo cliente"
}
```

### ✅ Resposta Esperada:

```json
{
  "id": "pay_123456789",
  "status": "REFUNDED",
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 TESTE 8: OBTER CLIENTE POR LEAD ID

Se você tem um lead_id e quer ver qual cliente do gateway está vinculado:

**Método:** `GET`

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/customers/lead/LEAD-001?gateway=asaas
```
⚠️ Gateway vai como query param: `?gateway=asaas`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### ✅ Resposta Esperada:

```json
{
  "id": "...",
  "gateway": "asaas",
  "gatewayCustomerId": "cus_000123456789",
  "leadId": "LEAD-001",
  "name": "João da Silva",
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## 🎯 RESUMO DAS ROTAS

### Criar Cliente:
```
POST /api/payment-gateway/customers
Body: { "gateway": "asaas", ... }
```

### Criar Cobrança:
```
POST /api/payment-gateway/charges
Body: { "gateway": "asaas", "customer": "cus_...", ... }
```

### Listar Cobranças:
```
GET /api/payment-gateway/charges/{gateway}?status=PENDING
```

### Consultar Cobrança:
```
GET /api/payment-gateway/charges/{gateway}/{chargeId}
```

### QR Code PIX:
```
GET /api/payment-gateway/charges/{gateway}/{chargeId}/pix
```

### Estornar:
```
POST /api/payment-gateway/charges/{gateway}/{chargeId}/refund
```

### Cliente por Lead:
```
GET /api/payment-gateway/customers/lead/{leadId}?gateway={gateway}
```

═══════════════════════════════════════════════════════════════════════════

## 📱 COLEÇÃO POSTMAN ATUALIZADA

Salve como `Nexus_Payment_Corrected.postman_collection.json`:

```json
{
  "info": {
    "name": "Nexus Payment Gateway - CORRETO",
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
      "value": "COLE_SEU_JWT_AQUI",
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
      "name": "1. Criar Cliente (Asaas)",
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
          "raw": "{\n  \"gateway\": \"asaas\",\n  \"name\": \"João da Silva Teste\",\n  \"email\": \"joao.teste@example.com\",\n  \"cpfCnpj\": \"12345678901\",\n  \"phone\": \"11987654321\",\n  \"mobilePhone\": \"11987654321\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/payment-gateway/customers",
          "host": ["{{base_url}}"],
          "path": ["api", "payment-gateway", "customers"]
        }
      }
    },
    {
      "name": "2. Criar Cobrança PIX",
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
          "raw": "{\n  \"gateway\": \"asaas\",\n  \"customer\": \"{{customer_id}}\",\n  \"billingType\": \"PIX\",\n  \"value\": 50.00,\n  \"dueDate\": \"2025-11-15\",\n  \"description\": \"Teste PIX Postman\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/payment-gateway/charges",
          "host": ["{{base_url}}"],
          "path": ["api", "payment-gateway", "charges"]
        }
      }
    },
    {
      "name": "3. Listar Cobranças",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/payment-gateway/charges/asaas?status=PENDING",
          "host": ["{{base_url}}"],
          "path": ["api", "payment-gateway", "charges", "asaas"],
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
      "name": "4. Consultar Cobrança",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/payment-gateway/charges/asaas/{{charge_id}}",
          "host": ["{{base_url}}"],
          "path": ["api", "payment-gateway", "charges", "asaas", "{{charge_id}}"]
        }
      }
    },
    {
      "name": "5. Obter QR Code PIX",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/payment-gateway/charges/asaas/{{charge_id}}/pix",
          "host": ["{{base_url}}"],
          "path": ["api", "payment-gateway", "charges", "asaas", "{{charge_id}}", "pix"]
        }
      }
    }
  ]
}
```

═══════════════════════════════════════════════════════════════════════════

## ✅ CORREÇÕES APLICADAS

1. ✅ URL: `/api/payment-gateway/customers` (sem "asaas")
2. ✅ Body: `"gateway": "asaas"` adicionado
3. ✅ Headers: Authorization Bearer correto
4. ✅ Rotas de consulta: gateway na URL quando necessário

═══════════════════════════════════════════════════════════════════════════

## 🚀 TESTE AGORA!

1. **Edite sua requisição no Postman:**
   - URL: `https://api.nexusatemporal.com.br/api/payment-gateway/customers`
   - Body: Adicione `"gateway": "asaas"` no JSON

2. **Envie (Send)**

3. **Deve funcionar agora!** ✅

═══════════════════════════════════════════════════════════════════════════
