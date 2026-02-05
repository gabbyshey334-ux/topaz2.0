# 📸 STORAGE BUCKET SETUP - QUICK INSTRUCTIONS

## ⚠️ PHOTO UPLOAD NOT WORKING? DO THIS FIRST!

The photo upload feature requires a Supabase Storage bucket called `entry-photos`. You must create this manually.

---

## 🚀 QUICK FIX (5 minutes)

### Step 1: Create Bucket (Supabase Dashboard)

1. Open your Supabase project: https://supabase.com/dashboard/project/[your-project-id]

2. Click **"Storage"** in left sidebar

3. Click **"New bucket"** button (top right)

4. Fill in:
   ```
   Name: entry-photos
   ☑ Public bucket  ← CHECK THIS BOX!
   File size limit: 5
   Allowed MIME types: (leave empty)
   ```

5. Click **"Create bucket"**

---

### Step 2: Add Storage Policies (SQL Editor)

1. Click **"SQL Editor"** in left sidebar

2. Click **"New query"**

3. Copy and paste this SQL:

```sql
-- Allow uploads
CREATE POLICY "Authenticated users can upload entry photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'entry-photos');

-- Allow viewing
CREATE POLICY "Anyone can view entry photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'entry-photos');

-- Allow updates
CREATE POLICY "Authenticated users can update entry photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'entry-photos')
WITH CHECK (bucket_id = 'entry-photos');

-- Allow deletes
CREATE POLICY "Authenticated users can delete entry photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'entry-photos');
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)

5. You should see: **"Success. No rows returned"**

---

### Step 3: Verify It Works

1. Go back to your TOPAZ app

2. Navigate to Competition Setup

3. Click "Add Entry"

4. Click "Upload Photo"

5. Select an image

6. **✅ Success:** Preview appears, entry saves with photo

7. **❌ Still broken:** Check troubleshooting below

---

## 🔍 VERIFY BUCKET EXISTS

Run this in Supabase SQL Editor:

```sql
SELECT name, public FROM storage.buckets WHERE name = 'entry-photos';
```

**Expected result:**
```
name          | public
--------------+--------
entry-photos  | true
```

If you get **no rows**, the bucket doesn't exist. Go back to Step 1.

If `public` is `false`, edit the bucket settings and check the "Public bucket" box.

---

## 🐛 TROUBLESHOOTING

### "Failed to upload photo" error

**Fix:** Bucket doesn't exist or isn't public
- Go to Supabase Dashboard → Storage
- Check if `entry-photos` exists
- Check if it's marked as Public
- Re-create if needed

### Upload works but photo doesn't show

**Fix:** Bucket is private
- Go to Storage → entry-photos → Settings (gear icon)
- Check "Public bucket" box
- Save

### "Access denied" error

**Fix:** Missing storage policies
- Run the SQL from Step 2 again
- Verify with: `SELECT * FROM pg_policies WHERE tablename = 'objects'`

---

## ✅ THAT'S IT!

Once the bucket is created and policies are set, photo uploads will work perfectly.

The code is already correct - you just needed the infrastructure setup!

---

**Need help?** Check `PHOTO_UPLOAD_FIX_GUIDE.md` for detailed troubleshooting.




