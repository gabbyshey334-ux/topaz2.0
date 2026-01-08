# TOPAZ 2.0 - Ability Levels Feature

## Overview
This feature adds 3 ability/experience levels to the TOPAZ 2.0 competition system, allowing dancers to compete within their experience level.

## Ability Levels

### 1. Beginning
- **Experience**: Less than 2 years training
- **Badge Color**: Light Blue
- **Icon**: 🔰

### 2. Intermediate
- **Experience**: 2-4 years training
- **Badge Color**: Orange/Yellow
- **Icon**: 🥉

### 3. Advanced
- **Experience**: Starting 5th year or more (5+ years)
- **Badge Color**: Red/Purple
- **Icon**: 🥇

## Implementation Details

### Database Changes
- **New Column**: `ability_level` added to `entries` table
- **Type**: TEXT with CHECK constraint
- **Allowed Values**: 'Beginning', 'Intermediate', 'Advanced'
- **Required**: Yes (for new entries)

### UI Changes

#### 1. Competition Setup Page
- ✅ Added "Ability Level" dropdown in Add Entry modal
- ✅ Positioned after "Age Division" field
- ✅ Required field with validation
- ✅ Helper text for groups: "For groups: Select the ability level of your most experienced member"
- ✅ Displays ability level badge in entry list

#### 2. Scoring Interface Page
- ✅ Added "Filter by Ability" dropdown alongside category and age filters
- ✅ Options: "All Levels", "Beginning", "Intermediate", "Advanced"
- ✅ Displays ability level badge on current entry info
- ✅ Filter affects entry navigation

#### 3. Results Page
- ✅ Added 3 ability level filter buttons (Beginning, Intermediate, Advanced)
- ✅ Can filter by: Category + Age + Ability
- ✅ Displays ability level badge on each entry
- ✅ Rankings separate per ability level
- ✅ Filter combinations supported:
  - "Jazz - Teen - Advanced" (most specific)
  - "Jazz - Advanced" (category + ability)
  - "Teen - Advanced" (age + ability)
  - "Advanced" (ability only)

#### 4. PDF Score Sheets
- ✅ Ability level included in entry info section
- ✅ Shows full description (e.g., "Beginning (Less than 2 years)")

#### 5. Excel Export
- ✅ Added "Ability Level" column
- ✅ Shows full description with years

### New Component

#### AbilityBadge.jsx
A reusable component for displaying ability level badges consistently across the application.

**Props:**
- `abilityLevel`: String - "Beginning", "Intermediate", or "Advanced"
- `size`: String - "sm", "md", or "lg" (default: "md")

**Usage:**
```jsx
import AbilityBadge from '../components/AbilityBadge';

<AbilityBadge abilityLevel="Advanced" size="md" />
```

## Installation Instructions

### For New Installations
1. Use the updated `database-schema.sql` file
2. The `ability_level` column is already included

### For Existing Installations
1. Run the migration script in Supabase SQL Editor:
   ```sql
   -- See ability-level-migration.sql
   ```
2. Optionally set default values for existing entries
3. Restart your application

## Validation Rules

1. **Required Field**: Ability level must be selected when adding an entry
2. **Valid Values Only**: Database constraint ensures only valid values
3. **Group Entries**: Use the ability level of the most experienced member

## Filter Behavior

### Scoring Interface
- Filters are cumulative (Category AND Age AND Ability)
- "All Levels" shows all entries regardless of ability level
- Search box works across all filters

### Results Page
- Filter buttons are mutually exclusive within their category
- Ability level filters show only that level
- Can combine with search for specific entries

## User Experience

### Helper Text
- **Solo entries**: "Select based on years of training"
- **Group entries**: "⚠️ For groups: Select the ability level of your most experienced member"

### Visual Indicators
- Color-coded badges throughout the interface
- Consistent styling across all pages
- Tooltips show experience requirements

## Technical Notes

### Data Storage
- Stored directly in `entries.ability_level` column
- Not stored in `dance_type` field (unlike some other metadata)
- Indexed for better query performance

### Backend Changes
- `entries.js`: Updated `createEntry()` to accept `ability_level`
- All entry queries automatically include ability level
- No changes needed to scores or other tables

### Frontend Changes
- 5 pages modified: CompetitionSetup, ScoringInterface, ResultsPage, pdfGenerator, excelExport
- 1 new component: AbilityBadge
- All changes maintain backward compatibility

## Testing Checklist

### ✅ Competition Setup
- [ ] Add entry with Beginning level
- [ ] Add entry with Intermediate level
- [ ] Add entry with Advanced level
- [ ] Add group entry and verify helper text shows
- [ ] Verify ability level badge appears in entry list
- [ ] Save competition and verify data persists

### ✅ Scoring Interface
- [ ] Filter by Beginning level
- [ ] Filter by Intermediate level
- [ ] Filter by Advanced level
- [ ] Combine with category filter
- [ ] Combine with age division filter
- [ ] Verify badge shows on current entry

### ✅ Results Page
- [ ] Click Beginning filter button
- [ ] Click Intermediate filter button
- [ ] Click Advanced filter button
- [ ] Combine with category filters
- [ ] Verify rankings are separate per level
- [ ] Verify badge shows on all entries

### ✅ PDF Export
- [ ] Generate score sheet for Beginning entry
- [ ] Generate score sheet for Advanced entry
- [ ] Verify ability level appears with description

### ✅ Excel Export
- [ ] Export results to Excel
- [ ] Verify "Ability Level" column exists
- [ ] Verify values show full descriptions

## Migration Notes

### Existing Entries
- Entries created before this update will have `NULL` ability_level
- These will not appear when filtering by ability level
- Recommended: Update existing entries manually or set a default value

### Backward Compatibility
- System continues to work with entries that don't have ability_level set
- Filters handle NULL values gracefully
- No breaking changes to existing functionality

## Support

For issues or questions:
1. Check that database migration was successful
2. Verify all files were updated correctly
3. Clear browser cache if changes don't appear
4. Check console for JavaScript errors

## Future Enhancements

Potential additions:
- Combined filters (e.g., "Jazz + Advanced" as one button)
- Ability level statistics in competition summary
- Auto-suggest ability level based on age
- Ability level requirements per category

---

**TOPAZ 2.0 © 2025 | Heritage Since 1972**

