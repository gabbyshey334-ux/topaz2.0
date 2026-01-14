-- Add is_medal_program column to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS is_medal_program BOOLEAN DEFAULT FALSE;

-- Ensure other medal columns exist (they should, but just in case)
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS medal_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_medal_level TEXT DEFAULT 'None';

-- Update existing entries if they were already marked in dance_type
UPDATE entries 
SET is_medal_program = TRUE 
WHERE dance_type LIKE '%Medal: true%';
