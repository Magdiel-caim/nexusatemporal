-- Tabela de Prontuários Médicos
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_number VARCHAR(50) UNIQUE NOT NULL, -- Número do prontuário gerado automaticamente
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Informações Pessoais
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),

  -- Informações Médicas
  blood_type VARCHAR(5),
  allergies TEXT[], -- Array de alergias
  chronic_diseases TEXT[], -- Array de doenças crônicas
  current_medications TEXT[], -- Array de medicações atuais
  previous_surgeries TEXT[], -- Array de cirurgias anteriores
  family_history TEXT, -- Histórico familiar

  -- Informações de Emergência
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(100),

  -- Observações e Notas
  general_notes TEXT,
  medical_notes TEXT, -- Notas médicas privadas

  -- Metadata
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  tenant_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Anamnese (Fichas de Avaliação)
CREATE TABLE IF NOT EXISTS anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  -- Informações da Anamnese
  complaint_main TEXT, -- Queixa principal
  complaint_history TEXT, -- História da queixa

  -- Hábitos de Vida
  smoker BOOLEAN,
  alcohol_consumption VARCHAR(50),
  physical_activity VARCHAR(100),
  sleep_hours INTEGER,
  water_intake INTEGER, -- Litros por dia

  -- Estética Específica
  skin_type VARCHAR(50), -- Tipo de pele
  skin_issues TEXT[], -- Problemas de pele
  cosmetics_used TEXT[], -- Cosméticos utilizados
  previous_aesthetic_procedures TEXT[], -- Procedimentos estéticos anteriores
  expectations TEXT, -- Expectativas do paciente

  -- Saúde Geral
  has_diabetes BOOLEAN,
  has_hypertension BOOLEAN,
  has_heart_disease BOOLEAN,
  has_thyroid_issues BOOLEAN,
  is_pregnant BOOLEAN,
  is_breastfeeding BOOLEAN,
  menstrual_cycle_regular BOOLEAN,
  uses_contraceptive BOOLEAN,

  -- Observações
  professional_observations TEXT,
  treatment_plan TEXT,

  -- Photos/Attachments
  photos TEXT[], -- URLs das fotos
  documents TEXT[], -- URLs de documentos

  -- Metadata
  performed_by UUID REFERENCES users(id), -- Profissional que fez a anamnese
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Procedimentos Realizados (Histórico)
CREATE TABLE IF NOT EXISTS procedure_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  procedure_id UUID NOT NULL REFERENCES procedures(id),

  -- Informações do Procedimento
  procedure_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  professional_id UUID REFERENCES users(id),

  -- Detalhes da Execução
  products_used TEXT[], -- Produtos utilizados
  equipment_used TEXT[], -- Equipamentos utilizados
  technique_description TEXT,
  areas_treated TEXT[], -- Áreas tratadas

  -- Observações
  before_photos TEXT[], -- Fotos antes
  after_photos TEXT[], -- Fotos depois
  patient_reaction TEXT, -- Reação do paciente
  professional_notes TEXT,

  -- Resultados e Follow-up
  results_description TEXT,
  complications TEXT,
  next_session_recommendation TEXT,

  -- Metadata
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_medical_records_lead ON medical_records(lead_id);
CREATE INDEX idx_medical_records_tenant ON medical_records(tenant_id);
CREATE INDEX idx_medical_records_number ON medical_records(record_number);

CREATE INDEX idx_anamnesis_medical_record ON anamnesis(medical_record_id);
CREATE INDEX idx_anamnesis_appointment ON anamnesis(appointment_id);
CREATE INDEX idx_anamnesis_tenant ON anamnesis(tenant_id);

CREATE INDEX idx_procedure_history_medical_record ON procedure_history(medical_record_id);
CREATE INDEX idx_procedure_history_appointment ON procedure_history(appointment_id);
CREATE INDEX idx_procedure_history_tenant ON procedure_history(tenant_id);
CREATE INDEX idx_procedure_history_date ON procedure_history(procedure_date);

-- Função para gerar número de prontuário automático
CREATE OR REPLACE FUNCTION generate_record_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_part VARCHAR(6);
  new_number VARCHAR(50);
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT LPAD(
    COALESCE(
      MAX(
        CAST(
          SUBSTRING(record_number FROM '[0-9]+$') AS INTEGER
        )
      ), 0
    ) + 1,
    6,
    '0'
  ) INTO sequence_part
  FROM medical_records
  WHERE record_number LIKE 'PRO-' || year_part || '%'
    AND tenant_id = NEW.tenant_id;

  new_number := 'PRO-' || year_part || '-' || sequence_part;
  NEW.record_number := new_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automaticamente
CREATE TRIGGER trigger_generate_record_number
BEFORE INSERT ON medical_records
FOR EACH ROW
WHEN (NEW.record_number IS NULL OR NEW.record_number = '')
EXECUTE FUNCTION generate_record_number();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON anamnesis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedure_history_updated_at BEFORE UPDATE ON procedure_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
