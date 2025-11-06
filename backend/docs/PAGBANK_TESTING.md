# PagBank Integration - Testing Guide

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Ambiente de Testes](#ambiente-de-testes)
4. [Executando Testes](#executando-testes)
5. [Endpoints de Teste](#endpoints-de-teste)
6. [Dados de Teste](#dados-de-teste)
7. [Webhooks](#webhooks)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este guia descreve como configurar e validar a integração com a API do PagBank (antigo PagSeguro) em ambiente de testes (sandbox).

### Funcionalidades Implementadas

- ✅ Criação de clientes
- ✅ Criação de pedidos (orders)
- ✅ Pagamentos PIX
- ✅ Pagamentos com cartão de crédito
- ✅ Boleto bancário
- ✅ Checkout hospedado
- ✅ Assinaturas (recorrência)
- ✅ Webhooks para notificações
- ✅ Cancelamento e estorno

### Arquitetura da Integração

```
┌─────────────────┐
│  Frontend/API   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ PaymentGatewayController│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ PaymentGatewayService   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   PagBankService        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   PagBank API           │
│   (Sandbox/Production)  │
└─────────────────────────┘
```

---

## ⚙️ Configuração Inicial

### 1. Obter Credenciais do PagBank

1. Acesse o portal de desenvolvedores: https://dev.pagseguro.uol.com.br/
2. Faça login ou crie uma conta
3. Gere um token de API para ambiente **Sandbox**
4. Salve o token gerado

### 2. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp backend/.env.pagbank.example backend/.env.pagbank

# Edite o arquivo e adicione suas credenciais
nano backend/.env.pagbank
```

Configure as seguintes variáveis:

```env
PAGBANK_SANDBOX_TOKEN=seu-token-aqui
PAGBANK_DEVELOPER_EMAIL=seu-email@example.com
PAGBANK_WEBHOOK_SECRET=seu-webhook-secret
```

### 3. Executar Setup do Ambiente de Testes

```bash
cd backend

# Instalar dependências (se ainda não instalou)
npm install

# Compilar TypeScript
npm run build

# Executar script de configuração
npx ts-node scripts/setup-pagbank-test-environment.ts
```

O script irá:
- Solicitar suas credenciais
- Criar configuração no banco de dados
- Gerar arquivo de dados de teste
- Configurar tenant especial para testes

---

## 🧪 Ambiente de Testes

### Estrutura de Arquivos

```
backend/
├── scripts/
│   ├── setup-pagbank-test-environment.ts    # Setup inicial
│   └── test-pagbank-integration.ts          # Testes automatizados
├── test-data/
│   └── pagbank-test-config.json             # Dados de teste
├── test-results/
│   └── pagbank-test-*.json                  # Resultados dos testes
├── src/modules/payment-gateway/
│   ├── pagbank.service.ts                   # Serviço PagBank
│   ├── payment-gateway.controller.ts        # Controller com endpoints
│   └── payment-gateway.routes.ts            # Rotas da API
└── docs/
    └── PAGBANK_TESTING.md                   # Esta documentação
```

### Tenant de Testes

Um tenant especial é criado para isolamento:

- **Tenant ID**: `test-environment`
- **User ID**: `developer-{seu-email}`
- **Gateway**: `pagbank`
- **Environment**: `sandbox`

---

## 🚀 Executando Testes

### Método 1: Script Automatizado

```bash
cd backend

# Executar todos os testes
npx ts-node scripts/test-pagbank-integration.ts
```

O script irá testar:
1. ✅ Criação de cliente
2. ✅ Listagem de clientes
3. ✅ Criação de pedido PIX
4. ✅ Consulta de pedido
5. ✅ Criação de checkout
6. ✅ (Opcional) Pagamento com cartão

### Método 2: Via API REST

#### 1. Iniciar o servidor

```bash
npm run dev
```

#### 2. Testar conexão

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "PagBank connection successful",
  "gateway": "pagbank",
  "environment": "sandbox"
}
```

#### 3. Executar bateria completa de testes

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank/full \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔌 Endpoints de Teste

### 1. Testar Conexão

**POST** `/api/payment-gateway/test/pagbank`

Valida credenciais e conectividade com a API.

**Resposta:**
```json
{
  "success": true,
  "message": "PagBank connection successful",
  "gateway": "pagbank",
  "environment": "sandbox",
  "customersCount": 0
}
```

---

### 2. Executar Testes Completos

**POST** `/api/payment-gateway/test/pagbank/full`

Executa bateria completa de testes de integração.

**Resposta:**
```json
{
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "successRate": "100.0%"
  },
  "results": [
    {
      "test": "Create Customer",
      "status": "PASSED",
      "data": {
        "customerId": "CUST_123456"
      }
    },
    {
      "test": "Create PIX Order",
      "status": "PASSED",
      "data": {
        "orderId": "ORDE_789012",
        "chargeId": "CHAR_345678"
      }
    },
    {
      "test": "Create Checkout",
      "status": "PASSED",
      "data": {
        "checkoutId": "CHECK_901234",
        "paymentLink": "https://sandbox.pagseguro.uol.com.br/checkout/..."
      }
    }
  ],
  "timestamp": "2025-11-04T12:00:00.000Z"
}
```

---

### 3. Criar Pagamento PIX de Teste

**POST** `/api/payment-gateway/test/pagbank/pix`

Cria um pagamento PIX para testes.

**Body:**
```json
{
  "amount": 10000,
  "description": "Teste de pagamento PIX"
}
```

**Resposta:**
```json
{
  "success": true,
  "orderId": "ORDE_123456",
  "chargeId": "CHAR_789012",
  "status": "WAITING",
  "amount": 10000,
  "qrCode": {
    "text": "00020126580014br.gov.bcb.pix...",
    "links": [
      {
        "rel": "QRCODE",
        "href": "data:image/png;base64,iVBORw0KGgoAAAA...",
        "media": "image/png",
        "type": "image/png"
      }
    ]
  },
  "order": {
    "id": "ORDE_123456",
    "reference_id": "PIX-TEST-1699098765432",
    "created_at": "2025-11-04T12:00:00.000Z",
    "charges": [...]
  }
}
```

---

### 4. Listar Pedidos de Teste

**GET** `/api/payment-gateway/test/pagbank/orders`

Lista pedidos criados durante os testes.

---

## 🧪 Dados de Teste

### Cartões de Crédito para Teste

| Bandeira   | Número             | CVV | Resultado  |
|------------|-------------------|-----|------------|
| Visa       | 4111111111111111  | 123 | Aprovado   |
| Mastercard | 5555555555554444  | 123 | Aprovado   |
| Visa       | 4000000000000002  | 123 | Recusado   |

**Importante:** Os cartões precisam ser criptografados usando a biblioteca JavaScript do PagBank antes de enviar para a API.

### CPF/CNPJ de Teste

- **CPF:** 123.456.789-09
- **CNPJ:** 12.345.678/0001-00

### Telefone de Teste

- **(11) 99999-9999**

### Dados de Endereço

```json
{
  "street": "Rua Teste",
  "number": "123",
  "complement": "Apto 1",
  "locality": "Centro",
  "city": "São Paulo",
  "region_code": "SP",
  "country": "BRA",
  "postal_code": "01310100"
}
```

### Valores de Teste

Valores em centavos (100 = R$ 1,00):

- **R$ 10,00** = 1000
- **R$ 50,00** = 5000
- **R$ 100,00** = 10000
- **R$ 150,00** = 15000

---

## 🔔 Webhooks

### Configurar Webhook no PagBank

1. Acesse o painel do PagBank
2. Vá em **Configurações** > **Webhooks**
3. Adicione a URL: `https://seu-dominio.com/api/payment-gateway/webhooks/pagbank`

### URL do Webhook

```
POST /api/payment-gateway/webhooks/pagbank
```

Este endpoint é **público** (não requer autenticação).

### Eventos Suportados

- `CHARGE.PAID` - Pagamento confirmado
- `CHARGE.AUTHORIZED` - Pagamento autorizado (cartão)
- `CHARGE.CANCELED` - Pagamento cancelado
- `CHARGE.IN_ANALYSIS` - Em análise de risco
- `CHARGE.REFUNDED` - Pagamento estornado

### Testar Webhook Localmente

Use `ngrok` para expor seu localhost:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar a URL gerada no painel do PagBank
# Exemplo: https://abc123.ngrok.io/api/payment-gateway/webhooks/pagbank
```

### Logs de Webhook

Consultar logs:

**GET** `/api/payment-gateway/webhooks/logs?gateway=pagbank`

---

## 🔍 Troubleshooting

### Erro: "Configuration not found"

**Solução:**
```bash
# Execute o setup novamente
npx ts-node scripts/setup-pagbank-test-environment.ts
```

### Erro: "Unauthorized" ou "Invalid token"

**Causas:**
- Token inválido
- Token expirado
- Usando token de produção em sandbox

**Solução:**
1. Verifique o token em `.env.pagbank`
2. Gere um novo token no portal do PagBank
3. Execute o setup novamente

### Erro: "Card encryption required"

**Causa:**
Dados de cartão não foram criptografados.

**Solução:**
Use a biblioteca JavaScript do PagBank para criptografar o cartão antes de enviar:

```html
<script src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"></script>
<script>
  const card = PagSeguro.encryptCard({
    number: '4111111111111111',
    cvv: '123',
    exp_month: '12',
    exp_year: '2030',
    holder: {
      name: 'TESTE APROVADO'
    }
  });

  // Enviar card.encrypted para o backend
</script>
```

### Timeout nas requisições

**Solução:**
Aumente o timeout no `pagbank.service.ts`:

```typescript
this.axiosInstance = axios.create({
  baseURL,
  timeout: 60000, // Aumentar para 60 segundos
  ...
});
```

### Webhook não está sendo chamado

**Checklist:**
- [ ] URL pública acessível
- [ ] HTTPS configurado (PagBank não envia webhook para HTTP)
- [ ] URL registrada no painel do PagBank
- [ ] Firewall permite requisições do PagBank

---

## 📊 Resultados dos Testes

Os resultados são salvos em `backend/test-results/` com formato:

```
pagbank-test-2025-11-04T12-00-00-000Z.json
```

### Estrutura do Relatório

```json
{
  "timestamp": "2025-11-04T12:00:00.000Z",
  "environment": "sandbox",
  "email": "developer@example.com",
  "summary": {
    "total": 6,
    "passed": 5,
    "failed": 1
  },
  "results": [
    {
      "test": "Criar Cliente de Teste",
      "status": "PASSED",
      "duration": 1234,
      "data": {...}
    },
    ...
  ]
}
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **API Reference:** https://developer.pagbank.com.br/reference
- **Guias:** https://developer.pagbank.com.br/docs
- **Portal de Desenvolvedores:** https://dev.pagseguro.uol.com.br/

### Arquivos do Projeto

- Serviço: `backend/src/modules/payment-gateway/pagbank.service.ts`
- Controller: `backend/src/modules/payment-gateway/payment-gateway.controller.ts`
- Rotas: `backend/src/modules/payment-gateway/payment-gateway.routes.ts`

### Suporte

Em caso de dúvidas sobre a API do PagBank:
- Email: atendimento@pagseguro.com.br
- Telefone: 0800 721 4588

---

## ✅ Checklist de Validação

- [ ] Credenciais configuradas
- [ ] Setup executado com sucesso
- [ ] Teste de conexão passou
- [ ] Cliente criado com sucesso
- [ ] Pedido PIX criado
- [ ] QR Code PIX gerado
- [ ] Checkout criado
- [ ] Webhook configurado
- [ ] Webhook recebido e processado
- [ ] Logs de webhook visíveis

---

## 🎉 Próximos Passos

Após validar em sandbox:

1. **Solicitar credenciais de produção** no painel do PagBank
2. **Atualizar variáveis de ambiente** com token de produção
3. **Testar em produção** com valores pequenos
4. **Configurar webhook de produção**
5. **Monitorar logs** nos primeiros dias

---

**Última atualização:** 04/11/2025
**Versão:** 1.0.0
**Autor:** Time de Desenvolvimento
