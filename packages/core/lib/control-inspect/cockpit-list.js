// Pure current-model list policy shared by Core and the browser.
export const COCKPIT_WORK_SECTIONS = Object.freeze(['active', 'planned', 'completed', 'archive']);
export function hasConsistentWorkCounts(inventory) {
  if (!inventory || inventory.layout !== 'run-folders-v1' || !Array.isArray(inventory.entries)
    || !inventory.counts || typeof inventory.counts !== 'object' || Object.keys(inventory.counts).length !== COCKPIT_WORK_SECTIONS.length) return false;
  return COCKPIT_WORK_SECTIONS.every(section => Number.isSafeInteger(inventory.counts[section])
    && inventory.counts[section] === inventory.entries.filter(row => row?.section === section).length)
    && inventory.entries.every(row => row && COCKPIT_WORK_SECTIONS.includes(row.section));
}
export function projectCockpitList(inventory, { section = 'active', query = '' } = {}) {
  if (!COCKPIT_WORK_SECTIONS.includes(section)) throw Error('dto_invalid');
  const normalized = query.trim().toLowerCase();
  if (!inventory) return { section, query: normalized, coverage: 'unavailable', diagnostics: [], sectionCount: null, matchCount: 0, rows: [] };
  if (!hasConsistentWorkCounts(inventory)) throw Error('dto_invalid');
  const diagnostics = inventory.diagnostics.filter(row => !row.section || row.section === section);
  if (diagnostics.some(row => row.code === 'work_section_unavailable')) return { section, query: normalized, coverage: 'unavailable', diagnostics, sectionCount: null, matchCount: null, rows: [] };
  const selected = inventory.entries.map((entry, index) => ({ entry, index })).filter(row => row.entry.section === section);
  const rows = selected.filter(({ entry }) => !normalized || [entry.title, entry.key, entry.stored_status]
    .some(value => value.toLowerCase().includes(normalized))).map(({ entry, index }) => ({ entry, index,
      identity: JSON.stringify([entry.identity, entry.source.digest]), selectable: entry.selectable, displayTitle: entry.title.replace(/^\[(framework[-_]maintenance|external[-_]delivery)\]\s*/i, '') || entry.title,
      provenance: { path: entry.source.path, digest: entry.source.digest, originalTitle: entry.title } }));
  return { section, query: normalized, coverage: diagnostics.length || selected.some(row => !row.entry.selectable) ? 'partial' : 'complete',
    diagnostics, sectionCount: selected.length, matchCount: rows.length, rows };
}

// Presentation-only grouping/search over the shared inventory's already ordered entries.
export function projectCockpitRuns(inventory, { section = 'active', query = '' } = {}) {
  if (!['active', 'completed'].includes(section)) throw Error('dto_invalid');
  const normalized = query.trim().toLowerCase();
  const entries = inventory.runs.filter(run => section === 'active'
    ? !run.valid || run.lifecycle === 'active' : run.valid && run.lifecycle !== 'active');
  const rows = entries.filter(run => !normalized || [run.title, run.run_id, run.attention.label]
    .some(value => value.toLowerCase().includes(normalized)));
  return { rows, sectionCount: entries.length, matchCount: rows.length,
    coverage: inventory.state === 'complete' ? 'complete' : inventory.state === 'absent' ? 'unavailable' : 'partial' };
}
