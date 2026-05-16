import { describe, it, expect } from 'vitest';
import { normalizeGroupMemberRow, sanitizePerformerAge } from './entryFilters';

describe('sanitizePerformerAge', () => {
  it('accepts typical ages', () => {
    expect(sanitizePerformerAge(8)).toBe(8);
    expect(sanitizePerformerAge('24')).toBe(24);
  });
  it('rejects out-of-range values used as bad data', () => {
    expect(sanitizePerformerAge(241)).toBeNull();
    expect(sanitizePerformerAge(0)).toBeNull();
    expect(sanitizePerformerAge('')).toBeNull();
  });
});

describe('normalizeGroupMemberRow', () => {
  it('parses legacy "Name (24)" strings', () => {
    expect(normalizeGroupMemberRow('Alex (17)')).toEqual({ name: 'Alex', age: 17 });
  });
  it('handles string-only members', () => {
    expect(normalizeGroupMemberRow('B')).toEqual({ name: 'B', age: null });
  });
  it('reads common age keys from objects', () => {
    expect(normalizeGroupMemberRow({ name: 'Sam', age: 12 })).toEqual({ name: 'Sam', age: 12 });
    expect(normalizeGroupMemberRow({ competitor_name: 'Pat', participant_age: 19 })).toEqual({
      name: 'Pat',
      age: 19,
    });
  });
  it('drops invalid ages on objects', () => {
    expect(normalizeGroupMemberRow({ name: 'j', age: 241 })).toEqual({ name: 'j', age: null });
  });
});
