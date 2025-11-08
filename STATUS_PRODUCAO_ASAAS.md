# ✅ STATUS PRODUÇÃO ASAAS

**Data:** 2025-11-07 21:03
**Status:** CONFIGURADO ✅

═══════════════════════════════════════════════════════════════════════════

## ✅ CONFIGURAÇÃO PRODUÇÃO

```
ID:                9c2ddb43-49f5-4c9b-bcc1-daa11de0b1d8
Gateway:           asaas
Environment:       production ✅
isActive:          true ✅
API Key:           Criptografada (385 chars) ✅
Webhook Secret:    Configurado ✅
Criado em:         2025-11-07 20:58:33
Atualizado em:     2025-11-07 21:03:03 (há poucos minutos)
```

---

## ✅ API KEY VALIDADA

```
API Key:   $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY...
Status:    VÁLIDA ✅
Conexão:   OK ✅
Saldo:     R$ 0,00
Ambiente:  https://api.asaas.com/v3 (PRODUÇÃO)
```

---

## 📋 PRÓXIMOS PASSOS

### 1. Teste de Conexão via Sistema

Execute no Postman:
```
POST https://api.nexusatemporal.com.br/api/payment-gateway/test/asaas

Headers:
  Authorization: Bearer SEU_JWT_TOKEN
```

Ou via script:
```bash
/tmp/testar_producao.sh
```

**Resultado esperado:**
```json
{
  "success": true,
  "balance": 0.00,
  "environment": "production"
}
```

---

### 2. Configurar Webhook no Asaas

⚠️ **IMPORTANTE:** Configure o webhook no painel Asaas de PRODUÇÃO!

**URL do Webhook:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
```

**Como configurar:**

1. Acesse: https://www.asaas.com/ (produção, SEM sandbox)
2. Menu: **Configurações → Webhooks** (ou Notificações)
3. Clique em "Adicionar" ou "Configurar Webhook"
4. Cole a URL acima
5. Marque os eventos:
   ```
   ✅ PAYMENT_CREATED
   ✅ PAYMENT_UPDATED
   ✅ PAYMENT_CONFIRMED
   ✅ PAYMENT_RECEIVED
   ✅ PAYMENT_OVERDUE
   ✅ PAYMENT_DELETED
   ✅ PAYMENT_REFUNDED
   ✅ PAYMENT_RESTORED
   ```
6. **Salvar**

---

### 3. Teste com R$ 1,00 Real

**Criar cliente de teste (com SEUS dados reais):**

```
POST /api/payment-gateway/customers

Body:
{
  "gateway": "asaas",
  "name": "SEU_NOME_COMPLETO",
  "email": "SEU_EMAIL@gmail.com",
  "cpfCnpj": "SEU_CPF_REAL",
  "phone": "SEU_TELEFONE",
  "mobilePhone": "SEU_CELULAR"
}
```

**Criar cobrança PIX de R$ 1,00:**

```
POST /api/payment-gateway/charges

Body:
{
  "gateway": "asaas",
  "customer": "cus_XXXXXXXXXX",
  "billingType": "PIX",
  "value": 1.00,
  "dueDate": "2025-11-08",
  "description": "Teste producao - R$ 1,00"
}
```

**Obter QR Code:**

```
GET /api/payment-gateway/charges/asaas/{chargeId}/pix
```

**Pagar de verdade:**
- Copie o código PIX (payload)
- Abra seu app de banco
- PIX → Copia e Cola
- Pague R$ 1,00

**Verificar webhook:**
```bash
docker service logs nexus_backend -f | grep -i webhook
```

**Verificar saldo Asaas:**
- Acesse: https://www.asaas.com/
- Dashboard → Saldo
- Deve ter: R$ 0,99 (R$ 1,00 - taxa de 0,99%)

---

## 🔄 CONFIGURAÇÕES EXISTENTES

### Sandbox (ainda ativa):
```
Environment:  sandbox
isActive:     true
Criado em:    2025-11-05
Atualizado:   2025-11-07 15:07
```

### Produção (configurada agora):
```
Environment:  production ✅
isActive:     true ✅
Criado em:    2025-11-07 20:58
Atualizado:   2025-11-07 21:03 ✅
```

**Ambas estão ativas!** O sistema vai usar a de **produção** por padrão quando você especificar `"gateway": "asaas"` e o ambiente estiver configurado como production.

---

## ⚠️ DIFERENÇAS SANDBOX vs PRODUÇÃO

### URLs:
| Ambiente  | URL                                  |
|-----------|--------------------------------------|
| Sandbox   | https://sandbox.asaas.com/api/v3     |
| Produção  | https://api.asaas.com/v3             |

### API Keys:
| Ambiente  | Formato                              |
|-----------|--------------------------------------|
| Sandbox   | $aact_hmlg_...                       |
| Produção  | $aact_prod_...                       |

### Taxas:
| Tipo           | Sandbox | Produção          |
|----------------|---------|-------------------|
| PIX            | R$ 0,00 | 0,99% (mín R$ 1)  |
| Boleto         | R$ 0,00 | R$ 3,49           |
| Cartão Crédito | R$ 0,00 | 4,99% + R$ 0,49   |
| Cartão Débito  | R$ 0,00 | 2,99% + R$ 0,49   |

### Dinheiro:
| Ambiente  | Dinheiro Real? |
|-----------|----------------|
| Sandbox   | ❌ NÃO         |
| Produção  | ✅ SIM         |

---

## 📊 MONITORAMENTO

### Logs em tempo real:
```bash
# Webhooks
docker service logs nexus_backend -f | grep -i webhook

# Pagamentos
docker service logs nexus_backend -f | grep -i payment

# Erros
docker service logs nexus_backend -f | grep -i error
```

### Queries úteis:
```sql
-- Cobranças de produção hoje
SELECT
  "gatewayChargeId",
  "billingType",
  value,
  status,
  "paymentDate"
FROM payment_charges
WHERE gateway = 'asaas'
  AND "createdAt"::date = CURRENT_DATE
ORDER BY "createdAt" DESC;

-- Webhooks recebidos hoje
SELECT
  event,
  status,
  "createdAt"
FROM payment_webhooks
WHERE gateway = 'asaas'
  AND "createdAt"::date = CURRENT_DATE
ORDER BY "createdAt" DESC;
```

---

## ✅ CHECKLIST PRÉ-PRODUÇÃO

- [x] API Key de produção gerada
- [x] API Key validada via curl
- [x] Configuração salva no sistema
- [x] isActive = true
- [x] API Key criptografada
- [ ] Teste de conexão via sistema
- [ ] Webhook configurado no Asaas
- [ ] Teste com R$ 1,00 real
- [ ] Webhook recebido e processado
- [ ] Saldo apareceu no Asaas

---

## 🎯 PRÓXIMA AÇÃO

**Execute agora:**

```bash
/tmp/testar_producao.sh
```

Ou teste via Postman:
```
POST https://api.nexusatemporal.com.br/api/payment-gateway/test/asaas
Headers: Authorization Bearer SEU_JWT_TOKEN
```

**Depois me avise o resultado!** ✅

═══════════════════════════════════════════════════════════════════════════

**Status:** ✅ CONFIGURADO - Pronto para testar!
