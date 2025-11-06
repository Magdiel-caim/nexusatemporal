# 👨‍💻 Instruções para o Desenvolvedor - PagBank

## 🎯 Objetivo

Este documento contém instruções específicas para você, desenvolvedor, configurar e validar a integração PagBank com suas credenciais.

---

## 📋 Pré-requisitos

1. ✅ Acesso ao portal PagBank: https://dev.pagseguro.uol.com.br/
2. ✅ Token de API Sandbox gerado
3. ✅ Email cadastrado no PagBank
4. ✅ Banco de dados PostgreSQL rodando
5. ✅ Node.js instalado

---

## 🚀 Passo a Passo - Configuração

### 1. Obter suas Credenciais PagBank

```
1. Acesse: https://dev.pagseguro.uol.com.br/
2. Faça login com seu email e senha
3. Navegue até: "Credenciais" ou "API"
4. Clique em "Gerar Token" (ambiente Sandbox)
5. Copie o token gerado (exemplo: AABB123456...)
```

**⚠️ IMPORTANTE:** Guarde este token em local seguro. Você vai precisar dele no próximo passo.

---

### 2. Configurar Variáveis de Ambiente

```bash
# Navegue até a pasta backend
cd /root/nexusatemporalv1/backend

# Copie o arquivo de exemplo
cp .env.pagbank.example .env.pagbank

# Edite o arquivo
nano .env.pagbank
```

**Preencha com SUAS credenciais:**

```env
# Suas Credenciais PagBank
PAGBANK_SANDBOX_TOKEN=COLE_SEU_TOKEN_AQUI
PAGBANK_DEVELOPER_EMAIL=seu-email@example.com

# Webhook Secret (opcional por enquanto)
PAGBANK_WEBHOOK_SECRET=

# Database (já deve estar configurado)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=postgres
DB_PASSWORD=postgres

# Encryption Key (já deve existir no .env principal)
ENCRYPTION_KEY=your-strong-encryption-key-change-me-in-production
```

**Salve o arquivo:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### 3. Executar Setup Automático

```bash
# Ainda na pasta backend
cd /root/nexusatemporalv1/backend

# Executar script de configuração
npm run setup:pagbank-test
```

**O script vai solicitar:**

```
=== Configuração de Ambiente de Testes PagBank ===

Email do desenvolvedor: [DIGITE SEU EMAIL]
API Key (Token) do PagBank Sandbox: [COLE SEU TOKEN]
Webhook Secret (opcional, pressione Enter para pular): [PRESSIONE ENTER]

=== Informações do Ambiente ===
Ambiente: SANDBOX (Testes)
URL Base: https://sandbox.api.pagseguro.com
Email: seu-email@example.com
API Key: AABB123456...

Confirmar configuração? (s/n): s
```

**Digite 's' e pressione Enter**

**Resultado esperado:**
```
✅ Ambiente de testes configurado com sucesso!
ID da configuração: 1
Tenant ID: test-environment
User ID: developer-seu-email

📄 Arquivo de dados de teste criado: /root/nexusatemporalv1/backend/test-data/pagbank-test-config.json

=== Próximos Passos ===
1. Execute o script de validação: npm run test:pagbank
2. Acesse os endpoints de teste em: http://localhost:3000/api/payment-gateway/test/pagbank
3. Consulte a documentação em: backend/docs/PAGBANK_TESTING.md
```

---

### 4. Validar Integração

```bash
# Executar testes automatizados
npm run test:pagbank
```

**Resultado esperado:**
```
=== Inicializando Teste de Integração PagBank ===

✓ Configuração de teste carregada
  Ambiente: sandbox
  Email: seu-email@example.com
  Base URL: https://sandbox.api.pagseguro.com

✓ Serviço PagBank inicializado

=== Iniciando Bateria de Testes ===

📋 Executando: 1. Criar Cliente de Teste
✅ PASSOU (1234ms)
   Resposta: {"id":"CUST_123456","name":"Cliente Teste PagBank"...

📋 Executando: 2. Listar Clientes
✅ PASSOU (567ms)
   Resposta: {"customers":[...]...

📋 Executando: 3. Criar Pedido com PIX
✅ PASSOU (2345ms)
   Resposta: {"id":"ORDE_789012","charges":[...]...

📋 Executando: 4. Consultar Pedido
✅ PASSOU (456ms)
   Resposta: {"id":"ORDE_789012"...

📋 Executando: 6. Criar Checkout (Página de Pagamento)
✅ PASSOU (1890ms)
   Resposta: {"id":"CHECK_345678"...


=== RESUMO DOS TESTES ===

Total de testes: 6
✅ Passou: 6
❌ Falhou: 0
Taxa de sucesso: 100.0%

=== Detalhes ===

✅ 1. Criar Cliente de Teste
   Duração: 1234ms
✅ 2. Listar Clientes
   Duração: 567ms
✅ 3. Criar Pedido com PIX
   Duração: 2345ms
✅ 4. Consultar Pedido
   Duração: 456ms
✅ 5. Criar Pedido com Cartão de Crédito (Simulado)
   Duração: 123ms
✅ 6. Criar Checkout (Página de Pagamento)
   Duração: 1890ms

📄 Relatório salvo em: /root/nexusatemporalv1/backend/test-results/pagbank-test-2025-11-04T12-00-00-000Z.json
```

---

## ✅ Se Tudo Passou - SUCESSO! 🎉

Sua integração PagBank está funcionando corretamente!

### Próximos Passos:

1. **Testar via API REST** (opcional)
2. **Configurar Webhooks** (próxima etapa)
3. **Integrar com Frontend**
4. **Migrar para Produção** (quando estiver pronto)

---

## 🧪 Testar via API REST (Opcional)

### Iniciar o servidor

Em um terminal separado:

```bash
cd /root/nexusatemporalv1/backend
npm run dev
```

### Obter Token de Autenticação

Você precisa de um token JWT para testar. Faça login no sistema:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email-sistema@example.com",
    "password": "sua-senha"
  }'
```

Copie o token da resposta.

### Testar Conexão PagBank

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "PagBank connection successful",
  "gateway": "pagbank",
  "environment": "sandbox",
  "customersCount": 1
}
```

### Criar Pagamento PIX de Teste

```bash
curl -X POST http://localhost:3000/api/payment-gateway/test/pagbank/pix \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "description": "Meu teste de PIX"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "orderId": "ORDE_123456",
  "chargeId": "CHAR_789012",
  "status": "WAITING",
  "amount": 10000,
  "qrCode": {
    "text": "00020126580014br.gov.bcb.pix...",
    "links": [...]
  }
}
```

---

## ❌ Troubleshooting

### Erro: "PAGBANK_SANDBOX_TOKEN is not defined"

**Causa:** Variável de ambiente não carregada.

**Solução:**
```bash
# Verifique se o arquivo existe
cat /root/nexusatemporalv1/backend/.env.pagbank

# Se não existir, crie novamente
cp .env.pagbank.example .env.pagbank
nano .env.pagbank
```

### Erro: "Configuration not found"

**Causa:** Setup não foi executado ou falhou.

**Solução:**
```bash
npm run setup:pagbank-test
```

### Erro: "Unauthorized" ou "401"

**Causas possíveis:**
1. Token PagBank inválido
2. Token expirado
3. Token de produção usado em sandbox

**Solução:**
```bash
# 1. Verifique o token
cat .env.pagbank | grep PAGBANK_SANDBOX_TOKEN

# 2. Gere um novo token no painel PagBank
# 3. Atualize o .env.pagbank
nano .env.pagbank

# 4. Execute o setup novamente
npm run setup:pagbank-test
```

### Erro: "Database connection failed"

**Causa:** PostgreSQL não está rodando ou credenciais incorretas.

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar
sudo systemctl start postgresql

# Testar conexão manual
psql -h localhost -U postgres -d nexus_crm
```

### Erro: "Timeout" durante testes

**Causa:** API PagBank lenta ou problema de rede.

**Solução:**
1. Verificar conexão com internet
2. Tentar novamente em alguns minutos
3. Verificar status da API: https://status.pagseguro.uol.com.br/

---

## 📞 Onde Buscar Ajuda

### Documentação do Projeto

1. **Guia Completo:** `backend/docs/PAGBANK_TESTING.md`
2. **Quick Start:** `PAGBANK_QUICK_START.md`
3. **Resumo Técnico:** `PAGBANK_VALIDATION_SETUP.md`

### Documentação PagBank

- **API Reference:** https://developer.pagbank.com.br/reference
- **Guias:** https://developer.pagbank.com.br/docs
- **Portal Dev:** https://dev.pagseguro.uol.com.br/

### Suporte PagBank

- **Email:** atendimento@pagseguro.com.br
- **Telefone:** 0800 721 4588
- **Chat:** No portal do desenvolvedor

---

## 📝 Checklist de Validação

Marque conforme for completando:

- [ ] ✅ Obtive minhas credenciais PagBank
- [ ] ✅ Configurei `.env.pagbank` com meus dados
- [ ] ✅ Executei `npm run setup:pagbank-test`
- [ ] ✅ Setup completou com sucesso
- [ ] ✅ Executei `npm run test:pagbank`
- [ ] ✅ Todos os testes passaram (100%)
- [ ] ✅ Testei via API REST (opcional)
- [ ] ✅ Entendi a estrutura do código
- [ ] ✅ Li a documentação completa

---

## 🎯 Próximas Etapas

Após completar a validação:

### 1. Configurar Webhooks (Próxima Sessão)

Para receber notificações em tempo real do PagBank.

### 2. Integrar com Frontend

Criar interface para pagamentos.

### 3. Testes com Usuários Reais (Sandbox)

Simular fluxo completo de compra.

### 4. Preparar para Produção

Obter credenciais de produção e configurar ambiente final.

---

## 💡 Dicas Importantes

1. **Mantenha o Token Seguro**
   - Nunca commite `.env.pagbank` no Git
   - Use variáveis de ambiente em produção

2. **Use Sempre Sandbox Primeiro**
   - Teste tudo antes de ir para produção
   - Sandbox não cobra valores reais

3. **Monitore os Logs**
   - Verifique `test-results/` após cada teste
   - Acompanhe webhooks em `/api/payment-gateway/webhooks/logs`

4. **Mantenha Documentação Atualizada**
   - Anote mudanças e configurações
   - Documente problemas e soluções

---

## 🎉 Parabéns!

Você configurou com sucesso o ambiente de testes PagBank!

**Seu sistema agora pode:**
- ✅ Criar clientes no PagBank
- ✅ Gerar pagamentos PIX
- ✅ Criar checkouts hospedados
- ✅ Processar pagamentos com cartão
- ✅ Receber webhooks (após configurar)

---

**Data:** 04/11/2025
**Status:** ✅ Pronto para uso
**Ambiente:** Sandbox (Testes)

**Próxima revisão:** Antes de migrar para produção
