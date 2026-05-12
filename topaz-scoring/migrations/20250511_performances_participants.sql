-- TOPAZ: performances (what judges score) + performance_participants (dancers)
-- + link entries.scores to performances. Run in Supabase SQL Editor (order: this file first).
-- After deploy, open the scoring app once per competition so client can backfill links, OR run the backfill script.

-- ============================================================================
-- 1) performances — one row per judge-scored routine
-- ============================================================================
CREATE TABLE IF NOT EXISTS performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  entry_number INTEGER,
  routine_name TEXT,
  competitor_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  age_division_id UUID REFERENCES age_divisions(id) ON DELETE SET NULL,
  age INTEGER,
  ability_level TEXT,
  division_type TEXT,
  dance_type TEXT,
  group_members JSONB,
  photo_url TEXT,
  studio_name TEXT,
  teacher_name TEXT,
  is_medal_program BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performances_competition ON performances(competition_id);
CREATE INDEX IF NOT EXISTS idx_performances_category ON performances(category_id);

-- ============================================================================
-- 2) performance_participants — normalized dancers for a performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_participants_perf ON performance_participants(performance_id);

-- ============================================================================
-- 3) entries → performances (sync rows share one performance_id)
-- ============================================================================
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS performance_id UUID REFERENCES performances(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_entries_performance_id ON entries(performance_id);

-- ============================================================================
-- 4) scores → performances (canonical judge row per performance + judge)
-- ============================================================================
ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS performance_id UUID REFERENCES performances(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scores_performance_id ON scores(performance_id);

-- Optional (run AFTER backfill / dedupe): enforce one row per judge per performance
-- See migrations/20250511_scores_perf_unique_after_backfill.sql

-- ============================================================================
-- 5) RLS (match existing MVP anon policies)
-- ============================================================================
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for anon performances" ON performances;
CREATE POLICY "Enable all for anon performances" ON performances
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated performances" ON performances;
CREATE POLICY "Enable all for authenticated performances" ON performances
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for anon performance_participants" ON performance_participants;
CREATE POLICY "Enable all for anon performance_participants" ON performance_participants
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated performance_participants" ON performance_participants;
CREATE POLICY "Enable all for authenticated performance_participants" ON performance_participants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 6) updated_at trigger for performances
-- ============================================================================
CREATE OR REPLACE FUNCTION update_performances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_performances_updated_at ON performances;
CREATE TRIGGER trg_performances_updated_at
  BEFORE UPDATE ON performances
  FOR EACH ROW
  EXECUTE FUNCTION update_performances_updated_at();

-- Optional: add to realtime publication (uncomment if you use postgres_changes on these tables)
-- ALTER PUBLICATION supabase_realtime ADD TABLE performances;

-- ============================================================================
-- 7) Backfill scores.performance_id from entries (run AFTER entries.performance_id is populated)
--     Re-run this statement after the app has linked performances, or after scripts/backfill-performances.mjs
-- ============================================================================
-- UPDATE scores s
-- SET performance_id = e.performance_id
-- FROM entries e
-- WHERE s.entry_id = e.id
--   AND e.performance_id IS NOT NULL
--   AND s.performance_id IS NULL;
