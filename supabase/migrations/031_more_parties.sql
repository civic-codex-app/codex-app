-- 031_more_parties.sql
--
-- party_type held four values: democrat, republican, green, independent.
-- Every other party had to be stored as one of those, and the FEC importer
-- chose `independent` for all of them. That prints a false party on the
-- ballot: a Libertarian is not an independent, and a voter reading the
-- ballot page is told something untrue about a candidate.
--
-- Michigan's Official Candidate Listing for 2026-11-03 carries 29 nominees
-- in federal and legislative races from parties this enum could not name
-- (Libertarian 10, Working Class 9, U.S. Taxpayers 8, Natural Law 2), so
-- scripts/reconcile-michigan-candidates.mjs refused to insert them. Adding
-- the values lets them in under their real party. Constitution is added
-- with them because it is on the ballot in most states and will come up
-- as soon as another state is reconciled.
--
-- ADD VALUE IF NOT EXISTS is idempotent. A new enum value cannot be used in
-- the same transaction that adds it, so no row is written here.

ALTER TYPE party_type ADD VALUE IF NOT EXISTS 'libertarian';
ALTER TYPE party_type ADD VALUE IF NOT EXISTS 'constitution';
ALTER TYPE party_type ADD VALUE IF NOT EXISTS 'us_taxpayers';
ALTER TYPE party_type ADD VALUE IF NOT EXISTS 'natural_law';
ALTER TYPE party_type ADD VALUE IF NOT EXISTS 'working_class';
