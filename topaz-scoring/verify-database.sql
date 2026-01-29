-- ============================================
-- TOPAZ 2.0 DATABASE VERIFICATION SCRIPT
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- to verify all required columns exist
-- ============================================

-- STEP 1: Check if studio_name and teacher_name columns exist
-- Expected: 2 rows returned (studio_name and teacher_name)

SELECT 
  '✅ COLUMN CHECK' as status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'entries'
AND column_name IN ('studio_name', 'teacher_name')
ORDER BY column_name;

-- ============================================
-- STEP 2: If above returns 0 rows, RUN THIS MIGRATION:
-- ============================================

-- Uncomment and run if columns don't exist:
-- ALTER TABLE entries
-- ADD COLUMN IF NOT EXISTS studio_name TEXT,
-- ADD COLUMN IF NOT EXISTS teacher_name TEXT;

-- ============================================
-- STEP 3: Verify all important columns in entries table
-- ============================================

SELECT 
  '📋 ENTRIES TABLE STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'entries'
ORDER BY ordinal_position;

-- ============================================
-- STEP 4: Check for recent entries
-- ============================================

SELECT 
  '📊 RECENT ENTRIES' as info,
  entry_number as "#",
  competitor_name as "Name",
  age,
  studio_name as "Studio",
  teacher_name as "Teacher",
  created_at
FROM entries
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- STEP 5: Test if we can insert with studio/teacher fields
-- ============================================

-- This will INSERT and then immediately DELETE a test entry
-- If this fails, studio_name/teacher_name columns don't exist!

DO $$
DECLARE
  test_competition_id UUID;
  test_entry_id UUID;
BEGIN
  -- Get most recent competition
  SELECT id INTO test_competition_id 
  FROM competitions 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF test_competition_id IS NULL THEN
    RAISE NOTICE '⚠️  No competitions found - create one first';
  ELSE
    -- Try to insert test entry
    INSERT INTO entries (
      competition_id,
      entry_number,
      competitor_name,
      age,
      studio_name,
      teacher_name
    ) VALUES (
      test_competition_id,
      99999,
      '🧪 TEST ENTRY - DELETE ME',
      12,
      'Test Studio',
      'Test Teacher'
    )
    RETURNING id INTO test_entry_id;
    
    -- Immediately delete it
    DELETE FROM entries WHERE id = test_entry_id;
    
    RAISE NOTICE '✅ TEST PASSED: studio_name and teacher_name columns work correctly!';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE '❌ TEST FAILED: %', SQLERRM;
    RAISE NOTICE '💡 RUN THE MIGRATION: ALTER TABLE entries ADD COLUMN studio_name TEXT, ADD COLUMN teacher_name TEXT;';
END $$;

-- ============================================
-- STEP 6: Check medal participants tables (if using medal system)
-- ============================================

SELECT 
  '🏅 MEDAL TABLES CHECK' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('medal_participants', 'medal_awards')
ORDER BY table_name;

-- ============================================
-- SUMMARY
-- ============================================
-- Expected results:
-- ✅ COLUMN CHECK: 2 rows (studio_name, teacher_name)
-- ✅ ENTRIES TABLE STRUCTURE: Multiple rows showing all columns
-- ✅ RECENT ENTRIES: Your recent test entries (if any)
-- ✅ TEST PASSED: Insert/delete test successful
-- ✅ MEDAL TABLES CHECK: 2 rows (medal_participants, medal_awards)
--
-- If any step fails, read the error message carefully!
-- Most common: Column doesn't exist → Run the migration
-- ============================================


