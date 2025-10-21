-- ============================================
-- MIGRATION: Módulo de Vendas e Comissões
-- Versão: v92
-- Data: 20 de Outubro de 2025
-- Descrição: Cria tabelas para gestão de vendas e comissionamento
-- ============================================

-- Habilitar extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: vendedores
-- ============================================

CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_vendedor VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  percentual_comissao_padrao DECIMAL(5,2) NOT NULL DEFAULT 0,
  tipo_comissao VARCHAR(20) NOT NULL DEFAULT 'percentual' CHECK (tipo_comissao IN ('percentual', 'fixo', 'misto')),
  valor_fixo_comissao DECIMAL(10,2),
  meta_mensal DECIMAL(10,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para vendedores
CREATE INDEX idx_vendedores_user_id ON vendedores(user_id);
CREATE INDEX idx_vendedores_tenant_id ON vendedores(tenant_id);
CREATE INDEX idx_vendedores_ativo ON vendedores(ativo);
CREATE INDEX idx_vendedores_codigo ON vendedores(codigo_vendedor);

-- Comentários
COMMENT ON TABLE vendedores IS 'Cadastro de vendedores com configurações de comissionamento';
COMMENT ON COLUMN vendedores.codigo_vendedor IS 'Código único do vendedor (VND-YYYY-NNNN)';
COMMENT ON COLUMN vendedores.percentual_comissao_padrao IS 'Percentual padrão de comissão (ex: 10.00 = 10%)';
COMMENT ON COLUMN vendedores.tipo_comissao IS 'Tipo de comissionamento: percentual, fixo ou misto';
COMMENT ON COLUMN vendedores.meta_mensal IS 'Meta mensal de vendas em reais';

-- ============================================
-- TABELA: vendas
-- ============================================

CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda VARCHAR(30) UNIQUE NOT NULL,
  vendedor_id UUID NOT NULL REFERENCES vendedores(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  valor_bruto DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_liquido DECIMAL(10,2) NOT NULL,
  percentual_comissao DECIMAL(5,2),
  valor_comissao DECIMAL(10,2),
  data_venda TIMESTAMP NOT NULL DEFAULT NOW(),
  data_confirmacao TIMESTAMP,
  data_cancelamento TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  motivo_cancelamento TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  metadata JSONB,
  tenant_id UUID NOT NULL,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para vendas
CREATE INDEX idx_vendas_vendedor_id ON vendas(vendedor_id);
CREATE INDEX idx_vendas_lead_id ON vendas(lead_id);
CREATE INDEX idx_vendas_tenant_id ON vendas(tenant_id);
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX idx_vendas_data_confirmacao ON vendas(data_confirmacao);
CREATE INDEX idx_vendas_numero ON vendas(numero_venda);

-- Comentários
COMMENT ON TABLE vendas IS 'Registro de vendas realizadas pelos vendedores';
COMMENT ON COLUMN vendas.numero_venda IS 'Número único da venda (VND-YYYY-NNNN)';
COMMENT ON COLUMN vendas.valor_liquido IS 'Valor bruto menos desconto';
COMMENT ON COLUMN vendas.data_confirmacao IS 'Data em que a venda foi confirmada (paga) - dispara cálculo de comissão';
COMMENT ON COLUMN vendas.status IS 'Status: pendente, confirmada ou cancelada';

-- ============================================
-- TABELA: comissoes
-- ============================================

CREATE TABLE IF NOT EXISTS comissoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  vendedor_id UUID NOT NULL REFERENCES vendedores(id) ON DELETE RESTRICT,
  valor_base_calculo DECIMAL(10,2) NOT NULL,
  percentual_aplicado DECIMAL(5,2) NOT NULL,
  valor_comissao DECIMAL(10,2) NOT NULL,
  mes_competencia INT NOT NULL CHECK (mes_competencia BETWEEN 1 AND 12),
  ano_competencia INT NOT NULL CHECK (ano_competencia BETWEEN 2020 AND 2100),
  status VARCHAR(30) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'cancelada')),
  data_pagamento TIMESTAMP,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  observacoes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para comissoes
CREATE INDEX idx_comissoes_venda_id ON comissoes(venda_id);
CREATE INDEX idx_comissoes_vendedor_id ON comissoes(vendedor_id);
CREATE INDEX idx_comissoes_tenant_id ON comissoes(tenant_id);
CREATE INDEX idx_comissoes_status ON comissoes(status);
CREATE INDEX idx_comissoes_competencia ON comissoes(ano_competencia, mes_competencia);
CREATE INDEX idx_comissoes_data_pagamento ON comissoes(data_pagamento);

-- Comentários
COMMENT ON TABLE comissoes IS 'Comissões geradas a partir de vendas confirmadas';
COMMENT ON COLUMN comissoes.valor_base_calculo IS 'Valor usado para calcular a comissão (geralmente valor_liquido da venda)';
COMMENT ON COLUMN comissoes.mes_competencia IS 'Mês de competência para relatórios (1-12)';
COMMENT ON COLUMN comissoes.ano_competencia IS 'Ano de competência para relatórios';
COMMENT ON COLUMN comissoes.status IS 'Status: pendente, paga ou cancelada';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at em vendedores
CREATE OR REPLACE FUNCTION update_vendedores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendedores_updated_at
  BEFORE UPDATE ON vendedores
  FOR EACH ROW
  EXECUTE FUNCTION update_vendedores_updated_at();

-- Trigger para atualizar updated_at em vendas
CREATE OR REPLACE FUNCTION update_vendas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendas_updated_at
  BEFORE UPDATE ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION update_vendas_updated_at();

-- Trigger para atualizar updated_at em comissoes
CREATE OR REPLACE FUNCTION update_comissoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comissoes_updated_at
  BEFORE UPDATE ON comissoes
  FOR EACH ROW
  EXECUTE FUNCTION update_comissoes_updated_at();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Vendas com informações completas
CREATE OR REPLACE VIEW vw_vendas_completas AS
SELECT
  v.*,
  vend.codigo_vendedor,
  vend.percentual_comissao_padrao as vendedor_comissao_padrao,
  u.name as vendedor_nome,
  u.email as vendedor_email,
  l.name as cliente_nome,
  l.email as cliente_email,
  p.name as procedimento_nome,
  COALESCE(c.valor_comissao, 0) as comissao_calculada
FROM vendas v
LEFT JOIN vendedores vend ON vend.id = v.vendedor_id
LEFT JOIN users u ON u.id = vend.user_id
LEFT JOIN leads l ON l.id = v.lead_id
LEFT JOIN procedures p ON p.id = v.procedure_id
LEFT JOIN comissoes c ON c.venda_id = v.id;

COMMENT ON VIEW vw_vendas_completas IS 'View com informações completas de vendas incluindo vendedor, cliente e comissões';

-- View: Resumo de comissões por vendedor e período
CREATE OR REPLACE VIEW vw_comissoes_resumo AS
SELECT
  vend.id as vendedor_id,
  vend.codigo_vendedor,
  u.name as vendedor_nome,
  c.ano_competencia,
  c.mes_competencia,
  COUNT(c.id) as total_comissoes,
  COUNT(c.id) FILTER (WHERE c.status = 'pendente') as comissoes_pendentes,
  COUNT(c.id) FILTER (WHERE c.status = 'paga') as comissoes_pagas,
  COALESCE(SUM(c.valor_comissao), 0) as valor_total,
  COALESCE(SUM(c.valor_comissao) FILTER (WHERE c.status = 'pendente'), 0) as valor_pendente,
  COALESCE(SUM(c.valor_comissao) FILTER (WHERE c.status = 'paga'), 0) as valor_pago,
  c.tenant_id
FROM vendedores vend
LEFT JOIN users u ON u.id = vend.user_id
LEFT JOIN comissoes c ON c.vendedor_id = vend.id
GROUP BY vend.id, vend.codigo_vendedor, u.name, c.ano_competencia, c.mes_competencia, c.tenant_id;

COMMENT ON VIEW vw_comissoes_resumo IS 'Resumo de comissões agrupadas por vendedor e período de competência';

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================

-- Descomente para criar dados de teste

-- INSERT INTO vendedores (codigo_vendedor, user_id, percentual_comissao_padrao, tipo_comissao, data_inicio, tenant_id)
-- SELECT
--   'VND-2025-0001',
--   id,
--   10.00,
--   'percentual',
--   CURRENT_DATE,
--   tenant_id
-- FROM users
-- WHERE email = 'admin@example.com'
-- LIMIT 1;

-- ============================================
-- PERMISSÕES (ajustar conforme necessário)
-- ============================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON vendedores TO seu_usuario_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vendas TO seu_usuario_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON comissoes TO seu_usuario_app;
-- GRANT SELECT ON vw_vendas_completas TO seu_usuario_app;
-- GRANT SELECT ON vw_comissoes_resumo TO seu_usuario_app;

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Para reverter esta migration:
-- DROP VIEW IF EXISTS vw_comissoes_resumo;
-- DROP VIEW IF EXISTS vw_vendas_completas;
-- DROP TRIGGER IF EXISTS trigger_comissoes_updated_at ON comissoes;
-- DROP TRIGGER IF EXISTS trigger_vendas_updated_at ON vendas;
-- DROP TRIGGER IF EXISTS trigger_vendedores_updated_at ON vendedores;
-- DROP FUNCTION IF EXISTS update_comissoes_updated_at();
-- DROP FUNCTION IF EXISTS update_vendas_updated_at();
-- DROP FUNCTION IF EXISTS update_vendedores_updated_at();
-- DROP TABLE IF EXISTS comissoes CASCADE;
-- DROP TABLE IF EXISTS vendas CASCADE;
-- DROP TABLE IF EXISTS vendedores CASCADE;
