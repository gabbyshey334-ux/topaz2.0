-- ============================================================================
-- TOPAZ 2.0 - Judge Notes Migration
-- ============================================================================
-- This script adds the notes column to the scores table and renames total to total_score
-- Run this in your Supabase SQL Editor if you already have a database set up
-- ============================================================================

-- Add notes column to scores table if it doesn't exist
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename total column to total_score for consistency (if it exists as 'total')
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'scores' 
        AND column_name = 'total'
    ) THEN
        ALTER TABLE scores RENAME COLUMN total TO total_score;
    END IF;
END $$;

-- Verify the columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scores' 
AND column_name IN ('notes', 'total_score')
ORDER BY column_name;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Judge notes are now available for tie-breaking purposes
-- - notes: Optional TEXT field for judge comments (up to 500 chars in UI)
-- - total_score: Renamed from 'total' for consistency across codebase
-- ============================================================================

