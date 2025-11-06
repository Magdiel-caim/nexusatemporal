# 🔧 Passo a Passo: Configurar Asaas no Sistema

## ⚠️ Entendi o Problema!

O erro que você está vendo é porque você precisa **SALVAR a configuração primeiro** antes de testar.

---

## ✅ ORDEM CORRETA:

### ❌ ERRADO:
1. Cole a API Key
2. Clica em "Testar Conexão" ← **DÁ ERRO!**

### ✅ CERTO:
1. Cole a API Key
2. Marque "Ativar integração"
3. **Clica em "Salvar Configuração"** ← IMPORTANTE!
4. Depois clica em "Testar Conexão"

---

## 📋 Passo a Passo Detalhado

### 1. Acesse a Tela

URL: `https://one.nexusatemporal.com.br/integracoes/pagamentos`

Ou pelo menu: **Integrações** → **Pagamentos**

---

### 2. Clique na Aba "Asaas"

---

### 3. Selecione "Sandbox (Testes)"

✅ Ambiente: **Sandbox (Testes)**

---

### 4. Cole sua API Key do Asaas

**Como obter a API Key do Asaas:**

1. Acesse: https://sandbox.asaas.com/login
2. Faça login (se não tem conta, crie uma)
3. No menu, clique em seu nome/foto
4. Clique em **"Integração"** ou **"API"**
5. Clique em **"Gerar nova chave de API"**
6. **COPIE** a chave (formato: `$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAw...`)

**Cole no campo "API Key" no sistema**

---

### 5. Configure as Formas de Pagamento

Marque as opções que deseja:
- ✅ Boleto Bancário
- ✅ PIX
- ✅ Cartão de Crédito (se quiser)

---

### 6. **IMPORTANTE: Marque "Ativar integração"**

✅ **Ativar integração** ← NÃO ESQUEÇA!

---

### 7. **SALVE PRIMEIRO!**

🔴 **CLIQUE EM "SALVAR CONFIGURAÇÃO"**

Aguarde a mensagem:
```
✅ Configuração do Asaas salva com sucesso!
```

---

### 8. Agora SIM, Teste a Conexão

Depois de salvar, clique em **"Testar Conexão"**

Aguarde a mensagem:
```
✅ Conexão com Asaas estabelecida com sucesso! | Saldo: R$ 0,00
```

---

## 🔍 Se Ainda Der Erro

### Erro: "Configuration not found"

**Causa:** Você não salvou a configuração primeiro

**Solução:**
1. Volte para a tela
2. Verifique se todos os campos estão preenchidos
3. Marque "Ativar integração"
4. Clique em "Salvar Configuração"
5. Aguarde confirmação
6. Depois teste novamente

---

### Erro: "API Key inválida" ou "Unauthorized"

**Causa:** A API Key está incorreta ou é de produção

**Solução:**
1. Verifique se você está em **Sandbox** (tanto no sistema quanto no Asaas)
2. Gere uma NOVA API Key no sandbox do Asaas
3. Copie ela completamente
4. Cole no sistema (apague a antiga)
5. Salve novamente
6. Teste

---

### Erro: "Erro ao salvar"

**Causa:** Problema de permissão ou conexão

**Solução:**
1. Verifique se você está logado
2. Recarregue a página (F5)
3. Faça logout e login novamente
4. Tente salvar de novo

---

## 🎯 Checklist Final

Antes de testar, verifique:

- [ ] Estou na aba **"Asaas"**
- [ ] Selecionei ambiente **"Sandbox (Testes)"**
- [ ] Colei a API Key completa
- [ ] API Key começa com `$aact_`
- [ ] Marquei pelo menos uma forma de pagamento
- [ ] Marquei **"Ativar integração"** ✅
- [ ] Cliquei em **"SALVAR CONFIGURAÇÃO"** ✅
- [ ] Vi a mensagem de sucesso ✅
- [ ] AGORA posso clicar em "Testar Conexão"

---

## 📸 Exemplo Visual

```
╔═══════════════════════════════════════╗
║  Integração de Pagamentos             ║
╠═══════════════════════════════════════╣
║                                       ║
║  [Asaas] [PagBank]                    ║
║   ^^^^                                ║
║                                       ║
║  Ambiente:                            ║
║  ○ Sandbox (Testes) ✓                 ║
║  ○ Production                         ║
║                                       ║
║  API Key: *******************         ║
║  [$aact_YTU5YTE0M2M2N2I4...]         ║
║                                       ║
║  Formas de Pagamento:                 ║
║  ✓ Boleto Bancário                    ║
║  ✓ PIX                                ║
║  ✓ Cartão de Crédito                  ║
║                                       ║
║  ✓ Ativar integração  ← IMPORTANTE!   ║
║                                       ║
║  [Testar Conexão] [Salvar Config]     ║
║                      ^^^ CLIQUE AQUI  ║
║                          PRIMEIRO!    ║
╚═══════════════════════════════════════╝
```

---

## 💡 Dica Pro

**Sequência correta:**

```
1. Preenche tudo
2. SALVAR ✅
3. Aguarda confirmação
4. TESTAR ✅
```

**NÃO:**
```
1. Preenche
2. TESTAR ❌ ← Dá erro!
```

---

## ✅ Quando Funcionar

Você verá:
```
✅ Conexão com Asaas estabelecida com sucesso!
Saldo: R$ 0,00 (ou o saldo da sua conta sandbox)
```

E pode começar a usar! 🎉

---

## 🆘 Ainda Com Problema?

Me manda:
1. Print da tela com o erro
2. Qual é a mensagem de erro exata
3. Em qual passo você está travado

---

**Criado:** 05/11/2025 01:45
**Testado:** ✅ Funciona!
