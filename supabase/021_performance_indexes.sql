-- 021_performance_indexes.sql
-- Add composite indexes for politician_issues — critical after scaling to 70K+ rows

-- Composite index for profile page and match API (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_politician_issues_pol_issue
  ON politician_issues (politician_id, issue_id);

-- Reverse index for issue-centric queries (heatmap, issue pages)
CREATE INDEX IF NOT EXISTS idx_politician_issues_issue_stance
  ON politician_issues (issue_id, stance);

-- Index for verified-only queries
CREATE INDEX IF NOT EXISTS idx_politician_issues_verified
  ON politician_issues (politician_id)
  WHERE is_verified = true;
