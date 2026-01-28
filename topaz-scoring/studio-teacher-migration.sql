-- Add studio_name and teacher_name columns to entries table
-- Run this in your Supabase SQL Editor

ALTER TABLE entries
ADD COLUMN IF NOT EXISTS studio_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_name TEXT;

-- Verification query (optional)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'entries' 
-- AND column_name IN ('studio_name', 'teacher_name');



