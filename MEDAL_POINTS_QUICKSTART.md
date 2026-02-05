# Medal Points System - Quick Start Guide

## 🎯 Overview

The medal points system awards **1 point per 1st place finish** to dancers enrolled in the Medal Program. Points accumulate season-long across all competitions.

**Medal Levels:**
- 🥉 **Bronze**: 25-34 points
- 🥈 **Silver**: 35-49 points
- 🥇 **Gold**: 50+ points

---

## 🚀 Initial Setup (ONE TIME ONLY)

### Step 1: Create Database Tables

In Supabase SQL Editor, run these scripts **in order**:

```sql
-- 1. Create medal participants and awards tables
\i topaz-scoring/medal-participants-migration-safe.sql

-- 2. Enable Row Level Security policies
\i topaz-scoring/medal-tables-rls-policies.sql

-- 3. Verify setup
\i topaz-scoring/verify-medal-system.sql
```

✅ **Success Check:** Last query should show:
- `medal_participants` table exists (0 records initially)
- `medal_awards` table exists (0 records initially)

---

## 📝 Creating Medal Program Entries

### For Solo Entries

1. Go to Competition Setup → Add Entry
2. Fill in competitor details
3. **✅ Check "Medal Program" checkbox**
4. Select ability level
5. Choose division type: **Solo**
6. Save entry

### For Group Entries

1. Go to Competition Setup → Add Entry
2. Fill in group name
3. **✅ Check "Medal Program" checkbox**
4. Select ability level
5. Choose division type: **Small Group, Large Group, etc.**
6. **IMPORTANT:** Click "Add Group Members" and enter each member:
   ```
   Member 1: Sarah Johnson, Age 12
   Member 2: Mike Chen, Age 13
   Member 3: Emma Davis, Age 12
   ```
7. Save entry

⚠️ **Critical:** Group entries MUST have `group_members` filled in or points won't be awarded to individuals!

---

## 🏆 Awarding Medal Points

### When to Award

After competition is fully scored by all judges.

### How to Award

1. Go to **Results Page**
2. Click **"Award Medal Points"** button (found in Medal Program section)
3. Confirm dialog: "Award medal points to all 1st place Medal Program winners?"
4. Wait for process to complete
5. Check success message

### What Happens

The system will:
1. ✅ Find all 1st place winners in each category combination
2. ✅ Award 1 point to each solo performer
3. ✅ Award 1 point to EACH member in winning groups
4. ✅ Update medal levels automatically
5. ✅ Prevent duplicate awards

### Success Message

```
✅ Successfully awarded points to X participants from Y first-place entries!
```

---

## 📊 Viewing Medal Standings

### Season Leaderboard

1. Go to Results Page
2. Click **"Season Leaderboard"** button
3. View top 20 participants
4. See current medal levels and progress

### Competition Medal Results

1. Go to Results Page
2. Click **"Medal Program View"** button
3. See top 4 in each category combination
4. View this competition's 1st place winners

---

## 🐛 Troubleshooting

### Issue: Points show as 0 after awarding

**Solution:**
1. Open browser console (F12)
2. Check for errors in console logs
3. Run SQL verification:
   ```sql
   SELECT * FROM medal_participants ORDER BY total_points DESC;
   ```
4. If participants have points in database but UI shows 0, refresh page

### Issue: Group members not getting points

**Solution:**
1. Verify group_members is filled in:
   ```sql
   SELECT competitor_name, group_members 
   FROM entries 
   WHERE dance_type ILIKE '%group%';
   ```
2. Ensure JSON format is correct:
   ```json
   [{"name": "Person Name", "age": 12}]
   ```
3. Re-award points if needed

### Issue: "No medal program entries found"

**Solution:**
- ✅ Check "Medal Program" checkbox when creating entries
- Verify entries exist:
  ```sql
  SELECT * FROM entries WHERE is_medal_program = true;
  ```

### Issue: Awarded twice by accident

**Solution:**
Don't worry! The system prevents duplicates. Second award will show "0 participants awarded".

---

## 🔍 Debugging Tools

### View Console Logs

1. Open browser console (F12)
2. Click "Award Medal Points"
3. Watch detailed logging:
   - How many entries found
   - Who places 1st
   - Points being awarded
   - Any errors

### Run SQL Verification

```sql
\i topaz-scoring/verify-medal-system.sql
```

This comprehensive script checks:
- ✅ Table structure
- ✅ Current standings
- ✅ Recent awards
- ✅ Duplicate detection
- ✅ Data quality
- ✅ Medal level accuracy

---

## 📋 Common Workflows

### Workflow 1: New Competition

1. Create competition entries
2. Mark medal program participants (check checkbox)
3. Judges score all entries
4. Go to Results Page
5. Award medal points
6. View season leaderboard

### Workflow 2: Multiple Competitions

1. Complete Competition 1 → Award points
2. Complete Competition 2 → Award points
3. Complete Competition 3 → Award points
4. Points accumulate automatically
5. Medal levels upgrade at thresholds

### Workflow 3: Check Season Standings

1. Go to Results Page (any competition)
2. Click "Season Leaderboard"
3. See top 20 performers
4. Export if needed

---

## ⚙️ Advanced Operations

### Reset Points for Testing

```sql
-- ⚠️ CAUTION: This deletes medal data

-- Reset for one competition
DELETE FROM medal_awards WHERE competition_id = '<COMPETITION_ID>';

-- Reset entire season (DANGER!)
DELETE FROM medal_awards;
DELETE FROM medal_participants;
```

### Manually Award Point

```sql
-- Get competition and entry IDs first
SELECT id, name FROM competitions ORDER BY date DESC LIMIT 5;
SELECT id, competitor_name FROM entries WHERE competition_id = '<COMP_ID>';

-- Award point
INSERT INTO medal_awards (competition_id, entry_id, participant_name, points_awarded)
VALUES ('<COMP_ID>', '<ENTRY_ID>', 'Participant Name', 1);

-- Update participant total
UPDATE medal_participants
SET total_points = total_points + 1
WHERE participant_name = 'Participant Name';
```

### Check Specific Participant

```sql
-- View participant details
SELECT 
  mp.*,
  COUNT(ma.id) as total_awards
FROM medal_participants mp
LEFT JOIN medal_awards ma ON mp.participant_name = ma.participant_name
WHERE mp.participant_name = 'Sarah Johnson'
GROUP BY mp.id;

-- View all their awards
SELECT 
  c.name as competition,
  c.date,
  e.competitor_name as entry,
  ma.awarded_at
FROM medal_awards ma
JOIN competitions c ON ma.competition_id = c.id
JOIN entries e ON ma.entry_id = e.id
WHERE ma.participant_name = 'Sarah Johnson'
ORDER BY ma.awarded_at;
```

---

## 📚 Additional Resources

- **Debug Guide:** `MEDAL_POINTS_DEBUG_GUIDE.md`
- **Test Scenarios:** `MEDAL_POINTS_TEST_SCENARIOS.md`
- **SQL Verification:** `verify-medal-system.sql`
- **Migration Scripts:** `medal-participants-migration-safe.sql`

---

## ✅ System Requirements Checklist

- [x] `medal_participants` table created
- [x] `medal_awards` table created
- [x] RLS policies enabled
- [x] `entries` table has `is_medal_program` column
- [x] `entries` table has `group_members` column (JSONB)
- [x] UI displays "Medal Program" checkbox in entry form
- [x] UI shows "Award Medal Points" button on Results Page
- [x] UI shows "Season Leaderboard" view

---

## 🎓 Key Concepts

1. **Individual Tracking:** Points belong to PEOPLE, not entries
2. **Group Awards:** Each group member gets 1 point individually
3. **Cumulative:** Points add up across all competitions
4. **1st Place Only:** Only 1st place in category combination earns points
5. **Category Combination:** Category + Age + Ability + Division Type
6. **Duplicate Prevention:** Can't award twice for same entry
7. **Automatic Levels:** Bronze/Silver/Gold calculated automatically

---

## 🔐 Security Notes

Current setup (MVP):
- All operations use `anon` role
- No authentication required
- Full access to all medal data

For production, implement:
- User authentication
- Role-based access control
- Restrict award operations to admins only

---

## 📞 Support

If issues persist:

1. Check browser console for errors
2. Run `verify-medal-system.sql`
3. Review `MEDAL_POINTS_DEBUG_GUIDE.md`
4. Check Supabase logs
5. Verify RLS policies are correct

---

## 🎉 Quick Success Test

Run this test to verify system works:

1. Create solo entry "Test Person" (Medal Program: YES)
2. Score it to be 1st place in its category
3. Award points
4. Check console logs
5. Run SQL: `SELECT * FROM medal_participants WHERE participant_name = 'Test Person';`
6. Should show: `total_points = 1`

✅ If this works, system is operational!

