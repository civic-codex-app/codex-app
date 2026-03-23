-- Add IP-based vote tracking to prevent cookie-clearing abuse
-- Run in Supabase SQL Editor

-- Add ip_address column for vote tracking
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS ip_address text;

-- Make user_id nullable (anonymous voting is allowed)
ALTER TABLE poll_votes ALTER COLUMN user_id DROP NOT NULL;

-- Index for fast IP+poll lookups
CREATE INDEX IF NOT EXISTS idx_poll_votes_ip_poll ON poll_votes (ip_address, poll_id);
