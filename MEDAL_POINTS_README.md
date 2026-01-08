# TOPAZ 2.0 - Medal Points System

## Overview
The Medal Points System tracks dancer progression across multiple competitions in a season. Dancers earn points for 1st place finishes and unlock medal achievements at specific milestones.

## How It Works

### Point Award System
- **1st Place**: 1 medal point + trophy
- **2nd Place**: Trophy only (no points)
- **3rd Place**: Trophy only (no points)
- **4th Place**: Trophy only (no points)

**Example**: "Joe tap solo gets 1st he gets a small trophy and 1 point towards the medal."

### Medal Thresholds
Points accumulate across ALL competitions in the season:

| Points | Medal Level | Badge |
|--------|-------------|-------|
| 0-24   | None | - |
| 25-34  | 🥉 Bronze Medal | Bronze badge |
| 35-49  | 🥈 Silver Medal | Silver badge |
| 50+    | 🥇 Gold Medal | Gold badge |

### Automatic Level Progression
When a dancer reaches a threshold:
- Medal level updates automatically
- Badge appears on all their entries
- Progress shows in medal standings

---

## Database Schema

### Entries Table Columns
```sql
medal_points INTEGER DEFAULT 0 CHECK (medal_points >= 0)
current_medal_level TEXT DEFAULT 'None' CHECK (current_medal_level IN ('None', 'Bronze', 'Silver', 'Gold'))
```

**Note**: `medal_points` accumulates across the ENTIRE SEASON, not just one competition.

---

## Features Implemented

### 1. Medal Program Section (Results Page)
When viewing "⭐ Medal Program" filter:

**Top 4 Display Per Category**
- Shows top 4 placements in each category
- Highlights 1st place (earns points)
- Shows 2nd-4th (trophy only)

**Information Displayed:**
- Placement (1st, 2nd, 3rd, 4th)
- Score from this competition
- Points earned THIS competition (1 if 1st, 0 otherwise)
- Total season points
- Current medal status
- Progress to next level

### 2. Season Medal Standings Leaderboard
Toggle view between:
- **Competition Results**: Top 4 per category this competition
- **Season Standings**: All medal program entries ranked by total points

**Leaderboard Shows:**
- Rank by total points
- Dancer name
- Category
- Total points
- Current medal level
- Progress indicator

### 3. Award Medal Points Button
**Location**: Results Page > Medal Program Section

**Functionality:**
1. Admin clicks "🏆 Award Medal Points" button
2. Confirmation: "Award 1 point to X first place medal program entries?"
3. System awards 1 point to all 1st place medal program entries
4. Updates medal level if thresholds reached
5. Shows success message: "✅ X points awarded to Y entries"

**Important:**
- Only 1st place medal program entries receive points
- 2nd, 3rd, 4th place get trophies but no points
- Points are cumulative (don't reset between competitions)

### 4. Medal Badge Display
Shows throughout the system:
- Results page (all entries)
- Medal program section
- Season standings
- PDF score sheets
- Excel exports

**Badge Colors:**
- 🥉 Bronze: Amber background
- 🥈 Silver: Slate/gray background
- 🥇 Gold: Yellow background

### 5. Progress Indicators
Shows dancer's progress:
- "Working toward Bronze (15/25)"
- "🥉 Bronze Medal - Working toward Silver (28/35)"
- "🥈 Silver Medal - Working toward Gold (42/50)"
- "🥇 Gold Medal Achieved!"

---

## User Workflow

### During Competition
1. Dancers compete normally
2. Results are calculated (averages, rankings)
3. Admin reviews results

### After Competition (Awarding Points)
1. Admin goes to Results Page
2. Clicks "⭐ Medal Program" filter button
3. Reviews top 4 per category
4. Clicks "🏆 Award Medal Points" button
5. Confirms award
6. System awards 1 point to all 1st place medal program entries
7. Medal levels update automatically if thresholds reached

### Viewing Progress
**Competition View:**
- Shows who earned points THIS competition
- Shows projected total after points awarded

**Season Standings View:**
- Toggle to see overall leaderboard
- Ranked by total points
- Shows medal achievements
- Shows progress to next level

---

## Technical Implementation

### Components Created
**MedalBadge.jsx**
- Displays medal achievement badges
- Shows progress text
- Color-coded by level
- Props: `medalLevel`, `points`, `size`, `showProgress`

### Functions Added
**entries.js**
- `addMedalPoints(entryId, pointsToAdd)` - Add points to single entry
- `awardMedalPointsToWinners(competitionId, firstPlaceWinners)` - Bulk award points

### Helper Functions
- `getMedalLevel(points)` - Calculate medal level from points
- `getMedalProgress(points)` - Generate progress text

### Database Updates
- `medal_points` - Stores cumulative season points
- `current_medal_level` - Auto-updates based on points

---

## Medal Program Logic

### Point Calculation
```javascript
// Only 1st place gets points
if (rank === 1 && isMedalProgram) {
  awardPoints(entryId, 1);
}
```

### Medal Level Auto-Update
```javascript
let medalLevel = 'None';
if (points >= 50) medalLevel = 'Gold';
else if (points >= 35) medalLevel = 'Silver';
else if (points >= 25) medalLevel = 'Bronze';
```

---

## Display Rules

### In Medal Program Section
- Top 4 per category only
- 1st place highlighted (yellow background)
- 2nd-4th shown in white background
- Points earned clearly indicated

### In Regular Results
- Medal badges shown if achieved (Bronze/Silver/Gold)
- "⭐ Medal" badge for all medal program entries
- No points/progress shown (keeps results clean)

### In Season Standings
- All medal program entries
- Sorted by total points (highest first)
- Full progress details shown
- Medal achievements prominent

---

## Reports & Exports

### PDF Score Sheets
Includes:
- "⭐ Medal Program Entry" indicator
- Current medal level (if any)
- Total season points

### Excel Export
New columns added:
- **Medal Program**: Yes/No
- **Medal Points**: Total season points
- **Medal Level**: Bronze/Silver/Gold/None

---

## Important Notes

### Points Are Cumulative
- Points carry across ALL competitions in the season
- Do NOT reset between competitions
- One dancer can participate in multiple competitions
- Points accumulate toward medal milestones

### Only 1st Place Earns Points
- 2nd, 3rd, 4th place: Trophy only
- NO points for runner-up positions
- Keeps medal achievement meaningful

### Medal Level Updates Automatically
- No manual setting required
- Updates when points reach threshold
- Immediate visual feedback with badges

### Per Category Competition
- Each category shows top 4
- Dancer can win points in multiple categories
- All points count toward overall medal level

---

## Example Scenarios

### Scenario 1: New Dancer
- **Competition 1**: 1st place Jazz → 1 point
- **Status**: "Working toward Bronze (1/25)"
- **Needs**: 24 more points for Bronze

### Scenario 2: Approaching Bronze
- **Season Total**: 22 points
- **Competition 5**: 1st place Tap → 1 point
- **New Total**: 23 points
- **Status**: "Working toward Bronze (23/25)"
- **Needs**: 2 more points

### Scenario 3: Achieving Bronze
- **Season Total**: 24 points
- **Competition 6**: 1st place Jazz → 1 point
- **New Total**: 25 points
- **Status**: "🥉 Bronze Medal - Working toward Silver (25/35)"
- **Achievement**: Bronze Medal Unlocked!

### Scenario 4: Multiple Wins Same Competition
- **Competition 8**: 1st Jazz + 1st Tap = 2 points
- **Previous Total**: 30 points
- **New Total**: 32 points
- **Status**: "🥉 Bronze Medal - Working toward Silver (32/35)"

### Scenario 5: Gold Achievement
- **Season Total**: 49 points
- **Competition 15**: 1st place Hip Hop → 1 point
- **New Total**: 50 points
- **Status**: "🥇 Gold Medal Achieved!"
- **Achievement**: GOLD MEDAL! 🎉

---

## Admin Guidelines

### When to Award Points
- After competition results are finalized
- Before generating final reports
- Can be done immediately or later

### Point Award Process
1. Verify results are correct
2. Review medal program section
3. Confirm 1st place winners
4. Click award button
5. Confirm in popup
6. Verify points were added

### Season Management
- Track points across multiple competitions
- Export standings regularly
- Celebrate medal achievements
- Points persist in database

### Troubleshooting
**Points not showing?**
- Check entry is marked as Medal Program
- Verify entry has scores/rank
- Ensure competition is finalized

**Wrong level displayed?**
- Check total points in database
- Verify thresholds (25/35/50)
- Points may need manual correction

---

## Future Enhancements

Potential additions:
- Season reset functionality
- Historical medal tracking
- Medal ceremony mode
- Email notifications for achievements
- Custom point values per competition
- Team/studio medal standings
- Progress charts and graphs

---

## Migration Notes

### Existing Installations
Run `medal-points-migration.sql` to add:
- `medal_points` column (default: 0)
- `current_medal_level` column (default: 'None')

### New Installations
Use updated `database-schema.sql` - includes medal columns

### Data Preservation
- Existing entries default to 0 points
- No points awarded retroactively
- Start fresh for new season

---

**TOPAZ 2.0 © 2025 | Heritage Since 1972**

*Building champions one point at a time! 🏆*

