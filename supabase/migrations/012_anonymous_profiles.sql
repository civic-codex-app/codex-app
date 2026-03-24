-- Add anonymous sharing columns to profiles
-- Allows users to share their political quiz data anonymously

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS sharing_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_id TEXT UNIQUE DEFAULT NULL;

-- Index for efficient community page queries
CREATE INDEX IF NOT EXISTS idx_profiles_sharing
  ON profiles (sharing_enabled)
  WHERE sharing_enabled = true;
