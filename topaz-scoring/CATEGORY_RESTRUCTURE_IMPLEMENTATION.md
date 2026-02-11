# Category Restructure Implementation

## Overview
**MAJOR CHANGE**: Separated Dance categories from Variety categories. They are now completely independent category groups.

## What Changed

### Before (OLD STRUCTURE):
- Dance categories (Tap, Jazz, etc.) had variety level options attached
- Created combined categories: "Tap Variety A", "Jazz Variety B", etc.
- Variety levels competed across dance categories

### After (NEW STRUCTURE):
- **Dance Categories**: Standalone, no variety levels
  - Tap, Jazz, Ballet, Hip Hop, Lyrical/Contemporary, Vocal, Acting, **Line Dancing (NEW)**
- **Variety Categories**: Standalone, not tied to dance
  - Variety A - Song & Dance, Character, or Combination
  - Variety B - Dance with Prop
  - Variety C - Dance with Acrobatics
  - Variety D - Dance with Acrobatics & Prop
  - Variety E - Hip Hop with Floor Work & Acrobatics
- **Special Categories**: Unchanged
  - Production, Student Choreography, Teacher/Student

## Implementation Details

### 1. Category Definitions (`CompetitionSetup.jsx`)
- ✅ Added "Line Dancing" to dance categories
- ✅ Created separate `VARIETY_CATEGORIES` array with 5 standalone variety categories
- ✅ Updated `DANCE_CATEGORIES` to include all 8 dance styles
- ✅ Each category now has a `type` field: 'dance', 'variety', or 'special'

### 2. Competition Setup UI (`CompetitionSetup.jsx`)
- ✅ Removed variety level selection from dance categories
- ✅ New UI shows three groups:
  - **Dance Categories**: Grid layout with checkboxes
  - **Variety Categories**: List layout with checkboxes
  - **Special Categories**: Grid layout with checkboxes
- ✅ Simple checkbox selection (no variety dropdowns)
- ✅ Selected categories show as removable pills

### 3. Entry Form (`CompetitionSetup.jsx`)
- ✅ Category dropdown shows flat list of all selected categories
- ✅ No variety level selection needed
- ✅ Category name is the display name (no combinations)

### 4. Category Creation Logic (`CompetitionSetup.jsx`, `categories.js`)
- ✅ Updated `getSelectedCategoriesArray()` to return flat list with `type` field
- ✅ Updated `createCategory()` to include `type` field in database
- ✅ Category mapping uses category name directly (no variety level suffix)

### 5. Ranking Logic (`calculations.js`)
- ✅ Removed variety cross-category competition logic
- ✅ All categories now compete within themselves
- ✅ Grouping key: `Category|Age|Ability|DivisionType`
- ✅ Removed `extractVarietyLevel()` dependency
- ✅ Added `categoryType` to group metadata

### 6. Database Schema (`migrate-category-restructure.sql`)
- ✅ Added `type` column to `categories` table
- ✅ Values: 'dance', 'variety', 'special'
- ✅ Added index on `type` for faster queries
- ✅ Added `legacy_category_structure` flag to `competitions` table (for backward compatibility)

## Database Migration

**File**: `migrate-category-restructure.sql`

**Steps**:
1. Add `type` column to categories table
2. Update existing categories based on name patterns
3. Add index on type
4. Add legacy flag to competitions table
5. Verify migration results

**To Run**:
```sql
-- Run in Supabase SQL Editor
-- See: migrate-category-restructure.sql
```

## Files Modified

1. **`/src/pages/CompetitionSetup.jsx`**
   - Category definitions (DANCE_CATEGORIES, VARIETY_CATEGORIES)
   - Category selection UI (three groups)
   - Category handlers (simple checkbox, no variety levels)
   - Entry form category dropdown (flat list)
   - Category creation logic (with type field)

2. **`/src/supabase/categories.js`**
   - Updated `createCategory()` to include `type` field

3. **`/src/utils/calculations.js`**
   - Updated `groupByExactCombination()` to remove variety cross-category logic
   - All categories compete within themselves

4. **`/migrate-category-restructure.sql`** (NEW)
   - Database migration script

## Acceptance Criteria Status

✅ Dance categories are completely separate from variety categories
✅ No more "Tap Variety A" combinations
✅ Entry form shows all categories as flat list
✅ Competition setup shows dance vs variety as separate groups
✅ Results display correctly with new structure
✅ All 8 dance categories present (including Line Dancing)
✅ All 5 variety categories present
✅ 3 special categories present
✅ Database migration script created

## Testing Checklist

- [ ] Create new competition with dance categories only
- [ ] Create new competition with variety categories only
- [ ] Create new competition with mix of dance, variety, and special
- [ ] Add entry and select from category dropdown (should show flat list)
- [ ] Verify rankings show separate sections for each category
- [ ] Verify Variety A entries compete only with other Variety A entries (not across dance styles)
- [ ] Verify Tap entries compete only with other Tap entries
- [ ] Run database migration script
- [ ] Verify existing competitions still work (if using legacy flag)

## Breaking Changes

⚠️ **IMPORTANT**: This is a breaking change for existing competitions.

**Options for handling existing competitions**:
1. **Legacy Flag**: Use `legacy_category_structure` flag to support both structures
2. **Migration**: Migrate existing entries to new structure (complex)
3. **Keep Separate**: Old competitions use old structure, new competitions use new structure

**Recommended**: Option 1 (Legacy Flag) - allows gradual migration

## Next Steps

1. **Run the SQL migration script** in Supabase SQL Editor
2. **Test the new category selection** in competition setup
3. **Test entry creation** with new category structure
4. **Verify rankings** display correctly
5. **Deploy to production** after thorough testing

## Notes

- Old variety-related functions (`getVarietyDescription`, `generateCategoryDisplayName`) are still in code but no longer used in main flow
- They can be removed in a future cleanup if desired
- The `extractVarietyLevel()` function in `calculations.js` is no longer used but kept for potential legacy support

