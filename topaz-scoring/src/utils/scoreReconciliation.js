/**
 * Total from a scores row (prefer DB total_score).
 * Always numeric — Postgres decimals can arrive as strings; never concatenate.
 */
export function getScoreRowTotal(s) {
  if (s == null) return 0;
  const fromCol = parseFloat(s.total_score);
  if (!Number.isNaN(fromCol) && s.total_score != null && s.total_score !== '') return fromCol;
  return (
    (parseFloat(s.technique) || 0) +
    (parseFloat(s.creativity) || 0) +
    (parseFloat(s.presentation) || 0) +
    (parseFloat(s.appearance) || 0)
  );
}

/**
 * Final entry score = average of each judge's /100 total (NOT the sum).
 * Two judges at 100 → 100, never 200.
 */
export function calculateAverageFromScores(scores) {
  if (!scores?.length) return 0;
  const sum = scores.reduce((acc, s) => acc + getScoreRowTotal(s), 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

/**
 * One row per judge_number (numeric key) so duplicates / string-vs-number keys don't double-count.
 */
export function dedupeScoresByJudge(scores) {
  if (!scores?.length) return [];
  const byJudge = new Map();
  for (const score of scores) {
    const judgeKey = Number(score.judge_number);
    const key = Number.isFinite(judgeKey) ? judgeKey : `unknown-${score.id || byJudge.size}`;
    const existing = byJudge.get(key);
    if (!existing || getScoreRowTotal(score) >= getScoreRowTotal(existing)) {
      byJudge.set(key, score);
    }
  }
  return [...byJudge.entries()]
    .sort(([a], [b]) => (typeof a === 'number' && typeof b === 'number' ? a - b : 0))
    .map(([, score]) => score);
}

/**
 * When merged routine rows have different scores for the same judge, pick one deterministically:
 * 1) Prefer the primary entry's row (canonical card).
 * 2) Else highest total; tie-break lowest entry_number.
 *
 * @param {Array<{ entry: object, score: object }>} candidates
 * @param {string} primaryEntryId
 */
export function pickReconciledJudgeScore(candidates, primaryEntryId) {
  if (!candidates?.length) return null;
  const onPrimary = candidates.find((c) => c.entry?.id === primaryEntryId);
  if (onPrimary) return onPrimary.score;
  return candidates.reduce((best, cur) => {
    const bt = getScoreRowTotal(best.score);
    const ct = getScoreRowTotal(cur.score);
    if (ct > bt) return cur;
    if (ct < bt) return best;
    const bn = best.entry?.entry_number ?? Infinity;
    const cn = cur.entry?.entry_number ?? Infinity;
    return cn < bn ? cur : best;
  }).score;
}
