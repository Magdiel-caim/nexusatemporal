-- Migration: Create inventory_counts table
-- Description: Tabela para registrar contagens de inventário (inventário físico)
-- Author: Claude Code
-- Date: 2025-10-21

-- Tabela principal de contagens de inventário
CREATE TABLE IF NOT EXISTS inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" VARCHAR(255) NOT NULL,

  -- Informações da contagem
  count_date TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  type VARCHAR(50) NOT NULL DEFAULT 'full', -- 'full' (completo), 'partial' (parcial), 'cyclic' (cíclico)

  -- Responsável pela contagem
  responsible_user_id UUID,
  responsible_name VARCHAR(255),

  -- Observações
  notes TEXT,

  -- Resumo (calculado após finalizar)
  total_items_counted INTEGER DEFAULT 0,
  total_discrepancies INTEGER DEFAULT 0,
  total_value_difference DECIMAL(15, 2) DEFAULT 0.00,

  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Índices para performance
  CONSTRAINT inventory_counts_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  CONSTRAINT inventory_counts_type_check CHECK (type IN ('full', 'partial', 'cyclic'))
);

-- Tabela de itens da contagem de inventário
CREATE TABLE IF NOT EXISTS inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,

  -- Quantidades
  expected_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Quantidade esperada (do sistema)
  counted_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Quantidade contada fisicamente
  difference DECIMAL(10, 2) GENERATED ALWAYS AS (counted_quantity - expected_quantity) STORED,

  -- Valores
  unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Custo unitário no momento da contagem
  total_difference_value DECIMAL(15, 2) GENERATED ALWAYS AS ((counted_quantity - expected_quantity) * unit_cost) STORED,

  -- Informações adicionais
  location VARCHAR(255), -- Localização física do produto
  batch_number VARCHAR(100), -- Número do lote (se aplicável)
  expiration_date DATE, -- Data de validade (se aplicável)

  -- Observações do item
  notes TEXT,

  -- Quem contou este item específico
  counted_by_user_id UUID,
  counted_by_name VARCHAR(255),
  counted_at TIMESTAMP DEFAULT NOW(),

  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_inventory_counts_tenant ON inventory_counts("tenantId");
CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts(status);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_responsible ON inventory_counts(responsible_user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_count_items_count ON inventory_count_items(inventory_count_id);
CREATE INDEX IF NOT EXISTS idx_inventory_count_items_product ON inventory_count_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_count_items_counted_by ON inventory_count_items(counted_by_user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_inventory_counts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_counts_updated_at
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_counts_updated_at();

CREATE TRIGGER trigger_inventory_count_items_updated_at
  BEFORE UPDATE ON inventory_count_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_counts_updated_at();

-- Função para finalizar contagem e atualizar resumo
CREATE OR REPLACE FUNCTION finalize_inventory_count(p_count_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  total_items INTEGER,
  total_discrepancies INTEGER,
  total_value_difference DECIMAL
) AS $$
DECLARE
  v_total_items INTEGER;
  v_total_discrepancies INTEGER;
  v_total_value_difference DECIMAL(15, 2);
BEGIN
  -- Calcular estatísticas
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE difference != 0),
    COALESCE(SUM(total_difference_value), 0)
  INTO
    v_total_items,
    v_total_discrepancies,
    v_total_value_difference
  FROM inventory_count_items
  WHERE inventory_count_id = p_count_id;

  -- Atualizar registro de contagem
  UPDATE inventory_counts
  SET
    status = 'completed',
    completed_at = NOW(),
    total_items_counted = v_total_items,
    total_discrepancies = v_total_discrepancies,
    total_value_difference = v_total_value_difference,
    updated_at = NOW()
  WHERE id = p_count_id;

  -- Atualizar estoque dos produtos com discrepâncias
  UPDATE products p
  SET
    current_stock = p.current_stock + ici.difference,
    updated_at = NOW()
  FROM inventory_count_items ici
  WHERE
    ici.inventory_count_id = p_count_id
    AND ici.product_id = p.id
    AND ici.difference != 0;

  -- Retornar resultado
  RETURN QUERY
  SELECT
    TRUE as success,
    'Inventário finalizado com sucesso' as message,
    v_total_items,
    v_total_discrepancies,
    v_total_value_difference;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY
  SELECT
    FALSE as success,
    'Erro ao finalizar inventário: ' || SQLERRM as message,
    0 as total_items,
    0 as total_discrepancies,
    0.00 as total_value_difference;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE inventory_counts IS 'Registros de contagens de inventário físico';
COMMENT ON TABLE inventory_count_items IS 'Itens individuais de cada contagem de inventário';

COMMENT ON COLUMN inventory_counts.type IS 'Tipo de inventário: full (completo), partial (parcial), cyclic (cíclico)';
COMMENT ON COLUMN inventory_counts.status IS 'Status: in_progress (em andamento), completed (concluído), cancelled (cancelado)';
COMMENT ON COLUMN inventory_count_items.difference IS 'Diferença entre contado e esperado (calculado automaticamente)';
COMMENT ON COLUMN inventory_count_items.total_difference_value IS 'Valor total da diferença (calculado automaticamente)';

-- Inserir dados de exemplo (opcional - apenas para tenant exemplo)
-- INSERT INTO inventory_counts (
--   tenant_id,
--   count_date,
--   status,
--   type,
--   responsible_name,
--   notes
-- ) VALUES (
--   'c0000000-0000-0000-0000-000000000000', -- tenant exemplo
--   NOW(),
--   'completed',
--   'full',
--   'Administrador',
--   'Inventário inicial do sistema'
-- );

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration 014: Tabelas inventory_counts e inventory_count_items criadas com sucesso!';
END $$;
