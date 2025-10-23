# 🔌 Como Conectar Novos Canais Instagram/Messenger ao Sistema

**Data**: 2025-10-22
**Versão**: v120.1
**Problema**: Como permitir que usuários conectem suas próprias contas Instagram/Messenger pelo Nexus CRM?

---

## 🎯 SITUAÇÃO ATUAL

### ✅ O que JÁ funciona:
- **4 canais Instagram conectados** (via painel NotificaMe)
- **API para listar canais**: `GET /channels`
- **API para enviar mensagens**: `POST /channels/instagram/messages`
- **Workflow n8n ativo**: Envio de mensagens funcional
- **UI no frontend**: Exibe canais conectados

### ❌ O que NÃO existe:
- **API para conectar novos canais** via OAuth programático
- **Endpoint de autorização** (`/oauth/authorize` não existe)
- **Operação de conexão** no node n8n

---

## 🔍 DESCOBERTAS DA INVESTIGAÇÃO

### 1. APIs Disponíveis

**✅ Funcionam:**
```bash
# URL Principal (usada pelo node n8n)
https://api.notificame.com.br/v1

# URL Hub (usada atualmente)
https://hub.notificame.com.br/v1

# Endpoints que funcionam:
GET  /channels                        # Listar canais conectados
POST /channels/instagram/messages     # Enviar mensagem Instagram
POST /channels/messenger/messages     # Enviar mensagem Messenger
GET  /resale                          # Listar subcontas (retorna [])
```

**❌ NÃO funcionam (404):**
```bash
GET  /oauth/authorize                 # Iniciar OAuth
POST /channels/create                 # Criar canal
POST /connect/instagram               # Conectar Instagram
```

### 2. Node n8n NotificaMe Hub

**Operações Instagram disponíveis:**
- ✅ Enviar Texto
- ✅ Enviar Áudio
- ✅ Enviar Arquivo
- ✅ Comentário
- ✅ Enviar Botões
- ✅ Novo Post (feed, stories, reels)
- ✅ Listar Postagens
- ❌ **NÃO HÁ** operação para conectar canais

**Autenticação:**
- Header: `X-Api-Token`
- Token: `0fb8e168-9331-11f0-88f5-0e386dc8b623`

### 3. Conclusão

A conexão de canais Instagram/Messenger é feita **EXCLUSIVAMENTE pelo painel web** do NotificaMe Hub:
- URL: https://hub.notificame.com.br/
- Processo manual via interface gráfica
- OAuth gerenciado pelo NotificaMe

---

## 💡 SOLUÇÕES POSSÍVEIS

## SOLUÇÃO 1: iFrame do Painel NotificaMe (RECOMENDADA)

**Descrição**: Incorporar o painel NotificaMe Hub dentro do Nexus CRM.

### Vantagens
- ✅ **Implementação rápida** (30 minutos)
- ✅ **UX integrada** (usuário não sai do Nexus)
- ✅ **Usa interface oficial** (sem problemas de compatibilidade)
- ✅ **Suporta todos os canais** (Instagram, Messenger, WhatsApp, etc.)
- ✅ **Manutenção zero** (NotificaMe atualiza)

### Desvantagens
- ⚠️ Requer login no painel NotificaMe
- ⚠️ UX não é 100% nativa

### Implementação

#### Backend: Endpoint para Token de Sessão

```typescript
// backend/src/modules/notificame/notificame.controller.ts

/**
 * GET /api/notificame/panel-token
 * Gera token de sessão para iframe
 */
async getPanelToken(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;

    // Retornar token configurado (ou buscar do banco por tenant)
    const apiToken = process.env.NOTIFICAME_API_KEY;

    res.json({
      success: true,
      data: {
        token: apiToken,
        panelUrl: 'https://hub.notificame.com.br',
        // Pode adicionar parâmetros para pré-autenticar
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

#### Frontend: Componente de Conexão

```typescript
// frontend/src/components/integrations/NotificaMeConnect.tsx

import React, { useState, useEffect } from 'react';
import { notificaMeService } from '../../services/notificaMeService';

export const NotificaMeConnect: React.FC = () => {
  const [panelUrl, setPanelUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPanelUrl();
  }, []);

  const loadPanelUrl = async () => {
    try {
      const result = await notificaMeService.getPanelToken();
      if (result.success) {
        // Pode passar token como query param se API permitir
        const url = `${result.data.panelUrl}/channels`;
        setPanelUrl(url);
      }
    } catch (error) {
      console.error('Erro ao carregar painel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notificame-connect">
      <div className="panel-header">
        <h3>Conectar Novo Canal</h3>
        <p>Use o painel abaixo para conectar Instagram, Messenger ou WhatsApp</p>
      </div>

      {loading ? (
        <div className="loading">Carregando painel...</div>
      ) : (
        <iframe
          src={panelUrl}
          width="100%"
          height="800px"
          frameBorder="0"
          title="NotificaMe Hub"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      )}

      <div className="panel-footer">
        <button onClick={() => window.location.reload()}>
          Atualizar Lista de Canais
        </button>
        <a
          href="https://hub.notificame.com.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir Painel em Nova Aba
        </a>
      </div>
    </div>
  );
};
```

#### Integração na Página

```typescript
// frontend/src/pages/IntegracoesSociaisPage.tsx

import { NotificaMeConnect } from '../components/integrations/NotificaMeConnect';

// ...

<Tabs>
  <Tab label="Canais Conectados">
    <NotificaMeChannels />
  </Tab>

  <Tab label="Conectar Novo Canal">
    <NotificaMeConnect />
  </Tab>
</Tabs>
```

### Tempo de Implementação
- **30 minutos** (criar componente + adicionar aba)

---

## SOLUÇÃO 2: Fluxo de Solicitação Manual

**Descrição**: Criar fluxo onde usuário solicita, admin conecta manualmente, sistema registra.

### Vantagens
- ✅ **Controle total** (admin aprova cada conexão)
- ✅ **Segurança** (evita conexões não autorizadas)
- ✅ **Rastreabilidade** (histórico de solicitações)

### Desvantagens
- ❌ **Processo manual** (admin precisa conectar)
- ❌ **Demora** (não é instantâneo)
- ❌ **Escalabilidade** (não funciona para muitos usuários)

### Implementação

#### 1. Tabela de Solicitações

```sql
CREATE TABLE channel_connection_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  platform VARCHAR(20) NOT NULL, -- 'instagram', 'messenger', etc.
  business_name VARCHAR(255),
  instagram_username VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'connected', 'rejected'
  channel_id VARCHAR(255), -- ID do canal após conectar
  requested_at TIMESTAMP DEFAULT NOW(),
  connected_at TIMESTAMP,
  notes TEXT,
  CONSTRAINT fk_channel_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_channel_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 2. Backend: Endpoints

```typescript
// POST /api/notificame/request-connection
async requestConnection(req: Request, res: Response): Promise<void> {
  const { platform, businessName, instagramUsername } = req.body;
  const userId = (req as any).user?.id;
  const tenantId = (req as any).user?.tenantId;

  const request = await db.query(
    `INSERT INTO channel_connection_requests
     (tenant_id, user_id, platform, business_name, instagram_username, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [tenantId, userId, platform, businessName, instagramUsername]
  );

  // Notificar admins
  // TODO: enviar email/notificação para admin

  res.json({ success: true, data: request.rows[0] });
}

// GET /api/notificame/connection-requests
async listConnectionRequests(req: Request, res: Response): Promise<void> {
  const tenantId = (req as any).user?.tenantId;

  const requests = await db.query(
    `SELECT * FROM channel_connection_requests
     WHERE tenant_id = $1
     ORDER BY requested_at DESC`,
    [tenantId]
  );

  res.json({ success: true, data: requests.rows });
}

// PATCH /api/notificame/connection-requests/:id
async updateConnectionRequest(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, channelId, notes } = req.body;

  await db.query(
    `UPDATE channel_connection_requests
     SET status = $1, channel_id = $2, notes = $3,
         connected_at = CASE WHEN $1 = 'connected' THEN NOW() ELSE NULL END
     WHERE id = $4`,
    [status, channelId, notes, id]
  );

  res.json({ success: true });
}
```

#### 3. Frontend: Formulário de Solicitação

```typescript
// frontend/src/components/integrations/RequestChannelConnection.tsx

const RequestChannelConnection: React.FC = () => {
  const [platform, setPlatform] = useState('instagram');
  const [businessName, setBusinessName] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await notificaMeService.requestConnection({
        platform,
        businessName,
        instagramUsername
      });

      if (result.success) {
        toast.success('Solicitação enviada!', {
          description: 'Nosso time irá conectar sua conta em breve.'
        });
        // Resetar form
      }
    } catch (error: any) {
      toast.error('Erro ao enviar solicitação', {
        description: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Solicitar Conexão de Canal</h3>

      <label>
        Plataforma:
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="instagram">Instagram</option>
          <option value="messenger">Messenger</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </label>

      <label>
        Nome da Empresa:
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </label>

      {platform === 'instagram' && (
        <label>
          Usuário Instagram (sem @):
          <input
            type="text"
            value={instagramUsername}
            onChange={(e) => setInstagramUsername(e.target.value)}
            placeholder="exemplo: clinicaprimemoema_"
            required
          />
        </label>
      )}

      <button type="submit">Enviar Solicitação</button>

      <div className="info">
        ℹ️ Após enviar, nossa equipe irá conectar sua conta e você será notificado.
      </div>
    </form>
  );
};
```

### Tempo de Implementação
- **2 horas** (banco + backend + frontend)

---

## SOLUÇÃO 3: Contatar Suporte NotificaMe

**Descrição**: Solicitar API OAuth para revendedores.

### Mensagem Sugerida

```
Assunto: API OAuth para Conectar Canais Programaticamente

Olá equipe NotificaMe,

Sou revendedor (API Key: 0fb8e168-9331-11f0-88f5-0e386dc8b623) e gostaria
de permitir que meus clientes conectem suas próprias contas Instagram/Messenger
diretamente pelo meu sistema (Nexus CRM), sem precisar acessar o painel NotificaMe.

Atualmente uso com sucesso os endpoints:
- GET /channels (listar canais)
- POST /channels/instagram/messages (enviar mensagens)

Porém, testei os seguintes endpoints mas todos retornam 404:
- /oauth/authorize
- /connect/instagram
- /channels/create

Perguntas:
1. Existe API para iniciar OAuth Instagram/Messenger programaticamente?
2. Se sim, qual endpoint devo usar e qual a documentação?
3. Há plano de adicionar essa funcionalidade para revendedores?
4. Como alternativa, existe forma de gerar link OAuth que eu possa
   abrir em modal/popup no meu sistema?

Agradeço desde já!
```

**Onde enviar:**
- Painel: https://hub.notificame.com.br/ → Suporte
- Email: suporte@notificame.com.br (confirmar no painel)

---

## 🎯 RECOMENDAÇÃO FINAL

### Para Implementar AGORA (Curto Prazo)
→ **SOLUÇÃO 1: iFrame do Painel**
- Mais rápida
- Menos trabalho
- UX aceitável
- Usa interface oficial

### Para Futuro (Médio Prazo)
→ **SOLUÇÃO 2: Fluxo Manual** (se precisar de controle/aprovação)
→ **SOLUÇÃO 3: Contatar NotificaMe** (aguardar API OAuth)

---

## 📋 PRÓXIMOS PASSOS

### Opção A: Implementar iFrame (30 min)

```bash
# 1. Criar componente
touch frontend/src/components/integrations/NotificaMeConnect.tsx

# 2. Adicionar método no service
# frontend/src/services/notificaMeService.ts
getPanelToken()

# 3. Adicionar aba na página
# frontend/src/pages/IntegracoesSociaisPage.tsx

# 4. Testar e deploy
npm run build
docker build -t nexus-frontend:v121-iframe-connect
docker service update --image nexus-frontend:v121-iframe-connect nexus_frontend
```

### Opção B: Implementar Fluxo Manual (2h)

```bash
# 1. Criar migration
touch backend/migrations/20251022_channel_connection_requests.sql

# 2. Criar endpoints
# backend/src/modules/notificame/notificame.controller.ts

# 3. Criar componente frontend
touch frontend/src/components/integrations/RequestChannelConnection.tsx

# 4. Testar e deploy
```

### Opção C: Contatar Suporte (5 min)

```bash
# 1. Acessar painel NotificaMe
open https://hub.notificame.com.br/

# 2. Abrir ticket no suporte
# Usar mensagem modelo acima

# 3. Aguardar resposta (1-3 dias úteis)
```

---

## 🔗 REFERÊNCIAS

- **Painel NotificaMe Hub**: https://hub.notificame.com.br/
- **Documentação API**: https://hub.notificame.com.br/docs/
- **Node n8n**: https://github.com/oriondesign2015/n8n-nodes-notificame-hub
- **Documentação atual**: `/root/nexusatemporal/SOLUCAO_NOTIFICAME_FUNCIONAL.md`

---

**Desenvolvido por**: Claude Code - Sessão A
**Data**: 2025-10-22
**Versão**: v120.1
**Status**: ✅ Análise completa - Pronto para implementar
