import { readFileSync, statSync } from 'node:fs';
import { canonicalJson, digest, DIGEST_PATTERN, exactObject, COOPERATIVE_ASSURANCE, resolveControlCommandTarget } from './approval-command-contract.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { artefactFileDigest, canonicalRunText } from './run-seal-compute.js';
import { INTERNAL_STEP_FILES } from './run-owned-outputs.js';
import { EVIDENCE_PREREQUISITES, evidenceSourceSetDigest } from './evidence-bindings.js';
import { evaluateQaFollowUp } from '../control-evaluation/qa-follow-up.js';

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
  return { schema_version: '1', kind: context.kind, operation_id: context.operation_id, request_digest: context.request_digest,
    target_id: resolveControlCommandTarget(root).target_id, run_id: run.meta.run_id, expected_revision_id: run.meta.revision_id,
    created_at: new Date().toISOString(), producer: { contract: 'run-command/1', package_version: packageVersion }, assurance: COOPERATIVE_ASSURANCE,
    effect: { previous_revision_id: run.meta.revision_id, resulting_revision_id: nextRevisionId, revision: Number(run.meta.revision) + 1, record } };
}
export function internalStepEligibility(state, before, input, root) {
  if (state.meta?.lifecycle !== 'active' || !['structured_slice', 'structured_delivery'].includes(state.mode_slice_decision.decision)
    || ['QA', 'UAT'].some(gate => state.approvals.get(gate)?.status === 'approved')) return false;
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
