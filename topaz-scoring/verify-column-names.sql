-- ============================================================================
-- VERIFY ENTRIES TABLE COLUMNS IN SUPABASE
-- ============================================================================
-- Run this in Supabase SQL Editor to see actual column names
--
-- PURPOSE: Check what columns actually exist vs what the code expects
-- ============================================================================

-- Show ALL columns in the entries table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'entries'
ORDER BY ordinal_position;

-- Expected columns for medal points system:
-- ✅ id (uuid)
-- ✅ competition_id (uuid)
-- ✅ entry_number (integer)
-- ✅ competitor_name (text) ← THIS IS THE NAME COLUMN!
-- ✅ category_id (uuid)
-- ✅ age_division_id (uuid)
-- ✅ age (integer)
-- ✅ dance_type (text)
-- ✅ ability_level (text)
-- ✅ is_medal_program (boolean)
-- ✅ medal_points (integer)
-- ✅ current_medal_level (text)
-- ✅ group_members (jsonb)
-- ✅ studio_name (text)
-- ✅ teacher_name (text)
-- ✅ photo_url (text)
-- ✅ created_at (timestamp)
-- ✅ updated_at (timestamp)

-- ============================================================================
-- TEST QUERY: Does the medal points query work?
-- ============================================================================

-- This is the CORRECTED query that the code now uses:
SELECT 
  id,
  competitor_name,  -- ✅ CORRECT: Not "name"
  dance_type,       -- ✅ CORRECT: Not "divisionType" or "division_type"
  is_medal_program,
  group_members,
  category_id,
  age_division_id,
  ability_level
FROM entries
WHERE is_medal_program = true
LIMIT 5;

-- ============================================================================
-- COMMON COLUMN NAME MISTAKES (Now Fixed)
-- ============================================================================

-- ❌ WRONG: SELECT name FROM entries
-- ✅ CORRECT: SELECT competitor_name FROM entries

-- ❌ WRONG: SELECT divisionType FROM entries  
-- ✅ CORRECT: SELECT dance_type FROM entries

-- ❌ WRONG: SELECT division_type FROM entries
-- ✅ CORRECT: SELECT dance_type FROM entries

-- ============================================================================
-- TEST: Show medal program entries with scores
-- ============================================================================

SELECT 
  e.id,
  e.competitor_name,
  e.dance_type,
  e.is_medal_program,
  e.medal_points,
  e.current_medal_level,
  COUNT(s.id) as score_count,
  AVG(s.total_score) as average_score
FROM entries e
LEFT JOIN scores s ON e.id = s.entry_id
WHERE e.is_medal_program = true
GROUP BY e.id, e.competitor_name, e.dance_type, e.is_medal_program, e.medal_points, e.current_medal_level
ORDER BY average_score DESC NULLS LAST;

-- ============================================================================
-- SUCCESS! 🎉
-- ============================================================================
-- After running these queries, you should see:
-- 1. All column names in the entries table
-- 2. Confirmation that "competitor_name" (not "name") is the correct column
-- 3. Sample medal program entries with their scores
-- ============================================================================

