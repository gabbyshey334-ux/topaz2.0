-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MEDAL SYSTEM
-- Run this to secure the medal_participants and medal_awards tables
-- ============================================================================

-- Enable Row Level Security on both tables
ALTER TABLE medal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE medal_awards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MEDAL_PARTICIPANTS POLICIES
-- ============================================================================

-- Policy 1: Everyone can view medal participants (public leaderboard)
CREATE POLICY "Anyone can view medal participants"
ON medal_participants
FOR SELECT
TO public
USING (true);

-- Policy 2: Only authenticated users can insert new participants (system creates them)
CREATE POLICY "Authenticated users can create participants"
ON medal_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Only authenticated users can update participant points
CREATE POLICY "Authenticated users can update participants"
ON medal_participants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- MEDAL_AWARDS POLICIES
-- ============================================================================

-- Policy 4: Everyone can view medal awards (transparency)
CREATE POLICY "Anyone can view medal awards"
ON medal_awards
FOR SELECT
TO public
USING (true);

-- Policy 5: Only authenticated users can create awards (when awarding points)
CREATE POLICY "Authenticated users can create awards"
ON medal_awards
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 6: Only authenticated users can view all awards for management
CREATE POLICY "Authenticated users can manage awards"
ON medal_awards
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 7: Allow authenticated users to delete awards (if needed to fix mistakes)
CREATE POLICY "Authenticated users can delete awards"
ON medal_awards
FOR DELETE
TO authenticated
USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies created successfully!';
  RAISE NOTICE '🔒 medal_participants: 3 policies (SELECT public, INSERT/UPDATE authenticated)';
  RAISE NOTICE '🔒 medal_awards: 4 policies (SELECT public, INSERT/UPDATE/DELETE authenticated)';
  RAISE NOTICE '🎯 Tables are now secure!';
END $$;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('medal_participants', 'medal_awards')
  AND schemaname = 'public';




