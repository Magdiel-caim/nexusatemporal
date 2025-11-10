# Guia de Logs do PagBank para Suporte

## 📋 Visão Geral

Este guia explica como capturar e enviar logs detalhados das requisições à API do PagBank para o suporte técnico. O sistema foi implementado para registrar automaticamente todas as chamadas à API, incluindo requisições, respostas e erros.

## 🔧 Configuração

### 1. Habilitar Logs Detalhados

Para ativar o sistema de logs, adicione a variável de ambiente no seu arquivo `.env`:

```bash
PAGBANK_DETAILED_LOGS=true
```

### 2. Localização dos Logs

Os logs são salvos automaticamente em:

```
/root/nexusatemporalv1/logs/pagbank/
```

Estrutura de arquivos:
```
logs/
└── pagbank/
    ├── pagbank_sandbox_2025-11-10.json
    └── pagbank_production_2025-11-10.json
```

## 📊 Estrutura dos Logs

Cada log contém informações detalhadas:

```json
{
  "timestamp": "2025-11-10T10:30:45.123Z",
  "requestId": "pagbank_1699614645123_abc123",
  "environment": "sandbox",
  "type": "REQUEST",
  "request": {
    "method": "POST",
    "url": "/orders",
    "fullUrl": "https://sandbox.api.pagseguro.com/orders",
    "headers": {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "NexusAtemporal/1.0 (PagBank Payment Integration)",
      "Authorization": "Bearer ***MASKED***"
    },
    "body": {
      "reference_id": "ORDER-123",
      "customer": { "name": "Cliente Teste" }
    }
  },
  "response": {
    "status": 201,
    "statusText": "Created",
    "headers": { "content-type": "application/json" },
    "body": { "id": "ORDE_123456", "status": "PAID" },
    "responseTime": "342ms"
  }
}
```

### Tipos de Log

1. **REQUEST**: Requisição enviada ao PagBank
2. **RESPONSE**: Resposta bem-sucedida recebida
3. **ERROR**: Erro ocorrido durante a chamada

## 🚀 Como Capturar Logs

### Opção 1: Via Console (Logs Resumidos)

Todos os logs aparecem automaticamente no console do servidor:

```
🔵 [PagBank] REQUEST [pagbank_1699614645123_abc123]: {
  method: 'POST',
  url: 'https://sandbox.api.pagseguro.com/orders',
  env: 'sandbox'
}

✅ [PagBank] RESPONSE [pagbank_1699614645123_abc123]: {
  status: 201,
  responseTime: '342ms'
}
```

### Opção 2: Via API (Logs Completos)

Exporte os logs através do endpoint:

```bash
# Exportar todos os logs do dia
GET http://46.202.144.213:3333/api/payment-gateway/pagbank/logs
Authorization: Bearer SEU_TOKEN_JWT

# Exportar logs de uma requisição específica
GET http://46.202.144.213:3333/api/payment-gateway/pagbank/logs?requestId=pagbank_1699614645123_abc123

# Exportar logs de um ambiente específico
GET http://46.202.144.213:3333/api/payment-gateway/pagbank/logs?environment=production
```

### Opção 3: Direto dos Arquivos

Acesse os arquivos JSON diretamente:

```bash
# Ver logs de hoje
cat /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_2025-11-10.json | jq

# Filtrar por requestId
cat /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_2025-11-10.json | jq '.[] | select(.requestId == "pagbank_1699614645123_abc123")'

# Filtrar apenas erros
cat /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_2025-11-10.json | jq '.[] | select(.type == "ERROR")'
```

## 📤 Como Enviar Logs ao Suporte PagBank

### Passo 1: Reproduzir o Erro

1. Habilite `PAGBANK_DETAILED_LOGS=true`
2. Reinicie o servidor
3. Execute a operação que está causando o problema
4. Anote o `requestId` que aparece no console (ex: `pagbank_1699614645123_abc123`)

### Passo 2: Exportar Logs

Use um dos métodos acima para exportar os logs. Recomendamos usar a API:

```bash
curl -X GET "http://46.202.144.213:3333/api/payment-gateway/pagbank/logs?requestId=pagbank_1699614645123_abc123" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -o pagbank_logs_para_suporte.json
```

### Passo 3: Enviar ao Suporte

1. Abra um ticket no suporte do PagBank
2. Anexe o arquivo `pagbank_logs_para_suporte.json`
3. Inclua as seguintes informações:

```
Assunto: Erro na integração da API - [DESCREVA O PROBLEMA]

Ambiente: sandbox/production
Data/Hora do erro: 2025-11-10 10:30:45 UTC
Request ID: pagbank_1699614645123_abc123

Descrição do problema:
[Descreva o que estava tentando fazer e o erro obtido]

Em anexo seguem os logs completos da API incluindo:
- Requisição enviada (com headers e body)
- Resposta recebida (status, headers e body)
- Códigos de erro retornados
- Tempo de resposta

Nota: Dados sensíveis como tokens de API e informações de cartão foram mascarados automaticamente.
```

## 🔒 Segurança dos Logs

### Dados Automaticamente Mascarados

O sistema mascara automaticamente:

- ✅ Token de autorização (Bearer Token)
- ✅ Dados criptografados de cartão
- ✅ Código de segurança do cartão (CVV)
- ✅ CPF/CNPJ

### Exemplo de Mascaramento

**Antes:**
```json
{
  "Authorization": "Bearer 8A9B7C6D5E4F3G2H1I",
  "card": {
    "encrypted": "card_xyz123...",
    "security_code": "123"
  },
  "tax_id": "12345678909"
}
```

**Depois:**
```json
{
  "Authorization": "Bearer ***MASKED***",
  "card": {
    "encrypted": "***MASKED***",
    "security_code": "***"
  },
  "tax_id": "***********"
}
```

## 🧪 Testando o Sistema de Logs

### Script de Teste Rápido

```bash
# 1. Habilitar logs
export PAGBANK_DETAILED_LOGS=true

# 2. Fazer um teste de conexão
curl -X POST "http://46.202.144.213:3333/api/payment-gateway/test/pagbank" \
  -H "Authorization: Bearer SEU_TOKEN"

# 3. Verificar logs gerados
ls -la /root/nexusatemporalv1/logs/pagbank/

# 4. Ver último log
tail -100 /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_$(date +%Y-%m-%d).json | jq
```

## 📋 Informações nos Logs

### Request Log
- ✅ Timestamp (ISO 8601)
- ✅ Request ID único
- ✅ Método HTTP (GET, POST, etc)
- ✅ URL completa
- ✅ Headers da requisição
- ✅ Body da requisição
- ✅ Ambiente (sandbox/production)

### Response Log
- ✅ Status HTTP (200, 201, 400, etc)
- ✅ Status text
- ✅ Headers da resposta
- ✅ Body da resposta
- ✅ Tempo de resposta (em ms)

### Error Log
- ✅ Tipo de erro (VALIDATION_ERROR, TIMEOUT, etc)
- ✅ Código HTTP do erro
- ✅ Mensagem de erro
- ✅ Detalhes do erro retornado pela API
- ✅ Informações de retry (quando aplicável)

## 🔍 Análise de Erros Comuns

### Erro 401 - Authentication Error

```json
{
  "type": "ERROR",
  "error": {
    "statusCode": 401,
    "type": "AUTHENTICATION_ERROR",
    "message": "PagBank API Error (401): Invalid API key"
  }
}
```

**Solução**: Verificar se a API Key está correta e ativa.

### Erro 403 - Authorization Error

```json
{
  "error": {
    "statusCode": 403,
    "type": "AUTHORIZATION_ERROR",
    "message": "PagBank API Error (403): IP not allowed"
  }
}
```

**Solução**: Enviar os logs ao suporte PagBank - eles não bloqueiam IPs na API Web.

### Erro 429 - Rate Limit

```json
{
  "error": {
    "statusCode": 429,
    "type": "RATE_LIMIT_EXCEEDED",
    "retryAfter": "60"
  }
}
```

**Solução**: Aguardar o tempo especificado antes de nova tentativa.

### Timeout

```json
{
  "error": {
    "type": "TIMEOUT",
    "message": "PagBank API Timeout: Request took too long"
  }
}
```

**Solução**: Verificar conexão de rede e aumentar timeout se necessário.

## 🔄 Rotação de Logs

Para evitar que os arquivos cresçam muito, considere implementar rotação de logs:

```bash
# Criar script de rotação
cat > /root/nexusatemporalv1/scripts/rotate-pagbank-logs.sh << 'EOF'
#!/bin/bash
# Compacta logs com mais de 7 dias
find /root/nexusatemporalv1/logs/pagbank -name "*.json" -mtime +7 -exec gzip {} \;

# Remove logs compactados com mais de 30 dias
find /root/nexusatemporalv1/logs/pagbank -name "*.json.gz" -mtime +30 -delete
EOF

chmod +x /root/nexusatemporalv1/scripts/rotate-pagbank-logs.sh

# Adicionar ao crontab (rodar todo dia às 2AM)
# 0 2 * * * /root/nexusatemporalv1/scripts/rotate-pagbank-logs.sh
```

## 💡 Dicas

1. **Sempre anote o Request ID** quando ocorrer um erro
2. **Mantenha logs habilitados em produção** (pelo menos temporariamente ao investigar problemas)
3. **Compartilhe o log completo** com o suporte - eles têm todas as informações necessárias
4. **Verifique o timestamp** para correlacionar com outros logs do sistema
5. **Use jq** para formatar e filtrar logs JSON no terminal

## 📞 Suporte

- **PagBank**: Envie os logs exportados através do ticket de suporte
- **Equipe Interna**: Verifique o console do servidor e arquivos de log

---

**Implementado em**: 2025-11-10
**Versão**: 1.0
**Arquivo de implementação**: `backend/src/modules/payment-gateway/pagbank.service.ts`
