// Validation composes seal computation with historical and receipt proofs.
export * from "./run-seal-compute.js";
import { canonicalRunText, computeRunSeals } from "./run-seal-compute.js";
import { scalarFields } from "./run-state-document.js";
import { readApprovalOperations } from "./approval-operations.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { validSourceRevisionHistories } from "./run-revision-history.js";
const SEAL_PATTERN = /^sha256:[0-9a-f]{64}$/u;

export function runSealState(root, content) {
  const text = canonicalRunText(content);
  const { values } = scalarFields(text);
  const recorded = Object.freeze({ content_seal: values.get("content_seal"), approval_seal: values.get("approval_seal") });
  if (recorded.content_seal === undefined && recorded.approval_seal === undefined) return Object.freeze({ status: "unsealed" });
  if (!SEAL_PATTERN.test(recorded.content_seal ?? "") || !SEAL_PATTERN.test(recorded.approval_seal ?? "")) {
    return Object.freeze({ status: "invalid", recorded });
  }
  if (!readApprovalOperations(text).valid) return Object.freeze({ status: "invalid", recorded });
  if (!readArtefactBindings(text).valid) return Object.freeze({ status: "invalid", recorded });
  if (!validSourceRevisionHistories(root, text)) return Object.freeze({ status: "invalid", recorded });
  const actual = computeRunSeals(root, text);
  const status = actual.approval_seal !== recorded.approval_seal
    ? "approvals_changed"
    : actual.content_seal !== recorded.content_seal ? "content_changed" : "valid";
  return Object.freeze({ status, recorded, actual });
}
