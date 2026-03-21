-- ============================================================
-- Codex Phase 4 — Elections & Races
-- ============================================================

-- Elections (e.g., "2026 Midterm Elections")
create table elections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  election_date date not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Races within an election
create table races (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  name text not null,
  slug text not null unique,
  state text not null,
  chamber chamber_type not null,
  district text,
  description text,
  incumbent_id uuid references politicians(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_races_election on races(election_id);
create index idx_races_state on races(state);
create index idx_races_chamber on races(chamber);

-- Candidates running in a race
create table candidates (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references races(id) on delete cascade,
  politician_id uuid references politicians(id) on delete set null,
  name text not null,
  party party_type not null,
  is_incumbent boolean not null default false,
  status text not null default 'running',
  website_url text,
  image_url text,
  bio text,
  created_at timestamptz not null default now()
);

create index idx_candidates_race on candidates(race_id);
create index idx_candidates_politician on candidates(politician_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Elections: public read, admin write
alter table elections enable row level security;

drop policy if exists "Elections are publicly readable" on elections;
create policy "Elections are publicly readable"
  on elections for select
  using (true);

drop policy if exists "Admins can manage elections" on elections;
create policy "Admins can manage elections"
  on elections for all
  using (public.is_admin());

-- Races: public read, admin write
alter table races enable row level security;

drop policy if exists "Races are publicly readable" on races;
create policy "Races are publicly readable"
  on races for select
  using (true);

drop policy if exists "Admins can manage races" on races;
create policy "Admins can manage races"
  on races for all
  using (public.is_admin());

-- Candidates: public read, admin write
alter table candidates enable row level security;

drop policy if exists "Candidates are publicly readable" on candidates;
create policy "Candidates are publicly readable"
  on candidates for select
  using (true);

drop policy if exists "Admins can manage candidates" on candidates;
create policy "Admins can manage candidates"
  on candidates for all
  using (public.is_admin());
