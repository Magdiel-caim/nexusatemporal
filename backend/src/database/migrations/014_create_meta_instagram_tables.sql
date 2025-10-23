-- Migration 014: Meta Instagram/Messenger Integration Tables
-- Date: 2025-10-23
-- Description: Creates tables for Meta (Instagram/Messenger) direct API integration including OAuth, accounts, and messages

-- ============================================
-- OAUTH STATES (temporary storage for OAuth CSRF protection)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_states (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  state VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oauth_states_user ON oauth_states(user_id);
CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_expires ON oauth_states(expires_at);

-- ============================================
-- META INSTAGRAM ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS meta_instagram_accounts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,

  -- Instagram account data
  instagram_account_id VARCHAR(255) NOT NULL UNIQUE,
  instagram_username VARCHAR(255),
  instagram_name VARCHAR(255),
  profile_picture_url TEXT,

  -- Facebook Page data (if connected)
  facebook_page_id VARCHAR(255),
  facebook_page_name VARCHAR(255),

  -- Access tokens (encrypted)
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  long_lived_token TEXT, -- Token that lasts 60 days

  -- Metadata
  platform VARCHAR(20) DEFAULT 'instagram', -- 'instagram' or 'messenger'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked'

  -- Timestamps
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_meta_instagram_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_meta_instagram_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_meta_instagram_tenant ON meta_instagram_accounts(tenant_id);
CREATE INDEX idx_meta_instagram_account_id ON meta_instagram_accounts(instagram_account_id);
CREATE INDEX idx_meta_instagram_status ON meta_instagram_accounts(status);
CREATE INDEX idx_meta_instagram_user ON meta_instagram_accounts(user_id);

-- ============================================
-- INSTAGRAM MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS instagram_messages (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL REFERENCES meta_instagram_accounts(id) ON DELETE CASCADE,

  -- Meta identifiers
  message_id VARCHAR(255) NOT NULL UNIQUE,
  conversation_id VARCHAR(255),

  -- Sender and recipient
  from_id VARCHAR(255) NOT NULL,
  from_username VARCHAR(255),
  to_id VARCHAR(255) NOT NULL,

  -- Content
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio', 'story_reply', etc.
  attachments JSONB, -- URLs of images/videos/etc

  -- Direction
  direction VARCHAR(20) NOT NULL, -- 'inbound' (received) or 'outbound' (sent)

  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'

  -- Metadata
  metadata JSONB,
  raw_payload JSONB, -- Complete webhook/API payload

  -- Timestamps
  sent_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_instagram_messages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_instagram_messages_tenant ON instagram_messages(tenant_id);
CREATE INDEX idx_instagram_messages_account ON instagram_messages(account_id);
CREATE INDEX idx_instagram_messages_conversation ON instagram_messages(conversation_id);
CREATE INDEX idx_instagram_messages_direction ON instagram_messages(direction);
CREATE INDEX idx_instagram_messages_sent_at ON instagram_messages(sent_at DESC);
CREATE INDEX idx_instagram_messages_message_id ON instagram_messages(message_id);
CREATE INDEX idx_instagram_messages_from_id ON instagram_messages(from_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE oauth_states IS 'Temporary storage for OAuth state validation (CSRF protection)';
COMMENT ON TABLE meta_instagram_accounts IS 'Connected Instagram Business/Creator accounts via Meta Graph API';
COMMENT ON TABLE instagram_messages IS 'Instagram Direct Messages history (inbound and outbound)';

COMMENT ON COLUMN meta_instagram_accounts.access_token IS 'Encrypted access token (AES-256)';
COMMENT ON COLUMN meta_instagram_accounts.long_lived_token IS 'Encrypted long-lived token (60 days validity)';
COMMENT ON COLUMN instagram_messages.direction IS 'Message direction: inbound (received) or outbound (sent by system)';
COMMENT ON COLUMN instagram_messages.raw_payload IS 'Complete JSON payload from Meta webhook or API response';
