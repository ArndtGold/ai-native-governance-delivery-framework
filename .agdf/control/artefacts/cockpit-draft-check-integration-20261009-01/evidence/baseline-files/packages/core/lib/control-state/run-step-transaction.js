import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, readFileSync, unlinkSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseRunState } from "./run-state-parser.js";
import { artefactFileDigest, listedArtefactPaths, runSealState } from "./run-seal.js";
import { atomicWrite, withOwnedFileLock, writeRunLocked } from "./run-state-writer.js";
import { pendingRunStepPath } from "./run-step-pending.js";
import { readSourceRevisions, revisionHistoryPrefix } from "./run-source-revisions.js";
import { REVISION_ID_PATTERN } from "./run-identity.js";
import { DIGEST_PATTERN, exactObject, resolveControlCommandTarget } from "./approval-command-contract.js";
import { byteDigest, readHistoryBytes, validateRevisionHistory } from "./run-revision-history.js";
import { hasSymlinkComponent, isSafeControlRelativePath } from "./contained-file.js";
import { renameSyncWithRetry } from "../fs-swap.js";
import { fsyncDirectory } from "./run-state-writer.js";

const digest = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function recoveryError(runId, committedRevisionId) {
  const error = new Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  error.pending_run_id = runId;
  if (committedRevisionId) error.committed_revision_id = committedRevisionId;
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
  try {
    if (hasSymlinkComponent(root, `.agdf/control/runs/${runId}/RUN_STEP_PENDING.json`)) throw recoveryError(runId);
    journal = JSON.parse(checkedFile(path));
  } catch { throw recoveryError(runId); }
  if (![1, 2].includes(journal?.schema_version) || journal.run_id !== runId
      || typeof journal.old_run_digest !== "string" || typeof journal.old_revision_id !== "string"
      || typeof journal.next_revision_id !== "string" || typeof journal.operation_id !== "string"
      || (journal.backlog !== null && (typeof journal.backlog?.old !== "string" || typeof journal.backlog?.next !== "string"))
      || (journal.or !== null && (journal.or?.old !== null && typeof journal.or?.old !== "string"
        || typeof journal.or?.next !== "string"))) throw recoveryError(runId);
  if (journal.schema_version === 2 && (!exactObject(journal, ["schema_version", "run_id", "operation_id", "old_revision_id", "next_revision_id", "old_run_digest", "backlog", "or", "kind", "target_id", "request_digest", "preview_digest", "archive"])
      || journal.kind !== "source_revision" || journal.or !== null
      || ![journal.operation_id, journal.old_revision_id, journal.next_revision_id].every(value => REVISION_ID_PATTERN.test(value))
      || !/^[a-f0-9]{64}$/u.test(journal.old_run_digest)
      || journal.target_id !== resolveControlCommandTarget(root).target_id
      || ![journal.request_digest, journal.preview_digest].every(value => DIGEST_PATTERN.test(value))
      || !exactObject(journal.archive, ["path", "digest", "files", "sources"])
      || journal.archive.path !== `${revisionHistoryPrefix(runId, journal.operation_id)}manifest.json`
      || !DIGEST_PATTERN.test(journal.archive.digest)
      || !Array.isArray(journal.archive.files) || !journal.archive.files.length
      || journal.archive.files.some((name, i) => name !== `${i}.bin`)
      || !Array.isArray(journal.archive.sources) || journal.archive.sources.length !== journal.archive.files.length
      || journal.archive.sources.some(row => !exactObject(row, ["path", "digest"]) || !isSafeControlRelativePath(row.path)
        || !row.path.startsWith(".agdf/control/") || !DIGEST_PATTERN.test(row.digest))
      || new Set(journal.archive.sources.map(row => row.path)).size !== journal.archive.sources.length)) throw recoveryError(runId);
  return { path, journal };
}

// A journal embeds both Backlog versions; it is not an artefact JSON input. Keep its
// own strict transaction schema and contained-path checks for revision observations.
export function readPendingSourceRevisionJournal(root, runId) {
  const { journal } = journalState(root, runId);
  if (journal.schema_version !== 2) throw recoveryError(runId);
  return journal;
}

function archiveDirectories(root, journal) {
  const final = revisionHistoryPrefix(journal.run_id, journal.operation_id).slice(0, -1);
  const stage = `${final}.pending`;
  if (hasSymlinkComponent(root, final) || hasSymlinkComponent(root, stage)) throw recoveryError(journal.run_id);
  return { final: join(root, final), stage: join(root, stage) };
}

function discardOwnedArchive(root, journal) {
  const dirs = archiveDirectories(root, journal);
  for (const dir of [dirs.stage, dirs.final]) {
    if (!existsSync(dir)) continue;
    if (!lstatSync(dir).isDirectory() || lstatSync(dir).isSymbolicLink()) throw recoveryError(journal.run_id);
    const marker = checkedFile(join(dir, "OWNER.json"));
    if (marker !== JSON.stringify({ operation_id: journal.operation_id, manifest_digest: journal.archive.digest }) + "\n") throw recoveryError(journal.run_id);
    // Only the exact owned paths in the journal may be removed, never foreign additions.
    const allowed = new Set(["OWNER.json", "manifest.json", "files"]);
    if (readdirSync(dir).some(name => !allowed.has(name))) throw recoveryError(journal.run_id);
    if (existsSync(join(dir, "manifest.json")) && byteDigest(Buffer.from(checkedFile(join(dir, "manifest.json")))) !== journal.archive.digest) throw recoveryError(journal.run_id);
    const filesDir = join(dir, "files");
    if (existsSync(filesDir) && (!lstatSync(filesDir).isDirectory() || lstatSync(filesDir).isSymbolicLink()
        || readdirSync(filesDir).some(name => !journal.archive.files.includes(name) || !lstatSync(join(filesDir, name)).isFile() || lstatSync(join(filesDir, name)).isSymbolicLink()
          || byteDigest(readFileSync(join(filesDir, name))) !== journal.archive.sources[journal.archive.files.indexOf(name)].digest))) throw recoveryError(journal.run_id);
    rmSync(dir, { recursive: true }); fsyncDirectory(dirname(dir));
  }
}

function publishArchive(root, journal, history, afterWrite) {
  const dirs = archiveDirectories(root, journal);
  if (existsSync(dirs.final) || existsSync(dirs.stage)) throw recoveryError(journal.run_id);
  mkdirSync(dirname(dirs.final), { recursive: true });
  mkdirSync(dirs.stage);
  // Marker is the first owned file. An interruption before it exists remains unknown, not deleted.
  atomicWrite(join(dirs.stage, "OWNER.json"), JSON.stringify({ operation_id: journal.operation_id, manifest_digest: journal.archive.digest }) + "\n");
  mkdirSync(join(dirs.stage, "files")); afterWrite("archive_intent");
  for (const file of history.files) {
    if (byteDigest(readHistoryBytes(root, file.path)) !== file.digest) throw Error("AGDF_STALE_RUN_REVISION");
    atomicWrite(join(dirs.stage, "files", file.snapshot.split("/").at(-1)), file.bytes,
      { checkpoint: stage => afterWrite(`archive_${stage}`) });
    afterWrite("archive_file");
  }
  atomicWrite(join(dirs.stage, "manifest.json"), history.text);
  fsyncDirectory(join(dirs.stage, "files")); fsyncDirectory(dirs.stage);
  afterWrite("archive_synced"); renameSyncWithRetry(dirs.stage, dirs.final);
  fsyncDirectory(dirname(dirs.final)); afterWrite("archive_published");
}

// Called only while the selected Run lock and then the shared Backlog lock are held.
export function recoverPendingRunStepLocked(root, runId, { sourceRevision = false } = {}) {
  const path = pendingRunStepPath(root, runId);
  if (!existsSync(path)) return { status: "none" };
  const { journal } = journalState(root, runId);
  if (journal.schema_version === 2 && !sourceRevision) throw recoveryError(runId);
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
        || journal.schema_version === 2 && runSealState(root, runText).status !== "valid"
        || (journal.backlog && backlogText !== journal.backlog.old)) throw recoveryError(runId);
    if (journal.schema_version === 2) {
      if (journal.archive.sources.some(row => byteDigest(readHistoryBytes(root, row.path)) !== row.digest)) throw recoveryError(runId);
      discardOwnedArchive(root, journal);
    }
    if (journal.or) {
      if (orText !== journal.or.next && orText !== journal.or.old) throw recoveryError(runId);
      if (orText === journal.or.next) {
        if (journal.or.old === null) unlinkSync(orPath);
        else atomicWrite(orPath, journal.or.old);
      }
    }
    unlinkSync(path);
    if (journal.schema_version === 2) fsyncDirectory(dirname(path));
    return { status: "rolled_back", operation_id: journal.operation_id };
  }

  const committed = parseRunState(runText, runId);
  if (!committed.valid || committed.meta.revision_id !== journal.next_revision_id
      || runSealState(root, runText).status !== "valid"
      || (journal.or && orText !== journal.or.next)) throw recoveryError(runId);
  if (journal.schema_version === 2) {
    const receipt = readSourceRevisions(runText).receipts.find(row => row.operation_id === journal.operation_id);
    if (!receipt || receipt.archive.digest !== journal.archive.digest || receipt.target_id !== journal.target_id
        || receipt.previous_revision_id !== journal.old_revision_id || receipt.resulting_revision_id !== journal.next_revision_id
        || receipt.request_digest !== journal.request_digest || receipt.preview_digest !== journal.preview_digest
        || !validateRevisionHistory(root, receipt)) throw recoveryError(runId);
  }
  if (journal.backlog) {
    if (backlogText !== journal.backlog.old && backlogText !== journal.backlog.next) throw recoveryError(runId);
    if (backlogText === journal.backlog.old) atomicWrite(backlogPath, journal.backlog.next);
  }
  unlinkSync(path);
  if (journal.schema_version === 2) fsyncDirectory(dirname(path));
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
export function commitRunStepLocked(root, { runId, runPath, content, revisionId, expectedContent, backlog, or, afterWrite = () => {}, nextRevisionId = randomUUID(), writeOptions = {}, history }) {
  const path = pendingRunStepPath(root, runId);
  if (existsSync(path)) throw recoveryError(runId);
  const backlogPath = join(root, ".agdf", "control", "MASTER_BACKLOG.md");
  const orPath = join(root, ".agdf", "control", "artefacts", runId, "OR.md");
  if (checkedFile(runPath) !== expectedContent || (backlog && checkedFile(backlogPath) !== backlog.old)) {
    throw new Error("AGDF_STALE_RUN_REVISION");
  }
  const seal = runSealState(root, expectedContent);
  if (seal.status !== "valid" && !(seal.status === "content_changed" && writeOptions.allowContentChange)) throw new Error("AGDF_RUN_SEAL_INVALID");
  const listedBefore = listedArtefactPaths(expectedContent).map((artefact) =>
    [artefact, artefactFileDigest(root, artefact)]);
  const oldOr = or ? checkedFile(orPath) : null;
  const journal = {
    schema_version: history ? 2 : 1,
    run_id: runId,
    operation_id: history ? writeOptions.appendedRevision.operation_id : randomUUID(),
    old_revision_id: revisionId,
    next_revision_id: nextRevisionId,
    old_run_digest: digest(expectedContent),
    backlog: backlog ? { old: backlog.old, next: backlog.next } : null,
    or: or ? { old: oldOr, next: or } : null,
  };
  if (history) {
    journal.kind = "source_revision";
    journal.target_id = writeOptions.appendedRevision.target_id;
    journal.request_digest = writeOptions.appendedRevision.request_digest;
    journal.preview_digest = writeOptions.appendedRevision.preview_digest;
    journal.archive = { ...writeOptions.appendedRevision.archive,
      files: history.files.map(file => file.snapshot.split("/").at(-1)), sources: history.files.map(({ path, digest }) => ({ path, digest })) };
    // A pre-existing directory is not owned by this transaction, even with the same UUID.
    const dirs = archiveDirectories(root, journal);
    if (existsSync(dirs.final) || existsSync(dirs.stage)) throw Error("AGDF_REVISION_HISTORY_INVALID");
  }
  let committed = false;
  try {
    atomicWrite(path, `${JSON.stringify(journal)}\n`, history ? { checkpoint: stage => afterWrite(`intent_${stage}`) } : {});
    afterWrite("intent");
    if (history) publishArchive(root, journal, history, afterWrite);
    if (or) {
      atomicWrite(orPath, or);
      afterWrite("or");
    }
    const state = writeRunLocked(runPath, content, revisionId, {
      ...writeOptions,
      ...(history ? { checkpoint: stage => afterWrite(`run_${stage}`) } : {}),
      expectedContent, nextRevisionId, allowPendingTransaction: true, allowContentChange: true,
      validateBeforeWrite: () => {
        writeOptions.validateBeforeWrite?.();
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
      atomicWrite(backlogPath, backlog.next, history ? { checkpoint: stage => afterWrite(`backlog_${stage}`) } : {});
      afterWrite("backlog");
    }
    const recovered = recoverPendingRunStepLocked(root, runId, { sourceRevision: Boolean(history) });
    if (recovered.status !== "completed") throw recoveryError(runId);
    if (history) afterWrite("retired");
    return state;
  } catch (error) {
    // Atomic rename can commit before a durability checkpoint throws. Re-read the commit point;
    // retain its journal for existing recovery rather than claiming a pre-commit rollback.
    if (!committed) {
      if (!existsSync(path)) throw error;
      try {
        const current = checkedFile(runPath);
        committed = current !== null && parseRunState(current, runId).meta?.revision_id === nextRevisionId
          && runSealState(root, current).status === "valid";
      } catch { /* Unknown state remains recovery-required. */ }
    }
    if (!committed) {
      try {
        const recovered = recoverPendingRunStepLocked(root, runId, { sourceRevision: Boolean(history) });
        if (recovered.status === "rolled_back") throw error;
      } catch (recoveryFailure) {
        if (recoveryFailure === error) throw error;
        throw recoveryError(runId);
      }
    }
    throw recoveryError(runId, committed ? nextRevisionId : undefined);
  }
}
