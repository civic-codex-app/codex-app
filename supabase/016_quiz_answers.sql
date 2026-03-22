-- 016_quiz_answers.sql
-- Add quiz_answers column to profiles for cross-device sync

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS quiz_answers jsonb DEFAULT '{}';

COMMENT ON COLUMN profiles.quiz_answers IS 'User quiz answers as { "issue-slug": "stance_value", ... }';
