-- Migration: Split "Duo/Trio" into Separate "Duo" and "Trio" Division Types
-- Date: 2024
-- Description: Updates existing entries with "Duo/Trio" division type to either "Duo" (2 members) or "Trio" (3 members)

-- Step 1: Update entries with exactly 2 members to "Duo"
UPDATE entries 
SET dance_type = 'Duo' 
WHERE dance_type = 'Duo/Trio' 
  AND jsonb_array_length(COALESCE(group_members, '[]'::jsonb)) = 2;

-- Step 2: Update entries with exactly 3 members to "Trio"
UPDATE entries 
SET dance_type = 'Trio' 
WHERE dance_type = 'Duo/Trio' 
  AND jsonb_array_length(COALESCE(group_members, '[]'::jsonb)) = 3;

-- Step 3: Handle edge cases where group_members might be NULL or empty
-- If dance_type is "Duo/Trio" but no group_members, check if it's a solo entry
-- (This shouldn't happen, but just in case)
UPDATE entries 
SET dance_type = 'Solo' 
WHERE dance_type = 'Duo/Trio' 
  AND (group_members IS NULL OR jsonb_array_length(COALESCE(group_members, '[]'::jsonb)) = 0);

-- Step 4: Verify the migration
-- Check how many entries still have "Duo/Trio" (should be 0)
SELECT 
  COUNT(*) as remaining_duo_trio_entries,
  dance_type
FROM entries 
WHERE dance_type LIKE '%Duo%' OR dance_type LIKE '%Trio%'
GROUP BY dance_type
ORDER BY dance_type;

-- Step 5: Show summary of updated entries
SELECT 
  dance_type,
  COUNT(*) as entry_count,
  jsonb_array_length(COALESCE(group_members, '[]'::jsonb)) as member_count
FROM entries 
WHERE dance_type IN ('Duo', 'Trio')
GROUP BY dance_type, jsonb_array_length(COALESCE(group_members, '[]'::jsonb))
ORDER BY dance_type, member_count;

