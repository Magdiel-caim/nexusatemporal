-- Migration: 011_create_bi_tables.sql
-- Description: Criar tabelas do módulo BI (Business Intelligence)
-- Date: 2025-10-21
-- Author: Claude Code

-- =====================================================
-- 1. Tabela: bi_dashboard_configs
-- Configurações de dashboards personalizados
-- =====================================================

CREATE TABLE IF NOT EXISTS bi_dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('executive', 'sales', 'financial', 'operational', 'attendance', 'custom')),
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  "isDefault" BOOLEAN DEFAULT FALSE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dashboard_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_dashboard_user_tenant ON bi_dashboard_configs("userId", "tenantId");
CREATE INDEX idx_dashboard_type ON bi_dashboard_configs(type);
CREATE INDEX idx_dashboard_default ON bi_dashboard_configs("isDefault") WHERE "isDefault" = TRUE;

-- Comentários
COMMENT ON TABLE bi_dashboard_configs IS 'Configurações de dashboards personalizados';
COMMENT ON COLUMN bi_dashboard_configs.config IS 'Configuração JSONB dos widgets e layout do dashboard';
COMMENT ON COLUMN bi_dashboard_configs."isDefault" IS 'Indica se é o dashboard padrão para o tipo';

-- =====================================================
-- 2. Tabela: bi_kpi_targets
-- Metas de KPIs (Key Performance Indicators)
-- =====================================================

CREATE TABLE IF NOT EXISTS bi_kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "kpiName" VARCHAR(100) NOT NULL,
  "targetValue" DECIMAL(15, 2) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "createdById" UUID,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kpi_target_creator FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_kpi_target_tenant ON bi_kpi_targets("tenantId");
CREATE INDEX idx_kpi_target_name ON bi_kpi_targets("kpiName");
CREATE INDEX idx_kpi_target_period ON bi_kpi_targets(period);
CREATE INDEX idx_kpi_target_dates ON bi_kpi_targets("startDate", "endDate");

-- Comentários
COMMENT ON TABLE bi_kpi_targets IS 'Metas definidas para os KPIs';
COMMENT ON COLUMN bi_kpi_targets."kpiName" IS 'Nome do KPI (ex: revenue, conversion_rate, average_ticket)';
COMMENT ON COLUMN bi_kpi_targets.period IS 'Período da meta (diário, semanal, mensal, trimestral, anual)';

-- =====================================================
-- 3. Tabela: bi_custom_reports
-- Relatórios customizados criados pelos usuários
-- =====================================================

CREATE TABLE IF NOT EXISTS bi_custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('executive', 'sales', 'financial', 'marketing', 'operational', 'custom')),
  config JSONB NOT NULL DEFAULT '{}',
  "createdById" UUID,
  "isPublic" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_custom_report_creator FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_custom_report_tenant ON bi_custom_reports("tenantId");
CREATE INDEX idx_custom_report_type ON bi_custom_reports(type);
CREATE INDEX idx_custom_report_creator ON bi_custom_reports("createdById");
CREATE INDEX idx_custom_report_public ON bi_custom_reports("isPublic") WHERE "isPublic" = TRUE;

-- Comentários
COMMENT ON TABLE bi_custom_reports IS 'Relatórios customizados criados pelos usuários';
COMMENT ON COLUMN bi_custom_reports.config IS 'Configuração JSONB das seções e filtros do relatório';
COMMENT ON COLUMN bi_custom_reports."isPublic" IS 'Se TRUE, o relatório é visível para todos do tenant';

-- =====================================================
-- 4. Tabela: bi_scheduled_reports
-- Agendamento de relatórios para envio automático
-- =====================================================

CREATE TABLE IF NOT EXISTS bi_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "reportId" UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  "dayOfWeek" INTEGER CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  "dayOfMonth" INTEGER CHECK ("dayOfMonth" BETWEEN 1 AND 31),
  recipients JSONB NOT NULL DEFAULT '[]',
  format VARCHAR(20) DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
  config JSONB DEFAULT '{}',
  "lastRunAt" TIMESTAMP,
  "nextRunAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdById" UUID,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scheduled_report FOREIGN KEY ("reportId") REFERENCES bi_custom_reports(id) ON DELETE SET NULL,
  CONSTRAINT fk_scheduled_report_creator FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_scheduled_report_tenant ON bi_scheduled_reports("tenantId");
CREATE INDEX idx_scheduled_report_frequency ON bi_scheduled_reports(frequency);
CREATE INDEX idx_scheduled_report_next_run ON bi_scheduled_reports("nextRunAt") WHERE "isActive" = TRUE;
CREATE INDEX idx_scheduled_report_active ON bi_scheduled_reports("isActive");

-- Comentários
COMMENT ON TABLE bi_scheduled_reports IS 'Agendamento de relatórios para envio automático por email';
COMMENT ON COLUMN bi_scheduled_reports.recipients IS 'Array JSONB de emails para envio do relatório';
COMMENT ON COLUMN bi_scheduled_reports.frequency IS 'Frequência de envio do relatório';
COMMENT ON COLUMN bi_scheduled_reports."nextRunAt" IS 'Próxima data/hora de execução do agendamento';

-- =====================================================
-- Triggers para atualizar updatedAt automaticamente
-- =====================================================

-- Função genérica para atualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para bi_dashboard_configs
CREATE TRIGGER update_bi_dashboard_configs_updated_at
  BEFORE UPDATE ON bi_dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para bi_kpi_targets
CREATE TRIGGER update_bi_kpi_targets_updated_at
  BEFORE UPDATE ON bi_kpi_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para bi_custom_reports
CREATE TRIGGER update_bi_custom_reports_updated_at
  BEFORE UPDATE ON bi_custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para bi_scheduled_reports
CREATE TRIGGER update_bi_scheduled_reports_updated_at
  BEFORE UPDATE ON bi_scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Dados iniciais (Seeds)
-- =====================================================

-- Dashboard padrão executivo
INSERT INTO bi_dashboard_configs ("userId", "tenantId", name, type, description, config, "isDefault", "isActive")
VALUES
  (
    (SELECT id FROM users LIMIT 1),
    (SELECT "tenantId" FROM users LIMIT 1),
    'Dashboard Executivo',
    'executive',
    'Visão geral executiva com os principais KPIs e métricas',
    '{
      "widgets": [
        {"id": "kpi-revenue", "type": "kpi_card", "dataSource": "revenue", "position": {"x": 0, "y": 0, "width": 3, "height": 2}},
        {"id": "kpi-sales", "type": "kpi_card", "dataSource": "sales_count", "position": {"x": 3, "y": 0, "width": 3, "height": 2}},
        {"id": "kpi-leads", "type": "kpi_card", "dataSource": "new_leads", "position": {"x": 6, "y": 0, "width": 3, "height": 2}},
        {"id": "kpi-conversion", "type": "kpi_card", "dataSource": "conversion_rate", "position": {"x": 9, "y": 0, "width": 3, "height": 2}},
        {"id": "chart-sales-time", "type": "line_chart", "dataSource": "sales_over_time", "position": {"x": 0, "y": 2, "width": 6, "height": 4}},
        {"id": "chart-revenue-expenses", "type": "bar_chart", "dataSource": "revenue_vs_expenses", "position": {"x": 6, "y": 2, "width": 6, "height": 4}}
      ]
    }'::jsonb,
    TRUE,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- Metas de exemplo
INSERT INTO bi_kpi_targets ("tenantId", "kpiName", "targetValue", period, "startDate", "endDate", "isActive")
VALUES
  (
    (SELECT "tenantId" FROM users LIMIT 1),
    'revenue',
    100000.00,
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    TRUE
  ),
  (
    (SELECT "tenantId" FROM users LIMIT 1),
    'conversion_rate',
    25.00,
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- Permissões (se houver sistema de permissões)
-- =====================================================

-- TODO: Adicionar permissões específicas do módulo BI
-- Exemplos:
-- - bi.dashboard.view
-- - bi.dashboard.create
-- - bi.dashboard.edit
-- - bi.dashboard.delete
-- - bi.kpi.view
-- - bi.kpi.manage_targets
-- - bi.reports.view
-- - bi.reports.create
-- - bi.reports.export
-- - bi.analytics.view

-- =====================================================
-- Fim da Migration
-- =====================================================

-- Verificar criação das tabelas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bi_dashboard_configs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bi_kpi_targets') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bi_custom_reports') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bi_scheduled_reports') THEN
    RAISE NOTICE 'Migration 011_create_bi_tables.sql executada com sucesso!';
  ELSE
    RAISE EXCEPTION 'Erro ao criar tabelas do módulo BI';
  END IF;
END $$;
