-- 020_site_settings.sql
-- Key-value store for site-wide settings (SEO, branding, etc.)

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Site settings are publicly readable' AND tablename = 'site_settings') THEN
    CREATE POLICY "Site settings are publicly readable" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;

-- Seed defaults
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Poli'),
  ('site_tagline', 'Political Directory'),
  ('site_description', 'Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.'),
  ('og_title', 'Poli — Political Directory'),
  ('og_description', 'Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.'),
  ('homepage_title', 'U.S. Politician Directory & Civic Engagement Platform'),
  ('homepage_description', 'Track U.S. politicians, their stances on issues, voting records, campaign finance, and elections. A transparent, data-driven civic engagement platform for voters.')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE site_settings IS 'Key-value store for site-wide settings (name, SEO, branding)';
