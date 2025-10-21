# 🏦 AMBIENTE DE HOMOLOGAÇÃO - PAGBANK

## 📋 Informações Gerais

Este documento contém todas as informações necessárias para a equipe PagBank testar e homologar a integração implementada no sistema Nexus Atemporal CRM.

**Data de Criação:** 2025-10-17
**Versão do Sistema:** v79-pagbank-integration
**Ambiente:** Produção (com dados de teste)

---

## 🔐 CREDENCIAIS DE ACESSO

### Usuário de Homologação

**URL de Acesso:** https://one.nexusatemporal.com.br

**Credenciais:**
- **Email:** `homologacao.pagbank@nexusatemporal.com.br`
- **Senha:** `PagBank@2024!Homolog`
- **Nível de Acesso:** Administrador
- **Tenant:** default

**⚠️ IMPORTANTE:**
- Estas credenciais são exclusivas para testes e homologação
- O usuário tem permissões de administrador para acessar todas as funcionalidades
- Após a homologação, estas credenciais serão desativadas

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1. Configuração do Gateway

**Localização:** Dashboard → Configurações → Aba "PagBank"

**Recursos Disponíveis:**
- ✅ Seleção de ambiente (Sandbox/Production)
- ✅ Configuração de Token OAuth
- ✅ Webhook Secret (opcional)
- ✅ Seleção de métodos de pagamento:
  - Boleto Bancário
  - PIX
  - Cartão de Crédito
  - Cartão de Débito
- ✅ Configurações padrão (vencimento, multa, juros)
- ✅ Botão "Testar Conexão"
- ✅ Botão "Salvar Configuração"

**URL do Webhook:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank
```

### 2. Gestão de Clientes

**Recursos:**
- ✅ Sincronização automática de clientes Nexus → PagBank
- ✅ Formatação automática de CPF/CNPJ
- ✅ Formatação automática de telefone (DDD + número)
- ✅ Conversão de endereço para formato PagBank API

**Endpoint:** `POST /api/payment-gateway/pagbank/customers`

### 3. Criação de Cobranças

**Recursos:**
- ✅ Criar pedidos (orders)
- ✅ Criar cobranças (charges)
- ✅ Gerar PIX QR Code
- ✅ Gerar Boleto
- ✅ Processar cartão de crédito/débito
- ✅ Conversão automática de valores (BRL → centavos)

**Endpoint:** `POST /api/payment-gateway/pagbank/charges`

### 4. Consulta de Pagamentos

**Recursos:**
- ✅ Consultar status de cobrança
- ✅ Listar cobranças por período
- ✅ Filtrar por status
- ✅ Consultar PIX QR Code

**Endpoint:** `GET /api/payment-gateway/pagbank/charges/{id}`

### 5. Gestão de Cobranças

**Recursos:**
- ✅ Cancelar cobrança
- ✅ Estornar pagamento
- ✅ Capturar pré-autorização

**Endpoints:**
- `POST /api/payment-gateway/pagbank/charges/{id}/cancel`
- `POST /api/payment-gateway/pagbank/charges/{id}/refund`

### 6. Webhooks

**Recursos:**
- ✅ Receber notificações de eventos
- ✅ Processar eventos automaticamente
- ✅ Atualizar status de cobranças
- ✅ Validação de assinatura (quando disponível)

**Eventos Suportados:**
- `CHARGE.PAID` - Pagamento confirmado
- `CHARGE.AUTHORIZED` - Pagamento autorizado
- `CHARGE.CANCELED` - Pagamento cancelado
- `CHARGE.REFUNDED` - Pagamento estornado
- `CHARGE.IN_ANALYSIS` - Em análise

**Endpoint:** `POST /api/payment-gateway/webhooks/pagbank`

---

## 🧪 DADOS DE TESTE

### Leads Criados

Criamos 3 leads de teste para facilitar os testes de integração:

#### Lead 1 - Alta Prioridade
- **Nome:** Cliente Teste PagBank 1
- **Email:** cliente1.teste@pagbank.com
- **Telefone:** (11) 98765-4321
- **CPF:** 123.456.789-00 (fictício)
- **Valor Estimado:** R$ 1.500,00
- **Status:** Novo

#### Lead 2 - Média Prioridade
- **Nome:** Cliente Teste PagBank 2
- **Email:** cliente2.teste@pagbank.com
- **Telefone:** (11) 98765-4322
- **CPF:** 234.567.890-11 (fictício)
- **Valor Estimado:** R$ 2.500,00
- **Status:** Em Atendimento

#### Lead 3 - Baixa Prioridade
- **Nome:** Cliente Teste PagBank 3
- **Email:** cliente3.teste@pagbank.com
- **Telefone:** (11) 98765-4323
- **CPF:** 345.678.901-22 (fictício)
- **Valor Estimado:** R$ 800,00
- **Status:** Qualificado

---

## 📝 ROTEIRO DE TESTES SUGERIDO

### Teste 1: Configuração Inicial

1. Fazer login com as credenciais fornecidas
2. Navegar para: Dashboard → Configurações
3. Clicar na aba "PagBank"
4. Selecionar ambiente "Sandbox"
5. Inserir Token OAuth de teste
6. Configurar Webhook Secret (se disponível)
7. Marcar métodos de pagamento desejados
8. Clicar em "Testar Conexão"
9. Verificar mensagem de sucesso
10. Clicar em "Salvar Configuração"

**Resultado Esperado:** Configuração salva com sucesso, sistema conectado ao PagBank Sandbox.

### Teste 2: Sincronização de Cliente

1. Navegar para: Leads
2. Selecionar "Cliente Teste PagBank 1"
3. Na área de pagamentos, clicar em "Sincronizar com PagBank"
4. Verificar se cliente foi criado no PagBank
5. Verificar formatação de CPF e telefone

**Resultado Esperado:** Cliente criado no PagBank com dados formatados corretamente.

### Teste 3: Criar Cobrança PIX

1. Com o cliente sincronizado, criar nova cobrança
2. Selecionar método: PIX
3. Valor: R$ 150,00
4. Vencimento: +3 dias
5. Descrição: "Teste de cobrança PIX"
6. Submeter cobrança
7. Verificar QR Code gerado
8. Verificar código copia/cola

**Resultado Esperado:** Cobrança criada, QR Code exibido, código copia/cola disponível.

### Teste 4: Criar Cobrança Boleto

1. Criar nova cobrança
2. Selecionar método: Boleto
3. Valor: R$ 250,00
4. Vencimento: +7 dias
5. Aplicar multa: 2%
6. Aplicar juros: 1% ao mês
7. Submeter cobrança
8. Verificar URL do boleto

**Resultado Esperado:** Cobrança criada, boleto gerado com multa e juros configurados.

### Teste 5: Processar Webhook

1. No painel PagBank, simular evento de pagamento
2. Verificar se webhook foi recebido
3. Verificar se status da cobrança foi atualizado
4. Verificar histórico de webhooks

**Resultado Esperado:** Webhook processado, status atualizado automaticamente.

### Teste 6: Cancelar Cobrança

1. Selecionar uma cobrança pendente
2. Clicar em "Cancelar Cobrança"
3. Confirmar cancelamento
4. Verificar status atualizado

**Resultado Esperado:** Cobrança cancelada no sistema e no PagBank.

### Teste 7: Listar Cobranças

1. Navegar para área de cobranças
2. Aplicar filtros (data, status)
3. Verificar paginação
4. Exportar lista (se disponível)

**Resultado Esperado:** Listagem correta com filtros funcionais.

---

## 🔍 ENDPOINTS DA API

### Base URL
```
https://api.nexusatemporal.com.br/api
```

### Autenticação
Todos os endpoints requerem autenticação via Bearer Token.

**Como obter o token:**
1. POST `/auth/login`
2. Body: `{ "email": "homologacao.pagbank@nexusatemporal.com.br", "password": "PagBank@2024!Homolog" }`
3. Usar o token retornado no header: `Authorization: Bearer {token}`

### Endpoints Disponíveis

#### Configuração
```
POST   /payment-gateway/config
GET    /payment-gateway/config
GET    /payment-gateway/config/pagbank/active
DELETE /payment-gateway/config/pagbank/{environment}
```

#### Clientes
```
POST /payment-gateway/pagbank/customers
GET  /payment-gateway/pagbank/customers/lead/{leadId}
```

#### Cobranças
```
POST /payment-gateway/pagbank/charges
GET  /payment-gateway/pagbank/charges/{id}
GET  /payment-gateway/pagbank/charges
POST /payment-gateway/pagbank/charges/{id}/cancel
POST /payment-gateway/pagbank/charges/{id}/refund
```

#### PIX
```
GET /payment-gateway/pagbank/charges/{id}/pix-qrcode
```

#### Webhooks
```
POST /payment-gateway/webhooks/pagbank
POST /payment-gateway/pagbank/webhook/test
```

---

## 📊 EXEMPLOS DE REQUISIÇÕES

### 1. Criar Cliente

```bash
curl -X POST https://api.nexusatemporal.com.br/api/payment-gateway/pagbank/customers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "e69ca3fc-8b81-43e0-8e0e-63e9bed12eab",
    "name": "Cliente Teste PagBank 1",
    "email": "cliente1.teste@pagbank.com",
    "cpfCnpj": "12345678900",
    "mobilePhone": "11987654321",
    "address": "Rua Teste",
    "addressNumber": "123",
    "city": "São Paulo",
    "state": "SP",
    "postalCode": "01234567"
  }'
```

### 2. Criar Cobrança PIX

```bash
curl -X POST https://api.nexusatemporal.com.br/api/payment-gateway/pagbank/charges \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "{pagbank_customer_id}",
    "billingType": "PIX",
    "value": 150.00,
    "dueDate": "2025-10-20",
    "description": "Teste de cobrança PIX"
  }'
```

### 3. Obter QR Code PIX

```bash
curl -X GET https://api.nexusatemporal.com.br/api/payment-gateway/pagbank/charges/{chargeId}/pix-qrcode \
  -H "Authorization: Bearer {token}"
```

### 4. Cancelar Cobrança

```bash
curl -X POST https://api.nexusatemporal.com.br/api/payment-gateway/pagbank/charges/{chargeId}/cancel \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## 🛠️ CONFIGURAÇÃO DO WEBHOOK NO PAGBANK

Para receber notificações automáticas:

1. Acesse o painel PagBank
2. Navegue para: Configurações → Notificações de Webhook
3. Adicione a URL:
   ```
   https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank
   ```
4. Selecione os eventos:
   - CHARGE.PAID
   - CHARGE.AUTHORIZED
   - CHARGE.CANCELED
   - CHARGE.REFUNDED
   - CHARGE.IN_ANALYSIS
5. Salve a configuração

---

## 🔒 SEGURANÇA

### Criptografia
- ✅ API Keys armazenados com criptografia AES-256
- ✅ Comunicação via HTTPS/TLS
- ✅ Tokens JWT com expiração
- ✅ Validação de webhook signature (quando disponível)

### Isolamento de Dados
- ✅ Multi-tenant (cada tenant tem dados isolados)
- ✅ Usuário de homologação vinculado ao tenant 'default'
- ✅ Dados de teste não afetam dados reais

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas durante os testes:

**Contato Técnico:**
- Email: ti.nexus@nexusatemporal.com.br
- Sistema de Issues: https://github.com/Magdiel-caim/nexusatemporal/issues

**Documentação:**
- CHANGELOG: https://github.com/Magdiel-caim/nexusatemporal/blob/main/CHANGELOG.md
- Release v79: https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v79-pagbank-integration

---

## ✅ CHECKLIST DE HOMOLOGAÇÃO

### Funcionalidades Básicas
- [ ] Login com credenciais fornecidas
- [ ] Acesso ao painel de configuração PagBank
- [ ] Testar conexão com PagBank Sandbox
- [ ] Salvar configuração

### Gestão de Clientes
- [ ] Sincronizar cliente com PagBank
- [ ] Verificar formatação de CPF/CNPJ
- [ ] Verificar formatação de telefone
- [ ] Verificar dados de endereço

### Cobranças
- [ ] Criar cobrança PIX
- [ ] Criar cobrança Boleto
- [ ] Criar cobrança Cartão de Crédito (se aplicável)
- [ ] Consultar status de cobrança
- [ ] Listar cobranças
- [ ] Cancelar cobrança
- [ ] Estornar pagamento

### PIX
- [ ] Gerar QR Code
- [ ] Obter código copia/cola
- [ ] Verificar expiração

### Webhooks
- [ ] Receber notificação de pagamento
- [ ] Atualizar status automaticamente
- [ ] Verificar histórico de webhooks
- [ ] Validar assinatura (se implementado)

### Performance
- [ ] Tempo de resposta das APIs
- [ ] Renderização da interface
- [ ] Processamento de webhooks

### Segurança
- [ ] Autenticação via token
- [ ] Validação de permissões
- [ ] Criptografia de dados sensíveis
- [ ] HTTPS obrigatório

---

## 📅 PRAZO E PROCEDIMENTOS

**Prazo Sugerido para Testes:** 7 dias úteis

**Procedimentos Pós-Homologação:**

1. **Aprovação:**
   - Enviar relatório de homologação
   - Listar funcionalidades aprovadas
   - Listar ajustes necessários (se houver)

2. **Ajustes:**
   - Implementar correções solicitadas
   - Submeter para nova validação

3. **Certificação:**
   - Receber certificação PagBank
   - Ativar ambiente de produção
   - Desativar usuário de homologação

---

## 🎯 OBJETIVOS DA HOMOLOGAÇÃO

- ✅ Validar integração técnica completa
- ✅ Verificar conformidade com APIs PagBank
- ✅ Testar fluxos completos de pagamento
- ✅ Validar processamento de webhooks
- ✅ Garantir segurança e performance
- ✅ Obter certificação oficial PagBank

---

**Documento gerado em:** 2025-10-17
**Versão:** 1.0
**Sistema:** Nexus Atemporal CRM v79

**Desenvolvido com** [Claude Code](https://claude.com/claude-code) 🤖
