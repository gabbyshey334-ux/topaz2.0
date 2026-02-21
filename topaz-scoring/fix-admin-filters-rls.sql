-- ============================================================================
-- FIX RLS POLICIES FOR admin_filters TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor to fix:
-- "new row violated row-level security policy for table 'admin_filters'"
--
-- CAUSE: App uses anon key; existing policies only allowed authenticated users.
-- FIX: Add policies for anon (and authenticated) to allow all operations.
-- ============================================================================

-- Step 1: Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Allow authenticated users to read admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow authenticated users to manage admin filters" ON admin_filters;

-- Step 2: Create policies that allow anon and authenticated users
-- (App uses anon key by default; authenticated if using Supabase Auth)

-- Allow read (SELECT)
CREATE POLICY "Allow read admin filters"
  ON admin_filters
  FOR SELECT
  USING (true);

-- Allow insert
CREATE POLICY "Allow insert admin filters"
  ON admin_filters
  FOR INSERT
  WITH CHECK (true);

-- Allow update
CREATE POLICY "Allow update admin filters"
  ON admin_filters
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow delete
CREATE POLICY "Allow delete admin filters"
  ON admin_filters
  FOR DELETE
  USING (true);

-- Step 3: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admin_filters';
