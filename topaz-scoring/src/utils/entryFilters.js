/**
 * Normalization for matching website-synced labels to competition categories / filters.
 * Case-insensitive; removes hyphens and whitespace (see product requirement).
 */
export function normalizeMatchKey(str) {
  if (str == null || str === '') return '';
  return String(str).toLowerCase().replace(/[-\s]/g, '');
}

export function normalizeFilterText(str) {
  if (str == null || str === '') return '';
  return String(str).toLowerCase().trim().replace(/[-\s]+/g, ' ');
}

export function getAgeGroup(age) {
  const n = parseInt(age, 10);
  if (Number.isNaN(n)) return 'Unknown';
  if (n >= 3 && n <= 7) return 'Junior Primary (3-7)';
  if (n >= 8 && n <= 10) return 'Primary (8-10)';
  if (n >= 11 && n <= 13) return 'Junior (11-13)';
  if (n >= 14 && n <= 18) return 'Teen (14-18)';
  if (n >= 19) return 'Senior (19+)';
  return 'Unknown';
}

export function getEntryAgeGroupLabel(entry, ageDivisionsList = []) {
  if (!entry) return 'Unknown';

  if (entry.age_division?.name) {
    const withRange =
      entry.age_division.min_age != null && entry.age_division.max_age != null
        ? `${entry.age_division.name} (${entry.age_division.min_age}-${entry.age_division.max_age})`
        : entry.age_division.name;
    return withRange;
  }

  if (entry.age_division_id) {
    const byId = ageDivisionsList.find((d) => d.id === entry.age_division_id);
    if (byId?.name) {
      const withRange =
        byId.min_age != null && byId.max_age != null
          ? `${byId.name} (${byId.min_age}-${byId.max_age})`
          : byId.name;
      return withRange;
    }
  }

  return getAgeGroup(entry.age);
}

/**
 * Normalize division-type strings for admin division filters (extends legacy normalization).
 */
export function normalizeDivisionCompare(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[-_\s()/]/g, '');
}

export function getEntryDivisionType(entry) {
  if (entry?.division_type != null && String(entry.division_type).trim() !== '') {
    return String(entry.division_type).trim();
  }

  if (!entry?.dance_type) return 'Solo';

  let divisionType = entry.dance_type;
  const pipeIndex = divisionType.indexOf('|');
  if (pipeIndex > -1) {
    divisionType = divisionType.substring(0, pipeIndex);
  }

  divisionType = divisionType.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const lower = divisionType.toLowerCase();

  if (lower.includes('small group')) return 'Small Group';
  if (lower.includes('large group')) return 'Large Group';
  if (lower.includes('duo') && !lower.includes('trio')) return 'Duo';
  if (lower.includes('trio')) return 'Trio';
  if (lower.includes('production')) return 'Production';
  if (lower.includes('student choreography')) return 'Student Choreography';
  if (lower.includes('teacher') && lower.includes('student')) return 'Teacher/Student';
  if (lower.includes('solo')) return 'Solo';

  // dance_type holds only performance category (e.g. "Vocal") — division lives in entries.division_type
  return 'Solo';
}

/**
 * One display line: "#{entry_number} {competitor_name}" (no leading space if name missing).
 */
export function formatEntryNameWithNumber(entry) {
  if (!entry) return '';
  const num = entry.entry_number != null ? entry.entry_number : '';
  const name = entry.competitor_name ?? '';
  return `#${num} ${name}`.trim();
}

/**
 * Group DB rows into one scoring routine: Solos stay separate; non-Solos keyed by
 * routine name (competitor_name) + division_type. First row by entry_number is primary; rest are siblings.
 */
export function groupEntries(entries) {
  const seen = new Map();
  const primary = [];
  const siblingMap = new Map();

  const sorted = [...(entries || [])].sort(
    (a, b) => (a.entry_number || 0) - (b.entry_number || 0)
  );

  for (const entry of sorted) {
    if (!entry.division_type || entry.division_type === 'Solo') {
      primary.push(entry);
      siblingMap.set(entry.id, []);
      continue;
    }
    const key =
      String(entry.competitor_name || '').trim().toLowerCase() +
      '||' +
      String(entry.division_type || '');
    if (!seen.has(key)) {
      seen.set(key, entry.id);
      primary.push(entry);
      siblingMap.set(entry.id, []);
    } else {
      const primaryId = seen.get(key);
      const list = siblingMap.get(primaryId);
      if (list) list.push(entry);
    }
  }
  return { primary, siblingMap };
}

/** Division type filter: exact match on entries.division_type when set; else legacy inference. */
export function matchesDivisionTypeFilter(entry, selectedDivision) {
  if (!selectedDivision || selectedDivision === 'all') return true;
  const raw = entry?.division_type;
  const dt =
    raw != null && String(raw).trim() !== '' ? String(raw).trim() : null;
  if (dt != null) return dt === selectedDivision;
  return (
    normalizeFilterText(getEntryDivisionType(entry)) ===
    normalizeFilterText(selectedDivision)
  );
}

/**
 * Infer the performance category label stored in entries.dance_type.
 * - Setup app / groups: "Solo | Tap", "Small Group (4-10) | Jazz"
 * - Website sync: style only e.g. "TAP", "HIP HOP"
 */
export function getEntryStyleLabelForCategoryMatch(entry) {
  const raw = entry?.dance_type;
  if (!raw || typeof raw !== 'string') return '';

  const trimmed = raw.trim();
  const pipeIndex = trimmed.indexOf('|');
  const beforePipe = pipeIndex > -1 ? trimmed.slice(0, pipeIndex).trim() : trimmed;
  const afterPipe = pipeIndex > -1 ? trimmed.slice(pipeIndex + 1).trim() : '';

  const normSeg = (s) => String(s).toLowerCase().replace(/[-_\s()/]/g, '');
  const beforeN = normSeg(beforePipe);
  const looksLikeDivision =
    beforeN.includes('solo') ||
    beforeN.includes('duo') ||
    beforeN.includes('trio') ||
    beforeN.includes('smallgroup') ||
    beforeN.includes('largegroup') ||
    beforeN.includes('production');

  if (afterPipe && looksLikeDivision) return afterPipe;
  if (!afterPipe && !looksLikeDivision) return beforePipe;
  if (!afterPipe && looksLikeDivision) return '';
  return afterPipe || beforePipe;
}

export function entryMatchesCategory(entry, category) {
  if (!entry || !category?.id) return false;
  if (entry.category_id === category.id) return true;

  const linkedName = entry.category?.name;
  if (linkedName && normalizeMatchKey(linkedName) === normalizeMatchKey(category.name)) {
    return true;
  }

  const styleLabel = getEntryStyleLabelForCategoryMatch(entry);
  if (!styleLabel) return false;
  return normalizeMatchKey(styleLabel) === normalizeMatchKey(category.name);
}

export function entryMatchesCategoryId(entry, categoryId, categoriesList) {
  if (!categoryId) return true;
  const cat = categoriesList?.find((c) => c.id === categoryId);
  if (!cat) return entry.category_id === categoryId;
  return entryMatchesCategory(entry, cat);
}

export function normalizeAbilityKey(s) {
  if (s == null || s === '') return '';
  const n = String(s).trim().toLowerCase().replace(/[-\s]/g, '');
  if (n.startsWith('beg')) return 'beginning';
  if (n.startsWith('int')) return 'intermediate';
  if (n.startsWith('adv')) return 'advanced';
  return n;
}

export function abilitiesMatch(entryAbility, filterAbility) {
  if (!filterAbility || filterAbility === 'all') return true;
  return normalizeAbilityKey(entryAbility) === normalizeAbilityKey(filterAbility);
}

export function ageFilterMatchesEntry(entry, filterAgeDivisionId, ageDivisionsList = []) {
  if (!filterAgeDivisionId) return true;
  if (!entry) return false;

  // Keep fast path for structured entries where age_division_id is linked.
  if (entry.age_division_id === filterAgeDivisionId) return true;

  // Fallback for website-synced rows that only have numeric age.
  const selectedDivision = ageDivisionsList.find((d) => d.id === filterAgeDivisionId);
  if (!selectedDivision) return false;

  const entryLabel = normalizeFilterText(getEntryAgeGroupLabel(entry, ageDivisionsList));
  const selectedLabel = normalizeFilterText(
    selectedDivision.min_age != null && selectedDivision.max_age != null
      ? `${selectedDivision.name} (${selectedDivision.min_age}-${selectedDivision.max_age})`
      : selectedDivision.name
  );

  if (entryLabel === selectedLabel) return true;

  const age = parseInt(entry.age, 10);
  if (Number.isNaN(age)) return false;
  if (selectedDivision.min_age != null && age < selectedDivision.min_age) return false;
  if (selectedDivision.max_age != null && age > selectedDivision.max_age) return false;
  return true;
}

/** Resolve label for UI when category_id is missing (e.g. website sync). */
export function getDisplayCategoryName(entry, categoriesList) {
  if (!entry) return 'Unknown';
  const direct = categoriesList?.find((c) => c.id === entry.category_id);
  if (direct) return direct.name;
  const style = getEntryStyleLabelForCategoryMatch(entry);
  if (style) {
    const byStyle = categoriesList?.find(
      (c) => normalizeMatchKey(c.name) === normalizeMatchKey(style)
    );
    if (byStyle) return byStyle.name;
    return style;
  }
  return 'Unknown';
}

/** Division types that score as one routine (multiple DB rows may exist per routine). */
export const GROUP_DIVISION_TYPES_FOR_SCORING = [
  'Duo',
  'Trio',
  'Small Group',
  'Large Group',
  'Production'
];

function parseGroupMembersSortedKey(entry) {
  const gm = entry?.group_members;
  if (Array.isArray(gm) && gm.length > 0) {
    return gm
      .map((m) =>
        typeof m === 'string'
          ? String(m).trim().toLowerCase()
          : String(m?.name || '').trim().toLowerCase()
      )
      .filter(Boolean)
      .sort()
      .join('|');
  }
  const dt = entry?.dance_type;
  if (typeof dt === 'string') {
    try {
      const match = dt.match(/Members: (\[.*?\])/);
      if (match) {
        const arr = JSON.parse(match[1]);
        return arr
          .map((x) => String(typeof x === 'string' ? x : x?.name || '').trim().toLowerCase())
          .filter(Boolean)
          .sort()
          .join('|');
      }
    } catch {
      /* ignore */
    }
  }
  return '';
}

export function isGroupDivisionForScoring(entry) {
  const d = getEntryDivisionType(entry);
  return GROUP_DIVISION_TYPES_FOR_SCORING.includes(d);
}

/**
 * Stable key: same routine + same category/age/division → one scoring card.
 * Uses routine_name when present; otherwise competitor_name (website sync stores routine there).
 * Appends sorted member names when present so duplicate rows share one key even if labels differ slightly.
 */
export function getRoutineGroupKey(entry) {
  if (!entry) return '';
  if (!isGroupDivisionForScoring(entry)) {
    return `solo::${entry.id}`;
  }
  const routineLabel = String(entry.routine_name ?? entry.competitor_name ?? '').trim();
  const membersKey = parseGroupMembersSortedKey(entry);
  const routineNorm = normalizeMatchKey(routineLabel);
  const identity = membersKey ? `${routineNorm}::${membersKey}` : routineNorm;
  return [
    entry.category_id || '',
    entry.age_division_id || '',
    normalizeMatchKey(getEntryDivisionType(entry)),
    identity
  ].join('::');
}

export function dedupeEntriesForGroupScoring(entryList) {
  if (!entryList?.length) return [];
  return entryList.filter((entry, index, arr) => {
    if (!isGroupDivisionForScoring(entry)) return true;
    const key = getRoutineGroupKey(entry);
    return arr.findIndex((e) => isGroupDivisionForScoring(e) && getRoutineGroupKey(e) === key) === index;
  });
}

export function getSiblingRoutineEntries(entry, allEntries) {
  if (!entry || !allEntries?.length || !isGroupDivisionForScoring(entry)) return [];
  const key = getRoutineGroupKey(entry);
  return allEntries.filter(
    (e) => e.id !== entry.id && isGroupDivisionForScoring(e) && getRoutineGroupKey(e) === key
  );
}

/** Primary headline for group cards: explicit routine title when synced/admin adds it. */
export function getRoutineDisplayTitle(entry) {
  if (!entry) return '';
  const t = entry.routine_name?.trim();
  if (t) return t;
  return String(entry.competitor_name ?? '').trim();
}

/** Match search query against routine title and group member names. */
export function entryMatchesSearchQuery(entry, queryLower) {
  if (!queryLower) return true;
  if ((entry.competitor_name || '').toLowerCase().includes(queryLower)) return true;
  if (String(entry.entry_number).includes(queryLower)) return true;
  const routine = (entry.routine_name || '').toLowerCase();
  if (routine.includes(queryLower)) return true;
  const gm = entry.group_members;
  if (Array.isArray(gm)) {
    for (const m of gm) {
      const n = typeof m === 'string' ? m : m?.name;
      if (n && String(n).toLowerCase().includes(queryLower)) return true;
    }
  }
  return false;
}
