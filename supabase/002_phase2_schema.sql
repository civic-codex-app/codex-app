-- ============================================================
-- Codex Phase 2 — Schema Expansion
-- Likes, Polls, Issues, Committees, Profile upgrades
-- ============================================================

-- ============================================================
-- Update profiles with new fields
-- ============================================================
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists state text;
alter table profiles add column if not exists notifications_enabled boolean not null default true;
alter table profiles add column if not exists updated_at timestamptz not null default now();

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- Likes (public, aggregated counts shown)
-- ============================================================
create table likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  politician_id uuid not null references politicians (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, politician_id)
);

create index idx_likes_politician on likes (politician_id);
create index idx_likes_user on likes (user_id);

-- ============================================================
-- Issues
-- ============================================================
create type issue_category as enum (
  'economy', 'healthcare', 'immigration', 'education', 'defense',
  'environment', 'justice', 'foreign_policy', 'technology', 'social',
  'gun_policy', 'infrastructure', 'housing', 'energy'
);

create type stance_type as enum ('supports', 'opposes', 'mixed', 'unknown');

create table issues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category issue_category not null,
  icon text, -- emoji or icon name
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger issues_updated_at
  before update on issues
  for each row execute function update_updated_at();

create table politician_issues (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians (id) on delete cascade,
  issue_id uuid not null references issues (id) on delete cascade,
  stance stance_type not null default 'unknown',
  summary text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (politician_id, issue_id)
);

create index idx_politician_issues_politician on politician_issues (politician_id);
create index idx_politician_issues_issue on politician_issues (issue_id);

create trigger politician_issues_updated_at
  before update on politician_issues
  for each row execute function update_updated_at();

-- ============================================================
-- Committees
-- ============================================================
create type committee_type as enum ('standing', 'select', 'joint', 'special');
create type committee_role as enum ('chair', 'vice_chair', 'ranking_member', 'member');

create table committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  chamber chamber_type not null,
  committee_type committee_type not null default 'standing',
  description text,
  website_url text,
  created_at timestamptz not null default now()
);

create table politician_committees (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians (id) on delete cascade,
  committee_id uuid not null references committees (id) on delete cascade,
  role committee_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (politician_id, committee_id)
);

create index idx_politician_committees_politician on politician_committees (politician_id);
create index idx_politician_committees_committee on politician_committees (committee_id);

-- ============================================================
-- Polls
-- ============================================================
create type poll_type as enum ('approval', 'matchup', 'issue');
create type poll_status as enum ('draft', 'active', 'closed');

create table polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  poll_type poll_type not null,
  status poll_status not null default 'draft',
  chamber_filter chamber_type, -- optional: only show for this chamber
  state_filter text, -- optional: only show for this state
  created_by uuid references profiles (id),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger polls_updated_at
  before update on polls
  for each row execute function update_updated_at();

create table poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  label text not null,
  politician_id uuid references politicians (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_poll_options_poll on poll_options (poll_id);

create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  option_id uuid not null references poll_options (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id) -- one vote per poll per user
);

create index idx_poll_votes_poll on poll_votes (poll_id);
create index idx_poll_votes_option on poll_votes (option_id);
create index idx_poll_votes_user on poll_votes (user_id);

-- ============================================================
-- Row Level Security — New tables
-- ============================================================

-- Likes: public read (for counts), users manage own
alter table likes enable row level security;

create policy "Likes are publicly readable"
  on likes for select using (true);

create policy "Users can insert own likes"
  on likes for insert with check (user_id = auth.uid());

create policy "Users can delete own likes"
  on likes for delete using (user_id = auth.uid());

-- Issues: public read, admin write
alter table issues enable row level security;

create policy "Issues are publicly readable"
  on issues for select using (true);

create policy "Admins can manage issues"
  on issues for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Politician issues: public read, admin write
alter table politician_issues enable row level security;

create policy "Politician issues are publicly readable"
  on politician_issues for select using (true);

create policy "Admins can manage politician issues"
  on politician_issues for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Committees: public read, admin write
alter table committees enable row level security;

create policy "Committees are publicly readable"
  on committees for select using (true);

create policy "Admins can manage committees"
  on committees for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Politician committees: public read, admin write
alter table politician_committees enable row level security;

create policy "Politician committees are publicly readable"
  on politician_committees for select using (true);

create policy "Admins can manage politician committees"
  on politician_committees for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Polls: public read, admin manage
alter table polls enable row level security;

create policy "Active polls are publicly readable"
  on polls for select using (true);

create policy "Admins can manage polls"
  on polls for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Poll options: public read, admin manage
alter table poll_options enable row level security;

create policy "Poll options are publicly readable"
  on poll_options for select using (true);

create policy "Admins can manage poll options"
  on poll_options for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Poll votes: users manage own, aggregate readable
alter table poll_votes enable row level security;

create policy "Poll votes are publicly readable"
  on poll_votes for select using (true);

create policy "Users can insert own poll votes"
  on poll_votes for insert with check (user_id = auth.uid());

create policy "Users can delete own poll votes"
  on poll_votes for delete using (user_id = auth.uid());

-- Update profiles policy to allow users to update own extended fields
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
