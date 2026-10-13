import { createHash } from 'node:crypto';
import { canonicalJson, digest, exactObject, DIGEST_PATTERN, COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN } from './run-identity.js';
import { isSafeControlRelativePath } from './contained-file.js';

export const EVIDENCE_PREREQUISITES = Object.freeze({
  ur: [], route: ['UR'], 'Brownfield Review': ['UR'], 'UX Intent Definition': ['UR', 'Brownfield Review'],
  'Brownfield Analysis': ['UR', 'PRD', 'SD', 'TP', 'Brownfield Review', 'UX Intent Definition'],
  'CD+Tests': ['UR', 'PRD', 'SD', 'TP', 'Brownfield Analysis'],
  'TP Review': ['UR', 'PRD', 'SD', 'TP', 'CD+Tests'], 'Clean Implementation Review': ['UR', 'PRD', 'SD', 'TP', 'CD+Tests'],
  CR: ['UR', 'PRD', 'SD', 'TP', 'CD+Tests'], review: ['UR', 'PRD', 'SD', 'TP', 'CD+Tests'], evidence: ['UR', 'PRD', 'SD', 'TP'],
  QA: ['UR', 'PRD', 'SD', 'TP', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR'], UAT: ['QA'],
});
export const evidenceSourceSetDigest = sources => digest(`agdf-operation-sources/1\0${canonicalJson(sources)}`);
export const canonicalEvidenceDigest = text => 'sha256:' + createHash('sha256').update(String(text).replace(/\r\n?/gu, '\n').replace(/^\uFEFF/u, '')).digest('hex');
const hash = value => typeof value === 'string' && DIGEST_PATTERN.test(value);
const ownPath = (value, runId) => isSafeControlRelativePath(value) && value.startsWith(`.agdf/control/artefacts/${runId}/`);
export function validEvidenceBinding(row) {
  return exactObject(row, ['schema_version', 'run_id', 'operation_id', 'action', 'step', 'report', 'sources', 'source_set_digest', 'producer', 'assurance'])
    && row.schema_version === '1' && RUN_ID_PATTERN.test(row.run_id ?? '') && REVISION_ID_PATTERN.test(row.operation_id ?? '')
    && ['step.record', 'artefact.record'].includes(row.action) && Object.hasOwn(EVIDENCE_PREREQUISITES, row.step)
    && exactObject(row.report, ['path', 'digest']) && ownPath(row.report.path, row.run_id) && hash(row.report.digest)
    && Array.isArray(row.sources) && row.sources.length === EVIDENCE_PREREQUISITES[row.step].length
    && row.sources.every((s, i) => exactObject(s, ['type', 'path', 'digest', 'status']) && s.type === EVIDENCE_PREREQUISITES[row.step][i]
      && (s.path === '' && s.digest === null || ownPath(s.path, row.run_id) && (hash(s.digest) || s.digest === null))
      && typeof s.status === 'string' && s.status.length <= 128)
    && hash(row.source_set_digest) && row.source_set_digest === evidenceSourceSetDigest(row.sources)
    && exactObject(row.producer, ['contract', 'package_version']) && row.producer.contract === 'run-command/1'
    && typeof row.producer.package_version === 'string' && row.producer.package_version.length > 0 && row.producer.package_version.length <= 128
    && canonicalJson(row.assurance) === canonicalJson(COOPERATIVE_ASSURANCE);
}
export function readEvidenceBindings(content) {
  const lines = String(content).replace(/\r\n?/gu, '\n').split('\n');
  const starts = lines.flatMap((line, i) => /^## Evidence Bindings\s*$/u.test(line) ? [i] : []);
  const invalid = () => ({ present: true, valid: false, bindings: [] });
  if (!starts.length) return { present: false, valid: true, bindings: [] };
  if (starts.length !== 1) return invalid();
  const start = starts[0]; let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end++;
  const body = lines.slice(start + 1, end).map(line => line.trim()).filter(Boolean);
  if (body[0] !== '- schema_version: 1' || body[1] !== '| operation_id | binding |' || !/^\|[-:|\s]+\|$/u.test(body[2] ?? '')) return invalid();
  const bindings = [], ids = new Set();
  for (const line of body.slice(3)) {
    const cells = line.match(/^\| ([^|]+) \| ([A-Za-z0-9_-]+) \|$/u);
    if (!cells || cells[2].length > 32768) return invalid();
    try {
      const bytes = Buffer.from(cells[2], 'base64url'), json = new TextDecoder('utf-8', { fatal: true }).decode(bytes), row = JSON.parse(json);
      if (bytes.toString('base64url') !== cells[2] || canonicalJson(row) !== json || !validEvidenceBinding(row) || row.operation_id !== cells[1] || ids.has(row.operation_id)) return invalid();
      bindings.push(row); ids.add(row.operation_id);
    } catch { return invalid(); }
  }
  return bindings.length ? { present: true, valid: true, bindings, start, end } : invalid();
}
export function appendEvidenceBinding(content, binding) {
  const before = readEvidenceBindings(content);
  if (!before.valid || !validEvidenceBinding(binding) || before.bindings.some(row => row.operation_id === binding.operation_id)) throw Error('AGDF_EVIDENCE_BINDINGS_INVALID');
  const block = ['## Evidence Bindings', '', '- schema_version: 1', '', '| operation_id | binding |', '|---|---|',
    ...[...before.bindings, binding].map(row => `| ${row.operation_id} | ${Buffer.from(canonicalJson(row)).toString('base64url')} |`), ''];
  const lines = String(content).split('\n');
  return before.present ? [...lines.slice(0, before.start), ...block, ...lines.slice(before.end)].join('\n') : `${String(content).trimEnd()}\n\n${block.join('\n')}`;
}
export function assertEvidenceBindingsChange(current, candidate, appended) {
  const before = readEvidenceBindings(current), after = readEvidenceBindings(candidate);
  if (!before.valid || !after.valid || after.present !== (before.present || Boolean(appended))
    || canonicalJson(after.bindings) !== canonicalJson(appended ? [...before.bindings, appended] : before.bindings)) throw Error('AGDF_EVIDENCE_BINDINGS_CHANGED');
}

// The read callback is selected by the common Run-state owner (live, immutable archive,
// or a transaction overlay). Presence and free claims never establish applicability.
export function evidenceApplicability(state, readArtefact) {
  const parsed = readEvidenceBindings(state.content), groups = { current: [], superseded: [], applicability_unknown: [] }, byStep = new Map();
  const latest = new Map(parsed.bindings.map(row => [row.step, row.operation_id]));
  if (parsed.valid) for (const row of parsed.bindings) {
    let reason = 'current_exact_association', group = 'current';
    try {
      const current = state.artefacts.get(row.step), bytes = readArtefact(row.report.path);
      if (typeof bytes !== 'string' || canonicalEvidenceDigest(bytes) !== row.report.digest) { group = 'applicability_unknown'; reason = 'recorded_report_unavailable_or_changed'; }
      else if (current && (current.path !== row.report.path || !['done', 'approved', 'not_applicable', 'pass', 'revise', 'block'].includes(current.status))) { group = 'superseded'; reason = 'report_registration_superseded'; }
      else for (const source of row.sources) {
        const now = state.artefacts.get(source.type), text = source.path ? readArtefact(source.path) : undefined;
        // An explicit empty dependency is retained as empty, never presented as a report.
        if (!source.path && !now?.path && source.status === (now?.status ?? 'missing')) continue;
        if (source.digest === null || typeof text !== 'string') { group = 'applicability_unknown'; reason = 'source_association_unavailable'; break; }
        if (now?.path !== source.path || now?.status !== source.status || canonicalEvidenceDigest(text) !== source.digest) { group = 'superseded'; reason = 'source_version_superseded'; break; }
      }
    } catch { group = 'applicability_unknown'; reason = 'source_observation_unavailable'; }
    const available = group !== 'applicability_unknown';
    if (latest.get(row.step) !== row.operation_id) { group = 'superseded'; reason = 'writer_owned_result_superseded'; }
    const item = { ...row, applicability: group, reason, available };
    groups[group].push(item); byStep.set(row.step, item);
  }
  for (const row of state.evidence_refs ?? []) {
    const source = String(row.source ?? '').replace(/^`|`$/gu, '');
    if (!parsed.bindings.some(binding => binding.report.path === source)) groups.applicability_unknown.push({ ...row, applicability: 'applicability_unknown', reason: 'no_writer_owned_association', available: null });
  }
  return { valid: parsed.valid, ...groups, by_step: byStep };
}
