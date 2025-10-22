-- Migration: Create inventory_counts table
-- Description: Tabela para registrar contagens de inventário (inventário físico)
-- Author: Claude Code
-- Date: 2025-10-21
-- Aligned with TypeORM entities

-- Create ENUM types
CREATE TYPE inventory_count_status_enum AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE discrepancy_type_enum AS ENUM ('SURPLUS', 'SHORTAGE', 'MATCH');

-- Tabela principal de contagens de inventário
CREATE TABLE IF NOT EXISTS inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID,

  status inventory_count_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
  description TEXT,
  location VARCHAR(255),

  "countDate" TIMESTAMP,
  "completedAt" TIMESTAMP,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de itens da contagem de inventário
CREATE TABLE IF NOT EXISTS inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "inventoryCountId" UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL,

  "systemStock" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "countedStock" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  difference DECIMAL(10, 2) NOT NULL DEFAULT 0,

  "discrepancyType" discrepancy_type_enum NOT NULL,
  notes TEXT,

  adjusted BOOLEAN NOT NULL DEFAULT false,
  "adjustedAt" TIMESTAMP,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "idx_inventory_counts_tenant" ON inventory_counts("tenantId");
CREATE INDEX IF NOT EXISTS "idx_inventory_counts_user" ON inventory_counts("userId");
CREATE INDEX IF NOT EXISTS "idx_inventory_counts_status" ON inventory_counts(status);
CREATE INDEX IF NOT EXISTS "idx_inventory_counts_date" ON inventory_counts("countDate");

CREATE INDEX IF NOT EXISTS "idx_inventory_count_items_tenant" ON inventory_count_items("tenantId");
CREATE INDEX IF NOT EXISTS "idx_inventory_count_items_count" ON inventory_count_items("inventoryCountId");
CREATE INDEX IF NOT EXISTS "idx_inventory_count_items_product" ON inventory_count_items("productId");
CREATE INDEX IF NOT EXISTS "idx_inventory_count_items_adjusted" ON inventory_count_items(adjusted);

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_counts_updated_at
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

CREATE TRIGGER trigger_inventory_count_items_updated_at
  BEFORE UPDATE ON inventory_count_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- Comentários nas tabelas
COMMENT ON TABLE inventory_counts IS 'Registros de contagens de inventário físico (alinhado com TypeORM)';
COMMENT ON TABLE inventory_count_items IS 'Itens individuais de cada contagem de inventário (alinhado com TypeORM)';

COMMENT ON COLUMN inventory_counts.status IS 'Status: IN_PROGRESS, COMPLETED, CANCELLED';
COMMENT ON COLUMN inventory_count_items."discrepancyType" IS 'Tipo de discrepância: SURPLUS (sobra), SHORTAGE (falta), MATCH (igual)';
COMMENT ON COLUMN inventory_count_items.adjusted IS 'Se a diferença já foi ajustada no estoque';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration 014: Tabelas inventory_counts e inventory_count_items criadas com sucesso (TypeORM compatible)!';
END $$;
