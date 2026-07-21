import { describe, it, expect } from 'vitest';
import {
  getScoreRowTotal,
  pickReconciledJudgeScore,
  calculateAverageFromScores,
  dedupeScoresByJudge,
} from './scoreReconciliation.js';

describe('getScoreRowTotal', () => {
  it('uses total_score when set', () => {
    expect(getScoreRowTotal({ total_score: 87.5, technique: 1, creativity: 1, presentation: 1, appearance: 1 })).toBe(87.5);
  });

  it('sums components when total_score absent', () => {
    expect(
      getScoreRowTotal({
        technique: 20,
        creativity: 20,
        presentation: 20,
        appearance: 20,
      })
    ).toBe(80);
  });

  it('parses string decimals from Postgres without concatenating', () => {
    expect(getScoreRowTotal({ total_score: '100' })).toBe(100);
    expect(
      getScoreRowTotal({
        technique: '25',
        creativity: '25',
        presentation: '25',
        appearance: '25',
      })
    ).toBe(100);
  });
});

describe('calculateAverageFromScores', () => {
  it('averages two perfect judges to 100, not 200', () => {
    const scores = [
      { judge_number: 1, total_score: 100 },
      { judge_number: 2, total_score: 100 },
    ];
    expect(calculateAverageFromScores(scores)).toBe(100);
  });

  it('averages string total_score values correctly (no string concat)', () => {
    const scores = [
      { judge_number: 1, total_score: '90' },
      { judge_number: 2, total_score: '80' },
    ];
    expect(calculateAverageFromScores(scores)).toBe(85);
  });

  it('returns 0 for empty list', () => {
    expect(calculateAverageFromScores([])).toBe(0);
    expect(calculateAverageFromScores(null)).toBe(0);
  });
});

describe('dedupeScoresByJudge', () => {
  it('collapses string and numeric judge_number into one row', () => {
    const scores = [
      { id: 'a', judge_number: 1, total_score: 90 },
      { id: 'b', judge_number: '1', total_score: 95 },
      { id: 'c', judge_number: 2, total_score: 80 },
    ];
    const deduped = dedupeScoresByJudge(scores);
    expect(deduped).toHaveLength(2);
    expect(calculateAverageFromScores(deduped)).toBe(87.5);
  });
});

describe('pickReconciledJudgeScore', () => {
  const row = (id, entry_number, total) => ({
    entry: { id, entry_number },
    score: {
      id: `s-${id}`,
      entry_id: id,
      judge_number: 1,
      technique: 25,
      creativity: 25,
      presentation: 25,
      appearance: 25,
      total_score: total,
    },
  });

  it('prefers primary entry row', () => {
    const picked = pickReconciledJudgeScore(
      [row('sib', 2, 90), row('primary', 1, 100)],
      'primary'
    );
    expect(picked.total_score).toBe(100);
  });

  it('falls back to highest total when primary missing', () => {
    const picked = pickReconciledJudgeScore([row('a', 3, 88), row('b', 2, 100)], 'missing');
    expect(picked.total_score).toBe(100);
  });
});
