-- ============================================================================
-- COMPLETE DATABASE SCHEMA VERIFICATION SCRIPT
-- ============================================================================
-- Run this in Supabase SQL Editor to see EXACTLY what columns exist
-- This will help identify any mismatches between code and database
-- ============================================================================

-- ============================================================================
-- PART 1: LIST ALL COLUMNS IN ENTRIES TABLE
-- ============================================================================

SELECT 
  column_name AS "Column Name",
  data_type AS "Data Type",
  is_nullable AS "Nullable?",
  column_default AS "Default Value"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'entries'
ORDER BY ordinal_position;

-- ============================================================================
-- EXPECTED OUTPUT (Based on database-schema.sql):
-- ============================================================================
--
-- Column Name         | Data Type | Nullable? | Default Value
-- --------------------|-----------|-----------|------------------
-- id                  | uuid      | NO        | uuid_generate_v4()
-- competition_id      | uuid      | NO        | NULL
-- entry_number        | integer   | NO        | NULL
-- competitor_name     | text      | NO        | NULL  ← NOT "name"!
-- category_id         | uuid      | YES       | NULL
-- age_division_id     | uuid      | YES       | NULL
-- age                 | integer   | YES       | NULL
-- dance_type          | text      | YES       | NULL  ← NOT "division_type"!
-- ability_level       | text      | YES       | NULL
-- is_medal_program    | boolean   | YES       | FALSE
-- medal_points        | integer   | YES       | 0
-- current_medal_level | text      | YES       | 'None'
-- group_members       | jsonb     | YES       | NULL
-- studio_name         | text      | YES       | NULL
-- teacher_name        | text      | YES       | NULL
-- photo_url           | text      | YES       | NULL
-- created_at          | timestamp | YES       | NOW()
-- updated_at          | timestamp | YES       | NOW()
--
-- IMPORTANT: There is NO column named "name"!
-- IMPORTANT: There is NO column named "division_type"!
-- IMPORTANT: There is NO column named "type"!
-- IMPORTANT: There is NO column named "is_group"!
--
-- ============================================================================

-- ============================================================================
-- PART 2: CHECK FOR SPECIFIC COLUMNS THAT CODE MIGHT EXPECT
-- ============================================================================

-- Check if "name" column exists (it shouldn't - use competitor_name instead)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'name'
) AS "Does 'name' column exist?";
-- Expected: FALSE

-- Check if "competitor_name" exists (it should!)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'competitor_name'
) AS "Does 'competitor_name' column exist?";
-- Expected: TRUE

-- Check if "division_type" exists (it shouldn't - use dance_type instead)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'division_type'
) AS "Does 'division_type' column exist?";
-- Expected: FALSE

-- Check if "dance_type" exists (it should!)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'dance_type'
) AS "Does 'dance_type' column exist?";
-- Expected: TRUE

-- Check if "type" exists (it shouldn't)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'type'
) AS "Does 'type' column exist?";
-- Expected: FALSE

-- Check if "is_group" exists (it shouldn't)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'entries' 
    AND column_name = 'is_group'
) AS "Does 'is_group' column exist?";
-- Expected: FALSE

-- ============================================================================
-- PART 3: CHECK MEDAL-RELATED COLUMNS
-- ============================================================================

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'entries'
  AND column_name IN (
    'is_medal_program',
    'medal_points',
    'current_medal_level'
  )
ORDER BY column_name;

-- Expected output:
-- current_medal_level | text    | 'None'
-- is_medal_program    | boolean | false
-- medal_points        | integer | 0

-- ============================================================================
-- PART 4: CHECK GROUP-RELATED COLUMNS
-- ============================================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entries'
  AND column_name IN (
    'group_members',
    'studio_name',
    'teacher_name'
  )
ORDER BY column_name;

-- Expected output:
-- group_members | jsonb
-- studio_name   | text
-- teacher_name  | text

-- If any of these are missing, run the SQL from RUN_THIS_SQL_NOW.sql!

-- ============================================================================
-- PART 5: TEST QUERY WITH CORRECT COLUMN NAMES
-- ============================================================================

-- This query should work if all columns are correct:
SELECT 
  id,
  entry_number,
  competitor_name,    -- ✅ CORRECT: NOT "name"
  dance_type,         -- ✅ CORRECT: NOT "division_type"
  ability_level,
  is_medal_program,
  medal_points,
  current_medal_level,
  group_members,
  studio_name,
  teacher_name
FROM entries
LIMIT 5;

-- If this works, your database is correct!
-- If this fails, note which column name causes the error.

-- ============================================================================
-- PART 6: SAMPLE DATA CHECK
-- ============================================================================

-- Show sample entries with all relevant columns
SELECT 
  entry_number,
  competitor_name,
  dance_type,
  is_medal_program,
  medal_points,
  CASE 
    WHEN group_members IS NOT NULL THEN jsonb_array_length(group_members)
    ELSE 0 
  END AS member_count
FROM entries
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- PART 7: COLUMN COUNT VERIFICATION
-- ============================================================================

SELECT COUNT(*) AS "Total Columns in entries table"
FROM information_schema.columns
WHERE table_name = 'entries';

-- Expected: 18 columns (after adding group_members, studio_name, teacher_name)

-- ============================================================================
-- TROUBLESHOOTING GUIDE
-- ============================================================================
--
-- If you see errors:
--
-- ❌ "column 'name' does not exist"
--    → Use 'competitor_name' instead
--    → We already fixed this in the code
--
-- ❌ "column 'division_type' does not exist"
--    → Use 'dance_type' instead
--    → We already fixed this in the code
--
-- ❌ "column 'group_members' does not exist"
--    → Run the SQL from RUN_THIS_SQL_NOW.sql
--    → This adds the missing columns
--
-- ❌ "column 'type' does not exist"
--    → There is no 'type' column
--    → Use 'dance_type' for division type
--
-- ❌ "column 'is_group' does not exist"
--    → There is no 'is_group' column
--    → Check if group_members is NULL or not
--    → Use: CASE WHEN group_members IS NOT NULL THEN true ELSE false END
--
-- ============================================================================
-- SUMMARY OF CORRECT COLUMN NAMES
-- ============================================================================
--
-- WRONG → CORRECT
-- --------------
-- name             → competitor_name
-- division_type    → dance_type
-- divisionType     → dance_type
-- type             → dance_type
-- is_group         → (check group_members IS NOT NULL)
--
-- These are already fixed in the code (commits 3edad4a, 666ad95)
--
-- ============================================================================
-- NEXT STEP
-- ============================================================================
--
-- After running this script:
-- 1. Check if group_members, studio_name, teacher_name exist
-- 2. If they DON'T exist, run RUN_THIS_SQL_NOW.sql
-- 3. Verify all columns match the expected list above
-- 4. Test the medal points system in the app
-- 5. Test PDF generation
--
-- ============================================================================

