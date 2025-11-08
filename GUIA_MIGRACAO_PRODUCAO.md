# 🚀 GUIA DE MIGRAÇÃO PARA PRODUÇÃO - PAGAMENTOS ASAAS

**Data:** 2025-11-07
**Status:** Preparando para produção

═══════════════════════════════════════════════════════════════════════════

## ⚠️ IMPORTANTE: LEIA ANTES DE COMEÇAR

Migrar para produção significa que você vai:
- ✅ Receber pagamentos REAIS
- ✅ Dinheiro REAL entrará na sua conta Asaas
- ⚠️ Asaas cobrará taxas reais (PIX: 0,99%, Boleto: R$ 3,49, Cartão: ~4%)
- ⚠️ Webhooks precisam funcionar perfeitamente
- ⚠️ Erros podem afetar clientes reais

**RECOMENDAÇÃO:** Faça um teste com R$ 1,00 primeiro!

═══════════════════════════════════════════════════════════════════════════

## 📋 CHECKLIST PRÉ-PRODUÇÃO

### ✅ Verificações Obrigatórias:

- [ ] Conta Asaas verificada e aprovada
- [ ] Dados bancários cadastrados no Asaas
- [ ] Documentos enviados (RG, CNH, Comprovante endereço)
- [ ] Conta Asaas com status "Ativa"
- [ ] API Key de PRODUÇÃO gerada
- [ ] Webhook URL acessível publicamente
- [ ] SSL/HTTPS funcionando (api.nexusatemporal.com.br)
- [ ] Backup do banco de dados feito
- [ ] Logs do backend funcionando
- [ ] Monitoramento ativo

### ⚠️ Verificações Recomendadas:

- [ ] Sistema de alertas configurado
- [ ] Backup automático configurado
- [ ] Política de refund definida
- [ ] Suporte ao cliente preparado
- [ ] Termos de uso e privacidade atualizados
- [ ] Timeout de APIs configurado adequadamente
- [ ] Rate limiting configurado

═══════════════════════════════════════════════════════════════════════════

## 🔑 PASSO 1: OBTER API KEY DE PRODUÇÃO

### No Painel Asaas (Produção):

1. **Acesse:** https://www.asaas.com/ (SEM "sandbox")

2. **Faça login** com suas credenciais de produção

3. **Verifique o status da conta:**
   - Menu: Conta → Status
   - Deve estar: ✅ "Ativa" ou "Aprovada"
   - Se estiver "Pendente": Aguarde aprovação (1-2 dias úteis)

4. **Gerar API Key:**
   ```
   Menu: Integrações → API Key
   ou
   Menu: Configurações → Integrações → Chaves de API
   ```

5. **Clique em "Gerar nova chave de API"**

6. **Copie a chave completa:**
   ```
   Formato: $aact_YTU5YTE0M2M2N2I4MTliNzRhYTNhN2ZhMGI...
   ```

7. **⚠️ IMPORTANTE:** Salve em local seguro! Você não conseguirá ver novamente!

8. **Permissões recomendadas:**
   ```
   ✅ Cobranças (Criar, Editar, Deletar)
   ✅ Clientes (Criar, Editar)
   ✅ Assinaturas (se for usar)
   ✅ Transferências (se for usar)
   ✅ Notificações
   ```

═══════════════════════════════════════════════════════════════════════════

## 🔧 PASSO 2: CONFIGURAR PRODUÇÃO NO SISTEMA

### Opção A: Via Frontend (Recomendado)

1. **Acesse:** https://one.nexusatemporal.com.br/integracoes/pagamentos

2. **Aba Asaas**

3. **Ambiente:**
   - ⚠️ **MUDE PARA:** ☑️ Produção

4. **API Key:**
   - Cole a API Key de PRODUÇÃO (começa com $aact_...)

5. **Formas de Pagamento:**
   ```
   ✅ PIX
   ✅ Boleto Bancário
   ✅ Cartão de Crédito (se tiver aprovado)
   ✅ Cartão de Débito (se tiver aprovado)
   ```

6. **✅ Ativar integração** (marque!)

7. **Clique em "Salvar Configuração"**

8. **⚠️ NÃO clique em "Testar Conexão" ainda!**
   - Vamos testar de forma controlada depois

---

### Opção B: Via Banco de Dados (Manual)

Se preferir atualizar direto no banco:

```sql
-- Verificar configuração atual
SELECT
  id,
  gateway,
  environment,
  "isActive",
  "createdAt"
FROM payment_configs
WHERE gateway = 'asaas'
  AND "tenantId" = 'c0000000-0000-0000-0000-000000000000';

-- Criar nova configuração de produção
-- (ou atualizar a existente mudando environment)
```

**NÃO recomendado** - Use o frontend!

═══════════════════════════════════════════════════════════════════════════

## 🔔 PASSO 3: CONFIGURAR WEBHOOK EM PRODUÇÃO

### No Painel Asaas (Produção):

1. **Menu:** Configurações → Webhooks (ou Notificações)

2. **URL do Webhook:**
   ```
   https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
   ```

   ⚠️ **IMPORTANTE:**
   - URL DEVE ser HTTPS (SSL)
   - Não pode ser localhost
   - Deve estar acessível publicamente

3. **Eventos para ativar:**
   ```
   ✅ PAYMENT_CREATED
   ✅ PAYMENT_UPDATED
   ✅ PAYMENT_CONFIRMED
   ✅ PAYMENT_RECEIVED
   ✅ PAYMENT_OVERDUE
   ✅ PAYMENT_DELETED
   ✅ PAYMENT_REFUNDED
   ✅ PAYMENT_RESTORED
   ✅ PAYMENT_AWAITING_RISK_ANALYSIS
   ✅ PAYMENT_APPROVED_BY_RISK_ANALYSIS
   ✅ PAYMENT_REPROVED_BY_RISK_ANALYSIS
   ```

4. **Versão da API:** v3

5. **Status:** ✅ Ativo

6. **Salvar**

7. **Testar Webhook (Opcional):**
   - Se houver botão "Enviar Teste"
   - Clique e verifique nos logs se chegou

═══════════════════════════════════════════════════════════════════════════

## 🧪 PASSO 4: TESTE DE CONEXÃO INICIAL

### Via Frontend:

1. **Acesse:** https://one.nexusatemporal.com.br/integracoes/pagamentos

2. **Aba Asaas**

3. **Clique em "Testar Conexão"**

### ✅ Resultado Esperado:

```
✅ Conexão com Asaas estabelecida com sucesso!
✅ Saldo: R$ XXX,XX
✅ Ambiente: production
```

### ❌ Se der erro:

```
Erro 401: API Key inválida
  → Verifique se copiou a chave completa
  → Verifique se é chave de PRODUÇÃO (não sandbox)

Erro 403: Sem permissão
  → Verifique permissões da API Key
  → Regenere a chave com permissões corretas
```

═══════════════════════════════════════════════════════════════════════════

## 🧪 PASSO 5: TESTE COM VALOR MÍNIMO (R$ 1,00)

**⚠️ IMPORTANTE:** Faça um teste com R$ 1,00 REAL antes de usar com clientes!

### 5.1 Criar Cliente de Teste

**Via Postman:**

```
POST https://api.nexusatemporal.com.br/api/payment-gateway/customers

Headers:
  Authorization: Bearer SEU_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "gateway": "asaas",
  "name": "Teste Producao Eu Mesmo",
  "email": "SEU_EMAIL_REAL@gmail.com",
  "cpfCnpj": "SEU_CPF_REAL",
  "phone": "SEU_TELEFONE_REAL",
  "mobilePhone": "SEU_CELULAR_REAL"
}
```

**⚠️ Use SEUS dados REAIS!**

### 5.2 Criar Cobrança PIX de R$ 1,00

```
POST https://api.nexusatemporal.com.br/api/payment-gateway/charges

Headers:
  Authorization: Bearer SEU_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "gateway": "asaas",
  "customer": "cus_XXXXXXXXXX",  ← ID do cliente criado acima
  "billingType": "PIX",
  "value": 1.00,
  "dueDate": "2025-11-08",
  "description": "Teste de producao - R$ 1,00"
}
```

### 5.3 Obter QR Code

```
GET https://api.nexusatemporal.com.br/api/payment-gateway/charges/asaas/{chargeId}/pix

Headers:
  Authorization: Bearer SEU_JWT_TOKEN
```

### 5.4 Pagar de Verdade

1. **Copie o código PIX** (payload)
2. **Abra seu banco/app de pagamentos**
3. **PIX → Copia e Cola**
4. **Cole o código**
5. **Pague R$ 1,00**

### 5.5 Verificar se Webhook Chegou

```bash
docker service logs nexus_backend -f | grep -i webhook
```

**✅ Deve aparecer:**
```
Asaas webhook received: { event: 'PAYMENT_RECEIVED' }
Webhook processed successfully
```

### 5.6 Verificar no Banco

```sql
SELECT
  "gatewayChargeId",
  status,
  "paymentDate",
  "webhookReceived"
FROM payment_charges
WHERE "gatewayChargeId" = 'pay_XXXXXXXXXX';
```

**✅ Deve mostrar:**
```
status: RECEIVED
webhookReceived: true
paymentDate: 2025-11-07
```

### 5.7 Verificar Saldo no Asaas

1. **Acesse:** https://www.asaas.com/
2. **Dashboard → Saldo**
3. **Deve aparecer:** R$ 0,99 (R$ 1,00 - taxa de 0,99%)

═══════════════════════════════════════════════════════════════════════════

## ✅ PASSO 6: VALIDAÇÃO FINAL

Se o teste de R$ 1,00 funcionou:

- [x] Cliente criado em produção
- [x] Cobrança PIX gerada
- [x] QR Code funcionou
- [x] Pagamento processado
- [x] Webhook recebido
- [x] Status atualizado no banco
- [x] Dinheiro apareceu no Asaas

**🎉 SISTEMA ESTÁ EM PRODUÇÃO!**

═══════════════════════════════════════════════════════════════════════════

## 🔄 PASSO 7: MONITORAMENTO CONTÍNUO

### Logs para Monitorar:

```bash
# Webhooks em tempo real
docker service logs nexus_backend -f | grep -i webhook

# Erros
docker service logs nexus_backend -f | grep -i error

# Pagamentos
docker service logs nexus_backend -f | grep -i payment
```

### Queries Úteis:

```sql
-- Cobranças pendentes (mais de 24h)
SELECT * FROM payment_charges
WHERE status = 'PENDING'
  AND "createdAt" < NOW() - INTERVAL '24 hours';

-- Webhooks com falha
SELECT * FROM payment_webhooks
WHERE status = 'failed'
  AND "createdAt" > NOW() - INTERVAL '7 days';

-- Total recebido hoje
SELECT
  COUNT(*) as quantidade,
  SUM(value) as total
FROM payment_charges
WHERE status = 'RECEIVED'
  AND "paymentDate" = CURRENT_DATE;
```

═══════════════════════════════════════════════════════════════════════════

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
| Produção  | $aact_YTU5YTE0M2M2N2I4MTli...        |

### Taxas:

| Tipo           | Sandbox | Produção          |
|----------------|---------|-------------------|
| PIX            | R$ 0,00 | 0,99% (mín R$ 1)  |
| Boleto         | R$ 0,00 | R$ 3,49           |
| Cartão Crédito | R$ 0,00 | 4,99% + R$ 0,49   |
| Cartão Débito  | R$ 0,00 | 2,99% + R$ 0,49   |

### Prazos de Repasse:

| Tipo           | Prazo para receber      |
|----------------|-------------------------|
| PIX            | D+1 (próximo dia útil)  |
| Boleto         | D+1 (próximo dia útil)  |
| Cartão Crédito | D+30                    |
| Cartão Débito  | D+30                    |

═══════════════════════════════════════════════════════════════════════════

## 🚨 TROUBLESHOOTING PRODUÇÃO

### Webhook não chega:

1. Verifique URL: https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
2. Teste se está acessível: `curl -X POST https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas`
3. Verifique SSL válido: https://www.ssllabs.com/ssltest/
4. Verifique firewall não está bloqueando IPs do Asaas

### Pagamento não aparece:

1. Verifique no painel Asaas se foi processado
2. Verifique logs: `docker service logs nexus_backend --tail 100`
3. Verifique tabela payment_webhooks no banco
4. Reprocesse webhook manualmente se necessário

### API Key inválida:

1. Gere nova chave no painel Asaas
2. Atualize no sistema (frontend ou banco)
3. Teste conexão novamente

═══════════════════════════════════════════════════════════════════════════

## 📊 DASHBOARD RECOMENDADO

Crie consultas para monitorar:

```sql
-- Dashboard Diário
SELECT
  status,
  COUNT(*) as quantidade,
  SUM(value) as total,
  AVG(value) as ticket_medio
FROM payment_charges
WHERE "createdAt"::date = CURRENT_DATE
GROUP BY status;

-- Webhooks Processados Hoje
SELECT
  status,
  COUNT(*) as quantidade
FROM payment_webhooks
WHERE "createdAt"::date = CURRENT_DATE
GROUP BY status;
```

═══════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST FINAL

Antes de liberar para clientes:

- [ ] Teste R$ 1,00 passou
- [ ] Webhook funcionando
- [ ] Status atualizando corretamente
- [ ] Saldo apareceu no Asaas
- [ ] Logs sem erros
- [ ] Backup funcionando
- [ ] Monitoramento ativo
- [ ] Equipe treinada

═══════════════════════════════════════════════════════════════════════════

**🚀 PRONTO PARA PRODUÇÃO!**

Após seguir todos os passos, seu sistema estará 100% operacional em produção!

**BOA SORTE! 💚**
