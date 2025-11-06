-- Migration: Adicionar campos "archived" e "priority" na tabela conversations
-- Data: 03/11/2025
-- Segurança: Migration ADITIVA (apenas ADD COLUMN, permite NULL)

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Adicionar campo "archived" (booleano, padrão FALSE)
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Adicionar campo "priority" (enum: low, medium, high, padrão NULL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_priority') THEN
        CREATE TYPE conversation_priority AS ENUM ('low', 'medium', 'high');
    END IF;
END$$;

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS priority conversation_priority DEFAULT NULL;

-- Adicionar índice para melhorar performance de queries com archived
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(archived);

-- Adicionar índice para melhorar performance de queries com priority
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON COLUMN conversations.archived IS 'Indica se a conversa foi arquivada pelo usuário';
COMMENT ON COLUMN conversations.priority IS 'Prioridade da conversa (low, medium, high)';

-- =====================================================
-- DOWN MIGRATION (ROLLBACK)
-- =====================================================

-- Para reverter esta migration:
-- ALTER TABLE conversations DROP COLUMN IF EXISTS archived;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS priority;
-- DROP TYPE IF EXISTS conversation_priority;
-- DROP INDEX IF EXISTS idx_conversations_archived;
-- DROP INDEX IF EXISTS idx_conversations_priority;
