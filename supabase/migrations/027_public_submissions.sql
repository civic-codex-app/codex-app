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
