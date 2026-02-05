-- ============================================================================
-- MEDAL POINTS SYSTEM VERIFICATION & DEBUG QUERIES
-- Run these in Supabase SQL Editor to debug medal points issues
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLE STRUCTURE VERIFICATION
-- ============================================================================

-- Check if medal tables exist
SELECT 
  'Table Exists: medal_participants' as status,
  COUNT(*) as record_count
FROM medal_participants
UNION ALL
SELECT 
  'Table Exists: medal_awards' as status,
  COUNT(*) as record_count
FROM medal_awards;

-- Check entries table has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'entries'
  AND column_name IN ('is_medal_program', 'group_members', 'medal_points', 'current_medal_level')
ORDER BY column_name;

-- ============================================================================
-- SECTION 2: CURRENT DATA OVERVIEW
-- ============================================================================

-- Show all medal participants (season standings)
SELECT 
  participant_name,
  total_points,
  current_medal_level,
  created_at,
  updated_at
FROM medal_participants
ORDER BY total_points DESC, participant_name;

-- Show recent medal awards
SELECT 
  ma.participant_name,
  ma.points_awarded,
  ma.awarded_at,
  c.name as competition_name,
  c.date as competition_date,
  e.competitor_name as entry_name
FROM medal_awards ma
JOIN competitions c ON ma.competition_id = c.id
JOIN entries e ON ma.entry_id = e.id
ORDER BY ma.awarded_at DESC
LIMIT 50;

-- ============================================================================
-- SECTION 3: MEDAL PROGRAM ENTRIES ANALYSIS
-- ============================================================================

-- Count medal program entries per competition
SELECT 
  c.name as competition_name,
  c.date,
  COUNT(*) as medal_program_entries,
  SUM(CASE WHEN e.group_members IS NOT NULL THEN 1 ELSE 0 END) as group_entries,
  SUM(CASE WHEN e.group_members IS NULL THEN 1 ELSE 0 END) as solo_entries
FROM competitions c
JOIN entries e ON e.competition_id = c.id
WHERE e.is_medal_program = true
GROUP BY c.id, c.name, c.date
ORDER BY c.date DESC;

-- Show medal program entries with scores
SELECT 
  e.id as entry_id,
  e.competitor_name,
  e.dance_type,
  e.ability_level,
  e.is_medal_program,
  CASE 
    WHEN e.group_members IS NOT NULL THEN jsonb_array_length(e.group_members)
    ELSE 0 
  END as member_count,
  COUNT(s.id) as judge_scores,
  ROUND(AVG(s.total_score)::numeric, 2) as average_score
FROM entries e
LEFT JOIN scores s ON s.entry_id = e.id
WHERE e.is_medal_program = true
  AND e.competition_id = (
    SELECT id FROM competitions 
    WHERE status = 'active' 
    ORDER BY date DESC 
    LIMIT 1
  )
GROUP BY e.id, e.competitor_name, e.dance_type, e.ability_level, e.is_medal_program, e.group_members
ORDER BY average_score DESC NULLS LAST;

-- ============================================================================
-- SECTION 4: 1ST PLACE WINNERS IDENTIFICATION
-- ============================================================================

-- Find 1st place winners in latest competition (WHO SHOULD GET POINTS)
WITH latest_competition AS (
  SELECT id, name FROM competitions 
  WHERE status = 'active' 
  ORDER BY date DESC 
  LIMIT 1
),
entry_scores AS (
  SELECT 
    e.id,
    e.competitor_name,
    e.category_id,
    e.age_division_id,
    e.ability_level,
    e.dance_type,
    e.group_members,
    e.is_medal_program,
    AVG(s.total_score) as avg_score,
    COUNT(s.id) as score_count
  FROM entries e
  JOIN latest_competition lc ON e.competition_id = lc.id
  LEFT JOIN scores s ON s.entry_id = e.id
  WHERE e.is_medal_program = true
  GROUP BY e.id
  HAVING COUNT(s.id) > 0
),
ranked_entries AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY category_id, age_division_id, ability_level, dance_type
      ORDER BY avg_score DESC
    ) as rank_in_category
  FROM entry_scores
)
SELECT 
  competitor_name,
  dance_type,
  ability_level,
  ROUND(avg_score::numeric, 2) as average_score,
  rank_in_category,
  score_count as judges,
  CASE 
    WHEN group_members IS NOT NULL THEN jsonb_array_length(group_members)
    ELSE 0 
  END as members,
  group_members
FROM ranked_entries
WHERE rank_in_category = 1
ORDER BY avg_score DESC;

-- ============================================================================
-- SECTION 5: DUPLICATE DETECTION
-- ============================================================================

-- Check for duplicate awards (should return ZERO rows)
SELECT 
  competition_id,
  entry_id,
  participant_name,
  COUNT(*) as duplicate_count,
  array_agg(awarded_at ORDER BY awarded_at) as award_times
FROM medal_awards
GROUP BY competition_id, entry_id, participant_name
HAVING COUNT(*) > 1;

-- ============================================================================
-- SECTION 6: DATA QUALITY CHECKS
-- ============================================================================

-- Entries marked as medal program but with NULL group_members for groups
SELECT 
  competitor_name,
  dance_type,
  is_medal_program,
  group_members
FROM entries
WHERE is_medal_program = true
  AND (
    (dance_type ILIKE '%group%' AND group_members IS NULL) OR
    (dance_type ILIKE '%group%' AND group_members = '[]'::jsonb)
  );

-- Medal program entries without scores
SELECT 
  c.name as competition,
  e.competitor_name,
  e.dance_type,
  e.ability_level
FROM entries e
JOIN competitions c ON e.competition_id = c.id
LEFT JOIN scores s ON s.entry_id = e.id
WHERE e.is_medal_program = true
  AND s.id IS NULL
ORDER BY c.date DESC;

-- Check for participants with medals awarded but missing from medal_participants
SELECT DISTINCT
  ma.participant_name
FROM medal_awards ma
LEFT JOIN medal_participants mp ON ma.participant_name = mp.participant_name
WHERE mp.id IS NULL;

-- ============================================================================
-- SECTION 7: POINT RECONCILIATION
-- ============================================================================

-- Compare awarded points vs recorded points
-- (should match - if not, there's a sync issue)
SELECT 
  mp.participant_name,
  mp.total_points as recorded_points,
  COUNT(ma.id) as awarded_points,
  mp.total_points - COUNT(ma.id) as discrepancy
FROM medal_participants mp
LEFT JOIN medal_awards ma ON mp.participant_name = ma.participant_name
GROUP BY mp.id, mp.participant_name, mp.total_points
HAVING mp.total_points != COUNT(ma.id)
ORDER BY ABS(mp.total_points - COUNT(ma.id)) DESC;

-- ============================================================================
-- SECTION 8: MEDAL LEVEL VERIFICATION
-- ============================================================================

-- Check if medal levels are correctly calculated
SELECT 
  participant_name,
  total_points,
  current_medal_level,
  CASE 
    WHEN total_points >= 50 THEN 'Gold'
    WHEN total_points >= 35 THEN 'Silver'
    WHEN total_points >= 25 THEN 'Bronze'
    ELSE 'None'
  END as expected_level,
  CASE 
    WHEN current_medal_level = CASE 
      WHEN total_points >= 50 THEN 'Gold'
      WHEN total_points >= 35 THEN 'Silver'
      WHEN total_points >= 25 THEN 'Bronze'
      ELSE 'None'
    END THEN '✅ Correct'
    ELSE '❌ MISMATCH'
  END as status
FROM medal_participants
ORDER BY total_points DESC;

-- ============================================================================
-- SECTION 9: COMPETITION-SPECIFIC DEBUGGING
-- ============================================================================

-- Replace <COMPETITION_ID> with actual UUID

/*
-- Show all medal-eligible entries for a specific competition
SELECT 
  e.id,
  e.competitor_name,
  e.dance_type,
  e.ability_level,
  e.is_medal_program,
  e.group_members,
  AVG(s.total_score) as avg_score,
  COUNT(s.id) as score_count
FROM entries e
LEFT JOIN scores s ON s.entry_id = e.id
WHERE e.competition_id = '<COMPETITION_ID>'
  AND e.is_medal_program = true
GROUP BY e.id
ORDER BY avg_score DESC NULLS LAST;

-- Show awards given for a specific competition
SELECT 
  ma.participant_name,
  ma.points_awarded,
  ma.awarded_at,
  e.competitor_name as entry_name,
  e.dance_type
FROM medal_awards ma
JOIN entries e ON ma.entry_id = e.id
WHERE ma.competition_id = '<COMPETITION_ID>'
ORDER BY ma.awarded_at;
*/

-- ============================================================================
-- SECTION 10: CLEANUP & RESET (USE WITH CAUTION!)
-- ============================================================================

/*
-- ⚠️ DANGER ZONE: Uncomment to reset medal system
-- This will DELETE ALL medal data!

-- Reset for one competition
-- DELETE FROM medal_awards WHERE competition_id = '<COMPETITION_ID>';

-- Reset ALL medal data (⚠️ VERY DESTRUCTIVE)
-- DELETE FROM medal_awards;
-- DELETE FROM medal_participants;
*/

-- ============================================================================
-- SECTION 11: ROW LEVEL SECURITY CHECK
-- ============================================================================

-- Check if RLS is enabled and policies exist
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('medal_participants', 'medal_awards', 'entries')
ORDER BY tablename;

-- Show policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('medal_participants', 'medal_awards', 'entries')
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 12: SUCCESS SUMMARY
-- ============================================================================

-- Overall system health check
SELECT 
  'Total Participants' as metric,
  COUNT(*)::text as value
FROM medal_participants
UNION ALL
SELECT 
  'Total Awards Given' as metric,
  COUNT(*)::text as value
FROM medal_awards
UNION ALL
SELECT 
  'Bronze Medals' as metric,
  COUNT(*)::text as value
FROM medal_participants WHERE current_medal_level = 'Bronze'
UNION ALL
SELECT 
  'Silver Medals' as metric,
  COUNT(*)::text as value
FROM medal_participants WHERE current_medal_level = 'Silver'
UNION ALL
SELECT 
  'Gold Medals' as metric,
  COUNT(*)::text as value
FROM medal_participants WHERE current_medal_level = 'Gold'
UNION ALL
SELECT 
  'Active Competitions' as metric,
  COUNT(*)::text as value
FROM competitions WHERE status = 'active'
UNION ALL
SELECT 
  'Medal Program Entries (All)' as metric,
  COUNT(*)::text as value
FROM entries WHERE is_medal_program = true;

-- ============================================================================
-- END OF VERIFICATION SCRIPT
-- ============================================================================

