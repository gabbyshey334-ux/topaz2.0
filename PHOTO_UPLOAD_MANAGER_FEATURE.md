# 📸 Photo Upload Manager Feature

## Overview
The Photo Upload Manager is a comprehensive solution for quickly adding photos to competition entries on competition day, especially for entries that came from online registration without photos.

## Use Case
When entries come from online registration, they typically don't have photos. Competition staff need a fast, efficient way to upload photos during the event.

## Location
- **Component**: `src/components/PhotoUploadManager.jsx`
- **Access**: Via "Open Photo Manager" button on Competition Setup page
- **Availability**: Appears after competition is saved

## Features

### 1. Dashboard View
- **Statistics Display**:
  - Total Entries
  - Missing Photos (entries without photos)
  - Photos Uploaded (entries with photos)
- **Real-time Updates**: Stats update after each upload

### 2. Bulk Photo Upload

#### File Selection
- Multiple file upload support
- Accepts: `.jpg`, `.jpeg`, `.png`
- Auto-compression for files > 1MB

#### Auto-Matching Logic
- Naming convention: `[entry_number].jpg`
- Examples:
  - `5.jpg` → Entry #5
  - `12.jpg` → Entry #12
  - `99.jpg` → No match (if entry doesn't exist)

#### Upload Flow
1. **Step 1**: Select multiple photo files
2. **Step 2**: Preview matches:
   ```
   ✓ 5.jpg → Entry #5: Sarah Johnson
   ✓ 12.jpg → Entry #12: Dynamic Duo
   ⚠️ 99.jpg → No match - Entry #99 doesn't exist
   ```
3. **Step 3**: Review matched vs. unmatched files
4. **Step 4**: Confirm and upload all matched photos
5. **Step 5**: Photos auto-compress if > 1MB
6. **Step 6**: Upload to Supabase storage
7. **Step 7**: Update `entries.photo_url` in database

#### Progress Tracking
- Real-time upload progress bar
- Counter: "Uploading X / Y"
- Success/failure indicators

### 3. Individual Photo Upload

#### Entry List
- Shows all entries without photos
- Displays:
  - Entry number
  - Competitor name
  - Dance type (Solo/Group indicator)
  - Age

#### Upload Process
- Click "Upload Photo" button next to entry
- File picker opens
- Select photo
- Auto-compress if needed
- Upload and save
- Success notification

### 4. Technical Implementation

#### File Compression
```javascript
// Auto-compression for files > 1MB
const compressImage = async (imageFile) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };
  return await imageCompression(imageFile, options);
};
```

#### Matching Algorithm
```javascript
// Extract entry number from filename
const match = file.name.match(/(\d+)/);
const entryNumber = match ? parseInt(match[1]) : null;

// Find matching entry
const entry = entriesWithoutPhotos.find(e => 
  e.entry_number === entryNumber
);
```

#### Upload Process
```javascript
// 1. Compress if needed
if (file.size > 1024 * 1024) {
  file = await compressImage(file);
}

// 2. Upload to Supabase storage
const uploadResult = await uploadEntryPhoto(
  file, 
  entry.id, 
  competitionId
);

// 3. Update entry record
await updateEntry(entry.id, {
  photo_url: uploadResult.url
});
```

## UI Design

### Color Scheme
- **Primary**: Teal/Cyan gradient
- **Accent**: Purple/Pink for Photo Manager
- **Success**: Green
- **Warning**: Amber/Yellow
- **Error**: Red

### Layout Sections
1. **Header**: Title, description, close button
2. **Stats Bar**: 3-column grid with key metrics
3. **Bulk Upload**: File selection and preview
4. **Individual Upload**: Scrollable entry list
5. **Footer**: Tips and close button

### Responsive Design
- Mobile-friendly
- Touch-optimized buttons (min-height: 48px)
- Scrollable sections for long lists
- Max-height constraints with overflow

## User Workflow

### Competition Day Scenario
1. Staff member opens Competition Setup
2. Clicks "📸 Open Photo Manager"
3. Sees X entries missing photos
4. **Option A - Bulk Upload**:
   - Renames photos: 1.jpg, 2.jpg, 3.jpg, etc.
   - Selects all photos at once
   - Reviews matches
   - Confirms upload
   - All photos uploaded in seconds
5. **Option B - Individual Upload**:
   - Scrolls through entry list
   - Clicks "Upload Photo" for specific entry
   - Selects photo
   - Uploads immediately

## Error Handling

### Validation
- Empty file selection
- No matched files
- Invalid file formats
- Upload failures

### User Feedback
- Toast notifications for success/failure
- Visual indicators (✓ success, ⚠️ warning, ❌ error)
- Detailed error messages in console
- Upload progress tracking

## Access Control

### Pre-Save State
```
⚠️ Save your competition first to unlock the Photo Upload Manager
```

### Post-Save State
```
✅ Photo Upload Manager Available
```

## Integration Points

### Competition Setup Page
```jsx
{/* Photo Upload Manager Button */}
{savedCompetitionId && (
  <button onClick={() => setShowPhotoManager(true)}>
    Open Photo Manager →
  </button>
)}
```

### State Management
```javascript
const [showPhotoManager, setShowPhotoManager] = useState(false);
const [savedCompetitionId, setSavedCompetitionId] = useState(null);
```

### Modal Component
```jsx
{showPhotoManager && savedCompetitionId && (
  <PhotoUploadManager
    competitionId={savedCompetitionId}
    onClose={() => setShowPhotoManager(false)}
  />
)}
```

## Tips for Users

### File Naming
- Use simple numeric names matching entry numbers
- Supported formats: JPG, PNG
- Photos over 1MB automatically compressed
- Select all photos at once for faster upload

### Best Practices
1. **Preparation**: Rename photos before arriving at venue
2. **Bulk Upload**: Use for 10+ photos
3. **Individual Upload**: Use for 1-5 photos or corrections
4. **Verification**: Check stats after upload to ensure all photos uploaded

## Future Enhancements (Potential)
- Drag-and-drop interface
- Photo preview thumbnails
- Batch photo editing (crop, rotate)
- Camera integration for live photo capture
- Barcode/QR code scanning for entry matching
- Export missing photo list
- Email notifications for missing photos

## Success Metrics
✅ Fast bulk upload (10+ photos in seconds)
✅ Auto-matching reduces manual work
✅ Clear visual feedback
✅ Mobile-friendly for on-site use
✅ Graceful error handling
✅ Real-time progress tracking

## Testing Checklist
- [ ] Bulk upload with all matching files
- [ ] Bulk upload with some unmatched files
- [ ] Individual upload
- [ ] File compression (test with >1MB file)
- [ ] Error handling (network failure)
- [ ] UI responsiveness on mobile
- [ ] Stats update after upload
- [ ] Entry list refresh after upload
- [ ] Multiple consecutive uploads
- [ ] Close/reopen modal (state persistence)

---

**Status**: ✅ Implemented
**Date**: January 25, 2026
**Version**: 1.0



