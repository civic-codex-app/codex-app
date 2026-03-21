-- ============================================================
-- Codex Seed Data — Core Policy Issues
-- Idempotent: safe to run multiple times
-- ============================================================

insert into issues (name, slug, description, category, icon) values

('Economy & Jobs', 'economy-and-jobs',
 'Policies related to economic growth, employment, wages, trade, taxation, and the federal budget.',
 'economy', 'briefcase'),

('Healthcare & Medicare', 'healthcare-and-medicare',
 'Legislation and policy positions on healthcare access, insurance coverage, prescription drug costs, and the Medicare program.',
 'healthcare', 'heart-pulse'),

('Immigration & Border Security', 'immigration-and-border-security',
 'Policies addressing legal and illegal immigration, border enforcement, asylum processes, and pathways to citizenship.',
 'immigration', 'globe'),

('Education & Student Debt', 'education-and-student-debt',
 'Policies on public education funding, higher education access, student loan relief, and workforce training programs.',
 'education', 'graduation-cap'),

('National Defense & Military', 'national-defense-and-military',
 'Positions on military spending, veterans affairs, defense strategy, and national security readiness.',
 'defense', 'shield'),

('Climate & Environment', 'climate-and-environment',
 'Policy positions on climate change mitigation, environmental protection, clean energy investment, and emissions regulation.',
 'environment', 'leaf'),

('Criminal Justice Reform', 'criminal-justice-reform',
 'Legislation addressing sentencing reform, policing practices, prison conditions, and rehabilitation programs.',
 'justice', 'scale'),

('Foreign Policy & Diplomacy', 'foreign-policy-and-diplomacy',
 'Positions on international relations, alliances, treaties, foreign aid, and diplomatic engagement with other nations.',
 'foreign_policy', 'landmark'),

('Technology & AI Regulation', 'technology-and-ai-regulation',
 'Policies on artificial intelligence oversight, data privacy, social media regulation, and technology sector governance.',
 'technology', 'cpu'),

('Social Security & Medicare', 'social-security-and-medicare',
 'Positions on preserving and reforming Social Security benefits, Medicare funding, and retirement security programs.',
 'social', 'users'),

('Gun Policy & 2nd Amendment', 'gun-policy-and-2nd-amendment',
 'Legislation and positions on firearm regulations, background checks, gun violence prevention, and Second Amendment rights.',
 'gun_policy', 'target'),

('Infrastructure & Transportation', 'infrastructure-and-transportation',
 'Policies on roads, bridges, public transit, broadband expansion, and modernization of national infrastructure.',
 'infrastructure', 'hard-hat'),

('Housing & Affordability', 'housing-and-affordability',
 'Positions on housing supply, rent costs, homelessness, zoning reform, and first-time homebuyer assistance.',
 'housing', 'home'),

('Energy Policy & Oil/Gas', 'energy-policy-and-oil-gas',
 'Policies on domestic energy production, fossil fuel regulation, renewable energy development, and energy independence.',
 'energy', 'zap')

on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  category    = excluded.category,
  icon        = excluded.icon,
  updated_at  = now();
