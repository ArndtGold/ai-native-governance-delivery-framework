import { randomUUID } from "node:crypto";
import { canonicalJson } from "./approval-command-contract.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { exactApprovedArtefacts, validateBindingProof } from "./artefact-binding-proof.js";
import { APPROVAL_GATES, runSealState } from "./run-seal.js";
import { readRun, appendTableRow, guardedWrite, rejected } from "./run-state-edits.js";
import { parseControlState } from "./run-state-parser.js";
import { runPath } from "./run-state-reader.js";
import { flushRunCommit, withRunLock, writeRunLocked } from "./run-state-writer.js";
import { sameRelationship } from "../control-evaluation/delivery-relationships.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";

const controlFor = run => ({ ...parseControlState(run.content, { userGates: APPROVAL_GATES,
  internalSteps: ["Brownfield Review", "Brownfield Analysis", "CD+Tests", "CR"], closeoutArtefacts: ["OR"] }), content: run.content, meta: run.meta });

// Mutation owner for authorized bound continuation only. Evaluators never call it.
export function correctRunRelationship(root, { runId, revisionId }, { evaluateGateCheck, checkpoint, confirmCommit = flushRunCommit } = {}) {
  const locked = guardedWrite(runId, () => withRunLock(runPath(root, runId), () => {
    const run = readRun(root, runId);
    if (run.rejection) return run.rejection;
    if (run.meta.revision_id !== revisionId) return rejected(runId, "stale_revision");
    if (runSealState(root, run.content).status !== "valid") return rejected(runId, "seal_invalid");
    const report = evaluateGateCheck(root, { runId });
    const decisive = (report.delivery_map?.findings ?? []).filter(row => ["block", "revise"].includes(row.severity));
    const missing = (report.delivery_map?.relationships ?? []).filter(row => row.required && row.status === "missing");
    if (missing.length === 0 && decisive.length === 0) return { schema_version: "1", outcome: "unchanged", run_id: runId, revision_id: revisionId };
    const unrelatedDoctor = (report.doctor_report?.findings ?? []).filter(row => ["block", "revise"].includes(row.severity)
      && row.code !== "AGDF_DELIVERY_RELATIONSHIP_MISSING");
    if (unrelatedDoctor.length || decisive.length !== 1 || decisive[0].code !== "AGDF_DELIVERY_RELATIONSHIP_MISSING"
        || missing.length !== 1 || report.blocking_reason !== "AGDF_DELIVERY_RELATIONSHIP_MISSING") return rejected(runId, "correction_not_eligible");
    const control = controlFor(run), expected = missing[0];
    if (control.artefact_chain.some(row => row.from === expected.from)) return rejected(runId, "correction_not_eligible");
    const history = readArtefactBindings(run.content);
    const eligible = history.active.filter(receipt => receipt.run_id === runId && receipt.operation.revision <= Number(run.meta.revision)
      && sameRelationship(receipt.relationship, expected));
    if (!history.valid || eligible.length !== 1) return rejected(runId, "binding_proof_missing_or_ambiguous");
    const receipt = eligible[0], destinationGate = expected.from === "QA_REPORT" ? "QA" : expected.from;
    const destination = control.artefacts.get(destinationGate), source = control.artefacts.get(expected.to);
    if (destination?.path !== receipt.destination.path || source?.path !== receipt.source.path
        || !validateBindingProof(root, receipt) || !exactApprovedArtefacts(root, control)) return rejected(runId, "artefact_binding_proof_invalid");
    const before = canonicalJson(transitionDecisionForRunState(control));
    let next = appendTableRow(run.content, "Artefact Chain", [expected.from, expected.relationship, expected.to,
      `binding ${receipt.binding_id}; exact sealed reviewed mapping ${receipt.review.path}`]);
    if (!next) return rejected(runId, "run_layout_unsupported");
    const nextRevisionId = randomUUID();
    next = appendTableRow(next, "Evidence", ["Relationship correction", receipt.review.path,
      `binding ${receipt.binding_id}; ${expected.from} ${expected.relationship} ${expected.to}; revision ${revisionId} -> ${nextRevisionId}`, "exact sealed reviewed mapping"]);
    if (!next || canonicalJson(transitionDecisionForRunState(controlFor({ ...run, content: next }))) !== before) return rejected(runId, "correction_permission_changed");
    let written, recoveredCommit = false;
    try { written = writeRunLocked(run.path, next, revisionId, { expectedContent: run.content, nextRevisionId, checkpoint,
      validateBeforeWrite: () => {
        if (!validateBindingProof(root, receipt) || !exactApprovedArtefacts(root, control)
            || runSealState(root, run.content).status !== "valid") throw new Error("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
      } }); }
    catch (error) {
      const actual = readRun(root, runId);
      if (actual.rejection || actual.meta.revision_id !== nextRevisionId || runSealState(root, actual.content).status !== "valid") throw error;
      // Reuse the existing owner's durability confirmation; never retry into another revision.
      try { confirmCommit(run.path); }
      catch {
        const unconfirmed = new Error("AGDF_CORRECTION_COMMIT_UNCONFIRMED");
        unconfirmed.committed_revision_id = nextRevisionId;
        throw unconfirmed;
      }
      written = { meta: actual.meta }; recoveredCommit = true;
    }
    return { schema_version: "1", outcome: "corrected", run_id: runId, binding_id: receipt.binding_id,
      relationship: receipt.relationship, previous_revision_id: revisionId, revision_id: written.meta.revision_id, revision: written.meta.revision,
      ...(recoveredCommit ? { recovered_commit: true } : {}) };
  }));
  return locked.rejection ?? locked.state;
}
