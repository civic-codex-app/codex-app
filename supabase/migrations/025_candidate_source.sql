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
