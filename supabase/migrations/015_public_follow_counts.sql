-- Allow public read on follows, bill_follows, and issue_follows
-- so aggregate counts (e.g., "665 saved") are visible to all users.
-- Users can already manage their own follows via existing policies.

-- Follows (politician follows)
CREATE POLICY "Follows are publicly readable"
  ON follows FOR SELECT USING (true);

-- Bill follows
CREATE POLICY "Bill follows are publicly readable"
  ON bill_follows FOR SELECT USING (true);

-- Issue follows
CREATE POLICY "Issue follows are publicly readable"
  ON issue_follows FOR SELECT USING (true);
