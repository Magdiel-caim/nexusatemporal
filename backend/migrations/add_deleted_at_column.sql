-- Add deletedAt column to users table
-- This column tracks when a user was soft deleted

ALTER TABLE users ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Create index for better performance on cleanup queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users("deletedAt") WHERE "deletedAt" IS NOT NULL;

COMMENT ON COLUMN users."deletedAt" IS 'Timestamp when the user was soft deleted. Users will be permanently removed 30 days after this date.';
