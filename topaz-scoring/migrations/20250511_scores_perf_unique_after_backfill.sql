-- Run ONLY after every scores.performance_id is populated and duplicates removed.
-- Step A: remove duplicate judge rows per performance (keep highest total_score, then newest id)
DELETE FROM scores s
USING (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY performance_id, judge_number
           ORDER BY total_score DESC NULLS LAST, updated_at DESC NULLS LAST, id DESC
         ) AS rn
  FROM scores
  WHERE performance_id IS NOT NULL
) d
WHERE s.id = d.id AND d.rn > 1;

-- Step B: optional FK cleanup — scores that still lack performance_id stay on entry_id unique index

-- Step C: enforce uniqueness for performance-scored rows
CREATE UNIQUE INDEX IF NOT EXISTS scores_performance_judge_unique
  ON scores (performance_id, judge_number)
  WHERE performance_id IS NOT NULL;
