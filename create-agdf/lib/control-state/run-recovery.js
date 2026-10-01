import { assertRecoveryOperationsTrusted } from "./run-state-writer.js";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync, fsyncSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { closeoutArtefacts, internalStepArtefacts, userGateOrder } from "../control-evaluation/run-state.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { duplicateArtefactRowTypes, parseControlState, parseRunState, scalarFields, sectionTableRows } from "./run-state-parser.js";
import { applyRunSeals, artefactFileDigest, canonicalRunText, computeRunSeals, listedArtefactPaths, pendingArtefactPaths, runSealState } from "./run-seal.js";
import { runPath } from "./run-state-reader.js";
import { atomicWrite, recoveryRunContent, unapproveRecoveryApprovals, withRunLock, writeRunRecoveryLocked } from "./run-state-writer.js";

const sha256 = (value) => `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
const digestContent = (content) => sha256(canonicalRunText(content));
function recoveryPreviewDigest(preview) {
  const bound = {
    schema_version: preview.schema_version, preview_id: preview.preview_id, run_id: preview.run_id,
    source_revision_id: preview.source_revision_id, source_content_digest: preview.source_content_digest,
    source_content: preview.source_content, source_artefacts: preview.source_artefacts,
    git_history: preview.git_history, prior_approvals: preview.prior_approvals,
    approval_provenance: preview.approval_provenance, approvals_to_invalidate: preview.approvals_to_invalidate,
    next_gate: preview.next_gate, next_revision_id: preview.next_revision_id,
    candidate_content: preview.candidate_content, candidate_digest: preview.candidate_digest,
  };
  // Version 1 journals did not bind the activity timestamp. Keep their stored digest readable;
  // new previews bind the timestamp used by both the expected state and the atomic writer.
  if (preview.preview_format_version === 2) {
    bound.preview_format_version = 2;
    bound.created_at = preview.created_at;
  }
  return sha256(JSON.stringify(bound));
}

const PREVIEW_CONFIRMATION = (runId, previewId, digest) => `RECOVER ${runId} ${previewId} ${digest}`;

// Read-only proof of the former self-reference hashing defect. This does not accept arbitrary
// changed seals: the complete current record must equal the validated journal's old writer result.
export function inspectSelfReferenceRecovery(root, runId) {
  const { path, runDir } = safeRunFiles(root, runId);
  const content = readFileSync(path, "utf8");
  const parsed = parseRunState(content, runId);
  const selfPath = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  if (!parsed.valid || parsed.meta.lifecycle !== "active" || runSealState(root, content).status !== "content_changed"
      || !listedArtefactPaths(content).includes(selfPath)) return null;
  const directory = join(runDir, "recovery-previews");
  if (!existsSync(directory)) return null;
  const stat = lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("AGDF_RUN_PATH_INVALID");
  for (const name of readdirSync(directory).filter((value) => /^[0-9a-f-]{36}\.json$/iu.test(value))) {
    try {
      const { preview } = readPreview(root, runDir, runId, name.slice(0, -5));
      if (preview.phase !== "committed" || preview.preview_format_version !== 2
          || preview.result_digest !== digestContent(content) || preview.result_revision_id !== parsed.meta.revision_id
          || preview.next_revision_id !== parsed.meta.revision_id) continue;
      const currentArtefacts = artifactSnapshot(root, content).filter((entry) => entry.path !== selfPath);
      if (JSON.stringify(currentArtefacts) !== JSON.stringify(preview.source_artefacts.filter((entry) => entry.path !== selfPath))) continue;
      const source = parseRunState(preview.source_content, runId);
      const restored = recoveryRunContent(root, preview.candidate_content, {
        revision: source.meta.revision, nextRevisionId: preview.next_revision_id, updatedAt: preview.created_at,
      });
      const legacy = applyRunSeals(restored, computeRunSeals(root, restored, { selfReferenceDigest: preview.source_content_digest }));
      if (legacy !== content || runSealState(root, restored).status !== "valid") continue;
      return { source: `recovery-previews/${name}`, source_revision_id: parsed.meta.revision_id, content: restored };
    } catch { /* A damaged checkpoint cannot prove an original. */ }
  }
  return null;
}

function gitHistoryCandidates(root, runId) {
  const relativePath = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  let commits;
  try {
    commits = execFileSync("git", ["log", "--all", "--follow", "--format=%H", "--", relativePath], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000, maxBuffer: 1024 * 1024,
    }).trim().split(/\r?\n/u).filter(Boolean).slice(0, 25);
  } catch {
    return { status: "unavailable", candidates: [] };
  }
  const candidates = [];
  for (const commit of commits) {
    try {
      const content = execFileSync("git", ["show", `${commit}:${relativePath}`], {
        cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000, maxBuffer: 1024 * 1024,
      });
      const parsed = parseRunState(content, runId);
      if (!parsed.valid) continue;
      const meta = scalarFields(content).values;
      const sealPattern = /^sha256:[0-9a-f]{64}$/u;
      const sealLinesPresent = sealPattern.test(meta.get("content_seal") ?? "")
        && sealPattern.test(meta.get("approval_seal") ?? "");
      candidates.push({ commit, revision_id: parsed.meta.revision_id,
        content_digest: digestContent(content), seal_lines_present: sealLinesPresent,
        approval_provenance: "not_proven_by_git_revision" });
    } catch {
      // A disappearing or malformed Git object is not a recovery source.
    }
  }
  return { status: "available", candidates };
}

function safeRunFiles(root, runId) {
  const path = runPath(root, runId);
  const runDir = dirname(path);
  let rootStat;
  try { rootStat = lstatSync(root); } catch { throw new Error("AGDF_RUN_PATH_INVALID"); }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("AGDF_RUN_PATH_INVALID");
  for (const target of [join(root, ".agdf"), join(root, ".agdf", "control"), join(root, ".agdf", "control", "runs"), runDir, path]) {
    let stat;
    try { stat = lstatSync(target); } catch { throw new Error("AGDF_RUN_PATH_INVALID"); }
    if (stat.isSymbolicLink() || (target === path ? !stat.isFile() : !stat.isDirectory())) throw new Error("AGDF_RUN_PATH_INVALID");
  }
  return { path, runDir };
}

function artifactSnapshot(root, content) {
  const paths = listedArtefactPaths(content);
  const pending = new Set(pendingArtefactPaths(content));
  const entries = paths.map((path) => {
    const resolved = containedRegularFile(root, path);
    const status = hasSymlinkComponent(root, path) ? "invalid" : resolved.status;
    return { path, status, digest: status === "valid" ? artefactFileDigest(root, path) : status,
      ...(status === "missing" && pending.has(path) ? { planned: true } : {}) };
  });
  return entries;
}

function approvalSnapshot(content) {
  return ["Approvals", "Gate Checklist"].flatMap((section) => sectionTableRows(content, section)
    .filter(([gate]) => userGateOrder.includes(gate))
    .map(([gate, status = "", evidence = ""]) => ({ section, gate, status: status.replace(/^`|`$/gu, "").trim(), evidence: evidence.trim() })));
}

function parsedControlState(content, path) {
  return { path, content, ...parseControlState(content, {
    userGates: userGateOrder,
    internalSteps: [...internalStepArtefacts],
    closeoutArtefacts: [...closeoutArtefacts],
  }) };
}

function deriveNextGate(root, content, path) {
  const state = parsedControlState(content, path);
  return transitionDecisionForRunState(state).current_gate;
}

export function inspectRunRecovery(root, runId, { inspectHistory = true } = {}) {
  const { path } = safeRunFiles(root, runId);
  const content = readFileSync(path, "utf8");
  const state = parseRunState(content, runId);
  if (!state.valid) throw new Error("AGDF_RUN_STATE_INVALID");
  if (state.meta.lifecycle !== "active") throw new Error("AGDF_RECOVERY_LIFECYCLE_UNSUPPORTED");
  if (duplicateArtefactRowTypes(content).length) throw new Error("AGDF_ARTEFACT_ROW_DUPLICATE");
  const seal = runSealState(root, content);
  assertRecoveryOperationsTrusted(content);
  if (!["unsealed", "invalid"].includes(seal.status)) throw new Error("AGDF_RUN_RECOVERY_NOT_REQUIRED");
  const artefacts = artifactSnapshot(root, content);
  const gitHistory = inspectHistory ? gitHistoryCandidates(root, runId) : { status: "not_checked", candidates: [] };
  return Object.freeze({
    schema_version: "1", run_id: runId, revision: state.meta.revision,
    revision_id: state.meta.revision_id, seal_status: seal.status,
    content_digest: digestContent(content), artefacts,
    git_history: gitHistory,
    approvals: approvalSnapshot(content), approval_provenance: "no_independent_provenance",
    next_gate_if_recovered: deriveNextGate(root, unapproveRecoveryApprovals(content), path),
  });
}

function previewDirectory(runDir) {
  const path = join(runDir, "recovery-previews");
  try { mkdirSync(path, { mode: 0o700 }); } catch (error) { if (error.code !== "EEXIST") throw error; }
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("AGDF_RUN_PATH_INVALID");
  if (process.platform !== "win32" && (stat.mode & 0o077) !== 0) throw new Error("AGDF_RECOVERY_JOURNAL_PERMISSIONS_INVALID");
  return path;
}

function createJournal(path, record) {
  let fd;
  try {
    fd = openSync(path, "wx", 0o600);
    writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    fsyncSync(fd);
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export function previewRunRecovery(root, runId) {
  const inspection = inspectRunRecovery(root, runId);
  if (inspection.artefacts.some((entry) => entry.status !== "valid" && !entry.planned)) {
    throw new Error(inspection.artefacts.some((entry) => entry.status === "invalid")
      ? "AGDF_RECOVERY_ARTEFACT_PATH_INVALID" : "AGDF_RECOVERY_ARTEFACT_MISSING");
  }
  const { path, runDir } = safeRunFiles(root, runId);
  const source = readFileSync(path, "utf8");
  if (digestContent(source) !== inspection.content_digest) throw new Error("AGDF_STALE_RUN_REVISION");
  if (JSON.stringify(artifactSnapshot(root, source)) !== JSON.stringify(inspection.artefacts)) throw new Error("AGDF_STALE_RUN_REVISION");
  const previewId = randomUUID();
  const nextRevisionId = randomUUID();
  const candidate = unapproveRecoveryApprovals(source);
  const preview = {
    schema_version: "1", preview_format_version: 2, preview_id: previewId, run_id: runId,
    created_at: new Date().toISOString(),
    source_revision_id: inspection.revision_id, source_content_digest: inspection.content_digest,
    source_content: source,
    source_artefacts: inspection.artefacts, git_history: inspection.git_history,
    prior_approvals: inspection.approvals,
    approval_provenance: "no_independent_provenance", approvals_to_invalidate: userGateOrder,
    next_gate: inspection.next_gate_if_recovered, next_revision_id: nextRevisionId,
    candidate_content: candidate, candidate_digest: digestContent(candidate),
    phase: "prepared",
  };
  preview.preview_digest = recoveryPreviewDigest(preview);
  preview.confirmation = PREVIEW_CONFIRMATION(runId, previewId, preview.preview_digest);
  const dir = previewDirectory(runDir);
  const journalPath = join(dir, `${previewId}.json`);
  createJournal(journalPath, preview);
  return Object.freeze({
    schema_version: "1", outcome: "previewed", run_id: runId, preview_id: previewId,
    confirmation: preview.confirmation, source_content_digest: preview.source_content_digest,
    source_artefacts: preview.source_artefacts, git_history: preview.git_history,
    approvals_to_invalidate: preview.approvals_to_invalidate,
    approval_provenance: preview.approval_provenance, next_gate: preview.next_gate,
    journal: journalPath.slice(root.length + 1),
  });
}

function readPreview(root, runDir, runId, previewId) {
  if (!/^[0-9a-f-]{36}$/iu.test(previewId)) throw new Error("AGDF_RECOVERY_PREVIEW_INVALID");
  const dir = join(runDir, "recovery-previews");
  const dirStat = lstatSync(dir);
  if (dirStat.isSymbolicLink() || !dirStat.isDirectory()) throw new Error("AGDF_RUN_PATH_INVALID");
  const path = join(dir, `${previewId}.json`);
  const fileStat = lstatSync(path);
  if (fileStat.isSymbolicLink() || !fileStat.isFile()) throw new Error("AGDF_RECOVERY_PREVIEW_INVALID");
  const preview = JSON.parse(readFileSync(path, "utf8"));
  if (preview.preview_format_version !== undefined && preview.preview_format_version !== 2) {
    throw new Error("AGDF_RECOVERY_PREVIEW_VERSION_UNSUPPORTED");
  }
  if (preview.schema_version !== "1" || preview.preview_id !== previewId || preview.run_id !== runId
      || preview.preview_digest !== recoveryPreviewDigest(preview)
      || preview.confirmation !== PREVIEW_CONFIRMATION(runId, previewId, preview.preview_digest)
      || preview.source_content_digest !== digestContent(preview.source_content)
      || preview.candidate_digest !== digestContent(unapproveRecoveryApprovals(preview.source_content))
      || preview.candidate_content !== unapproveRecoveryApprovals(preview.source_content)
      || JSON.stringify(preview.prior_approvals) !== JSON.stringify(approvalSnapshot(preview.source_content))) {
    throw new Error("AGDF_RECOVERY_PREVIEW_INVALID");
  }
  return { path, preview };
}

export function applyRunRecovery(root, { runId, previewId, confirmation }, hooks = {}) {
  if (typeof confirmation !== "string") throw new Error("AGDF_RECOVERY_CONFIRMATION_REQUIRED");
  const { path, runDir } = safeRunFiles(root, runId);
  const { path: journalPath, preview } = readPreview(root, runDir, runId, previewId);
  if (confirmation !== preview.confirmation) throw new Error("AGDF_RECOVERY_CONFIRMATION_REQUIRED");
  return withRunLock(path, () => {
    const lockedPreview = readPreview(root, runDir, runId, previewId).preview;
    if (lockedPreview.preview_digest !== preview.preview_digest || lockedPreview.confirmation !== confirmation) {
      throw new Error("AGDF_RECOVERY_PREVIEW_INVALID");
    }
    Object.assign(preview, lockedPreview);
    const current = readFileSync(path, "utf8");
    const currentDigest = digestContent(current);
    if (JSON.stringify(artifactSnapshot(root, current)) !== JSON.stringify(preview.source_artefacts)) {
      throw new Error("AGDF_STALE_RUN_REVISION");
    }
    if (preview.phase === "committed") {
      const committed = parseRunState(current, runId);
      if (currentDigest !== preview.result_digest || runSealState(root, current).status !== "valid"
          || !committed.valid || committed.meta.revision_id !== preview.next_revision_id
          || preview.result_revision_id !== preview.next_revision_id) throw new Error("AGDF_RECOVERY_JOURNAL_CONFLICT");
      return Object.freeze({ schema_version: "1", outcome: "already_recovered", run_id: runId, preview_id: previewId, revision_id: preview.result_revision_id });
    }
    if (preview.phase !== "prepared" && preview.phase !== "applying") throw new Error("AGDF_RECOVERY_JOURNAL_PHASE_INVALID");
    if (preview.phase === "prepared" && (currentDigest !== preview.source_content_digest
        || current !== preview.source_content || JSON.stringify(artifactSnapshot(root, current)) !== JSON.stringify(preview.source_artefacts))) {
      throw new Error("AGDF_STALE_RUN_REVISION");
    }
    const parsedSource = parseRunState(preview.source_content, runId);
    if (!parsedSource.valid || parsedSource.meta.revision_id !== preview.source_revision_id) throw new Error("AGDF_RECOVERY_PREVIEW_INVALID");
    const expectedResultContent = recoveryRunContent(root, preview.candidate_content, {
      revision: parsedSource.meta.revision, nextRevisionId: preview.next_revision_id, updatedAt: preview.created_at,
    });
    const expectedResultDigest = digestContent(expectedResultContent);
    let written;
    if (preview.phase === "applying" && currentDigest === preview.result_digest
        && currentDigest === expectedResultDigest && runSealState(root, current).status === "valid") {
      written = parseRunState(current, runId);
    } else {
      if (preview.phase === "applying" && currentDigest !== preview.source_content_digest) throw new Error("AGDF_RECOVERY_JOURNAL_CONFLICT");
      const applying = { ...preview, phase: "applying", source_content: current,
        result_digest: expectedResultDigest, result_revision_id: preview.next_revision_id };
      atomicWrite(journalPath, `${JSON.stringify(applying, null, 2)}\n`);
      hooks.beforeRunWrite?.();
      written = writeRunRecoveryLocked(path, preview.candidate_content, {
        expectedContent: current, expectedRevisionId: preview.source_revision_id,
        nextRevisionId: preview.next_revision_id,
        updatedAt: preview.created_at,
      });
      hooks.afterRunWrite?.();
    }
    const resultContent = readFileSync(path, "utf8");
    const completed = { ...preview, phase: "committed", result_digest: digestContent(resultContent), result_revision_id: written.meta.revision_id };
    hooks.beforeJournalCommit?.();
    atomicWrite(journalPath, `${JSON.stringify(completed, null, 2)}\n`);
    return Object.freeze({ schema_version: "1", outcome: "recovered", run_id: runId,
      preview_id: previewId, revision: written.meta.revision, revision_id: written.meta.revision_id,
      seal_status: runSealState(root, resultContent).status, next_gate: deriveNextGate(root, resultContent, path) });
  });
}
