import { validDecisionMaterial, decisionMaterialVersion } from './decision-material-contract.js';
import { TextDecoder } from 'node:util';
import { canonicalJson, digest, COOPERATIVE_ASSURANCE, DIGEST_PATTERN, exactObject } from './approval-command-contract.js';
import { REVISION_ID_PATTERN, RUN_ID_PATTERN, APPROVAL_GATES } from './run-identity.js';
import { isSafeControlRelativePath } from './contained-file.js';

const fields = ['schema_version', 'kind', 'operation_id', 'request_digest', 'target_id', 'run_id', 'expected_revision_id', 'created_at', 'producer', 'assurance', 'effect'];
export const RUN_OPERATION_KINDS = Object.freeze(['step.record', 'presentation_decision.record', 'prd_revision.reopen', 'closeout.record', 'lifecycle_close.record']);
export const ENDED_LIFECYCLES = Object.freeze(['superseded', 'abandoned']);
const uuid = value => typeof value === 'string' && REVISION_ID_PATTERN.test(value);
const hash = value => typeof value === 'string' && DIGEST_PATTERN.test(value);
const text = (value, max = 8192) => typeof value === 'string' && value.length <= max && !/\0/u.test(value);
const source = (value, runId) => exactObject(value, ['path', 'digest']) && isSafeControlRelativePath(value.path)
  && value.path.startsWith(`.agdf/control/artefacts/${runId}/`) && hash(value.digest);
// One trimmed table-safe line; closure texts reach the Evidence table and the backlog row.
export const closureLine = (value, max) => text(value, max) && value.trim() === value && Boolean(value) && !/[|\u0000-\u001f\u007f]/u.test(value);
const validSuccessor = (value, runId) => exactObject(value, ['kind', 'value', 'verified']) && (value.kind === 'run'
  ? value.verified === true && RUN_ID_PATTERN.test(value.value) && value.value !== runId : value.kind === 'reference' && value.verified === false && closureLine(value.value, 512));
// The confirming person is a cooperative local Git statement, never proof of a human identity.
const validConfirmer = value => exactObject(value, ['statement']) ? value.statement === 'unknown'
  : exactObject(value, ['name', 'email', 'statement']) && value.statement === 'cooperative' && (value.name !== null || value.email !== null)
    && [value.name, value.email].every(item => item === null || closureLine(item, 256));
function validRecord(receipt) {
  const r = receipt.effect.record;
  if (receipt.kind === 'step.record') return exactObject(r, ['step', 'source', 'status', 'covers', 'source_set_digest'])
    && ['ur', 'route', 'review', 'evidence', 'Brownfield Review', 'UX Intent Definition', 'Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR'].includes(r.step)
    && source(r.source, receipt.run_id) && ['done', 'revise', 'block', 'not_applicable'].includes(r.status)
    && text(r.covers, 1024) && hash(r.source_set_digest);
  if (receipt.kind === 'presentation_decision.record') return exactObject(r, ['gate', 'presentation_id', 'presentation_digest', 'material_version', 'material_sources', 'action', 'comment', 'owner', 'artefact_digest'])
    && APPROVAL_GATES.includes(r.gate) && uuid(r.presentation_id) && hash(r.presentation_digest) && hash(r.material_version)
    && validDecisionMaterial(r.material_sources, receipt.run_id) && r.material_version === decisionMaterialVersion(receipt.run_id, r.gate, r.material_sources) && ['request_change', 'reject'].includes(r.action) && text(r.comment) && Buffer.byteLength(r.comment) <= 8192 && (r.action !== 'request_change' || r.comment.trim())
    && text(r.owner, 128) && r.owner.trim() && (r.gate === 'UAT' ? r.artefact_digest === null : hash(r.artefact_digest));
  if (receipt.kind === 'closeout.record') return exactObject(r, ['or', 'lifecycle', 'context_evidence_digest', 'confirmation_digest'])
    && source(r.or, receipt.run_id) && r.or.path === `.agdf/control/artefacts/${receipt.run_id}/OR.md`
    && r.lifecycle === 'completed' && hash(r.context_evidence_digest) && hash(r.confirmation_digest);
  if (receipt.kind === 'lifecycle_close.record') return exactObject(r, ['lifecycle', 'reason', 'successor', 'confirmed_by', 'preview'])
    && ENDED_LIFECYCLES.includes(r.lifecycle) && closureLine(r.reason, 1024)
    && (r.lifecycle === 'abandoned' ? r.successor === null : validSuccessor(r.successor, receipt.run_id)) && validConfirmer(r.confirmed_by)
    && exactObject(r.preview, ['id', 'digest']) && /^[0-9a-f]{8}$/u.test(r.preview.id) && hash(r.preview.digest);
  if (receipt.kind === 'prd_revision.reopen') return exactObject(r, ['prd', 'archive', 'confirmation_digest']) && source(r.prd, receipt.run_id)
    && r.prd.path === `.agdf/control/artefacts/${receipt.run_id}/PRD.md`
    && exactObject(r.archive, ['path', 'digest']) && r.archive.path === `.agdf/control/runs/${receipt.run_id}/revisions/${receipt.operation_id}/manifest.json`
    && hash(r.archive.digest) && hash(r.confirmation_digest)
    && r.confirmation_digest === digest(earlyPrdConfirmation(receipt.run_id, receipt.expected_revision_id, receipt.operation_id, r.prd.digest));
  return false;
}
export const earlyPrdConfirmation = (runId, revisionId, operationId, prdDigest) => `Reopen PRD: ${runId} ${revisionId} ${operationId} ${prdDigest}`;
export function validRunOperation(receipt) {
  return exactObject(receipt, fields) && receipt.schema_version === '1' && RUN_OPERATION_KINDS.includes(receipt.kind)
    && uuid(receipt.operation_id) && hash(receipt.request_digest) && hash(receipt.target_id) && RUN_ID_PATTERN.test(receipt.run_id ?? '')
    && uuid(receipt.expected_revision_id) && exactObject(receipt.effect, ['previous_revision_id', 'resulting_revision_id', 'revision', 'record'])
    && receipt.effect.previous_revision_id === receipt.expected_revision_id && uuid(receipt.effect.resulting_revision_id)
    && receipt.effect.resulting_revision_id !== receipt.expected_revision_id && Number.isSafeInteger(receipt.effect.revision) && receipt.effect.revision >= 2
    && exactObject(receipt.producer, ['contract', 'package_version']) && receipt.producer.contract === 'run-command/1' && text(receipt.producer.package_version, 128) && receipt.producer.package_version
    && canonicalJson(receipt.assurance) === canonicalJson(COOPERATIVE_ASSURANCE)
    && typeof receipt.created_at === 'string' && /^\d{4}-\d{2}-\d{2}T.*Z$/u.test(receipt.created_at) && Number.isFinite(Date.parse(receipt.created_at)) && Boolean(validRecord(receipt));
}
export function readRunOperations(content) {
  const lines = String(content).replace(/\r\n?/gu, '\n').split('\n');
  const starts = lines.flatMap((line, i) => /^## Run Operations\s*$/u.test(line) ? [i] : []);
  if (!starts.length) return { present: false, valid: true, receipts: [] };
  const invalid = () => ({ present: true, valid: false, receipts: [], reason: 'run_operations_invalid' });
  if (starts.length !== 1) return invalid();
  const start = starts[0]; let end = start + 1;
  while (end < lines.length && !/^#{1,2} /u.test(lines[end])) end++;
  const body = lines.slice(start + 1, end).map(line => line.trim()).filter(Boolean);
  if (body[0] !== '- schema_version: 1' || body[1] !== '| operation_id | request_digest | receipt |' || !/^\|[-:|\s]+\|$/u.test(body[2] ?? '')) return invalid();
  const receipts = [], ids = new Set(), revisions = new Set(); let revision = 1;
  for (const line of body.slice(3)) {
    const cells = line.match(/^\| ([^|]+) \| ([^|]+) \| ([A-Za-z0-9_-]+) \|$/u);
    if (!cells || cells[3].length > 131072) return invalid();
    try {
      const bytes = Buffer.from(cells[3], 'base64url'), json = new TextDecoder('utf-8', { fatal: true }).decode(bytes), r = JSON.parse(json);
      if (bytes.toString('base64url') !== cells[3] || canonicalJson(r) !== json || !validRunOperation(r)
        || r.operation_id !== cells[1] || r.request_digest !== cells[2] || ids.has(r.operation_id) || revisions.has(r.effect.resulting_revision_id) || r.effect.revision <= revision) return invalid();
      receipts.push(r); ids.add(r.operation_id); revisions.add(r.effect.resulting_revision_id); revision = r.effect.revision;
    } catch { return invalid(); }
  }
  return receipts.length ? { present: true, valid: true, receipts, start, end } : invalid();
}
export function appendRunOperation(content, receipt) {
  const before = readRunOperations(content); if (!before.valid || !validRunOperation(receipt)) throw Error('AGDF_RUN_OPERATIONS_INVALID');
  const block = ['## Run Operations', '', '- schema_version: 1', '', '| operation_id | request_digest | receipt |', '|---|---|---|',
    ...[...before.receipts, receipt].map(r => `| ${r.operation_id} | ${r.request_digest} | ${Buffer.from(canonicalJson(r)).toString('base64url')} |`), ''];
  const lines = String(content).split('\n');
  const result = before.present ? [...lines.slice(0, before.start), ...block, ...lines.slice(before.end)].join('\n') : `${String(content).trimEnd()}\n\n${block.join('\n')}`;
  if (!readRunOperations(result).valid) throw Error('AGDF_RUN_OPERATIONS_INVALID'); return result;
}
export function assertRunOperationsChange(current, candidate, appended) {
  const before = readRunOperations(current), after = readRunOperations(candidate);
  if (!before.valid || !after.valid || after.present !== (before.present || Boolean(appended))
    || canonicalJson(after.receipts) !== canonicalJson(appended ? [...before.receipts, appended] : before.receipts)) throw Error('AGDF_RUN_OPERATIONS_CHANGED');
}

// Lifecycle and closure facts of an ended Run. The sealed receipt is the record; a missing or
// unreadable receipt still leaves the Run ended and is reported as unavailable.
const lifecycleOf = content => String(content).match(/^- lifecycle:[ \t]*(\S+)[ \t]*\r?$/mu)?.[1] ?? null;
export function runClosure(content) {
  const lifecycle = lifecycleOf(content);
  if (!ENDED_LIFECYCLES.includes(lifecycle)) return null;
  const operations = readRunOperations(content), receipt = operations.valid ? operations.receipts.filter(row => row.kind === 'lifecycle_close.record').at(-1) : undefined;
  const r = receipt?.effect.record;
  return { outcome: lifecycle, closed_at: receipt?.created_at ?? null, reason: r?.reason ?? null, successor: r?.successor ?? null,
    confirmed_by: r?.confirmed_by ?? null, operation_id: receipt?.operation_id ?? null, preview: r?.preview ?? null, receipt: receipt ? 'recorded' : 'unavailable' };
}
export const RUN_ENDED_NEXT_ACTION = 'Start a new run; it may reference the ended run.';
export const closureSuccessorText = successor => successor ? ` by ${successor.value}${successor.verified ? '' : ' (unverified reference)'}` : '';
// The archived backlog outcome of an ended Run: successor and reason, or the reason alone.
export const closureOutcomeText = (outcome, successor, reason) => outcome === 'superseded'
  ? `Superseded${closureSuccessorText(successor)}: ${reason ?? 'reason unavailable'}` : `Abandoned: ${reason ?? 'reason unavailable'}`;
export const closureBacklogRecord = runId => `[RUN_STATE](runs/${runId}/RUN_STATE.md)`;
export function endedRunMessage(runId, closure) {
  const successor = closure.successor ? ` by ${closure.successor.value}${closure.successor.verified ? '' : ' (unverified reference)'}` : '';
  return `Run ${runId} was closed as ${closure.outcome}${successor}${closure.closed_at ? ` on ${closure.closed_at.slice(0, 10)}` : ''}; it accepts no further delivery operation. ${RUN_ENDED_NEXT_ACTION}`;
}
export function assertRunNotEnded(content) {
  const closure = runClosure(content);
  if (closure) throw Object.assign(Error('AGDF_RUN_LIFECYCLE_ENDED'), { closure });
}
