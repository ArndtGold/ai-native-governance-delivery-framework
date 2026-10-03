import { readFileSync, statSync } from "node:fs";
import { canonicalJson, digest, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { readApprovalOperations } from "./approval-operations.js";
import { artefactFileDigest, APPROVAL_GATES } from "./run-seal.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";

export function readContainedJson(root, path) {
  const file = containedRegularFile(root, path);
  if (file.status !== "valid" || hasSymlinkComponent(root, path) || statSync(file.path).size > 131072) throw new Error("AGDF_ARTEFACT_BINDING_PROOF_INVALID");
  try { return JSON.parse(readFileSync(file.path, "utf8")); }
  catch { throw new Error("AGDF_ARTEFACT_BINDING_PROOF_INVALID"); }
}

export function exactApprovedArtefacts(root, control) {
  const operations = readApprovalOperations(control.content);
  if (!operations.valid) return false;
  const target = resolveControlCommandTarget(root).target_id;
  for (const gate of APPROVAL_GATES.filter(gate => gate !== "UAT" && control.approvals.get(gate)?.status === "approved")) {
    const row = control.artefacts.get(gate), actual = artefactFileDigest(root, row?.path);
    if (!actual.startsWith("sha256:")) return false;
    const evidence = control.approvals.get(gate).evidence ?? "";
    const presentation = evidence.match(/presentation ([0-9a-f-]{36}) (sha256:[0-9a-f]{64})(?:\s|$)/u);
    if (!presentation) return false;
    const receipt = operations.receipts.filter(item => item.binding.gate === gate && item.binding.presentation_id === presentation[1]);
    if (receipt.length > 1) return false;
    if (receipt.length === 1) {
      if (receipt[0].binding.target_id !== target || receipt[0].binding.run_id !== control.meta.run_id
          || receipt[0].effect.artefact_digest !== actual || receipt[0].effect.presentation_digest === null) return false;
      // The row identifies the exact prepared record, not a historical superseded approval.
    }
    try {
      const envelope = readContainedJson(root, `.agdf/control/runs/${control.meta.run_id}/presentations/${presentation[1]}.json`);
      const record = envelope.record;
      if (!record || record.schema_version !== 1 || record.presentation_id !== presentation[1] || record.run_id !== control.meta.run_id
          || record.gate !== gate || record.artefact_digest !== actual || envelope.digest !== presentation[2]
          || digest(JSON.stringify(record)) !== envelope.digest) return false;
    } catch { return false; }
  }
  return true;
}

// Local reviewed attestation: explicit exact mapping, never prose or inferred gate order.
export function validateBindingProof(root, receipt) {
  if (receipt.target_id !== resolveControlCommandTarget(root).target_id
      || [receipt.destination, receipt.source, receipt.review].some(file => hasSymlinkComponent(root, file.path)
        || artefactFileDigest(root, file.path) !== file.digest)) return false;
  try {
    const proof = readContainedJson(root, receipt.review.path);
    return exactObject(proof, ["schema_version", "target_id", "run_id", "relationship", "destination", "source", "reviewer", "reviewed"])
      && proof.schema_version === "1" && proof.reviewed === true && proof.target_id === receipt.target_id && proof.run_id === receipt.run_id
      && proof.reviewer === receipt.review.reviewer
      && canonicalJson(proof.relationship) === canonicalJson(receipt.relationship)
      && canonicalJson(proof.destination) === canonicalJson(receipt.destination)
      && canonicalJson(proof.source) === canonicalJson(receipt.source);
  } catch { return false; }
}
