-- Migration: Separate Dance from Variety Categories
-- Date: 2024
-- Description: Adds `type` field to categories table and supports new category structure

-- Step 1: Add `type` column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'dance' 
CHECK (type IN ('dance', 'variety', 'special'));

-- Step 2: Update existing categories based on name patterns
-- Mark variety categories (if they exist with old naming)
UPDATE categories 
SET type = 'variety' 
WHERE name LIKE '%Variety A%' 
   OR name LIKE '%Variety B%' 
   OR name LIKE '%Variety C%' 
   OR name LIKE '%Variety D%' 
   OR name LIKE '%Variety E%';

-- Mark special categories
UPDATE categories 
SET type = 'special' 
WHERE name = 'Production' 
   OR name = 'Student Choreography' 
   OR name = 'Teacher/Student';

-- Mark dance categories (default, but ensure they're set)
UPDATE categories 
SET type = 'dance' 
WHERE type IS NULL 
   OR (name NOT LIKE '%Variety%' 
       AND name != 'Production' 
       AND name != 'Student Choreography' 
       AND name != 'Teacher/Student');

-- Step 3: Add index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Step 4: Add legacy flag to competitions table (optional, for backward compatibility)
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS legacy_category_structure BOOLEAN DEFAULT FALSE;

-- Step 5: Verify the migration
SELECT 
  type,
  COUNT(*) as category_count,
  array_agg(DISTINCT name ORDER BY name) as sample_names
FROM categories 
GROUP BY type
ORDER BY type;

-- Step 6: Show categories that might need manual review
SELECT 
  id,
  name,
  type,
  description,
  is_special_category
FROM categories 
WHERE type IS NULL 
   OR (name LIKE '%Variety%' AND type != 'variety')
ORDER BY name;

