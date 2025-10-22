# 🚀 Sessão C - Módulo de Marketing - Viabilidade Técnica

**Data**: 2025-10-22
**Desenvolvedor**: Claude Code - Sessão C
**Versão**: v116-marketing-module
**Status**: ✅ VIÁVEL - Implementação Iniciada

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [APIs Pesquisadas](#apis-pesquisadas)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Funcionalidades](#funcionalidades)
5. [Requisitos do Usuário](#requisitos-do-usuário)
6. [Implementação Faseada](#implementação-faseada)
7. [Desafios e Limitações](#desafios-e-limitações)

---

## 🎯 VISÃO GERAL

### Objetivo
Criar um **módulo completo de Marketing** integrado ao Nexus CRM com capacidades de:
- 📊 Análise de métricas (Facebook, Google, TikTok)
- 📱 Postagem automática em redes sociais
- 💌 Envio em massa (WhatsApp, Instagram, Email)
- 🌐 Criador de Sites/Landing Pages
- 🤖 IA Assistente para otimização de campanhas

### Escopo
Este é um projeto **MASSIVO** que equivale a criar uma ferramenta completa de Marketing Automation.

**Tempo estimado total**: 2-3 semanas de desenvolvimento contínuo
**Complexidade**: ⭐⭐⭐⭐⭐ (Muito Alta)

---

## 🔍 APIS PESQUISADAS

### 1. 📊 Integrações de Métricas

#### ✅ Facebook Marketing API
- **Versão**: v21.0 (2024-2025)
- **Documentação**: https://developers.facebook.com/docs/marketing-apis
- **SDK**: Python Business SDK disponível
- **Autenticação**: OAuth 2.0
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - Insights de campanhas
  - Métricas de performance
  - Conversions API
  - Dados de audiência
- **Limitações**:
  - API v20.0 será descontinuada em maio 2025
  - Requer App Facebook aprovado
  - Rate limits por usuário

#### ✅ Google Ads API
- **Versão**: Atual (2025)
- **Documentação**: https://developers.google.com/google-ads/api
- **Autenticação**: OAuth 2.0 (3 workflows disponíveis)
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - Performance de campanhas
  - Keywords analytics
  - Budget tracking
  - Relatórios customizados
- **Limitações**:
  - Requer Developer Token
  - OAuth complexo (client_id, client_secret, refresh_token)
  - Pode precisar de revisão do Google

#### ✅ Google Analytics 4 API
- **Versão**: Data API v1
- **Documentação**: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Autenticação**: OAuth 2.0 ou Service Account
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - runReport (relatórios customizados)
  - batchRunReports (múltiplos relatórios)
  - runPivotReport (tabelas dinâmicas)
  - Métricas de conversão
- **Limitações**:
  - Universal Analytics foi descontinuado (julho 2024)
  - Apenas GA4 properties
  - SDKs em Java, Python, Node.js

#### ✅ TikTok Marketing API
- **Versão**: 2025
- **Documentação**: https://business-api.tiktok.com/portal/docs
- **Autenticação**: OAuth 2.0
- **Viabilidade**: ✅ **MÉDIA-ALTA**
- **Recursos**:
  - Campaign management
  - Ad performance metrics
  - Creative analytics
  - Batch operations
- **Limitações**:
  - Requer conta TikTok for Business
  - API em desenvolvimento (menos matura)
  - Rate limits mais restritivos

---

### 2. 📱 Postagem Automática em Redes Sociais

#### ✅ Instagram Graph API
- **Documentação**: https://developers.facebook.com/docs/instagram-api
- **Autenticação**: OAuth 2.0 (via Facebook)
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - Feed posts (imagem, carrossel)
  - Instagram Reels
  - Instagram Stories
  - Agendamento de posts
- **Limitações Críticas**:
  - ⚠️ **50 posts API por 24 horas** (hard limit)
  - Requer conta Business ou Creator
  - Conta deve estar conectada a Facebook Page
  - Carrosséis contam como 1 post
- **Tipos de conteúdo suportados**:
  - ✅ Imagens
  - ✅ Carrosséis (até 10 itens)
  - ✅ Reels
  - ✅ Stories

#### ✅ Facebook Graph API
- **Documentação**: https://developers.facebook.com/docs/graph-api
- **Autenticação**: OAuth 2.0
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - Page posts
  - Photo/video uploads
  - Link sharing
  - Agendamento
- **Limitações**:
  - Rate limits por usuário
  - Requer Facebook Page
  - Permissões específicas necessárias

#### ⚠️ WhatsApp Business API - Postagem
- **Documentação**: https://developers.facebook.com/docs/whatsapp
- **Viabilidade**: ⚠️ **LIMITADA**
- **IMPORTANTE**: WhatsApp não tem conceito de "posts" como Instagram/Facebook
- **O que é possível**:
  - ✅ Envio de mensagens template (aprovadas previamente)
  - ✅ Respostas a mensagens (janela de 24h)
  - ❌ Não há feed ou timeline
  - ❌ Não há "posts públicos"
- **Recomendação**: Mover WhatsApp apenas para "Envio em Massa"

#### ✅ LinkedIn Posts API
- **Versão**: 2025-10 (versões mensais)
- **Documentação**: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- **Autenticação**: OAuth 2.0
- **Viabilidade**: ✅ **ALTA**
- **Recursos**:
  - Organic posts
  - Sponsored content
  - Article ads
  - Document ads
  - Buy/Shop Now CTA (desde 202504)
- **Limitações**:
  - Versões suportadas por apenas 1 ano
  - Requer headers específicos (LinkedIn-Version, X-Restli-Protocol-Version)
  - Lead Sync APIs serão descontinuadas em julho 2025

#### ✅ TikTok Content API
- **Documentação**: https://developers.tiktok.com/doc/overview
- **Viabilidade**: ✅ **MÉDIA**
- **Recursos**:
  - Video upload
  - Content publishing
  - Creative management
- **Limitações**:
  - API relativamente nova
  - Documentação menos completa
  - Pode ter restrições regionais

---

### 3. 💌 Envio em Massa

#### ⚠️ WhatsApp Business API - Bulk Messaging
- **Documentação**: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- **Viabilidade**: ⚠️ **MÉDIA (Com Restrições)**
- **Capacidade**:
  - WhatsApp Business App: 256 contatos (broadcast list)
  - WhatsApp Business API: 1,000 - 100,000 msgs/dia (depende do tier)
- **Requisitos Críticos**:
  - ✅ Usuários devem ter opt-in explícito
  - ✅ Mensagens marketing requerem templates aprovados
  - ✅ Quality rating afeta limites
  - ⚠️ **Marketing para números US pausado desde 01/04/2025**
- **Custos**:
  - Pricing por mensagem (desde 01/07/2025)
  - Volume tiers para utility e authentication
- **Integração**:
  - Requer BSP (Business Solution Provider): Twilio, WATI, MessageBird
  - Ou usar Cloud API direto (mais complexo)

#### ✅ Instagram Direct Messages API
- **Documentação**: https://developers.facebook.com/docs/messenger-platform/instagram
- **Viabilidade**: ✅ **MÉDIA**
- **Recursos**:
  - Envio de mensagens diretas
  - Mensagens em massa (com limitações)
- **Limitações**:
  - Rate limits rigorosos
  - Usuário deve ter interagido antes
  - Requer opt-in

#### ✅ Email Bulk Sending
- **Opções**:
  1. **SendGrid API** (recomendado)
  2. **AWS SES**
  3. **Mailgun**
  4. **Resend** (novo, moderno)
- **Viabilidade**: ✅ **MUITO ALTA**
- **Recursos**:
  - Envio em massa ilimitado (com custo)
  - Templates
  - Tracking (aberturas, cliques)
  - Analytics completo
- **Recomendação**: Começar com **SendGrid** ou **Resend**

---

### 4. 🌐 Criador de Sites/Landing Pages

#### ✅ GrapesJS (Recomendado)
- **Website**: https://grapesjs.com
- **Licença**: BSD 3-Clause (Open Source)
- **Viabilidade**: ✅ **MUITO ALTA**
- **Recursos**:
  - Drag & drop visual
  - Responsive design
  - Component system
  - Storage manager
  - Asset manager
  - Export HTML/CSS
  - Plugin ecosystem
- **Integração**:
  - Framework-agnostic (funciona com React)
  - API JavaScript completa
  - Customizável via plugins
- **Vantagens**:
  - ✅ Open source e gratuito
  - ✅ Muito maduro (usado por milhares)
  - ✅ Documentação excelente
  - ✅ Comunidade ativa

#### Alternativas:
- **VvvebJs**: Vanilla JS, Bootstrap 5
- **Webiny**: Serverless, mais complexo
- **Simpllo**: Mais simples, menos recursos

**Decisão**: **GrapesJS** é a melhor escolha.

---

### 5. 🤖 Múltiplos Modelos de IA

#### ✅ Groq
- **Website**: https://groq.com
- **Documentação**: https://console.groq.com/docs/overview
- **API Base**: `https://api.groq.com/openai/v1`
- **Viabilidade**: ✅ **MUITO ALTA**
- **Características**:
  - OpenAI-compatible API
  - 300+ tokens/segundo
  - LPU™ hardware (ultra rápido)
  - Modelos suportados: Llama, Mixtral, Gemma
  - Baixo custo
- **Autenticação**: API Key (GROQ_API_KEY)

#### ✅ OpenRouter
- **Website**: https://openrouter.ai
- **Documentação**: https://openrouter.ai/docs
- **Viabilidade**: ✅ **MUITO ALTA**
- **Características**:
  - **400+ modelos de IA** em um único endpoint
  - OpenAI-compatible
  - Automatic failover
  - Multimodal (texto, imagem, PDF, áudio)
  - Streaming support
  - Modelos: GPT-5, Claude 4, Gemini 2.5 Pro, etc.
- **Vantagem**: **Melhor opção para ter múltiplos modelos com 1 API**

#### ✅ DeepSeek
- **Website**: https://platform.deepseek.com
- **Documentação**: https://api-docs.deepseek.com
- **Viabilidade**: ✅ **MUITO ALTA**
- **Características**:
  - OpenAI-compatible
  - DeepSeek-V3.2-Exp (685B params)
  - DeepSeek-R1 (reasoning)
  - Preços reduzidos 50% em 2025
  - Excelente custo-benefício

#### ✅ Ollama
- **Website**: https://ollama.com
- **Documentação**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **Viabilidade**: ✅ **ALTA (Self-hosted)**
- **Características**:
  - Self-hosted (roda no servidor)
  - Gratuito (sem custos de API)
  - Localhost:11434
  - Modelos locais
  - APIs: /api/generate, /api/chat
- **Vantagem**: Zero custo, privacidade total
- **Desvantagem**: Requer GPU no servidor

#### ✅ Mistral AI
- **Website**: https://mistral.ai
- **Documentação**: https://docs.mistral.ai
- **Console**: https://console.mistral.ai
- **Viabilidade**: ✅ **MUITO ALTA**
- **Características**:
  - Agents API (maio 2025)
  - Built-in connectors (code, web, imagens)
  - Persistent memory
  - Mixtral-8x7B-Instruct
  - Coding model (julho 2025)
- **Vantagem**: Agents API é perfeito para assistente de marketing

#### ✅ Qwen (Alibaba)
- **Website**: https://qwen.ai
- **Documentação**: https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
- **Viabilidade**: ✅ **ALTA**
- **Características**:
  - OpenAI-compatible
  - Qwen2.5-Max (MoE, 20T tokens)
  - qwen-max-2025-01-25
  - Alibaba Cloud Model Studio
- **Base URL**: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

#### 🎨 Modelos de Geração de Imagem (HuggingFace)

**Principais modelos identificados**:

1. **FLUX.1-dev** (Black Forest Labs)
   - 1.5M+ downloads
   - Inference: Replicate, FAL, Nebius
   - Qualidade alta

2. **HunyuanImage-3.0** (Tencent)
   - Advanced synthesis
   - Inference: Replicate, FAL

3. **Stable Diffusion XL**
   - Popular e confiável
   - Múltiplos providers

**Recomendação**: Usar **OpenRouter** que já inclui modelos de imagem, ou **Replicate API**.

---

## 🏗️ ARQUITETURA DO SISTEMA

### Estrutura de Diretórios

```
backend/
└── src/
    └── modules/
        └── marketing/
            ├── entities/
            │   ├── campaign.entity.ts
            │   ├── social-post.entity.ts
            │   ├── bulk-message.entity.ts
            │   ├── landing-page.entity.ts
            │   ├── ai-analysis.entity.ts
            │   └── integration.entity.ts
            ├── services/
            │   ├── facebook.service.ts
            │   ├── google-ads.service.ts
            │   ├── google-analytics.service.ts
            │   ├── tiktok.service.ts
            │   ├── instagram.service.ts
            │   ├── linkedin.service.ts
            │   ├── whatsapp-bulk.service.ts
            │   ├── email-bulk.service.ts
            │   ├── ai-assistant.service.ts
            │   └── landing-page.service.ts
            ├── controllers/
            │   ├── marketing.controller.ts
            │   ├── social-posting.controller.ts
            │   ├── bulk-messaging.controller.ts
            │   ├── analytics.controller.ts
            │   └── landing-pages.controller.ts
            └── marketing.routes.ts

frontend/
└── src/
    └── pages/
        └── marketing/
            ├── MarketingDashboard.tsx
            ├── CampaignAnalytics.tsx
            ├── SocialPosting.tsx
            ├── BulkMessaging.tsx
            ├── LandingPageBuilder.tsx
            └── AIAssistant.tsx
```

### Database Schema (Migration 012)

```sql
-- Campanhas de Marketing
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'social', 'email', 'whatsapp', 'landing_page'
  status VARCHAR(50) NOT NULL, -- 'draft', 'active', 'paused', 'completed'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget DECIMAL(10, 2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts de Redes Sociais
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'linkedin', 'tiktok'
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(50) NOT NULL, -- 'draft', 'scheduled', 'published', 'failed'
  platform_post_id VARCHAR(255),
  metrics JSONB, -- likes, comments, shares, impressions
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Envios em Massa
CREATE TABLE bulk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  platform VARCHAR(50) NOT NULL, -- 'whatsapp', 'instagram', 'email'
  template_id VARCHAR(255),
  content TEXT,
  recipients JSONB, -- array de contatos
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(50) NOT NULL, -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  total_recipients INT,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Landing Pages
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  html_content TEXT,
  css_content TEXT,
  js_content TEXT,
  grapesjs_data JSONB, -- GrapesJS project data
  status VARCHAR(50) NOT NULL, -- 'draft', 'published', 'archived'
  published_at TIMESTAMP,
  views_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  og_image VARCHAR(500),
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Integrações de Marketing
CREATE TABLE marketing_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'google_ads', 'google_analytics', 'tiktok'
  credentials JSONB NOT NULL, -- access_token, refresh_token, etc
  config JSONB, -- account_id, pixel_id, etc
  status VARCHAR(50) NOT NULL, -- 'active', 'inactive', 'expired'
  last_sync_at TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, platform)
);

-- Análises de IA
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  related_type VARCHAR(50), -- 'campaign', 'post', 'message', 'landing_page'
  related_id UUID,
  ai_model VARCHAR(100), -- 'groq:llama3', 'openrouter:gpt4', 'deepseek:v3', etc
  analysis_type VARCHAR(50), -- 'sentiment', 'optimization', 'prediction', 'image_gen'
  input_data JSONB,
  output_data JSONB,
  suggestions TEXT[],
  score DECIMAL(3, 2), -- 0-1 score
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Métricas de Campanhas
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  campaign_id UUID REFERENCES marketing_campaigns(id),
  platform VARCHAR(50), -- 'facebook', 'google_ads', 'instagram', etc
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  raw_data JSONB, -- dados brutos da API
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, platform, metric_date)
);

-- Índices
CREATE INDEX idx_campaigns_tenant ON marketing_campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_social_posts_tenant ON social_posts(tenant_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_bulk_messages_tenant ON bulk_messages(tenant_id);
CREATE INDEX idx_landing_pages_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_marketing_integrations_tenant ON marketing_integrations(tenant_id);
CREATE INDEX idx_ai_analyses_tenant ON ai_analyses(tenant_id);
CREATE INDEX idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(metric_date);
```

---

## 🎯 FUNCIONALIDADES

### Fase 1: Fundação (v116-v118)
- ✅ Database schema e migrations
- ✅ Entities TypeORM
- ✅ Controllers e routes básicos
- ✅ Interface frontend inicial

### Fase 2: Integrações de Métricas (v119-v121)
- Facebook Marketing API
- Google Ads API
- Google Analytics 4 API
- TikTok Marketing API
- Dashboard de métricas

### Fase 3: Postagem Automática (v122-v125)
- Instagram posting
- Facebook posting
- LinkedIn posting
- TikTok posting
- Agendamento de posts

### Fase 4: Envio em Massa (v126-v128)
- WhatsApp bulk messaging (com NotificaMe)
- Email bulk (SendGrid/Resend)
- Instagram Direct
- Templates e agendamento

### Fase 5: Landing Page Builder (v129-v130)
- Integração GrapesJS
- CRUD de landing pages
- Sistema de publicação
- Analytics de LPs

### Fase 6: IA Assistente (v131-v133)
- Integração múltiplos modelos
- Análise preditiva de mensagens
- Geração de imagens
- Análise e sugestões de campanhas

---

## ⚠️ REQUISITOS DO USUÁRIO

### Credenciais Necessárias

Para implementar completamente, você precisará fornecer:

#### 1. Facebook/Instagram/WhatsApp
- [ ] Facebook App ID e App Secret
- [ ] Access Token de longa duração
- [ ] Facebook Page ID
- [ ] Instagram Business Account ID
- [ ] WhatsApp Business Account ID (se usar WhatsApp)

#### 2. Google
- [ ] Google Cloud Project
- [ ] OAuth 2.0 Client ID e Secret
- [ ] Developer Token (Google Ads)
- [ ] GA4 Property ID

#### 3. TikTok
- [ ] TikTok for Business Account
- [ ] App ID e Secret
- [ ] Access Token

#### 4. LinkedIn
- [ ] LinkedIn App
- [ ] Client ID e Secret
- [ ] Organization ID

#### 5. Modelos de IA
- [ ] Groq API Key (https://console.groq.com)
- [ ] OpenRouter API Key (https://openrouter.ai)
- [ ] DeepSeek API Key (https://platform.deepseek.com)
- [ ] Mistral API Key (https://console.mistral.ai)
- [ ] Qwen/Alibaba Cloud credentials (opcional)
- [ ] Ollama self-hosted (opcional)

#### 6. Email
- [ ] SendGrid API Key OU
- [ ] Resend API Key OU
- [ ] AWS SES credentials

### Ações Necessárias

1. **Criar Apps em cada plataforma**
2. **Configurar OAuth redirects**
3. **Solicitar permissões necessárias**
4. **Obter aprovação de APIs** (algumas requerem review)
5. **Configurar webhooks** (para algumas integrações)

---

## 📅 IMPLEMENTAÇÃO FASEADA

### HOJE (v116): Fundação
**Tempo estimado**: 2-3 horas

- [x] Pesquisa de APIs ✅
- [ ] Criar migration 012
- [ ] Criar entities
- [ ] Criar services básicos
- [ ] Criar controllers
- [ ] Criar rotas
- [ ] Interface frontend básica
- [ ] Build e deploy

### PRÓXIMAS SESSÕES:

**Sessão 2 (v117-v118)**: Integrações Facebook + Google
**Sessão 3 (v119-v120)**: TikTok + Dashboard
**Sessão 4 (v121-v123)**: Social Posting (Instagram, Facebook, LinkedIn)
**Sessão 5 (v124-v125)**: TikTok Posting
**Sessão 6 (v126-v128)**: Bulk Messaging
**Sessão 7 (v129-v130)**: Landing Page Builder
**Sessão 8 (v131-v133)**: IA Assistente

---

## ⚠️ DESAFIOS E LIMITAÇÕES

### Desafios Técnicos

1. **OAuth Complexo**: Cada plataforma tem seu fluxo OAuth
2. **Rate Limits**: Instagram (50 posts/24h), WhatsApp (tier-based)
3. **Aprovações**: Algumas APIs requerem review (Google Ads, WhatsApp)
4. **Custos**: APIs de IA e envio de email têm custos
5. **Webhooks**: Algumas integrações requerem endpoints públicos
6. **Multitenancy**: Cada tenant precisa de suas próprias credenciais

### Limitações Conhecidas

1. **WhatsApp**:
   - Não tem "posts" como outras redes
   - Marketing para US pausado desde abril 2025
   - Requer templates aprovados
   - Custo por mensagem

2. **Instagram**:
   - Limite de 50 posts API/24h
   - Requer Business Account
   - Algumas features só via app

3. **TikTok**:
   - API menos madura
   - Documentação incompleta em algumas áreas
   - Possíveis restrições regionais

4. **IA Self-hosted (Ollama)**:
   - Requer GPU no servidor
   - Performance inferior a cloud APIs
   - Mais complexo de configurar

### Recomendações

1. **Começar simples**: Implementar fase por fase
2. **Validar com usuário**: Após cada fase, validar antes de prosseguir
3. **Mock primeiro**: Usar dados mockados para testar UI antes de integrar APIs
4. **Documentar tudo**: Cada integração precisa de doc para o usuário
5. **Error handling robusto**: APIs externas podem falhar
6. **Retry logic**: Implementar retentativas automáticas
7. **Logging extensivo**: Para debug de problemas de integração

---

## ✅ DECISÕES ARQUITETURAIS

1. **IA Provider Principal**: **OpenRouter** (400+ modelos, um endpoint)
2. **IA Secundário**: **Groq** (ultra rápido) e **DeepSeek** (custo-benefício)
3. **Landing Page Builder**: **GrapesJS** (open source, maduro)
4. **Email Provider**: **SendGrid** ou **Resend** (a definir com usuário)
5. **WhatsApp**: Integrar com **NotificaMe** existente + Cloud API
6. **Database**: PostgreSQL com JSONB para flexibilidade
7. **Frontend**: React com componentes modulares por feature

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Documento de viabilidade (este arquivo)
2. ⏳ Criar migration 012 (database schema)
3. ⏳ Criar entities TypeORM
4. ⏳ Implementar services básicos
5. ⏳ Criar controllers e rotas
6. ⏳ Interface frontend inicial
7. ⏳ Build e deploy v116

---

## 📞 COMUNICAÇÃO COM USUÁRIO

### Perguntas Importantes:

1. **APIs Prioritárias**: Qual integração é mais importante começar?
   - Facebook/Instagram?
   - Google Ads?
   - TikTok?

2. **Email Provider**: Qual prefere?
   - SendGrid?
   - Resend?
   - AWS SES?
   - Outro?

3. **Credenciais**: Você já tem apps criados nas plataformas ou precisa de ajuda para criar?

4. **Orçamento IA**: Há orçamento para APIs de IA pagas ou prefere começar com Ollama self-hosted?

5. **Prioridade**: Qual módulo é mais urgente?
   - Analytics/Métricas?
   - Postagem automática?
   - Envio em massa?
   - Landing pages?
   - IA assistente?

---

**Status**: ✅ VIÁVEL - Pronto para implementação
**Próximo arquivo**: `SESSAO_C_v116_IMPLEMENTATION.md`
**Desenvolvido por**: Claude Code - Sessão C
**Data**: 2025-10-22
