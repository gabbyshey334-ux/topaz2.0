-- ============================================================================
-- TOPAZ 2.0 - Medal Points System Migration
-- ============================================================================
-- This script adds medal point tracking columns to existing entries table
-- Run this in your Supabase SQL Editor if you already have a database set up
-- ============================================================================

-- Add medal_points column if it doesn't exist
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS medal_points INTEGER DEFAULT 0 
CHECK (medal_points >= 0);

-- Add current_medal_level column if it doesn't exist
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS current_medal_level TEXT DEFAULT 'None' 
CHECK (current_medal_level IN ('None', 'Bronze', 'Silver', 'Gold'));

-- Set default values for existing entries
UPDATE entries 
SET medal_points = 0 
WHERE medal_points IS NULL;

UPDATE entries 
SET current_medal_level = 'None' 
WHERE current_medal_level IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('medal_points', 'current_medal_level');

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Medal point tracking is now available in your entries table
-- - medal_points: Tracks cumulative points across all competitions
-- - current_medal_level: Auto-updates based on point thresholds
--   * 0-24 points: None
--   * 25-34 points: Bronze
--   * 35-49 points: Silver
--   * 50+ points: Gold
-- ============================================================================

