-- Migration: Create AI Usage, Cache, and Audit tables
-- Created: 2025-10-23
-- Description: Tables for AI monitoring, caching, and audit logging

-- AI Usage Logs (Dashboard de Uso)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_id INT,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    cost_usd DECIMAL(10, 6),
    response_time_ms INT,
    module VARCHAR(100), -- 'marketing', 'leads', 'chat', 'assistant'
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_provider ON ai_usage_logs(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_module ON ai_usage_logs(module);

-- AI Cache (Cache de Respostas)
CREATE TABLE IF NOT EXISTS ai_cache (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    prompt_hash VARCHAR(64) NOT NULL, -- MD5/SHA256 do prompt
    prompt_text TEXT,
    response TEXT NOT NULL,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count INT DEFAULT 0,
    UNIQUE(tenant_id, provider, prompt_hash)
);

CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON ai_cache(expires_at);

-- AI Audit Logs (Logs de Auditoria)
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_id INT,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    prompt TEXT,
    response TEXT,
    tokens_used INT,
    cost_usd DECIMAL(10, 6),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    module VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON ai_audit_logs(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_success ON ai_audit_logs(success);

-- AI Rate Limits (Controle de Uso)
CREATE TABLE IF NOT EXISTS ai_rate_limits (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    max_requests_per_hour INT DEFAULT 100,
    max_tokens_per_day INT DEFAULT 50000,
    max_cost_per_month_usd DECIMAL(10, 2) DEFAULT 100.00,
    current_requests_hour INT DEFAULT 0,
    current_tokens_day INT DEFAULT 0,
    current_cost_month_usd DECIMAL(10, 2) DEFAULT 0.00,
    hour_reset_at TIMESTAMP,
    day_reset_at TIMESTAMP,
    month_reset_at TIMESTAMP,
    alerts_enabled BOOLEAN DEFAULT true,
    alert_threshold_percent INT DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Provider Fallback Configuration
CREATE TABLE IF NOT EXISTS ai_fallback_config (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL, -- 'marketing', 'chat', 'leads', etc
    priority_order JSON NOT NULL, -- ["openai", "anthropic", "groq"]
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, module)
);

COMMENT ON TABLE ai_usage_logs IS 'Logs de uso das IAs para dashboard e análise';
COMMENT ON TABLE ai_cache IS 'Cache de respostas das IAs para economizar tokens';
COMMENT ON TABLE ai_audit_logs IS 'Auditoria completa de todas chamadas às IAs';
COMMENT ON TABLE ai_rate_limits IS 'Limites de uso por tenant para controle de custos';
COMMENT ON TABLE ai_fallback_config IS 'Configuração de fallback entre provedores de IA';
