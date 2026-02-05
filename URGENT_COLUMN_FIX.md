# 🚨 URGENT FIX: Column Doesn't Exist Error

## ❌ THE PROBLEM

**Error Message:** "Column entries don't exist"

**Root Cause:** The code is trying to save data to database columns that don't exist yet.

---

## 🔍 WHAT WAS WRONG:

### Missing Columns in Database:
The `entries` table was missing these columns:
1. **`group_members`** (JSONB) - Stores group member information
2. **`studio_name`** (TEXT) - Stores dance studio name  
3. **`teacher_name`** (TEXT) - Stores teacher/choreographer name

### Where the Code Failed:
**File:** `src/pages/CompetitionSetup.jsx` (lines 913, 915-916)

```javascript
// This code was trying to save to non-existent columns:
const entryData = {
  // ... other fields ...
  group_members: cleanedGroupMembers,  // ❌ Column didn't exist!
  studio_name: entry.studioName || null,  // ❌ Column didn't exist!
  teacher_name: entry.teacherName || null  // ❌ Column didn't exist!
};
```

---

## ✅ THE FIX

### Step 1: Run SQL Migration in Supabase

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Copy and paste this SQL:**

```sql
-- Add missing columns to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT NULL;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT NULL;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_entries_group_members ON entries USING GIN (group_members);
```

**Click:** "Run" button

**Expected Result:**
```
Success. No rows returned.
```

### Step 2: Verify Columns Were Added

**Run this verification query:**

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name')
ORDER BY column_name;
```

**Expected Result:**
```
group_members  | jsonb | YES
studio_name    | text  | YES
teacher_name   | text  | YES
```

### Step 3: Test the Fix

1. Go to your TOPAZ app
2. Navigate to: **Competition Setup**
3. Try adding a new entry with:
   - Group members
   - Studio name
   - Teacher name
4. Click "Save Competition"
5. ✅ Should save without errors!

---

## 📊 COMPLETE COLUMN LIST

After the fix, the `entries` table has these columns:

| Column Name | Type | Description |
|-------------|------|-------------|
| id | UUID | Primary key |
| competition_id | UUID | Competition reference |
| entry_number | INTEGER | Entry number |
| competitor_name | TEXT | Performer/group name |
| category_id | UUID | Category reference |
| age_division_id | UUID | Age division reference |
| age | INTEGER | Performer age |
| dance_type | TEXT | Division type (Solo, Duo/Trio, etc.) |
| ability_level | TEXT | Beginning/Intermediate/Advanced |
| **is_medal_program** | BOOLEAN | Medal program enrollment |
| **medal_points** | INTEGER | Total medal points |
| **current_medal_level** | TEXT | None/Bronze/Silver/Gold |
| **group_members** | JSONB | Array of group members ✅ NEW |
| **studio_name** | TEXT | Dance studio name ✅ NEW |
| **teacher_name** | TEXT | Teacher/choreographer ✅ NEW |
| photo_url | TEXT | Entry photo URL |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## 🎯 FILES UPDATED

### 1. **add-missing-columns.sql** ✅ NEW
Complete migration script to add the missing columns.

### 2. **database-schema.sql** ✅ UPDATED
Updated the schema to include the new columns for future deployments.

---

## 🧪 TESTING CHECKLIST

After running the SQL migration:

- [ ] Can create new entry with group members
- [ ] Can save studio name
- [ ] Can save teacher name
- [ ] Medal program checkbox works
- [ ] No "column doesn't exist" errors
- [ ] Existing entries still display correctly
- [ ] Competition saves successfully

---

## 🔧 TROUBLESHOOTING

### If Error Persists:

**1. Check if columns exist:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'entries';
```

**2. Check for typos:**
- ✅ Correct: `group_members` (snake_case)
- ❌ Wrong: `groupMembers` (camelCase)

**3. Clear browser cache:**
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

**4. Check Supabase connection:**
- Verify API keys in `.env` file
- Check Supabase project status

### If Medal Points Still Show 0:

This is a separate issue. See:
- `MEDAL_POINTS_DEBUG_GUIDE.md`
- `verify-medal-system.sql`

---

## 📱 DEPLOYMENT

### Already Deployed to GitHub:
The code that requires these columns is already live.

### You Must Run the SQL Migration:
**CRITICAL:** Run the SQL migration in Supabase **NOW** or the app will continue to fail.

### Steps:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `add-missing-columns.sql`
4. Verify with test entry
5. ✅ Fixed!

---

## 🎯 PRIORITY: IMMEDIATE

**Status:** 🔴 CRITICAL - App will fail without this fix

**Time to Fix:** 2 minutes

**Action Required:** Run the SQL migration in Supabase

---

## ✅ SUMMARY

**Problem:**
- Code tried to save `group_members`, `studio_name`, `teacher_name`
- These columns didn't exist in database
- Result: "Column entries don't exist" error

**Solution:**
- Added 3 missing columns to `entries` table
- Updated schema documentation
- Created migration script

**Next Step:**
- **RUN THE SQL MIGRATION NOW** → `add-missing-columns.sql`

---

## 📞 QUICK FIX COMMAND

**One command to fix everything:**

```sql
-- Copy/paste this entire block into Supabase SQL Editor:

ALTER TABLE entries ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_entries_group_members ON entries USING GIN (group_members);

-- Verify:
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name');
```

**Expected Output:**
```
group_members | jsonb
studio_name   | text
teacher_name  | text
```

**✅ DONE! Test your app now.**

---

## 🎉 RESULT

After running this fix:
- ✅ No more "column doesn't exist" errors
- ✅ Can save group member information
- ✅ Can save studio and teacher names
- ✅ Competition setup works correctly
- ✅ Medal program continues to function

**Your app is now fully functional!** 🚀

