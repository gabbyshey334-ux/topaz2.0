# 🎯 AGE DIVISION QUICK REFERENCE

## NEW 4-DIVISION STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    TOPAZ 2.0 AGE DIVISIONS                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  JUNIOR PRIMARY     │  Ages 3-7
│  👶 Young Dancers   │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  JUNIOR ADVANCED    │  Ages 8-12
│  🧒 Intermediate    │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  SENIOR YOUTH       │  Ages 13-18
│  👦 Teens           │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  SENIOR ADULT       │  Ages 19-99
│  👨 Adults          │
└─────────────────────┘
```

## AGE ASSIGNMENT TABLE

| Age | Division | Example Dancer |
|-----|----------|----------------|
| 3 | Junior Primary | Preschooler |
| 4 | Junior Primary | Preschooler |
| 5 | Junior Primary | Kindergarten |
| 6 | Junior Primary | 1st Grade |
| 7 | Junior Primary | 2nd Grade |
| **8** | **Junior Advanced** | **3rd Grade** |
| 9 | Junior Advanced | 4th Grade |
| 10 | Junior Advanced | 5th Grade |
| 11 | Junior Advanced | 6th Grade |
| 12 | Junior Advanced | 7th Grade |
| **13** | **Senior Youth** | **8th Grade** |
| 14 | Senior Youth | 9th Grade |
| 15 | Senior Youth | 10th Grade |
| 16 | Senior Youth | 11th Grade |
| 17 | Senior Youth | 12th Grade |
| 18 | Senior Youth | High School Senior |
| **19** | **Senior Adult** | **College/Adult** |
| 20-99 | Senior Adult | Adult |

## CRITICAL BOUNDARIES

```
Age 7  ───────────► Junior Primary (LAST AGE)
Age 8  ───────────► Junior Advanced (FIRST AGE) ⚠️

Age 12 ───────────► Junior Advanced (LAST AGE)
Age 13 ───────────► Senior Youth (FIRST AGE) ⚠️

Age 18 ───────────► Senior Youth (LAST AGE)
Age 19 ───────────► Senior Adult (FIRST AGE) ⚠️
```

## WHAT CHANGED

### BEFORE (2 Divisions)
```
Junior (3-12)  ──┐
                 ├─► Only 2 divisions
Senior (13+)   ──┘
```

### AFTER (4 Divisions)
```
Junior Primary (3-7)    ──┐
Junior Advanced (8-12)  ──┤
Senior Youth (13-18)    ──├─► Now 4 divisions
Senior Adult (19-99)    ──┘
```

## AUTO-ASSIGNMENT EXAMPLES

### ✅ Correct Assignments

```
User enters age 5:
  → System auto-selects: Junior Primary (3-7)
  → ✓ Age 5 → Junior Primary Division (auto-selected)

User enters age 10:
  → System auto-selects: Junior Advanced (8-12)
  → ✓ Age 10 → Junior Advanced Division (auto-selected)

User enters age 15:
  → System auto-selects: Senior Youth (13-18)
  → ✓ Age 15 → Senior Youth Division (auto-selected)

User enters age 25:
  → System auto-selects: Senior Adult (19-99)
  → ✓ Age 25 → Senior Adult Division (auto-selected)
```

## WHERE TO SEE THE CHANGES

### 1. Competition Setup Page
- When adding a new entry
- Age dropdown shows all 4 divisions
- Auto-selection feedback shows correct division

### 2. Scoring Interface
- Filter dropdown shows all 4 divisions
- Format: "Junior Primary (3-7)"

### 3. Results Page
- Filter buttons for each division
- 4 buttons total

### 4. Judge Selection
- Shows entry count per division
- Format: "5 Junior Primary • 8 Junior Advanced..."

### 5. PDF Score Sheets
- Division name appears on score sheet
- Example: "• Junior Primary"

### 6. Excel Exports
- "Age Division" column shows division name
- Example: "Junior Primary"

## TESTING GUIDE

### Test These Ages:
1. ✅ Age 5 → Should show "Junior Primary"
2. ✅ Age 7 → Should show "Junior Primary" (boundary)
3. ✅ Age 8 → Should show "Junior Advanced" (boundary)
4. ✅ Age 10 → Should show "Junior Advanced"
5. ✅ Age 12 → Should show "Junior Advanced" (boundary)
6. ✅ Age 13 → Should show "Senior Youth" (boundary)
7. ✅ Age 15 → Should show "Senior Youth"
8. ✅ Age 18 → Should show "Senior Youth" (boundary)
9. ✅ Age 19 → Should show "Senior Adult" (boundary)
10. ✅ Age 25 → Should show "Senior Adult"

### Expected Behavior:
- Dropdown shows all 4 divisions
- Green checkmark with division name appears
- Can manually override if needed
- Entry list shows correct division badge

## TROUBLESHOOTING

### Q: I don't see 4 divisions in the dropdown
**A:** You may be viewing an old competition. Create a new competition to see the 4 divisions.

### Q: My existing competition still has 2 divisions
**A:** Correct. Only new competitions created after this update will have 4 divisions. Existing competitions retain their original structure.

### Q: Can I edit the age ranges?
**A:** No. The age divisions are fixed to ensure consistency across all competitions.

### Q: What if a dancer is age 2?
**A:** The system will show a warning that the age doesn't match any division, but you can still create the entry.

### Q: Can I manually override the auto-selected division?
**A:** Yes. The auto-selection is a recommendation, but you can manually select any division from the dropdown.

## IMPLEMENTATION COMPLETE ✅

All features working as expected. Ready for production use.


