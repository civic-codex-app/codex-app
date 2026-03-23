-- 018_analytics.sql
-- Comprehensive analytics event tracking for admin dashboard
-- Tracks both authenticated and anonymous users

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_path text,
  referrer text,
  user_agent text,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast admin queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_event_created ON analytics_events(event_name, created_at DESC);

-- The existing idx_analytics_created + idx_analytics_event_created indexes
-- handle date-range queries efficiently without needing expression indexes.

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (including anonymous users via API)
CREATE POLICY "analytics_insert_policy" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "analytics_admin_read_policy" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Aggregation functions for admin dashboard

-- Top events by count in a date range
CREATE OR REPLACE FUNCTION get_analytics_top_events(
  since_date timestamptz,
  max_results int DEFAULT 20
)
RETURNS TABLE(event_name text, event_count bigint) AS $$
  SELECT event_name, count(*) as event_count
  FROM analytics_events
  WHERE created_at >= since_date
  GROUP BY event_name
  ORDER BY event_count DESC
  LIMIT max_results;
$$ LANGUAGE sql SECURITY DEFINER;

-- Daily active users (unique user_ids + unique session_ids for anonymous)
CREATE OR REPLACE FUNCTION get_analytics_daily_users(
  since_date timestamptz
)
RETURNS TABLE(day date, authenticated_users bigint, anonymous_sessions bigint, total_events bigint) AS $$
  SELECT
    created_at::date as day,
    count(DISTINCT user_id) as authenticated_users,
    count(DISTINCT CASE WHEN user_id IS NULL THEN session_id END) as anonymous_sessions,
    count(*) as total_events
  FROM analytics_events
  WHERE created_at >= since_date
  GROUP BY day
  ORDER BY day;
$$ LANGUAGE sql SECURITY DEFINER;

-- Top pages viewed
CREATE OR REPLACE FUNCTION get_analytics_top_pages(
  since_date timestamptz,
  max_results int DEFAULT 20
)
RETURNS TABLE(page_path text, view_count bigint, unique_users bigint) AS $$
  SELECT
    page_path,
    count(*) as view_count,
    count(DISTINCT COALESCE(user_id::text, session_id)) as unique_users
  FROM analytics_events
  WHERE event_name = 'page_view'
    AND created_at >= since_date
    AND page_path IS NOT NULL
  GROUP BY page_path
  ORDER BY view_count DESC
  LIMIT max_results;
$$ LANGUAGE sql SECURITY DEFINER;

-- Top politicians viewed
CREATE OR REPLACE FUNCTION get_analytics_top_politicians(
  since_date timestamptz,
  max_results int DEFAULT 20
)
RETURNS TABLE(slug text, party text, view_count bigint, unique_viewers bigint) AS $$
  SELECT
    event_data->>'slug' as slug,
    event_data->>'party' as party,
    count(*) as view_count,
    count(DISTINCT COALESCE(user_id::text, session_id)) as unique_viewers
  FROM analytics_events
  WHERE event_name = 'politician_viewed'
    AND created_at >= since_date
  GROUP BY slug, party
  ORDER BY view_count DESC
  LIMIT max_results;
$$ LANGUAGE sql SECURITY DEFINER;

-- Top search queries
CREATE OR REPLACE FUNCTION get_analytics_top_searches(
  since_date timestamptz,
  max_results int DEFAULT 20
)
RETURNS TABLE(query text, search_count bigint, avg_results numeric) AS $$
  SELECT
    event_data->>'query' as query,
    count(*) as search_count,
    round(avg((event_data->>'resultCount')::numeric), 1) as avg_results
  FROM analytics_events
  WHERE event_name = 'search_performed'
    AND created_at >= since_date
  GROUP BY query
  ORDER BY search_count DESC
  LIMIT max_results;
$$ LANGUAGE sql SECURITY DEFINER;

-- Quiz funnel stats
CREATE OR REPLACE FUNCTION get_analytics_quiz_funnel(
  since_date timestamptz
)
RETURNS TABLE(stage text, user_count bigint) AS $$
  WITH stages AS (
    SELECT 'started' as stage, count(DISTINCT COALESCE(user_id::text, session_id)) as user_count
    FROM analytics_events
    WHERE event_name = 'quiz_started' AND created_at >= since_date
    UNION ALL
    SELECT 'completed' as stage, count(DISTINCT COALESCE(user_id::text, session_id)) as user_count
    FROM analytics_events
    WHERE event_name = 'quiz_completed' AND created_at >= since_date
    UNION ALL
    SELECT 'result_viewed' as stage, count(DISTINCT COALESCE(user_id::text, session_id)) as user_count
    FROM analytics_events
    WHERE event_name = 'quiz_result_viewed' AND created_at >= since_date
    UNION ALL
    SELECT 'signup_after_quiz' as stage, count(DISTINCT COALESCE(user_id::text, session_id)) as user_count
    FROM analytics_events
    WHERE event_name = 'quiz_cta_signup_clicked' AND created_at >= since_date
  )
  SELECT stage, user_count FROM stages
  ORDER BY
    CASE stage
      WHEN 'started' THEN 1
      WHEN 'completed' THEN 2
      WHEN 'result_viewed' THEN 3
      WHEN 'signup_after_quiz' THEN 4
    END;
$$ LANGUAGE sql SECURITY DEFINER;

-- Hourly activity pattern (for heatmap)
CREATE OR REPLACE FUNCTION get_analytics_hourly_pattern(
  since_date timestamptz
)
RETURNS TABLE(hour_of_day int, day_of_week int, event_count bigint) AS $$
  SELECT
    extract(hour from created_at)::int as hour_of_day,
    extract(dow from created_at)::int as day_of_week,
    count(*) as event_count
  FROM analytics_events
  WHERE created_at >= since_date
  GROUP BY hour_of_day, day_of_week
  ORDER BY day_of_week, hour_of_day;
$$ LANGUAGE sql SECURITY DEFINER;

-- Recent activity feed for admin
CREATE OR REPLACE FUNCTION get_analytics_recent_activity(
  max_results int DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  event_name text,
  event_data jsonb,
  user_id uuid,
  session_id text,
  page_path text,
  created_at timestamptz
) AS $$
  SELECT id, event_name, event_data, user_id, session_id, page_path, created_at
  FROM analytics_events
  ORDER BY created_at DESC
  LIMIT max_results;
$$ LANGUAGE sql SECURITY DEFINER;
