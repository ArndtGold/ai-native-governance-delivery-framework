import { prepareRunContentState } from "../control-evaluation/run-state.js";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "../control-read/fs.js";
import { canonicalJson, digest, DIGEST_PATTERN, exactObject } from "./approval-command-contract.js";
import { containedRegularFile, hasSymlinkComponent, isSafeControlRelativePath } from "./contained-file.js";
import { APPROVAL_GATES, canonicalRunText, computeRunSeals, listedArtefactPaths, pendingArtefactPaths } from "./run-seal-compute.js";
import { parseControlState, parseRunState } from "./run-state-parser.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { exactApprovedArtefacts, validateBindingProof } from "./artefact-binding-proof.js";
import { internalStepArtefacts } from "../control-evaluation/run-state.js";
import { readSourceRevisions, revisionHistoryPrefix, SOURCE_GATES, sourceRevisionImpact, validExpandedRevisionProof } from "./run-source-revisions.js";
import { REVISION_PROPOSAL_FIELDS, REVISION_PROPOSAL_V2_FIELDS } from './recording-formats.js';
import { sourceRevisionBoundary, earlyPrdRevisionBoundary } from "./run-revision-boundary.js";
import { readRunOperations } from './run-operations.js';

export const byteDigest = bytes => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const DOCUMENT_LIMIT = 131072;
const CONTROL_STATE_LIMIT = 1048576;
const canonicalRunPath = path => /^\.agdf\/control\/runs\/[a-z0-9][a-z0-9._-]{0,127}\/RUN_STATE\.md$/u.test(path);
const historyLimit = path => canonicalRunPath(path) ? CONTROL_STATE_LIMIT : DOCUMENT_LIMIT;
// A long-lived canonical control record is not an input document. Ordinary sources,
// proposals and manifests retain their existing bound; every read checks before allocation.
function readBoundedHistoryBytes(root, path, limit) {
  const file = containedRegularFile(root, path);
  if (file.status !== "valid" || hasSymlinkComponent(root, path) || statSync(file.path).size > limit) throw Error("AGDF_REVISION_HISTORY_INVALID");
  return readFileSync(file.path);
}
export function readHistoryBytes(root, path) {
  return readBoundedHistoryBytes(root, path, historyLimit(path));
}

export function collectRevisionHistory(root, runId, operationId, paths, { proposalMaterial } = {}) {
  const prefix = revisionHistoryPrefix(runId, operationId);
  const files = [...new Set(paths)].sort().map((path, i) => {
    if (!isSafeControlRelativePath(path) || !path.startsWith(".agdf/control/")) throw Error("AGDF_REVISION_HISTORY_INVALID");
    const bytes = proposalMaterial?.path === path ? Buffer.from(proposalMaterial.content) : readBoundedHistoryBytes(root, path,
      path === `.agdf/control/runs/${runId}/RUN_STATE.md` ? CONTROL_STATE_LIMIT : DOCUMENT_LIMIT);
    if (proposalMaterial?.path === path && (bytes.length > DOCUMENT_LIMIT || byteDigest(Buffer.from(canonicalRunText(bytes.toString('utf8')))) !== proposalMaterial.digest
      || path !== `.agdf/control/artefacts/${runId}/EVIDENCE-${proposalMaterial.digest.slice(7)}.json`)) throw Error('AGDF_REVISION_HISTORY_INVALID');
    return { path, snapshot: `${prefix}files/${i}.bin`, bytes, digest: byteDigest(bytes),
      canonical_digest: byteDigest(Buffer.from(canonicalRunText(bytes.toString("utf8")), "utf8")) };
  });
  const manifest = { schema_version: "1", run_id: runId, operation_id: operationId,
    files: files.map(({ path, snapshot, bytes, digest, canonical_digest }) => ({ path, snapshot, length: bytes.length, digest, canonical_digest })) };
  const text = canonicalJson(manifest) + "\n";
  if (Buffer.byteLength(text) > 131072) throw Error("AGDF_REVISION_HISTORY_INVALID");
  return { manifest, text, digest: byteDigest(Buffer.from(text)), files, ...(proposalMaterial ? { proposalMaterial } : {}) };
}

export function readValidatedRevisionArchive(root, receipt) {
  try {
    const bytes = readHistoryBytes(root, receipt.archive.path);
    if (byteDigest(bytes) !== receipt.archive.digest) return false;
    const manifest = JSON.parse(bytes.toString("utf8")), prefix = revisionHistoryPrefix(receipt.run_id, receipt.operation_id);
    // target_id names the recording checkout; clones verify it via the archived proposal, not their path.
    if (!exactObject(manifest, ["schema_version", "run_id", "operation_id", "files"]) || manifest.schema_version !== "1"
        || manifest.run_id !== receipt.run_id || manifest.operation_id !== receipt.operation_id
        || !Array.isArray(manifest.files) || !manifest.files.length) return false;
    const names = new Set(), snapshots = new Set(), archived = new Map(), digests = new Map();
    for (const row of manifest.files) {
      if (!exactObject(row, ["path", "snapshot", "length", "digest", "canonical_digest"])
          || !isSafeControlRelativePath(row.path) || !row.path.startsWith(".agdf/control/")
          || !new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}files/[0-9]+\\.bin$`, "u").test(row.snapshot)
          || !Number.isSafeInteger(row.length) || row.length < 0
          || row.length > (row.path === `.agdf/control/runs/${receipt.run_id}/RUN_STATE.md` ? CONTROL_STATE_LIMIT : DOCUMENT_LIMIT)
          || !DIGEST_PATTERN.test(row.digest) || !DIGEST_PATTERN.test(row.canonical_digest)
          || names.has(row.path) || snapshots.has(row.snapshot)) return false;
      // Only the exact original Run record permits a larger archive snapshot.
      // Arbitrary .bin names and other document rows cannot widen the reader.
      const actual = readBoundedHistoryBytes(root, row.snapshot,
        row.path === `.agdf/control/runs/${receipt.run_id}/RUN_STATE.md` ? CONTROL_STATE_LIMIT : DOCUMENT_LIMIT);
      if (actual.length !== row.length || byteDigest(actual) !== row.digest
          || byteDigest(Buffer.from(canonicalRunText(actual.toString("utf8")))) !== row.canonical_digest) return false;
      names.add(row.path); snapshots.add(row.snapshot);
      archived.set(row.path, actual); digests.set(row.path, row.canonical_digest);
    }
    const original = archived.get(`.agdf/control/runs/${receipt.run_id}/RUN_STATE.md`)?.toString("utf8");
    if (!original) return false;
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
    const control = { ...prepareRunContentState(root, original, "", { readArtefact: path => archived.get(path)?.toString("utf8") }), meta: parsed.meta };
    return { manifest, original, parsed, archived, digests, names, readers, control };
  } catch { return false; }
}

export function validateRevisionHistory(root, receipt) {
  try {
    const closure = readValidatedRevisionArchive(root, receipt);
    if (!closure) return false;
    const { original, parsed, archived, digests, names, readers, control } = closure;
    const expanded = receipt.schema_version === '3';
    const boundary = sourceRevisionBoundary(control, receipt.source_gate, expanded ? 2 : 1);
    if (!boundary || !boundary.sources.every(type => names.has(`.agdf/control/artefacts/${receipt.run_id}/${type}.md`))) return false;
    const bindings = readArtefactBindings(original);
    // The receipt pins an actually archived reviewed request and its computed preview,
    // not just unrelated valid old approvals beside caller-supplied request hashes.
    const proposals = [...archived.values()].flatMap(bytes => {
      try { const row = JSON.parse(bytes.toString("utf8")); return digest(canonicalJson(row)) === receipt.request_digest ? [row] : []; } catch { return []; }
    });
    const proposal = proposals[0];
    if (['2', '3'].includes(receipt.schema_version)) {
      const bytes = archived.get(receipt.proposal_reference.path);
      if (!bytes || digest(canonicalRunText(bytes.toString('utf8'))) !== receipt.proposal_reference.digest) return false;
    }
    const sources = boundary.sources.map(type => ({ type, path: control.artefacts.get(type)?.path, digest: digests.get(control.artefacts.get(type)?.path) }));
    if (proposals.length !== 1 || !exactObject(proposal, expanded ? REVISION_PROPOSAL_V2_FIELDS : REVISION_PROPOSAL_FIELDS)
        || proposal.schema_version !== (expanded ? '2' : '1') || proposal.target_id !== receipt.target_id || proposal.run_id !== receipt.run_id
        || proposal.expected_revision_id !== receipt.previous_revision_id || proposal.operation_id !== receipt.operation_id
        || proposal.source_gate !== receipt.source_gate || proposal.reason !== receipt.reason || canonicalJson(proposal.sources) !== canonicalJson(sources)
        || canonicalJson(proposal.impact_assessment?.upstream) !== canonicalJson(receipt.retained_sources)
        || canonicalJson(proposal.impact_assessment?.analyses) !== canonicalJson(receipt.analyses)) return false;
    const impact = sourceRevisionImpact(proposal, bindings.active);
    if (expanded && (receipt.policy_version !== 2 || receipt.initiating_phase !== boundary.initiating_phase
      || receipt.impact_digest !== digest(canonicalJson(impact)) || receipt.quality_digest !== digest(canonicalJson(proposal.quality_assessment))
      || !validExpandedRevisionProof(proposal, control, path => archived.get(path)?.toString('utf8'), boundary.initiating_phase))) return false;
    const preview = { schema_version: expanded ? '2' : "1", target_id: receipt.target_id, run_id: receipt.run_id, expected_revision_id: receipt.previous_revision_id,
      operation_id: receipt.operation_id, request_digest: receipt.request_digest, reason: proposal.reason, intended_change: proposal.intended_change,
      sources, impact, archive_digest: receipt.archive.digest,
      current_run_digest: byteDigest(archived.get(`.agdf/control/runs/${receipt.run_id}/RUN_STATE.md`)) };
    if (digest(canonicalJson(preview)) !== receipt.preview_digest) return false;
    return boundary.approved.every(type => control.approvals.get(type)?.status === "approved")
      && exactApprovedArtefacts(root, control, readers) && bindings.valid
      && boundary.bindings.every(type => bindings.active.some(row => row.destination.type === type && validateBindingProof(root, row, readers)))
      && canonicalJson(receipt.invalidated_bindings) === canonicalJson(impact.invalidated_bindings)
      && receipt.retained_sources.every(row => digests.get(row.path) === row.digest)
      && receipt.analyses.every(row => control.artefacts.get(row.type)?.path === row.path && digests.get(row.path) === row.digest);
  } catch { return false; }
}

const SOURCE_TYPES = SOURCE_GATES;

export function validSourceRevisionHistories(root, content) {
  const history = readSourceRevisions(content);
  const operations = readRunOperations(content);
  return history.valid && history.receipts.every(receipt => validateRevisionHistory(root, receipt)) && operations.valid
    && operations.receipts.filter(row => row.kind === 'prd_revision.reopen').every(receipt => validateEarlyPrdHistory(root, receipt));
}

export const earlyPrdHistoryReference = receipt => ({ run_id: receipt.run_id, operation_id: receipt.operation_id, archive: receipt.effect.record.archive,
  previous_revision_id: receipt.expected_revision_id, revision: receipt.effect.revision });
export function validateEarlyPrdHistory(root, receipt) {
  try {
    const closure = readValidatedRevisionArchive(root, earlyPrdHistoryReference(receipt));
    if (!closure || !earlyPrdRevisionBoundary(closure.control)) return false;
    return closure.control.artefacts.get('PRD')?.path === receipt.effect.record.prd.path
      && closure.digests.get(receipt.effect.record.prd.path) === receipt.effect.record.prd.digest
      && exactApprovedArtefacts(root, closure.control, closure.readers);
  } catch { return false; }
}

export function validEarlyPrdEffect(before, after) {
  const parse = content => parseControlState(content, { userGates: APPROVAL_GATES });
  const old = parse(before), next = parse(after);
  return earlyPrdRevisionBoundary({ ...old, meta: parseRunState(before).meta })
    && APPROVAL_GATES.every(gate => gate === 'PRD' ? next.approvals.get(gate)?.status === 'missing' && !next.approvals.get(gate)?.evidence
      : canonicalJson(old.approvals.get(gate)) === canonicalJson(next.approvals.get(gate)))
    && [...old.artefacts].every(([type, row]) => type === 'PRD' ? next.artefacts.get(type)?.path === row.path && next.artefacts.get(type)?.status === 'draft'
      : canonicalJson(next.artefacts.get(type)) === canonicalJson(row))
    && parseRunState(after).meta.current_gate === 'PRD' && parseRunState(after).meta.lifecycle === 'active';
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
