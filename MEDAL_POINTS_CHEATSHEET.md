# 🏆 Medal Points System - Quick Reference Cheat Sheet

## Setup Commands (Run Once)

```sql
-- In Supabase SQL Editor:
\i topaz-scoring/medal-participants-migration-safe.sql
\i topaz-scoring/medal-tables-rls-policies.sql
\i topaz-scoring/verify-medal-system.sql
```

---

## Medal Thresholds

| Level | Points | Status |
|-------|--------|--------|
| None | 0-24 | ⭐ Working toward Bronze |
| 🥉 Bronze | 25-34 | Working toward Silver |
| 🥈 Silver | 35-49 | Working toward Gold |
| 🥇 Gold | 50+ | Maximum achievement |

---

## Creating Medal Entries

### Solo Entry
- ✅ Check "Medal Program" checkbox
- ✅ Select Division Type: **Solo**
- ✅ No group members needed

### Group Entry
- ✅ Check "Medal Program" checkbox
- ✅ Select Division Type: **Small Group / Large Group**
- ✅ Add group members: Click "Add Group Members"
- ✅ Enter each member's name and age

**⚠️ CRITICAL:** Group entries MUST have group_members filled or individual points won't be awarded!

---

## Awarding Points Workflow

1. Navigate to **Results Page**
2. Ensure all entries are **scored by judges**
3. Click **"Award Medal Points"** button
4. Confirm dialog
5. Wait for success message
6. Check **console logs** (F12) for details
7. View **Season Leaderboard** to verify

---

## Console Log Quick Reference

### ✅ Success Indicators
```
🏅 MEDAL POINTS AWARD PROCESS STARTING
📊 Total medal program entries found: 5
📈 Total scores found: 15
🎯 Total groups formed: 3
🥇 1st Place: "Dancer Name" - Score: 92.50
✅ Point awarded! New total: 3 points (None)
✅ COMPLETE! Medal points awarded to 5 participants
```

### ❌ Error Indicators
```
⚠️ WARNING: No medal program entries found
⚠️ WARNING: No scores found for this competition
❌ ERROR fetching entries: [error details]
⚠️ DUPLICATE PREVENTED: Award already exists
```

---

## Quick SQL Checks

### Are there medal participants?
```sql
SELECT * FROM medal_participants ORDER BY total_points DESC LIMIT 10;
```

### Were points awarded for this competition?
```sql
SELECT participant_name, points_awarded, awarded_at
FROM medal_awards
WHERE competition_id = '<YOUR_COMPETITION_ID>'
ORDER BY awarded_at DESC;
```

### Are entries marked as medal program?
```sql
SELECT competitor_name, is_medal_program, group_members
FROM entries
WHERE competition_id = '<YOUR_COMPETITION_ID>'
  AND is_medal_program = true;
```

### Check for duplicates (should return 0 rows)
```sql
SELECT participant_name, COUNT(*)
FROM medal_awards
WHERE competition_id = '<YOUR_COMPETITION_ID>'
GROUP BY participant_name
HAVING COUNT(*) > 1;
```

---

## Troubleshooting Quick Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No medal program entries found" | Checkbox not checked | Check "Medal Program" when creating entries |
| "No scores found" | Judges haven't scored | Have judges score entries first |
| Points show as 0 | Database not set up | Run migration scripts |
| Group members not getting points | `group_members` empty | Edit entry and add group members |
| Error awarding points | RLS policies missing | Run `medal-tables-rls-policies.sql` |
| Duplicate awards | Normal - system prevents | No action needed, working correctly |

---

## How 1st Place is Determined

Entry wins **1st place** if it has the **highest average score** in its combination:

```
Category + Variety + Age Division + Ability + Division Type
```

**Example:**
- Tap | Variety A | Junior (8-12) | Intermediate | Solo
- Only entries matching ALL five criteria compete for 1st place in this group

---

## Points Distribution

### Solo Entry Wins 1st Place
```
1 entry wins → 1 person gets 1 point
```

### Group Entry Wins 1st Place
```
1 entry wins → EACH member gets 1 point individually

Example: 5-person group wins 1st place
Result: 5 people each get 1 point = 5 total points distributed
```

### Same Person, Multiple Entries
```
Person in solo (1st place) = 1 point
Same person in group (1st place) = 1 point
Total for that person = 2 points ✅
```

---

## Common Commands

### View Season Standings
1. Go to Results Page
2. Click **"Season Leaderboard"** button

### View Medal Program Results
1. Go to Results Page
2. Click **"Medal Program View"** button
3. See top 4 per category combination

### Reset for Testing (⚠️ DESTRUCTIVE)
```sql
-- Reset one competition
DELETE FROM medal_awards WHERE competition_id = '<ID>';

-- Reset everything (⚠️ DANGER!)
DELETE FROM medal_awards;
DELETE FROM medal_participants;
```

---

## Files Quick Reference

| Need | File |
|------|------|
| Quick start | `MEDAL_POINTS_QUICKSTART.md` |
| Debug help | `MEDAL_POINTS_DEBUG_GUIDE.md` |
| Test system | `MEDAL_POINTS_TEST_SCENARIOS.md` |
| Verify DB | `verify-medal-system.sql` |
| Master index | `MEDAL_POINTS_README.md` |

---

## Success Checklist

- [ ] Migration scripts run successfully
- [ ] RLS policies created
- [ ] Test entry created with medal program checked
- [ ] Test entry scored by judges
- [ ] Points awarded (console shows success)
- [ ] SQL shows participant in `medal_participants` table
- [ ] Season Leaderboard displays correctly
- [ ] No errors in console
- [ ] Group test: All members received points

---

## Emergency Debug Commands

### Open Browser Console
```
Press F12 → Console tab
```

### Run Full System Check
```sql
\i topaz-scoring/verify-medal-system.sql
```

### Check Recent Activity
```sql
-- Recent awards
SELECT * FROM medal_awards ORDER BY awarded_at DESC LIMIT 20;

-- Current standings
SELECT participant_name, total_points, current_medal_level
FROM medal_participants ORDER BY total_points DESC LIMIT 20;
```

---

## Key Rules to Remember

1. **Only 1st place gets points** - 2nd, 3rd, 4th get trophies but no medal points
2. **Must be enrolled in medal program** - Check the checkbox!
3. **Points belong to people** - Not entries, not groups, but individual performers
4. **Cumulative across season** - Points add up from all competitions
5. **Can't double-award** - System prevents duplicates automatically
6. **Groups award to each member** - Not just one point for the whole group

---

## Support Flow

1. **Check console** (F12) → Look for errors
2. **Run verify-medal-system.sql** → Check database
3. **Read Debug Guide** → Find your issue
4. **Try test scenario** → Validate fix
5. **Check Quick Reference** (this file) → Common solutions

---

## Quick Test (2 Minutes)

```bash
# 1. Create entry "Test Dancer" - check medal program box
# 2. Score it: 85, 87, 86 (will likely be 1st in its category)
# 3. Award points
# 4. Open console - should see success messages
# 5. Run SQL:
```

```sql
SELECT * FROM medal_participants WHERE participant_name = 'Test Dancer';
-- Should show: total_points = 1
```

✅ **If this works, system is fully operational!**

---

## Contact / Help

- Console shows detailed logs: F12 → Console
- SQL verification: Run `verify-medal-system.sql`
- Full guide: See `MEDAL_POINTS_README.md`

---

**Print this page and keep it handy!** 🏆


