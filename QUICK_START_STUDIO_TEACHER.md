# Quick Start: Studio & Teacher Name Fields

## 🎯 What Was Added

Two new **optional** fields for each entry:
1. **Studio Name** - e.g., "ABC Dance Studio"
2. **Teacher/Choreographer Name** - e.g., "Jane Smith"

---

## 🚀 Getting Started

### Step 1: Update Database (Required!)

Open your **Supabase SQL Editor** and run:

```sql
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS studio_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_name TEXT;
```

**That's it for the database!** ✅

---

## 📝 How to Use

### When Creating an Entry

1. Go to **Competition Setup**
2. Click **"+ Add Entry"**
3. Fill in the required fields (name, age, category, etc.)
4. **Scroll down** - you'll see two new optional fields:
   - **Studio Name (Optional)**
   - **Teacher/Choreographer Name (Optional)**
5. Fill them in or leave blank - both are optional!
6. Click **"Save Entry"**

### Where the Info Appears

The studio and teacher names will automatically show up in:

1. **📄 PDF Scorecards** - Under the competitor name in the header
2. **🏆 Results Page** - Click the expand button to view details
3. **📊 Excel Export** - In dedicated columns (5th & 6th)

---

## 💡 Tips

- **Both fields are optional** - fill in what you have
- **No character limit** - enter full names
- **Works for solo and group entries**
- **Existing entries** - Will show as blank (that's normal!)
- **Leave blank** - If you don't know or don't want to track this info

---

## 🎨 Visual Preview

### Entry Form (New Fields)
```
┌─────────────────────────────────────┐
│ Entry Type: ⦿ Solo                 │
│ Dancer Name: Sarah Johnson         │
│ Age: 15                             │
│ ...                                 │
│ ☑ Include in Medal Program ⭐      │
│                                     │
│ Studio Name (Optional)              │
│ ┌─────────────────────────────────┐ │
│ │ ABC Dance Studio               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Teacher/Choreographer Name (Optional) │
│ ┌─────────────────────────────────┐ │
│ │ Jane Smith                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Results Page (Expanded)
```
┌────────────────────────────────────────┐
│ 🏫 Studio & Teacher Information        │
│                                        │
│ Studio:    ABC Dance Studio            │
│ Teacher:   Jane Smith                  │
└────────────────────────────────────────┘
```

### PDF Scorecard
```
╔═══════════════════════════════════╗
║    TOPAZ 2.0 DANCE COMPETITION    ║
╠═══════════════════════════════════╣
║ Sarah Johnson (Age 15)            ║
║ ABC Dance Studio • Jane Smith     ║
║                                   ║
║ Jazz • Junior Advanced • Advanced ║
╚═══════════════════════════════════╝
```

---

## ❓ FAQ

**Q: Are these fields required?**
A: No! Both are completely optional.

**Q: What happens to existing entries?**
A: They'll show blank values - that's normal and won't cause any issues.

**Q: Can I leave one field filled and one blank?**
A: Absolutely! Fill in only what you have.

**Q: Will this affect scoring?**
A: No, these are informational only - no impact on rankings or scores.

**Q: Can I add this info to existing entries?**
A: Currently no - these fields are only available when creating new entries. You could update them directly in the Supabase database if needed.

---

## 🛠️ Troubleshooting

### Fields don't appear in the form
→ Clear your browser cache and refresh

### Database error when saving entry
→ Make sure you ran the SQL migration in Supabase

### Fields show on PDF but not Results page
→ Make sure to click the "▼ View Score Details" button to expand

### Excel columns are missing
→ Re-export the results - old exports won't have the new columns

---

## 📞 Need Help?

All files have been updated and tested. If you encounter any issues:
1. Check that the SQL migration was run successfully
2. Verify you're using the latest code
3. Clear browser cache
4. Check browser console for errors

---

**✅ Everything is ready to use!**

Just run the SQL migration and start adding studio/teacher info to your entries.

*TOPAZ 2.0 - Making dance competitions even better!*

