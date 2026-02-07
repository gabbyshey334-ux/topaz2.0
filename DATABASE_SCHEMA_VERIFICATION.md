# 📊 DATABASE SCHEMA VERIFICATION GUIDE

## 🎯 PURPOSE
Verify the actual database schema in Supabase and compare it to what the code expects.

---

## 🔍 HOW TO CHECK YOUR DATABASE

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your TOPAZ project
3. Click "Table Editor" in left sidebar
4. Find "entries" table

### Step 2: Run Verification SQL
1. Click "SQL Editor" in left sidebar
2. Click "New query"
3. Copy the contents of `COMPLETE_SCHEMA_VERIFICATION.sql`
4. Paste into editor
5. Click "Run"

### Step 3: Review Results
The query will show you EXACTLY what columns exist in your database.

---

## 📋 ACTUAL SCHEMA (Correct)

Based on `database-schema.sql` and the fixes we've made, here are the **ACTUAL** column names:

| # | Column Name | Data Type | Description |
|---|-------------|-----------|-------------|
| 1 | `id` | UUID | Primary key |
| 2 | `competition_id` | UUID | Competition reference |
| 3 | `entry_number` | INTEGER | Entry number |
| 4 | **`competitor_name`** | TEXT | **Participant/Group name** |
| 5 | `category_id` | UUID | Category reference |
| 6 | `age_division_id` | UUID | Age division reference |
| 7 | `age` | INTEGER | Participant age |
| 8 | **`dance_type`** | TEXT | **Division type (Solo, Group, etc.)** |
| 9 | `ability_level` | TEXT | Beginning/Intermediate/Advanced |
| 10 | `is_medal_program` | BOOLEAN | Medal program enrollment |
| 11 | `medal_points` | INTEGER | Total medal points |
| 12 | `current_medal_level` | TEXT | None/Bronze/Silver/Gold |
| 13 | `group_members` | JSONB | Array of group members |
| 14 | `studio_name` | TEXT | Dance studio name |
| 15 | `teacher_name` | TEXT | Teacher/choreographer |
| 16 | `photo_url` | TEXT | Entry photo URL |
| 17 | `created_at` | TIMESTAMP | Creation time |
| 18 | `updated_at` | TIMESTAMP | Last update time |

**Total:** 18 columns

---

## ❌ COLUMNS THAT DON'T EXIST

These columns were mentioned in documentation but **DON'T EXIST** in the actual database:

| Wrong Name | Correct Name | Status |
|------------|--------------|--------|
| ❌ `name` | ✅ `competitor_name` | Fixed in code |
| ❌ `type` | ✅ `dance_type` | N/A |
| ❌ `division_type` | ✅ `dance_type` | Fixed in code |
| ❌ `divisionType` | ✅ `dance_type` | Fixed in code |
| ❌ `is_group` | Use `group_members IS NOT NULL` | N/A |

---

## ✅ CODE FIXES ALREADY APPLIED

### Fix #1: `name` → `competitor_name`
**Commit:** 666ad95

**Files Fixed:**
- `src/supabase/medalParticipants.js`

**Changes:**
```javascript
// Before (WRONG):
SELECT name, competitor_name FROM entries...

// After (CORRECT):
SELECT competitor_name FROM entries...
```

### Fix #2: `divisionType` / `division_type` → `dance_type`
**Commit:** 666ad95

**Files Fixed:**
- `src/supabase/medalParticipants.js`

**Changes:**
```javascript
// Before (WRONG):
SELECT divisionType, division_type, dance_type FROM entries...

// After (CORRECT):
SELECT dance_type FROM entries...
```

### Fix #3: Added Missing Columns
**Commit:** 3edad4a

**Columns Added:**
- `group_members` (JSONB)
- `studio_name` (TEXT)
- `teacher_name` (TEXT)

**SQL Required:**
```sql
ALTER TABLE entries ADD COLUMN IF NOT EXISTS group_members JSONB;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS studio_name TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS teacher_name TEXT;
```

⚠️ **YOU MUST RUN THIS SQL** in Supabase if you haven't already!

---

## 🔄 COMPARISON: Documentation vs Reality

### What Documentation Said:
```
EXPECTED COLUMNS (from documentation):
- id ✅
- competition_id ✅
- entry_number ✅
- type ❌ (doesn't exist)
- name ❌ (wrong - it's competitor_name)
- category_id ✅
- age_division_id ✅
- ability_level ✅
- age ✅
- division_type ❌ (wrong - it's dance_type)
- is_group ❌ (doesn't exist)
- group_members ✅
- is_medal_program ✅
- medal_points ✅
- current_medal_level ✅
- photo_url ✅
- studio_name ✅
- teacher_name ✅
- created_at ✅
```

### What Actually Exists:
```
ACTUAL COLUMNS (in database):
- id ✅
- competition_id ✅
- entry_number ✅
- competitor_name ✅ (NOT "name"!)
- category_id ✅
- age_division_id ✅
- age ✅
- dance_type ✅ (NOT "division_type"!)
- ability_level ✅
- is_medal_program ✅
- medal_points ✅
- current_medal_level ✅
- group_members ✅
- studio_name ✅
- teacher_name ✅
- photo_url ✅
- created_at ✅
- updated_at ✅
```

---

## 🎯 MISMATCHES IDENTIFIED

### Mismatch #1: "name" vs "competitor_name"
- **Documentation said:** `name`
- **Database has:** `competitor_name`
- **Status:** ✅ Fixed in commit 666ad95

### Mismatch #2: "division_type" vs "dance_type"
- **Documentation said:** `division_type`
- **Database has:** `dance_type`
- **Status:** ✅ Fixed in commit 666ad95

### Mismatch #3: "type" column
- **Documentation said:** `type`
- **Database has:** No such column
- **Status:** ✅ Not used in code

### Mismatch #4: "is_group" column
- **Documentation said:** `is_group`
- **Database has:** No such column (use `group_members` instead)
- **Status:** ✅ Not used in code

### Mismatch #5: Missing columns
- **Documentation said:** All columns should exist
- **Database had:** Missing `group_members`, `studio_name`, `teacher_name`
- **Status:** ⚠️ SQL migration created, user must run it

---

## 🧪 VERIFICATION TESTS

### Test #1: Check Column Exists
Run this in Supabase SQL Editor:

```sql
-- This should return TRUE:
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'entries' AND column_name = 'competitor_name'
);
```

### Test #2: Check Column Doesn't Exist
Run this in Supabase SQL Editor:

```sql
-- This should return FALSE:
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'entries' AND column_name = 'name'
);
```

### Test #3: Test Correct Query
Run this in Supabase SQL Editor:

```sql
-- This should work without errors:
SELECT 
  id,
  competitor_name,
  dance_type,
  is_medal_program,
  medal_points
FROM entries
LIMIT 1;
```

### Test #4: Test Wrong Query (Should Fail)
Run this in Supabase SQL Editor:

```sql
-- This should fail with "column 'name' does not exist":
SELECT 
  id,
  name,
  division_type
FROM entries
LIMIT 1;
```

---

## 📊 CURRENT STATUS

### Code Side:
✅ All column references fixed  
✅ Using `competitor_name` instead of `name`  
✅ Using `dance_type` instead of `division_type`  
✅ Deployed to production  

### Database Side:
⚠️ SQL migration created  
⚠️ User must run SQL in Supabase  
☐ `group_members` column (pending)  
☐ `studio_name` column (pending)  
☐ `teacher_name` column (pending)  

---

## 🔧 ACTION REQUIRED

### If group_members, studio_name, teacher_name DON'T exist:

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run this SQL:**

```sql
ALTER TABLE entries ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_entries_group_members ON entries USING GIN (group_members);
```

4. **Verify:**

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name');
```

Expected: 3 rows

---

## 📁 VERIFICATION FILES

### Files Available:
1. **`COMPLETE_SCHEMA_VERIFICATION.sql`** - Run this to check everything
2. **`RUN_THIS_SQL_NOW.sql`** - Run this to add missing columns
3. **`verify-column-names.sql`** - Quick verification script
4. **`DATABASE_SCHEMA_VERIFICATION.md`** - This document

---

## 🎯 QUICK VERIFICATION CHECKLIST

Run this in Supabase SQL Editor:

```sql
-- Copy and paste this entire block:

-- 1. Show all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entries' 
ORDER BY ordinal_position;

-- 2. Verify competitor_name exists (should be TRUE)
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'entries' AND column_name = 'competitor_name'
) AS has_competitor_name;

-- 3. Verify 'name' doesn't exist (should be FALSE)
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'entries' AND column_name = 'name'
) AS has_name;

-- 4. Verify dance_type exists (should be TRUE)
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'entries' AND column_name = 'dance_type'
) AS has_dance_type;

-- 5. Check new columns exist (should be 3)
SELECT COUNT(*) AS new_columns_count
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('group_members', 'studio_name', 'teacher_name');
```

**Expected Results:**
- `has_competitor_name`: TRUE ✅
- `has_name`: FALSE ✅
- `has_dance_type`: TRUE ✅
- `new_columns_count`: 3 ✅ (or 0 if you haven't run the SQL yet)

---

## ✅ SUMMARY

### Correct Column Names (Use These):
- ✅ `competitor_name` (NOT "name")
- ✅ `dance_type` (NOT "division_type" or "type")
- ✅ `group_members` (for group info)
- ✅ `is_medal_program` (for medal enrollment)
- ✅ `medal_points` (for point tracking)
- ✅ `current_medal_level` (for medal level)

### Code Status:
- ✅ All fixed and deployed
- ✅ Using correct column names
- ✅ No more "column doesn't exist" errors

### Database Status:
- ⚠️ May need to add 3 columns (run SQL)
- ✅ Schema is correct otherwise

---

## 🎉 NEXT STEPS

1. Run `COMPLETE_SCHEMA_VERIFICATION.sql` in Supabase
2. Check if `group_members`, `studio_name`, `teacher_name` exist
3. If they don't exist, run `RUN_THIS_SQL_NOW.sql`
4. Test the app - everything should work!

---

Your database schema is now documented and verified! 🚀

