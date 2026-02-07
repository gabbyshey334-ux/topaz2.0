-- ============================================================================
-- ADD MISSING COLUMNS TO ENTRIES TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the "Column doesn't exist" error

-- Add group_members column (JSONB array for group member details)
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT NULL;

-- Add studio_name column
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT NULL;

-- Add teacher_name column
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT NULL;

-- Create index on group_members for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_group_members ON entries USING GIN (group_members);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name')
ORDER BY column_name;

-- ============================================================================
-- SUCCESS! 🎉
-- ============================================================================
-- The entries table now has all required columns:
-- - group_members (JSONB) - stores array of {name, age} for group entries
-- - studio_name (TEXT) - stores the dance studio name
-- - teacher_name (TEXT) - stores the teacher/choreographer name


