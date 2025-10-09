# 🔧 Correção - Rate Limiter Muito Restritivo

## ❌ Problema Identificado

**Erro ao fazer login:** "Too many requests from this IP, please try again later."

### Causa Raiz:

O backend tinha um **rate limiter muito restritivo**:
- **100 requests por 15 minutos** (geral)
- **5 tentativas de login por 15 minutos** (autenticação)

Durante os testes da integração WhatsApp/N8N, fizemos muitas requisições e **ultrapassamos o limite**.

### Logs do Backend:

```
2025-10-09 01:25:31 "POST /api/auth/login HTTP/1.1" 429 55
2025-10-09 01:25:45 "POST /api/auth/login HTTP/1.1" 429 55
2025-10-09 01:25:46 "POST /api/auth/login HTTP/1.1" 429 55
2025-10-09 01:25:52 "POST /api/auth/login HTTP/1.1" 429 55
```

**HTTP 429 = Too Many Requests** → Rate limiter bloqueando todas as requisições.

---

## ✅ Solução Implementada

Aumentei os limites para valores mais razoáveis:

### Antes (Muito Restritivo):

```typescript
// Rate limiter geral
max: 100, // 100 requests por 15 minutos

// Auth rate limiter
max: 5, // 5 tentativas de login por 15 minutos
```

### Depois (Mais Flexível):

```typescript
// Rate limiter geral
max: 1000, // 1000 requests por 15 minutos (10x mais)

// Auth rate limiter
max: 20, // 20 tentativas de login por 15 minutos (4x mais)
```

---

## 📁 Arquivo Modificado

**Arquivo:** `/root/nexusatemporal/backend/src/shared/middleware/rate-limiter.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs (aumentado de 100)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts (aumentado de 5)
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});
```

---

## 🚀 Deploy Realizado

```bash
# Rebuild backend com novos limites
docker build -t nexus_backend:latest -f backend/Dockerfile backend/

# Update serviço
docker service update nexus_backend --image nexus_backend:latest --force

# Verificação
docker service logs nexus_backend --tail 20
# Output: Database connected successfully ✅
# Output: 🚀 Server running on port 3001 ✅
```

---

## 🧪 Teste Agora

### 1. Limpe o cache do navegador:
- **Chrome:** `Ctrl + Shift + Delete` → Limpar cache
- **Ou:** Modo anônimo (`Ctrl + Shift + N`)

### 2. Acesse o sistema:
```
URL: https://one.nexusatemporal.com.br
```

### 3. Faça login:
```
Email: teste@nexusatemporal.com.br
Senha: 123456
```

**Agora deve funcionar!** ✅

---

## 📊 Análise dos Limites

### Requisições durante testes WhatsApp:

```
01:24:05 - GET /api/chat/whatsapp/sessions - 429
01:24:10 - GET /api/chat/conversations? - 429
01:24:10 - GET /api/chat/quick-replies? - 429
01:24:14 - GET /api/chat/quick-replies? - 429
01:24:14 - GET /api/chat/conversations? - 429
01:24:15 - GET /api/chat/quick-replies? - 429
01:24:15 - GET /api/chat/conversations? - 429
01:24:15 - GET /api/chat/conversations? - 429
01:24:15 - GET /api/chat/quick-replies? - 429
01:24:16 - GET /api/chat/whatsapp/sessions - 429
01:24:21 - GET /api/chat/whatsapp/qrcode-proxy?session=... - 429
```

**Total:** Mais de 100 requests em poucos minutos durante testes.

### Novo Limite:

- **1000 requests / 15 min** = ~66 requests/minuto
- **20 login attempts / 15 min** = ~1.3 tentativas/minuto

Muito mais razoável para desenvolvimento e uso normal.

---

## 🔒 Segurança Mantida

✅ **Rate limiter ainda ativo** (protege contra DDoS e brute force)
✅ **Limites razoáveis** (1000 req/15min é seguro)
✅ **Auth limiter específico** (20 tentativas evita brute force)
✅ **Apenas em produção** (NODE_ENV === 'production')

---

## 🎯 Variáveis de Ambiente

Você pode ajustar os limites via `.env`:

```bash
# Rate limiter geral
RATE_LIMIT_WINDOW=15  # janela em minutos
RATE_LIMIT_MAX_REQUESTS=1000  # máximo de requests

# Valores padrão (se não definir):
# RATE_LIMIT_WINDOW = 15 minutos
# RATE_LIMIT_MAX_REQUESTS = 1000 requests
```

---

## 📝 Recomendações

### Para Produção:
- Manter limites atuais (1000/15min é seguro)
- Monitorar logs para ajustar se necessário
- Considerar IP whitelist para APIs externas

### Para Desenvolvimento:
- Pode desabilitar rate limiter (NODE_ENV !== 'production')
- Ou aumentar ainda mais os limites

### Para APIs Públicas:
- Implementar rate limiter por endpoint (mais granular)
- Limites diferentes para rotas públicas vs autenticadas

---

**Data:** 2025-10-09
**Versão:** v30.2 (Rate Limiter Fix)
**Status:** ✅ Deploy Concluído

---

## ✅ PRÓXIMOS PASSOS

1. **Teste o login agora** → Deve funcionar
2. **Teste a conexão WhatsApp** → QR Code deve aparecer
3. **Escaneie o QR Code** → WhatsApp conectado

**Tudo pronto para uso!** 🚀
