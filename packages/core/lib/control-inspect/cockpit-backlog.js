import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from '../control-read/fs.js';
import { markdownSection, parseBacklogSection, tableRows, cleanStatusCell, markdownLink, resolvedBacklogLinkTarget } from '../control-evaluation/shared.js';
import { isSafeControlRelativePath } from '../control-state/contained-file.js';
import { READ_LIMITS, fail } from '../control-read/snapshot.js';
import { COCKPIT_BACKLOG_SECTIONS } from './cockpit-list.js';

const SOURCE = '.agdf/control/MASTER_BACKLOG.md';
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const headings = COCKPIT_BACKLOG_SECTIONS;
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

export function backlogUrSource(row) {
  const paths = new Set();
  for (const match of `${row.source_links} · ${row.current_spec ?? ''}`.matchAll(/\[UR\]\([^)]+\)/gi)) {
    const link = markdownLink(match[0]);
    const path = link && resolvedBacklogLinkTarget(link.target);
    if (!path || /[%#?\0]/.test(link.target) || !isSafeControlRelativePath(path)
      || !path.startsWith('.agdf/control/artefacts/') || !/\.md$/i.test(path)) return { path: null, code: 'resource_denied' };
    paths.add(path);
  }
  return paths.size === 1 ? { path: [...paths][0], code: null }
    : { path: null, code: paths.size ? 'ur_link_ambiguous' : 'ur_link_missing' };
}

// Passive Markdown heading extraction for list presentation only. No evaluator changes.
export function backlogUrHeading(content) {
  let fence = null, comment = false, front = false, previous = '';
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (i === 0 && line.trim() === '---') { front = true; continue; }
    if (front) { if (/^(---|\.\.\.)\s*$/.test(line)) front = false; continue; }
    if (comment) { const end = line.indexOf('-->'); if (end < 0) continue; line = line.slice(end + 3); comment = false; }
    const block = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) { if (new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`).test(line)) fence = null; continue; }
    if (block) { fence = block[1]; previous = ''; continue; }
    while (line.includes('<!--')) {
      const start = line.indexOf('<!--'), end = line.indexOf('-->', start + 4);
      if (end < 0) { line = line.slice(0, start); comment = true; previous = ''; break; }
      line = line.slice(0, start) + line.slice(end + 3);
    }
    const atx = line.match(/^ {0,3}#(?:[ \t]+(.*)|$)/);
    if (atx) return (atx[1] ?? '').replace(/[ \t]+#+[ \t]*$/, '').trim();
    if (previous && /^ {0,3}=+\s*$/.test(line)) return previous;
    const paragraph = line.trim() && !/^(?:\s{4}|\t)|^ {0,3}(?:[#>|]|[-+*]\s|\d+[.)]\s|[-*_]{3,}\s*$)/.test(line);
    previous = paragraph ? (previous ? previous + '\n' : '') + line.trim() : '';
  }
  return '';
}

export function projectBacklogUrTitle(root, view, row, backlogDigest) {
  const source = backlogUrSource(row);
  const observation = { state: 'unavailable', code: source.code, path: source.path, heading: null, title: null,
    content_digest: null, observed_as_of: view.observed_as_of, backlog_digest: backlogDigest };
  if (!source.path) return observation;
  const read = view.readOptionalFileSync(join(root, source.path), READ_LIMITS.preview);
  if (read.code) return { ...observation, code: read.code };
  let content;
  try { content = decoder.decode(read.bytes); if (content.includes('\0')) throw Error(); }
  catch { return { ...observation, code: 'document_unsupported' }; }
  const heading = backlogUrHeading(content), title = heading.replace(/^UR:\s*/i, '').trim();
  if (!title) return { ...observation, code: 'ur_heading_missing' };
  if ([...heading].length > 512 || Buffer.byteLength(heading, 'utf8') > 2048) return { ...observation, code: 'resource_limit' };
  return { ...observation, state: 'available', code: null, heading, title,
    content_digest: createHash('sha256').update(read.bytes).digest('hex') };
}
