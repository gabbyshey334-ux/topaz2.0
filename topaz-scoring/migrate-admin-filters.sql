-- ============================================================================
-- CREATE ADMIN FILTERS TABLE
-- ============================================================================
-- This table stores centralized filter settings that control what all judges see

CREATE TABLE IF NOT EXISTS admin_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  category_filter UUID REFERENCES categories(id) ON DELETE SET NULL,
  division_type_filter TEXT,
  age_division_filter UUID REFERENCES age_divisions(id) ON DELETE SET NULL,
  ability_filter TEXT CHECK (ability_filter IN ('Beginning', 'Intermediate', 'Advanced', 'all') OR ability_filter IS NULL),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT, -- Optional: track who made the change
  UNIQUE(competition_id) -- One filter set per competition
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_filters_competition_id ON admin_filters(competition_id);

-- Enable Row Level Security
ALTER TABLE admin_filters ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anon and authenticated (app uses anon key by default)
-- DROP existing if re-running
DROP POLICY IF EXISTS "Allow authenticated users to read admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow authenticated users to manage admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow read admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow insert admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow update admin filters" ON admin_filters;
DROP POLICY IF EXISTS "Allow delete admin filters" ON admin_filters;

CREATE POLICY "Allow read admin filters" ON admin_filters FOR SELECT USING (true);
CREATE POLICY "Allow insert admin filters" ON admin_filters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update admin filters" ON admin_filters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete admin filters" ON admin_filters FOR DELETE USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_filters'
ORDER BY ordinal_position;

