-- =============================================
-- Migration: Create Payment Gateway Tables
-- Description: Tables for Asaas and PagBank integration
-- Version: v71
-- Date: 2025-10-17
-- =============================================

-- Payment Gateway Configuration Table
CREATE TABLE IF NOT EXISTS payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" VARCHAR(100) NOT NULL DEFAULT 'default',
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'pagbank')),
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('production', 'sandbox')),
    "apiKey" TEXT NOT NULL, -- Encrypted
    "apiSecret" TEXT, -- Encrypted (optional, for gateways that require it)
    "webhookSecret" TEXT, -- For validating webhook signatures
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}', -- Gateway-specific configuration
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedBy" UUID,

    -- Constraints
    UNIQUE ("tenantId", gateway, environment),
    FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY ("updatedBy") REFERENCES users(id) ON DELETE SET NULL
);

-- Payment Gateway Customers Table
CREATE TABLE IF NOT EXISTS payment_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" VARCHAR(100) NOT NULL DEFAULT 'default',
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'pagbank')),

    -- Local customer reference
    "leadId" UUID,

    -- Customer data
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    "cpfCnpj" VARCHAR(18),
    phone VARCHAR(20),
    "mobilePhone" VARCHAR(20),

    -- Address
    address VARCHAR(255),
    "addressNumber" VARCHAR(20),
    complement VARCHAR(100),
    province VARCHAR(100), -- Bairro
    "postalCode" VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(2),

    -- Gateway customer ID
    "gatewayCustomerId" VARCHAR(255) NOT NULL,

    -- Additional info
    "externalReference" VARCHAR(255),
    observations TEXT,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP,

    -- Constraints
    UNIQUE ("tenantId", gateway, "gatewayCustomerId"),
    FOREIGN KEY ("leadId") REFERENCES leads(id) ON DELETE SET NULL
);

-- Payment Charges Table
CREATE TABLE IF NOT EXISTS payment_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" VARCHAR(100) NOT NULL DEFAULT 'default',
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'pagbank')),

    -- Gateway references
    "gatewayChargeId" VARCHAR(255) NOT NULL,
    "gatewayCustomerId" VARCHAR(255) NOT NULL,

    -- Local references
    "leadId" UUID,
    "transactionId" UUID, -- Link to financial transaction

    -- Charge details
    "billingType" VARCHAR(20) NOT NULL CHECK ("billingType" IN ('BOLETO', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'UNDEFINED')),
    value DECIMAL(15, 2) NOT NULL,
    "dueDate" DATE NOT NULL,
    description TEXT,
    "externalReference" VARCHAR(255),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    -- Payment info
    "paymentDate" TIMESTAMP,
    "confirmedDate" TIMESTAMP,
    "creditDate" TIMESTAMP,
    "estimatedCreditDate" TIMESTAMP,

    -- Fees and discounts (JSONB for flexibility)
    discount JSONB,
    fine JSONB,
    interest JSONB,

    -- Payment method specific data
    "bankSlipUrl" TEXT,
    "invoiceUrl" TEXT,
    "invoiceNumber" VARCHAR(100),
    "pixQrCode" TEXT,
    "pixCopyPaste" TEXT,
    "creditCardToken" VARCHAR(255),

    -- Refund info
    "refundedValue" DECIMAL(15, 2),
    "refundedDate" TIMESTAMP,
    "refundReason" TEXT,

    -- Metadata
    "webhookReceived" BOOLEAN DEFAULT false,
    "lastWebhookAt" TIMESTAMP,
    "rawResponse" JSONB, -- Store full gateway response

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP,

    -- Constraints
    UNIQUE ("tenantId", gateway, "gatewayChargeId"),
    FOREIGN KEY ("leadId") REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY ("transactionId") REFERENCES transactions(id) ON DELETE SET NULL
);

-- Payment Webhooks Table
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" VARCHAR(100) NOT NULL DEFAULT 'default',
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'pagbank')),

    -- Webhook details
    event VARCHAR(100) NOT NULL,
    "gatewayChargeId" VARCHAR(255),
    "gatewayCustomerId" VARCHAR(255),

    -- Processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),
    "processedAt" TIMESTAMP,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    -- Payload
    payload JSONB NOT NULL,
    headers JSONB,

    -- Validation
    "signatureValid" BOOLEAN,
    "ipAddress" VARCHAR(45),

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_configs_tenant ON payment_configs("tenantId");
CREATE INDEX IF NOT EXISTS idx_payment_configs_gateway ON payment_configs(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_configs_active ON payment_configs("isActive");

CREATE INDEX IF NOT EXISTS idx_payment_customers_tenant ON payment_customers("tenantId");
CREATE INDEX IF NOT EXISTS idx_payment_customers_gateway ON payment_customers(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_customers_lead ON payment_customers("leadId");
CREATE INDEX IF NOT EXISTS idx_payment_customers_gateway_id ON payment_customers("gatewayCustomerId");
CREATE INDEX IF NOT EXISTS idx_payment_customers_cpf ON payment_customers("cpfCnpj");

CREATE INDEX IF NOT EXISTS idx_payment_charges_tenant ON payment_charges("tenantId");
CREATE INDEX IF NOT EXISTS idx_payment_charges_gateway ON payment_charges(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_charges_gateway_id ON payment_charges("gatewayChargeId");
CREATE INDEX IF NOT EXISTS idx_payment_charges_status ON payment_charges(status);
CREATE INDEX IF NOT EXISTS idx_payment_charges_lead ON payment_charges("leadId");
CREATE INDEX IF NOT EXISTS idx_payment_charges_transaction ON payment_charges("transactionId");
CREATE INDEX IF NOT EXISTS idx_payment_charges_due_date ON payment_charges("dueDate");
CREATE INDEX IF NOT EXISTS idx_payment_charges_payment_date ON payment_charges("paymentDate");

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_tenant ON payment_webhooks("tenantId");
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_gateway ON payment_webhooks(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON payment_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event ON payment_webhooks(event);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_charge_id ON payment_webhooks("gatewayChargeId");
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_created ON payment_webhooks("createdAt");

-- Comments
COMMENT ON TABLE payment_configs IS 'Stores API credentials and configuration for payment gateways (Asaas, PagBank)';
COMMENT ON TABLE payment_customers IS 'Maps local customers/leads to payment gateway customer IDs';
COMMENT ON TABLE payment_charges IS 'Payment charges/cobranças created in payment gateways';
COMMENT ON TABLE payment_webhooks IS 'Webhook notifications received from payment gateways';

COMMENT ON COLUMN payment_configs."apiKey" IS 'API Key - should be encrypted at application level';
COMMENT ON COLUMN payment_configs."apiSecret" IS 'API Secret - should be encrypted at application level';
COMMENT ON COLUMN payment_configs.config IS 'Gateway-specific configuration (enableBoleto, enablePix, etc)';

COMMENT ON COLUMN payment_charges.discount IS 'Discount configuration: {value, dueDateLimitDays, type}';
COMMENT ON COLUMN payment_charges.fine IS 'Fine configuration: {value, type}';
COMMENT ON COLUMN payment_charges.interest IS 'Interest configuration: {value, type}';
COMMENT ON COLUMN payment_charges."rawResponse" IS 'Full response from payment gateway for debugging';

COMMENT ON COLUMN payment_webhooks.payload IS 'Full webhook payload from gateway';
COMMENT ON COLUMN payment_webhooks."signatureValid" IS 'Whether webhook signature was validated successfully';
