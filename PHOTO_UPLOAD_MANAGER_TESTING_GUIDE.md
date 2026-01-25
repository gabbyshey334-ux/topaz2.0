# 📸 Photo Upload Manager - Testing Guide

## Pre-Testing Setup

### 1. Ensure Competition is Saved
- Go to Competition Setup page
- Fill out competition details
- Add at least 5 entries
- **Important**: Some entries should NOT have photos
- Click "Save Competition & Continue"

### 2. Prepare Test Photos
Create or download 5-10 test photos and rename them:

```bash
# Rename photos to match entry numbers
1.jpg  (matches Entry #1)
2.jpg  (matches Entry #2)
3.jpg  (matches Entry #3)
5.jpg  (matches Entry #5)
99.jpg (no match - for testing unmatched files)
```

---

## Test Cases

### Test 1: Access Photo Upload Manager
**Steps:**
1. On Competition Setup page, look for "Photo Upload Options" section
2. Verify "Open Photo Manager" button is visible
3. Click "Open Photo Manager"

**Expected Result:**
✅ Photo Upload Manager modal opens
✅ Stats show correct counts (Total, Missing, Uploaded)
✅ Modal is centered and scrollable

---

### Test 2: Bulk Upload - All Matching Files
**Steps:**
1. Click "📁 Select Multiple Photos"
2. Select files: 1.jpg, 2.jpg, 3.jpg
3. Wait for preview

**Expected Result:**
✅ Preview shows 3 files
✅ All files show ✓ (green checkmark)
✅ Each file shows: "Entry #X: [Competitor Name]"
✅ File sizes displayed
✅ "Upload 3 Photos" button enabled

**Steps (continued):**
4. Click "Upload 3 Photos"

**Expected Result:**
✅ Progress bar appears
✅ Counter updates: "Uploading 1/3", "2/3", "3/3"
✅ Toast notification: "✅ 3 photos uploaded successfully!"
✅ Stats update (Missing Photos decreases by 3)
✅ Preview closes automatically
✅ Uploaded entries removed from individual upload list

---

### Test 3: Bulk Upload - Some Unmatched Files
**Steps:**
1. Click "📁 Select Multiple Photos"
2. Select files: 1.jpg, 99.jpg (where Entry #99 doesn't exist)
3. Wait for preview

**Expected Result:**
✅ Preview shows 2 files
✅ 1.jpg shows ✓ (green) - matched
✅ 99.jpg shows ⚠️ (warning) - "No match - Entry #99 doesn't exist"
✅ "Upload 1 Photos" button enabled (only matched files count)

**Steps (continued):**
4. Click "Upload 1 Photos"

**Expected Result:**
✅ Only matched file uploads
✅ Toast: "✅ 1 photos uploaded successfully!"
✅ Unmatched file (99.jpg) ignored

---

### Test 4: Individual Photo Upload
**Steps:**
1. Scroll to "Individual Photo Upload" section
2. Find an entry without a photo
3. Click "📷 Upload Photo" button
4. Select a photo file

**Expected Result:**
✅ Button changes to "⏳ Uploading..."
✅ Loading spinner appears
✅ Toast notification: "Photo uploaded for [Competitor Name]"
✅ Entry disappears from list (now has photo)
✅ Stats update (Missing Photos -1, Photos Uploaded +1)

---

### Test 5: Large File Compression
**Steps:**
1. Find or create a photo > 1MB (ideally 2-5MB)
2. Rename to match an entry (e.g., 5.jpg)
3. Upload via bulk or individual method

**Expected Result:**
✅ Upload completes without error
✅ File is automatically compressed
✅ Check browser console: "Compressed image size: [less than 1MB]"
✅ Photo displays correctly in the app

---

### Test 6: All Photos Uploaded - Success State
**Steps:**
1. Upload photos for all entries
2. Wait for all uploads to complete

**Expected Result:**
✅ Stats show: Missing Photos = 0, Photos Uploaded = Total Entries
✅ Success screen displays:
   - ✅ checkmark icon
   - "All Photos Uploaded!"
   - "Every entry has a photo. Great job! 🎉"
✅ Individual upload list is empty
✅ Bulk upload section still available (for re-uploads)

---

### Test 7: Close and Reopen Modal
**Steps:**
1. Upload some photos (not all)
2. Click "Close" button
3. Click "Open Photo Manager" again

**Expected Result:**
✅ Modal reopens
✅ Stats reflect current state
✅ Previously uploaded photos NOT in the list
✅ Only entries without photos shown

---

### Test 8: Cancel Bulk Upload Preview
**Steps:**
1. Click "📁 Select Multiple Photos"
2. Select files
3. Wait for preview
4. Click "Cancel"

**Expected Result:**
✅ Preview closes
✅ No files uploaded
✅ Stats unchanged
✅ Can select files again

---

### Test 9: Error Handling - Invalid File Type
**Steps:**
1. Try to upload a .pdf, .txt, or .doc file

**Expected Result:**
✅ File picker doesn't show unsupported file types
✅ File input only accepts: image/jpeg, image/png

---

### Test 10: Mobile Responsiveness
**Steps:**
1. Open browser DevTools
2. Switch to mobile view (iPhone 12, 375px width)
3. Open Photo Upload Manager

**Expected Result:**
✅ Modal fits mobile screen
✅ Stats stack vertically
✅ Buttons are touch-friendly (min-height: 48px)
✅ Text is readable
✅ Scrollable sections work on touch
✅ No horizontal overflow

---

### Test 11: Multiple Consecutive Uploads
**Steps:**
1. Upload 2-3 photos (bulk or individual)
2. Immediately upload 2-3 more
3. Repeat

**Expected Result:**
✅ Each upload completes successfully
✅ No conflicts or race conditions
✅ Stats update correctly after each upload
✅ Toast notifications don't stack weirdly

---

### Test 12: Network Error Simulation
**Steps:**
1. Open DevTools → Network tab
2. Throttle to "Offline"
3. Try to upload a photo

**Expected Result:**
✅ Upload fails gracefully
✅ Error toast displayed
✅ Console shows error message
✅ Modal still functional
✅ Can retry after reconnecting

---

## Edge Cases

### Edge Case 1: Entry Numbers with Leading Zeros
**Test:**
- File named: 01.jpg, 05.jpg, 009.jpg
- Should match Entry #1, #5, #9

**Expected:**
✅ parseInt() handles leading zeros correctly

---

### Edge Case 2: Multiple Numbers in Filename
**Test:**
- File named: entry_5_photo_2.jpg
- Should match Entry #5 (first number extracted)

**Expected:**
✅ Matches Entry #5 (regex finds first number)

---

### Edge Case 3: No Entries Without Photos
**Test:**
- All entries already have photos
- Open Photo Upload Manager

**Expected:**
✅ Success state immediately visible
✅ Individual upload list empty
✅ Bulk upload still available

---

### Edge Case 4: Very Long Entry/Competitor Names
**Test:**
- Entry with name: "Sarah Elizabeth Montgomery-Williams III"
- Upload photo

**Expected:**
✅ Name displays without breaking layout
✅ Text wraps or truncates gracefully

---

## Performance Testing

### Performance Test 1: Bulk Upload 20+ Photos
**Steps:**
1. Prepare 20 test photos (1.jpg through 20.jpg)
2. Select all at once
3. Upload

**Expected:**
✅ Preview loads quickly (< 1 second)
✅ Upload progress visible
✅ All photos upload successfully
✅ No browser freezing or lag
✅ Upload completes in reasonable time (< 30 seconds)

---

### Performance Test 2: Large Photo Files
**Steps:**
1. Upload a 10MB photo

**Expected:**
✅ Compression works
✅ Upload completes
✅ Check final file size (should be < 1MB)

---

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Tab order is logical
- ✅ Enter/Space keys activate buttons
- ✅ Screen reader announces upload status
- ✅ High contrast mode support
- ✅ Touch targets are 48x48px minimum

---

## Console Checks

Open browser console and verify:
- ✅ No React errors
- ✅ No Supabase errors (unless expected)
- ✅ Upload progress logged
- ✅ Compression stats logged
- ✅ Success confirmations logged

---

## Database Verification

After uploads, check Supabase:
1. Go to Supabase dashboard
2. Open "entries" table
3. Check `photo_url` column

**Expected:**
✅ URLs present for uploaded entries
✅ URLs accessible (open in browser)
✅ Photos display correctly

---

## Storage Verification

Check Supabase Storage:
1. Go to Storage → "entry-photos" bucket
2. Navigate to competition folder

**Expected:**
✅ Folders match competition IDs
✅ Files named: `[entryId]_[timestamp].jpg`
✅ Files are under 1MB
✅ Photos viewable in storage browser

---

## Cleanup After Testing

1. Delete test competition (if desired)
2. Remove test photos from Storage
3. Clear browser cache
4. Test with fresh data

---

## Bug Report Template

If you find a bug:

```markdown
**Bug Title**: [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Browser:** [Chrome 120, Firefox 121, etc.]
**Device:** [Desktop, iPhone 12, etc.]
**Console Errors:** [Copy/paste any errors]
**Screenshots:** [If applicable]
```

---

## Success Criteria

All tests pass if:
✅ Bulk upload works with 100% matched files
✅ Bulk upload works with partial matches
✅ Individual upload works
✅ File compression works (>1MB → <1MB)
✅ Stats update correctly
✅ Success state displays when complete
✅ Mobile responsive
✅ Error handling is graceful
✅ Performance is acceptable
✅ No console errors (except expected network errors)

---

**Testing Status**: Ready for Testing
**Last Updated**: January 25, 2026

