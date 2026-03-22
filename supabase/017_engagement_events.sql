-- 017_engagement_events.sql
-- Engagement tracking for gamification: streaks, badges, activity logging

-- Engagement events log
CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'login', 'quiz_complete', 'poll_vote', 'bill_follow', 'politician_follow', 'page_view'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_date ON engagement_events(user_id, created_at);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own engagement' AND tablename = 'engagement_events') THEN
    CREATE POLICY "Users can read own engagement" ON engagement_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own engagement' AND tablename = 'engagement_events') THEN
    CREATE POLICY "Users can insert own engagement" ON engagement_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add streak + badge columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]';

COMMENT ON TABLE engagement_events IS 'Tracks user engagement events for gamification (streaks, badges)';
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive daily engagement streak';
COMMENT ON COLUMN profiles.longest_streak IS 'Longest ever daily engagement streak';
COMMENT ON COLUMN profiles.badges IS 'Array of earned badge IDs: ["first_vote", "informed_voter", ...]';
