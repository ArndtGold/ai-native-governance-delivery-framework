import { BACKLOG_SUMMARY_FIELDS, validBacklogSummary } from './backlog-summary-shape.js';
import { createHash } from 'node:crypto';
import { canonicalJson, resolveControlCommandTarget } from './approval-command-contract.js';
import { firstSection, tableCells, tableLineIndexes } from './run-state-edits.js';
import { summaryLabel } from '../control-evaluation/backlog-vocabulary.js';

export const BACKLOG_SUMMARY_LIMIT = 65536;
const prefix = '<!-- agdf-backlog-summary-v1 ';
const fields = BACKLOG_SUMMARY_FIELDS;
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const sections = ['Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers'];
export const backlogRowDigest = (section, cells) => digest(canonicalJson({ section, cells }));
export { validBacklogSummary } from './backlog-summary-shape.js';

export function decodeBacklogMarker(line) {
  if (!line.startsWith('<!-- agdf-backlog-summary-')) return null;
  const match = line.match(/^<!-- agdf-backlog-summary-v1 ([A-Za-z0-9+/]+={0,2}) -->$/u);
  if (!match || match[1].length > Math.ceil(BACKLOG_SUMMARY_LIMIT / 3) * 4) return { code: 'backlog_summary_invalid', record: null };
  try {
    const bytes = Buffer.from(match[1], 'base64');
    if (bytes.length > BACKLOG_SUMMARY_LIMIT || bytes.toString('base64') !== match[1]) throw Error();
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const record = JSON.parse(value);
    if (!validBacklogSummary(record) || canonicalJson(record) !== value) throw Error();
    return { code: null, record };
  } catch { return { code: 'backlog_summary_invalid', record: null }; }
}
export function savedBacklogSummary(root, section, cells, markers) {
  const key = cells[section === sections[2] ? 0 : 1]?.replaceAll('`', '').trim();
  const candidates = markers.filter(m => m.record?.run_id === key);
  const fallback = code => ({ provenance_state: code ? 'invalid' : 'unverified', code, record: null,
    label_de: null, limitation_de: code ? 'Gespeicherter Quellenbezug ungültig; aktueller Stand nicht geprüft.' : 'Gespeicherter Stand; Quellenbezug und aktueller Run nicht geprüft.', authorizes: false });
  if (!candidates.length) return fallback(markers.some(m => m.code) ? 'backlog_summary_invalid' : null);
  const row = candidates[0].record;
  if (markers.some(m => m.code) || candidates.length !== 1 || row.target_id !== resolveControlCommandTarget(root).target_id
      || row.section !== section || row.row_digest !== backlogRowDigest(section, cells)) return fallback('backlog_summary_mismatch');
  return { provenance_state: 'recorded', code: null, record: row, label_de: summaryLabel(row.kind, 'de'),
    limitation_de: row.limitations.length ? 'Quellenbezug eingeschränkt; aktueller Stand nicht bestätigt.'
      : 'Gespeicherte Beobachtung; aktueller Run noch nicht verglichen.', authorizes: false };
}

// Called by existing writers under their locks. Only the addressed marker is replaced.
export function recordBacklogSummary(root, content, runId, section, summary, revisionId) {
  if (Buffer.byteLength(content) > 2097152) throw Error('AGDF_BACKLOG_LAYOUT_UNSUPPORTED');
  const bounded = next => { if (Buffer.byteLength(next) > 2097152) throw Error('AGDF_BACKLOG_LAYOUT_UNSUPPORTED'); return next; };
  const lines = content.split('\n'), scope = firstSection(lines, section);
  if (!scope) throw Error('AGDF_BACKLOG_LAYOUT_UNSUPPORTED');
  const indexes = tableLineIndexes(lines, scope), column = section === sections[2] ? 0 : 1;
  const matches = indexes.slice(2).filter(i => tableCells(lines[i])[column]?.replaceAll('`', '').trim() === runId);
  if (matches.length !== 1) throw Error('AGDF_BACKLOG_IDENTITY_AMBIGUOUS');
  const row = { schema_version: 1, target_id: resolveControlCommandTarget(root).target_id, run_id: runId,
    section, row_digest: backlogRowDigest(section, tableCells(lines[matches[0]])), revision_id: revisionId,
    observed_at: new Date().toISOString(), ...Object.fromEntries(fields.slice(7).map(k => [k, summary[k]])) };
  const previous = lines.map(decodeBacklogMarker).filter(m => m?.record?.run_id === runId);
  if (previous.length === 1 && canonicalJson({ ...previous[0].record, observed_at: row.observed_at }) === canonicalJson(row)) row.observed_at = previous[0].record.observed_at;
  const encoded = canonicalJson(row);
  if (!validBacklogSummary(row) || Buffer.byteLength(encoded) > BACKLOG_SUMMARY_LIMIT) throw Error('AGDF_BACKLOG_SUMMARY_INVALID');
  // An identical explicit synchronization preserves all bytes, including whitespace and time.
  if (previous.length === 1 && canonicalJson(previous[0].record) === encoded) return content;
  if (previous.length === 1 && previous[0].record.section === section) return bounded(lines.map(line =>
    decodeBacklogMarker(line)?.record?.run_id === runId ? prefix + Buffer.from(encoded).toString('base64') + ' -->' : line).join('\n'));
  const filtered = lines.filter(line => decodeBacklogMarker(line)?.record?.run_id !== runId);
  const target = firstSection(filtered, section), table = tableLineIndexes(filtered, target);
  const afterTable = table.at(-1) + 1;
  filtered.splice(afterTable, 0, '', prefix + Buffer.from(encoded).toString('base64') + ' -->');
  return bounded(filtered.join('\n'));
}
