# 🔧 PHOTO UPLOAD FIX GUIDE

## 🔍 DIAGNOSIS: What Was the Problem?

After investigating the code, I found that **the photo upload functionality is actually well-implemented**, but it's likely failing due to **Supabase Storage bucket configuration issues**.

### Root Cause:
The `entry-photos` storage bucket either:
1. **Doesn't exist** in your Supabase project
2. **Has incorrect permissions** (not allowing authenticated uploads)
3. **Is set to private** instead of public

### How Photo Upload Works:
```
User selects image
    ↓
PhotoUpload component compresses image (if > 1MB)
    ↓
File passed to parent via callback
    ↓
On save: uploadEntryPhoto() called
    ↓
Uploads to Supabase Storage bucket "entry-photos"
    ↓
Returns public URL
    ↓
URL saved to entry.photo_url in database
```

---

## ✅ THE FIX

### Step 1: Create Storage Bucket (Manual - REQUIRED)

**You MUST do this in Supabase Dashboard:**

1. Go to your Supabase project dashboard
2. Navigate to: **Storage** (in left sidebar)
3. Click **"New bucket"**
4. Configure:
   - **Name:** `entry-photos`
   - **Public bucket:** ✅ **CHECKED** (very important!)
   - **File size limit:** 5MB (or higher)
   - **Allowed MIME types:** Leave empty (allows all image types)
5. Click **"Create bucket"**

**Screenshot of what you should see:**
```
┌─────────────────────────────────┐
│ Create a new bucket             │
├─────────────────────────────────┤
│ Name: entry-photos              │
│                                 │
│ ☑ Public bucket                 │  ← MUST BE CHECKED!
│                                 │
│ File size limit: 5 MB           │
│                                 │
│ Allowed MIME types:             │
│ (leave empty for all types)     │
│                                 │
│ [Cancel]  [Create bucket]       │
└─────────────────────────────────┘
```

---

### Step 2: Set Up Storage Policies (SQL)

After creating the bucket, run this SQL in Supabase SQL Editor:

**File:** `topaz-scoring/fix-photo-upload-storage.sql`

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload entry photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'entry-photos');

-- Allow public to view
CREATE POLICY "Anyone can view entry photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'entry-photos');

-- Allow authenticated to update
CREATE POLICY "Authenticated users can update entry photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'entry-photos')
WITH CHECK (bucket_id = 'entry-photos');

-- Allow authenticated to delete
CREATE POLICY "Authenticated users can delete entry photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'entry-photos');
```

---

### Step 3: Verify Setup

Run this query in Supabase SQL Editor to verify bucket exists:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'entry-photos';

-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%entry photo%';
```

**Expected output:**
```
Bucket query: 1 row (entry-photos, public=true)
Policies query: 4 rows (INSERT, SELECT, UPDATE, DELETE)
```

---

## 🧪 TESTING PHOTO UPLOAD

### Test 1: Small Image (< 1MB)

1. Go to Competition Setup
2. Click "Add Entry"
3. Fill in required fields
4. Click "Upload Photo"
5. Select a **small image** (< 1MB)
6. **Expected:**
   - ✅ Preview appears immediately
   - ✅ No compression message
   - ✅ Entry saves with photo

### Test 2: Large Image (> 1MB)

1. Click "Add Entry" again
2. Click "Upload Photo"
3. Select a **large image** (> 1MB)
4. **Expected:**
   - 🔄 "Compressing image..." toast
   - ✅ "Image compressed from X.XXM to Y.YYM" toast
   - ✅ Preview appears
   - ✅ Entry saves with photo

### Test 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading a photo
4. **Look for:**
   - ✅ "Uploading photo for entry: [id]"
   - ✅ "✅ Photo uploaded: [url]"
   - ❌ Any red errors (indicates problem)

### Test 4: Verify in Supabase

1. Go to Supabase Dashboard → Storage → entry-photos
2. You should see uploaded files organized by competition ID
3. Click on a file to view it
4. Copy the public URL
5. Paste in browser - image should load

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to upload photo"

**Cause:** Bucket doesn't exist or wrong permissions

**Fix:**
1. Check Supabase Dashboard → Storage
2. Verify `entry-photos` bucket exists
3. Check bucket is marked as **Public**
4. Run storage policies SQL (Step 2)

---

### Error: "Access denied" or 403

**Cause:** Storage policies not set correctly

**Fix:**
1. Go to Supabase Dashboard → Storage → entry-photos
2. Click "Policies" tab
3. You should see 4 policies (INSERT, SELECT, UPDATE, DELETE)
4. If missing, run the SQL from Step 2

---

### Error: "Image not showing after upload"

**Cause:** Bucket is private instead of public

**Fix:**
1. Go to Supabase Dashboard → Storage → entry-photos
2. Click settings (gear icon)
3. Check "Public bucket" checkbox
4. Save changes

---

### Photo uploads but doesn't appear on entry

**Cause:** photo_url not being saved to database

**Check:**
1. Run this query in Supabase:
   ```sql
   SELECT id, competitor_name, photo_url 
   FROM entries 
   WHERE competition_id = '[your-competition-id]'
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
2. photo_url should have a value like:
   `https://[project].supabase.co/storage/v1/object/public/entry-photos/[comp-id]/[entry-id]_[timestamp].jpg`

**Fix:**
- Ensure `uploadEntryPhoto()` is being called before saving entry
- Check that the returned URL is being saved to entry.photo_url

---

### Photos upload on setup but not on edit

**Cause:** Edit functionality might not be calling upload

**Check:** Entry edit form implementation (if exists)

---

## 📋 CHECKLIST

Before reporting photo upload as "not working", verify:

- [ ] Storage bucket `entry-photos` exists in Supabase
- [ ] Bucket is marked as **Public**
- [ ] Storage policies are created (4 total)
- [ ] Browser console shows no errors during upload
- [ ] Test with small image (< 1MB) first
- [ ] Test with large image (> 1MB) to verify compression
- [ ] Check Supabase Storage to see if files are uploading
- [ ] Check entries table to see if photo_url is being saved

---

## 💡 WHY THIS IS THE MOST LIKELY ISSUE

### Code Analysis:

1. **PhotoUpload.jsx** ✅
   - File validation: ✓
   - Compression logic: ✓
   - Preview generation: ✓
   - Callback to parent: ✓

2. **photos.js** ✅
   - Image compression: ✓
   - Supabase upload: ✓
   - Public URL generation: ✓
   - Error handling: ✓

3. **CompetitionSetup.jsx** ✅
   - Photo file state management: ✓
   - Upload call before save: ✓
   - URL saved to database: ✓

**Conclusion:** The code is correct. The issue is **infrastructure** (Supabase bucket not configured).

---

## 🚀 AFTER THE FIX

Once the storage bucket is properly configured:

1. **User Experience:**
   - Click "Upload Photo" button
   - Select image from device
   - Image compresses automatically (if > 1MB)
   - Preview appears immediately
   - Save entry
   - Photo uploads to Supabase
   - Photo URL saved to database
   - Photo displays on entries list

2. **What Judges/Users Will See:**
   - Entry photos on scoring interface
   - Photos on results page
   - Photos in PDF scorecards
   - Photos in bulk photo manager

---

## 📞 SUPPORT

If photo upload still doesn't work after following this guide:

1. Share screenshot of Supabase Storage buckets page
2. Share screenshot of bucket policies page
3. Share browser console output when uploading
4. Share result of verification SQL queries
5. Provide competition ID and entry ID for testing

---

**Most likely fix:** Create the `entry-photos` bucket in Supabase Dashboard with Public access enabled!

**Build Status:** Code is already correct, no rebuild needed.  
**Deploy Status:** Infrastructure fix (Supabase config), not code deployment.





