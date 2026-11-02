import { randomUUID } from "node:crypto";
import { canonicalJson, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { appendArtefactBinding, artefactBindingKey, readArtefactBindings, validArtefactBinding } from "./artefact-bindings.js";
import { exactApprovedArtefacts, readContainedJson, validateBindingProof } from "./artefact-binding-proof.js";
import { artefactFileDigest, computeRunSeals, runSealState } from "./run-seal.js";
import { appendTableRow, upsertTableRow } from "./run-state-edits.js";
import { relationshipForGate, sameRelationship } from "../control-evaluation/delivery-relationships.js";
import { readFileSync } from "node:fs";
import { containedRegularFile } from "./contained-file.js";
import { readSourceRevisions } from "./run-source-revisions.js";

// Called by run-step with Run and Backlog locks already held. No approval or QA decision owner.
export function prepareArtefactRecording(root, run, input, control, before) {
  const fail = reason => { throw new Error(reason); };
  const expected = relationshipForGate(input.gate);
  if (readSourceRevisions(run.content).present && before.missing_approval !== `Approval: ${input.gate}`) fail("AGDF_ARTEFACT_RECORDING_GATE_INVALID");
  if (!expected || input.gate === "UR" || before.current_gate !== input.gate || before.status !== "open"
      || control.approvals.get(input.gate)?.status === "approved") fail("AGDF_ARTEFACT_RECORDING_GATE_INVALID");
  const command = readContainedJson(root, input.evidence);
  if (!exactObject(command, ["schema_version", "target_id", "run_id", "expected_revision_id", "destination", "source", "relationship", "review", "update_draft"])
      || command.schema_version !== "1" || command.target_id !== resolveControlCommandTarget(root).target_id
      || command.run_id !== input.runId || command.expected_revision_id !== input.revisionId
      || typeof command.update_draft !== "boolean" || !exactObject(command.relationship, ["from", "relationship", "to"])
      || !sameRelationship(command.relationship, expected)) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  const bindings = readArtefactBindings(run.content);
  if (!bindings.valid) fail("AGDF_ARTEFACT_BINDINGS_INVALID");
  const candidate = {
    schema_version: "1", binding_id: randomUUID(), target_id: command.target_id, run_id: input.runId,
    relationship: command.relationship, destination: command.destination, source: command.source, review: command.review,
    origin: "reviewed_mapping", operation: { id: randomUUID(), previous_revision_id: input.revisionId, resulting_revision_id: randomUUID(), revision: Number(run.meta.revision) + 1 }, supersedes: null,
  };
  const prior = bindings.latest.filter(item => artefactBindingKey(item) === artefactBindingKey(candidate));
  if (prior.length > 1) fail("AGDF_ARTEFACT_BINDINGS_INVALID");
  candidate.supersedes = prior[0]?.binding_id ?? null;
  const source = control.artefacts.get(expected.to);
  if (!validArtefactBinding(candidate) || !source || source.path !== command.source.path || source.status !== "approved"
      || control.approvals.get(expected.to)?.status !== "approved" || !validateBindingProof(root, candidate)
      || !exactApprovedArtefacts(root, control)) fail("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
  if (input.gate === "QA") {
    const report = readFileSync(containedRegularFile(root, candidate.destination.path).path, "utf8");
    if (report.match(/^(?:- )?(?:Decision|Status):\s*(pass|revise|block)\s*$/imu)?.[1]?.toLowerCase() !== candidate.destination.status) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  }
  const old = control.artefacts.get(input.gate);
  if (old?.path && old.path !== candidate.destination.path) fail("AGDF_ARTEFACT_RECORDING_INPUT_INVALID");
  const seal = runSealState(root, run.content);
  let draftChange = false;
  if (seal.status === "content_changed" && command.update_draft && input.gate !== "QA" && old?.status === "draft"
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
  return { text, receipt: candidate, nextRevisionId: candidate.operation.resulting_revision_id, allowContentChange: draftChange,
    validateBeforeWrite: () => {
      if (!validateBindingProof(root, candidate) || !exactApprovedArtefacts(root, control)
          || canonicalJson([candidate, readContainedJson(root, input.evidence)]) !== snapshot
          || artefactFileDigest(root, candidate.destination.path) !== candidate.destination.digest) fail("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
    } };
}
