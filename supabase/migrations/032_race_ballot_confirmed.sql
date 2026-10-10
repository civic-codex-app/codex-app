-- 032_race_ballot_confirmed.sql
--
-- In 49 states a race's candidates with status 'running' are everyone who
-- filed with the FEC. The FEC lists who filed, not who won the primary, so
-- on 2026-10-09, 369 of the 505 federal and governor races for Nov 3 still
-- carried more than one running candidate from the same major party, and
-- every screen drew the first two alphabetically as the matchup.
--
-- Only Michigan has been reconciled against its state's certified candidate
-- listing (scripts/reconcile-michigan-candidates.mjs). These two columns
-- record that reconciliation per race. While they are NULL the app says the
-- list is who filed, not who is on the ballot, and draws no head-to-head.
-- Set them only from a state's official listing: a reconcile script stamps
-- the races it covered with the listing's name and the fetch date.

ALTER TABLE races ADD COLUMN IF NOT EXISTS ballot_confirmed_source text;
ALTER TABLE races ADD COLUMN IF NOT EXISTS ballot_confirmed_at timestamptz;

COMMENT ON COLUMN races.ballot_confirmed_source IS
  'The official state candidate listing this race''s candidate statuses were reconciled against. NULL: the running list is who filed with the FEC, not who is on the ballot.';
COMMENT ON COLUMN races.ballot_confirmed_at IS
  'When the reconcile against ballot_confirmed_source last ran.';
