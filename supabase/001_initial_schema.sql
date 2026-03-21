-- ============================================================
-- Codex Political Directory — Initial Schema
-- ============================================================

-- Enums
create type chamber_type as enum ('senate', 'house', 'governor', 'presidential');
create type party_type as enum ('democrat', 'republican', 'green', 'independent');
create type vote_type as enum ('yea', 'nay', 'abstain', 'not_voting');
create type user_role as enum ('user', 'admin');

-- ============================================================
-- Politicians
-- ============================================================
create table politicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  state text not null,
  chamber chamber_type not null,
  party party_type not null,
  title text not null,
  since_year integer,
  bio text,
  website_url text,
  donate_url text,
  wiki_url text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_politicians_slug on politicians (slug);
create index idx_politicians_chamber on politicians (chamber);
create index idx_politicians_party on politicians (party);
create index idx_politicians_state on politicians (state);

-- Full-text search index
alter table politicians add column fts tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(state, '') || ' ' || coalesce(title, '') || ' ' || coalesce(bio, ''))
  ) stored;
create index idx_politicians_fts on politicians using gin (fts);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger politicians_updated_at
  before update on politicians
  for each row execute function update_updated_at();

-- ============================================================
-- Profiles (linked to auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  email text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Follows
-- ============================================================
create table follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  politician_id uuid not null references politicians (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, politician_id)
);

create index idx_follows_user on follows (user_id);
create index idx_follows_politician on follows (politician_id);

-- ============================================================
-- Bills
-- ============================================================
create table bills (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  summary text,
  status text,
  introduced_date date,
  last_action_date date,
  congress_session text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Voting Records
-- ============================================================
create table voting_records (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians (id) on delete cascade,
  bill_id uuid references bills (id) on delete set null,
  bill_name text,
  bill_number text,
  vote vote_type not null,
  vote_date date,
  session text,
  created_at timestamptz not null default now()
);

create index idx_voting_records_politician on voting_records (politician_id);
create index idx_voting_records_bill on voting_records (bill_id);

-- ============================================================
-- Campaign Finance
-- ============================================================
create table campaign_finance (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians (id) on delete cascade,
  cycle text not null,
  total_raised numeric(15, 2),
  total_spent numeric(15, 2),
  cash_on_hand numeric(15, 2),
  source text,
  last_updated timestamptz,
  created_at timestamptz not null default now()
);

create index idx_campaign_finance_politician on campaign_finance (politician_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Politicians: public read, admin write
alter table politicians enable row level security;

create policy "Politicians are publicly readable"
  on politicians for select
  using (true);

create policy "Admins can insert politicians"
  on politicians for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update politicians"
  on politicians for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete politicians"
  on politicians for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Profiles: users can read own, admins can read all
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Follows: users manage own follows
alter table follows enable row level security;

create policy "Users can read own follows"
  on follows for select
  using (user_id = auth.uid());

create policy "Users can insert own follows"
  on follows for insert
  with check (user_id = auth.uid());

create policy "Users can delete own follows"
  on follows for delete
  using (user_id = auth.uid());

-- Bills: public read, admin write
alter table bills enable row level security;

create policy "Bills are publicly readable"
  on bills for select
  using (true);

create policy "Admins can manage bills"
  on bills for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Voting records: public read, admin write
alter table voting_records enable row level security;

create policy "Voting records are publicly readable"
  on voting_records for select
  using (true);

create policy "Admins can manage voting records"
  on voting_records for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Campaign finance: public read, admin write
alter table campaign_finance enable row level security;

create policy "Campaign finance is publicly readable"
  on campaign_finance for select
  using (true);

create policy "Admins can manage campaign finance"
  on campaign_finance for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
