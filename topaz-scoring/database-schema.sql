-- TOPAZ 2.0 Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- ============================================================================
-- TABLES
-- ============================================================================

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  venue TEXT,
  judges_count INTEGER DEFAULT 3 CHECK (judges_count >= 1 AND judges_count <= 10),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Age divisions table
CREATE TABLE IF NOT EXISTS age_divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_age INTEGER CHECK (min_age >= 0),
  max_age INTEGER CHECK (max_age >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT age_range_valid CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age)
);

-- Entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  entry_number INTEGER NOT NULL,
  competitor_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  age_division_id UUID REFERENCES age_divisions(id) ON DELETE SET NULL,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  dance_type TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, entry_number)
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  judge_number INTEGER NOT NULL CHECK (judge_number >= 1 AND judge_number <= 10),
  technique DECIMAL(5,2) NOT NULL CHECK (technique >= 0 AND technique <= 25),
  creativity DECIMAL(5,2) NOT NULL CHECK (creativity >= 0 AND creativity <= 25),
  presentation DECIMAL(5,2) NOT NULL CHECK (presentation >= 0 AND presentation <= 25),
  appearance DECIMAL(5,2) NOT NULL CHECK (appearance >= 0 AND appearance <= 25),
  total DECIMAL(6,2) NOT NULL CHECK (total >= 0 AND total <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, judge_number)
);

-- Medal standings table
CREATE TABLE IF NOT EXISTS medal_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank > 0),
  average_score DECIMAL(6,2) NOT NULL CHECK (average_score >= 0 AND average_score <= 100),
  medal_type TEXT CHECK (medal_type IN ('gold', 'silver', 'bronze', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, entry_id)
);

-- ============================================================================
-- INDEXES (for better query performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_categories_competition ON categories(competition_id);
CREATE INDEX IF NOT EXISTS idx_age_divisions_competition ON age_divisions(competition_id);
CREATE INDEX IF NOT EXISTS idx_entries_competition ON entries(competition_id);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category_id);
CREATE INDEX IF NOT EXISTS idx_entries_age_division ON entries(age_division_id);
CREATE INDEX IF NOT EXISTS idx_scores_competition ON scores(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_entry ON scores(entry_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_number);
CREATE INDEX IF NOT EXISTS idx_medal_standings_competition ON medal_standings(competition_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE medal_standings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (MVP - Allow all for anon key)
-- Note: Adjust these for production!
-- ============================================================================

-- Competitions policies
DROP POLICY IF EXISTS "Enable all for anon competitions" ON competitions;
CREATE POLICY "Enable all for anon competitions" ON competitions 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Categories policies
DROP POLICY IF EXISTS "Enable all for anon categories" ON categories;
CREATE POLICY "Enable all for anon categories" ON categories 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Age divisions policies
DROP POLICY IF EXISTS "Enable all for anon age_divisions" ON age_divisions;
CREATE POLICY "Enable all for anon age_divisions" ON age_divisions 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Entries policies
DROP POLICY IF EXISTS "Enable all for anon entries" ON entries;
CREATE POLICY "Enable all for anon entries" ON entries 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Scores policies
DROP POLICY IF EXISTS "Enable all for anon scores" ON scores;
CREATE POLICY "Enable all for anon scores" ON scores 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Medal standings policies
DROP POLICY IF EXISTS "Enable all for anon medal_standings" ON medal_standings;
CREATE POLICY "Enable all for anon medal_standings" ON medal_standings 
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_competitions_updated_at ON competitions;
CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;
CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medal_standings_updated_at ON medal_standings;
CREATE TRIGGER update_medal_standings_updated_at
    BEFORE UPDATE ON medal_standings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME (Enable subscriptions for live updates)
-- ============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;
ALTER PUBLICATION supabase_realtime ADD TABLE entries;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE medal_standings;

-- ============================================================================
-- STORAGE (for entry photos)
-- ============================================================================

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-photos', 'entry-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for entry-photos bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'entry-photos');

DROP POLICY IF EXISTS "Enable insert for anon" ON storage.objects;
CREATE POLICY "Enable insert for anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'entry-photos');

DROP POLICY IF EXISTS "Enable delete for anon" ON storage.objects;
CREATE POLICY "Enable delete for anon"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'entry-photos');

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data

-- INSERT INTO competitions (name, date, venue, judges_count) 
-- VALUES ('TOPAZ Spring Championship 2025', '2025-03-15', 'Grand Theater', 5);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify tables were created:

-- Check all tables
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Check RLS status
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';

-- ============================================================================
-- SUCCESS! 🎉
-- ============================================================================

-- Your TOPAZ 2.0 database is ready!
-- Test the connection in your app by clicking the "🔌 Test DB" button.

