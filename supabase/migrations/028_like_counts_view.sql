-- 028_like_counts_view.sql
--
-- Stop exposing the per-user like graph to anonymous visitors.
--
-- `likes` is (id, user_id, politician_id, created_at) and is currently
-- readable by anyone holding the anon key -- which ships in the client bundle,
-- so effectively by anyone. All 11,281 rows come back. That is an enumerable
-- map of which account likes which politicians: political-preference data on a
-- civic site.
--
-- Its sibling `follows` has the identical shape and is NOT readable, so this
-- is an inconsistency rather than a deliberate choice. The reason likes stayed
-- open is components/directory/like-button.tsx, which counts likes from the
-- browser and therefore needed SELECT on the table. A count does not require
-- exposing the rows.
--
-- This adds a view returning only (politician_id, like_count), grants it to
-- anon, and narrows the table's own SELECT policy to a user's own rows.
--
-- Idempotent.

CREATE OR REPLACE VIEW public_like_counts AS
  SELECT politician_id, count(*)::bigint AS like_count
    FROM likes
   GROUP BY politician_id;

-- security_invoker = off (the default for views) means the view runs as its
-- owner and can read the table regardless of the caller's RLS. That is the
-- point: aggregate visible, rows not.
ALTER VIEW public_like_counts SET (security_invoker = off);

GRANT SELECT ON public_like_counts TO anon, authenticated;

COMMENT ON VIEW public_like_counts IS
  'Per-politician like totals for the public like button. Exists so `likes` itself does not have to be world-readable — that would expose which account likes which politician.';

-- Replace the permissive read with own-rows-only. Named policies are dropped
-- by name; anything equivalent under another name must be dropped by hand
-- after checking pg_policies, since policy names are not standardised here.
DROP POLICY IF EXISTS "Likes are publicly readable" ON likes;
DROP POLICY IF EXISTS "Public can read likes" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Users read their own likes'
  ) THEN
    CREATE POLICY "Users read their own likes"
      ON likes FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- NOTE on 015_public_follow_counts.sql, which is in the repo and has NOT been
-- applied: it does the opposite of this migration. It grants
-- `FOR SELECT USING (true)` on follows, bill_follows and issue_follows to make
-- aggregate counts visible, which would expose three more per-user preference
-- graphs -- 28,337 follow rows among them. If counts are needed there, give
-- each one a view like the above rather than opening the table.
