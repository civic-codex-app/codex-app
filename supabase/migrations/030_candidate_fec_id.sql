-- 030_candidate_fec_id.sql
--
-- Record the FEC candidate id on each imported candidate row.
--
-- The 2026-09-16 FEC import matched existing rows by normalised name, which is
-- the wrong key. FEC ships "MARKEY, EDWARD SEN." and the seed held "Ed Markey";
-- those do not normalise to the same string, so the import inserted a second
-- row for a person already present. 125 races ended up showing the same
-- candidate twice, and 235 races showed more than one incumbent — more
-- incumbents than there are seats.
--
-- FEC's candidate_id (S6TX00578, H2TX01112) is stable across cycles and is the
-- correct identity key. Storing it makes the import idempotent: a re-run
-- updates the row it created last time instead of adding another.
--
-- Unique per (race_id, fec_candidate_id) rather than globally: the same person
-- can legitimately appear in two different races across cycles.
--
-- Idempotent.

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS fec_candidate_id text;

COMMENT ON COLUMN candidates.fec_candidate_id IS
  'FEC candidate_id (e.g. H2TX01112). Set by scripts/import-fec-candidates.mjs; NULL for seed rows and for non-federal candidates, who file with state agencies and have no FEC id.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_race_fec_id
  ON candidates (race_id, fec_candidate_id)
  WHERE fec_candidate_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_fec_id
  ON candidates (fec_candidate_id)
  WHERE fec_candidate_id IS NOT NULL;
