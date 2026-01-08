-- ============================================================================
-- TOPAZ 2.0 - Ability Levels Feature Migration
-- ============================================================================
-- This script adds the ability_level column to existing entries table
-- Run this in your Supabase SQL Editor if you already have a database set up
-- ============================================================================

-- Add ability_level column to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS ability_level TEXT 
CHECK (ability_level IN ('Beginning', 'Intermediate', 'Advanced'));

-- Optional: Set default values for existing entries
-- WARNING: Review this before running - this sets all existing entries to 'Beginning'
-- You may want to update these manually based on your existing data
-- UPDATE entries SET ability_level = 'Beginning' WHERE ability_level IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' AND column_name = 'ability_level';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- The ability_level column is now available in your entries table
-- New entries will require this field when created from the UI
-- ============================================================================

