# Medal Points System - Test Scenarios & Validation

## Pre-Test Setup

### 1. Database Preparation

Run these SQL scripts in order:

```sql
-- 1. Create medal tables
\i medal-participants-migration-safe.sql

-- 2. Set up RLS policies
\i medal-tables-rls-policies.sql

-- 3. Verify tables
\i verify-medal-system.sql
```

### 2. Create Test Competition

1. Go to Competition Setup
2. Create new competition: "Medal System Test - [Your Name]"
3. Date: Today
4. Add 3 judges
5. Add categories: Tap, Jazz
6. Add age divisions: Junior (8-12), Teen (13-16)
7. Add ability levels: Beginning, Intermediate, Advanced

---

## Test Scenario 1: Solo Entry Wins 1st Place

### Setup
1. Create entry #101:
   - Name: "Alice Johnson"
   - Category: Tap
   - Age: 10
   - Division Type: Solo
   - Ability: Beginning
   - **✅ Check "Medal Program"**
   - Add photo (optional)

2. Create entry #102 (competitor in same category):
   - Name: "Bob Smith"
   - Category: Tap
   - Age: 10
   - Division Type: Solo
   - Ability: Beginning
   - **✅ Check "Medal Program"**

3. Score entries:
   - Alice: Judge 1 = 85, Judge 2 = 87, Judge 3 = 86 (Avg: 86.0)
   - Bob: Judge 1 = 80, Judge 2 = 82, Judge 3 = 81 (Avg: 81.0)

### Expected Result
Alice places 1st in her category combination.

### Test Steps
1. Go to Results Page
2. Click "Award Medal Points"
3. Watch console logs

### Verification
**Console Should Show:**
```
🏅 Starting medal point awards...
📊 Total medal program entries found: 2
📈 Total scores found: 6
📊 "Alice Johnson": 3 judge(s), avg: 86.00
📊 "Bob Smith": 3 judge(s), avg: 81.00
✅ Entries with valid scores: 2
🎯 Total groups formed: 1
🥇 1st Place: "Alice Johnson" - Score: 86.00
👤 SOLO ENTRY: "Alice Johnson"
✅ Point awarded! New total: 1 points (None)
```

**SQL Verification:**
```sql
-- Check medal_participants
SELECT * FROM medal_participants WHERE participant_name = 'Alice Johnson';
-- Should show: total_points = 1, current_medal_level = 'None'

-- Check medal_awards
SELECT * FROM medal_awards 
WHERE participant_name = 'Alice Johnson';
-- Should show 1 record

-- Bob should NOT have points
SELECT * FROM medal_participants WHERE participant_name = 'Bob Smith';
-- Should be empty (didn't place 1st)
```

**UI Verification:**
- Toast: "✅ Successfully awarded points to 1 participants from 1 first-place entries!"
- Season Leaderboard shows Alice with 1 point

---

## Test Scenario 2: Group Entry Wins 1st Place

### Setup
1. Create entry #201:
   - Name: "Dance Crew A"
   - Category: Jazz
   - Age: 12
   - Division Type: **Small Group (5-10)**
   - Ability: Intermediate
   - **✅ Check "Medal Program"**
   - **Group Members:**
     ```json
     [
       {"name": "Sarah Chen", "age": 12},
       {"name": "Mike Rodriguez", "age": 13},
       {"name": "Emma Wilson", "age": 12},
       {"name": "David Kim", "age": 13}
     ]
     ```

2. Create competitor entry #202:
   - Name: "Dance Crew B"
   - Category: Jazz
   - Age: 12
   - Division Type: Small Group (5-10)
   - Ability: Intermediate
   - **✅ Check "Medal Program"**
   - Group Members: 3 people

3. Score entries:
   - Dance Crew A: Avg = 88.0 (1st place)
   - Dance Crew B: Avg = 85.0 (2nd place)

### Expected Result
All 4 members of Dance Crew A get 1 point each.

### Test Steps
1. Award medal points
2. Watch console for group member processing

### Verification
**Console Should Show:**
```
📋 GROUP ENTRY: Awarding to 4 members
👥 Member 1/4: Sarah Chen
✅ Point awarded! New total: 1 points
👥 Member 2/4: Mike Rodriguez
✅ Point awarded! New total: 1 points
👥 Member 3/4: Emma Wilson
✅ Point awarded! New total: 1 points
👥 Member 4/4: David Kim
✅ Point awarded! New total: 1 points
```

**SQL Verification:**
```sql
-- All 4 members should have 1 point
SELECT participant_name, total_points 
FROM medal_participants 
WHERE participant_name IN ('Sarah Chen', 'Mike Rodriguez', 'Emma Wilson', 'David Kim');

-- Should return 4 rows, each with total_points = 1

-- Check awards
SELECT participant_name, entry_id
FROM medal_awards
WHERE participant_name IN ('Sarah Chen', 'Mike Rodriguez', 'Emma Wilson', 'David Kim');

-- Should return 4 awards, all with same entry_id
```

---

## Test Scenario 3: Same Person in Multiple Winning Entries

### Setup
1. Create entry #301 (Solo):
   - Name: "Jennifer Lee"
   - Category: Tap
   - Division Type: Solo
   - Ability: Advanced
   - Medal Program: YES
   - Score: 90.0 (1st place in category)

2. Create entry #302 (Group):
   - Name: "Elite Ensemble"
   - Category: Jazz
   - Division Type: Small Group
   - Ability: Advanced
   - Medal Program: YES
   - Group Members: Include "Jennifer Lee" + 3 others
   - Score: 92.0 (1st place in category)

### Expected Result
Jennifer Lee gets **2 points total** (1 from solo, 1 from group).

### Verification
```sql
SELECT 
  participant_name,
  total_points,
  current_medal_level
FROM medal_participants 
WHERE participant_name = 'Jennifer Lee';

-- Should show: total_points = 2, current_medal_level = 'None'

-- Check awards
SELECT 
  ma.participant_name,
  e.competitor_name as entry_name,
  e.dance_type,
  ma.awarded_at
FROM medal_awards ma
JOIN entries e ON ma.entry_id = e.id
WHERE ma.participant_name = 'Jennifer Lee'
ORDER BY ma.awarded_at;

-- Should show 2 records (one for each entry)
```

---

## Test Scenario 4: Medal Level Progression

### Setup
This tests that medal levels upgrade at correct thresholds.

### Test 4A: Bronze Medal (25 points)
1. Create participant with 24 points (use SQL INSERT)
2. Create 1st place entry for that participant
3. Award points
4. Verify level changes to Bronze

```sql
-- Setup
INSERT INTO medal_participants (participant_name, total_points, current_medal_level)
VALUES ('Test Bronze', 24, 'None');

-- After awarding 1 more point
SELECT * FROM medal_participants WHERE participant_name = 'Test Bronze';
-- Should show: total_points = 25, current_medal_level = 'Bronze'
```

### Test 4B: Silver Medal (35 points)
```sql
-- Setup
INSERT INTO medal_participants (participant_name, total_points, current_medal_level)
VALUES ('Test Silver', 34, 'Bronze');

-- After awarding 1 more point
-- Should show: total_points = 35, current_medal_level = 'Silver'
```

### Test 4C: Gold Medal (50 points)
```sql
-- Setup
INSERT INTO medal_participants (participant_name, total_points, current_medal_level)
VALUES ('Test Gold', 49, 'Silver');

-- After awarding 1 more point
-- Should show: total_points = 50, current_medal_level = 'Gold'
```

---

## Test Scenario 5: Duplicate Prevention

### Setup
1. Create competition with scored entries
2. Award medal points (successful)
3. **Immediately click "Award Medal Points" again**

### Expected Result
- No new points awarded
- Console shows "⚠️ DUPLICATE PREVENTED" messages
- Toast shows "0 participants awarded"

### Verification
**Console Should Show:**
```
⚠️ DUPLICATE PREVENTED: Award already exists (awarded at 2026-02-01T...)
```

**SQL Verification:**
```sql
-- Check for duplicates (should return 0 rows)
SELECT 
  participant_name,
  COUNT(*) as award_count
FROM medal_awards
WHERE competition_id = '<YOUR_COMPETITION_ID>'
GROUP BY participant_name
HAVING COUNT(*) > 1;
```

---

## Test Scenario 6: Multiple Competitions (Cumulative Points)

### Setup
1. **Competition 1:**
   - Create "Taylor Swift" solo entry, 1st place
   - Award points → Taylor gets 1 point

2. **Competition 2:**
   - Create "Taylor Swift" solo entry, 1st place
   - Award points → Taylor should now have 2 points

3. **Competition 3:**
   - Create group entry with "Taylor Swift" as member, 1st place
   - Award points → Taylor should now have 3 points

### Verification
```sql
SELECT 
  mp.participant_name,
  mp.total_points,
  mp.current_medal_level,
  COUNT(ma.id) as competitions_won
FROM medal_participants mp
LEFT JOIN medal_awards ma ON mp.participant_name = ma.participant_name
WHERE mp.participant_name = 'Taylor Swift'
GROUP BY mp.id, mp.participant_name, mp.total_points, mp.current_medal_level;

-- Should show: total_points = 3, competitions_won = 3
```

---

## Test Scenario 7: Different Categories, Same Person

### Setup
Create entries for same person winning 1st in different categories:
- Solo Tap (Beginning) - 1st place
- Solo Jazz (Beginning) - 1st place  
- Solo Ballet (Intermediate) - 1st place

### Expected Result
Person gets 3 points (1 for each 1st place finish).

---

## Test Scenario 8: Entry NOT in Medal Program

### Setup
1. Create solo entry "Non-Medal Participant"
2. Score it to be 1st place
3. **DO NOT** check "Medal Program" checkbox
4. Award points

### Expected Result
- Entry wins 1st place but receives NO points
- Console shows it's only processing medal program entries
- Non-Medal Participant does NOT appear in medal_participants table

---

## Test Scenario 9: No Scores Entered

### Setup
1. Create medal program entry
2. Do NOT enter any scores
3. Try to award points

### Expected Result
- Error message: "No scores found"
- Console shows warning
- No points awarded

---

## Common Issues Checklist

### ❌ Issue: Points show as 0 after awarding

**Check:**
1. Console logs - were points actually awarded?
2. SQL query: `SELECT * FROM medal_participants` - are they in this table?
3. Is UI reading from `entries.medal_points` (WRONG) or `medal_participants.total_points` (CORRECT)?

**Fix:**
UI should use `medal_participants` table, NOT `entries` table.

### ❌ Issue: Group members not getting points

**Check:**
1. `group_members` field populated? 
   ```sql
   SELECT competitor_name, group_members 
   FROM entries 
   WHERE dance_type ILIKE '%group%';
   ```
2. Is `group_members` valid JSON array?
3. Are member names spelled correctly (case-sensitive)?

**Fix:**
Ensure `group_members` is properly formatted JSONB array.

### ❌ Issue: Duplicate awards being created

**Check:**
```sql
SELECT competition_id, entry_id, participant_name, COUNT(*)
FROM medal_awards
GROUP BY competition_id, entry_id, participant_name
HAVING COUNT(*) > 1;
```

**Fix:**
This shouldn't happen. Check `awardPointToParticipant` function for proper duplicate checking.

---

## Performance Testing

### Large Competition Test
1. Create competition with 100+ entries
2. Mark 50+ as medal program
3. Score all entries
4. Award points
5. Monitor:
   - Time to complete
   - Console log clarity
   - No browser freezing

### Success Criteria
- Process completes in < 30 seconds
- Console logs remain readable
- UI remains responsive
- All points accurately awarded

---

## Final Validation

After all tests, run complete verification:

```sql
\i verify-medal-system.sql
```

Check:
- ✅ No duplicate awards
- ✅ All medal levels calculated correctly
- ✅ Points reconciliation matches (awarded = recorded)
- ✅ Season leaderboard displays correctly
- ✅ Console logs are clear and informative

---

## Rollback / Reset for Testing

```sql
-- ⚠️ DANGER: This deletes all medal data

-- Reset everything
DELETE FROM medal_awards;
DELETE FROM medal_participants;

-- Or reset one competition
DELETE FROM medal_awards WHERE competition_id = '<YOUR_COMPETITION_ID>';

-- Re-run migrations if needed
\i medal-participants-migration-safe.sql
\i medal-tables-rls-policies.sql
```

