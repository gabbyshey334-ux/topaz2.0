-- ============================================================================
-- MIGRATION: Add is_special_category field to categories table
-- Purpose: Mark special categories (Production, Student Choreography, Teacher/Student)
--          that are not eligible for high scoring awards
-- Date: January 2026
-- ============================================================================

-- Step 1: Add is_special_category column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_special_category BOOLEAN DEFAULT false;

-- Step 2: Update existing special categories
UPDATE categories
SET is_special_category = true
WHERE name IN ('Production', 'Student Choreography', 'Teacher/Student')
   OR name LIKE '%Production%'
   OR name LIKE '%Student Choreography%'
   OR name LIKE '%Teacher/Student%';

-- Step 3: Verify the update
SELECT 
  id,
  name,
  is_special_category,
  created_at
FROM categories
WHERE is_special_category = true
ORDER BY name;

-- Expected output: All Production, Student Choreography, and Teacher/Student categories

COMMENT ON COLUMN categories.is_special_category IS 
'Indicates if this is a special category (Production, Student Choreography, Teacher/Student) that receives participation recognition only and is not eligible for high scoring awards';

