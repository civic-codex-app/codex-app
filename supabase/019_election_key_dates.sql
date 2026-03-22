-- 019_election_key_dates.sql
-- State-specific key dates for elections (registration deadlines, early voting, etc.)

CREATE TABLE IF NOT EXISTS election_key_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  state text, -- NULL = all states
  date_type text NOT NULL, -- 'registration_deadline', 'early_voting_start', 'early_voting_end', 'absentee_request_deadline', 'election_day'
  event_date date NOT NULL,
  description text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_election_dates_election ON election_key_dates(election_id);
CREATE INDEX IF NOT EXISTS idx_election_dates_state ON election_key_dates(state);

ALTER TABLE election_key_dates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Election dates are publicly readable' AND tablename = 'election_key_dates') THEN
    CREATE POLICY "Election dates are publicly readable" ON election_key_dates FOR SELECT USING (true);
  END IF;
END $$;

COMMENT ON TABLE election_key_dates IS 'State-specific key dates for elections (registration, early voting, etc.)';
