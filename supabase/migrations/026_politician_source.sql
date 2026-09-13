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
