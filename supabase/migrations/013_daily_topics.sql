-- Daily news topics for homepage "Hot Topics" section
-- Populated via GNews API + admin curation

CREATE TABLE IF NOT EXISTS daily_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  source_url text,
  source_name text,
  image_url text,
  issue_id uuid REFERENCES issues(id) ON DELETE SET NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Junction table: which politicians are relevant to a topic
CREATE TABLE IF NOT EXISTS daily_topic_politicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES daily_topics(id) ON DELETE CASCADE,
  politician_id uuid NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  context text, -- brief note on what they said/did
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(topic_id, politician_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_topics_active ON daily_topics(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_topics_pinned ON daily_topics(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_daily_topic_politicians_topic ON daily_topic_politicians(topic_id);
CREATE INDEX IF NOT EXISTS idx_daily_topic_politicians_politician ON daily_topic_politicians(politician_id);

-- RLS: public read, service role write
ALTER TABLE daily_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_topic_politicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active topics" ON daily_topics
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read topic politicians" ON daily_topic_politicians
  FOR SELECT USING (true);

CREATE POLICY "Service role full access topics" ON daily_topics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access topic politicians" ON daily_topic_politicians
  FOR ALL USING (true) WITH CHECK (true);
