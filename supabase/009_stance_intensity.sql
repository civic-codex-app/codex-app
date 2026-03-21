-- Expand stance_type enum to include intensity levels
-- 7-point scale: strongly_supports → strongly_opposes
ALTER TYPE stance_type ADD VALUE IF NOT EXISTS 'strongly_supports' BEFORE 'supports';
ALTER TYPE stance_type ADD VALUE IF NOT EXISTS 'leans_support' AFTER 'supports';
ALTER TYPE stance_type ADD VALUE IF NOT EXISTS 'neutral' AFTER 'leans_support';
ALTER TYPE stance_type ADD VALUE IF NOT EXISTS 'leans_oppose' AFTER 'neutral';
ALTER TYPE stance_type ADD VALUE IF NOT EXISTS 'strongly_opposes' AFTER 'opposes';

-- Final order: strongly_supports, supports, leans_support, neutral, mixed, leans_oppose, opposes, strongly_opposes, unknown
