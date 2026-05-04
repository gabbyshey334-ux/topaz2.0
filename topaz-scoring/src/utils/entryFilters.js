/**
 * Normalization for matching website-synced labels to competition categories / filters.
 * Case-insensitive; removes hyphens and whitespace (see product requirement).
 */
export function normalizeMatchKey(str) {
  if (str == null || str === '') return '';
  return String(str).toLowerCase().replace(/[-\s]/g, '');
}

/**
 * Normalize division-type strings for admin division filters (extends legacy normalization).
 */
export function normalizeDivisionCompare(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[-_\s()/]/g, '');
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
