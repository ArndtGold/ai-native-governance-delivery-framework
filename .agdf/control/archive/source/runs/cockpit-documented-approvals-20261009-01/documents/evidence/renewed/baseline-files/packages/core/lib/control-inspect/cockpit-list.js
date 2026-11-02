// Pure internal Core policy shared by Node readers and browser list presentations.
// Raw entries and opaque selectors remain in source order and are never modified here.
export const COCKPIT_BACKLOG_SECTIONS = Object.freeze([
  'Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers',
]);
const unreadableLayout = /^(backlog_(section_missing|layout_missing|layout_unsupported)|AGDF_BACKLOG_LAYOUT_UNKNOWN)$/;

export function hasConsistentBacklogCounts(inventory) {
  if (!inventory || !Array.isArray(inventory.entries) || !inventory.counts || typeof inventory.counts !== 'object') return false;
  const actual = new Map();
  for (const row of inventory.entries) {
    if (!row || !COCKPIT_BACKLOG_SECTIONS.includes(row.section)) return false;
    actual.set(row.section, (actual.get(row.section) ?? 0) + 1);
  }
  return Object.entries(inventory.counts).every(([section, count]) => COCKPIT_BACKLOG_SECTIONS.includes(section)
    && Number.isSafeInteger(count) && count >= 0 && count === (actual.get(section) ?? 0))
    && [...actual.keys()].every(section => Object.hasOwn(inventory.counts, section));
}

export function backlogRowKey(entry, index, digest) {
  return JSON.stringify([digest, index, entry.section, entry.key]);
}

export function projectCockpitList(inventory, { section = COCKPIT_BACKLOG_SECTIONS[0], query = '' } = {}) {
  if (!COCKPIT_BACKLOG_SECTIONS.includes(section)) throw Error('dto_invalid');
  const normalizedQuery = query.trim().toLowerCase();
  const unavailable = { section, query: normalizedQuery, coverage: 'unavailable', diagnostics: [], sectionCount: null, matchCount: null, rows: [] };
  if (!inventory) return unavailable;
  if (!hasConsistentBacklogCounts(inventory)) throw Error('dto_invalid');
  const diagnostics = inventory.diagnostics.filter(d => !d.section || d.section === section);
  if (!Object.hasOwn(inventory.counts, section) || diagnostics.some(d => unreadableLayout.test(d.code))) return { ...unavailable, diagnostics };
  const rows = [];
  let sectionCount = 0, nonselectable = false;
  inventory.entries.forEach((entry, index) => {
    if (entry.section !== section) return;
    sectionCount++;
    nonselectable ||= !entry.selectable;
    if (normalizedQuery && ![entry.title, entry.key, entry.stored_status].some(field => field.toLowerCase().includes(normalizedQuery))) return;
    rows.push({ entry, index, identity: backlogRowKey(entry, index, inventory.content_digest), selectable: entry.selectable,
      displayTitle: entry.title.replace(/^\[(framework[-_]maintenance|external[-_]delivery)\]\s*/i, '') || entry.title,
      provenance: { path: inventory.source_path, digest: inventory.content_digest, originalTitle: entry.title } });
  });
  return { section, query: normalizedQuery, coverage: diagnostics.length || nonselectable ? 'partial' : 'complete', diagnostics,
    sectionCount, matchCount: rows.length, rows: rows.reverse() };
}
