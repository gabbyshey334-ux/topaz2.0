-- Add is_test column to competitions table (optional)
-- Run in Supabase SQL Editor to mark competitions as test/practice

ALTER TABLE competitions
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN competitions.is_test IS 'Mark as test/practice competition for easy identification when cleaning up';
