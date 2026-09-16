-- ============================================================================
-- PENDING MIGRATIONS 025–029, COMBINED FOR A SINGLE PASTE
-- ============================================================================
--
-- Convenience copy. The canonical files are supabase/migrations/02[5-9]_*.sql;
-- this file is those five concatenated, in the order they should run. Every
-- one is idempotent, so re-running after a partial failure is safe.
--
-- Deliberately NOT inside supabase/migrations/, so nothing that applies
-- migrations by filename order picks it up twice.
--
-- Order:
--   029  daily_topics RLS      SECURITY — closes anonymous INSERT/UPDATE/DELETE
--                              on the homepage news tables. Runs first.
--   025  candidates.source     unblocks scripts/import-fec-candidates.mjs
--   026  politicians.source    unblocks scripts/import-congress-members.mjs
--   027  public_submissions    creates the table the submissions feature uses
--   028  public_like_counts    stops `likes` exposing user_id -> politician_id
--
-- After this runs:
--   pnpm verify:rls        should report no table accepting anonymous writes
--   pnpm verify:selects    should report all clear
--   then, with .env.local exported:
--     node scripts/import-fec-candidates.mjs --apply
--     node scripts/import-congress-members.mjs --apply
--
-- Do NOT also run 015_public_follow_counts.sql — see CLAUDE.md.
-- ============================================================================



-- ############################################################################
-- BEGIN 029_fix_daily_topics_rls.sql
-- ############################################################################

-- 029_fix_daily_topics_rls.sql
--
-- Close anonymous write access to the homepage news tables.
--
-- 013_daily_topics.sql created these:
--
--   CREATE POLICY "Service role full access topics" ON daily_topics
--     FOR ALL USING (true) WITH CHECK (true);
--
-- The name says service role, but there is no TO clause, so the policy applies
-- to every role -- anon included -- and FOR ALL covers INSERT, UPDATE and
-- DELETE. The service role bypasses RLS entirely and never needed a policy, so
-- in practice this granted full write access to anyone holding the anon key,
-- which ships in the client bundle.
--
-- Verified against the live database: an anonymous INSERT into daily_topics
-- succeeded. daily_topics is the homepage "Today in Politics" strip, so that
-- is arbitrary content injection onto a voter-facing civic site. The probe
-- rows were removed immediately.
--
-- Legitimate writers are unaffected:
--   - the cron and admin API routes use the service-role client, which
--     bypasses RLS and needs no policy
--   - app/admin/daily-topics is a browser client acting as a signed-in admin,
--     which the replacement policies below allow
--
-- Idempotent.

DROP POLICY IF EXISTS "Service role full access topics" ON daily_topics;
DROP POLICY IF EXISTS "Service role full access topic politicians" ON daily_topic_politicians;

-- Admin-only writes, matching how the rest of the app decides who is an admin
-- (app/api/admin/*: profiles.role = 'admin').
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_topics' AND policyname='Admins write topics') THEN
    CREATE POLICY "Admins write topics" ON daily_topics
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_topic_politicians' AND policyname='Admins write topic politicians') THEN
    CREATE POLICY "Admins write topic politicians" ON daily_topic_politicians
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  END IF;
END $$;

-- The public SELECT policies from 013 are correct and stay as they are:
-- daily_topics is readable where is_active, daily_topic_politicians is
-- readable outright. Only the write side was wrong.

-- Audit the same mistake elsewhere before trusting this is the only instance:
--   SELECT tablename, policyname, cmd, roles, qual
--     FROM pg_policies
--    WHERE schemaname = 'public' AND cmd = 'ALL' AND qual = 'true';
-- Any row there with roles = {public} is world-writable.

-- END 029_fix_daily_topics_rls.sql


-- ############################################################################
-- BEGIN 025_candidate_source.sql
-- ############################################################################

-- 025_candidate_source.sql
--
-- Give `candidates` a place to record where a row came from.
--
-- CLAUDE.md rule 2: every imported row is stamped with its real source and the
-- upstream coverage date, so vintage is auditable. campaign_finance already
-- does this; candidates had nowhere to put it, which is part of why 526
-- seed-generated rows were indistinguishable from real ones at a glance.
--
-- Idempotent.

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS source text;

COMMENT ON COLUMN candidates.source IS
  'Provenance of this row, e.g. "FEC API (candidates, cycle 2026, status C, fetched 2026-09-10)". NULL means seed-generated and unverified.';

-- Existing rows predate the FEC importer and are seed-generated. Label them
-- rather than leaving the column ambiguous.
UPDATE candidates
   SET source = 'seed (generated 2026-03-21, assumes every incumbent seeks reelection)'
 WHERE source IS NULL
   AND is_verified IS NOT TRUE;

CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates (source);

-- END 025_candidate_source.sql


-- ############################################################################
-- BEGIN 026_politician_source.sql
-- ############################################################################

-- 026_politician_source.sql
--
-- Give `politicians` the provenance columns every other imported table has.
--
-- politicians is what the whole site hangs off -- stances, race incumbents,
-- candidate links, report cards -- and it is the only such table with no
-- provenance at all. No source, no is_verified, and every row's updated_at is
-- 2026-03-21, the seed date. A row sourced from Congress.gov and a row a
-- script invented are indistinguishable.
--
-- CLAUDE.md rule 2: stamp every imported row with its real source and upstream
-- coverage date. Rule 3: is_verified is true ONLY for rows confirmed against
-- an authoritative source.
--
-- Idempotent.

ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_checked timestamptz;

COMMENT ON COLUMN politicians.source IS
  'Provenance, e.g. "Congress.gov API (member?currentMember=true, fetched 2026-09-11)". NULL or a seed string means unverified.';
COMMENT ON COLUMN politicians.is_verified IS
  'True ONLY for rows confirmed against an authoritative source. Seed rows stay false.';

-- Label what is already there rather than leaving the column ambiguous. Every
-- existing row predates any sourced import.
UPDATE politicians
   SET source = 'seed (generated 2026-03-21, unverified)'
 WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS idx_politicians_is_verified ON politicians (is_verified);

-- END 026_politician_source.sql


-- ############################################################################
-- BEGIN 027_public_submissions.sql
-- ############################################################################

-- 027_public_submissions.sql
--
-- Create the `public_submissions` table that the app already writes to and
-- reads from, but which does not exist in the database.
--
-- app/api/submissions/route.ts inserts into it, and app/admin/inbox reads and
-- filters it. Both fail with "Could not find the table
-- 'public.public_submissions' in the schema cache". PostgREST rejects the
-- whole request rather than erroring loudly, so the admin inbox renders empty
-- and every public submission is silently discarded with a 500.
--
-- CLAUDE.md lists a submissions migration among 011-023, but migrations
-- 001-010 and 016-024 are absent from the repo, so whatever created it was
-- never committed and evidently never run here. The shape below is derived
-- from how the code actually uses the table, not invented:
--
--   type      SUBMISSION_TYPES in app/api/submissions/route.ts:6
--   user_id   rate-limit query filters (user_id, created_at)
--   name      profile display_name, falls back to the email local-part
--   email     auth email, falls back to the profile email
--   data      z.record(z.unknown()) -- the per-type validated payload
--   status    the admin inbox filters and counts new/reviewed/resolved/dismissed
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS public_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL,
  user_id     uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  name        text,
  email       text,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Vocabularies are locked so a typo cannot create a status the inbox filters
-- cannot reach, which is how candidates.status drifted before migration 024.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'public_submissions_type_check') THEN
    ALTER TABLE public_submissions ADD CONSTRAINT public_submissions_type_check
      CHECK (type IN ('contact', 'suggest_politician', 'update_politician', 'report_error', 'submit_tip'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'public_submissions_status_check') THEN
    ALTER TABLE public_submissions ADD CONSTRAINT public_submissions_status_check
      CHECK (status IN ('new', 'reviewed', 'resolved', 'dismissed'));
  END IF;
END $$;

-- The admin inbox orders by created_at and facets on status and type; the API
-- rate-limits on (user_id, created_at).
CREATE INDEX IF NOT EXISTS idx_public_submissions_created_at ON public_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_submissions_status     ON public_submissions (status);
CREATE INDEX IF NOT EXISTS idx_public_submissions_type       ON public_submissions (type);
CREATE INDEX IF NOT EXISTS idx_public_submissions_user_time  ON public_submissions (user_id, created_at DESC);

-- Both paths go through the service-role client, which bypasses RLS. Enabling
-- RLS with no policy therefore keeps the table reachable by the app and closed
-- to anon and authenticated callers -- submissions carry an email address.
ALTER TABLE public_submissions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public_submissions IS
  'Public contact/tip/correction submissions. Written by app/api/submissions, triaged in app/admin/inbox. Service-role only; RLS is on with no policies by design.';

-- END 027_public_submissions.sql


-- ############################################################################
-- BEGIN 028_like_counts_view.sql
-- ############################################################################

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

-- END 028_like_counts_view.sql
