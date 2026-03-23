-- 019_quiz_results.sql
-- Persist quiz match results in the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quiz_results JSONB;

COMMENT ON COLUMN profiles.quiz_results IS 'Cached match results from the Who Represents You quiz. Shape: { results: MatchResult[], stateResults: MatchResult[], updatedAt: string }';
