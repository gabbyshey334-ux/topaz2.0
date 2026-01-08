# TOPAZ 2.0 - Medal Points Quick Start Guide

## 🏆 What's the Medal Points System?

Track dancer progression across competitions! Dancers earn points for 1st place wins and unlock medal achievements.

---

## 🎯 The Rules (Simple!)

### Points
- **1st Place** = 1 point + trophy
- **2nd-4th Place** = Trophy only (NO points)

### Medals
- **25 points** = 🥉 Bronze Medal
- **35 points** = 🥈 Silver Medal  
- **50 points** = 🥇 Gold Medal

### Key Point
**Points accumulate across ALL competitions in the season!**

---

## 🚀 Quick Setup

### Step 1: Update Database
**Existing Installation?**
```
1. Open Supabase SQL Editor
2. Run: medal-points-migration.sql
3. Verify columns added
```

**New Installation?**
✅ Already included in database-schema.sql

### Step 2: Mark Medal Program Entries
When adding entries in Competition Setup:
1. Check "Include in Medal Program ⭐"
2. Save entry

That's it! Entry is now tracked for medal points.

---

## 📊 Using the Medal Program

### During Competition
Run competition normally:
1. Setup competition
2. Score entries
3. View results

### After Competition - Award Points
1. Go to **Results Page**
2. Click **"⭐ Medal Program"** filter button
3. Review top 4 per category
4. Click **"🏆 Award Medal Points"** button
5. Confirm award

**What Happens:**
- System awards 1 point to all 1st place medal program entries
- Medal levels update automatically if thresholds reached
- Success message shows how many points awarded

### View Season Standings
1. In Medal Program section
2. Click **"🏅 View Season Medal Standings"**
3. See leaderboard of all medal program dancers
4. Sorted by total points

---

## 💡 Understanding the Display

### Medal Program Results (This Competition)
Shows **top 4 per category**:

```
┌─────────────────────────────────────┐
│ 🥇 1ST PLACE - Sarah Johnson       │
│ Jazz Solo • Score: 95.5             │
│ 🏆 +1 Medal Point Earned!          │
│ Total: 26 points                    │
│ 🥉 Bronze Medal - Working to Silver│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🥈 2ND PLACE - Mike Chen            │
│ Jazz Solo • Score: 93.2             │
│ 🏆 Trophy Award (No medal points)  │
│ Current Total: 18 points            │
│ Working toward Bronze (18/25)       │
└─────────────────────────────────────┘
```

### Season Standings Leaderboard
Shows **ALL medal program entries** ranked by total points:

```
#1  Emma Rodriguez    42 pts  🥈 Silver → Gold (42/50)
#2  Sarah Johnson     26 pts  🥉 Bronze → Silver (26/35)
#3  Lisa Park         24 pts  Working → Bronze (24/25)
#4  Mike Chen          18 pts  Working → Bronze (18/25)
```

---

## 🎨 Visual Indicators

### Badges You'll See

**Medal Program Badge**
- ⭐ Yellow badge = Entry in medal program

**Medal Achievement Badges**
- 🥉 Bronze = 25-34 points (Amber/brown)
- 🥈 Silver = 35-49 points (Gray/slate)
- 🥇 Gold = 50+ points (Yellow/gold)

**Progress Text**
- "Working toward Bronze (15/25)"
- "🥉 Bronze - Working toward Silver (28/35)"
- "🥈 Silver - Working toward Gold (42/50)"
- "🥇 Gold Medal Achieved!"

---

## 📋 Common Scenarios

### Scenario: First Competition
```
Sarah competes in Jazz, gets 1st place
→ Earns 1 point
→ Status: "Working toward Bronze (1/25)"
→ Needs 24 more points for Bronze
```

### Scenario: Multiple Categories
```
Joe competes in same competition:
→ 1st place Tap = 1 point
→ 1st place Hip Hop = 1 point
→ Total earned this comp: 2 points
```

### Scenario: Achieving Bronze
```
Emma has 24 points from previous competitions
→ Gets 1st place today = 1 point
→ New total: 25 points
→ 🥉 BRONZE MEDAL UNLOCKED!
→ Status: "Bronze - Working toward Silver (25/35)"
```

### Scenario: 2nd Place
```
Mike gets 2nd place
→ Receives trophy
→ NO medal points
→ Points stay the same
```

---

## 🎯 Admin Tips

### Award Points Right After Competition
1. Results are fresh in everyone's mind
2. Dancers can see their updated totals
3. Celebrations can happen immediately

### Or Award Later
- Points can be awarded anytime
- System saves competition results
- Just come back and click the button

### Tracking Progress
- Export Excel regularly for records
- Print PDFs for dancer portfolios
- Share standings with parents/studios

### Season Planning
- Points carry across entire season
- Plan how many competitions = medals
- Celebrate achievements as they happen

---

## 📄 Reports Include Medal Info

### PDF Score Sheets
Shows:
- ⭐ Medal Program indicator
- Total season points
- Current medal level

### Excel Export
Columns added:
- Medal Program (Yes/No)
- Medal Points (total)
- Medal Level (Bronze/Silver/Gold/None)

---

## ⚠️ Important Notes

### Points Are Cumulative
- **DO NOT** reset between competitions
- Points build across entire season
- One dancer's journey from 0 → 50+ points

### Only 1st Place Gets Points
- This makes medals meaningful
- Encourages improvement
- Prevents point inflation

### Automatic Updates
- Medal level updates automatically
- No manual badge assignment needed
- Badges appear everywhere instantly

### Per Competition Category
- Each category shows top 4
- Dancer can earn points in multiple categories
- All points count toward their one medal level

---

## 🐛 Troubleshooting

**Problem**: Can't see medal program section
- **Solution**: Click "⭐ Medal Program" filter button on Results page

**Problem**: Points not awarded
- **Solution**: Make sure you clicked "Award Medal Points" button and confirmed

**Problem**: Badge not showing
- **Solution**: Reload page, check total points reach threshold (25/35/50)

**Problem**: Wrong medal level
- **Solution**: Check total points in Excel export, verify against thresholds

---

## 🎉 Celebration Ideas

### When Dancers Achieve Medals
- Announce at next competition
- Special certificate with PDF score sheet
- Post on social media
- Display in studio
- Add to dancer portfolio

### Season End
- Medal ceremony event
- Show season standings
- Recognize all levels
- Set goals for next season

---

## 📞 Quick Reference

**Thresholds:**
- Bronze: 25 points
- Silver: 35 points
- Gold: 50 points

**Point Award:**
- 1st place: 1 point
- 2nd-4th: 0 points

**Where to Award:**
- Results Page → Medal Program filter → Award button

**Where to View Standings:**
- Results Page → Medal Program → Toggle standings button

---

**Ready to track your dancers' journey to Gold? Let's go! 🏆✨**

---

**TOPAZ 2.0 © 2025 | Heritage Since 1972**

