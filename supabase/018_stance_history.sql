-- 018_stance_history.sql
-- Track how politician stances change over time (flip-flop timeline)

CREATE TABLE IF NOT EXISTS stance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  stance stance_type NOT NULL,
  source_url text,
  source_description text,
  effective_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stance_history_politician ON stance_history(politician_id);
CREATE INDEX IF NOT EXISTS idx_stance_history_issue ON stance_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_stance_history_date ON stance_history(politician_id, issue_id, effective_date);

ALTER TABLE stance_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Stance history is publicly readable' AND tablename = 'stance_history') THEN
    CREATE POLICY "Stance history is publicly readable" ON stance_history FOR SELECT USING (true);
  END IF;
END $$;

-- Trigger: auto-log stance changes when politician_issues is updated
CREATE OR REPLACE FUNCTION log_stance_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.stance IS DISTINCT FROM NEW.stance THEN
    INSERT INTO stance_history(politician_id, issue_id, stance, effective_date)
    VALUES (OLD.politician_id, OLD.issue_id, OLD.stance, COALESCE(OLD.updated_at::date, now()::date));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stance_change_log ON politician_issues;
CREATE TRIGGER stance_change_log
  BEFORE UPDATE ON politician_issues
  FOR EACH ROW EXECUTE FUNCTION log_stance_change();

COMMENT ON TABLE stance_history IS 'Historical record of politician stance changes for flip-flop timeline';
