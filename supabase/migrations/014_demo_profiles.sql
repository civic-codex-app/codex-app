-- Add is_demo flag to profiles for seeded community members
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Index for quick filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo) WHERE is_demo = true;
