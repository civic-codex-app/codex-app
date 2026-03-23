-- 022_issue_follows.sql
-- Allow logged-in users to follow specific issues

CREATE TABLE IF NOT EXISTS issue_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, issue_id)
);

CREATE INDEX IF NOT EXISTS idx_issue_follows_user ON issue_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_follows_issue ON issue_follows(issue_id);

ALTER TABLE issue_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own issue follows"
  ON issue_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issue follows"
  ON issue_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own issue follows"
  ON issue_follows FOR DELETE
  USING (auth.uid() = user_id);
