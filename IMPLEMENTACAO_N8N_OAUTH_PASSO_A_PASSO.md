# 🚀 Implementação OAuth NotificaMe via n8n - PASSO A PASSO

**Data**: 2025-10-22
**Tempo Estimado**: 30 minutos
**Dificuldade**: ⭐⭐⭐ Intermediário

---

## 📋 ÍNDICE RÁPIDO

1. [Importar Workflow no n8n](#1-importar-workflow-no-n8n) (5 min)
2. [Configurar Credenciais](#2-configurar-credenciais) (3 min)
3. [Ativar e Testar Workflow](#3-ativar-e-testar-workflow) (5 min)
4. [Atualizar Backend Nexus](#4-atualizar-backend-nexus) (10 min)
5. [Atualizar Frontend Nexus](#5-atualizar-frontend-nexus) (5 min)
6. [Testar Fluxo Completo](#6-testar-fluxo-completo) (2 min)

---

## 🎯 O QUE VAMOS FAZER

```
┌─────────────────────────────────────────────────────────────┐
│                      FLUXO OAUTH                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nexus CRM  →  n8n  →  NotificaMe API  →  Instagram OAuth  │
│                  ↓                              ↓           │
│                Processa                    Cliente autoriza │
│                  ↓                              ↓           │
│  Nexus CRM  ←  n8n  ←  NotificaMe API  ←  Instagram        │
│                                                             │
│  ✅ Instagram conectado no Nexus CRM!                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. IMPORTAR WORKFLOW NO N8N

### 1.1. Acessar n8n

```bash
# URL do n8n (verifique sua instalação)
https://seu-n8n.com
```

### 1.2. Importar JSON

1. No n8n, clique em **"Workflows"** (menu lateral)
2. Clique em **"Add workflow"** (botão superior direito)
3. Clique no **menu ⋮** (3 pontos) → **"Import from file"**
4. Selecione o arquivo: `/root/nexusatemporal/n8n-workflows/notificame-oauth-instagram.json`
5. Clique em **"Import"**
6. Renomeie para: **"NotificaMe OAuth Instagram"**
7. Clique em **"Save"**

### 1.3. Verificar Nodes

O workflow deve ter **9 nodes**:

```
FLUXO 1 (Start OAuth):
[1] Webhook: Iniciar OAuth (POST)
[2] Preparar OAuth (Code)
[3] NotificaMe: Obter URL OAuth (HTTP Request)
[4] Responder: URL OAuth (Respond to Webhook)

FLUXO 2 (Callback):
[5] Webhook: Callback OAuth (GET)
[6] Processar Callback (Code)
[7] NotificaMe: Trocar Code por Token (HTTP Request)
[8] Nexus: Notificar Conexão (HTTP Request)
[9] Responder: Sucesso (Respond to Webhook)
```

---

## 2. CONFIGURAR CREDENCIAIS

### 2.1. Criar Credencial NotificaMe

1. Clique em **"Credentials"** (menu lateral)
2. Clique em **"Add Credential"**
3. Busque: **"Header Auth"**
4. Configure:

```
Name: NotificaMe API Key
Name: apikey
Value: 0fb8e168-9331-11f0-88f5-0e386dc8b623
```

5. Clique em **"Save"**

### 2.2. Associar Credencial aos Nodes

Volte ao workflow e configure os nodes **3 e 7**:

**Node 3**: "NotificaMe: Obter URL OAuth"
- Authentication: **Generic Credential Type**
- Generic Auth Type: **Header Auth**
- Credential for Header Auth: **NotificaMe API Key** (selecionar)

**Node 7**: "NotificaMe: Trocar Code por Token"
- Authentication: **Generic Credential Type**
- Generic Auth Type: **Header Auth**
- Credential for Header Auth: **NotificaMe API Key** (selecionar)

### 2.3. Configurar URL do Nexus (Node 8)

**Node 8**: "Nexus: Notificar Conexão"
- URL: `https://api.nexusatemporal.com.br/api/notificame/oauth/complete`
- Authentication: **Nenhuma** (por enquanto)

> **Nota**: Por enquanto vamos deixar sem autenticação. Depois podemos adicionar um token.

---

## 3. ATIVAR E TESTAR WORKFLOW

### 3.1. Ativar Workflow

1. No topo do workflow, clique em **"Inactive"** → muda para **"Active"** ✅
2. Verifique se aparecem 2 webhooks com ✅ verde

### 3.2. Copiar URLs dos Webhooks

**Webhook 1** (Node 1):
- Clique no node "Webhook: Iniciar OAuth"
- Copie a URL que aparece
- Exemplo: `https://seu-n8n.com/webhook/notificame-oauth-start`
- **SALVE ESSA URL!**

**Webhook 2** (Node 5):
- Clique no node "Webhook: Callback OAuth"
- Copie a URL que aparece
- Exemplo: `https://seu-n8n.com/webhook/notificame-oauth-callback`
- **SALVE ESSA URL!**

### 3.3. Testar Webhook com cURL

```bash
# Teste básico do webhook
curl -X POST https://seu-n8n.com/webhook/notificame-oauth-start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "tenantId": 1,
    "userId": 1
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://...",
    "platform": "instagram"
  }
}
```

**Se retornar erro 404 da API NotificaMe**: Não se preocupe por enquanto! Vamos continuar a implementação e testar no final.

---

## 4. ATUALIZAR BACKEND NEXUS

### 4.1. Adicionar Endpoints OAuth

Edite: `backend/src/modules/notificame/notificame.controller.ts`

Adicione estes 2 métodos:

```typescript
/**
 * POST /api/notificame/oauth/start
 * Inicia fluxo OAuth via n8n
 */
async startOAuth(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId) {
      res.status(401).json({ error: 'Tenant não identificado' });
      return;
    }

    const { platform } = req.body; // 'instagram' ou 'messenger'

    if (!platform || !['instagram', 'messenger'].includes(platform)) {
      res.status(400).json({ error: 'Platform inválida' });
      return;
    }

    // Chamar webhook n8n
    const n8nUrl = `${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_OAUTH_START}`;

    const axios = require('axios');
    const response = await axios.post(n8nUrl, {
      platform,
      tenantId,
      userId
    });

    if (!response.data.success) {
      throw new Error('Falha ao iniciar OAuth no n8n');
    }

    res.json({
      success: true,
      data: {
        authUrl: response.data.data.authUrl,
        platform
      }
    });
  } catch (error: any) {
    console.error('[OAuth] Erro ao iniciar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/notificame/oauth/complete
 * Callback do n8n quando OAuth completa
 */
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

    // TODO: Salvar no banco de dados
    // Exemplo: await db.query('INSERT INTO notificame_connections ...')

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

### 4.2. Adicionar Rotas

Edite: `backend/src/modules/notificame/notificame.routes.ts`

Adicione após as rotas existentes:

```typescript
// OAuth via n8n
router.post(
  '/oauth/start',
  authenticate,
  (req, res) => notificaMeController.startOAuth(req, res)
);

router.post(
  '/oauth/complete',
  // SEM authenticate - será chamado pelo n8n
  (req, res) => notificaMeController.completeOAuth(req, res)
);
```

### 4.3. Adicionar Variáveis de Ambiente

Edite: `backend/.env` (ou configure no Docker)

```bash
# n8n OAuth
N8N_BASE_URL=https://seu-n8n.com
N8N_WEBHOOK_OAUTH_START=/webhook/notificame-oauth-start
N8N_WEBHOOK_OAUTH_CALLBACK=/webhook/notificame-oauth-callback
```

**Substitua** `https://seu-n8n.com` pela URL real do seu n8n!

### 4.4. Rebuild Backend

```bash
# Build nova imagem
docker build -t nexus-backend:v119-oauth-n8n -f backend/Dockerfile backend/

# Deploy
docker service update --env-add N8N_BASE_URL=https://seu-n8n.com \
  --env-add N8N_WEBHOOK_OAUTH_START=/webhook/notificame-oauth-start \
  --env-add N8N_WEBHOOK_OAUTH_CALLBACK=/webhook/notificame-oauth-callback \
  --image nexus-backend:v119-oauth-n8n \
  nexus_backend

# Verificar logs
docker service logs nexus_backend --tail 50 --follow
```

---

## 5. ATUALIZAR FRONTEND NEXUS

### 5.1. Adicionar Método no Service

Edite: `frontend/src/services/notificaMeService.ts`

Adicione:

```typescript
/**
 * Iniciar OAuth via n8n
 */
async startOAuth(platform: 'instagram' | 'messenger'): Promise<{
  success: boolean;
  data: { authUrl: string; platform: string };
}> {
  const { data } = await api.post('/notificame/oauth/start', { platform });
  return data;
}
```

### 5.2. Atualizar Componente

Edite: `frontend/src/components/integrations/NotificaMeConfig.tsx`

Localize a função `handleConnectPlatform` e substitua por:

```typescript
/**
 * Conectar Instagram/Messenger via OAuth n8n
 */
const handleConnectPlatform = async (platform: 'instagram' | 'messenger') => {
  try {
    setTesting(true);

    // 1. Chamar backend → n8n
    const result = await notificaMeService.startOAuth(platform);

    if (!result.success || !result.data.authUrl) {
      throw new Error('Falha ao obter URL OAuth');
    }

    const { authUrl } = result.data;
    const platformName = platform === 'instagram' ? 'Instagram' : 'Messenger';

    // 2. Abrir popup OAuth
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      'NotificaMeOAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    if (!popup) {
      throw new Error('Popup bloqueado! Habilite popups neste site.');
    }

    // 3. Monitorar mensagem do popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'notificame_oauth_success') {
        setTesting(false);
        toast.success(`${platformName} conectado com sucesso!`);
        loadInstances(); // Recarregar lista
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // 4. Monitorar fechamento do popup
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setTesting(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);

    toast.info(`Complete a autorização do ${platformName} na janela que abriu`);
  } catch (error: any) {
    const platformName = platform === 'instagram' ? 'Instagram' : 'Messenger';
    toast.error(`Erro ao conectar ${platformName}`, {
      description: error.response?.data?.message || error.message,
    });
    setTesting(false);
  }
};
```

### 5.3. Rebuild Frontend

```bash
# Build nova imagem
docker build -t nexus-frontend:v119-oauth-n8n -f frontend/Dockerfile frontend/

# Deploy
docker service update --image nexus-frontend:v119-oauth-n8n nexus_frontend

# Verificar
docker service ps nexus_frontend
```

---

## 6. TESTAR FLUXO COMPLETO

### 6.1. Verificar Serviços

```bash
# Backend rodando?
curl https://api.nexusatemporal.com.br/health

# n8n rodando?
curl https://seu-n8n.com/webhook/notificame-oauth-start

# Frontend acessível?
curl https://one.nexusatemporal.com.br
```

### 6.2. Testar Interface

1. Acesse: `https://one.nexusatemporal.com.br/integracoes-sociais`
2. Clique no botão **"Conectar Instagram"**
3. **Resultado esperado**:
   - Abre popup com OAuth
   - Mostra tela de login Instagram/Facebook
   - Cliente autoriza
   - Popup fecha automaticamente
   - Toast de sucesso aparece
   - Instagram aparece na lista de conectados

### 6.3. Monitorar Logs

**Terminal 1** - Backend:
```bash
docker service logs nexus_backend --tail 50 --follow
```

**Terminal 2** - n8n (se tiver acesso):
```bash
# Logs do n8n
# Ou monitore via interface: n8n → Workflow → Executions
```

---

## 🐛 TROUBLESHOOTING

### ❌ Erro: "Popup bloqueado"

**Solução**:
- Habilitar popups em `one.nexusatemporal.com.br`
- Chrome: ícone de popup na barra de endereço

### ❌ Erro: "Falha ao iniciar OAuth no n8n"

**Soluções**:
1. Verificar se workflow n8n está **Active** ✅
2. Verificar URLs das variáveis de ambiente (`N8N_BASE_URL`)
3. Testar webhook diretamente com cURL

### ❌ Erro: n8n retorna 404

**Soluções**:
1. Workflow não está ativo → ativar
2. URL do webhook incorreta → verificar no node Webhook
3. n8n não está rodando → verificar `docker ps`

### ❌ Erro: NotificaMe API retorna 404

**Problema**: Endpoint OAuth não existe na API NotificaMe

**Soluções**:
1. **Testar endpoints alternativos** no Node 3 do workflow:
   - Tente: `/api/connect/instagram`
   - Tente: `/api/channels/instagram/authorize`
   - Tente: `/api/instagram/oauth`

2. **Contatar suporte NotificaMe**:
   ```
   Assunto: API OAuth para revendedores

   Olá,

   Sou revendedor e preciso conectar contas Instagram dos meus clientes
   via API. Qual endpoint devo usar para iniciar fluxo OAuth?

   API Key: 0fb8e168-9331-11f0-88f5-0e386dc8b623

   Obrigado!
   ```

### ❌ Callback não funciona

**Soluções**:
1. Verificar Node 2 do workflow (variável `callbackUrl`)
2. Verificar se URL do webhook callback está correta
3. Testar callback manualmente: abrir URL no navegador

---

## 📊 ARQUIVOS IMPORTANTES

### Workflow n8n
```
/root/nexusatemporal/n8n-workflows/notificame-oauth-instagram.json
```

### Documentação Completa
```
/root/nexusatemporal/NOTIFICAME_N8N_OAUTH_GUIA_COMPLETO.md
/root/nexusatemporal/n8n-workflows/GUIA_VISUAL_MONTAR_WORKFLOW.md
/root/nexusatemporal/n8n-workflows/notificame-oauth-manual-setup.md
```

### Backend
```
backend/src/modules/notificame/notificame.controller.ts (métodos startOAuth e completeOAuth)
backend/src/modules/notificame/notificame.routes.ts (rotas /oauth/start e /oauth/complete)
```

### Frontend
```
frontend/src/services/notificaMeService.ts (método startOAuth)
frontend/src/components/integrations/NotificaMeConfig.tsx (handleConnectPlatform)
```

---

## ✅ CHECKLIST FINAL

- [ ] Workflow importado no n8n
- [ ] Credenciais configuradas
- [ ] Workflow ativado (✅ verde)
- [ ] URLs dos webhooks copiadas
- [ ] Variáveis de ambiente adicionadas no backend
- [ ] Métodos OAuth adicionados no controller
- [ ] Rotas OAuth adicionadas
- [ ] Frontend atualizado (service + componente)
- [ ] Backend rebuild e deploy
- [ ] Frontend rebuild e deploy
- [ ] Teste via interface (conectar Instagram)
- [ ] Verificar se popup abre
- [ ] Verificar se OAuth funciona
- [ ] Verificar se callback fecha popup
- [ ] Verificar se conexão aparece na lista

---

## 🎯 RESULTADO FINAL

Se tudo funcionar:

```
✅ Cliente clica "Conectar Instagram"
✅ Abre popup OAuth
✅ Cliente autoriza conta Instagram
✅ Popup fecha automaticamente
✅ Toast de sucesso
✅ Instagram aparece conectado na lista
✅ Pode enviar mensagens via Instagram!
```

---

## 📞 SUPORTE

**Se algo não funcionar**, me avise com:
1. Qual passo deu erro
2. Mensagem de erro completa
3. Logs do backend/n8n (se tiver)

Vou te ajudar a resolver! 💪

---

**Criado por**: Claude Code - Sessão A (continuação)
**Data**: 2025-10-22
**Versão**: v119-oauth-n8n
**Status**: 📋 PRONTO PARA IMPLEMENTAR

---

> "OAuth via n8n: quando a API não coopera, n8n salva o dia!"
> — Sessão A, 2025-10-22
