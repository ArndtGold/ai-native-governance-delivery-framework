import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from '../control-read/fs.js';
import { markdownSection, parseBacklogSection, tableRows, cleanStatusCell } from '../control-evaluation/shared.js';
import { READ_LIMITS, fail } from '../control-read/snapshot.js';

const SOURCE = '.agdf/control/MASTER_BACKLOG.md';
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const headings = ['Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers'];
const completedHeader = ['key', 'work item', 'status', 'record', 'outcome'];
const canonicalCompletedHeader = ['key', 'work item', 'final status', 'historical record', 'outcome'];

// A stored pointer projection. It never resolves Runs, evaluates gates or follows links.
export function projectCockpitBacklog(root) {
  const path = join(root, SOURCE);
  if (!existsSync(path)) return { state: 'missing', code: 'backlog_missing', data: null };
  const bytes = readFileSync(path);
  if (bytes.length > READ_LIMITS.preview) fail('resource_limit');
  let source;
  try { source = decoder.decode(bytes); if (source.includes('\0')) throw Error(); }
  catch { return { state: 'unsupported', code: 'backlog_unsupported', data: null }; }
  const entries = [], diagnostics = [], counts = {};
  const diagnostic = (code, section, key = null) => diagnostics.push({ code, path: SOURCE, section, key });
  for (const section of headings) {
    const content = markdownSection(source, section), rows = tableRows(content);
    if (!new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(source)) {
      diagnostic('backlog_section_missing', section); counts[section] = 0; continue;
    }
    if (!rows.length) { diagnostic('backlog_layout_missing', section); counts[section] = 0; continue; }
    const completed = section === headings[2];
    const normalized = rows[0].map(cell => cell.toLowerCase().trim());
    let pointers = [];
    if (completed) {
      if (![completedHeader.join('|'), canonicalCompletedHeader.join('|')].includes(normalized.join('|'))) {
        diagnostic('backlog_layout_unsupported', section); counts[section] = 0; continue;
      }
    } else {
      const findings = [];
      pointers = parseBacklogSection(content, findings, SOURCE);
      diagnostics.push(...findings.map(row => ({ ...row, section })));
      if (findings.some(row => row.code === 'AGDF_BACKLOG_LAYOUT_UNKNOWN')) { counts[section] = 0; continue; }
    }
    const width = rows[0].length;
    let pointerIndex = 0;
    for (const cells of rows.slice(1).filter(row => row.some(Boolean))) {
      const pointer = completed ? null : pointers[pointerIndex++];
      const compact = width === 7;
      const key = cleanStatusCell(cells[completed ? 0 : 1] ?? '');
      const malformed = cells.length !== width || !key || !(cells[completed ? 1 : 2] ?? '').trim();
      if (malformed) diagnostic('backlog_row_malformed', section, key);
      entries.push({ section, key, original_key: cells[completed ? 0 : 1] ?? '',
        title: cells[completed ? 1 : 2] ?? '', stored_status: cells[completed ? 2 : 3] ?? '',
        scope: pointer?.scope ?? '', priority: completed ? null : cells[0] ?? '',
        stored_next_step: completed ? cells[4] ?? '' : cells[compact ? 6 : 12] ?? '',
        source_links: completed ? cells[3] ?? '' : compact ? cells[4] ?? '' : cells.slice(4, 11).join(' · '),
        current_spec: completed ? null : cells[compact ? 5 : 11] ?? '',
        normalized_pointer: pointer,
        selectable: !malformed && /^[A-Za-z0-9_-]{1,128}$/.test(key) });
    }
    counts[section] = entries.filter(row => row.section === section).length;
  }
  const seen = new Map();
  for (const entry of entries) {
    if (seen.has(entry.key)) {
      diagnostic('backlog_key_duplicate', entry.section, entry.key);
      entry.selectable = false; seen.get(entry.key).selectable = false;
    } else seen.set(entry.key, entry);
  }
  return { state: diagnostics.length ? 'partial' : entries.length ? 'available' : 'empty',
    code: diagnostics.length ? 'backlog_partial' : null,
    data: { kind: 'backlog', entries, diagnostics, source_path: SOURCE,
      content_digest: createHash('sha256').update(bytes).digest('hex'), counts } };
}
