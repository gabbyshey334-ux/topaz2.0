# 🚨 URGENT: Database Migration Required

## Error You're Seeing:
```
Failed to save: Could not find the 'is_medal_program' column of 'entries' in the schema cache
```

## What Happened:
The Medal Program feature requires a new column (`is_medal_program`) in your database that hasn't been added yet.

---

## 🔧 FIX THIS NOW (5 minutes):

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your TOPAZ project
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run This SQL Command
Copy and paste the following SQL into the SQL Editor and click **"Run"**:

```sql
-- Add is_medal_program column to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS is_medal_program BOOLEAN DEFAULT FALSE;

-- Ensure other medal columns exist (they should, but just in case)
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS medal_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_medal_level TEXT DEFAULT 'None';

-- Update existing entries if they were already marked in dance_type
UPDATE entries 
SET is_medal_program = TRUE 
WHERE dance_type LIKE '%Medal: true%';
```

### Step 3: Verify Success
You should see:
```
Success. No rows returned
```

### Step 4: Test Your App
1. Refresh your browser (F5 or Cmd+R)
2. Try creating a new competition
3. Should work now! ✅

---

## Alternative: View/Edit Database Table Directly

If SQL Editor doesn't work:

1. Go to **"Table Editor"** in Supabase
2. Select **"entries"** table
3. Click **"Edit columns"** (gear icon)
4. Add new column:
   - Name: `is_medal_program`
   - Type: `boolean`
   - Default Value: `false`
   - NOT NULL: ✓ (checked)
5. Click **"Save"**

---

## Temporary Workaround Applied

I've updated the code to handle the missing column gracefully. The app will:
- ✅ Save competitions WITHOUT Medal Program data if column is missing
- ✅ Show a warning in console
- ✅ Automatically use Medal Program once you add the column

**But you MUST run the migration above to get full Medal Program functionality!**

---

## Need Help?

If you see other errors after running the migration:

1. Check browser console (F12 → Console tab)
2. Share the exact error message
3. I'll help you fix it immediately

---

## Files Included:

- `medal-program-migration.sql` - The SQL migration file
- This guide - `URGENT_DATABASE_UPDATE.md`

**Run the SQL now to fix this issue!** 🚀





