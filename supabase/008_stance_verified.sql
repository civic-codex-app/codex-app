-- Add is_verified flag to politician_issues to distinguish
-- personalized/verified stances from party-default estimates
ALTER TABLE politician_issues ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Also add to candidate_issues for consistency
ALTER TABLE candidate_issues ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
