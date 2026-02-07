# 📸 BULK PHOTO UPLOAD - FEATURE GUIDE

## ✅ GOOD NEWS: Already Implemented!

The bulk photo upload feature is **already built and working** in your TOPAZ app! Here's how to use it on competition day.

---

## 🚀 HOW TO ACCESS

### Method 1: After Setting Up Competition

1. Go to **Competition Setup**
2. Fill in competition details
3. Select categories
4. Add entries
5. Click **"Continue to Judge Selection"** to save
6. **Immediately after saving**, you'll see a purple button:
   ```
   📸 Bulk Photo Upload Manager
   [Open Photo Manager →]
   ```
7. Click to open the bulk upload interface

---

## 📱 BULK UPLOAD INTERFACE

### What You'll See:

```
┌─────────────────────────────────────────────────────────┐
│ 📸 Photo Upload Manager                                  │
│ Competition Day - Quick Photo Upload                  [×]│
├─────────────────────────────────────────────────────────┤
│ Stats                                                    │
│ [50 Total]  [15 Missing Photos]  [35 Photos Uploaded]   │
├─────────────────────────────────────────────────────────┤
│ 📤 Bulk Photo Upload                                     │
│                                                          │
│ Upload multiple photos at once. Name files as:          │
│ 5.jpg for Entry #5                                      │
│                                                          │
│ [📁 Select Multiple Photos]                             │
│                                                          │
│ 💡 Tips:                                                │
│ • Rename files to match entry numbers                   │
│ • Supported: JPG, PNG                                   │
│ • Auto-compressed if > 1MB                              │
│ • Select all photos at once                             │
├─────────────────────────────────────────────────────────┤
│ Entries Needing Photos (15)                             │
│                                                          │
│ Entry #1 - John Doe (Tap Variety A)     [Upload Photo] │
│ Entry #5 - Jane Smith (Jazz)            [Upload Photo] │
│ Entry #12 - Bob Wilson (Ballet)         [Upload Photo] │
│                                                          │
│ Entries With Photos (35)                                │
│                                                          │
│ Entry #2 - Alice Brown (Hip Hop)        [✓] [Replace]  │
│ Entry #3 - Charlie Davis (Vocal)        [✓] [Replace]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 BULK UPLOAD WORKFLOW

### Step 1: Prepare Photos

**Rename your photo files to match entry numbers:**

```
Before:                    After:
IMG_1234.jpg      →       1.jpg
DSC_5678.jpg      →       5.jpg
photo-999.jpg     →       12.jpg
dancer_abc.png    →       15.png
```

**Supported naming patterns:**
- `1.jpg` → Entry #1 ✅
- `5.png` → Entry #5 ✅
- `entry-12.jpg` → Entry #12 ✅
- `dancer_3.png` → Entry #3 ✅
- `photo-7.jpeg` → Entry #7 ✅

**The system extracts the first number from the filename!**

---

### Step 2: Select Multiple Photos

1. Click **"📁 Select Multiple Photos"** button
2. In file picker:
   - **Windows:** Ctrl+Click to select multiple, or Ctrl+A for all
   - **Mac:** Cmd+Click to select multiple, or Cmd+A for all
3. Click "Open"

---

### Step 3: Preview Matches

After selecting files, you'll see a **Preview Matches** section:

```
Preview Matches
─────────────────────────────────────────
✓  1.jpg  →  Entry #1 - John Doe          [Green - Matched]
✓  5.jpg  →  Entry #5 - Jane Smith        [Green - Matched]
⚠️ 99.jpg  →  No matching entry found!     [Red - Unmatched]
✓  12.jpg →  Entry #12 - Bob Wilson       [Green - Matched]
─────────────────────────────────────────
Matched: 3 files  |  Unmatched: 1 file

[Cancel]  [Upload 3 Matched Photos]
```

---

### Step 4: Upload!

1. Review matches
2. Click **"Upload X Matched Photos"** button
3. Watch progress: "Uploading 1/3..."
4. **Success! ✅**
   - Toast notification: "✅ 3 photos uploaded successfully!"
   - Entries automatically reload
   - Photos appear in entry list

---

## 💪 FEATURES

### ✅ Auto-Matching
- Extracts entry number from filename
- Matches to corresponding entry
- Shows preview before upload
- Only uploads matched files

### ✅ Image Compression
- Automatically compresses images > 1MB
- Maintains quality
- Saves storage space
- Faster uploads

### ✅ Progress Tracking
- Shows "Uploading X/Y..." during bulk upload
- Individual progress for each photo
- Success/error notifications

### ✅ Individual Upload Fallback
- Each entry has its own "Upload Photo" button
- Use for entries that didn't auto-match
- Or to replace existing photos

### ✅ Smart Sorting
- **Entries needing photos** shown first (red section)
- **Entries with photos** shown second (green section)
- Easy to see what's missing

---

## 🎓 COMPETITION DAY WORKFLOW

### Recommended Process:

**Before Competition:**
1. Set up competition in TOPAZ
2. Add all entries (without photos)
3. Save competition

**On Competition Day:**
1. Take photos of dancers with tablet/phone
2. Transfer photos to computer
3. Rename files: `1.jpg`, `2.jpg`, `3.jpg`, etc.
4. Open TOPAZ → Open Photo Manager
5. Click "Select Multiple Photos"
6. Select all renamed files
7. Review matches
8. Click "Upload X Matched Photos"
9. Done! ✨

**Time Saved:**
- **Manual:** ~2-3 minutes per entry (50 entries = 100-150 minutes)
- **Bulk:** ~10-15 minutes for all 50 entries
- **Savings:** ~90% faster!

---

## 🔧 TECHNICAL DETAILS

### File Matching Logic:
```javascript
// Extracts first number from filename
"1.jpg"         → 1
"entry-12.jpg"  → 12
"dancer_5.png"  → 5
"photo7.jpeg"   → 7
"IMG_999.jpg"   → 999
```

### Upload Process:
```
1. Select files
2. Parse filenames → extract entry numbers
3. Match to entries in database
4. Show preview of matches
5. User confirms
6. For each matched file:
   a. Compress if > 1MB
   b. Upload to Supabase Storage (entry-photos bucket)
   c. Get public URL
   d. Update entry.photo_url in database
7. Reload entries to show new photos
```

### Storage:
- **Bucket:** `entry-photos`
- **Path:** `{competition_id}/{entry_id}_{timestamp}.{ext}`
- **Example:** `abc123/def456_1706543210000.jpg`

---

## 🐛 TROUBLESHOOTING

### "Failed to upload photo" errors

**Cause:** Supabase Storage bucket not configured

**Fix:** See `STORAGE_BUCKET_SETUP_INSTRUCTIONS.md`
1. Create `entry-photos` bucket in Supabase
2. Set as **Public**
3. Run storage policies SQL

---

### Photos not auto-matching

**Cause:** Filenames don't contain entry numbers

**Fix:** Rename files to include entry numbers:
- `dancer.jpg` → `5.jpg` (if this is Entry #5)
- Make sure number matches `entry_number` field

---

### Some photos matched, some didn't

**Solution:** Use individual upload for unmatched ones:
1. Scroll to specific entry in list
2. Click **"Upload Photo"** button
3. Select the photo manually
4. Upload

---

### "No matching entry found" for all files

**Cause:** Entry numbers in filenames don't match database

**Check:**
1. What are your actual entry numbers? (Check entries list)
2. Do filenames contain those numbers?
3. Example: If entry is #12 but file is `dancer_5.jpg`, it won't match

**Fix:** Rename files to match actual entry numbers

---

### Photos upload but don't show in list

**Cause:** List not reloading after upload

**Fix:** Close and reopen Photo Manager, or refresh page

---

## 📊 FEATURE COMPARISON

| Feature | Manual Upload | Bulk Upload |
|---------|---------------|-------------|
| **Time for 50 entries** | ~100-150 min | ~10-15 min |
| **Clicks per photo** | 3-4 clicks | 1 click (all at once) |
| **Preview before upload** | ❌ | ✅ |
| **Auto-matching** | ❌ | ✅ |
| **Progress tracking** | ❌ | ✅ |
| **Error handling** | Limited | Detailed |
| **Compression** | ✅ | ✅ |

---

## 💡 PRO TIPS

### Tip 1: Use Sequential Entry Numbers
When creating entries, use sequential numbers (1, 2, 3, 4...) instead of random numbers. Makes photo naming easier!

### Tip 2: Batch Rename Photos
Use bulk rename tools:
- **Windows:** PowerToys PowerRename, or File Explorer (F2 → name → Enter)
- **Mac:** Automator or Finder (Select all → Right-click → Rename)
- **Online:** Bulk Rename Utility

### Tip 3: Take Photos in Entry Number Order
When photographing dancers:
1. Print entry list sorted by number
2. Call Entry #1 first, take photo
3. Call Entry #2 next, take photo
4. Photos are already in order!

### Tip 4: Double-Check Matches
Always review the preview matches before clicking upload. Saves time if numbers are wrong.

### Tip 5: Keep Original Photos
Keep a backup of original (uncompressed) photos for print programs or awards.

---

## 🎯 ACCEPTANCE CRITERIA - ALL MET ✅

| Requirement | Status | Notes |
|-------------|--------|-------|
| Bulk photo upload page | ✅ Done | PhotoUploadManager component |
| Shows entries with photo status | ✅ Done | Split into needs/has photos |
| Upload multiple photos at once | ✅ Done | Multi-file input |
| Auto-match photos by filename | ✅ Done | Extracts entry numbers |
| Preview matches before upload | ✅ Done | Shows matched/unmatched |
| Bulk upload to Supabase | ✅ Done | With progress tracking |
| Updates photo_url for all | ✅ Done | After successful upload |
| Progress indicator | ✅ Done | "Uploading X/Y..." |
| Error handling | ✅ Done | Shows success/fail counts |
| Mobile/iPad responsive | ✅ Done | Responsive grid layout |

---

## 🚀 QUICK START CHECKLIST

Before using bulk upload on competition day:

- [ ] **Supabase Storage configured** (see STORAGE_BUCKET_SETUP_INSTRUCTIONS.md)
- [ ] **Photos taken** of all dancers
- [ ] **Photos transferred** to computer
- [ ] **Photos renamed** with entry numbers (1.jpg, 2.jpg, etc.)
- [ ] **Competition saved** in TOPAZ
- [ ] **Photo Manager opened** (purple button after saving)

---

## 📞 SUPPORT

If bulk upload isn't working:
1. Check Supabase Storage bucket setup
2. Verify photo filenames contain entry numbers  
3. Check browser console for errors (F12)
4. Ensure photos are JPG or PNG format
5. Try individual upload as fallback

---

**The bulk photo upload feature is ready to use right now!** 🚀📸

Just make sure your Supabase Storage bucket is set up (see other guide), and you're good to go!





