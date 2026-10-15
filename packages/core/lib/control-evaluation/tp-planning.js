import { readFileSync } from '../control-read/fs.js';
import { section } from './markdown-table.js';
import { readSdDecisionRows } from './sd-readiness.js';
import { declaredRoutes, validNormalizedGap, NORMALIZED_GAP_COLUMNS } from './normalized-gaps.js';
import { artefactFileDigest } from '../control-state/run-seal.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { readEvidenceBindings } from '../control-state/evidence-bindings.js';

export const TP_PLANNING_FORMAT = Object.freeze({
  contract: 'Planning Decisions contract: tp-decisions-v1',
  columns: ['decision', 'source', 'status', 'resolution', 'owner'],
  clarification_columns: NORMALIZED_GAP_COLUMNS,
  detail_columns: ['finding_id', 'planning_decision', 'question', 'blocking_reason', 'required_answer', 'owner', 'source_ref', 'resolution_evidence'],
});
const filled = value => typeof value === 'string' && !!value.trim() && value.length <= 4096 && !/^(?:<|tbd\b|todo\b|none\b)/iu.test(value);

// New declared format only: containers do not supply machine-readable decisions.
function visibleText(text) {
  let fence = null, html = false;
  return text.replace(/\r\n?/gu, '\n').split('\n').map(line => {
    const mark = line.match(/^ {0,3}(`{3,}|~{3,})/u)?.[1];
    if (mark) { if (!fence) fence = mark; else if (mark[0] === fence[0] && mark.length >= fence.length) fence = null; return ''; }
    if (fence) return '';
    if (/^ {0,3}</u.test(line)) html = true;
    if (html) { if (/^ {0,3}<\//u.test(line) || /-->\s*$/u.test(line)) html = false; return ''; }
    return /^(?: {4}|\t| {0,3}>)/u.test(line) ? '' : line;
  }).join('\n');
}
function table(content, title, columns) {
  const headings = [...content.matchAll(/^#{2,6} (?:\d+\. )?(.+?)\s*$/gmu)].filter(m => m[1] === title);
  if (headings.length !== 1) return null;
  const body = section(content, title), bodyLines = body.split('\n').map(line => line.trim()).filter(Boolean);
  const start = bodyLines.findIndex(line => line.startsWith('|'));
  if (start < 0) return null;
  let end = start;
  while (end < bodyLines.length && bodyLines[end].startsWith('|')) end += 1;
  if (bodyLines.slice(end).some(line => line.startsWith('|'))) return null;
  const lines = bodyLines.slice(start, end);
  if (lines.length < 3 || lines.some(line => !/^\|.*\|$/u.test(line))) return null;
  const cells = line => line.slice(1, -1).split('|').map(c => c.trim());
  if (cells(lines[0]).map(c => c.toLowerCase()).join('|') !== columns.join('|') || !/^\|[\s:|-]+\|$/u.test(lines[1])) return null;
  const rows = lines.slice(2).map(cells);
  if (rows.some(row => row.length !== columns.length)) return null;
  return rows.map(row => Object.fromEntries(columns.map((column, i) => [column, row[i]])));
}
function sourceValid(root, state, reference) {
  const match = reference.match(/^(UR|PRD|SD): (.+) @ (sha256:[0-9a-f]{64})$/u);
  if (!match) return false;
  const [, type, statement, digest] = match, source = state.artefacts.get(type);
  const file = source && containedRegularFile(root, source.path);
  return source?.status === 'approved' && state.approvals.get(type)?.status === 'approved'
    && file?.status === 'valid' && !hasSymlinkComponent(root, source.path)
    && artefactFileDigest(root, source.path) === digest && readFileSync(file.path, 'utf8').includes(statement);
}
function resolutionValid(root, state, id, reference) {
  const match = reference.match(/^(\.agdf\/control\/artefacts\/[^ ]+) @ (sha256:[0-9a-f]{64})$/u);
  if (!match || !match[1].startsWith(`.agdf/control/artefacts/${state.run_id}/`) || hasSymlinkComponent(root, match[1])) return false;
  const file = containedRegularFile(root, match[1]);
  if (file.status !== 'valid' || artefactFileDigest(root, match[1]) !== match[2] || !readFileSync(file.path, 'utf8').includes(id)) return false;
  const evidence = readEvidenceBindings(state.content);
  return evidence.valid && evidence.bindings.some(binding => binding.step === 'evidence'
    && binding.report.path === match[1] && binding.report.digest === match[2]
    && ['UR', 'PRD', 'SD'].every(type => {
      const source = binding.sources.find(s => s.type === type), current = state.artefacts.get(type);
      return source?.status === 'approved' && current?.status === 'approved'
        && source.path === current.path && source.digest === artefactFileDigest(root, current.path);
    }));
}

// Read-only facts. Gate evaluation remains the sole readiness/permission owner.
export function evaluateTpPlanningContent(root, state, sd, original) {
  const open = [], clarifications = [], content = visibleText(original);
  const markers = [...content.matchAll(/^Planning Decisions contract:\s*(.*)$/gmu)];
  const declared = !!markers.length || /^#{2,6} (?:\d+\. )?Planning Decisions\s*$/mu.test(content);
  const done = () => ({ declared, open_items: [...new Set(open)], clarifications });
  if (!declared) return done();
  if (markers.length !== 1 || markers[0][1] !== 'tp-decisions-v1') { open.push('Declare exactly one Planning Decisions contract: tp-decisions-v1'); return done(); }
  const decisions = table(content, 'Planning Decisions', TP_PLANNING_FORMAT.columns);
  if (!decisions?.length) { open.push('Planning Decisions table is missing or malformed'); return done(); }
  const sdFacts = readSdDecisionRows(sd), expected = sdFacts.rows.filter(row => row.timing === 'later_tp').map(row => `SD: ${row.decision}`);
  if (!sdFacts.valid) open.push('Upstream SD decision facts are invalid');
  const names = new Map(), covered = new Set();
  for (const row of decisions) {
    if (!filled(row.decision) || names.has(row.decision) || !filled(row.resolution) || !filled(row.owner)
        || !['open', 'resolved'].includes(row.status) || row.source !== 'TP' && (!expected.includes(row.source) || covered.has(row.source))) open.push(`Invalid planning decision: ${row.decision}`);
    names.set(row.decision, row);
    if (row.source !== 'TP') covered.add(row.source);
    if (row.status === 'open') open.push(`Open planning decision: ${row.decision}`);
  }
  for (const source of expected) if (!covered.has(source)) open.push(`Resolve deferred ${source}`);
  const hasRequests = /^#{2,6} (?:\d+\. )?Clarification Requests\s*$/mu.test(content), hasDetails = /^#{2,6} (?:\d+\. )?Clarification Details\s*$/mu.test(content);
  if (!hasRequests && !hasDetails) return done();
  const findings = table(content, 'Clarification Requests', NORMALIZED_GAP_COLUMNS);
  const details = table(content, 'Clarification Details', TP_PLANNING_FORMAT.detail_columns);
  if (!findings?.length || !details?.length) { open.push('Clarification Requests and Details tables must be complete'); return done(); }
  const routes = declaredRoutes(), ids = new Set();
  for (const row of findings) {
    const id = row.finding_id, values = NORMALIZED_GAP_COLUMNS.map(key => row[key]);
    const matches = details.filter(detail => detail.finding_id === id), detail = matches[0];
    const decision = names.get(detail?.planning_decision);
    const valid = !ids.has(id) && validNormalizedGap(values, routes) && ['UR', 'PRD', 'SD', 'TP', 'evidence_obligation'].includes(row.routing_target)
      && matches.length === 1 && TP_PLANNING_FORMAT.detail_columns.slice(0, -1).every(key => filled(detail[key]))
      && decision && sourceValid(root, state, detail.source_ref);
    ids.add(id);
    if (!valid) { open.push(`Invalid clarification assignment/details/source: ${id}`); continue; }
    if (row.gap_status === 'resolved') {
      if (decision.status !== 'resolved' || !resolutionValid(root, state, id, detail.resolution_evidence)) open.push(`Clarification requires current recorded answer/source evidence: ${id}`);
      continue;
    }
    open.push(`Material clarification ${id}: ${detail.question}`);
    if (decision.status !== 'open') { open.push(`Keep clarification planning decision open: ${id}`); continue; }
    clarifications.push({ finding_id: id, gate: row.routing_target,
      question: detail.question, blocking_reason: detail.blocking_reason, required_answer: detail.required_answer,
      owner: detail.owner, source_ref: detail.source_ref });
  }
  if (details.some(detail => !ids.has(detail.finding_id))) open.push('Clarification detail references unknown finding');
  return done();
}
