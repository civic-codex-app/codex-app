-- Election results history for politicians
create type result_type as enum ('won', 'lost', 'runoff');

create table election_results (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians(id) on delete cascade,
  election_year integer not null,
  state text not null,
  chamber chamber_type not null,
  district text,
  race_name text not null,
  party party_type not null,
  result result_type not null,
  vote_percentage numeric(5, 2),
  total_votes integer,
  opponent_name text,
  opponent_party party_type,
  opponent_vote_percentage numeric(5, 2),
  is_special_election boolean not null default false,
  is_runoff boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (politician_id, election_year, chamber, state, is_runoff)
);

create index idx_election_results_politician on election_results(politician_id);
create index idx_election_results_year on election_results(election_year);

alter table election_results enable row level security;

create policy "Election results are publicly readable"
  on election_results for select using (true);
