-- Migration 012: Add avatar_url to conversations
-- Date: 2025-10-22
-- Description: Adds avatar_url column to store contact profile picture

-- Add avatar_url column
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Add index for performance (optional, but useful for queries)
CREATE INDEX IF NOT EXISTS idx_conversations_avatar_url ON conversations(avatar_url) WHERE avatar_url IS NOT NULL;

-- Migration complete
