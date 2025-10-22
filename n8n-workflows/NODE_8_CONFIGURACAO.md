# Configuração Node 8 - "Nexus: Notificar Conexão"

## 🎯 OPÇÃO 1: SEM AUTENTICAÇÃO (Recomendado para começar)

### No n8n - Node 8

1. Clique no node **"Nexus: Notificar Conexão"**
2. Configure:

```
┌────────────────────────────────────────────────┐
│ HTTP Request - Nexus: Notificar Conexão       │
├────────────────────────────────────────────────┤
│ Method: POST                                   │
│ URL: https://api.nexusatemporal.com.br/api/   │
│      notificame/oauth/complete                 │
│                                                │
│ Authentication: None ⬅️ SELECIONE ISSO         │
│                                                │
│ Send Body: ON                                  │
│ Body Content Type: JSON                        │
│ Specify Body: Using JSON                       │
│                                                │
│ JSON Body:                                     │
│ {                                              │
│   "tenantId": "={{ $json.tenantId }}",         │
│   "userId": "={{ $json.userId }}",             │
│   "platform": "={{ $json.platform }}",         │
│   "instanceId": "={{ $json.instance_id }}",    │
│   "status": "connected"                        │
│ }                                              │
└────────────────────────────────────────────────┘
```

3. Clique em **"Test step"**

### No Backend - Routes

Arquivo: `backend/src/modules/notificame/notificame.routes.ts`

```typescript
// OAuth callback do n8n (SEM authenticate)
router.post(
  '/oauth/complete',
  (req, res) => notificaMeController.completeOAuth(req, res)
);
```

### No Backend - Controller

Arquivo: `backend/src/modules/notificame/notificame.controller.ts`

```typescript
async completeOAuth(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId, userId, platform, instanceId, status } = req.body;

    console.log('[OAuth] Conexão completa:', {
      tenantId,
      userId,
      platform,
      instanceId,
      status
    });

    // TODO: Salvar no banco
    // Exemplo:
    // await db.query(`
    //   INSERT INTO notificame_connections
    //   (tenant_id, user_id, platform, instance_id, status, connected_at)
    //   VALUES ($1, $2, $3, $4, $5, NOW())
    // `, [tenantId, userId, platform, instanceId, status]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('[OAuth] Erro ao completar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

**Pronto!** ✅

---

## 🔒 OPÇÃO 2: COM TOKEN (Mais seguro - implementar depois)

### Passo 1: Gerar Token

```bash
# No servidor
openssl rand -hex 32

# Resultado (exemplo):
# f4a8b2c9d3e1f0a7b5c8d2e9f1a3b6c4d7e0f2a5b8c1d4e7f0a3b6c9d2e5f8a1
```

### Passo 2: Criar Credencial no n8n

1. n8n → **Credentials** → **Add Credential**
2. Busque: **"Header Auth"**
3. Configure:

```
Name: Nexus Backend Token
Header Name: X-N8N-Token
Value: f4a8b2c9d3e1f0a7b5c8d2e9f1a3b6c4...  (cole seu token)
```

4. **Save**

### Passo 3: Configurar Node 8

```
Authentication: Generic Credential Type
  ↳ Generic Auth Type: Header Auth
    ↳ Credential: Nexus Backend Token
```

### Passo 4: Validar no Backend

Arquivo: `backend/src/modules/notificame/notificame.controller.ts`

```typescript
async completeOAuth(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validar token n8n
    const token = req.headers['x-n8n-token'];
    const expectedToken = process.env.N8N_CALLBACK_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      console.error('[OAuth] Token inválido:', {
        received: token ? '***' : 'none',
        expected: expectedToken ? 'configured' : 'not configured'
      });
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // 2. Processar OAuth
    const { tenantId, userId, platform, instanceId, status } = req.body;

    console.log('[OAuth] Conexão completa (autenticada):', {
      tenantId,
      userId,
      platform,
      instanceId,
      status
    });

    // TODO: Salvar no banco

    res.json({ success: true });
  } catch (error: any) {
    console.error('[OAuth] Erro ao completar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

### Passo 5: Adicionar Variável de Ambiente

Arquivo: `backend/.env` (ou Docker Swarm)

```bash
N8N_CALLBACK_TOKEN=f4a8b2c9d3e1f0a7b5c8d2e9f1a3b6c4d7e0f2a5b8c1d4e7f0a3b6c9d2e5f8a1
```

Docker:
```bash
docker service update \
  --env-add N8N_CALLBACK_TOKEN=f4a8b2c9d3e1f0a7b5c8d2e9f1a3b6c4... \
  nexus_backend
```

---

## 🧪 TESTAR

### Teste Manual (cURL)

```bash
# SEM token (Opção 1)
curl -X POST https://api.nexusatemporal.com.br/api/notificame/oauth/complete \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "userId": 1,
    "platform": "instagram",
    "instanceId": "inst_123456",
    "status": "connected"
  }'

# COM token (Opção 2)
curl -X POST https://api.nexusatemporal.com.br/api/notificame/oauth/complete \
  -H "Content-Type: application/json" \
  -H "X-N8N-Token: f4a8b2c9d3e1f0a7b5c8d2e9f1a3b6c4..." \
  -d '{
    "tenantId": 1,
    "userId": 1,
    "platform": "instagram",
    "instanceId": "inst_123456",
    "status": "connected"
  }'
```

**Resposta esperada**:
```json
{
  "success": true
}
```

---

## 🎯 RECOMENDAÇÃO FINAL

1. **Comece com OPÇÃO 1** (sem token) para testar rapidamente
2. **Teste o fluxo completo**
3. **Depois implemente OPÇÃO 2** (com token) para produção

---

**Criado por**: Claude Code - Sessão A
**Data**: 2025-10-22
