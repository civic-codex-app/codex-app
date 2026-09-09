-- 025_issue_stance_counts.sql
--
-- /issues needs a per-issue tally of supports/opposes/mixed. It previously ran
-- 3 head-only count queries per issue -- 66 round-trips for 22 issues, ~5.4s
-- TTFB. Fetching the rows to count them in Node is worse, not better:
-- politician_issues holds ~188,848 rows (8,584 politicians x 22 issues), so
-- paginating it takes ~189 requests and >20s.
--
-- Postgres should do the counting. This view collapses the whole table to
-- ~22 issues x 9 stance values = ~200 rows in one query, and it can be served
-- as an index-only scan by idx_politician_issues_issue_stance (issue_id, stance)
-- from 021_performance_indexes.sql.
--
-- security_invoker = true so the view respects the caller's RLS on
-- politician_issues rather than silently running with the view owner's rights.
--
-- Idempotent -- safe to re-run.

create or replace view issue_stance_counts
with (security_invoker = true) as
select
  issue_id,
  stance,
  count(*)::int as n
from politician_issues
group by issue_id, stance;

comment on view issue_stance_counts is
  'Per-issue stance tallies for /issues. Aggregate in the DB: politician_issues is ~189k rows, far too many to count in the app.';

grant select on issue_stance_counts to anon, authenticated, service_role;
