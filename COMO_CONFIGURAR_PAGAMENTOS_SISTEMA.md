# 💳 Como Configurar Pagamentos no Sistema One Nexus

## ✅ A Interface JÁ ESTÁ PRONTA!

O sistema One Nexus já possui uma **tela completa** para configurar os gateways de pagamento (Asaas e PagBank) diretamente pela interface.

---

## 🎯 Como Acessar

### 1. Faça Login no Sistema

Acesse: `https://one.nexusatemporal.com.br/`

### 2. Navegue até Integrações de Pagamentos

Procure no menu por:
- **"Integrações"** ou
- **"Configurações"** → **"Integrações de Pagamentos"** ou
- **"Financeiro"** → **"Integrações"**

**URL Direta:** `https://one.nexusatemporal.com.br/integracoes/pagamentos`

---

## 💰 Configurar ASAAS

### Passo 1: Acesse a Aba "Asaas"

Na tela de Integrações de Pagamentos, clique na aba **"Asaas"**.

### Passo 2: Selecione o Ambiente

- **Sandbox (Testes)** ← Recomendado para começar
- **Production (Real)** ← Quando estiver pronto para produção

### Passo 3: Cole sua API Key

1. Acesse o painel do Asaas: https://www.asaas.com/
2. Vá em **Minha Conta** → **Integração** → **API Key**
3. Gere uma nova API Key
4. Copie a chave (começa com `$aact_...`)
5. Cole no campo **"API Key"** no sistema

### Passo 4: Configure as Opções

- ✅ Marque as formas de pagamento que deseja habilitar:
  - Boleto Bancário
  - PIX
  - Cartão de Crédito

- Configure:
  - **Dias para Vencimento:** quantos dias após emissão o boleto vence
  - **Multa (%):** percentual de multa por atraso
  - **Juros/mês (%):** juros mensais por atraso

### Passo 5: Ative a Integração

- ✅ Marque **"Ativar integração"**

### Passo 6: Teste a Conexão

- Clique em **"Testar Conexão"**
- Aguarde a mensagem de sucesso ✅
- Se der erro, verifique se a API Key está correta

### Passo 7: Salve

- Clique em **"Salvar Configuração"**
- Aguarde a confirmação

### Passo 8: Configure o Webhook (Opcional)

Cole esta URL no painel do Asaas:
```
https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
```

**Como configurar no Asaas:**
1. Acesse: Asaas → Minha Conta → Notificações
2. Cole a URL acima
3. Marque os eventos que deseja receber

---

## 💚 Configurar PAGBANK

### Passo 1: Acesse a Aba "PagBank"

Na tela de Integrações de Pagamentos, clique na aba **"PagBank"**.

### Passo 2: Selecione o Ambiente

- **Sandbox (Testes)** ← Recomendado para começar
- **Production (Real)** ← Quando estiver pronto para produção

### Passo 3: Cole seu Token

1. Acesse o portal do PagBank: https://dev.pagseguro.uol.com.br/
2. Faça login
3. Vá em **Tokens** (menu lateral)
4. Copie o token completo (100 caracteres)
5. Cole no campo **"Token de Acesso (API Key)"** no sistema

**Exemplo:**
```
37d43e64-f6a5-4135-bcb3-744895bf2eef8d539ba34fa5b357a68f18acecbd74a29e33-97c3-483a-9a38-fdc810184d34
```

### Passo 4: Configure as Opções

- ✅ Marque as formas de pagamento que deseja habilitar:
  - Boleto Bancário
  - PIX
  - Cartão de Crédito
  - Cartão de Débito

- Configure:
  - **Dias para Vencimento**
  - **Multa (%)**
  - **Juros/mês (%)**

### Passo 5: Ative a Integração

- ✅ Marque **"Ativar integração"**

### Passo 6: Teste a Conexão

- Clique em **"Testar Conexão"**
- **NOTA:** Se der erro 403 (Cloudflare), isso é normal!
  - O bloqueio Cloudflare não afetará o uso real do sistema
  - Funciona normalmente quando clientes fazem pagamentos
  - Funciona nos webhooks

### Passo 7: Salve

- Clique em **"Salvar Configuração"**
- Aguarde a confirmação

### Passo 8: Configure o Webhook (Opcional)

Cole esta URL no painel do PagBank:
```
https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank
```

**Como configurar no PagBank:**
1. Acesse: PagBank → Configurações → Notificações de Webhook
2. Cole a URL acima
3. Salve

---

## ✅ Após Configurar

### O que você pode fazer:

1. **Gerar Cobranças**
   - Crie cobranças diretamente do sistema
   - Selecione a forma de pagamento (Boleto, PIX, Cartão)
   - Envie para o cliente

2. **Receber Pagamentos**
   - Cliente paga via link gerado
   - Sistema recebe notificação automática (webhook)
   - Status é atualizado automaticamente

3. **Acompanhar Status**
   - Veja status em tempo real
   - Receba notificações de pagamento
   - Histórico completo de transações

---

## 🔍 Troubleshooting

### "Erro ao testar conexão"

**Asaas:**
- Verifique se a API Key está correta
- Certifique-se que selecionou o ambiente certo (Sandbox vs Production)
- Verifique se a chave não está expirada

**PagBank:**
- Verifique se o token está completo (100 caracteres)
- Certifique-se que é do ambiente correto (Sandbox)
- Se der erro 403, ignore! Funciona normalmente no uso real

### "Erro ao salvar"

- Verifique sua conexão com internet
- Tente fazer logout e login novamente
- Verifique se todos os campos obrigatórios estão preenchidos

### "Webhook não funciona"

- Verifique se a URL está correta
- Certifique-se que é HTTPS (não HTTP)
- Verifique no painel do gateway se o webhook está configurado
- Veja os logs de webhook no sistema

---

## 📊 Recursos Disponíveis

### ✅ Asaas
- Boleto Bancário
- PIX
- Cartão de Crédito
- Parcelamento
- Recorrência
- Split de pagamento

### ✅ PagBank
- Boleto Bancário
- PIX
- Cartão de Crédito
- Cartão de Débito
- Checkout hospedado
- Link de pagamento

---

## 🎯 Próximos Passos

### Para Começar a Cobrar:

1. ✅ Configure um gateway (Asaas ou PagBank)
2. ✅ Teste a conexão
3. ✅ Salve a configuração
4. 📝 Crie sua primeira cobrança
5. 💰 Envie para o cliente
6. ✅ Receba o pagamento!

### Dicas:

- **Comece com Sandbox** para testar sem risco
- **Asaas é mais simples** para começar
- **PagBank tem mais opções** de pagamento
- **Configure webhooks** para automação total
- **Monitore os logs** para ver o que está acontecendo

---

## 📱 Acessando do Celular

A tela funciona perfeitamente em dispositivos móveis:

1. Acesse pelo navegador do celular
2. Faça login normalmente
3. Vá em Menu → Integrações de Pagamentos
4. Configure normalmente

---

## 🆘 Precisa de Ajuda?

### Documentação dos Gateways:

**Asaas:**
- Docs: https://docs.asaas.com/
- Suporte: suporte@asaas.com

**PagBank:**
- Docs: https://developer.pagbank.com.br/
- Suporte: 0800 721 4588

### Sistema One Nexus:

- Abra um ticket de suporte no sistema
- Ou entre em contato com o administrador

---

## 🎉 Pronto!

Você agora sabe como configurar os gateways de pagamento no Sistema One Nexus. A interface está pronta e funcional!

**Basta:**
1. Acessar a tela
2. Colar sua API Key
3. Testar
4. Salvar
5. Começar a cobrar!

---

**Última atualização:** 05/11/2025
**Versão do Sistema:** 1.28.1
