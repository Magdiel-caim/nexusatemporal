# 🚀 Como Enviar Logs ao Suporte PagBank - Guia Prático

## Situação
O PagBank solicitou: **"o log de retorno da própria API"**

## ✅ Solução Implementada
Sistema automático de captura de logs de TODAS as requisições e respostas da API PagBank.

---

## 📝 PASSO A PASSO RÁPIDO

### 1️⃣ HABILITAR LOGS (30 segundos)

```bash
# Adicionar no arquivo .env
echo "PAGBANK_DETAILED_LOGS=true" >> /root/nexusatemporalv1/backend/.env
```

### 2️⃣ REINICIAR BACKEND (1 minuto)

```bash
cd /root/nexusatemporalv1/backend
npm run build
npm start
```

### 3️⃣ REPRODUZIR O ERRO (o tempo que levar)

Execute a operação que está causando o problema (ex: criar pedido PIX).

**IMPORTANTE**: Anote o **Request ID** que aparece no console:

```
❌ [PagBank] ERROR [pagbank_1699614492456_x7y8z9]:
   status: 403
   message: Access denied
```

Neste exemplo, o Request ID é: `pagbank_1699614492456_x7y8z9`

### 4️⃣ EXPORTAR LOGS (30 segundos)

Escolha um método:

#### Método A - Via API (RECOMENDADO)

```bash
# Exportar TODOS os logs do dia
curl -X GET "http://46.202.144.213:3333/api/payment-gateway/pagbank/logs" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -o logs_para_pagbank.json

# OU exportar apenas o log do erro específico
curl -X GET "http://46.202.144.213:3333/api/payment-gateway/pagbank/logs?requestId=pagbank_1699614492456_x7y8z9" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -o logs_para_pagbank.json
```

#### Método B - Direto do Arquivo

```bash
# Copiar arquivo do dia
TODAY=$(date +%Y-%m-%d)
cp /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_$TODAY.json logs_para_pagbank.json
```

#### Método C - Script Automático

```bash
# Usar o script de teste
cd /root/nexusatemporalv1
./TESTE_RAPIDO_LOGS.sh
```

### 5️⃣ ENVIAR AO SUPORTE PAGBANK (5 minutos)

#### Template de E-mail

```
Para: suporte@pagbank.com.br
Assunto: [URGENTE] Erro 403 - Bloqueio de IP na API Web

Olá equipe PagBank,

Estou integrando a API Web do PagBank e recebendo erro 403
(Access denied - IP not authorized).

Vocês mencionaram que "Na integração das APIs Web, não é
realizado bloqueio de IP", mas continuo recebendo este erro.

Seguem os logs completos conforme solicitado.

DADOS DO ERRO:
- Request ID: pagbank_1699614492456_x7y8z9
- Data/Hora: 2025-11-10 14:30:31 UTC
- Ambiente: sandbox
- IP do Servidor: 46.202.144.213
- Código HTTP: 403
- Mensagem: "Access denied. Your IP address is not authorized..."

O ARQUIVO ANEXO CONTÉM:
✅ Requisição completa (método, URL, headers, body)
✅ Resposta da API (status, headers, body, erro)
✅ Headers do Cloudflare (CF-Ray)
✅ Tempo de resposta
✅ Request ID para rastreamento

Dados sensíveis foram mascarados automaticamente.

Aguardo retorno urgente para liberar a integração.

Att,
[Seu Nome]
```

**ANEXAR**: `logs_para_pagbank.json`

---

## 🎯 RESUMO: 3 COMANDOS

```bash
# 1. Habilitar logs
export PAGBANK_DETAILED_LOGS=true

# 2. Reproduzir erro e anotar Request ID
# (faça a operação que causa o erro)

# 3. Exportar logs
curl -X GET "http://46.202.144.213:3333/api/payment-gateway/pagbank/logs?requestId=SEU_REQUEST_ID" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -o logs_para_pagbank.json
```

---

## 📋 CHECKLIST ANTES DE ENVIAR

- [ ] `PAGBANK_DETAILED_LOGS=true` está configurado
- [ ] Backend foi reiniciado após habilitar logs
- [ ] Erro foi reproduzido e Request ID foi anotado
- [ ] Arquivo `logs_para_pagbank.json` foi exportado
- [ ] E-mail com template acima foi preparado
- [ ] Arquivo JSON foi anexado ao e-mail
- [ ] Request ID está no corpo do e-mail

---

## 🔍 VERIFICAÇÕES RÁPIDAS

### Ver se logs estão sendo gerados:

```bash
ls -lh /root/nexusatemporalv1/logs/pagbank/
```

### Ver último log:

```bash
TODAY=$(date +%Y-%m-%d)
tail -50 /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_$TODAY.json | jq
```

### Contar quantos logs foram gerados hoje:

```bash
TODAY=$(date +%Y-%m-%d)
jq 'length' /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_$TODAY.json
```

### Ver todos os erros:

```bash
TODAY=$(date +%Y-%m-%d)
jq '.[] | select(.type == "ERROR")' /root/nexusatemporalv1/logs/pagbank/pagbank_sandbox_$TODAY.json
```

---

## ❓ PROBLEMAS COMUNS

### "Arquivo de log não existe"

**Causa**: Logs não foram habilitados ou nenhuma requisição foi feita ainda.

**Solução**:
```bash
export PAGBANK_DETAILED_LOGS=true
cd /root/nexusatemporalv1/backend && npm start
```

### "Authorization required"

**Causa**: Token JWT não foi fornecido ou está inválido.

**Solução**: Obtenha um token válido seguindo o guia `COMO_PEGAR_JWT_TOKEN.md`

### "Logs vazios"

**Causa**: Erro ocorreu antes de habilitar logs detalhados.

**Solução**: Reproduza o erro após habilitar `PAGBANK_DETAILED_LOGS=true`

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **GUIA_LOGS_PAGBANK.md**: Guia completo e detalhado
- **RESUMO_IMPLEMENTACAO_LOGS_PAGBANK.md**: Resumo técnico da implementação
- **EXEMPLO_LOG_PAGBANK.json**: Exemplo de como ficam os logs
- **TESTE_RAPIDO_LOGS.sh**: Script para testar o sistema de logs

---

## 💡 DICA PRO

Configure um alias para facilitar:

```bash
# Adicione no ~/.bashrc
alias pagbank-logs='curl -X GET "http://46.202.144.213:3333/api/payment-gateway/pagbank/logs" -H "Authorization: Bearer $PAGBANK_TOKEN" -o logs_$(date +%Y%m%d_%H%M%S).json'

# Uso:
export PAGBANK_TOKEN="seu_token_aqui"
pagbank-logs
```

---

## 🆘 SUPORTE RÁPIDO

**Erro ao exportar logs?**
```bash
# Verifique se o backend está rodando
curl http://localhost:3333/api/health

# Verifique se existe o arquivo de log
ls -la /root/nexusatemporalv1/logs/pagbank/
```

**Logs não aparecem?**
```bash
# Verifique a variável de ambiente
echo $PAGBANK_DETAILED_LOGS

# Deve mostrar: true
```

---

**Status**: ✅ Pronto para uso
**Criado**: 2025-11-10
**Tempo estimado**: 5-10 minutos total
