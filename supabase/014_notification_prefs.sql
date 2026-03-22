-- Migration: Add notification_prefs JSONB column to profiles
-- Stores user notification preferences (election reminders, stance updates, etc.)
-- Idempotent: safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notification_prefs'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_prefs jsonb DEFAULT '{}';
  END IF;
END $$;

-- Allow users to update their own notification_prefs
-- (RLS should already allow profile owners to update their own row,
--  but this comment documents the intent.)
COMMENT ON COLUMN profiles.notification_prefs IS 'JSON object storing notification preferences: election_reminders, stance_updates, new_votes, weekly_digest';
