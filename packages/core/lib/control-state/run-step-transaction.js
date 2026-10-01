import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseRunState } from "./run-state-parser.js";
import { artefactFileDigest, listedArtefactPaths, runSealState } from "./run-seal.js";
import { atomicWrite, withOwnedFileLock, writeRunLocked } from "./run-state-writer.js";
import { pendingRunStepPath } from "./run-step-pending.js";

const digest = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function recoveryError(runId) {
  const error = new Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  error.pending_run_id = runId;
  return error;
}

function checkedFile(path) {
  if (!existsSync(path)) return null;
  const type = lstatSync(path);
  if (type.isSymbolicLink() || !type.isFile()) throw new Error("AGDF_RUN_PATH_INVALID");
  return readFileSync(path, "utf8");
}

function journalState(root, runId) {
  const path = pendingRunStepPath(root, runId);
  let journal;
  try { journal = JSON.parse(readFileSync(path, "utf8")); } catch { throw recoveryError(runId); }
  if (journal?.schema_version !== 1 || journal.run_id !== runId
      || typeof journal.old_run_digest !== "string" || typeof journal.old_revision_id !== "string"
      || typeof journal.next_revision_id !== "string" || typeof journal.operation_id !== "string"
      || (journal.backlog !== null && (typeof journal.backlog?.old !== "string" || typeof journal.backlog?.next !== "string"))
      || (journal.or !== null && (journal.or?.old !== null && typeof journal.or?.old !== "string"
        || typeof journal.or?.next !== "string"))) throw recoveryError(runId);
  return { path, journal };
}

// Called only while the selected Run lock and then the shared Backlog lock are held.
export function recoverPendingRunStepLocked(root, runId) {
  const path = pendingRunStepPath(root, runId);
  if (!existsSync(path)) return { status: "none" };
  const { journal } = journalState(root, runId);
  const runPath = join(dirname(path), "RUN_STATE.md");
  const backlogPath = join(root, ".agdf", "control", "MASTER_BACKLOG.md");
  const orPath = join(root, ".agdf", "control", "artefacts", runId, "OR.md");
  const runText = checkedFile(runPath);
  const backlogText = journal.backlog ? checkedFile(backlogPath) : null;
  const orText = journal.or ? checkedFile(orPath) : null;
  if (runText === null) throw recoveryError(runId);

  if (digest(runText) === journal.old_run_digest) {
    const current = parseRunState(runText, runId);
    if (!current.valid || current.meta.revision_id !== journal.old_revision_id
        || (journal.backlog && backlogText !== journal.backlog.old)) throw recoveryError(runId);
    if (journal.or) {
      if (orText !== journal.or.next && orText !== journal.or.old) throw recoveryError(runId);
      if (orText === journal.or.next) {
        if (journal.or.old === null) unlinkSync(orPath);
        else atomicWrite(orPath, journal.or.old);
      }
    }
    unlinkSync(path);
    return { status: "rolled_back", operation_id: journal.operation_id };
  }

  const committed = parseRunState(runText, runId);
  if (!committed.valid || committed.meta.revision_id !== journal.next_revision_id
      || runSealState(root, runText).status !== "valid"
      || (journal.or && orText !== journal.or.next)) throw recoveryError(runId);
  if (journal.backlog) {
    if (backlogText !== journal.backlog.old && backlogText !== journal.backlog.next) throw recoveryError(runId);
    if (backlogText === journal.backlog.old) atomicWrite(backlogPath, journal.backlog.next);
  }
  unlinkSync(path);
  return { status: "completed", operation_id: journal.operation_id, revision_id: journal.next_revision_id };
}

export function recoverPendingRunStep(root, runId) {
  const runPath = join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md");
  const backlogPath = join(root, ".agdf", "control", "MASTER_BACKLOG.md");
  return withOwnedFileLock(runPath, () => withOwnedFileLock(backlogPath,
    () => recoverPendingRunStepLocked(root, runId)));
}

// Called only with both locks held. The Run revision is the commit point; the journal lets a
// retry restore OR before it or finish Backlog after it without inventing another authority.
export function commitRunStepLocked(root, { runId, runPath, content, revisionId, expectedContent, backlog, or, afterWrite = () => {} }) {
  const path = pendingRunStepPath(root, runId);
  if (existsSync(path)) throw recoveryError(runId);
  const backlogPath = join(root, ".agdf", "control", "MASTER_BACKLOG.md");
  const orPath = join(root, ".agdf", "control", "artefacts", runId, "OR.md");
  if (checkedFile(runPath) !== expectedContent || (backlog && checkedFile(backlogPath) !== backlog.old)) {
    throw new Error("AGDF_STALE_RUN_REVISION");
  }
  if (runSealState(root, expectedContent).status !== "valid") throw new Error("AGDF_RUN_SEAL_INVALID");
  const listedBefore = listedArtefactPaths(expectedContent).map((artefact) =>
    [artefact, artefactFileDigest(root, artefact)]);
  const oldOr = or ? checkedFile(orPath) : null;
  const nextRevisionId = randomUUID();
  const journal = {
    schema_version: 1,
    run_id: runId,
    operation_id: randomUUID(),
    old_revision_id: revisionId,
    next_revision_id: nextRevisionId,
    old_run_digest: digest(expectedContent),
    backlog: backlog ? { old: backlog.old, next: backlog.next } : null,
    or: or ? { old: oldOr, next: or } : null,
  };
  atomicWrite(path, `${JSON.stringify(journal)}\n`);
  let committed = false;
  try {
    afterWrite("intent");
    if (or) {
      atomicWrite(orPath, or);
      afterWrite("or");
    }
    const state = writeRunLocked(runPath, content, revisionId, {
      expectedContent, nextRevisionId, allowPendingTransaction: true, allowContentChange: true,
      validateBeforeWrite: () => {
        if (backlog && checkedFile(backlogPath) !== backlog.old) throw recoveryError(runId);
        if (or && checkedFile(orPath) !== or) throw recoveryError(runId);
        for (const [artefact, beforeDigest] of listedBefore) {
          if (artefact !== `.agdf/control/artefacts/${runId}/OR.md`
              && artefactFileDigest(root, artefact) !== beforeDigest) throw recoveryError(runId);
        }
      },
    });
    committed = true;
    afterWrite("run");
    if (backlog) {
      if (checkedFile(backlogPath) !== backlog.old) throw recoveryError(runId);
      atomicWrite(backlogPath, backlog.next);
      afterWrite("backlog");
    }
    const recovered = recoverPendingRunStepLocked(root, runId);
    if (recovered.status !== "completed") throw recoveryError(runId);
    return state;
  } catch (error) {
    if (!committed) {
      try {
        const recovered = recoverPendingRunStepLocked(root, runId);
        if (recovered.status === "rolled_back") throw error;
      } catch (recoveryFailure) {
        if (recoveryFailure === error) throw error;
        throw recoveryError(runId);
      }
    }
    throw recoveryError(runId);
  }
}
