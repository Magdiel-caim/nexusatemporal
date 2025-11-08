# 🔧 CORREÇÃO VISUAL - O QUE MUDAR NO POSTMAN

═══════════════════════════════════════════════════════════════════════════

## ❌ O QUE VOCÊ ESTAVA FAZENDO (ERRADO)

```
┌─────────────────────────────────────────────────────────────────┐
│ POST                                                            │
│ https://api.nexusatemporal.com.br/api/payment-gateway/asaas... │ ❌
└─────────────────────────────────────────────────────────────────┘

Body:
{
  "name": "João da Silva Teste",
  "email": "joao.teste@example.com",
  "cpfCnpj": "12345678901",
  ...
}
```

**Problema:** URL contém "/asaas" ❌

═══════════════════════════════════════════════════════════════════════════

## ✅ O QUE DEVE FAZER (CORRETO)

```
┌─────────────────────────────────────────────────────────────────┐
│ POST                                                            │
│ https://api.nexusatemporal.com.br/api/payment-gateway/customers│ ✅
└─────────────────────────────────────────────────────────────────┘

Body:
{
  "gateway": "asaas",          ← ADICIONE ESTA LINHA!
  "name": "João da Silva Teste",
  "email": "joao.teste@example.com",
  "cpfCnpj": "12345678901",
  ...
}
```

**Mudanças:**
1. ✅ Remova "/asaas" da URL
2. ✅ Adicione `"gateway": "asaas"` no body JSON

═══════════════════════════════════════════════════════════════════════════

## 📝 PASSO A PASSO NO POSTMAN

### PASSO 1: Corrigir a URL

**Antes:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/asaas/customers
                                                      ^^^^^^ APAGUE ISSO
```

**Depois:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/customers
```

---

### PASSO 2: Adicionar "gateway" no Body

**Clique na aba "Body"**

**Antes (seu JSON atual):**
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

**Depois (adicione a primeira linha):**
```json
{
  "gateway": "asaas",                    ← ADICIONE ESTA LINHA NO TOPO!
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

---

### PASSO 3: Verificar Headers

**Clique na aba "Headers"**

Deve conter:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ✅
Content-Type: application/json                                ✅
```

---

### PASSO 4: Enviar

Clique em **"Send"** (botão azul)

═══════════════════════════════════════════════════════════════════════════

## ✅ RESULTADO ESPERADO

Se tudo estiver correto, você vai receber:

```
Status: 200 OK                                                    ✅
Time: ~500ms

Body:
{
  "id": "cus_000123456789",              ← ID do cliente criado!
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

**📋 ANOTE O `id`:** `cus_000123456789`

═══════════════════════════════════════════════════════════════════════════

## 🔄 PRÓXIMO TESTE: CRIAR COBRANÇA PIX

Após criar o cliente, use o mesmo padrão:

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/charges
                                                      ^^^^^^^ SEM "/asaas"
```

**Body:**
```json
{
  "gateway": "asaas",                    ← Gateway no body!
  "customer": "cus_000123456789",        ← ID do cliente do teste anterior
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2025-11-15",
  "description": "Teste PIX"
}
```

═══════════════════════════════════════════════════════════════════════════

## 🎯 CHECKLIST RÁPIDO

Antes de enviar, verifique:

- [ ] URL: `https://api.nexusatemporal.com.br/api/payment-gateway/customers` (SEM "/asaas")
- [ ] Método: POST
- [ ] Headers: Authorization Bearer + Content-Type application/json
- [ ] Body: Tipo "raw" + formato "JSON"
- [ ] Body: Primeira linha é `"gateway": "asaas",`
- [ ] JWT token válido (testou /api/auth/me antes?)

═══════════════════════════════════════════════════════════════════════════

## 📸 CONFIGURAÇÃO FINAL DO POSTMAN

```
┌──────────────────────────────────────────────────────────────┐
│  POST  ▼  │ https://api.nexusatemporal.com.br/api/...      │
├──────────────────────────────────────────────────────────────┤
│  Params  │ Authorization  │ Headers  │ Body  │ ...          │
│                                         ▼                     │
│  ○ none  ○ form-data  ○ x-www-form-urlencoded                │
│  ● raw   ○ binary     ○ GraphQL                              │
│                                                               │
│  JSON ▼                                                       │
│                                                               │
│  {                                                            │
│    "gateway": "asaas",          ← IMPORTANTE!               │
│    "name": "João da Silva Teste",                            │
│    "email": "joao.teste@example.com",                        │
│    "cpfCnpj": "12345678901",                                 │
│    "phone": "11987654321",                                   │
│    "mobilePhone": "11987654321"                              │
│  }                                                            │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                    [ Send ] [ Save ▼ ]       │
└──────────────────────────────────────────────────────────────┘
```

═══════════════════════════════════════════════════════════════════════════

## 🚨 SE DER ERRO 400

```json
{
  "error": "Gateway is required"
}
```

**Causa:** Você esqueceu de adicionar `"gateway": "asaas"` no body!
**Solução:** Adicione como primeira linha do JSON.

═══════════════════════════════════════════════════════════════════════════

## 🚨 SE DER ERRO 401

```json
{
  "error": "Unauthorized"
}
```

**Causa:** JWT token inválido/expirado
**Solução:**
1. Pegue um novo JWT token (veja COMO_PEGAR_JWT_TOKEN.md)
2. Teste com GET /api/auth/me primeiro
3. Atualize o token no Authorization

═══════════════════════════════════════════════════════════════════════════

## 🚨 SE DER ERRO 500

```json
{
  "error": "Asaas API Error (401): Invalid API Key"
}
```

**Causa:** API Key do Asaas inválida ou não configurada
**Solução:**
1. Acesse: https://one.nexusatemporal.com.br/integracoes/pagamentos
2. Configure o Asaas novamente
3. Marque "Ativar integração" ✅
4. Salve
5. Teste a conexão

═══════════════════════════════════════════════════════════════════════════

## ✅ PRONTO!

Agora tente novamente com as correções! 🚀

Deve funcionar perfeitamente! 💚
