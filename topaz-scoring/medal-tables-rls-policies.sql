-- ============================================================================
-- MEDAL TABLES RLS POLICIES (Row Level Security)
-- Run this AFTER medal-participants-migration-safe.sql
-- ============================================================================

-- Enable RLS on medal tables
ALTER TABLE medal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE medal_awards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all for anon medal_participants" ON medal_participants;
DROP POLICY IF EXISTS "Enable read for anon medal_participants" ON medal_participants;
DROP POLICY IF EXISTS "Enable insert for anon medal_participants" ON medal_participants;
DROP POLICY IF EXISTS "Enable update for anon medal_participants" ON medal_participants;
DROP POLICY IF EXISTS "Enable delete for anon medal_participants" ON medal_participants;

DROP POLICY IF EXISTS "Enable all for anon medal_awards" ON medal_awards;
DROP POLICY IF EXISTS "Enable read for anon medal_awards" ON medal_awards;
DROP POLICY IF EXISTS "Enable insert for anon medal_awards" ON medal_awards;
DROP POLICY IF EXISTS "Enable update for anon medal_awards" ON medal_awards;
DROP POLICY IF EXISTS "Enable delete for anon medal_awards" ON medal_awards;

-- ============================================================================
-- MVP POLICIES: Allow all access for anon (same as other tables)
-- ⚠️ For production, replace with proper authentication-based policies
-- ============================================================================

-- medal_participants policies
CREATE POLICY "Enable all for anon medal_participants" ON medal_participants
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- medal_awards policies
CREATE POLICY "Enable all for anon medal_awards" ON medal_awards
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- Verify policies were created
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('medal_participants', 'medal_awards')
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Medal tables RLS policies created successfully!';
  RAISE NOTICE '🔓 Current setup: Full access for anon role (MVP mode)';
  RAISE NOTICE '⚠️  For production: Implement proper authentication-based policies';
END $$;


