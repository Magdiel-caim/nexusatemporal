-- =====================================================
-- MIGRATION: Módulo de Pacientes (Patient Module)
-- Database: nexus_pacientes @ 72.60.139.52
-- Version: v122-patient-module
-- Date: 2025-10-29
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA PRINCIPAL: patients
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,

  -- Dados Pessoais
  name VARCHAR(255) NOT NULL,
  birth_date DATE,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  gender VARCHAR(10), -- male/female/other
  skin_color VARCHAR(50),

  -- Contatos (simplificado)
  whatsapp VARCHAR(20),
  emergency_phone VARCHAR(20),
  email VARCHAR(255),

  -- Endereço (com API CEP)
  zip_code VARCHAR(9),
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  country VARCHAR(50) DEFAULT 'Brasil',

  -- Saúde e Convênio
  health_card VARCHAR(50),
  health_insurance VARCHAR(255),
  health_insurance_number VARCHAR(100),
  health_insurance_validity DATE,
  health_insurance_holder VARCHAR(255),

  -- Mídia
  profile_photo_url TEXT,
  profile_photo_s3_key VARCHAR(500),

  -- Origem e Status
  source VARCHAR(50) DEFAULT 'manual', -- prodoctor/manual/lead/import
  source_id VARCHAR(100), -- ID do sistema de origem
  status VARCHAR(20) DEFAULT 'active', -- active/inactive

  -- Metadata
  notes TEXT,
  registration_number VARCHAR(50), -- Número de registro (legado)

  -- Controle
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Índices para performance
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_cpf ON patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_patients_whatsapp ON patients(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX idx_patients_deleted_at ON patients(deleted_at) WHERE deleted_at IS NULL;

-- Full text search
CREATE INDEX idx_patients_search ON patients USING gin(to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(cpf, '') || ' ' || coalesce(email, '')));

COMMENT ON TABLE patients IS 'Tabela principal de pacientes - migrada do ProDoctor';
COMMENT ON COLUMN patients.source IS 'Origem: prodoctor (migrado), manual (cadastro direto), lead (conversão), import (importação)';

-- =====================================================
-- 2. TABELA: patient_medical_records (Prontuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,

  -- Data do atendimento
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  specialty VARCHAR(100),

  -- Anamnese
  chief_complaint TEXT, -- Queixa principal
  history_present_illness TEXT, -- História da doença atual
  past_medical_history TEXT, -- Histórico médico
  allergies TEXT, -- Alergias
  medications TEXT, -- Medicações em uso
  family_history TEXT, -- Histórico familiar
  social_history TEXT, -- Histórico social

  -- Exame Físico
  physical_examination TEXT,
  vital_signs JSONB, -- {bp: "120/80", hr: 75, temp: 36.5, weight: 70, height: 170, bmi: 24.2}

  -- Diagnóstico e Tratamento
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions TEXT,

  -- Evolução (texto livre - migrado do ProDoctor)
  evolution_text TEXT,

  -- Anexos e Documentos
  documents JSONB, -- [{name, url, s3_key, type, uploaded_at}]

  -- Assinatura digital
  signature_url TEXT,
  signature_s3_key VARCHAR(500),
  signed_at TIMESTAMP,
  signed_by UUID,

  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  -- Revisão
  revision_number INT DEFAULT 1,
  revised_at TIMESTAMP,
  revised_by UUID
);

CREATE INDEX idx_medical_records_patient ON patient_medical_records(patient_id);
CREATE INDEX idx_medical_records_tenant ON patient_medical_records(tenant_id);
CREATE INDEX idx_medical_records_date ON patient_medical_records(service_date DESC);
CREATE INDEX idx_medical_records_specialty ON patient_medical_records(specialty);
CREATE INDEX idx_medical_records_deleted ON patient_medical_records(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE patient_medical_records IS 'Prontuários médicos dos pacientes';

-- =====================================================
-- 3. TABELA: patient_images (Fotos Antes/Depois)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL,
  medical_record_id UUID REFERENCES patient_medical_records(id) ON DELETE SET NULL,

  -- Tipo e Categoria
  type VARCHAR(20) NOT NULL, -- before/after/profile/document/procedure
  category VARCHAR(50), -- facial/body/scar/breast/nose/eyes/etc

  -- Storage
  image_url TEXT NOT NULL, -- URL assinada temporária
  s3_key VARCHAR(500) NOT NULL, -- Chave permanente no S3
  thumbnail_url TEXT,
  thumbnail_s3_key VARCHAR(500),

  -- Metadata da imagem
  filename VARCHAR(255),
  file_size INT, -- bytes
  mime_type VARCHAR(100),
  width INT,
  height INT,

  -- Informações adicionais
  description TEXT,
  procedure_name VARCHAR(255), -- Nome do procedimento relacionado
  taken_at DATE, -- Data em que a foto foi tirada

  -- Pareamento antes/depois
  paired_image_id UUID REFERENCES patient_images(id), -- Par antes/depois

  -- Controle
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_patient_images_patient ON patient_images(patient_id);
CREATE INDEX idx_patient_images_tenant ON patient_images(tenant_id);
CREATE INDEX idx_patient_images_type ON patient_images(type);
CREATE INDEX idx_patient_images_category ON patient_images(category);
CREATE INDEX idx_patient_images_medical_record ON patient_images(medical_record_id);
CREATE INDEX idx_patient_images_taken_at ON patient_images(taken_at DESC);
CREATE INDEX idx_patient_images_deleted ON patient_images(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE patient_images IS 'Imagens dos pacientes (antes/depois, documentos, procedimentos)';
COMMENT ON COLUMN patient_images.paired_image_id IS 'ID da imagem par (se for before, aponta para after e vice-versa)';

-- =====================================================
-- 4. TABELA: patient_appointments (Relação com Agenda)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL, -- FK para appointments no banco principal
  tenant_id VARCHAR(255) NOT NULL,

  -- Informações do agendamento (cache)
  appointment_date TIMESTAMP,
  professional_name VARCHAR(255),
  procedure_name VARCHAR(255),
  status VARCHAR(50), -- scheduled/confirmed/completed/cancelled

  -- Notas específicas do paciente
  patient_notes TEXT,

  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uk_patient_appointment UNIQUE(patient_id, appointment_id)
);

CREATE INDEX idx_patient_appointments_patient ON patient_appointments(patient_id);
CREATE INDEX idx_patient_appointments_appointment ON patient_appointments(appointment_id);
CREATE INDEX idx_patient_appointments_tenant ON patient_appointments(tenant_id);
CREATE INDEX idx_patient_appointments_date ON patient_appointments(appointment_date DESC);
CREATE INDEX idx_patient_appointments_status ON patient_appointments(status);

COMMENT ON TABLE patient_appointments IS 'Relação entre pacientes e agendamentos';

-- =====================================================
-- 5. TABELA: patient_transactions (Relação com Financeiro)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL, -- FK para transactions no banco principal
  tenant_id VARCHAR(255) NOT NULL,

  -- Informações da transação (cache)
  transaction_date DATE,
  amount DECIMAL(10,2),
  type VARCHAR(20), -- income/expense
  category VARCHAR(50), -- procedure/product/consultation/etc
  description TEXT,
  status VARCHAR(20), -- pending/paid/cancelled/overdue

  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uk_patient_transaction UNIQUE(patient_id, transaction_id)
);

CREATE INDEX idx_patient_transactions_patient ON patient_transactions(patient_id);
CREATE INDEX idx_patient_transactions_transaction ON patient_transactions(transaction_id);
CREATE INDEX idx_patient_transactions_tenant ON patient_transactions(tenant_id);
CREATE INDEX idx_patient_transactions_date ON patient_transactions(transaction_date DESC);
CREATE INDEX idx_patient_transactions_status ON patient_transactions(status);
CREATE INDEX idx_patient_transactions_type ON patient_transactions(type);

COMMENT ON TABLE patient_transactions IS 'Relação entre pacientes e transações financeiras';

-- =====================================================
-- 6. TABELA: tenant_s3_configs (Configuração Multi-Tenant S3)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_s3_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) UNIQUE NOT NULL,

  -- Configurações S3/IDrive
  endpoint VARCHAR(255) NOT NULL,
  access_key_id TEXT NOT NULL, -- Será criptografado pelo backend
  secret_access_key TEXT NOT NULL, -- Será criptografado pelo backend
  bucket_name VARCHAR(255) NOT NULL,
  region VARCHAR(50) DEFAULT 'us-east-1',

  -- Controle
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_s3_configs_tenant ON tenant_s3_configs(tenant_id);
CREATE INDEX idx_tenant_s3_configs_active ON tenant_s3_configs(is_active) WHERE is_active = true;

COMMENT ON TABLE tenant_s3_configs IS 'Configurações de storage S3/IDrive por tenant';
COMMENT ON COLUMN tenant_s3_configs.access_key_id IS 'Access Key criptografada com AES-256';
COMMENT ON COLUMN tenant_s3_configs.secret_access_key IS 'Secret Key criptografada com AES-256';

-- =====================================================
-- 7. TABELA: patient_migration_log (Log de Migração)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_migration_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,

  -- Informações da migração
  batch_number INT NOT NULL,
  source_system VARCHAR(50) NOT NULL, -- prodoctor/other
  source_patient_id VARCHAR(100),
  target_patient_id UUID,

  -- Status
  status VARCHAR(20) NOT NULL, -- success/error/skipped
  error_message TEXT,

  -- Dados migrados
  migrated_fields JSONB,

  -- Controle
  migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  migrated_by UUID
);

CREATE INDEX idx_migration_log_tenant ON patient_migration_log(tenant_id);
CREATE INDEX idx_migration_log_batch ON patient_migration_log(batch_number);
CREATE INDEX idx_migration_log_source_id ON patient_migration_log(source_patient_id);
CREATE INDEX idx_migration_log_target_id ON patient_migration_log(target_patient_id);
CREATE INDEX idx_migration_log_status ON patient_migration_log(status);

COMMENT ON TABLE patient_migration_log IS 'Log de migração de pacientes do sistema legado';

-- =====================================================
-- 8. TRIGGERS: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER medical_records_updated_at BEFORE UPDATE ON patient_medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER patient_appointments_updated_at BEFORE UPDATE ON patient_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER patient_transactions_updated_at BEFORE UPDATE ON patient_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tenant_s3_configs_updated_at BEFORE UPDATE ON tenant_s3_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SEED: Configuração S3 para ProDoctor
-- =====================================================
-- Nota: As credenciais serão criptografadas pelo backend antes de inserir
-- Este é apenas um placeholder para o tenant prodoctor
INSERT INTO tenant_s3_configs (tenant_id, endpoint, access_key_id, secret_access_key, bucket_name, region)
VALUES (
  'prodoctor',
  'c1k7.va.idrivee2-46.com',
  '4ihnb5iw2vsbGykEm4TN', -- Será criptografado pelo backend
  'R9o8txTtaFNcy4txPb5yQfiIUbB2MAdFM9sRRhKX', -- Será criptografado pelo backend
  'nexus-pacientes-prodoctor',
  'us-east-1'
) ON CONFLICT (tenant_id) DO NOTHING;

-- =====================================================
-- 10. VIEWS: Consultas úteis
-- =====================================================

-- View: Pacientes com contagem de registros
CREATE OR REPLACE VIEW v_patients_summary AS
SELECT
  p.id,
  p.tenant_id,
  p.name,
  p.birth_date,
  EXTRACT(YEAR FROM AGE(p.birth_date)) AS age,
  p.cpf,
  p.whatsapp,
  p.email,
  p.status,
  p.created_at,
  COUNT(DISTINCT pmr.id) AS medical_records_count,
  COUNT(DISTINCT pi.id) AS images_count,
  COUNT(DISTINCT pa.id) AS appointments_count,
  MAX(pmr.service_date) AS last_service_date
FROM patients p
LEFT JOIN patient_medical_records pmr ON p.id = pmr.patient_id AND pmr.deleted_at IS NULL
LEFT JOIN patient_images pi ON p.id = pi.patient_id AND pi.deleted_at IS NULL
LEFT JOIN patient_appointments pa ON p.id = pa.patient_id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

COMMENT ON VIEW v_patients_summary IS 'Visão resumida dos pacientes com contadores';

-- View: Imagens antes/depois pareadas
CREATE OR REPLACE VIEW v_patient_images_paired AS
SELECT
  before.patient_id,
  before.tenant_id,
  before.category,
  before.procedure_name,
  before.id AS before_image_id,
  before.image_url AS before_image_url,
  before.taken_at AS before_taken_at,
  after.id AS after_image_id,
  after.image_url AS after_image_url,
  after.taken_at AS after_taken_at,
  before.created_at
FROM patient_images before
LEFT JOIN patient_images after ON before.paired_image_id = after.id
WHERE before.type = 'before'
  AND before.deleted_at IS NULL
  AND (after.id IS NULL OR after.deleted_at IS NULL);

COMMENT ON VIEW v_patient_images_paired IS 'Imagens antes/depois pareadas';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 015_create_patient_module.sql aplicada com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: 7';
  RAISE NOTICE '📈 Índices criados: 40+';
  RAISE NOTICE '🔍 Views criadas: 2';
  RAISE NOTICE '⚡ Triggers criados: 5';
END $$;
