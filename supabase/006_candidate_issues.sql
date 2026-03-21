-- Candidate issue stances (mirrors politician_issues for challenger candidates)
create table candidate_issues (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  issue_id uuid not null references issues (id) on delete cascade,
  stance stance_type not null default 'unknown',
  summary text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, issue_id)
);

create index idx_candidate_issues_candidate on candidate_issues (candidate_id);
create index idx_candidate_issues_issue on candidate_issues (issue_id);

create trigger candidate_issues_updated_at
  before update on candidate_issues
  for each row execute function update_updated_at();

-- RLS: publicly readable
alter table candidate_issues enable row level security;
create policy "Candidate issues are publicly readable"
  on candidate_issues for select using (true);
