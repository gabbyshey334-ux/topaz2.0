-- Add judge_names column to competitions table
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS judge_names JSONB DEFAULT '[]'::jsonb;

-- Update existing competitions to have an empty array if null
UPDATE competitions SET judge_names = '[]'::jsonb WHERE judge_names IS NULL;
