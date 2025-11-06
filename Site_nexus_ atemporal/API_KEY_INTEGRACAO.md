# 🔑 API Key para Integração entre Sistemas

**Data de criação:** 05/11/2025
**Propósito:** Autenticação entre Site de Checkout e Sistema Principal

---

## 🔐 API Key Gerada

```
a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
```

**Método de geração:**
```bash
openssl rand -hex 32
```

---

## 📍 Onde Configurar

### 1. Site de Checkout (Backend)
**Arquivo:** `/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api/.env`

```env
ONE_NEXUS_API_KEY=a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
```

✅ **Status:** CONFIGURADO

### 2. Sistema Principal (Backend)
**Local:** Variável de ambiente do serviço em produção

```env
EXTERNAL_API_KEY=a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8
```

⏳ **Status:** PENDENTE - Precisa ser adicionado no ambiente de produção

---

## 🛡️ Uso da API Key

### No Site de Checkout:
Quando o webhook Stripe é acionado, a key é enviada no header:

```typescript
await axios.post(`${ONE_NEXUS_API_URL}/users/external/create-from-payment`, data, {
  headers: {
    'Authorization': `Bearer a61a34a61fc84cb9cccd4ff477518a7b98afc179fb521da278745872cb39f2e8'
  }
});
```

### No Sistema Principal:
Um middleware valida a key antes de processar a requisição:

```typescript
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (apiKey !== process.env.EXTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
```

---

## 🔒 Segurança

### Boas Práticas:
- ✅ Key de 64 caracteres hexadecimais (256 bits)
- ✅ Armazenada em variável de ambiente
- ✅ NUNCA commitada no git
- ✅ Validada em todas as requisições
- ✅ Transmitida via HTTPS

### Rotação de Key:
Recomendamos rotacionar esta key a cada 90 dias ou imediatamente se houver suspeita de comprometimento.

**Como rotacionar:**
1. Gerar nova key: `openssl rand -hex 32`
2. Atualizar nos dois sistemas
3. Reiniciar ambos os serviços
4. Verificar funcionamento
5. Revogar key antiga

---

## 📝 Backup

**Backup criado em:**
```
/root/nexusatemporalv1/Site_nexus_ atemporal/apps/backend-site-api/.env.backup.integration.20251105_XXXXXX
```

---

## ⚠️ IMPORTANTE

**ESTA KEY É SENSÍVEL E DEVE SER TRATADA COMO SENHA!**

- ❌ Não compartilhar em chat/email
- ❌ Não commitar no git
- ❌ Não logar em arquivos
- ✅ Armazenar apenas em variáveis de ambiente
- ✅ Usar gerenciador de secrets em produção

---

**Criado em:** 05/11/2025
**Expira em:** 05/02/2026 (recomendado rotacionar)

© 2025 Nexus Atemporal. Todos os direitos reservados.
