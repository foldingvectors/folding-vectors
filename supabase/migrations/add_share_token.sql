-- Add share_token column to analyses table for public sharing
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Create index for faster lookup by share token
CREATE INDEX IF NOT EXISTS idx_analyses_share_token ON analyses(share_token);
