import { ARTEFACT_BINDING_VERSION } from './artefact-bindings.js';
import { exactApprovedArtefacts, validateBindingProof } from './artefact-binding-proof.js';
import { runDocumentPath } from './run-identity.js';
import { bindInputResolution } from './input-resolution.js';
import { randomUUID } from "node:crypto";
import { canonicalJson, digest, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { appendArtefactBinding, artefactBindingKey, readArtefactBindings, validArtefactBinding } from "./artefact-bindings.js";
import { artefactFileDigest, computeRunSeals, runSealState, canonicalRunText } from "./run-seal.js";
import { prepareOwnedOutput } from './run-owned-outputs.js';
import { relationshipForGate, sameRelationship } from "../control-evaluation/delivery-relationships.js";
import { readSourceRevisions } from "./run-source-revisions.js";
import { readReportDecision } from '../control-evaluation/report-decision.js';

// Read the same binding history that the writer enforces; never infer editing intent.
export function inspectArtefactRecordingMode(state, gate) {
  const bindings = readArtefactBindings(state.content);
  if (!bindings.valid || state.approvals.get(gate)?.status === 'approved')
    return { available: false, mode: 'blocked', reason: 'recording_binding_invalid_or_approved' };
  const prior = bindings.latest.filter(b => b.relationship.from === (relationshipForGate(gate)?.from ?? gate));
  if (prior.length > 1) return { available: false, mode: 'blocked', reason: 'recording_binding_ambiguous' };
  const active = prior.length && bindings.active.some(b => b.binding_id === prior[0].binding_id);
  return { available: true, mode: !prior.length ? 'initial' : active ? 'replace_unapproved' : 'renew_invalidated_binding',
    update_draft: prior.length > 0, supersedes: prior[0]?.binding_id ?? null,
    instruction: prior.length ? 'Explicit reviewed renewal/replacement requires update_draft true and current exact approved sources. Previous approvals remain historical.'
      : 'Initial reviewed recording uses update_draft false; this observation grants no editing intent.' };
}

// The command supplies reviewed material; its canonical binding contains the
// attestation. No request/proof JSON is published beside the actual document.
export function prepareArtefactRecording(root, run, input, control, before) {
  const fail = reason => { throw Error(reason); };
  const expected = relationshipForGate(input.gate);
  const qaRecording = input.gate === 'QA' && before.current_gate === 'QA'
    && (before.status === 'open' || before.status === 'blocked' && control.artefacts.get('QA')?.status === 'block');
  if (!expected || input.gate === 'UR' || before.current_gate !== input.gate || before.status !== 'open' && !qaRecording
    || control.approvals.get(input.gate)?.status === 'approved') fail('AGDF_ARTEFACT_RECORDING_GATE_INVALID');
  if (readSourceRevisions(run.content).present && !qaRecording && before.missing_approval !== `Approval: ${input.gate}`
    && before.next_operation?.type !== 'revise_gate_material') fail('AGDF_ARTEFACT_RECORDING_GATE_INVALID');
  if (!input.stagedMaterial || input.reviewed !== true || !input.reviewer?.trim() || !input.operationId || !input.requestDigest)
    fail('AGDF_ARTEFACT_RECORDING_INPUT_INVALID');
  const bindings = readArtefactBindings(run.content);
  if (!bindings.valid) fail('AGDF_ARTEFACT_BINDINGS_INVALID');
  const source = control.artefacts.get(expected.to);
  const relationship = { from: expected.from, relationship: expected.relationship, to: expected.to };
  const prior = bindings.latest.filter(item => canonicalJson(item.relationship) === canonicalJson(relationship));
  if (prior.length > 1 || prior.length && !input.updateDraft) fail('AGDF_ARTEFACT_RECORDING_INPUT_INVALID');
  const destination = { type: expected.from, path: runDocumentPath(input.runId, `${expected.from}.md`),
    digest: input.stagedMaterial.digest, status: input.gate === 'QA' ? readReportDecision(input.stagedMaterial.content) : 'draft' };
  const candidate = bindInputResolution({ schema_version: ARTEFACT_BINDING_VERSION, binding_id: randomUUID(),
    target_id: resolveControlCommandTarget(root).target_id, run_id: input.runId, relationship, destination,
    source: { type: expected.to, path: source?.path, digest: artefactFileDigest(root, source?.path) },
    review: { reviewer: input.reviewer, reviewed: true }, origin: 'reviewed_mapping',
    operation: { id: input.operationId, previous_revision_id: input.revisionId, resulting_revision_id: randomUUID(),
      revision: Number(run.meta.revision) + 1, request_digest: input.requestDigest }, supersedes: prior[0]?.binding_id ?? null });
  const stagedDigest = path => path === destination.path ? destination.digest : artefactFileDigest(root, path);
  if (!validArtefactBinding(candidate) || !source || source.status !== 'approved'
    || control.approvals.get(expected.to)?.status !== 'approved' || !validateBindingProof(root, candidate, { fileDigest: stagedDigest })
    || !exactApprovedArtefacts(root, control)) fail('AGDF_ARTEFACT_BINDING_PROOF_INVALID');
  const old = control.artefacts.get(input.gate), seal = runSealState(root, run.content);
  if (old?.path && old.path !== destination.path) fail('AGDF_ARTEFACT_RECORDING_INPUT_INVALID');
  if (seal.status !== 'valid') fail('AGDF_RUN_SEAL_INVALID');
  const output = prepareOwnedOutput(root, input.runId, destination.path, input.stagedMaterial.content);
  return { text: appendArtefactBinding(run.content, candidate), receipt: candidate, nextRevisionId: candidate.operation.resulting_revision_id,
    outputs: [output], allowContentChange: false,
    validateBeforeWrite: () => {
      input.stagedMaterial.validate?.();
      if (!validateBindingProof(root, candidate) || !exactApprovedArtefacts(root, control)) fail('AGDF_ARTEFACT_BINDING_PROOF_INVALID');
    } };
}
