-- Migration: Create Financial Module Tables
-- Date: 2025-10-16
-- Description: Creates all tables for the financial module

-- ==============================================
-- 1. SUPPLIERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    cpf VARCHAR(14),
    email VARCHAR(255),
    phone VARCHAR(20),
    phone2 VARCHAR(20),
    "contactName" VARCHAR(200),
    address VARCHAR(500),
    "addressNumber" VARCHAR(20),
    complement VARCHAR(200),
    neighborhood VARCHAR(200),
    city VARCHAR(200),
    state VARCHAR(2),
    "zipCode" VARCHAR(9),
    website VARCHAR(500),
    notes TEXT,
    "bankInfo" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "tenantId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers("tenantId");
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON suppliers(cnpj);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers("isActive");

-- ==============================================
-- 2. TRANSACTIONS TABLE
-- ==============================================
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa', 'transferencia');

CREATE TYPE transaction_category AS ENUM (
    'procedimento', 'consulta', 'retorno', 'produto', 'outros_receitas',
    'salario', 'fornecedor', 'aluguel', 'energia', 'agua', 'internet', 'telefone',
    'marketing', 'material_escritorio', 'material_medico', 'impostos', 'manutencao',
    'contabilidade', 'software', 'limpeza', 'seguranca', 'outros_despesas'
);

CREATE TYPE payment_method AS ENUM (
    'pix', 'dinheiro', 'cartao_credito', 'cartao_debito',
    'link_pagamento', 'transferencia_bancaria', 'boleto', 'cheque'
);

CREATE TYPE transaction_status AS ENUM ('pendente', 'confirmada', 'cancelada', 'estornada');

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type transaction_type NOT NULL,
    category transaction_category NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR(500) NOT NULL,
    "paymentMethod" payment_method,
    status transaction_status DEFAULT 'pendente',

    -- Relacionamentos
    "leadId" UUID REFERENCES leads(id) ON DELETE SET NULL,
    "appointmentId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
    "procedureId" UUID REFERENCES procedures(id) ON DELETE SET NULL,
    "supplierId" UUID REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Datas
    "dueDate" DATE NOT NULL,
    "paymentDate" DATE,
    "referenceDate" DATE NOT NULL,

    -- Comprovantes e anexos
    attachments JSONB,

    -- Observações
    notes TEXT,

    -- Parcelamento
    "isInstallment" BOOLEAN DEFAULT false,
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "parentTransactionId" UUID,

    -- Recorrência
    "isRecurring" BOOLEAN DEFAULT false,
    "recurringFrequency" VARCHAR(50),
    "recurringGroupId" UUID,

    -- Tenant e auditoria
    "tenantId" VARCHAR(255) NOT NULL,
    "createdById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "approvedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions("tenantId");
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions("dueDate");
CREATE INDEX IF NOT EXISTS idx_transactions_payment_date ON transactions("paymentDate");
CREATE INDEX IF NOT EXISTS idx_transactions_reference_date ON transactions("referenceDate");
CREATE INDEX IF NOT EXISTS idx_transactions_lead ON transactions("leadId");
CREATE INDEX IF NOT EXISTS idx_transactions_appointment ON transactions("appointmentId");
CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON transactions("supplierId");
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_group ON transactions("recurringGroupId");

-- ==============================================
-- 3. INVOICES TABLE
-- ==============================================
CREATE TYPE invoice_type AS ENUM ('recibo', 'nota_fiscal', 'nota_servico');
CREATE TYPE invoice_status AS ENUM ('rascunho', 'emitida', 'enviada', 'cancelada');

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
    type invoice_type DEFAULT 'recibo',
    status invoice_status DEFAULT 'rascunho',
    "transactionId" UUID REFERENCES transactions(id) ON DELETE CASCADE,
    "leadId" UUID REFERENCES leads(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    items JSONB,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE,
    "pdfUrl" VARCHAR(500),
    metadata JSONB,
    "sentAt" TIMESTAMP,
    "sentTo" VARCHAR(255),
    "sentMethod" VARCHAR(50),
    "tenantId" VARCHAR(255) NOT NULL,
    "issuedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "canceledAt" TIMESTAMP,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices("tenantId");
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices("invoiceNumber");
CREATE INDEX IF NOT EXISTS idx_invoices_transaction ON invoices("transactionId");
CREATE INDEX IF NOT EXISTS idx_invoices_lead ON invoices("leadId");
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices("issueDate");

-- ==============================================
-- 4. PURCHASE ORDERS TABLE
-- ==============================================
CREATE TYPE purchase_order_status AS ENUM (
    'orcamento', 'aprovado', 'pedido_realizado', 'em_transito',
    'recebido', 'parcialmente_recebido', 'cancelado'
);

CREATE TYPE purchase_order_priority AS ENUM ('baixa', 'normal', 'alta', 'urgente');

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" VARCHAR(100) UNIQUE NOT NULL,
    "supplierId" UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    status purchase_order_status DEFAULT 'orcamento',
    priority purchase_order_priority DEFAULT 'normal',
    "orderDate" DATE NOT NULL,
    "expectedDeliveryDate" DATE,
    "actualDeliveryDate" DATE,
    "receivedDate" DATE,
    "totalAmount" DECIMAL(12, 2) NOT NULL,
    "shippingCost" DECIMAL(12, 2),
    discount DECIMAL(12, 2),
    items JSONB NOT NULL,
    attachments JSONB,
    notes TEXT,
    "shippingAddress" TEXT,
    "trackingCode" VARCHAR(200),
    carrier VARCHAR(200),
    "nfeNumber" VARCHAR(100),
    "nfeKey" VARCHAR(100),
    "tenantId" VARCHAR(255) NOT NULL,
    "createdById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "approvedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMP,
    "receivedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "canceledAt" TIMESTAMP,
    "canceledById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant ON purchase_orders("tenantId");
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders("orderNumber");
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders("supplierId");
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders("orderDate");

-- ==============================================
-- 5. CASH FLOW TABLE
-- ==============================================
CREATE TYPE cash_flow_type AS ENUM ('abertura', 'fechamento', 'sangria', 'reforco');

CREATE TABLE IF NOT EXISTS cash_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    type cash_flow_type,
    "openingBalance" DECIMAL(12, 2) DEFAULT 0,
    "totalIncome" DECIMAL(12, 2) DEFAULT 0,
    "totalExpense" DECIMAL(12, 2) DEFAULT 0,
    "closingBalance" DECIMAL(12, 2) DEFAULT 0,

    -- Detalhamento por forma de pagamento
    "cashAmount" DECIMAL(12, 2) DEFAULT 0,
    "pixAmount" DECIMAL(12, 2) DEFAULT 0,
    "creditCardAmount" DECIMAL(12, 2) DEFAULT 0,
    "debitCardAmount" DECIMAL(12, 2) DEFAULT 0,
    "transferAmount" DECIMAL(12, 2) DEFAULT 0,
    "otherAmount" DECIMAL(12, 2) DEFAULT 0,

    -- Sangrias e reforços
    withdrawals DECIMAL(12, 2) DEFAULT 0,
    deposits DECIMAL(12, 2) DEFAULT 0,

    notes TEXT,
    "isClosed" BOOLEAN DEFAULT false,
    "closedAt" TIMESTAMP,
    "closedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "tenantId" VARCHAR(255) NOT NULL,
    "openedById" UUID REFERENCES users(id) ON DELETE SET NULL,
    "openedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for cash_flow
CREATE INDEX IF NOT EXISTS idx_cash_flow_tenant ON cash_flow("tenantId");
CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_closed ON cash_flow("isClosed");

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_updated_at BEFORE UPDATE ON cash_flow
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- COMMENTS
-- ==============================================
COMMENT ON TABLE suppliers IS 'Fornecedores e prestadores de serviço';
COMMENT ON TABLE transactions IS 'Transações financeiras (receitas e despesas)';
COMMENT ON TABLE invoices IS 'Recibos e notas fiscais emitidas';
COMMENT ON TABLE purchase_orders IS 'Ordens de compra e pedidos';
COMMENT ON TABLE cash_flow IS 'Controle de fluxo de caixa diário';
