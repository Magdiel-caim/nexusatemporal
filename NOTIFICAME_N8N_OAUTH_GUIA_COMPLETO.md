# NotificaMe + n8n - OAuth Instagram/Messenger via Revenda

**Data**: 2025-10-22
**Versão**: v118-n8n-oauth
**Modelo**: White-Label / Revenda NotificaMe

---

## 🎯 OBJETIVO

Permitir que **SEU CLIENTE** conecte a **PRÓPRIA CONTA** Instagram/Messenger através da **SUA REVENDA** NotificaMe, sem que ele precise ter conta no NotificaMe.

---

## 🔄 FLUXO COMPLETO

```
Cliente clica "Conectar Instagram" no Nexus CRM
    ↓
Nexus CRM → Webhook → n8n ("/notificame/oauth/start")
    ↓
n8n → NotificaMe API (obter URL OAuth do Instagram)
    ↓
n8n → Responde URL OAuth para Nexus
    ↓
Nexus abre popup com login do INSTAGRAM
    ↓
Cliente autoriza SUA CONTA do Instagram
    ↓
Instagram → Callback → n8n ("/notificame/oauth/callback")
    ↓
n8n → NotificaMe API (troca code por token)
    ↓
n8n → Nexus CRM API (notifica conexão bem-sucedida)
    ↓
✅ Instagram conectado! Popup fecha automaticamente
```

---

## 📦 PARTE 1: INSTALAR NODE N8N

### 1.1. Acessar n8n

```bash
# Se n8n estiver no Docker
docker exec -it n8n_container bash

# Ou acesse via interface web
https://seu-n8n.com
```

### 1.2. Instalar Community Node

1. No n8n, vá em **Settings** → **Community Nodes**
2. Clique em **Install**
3. Digite: `n8n-nodes-notificame-hub`
4. Clique em **Install**
5. Aguarde instalação (2-3 minutos)
6. Reinicie o n8n se necessário

**Ou via CLI**:
```bash
cd ~/.n8n
npm install n8n-nodes-notificame-hub
n8n restart
```

---

## 📋 PARTE 2: CONFIGURAR CREDENCIAIS N8N

### 2.1. Adicionar Credencial NotificaMe Hub

1. No n8n, vá em **Credentials** → **New**
2. Procure por "NotificaMe Hub API"
3. Configure:

```
Nome: NotificaMe Hub - Principal
API Key: 0fb8e168-9331-11f0-88f5-0e386dc8b623
Base URL: https://app.notificame.com.br/api
```

4. Clique em **Test** para verificar
5. Se sucesso, clique em **Save**

---

## 🔧 PARTE 3: IMPORTAR WORKFLOW N8N

### 3.1. Criar Novo Workflow

1. No n8n, clique em **Workflows** → **Add workflow**
2. Clique no menu **⋮** (3 pontos) → **Import from File**
3. Selecione o arquivo: `n8n-workflows/notificame-oauth-instagram.json`
4. Clique em **Import**

### 3.2. Configurar Webhooks

O workflow tem **2 webhooks**:

#### Webhook 1: Iniciar OAuth
- **Caminho**: `/notificame/oauth/start`
- **Método**: POST
- **URL completa**: `https://seu-n8n.com/webhook/notificame/oauth/start`

#### Webhook 2: Callback OAuth
- **Caminho**: `/notificame/oauth/callback`
- **Método**: GET
- **URL completa**: `https://seu-n8n.com/webhook/notificame/oauth/callback`

### 3.3. Ativar Workflow

1. No topo do workflow, clique em **Active**
2. Verifique se os 2 webhooks estão com ✅ verde
3. Copie as URLs dos webhooks (você vai precisar!)

---

## 🔌 PARTE 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 4.1. Backend Nexus CRM

Adicione as seguintes variáveis no `.env` do backend:

```bash
# n8n Webhooks
N8N_BASE_URL=https://seu-n8n.com
N8N_WEBHOOK_OAUTH_START=/webhook/notificame/oauth/start
N8N_WEBHOOK_OAUTH_CALLBACK=/webhook/notificame/oauth/callback

# NotificaMe
NOTIFICAME_API_KEY=0fb8e168-9331-11f0-88f5-0e386dc8b623
NOTIFICAME_BASE_URL=https://app.notificame.com.br/api

# Frontend
FRONTEND_URL=https://one.nexusatemporal.com.br
```

### 4.2. Aplicar Variáveis

```bash
# Reiniciar backend
docker service update --env-add N8N_BASE_URL=https://seu-n8n.com nexus_backend
docker service update --env-add N8N_WEBHOOK_OAUTH_START=/webhook/notificame/oauth/start nexus_backend
docker service update --force nexus_backend
```

---

## 💻 PARTE 5: ATUALIZAR CÓDIGO DO NEXUS CRM

Agora vou criar os arquivos de código...

### 5.1. Backend: Endpoint para Iniciar OAuth

**Arquivo**: `backend/src/modules/notificame/notificame.controller.ts`

Adicione este método:

```typescript
/**
 * POST /api/notificame/oauth/start
 * Inicia fluxo OAuth Instagram/Messenger via n8n
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
      res.status(400).json({ error: 'Platform deve ser "instagram" ou "messenger"' });
      return;
    }

    // Chamar webhook n8n para iniciar OAuth
    const n8nUrl = `${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_OAUTH_START}`;

    const response = await axios.post(n8nUrl, {
      platform,
      tenantId,
      userId
    });

    if (!response.data.success) {
      throw new Error('Falha ao iniciar OAuth');
    }

    res.json({
      success: true,
      data: {
        authUrl: response.data.data.authUrl,
        platform
      }
    });
  } catch (error: any) {
    console.error('Error starting OAuth:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/notificame/oauth/complete
 * Recebe notificação do n8n quando OAuth completa
 * (Este endpoint é chamado pelo n8n, não pelo frontend)
 */
async completeOAuth(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId, userId, platform, instanceId, status } = req.body;

    // Aqui você pode salvar no banco de dados
    // Por exemplo, criar registro em uma tabela notificame_instances
    console.log('[NotificaMe OAuth] Conexão completa:', {
      tenantId,
      userId,
      platform,
      instanceId,
      status
    });

    // TODO: Salvar no banco de dados
    // await NotificaMeInstanceRepository.create({
    //   tenant_id: tenantId,
    //   user_id: userId,
    //   platform,
    //   instance_id: instanceId,
    //   status,
    //   connected_at: new Date()
    // });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error completing OAuth:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

### 5.2. Backend: Adicionar Rotas

**Arquivo**: `backend/src/modules/notificame/notificame.routes.ts`

Adicione:

```typescript
// OAuth via n8n
router.post(
  '/oauth/start',
  authenticate,
  (req, res) => notificaMeController.startOAuth(req, res)
);

router.post(
  '/oauth/complete',
  // Sem authenticate - será chamado pelo n8n
  (req, res) => notificaMeController.completeOAuth(req, res)
);
```

### 5.3. Frontend: Service

**Arquivo**: `frontend/src/services/notificaMeService.ts`

Adicione:

```typescript
/**
 * Iniciar OAuth Instagram/Messenger via n8n
 */
async startOAuth(platform: 'instagram' | 'messenger'): Promise<{ success: boolean; data: { authUrl: string; platform: string } }> {
  const { data } = await api.post('/notificame/oauth/start', { platform });
  return data;
}
```

### 5.4. Frontend: Componente

**Arquivo**: `frontend/src/components/integrations/NotificaMeConfig.tsx`

Substitua a função `handleConnectPlatform`:

```typescript
/**
 * Conectar Instagram/Messenger via OAuth n8n
 */
const handleConnectPlatform = async (platform: 'instagram' | 'messenger') => {
  try {
    setTesting(true);

    // 1. Chamar backend que chama n8n
    const result = await notificaMeService.startOAuth(platform);

    if (!result.success || !result.data.authUrl) {
      throw new Error('Falha ao obter URL OAuth');
    }

    const { authUrl } = result.data;

    // 2. Abrir popup com URL OAuth do Instagram/Facebook
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      'NotificaMeOAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      throw new Error('Popup bloqueado. Habilite popups para este site.');
    }

    // 3. Monitorar mensagem do popup quando concluir
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'notificame_oauth_success') {
        setTesting(false);
        toast.success(`${platform === 'instagram' ? 'Instagram' : 'Messenger'} conectado com sucesso!`);
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

    toast.info('Complete a autorização na janela que abriu');
  } catch (error: any) {
    toast.error(`Erro ao conectar ${platform === 'instagram' ? 'Instagram' : 'Messenger'}`, {
      description: error.response?.data?.message || error.message,
    });
    setTesting(false);
  }
};
```

---

## ✅ PARTE 6: TESTAR FLUXO COMPLETO

### 6.1. Verificar n8n

1. Acesse n8n: `https://seu-n8n.com`
2. Abra workflow "NotificaMe - OAuth Instagram/Messenger"
3. Verifique se está **Active** ✅
4. Copie URL do webhook: `/webhook/notificame/oauth/start`

### 6.2. Testar via cURL

```bash
# Testar webhook n8n diretamente
curl -X POST https://seu-n8n.com/webhook/notificame/oauth/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "tenantId": 1,
    "userId": 1
  }'

# Deve retornar:
{
  "success": true,
  "data": {
    "authUrl": "https://www.instagram.com/oauth/authorize?...",
    "platform": "instagram"
  }
}
```

### 6.3. Testar via Interface

1. Acesse: `https://one.nexusatemporal.com.br/integracoes-sociais`
2. Clique em "Conectar Instagram"
3. Deve abrir popup com login do Instagram
4. Faça login com suas credenciais Instagram
5. Autorize a aplicação
6. Popup fecha automaticamente
7. ✅ Vê conexão na lista!

---

## 🐛 TROUBLESHOOTING

### Erro: "URL OAuth não retornada"

**Causa**: n8n não está retornando URL OAuth
**Solução**:
1. Verifique se workflow n8n está ativo
2. Teste endpoint do NotificaMe diretamente:
```bash
curl -X GET "https://app.notificame.com.br/api/oauth/authorize?platform=instagram" \
  -H "apikey: 0fb8e168-9331-11f0-88f5-0e386dc8b623"
```

### Erro: "Popup blocked"

**Causa**: Navegador bloqueou popup
**Solução**: Habilitar popups para `one.nexusatemporal.com.br`

### Erro: n8n 404

**Causa**: Webhook não encontrado
**Solução**:
1. Verificar se workflow está ativo
2. Verificar URL do webhook (clicar no node Webhook para ver URL completa)

### Callback não funciona

**Causa**: URL de callback incorreta
**Solução**:
1. No workflow n8n, verificar node "Preparar OAuth"
2. Conferir se `callbackUrl` está correto
3. Deve ser: `https://seu-n8n.com/webhook/notificame/oauth/callback`

---

## 📊 ARQUITETURA

```
┌─────────────────┐
│  Nexus CRM     │
│  Frontend      │
└────────┬────────┘
         │ 1. Clica "Conectar Instagram"
         ↓
┌─────────────────┐
│  Nexus CRM     │
│  Backend       │
└────────┬────────┘
         │ 2. POST /notificame/oauth/start
         ↓
┌─────────────────┐
│     n8n        │
│   Workflow     │
└────────┬────────┘
         │ 3. GET /oauth/authorize
         ↓
┌─────────────────┐
│  NotificaMe    │
│     API        │
└────────┬────────┘
         │ 4. Retorna URL OAuth Instagram
         ↓
┌─────────────────┐
│   Instagram    │
│     OAuth      │ ← 5. Cliente autoriza aqui!
└────────┬────────┘
         │ 6. Callback com code
         ↓
┌─────────────────┐
│     n8n        │
│  /oauth/       │
│  callback      │
└────────┬────────┘
         │ 7. Troca code por token
         ↓
┌─────────────────┐
│  NotificaMe    │
│     API        │
└────────┬────────┘
         │ 8. Registra conexão
         ↓
┌─────────────────┐
│  Nexus CRM     │
│  Backend       │
│ /oauth/        │
│ complete       │
└────────┬────────┘
         │ 9. Salva no DB
         ↓
✅ Instagram Conectado!
```

---

## 🎯 PRÓXIMOS PASSOS

1. [ ] Instalar node n8n: `n8n-nodes-notificame-hub`
2. [ ] Importar workflow para n8n
3. [ ] Configurar credenciais NotificaMe no n8n
4. [ ] Ativar workflow
5. [ ] Adicionar URLs do n8n nas variáveis de ambiente
6. [ ] Atualizar código backend (controller + rotas)
7. [ ] Atualizar código frontend (service + componente)
8. [ ] Build e deploy v118
9. [ ] Testar fluxo completo
10. [ ] Verificar se Instagram conecta corretamente

---

## 📞 SUPORTE

**NotificaMe Hub**:
- Site: https://app.notificame.com.br
- Suporte: suporte@notificame.com.br

**n8n Community Node**:
- GitHub: https://github.com/oriondesign2015/n8n-nodes-notificame-hub
- Issues: https://github.com/oriondesign2015/n8n-nodes-notificame-hub/issues

---

**Desenvolvido por**: Claude Code - Sessão A
**Data**: 2025-10-22
**Versão**: v118-n8n-oauth
**Status**: 📝 DOCUMENTAÇÃO COMPLETA - PRONTO PARA IMPLEMENTAR

---

> "Agora seu cliente conecta a própria conta Instagram através da sua revenda NotificaMe!"
> — Sessão A, 2025-10-22
