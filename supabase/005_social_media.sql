-- ============================================================
-- Codex Phase 5 — Social Media Links for Politicians
-- ============================================================

alter table politicians add column if not exists twitter_url text;
alter table politicians add column if not exists facebook_url text;
alter table politicians add column if not exists instagram_url text;
alter table politicians add column if not exists youtube_url text;
alter table politicians add column if not exists threads_url text;
alter table politicians add column if not exists tiktok_url text;
alter table politicians add column if not exists linkedin_url text;
