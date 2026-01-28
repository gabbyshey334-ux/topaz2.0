-- ============================================================================
-- INDIVIDUAL MEDAL PARTICIPANTS SYSTEM
-- Complete rebuild: Track medal points per participant (not per entry)
-- ============================================================================

-- Table 1: medal_participants
-- Stores individual participants and their total points across all competitions
CREATE TABLE IF NOT EXISTS medal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_medal_level TEXT DEFAULT 'None',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: medal_awards
-- Tracks individual point awards (one record per participant per entry)
CREATE TABLE IF NOT EXISTS medal_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 1,
  awarded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_participant_name ON medal_participants(participant_name);
CREATE INDEX IF NOT EXISTS idx_medal_awards_competition ON medal_awards(competition_id);
CREATE INDEX IF NOT EXISTS idx_medal_awards_entry ON medal_awards(entry_id);
CREATE INDEX IF NOT EXISTS idx_medal_awards_participant ON medal_awards(participant_name);
CREATE INDEX IF NOT EXISTS idx_medal_participants_points ON medal_participants(total_points DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medal_participant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on medal_participants
CREATE TRIGGER trigger_update_medal_participant_timestamp
BEFORE UPDATE ON medal_participants
FOR EACH ROW
EXECUTE FUNCTION update_medal_participant_timestamp();

-- Comments for documentation
COMMENT ON TABLE medal_participants IS 'Individual participants earning medal points across all competitions';
COMMENT ON TABLE medal_awards IS 'Individual point awards - one record per participant per first-place entry';
COMMENT ON COLUMN medal_participants.participant_name IS 'Unique participant name (exact match from entries and group members)';
COMMENT ON COLUMN medal_participants.total_points IS 'Total points earned across all competitions (1 point per 1st place)';
COMMENT ON COLUMN medal_participants.current_medal_level IS 'Current medal level: None, Bronze (25+), Silver (35+), Gold (50+)';
COMMENT ON COLUMN medal_awards.points_awarded IS 'Points awarded for this specific entry (typically 1)';

-- Sample query to verify
-- SELECT * FROM medal_participants ORDER BY total_points DESC LIMIT 20;



