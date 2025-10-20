# 📘 Instruções para Gerar Logs de Homologação PagBank

## 🎯 Objetivo

Este guia explica como gerar os logs de integração que o PagBank solicitou para validar sua implementação.

---

## 📋 Pré-requisitos

1. ✅ Token OAuth do PagBank (Sandbox ou Produção)
2. ✅ Node.js instalado
3. ✅ Acesso ao servidor/ambiente de desenvolvimento

---

## 🚀 Passo a Passo

### 1. Configurar Token do PagBank

Configure a variável de ambiente com seu token:

```bash
export PAGBANK_TOKEN="seu_token_aqui"
```

**Opcionalmente**, configure o ambiente (padrão: sandbox):

```bash
export PAGBANK_ENV="sandbox"  # ou "production"
```

### 2. Instalar Dependências (se necessário)

```bash
cd /root/nexusatemporal/backend
npm install
```

### 3. Executar Script de Geração de Logs

```bash
cd /root/nexusatemporal
npx ts-node backend/scripts/generate-pagbank-homologation-logs.ts
```

### 4. Verificar Logs Gerados

Os logs serão salvos em dois formatos:

- **JSON completo:** `logs/pagbank-homologation-logs.json`
- **Markdown formatado:** `logs/pagbank-homologation-logs.md`

---

## 📊 O Que o Script Faz

O script executa os seguintes testes:

### ✅ Gestão de Clientes
1. Criar cliente no PagBank
2. Listar clientes

### ✅ Métodos de Pagamento
1. **PIX**
   - Criar cobrança PIX
   - Consultar cobrança
   - Obter QR Code

2. **Boleto Bancário**
   - Criar cobrança Boleto
   - Consultar cobrança

3. **Cartão de Crédito**
   - Criar cobrança com parcelamento
   - Consultar cobrança

4. **Cartão de Débito**
   - Criar cobrança
   - Consultar cobrança

### ✅ Registro de Logs
- Captura todas as requisições
- Captura todas as respostas
- Registra timestamps
- Gera documento formatado

---

## 📤 Enviando ao PagBank

### Opção 1: Enviar Documento Markdown (Recomendado)

O arquivo `logs/pagbank-homologation-logs.md` já está formatado e pronto para envio.

1. Abra o arquivo
2. Revise as informações
3. Se necessário, ajuste dados sensíveis
4. Envie por email ou anexe ao ticket do PagBank

### Opção 2: Usar Template Manual

Se preferir, você pode usar o template em `LOGS_HOMOLOGACAO_PAGBANK.md`:

1. Abra o arquivo
2. Preencha as seções com os dados reais
3. Substitua `[DATA_AQUI]`, `[SEU_NOME]`, etc.
4. Envie ao PagBank

---

## 🔍 Exemplo de Saída do Script

```
🏦 Gerando logs de homologação PagBank...

🔧 Ambiente: sandbox
🌐 Base URL: https://sandbox.api.pagseguro.com

👤 Testando criação de cliente...
✅ CLIENTES - Criação - POST /customers - Status: 201

👥 Testando listagem de clientes...
✅ CLIENTES - Listagem - GET /customers?limit=10 - Status: 200

📱 Testando cobrança PIX...
✅ PIX - POST /orders - Status: 201
✅ PIX - Consulta - GET /charges/CHAR_XXX - Status: 200
✅ PIX - QR Code - GET /charges/CHAR_XXX/qrcode - Status: 200

📄 Testando cobrança Boleto...
✅ BOLETO - POST /orders - Status: 201
✅ BOLETO - Consulta - GET /charges/CHAR_XXX - Status: 200

💳 Testando cobrança Cartão de Crédito...
✅ CARTÃO DE CRÉDITO - POST /orders - Status: 201

💳 Testando cobrança Cartão de Débito...
✅ CARTÃO DE DÉBITO - POST /orders - Status: 201

✅ Logs salvos em:
   - JSON: /root/nexusatemporal/logs/pagbank-homologation-logs.json
   - Markdown: /root/nexusatemporal/logs/pagbank-homologation-logs.md

✅ Processo concluído com sucesso!

📧 Próximos passos:
1. Revisar os arquivos gerados em logs/
2. Enviar o arquivo pagbank-homologation-logs.md ao PagBank
3. Aguardar validação da equipe PagBank
```

---

## ⚠️ Possíveis Erros e Soluções

### Erro: "PAGBANK_TOKEN não configurado"

**Solução:**
```bash
export PAGBANK_TOKEN="seu_token_aqui"
```

### Erro: "Authentication failed" (401)

**Possíveis causas:**
- Token inválido ou expirado
- Token de produção usado em sandbox (ou vice-versa)

**Solução:**
1. Verifique se o token está correto
2. Confirme que está usando o ambiente correto
3. Gere um novo token no painel PagBank

### Erro: "Cannot find module" (TypeScript)

**Solução:**
```bash
cd backend
npm install
npm install -D @types/node
```

### Algumas requisições falharam

**Isso é normal!**
- Em sandbox, alguns endpoints podem não estar disponíveis
- Cartões de teste podem ter comportamentos específicos
- O script ainda vai gerar o documento com os logs coletados

---

## 📝 Personalizando os Logs

Se você quiser ajustar os dados de teste, edite o arquivo:
`backend/scripts/generate-pagbank-homologation-logs.ts`

### Exemplo: Alterar dados do cliente

Localize a função `generateCustomerData()` e modifique:

```typescript
function generateCustomerData() {
  return {
    name: 'Seu Nome Aqui',
    email: 'seu.email@dominio.com',
    tax_id: 'SEU_CPF_AQUI',
    // ...
  };
}
```

### Exemplo: Alterar valores das cobranças

Localize cada função de teste e modifique os valores:

```typescript
async function testPixCharge() {
  // ...
  unit_amount: 20000, // Altere para R$ 200,00
  // ...
}
```

---

## 🎯 Checklist Final

Antes de enviar ao PagBank, confirme que:

- [ ] Executou o script com sucesso
- [ ] Gerou os logs em `logs/pagbank-homologation-logs.md`
- [ ] Revisou o documento gerado
- [ ] Verificou que todos os métodos de pagamento foram testados
- [ ] Conferiu se há informações sensíveis para remover
- [ ] Preencheu seus dados de contato no documento

---

## 📞 Suporte

Se tiver problemas, entre em contato:

**Email:** ti.nexus@nexusatemporal.com.br

**Documentação PagBank:**
- https://developer.pagbank.uol.com.br/docs

---

## 📚 Arquivos Relacionados

- `backend/scripts/generate-pagbank-homologation-logs.ts` - Script de geração
- `LOGS_HOMOLOGACAO_PAGBANK.md` - Template manual
- `HOMOLOGACAO_PAGBANK.md` - Documento de homologação completo
- `backend/src/modules/payment-gateway/pagbank.service.ts` - Serviço PagBank

---

**Boa sorte com a homologação!** 🚀
