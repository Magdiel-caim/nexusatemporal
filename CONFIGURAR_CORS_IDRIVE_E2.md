# 🔧 COMO CONFIGURAR CORS NO IDRIVE E2

**Data:** 03/11/2025
**Objetivo:** Permitir que o frontend carregue imagens do bucket S3

---

## 🎯 POR QUE PRECISA DE CORS?

Atualmente as imagens enviadas pelo WhatsApp são salvas no S3 (IDrive E2), mas o frontend não consegue carregar porque:

1. **Erro no console:**
   ```
   Erro ao carregar imagem: https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/...
   ```

2. **Causa:** Navegador bloqueia requisições cross-origin (CORS) por segurança

3. **Solução:** Configurar CORS no bucket para permitir origem `https://one.nexusatemporal.com.br`

---

## 📋 PASSO A PASSO - CONFIGURAÇÃO MANUAL

### 1. Acessar Painel IDrive E2

1. Acesse: https://www.idrive.com/e2/
2. Faça login com suas credenciais
3. Vá para: **"S3 Management Console"** ou similar

### 2. Localizar o Bucket

- **Nome do bucket:** `backupsistemaonenexus`
- Clique no bucket para abrir configurações

### 3. Configurar CORS

Procure uma opção como:
- "**CORS Configuration**"
- "**Cross-Origin Resource Sharing**"
- "**Permissions**" → "**CORS**"

### 4. Adicionar Regra CORS

Cole a seguinte configuração XML ou JSON (depende do painel):

#### Formato XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>https://one.nexusatemporal.com.br</AllowedOrigin>
    <AllowedOrigin>http://localhost:5173</AllowedOrigin>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <ExposeHeader>Content-Length</ExposeHeader>
    <ExposeHeader>Content-Type</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

#### Formato JSON (se o painel aceitar):
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "https://one.nexusatemporal.com.br",
        "http://localhost:5173",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### 5. Salvar Configuração

- Clique em **"Save"** ou **"Apply"**
- Aguarde alguns segundos para propagar

### 6. Verificar ACL (Permissões Públicas)

Certifique-se de que o bucket ou objetos têm **ACL pública de leitura**:

- Vá em: **Permissions** → **Access Control List (ACL)**
- Verifique se há permissão: **"Everyone (public access)"** → **Read**

Se não houver, adicione:
- **Grantee:** Everyone / Public
- **Permissions:** Read Object

---

## 🧪 TESTAR A CONFIGURAÇÃO

### Teste 1: Via cURL
```bash
curl -I "https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/session_01k8ypeykyzcxjxp9p59821v56/2025-11-03T01-01-08-840Z-false_554198549563@c.us_A5C9E99C736C3AB6A3E0292C17BE9C58.jpg" \
  -H "Origin: https://one.nexusatemporal.com.br"
```

**Resultado esperado:**
```
HTTP/2 200
access-control-allow-origin: https://one.nexusatemporal.com.br
access-control-allow-methods: GET, HEAD
access-control-max-age: 3600
```

### Teste 2: No Frontend

1. Abra: https://one.nexusatemporal.com.br
2. Vá no módulo Chat
3. Abra uma conversa que tenha imagem
4. Abra DevTools (F12) → Console
5. **Deve carregar sem erros de CORS**

---

## 🔄 ALTERNATIVA: Proxy via Backend

Se não conseguir configurar CORS no IDrive E2, podemos implementar um proxy:

### Como funciona:
1. Frontend solicita: `https://api.nexusatemporal.com.br/proxy/s3/image?url=...`
2. Backend baixa imagem do S3
3. Backend retorna para frontend

### Implementação:

```typescript
// backend/src/modules/chat/proxy-s3.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import fetch from 'node-fetch';

@Controller('proxy/s3')
export class ProxyS3Controller {
  @Get('image')
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();

      res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  }
}
```

### Frontend:
```typescript
// Mudar de:
<img src="https://o0m5.va.idrivee2-26.com/..." />

// Para:
<img src="https://api.nexusatemporal.com.br/proxy/s3/image?url=https://o0m5.va.idrivee2-26.com/..." />
```

---

## 📝 CHECKLIST

- [ ] Acessei painel IDrive E2
- [ ] Localizei bucket `backupsistemaonenexus`
- [ ] Configurei CORS com as origens permitidas
- [ ] Verifiquei ACL pública de leitura
- [ ] Salvei configuração
- [ ] Aguardei 1-2 minutos para propagar
- [ ] Testei via cURL (retorna headers CORS)
- [ ] Testei no frontend (imagens carregam)
- [ ] Sem erros no console do navegador

---

## 🆘 TROUBLESHOOTING

### Problema: Painel IDrive E2 não tem opção CORS
**Solução:** Implementar proxy via backend (ver seção "Alternativa" acima)

### Problema: CORS configurado mas ainda dá erro
**Verificar:**
1. Cache do navegador (Ctrl + Shift + R para hard refresh)
2. URL correta (https, não http)
3. ACL pública está ativa
4. Aguardar propagação (até 5 minutos)

### Problema: Imagem retorna 403 Forbidden
**Solução:**
- Verificar ACL pública
- Verificar se objeto específico tem permissão de leitura
- Pode ser necessário tornar **cada objeto** público

---

## 📞 PRÓXIMOS PASSOS APÓS CORS

Depois de configurar CORS com sucesso:

1. ✅ Testar imagens antigas (que já estão no S3)
2. ✅ Enviar nova imagem pelo WhatsApp
3. ✅ Verificar se nova imagem carrega no frontend
4. ✅ Prosseguir com Problema #1 (corrigir imagens antigas com base64)

---

**Qualquer dúvida, estou à disposição! 🚀**
