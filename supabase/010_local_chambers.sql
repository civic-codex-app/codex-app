-- Expand chamber_type enum to include local office types
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'mayor' AFTER 'presidential';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'city_council' AFTER 'mayor';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'state_senate' AFTER 'city_council';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'state_house' AFTER 'state_senate';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'county' AFTER 'state_house';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'school_board' AFTER 'county';
ALTER TYPE chamber_type ADD VALUE IF NOT EXISTS 'other_local' AFTER 'school_board';
