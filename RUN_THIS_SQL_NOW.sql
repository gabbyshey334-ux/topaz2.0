-- ============================================================================
-- 🚨 URGENT: RUN THIS SQL IN SUPABASE NOW
-- ============================================================================
-- This fixes the "Column entries don't exist" error
-- 
-- STEPS:
-- 1. Open Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your TOPAZ project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New query"
-- 5. Copy ALL of this file
-- 6. Paste into the SQL Editor
-- 7. Click "Run" button (or press Cmd+Enter / Ctrl+Enter)
-- 8. Wait for "Success. No rows returned." message
-- 9. ✅ DONE! Your app will work now.
--
-- TIME: 2 minutes
-- PRIORITY: CRITICAL
-- ============================================================================

-- Add the 3 missing columns to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT NULL;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT NULL;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_group_members 
ON entries USING GIN (group_members);

-- ============================================================================
-- VERIFICATION (Run this after the above completes)
-- ============================================================================

-- This should return 3 rows showing the new columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name')
ORDER BY column_name;

-- Expected output:
-- group_members | jsonb | YES | NULL
-- studio_name   | text  | YES | NULL
-- teacher_name  | text  | YES | NULL

-- ============================================================================
-- TEST (Optional - see if it's working)
-- ============================================================================

-- Check all entries table columns (should now include the 3 new ones)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entries'
ORDER BY ordinal_position;

-- ============================================================================
-- ✅ SUCCESS! 
-- ============================================================================
-- After running this:
-- 1. Close Supabase
-- 2. Go to your TOPAZ app
-- 3. Try adding a competition entry
-- 4. Should work without errors! 🎉
--
-- If you still get errors, check:
-- - URGENT_COLUMN_FIX.md for troubleshooting
-- - Make sure you're in the correct Supabase project
-- - Verify the SQL completed with "Success" message
-- ============================================================================


