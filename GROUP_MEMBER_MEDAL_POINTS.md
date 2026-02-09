# 🏆 Group Member Medal Points Tracking

## Overview

The medal points system now tracks points for **individual group members** when their group wins 1st place. Each member gets 1 point added to their solo entries' `medal_points` field.

---

## How It Works

### When a Group Wins 1st Place:

1. **Award to Medal Participants Table** (existing system)
   - Each group member gets 1 point in `medal_participants` table
   - Tracks season-long totals across all competitions
   - Used for leaderboard display

2. **Update Solo Entries** (NEW)
   - System searches for solo entries matching each member's name
   - Updates those solo entries' `medal_points` field
   - Updates `current_medal_level` based on new total

### When a Solo Entry Wins 1st Place:

1. **Award to Medal Participants Table**
   - Participant gets 1 point in `medal_participants` table

2. **Update Entry's Own Medal Points** (NEW)
   - The winning solo entry's `medal_points` field is updated
   - `current_medal_level` is recalculated

---

## Example Scenario

### Competition Setup:
- **Entry #5**: Solo - "Sarah Johnson" (Jazz, Beginning, Junior Advanced)
- **Entry #12**: Small Group - "Team Dance" 
  - Members: ["Sarah Johnson", "Emma Smith", "Alex Brown"]

### Competition Results:
- **Entry #12** (Team Dance) wins 1st place in Small Group category

### What Happens:

1. **Medal Participants Table:**
   - Sarah Johnson: +1 point (total: 1)
   - Emma Smith: +1 point (total: 1)
   - Alex Brown: +1 point (total: 1)

2. **Solo Entries Updated:**
   - Entry #5 (Sarah Johnson's solo): `medal_points` updated from 0 → 1
   - If Emma Smith has a solo entry: Updated to 1 point
   - If Alex Brown has a solo entry: Updated to 1 point

3. **Display:**
   - Medal leaderboard shows: Sarah Johnson (1 point), Emma Smith (1 point), Alex Brown (1 point)
   - Entry #5 (Sarah's solo) shows: 1 medal point, Bronze level (if applicable)

---

## Technical Implementation

### Key Functions:

#### `updateSoloEntryMedalPoints(participantName, competitionId)`
- Finds all solo entries matching the participant name
- Updates their `medal_points` and `current_medal_level`
- Called when a group member wins

#### `updateEntryMedalPointsDirectly(entryId, totalPoints, medalLevel)`
- Updates a specific entry's medal points
- Called when a solo entry wins

### Flow:

```
Group Wins 1st Place
  ↓
For each group member:
  ↓
  1. awardPointToParticipant() → Updates medal_participants
  ↓
  2. updateSoloEntryMedalPoints() → Finds & updates solo entries
```

```
Solo Wins 1st Place
  ↓
  1. awardPointToParticipant() → Updates medal_participants
  ↓
  2. updateEntryMedalPointsDirectly() → Updates this entry
```

---

## Database Updates

### Tables Updated:

1. **`medal_participants`** (existing)
   - `participant_name`: Name of individual
   - `total_points`: Season-long total
   - `current_medal_level`: Bronze/Silver/Gold/None

2. **`entries`** (NEW updates)
   - `medal_points`: Updated for solo entries
   - `current_medal_level`: Recalculated based on total

3. **`medal_awards`** (existing)
   - Tracks individual awards to prevent duplicates

---

## Edge Cases Handled

### 1. Member Has No Solo Entry
- ✅ System logs: "No solo entries found (this is OK)"
- ✅ Participant still gets point in `medal_participants`
- ✅ No error thrown

### 2. Member Has Multiple Solo Entries
- ✅ All solo entries for that name are updated
- ✅ Each entry shows the same total points (from participant)

### 3. Member Name Mismatch
- ✅ Uses exact match: `competitor_name = participantName`
- ✅ Case-sensitive matching
- ⚠️ If name doesn't match exactly, solo entry won't be found

### 4. Duplicate Awards
- ✅ Prevented by `medal_awards` table
- ✅ Checks: `competition_id + entry_id + participant_name`
- ✅ Won't award twice for same win

---

## Console Logging

The system provides detailed logging:

```
👥 Member 1/3: Sarah Johnson
  🎯 Awarding to: "Sarah Johnson"
  📊 Current status: 0 points, None medal
  ✅ Point awarded! New total: 1 points (None)
  🔍 Searching for solo entries for: "Sarah Johnson"
  ✅ Found 1 solo entry/entries for "Sarah Johnson"
  ✅ Updated solo entry #5: 0 → 1 points (None)
```

---

## Medal Level Thresholds

Points are calculated the same way for both systems:

- **0-24 points**: None
- **25-34 points**: Bronze 🥉
- **35-49 points**: Silver 🥈
- **50+ points**: Gold 🥇

---

## Testing Scenarios

### Test 1: Group Win with Members Who Have Solos
1. Create group entry with members who also have solo entries
2. Award medal points for 1st place
3. ✅ Verify: Solo entries show updated points
4. ✅ Verify: Medal leaderboard shows members

### Test 2: Group Win with Members Who Don't Have Solos
1. Create group entry with members who only compete in groups
2. Award medal points for 1st place
3. ✅ Verify: No errors thrown
4. ✅ Verify: Members still get points in medal_participants

### Test 3: Solo Win
1. Create solo entry
2. Award medal points for 1st place
3. ✅ Verify: Entry's medal_points updated
4. ✅ Verify: Participant gets point in medal_participants

### Test 4: Multiple Competitions
1. Member wins in Competition A (solo)
2. Member wins in Competition B (group)
3. ✅ Verify: Total points = 2
4. ✅ Verify: Solo entry shows 2 points
5. ✅ Verify: Medal level updates correctly

---

## Display on Results Page

The Results page will show:

- **Solo Entries**: Display their own `medal_points` and `current_medal_level`
- **Group Entries**: Show group name, but points are tracked for members
- **Medal Leaderboard**: Shows individual participants with aggregated points

---

## Future Enhancements

Potential improvements:

1. **Name Normalization**: Handle variations (Sarah vs Sarah J. vs S. Johnson)
2. **Participant Matching**: Fuzzy matching for similar names
3. **Cross-Competition Aggregation**: Better handling of points across competitions
4. **Dedicated Participants Table**: Move from entries-based to participants-based system

---

## Summary

✅ **Group members now get individual points** when their group wins  
✅ **Solo entries are updated** to reflect member's total points  
✅ **Medal leaderboard shows individuals** with aggregated points  
✅ **No breaking changes** - existing functionality preserved  
✅ **Comprehensive logging** for debugging  

The system now properly tracks medal points for individual group members while maintaining backward compatibility with the existing medal points system.

