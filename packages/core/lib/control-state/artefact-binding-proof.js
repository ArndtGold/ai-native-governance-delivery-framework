import { readFileSync, statSync } from "../control-read/fs.js";
import { canonicalJson, digest, exactObject } from "./approval-command-contract.js";
import { readApprovalOperations } from "./approval-operations.js";
import { artefactFileDigest, APPROVAL_GATES } from "./run-seal.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { readSourceRevisions } from "./run-source-revisions.js";

export function readContainedJson(root, path) {
  const file = containedRegularFile(root, path);
  if (file.status !== "valid" || hasSymlinkComponent(root, path) || statSync(file.path).size > 131072) throw new Error("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
  try { return JSON.parse(readFileSync(file.path, "utf8")); }
  catch { throw new Error("AGDF_ARTEFACT_BINDING_PROOF_INVALID"); }
}

// Keep the existing aggregate semantics, including legacy receipts and UAT omission.
export function exactApprovedArtefacts(root, control, options = {}) {
  if (!readApprovalOperations(control.content).valid || !readSourceRevisions(control.content).valid
      || !readArtefactBindings(control.content).valid) return false;
  return APPROVAL_GATES.filter(gate => gate !== 'UAT' && control.approvals.get(gate)?.status === 'approved')
    .every(gate => inspectApprovedArtefact(root, control, gate, options).confirmed);
}

export function inspectApprovedArtefact(root, control, gate, { fileDigest = path => artefactFileDigest(root, path), readJson = path => readContainedJson(root, path), historical = false,
  rawFileDigest = path => {
    const file = containedRegularFile(root, path);
    return file.status === "valid" && !hasSymlinkComponent(root, path) && statSync(file.path).size <= 131072 ? digest(readFileSync(file.path)) : "missing";
  } } = {}) {
  const unconfirmed = () => ({ confirmed: false, reason: 'approval_proof_unconfirmed' });
  if (!APPROVAL_GATES.includes(gate) || gate === 'UAT' || control.approvals.get(gate)?.status !== 'approved') return unconfirmed();
  const operations = readApprovalOperations(control.content);
  if (!operations.valid) return unconfirmed();
  const revisions = readSourceRevisions(control.content), bindings = readArtefactBindings(control.content);
  if (!revisions.valid || !bindings.valid) return unconfirmed();
  // Receipts keep their recording checkout's target_id; writers bind new commands locally.
    const row = control.artefacts.get(gate), actual = fileDigest(row?.path);
    if (!actual.startsWith("sha256:")) return unconfirmed();
    if (revisions.present && ["PRD", "SD", "TP", "QA"].includes(gate)
        && !bindings.active.some(binding => binding.destination.type === (gate === "QA" ? "QA_REPORT" : gate) && binding.destination.path === row?.path
          && binding.destination.digest === actual && validateBindingProof(root, binding, { fileDigest, readJson, historical }))) return unconfirmed();
    const evidence = control.approvals.get(gate).evidence ?? "";
    const presentation = evidence.match(/presentation ([0-9a-f-]{36}) (sha256:[0-9a-f]{64})(?:\s|$)/u);
    if (!presentation) return unconfirmed();
    const receipt = operations.receipts.filter(item => item.binding.gate === gate && item.binding.presentation_id === presentation[1]);
    if (receipt.length > 1) return unconfirmed();
    if (receipt.length === 1) {
      if (receipt[0].binding.run_id !== control.meta.run_id
          || receipt[0].effect.artefact_digest !== actual || receipt[0].effect.presentation_digest !== presentation[2]) return unconfirmed();
      // The row identifies the exact prepared record, not a historical superseded approval.
    }
    let observedRaw;
    try {
      const envelope = readJson(`.agdf/control/runs/${control.meta.run_id}/presentations/${presentation[1]}.json`);
      const record = envelope.record;
      if (!record || record.schema_version !== 1 || record.presentation_id !== presentation[1] || record.run_id !== control.meta.run_id
          || record.gate !== gate || record.artefact_digest !== (observedRaw = rawFileDigest(row.path)) || envelope.digest !== presentation[2]
          || receipt.length === 1 && record.revision_id !== receipt[0].binding.expected_revision_id
          || digest(JSON.stringify(record)) !== envelope.digest) return unconfirmed();
    } catch { return unconfirmed(); }
  return { confirmed: true, reason: null, path: row.path, artefact_digest: actual, raw_digest: observedRaw };
}

// Local reviewed attestation: explicit exact mapping, never prose or inferred gate order.
export function validateBindingProof(root, receipt, { fileDigest = path => artefactFileDigest(root, path), readJson = path => readContainedJson(root, path), historical = false } = {}) {
  if ([receipt.destination, receipt.source, receipt.review].some(file => !historical && hasSymlinkComponent(root, file.path)
        || fileDigest(file.path) !== file.digest)) return false;
  try {
    const proof = readJson(receipt.review.path);
    return exactObject(proof, ["schema_version", "target_id", "run_id", "relationship", "destination", "source", "reviewer", "reviewed"])
      && proof.schema_version === "1" && proof.reviewed === true && proof.target_id === receipt.target_id && proof.run_id === receipt.run_id
      && proof.reviewer === receipt.review.reviewer
      && canonicalJson(proof.relationship) === canonicalJson(receipt.relationship)
      && canonicalJson(proof.destination) === canonicalJson(receipt.destination)
      && canonicalJson(proof.source) === canonicalJson(receipt.source);
  } catch { return false; }
}
