-- 012_bill_follows.sql
-- Allow logged-in users to follow/bookmark specific bills

CREATE TABLE IF NOT EXISTS bill_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_id uuid REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bill_id)
);

ALTER TABLE bill_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bill follows"
  ON bill_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bill follows"
  ON bill_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bill follows"
  ON bill_follows FOR DELETE
  USING (auth.uid() = user_id);
