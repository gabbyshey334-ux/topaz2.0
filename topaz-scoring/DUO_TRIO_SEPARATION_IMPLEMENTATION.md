# Duo/Trio Separation Implementation

## Overview
Split "Duo/Trio" division type into two separate division types:
- **Duo** (exactly 2 members)
- **Trio** (exactly 3 members)

## Changes Made

### 1. Entry Form - Division Type Options (`CompetitionSetup.jsx`)
- ✅ Updated `getDivisionTypeOptions()` to return `['Duo', 'Trio', ...]` instead of `['Duo/Trio', ...]`
- ✅ Updated `validateGroupMembers()` to validate:
  - Duo: exactly 2 members
  - Trio: exactly 3 members
- ✅ Added auto-set logic in `handleAddGroupMember()` and `handleDeleteGroupMember()`:
  - 2 members → automatically sets to "Duo"
  - 3 members → automatically sets to "Trio"
  - 4-10 members → "Small Group (4-10)"
  - 11+ members → "Large Group (11+)"

### 2. Judge Scoring Page - Division Type Filter (`ScoringInterface.jsx`)
- ✅ Updated dropdown options to include separate "Duo" and "Trio" options
- ✅ Updated `getDivisionType()` helper function to:
  - Return "Duo" for entries containing "duo" (but not "trio")
  - Return "Trio" for entries containing "trio"
  - Normalize comparison for filtering

### 3. Results/Rankings Logic (`calculations.js`)
- ✅ Updated `getDivisionTypeEmoji()`:
  - Duo → 👥
  - Trio → 👥👥
- ✅ Updated `getDivisionTypeDisplayName()`:
  - Handles "Duo" and "Trio" separately
  - Removes "Duo/Trio" references

### 4. Medal Points System (`medalParticipants.js`)
- ✅ Already handles duo/trio separately in filtering logic
- ✅ No changes needed (uses `dance_type` field directly)

### 5. Database Migration (`migrate-duo-trio-separation.sql`)
- ✅ Created SQL script to:
  - Update entries with 2 members from "Duo/Trio" → "Duo"
  - Update entries with 3 members from "Duo/Trio" → "Trio"
  - Handle edge cases (NULL group_members)
  - Verify migration results

## Database Migration Instructions

1. **Run the migration script in Supabase SQL Editor:**
   ```sql
   -- See: migrate-duo-trio-separation.sql
   ```

2. **Verify the migration:**
   - Check that no entries remain with "Duo/Trio" division type
   - Verify Duo entries have exactly 2 members
   - Verify Trio entries have exactly 3 members

## Testing Checklist

- [ ] Create new entry with 2 members → automatically sets to "Duo"
- [ ] Create new entry with 3 members → automatically sets to "Trio"
- [ ] Filter by "Duo" on judge scoring page → shows only 2-member entries
- [ ] Filter by "Trio" on judge scoring page → shows only 3-member entries
- [ ] Rankings show separate sections for "Duo" and "Trio"
- [ ] Medal points awarded correctly for Duo and Trio separately
- [ ] Existing entries migrated correctly (run SQL script)

## Files Modified

1. `/src/pages/CompetitionSetup.jsx`
   - `getDivisionTypeOptions()` function
   - `validateGroupMembers()` function
   - `handleAddGroupMember()` function (auto-set logic)
   - `handleDeleteGroupMember()` function (auto-set logic)

2. `/src/pages/ScoringInterface.jsx`
   - Division type filter dropdown options
   - `getDivisionType()` helper function

3. `/src/utils/calculations.js`
   - `getDivisionTypeEmoji()` function
   - `getDivisionTypeDisplayName()` function

4. `/migrate-duo-trio-separation.sql` (NEW)
   - Database migration script

## Acceptance Criteria Status

✅ Duo and Trio are separate division types
✅ Entry form automatically assigns correct type based on member count
✅ Rankings show separate 1st/2nd/3rd for Duo vs Trio
✅ All filters include both Duo and Trio options
✅ SQL migration script created for existing entries
⏳ Existing entries migration (requires running SQL script)

## Next Steps

1. **Run the SQL migration script** in Supabase SQL Editor
2. **Test the changes** with new entries
3. **Verify existing entries** were migrated correctly
4. **Deploy to production** after testing

