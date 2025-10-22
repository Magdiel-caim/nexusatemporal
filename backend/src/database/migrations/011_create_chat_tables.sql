-- Migration 011: Create Chat Tables
-- Date: 2025-10-21
-- Description: Creates all tables needed for the Chat module (conversations, messages, attachments, tags, quick_replies)

-- ===== 1. CONVERSATIONS TABLE =====
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id VARCHAR,
  contact_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL,
  whatsapp_instance_id VARCHAR,
  assigned_user_id VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed', 'waiting')),
  is_unread BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for phone_number (removed UNIQUE constraint to allow same number in different WhatsApp sessions)
CREATE INDEX idx_conversations_phone_number ON conversations(phone_number);

-- Index for WhatsApp instance + phone (to find conversation by session + number)
CREATE INDEX idx_conversations_whatsapp_phone ON conversations(whatsapp_instance_id, phone_number);

-- Index for assigned user
CREATE INDEX idx_conversations_assigned_user ON conversations(assigned_user_id);

-- Index for status
CREATE INDEX idx_conversations_status ON conversations(status);

-- Index for last_message_at (for sorting)
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- ===== 2. MESSAGES TABLE =====
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  direction VARCHAR NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  type VARCHAR NOT NULL CHECK (type IN ('text', 'audio', 'image', 'video', 'document', 'location', 'contact')),
  content TEXT,
  sender_id VARCHAR,
  sender_name VARCHAR,
  whatsapp_message_id VARCHAR,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Index for conversation
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Index for WhatsApp message ID (for deduplication)
CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id);

-- Index for created_at (for chronological ordering)
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ===== 3. ATTACHMENTS TABLE =====
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('audio', 'image', 'video', 'document')),
  file_name VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  mime_type VARCHAR,
  file_size BIGINT,
  duration INTEGER,
  thumbnail_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_attachments_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Index for message
CREATE INDEX idx_attachments_message_id ON attachments(message_id);

-- ===== 4. CHAT TAGS TABLE =====
CREATE TABLE IF NOT EXISTS chat_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  color VARCHAR DEFAULT '#3B82F6',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for name (for searching)
CREATE INDEX idx_chat_tags_name ON chat_tags(name);

-- ===== 5. QUICK REPLIES TABLE =====
CREATE TABLE IF NOT EXISTS quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  shortcut VARCHAR,
  category VARCHAR,
  created_by VARCHAR,
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for category
CREATE INDEX idx_quick_replies_category ON quick_replies(category);

-- Index for shortcut (for fast lookup)
CREATE INDEX idx_quick_replies_shortcut ON quick_replies(shortcut);

-- Index for created_by
CREATE INDEX idx_quick_replies_created_by ON quick_replies(created_by);

-- Index for active + global (for common queries)
CREATE INDEX idx_quick_replies_active_global ON quick_replies(is_active, is_global);

-- ===== 6. TRIGGERS FOR UPDATED_AT =====
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for messages
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_tags
CREATE TRIGGER update_chat_tags_updated_at BEFORE UPDATE ON chat_tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quick_replies
CREATE TRIGGER update_quick_replies_updated_at BEFORE UPDATE ON quick_replies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== MIGRATION COMPLETE =====
-- Run this migration on the same database where WhatsApp messages are stored
