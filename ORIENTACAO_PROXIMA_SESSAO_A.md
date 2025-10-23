# 📋 Orientação para Próxima Sessão A

**Data da Sessão Anterior**: 2025-10-22
**Versão Atual**: v121-docs-meta-integration
**Status**: 📘 **DOCUMENTAÇÃO COMPLETA - SEM CÓDIGO IMPLEMENTADO**

---

## 🎯 O QUE FOI FEITO NESTA SESSÃO (v121)

### Resumo Executivo

Esta sessão foi **100% focada em pesquisa e documentação**. Nenhum código foi implementado.

**Objetivo da Sessão:**
Responder a pergunta: *"Como permitir que usuários conectem suas próprias contas Instagram/Messenger pelo Nexus CRM?"*

**Resultado:**
- ✅ Problema identificado e analisado
- ✅ 3 soluções documentadas (iFrame, Manual, Meta API)
- ✅ Guia completo de implementação Meta API criado
- ✅ Código pronto para copiar/colar (backend + frontend)
- ❌ **NENHUM código foi implementado/deployado**

---

## 📄 DOCUMENTOS CRIADOS

### 1. SOLUCAO_CONECTAR_NOVOS_CANAIS.md

**Conteúdo:**
- Análise da situação atual (NotificaMe Hub não tem OAuth API)
- Endpoints testados (404 nos endpoints OAuth)
- 3 soluções viáveis:
  - **SOLUÇÃO 1**: iFrame do painel NotificaMe (30 min)
  - **SOLUÇÃO 2**: Fluxo de solicitação manual (2h)
  - **SOLUÇÃO 3**: Integração direta Meta API (4-5h) ⭐ RECOMENDADA

**Quando usar:**
- Para entender o problema de conexão de canais
- Para comparar as 3 abordagens
- Para decisão rápida de qual caminho seguir

---

### 2. INTEGRACAO_META_INSTAGRAM_MESSENGER.md ⭐

**Conteúdo:** (1.150+ linhas)
- Guia COMPLETO de integração direta com Meta API
- **5 PARTES DETALHADAS:**

  **PARTE 1: Configurar Facebook App**
  - Passo a passo para criar app no Meta for Developers
  - Configurar produtos (Instagram + Webhooks)
  - OAuth redirect URIs
  - Modo Development vs Production

  **PARTE 2: Implementar OAuth Backend**
  - MetaOAuthService (OAuth + criptografia AES-256)
  - MetaOAuthController (start, callback, list, disconnect)
  - Rotas OAuth
  - Código TypeScript completo e pronto

  **PARTE 3: Implementar Webhooks**
  - Configuração webhook no Facebook App
  - MetaWebhookController (verify, receive)
  - Processar mensagens recebidas
  - Validação de assinatura

  **PARTE 4: Enviar Mensagens**
  - MetaMessagingService (send text/image/buttons)
  - MetaMessagingController
  - Listar conversas e mensagens

  **PARTE 5: Frontend**
  - metaInstagramService (API client)
  - MetaInstagramConnect (componente React)
  - Integração na página de integrações

- **3 MIGRATIONS SQL prontas**
- **Troubleshooting** (erros comuns + soluções)
- **Checklist de implementação**

**Quando usar:**
- Para implementar a integração Meta API
- Código está pronto para copiar/colar
- Siga passo a passo as 5 partes

---

### 3. RESUMO_INTEGRACAO_META.md

**Conteúdo:**
- Resumo executivo da integração Meta
- Checklist rápido
- Comparação NotificaMe vs Meta Direta (tabela)
- Tempo estimado (4-5 horas)
- Próximos passos práticos

**Quando usar:**
- Leitura rápida (5 min)
- Overview antes de começar
- Para apresentar para stakeholders

---

## 🔍 DESCOBERTAS IMPORTANTES

### API NotificaMe Hub - Limitações Confirmadas

**Endpoints que FUNCIONAM:**
```bash
✅ GET  https://hub.notificame.com.br/v1/channels
✅ POST https://hub.notificame.com.br/v1/channels/instagram/messages
✅ GET  https://api.notificame.com.br/v1/resale (retorna [])
```

**Endpoints que NÃO EXISTEM (404):**
```bash
❌ GET  /oauth/authorize
❌ POST /connect/instagram
❌ POST /channels/create
❌ POST /instances/create
```

**Conclusão:**
A API NotificaMe Hub **NÃO suporta** conexão programática de canais. Conexão só é possível manualmente pelo painel web.

---

### Meta API - Descobertas Positivas

**Atualização Julho/2024:**
- Meta lançou "Instagram API with Instagram Login"
- Fluxo OAuth **simplificado**
- **NÃO requer mais** conexão obrigatória com Facebook Page
- Funciona com Instagram Professional (Business/Creator)

**Permissões necessárias:**
```
instagram_basic
instagram_manage_messages
pages_messaging (opcional, para Messenger)
pages_manage_metadata
pages_show_list
business_management (para long-lived tokens)
```

**Tokens:**
- Short-lived: 1 hora (obtido no OAuth)
- Long-lived: 60 dias (trocado via API)
- Pode ser renovado antes de expirar

**Webhooks:**
- URL callback: `https://api.nexusatemporal.com.br/api/meta/webhook`
- Verificação com token
- Validação de assinatura (SHA-256)
- Recebe mensagens em tempo real

---

### Node n8n NotificaMe Hub - Análise

**GitHub**: https://github.com/oriondesign2015/n8n-nodes-notificame-hub

**Recursos disponíveis:**
- Instagram, Messenger, WhatsApp, Telegram, Email, WebChat, Mercado Livre, OLX
- Revenda (subcontas)

**Operações Instagram:**
1. Enviar Texto
2. Enviar Áudio
3. Enviar Arquivo
4. Comentário
5. Enviar Botões
6. Novo Post (feed, stories, reels)
7. Listar Postagens

**O que NÃO TEM:**
- ❌ Operação para conectar canais
- ❌ Operação para OAuth

**Credencial:**
- Tipo: Header Auth
- Header: `X-Api-Token`
- URL Base: `https://api.notificame.com.br/v1`

---

## 🎁 CÓDIGO PRONTO (NÃO IMPLEMENTADO)

Todo o código está documentado em `INTEGRACAO_META_INSTAGRAM_MESSENGER.md`.

### Backend (TypeScript)

**Services:**
```typescript
✅ MetaOAuthService
   - getAuthorizationUrl(state)
   - exchangeCodeForToken(code)
   - getLongLivedToken(shortToken)
   - getInstagramAccount(token)
   - encryptToken(token)    // AES-256
   - decryptToken(encrypted)
   - generateState()
   - validateState()

✅ MetaMessagingService
   - sendTextMessage(accountId, recipientId, message)
   - sendImageMessage(accountId, recipientId, imageUrl)
   - sendButtonTemplate(accountId, recipientId, text, buttons)
   - getConversations(accountId, limit)
   - getMessages(accountId, contactId, limit)
```

**Controllers:**
```typescript
✅ MetaOAuthController
   - GET  /api/meta/oauth/start
   - GET  /api/meta/oauth/callback
   - GET  /api/meta/accounts
   - DELETE /api/meta/accounts/:id

✅ MetaWebhookController
   - GET  /api/meta/webhook (verificação)
   - POST /api/meta/webhook (receber eventos)

✅ MetaMessagingController
   - POST /api/meta/send-message
   - GET  /api/meta/conversations/:accountId
   - GET  /api/meta/messages/:accountId/:contactId
```

### Frontend (React)

```typescript
✅ metaInstagramService
   - startOAuth()
   - listAccounts()
   - disconnectAccount(accountId)
   - sendMessage(params)
   - getConversations(accountId)
   - getMessages(accountId, contactId)

✅ MetaInstagramConnect Component
   - Botão "Conectar Instagram"
   - Popup OAuth
   - Lista de contas conectadas
   - Botão desconectar
   - Info box com requisitos
```

### Banco de Dados (SQL)

```sql
✅ Tabela: oauth_states
   - Para CSRF protection no OAuth

✅ Tabela: meta_instagram_accounts
   - id, tenant_id, user_id
   - instagram_account_id, username, name, profile_pic
   - facebook_page_id, facebook_page_name
   - access_token (criptografado), long_lived_token
   - token_expires_at, status, connected_at

✅ Tabela: instagram_messages
   - id, tenant_id, account_id
   - message_id, conversation_id
   - from_id, to_id, message_text
   - message_type, attachments, direction
   - status, sent_at, raw_payload
```

---

## 📦 O QUE **NÃO** FOI FEITO

Esta sessão foi apenas documentação. **Nenhuma** das seguintes tarefas foi realizada:

- [ ] ❌ Código backend implementado
- [ ] ❌ Código frontend implementado
- [ ] ❌ Facebook App criado
- [ ] ❌ Migrations executadas no banco
- [ ] ❌ Variáveis .env adicionadas
- [ ] ❌ Testes realizados
- [ ] ❌ Deploy
- [ ] ❌ OAuth testado
- [ ] ❌ Webhook configurado

**ESTADO ATUAL DO CÓDIGO:**
- Backend: v120-notificame-hub (sem alterações)
- Frontend: v120.1-channels-ui (sem alterações)
- Banco: Sem novas tabelas

---

## ✅ O QUE ESTÁ FUNCIONANDO (de sessões anteriores)

### NotificaMe Hub Integração (v120/v120.1)

**Backend:**
- ✅ `GET /api/notificame/channels` - Lista 4 canais conectados
- ✅ `POST /api/notificame/send-instagram-message` - Envia via n8n

**Frontend:**
- ✅ Componente `NotificaMeChannels` (lista canais)
- ✅ Visível em `/integracoes-sociais` → aba "Instagram & Messenger"

**n8n:**
- ✅ Workflow "Notificame_nexus" ativo
- ✅ Webhook: `https://webhook.nexusatemporal.com/webhook/notificame/send-instagram`

**4 Canais Instagram Conectados:**
1. Nexus Atemporal (@nexusatemporal)
2. Estética Prime Moema (@clinicaprimemoema_)
3. Estética Premium (@esteticapremium__)
4. Estética Fit Global (@esteticafitglobal)

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

### Opção A: Implementar Meta API (Recomendado) ⭐

**Tempo estimado:** 4-5 horas

**Passo a passo:**
1. **Criar Facebook App** (30 min)
   - Acessar: https://developers.facebook.com/apps
   - Criar app tipo "Business"
   - Adicionar produtos: Instagram + Webhooks
   - Configurar OAuth redirect URIs
   - Anotar App ID e App Secret

2. **Backend** (3 horas)
   - Adicionar vars ao .env (META_APP_ID, META_APP_SECRET, etc.)
   - Rodar migrations (copiar de `INTEGRACAO_META_INSTAGRAM_MESSENGER.md`)
   - Copiar/colar código backend (Services + Controllers + Rotas)
   - Testar compilação

3. **Frontend** (1 hora)
   - Copiar/colar service + componente
   - Adicionar aba na página de integrações
   - Build e testar

4. **Testes** (30 min)
   - Conectar sua conta Instagram Business
   - Enviar mensagem de teste
   - Receber via webhook

5. **Deploy**
   - Build e deploy backend
   - Build e deploy frontend
   - ✅ Funcionando!

**Guia completo:** `INTEGRACAO_META_INSTAGRAM_MESSENGER.md`

---

### Opção B: Implementar iFrame NotificaMe (Rápido)

**Tempo estimado:** 30 minutos

**Passo a passo:**
1. Copiar componente `NotificaMeConnect` de `SOLUCAO_CONECTAR_NOVOS_CANAIS.md`
2. Adicionar endpoint backend `/api/notificame/panel-token`
3. Adicionar aba na página de integrações
4. Deploy

**Vantagens:**
- ✅ Rápido (30 min)
- ✅ Usa interface oficial NotificaMe

**Desvantagens:**
- ❌ Usuário precisa fazer login no NotificaMe
- ❌ UX não é nativa

---

### Opção C: Implementar Fluxo Manual

**Tempo estimado:** 2 horas

**Passo a passo:**
1. Criar tabela `channel_connection_requests`
2. Criar endpoints de solicitação
3. Criar componente de solicitação no frontend
4. Admin conecta manualmente e registra channel_id

**Guia completo:** `SOLUCAO_CONECTAR_NOVOS_CANAIS.md` (SOLUÇÃO 2)

---

## 🐛 PROBLEMAS CONHECIDOS

### TypeScript Build Errors (Pré-existentes)

**Arquivos com erros:**
- `backend/src/modules/chat/chat.controller.ts`
- `backend/src/modules/marketing/marketing.controller.ts`

**Status:** Não afeta produção (Docker build funciona)

**Solução temporária:** Usar Docker build

**Solução definitiva:** Corrigir tipos TypeScript

---

## 📊 STATUS ATUAL DO SISTEMA

### Serviços Rodando

```
✅ nexus_backend:  v120-notificame-hub (Running)
✅ nexus_frontend: v120.1-channels-ui (Running)
✅ nexus_postgres: postgres:15 (Running)
✅ nexus_n8n:      n8nio/n8n (Running)
✅ n8n workflow:   Notificame_nexus (ATIVO)
```

### URLs

```
Frontend:  https://one.nexusatemporal.com.br
Backend:   https://api.nexusatemporal.com.br
n8n:       https://automacao.nexusatemporal.com.br
Webhook:   https://webhook.nexusatemporal.com
```

### Endpoints Disponíveis

```
GET  /api/notificame/channels
POST /api/notificame/send-instagram-message
```

---

## 💡 DICAS IMPORTANTES

### Se for implementar Meta API:

1. **Development Mode primeiro**
   - Funciona com suas contas de teste
   - Não precisa App Review
   - Perfeito para testar

2. **Production Mode depois**
   - Submeter para App Review (~7 dias)
   - Funciona com qualquer conta pública
   - Apenas se quiser uso público

3. **Segurança**
   - Tokens são criptografados (AES-256)
   - CSRF protection com state
   - Webhook signature validation

4. **Tokens Long-Lived**
   - Duram 60 dias
   - Podem ser renovados antes de expirar
   - TODO: Implementar renovação automática (cron job)

---

## 📚 REFERÊNCIAS ÚTEIS

### Documentação Criada (esta sessão)
- `SOLUCAO_CONECTAR_NOVOS_CANAIS.md` - 3 soluções comparadas
- `INTEGRACAO_META_INSTAGRAM_MESSENGER.md` - Guia completo Meta API
- `RESUMO_INTEGRACAO_META.md` - Resumo executivo

### Documentação Anterior (sessões passadas)
- `ORIENTACAO_PROXIMA_SESSAO_A.md` (da sessão anterior) - v120.1
- `IMPLEMENTACAO_NOTIFICAME_HUB_v120.md` - v120
- `SOLUCAO_NOTIFICAME_FUNCIONAL.md` - API NotificaMe descoberta
- `DIAGNOSTICO_TESTE_N8N_OAUTH.md` - Testes OAuth NotificaMe

### Links Externos
- Meta for Developers: https://developers.facebook.com
- Instagram Platform: https://developers.facebook.com/docs/instagram-platform
- NotificaMe Hub: https://hub.notificame.com.br
- Node n8n NotificaMe: https://github.com/oriondesign2015/n8n-nodes-notificame-hub

---

## 🎯 RESUMO EXECUTIVO

### ✅ O que esta sessão entregou:

```
📘 3 documentos completos (1.500+ linhas)
📋 Código pronto para implementar (backend + frontend)
🔍 Pesquisa completa de APIs (NotificaMe + Meta)
💡 3 soluções viáveis documentadas
⏱️ Tempo estimado de implementação definido
```

### ❌ O que esta sessão NÃO fez:

```
❌ Implementar código
❌ Modificar banco de dados
❌ Deploy
❌ Testes
```

### 🎁 O que a próxima sessão vai receber:

```
✅ Guia passo a passo completo
✅ Código pronto para copiar/colar
✅ Decisão clara: Meta API é a melhor solução
✅ Checklist de implementação
✅ Troubleshooting antecipado
```

---

## 🚀 AÇÃO IMEDIATA RECOMENDADA

**Próxima Sessão A deve começar por:**

1. **Ler** `RESUMO_INTEGRACAO_META.md` (5 min)
2. **Decidir** qual solução implementar:
   - Meta API (recomendado) → 4-5h
   - iFrame NotificaMe (rápido) → 30 min
   - Fluxo Manual (intermediário) → 2h
3. **Seguir** o guia correspondente
4. **Implementar** código
5. **Deploy** e testar

---

**Desenvolvido por**: Claude Code - Sessão A
**Data**: 2025-10-22
**Versão**: v121-docs-meta-integration
**Tipo**: 📘 Documentação (sem código)
**Status**: ✅ COMPLETO - Pronto para próxima sessão implementar

---

**Boa sorte na próxima sessão!** 🚀

> 💡 **Recomendação final**: Implementar Meta API. É a solução mais robusta, escalável e independente. O código está pronto, só copiar e testar!
