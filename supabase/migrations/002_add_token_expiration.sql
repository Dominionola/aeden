-- Add token_expires_at column to social_accounts table
-- This tracks when the Threads access token expires

ALTER TABLE social_accounts 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

-- Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_social_accounts_token_expiration 
ON social_accounts(token_expires_at) 
WHERE is_active = true;

COMMENT ON COLUMN social_accounts.token_expires_at IS 
'Timestamp when the access token expires. Threads long-lived tokens last 60 days.';
