import { bindInputResolution } from './input-resolution.js';
import { readFileSync, statSync } from 'node:fs';
import { canonicalJson, digest, DIGEST_PATTERN, exactObject, COOPERATIVE_ASSURANCE, resolveControlCommandTarget } from './approval-command-contract.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { artefactFileDigest, canonicalRunText } from './run-seal-compute.js';
import { INTERNAL_STEP_FILES } from './run-owned-outputs.js';
import { EVIDENCE_PREREQUISITES, evidenceSourceSetDigest } from './evidence-bindings.js';
import { evaluateQaFollowUp } from '../control-evaluation/qa-follow-up.js';
import { STRUCTURED_REQUIRED_REVIEWS, CORRECTABLE_REVIEWS } from './evidence-bindings.js';
import { maskFindingCells, readNormalizedFindings, reviewFindingDiagnostics } from '../control-evaluation/normalized-gaps.js';
import { readReportDecision } from '../control-evaluation/report-decision.js';
import { approvalMaterialTypes, reviewRecordingChain } from './presentation-decision.js';

export function readOperationSource(root, runId, source) {
  if (!exactObject(source, ['path', 'digest']) || !DIGEST_PATTERN.test(source.digest ?? '')
    || typeof source.path !== 'string' || !source.path.startsWith(`.agdf/control/artefacts/${runId}/`)
    || source.path.endsWith('/RUN_STATE.md') || hasSymlinkComponent(root, source.path)) throw Error('AGDF_RUN_OPERATION_SOURCE_INVALID');
  const file = containedRegularFile(root, source.path);
  if (file.status !== 'valid' || statSync(file.path).size > 131072) throw Error('AGDF_RUN_OPERATION_SOURCE_INVALID');
  const bytes = readFileSync(file.path);
  if (bytes.length > 131072) throw Error('AGDF_RUN_OPERATION_SOURCE_INVALID');
  const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (artefactFileDigest(root, source.path) !== source.digest || !canonicalRunText(content).trim()) throw Error('AGDF_RUN_OPERATION_SOURCE_INVALID');
  return { content, validate: () => { if (hasSymlinkComponent(root, source.path) || containedRegularFile(root, source.path).status !== 'valid' || artefactFileDigest(root, source.path) !== source.digest) throw Error('AGDF_RUN_OPERATION_SOURCE_CHANGED'); } };
}
export function operationSources(root, state, step) {
  const types = EVIDENCE_PREREQUISITES[step]; if (!types) throw Error('AGDF_RUN_OPERATION_STEP_INVALID');
  return types.map(type => {
    const row = state.artefacts.get(type);
    const value = row?.path ? artefactFileDigest(root, row.path) : null;
    return { type, path: row?.path ?? '', digest: DIGEST_PATTERN.test(value ?? '') ? value : null, status: row?.status ?? 'missing' };
  });
}
export const operationSourceSetDigest = (root, state, step) => evidenceSourceSetDigest(operationSources(root, state, step));
export function operationReceipt(root, run, context, nextRevisionId, record, packageVersion) {
  return bindInputResolution({ schema_version: context.kind === 'ur_draft.replace' || record.mode === 'verified_change' ? '2' : '1', kind: context.kind, operation_id: context.operation_id, request_digest: context.request_digest,
    target_id: resolveControlCommandTarget(root).target_id, run_id: run.meta.run_id, expected_revision_id: run.meta.revision_id,
    created_at: new Date().toISOString(), producer: { contract: 'run-command/1', package_version: packageVersion }, assurance: COOPERATIVE_ASSURANCE,
    effect: { previous_revision_id: run.meta.revision_id, resulting_revision_id: nextRevisionId, revision: Number(run.meta.revision) + 1, record } });
}
// A run approved past QA without a review that closeout requires may record it once, at
// UAT or OR, when the QA approval never saw that review. A recorded review is never
// replaced here, and no other internal step becomes recordable after QA approval.
function lateRequiredReviewEligible(state, before, input) {
  const type = input.internalStep, rows = [state.artefacts.get(type), type === 'Clean Implementation Review' ? state.artefacts.get('Clean Review') : null];
  if (!STRUCTURED_REQUIRED_REVIEWS.includes(type) || state.approvals.get('QA')?.status !== 'approved'
    || state.approvals.get('TP')?.status !== 'approved' || !['UAT', 'OR'].includes(before.current_gate)
    || rows.some(row => row && (row.path || row.status !== 'missing')) || state.artefacts.get('CD+Tests')?.status !== 'done') return false;
  // Only a material receipt proves the approval never saw this review; the same proof lets the
  // QA association stay current afterwards (run-state.js). Legacy or unreadable receipts refuse.
  const material = approvalMaterialTypes(state, 'QA');
  return material.status === 'recorded' && !material.types.has(type);
}

// At OR after Approval: UAT a recorded review may be recorded again only to correct invalid
// normalized finding rows. This is the structural part; run-steps.js applies
// reviewCorrectionRefusal to the recorded and the new content before writing.
function reviewCorrectionCandidate(state, before, input) {
  const type = input.internalStep, row = state.artefacts.get(type);
  if (!CORRECTABLE_REVIEWS.includes(type) || before.current_gate !== 'OR' || !['QA', 'UAT'].every(gate => state.approvals.get(gate)?.status === 'approved')
    || !row?.path || !['done', 'revise', 'block'].includes(row.status)) return false;
  // Only a correction that the approval-material proof recognises afterwards is eligible:
  // the approvals saw a receipt-recorded version at the canonical path with this status.
  const chain = reviewRecordingChain(state, type), canonical = `.agdf/control/artefacts/${state.run_id ?? state.meta?.run_id}/${INTERNAL_STEP_FILES[type]}`;
  return Boolean(chain) && chain.seen.source.path === canonical && String(row.path).replace(/^`|`$/gu, '') === canonical && row.status === chain.seen.status;
}

// Closeout names the OR correction path only where it can be taken (run-steps.js).
export function reviewCorrectionAvailable(state, type, problems = []) {
  return problems.length > 0 && problems.every(problem => problem.rule === 'required_next_step')
    && reviewCorrectionCandidate(state, { current_gate: 'OR' }, { internalStep: type });
}

const findingClasses = content => readNormalizedFindings(content).entries.filter(entry => entry.kind === 'row')
  .map(entry => entry.row.slice(0, 4).join('|')).sort().join('\n');
// The approvals saw the recorded version. Only the stuck-run defect is correctable: an empty,
// placeholder or overlong required_next_step of a readable finding row. A correction changes
// exactly those cells; decision, status, classification, evidence and all other text stay equal.
export function reviewCorrectionRefusal(type, recorded, decision, content) {
  if (typeof recorded?.content !== 'string') return 'recorded_review_unavailable';
  const recordedDecision = readReportDecision(recorded.content);
  const problems = reviewFindingDiagnostics(type, recorded.content, { decision: recordedDecision });
  if (!problems.length) return 'recorded_review_valid';
  if (problems.some(problem => !problem.finding_id || problem.rule !== 'required_next_step')) return 'recorded_review_uncorrectable';
  if (recordedDecision !== decision || (decision === 'pass' ? 'done' : decision) !== recorded.status) return 'decision_changed';
  if (findingClasses(recorded.content) !== findingClasses(content)) return 'classification_changed';
  const ids = new Set(problems.map(problem => problem.finding_id));
  return maskFindingCells(recorded.content, ids) === maskFindingCells(content, ids) ? null : 'content_changed';
}

export function internalStepEligibility(state, before, input, root) {
  if (state.meta?.lifecycle !== 'active' || !['structured_slice', 'structured_delivery'].includes(state.mode_slice_decision.decision)) return false;
  if (lateRequiredReviewEligible(state, before, input) || reviewCorrectionCandidate(state, before, input)) return true;
  if (['QA', 'UAT'].some(gate => state.approvals.get(gate)?.status === 'approved')) return false;
  const type = input.internalStep;
  if (!Object.hasOwn(INTERNAL_STEP_FILES, type) || type === 'Brownfield Review') return false;
  if (type === 'UX Intent Definition') return state.approvals.get('UR')?.status === 'approved'
    && (before.next_operation?.analysis === type || before.current_gate === 'PRD' && state.approvals.get('PRD')?.status !== 'approved');
  if (state.approvals.get('TP')?.status !== 'approved') return false;
  if (type === 'Brownfield Analysis') return before.current_gate === 'Brownfield Analysis';
  if (type === 'CD+Tests') return before.current_gate === 'CD+Tests'
    || before.current_gate === 'QA' && evaluateQaFollowUp(root, state, state.run_id, 64, true).kind === 'implementation';
  return state.artefacts.get('CD+Tests')?.status === 'done' && ['CR', 'QA'].includes(before.current_gate);
}
