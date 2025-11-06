# 🔑 Como Obter o Token Correto do PagBank

## ⚠️ Problema Atual

O token fornecido está retornando erros:
- `403 Forbidden`
- `Invalid credential`

Isso significa que o token está **incorreto, inválido ou sem permissões**.

---

## 📝 Passo a Passo para Obter Token Correto

### 1️⃣ Acessar o Portal do Desenvolvedor

**URL:** https://dev.pagseguro.uol.com.br/

ou

**URL Alternativa:** https://pagseguro.uol.com.br/

1. Faça login com seu email e senha
2. Se não tem conta, crie uma nova

---

### 2️⃣ Navegar até a Seção de API

Procure por uma das seguintes opções no menu:

- 🔑 **"Credenciais"**
- 🔑 **"API"**
- 🔑 **"Tokens"**
- 🔑 **"Integrações"**
- 🔑 **"Minha Conta"** > **"Preferências"** > **"Integrações"**

---

### 3️⃣ Selecionar Ambiente SANDBOX (Testes)

**IMPORTANTE:** Certifique-se de estar em:

```
🧪 SANDBOX (Testes)
```

**NÃO use:**
```
🚫 PRODUÇÃO (Production)
```

---

### 4️⃣ Gerar ou Copiar Token

#### Opção A: Se já existe um token

1. Procure por uma lista de tokens
2. Identifique o token de **Sandbox/Testes**
3. Clique em **"Copiar"** ou **"Mostrar"**
4. **COPIE TODO O TOKEN**

#### Opção B: Se não existe token

1. Clique em **"Gerar Novo Token"** ou **"Criar Token"**
2. Selecione **Sandbox/Testes**
3. Defina permissões (marque todas se disponível)
4. Clique em **"Gerar"**
5. **COPIE TODO O TOKEN** (só aparece uma vez!)

---

### 5️⃣ Formato Esperado do Token

O token do PagBank geralmente é assim:

```
XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Características:**
- Começa com caracteres alfanuméricos
- Contém hífens separadores
- Tem aproximadamente **80-120 caracteres**
- **NÃO tem espaços**
- **NÃO tem quebras de linha**

**Exemplo fictício:**
```
12345678-1234-1234-1234-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

---

### 6️⃣ Atualizar no Sistema

#### Método 1: Editar Arquivo Diretamente

```bash
cd /root/nexusatemporalv1/backend
nano .env.pagbank
```

**Encontre a linha:**
```env
PAGBANK_SANDBOX_TOKEN=37d43e64-f6a5-4135-bcb3-744895bf2eef8d539ba34fa5b357a68f18acecbd74a29e33-97c3-483a-9a38-fdc810184d34e
```

**Substitua por:**
```env
PAGBANK_SANDBOX_TOKEN=SEU_TOKEN_COMPLETO_AQUI_SEM_ESPACOS
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

#### Método 2: Usar Script

```bash
# Substitua TOKEN_AQUI pelo seu token real
echo 'PAGBANK_SANDBOX_TOKEN=TOKEN_AQUI' >> /tmp/token_temp.txt
```

---

### 7️⃣ Executar Setup Novamente

```bash
npm run setup:pagbank
```

Você deve ver:
```
✅ Configuração Concluída com Sucesso!
```

---

### 8️⃣ Testar Token Rapidamente

```bash
node scripts/test-token.js
```

**Resultado esperado se token VÁLIDO:**
```
✅ Token válido!
Status: 200 ou 404
```

**Se ainda der erro 403:**
- Token está errado
- Token não está ativado
- Token não é de Sandbox

---

### 9️⃣ Executar Testes Completos

```bash
npm run test:pagbank
```

**Resultado esperado:**
```
=== RESUMO DOS TESTES ===
Total de testes: 5
✅ Passou: 3-5
❌ Falhou: 0-2
Taxa de sucesso: 60-100%
```

---

## 🔍 Verificações Importantes

### ✅ Checklist

- [ ] Estou logado no portal PagBank
- [ ] Selecionei ambiente **SANDBOX** (não produção)
- [ ] Gerei ou copiei o token completo
- [ ] Token NÃO tem espaços extras
- [ ] Token NÃO tem quebras de linha
- [ ] Token NÃO tem caracteres estranhos no final (como "e")
- [ ] Atualizei o arquivo `.env.pagbank`
- [ ] Executei `npm run setup:pagbank`
- [ ] Executei `node scripts/test-token.js`
- [ ] Token passou na validação

---

## 🆘 Problemas Comuns

### Problema 1: "Não encontro onde gerar token"

**Solução:**
1. No portal PagBank, procure por: **"Preferências"** > **"Integrações"**
2. Ou acesse diretamente: https://pagseguro.uol.com.br/preferencias/integracoes.jhtml
3. Se não conseguir, entre em contato com suporte PagBank

### Problema 2: "Token continua dando erro 403"

**Possíveis causas:**
1. Token de produção usado em sandbox
2. Token não ativado
3. Conta PagBank não verificada
4. Permissões insuficientes

**Solução:**
- Delete o token antigo no painel
- Gere um NOVO token
- Certifique-se de selecionar **SANDBOX**
- Marque todas as permissões disponíveis

### Problema 3: "Token funciona mas alguns testes falham"

**Isso é normal!** Alguns endpoints podem ter restrições no sandbox. Se pelo menos 60% dos testes passarem, está funcionando.

---

## 📞 Suporte PagBank

Se nada funcionar, entre em contato:

**Email:** atendimento@pagseguro.com.br
**Telefone:** 0800 721 4588
**Portal:** https://dev.pagseguro.uol.com.br/

**Informe:**
- Está usando ambiente **SANDBOX**
- Token retorna **403 Forbidden**
- Precisa de ajuda para gerar token de API válido

---

## 🎯 Resultado Esperado Final

Quando tudo estiver certo:

```bash
$ npm run test:pagbank

=== RESUMO DOS TESTES ===
Total de testes: 5
✅ Passou: 5
❌ Falhou: 0
Taxa de sucesso: 100.0%

✅ 1. Criar Cliente de Teste
✅ 2. Listar Clientes
✅ 3. Criar Pedido com PIX
✅ 4. Consultar Pedido
✅ 5. Criar Checkout
```

---

## 📝 Próximos Passos (Após Token Válido)

1. ✅ Todos os testes passando
2. ✅ Integrar com frontend
3. ✅ Configurar webhooks
4. ✅ Testar fluxo completo
5. ✅ Migrar para produção

---

**Boa sorte! 🚀**

Se tiver dúvidas, consulte a documentação completa em:
- `backend/docs/PAGBANK_TESTING.md`
- `INSTRUCOES_DESENVOLVEDOR_PAGBANK.md`

---

**Última atualização:** 05/11/2025 00:00
