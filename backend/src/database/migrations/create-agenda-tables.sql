-- ====================================
-- MIGRATION: Criar módulo de Agenda
-- Data: 2025-10-14
-- Descrição: Tabelas para agendamentos, retornos e notificações
-- ====================================

-- Criar tipos ENUM

-- AppointmentStatus
DO $$ BEGIN
  CREATE TYPE appointment_status_enum AS ENUM (
    'aguardando_pagamento',
    'pagamento_confirmado',
    'aguardando_confirmacao',
    'confirmado',
    'reagendado',
    'em_atendimento',
    'finalizado',
    'cancelado',
    'nao_compareceu'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PaymentStatus
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM (
    'pendente',
    'pago',
    'reembolsado',
    'cancelado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AnamnesisStatus
DO $$ BEGIN
  CREATE TYPE anamnesis_status_enum AS ENUM (
    'pendente',
    'enviada',
    'preenchida',
    'assinada'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AppointmentLocation
DO $$ BEGIN
  CREATE TYPE appointment_location_enum AS ENUM (
    'moema',
    'av_paulista',
    'perdizes',
    'online',
    'a_domicilio'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ReturnStatus
DO $$ BEGIN
  CREATE TYPE return_status_enum AS ENUM (
    'agendado',
    'confirmado',
    'reagendado',
    'em_atendimento',
    'finalizado',
    'cancelado',
    'nao_compareceu'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- NotificationType
DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM (
    'agendamento_criado',
    'pagamento_link',
    'pagamento_confirmado',
    'anamnese_enviada',
    'lembrete_1_dia',
    'lembrete_5_horas',
    'confirmacao_solicitada',
    'confirmacao_recebida',
    'reagendamento_confirmado',
    'cancelamento',
    'retorno_1_semana',
    'retorno_confirmado',
    'atendimento_finalizado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- NotificationStatus
DO $$ BEGIN
  CREATE TYPE notification_status_enum AS ENUM (
    'pendente',
    'enviada',
    'entregue',
    'lida',
    'falha',
    'erro'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- NotificationChannel
DO $$ BEGIN
  CREATE TYPE notification_channel_enum AS ENUM (
    'whatsapp',
    'sms',
    'email',
    'push'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================
-- TABELA: appointments
-- ====================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  "leadId" UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  "procedureId" UUID NOT NULL REFERENCES procedures(id) ON DELETE RESTRICT,
  "professionalId" UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Data e hora
  "scheduledDate" TIMESTAMP NOT NULL,
  "estimatedDuration" INTEGER,

  -- Localização
  location appointment_location_enum NOT NULL DEFAULT 'moema',

  -- Status
  status appointment_status_enum NOT NULL DEFAULT 'aguardando_pagamento',
  "paymentStatus" payment_status_enum NOT NULL DEFAULT 'pendente',

  -- Pagamento
  "paymentProof" TEXT,
  "paymentAmount" DECIMAL(12, 2),
  "paymentMethod" VARCHAR(50),
  "paymentLink" TEXT,

  -- Anamnese
  "anamnesisFormUrl" TEXT,
  "anamnesisStatus" anamnesis_status_enum NOT NULL DEFAULT 'pendente',
  "anamnesisSentAt" TIMESTAMP,
  "anamnesisCompletedAt" TIMESTAMP,
  "anamnesisSignedAt" TIMESTAMP,

  -- Retornos
  "hasReturn" BOOLEAN NOT NULL DEFAULT false,
  "returnCount" INTEGER,
  "returnFrequency" INTEGER,

  -- Confirmação
  "confirmedByPatient" BOOLEAN NOT NULL DEFAULT false,
  "confirmedAt" TIMESTAMP,

  -- Lembretes
  "reminder1DaySent" BOOLEAN NOT NULL DEFAULT false,
  "reminder5HoursSent" BOOLEAN NOT NULL DEFAULT false,

  -- Check-in
  "checkedIn" BOOLEAN NOT NULL DEFAULT false,
  "checkedInAt" TIMESTAMP,
  "checkedInBy" VARCHAR(255),

  -- Atendimento
  "attendanceStartedAt" TIMESTAMP,
  "attendanceEndedAt" TIMESTAMP,

  -- Observações
  notes TEXT,
  "privateNotes" TEXT,

  -- Tenant
  "tenantId" VARCHAR(255) NOT NULL,

  -- Auditoria
  "createdById" UUID REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Cancelamento
  "canceledAt" TIMESTAMP,
  "canceledById" VARCHAR(255),
  "cancelReason" TEXT
);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments("leadId");
CREATE INDEX IF NOT EXISTS idx_appointments_procedure ON appointments("procedureId");
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments("professionalId");
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments("tenantId");
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments("paymentStatus");

-- ====================================
-- TABELA: appointment_returns
-- ====================================
CREATE TABLE IF NOT EXISTS appointment_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamento com agendamento original
  "appointmentId" UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

  -- Número do retorno
  "returnNumber" INTEGER NOT NULL,

  -- Data e hora
  "scheduledDate" TIMESTAMP NOT NULL,
  "originalScheduledDate" TIMESTAMP,

  -- Status
  status return_status_enum NOT NULL DEFAULT 'agendado',

  -- Confirmação
  "confirmedByPatient" BOOLEAN NOT NULL DEFAULT false,
  "confirmedAt" TIMESTAMP,

  -- Lembretes
  "reminder1DaySent" BOOLEAN NOT NULL DEFAULT false,
  "reminder1WeekSent" BOOLEAN NOT NULL DEFAULT false,

  -- Check-in
  "checkedIn" BOOLEAN NOT NULL DEFAULT false,
  "checkedInAt" TIMESTAMP,

  -- Atendimento
  "attendanceStartedAt" TIMESTAMP,
  "attendanceEndedAt" TIMESTAMP,

  -- Profissional e localização
  "professionalId" UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(50),

  -- Observações
  notes TEXT,

  -- Tenant
  "tenantId" VARCHAR(255) NOT NULL,

  -- Auditoria
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Cancelamento
  "canceledAt" TIMESTAMP,
  "canceledById" VARCHAR(255),
  "cancelReason" TEXT
);

-- Índices para appointment_returns
CREATE INDEX IF NOT EXISTS idx_appointment_returns_appointment ON appointment_returns("appointmentId");
CREATE INDEX IF NOT EXISTS idx_appointment_returns_scheduled_date ON appointment_returns("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_appointment_returns_status ON appointment_returns(status);
CREATE INDEX IF NOT EXISTS idx_appointment_returns_tenant ON appointment_returns("tenantId");

-- ====================================
-- TABELA: appointment_notifications
-- ====================================
CREATE TABLE IF NOT EXISTS appointment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  "appointmentId" UUID REFERENCES appointments(id) ON DELETE CASCADE,
  "appointmentReturnId" UUID REFERENCES appointment_returns(id) ON DELETE CASCADE,

  -- Tipo e canal
  type notification_type_enum NOT NULL,
  channel notification_channel_enum NOT NULL DEFAULT 'whatsapp',

  -- Status
  status notification_status_enum NOT NULL DEFAULT 'pendente',

  -- Destinatário
  "recipientPhone" VARCHAR(50) NOT NULL,
  "recipientEmail" VARCHAR(255),
  "recipientName" VARCHAR(255),

  -- Conteúdo
  message TEXT NOT NULL,
  "templateName" VARCHAR(100),
  "templateVariables" JSONB,

  -- Dados de entrega
  "deliveryData" JSONB,
  "externalMessageId" VARCHAR(255),

  -- Datas
  "sentAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "readAt" TIMESTAMP,
  "failedAt" TIMESTAMP,
  "failureReason" TEXT,

  -- Tentativas
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "lastRetryAt" TIMESTAMP,

  -- Tenant
  "tenantId" VARCHAR(255) NOT NULL,

  -- Auditoria
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para appointment_notifications
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment ON appointment_notifications("appointmentId");
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_return ON appointment_notifications("appointmentReturnId");
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_type ON appointment_notifications(type);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_status ON appointment_notifications(status);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_tenant ON appointment_notifications("tenantId");
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_created_at ON appointment_notifications("createdAt");

-- ====================================
-- COMENTÁRIOS
-- ====================================
COMMENT ON TABLE appointments IS 'Agendamentos de procedimentos para pacientes';
COMMENT ON TABLE appointment_returns IS 'Retornos agendados para acompanhamento de procedimentos';
COMMENT ON TABLE appointment_notifications IS 'Notificações enviadas relacionadas a agendamentos';

-- ====================================
-- FIM DA MIGRATION
-- ====================================
