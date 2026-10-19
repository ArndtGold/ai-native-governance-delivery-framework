import { readRuntimeContract } from '../resources/contracts.js';
import { cleanStatusCell } from './shared.js';
import { extractField } from './verified-change.js';
// Consume the sole normative route table rather than introduce a second type-to-route map.
export function declaredRoutes() {
  const contract = readRuntimeContract('quality');
  if (!contract.ok) return new Map();
  const text = contract.content;
  const body = text.split('## Normalized Review Gaps')[1]?.split(/^## /mu)[0] ?? '';
  const routes = new Map();
  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*`([a-z_]+)`\s*\|[^|]*\|(.+)\|\s*$/u);
    if (!row) continue;
    const targets = [...row[2].matchAll(/`([^`]+)`/gu)].flatMap(m => m[1].split('|').map(v => v.trim()));
    routes.set(row[1], targets);
  }
  return routes;
}

export const NORMALIZED_GAP_COLUMNS = Object.freeze(['finding_id', 'gap_type', 'routing_target', 'gap_status', 'evidence', 'required_next_step']);
const PLACEHOLDER = /^(?:none|tbd|todo|<)/iu;

// Field-level form of the contract rules, each with a stable rule id; an empty list is a valid row.
export function normalizedGapProblems(row, routes = declaredRoutes()) {
  if (row.length !== NORMALIZED_GAP_COLUMNS.length) return [{ field: 'row', expected: `the columns ${NORMALIZED_GAP_COLUMNS.join(' | ')}`, rule: 'row_cells' }];
  const [id, gap, target, status, evidence, action] = row, problems = [];
  const add = (field, expected, rule = field) => problems.push({ field, expected, rule });
  if (routes.size !== 6) add('gap_type', 'the Normalized Review Gaps contract to be readable', 'contract');
  if (!id || id.length > 128) add('finding_id', 'a stable id of at most 128 characters');
  if (!routes.has(gap)) add('gap_type', `one of ${[...routes.keys()].join(', ')}`);
  else if (!routes.get(gap).includes(target)) add('routing_target', `one of ${routes.get(gap).join(', ')} for ${gap}`);
  if (!['open', 'resolved'].includes(status)) add('gap_status', 'open or resolved');
  if (!evidence || evidence.length > 4096 || PLACEHOLDER.test(evidence)) add('evidence', 'concrete source, test, observation or missing proof, not none, tbd, todo or a placeholder');
  if (!action || action.length > 2048 || PLACEHOLDER.test(action)) add('required_next_step', 'exactly one executable action, not none, tbd, todo or a placeholder, also for a resolved finding');
  if (gap === 'requirements_gap' && target === 'UR' && !/changed (?:user )?(?:intent|scope)/iu.test(evidence)) add('evidence', 'evidence of changed user intent or scope for a requirements_gap routed to UR', 'requirements_gap_ur');
  if (gap === 'emergent_risk' && !/earliest[- ]owner assessment/iu.test(evidence)) add('evidence', 'an explicit earliest-owner assessment for an emergent_risk', 'emergent_risk_assessment');
  return problems;
}

export function validNormalizedGap(row, routes = declaredRoutes()) {
  return normalizedGapProblems(row, routes).length === 0;
}

// Table entries in document order; the scan stops at the first malformed header or row, so
// consumers that stop at the first problem keep their order of findings.
export function readNormalizedFindings(content) {
  const entries = [];
  let active = false, header = false;
  for (const line of String(content ?? '').split('\n')) {
    if (!line.trim().startsWith('|')) { active = false; continue; }
    if (/^\|(?:\s*:?-+:?\s*\|)+\s*$/u.test(line.trim())) continue;
    const row = line.trim().replace(/^\||\|$/gu, '').split('|').map(cleanStatusCell);
    if (row.includes('finding_id') || row.filter(cell => NORMALIZED_GAP_COLUMNS.includes(cell)).length > 1) {
      if (row.join('|') !== NORMALIZED_GAP_COLUMNS.join('|')) { entries.push({ kind: 'malformed_header', row }); break; }
      active = true; header = true; continue;
    }
    if (!active) continue;
    if (row.length !== NORMALIZED_GAP_COLUMNS.length) { entries.push({ kind: 'malformed_row', row }); break; }
    entries.push({ kind: 'row', row });
  }
  return { header, entries };
}

// Per-source rules that closeout and the QA follow-up apply (inspectQaReports), as a full list
// of diagnostics so a writer can refuse a review or QA report before anything depends on it.
export function reviewFindingDiagnostics(review, content, { decision, routes = declaredRoutes() } = {}) {
  const diagnostics = [], ids = new Set();
  const add = (finding_id, field, expected, rule) => diagnostics.push({ review, finding_id, field, expected, rule });
  const scan = readNormalizedFindings(content);
  for (const entry of scan.entries) {
    if (entry.kind === 'malformed_header') add(null, 'table', `the header | ${NORMALIZED_GAP_COLUMNS.join(' | ')} |`, 'table_header');
    else if (entry.kind === 'malformed_row') add(entry.row[0] || null, 'row', `${NORMALIZED_GAP_COLUMNS.length} cells per finding row`, 'row_cells');
    else {
      const id = entry.row[0];
      if (ids.has(id)) add(id, 'finding_id', 'a finding id used only once', 'duplicate_id');
      ids.add(id);
      for (const problem of normalizedGapProblems(entry.row, routes)) add(id || null, problem.field, problem.expected, problem.rule);
    }
  }
  const stated = ['revise', 'block'].includes(decision) || review === 'QA' && decision && decision !== 'pass' ? decision : extractField(content, 'decision');
  if ((!scan.header || !ids.size) && ['revise', 'block'].includes(stated)) {
    add(null, 'table', `a normalized findings table with at least one finding for a ${stated} decision`, 'findings_missing');
  }
  return diagnostics;
}

// The content with the required_next_step cell of the named findings blanked: exactly the cell
// a correction at OR may change (run-operation-proof.js). Invisible trailing whitespace of lines
// and of the file is not content.
export function maskFindingCells(content, ids) {
  let active = false;
  return String(content ?? '').replace(/\r\n?/gu, '\n').trimEnd().split('\n').map(rawLine => {
    const line = rawLine.trimEnd();
    if (!line.trim().startsWith('|')) { active = false; return line; }
    if (/^\|(?:\s*:?-+:?\s*\|)+\s*$/u.test(line.trim())) return line;
    const row = line.trim().replace(/^\||\|$/gu, '').split('|').map(cleanStatusCell);
    if (row.includes('finding_id') || row.filter(cell => NORMALIZED_GAP_COLUMNS.includes(cell)).length > 1) {
      active = row.join('|') === NORMALIZED_GAP_COLUMNS.join('|');
      return line;
    }
    return active && row.length === NORMALIZED_GAP_COLUMNS.length && ids.has(row[0]) ? `| ${row.slice(0, 5).join(' | ')} | * |` : line;
  }).join('\n');
}
