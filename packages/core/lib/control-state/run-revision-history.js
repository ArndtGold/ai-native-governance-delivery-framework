import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { canonicalJson, digest, DIGEST_PATTERN, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { containedRegularFile, hasSymlinkComponent, isSafeControlRelativePath } from "./contained-file.js";
import { APPROVAL_GATES, canonicalRunText, computeRunSeals, listedArtefactPaths, pendingArtefactPaths } from "./run-seal.js";
import { parseControlState, parseRunState } from "./run-state-parser.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { exactApprovedArtefacts, validateBindingProof } from "./artefact-binding-proof.js";
import { internalStepArtefacts } from "../control-evaluation/run-state.js";
import { readSourceRevisions, revisionHistoryPrefix, SOURCE_GATES, sourceRevisionImpact } from "./run-source-revisions.js";

export const byteDigest = bytes => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
// Existing control JSON limit, applied before allocation to historical closure inputs too.
export function readHistoryBytes(root, path) {
  const file = containedRegularFile(root, path);
  if (file.status !== "valid" || hasSymlinkComponent(root, path) || statSync(file.path).size > 131072) throw Error("AGDF_REVISION_HISTORY_INVALID");
  return readFileSync(file.path);
}

export function collectRevisionHistory(root, runId, operationId, paths) {
  const prefix = revisionHistoryPrefix(runId, operationId);
  const files = [...new Set(paths)].sort().map((path, i) => {
    if (!isSafeControlRelativePath(path) || !path.startsWith(".agdf/control/")) throw Error("AGDF_REVISION_HISTORY_INVALID");
    const bytes = readHistoryBytes(root, path);
    return { path, snapshot: `${prefix}files/${i}.bin`, bytes, digest: byteDigest(bytes),
      canonical_digest: byteDigest(Buffer.from(canonicalRunText(bytes.toString("utf8")), "utf8")) };
  });
  const manifest = { schema_version: "1", run_id: runId, operation_id: operationId,
    files: files.map(({ path, snapshot, bytes, digest, canonical_digest }) => ({ path, snapshot, length: bytes.length, digest, canonical_digest })) };
  const text = canonicalJson(manifest) + "\n";
  if (Buffer.byteLength(text) > 131072) throw Error("AGDF_REVISION_HISTORY_INVALID");
  return { manifest, text, digest: byteDigest(Buffer.from(text)), files };
}

export function validateRevisionHistory(root, receipt) {
  try {
    const bytes = readHistoryBytes(root, receipt.archive.path);
    if (byteDigest(bytes) !== receipt.archive.digest) return false;
    const manifest = JSON.parse(bytes.toString("utf8")), prefix = revisionHistoryPrefix(receipt.run_id, receipt.operation_id);
    if (!exactObject(manifest, ["schema_version", "run_id", "operation_id", "files"]) || manifest.schema_version !== "1"
        || manifest.run_id !== receipt.run_id || manifest.operation_id !== receipt.operation_id
        || !Array.isArray(manifest.files) || !manifest.files.length) return false;
    if (receipt.target_id !== resolveControlCommandTarget(root).target_id) return false;
    const names = new Set(), snapshots = new Set(), archived = new Map(), digests = new Map();
    for (const row of manifest.files) {
      if (!exactObject(row, ["path", "snapshot", "length", "digest", "canonical_digest"])
          || !isSafeControlRelativePath(row.path) || !row.path.startsWith(".agdf/control/")
          || !new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}files/[0-9]+\\.bin$`, "u").test(row.snapshot)
          || !Number.isSafeInteger(row.length) || row.length < 0 || row.length > 131072
          || !DIGEST_PATTERN.test(row.digest) || !DIGEST_PATTERN.test(row.canonical_digest)
          || names.has(row.path) || snapshots.has(row.snapshot)) return false;
      const actual = readHistoryBytes(root, row.snapshot);
      if (actual.length !== row.length || byteDigest(actual) !== row.digest
          || byteDigest(Buffer.from(canonicalRunText(actual.toString("utf8")))) !== row.canonical_digest) return false;
      names.add(row.path); snapshots.add(row.snapshot);
      archived.set(row.path, actual); digests.set(row.path, row.canonical_digest);
    }
    const original = archived.get(`.agdf/control/runs/${receipt.run_id}/RUN_STATE.md`)?.toString("utf8");
    if (!original || !["UR", "PRD", "SD", "TP"].every(type => names.has(`.agdf/control/artefacts/${receipt.run_id}/${type}.md`))) return false;
    const parsed = parseRunState(original, receipt.run_id);
    if (!parsed.valid || parsed.meta.revision_id !== receipt.previous_revision_id
        || Number(parsed.meta.revision) + 1 !== receipt.revision) return false;
    // Resolve original paths through the archived closure. Live canonical drafts may have
    // changed since this receipt; they cannot repair or invalidate its historical proofs.
    for (const path of listedArtefactPaths(original)) {
      if (!digests.has(path)) {
        if (!pendingArtefactPaths(original).includes(path)) return false;
        digests.set(path, "missing");
      }
    }
    const seals = computeRunSeals(root, original, { artefactDigests: digests });
    if (seals.content_seal !== parsed.meta.content_seal || seals.approval_seal !== parsed.meta.approval_seal) return false;
    const readers = { historical: true, fileDigest: path => digests.get(path) ?? "missing",
      rawFileDigest: path => archived.has(path) ? byteDigest(archived.get(path)) : "missing", readJson: path => JSON.parse(archived.get(path).toString("utf8")) };
    const control = { ...parseControlState(original, { userGates: APPROVAL_GATES, internalSteps: [...internalStepArtefacts] }), content: original, meta: parsed.meta };
    const bindings = readArtefactBindings(original);
    // The receipt pins an actually archived reviewed request and its computed preview,
    // not just unrelated valid old approvals beside caller-supplied request hashes.
    const proposals = [...archived.values()].flatMap(bytes => {
      try { const row = JSON.parse(bytes.toString("utf8")); return digest(canonicalJson(row)) === receipt.request_digest ? [row] : []; } catch { return []; }
    });
    const proposal = proposals[0];
    const sources = SOURCE_GATES.map(type => ({ type, path: control.artefacts.get(type)?.path, digest: digests.get(control.artefacts.get(type)?.path) }));
    if (proposals.length !== 1 || !exactObject(proposal, ["schema_version", "target_id", "run_id", "expected_revision_id", "operation_id", "source_gate", "reason", "intended_change", "sources", "impact_assessment"])
        || proposal.schema_version !== "1" || proposal.target_id !== receipt.target_id || proposal.run_id !== receipt.run_id
        || proposal.expected_revision_id !== receipt.previous_revision_id || proposal.operation_id !== receipt.operation_id
        || proposal.source_gate !== receipt.source_gate || proposal.reason !== receipt.reason || canonicalJson(proposal.sources) !== canonicalJson(sources)
        || canonicalJson(proposal.impact_assessment?.upstream) !== canonicalJson(receipt.retained_sources)
        || canonicalJson(proposal.impact_assessment?.analyses) !== canonicalJson(receipt.analyses)) return false;
    const preview = { schema_version: "1", target_id: receipt.target_id, run_id: receipt.run_id, expected_revision_id: receipt.previous_revision_id,
      operation_id: receipt.operation_id, request_digest: receipt.request_digest, reason: proposal.reason, intended_change: proposal.intended_change,
      sources, impact: sourceRevisionImpact(proposal, bindings.active), archive_digest: receipt.archive.digest,
      current_run_digest: byteDigest(archived.get(`.agdf/control/runs/${receipt.run_id}/RUN_STATE.md`)) };
    if (digest(canonicalJson(preview)) !== receipt.preview_digest) return false;
    return SOURCE_TYPES.every(type => control.approvals.get(type)?.status === "approved")
      && exactApprovedArtefacts(root, control, readers) && bindings.valid
      && ["PRD", "SD", "TP"].every(type => bindings.active.some(row => row.destination.type === type && validateBindingProof(root, row, readers)))
      && receipt.invalidated_bindings.length === bindings.active.filter(row => SOURCE_TYPES.slice(SOURCE_TYPES.indexOf(receipt.source_gate)).includes(row.destination.type)).length
      && receipt.invalidated_bindings.every(id => bindings.active.some(row => row.binding_id === id && SOURCE_TYPES.slice(SOURCE_TYPES.indexOf(receipt.source_gate)).includes(row.destination.type)))
      && receipt.retained_sources.every(row => digests.get(row.path) === row.digest)
      && receipt.analyses.every(row => control.artefacts.get(row.type)?.path === row.path && digests.get(row.path) === row.digest);
  } catch { return false; }
}

const SOURCE_TYPES = SOURCE_GATES;

export function validSourceRevisionHistories(root, content) {
  const history = readSourceRevisions(content);
  return history.valid && history.receipts.every(receipt => validateRevisionHistory(root, receipt));
}

export function inspectRevisionHistory(root, receipt) {
  if (!validateRevisionHistory(root, receipt)) throw Error("AGDF_REVISION_HISTORY_INVALID");
  return { authority: "historical_evidence_only", receipt,
    manifest: JSON.parse(readHistoryBytes(root, receipt.archive.path).toString("utf8")) };
}

export function archivedRunMatches(root, receipt, content) {
  try {
    const manifest = JSON.parse(readHistoryBytes(root, receipt.archive.path).toString("utf8"));
    return manifest.files.find(row => row.path === `.agdf/control/runs/${receipt.run_id}/RUN_STATE.md`)?.digest === byteDigest(Buffer.from(content));
  } catch { return false; }
}
