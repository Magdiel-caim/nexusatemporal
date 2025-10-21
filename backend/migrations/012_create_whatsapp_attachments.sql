-- =====================================================
-- Migration: Create whatsapp_attachments table
-- Date: 2025-10-21
-- Purpose: Store attachment details for WhatsApp messages
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES whatsapp_messages(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'image', 'video', 'audio', 'document'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT, -- Tamanho em bytes
  duration INT, -- Duração em segundos (para áudio/vídeo)
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_whatsapp_attachments_message ON whatsapp_attachments(message_id);
CREATE INDEX idx_whatsapp_attachments_type ON whatsapp_attachments(type);
CREATE INDEX idx_whatsapp_attachments_created ON whatsapp_attachments(created_at DESC);

COMMENT ON TABLE whatsapp_attachments IS 'Armazena anexos (imagens, vídeos, áudios, documentos) das mensagens do WhatsApp';
COMMENT ON COLUMN whatsapp_attachments.type IS 'Tipo do anexo: image, video, audio, document';
COMMENT ON COLUMN whatsapp_attachments.file_url IS 'URL do arquivo no S3/iDrive E2';
COMMENT ON COLUMN whatsapp_attachments.duration IS 'Duração em segundos (apenas para áudio e vídeo)';
