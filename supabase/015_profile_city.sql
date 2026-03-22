-- Add city column to profiles for local ballot matching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
