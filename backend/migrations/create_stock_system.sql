-- Migration: Create Stock System
-- Date: 2025-10-20
-- Description: Create tables for inventory management system

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'insumo',
  unit VARCHAR(50) NOT NULL DEFAULT 'unidade',

  -- Stock control
  "currentStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "minimumStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maximumStock" DECIMAL(10,2),

  -- Prices
  "purchasePrice" DECIMAL(10,2),
  "salePrice" DECIMAL(10,2),

  -- Main supplier
  "mainSupplierId" UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Location
  location VARCHAR(255),

  -- Expiration
  "expirationDate" DATE,
  "batchNumber" VARCHAR(100),

  -- Control flags
  "isActive" BOOLEAN DEFAULT TRUE,
  "trackStock" BOOLEAN DEFAULT TRUE,
  "requiresPrescription" BOOLEAN DEFAULT FALSE,

  -- Alerts
  "hasLowStockAlert" BOOLEAN DEFAULT FALSE,
  "lastAlertDate" TIMESTAMP,

  -- Multi-tenancy
  "tenantId" VARCHAR NOT NULL,

  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  CONSTRAINT unique_sku_tenant UNIQUE ("tenantId", sku),
  CONSTRAINT unique_barcode_tenant UNIQUE ("tenantId", barcode)
);

CREATE INDEX idx_products_tenant ON products("tenantId");
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_low_stock ON products("tenantId", "currentStock", "minimumStock") WHERE "trackStock" = TRUE;
CREATE INDEX idx_products_active ON products("tenantId", "isActive");

-- ============================================
-- TABLE: stock_movements
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL, -- entrada, saida, ajuste, devolucao, perda, transferencia
  reason VARCHAR(50) NOT NULL, -- compra, procedimento, ajuste_inventario, etc

  quantity DECIMAL(10,2) NOT NULL,
  "unitPrice" DECIMAL(10,2),
  "totalPrice" DECIMAL(10,2),

  -- Stock before and after
  "previousStock" DECIMAL(10,2) NOT NULL,
  "newStock" DECIMAL(10,2) NOT NULL,

  -- References
  "purchaseOrderId" UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  "medicalRecordId" UUID,
  "procedureId" UUID,

  -- Invoice
  "invoiceNumber" VARCHAR(100),

  -- Batch info
  "batchNumber" VARCHAR(100),
  "expirationDate" DATE,

  notes TEXT,

  -- Multi-tenancy
  "tenantId" VARCHAR NOT NULL,

  -- User who made the movement
  "userId" UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamp
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product ON stock_movements("productId");
CREATE INDEX idx_stock_movements_tenant ON stock_movements("tenantId");
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_date ON stock_movements("createdAt");
CREATE INDEX idx_stock_movements_purchase_order ON stock_movements("purchaseOrderId") WHERE "purchaseOrderId" IS NOT NULL;
CREATE INDEX idx_stock_movements_medical_record ON stock_movements("medicalRecordId") WHERE "medicalRecordId" IS NOT NULL;

-- ============================================
-- TABLE: stock_alerts
-- ============================================
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL, -- low_stock, out_of_stock, expiring_soon, expired
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, resolved, ignored

  "currentStock" DECIMAL(10,2),
  "minimumStock" DECIMAL(10,2),
  "suggestedOrderQuantity" DECIMAL(10,2),

  message TEXT,

  -- Multi-tenancy
  "tenantId" VARCHAR NOT NULL,

  -- Resolution
  "resolvedAt" TIMESTAMP,
  "resolvedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution TEXT,

  -- Timestamp
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_alerts_product ON stock_alerts("productId");
CREATE INDEX idx_stock_alerts_tenant ON stock_alerts("tenantId");
CREATE INDEX idx_stock_alerts_status ON stock_alerts("tenantId", status);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(type);

-- ============================================
-- TABLE: procedure_products
-- ============================================
CREATE TABLE IF NOT EXISTS procedure_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "procedureId" UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  "quantityUsed" DECIMAL(10,2) NOT NULL,
  "isOptional" BOOLEAN DEFAULT TRUE,

  notes TEXT,

  -- Multi-tenancy
  "tenantId" VARCHAR NOT NULL,

  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT unique_procedure_product UNIQUE ("procedureId", "productId")
);

CREATE INDEX idx_procedure_products_procedure ON procedure_products("procedureId");
CREATE INDEX idx_procedure_products_product ON procedure_products("productId");
CREATE INDEX idx_procedure_products_tenant ON procedure_products("tenantId");

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update products.updatedAt
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- Trigger to update procedure_products.updatedAt
CREATE OR REPLACE FUNCTION update_procedure_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER procedure_products_updated_at_trigger
BEFORE UPDATE ON procedure_products
FOR EACH ROW
EXECUTE FUNCTION update_procedure_products_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE products IS 'Produtos e insumos do estoque';
COMMENT ON TABLE stock_movements IS 'Movimentações de entrada e saída do estoque';
COMMENT ON TABLE stock_alerts IS 'Alertas de estoque baixo, vencimento, etc';
COMMENT ON TABLE procedure_products IS 'Produtos utilizados em cada procedimento';

-- ============================================
-- SAMPLE DATA (optional)
-- ============================================
-- INSERT INTO products (name, category, unit, "currentStock", "minimumStock", "tenantId")
-- SELECT 'Botox 100U', 'medicamento', 'frasco', 10, 5, id FROM tenants LIMIT 1;
