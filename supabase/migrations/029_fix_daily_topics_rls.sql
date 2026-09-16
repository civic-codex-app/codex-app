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
