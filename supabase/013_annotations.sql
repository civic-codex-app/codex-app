-- 013_annotations.sql
-- Community annotations: corrections, sources, and context for politician stances

-- Annotation type enum
DO $$ BEGIN
  CREATE TYPE annotation_type AS ENUM ('correction', 'source', 'context');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Annotation status enum
DO $$ BEGIN
  CREATE TYPE annotation_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  politician_id uuid REFERENCES politicians(id) ON DELETE CASCADE NOT NULL,
  issue_id uuid REFERENCES issues(id) ON DELETE SET NULL,
  annotation_type annotation_type NOT NULL DEFAULT 'context',
  content text NOT NULL,
  source_url text,
  status annotation_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved annotations
CREATE POLICY "Anyone can read approved annotations"
  ON annotations FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert their own annotations
CREATE POLICY "Users can insert own annotations"
  ON annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own annotations regardless of status
CREATE POLICY "Users can read own annotations"
  ON annotations FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can read all annotations (via service role, bypasses RLS)
-- Admin can update annotations (via service role, bypasses RLS)

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_annotations_politician_status
  ON annotations (politician_id, status);

CREATE INDEX IF NOT EXISTS idx_annotations_user
  ON annotations (user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_annotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS annotations_updated_at ON annotations;
CREATE TRIGGER annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_annotations_updated_at();
