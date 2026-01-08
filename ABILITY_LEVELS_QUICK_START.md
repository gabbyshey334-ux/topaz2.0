# TOPAZ 2.0 - Ability Levels Quick Start Guide

## 🚀 What's New?

You can now separate dancers into 3 ability levels:
- **🔰 Beginning** - Less than 2 years training
- **🥉 Intermediate** - 2-4 years training  
- **🥇 Advanced** - 5+ years training

## 📋 Setup Steps

### 1. Update Your Database
If you have an existing TOPAZ installation:
```
1. Open Supabase SQL Editor
2. Run: ability-level-migration.sql
3. Verify column was added
```

For new installations, the updated schema includes ability levels automatically.

### 2. Create Competition
No changes needed - works the same as before!

### 3. Add Entries
When adding a dancer or group:
1. Fill in all normal fields (Name, Category, Age Division)
2. **NEW**: Select Ability Level from dropdown
3. For groups: Choose level of most experienced member
4. Save entry

The ability level is **required** - you must select one.

## 🎯 How to Use

### During Scoring
Judges can filter entries by ability level:
1. Open scoring interface
2. Use "Filter by Ability" dropdown
3. Choose: All Levels, Beginning, Intermediate, or Advanced
4. Only entries matching that level will appear

### Viewing Results
Directors can filter rankings by ability level:
1. Open results page
2. Click ability level buttons: 🔰 Beginning, 🥉 Intermediate, 🥇 Advanced
3. Rankings are separate for each level
4. Can combine with category/age filters

**Examples:**
- Click "Jazz" + "Advanced" = Jazz dancers with 5+ years
- Click "Teen" + "Beginning" = Teen dancers with <2 years
- Click "Advanced" only = All advanced dancers

## 📊 Reports Include Ability Level

### PDF Score Sheets
- Shows ability level with description
- Example: "Advanced (5+ years)"

### Excel Export
- New column: "Ability Level"
- Shows full description

## 💡 Tips

### For Groups
**Always use the ability level of your MOST EXPERIENCED member**
- If one dancer has 5 years and others have 2 years → Select "Advanced"
- This prevents sandbagging

### For Fair Competition
- Be honest about training years
- Count consistent training, not age
- Beginning: New or returning after long break
- Intermediate: Regular training 2-4 years
- Advanced: 5+ years of consistent training

### For Directors
- Can filter results multiple ways
- Rankings are separate per ability level
- Prevents beginners competing against advanced dancers
- Makes awards more meaningful

## 🎨 Visual Indicators

All pages show colored badges:
- **Blue badge** = Beginning
- **Orange badge** = Intermediate  
- **Purple badge** = Advanced

## ⚠️ Important Notes

1. **Required Field**: You must select an ability level for every entry
2. **Groups**: Use most experienced member's level
3. **Existing Entries**: Old entries without ability level won't show in filtered views
4. **Can't Change**: After saving, ability level can't be changed (must delete/re-add entry)

## 🐛 Troubleshooting

**Problem**: Can't save entry
- **Solution**: Make sure you selected an ability level

**Problem**: Entry doesn't appear when filtering
- **Solution**: Check that entry has an ability level set

**Problem**: Old entries missing from results
- **Solution**: Old entries need ability level added via database update

## 📞 Need Help?

Check the full documentation: `ABILITY_LEVELS_README.md`

---

**Ready to separate your beginners from your advanced dancers? Let's go! 🎭**

