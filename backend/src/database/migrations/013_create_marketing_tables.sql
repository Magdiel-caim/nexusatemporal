-- Migration 012: Marketing Module Tables
-- Date: 2025-10-22
-- Description: Creates all tables for the Marketing module including campaigns, social posts, bulk messages, landing pages, integrations, AI analyses, and metrics

-- ============================================
-- MARKETING CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'social', 'email', 'whatsapp', 'landing_page', 'multi'
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketing_campaigns_tenant ON marketing_campaigns(tenant_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- ============================================
-- SOCIAL MEDIA POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'linkedin', 'tiktok'
  post_type VARCHAR(50) DEFAULT 'feed', -- 'feed', 'story', 'reel', 'carousel'
  content TEXT NOT NULL,
  media_urls TEXT[],
  media_type VARCHAR(20), -- 'image', 'video', 'carousel'
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed', 'deleted'
  platform_post_id VARCHAR(255),
  platform_url TEXT,
  error_message TEXT,
  metrics JSONB DEFAULT '{}', -- {likes, comments, shares, impressions, reach, etc}
  hashtags TEXT[],
  mentions TEXT[],
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_social_posts_tenant ON social_posts(tenant_id);
CREATE INDEX idx_social_posts_campaign ON social_posts(campaign_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_published ON social_posts(published_at);

-- ============================================
-- BULK MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL, -- 'whatsapp', 'instagram_dm', 'email'
  message_type VARCHAR(50) DEFAULT 'marketing', -- 'marketing', 'transactional', 'notification'
  subject VARCHAR(255), -- for emails
  template_id VARCHAR(255),
  template_name VARCHAR(255),
  content TEXT NOT NULL,
  media_urls TEXT[],
  recipients JSONB NOT NULL DEFAULT '[]', -- [{phone/email, name, vars}, ...]
  variables JSONB DEFAULT '{}', -- template variables
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  bounced_count INT DEFAULT 0,
  unsubscribed_count INT DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bulk_messages_tenant ON bulk_messages(tenant_id);
CREATE INDEX idx_bulk_messages_campaign ON bulk_messages(campaign_id);
CREATE INDEX idx_bulk_messages_platform ON bulk_messages(platform);
CREATE INDEX idx_bulk_messages_status ON bulk_messages(status);
CREATE INDEX idx_bulk_messages_scheduled ON bulk_messages(scheduled_at);

-- ============================================
-- BULK MESSAGE RECIPIENTS (tracking individual)
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_message_id UUID NOT NULL REFERENCES bulk_messages(id) ON DELETE CASCADE,
  recipient_identifier VARCHAR(255) NOT NULL, -- phone, email, instagram_id
  recipient_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'opened', 'clicked', 'bounced', 'unsubscribed'
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  platform_message_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bulk_recipients_message ON bulk_message_recipients(bulk_message_id);
CREATE INDEX idx_bulk_recipients_status ON bulk_message_recipients(status);
CREATE INDEX idx_bulk_recipients_identifier ON bulk_message_recipients(recipient_identifier);

-- ============================================
-- LANDING PAGES
-- ============================================
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  domain VARCHAR(255), -- custom domain (optional)
  html_content TEXT,
  css_content TEXT,
  js_content TEXT,
  grapesjs_data JSONB DEFAULT '{}', -- GrapesJS project data
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP,
  views_count INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  conversions_count INT DEFAULT 0,
  bounce_rate DECIMAL(5, 2),
  avg_time_on_page INT, -- seconds
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  og_image VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  -- Settings
  settings JSONB DEFAULT '{}', -- {tracking_code, custom_css, custom_js, etc}
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_landing_pages_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_landing_pages_campaign ON landing_pages(campaign_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_landing_pages_domain ON landing_pages(domain);

-- ============================================
-- LANDING PAGE ANALYTICS EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS landing_page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'conversion', 'form_submit'
  visitor_id VARCHAR(255), -- anonymous or identified
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lp_events_page ON landing_page_events(landing_page_id);
CREATE INDEX idx_lp_events_type ON landing_page_events(event_type);
CREATE INDEX idx_lp_events_visitor ON landing_page_events(visitor_id);
CREATE INDEX idx_lp_events_created ON landing_page_events(created_at);

-- ============================================
-- MARKETING INTEGRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'google_ads', 'google_analytics', 'tiktok', 'linkedin', 'sendgrid', 'resend'
  name VARCHAR(255), -- friendly name
  credentials JSONB NOT NULL DEFAULT '{}', -- {access_token, refresh_token, api_key, etc}
  config JSONB DEFAULT '{}', -- {account_id, pixel_id, page_id, etc}
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'expired', 'error'
  last_sync_at TIMESTAMP,
  expires_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, platform)
);

CREATE INDEX idx_marketing_integrations_tenant ON marketing_integrations(tenant_id);
CREATE INDEX idx_marketing_integrations_platform ON marketing_integrations(platform);
CREATE INDEX idx_marketing_integrations_status ON marketing_integrations(status);

-- ============================================
-- AI ANALYSES
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  related_type VARCHAR(50), -- 'campaign', 'post', 'message', 'landing_page', 'general'
  related_id UUID,
  ai_provider VARCHAR(100) NOT NULL, -- 'groq', 'openrouter', 'deepseek', 'mistral', 'qwen', 'ollama'
  ai_model VARCHAR(100) NOT NULL, -- 'llama3-70b', 'gpt-4', 'claude-3', etc
  analysis_type VARCHAR(50) NOT NULL, -- 'sentiment', 'optimization', 'prediction', 'image_gen', 'copywriting', 'ab_test'
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB NOT NULL DEFAULT '{}',
  suggestions TEXT[],
  score DECIMAL(3, 2), -- 0.00-1.00 score
  tokens_used INT,
  cost DECIMAL(10, 6),
  processing_time_ms INT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_tenant ON ai_analyses(tenant_id);
CREATE INDEX idx_ai_analyses_related ON ai_analyses(related_type, related_id);
CREATE INDEX idx_ai_analyses_provider ON ai_analyses(ai_provider);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(analysis_type);
CREATE INDEX idx_ai_analyses_created ON ai_analyses(created_at);

-- ============================================
-- CAMPAIGN METRICS (aggregated daily)
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  platform VARCHAR(50), -- 'facebook', 'instagram', 'google_ads', 'tiktok', 'linkedin', 'email', 'whatsapp'
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  clicks INT DEFAULT 0,
  engagements INT DEFAULT 0,
  conversions INT DEFAULT 0,
  leads INT DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  ctr DECIMAL(5, 2), -- click-through rate
  cpc DECIMAL(10, 4), -- cost per click
  cpm DECIMAL(10, 4), -- cost per mille
  cpa DECIMAL(10, 4), -- cost per acquisition
  roas DECIMAL(10, 2), -- return on ad spend
  raw_data JSONB DEFAULT '{}', -- raw data from API
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, platform, metric_date)
);

CREATE INDEX idx_campaign_metrics_tenant ON campaign_metrics(tenant_id);
CREATE INDEX idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_platform ON campaign_metrics(platform);
CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(metric_date);

-- ============================================
-- SOCIAL MEDIA TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS social_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platforms VARCHAR(50)[], -- ['instagram', 'facebook', 'linkedin']
  category VARCHAR(100), -- 'promotion', 'engagement', 'announcement', etc
  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  variables TEXT[], -- placeholders like {{product_name}}, {{date}}
  usage_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE, -- can be shared across tenants
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_social_templates_tenant ON social_templates(tenant_id);
CREATE INDEX idx_social_templates_category ON social_templates(category);

-- ============================================
-- EMAIL TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  category VARCHAR(100), -- 'newsletter', 'promotional', 'transactional'
  variables TEXT[], -- placeholders
  usage_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);

-- ============================================
-- WHATSAPP MESSAGE TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'pt_BR',
  category VARCHAR(50) NOT NULL, -- 'MARKETING', 'UTILITY', 'AUTHENTICATION'
  content TEXT NOT NULL,
  header_type VARCHAR(20), -- 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'
  header_content TEXT,
  footer TEXT,
  buttons JSONB DEFAULT '[]', -- [{type, text, url/phone}]
  variables TEXT[],
  platform_template_id VARCHAR(255), -- ID from WhatsApp
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  usage_count INT DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_templates_tenant ON whatsapp_templates(tenant_id);
CREATE INDEX idx_whatsapp_templates_status ON whatsapp_templates(status);
CREATE INDEX idx_whatsapp_templates_category ON whatsapp_templates(category);

-- ============================================
-- AI PROMPTS LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'copywriting', 'image_gen', 'analysis', 'optimization'
  use_case VARCHAR(100), -- 'social_post', 'email_subject', 'ad_copy', 'landing_page'
  prompt_template TEXT NOT NULL,
  variables TEXT[],
  ai_provider VARCHAR(100), -- preferred provider
  ai_model VARCHAR(100), -- preferred model
  example_output TEXT,
  usage_count INT DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_prompts_tenant ON ai_prompts(tenant_id);
CREATE INDEX idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX idx_ai_prompts_use_case ON ai_prompts(use_case);

-- ============================================
-- AUDIT LOG (for tracking all marketing actions)
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'publish', 'send', etc
  resource_type VARCHAR(50) NOT NULL, -- 'campaign', 'post', 'message', 'page', etc
  resource_id UUID,
  changes JSONB DEFAULT '{}', -- {before: {}, after: {}}
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketing_audit_tenant ON marketing_audit_log(tenant_id);
CREATE INDEX idx_marketing_audit_user ON marketing_audit_log(user_id);
CREATE INDEX idx_marketing_audit_resource ON marketing_audit_log(resource_type, resource_id);
CREATE INDEX idx_marketing_audit_created ON marketing_audit_log(created_at);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns that can contain multiple posts, messages, and landing pages';
COMMENT ON TABLE social_posts IS 'Social media posts for Instagram, Facebook, LinkedIn, TikTok';
COMMENT ON TABLE bulk_messages IS 'Bulk message campaigns for WhatsApp, Instagram DM, Email';
COMMENT ON TABLE bulk_message_recipients IS 'Individual recipient tracking for bulk messages';
COMMENT ON TABLE landing_pages IS 'Landing pages created with GrapesJS builder';
COMMENT ON TABLE landing_page_events IS 'Analytics events for landing pages (views, clicks, conversions)';
COMMENT ON TABLE marketing_integrations IS 'OAuth and API integrations for marketing platforms';
COMMENT ON TABLE ai_analyses IS 'AI-powered analyses and optimizations';
COMMENT ON TABLE campaign_metrics IS 'Daily aggregated metrics from various platforms';
COMMENT ON TABLE social_templates IS 'Reusable templates for social media posts';
COMMENT ON TABLE email_templates IS 'Reusable email templates';
COMMENT ON TABLE whatsapp_templates IS 'WhatsApp message templates (require approval)';
COMMENT ON TABLE ai_prompts IS 'Library of AI prompts for various marketing tasks';
COMMENT ON TABLE marketing_audit_log IS 'Audit trail of all marketing actions';
