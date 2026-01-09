<div align="center">
  <img src="public/logo.png" alt="TOPAZ Logo" width="200"/>
  
  # TOPAZ 2.0 Comprehensive Documentation
  
  **Heritage Since 1972**  
  Complete System Documentation for Dance Competition Scoring
</div>

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Database Setup](#database-setup)
4. [Categories System](#categories-system)
5. [Variety Levels](#variety-levels)
6. [Age Tracking & Auto-Assignment](#age-tracking--auto-assignment)
7. [Ability Levels System](#ability-levels-system)
8. [Medal Points Program](#medal-points-program)
9. [Special Categories](#special-categories)
10. [Competition Workflow](#competition-workflow)
11. [Scoring System](#scoring-system)
12. [Results & Reports](#results--reports)
13. [Technical Reference](#technical-reference)
14. [Troubleshooting](#troubleshooting)

---

## System Overview

TOPAZ 2.0 is a comprehensive dance competition scoring system built with React and Supabase, designed to manage competitions, entries, scoring, and results with advanced features including ability level tracking and medal point awards.

### Core Features

- **Competition Management**: Create and manage multiple competitions
- **Entry Management**: Track competitors with photos, age, categories, age divisions, and ability levels
- **Performing Arts Categories**: 7 categories (Tap, Jazz, Ballet, Lyrical/Contemporary, Vocal, Acting, Hip Hop)
- **Special Categories**: 3 categories (Production, Student Choreography, Teacher/Student) - participation recognition only
- **Variety Levels**: 5 variety options (A, B, C, D, E) for enhanced competition categorization
- **Age Tracking**: Automatic age division assignment based on contestant age
- **Judge Scoring**: Multi-judge scoring interface with real-time updates
- **Ability Levels**: Three-tier system (Beginning, Intermediate, Advanced)
- **Medal Points Program**: Cumulative point tracking for Bronze, Silver, and Gold medals
- **Results Display**: Real-time rankings with filtering and grouping, separate display for special categories
- **Export Functions**: PDF score sheets and Excel reports
- **Photo Storage**: Supabase storage integration for competitor photos

### Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **PDF Generation**: jsPDF with jspdf-autotable
- **Excel Export**: xlsx library
- **State Management**: React hooks (useState, useEffect, useMemo)

---

## Quick Start Guide

### For Competition Organizers

**1. Database Setup** (First Time Only)
```sql
-- Run the main schema file in your Supabase SQL editor
-- Execute: database-schema.sql

-- Then run migration files if updating existing database:
-- 1. ability-level-migration.sql
-- 2. medal-points-migration.sql
-- 3. scores-notes-migration.sql
-- 4. special-categories-migration.sql
```

**2. Create a New Competition**
- Navigate to Competition Setup page
- Enter competition name and date
- Click "Create Competition"

**3. Add Entries**
- Click "Add Entry" button
- Fill in competitor details:
  - Entry Number (auto-incremented)
  - Competitor Name
  - **Age** (1-99, required) - Age division auto-assigned based on age!
  - **Performing Arts Categories**: Tap, Jazz, Ballet, Lyrical/Contemporary, Vocal, Acting, Hip Hop
  - **Special Categories**: Production, Student Choreography, Teacher/Student (participation recognition only)
  - **Variety Level** (None, A, B, C, D, E) - optional enhancement
  - Age Division (auto-selected or manual override)
  - **Ability Level** (Beginning, Intermediate, Advanced)
  - Optional: Upload photo
- Click "Save Entry"

**4. Select Judges**
- Go to Judge Selection page
- Enter number of judges (1-10)
- Click "Save Selection"

**5. Score Entries**
- Navigate to Scoring Interface
- Select judge number
- Use filters to navigate entries (Category, Age Division, Ability Level)
- Score each entry across four criteria:
  - Technique (0-25)
  - Creativity (0-25)
  - Presentation (0-25)
  - Appearance (0-25)
- Add optional notes
- Click "Submit Score"

**6. View Results**
- Go to Results Page
- View rankings by category and ability level
- Check Medal Program section for top performers
- Award medal points to 1st place winners

**7. Generate Reports**
- Export to Excel for complete results spreadsheet
- Generate PDF score sheets for individual entries

---

## Database Setup

### Initial Setup Checklist

#### ✅ Step 1: Create Database Schema
   ```bash
# Execute the main schema file in Supabase SQL Editor
database-schema.sql
```

This creates the following tables:
- `competitions`: Competition metadata
- `categories`: Dance categories (Solo, Duet, Trio, etc.)
- `age_divisions`: Age groupings
- `entries`: Competitor information with ability levels and medal tracking
- `scores`: Judge scores with notes

#### ✅ Step 2: Verify Tables Created
```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- age_divisions
-- categories
-- competitions
-- entries
-- scores
```

#### ✅ Step 3: Run Migration Scripts (If Updating Existing Database)

**Migration 1: Add Ability Levels**
```sql
-- Execute: ability-level-migration.sql
-- Adds: ability_level column to entries table
```

**Migration 2: Add Medal Points**
```sql
-- Execute: medal-points-migration.sql
-- Adds: medal_points and current_medal_level columns to entries table
```

**Migration 3: Update Scores Table**
```sql
-- Execute: scores-notes-migration.sql
-- Adds: notes column
-- Renames: total to total_score
```

#### ✅ Step 4: Configure Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `competitor-photos`
3. Set to **Public** bucket
4. Configure policies:

```sql
-- Policy 1: Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'competitor-photos');

-- Policy 2: Allow authenticated uploads
CREATE POLICY "Authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'competitor-photos' AND 
  auth.role() = 'authenticated'
);
```

#### ✅ Step 5: Test Database Connection

Create a test competition:
```sql
INSERT INTO competitions (name, date)
VALUES ('Test Competition', CURRENT_DATE);
```

Verify it appears in your application.

### Database Schema Details

#### Entries Table
```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY,
  competition_id UUID NOT NULL,
  entry_number INTEGER NOT NULL,
  competitor_name TEXT NOT NULL,
  category_id UUID,
  age_division_id UUID,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  dance_type TEXT,
  ability_level TEXT CHECK (ability_level IN ('Beginning', 'Intermediate', 'Advanced')),
  medal_points INTEGER DEFAULT 0,
  current_medal_level TEXT DEFAULT 'None',
  photo_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Scores Table
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  competition_id UUID NOT NULL,
  entry_id UUID NOT NULL,
  judge_number INTEGER CHECK (judge_number >= 1 AND judge_number <= 10),
  technique DECIMAL(5,2) CHECK (technique >= 0 AND technique <= 25),
  creativity DECIMAL(5,2) CHECK (creativity >= 0 AND creativity <= 25),
  presentation DECIMAL(5,2) CHECK (presentation >= 0 AND presentation <= 25),
  appearance DECIMAL(5,2) CHECK (appearance >= 0 AND appearance <= 25),
  total_score DECIMAL(6,2) CHECK (total_score >= 0 AND total_score <= 100),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
   ```

---

## Categories System

### Overview

TOPAZ 2.0 features two types of categories: **Performing Arts Categories** (eligible for high scoring awards) and **Special Categories** (participation recognition only).

### Performing Arts Categories (7 Categories)

These categories compete for high score awards and Overall Grand Champion:

1. **Tap** - Traditional tap dance performances
2. **Jazz** - Jazz dance styles and techniques
3. **Ballet** - Classical ballet performances
4. **Lyrical/Contemporary** - Combined lyrical and contemporary styles
5. **Vocal** - Song and vocal performances
6. **Acting** - Theatrical and dramatic performances
7. **Hip Hop** - Hip hop dance and urban styles

**Characteristics:**
- Eligible for "Overall Grand Champion" ranking
- Full competition rankings
- High score awards
- All scoring criteria apply

### Special Categories (3 Categories)

These categories receive participation recognition only:

1. **Production** - Large-scale production numbers
2. **Student Choreography** - Student-created choreography
3. **Teacher/Student** - Teacher and student partnerships

**Characteristics:**
- NOT eligible for "Overall Grand Champion"
- Separate results section
- Participation recognition
- Still scored normally
- Marked with 🎭 Special Category badge

### Category Display

**In Results:**
- Performing Arts categories shown first (teal styling)
- Special categories shown in separate section (gray styling)
- Clear visual distinction between the two types

---

## Variety Levels

### Overview

Variety levels allow categories to be enhanced with special requirements, creating more diverse competition divisions.

### The Five Variety Levels

#### **None** (Straight Category)
- Standard category with no variety requirements
- Pure dance style as intended
- Example: "Jazz" (straight jazz dance)

#### **Variety A** - Song & Dance, Character, or Combination
- Incorporates vocal performance
- Character portrayal
- Combination of performing arts
- Example: "Jazz Variety A - Song & Dance"

#### **Variety B** - Dance with Prop
- Requires use of a prop in performance
- Prop must be integral to routine
- Example: "Tap Variety B - with Prop"

#### **Variety C** - Dance with Acrobatics
- Incorporates acrobatic elements
- Tumbling, aerials, or gymnastics
- Example: "Ballet Variety C - with Acrobatics"

#### **Variety D** - Dance with Acrobatics & Prop
- Combines both acrobatics and prop use
- Highest technical difficulty
- Example: "Jazz Variety D - with Acrobatics & Prop"

#### **Variety E** - Hip Hop with Floor Work & Acrobatics
- Specific to Hip Hop category
- Includes floor work and acrobatic elements
- Breaking, power moves, etc.
- Example: "Hip Hop Variety E - with Floor Work & Acrobatics"

### How Variety Levels Work

**Category Creation:**
- Select base category (e.g., Jazz)
- Choose variety level (None, A, B, C, D, or E)
- System generates display name: "Jazz Variety B - with Prop"

**Competitive Groups:**
- Each variety level creates a separate competitive group
- "Jazz" (None) competes separately from "Jazz Variety B"
- Rankings calculated within each variety level

**Display:**
- Full variety description shown in dropdown
- Complete name displayed throughout system
- PDF and Excel exports include variety level

---

## Age Tracking & Auto-Assignment

### Overview

TOPAZ 2.0 automatically assigns age divisions based on contestant age, streamlining the entry process and ensuring accurate division placement.

### Age Field

**Required Information:**
- Age: 1-99 (required field)
- For solos: Dancer's current age
- For groups: Age of oldest member

**Display:**
- Name with age: "Sarah Johnson (14)"
- Shown in all views: setup, scoring, results, exports

### Automatic Age Division Assignment

**How It Works:**
1. User enters age (e.g., 14)
2. System checks all age divisions for competition
3. Finds division where age falls within range
4. Auto-selects matching division
5. Shows confirmation: "✓ Age 14 → Teen Division (auto-selected)"

**Example:**
```
Age Divisions:
- Junior (9-12)
- Teen (13-15)
- Senior (16-19)

Enter age: 14
Result: Teen division auto-selected ✓
```

### Manual Override

**User Can Override:**
- Auto-selected division can be changed
- Dropdown shows all divisions
- Recommended division marked: "(recommended)"
- Useful for edge cases or special circumstances

### Age Mismatch Handling

**If age doesn't match any division:**
- Warning shown: "⚠️ Age 25 doesn't match any division"
- Entry can still be created
- Competes without age division assignment
- Useful for open categories

### Visual Feedback

**When Age Matches:**
```
✓ Age 14 → Teen Division (auto-selected)
```
- Green checkmark
- Division name shown
- Positive confirmation

**When Age Doesn't Match:**
```
⚠️ Age 25 doesn't match any division
```
- Orange warning icon
- User can proceed
- No division required

### Groups

**For Group Entries:**
- Age field labeled: "Age (Age of oldest member)"
- Single age value stored
- Division based on oldest member
- Ensures appropriate competition level

---

## Ability Levels System

### Overview

The Ability Levels system categorizes dancers into three experience tiers, ensuring fair competition and appropriate judging standards.

### The Three Levels

#### 🔵 Beginning (Less than 2 years experience)
- **Visual Style**: Blue badge with light blue background
- **Target**: New dancers, early training
- **Characteristics**:
  - Learning fundamental techniques
  - Building basic skills and confidence
  - First competition experiences

#### 🟠 Intermediate (2-4 years experience)
- **Visual Style**: Orange badge with light orange background
- **Target**: Developing dancers with some experience
- **Characteristics**:
  - Solid foundation in technique
  - Exploring creativity and style
  - Multiple competition experiences

#### 🟣 Advanced (5+ years experience)
- **Visual Style**: Purple badge with light purple background
- **Target**: Experienced dancers
- **Characteristics**:
  - Mastery of advanced techniques
  - Artistic maturity and expression
  - Extensive competition history

### Implementation Details

#### Database Field
```sql
ability_level TEXT CHECK (ability_level IN ('Beginning', 'Intermediate', 'Advanced'))
```

#### UI Components

**AbilityBadge Component**
```jsx
<AbilityBadge abilityLevel="Beginning" size="md" />
```

Sizes: `sm`, `md`, `lg`

#### Where Ability Levels Appear

1. **Competition Setup**
   - Dropdown selector when adding entries
   - Helper text explaining experience requirements
   - Badge display in entry list

2. **Scoring Interface**
   - Filter dropdown to show entries by ability level
   - Badge display on current entry being scored
   - Quick navigation between ability levels

3. **Results Page**
   - Filter buttons (All, Beginning, Intermediate, Advanced)
   - Badge display in results tables
   - Separate rankings per ability level within categories

4. **PDF Score Sheets**
   - Ability level printed with entry information
   - Includes experience description

5. **Excel Exports**
   - Dedicated "Ability Level" column
   - Sortable and filterable in spreadsheet

### User Workflow

#### Adding Entry with Ability Level
1. Click "Add Entry" in Competition Setup
2. Fill in basic information
3. Select ability level from dropdown:
   - Beginning (Less than 2 years)
   - Intermediate (2-4 years)
   - Advanced (5+ years)
4. See helper text for group categories
5. Save entry

#### Filtering by Ability Level
- **Scoring Interface**: Use dropdown to filter entries
- **Results Page**: Click filter buttons to view specific levels
- **All views maintain**: Category and Age Division filters alongside ability filters

### Competitive Groups

Ability levels interact with Categories to create competitive groups:

| Category | Ability Level | Competitive Group |
|----------|---------------|-------------------|
| Solo | Beginning | Solo - Beginning |
| Solo | Intermediate | Solo - Intermediate |
| Solo | Advanced | Solo - Advanced |
| Duet | Beginning | Duet - Beginning |
| ... | ... | ... |

**Rankings are calculated within each competitive group.**

### Best Practices

1. **Consistent Classification**: Ensure all entries in a competition have ability levels assigned
2. **Fair Grouping**: Similar experience levels compete against each other
3. **Clear Communication**: Display ability level prominently in all views
4. **Filter Coordination**: Use ability filters alongside category/age filters for precise navigation

---

## Medal Points Program

### Overview

The Medal Points Program rewards consistent excellence by tracking cumulative points earned across multiple competitions. First-place winners earn points toward Bronze, Silver, and Gold medal achievements.

### Medal Levels and Point Thresholds

#### 🥉 Bronze Medal (25 Points Required)
- **Visual Style**: Bronze/brown badge
- **Achievement**: First medal milestone
- **Significance**: Recognition of early competitive success

#### 🥈 Silver Medal (35 Points Required)
- **Visual Style**: Silver/gray badge  
- **Achievement**: Intermediate excellence
- **Significance**: Demonstrates consistent performance

#### 🥇 Gold Medal (50 Points Required)
- **Visual Style**: Gold/yellow badge
- **Achievement**: Highest honor
- **Significance**: Elite performer status

### Point Awards

**1st Place Winners Earn:**
- Automatically receive medal points when awarded by organizer
- Points accumulate across all competitions in the database
- Progress tracked in real-time on entry records

**How Points Are Awarded:**
1. Competition completes and results are finalized
2. Organizer reviews 1st place winners
3. Click "Award Medal Points" button on Results Page
4. System automatically adds points to all 1st place winners
5. Medal levels update automatically when thresholds are reached

### Medal Progress Tracking

The system displays progress toward the next medal:

- **None → Bronze**: "10/25 points to Bronze" (40% progress)
- **Bronze → Silver**: "28/35 points to Silver" (80% progress)
- **Silver → Gold**: "40/50 points to Gold" (80% progress)
- **Gold Achieved**: "Gold Medal Holder" (no further progression)

### Implementation Details

#### Database Fields

**Medal Points (Integer)**
```sql
medal_points INTEGER DEFAULT 0 CHECK (medal_points >= 0)
```

**Current Medal Level (Text)**
```sql
current_medal_level TEXT DEFAULT 'None' 
  CHECK (current_medal_level IN ('None', 'Bronze', 'Silver', 'Gold'))
```

#### Automatic Medal Level Calculation

When points are added, the system automatically determines medal level:

```javascript
if (newPoints >= 50) return 'Gold';
if (newPoints >= 35) return 'Silver';
if (newPoints >= 25) return 'Bronze';
return 'None';
```

#### Database Functions

**addMedalPoints(entryId, pointsToAdd)**
- Fetches current entry data
- Adds new points to existing total
- Calculates new medal level
- Updates entry record

**awardMedalPointsToWinners(competitionId, firstPlaceWinners)**
- Accepts array of 1st place entry IDs
- Calls addMedalPoints for each winner
- Returns success/failure status

### UI Components

**MedalBadge Component**
```jsx
<MedalBadge 
  medalLevel="Bronze" 
  medalPoints={25} 
  size="md" 
/>
```

Displays:
- Medal emoji (🥉🥈🥇)
- Medal level name
- Current points
- Progress toward next level

### Where Medal Information Appears

1. **Competition Setup**
   - Entry list shows current medal achievements
   - Medal badges displayed alongside entry information
   - Cumulative points visible

2. **Results Page**
   - **Medal Program Section** (New)
     - Top 4 entries per category
     - Points earned this competition
     - Total accumulated points
     - Current medal level and progress
     - Seasonal leaderboard
   - **Award Medal Points Button**
     - Appears after competition completes
     - Confirmation dialog with winner list
     - One-click award to all 1st place winners

3. **PDF Score Sheets**
   - Medal program status section
   - Current points and level
   - Progress information

4. **Excel Exports**
   - Columns: Medal Points, Medal Level
   - Sortable by points or level
   - Filterable for medal holders

### Competition Workflow with Medal Points

#### After Competition Ends

1. **Review Results**: Check 1st place winners in each category/division/ability level
2. **Verify Winners**: Confirm placements are correct
3. **Award Points**: Click "Award Medal Points" button
4. **Confirm**: Review list of winners who will receive points
5. **Execute**: System adds points and updates medal levels
6. **Verify**: Check Medal Program section to confirm updates

#### Between Competitions

- Medal points and levels persist across competitions
- Competitors carry their medal status into future events
- Leaderboard shows top performers across all competitions

#### Season Management

The system tracks cumulative points across all competitions in the database:
- No date restrictions (all-time tracking)
- Manual season reset if needed (database update)
- Historical data preserved

### Medal Program Display

#### Results Page Medal Section

**Header**: "🏆 Medal Program - Season Standings"

**Top 4 Display Per Category**:
```
Category: Solo | Age Division: Teen | Ability: Advanced

Rank | Competitor      | Points This Comp | Total Points | Medal Status
-----|-----------------|------------------|--------------|-------------
1    | Jane Doe        | +0               | 50           | 🥇 Gold
2    | John Smith      | +0               | 35           | 🥈 Silver (35/50 to Gold)
3    | Emily Johnson   | +0               | 28           | 🥉 Bronze (28/35 to Silver)
4    | Michael Brown   | +0               | 15           | 15/25 to Bronze
```

**Award Medal Points Button**:
- Prominent green button
- Shows confirmation dialog with winner count
- Updates all winners simultaneously
- Success notification after completion

### Best Practices

1. **Award Points Promptly**: Award points immediately after competition ends
2. **Verify Winners**: Double-check 1st place results before awarding
3. **Communicate Clearly**: Explain medal program to competitors
4. **Track Progress**: Monitor leaderboard for season-long engagement
5. **Celebrate Achievements**: Recognize medal earners publicly

### Technical Notes

- Points can only be added, never subtracted (prevents accidental removal)
- Medal level updates are automatic based on point thresholds
- Database constraints ensure data integrity
- Transaction-safe point additions prevent duplication
- Real-time updates reflect across all system views

---

## Special Categories

### Overview

Special Categories are competition divisions that receive participation recognition only and are **NOT eligible for high scoring awards**. They are designed for unique performance formats that don't fit traditional competitive judging.

### The Three Special Categories

#### 1. **Production**
- Large-scale production numbers
- Multiple performers, elaborate staging
- Focus on theatrical presentation
- Participation recognition only

#### 2. **Student Choreography**
- Choreographed by students
- Showcases creative development
- Learning and growth emphasis
- Participation recognition only

#### 3. **Teacher/Student**
- Teacher and student performing together
- Partnership performances
- Special collaborative category
- Participation recognition only

### Key Rules

**NOT Eligible For:**
- ❌ Overall Grand Champion ranking
- ❌ High score awards
- ❌ Cross-category competition

**STILL Receive:**
- ✅ Normal scoring (all 4 criteria)
- ✅ Judge feedback and notes
- ✅ Individual score sheets (PDF)
- ✅ Inclusion in Excel exports
- ✅ Full participation recognition

### Database Implementation

**Auto-Detection:**
- System automatically flags these categories
- Database field: `is_special_category = true`
- No manual marking needed

**Category Creation:**
- When adding "Production", "Student Choreography", or "Teacher/Student"
- System shows warning: "⚠️ Special Category (participation recognition only)"
- Flag automatically set

### Results Display

**Two Separate Sections:**

**Section 1: Performing Arts Results**
- All regular categories (Tap, Jazz, Ballet, etc.)
- Eligible for high score awards
- Teal/cyan gradient styling
- "Overall Grand Champion" includes these only

**Section 2: Special Categories**
- Displayed after performing arts results
- Header: "🎭 SPECIAL CATEGORIES"
- Subtext: "Participation Recognition • Not Eligible for High Score Awards"
- Gray gradient styling (visual distinction)
- Gray border (different from regular entries)

### Visual Indicators

**Special Category Entries Show:**
- 🎭 Special Category badge
- Gray color scheme (vs. teal for performing arts)
- "SPECIAL" badge in red on CategoryBadge
- Clear separation in results display

**Example Display:**
```
┌─────────────────────────────────┐
│  PERFORMING ARTS RESULTS        │
│  (Eligible for High Scoring)    │
│                                 │
│  🏆 1st - Sarah (Jazz) - 95.50  │
│  [Teal gradient]                │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🎭 SPECIAL CATEGORIES          │
│  Participation Recognition      │
│                                 │
│  1st - Company (Production)     │
│  88.00 [Gray gradient] 🎭       │
└─────────────────────────────────┘
```

### Scoring Process

**Same as Regular Categories:**
1. Judges score all 4 criteria (Technique, Creativity, Presentation, Appearance)
2. Total score calculated (0-100)
3. Notes can be added
4. Scores stored in database

**Difference:**
- Results displayed in separate section
- Not included in "Overall Grand Champion"
- Focus on participation, not competition

### Best Practices

1. **Clear Communication**: Explain special category status to participants upfront
2. **Set Expectations**: Participation recognition, not competitive ranking
3. **Fair Judging**: Score fairly using all criteria
4. **Recognition**: Celebrate participation and creativity
5. **Separate Display**: Keep results sections clearly separated

### Migration

**For Existing Databases:**
```sql
-- Run: special-categories-migration.sql
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_special_category BOOLEAN DEFAULT false;

UPDATE categories
SET is_special_category = true
WHERE name IN ('Production', 'Student Choreography', 'Teacher/Student');
```

### Technical Notes

- `is_special_category` boolean flag in categories table
- Auto-detected based on category name
- Results filtering separates special from performing arts
- PDF and Excel exports include special category indicator
- No changes to scoring logic - only display logic differs

---

## Competition Workflow

### Complete Step-by-Step Process

#### Phase 1: Setup (Before Competition Day)

**1. Database Initialization**
- Ensure database schema is current
- Verify storage bucket configured
- Test connection to Supabase

**2. Create Competition**
- Navigate to Competition Setup
- Enter competition name
- Select competition date
- Click "Create Competition"

**3. Add All Entries**
For each competitor:
- Entry number (auto-increments)
- Competitor name
- Age and age division
- Category (Solo, Duet, etc.)
- Dance type
- **Ability level** (Beginning/Intermediate/Advanced)
- Optional: Upload photo
- Save entry

**4. Verify Entry List**
- Review all entries for accuracy
- Check ability level assignments
- Confirm photos uploaded
- Edit any incorrect information

#### Phase 2: Competition Day

**5. Select Judges**
- Go to Judge Selection page
- Enter number of judges (1-10)
- Save selection

**6. Score Entries**
For each judge:
- Navigate to Scoring Interface
- Select judge number
- Use filters to navigate entries:
  - Category filter
  - Age Division filter
  - Ability Level filter
- For each entry, score:
  - Technique (0-25)
  - Creativity (0-25)
  - Presentation (0-25)
  - Appearance (0-25)
  - Optional: Add notes
- Submit scores
- System auto-calculates total (out of 100)

**7. Monitor Progress**
- Check Results page periodically
- Verify scores are being recorded
- Identify any missing scores

#### Phase 3: Results & Awards

**8. Finalize Results**
- Ensure all judges have completed scoring
- Review Results page for accuracy
- Check rankings across:
  - All categories
  - All age divisions
  - All ability levels

**9. Award Medal Points**
- Navigate to Medal Program section
- Review 1st place winners
- Click "Award Medal Points" button
- Confirm winner list in dialog
- Points automatically added to all 1st place winners
- Medal levels update automatically

**10. Generate Reports**
- Export to Excel for complete results spreadsheet
- Generate PDF score sheets for distribution
- Download files for distribution

#### Phase 4: Post-Competition

**11. Distribute Results**
- Share Excel file with organizers
- Email PDF score sheets to competitors
- Post results online if applicable

**12. Verify Medal Updates**
- Check that medal points were added correctly
- Review updated medal standings
- Communicate medal achievements to competitors

---

## Scoring System

### Scoring Criteria

Each entry is judged across four categories, each worth 0-25 points:

#### 1. Technique (0-25 points)
- Execution of steps and movements
- Body alignment and posture
- Precision and control
- Footwork accuracy

#### 2. Creativity (0-25 points)
- Originality of choreography
- Innovative movement
- Artistic interpretation
- Unique elements

#### 3. Presentation (0-25 points)
- Stage presence
- Expression and emotion
- Confidence and energy
- Connection with audience

#### 4. Appearance (0-25 points)
- Costume appropriateness
- Overall grooming
- Professional presentation
- Visual impact

**Total Score**: Sum of all four categories (0-100 points)

### Multi-Judge Scoring

- Up to 10 judges can score each entry
- Each judge scores independently
- Final rank determined by total score across all judges
- Higher total score = better ranking

### Ranking Algorithm

**Within each competitive group** (Category + Age Division + Ability Level):

1. Sum all judge scores for each entry
2. Sort entries by total score (descending)
3. Assign ranks:
   - Highest total score = 1st place
   - Next highest = 2nd place
   - Continue for all entries
4. Handle ties: Same total score = same rank (tie)

### Scoring Interface Features

- **Entry Navigation**: Filters by category, age division, and ability level
- **Current Entry Display**: Shows all entry details and photo
- **Score Input**: Separate fields for each criterion (0-25)
- **Auto-calculation**: Total score computed automatically
- **Notes Field**: Optional comments from judge
- **Submit & Next**: Saves score and advances to next entry
- **Progress Tracking**: Shows which entries have been scored

---

## Results & Reports

### Results Page

#### Main Results Display

**Filtering Options**:
- Category buttons (All, Solo, Duet, Trio, Small Group, Large Group, Line, Production)
- Age Division buttons (All divisions)
- Ability Level buttons (All, Beginning, Intermediate, Advanced)

**Results Table Shows**:
- Rank
- Entry Number
- Competitor Name (with photo if available)
- Age and Age Division
- Dance Type
- Ability Level (badge)
- Medal Status (badge if applicable)
- Total Score
- Detailed scores from all judges

**Sorting**: By total score (descending) within competitive groups

#### Medal Program Section

**"🏆 Medal Program - Season Standings"**

Displays top 4 entries per category/division/ability group:
- Current rank
- Competitor name
- Points earned this competition
- Total accumulated points
- Current medal level with progress
- Medal badge if applicable

**Award Medal Points Button**:
- Visible after competition
- Click to award points to 1st place winners
- Confirmation dialog shows winner list
- One-click execution
- Success notification

#### Seasonal Leaderboard

Shows all competitors with medal points:
- Ranked by total points
- Medal level indicators
- Progress toward next medal
- Filterable by category/division/ability

### Export Functions

#### Excel Export

**Features**:
- Complete results in spreadsheet format
- All entry information included
- All judge scores with breakdown
- Ability level column
- Medal points and medal level columns
- Sortable and filterable
- Professional formatting

**Columns Include**:
- Rank
- Entry Number
- Competitor Name
- Age, Age Division
- Category, Dance Type
- Ability Level
- Medal Points, Medal Level
- Judge scores (separate columns per judge)
- Total Score

**Usage**:
1. Click "Export to Excel" on Results page
2. File downloads automatically
3. Open in Excel, Google Sheets, or similar
4. Use for awards ceremony, posting results, archival

#### PDF Score Sheets

**Features**:
- Individual score sheet per entry
- Professional TOPAZ branding
- Complete entry information
- Ability level details
- Judge-by-judge score breakdown
- Medal program status
- Suitable for printing and distribution

**Content Includes**:
- Competition name and date
- Entry number and competitor name
- Age, age division, category
- Dance type
- Ability level with experience description
- Medal program status (points and level)
- Table of scores:
  - Judge number
  - Technique score
  - Creativity score
  - Presentation score
  - Appearance score
  - Total score
  - Notes (if any)
- Overall total score
- "Heritage Since 1972" footer

**Usage**:
1. Click "Generate PDF" on Results page
2. PDF generates in browser
3. View, download, or print
4. Distribute to competitors

---

## Technical Reference

### Project Structure

```
topaz-scoring/
├── src/
│   ├── components/
│   │   ├── AbilityBadge.jsx          # Ability level badge component
│   │   └── MedalBadge.jsx            # Medal achievement badge component
│   ├── pages/
│   │   ├── CompetitionSetup.jsx      # Competition and entry management
│   │   ├── JudgeSelection.jsx        # Judge count configuration
│   │   ├── ScoringInterface.jsx      # Judge scoring interface
│   │   └── ResultsPage.jsx           # Results display and medal program
│   ├── supabase/
│   │   ├── client.js                 # Supabase client initialization
│   │   ├── competitions.js           # Competition CRUD operations
│   │   ├── entries.js                # Entry CRUD + medal points logic
│   │   ├── scores.js                 # Score CRUD operations
│   │   └── storage.js                # Photo upload/download
│   ├── utils/
│   │   ├── pdfGenerator.js           # PDF score sheet generation
│   │   └── excelExport.js            # Excel export functionality
│   └── App.jsx                       # Main app router
├── database-schema.sql               # Complete database schema
├── ability-level-migration.sql       # Add ability_level column
├── medal-points-migration.sql        # Add medal points columns
├── scores-notes-migration.sql        # Add notes, rename total
└── README.md                         # Project overview
```

### Key API Functions

#### Entries (`src/supabase/entries.js`)

```javascript
// Create new entry with ability level and medal info
createEntry(competitionId, entryData)

// Get all entries for a competition
getCompetitionEntries(competitionId)

// Get single entry
getEntry(entryId)

// Update entry information
updateEntry(entryId, updates)

// Delete entry
deleteEntry(entryId)

// Add medal points to an entry
addMedalPoints(entryId, pointsToAdd)

// Award medal points to all 1st place winners
awardMedalPointsToWinners(competitionId, firstPlaceWinners)
```

#### Scores (`src/supabase/scores.js`)

```javascript
// Create score for an entry
createScore(scoreData)

// Update existing score
updateScore(scoreId, updates)

// Get all scores for a competition
getCompetitionScores(competitionId)

// Get scores for specific entry
getEntryScores(entryId)

// Bulk create scores
bulkCreateScores(scoresArray)
```

#### Storage (`src/supabase/storage.js`)

```javascript
// Upload competitor photo
uploadPhoto(file, entryId)

// Get public URL for photo
getPhotoUrl(photoPath)

// Delete photo
deletePhoto(photoPath)
```

### Component Props

#### AbilityBadge

```jsx
<AbilityBadge 
  abilityLevel="Beginning"  // Required: 'Beginning', 'Intermediate', or 'Advanced'
  size="md"                  // Optional: 'sm', 'md', 'lg' (default: 'md')
/>
```

#### MedalBadge

```jsx
<MedalBadge 
  medalLevel="Bronze"        // Required: 'None', 'Bronze', 'Silver', or 'Gold'
  medalPoints={25}           // Required: Integer (current total points)
  size="md"                  // Optional: 'sm', 'md', 'lg' (default: 'md')
/>
```

### Database Queries

#### Get entries with medal info
```sql
SELECT 
  e.*,
  c.name as category_name,
  ad.name as age_division_name,
  e.ability_level,
  e.medal_points,
  e.current_medal_level
FROM entries e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN age_divisions ad ON e.age_division_id = ad.id
WHERE e.competition_id = $1
ORDER BY e.entry_number;
```

#### Get scores with judge breakdown
```sql
SELECT 
  s.*,
  e.entry_number,
  e.competitor_name
FROM scores s
JOIN entries e ON s.entry_id = e.id
WHERE s.competition_id = $1
ORDER BY e.entry_number, s.judge_number;
```

#### Calculate rankings
```sql
WITH entry_totals AS (
  SELECT 
    e.id,
    e.entry_number,
    e.competitor_name,
    e.category_id,
    e.age_division_id,
    e.ability_level,
    COALESCE(SUM(s.total_score), 0) as total_score
  FROM entries e
  LEFT JOIN scores s ON e.id = s.entry_id
  WHERE e.competition_id = $1
  GROUP BY e.id
)
SELECT 
  *,
  RANK() OVER (
    PARTITION BY category_id, age_division_id, ability_level 
    ORDER BY total_score DESC
  ) as rank
FROM entry_totals
ORDER BY rank, total_score DESC;
```

### Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase Dashboard → Settings → API

---

## Troubleshooting

### Common Issues and Solutions

#### Database Issues

**Problem**: "Column ability_level does not exist"
- **Solution**: Run `ability-level-migration.sql` in Supabase SQL editor

**Problem**: "Column medal_points does not exist"
- **Solution**: Run `medal-points-migration.sql` in Supabase SQL editor

**Problem**: "Column notes does not exist" or "Column total does not exist"
- **Solution**: Run `scores-notes-migration.sql` in Supabase SQL editor

**Problem**: Constraint violation on ability_level
- **Solution**: Ensure values are exactly 'Beginning', 'Intermediate', or 'Advanced' (case-sensitive)

#### Photo Upload Issues

**Problem**: Photos not uploading
- **Solution**: 
  1. Verify storage bucket `competitor-photos` exists
  2. Check bucket is set to Public
  3. Verify storage policies allow uploads
  4. Check file size (max 5MB recommended)

**Problem**: Photos not displaying
- **Solution**:
  1. Verify photo_url stored in database
  2. Check bucket permissions for public read
  3. Try regenerating public URL

#### Scoring Issues

**Problem**: Total score not calculating
- **Solution**: Ensure all four scores (technique, creativity, presentation, appearance) are valid numbers

**Problem**: Scores not saving
- **Solution**:
  1. Check entry_id and judge_number are valid
  2. Verify score values are within 0-25 range
  3. Check for duplicate score (same entry + judge combination)

#### Medal Points Issues

**Problem**: Medal points not adding
- **Solution**:
  1. Verify entry has valid ID
  2. Check medal_points column exists in database
  3. Ensure pointsToAdd is a positive integer

**Problem**: Medal level not updating
- **Solution**: Medal level updates automatically based on points:
  - 25+ points = Bronze
  - 35+ points = Silver
  - 50+ points = Gold

**Problem**: "Award Medal Points" button not working
- **Solution**:
  1. Verify 1st place winners are correctly identified
  2. Check console for error messages
  3. Ensure database connection is active

#### Export Issues

**Problem**: Excel export fails
- **Solution**:
  1. Verify xlsx library is installed
  2. Check that entry data is loaded
  3. Try with smaller dataset first

**Problem**: PDF generation fails
- **Solution**:
  1. Verify jsPDF and jspdf-autotable are installed
  2. Check for special characters in text fields
  3. Ensure scores data is complete

#### UI Display Issues

**Problem**: Ability badges not showing
- **Solution**:
  1. Verify AbilityBadge component imported
  2. Check ability_level value is valid
  3. Ensure Tailwind CSS classes are compiled

**Problem**: Medal badges not displaying
- **Solution**:
  1. Verify MedalBadge component imported
  2. Check medal_points and current_medal_level values exist
  3. Confirm component props are passed correctly

**Problem**: Filters not working
- **Solution**:
  1. Check filter state is updating
  2. Verify filter logic in useMemo hooks
  3. Ensure data array is loaded before filtering

### Getting Help

If you encounter issues not covered here:

1. **Check Console**: Look for error messages in browser console (F12)
2. **Check Network**: Verify API calls are succeeding in Network tab
3. **Check Database**: Run queries directly in Supabase SQL editor
4. **Check Logs**: Review Supabase logs for backend errors
5. **Documentation**: Review Supabase and React documentation
6. **Community**: Seek help in React or Supabase communities

### System Requirements

- **Node.js**: Version 16 or higher
- **npm/yarn**: Latest stable version
- **Browser**: Modern browser with ES6+ support (Chrome, Firefox, Safari, Edge)
- **Supabase**: Active project with PostgreSQL database
- **Internet**: Required for Supabase connection

### Performance Tips

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Image Optimization**: Compress photos before upload
3. **Batch Operations**: Use bulk operations when possible
4. **Pagination**: Implement for large competitions (100+ entries)
5. **Caching**: Use React useMemo for expensive calculations

---

## Appendix

### Keyboard Shortcuts

**Scoring Interface**:
- Tab: Move to next score field
- Enter: Submit score and advance to next entry
- Esc: Clear current form

**Results Page**:
- Number keys (1-8): Quick category filter
- Ctrl/Cmd + E: Export to Excel
- Ctrl/Cmd + P: Generate PDF

### Color Reference

**Ability Levels**:
- Beginning: `#DBEAFE` (blue-100), `#1E40AF` (blue-800), `#93C5FD` (blue-300)
- Intermediate: `#FED7AA` (orange-100), `#9A3412` (orange-800), `#FDBA74` (orange-300)
- Advanced: `#E9D5FF` (purple-100), `#6B21A8` (purple-800), `#C084FC` (purple-300)

**Medal Levels**:
- Bronze: `#78350F` (brown-800), `#FEF3C7` (amber-100)
- Silver: `#1F2937` (gray-800), `#E5E7EB` (gray-200)
- Gold: `#92400E` (yellow-800), `#FEF9C3` (yellow-100)

### Version History

**Version 2.0** (Current - January 2026)
- **Categories System**: Updated to 10 categories (7 Performing Arts + 3 Special)
  - Performing Arts: Tap, Jazz, Ballet, Lyrical/Contemporary, Vocal, Acting, Hip Hop
  - Special Categories: Production, Student Choreography, Teacher/Student
- **Variety Levels**: Expanded from 2 to 5 options (A, B, C, D, E)
  - Variety A: Song & Dance, Character, or Combination
  - Variety B: Dance with Prop
  - Variety C: Dance with Acrobatics
  - Variety D: Dance with Acrobatics & Prop
  - Variety E: Hip Hop with Floor Work & Acrobatics
- **Age Tracking**: Added automatic age division assignment
  - Age field (1-99) required for all entries
  - Auto-selects matching age division
  - Manual override available
  - Age displayed with names throughout system
- **Special Categories Logic**: Separate display and recognition
  - Not eligible for high scoring awards
  - Participation recognition only
  - Separate results section with distinct styling
- **Ability Levels System**: Three-tier system (Beginning, Intermediate, Advanced)
- **Medal Points Program**: Cumulative point tracking for Bronze, Silver, and Gold medals
- **Enhanced Filtering**: Category, age division, and ability level filters
- **PDF and Excel Exports**: Include age, variety levels, and special category indicators
- **UI Components**: Added MedalBadge, AbilityBadge, CategoryBadge components
- **Database Migrations**: 4 migration scripts for incremental updates

**Version 1.0** (Initial - 2024)
- Core competition management
- Entry and scoring systems
- Basic results display
- Photo uploads
- PDF score sheets
- Excel export

---

## Support and Maintenance

### Regular Maintenance Tasks

**Daily** (During Competition):
- Backup database
- Monitor system performance
- Verify photo uploads working
- Check judge progress

**Weekly**:
- Review medal standings
- Export results for archival
- Clean up old photos if needed

**Monthly**:
- Database optimization
- Review and update documentation
- Check for software updates

**Seasonal**:
- Reset medal points if desired (manual database update)
- Archive completed competitions
- Review system performance and improvements

### Backup Procedures

**Database Backup**:
1. Go to Supabase Dashboard → Database → Backups
2. Download full backup
3. Store securely off-site
4. Recommended: Daily during competition season

**Photo Backup**:
1. Go to Supabase Dashboard → Storage
2. Download competitor-photos bucket
3. Store securely off-site
4. Recommended: After each competition

### Contact Information

**System**: TOPAZ 2.0 Dance Competition Scoring  
**Heritage**: Since 1972  
**Documentation Version**: 2.0  
**Last Updated**: January 2026

---

**End of Comprehensive Documentation**

For additional assistance, refer to the inline code comments and component documentation in the source files.
