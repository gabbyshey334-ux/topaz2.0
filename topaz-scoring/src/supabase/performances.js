import { supabase } from './config';
import { groupEntries, getEntryDivisionType } from '../utils/entryFilters';

/**
 * Build insert payload for `performances` from an entry-shaped object.
 */
export function performancePayloadFromEntry(entry, competitionId) {
  if (!entry || !competitionId) return null;
  return {
    competition_id: competitionId,
    entry_number: entry.entry_number ?? null,
    routine_name: entry.routine_name ?? null,
    competitor_name: entry.competitor_name ?? 'Unknown',
    category_id: entry.category_id ?? null,
    age_division_id: entry.age_division_id ?? null,
    age: entry.age ?? null,
    ability_level: entry.ability_level ?? null,
    division_type: getEntryDivisionType(entry),
    dance_type: entry.dance_type ?? null,
    group_members: entry.group_members ?? null,
    photo_url: entry.photo_url ?? null,
    studio_name: entry.studio_name ?? null,
    teacher_name: entry.teacher_name ?? null,
    is_medal_program: entry.is_medal_program ?? false,
  };
}

/**
 * Replace participants for a performance from entry.group_members or solo competitor_name.
 */
export async function replaceParticipantsForPerformance(performanceId, entry) {
  await supabase.from('performance_participants').delete().eq('performance_id', performanceId);

  const rows = [];
  const gm = entry?.group_members;
  if (Array.isArray(gm) && gm.length > 0) {
    gm.forEach((m, i) => {
      const name = typeof m === 'string' ? m : m?.name;
      if (!name || !String(name).trim()) return;
      const age = typeof m === 'object' && m?.age != null ? parseInt(m.age, 10) : null;
      rows.push({
        performance_id: performanceId,
        display_name: String(name).trim(),
        age: Number.isFinite(age) ? age : null,
        sort_order: i,
      });
    });
  } else {
    const name = entry?.competitor_name;
    if (name && String(name).trim()) {
      rows.push({
        performance_id: performanceId,
        display_name: String(name).trim(),
        age: entry?.age != null ? parseInt(entry.age, 10) : null,
        sort_order: 0,
      });
    }
  }

  if (rows.length === 0) return { success: true, count: 0 };

  const { error } = await supabase.from('performance_participants').insert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true, count: rows.length };
}

export async function createPerformanceForEntry(entry, competitionId) {
  const payload = performancePayloadFromEntry(entry, competitionId);
  if (!payload) return { success: false, error: 'Invalid entry' };

  const { data, error } = await supabase.from('performances').insert([payload]).select('id').single();
  if (error) return { success: false, error: error.message };

  const pid = data.id;
  const part = await replaceParticipantsForPerformance(pid, entry);
  if (!part.success) return { success: false, error: part.error };

  return { success: true, performanceId: pid };
}

/**
 * Pick one performance_id when a cluster has conflicting non-null ids (repair).
 */
function pickCanonicalPerformanceId(cluster) {
  const ids = [...new Set(cluster.map((e) => e.performance_id).filter(Boolean))];
  if (ids.length === 0) return null;
  ids.sort();
  return ids[0];
}

/**
 * After duplicate judge scores point at sibling entry_ids, keep one row per (performance_id, judge_number).
 */
async function dedupeScoresForPerformance(performanceId) {
  const { data: scores, error } = await supabase
    .from('scores')
    .select('id, judge_number, total_score, updated_at')
    .eq('performance_id', performanceId)
    .order('judge_number');

  if (error || !scores?.length) return;

  const byJudge = new Map();
  for (const s of scores) {
    const j = s.judge_number;
    if (!byJudge.has(j)) {
      byJudge.set(j, []);
    }
    byJudge.get(j).push(s);
  }

  const toDelete = [];
  for (const [, list] of byJudge) {
    if (list.length <= 1) continue;
    list.sort((a, b) => {
      const tb = parseFloat(b.total_score || 0) - parseFloat(a.total_score || 0);
      if (tb !== 0) return tb;
      const db = new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      if (db !== 0) return db;
      return String(b.id).localeCompare(String(a.id));
    });
    for (let i = 1; i < list.length; i++) {
      toDelete.push(list[i].id);
    }
  }

  if (toDelete.length === 0) return;

  await supabase.from('scores').delete().in('id', toDelete);
}

/**
 * Link sibling entry rows to one performance + participants + score rows.
 * Safe to call repeatedly (idempotent when already linked).
 */
export async function ensurePerformancesLinked(entries, competitionId) {
  if (!entries?.length || !competitionId) return entries;

  const { primary, siblingMap } = groupEntries(entries);
  let changed = false;

  for (const p of primary) {
    const siblings = siblingMap.get(p.id) || [];
    const cluster = [p, ...siblings];

    const allHavePid = cluster.every((e) => e.performance_id);
    const samePid =
      allHavePid && cluster.every((e) => e.performance_id === cluster[0].performance_id);
    if (samePid) continue;

    let pid = pickCanonicalPerformanceId(cluster);

    if (!pid) {
      const created = await createPerformanceForEntry(p, competitionId);
      if (!created.success) {
        console.error('ensurePerformancesLinked: create failed', created.error);
        continue;
      }
      pid = created.performanceId;
    } else {
      const { error: upErr } = await supabase
        .from('performances')
        .update(performancePayloadFromEntry(p, competitionId))
        .eq('id', pid);
      if (upErr) console.warn('ensurePerformancesLinked: performance update', upErr.message);
      await replaceParticipantsForPerformance(pid, p);
    }

    const clusterIds = cluster.map((e) => e.id);
    const { error: eErr } = await supabase.from('entries').update({ performance_id: pid }).in('id', clusterIds);
    if (eErr) {
      console.error('ensurePerformancesLinked: entries update', eErr.message);
      continue;
    }

    cluster.forEach((e) => {
      e.performance_id = pid;
    });
    changed = true;

    const { error: sErr } = await supabase
      .from('scores')
      .update({ performance_id: pid })
      .in('entry_id', clusterIds);
    if (sErr) console.warn('ensurePerformancesLinked: scores update', sErr.message);

    await dedupeScoresForPerformance(pid);
  }

  if (changed) {
    const { data: refreshed, error } = await supabase
      .from('entries')
      .select(
        `
        *,
        category:categories(id, name),
        age_division:age_divisions(id, name, min_age, max_age)
      `
      )
      .eq('competition_id', competitionId)
      .order('entry_number');

    if (!error && refreshed?.length) {
      return refreshed;
    }
  }

  return entries;
}
