import { bindInputResolution } from './input-resolution.js';
import { readOperationSource } from "./run-operation-proof.js";
import { randomUUID } from "node:crypto";
import { canonicalJson, digest, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { appendArtefactBinding, artefactBindingKey, readArtefactBindings, validArtefactBinding } from "./artefact-bindings.js";
import { exactApprovedArtefacts, readContainedJson, validateBindingProof } from "./artefact-binding-proof.js";
import { artefactFileDigest, computeRunSeals, runSealState, canonicalRunText } from "./run-seal.js";
import { prepareOwnedOutput } from './run-owned-outputs.js';
import { appendTableRow, upsertTableRow } from "./run-state-edits.js";
import { relationshipForGate, sameRelationship } from "../control-evaluation/delivery-relationships.js";
import { readFileSync } from "node:fs";
import { containedRegularFile } from "./contained-file.js";
import { readSourceRevisions } from "./run-source-revisions.js";
import { REVIEWED_REQUEST_FIELDS } from './recording-formats.js';
import { readReportDecision } from '../control-evaluation/report-decision.js';

// Read the same binding history that the writer enforces; never infer editing intent.
export function inspectArtefactRecordingMode(state, gate) {
  const bindings = readArtefactBindings(state.content);
  if (!bindings.valid || state.approvals.get(gate)?.status === 'approved')
    return { available: false, mode: 'blocked', reason: 'recording_binding_invalid_or_approved' };
  const prior = bindings.latest.filter(b => b.relationship.from === gate);
  if (prior.length > 1) return { available: false, mode: 'blocked', reason: 'recording_binding_ambiguous' };
  const active = prior.length && bindings.active.some(b => b.binding_id === prior[0].binding_id);
  return { available: true, mode: !prior.length ? 'initial' : active ? 'replace_unapproved' : 'renew_invalidated_binding',
    update_draft: prior.length > 0, supersedes: prior[0]?.binding_id ?? null,
    instruction: prior.length ? 'Explicit reviewed renewal/replacement requires update_draft true and current exact approved sources. Previous approvals remain historical.'
      : 'Initial reviewed recording uses update_draft false; this observation grants no editing intent.' };
}

function stagedRecording(root, run, input, control, relationship) {
  if (!input.stagedMaterial) return null;
  if (input.reviewed !== true || !input.reviewer?.trim() || !input.operationId) throw Error('AGDF_ARTEFACT_BINDING_PROOF_INVALID');
  const base = `.agdf/control/artefacts/${input.runId}/`, sourceRow = control.artefacts.get(relationship.to);
  const destination = { type: relationship.from, path: `${base}${relationship.from}.md`, digest: input.stagedMaterial.digest,
    status: input.gate === 'QA' ? readReportDecision(input.stagedMaterial.content) : 'draft' };
  const source = { type: relationship.to, path: sourceRow?.path, digest: artefactFileDigest(root, sourceRow?.path) };
  const shared = { schema_version: '1', target_id: resolveControlCommandTarget(root).target_id, run_id: input.runId, relationship, destination, source };
  // relationshipForGate also contains registry metadata, never persist it in proof.
  shared.relationship = { from: relationship.from, relationship: relationship.relationship, to: relationship.to };
  const proofPath = `${base}REVIEW-${input.operationId}.json`, requestPath = `${base}RECORD-${input.operationId}.json`;
  const proof = JSON.stringify({ ...shared, reviewer: input.reviewer, reviewed: true }, null, 2) + '\n';
  const command = { ...shared, expected_revision_id: input.revisionId, review: { reviewer: input.reviewer, path: proofPath, digest: digest(canonicalRunText(proof)) }, update_draft: input.updateDraft };
  const request = JSON.stringify(command, null, 2) + '\n';
  const values = new Map([[destination.path, input.stagedMaterial.content], [proofPath, proof], [requestPath, request]]);
  const outputs = [...values].map(([path, next]) => prepareOwnedOutput(root, input.runId, path, next));
  if (outputs.slice(1).some(row => row.old !== null)) throw Error('AGDF_ARTEFACT_BINDING_PROOF_INVALID');
  return { command, outputs, values, requestPath };
}

// Called by run-step with Run and Backlog locks already held. No approval or QA decision owner.
export function prepareArtefactRecording(root, run, input, control, before) {
  const fail = reason => { throw new Error(reason); };
  const expected = relationshipForGate(input.gate);
  const qaRecording = input.gate === 'QA' && before.current_gate === 'QA'
    && (before.status === 'open' || before.status === 'blocked' && control.artefacts.get('QA')?.status === 'block');
  if (readSourceRevisions(run.content).present && !qaRecording && before.missing_approval !== `Approval: ${input.gate}` && before.next_operation?.type !== "revise_gate_material") fail("AGDF_ARTEFACT_RECORDING_GATE_INVALID");
  if (!expected || input.gate === "UR" || before.current_gate !== input.gate || before.status !== "open" && !qaRecording
      || control.approvals.get(input.gate)?.status === "approved") fail("AGDF_ARTEFACT_RECORDING_GATE_INVALID");
  const sourceRequest = input.requestBinding ? readOperationSource(root, input.runId, input.requestBinding) : null;
  const staged = stagedRecording(root, run, input, control, expected);
  if (staged) input = { ...input, evidence: staged.requestPath };
  const command = staged?.command ?? readContainedJson(root, input.evidence);
  const stagedProof = staged ? {
    fileDigest: path => staged.values.has(path) ? digest(canonicalRunText(staged.values.get(path))) : artefactFileDigest(root, path),
    readJson: path => staged.values.has(path) ? JSON.parse(staged.values.get(path)) : readContainedJson(root, path),
  } : undefined;
  if (!exactObject(command, REVIEWED_REQUEST_FIELDS)
      || command.schema_version !== "1" || command.target_id !== resolveControlCommandTarget(root).target_id
      || command.run_id !== input.runId || command.expected_revision_id !== input.revisionId
      || typeof command.update_draft !== "boolean" || !exactObject(command.relationship, ["from", "relationship", "to"])
      || !sameRelationship(command.relationship, expected)) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  const bindings = readArtefactBindings(run.content);
  if (!bindings.valid) fail("AGDF_ARTEFACT_BINDINGS_INVALID");
  const candidate = bindInputResolution({
    schema_version: input.operationId ? "2" : "1", binding_id: randomUUID(), target_id: command.target_id, run_id: input.runId,
    relationship: command.relationship, destination: command.destination, source: command.source, review: command.review,
    origin: "reviewed_mapping", operation: { id: input.operationId ?? randomUUID(), previous_revision_id: input.revisionId, resulting_revision_id: randomUUID(), revision: Number(run.meta.revision) + 1, ...(input.operationId ? { request_digest: input.requestDigest } : {}) }, supersedes: null,
  });
  const prior = bindings.latest.filter(item => artefactBindingKey(item) === artefactBindingKey(candidate));
  if (prior.length > 1) fail("AGDF_ARTEFACT_BINDINGS_INVALID");
  candidate.supersedes = prior[0]?.binding_id ?? null;
  const source = control.artefacts.get(expected.to);
  if (!validArtefactBinding(candidate) || !source || source.path !== command.source.path || source.status !== "approved"
      || control.approvals.get(expected.to)?.status !== "approved" || !validateBindingProof(root, candidate, stagedProof)
      || !exactApprovedArtefacts(root, control)) fail("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
  if (input.gate === "QA") {
    const report = input.stagedMaterial?.content ?? readFileSync(containedRegularFile(root, candidate.destination.path).path, "utf8");
    if (readReportDecision(report) !== candidate.destination.status) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  }
  const old = control.artefacts.get(input.gate);
  if (staged && prior.length && !command.update_draft) fail('AGDF_ARTEFACT_RECORDING_INPUT_INVALID');
  if (old?.path && old.path !== candidate.destination.path) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  const seal = runSealState(root, run.content);
  let draftChange = false;
  if (seal.status === "content_changed" && command.update_draft && (old?.status === "draft"
      || qaRecording && ['pass', 'revise', 'block'].includes(old?.status))
      && prior.length === 1 && old.path === prior[0].destination.path && prior[0].destination.digest !== candidate.destination.digest) {
    // Reconstruct the old aggregate seal using only the previously sealed draft digest.
    // Every other bound file and the complete recorded body must still match that seal.
    const restored = computeRunSeals(root, run.content, { artefactDigests: new Map([[old.path, prior[0].destination.digest]]) });
    draftChange = restored.content_seal === seal.recorded.content_seal && restored.approval_seal === seal.recorded.approval_seal;
  }
  if (seal.status !== "valid" && !draftChange) fail("AGDF_RUN_SEAL_INVALID");
  const rows = control.artefact_chain.filter(row => row.from === expected.from);
  if (rows.length > 1 || rows.some(row => !sameRelationship(row, expected))) fail("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
  const evidence = `binding ${candidate.binding_id}; reviewed by ${candidate.review.reviewer}; ${candidate.review.path}`;
  let text = upsertTableRow(run.content, "Artefacts", 0, input.gate, [input.gate, candidate.destination.path, candidate.destination.status, "Reviewed source binding recorded atomically"]);
  text = text && upsertTableRow(text, "Artefact Chain", 0, expected.from, [expected.from, expected.relationship, expected.to, evidence]);
  if (!text) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  text = appendArtefactBinding(text, candidate);
  // Proof files are seal-bound too; historical proofs may not be silently rewritten on update.
  text = upsertTableRow(text, "Artefacts", 0, `Binding proof ${candidate.binding_id}`, [`Binding proof ${candidate.binding_id}`, candidate.review.path, "done", "Subordinate reviewed mapping evidence"]);
  text = text && appendTableRow(text, "Evidence", ["Artefact source binding", candidate.review.path, `${expected.from} ${expected.relationship} ${expected.to}; binding ${candidate.binding_id}; operation ${candidate.operation.id}; ${input.revisionId} -> ${candidate.operation.resulting_revision_id}`, "reviewed cooperative mapping"]);
  if (!text) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  const snapshot = canonicalJson([candidate, command]);
  return { text, receipt: candidate, nextRevisionId: candidate.operation.resulting_revision_id, allowContentChange: draftChange, ...(staged ? { outputs: staged.outputs } : {}),
    validateBeforeWrite: () => {
      sourceRequest?.validate();
      if (!validateBindingProof(root, candidate) || !exactApprovedArtefacts(root, control)
          || canonicalJson([candidate, readContainedJson(root, input.evidence)]) !== snapshot
          || artefactFileDigest(root, candidate.destination.path) !== candidate.destination.digest) fail("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
    } };
}
