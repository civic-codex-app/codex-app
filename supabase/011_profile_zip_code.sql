-- Add zip_code to profiles for congressional district lookup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code text;
