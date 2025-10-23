# 🚀 Integração Direta com Meta - Instagram & Messenger

**Data**: 2025-10-22
**Objetivo**: Implementar integração DIRETA com Meta API para permitir que usuários conectem suas próprias contas Instagram/Messenger pelo Nexus CRM
**Vantagens**: Controle total, sem dependência de terceiros, escalável, oficial

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [PARTE 1: Configurar Facebook App](#parte-1-configurar-facebook-app)
4. [PARTE 2: Implementar OAuth Backend](#parte-2-implementar-oauth-backend)
5. [PARTE 3: Implementar Webhooks](#parte-3-implementar-webhooks)
6. [PARTE 4: Enviar Mensagens](#parte-4-enviar-mensagens)
7. [PARTE 5: Frontend](#parte-5-frontend)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### O Que Vamos Construir

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário clica "Conectar Instagram" no Nexus           │
│       ↓                                                     │
│  2. Redirecionado para OAuth Meta (popup)                  │
│       ↓                                                     │
│  3. Autoriza conta Instagram Business                      │
│       ↓                                                     │
│  4. Meta redireciona de volta com código                   │
│       ↓                                                     │
│  5. Backend troca código por token de acesso               │
│       ↓                                                     │
│  6. Token salvo no banco (criptografado)                   │
│       ↓                                                     │
│  7. Canal Instagram aparece no Nexus                       │
│       ↓                                                     │
│  8. Usuário pode enviar/receber mensagens                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### APIs Meta Utilizadas

- **Graph API**: Enviar mensagens, obter dados da conta
- **Messenger Platform**: Infraestrutura de mensagens
- **Instagram API with Instagram Login**: OAuth simplificado (atualizado jul/2024)
- **Webhooks**: Receber mensagens em tempo real

---

## ✅ REQUISITOS

### Conta Meta/Facebook

- [ ] Conta Meta for Developers (https://developers.facebook.com)
- [ ] Instagram Professional Account (Business ou Creator)
- [ ] Facebook Business Page conectada ao Instagram (recomendado)

### Infraestrutura Nexus

- [ ] Domínio HTTPS (já tem: nexusatemporal.com.br)
- [ ] Backend Node.js/TypeScript (já tem)
- [ ] PostgreSQL (já tem)
- [ ] Frontend React (já tem)

### Permissões Meta Necessárias

```
✅ instagram_basic                   # Dados básicos da conta
✅ instagram_manage_messages         # Enviar/receber mensagens
✅ pages_messaging                   # Messenger (opcional)
✅ pages_manage_metadata             # Metadados da página
✅ pages_show_list                   # Listar páginas
✅ business_management               # Gerenciar business (para tokens long-lived)
```

---

## 🔧 PARTE 1: CONFIGURAR FACEBOOK APP

### Passo 1.1: Criar App Meta

1. **Acessar**: https://developers.facebook.com/apps
2. **Clicar**: "Create App" (Criar App)
3. **Tipo**: Selecionar **"Business"**
4. **Nome**: "Nexus CRM - Instagram Messenger"
5. **Email de contato**: Seu email
6. **Business Account**: Selecionar ou criar Business Account

### Passo 1.2: Adicionar Produtos

No dashboard do app, adicione:

1. **Instagram**
   - Clique em "Add Product"
   - Selecione "Instagram"
   - Configure as permissões

2. **Messenger** (opcional, se quiser Messenger também)
   - Clique em "Add Product"
   - Selecione "Messenger"

3. **Webhooks**
   - Clique em "Add Product"
   - Selecione "Webhooks"

### Passo 1.3: Configurar App Settings

**Settings → Basic**

```
App ID: [será gerado - anote]
App Secret: [será gerado - anote]
Display Name: Nexus CRM - Instagram Messenger
App Domains: nexusatemporal.com.br
Privacy Policy URL: https://one.nexusatemporal.com.br/privacy
Terms of Service URL: https://one.nexusatemporal.com.br/terms
```

**⚠️ IMPORTANTE**: Anote `App ID` e `App Secret` - você vai precisar!

### Passo 1.4: Configurar OAuth Redirect URIs

**Settings → Basic → Add Platform → Website**

```
Site URL: https://one.nexusatemporal.com.br

OAuth Redirect URIs:
- https://api.nexusatemporal.com.br/api/meta/oauth/callback
- https://one.nexusatemporal.com.br/integrations/meta/callback
```

### Passo 1.5: Modo de Desenvolvimento → Produção

**Dashboard → App Mode**

- Inicialmente o app estará em **Development Mode**
- Para usar em produção, precisa passar por **App Review**
- Mas pode testar com suas próprias contas em Development Mode

---

## 🔐 PARTE 2: IMPLEMENTAR OAUTH BACKEND

### Passo 2.1: Variáveis de Ambiente

Adicionar ao `.env`:

```bash
# Meta/Facebook App
META_APP_ID=seu_app_id_aqui
META_APP_SECRET=seu_app_secret_aqui
META_OAUTH_REDIRECT_URI=https://api.nexusatemporal.com.br/api/meta/oauth/callback

# Scopes necessários
META_OAUTH_SCOPES=instagram_basic,instagram_manage_messages,pages_messaging,pages_manage_metadata,pages_show_list,business_management
```

### Passo 2.2: Criar Tabela no Banco

```sql
-- migrations/20251022_meta_instagram_accounts.sql

CREATE TABLE meta_instagram_accounts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  -- Dados da conta Instagram
  instagram_account_id VARCHAR(255) NOT NULL UNIQUE,
  instagram_username VARCHAR(255),
  instagram_name VARCHAR(255),
  profile_picture_url TEXT,

  -- Dados da Facebook Page (se conectada)
  facebook_page_id VARCHAR(255),
  facebook_page_name VARCHAR(255),

  -- Tokens de acesso (criptografados)
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  long_lived_token TEXT, -- Token que dura 60 dias

  -- Metadados
  platform VARCHAR(20) DEFAULT 'instagram', -- 'instagram' ou 'messenger'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked'

  -- Timestamps
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_meta_instagram_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_meta_instagram_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_meta_instagram_tenant ON meta_instagram_accounts(tenant_id);
CREATE INDEX idx_meta_instagram_account_id ON meta_instagram_accounts(instagram_account_id);
CREATE INDEX idx_meta_instagram_status ON meta_instagram_accounts(status);

-- Tabela de mensagens Instagram
CREATE TABLE instagram_messages (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL REFERENCES meta_instagram_accounts(id) ON DELETE CASCADE,

  -- Identificadores Meta
  message_id VARCHAR(255) NOT NULL UNIQUE,
  conversation_id VARCHAR(255),

  -- Remetente e destinatário
  from_id VARCHAR(255) NOT NULL,
  from_username VARCHAR(255),
  to_id VARCHAR(255) NOT NULL,

  -- Conteúdo
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'story_reply', etc.
  attachments JSONB, -- URLs de imagens/vídeos/etc

  -- Direção
  direction VARCHAR(20) NOT NULL, -- 'inbound' (recebido) ou 'outbound' (enviado)

  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'

  -- Metadados
  metadata JSONB,
  raw_payload JSONB, -- Payload completo do webhook/API

  -- Timestamps
  sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_instagram_messages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_instagram_messages_tenant ON instagram_messages(tenant_id);
CREATE INDEX idx_instagram_messages_account ON instagram_messages(account_id);
CREATE INDEX idx_instagram_messages_conversation ON instagram_messages(conversation_id);
CREATE INDEX idx_instagram_messages_direction ON instagram_messages(direction);
CREATE INDEX idx_instagram_messages_sent_at ON instagram_messages(sent_at DESC);
```

### Passo 2.3: Criar Serviço Meta OAuth

```typescript
// backend/src/services/MetaOAuthService.ts

import axios from 'axios';
import crypto from 'crypto';

export class MetaOAuthService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;
  private scopes: string[];

  constructor() {
    this.appId = process.env.META_APP_ID!;
    this.appSecret = process.env.META_APP_SECRET!;
    this.redirectUri = process.env.META_OAUTH_REDIRECT_URI!;
    this.scopes = (process.env.META_OAUTH_SCOPES || '').split(',');
  }

  /**
   * Gerar URL de autorização OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      state: state, // Para CSRF protection
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Trocar código por token de acesso
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in?: number;
  }> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.redirectUri,
        code: code,
      });

      const response = await axios.get(
        `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao trocar código:', error.response?.data);
      throw new Error('Erro ao obter token de acesso');
    }
  }

  /**
   * Obter Long-Lived Token (dura 60 dias)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken,
      });

      const response = await axios.get(
        `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao obter long-lived token:', error.response?.data);
      throw new Error('Erro ao obter long-lived token');
    }
  }

  /**
   * Obter dados da conta Instagram conectada
   */
  async getInstagramAccount(accessToken: string): Promise<{
    id: string;
    username: string;
    name: string;
    profile_picture_url: string;
  }> {
    try {
      // Primeiro, obter as páginas do usuário
      const pagesResponse = await axios.get(
        `https://graph.facebook.com/v21.0/me/accounts`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,instagram_business_account',
          },
        }
      );

      const pages = pagesResponse.data.data;

      // Encontrar página com Instagram Business Account conectado
      const pageWithInstagram = pages.find(
        (page: any) => page.instagram_business_account
      );

      if (!pageWithInstagram) {
        throw new Error('Nenhuma conta Instagram Business encontrada');
      }

      const instagramAccountId = pageWithInstagram.instagram_business_account.id;

      // Obter dados da conta Instagram
      const instagramResponse = await axios.get(
        `https://graph.facebook.com/v21.0/${instagramAccountId}`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,username,name,profile_picture_url',
          },
        }
      );

      return {
        ...instagramResponse.data,
        facebook_page_id: pageWithInstagram.id,
        facebook_page_name: pageWithInstagram.name,
      };
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao obter conta Instagram:', error.response?.data);
      throw new Error('Erro ao obter dados da conta Instagram');
    }
  }

  /**
   * Gerar state aleatório para CSRF protection
   */
  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validar state (comparar com o salvo na sessão)
   */
  validateState(receivedState: string, savedState: string): boolean {
    return receivedState === savedState;
  }

  /**
   * Criptografar token antes de salvar no banco
   */
  encryptToken(token: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.appSecret, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Descriptografar token do banco
   */
  decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.appSecret, 'salt', 32);

    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Passo 2.4: Criar Controller OAuth

```typescript
// backend/src/modules/meta/meta-oauth.controller.ts

import { Request, Response } from 'express';
import { MetaOAuthService } from '../../services/MetaOAuthService';
import { db } from '../../database';

export class MetaOAuthController {
  private metaService: MetaOAuthService;

  constructor() {
    this.metaService = new MetaOAuthService();
  }

  /**
   * GET /api/meta/oauth/start
   * Iniciar fluxo OAuth
   */
  async startOAuth(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const tenantId = (req as any).user?.tenantId;

      if (!userId || !tenantId) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      // Gerar state e salvar na sessão (ou JWT temporário)
      const state = this.metaService.generateState();

      // Salvar state temporariamente (pode usar Redis ou JWT)
      // Por simplicidade, vou usar banco temporário
      await db.query(
        `INSERT INTO oauth_states (user_id, state, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
        [userId, state]
      );

      // Gerar URL de autorização
      const authUrl = this.metaService.getAuthorizationUrl(state);

      res.json({
        success: true,
        data: {
          authUrl,
          state,
        },
      });
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao iniciar OAuth:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/oauth/callback
   * Callback OAuth (Meta redireciona aqui após autorização)
   */
  async oauthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error, error_description } = req.query;

      // Verificar se houve erro
      if (error) {
        console.error('[MetaOAuth] Erro no callback:', error, error_description);
        res.redirect(
          `https://one.nexusatemporal.com.br/integrations?error=${error}`
        );
        return;
      }

      if (!code || !state) {
        res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
        return;
      }

      // Validar state (CSRF protection)
      const stateResult = await db.query(
        `SELECT user_id FROM oauth_states
         WHERE state = $1 AND expires_at > NOW()`,
        [state]
      );

      if (stateResult.rows.length === 0) {
        res.status(400).json({ success: false, error: 'State inválido ou expirado' });
        return;
      }

      const userId = stateResult.rows[0].user_id;

      // Trocar código por token
      const tokenData = await this.metaService.exchangeCodeForToken(code as string);

      // Obter long-lived token
      const longLivedTokenData = await this.metaService.getLongLivedToken(
        tokenData.access_token
      );

      // Obter dados da conta Instagram
      const instagramAccount = await this.metaService.getInstagramAccount(
        longLivedTokenData.access_token
      );

      // Criptografar token
      const encryptedToken = this.metaService.encryptToken(
        longLivedTokenData.access_token
      );

      // Calcular data de expiração (60 dias)
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + longLivedTokenData.expires_in);

      // Obter tenant do usuário
      const userResult = await db.query(
        `SELECT tenant_id FROM users WHERE id = $1`,
        [userId]
      );
      const tenantId = userResult.rows[0].tenant_id;

      // Salvar no banco (INSERT ou UPDATE se já existir)
      await db.query(
        `INSERT INTO meta_instagram_accounts (
          tenant_id, user_id, instagram_account_id, instagram_username,
          instagram_name, profile_picture_url, facebook_page_id, facebook_page_name,
          access_token, long_lived_token, token_expires_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, 'active')
        ON CONFLICT (instagram_account_id)
        DO UPDATE SET
          access_token = $9,
          long_lived_token = $9,
          token_expires_at = $10,
          instagram_username = $4,
          instagram_name = $5,
          profile_picture_url = $6,
          status = 'active',
          updated_at = NOW()`,
        [
          tenantId,
          userId,
          instagramAccount.id,
          instagramAccount.username,
          instagramAccount.name,
          instagramAccount.profile_picture_url,
          instagramAccount.facebook_page_id,
          instagramAccount.facebook_page_name,
          encryptedToken,
          expiresAt,
        ]
      );

      // Deletar state usado
      await db.query(`DELETE FROM oauth_states WHERE state = $1`, [state]);

      // Redirecionar de volta para frontend com sucesso
      res.redirect(
        `https://one.nexusatemporal.com.br/integrations?success=true&account=${instagramAccount.username}`
      );
    } catch (error: any) {
      console.error('[MetaOAuth] Erro no callback:', error);
      res.redirect(
        `https://one.nexusatemporal.com.br/integrations?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  /**
   * GET /api/meta/accounts
   * Listar contas Instagram conectadas do tenant
   */
  async listAccounts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;

      const result = await db.query(
        `SELECT
          id, instagram_account_id, instagram_username, instagram_name,
          profile_picture_url, facebook_page_id, facebook_page_name,
          platform, status, connected_at, token_expires_at
         FROM meta_instagram_accounts
         WHERE tenant_id = $1 AND status = 'active'
         ORDER BY connected_at DESC`,
        [tenantId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao listar contas:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/meta/accounts/:id
   * Desconectar conta Instagram
   */
  async disconnectAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId;

      await db.query(
        `UPDATE meta_instagram_accounts
         SET status = 'revoked', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('[MetaOAuth] Erro ao desconectar conta:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

### Passo 2.5: Criar Rotas

```typescript
// backend/src/modules/meta/meta-oauth.routes.ts

import express from 'express';
import { MetaOAuthController } from './meta-oauth.controller';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();
const controller = new MetaOAuthController();

// Iniciar OAuth (requer autenticação)
router.get('/oauth/start', authMiddleware, (req, res) =>
  controller.startOAuth(req, res)
);

// Callback OAuth (não requer auth - Meta chama diretamente)
router.get('/oauth/callback', (req, res) =>
  controller.oauthCallback(req, res)
);

// Listar contas conectadas
router.get('/accounts', authMiddleware, (req, res) =>
  controller.listAccounts(req, res)
);

// Desconectar conta
router.delete('/accounts/:id', authMiddleware, (req, res) =>
  controller.disconnectAccount(req, res)
);

export default router;
```

### Passo 2.6: Registrar Rotas no App

```typescript
// backend/src/app.ts

import metaOAuthRoutes from './modules/meta/meta-oauth.routes';

// ...

app.use('/api/meta', metaOAuthRoutes);
```

---

## 📬 PARTE 3: IMPLEMENTAR WEBHOOKS

### Passo 3.1: Configurar Webhook no Facebook App

**Dashboard → Webhooks → Instagram**

```
Callback URL: https://api.nexusatemporal.com.br/api/meta/webhook
Verify Token: nexus_meta_webhook_token_2025 (escolha um aleatório)

Subscription Fields (marque):
✅ messages
✅ messaging_postbacks (para botões)
✅ message_echoes (mensagens enviadas)
✅ message_reads (mensagens lidas)
```

### Passo 3.2: Criar Webhook Controller

```typescript
// backend/src/modules/meta/meta-webhook.controller.ts

import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../database';
import { MetaOAuthService } from '../../services/MetaOAuthService';

export class MetaWebhookController {
  private verifyToken: string;
  private appSecret: string;
  private metaService: MetaOAuthService;

  constructor() {
    this.verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'nexus_meta_webhook_token_2025';
    this.appSecret = process.env.META_APP_SECRET!;
    this.metaService = new MetaOAuthService();
  }

  /**
   * GET /api/meta/webhook
   * Verificação do webhook (Meta chama isso ao configurar)
   */
  verify(req: Request, res: Response): void {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('[MetaWebhook] Webhook verificado com sucesso');
      res.status(200).send(challenge);
    } else {
      console.error('[MetaWebhook] Falha na verificação do webhook');
      res.sendStatus(403);
    }
  }

  /**
   * POST /api/meta/webhook
   * Receber eventos do webhook
   */
  async receive(req: Request, res: Response): Promise<void> {
    try {
      // Validar assinatura (segurança)
      const signature = req.headers['x-hub-signature-256'] as string;
      if (!this.validateSignature(signature, req.body)) {
        console.error('[MetaWebhook] Assinatura inválida');
        res.sendStatus(403);
        return;
      }

      const body = req.body;

      // Processar eventos
      if (body.object === 'instagram') {
        for (const entry of body.entry) {
          // Mensagens recebidas
          if (entry.messaging) {
            for (const event of entry.messaging) {
              await this.handleMessagingEvent(event);
            }
          }

          // Mudanças (ex: mensagem lida)
          if (entry.changes) {
            for (const change of entry.changes) {
              await this.handleChangeEvent(change);
            }
          }
        }
      }

      // Sempre retornar 200 rapidamente (Meta espera resposta rápida)
      res.sendStatus(200);
    } catch (error: any) {
      console.error('[MetaWebhook] Erro ao processar webhook:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Validar assinatura do webhook (segurança)
   */
  private validateSignature(signature: string, body: any): boolean {
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.appSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  /**
   * Processar evento de mensagem
   */
  private async handleMessagingEvent(event: any): Promise<void> {
    try {
      const senderId = event.sender.id;
      const recipientId = event.recipient.id;
      const timestamp = event.timestamp;

      // Mensagem recebida
      if (event.message) {
        await this.handleIncomingMessage(event.message, senderId, recipientId, timestamp);
      }

      // Postback de botão
      if (event.postback) {
        await this.handlePostback(event.postback, senderId, recipientId, timestamp);
      }

      // Mensagem lida
      if (event.read) {
        await this.handleMessageRead(event.read, senderId);
      }
    } catch (error) {
      console.error('[MetaWebhook] Erro ao processar evento de mensagem:', error);
    }
  }

  /**
   * Processar mensagem recebida
   */
  private async handleIncomingMessage(
    message: any,
    senderId: string,
    recipientId: string,
    timestamp: number
  ): Promise<void> {
    try {
      // Encontrar conta conectada
      const accountResult = await db.query(
        `SELECT id, tenant_id FROM meta_instagram_accounts
         WHERE instagram_account_id = $1 AND status = 'active'`,
        [recipientId]
      );

      if (accountResult.rows.length === 0) {
        console.warn('[MetaWebhook] Conta não encontrada:', recipientId);
        return;
      }

      const account = accountResult.rows[0];

      // Extrair texto e anexos
      const messageText = message.text || '';
      const attachments = message.attachments || [];

      // Salvar mensagem no banco
      await db.query(
        `INSERT INTO instagram_messages (
          tenant_id, account_id, message_id, from_id, to_id,
          message_text, message_type, attachments, direction,
          status, sent_at, raw_payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'inbound', 'received', $9, $10)
        ON CONFLICT (message_id) DO NOTHING`,
        [
          account.tenant_id,
          account.id,
          message.mid,
          senderId,
          recipientId,
          messageText,
          attachments.length > 0 ? attachments[0].type : 'text',
          JSON.stringify(attachments),
          new Date(timestamp),
          JSON.stringify(message),
        ]
      );

      console.log(`[MetaWebhook] Mensagem recebida de ${senderId}: ${messageText}`);

      // TODO: Notificar frontend via WebSocket ou criar notificação
    } catch (error) {
      console.error('[MetaWebhook] Erro ao salvar mensagem:', error);
    }
  }

  /**
   * Processar postback de botão
   */
  private async handlePostback(postback: any, senderId: string, recipientId: string, timestamp: number): Promise<void> {
    console.log('[MetaWebhook] Postback recebido:', postback.payload);
    // TODO: Implementar lógica de botões
  }

  /**
   * Processar mensagem lida
   */
  private async handleMessageRead(read: any, senderId: string): Promise<void> {
    // Atualizar status das mensagens para 'read'
    await db.query(
      `UPDATE instagram_messages
       SET status = 'read'
       WHERE from_id = $1 AND status = 'delivered'`,
      [senderId]
    );
  }

  /**
   * Processar evento de mudança
   */
  private async handleChangeEvent(change: any): Promise<void> {
    console.log('[MetaWebhook] Change event:', change.field, change.value);
    // TODO: Implementar se necessário
  }
}
```

### Passo 3.3: Criar Rotas Webhook

```typescript
// backend/src/modules/meta/meta-webhook.routes.ts

import express from 'express';
import { MetaWebhookController } from './meta-webhook.controller';

const router = express.Router();
const controller = new MetaWebhookController();

// Verificação do webhook (GET)
router.get('/webhook', (req, res) => controller.verify(req, res));

// Receber eventos (POST)
router.post('/webhook', (req, res) => controller.receive(req, res));

export default router;
```

### Passo 3.4: Registrar Rotas Webhook

```typescript
// backend/src/app.ts

import metaWebhookRoutes from './modules/meta/meta-webhook.routes';

// ...

app.use('/api/meta', metaWebhookRoutes);
```

---

## 📤 PARTE 4: ENVIAR MENSAGENS

### Passo 4.1: Criar Serviço de Envio

```typescript
// backend/src/services/MetaMessagingService.ts

import axios from 'axios';
import { db } from '../database';
import { MetaOAuthService } from './MetaOAuthService';

export class MetaMessagingService {
  private metaService: MetaOAuthService;

  constructor() {
    this.metaService = new MetaOAuthService();
  }

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(params: {
    accountId: number;
    recipientId: string;
    message: string;
  }): Promise<any> {
    try {
      // Buscar conta e token
      const accountResult = await db.query(
        `SELECT instagram_account_id, access_token, tenant_id
         FROM meta_instagram_accounts
         WHERE id = $1 AND status = 'active'`,
        [params.accountId]
      );

      if (accountResult.rows.length === 0) {
        throw new Error('Conta não encontrada ou inativa');
      }

      const account = accountResult.rows[0];

      // Descriptografar token
      const accessToken = this.metaService.decryptToken(account.access_token);

      // Enviar mensagem via Graph API
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/me/messages`,
        {
          recipient: { id: params.recipientId },
          message: { text: params.message },
        },
        {
          params: { access_token: accessToken },
        }
      );

      // Salvar mensagem enviada no banco
      await db.query(
        `INSERT INTO instagram_messages (
          tenant_id, account_id, message_id, from_id, to_id,
          message_text, message_type, direction, status, sent_at, raw_payload
        ) VALUES ($1, $2, $3, $4, $5, $6, 'text', 'outbound', 'sent', NOW(), $7)`,
        [
          account.tenant_id,
          params.accountId,
          response.data.message_id,
          account.instagram_account_id,
          params.recipientId,
          params.message,
          JSON.stringify(response.data),
        ]
      );

      return response.data;
    } catch (error: any) {
      console.error('[MetaMessaging] Erro ao enviar mensagem:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Erro ao enviar mensagem');
    }
  }

  /**
   * Enviar imagem
   */
  async sendImageMessage(params: {
    accountId: number;
    recipientId: string;
    imageUrl: string;
  }): Promise<any> {
    const accountResult = await db.query(
      `SELECT instagram_account_id, access_token, tenant_id
       FROM meta_instagram_accounts
       WHERE id = $1 AND status = 'active'`,
      [params.accountId]
    );

    const account = accountResult.rows[0];
    const accessToken = this.metaService.decryptToken(account.access_token);

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages`,
      {
        recipient: { id: params.recipientId },
        message: {
          attachment: {
            type: 'image',
            payload: { url: params.imageUrl },
          },
        },
      },
      {
        params: { access_token: accessToken },
      }
    );

    return response.data;
  }

  /**
   * Enviar template com botões
   */
  async sendButtonTemplate(params: {
    accountId: number;
    recipientId: string;
    text: string;
    buttons: Array<{ type: string; title: string; payload: string }>;
  }): Promise<any> {
    const accountResult = await db.query(
      `SELECT instagram_account_id, access_token, tenant_id
       FROM meta_instagram_accounts
       WHERE id = $1 AND status = 'active'`,
      [params.accountId]
    );

    const account = accountResult.rows[0];
    const accessToken = this.metaService.decryptToken(account.access_token);

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages`,
      {
        recipient: { id: params.recipientId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: params.text,
              buttons: params.buttons,
            },
          },
        },
      },
      {
        params: { access_token: accessToken },
      }
    );

    return response.data;
  }

  /**
   * Listar conversas
   */
  async getConversations(accountId: number, limit: number = 20): Promise<any[]> {
    const result = await db.query(
      `SELECT DISTINCT ON (from_id)
        from_id, from_username, message_text, sent_at, direction
       FROM instagram_messages
       WHERE account_id = $1
       ORDER BY from_id, sent_at DESC
       LIMIT $2`,
      [accountId, limit]
    );

    return result.rows;
  }

  /**
   * Listar mensagens de uma conversa
   */
  async getMessages(accountId: number, contactId: string, limit: number = 50): Promise<any[]> {
    const result = await db.query(
      `SELECT *
       FROM instagram_messages
       WHERE account_id = $1
         AND (from_id = $2 OR to_id = $2)
       ORDER BY sent_at DESC
       LIMIT $3`,
      [accountId, contactId, limit]
    );

    return result.rows.reverse();
  }
}
```

### Passo 4.2: Criar Controller de Mensagens

```typescript
// backend/src/modules/meta/meta-messaging.controller.ts

import { Request, Response } from 'express';
import { MetaMessagingService } from '../../services/MetaMessagingService';

export class MetaMessagingController {
  private messagingService: MetaMessagingService;

  constructor() {
    this.messagingService = new MetaMessagingService();
  }

  /**
   * POST /api/meta/send-message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, recipientId, message, type, imageUrl, buttons } = req.body;

      let result;

      if (type === 'image' && imageUrl) {
        result = await this.messagingService.sendImageMessage({
          accountId,
          recipientId,
          imageUrl,
        });
      } else if (type === 'button' && buttons) {
        result = await this.messagingService.sendButtonTemplate({
          accountId,
          recipientId,
          text: message,
          buttons,
        });
      } else {
        result = await this.messagingService.sendTextMessage({
          accountId,
          recipientId,
          message,
        });
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[MetaMessaging] Erro ao enviar mensagem:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/conversations/:accountId
   */
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const conversations = await this.messagingService.getConversations(
        parseInt(accountId)
      );

      res.json({ success: true, data: conversations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/messages/:accountId/:contactId
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, contactId } = req.params;
      const messages = await this.messagingService.getMessages(
        parseInt(accountId),
        contactId
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

### Passo 4.3: Adicionar Rotas de Mensagens

```typescript
// backend/src/modules/meta/meta-oauth.routes.ts (adicionar)

import { MetaMessagingController } from './meta-messaging.controller';

const messagingController = new MetaMessagingController();

// Enviar mensagem
router.post('/send-message', authMiddleware, (req, res) =>
  messagingController.sendMessage(req, res)
);

// Listar conversas
router.get('/conversations/:accountId', authMiddleware, (req, res) =>
  messagingController.getConversations(req, res)
);

// Listar mensagens de uma conversa
router.get('/messages/:accountId/:contactId', authMiddleware, (req, res) =>
  messagingController.getMessages(req, res)
);
```

---

## 🎨 PARTE 5: FRONTEND

### Passo 5.1: Criar Service

```typescript
// frontend/src/services/metaInstagramService.ts

import api from './api';

export const metaInstagramService = {
  /**
   * Iniciar OAuth
   */
  async startOAuth() {
    const response = await api.get('/api/meta/oauth/start');
    return response.data;
  },

  /**
   * Listar contas conectadas
   */
  async listAccounts() {
    const response = await api.get('/api/meta/accounts');
    return response.data;
  },

  /**
   * Desconectar conta
   */
  async disconnectAccount(accountId: number) {
    const response = await api.delete(`/api/meta/accounts/${accountId}`);
    return response.data;
  },

  /**
   * Enviar mensagem
   */
  async sendMessage(params: {
    accountId: number;
    recipientId: string;
    message: string;
    type?: string;
    imageUrl?: string;
  }) {
    const response = await api.post('/api/meta/send-message', params);
    return response.data;
  },

  /**
   * Listar conversas
   */
  async getConversations(accountId: number) {
    const response = await api.get(`/api/meta/conversations/${accountId}`);
    return response.data;
  },

  /**
   * Listar mensagens
   */
  async getMessages(accountId: number, contactId: string) {
    const response = await api.get(`/api/meta/messages/${accountId}/${contactId}`);
    return response.data;
  },
};
```

### Passo 5.2: Componente de Conexão

```typescript
// frontend/src/components/integrations/MetaInstagramConnect.tsx

import React, { useState, useEffect } from 'react';
import { metaInstagramService } from '../../services/metaInstagramService';
import { toast } from 'sonner';

export const MetaInstagramConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const result = await metaInstagramService.listAccounts();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar contas', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Obter URL OAuth
      const result = await metaInstagramService.startOAuth();

      if (result.success) {
        // Abrir popup OAuth
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          result.data.authUrl,
          'MetaOAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Verificar quando popup fecha
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            // Recarregar lista de contas
            setTimeout(() => loadAccounts(), 1000);
          }
        }, 500);
      }
    } catch (error: any) {
      toast.error('Erro ao conectar', {
        description: error.message,
      });
    }
  };

  const handleDisconnect = async (accountId: number, username: string) => {
    if (!confirm(`Desconectar @${username}?`)) return;

    try {
      await metaInstagramService.disconnectAccount(accountId);
      toast.success('Conta desconectada com sucesso');
      loadAccounts();
    } catch (error: any) {
      toast.error('Erro ao desconectar', {
        description: error.message,
      });
    }
  };

  return (
    <div className="meta-instagram-connect">
      <div className="header">
        <h3>Instagram Business via Meta</h3>
        <button onClick={handleConnect} className="btn-primary">
          + Conectar Instagram
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma conta conectada</p>
          <p className="hint">
            Clique em "Conectar Instagram" para adicionar sua primeira conta
          </p>
        </div>
      ) : (
        <div className="accounts-list">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <img
                src={account.profile_picture_url}
                alt={account.instagram_username}
                className="profile-pic"
              />
              <div className="account-info">
                <strong>{account.instagram_name}</strong>
                <span className="username">@{account.instagram_username}</span>
                {account.facebook_page_name && (
                  <span className="page-name">
                    📄 {account.facebook_page_name}
                  </span>
                )}
                <span className="status">✅ Conectado</span>
              </div>
              <div className="account-actions">
                <button
                  onClick={() =>
                    handleDisconnect(account.id, account.instagram_username)
                  }
                  className="btn-danger"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-box">
        <h4>ℹ️ Requisitos:</h4>
        <ul>
          <li>Conta Instagram Professional (Business ou Creator)</li>
          <li>Conectada a uma Facebook Page (recomendado)</li>
          <li>Permissões de admin na página</li>
        </ul>
      </div>
    </div>
  );
};
```

### Passo 5.3: Adicionar na Página de Integrações

```typescript
// frontend/src/pages/IntegracoesSociaisPage.tsx

import { MetaInstagramConnect } from '../components/integrations/MetaInstagramConnect';

// ...

<Tabs>
  {/* Tabs existentes */}

  <Tab label="Instagram Meta API">
    <MetaInstagramConnect />
  </Tab>
</Tabs>
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Nenhuma conta Instagram encontrada"

**Causa**: Instagram não está conectado a uma Facebook Page

**Solução**:
1. Acesse Instagram → Configurações → Conta Comercial
2. Conecte a uma Facebook Page
3. Tente novamente

### Problema: "Token expirado"

**Causa**: Long-lived tokens expiram em 60 dias

**Solução**: Implementar refresh automático
```typescript
// TODO: Adicionar job cron para renovar tokens antes de expirar
// Endpoint Meta: /oauth/access_token com grant_type=fb_exchange_token
```

### Problema: "Webhook não recebe mensagens"

**Causa**: App em Development Mode

**Solução**:
- Em Development: Só funciona com contas de teste/admin
- Em Production: Precisa passar App Review

### Problema: "Permission denied"

**Causa**: Faltam permissões no OAuth

**Solução**: Verificar se todas as permissões estão no `.env`:
```
META_OAUTH_SCOPES=instagram_basic,instagram_manage_messages,pages_messaging,pages_manage_metadata
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [ ] Criar migrations (oauth_states, meta_instagram_accounts, instagram_messages)
- [ ] Adicionar variáveis no .env
- [ ] Criar MetaOAuthService
- [ ] Criar MetaOAuthController
- [ ] Criar MetaWebhookController
- [ ] Criar MetaMessagingService
- [ ] Criar MetaMessagingController
- [ ] Registrar rotas

### Frontend
- [ ] Criar metaInstagramService
- [ ] Criar componente MetaInstagramConnect
- [ ] Adicionar na página de integrações
- [ ] Testar fluxo OAuth

### Meta App
- [ ] Criar app no Meta for Developers
- [ ] Adicionar produtos (Instagram, Webhooks)
- [ ] Configurar OAuth redirect URIs
- [ ] Configurar webhook callback URL
- [ ] Configurar permissões

### Testes
- [ ] Testar OAuth flow
- [ ] Testar conexão de conta
- [ ] Testar envio de mensagem
- [ ] Testar recebimento via webhook
- [ ] Testar desconexão

---

## 🎯 PRÓXIMOS PASSOS

1. **Implementar código acima** (3-4 horas)
2. **Configurar Facebook App** (30 minutos)
3. **Testar em Development Mode** (1 hora)
4. **Submeter para App Review** (se quiser usar em produção com qualquer usuário)
5. **Adicionar features extras**:
   - Resposta automática
   - Chatbot com IA (já tem OpenAI!)
   - Templates de mensagem
   - Analytics

---

**Tempo estimado total**: 4-5 horas de implementação

**Desenvolvido por**: Claude Code - Sessão A
**Data**: 2025-10-22
**Status**: 📘 Documentação completa - Pronto para implementar
