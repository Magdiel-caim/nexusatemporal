# 🔑 COMO PEGAR O JWT TOKEN DO SISTEMA

**Data:** 2025-11-07
**Para:** Testes com Postman/Insomnia

═══════════════════════════════════════════════════════════════════════════

## ⚠️ IMPORTANTE: O QUE É O JWT TOKEN?

O JWT Token é o token de **autenticação do seu sistema Nexus**, NÃO é a API Key do Asaas ou PagBank!

- ✅ **JWT correto:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...` (muito longo)
- ❌ **Asaas API Key:** `$aact_hmlg_...` (NÃO use isso!)
- ❌ **PagBank Token:** `Bearer XXXX...` (NÃO use isso!)

═══════════════════════════════════════════════════════════════════════════

## 📋 MÉTODO 1: VIA DEVTOOLS DO NAVEGADOR (RECOMENDADO)

### Passo 1: Abra o sistema no navegador
```
https://one.nexusatemporal.com.br/
```

### Passo 2: Faça login normalmente
- Digite seu email e senha
- Clique em Entrar
- Aguarde até estar na página principal (Dashboard)

### Passo 3: Abra o DevTools (F12)
**Chrome/Edge:**
- Pressione `F12` no teclado
- Ou clique com botão direito → "Inspecionar"
- Ou Menu (⋮) → Mais Ferramentas → Ferramentas do Desenvolvedor

**Firefox:**
- Pressione `F12` no teclado
- Ou clique com botão direito → "Inspecionar Elemento"

### Passo 4: Vá para a aba "Network" (Rede)
- No DevTools que abriu, clique na aba **"Network"** ou **"Rede"**
- Se não aparecer nada, recarregue a página (F5)

### Passo 5: Faça qualquer ação no sistema
Exemplo:
- Clique em "Pacientes"
- Ou clique em "Dashboard"
- Ou navegue para qualquer página do menu

Você verá várias requisições aparecendo na aba Network.

### Passo 6: Encontre uma requisição para a API
Procure por uma requisição que tenha:
- URL começando com: `https://api.nexusatemporal.com.br/api/...`

Exemplos de URLs que você pode procurar:
```
https://api.nexusatemporal.com.br/api/auth/me
https://api.nexusatemporal.com.br/api/patients
https://api.nexusatemporal.com.br/api/dashboard/stats
```

### Passo 7: Clique na requisição
- Clique em qualquer uma dessas requisições
- Um painel lateral irá abrir à direita

### Passo 8: Vá para a aba "Headers"
No painel lateral que abriu, clique em **"Headers"** ou **"Cabeçalhos"**

### Passo 9: Procure por "Request Headers"
Role para baixo até encontrar a seção:
```
Request Headers
```

### Passo 10: Encontre o "Authorization"
Procure pela linha que diz:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJj...
```

### Passo 11: COPIE O TOKEN COMPLETO
**IMPORTANTE:** Copie a parte **DEPOIS** do "Bearer ", incluindo todo o texto até o final!

Exemplo:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJ0ZW5hbnRJZCI6ImMwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsImlhdCI6MTczMDk4NTYwMCwiZXhwIjoxNzMxMDcyMDAwfQ.xxxxxxxxxxxxx
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                  COPIE DAQUI EM DIANTE (não copie o "Bearer ")
```

═══════════════════════════════════════════════════════════════════════════

## 📋 MÉTODO 2: VIA CONSOLE DO NAVEGADOR (MAIS RÁPIDO!)

### Passo 1: Abra o sistema e faça login
```
https://one.nexusatemporal.com.br/
```

### Passo 2: Abra o Console (F12 → Console)
- Pressione `F12`
- Clique na aba **"Console"**

### Passo 3: Cole este comando e pressione Enter:
```javascript
localStorage.getItem('token') || sessionStorage.getItem('token') || document.cookie.match(/token=([^;]+)/)?.[1]
```

### Passo 4: O token aparecerá no console!
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJ0ZW5hbnRJZCI6ImMwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsImlhdCI6MTczMDk4NTYwMCwiZXhwIjoxNzMxMDcyMDAwfQ.xxxxxxxxxxxxx"
```

### Passo 5: Copie o token SEM as aspas
Copie o conteúdo que apareceu, **SEM** as aspas `"` do começo e fim.

═══════════════════════════════════════════════════════════════════════════

## 📋 MÉTODO 3: VIA APPLICATION/STORAGE (ALTERNATIVO)

### Passo 1: Abra DevTools (F12)

### Passo 2: Vá para a aba "Application" ou "Armazenamento"
- No Chrome: aba **"Application"**
- No Firefox: aba **"Armazenamento"** ou **"Storage"**

### Passo 3: No menu lateral esquerdo, expanda:
```
Local Storage
  └─ https://one.nexusatemporal.com.br
```

### Passo 4: Procure pela chave "token"
Você verá algo como:
```
Key: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJj...
```

### Passo 5: Copie o Value (valor)
Clique duas vezes no Value e copie (Ctrl+C)

═══════════════════════════════════════════════════════════════════════════

## ✅ COMO USAR O TOKEN NO POSTMAN

### Configuração:

1. **Abra sua requisição no Postman**
2. **Clique na aba "Authorization"**
3. **Selecione "Type: Bearer Token"**
4. **Cole o JWT que você copiou** no campo "Token"
5. **Salve**

### Ou via Header manual:

1. **Vá na aba "Headers"**
2. **Adicione um novo header:**
   ```
   Key: Authorization
   Value: Bearer SEU_JWT_TOKEN_AQUI
   ```
   (IMPORTANTE: Deixe o espaço entre "Bearer" e o token!)

═══════════════════════════════════════════════════════════════════════════

## 🧪 TESTAR SE O TOKEN FUNCIONA

### Via Postman:

```
GET https://api.nexusatemporal.com.br/api/auth/me

Headers:
  Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

**✅ Resposta esperada (200):**
```json
{
  "id": "c0000000-0000-0000-0000-000000000000",
  "email": "admin@nexus.com.br",
  "name": "Administrador",
  ...
}
```

**❌ Se der 401:**
- Token inválido ou expirado
- Refaça o login e pegue um novo token

═══════════════════════════════════════════════════════════════════════════

## 🚀 SCRIPT BASH AUTOMÁTICO

Salve isso como `pegar_jwt.sh` e execute:

```bash
#!/bin/bash
echo "🔐 EXTRAIR JWT TOKEN - NEXUS"
echo "═══════════════════════════════════════"
echo ""
echo "Cole seu Email:"
read EMAIL
echo ""
echo "Cole sua Senha:"
read -s PASSWORD
echo ""

echo "🔄 Fazendo login..."

RESPONSE=$(curl -s -X POST "https://api.nexusatemporal.com.br/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login!"
  echo "Resposta:"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "✅ JWT TOKEN EXTRAÍDO COM SUCESSO!"
echo "═══════════════════════════════════════"
echo ""
echo "$TOKEN"
echo ""
echo "═══════════════════════════════════════"
echo ""
echo "📋 COPIE O TOKEN ACIMA E USE NO POSTMAN:"
echo "Authorization: Bearer $TOKEN"
echo ""
```

### Como usar:
```bash
chmod +x pegar_jwt.sh
./pegar_jwt.sh
```

═══════════════════════════════════════════════════════════════════════════

## 📝 EXEMPLO COMPLETO NO POSTMAN

### Requisição: Criar Cliente Asaas

```
POST https://api.nexusatemporal.com.br/api/payment-gateway/asaas/customers

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJj...
  Content-Type: application/json

Body (JSON):
{
  "name": "João da Silva",
  "email": "joao@example.com",
  "cpfCnpj": "12345678901",
  "phone": "11987654321"
}
```

**✅ Resultado Esperado (200):**
```json
{
  "id": "cus_123456789",
  "name": "João da Silva",
  "email": "joao@example.com",
  ...
}
```

═══════════════════════════════════════════════════════════════════════════

## ⏱️ TOKEN EXPIRADO?

Se você receber erro **401 Unauthorized** mesmo com o token correto:

1. **O token pode ter expirado** (geralmente expira em 24h)
2. **Solução:** Refaça o login no sistema e pegue um novo token
3. **Atualize** o token no Postman

═══════════════════════════════════════════════════════════════════════════

## 🆘 TROUBLESHOOTING

### "Não estou vendo nenhuma requisição na aba Network"
**Solução:** Recarregue a página (F5) com a aba Network aberta

### "Não tem Authorization nos Headers"
**Solução:** Verifique se está logado. Faça logout e login novamente

### "O token é muito grande, não cabe"
**Solução:** É normal! JWT tokens são longos (200-500 caracteres). Copie tudo mesmo

### "Dá erro de CORS no Postman"
**Solução:** CORS não afeta Postman/Insomnia, apenas navegadores. Ignore

### "localStorage.getItem('token') retorna null"
**Solução:** Tente:
```javascript
// Tente essas variações:
localStorage.getItem('auth_token')
localStorage.getItem('accessToken')
localStorage.getItem('jwt')
sessionStorage.getItem('token')
```

═══════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST

- [ ] Abri o sistema no navegador
- [ ] Fiz login com sucesso
- [ ] Abri DevTools (F12)
- [ ] Encontrei uma requisição para api.nexusatemporal.com.br
- [ ] Copiei o token da aba Headers → Authorization
- [ ] Colei no Postman como Bearer Token
- [ ] Testei com GET /api/auth/me
- [ ] Recebi resposta 200 OK

═══════════════════════════════════════════════════════════════════════════

**🎉 PRONTO! Agora você pode testar todas as APIs de pagamento!**

Qualquer dúvida, me avise! 🚀
