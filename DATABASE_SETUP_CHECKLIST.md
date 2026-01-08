# TOPAZ 2.0 - Database Setup Checklist for Ability Levels

## ⚠️ IMPORTANT: Complete These Steps Before Using the System

---

## ✅ Pre-Deployment Checklist

### Step 1: Determine Your Installation Type

**Are you setting up TOPAZ 2.0 for the first time?**
- [ ] YES → Follow "New Installation" path below
- [ ] NO → Follow "Existing Installation" path below

---

## 🆕 NEW INSTALLATION

### Step 1: Use Updated Schema
✅ The `database-schema.sql` file already includes ability levels
✅ No additional steps needed

### Step 2: Run Schema in Supabase
1. [ ] Open Supabase Dashboard
2. [ ] Go to SQL Editor
3. [ ] Copy entire contents of `database-schema.sql`
4. [ ] Paste into SQL Editor
5. [ ] Click "Run" button
6. [ ] Wait for success message

### Step 3: Verify Installation
Run this query in SQL Editor:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' AND column_name = 'ability_level';
```

Expected result:
```
column_name   | data_type | is_nullable
--------------|-----------|--------------
ability_level | text      | YES
```

✅ If you see the above, you're good to go!

---

## 🔄 EXISTING INSTALLATION

### Step 1: Back Up Your Database
⚠️ **CRITICAL**: Always back up before making changes!

1. [ ] Open Supabase Dashboard
2. [ ] Go to Database → Backups
3. [ ] Create manual backup
4. [ ] Wait for backup to complete
5. [ ] Download backup (optional but recommended)

### Step 2: Run Migration Script

1. [ ] Open Supabase Dashboard
2. [ ] Go to SQL Editor
3. [ ] Open the file: `ability-level-migration.sql`
4. [ ] Copy entire contents
5. [ ] Paste into SQL Editor
6. [ ] Review the script (especially the commented UPDATE statement)
7. [ ] Click "Run" button
8. [ ] Wait for success message

### Step 3: Verify Migration
Run this query:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'entries' AND column_name = 'ability_level';
```

Expected result:
```
column_name   | data_type | is_nullable
--------------|-----------|--------------
ability_level | text      | YES
```

✅ If you see the above, migration was successful!

### Step 4: Handle Existing Entries (OPTIONAL)

**Option A: Set Default Value for All**
⚠️ This will mark all existing entries as "Beginning"

```sql
UPDATE entries 
SET ability_level = 'Beginning' 
WHERE ability_level IS NULL;
```

**Option B: Update Manually**
View entries without ability level:
```sql
SELECT id, entry_number, competitor_name, ability_level
FROM entries
WHERE ability_level IS NULL
ORDER BY entry_number;
```

Update specific entry:
```sql
UPDATE entries 
SET ability_level = 'Advanced'  -- or 'Beginning' or 'Intermediate'
WHERE id = 'entry-uuid-here';
```

**Option C: Leave as NULL**
- Existing entries will work but won't appear in ability-filtered views
- You can update them later through the UI by deleting and re-adding

### Step 5: Verify Data
Check a sample entry:
```sql
SELECT entry_number, competitor_name, ability_level
FROM entries
ORDER BY entry_number
LIMIT 5;
```

---

## 🔍 Verification Queries

### Count Entries by Ability Level
```sql
SELECT 
    ability_level, 
    COUNT(*) as count
FROM entries
GROUP BY ability_level
ORDER BY ability_level;
```

Expected output (after adding entries):
```
ability_level | count
--------------+-------
Advanced      | 5
Beginning     | 8
Intermediate  | 3
(null)        | 2     ← Existing entries without level
```

### Check Constraint is Working
Try inserting invalid value (should FAIL):
```sql
-- This should give an error
INSERT INTO entries (competition_id, entry_number, competitor_name, ability_level)
VALUES ('test-comp-id', 999, 'Test Entry', 'Expert');
```

Expected: ❌ Error: "violates check constraint"
✅ If you get this error, the constraint is working correctly!

---

## 🚨 Troubleshooting

### Error: "column ability_level does not exist"
**Solution**: Run the migration script again
```sql
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS ability_level TEXT 
CHECK (ability_level IN ('Beginning', 'Intermediate', 'Advanced'));
```

### Error: "duplicate column name"
**Solution**: Column already exists, you're good! Proceed to verification.

### Migration runs but no column appears
**Solution**: 
1. Check you're connected to the correct database/project
2. Check table name is exactly `entries` (lowercase)
3. Refresh Supabase schema browser

### Can't save entries in UI
**Solution**: 
1. Verify column exists in database
2. Check browser console for errors
3. Verify you selected an ability level in the form
4. Clear browser cache and retry

---

## 📋 Post-Deployment Testing

After database setup is complete:

1. [ ] Create new competition
2. [ ] Add entry with "Beginning" level
3. [ ] Add entry with "Intermediate" level  
4. [ ] Add entry with "Advanced" level
5. [ ] Go to Scoring Interface
6. [ ] Filter by each ability level
7. [ ] Go to Results Page
8. [ ] Click each ability level button
9. [ ] Generate PDF for an entry
10. [ ] Export to Excel
11. [ ] Verify ability level appears in all exports

---

## ✅ Final Checklist

Before going live:
- [ ] Database migration successful
- [ ] Verification queries pass
- [ ] Can add new entries with ability levels
- [ ] Filters work in Scoring Interface
- [ ] Filters work in Results Page
- [ ] PDFs include ability level
- [ ] Excel exports include ability level
- [ ] No console errors in browser
- [ ] Tested on desktop browser
- [ ] Tested on mobile browser (optional)

---

## 🎉 You're Ready!

Once all items are checked, your TOPAZ 2.0 system is ready to use ability levels!

---

## 📞 Need Help?

If you encounter issues:
1. Check error messages in browser console (F12)
2. Check Supabase logs for database errors
3. Verify all code files were updated correctly
4. Review the ABILITY_LEVELS_README.md for detailed info

---

**TOPAZ 2.0 © 2025 | Heritage Since 1972**

Good luck with your competition! 🎭💃🕺

