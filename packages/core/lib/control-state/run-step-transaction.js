import { runDocumentPath, runEvidencePath, runControlPath } from './run-identity.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { bindInputResolution, resolutionRecord, resolutionRecordVersion, recordedInputResolution } from './input-resolution.js';
import { validOwnedOutputs, publishOwnedOutputs, recoverOwnedOutputs, ownedOutputText } from "./run-owned-outputs.js";
import { readRunOperations } from "./run-operations.js";
import { readApprovalOperations } from "./approval-operations.js";
import { readArtefactBindings } from "./artefact-bindings.js";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, readFileSync, unlinkSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseRunState } from "./run-state-parser.js";
import { artefactFileDigest, listedArtefactPaths, runSealState, computeRunSeals, canonicalRunText } from "./run-seal.js";
import { atomicWrite, withOwnedFileLock, writeRunLocked } from "./run-state-writer.js";
import { pendingRunStepPath, pendingRunStepIds } from "./run-step-pending.js";
import { readSourceRevisions, revisionHistoryPrefix } from "./run-source-revisions.js";
import { REVISION_ID_PATTERN } from "./run-identity.js";
import { DIGEST_PATTERN, exactObject, resolveControlCommandTarget, canonicalJson } from "./approval-command-contract.js";
import { byteDigest, readHistoryBytes, collectRevisionHistory, validateRevisionHistory, validateEarlyPrdHistory } from "./run-revision-history.js";
import { hasSymlinkComponent, isSafeControlRelativePath } from "./contained-file.js";
import { renameSyncWithRetry } from "../fs-swap.js";
import { fsyncDirectory } from "./run-state-writer.js";
import { readControlLayout, CURRENT_LAYOUT, withControlRecovery, markControlMutationEffect, currentControlMutationId, markControlMutationRollbackKnown } from './control-layout.js';

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

function invalidJournalArchive(journal, runId) {
  return !exactObject(journal.archive, ["path", "digest", "files", "sources"])
    || journal.archive.path !== `${revisionHistoryPrefix(runId, journal.operation_id)}manifest.json`
    || !DIGEST_PATTERN.test(journal.archive.digest) || !Array.isArray(journal.archive.files) || !journal.archive.files.length
    || journal.archive.files.some((name, i) => name !== `${i}.bin`)
    || !Array.isArray(journal.archive.sources) || journal.archive.sources.length !== journal.archive.files.length
    || journal.archive.sources.some(row => !exactObject(row, ["path", "digest"]) || !isSafeControlRelativePath(row.path)
      || !row.path.startsWith(".agdf/control/") || !DIGEST_PATTERN.test(row.digest))
    || new Set(journal.archive.sources.map(row => row.path)).size !== journal.archive.sources.length;
}

// The current journal owns the immutable staged proposal needed to reconstruct
// its archive after interruption. No caller-selected filesystem output is added.
function validJournalProposal(journal) {
  const p = journal.proposal_material;
  return exactObject(p, ['path', 'digest', 'content']) && typeof p.content === 'string' && Buffer.byteLength(p.content) <= 131072
    && p.digest === byteDigest(Buffer.from(canonicalRunText(p.content)))
    && p.path === runEvidencePath(journal.run_id, `EVIDENCE-${p.digest.slice(7)}.json`)
    && journal.archive.sources.some(row => row.path === p.path && row.digest === byteDigest(Buffer.from(p.content)));
}

export const RUN_TRANSACTION_VERSION = 7;
const commandKinds = ['step.record', 'ur_draft.replace', 'artefact.record', 'approval.record', 'presentation_decision.record', 'prd_revision.reopen', 'closeout.record', 'lifecycle_close.record'];
const sourceJournal = journal => resolutionRecordVersion(journal) === RUN_TRANSACTION_VERSION && journal.kind === 'source_revision';
const outputJournal = journal => resolutionRecordVersion(journal) === RUN_TRANSACTION_VERSION && commandKinds.includes(journal.kind);

function validJournalOutputs(journal) {
  if (!validOwnedOutputs(journal.run_id, journal.outputs)) return false;
  const paths = journal.outputs.map(row => row.path), doc = name => runDocumentPath(journal.run_id, name);
  if (journal.kind === 'ur_draft.replace') return paths.length === 1 && paths[0] === doc('UR.md');
  if (journal.kind === 'artefact.record') return paths.length === 1 && ['PRD.md', 'SD.md', 'TP.md', 'QA_REPORT.md'].some(name => paths[0] === doc(name));
  if (journal.kind === 'closeout.record') return paths.length === 1 && ['OR.md', 'VERIFIED_CHANGE.md'].some(name => paths[0] === doc(name));
  if (journal.kind === 'step.record') return paths.length <= 1 && !paths.includes(doc('OR.md'));
  return paths.length === 0;
}
function validJournal(root, journal, runId) {
  const source = journal.kind === 'source_revision', update = journal.kind === 'run.update';
  const fields = ['schema_version', 'run_id', 'operation_id', 'old_revision_id', 'next_revision_id', 'old_run_digest', 'kind', 'target_id', 'request_digest', 'outputs'];
  if (source) fields.push('preview_digest', 'archive', ...(Object.hasOwn(journal, 'proposal_material') ? ['proposal_material'] : []));
  else if (journal.kind === 'prd_revision.reopen') fields.push('archive');
  return exactObject(journal, fields) && journal.schema_version === RUN_TRANSACTION_VERSION && journal.run_id === runId
    && [journal.operation_id, journal.old_revision_id, journal.next_revision_id].every(value => REVISION_ID_PATTERN.test(value))
    && journal.old_revision_id !== journal.next_revision_id
    && /^[a-f0-9]{64}$/u.test(journal.old_run_digest) && DIGEST_PATTERN.test(journal.request_digest)
    && journal.target_id === resolveControlCommandTarget(root).target_id
    && (source || update || commandKinds.includes(journal.kind))
    && (source || update ? Array.isArray(journal.outputs) && journal.outputs.length === 0 : validJournalOutputs(journal))
    && (!source || DIGEST_PATTERN.test(journal.preview_digest))
    && (!(source || journal.kind === 'prd_revision.reopen') || !invalidJournalArchive(journal, runId))
    && (!Object.hasOwn(journal, 'proposal_material') || source && validJournalProposal(journal));
}
function journalState(root, runId, { readJournal } = {}) {
  const path = pendingRunStepPath(root, runId);
  let stored;
  try {
    if (hasSymlinkComponent(root, runControlPath(runId, 'RUN_STEP_PENDING.json'))) throw recoveryError(runId);
    stored = JSON.parse(readJournal ? readJournal(path) : checkedFile(path));
  } catch { throw recoveryError(runId); }
  const journal = resolutionRecord(stored);
  if (!journal || !validJournal(root, journal, runId)) throw recoveryError(runId);
  return { path, journal: stored };
}

// Read-only bounded observation; never rolls back, forwards or retires an intent.
export function readPendingRunStepJournal(root, runId, options = {}) {
  const { journal } = journalState(root, runId, options); return journal;
}

function sameInputResolution(first, second) {
  const a = recordedInputResolution(first), b = recordedInputResolution(second);
  return a !== null && b !== null && canonicalJson(a) === canonicalJson(b);
}
function currentReceiptMatches(journal, runText) {
  const sameResolution = record => sameInputResolution(journal, record);
  if (journal.kind === "artefact.record") {
    const r = readArtefactBindings(runText).receipts.find(row => row.operation.id === journal.operation_id);
    return r && r.operation.previous_revision_id === journal.old_revision_id && r.operation.resulting_revision_id === journal.next_revision_id
      && r.operation.request_digest === journal.request_digest && r.target_id === journal.target_id && sameResolution(r);
  }
  if (journal.kind === "approval.record") {
    const r = readApprovalOperations(runText).receipts.find(row => row.operation_id === journal.operation_id);
    return r && r.binding.expected_revision_id === journal.old_revision_id && r.effect.resulting_revision_id === journal.next_revision_id
      && r.request_digest === journal.request_digest && r.binding.target_id === journal.target_id && sameResolution(r);
  }
  const r = readRunOperations(runText).receipts.find(row => row.operation_id === journal.operation_id);
  return r && r.kind === journal.kind && r.expected_revision_id === journal.old_revision_id && r.effect.resulting_revision_id === journal.next_revision_id
    && r.request_digest === journal.request_digest && r.target_id === journal.target_id && sameResolution(r);
}

// The same current journal codec serves explicit source-revision observations.
export function readPendingSourceRevisionJournal(root, runId) {
  const { journal } = journalState(root, runId);
  if (!sourceJournal(journal)) throw recoveryError(runId);
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
  const tempSuffix = `.tmp-${journal.operation_id}`;
  const expected = collectRevisionHistory(root, journal.run_id, journal.operation_id, journal.archive.sources.map(row => row.path), { proposalMaterial: journal.proposal_material });
  if (expected.digest !== journal.archive.digest) throw recoveryError(journal.run_id);
  const partialMatches = (path, bytes) => {
    const stats = lstatSync(path);
    if (stats.isSymbolicLink() || !stats.isFile() || stats.size > bytes.length) return false;
    const observed = readFileSync(path);
    return observed.length <= bytes.length && bytes.subarray(0, observed.length).equals(observed);
  };
  for (const dir of [dirs.stage, dirs.final]) {
    if (!existsSync(dir)) continue;
    if (!lstatSync(dir).isDirectory() || lstatSync(dir).isSymbolicLink()) throw recoveryError(journal.run_id);
    const marker = checkedFile(join(dir, "OWNER.json"));
    if (marker !== JSON.stringify({ operation_id: journal.operation_id, manifest_digest: journal.archive.digest }) + "\n") throw recoveryError(journal.run_id);
    // Only the exact owned paths in the journal may be removed, never foreign additions.
    const allowed = new Set(["OWNER.json", "manifest.json", 'manifest.json' + tempSuffix, "files"]);
    if (readdirSync(dir).some(name => !allowed.has(name))) throw recoveryError(journal.run_id);
    if (existsSync(join(dir, "manifest.json")) && byteDigest(Buffer.from(checkedFile(join(dir, "manifest.json")))) !== journal.archive.digest) throw recoveryError(journal.run_id);
    if (existsSync(join(dir, 'manifest.json' + tempSuffix)) && !partialMatches(join(dir, 'manifest.json' + tempSuffix), Buffer.from(expected.text))) throw recoveryError(journal.run_id);
    const filesDir = join(dir, "files");
    if (existsSync(filesDir) && (!lstatSync(filesDir).isDirectory() || lstatSync(filesDir).isSymbolicLink()
        || readdirSync(filesDir).some(name => {
          const temporary = name.endsWith(tempSuffix), base = temporary ? name.slice(0, -tempSuffix.length) : name;
          const index = journal.archive.files.indexOf(base), path = join(filesDir, name);
          if (index < 0 || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) return true;
          return temporary ? !partialMatches(path, expected.files[index].bytes)
            : byteDigest(readFileSync(path)) !== journal.archive.sources[index].digest;
        }))) throw recoveryError(journal.run_id);
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
    if (byteDigest(journal.proposal_material?.path === file.path ? Buffer.from(journal.proposal_material.content) : readHistoryBytes(root, file.path)) !== file.digest) throw Error("AGDF_STALE_RUN_REVISION");
    atomicWrite(join(dirs.stage, "files", file.snapshot.split("/").at(-1)), file.bytes,
      { temporaryPath: join(dirs.stage, 'files', file.snapshot.split('/').at(-1) + `.tmp-${journal.operation_id}`),
        checkpoint: stage => afterWrite(`archive_${stage}`) });
    afterWrite("archive_file");
  }
  atomicWrite(join(dirs.stage, "manifest.json"), history.text,
    { temporaryPath: join(dirs.stage, 'manifest.json' + `.tmp-${journal.operation_id}`), checkpoint: stage => afterWrite(`manifest_${stage}`) });
  fsyncDirectory(join(dirs.stage, "files")); fsyncDirectory(dirs.stage);
  afterWrite("archive_synced"); renameSyncWithRetry(dirs.stage, dirs.final);
  fsyncDirectory(dirname(dirs.final)); afterWrite("archive_published");
}

// Called with the selected Run lock. Only current Run-owned intent is recoverable.
export function recoverPendingRunStepLocked(root, runId, { sourceRevision = false } = {}) {
  const path = pendingRunStepPath(root, runId);
  if (!existsSync(path)) return { status: "none" };
  const { journal } = journalState(root, runId);
  if (sourceJournal(journal) && !sourceRevision) throw recoveryError(runId);
  markControlMutationEffect();
  const runPath = join(dirname(dirname(path)), "RUN_STATE.md");
  const runText = checkedFile(runPath);
  if (runText === null) throw recoveryError(runId);

  if (digest(runText) === journal.old_run_digest) {
    const current = parseRunState(runText, runId);
    if (!current.valid || current.meta.revision_id !== journal.old_revision_id
        || sourceJournal(journal) && runSealState(root, runText).status !== "valid") throw recoveryError(runId);
    if (sourceJournal(journal) || journal.kind === "prd_revision.reopen") {
      if (journal.archive.sources.some(row => byteDigest(journal.proposal_material?.path === row.path ? Buffer.from(journal.proposal_material.content) : readHistoryBytes(root, row.path)) !== row.digest)) throw recoveryError(runId);
      discardOwnedArchive(root, journal);
    }
    if (outputJournal(journal)) {
      const original = computeRunSeals(root, runText, { artefactDigests: new Map(journal.outputs.map(row => [row.path,
        row.old === null ? "missing" : `sha256:${digest(canonicalRunText(row.old))}`])) });
      if (original.content_seal !== current.meta.content_seal || original.approval_seal !== current.meta.approval_seal
          || journal.outputs.some(row => { const value = ownedOutputText(root, runId, row.path); return value !== row.old && value !== row.next; })) throw recoveryError(runId);
      recoverOwnedOutputs(root, journal, false);
      if (runSealState(root, runText).status !== "valid") throw recoveryError(runId);
    }
    unlinkSync(path);
    fsyncDirectory(dirname(path));
    return { status: "rolled_back", operation_id: journal.operation_id };
  }

  const committed = parseRunState(runText, runId);
  if (!committed.valid || committed.meta.revision_id !== journal.next_revision_id
      || runSealState(root, runText).status !== "valid") throw recoveryError(runId);
  if (sourceJournal(journal)) {
    const receipt = readSourceRevisions(runText).receipts.find(row => row.operation_id === journal.operation_id);
    if (!receipt || receipt.archive.digest !== journal.archive.digest || receipt.target_id !== journal.target_id
        || receipt.previous_revision_id !== journal.old_revision_id || receipt.resulting_revision_id !== journal.next_revision_id
        || receipt.request_digest !== journal.request_digest || receipt.preview_digest !== journal.preview_digest
        || !sameInputResolution(journal, receipt) || !validateRevisionHistory(root, receipt)) throw recoveryError(runId);
  }
  if (outputJournal(journal)) {
    if (!currentReceiptMatches(journal, runText)) throw recoveryError(runId);
    recoverOwnedOutputs(root, journal, true);
    if (journal.kind === "prd_revision.reopen") {
      const receipt = readRunOperations(runText).receipts.find(row => row.operation_id === journal.operation_id);
      if (!receipt || receipt.effect.record.archive.digest !== journal.archive.digest || !validateEarlyPrdHistory(root, receipt)) throw recoveryError(runId);
    }
  }
  unlinkSync(path);
  fsyncDirectory(dirname(path));
  return { status: "completed", operation_id: journal.operation_id, revision_id: journal.next_revision_id };
}

// Independent Run-only journals have no shared output. Unknown journals stay fail-closed.
export function pendingRunStepConflictIds(root, runId) {
  return pendingRunStepIds(root).filter(id => {
    if (id === runId) return true;
    try { readPendingRunStepJournal(root, id); return false; }
    catch { return true; }
  });
}

export function withRunStepRecoveryLock(root, runId, work) {
  return withOwnedFileLock(join(root, '.agdf/control/runs', runId, 'RUN_STATE.md'), work);
}
export function recoverPendingRunStep(root, runId) {
  const path = join(root, '.agdf/control/runs', runId, 'RUN_STATE.md');
  return withRunStepRecoveryLock(root, runId, () => {
    if (!existsSync(pendingRunStepPath(root, runId))) return { status: 'none' };
    const pending = readPendingRunStepJournal(root, runId);
    return withControlRecovery(root, { resource: `run:${runId}`, operation_id: pending.operation_id,
      proveOutcome: result => ['completed', 'rolled_back'].includes(result.status) && runSealState(root, checkedFile(path)).status === 'valid' }, () => recoverPendingRunStepLocked(root, runId));
  });
}

// The Run revision is the commit point. The current journal binds exact owned
// outputs and the original normalized command through commit or rollback.
export function commitRunStepLocked(root, { runId, runPath, content, revisionId, expectedContent, afterWrite = () => {}, nextRevisionId = randomUUID(), writeOptions = {}, history, operationContext, outputs = [] }) {
  assertInputConfigurationCurrent(root);
  readControlLayout(root);
  const path = pendingRunStepPath(root, runId);
  if (existsSync(path)) throw recoveryError(runId);
  if (checkedFile(runPath) !== expectedContent) {
    throw new Error("AGDF_STALE_RUN_REVISION");
  }
  const seal = runSealState(root, expectedContent);
  if (seal.status !== "valid" && !(seal.status === "content_changed" && writeOptions.allowContentChange)) throw new Error("AGDF_RUN_SEAL_INVALID");
  const listedBefore = listedArtefactPaths(expectedContent).map((artefact) =>
    [artefact, artefactFileDigest(root, artefact)]);
  const journal = {
    schema_version: RUN_TRANSACTION_VERSION, run_id: runId,
    operation_id: operationContext?.operation_id ?? (history ? writeOptions.appendedRevision.operation_id : currentControlMutationId() ?? randomUUID()),
    old_revision_id: revisionId, next_revision_id: nextRevisionId, old_run_digest: digest(expectedContent),
    kind: operationContext?.kind ?? (history ? 'source_revision' : 'run.update'),
    target_id: operationContext?.target_id ?? resolveControlCommandTarget(root).target_id,
    request_digest: operationContext?.request_digest ?? writeOptions.appendedRevision?.request_digest
      ?? `sha256:${digest(canonicalJson({ expectedContent, content }))}`,
    outputs,
  };
  if (operationContext && (history && operationContext.kind !== 'prd_revision.reopen'
    || !validJournalOutputs(journal) || outputs.some(row => ownedOutputText(root, runId, row.path) !== row.old))) throw recoveryError(runId);
  if (history) {
    const receipt = writeOptions.appendedRevision ?? writeOptions.appendedOperation;
    if (!operationContext) {
      journal.kind = "source_revision";
      journal.target_id = receipt.target_id;
      journal.request_digest = receipt.request_digest;
      journal.preview_digest = receipt.preview_digest;
    }
    journal.archive = { ...(receipt.archive ?? receipt.effect.record.archive),
      files: history.files.map(file => file.snapshot.split("/").at(-1)), sources: history.files.map(({ path, digest }) => ({ path, digest })) };
    if (history.proposalMaterial) journal.proposal_material = history.proposalMaterial;
    if (invalidJournalArchive(journal, runId) || journal.proposal_material && !validJournalProposal(journal)) throw recoveryError(runId);
    // A pre-existing directory is not owned by this transaction, even with the same UUID.
    const dirs = archiveDirectories(root, journal);
    if (existsSync(dirs.final) || existsSync(dirs.stage)) throw Error("AGDF_REVISION_HISTORY_INVALID");
  }
  if (!validJournal(root, journal, runId)) throw recoveryError(runId);
  const controlDirectory = dirname(path);
  if (hasSymlinkComponent(root, runControlPath(runId, ''))) throw recoveryError(runId);
  if (!existsSync(controlDirectory)) { mkdirSync(controlDirectory); fsyncDirectory(dirname(controlDirectory)); }
  let committed = false;
  try {
    markControlMutationEffect();
    atomicWrite(path, `${JSON.stringify(bindInputResolution(journal))}\n`, history || operationContext ? { checkpoint: stage => afterWrite(`intent_${stage}`) } : {});
    afterWrite("intent");
    if (history) publishArchive(root, journal, history, afterWrite);
    if (operationContext) publishOwnedOutputs(root, journal, afterWrite);
    const state = writeRunLocked(runPath, content, revisionId, {
      ...writeOptions,
      ...(history || operationContext ? { checkpoint: stage => afterWrite(`run_${stage}`) } : {}),
      expectedContent, nextRevisionId, allowPendingTransaction: true, allowContentChange: true,
      validateBeforeWrite: () => {
        writeOptions.validateBeforeWrite?.();
        if (operationContext && outputs.some(row => ownedOutputText(root, runId, row.path) !== row.next)) throw recoveryError(runId);
        for (const [artefact, beforeDigest] of listedBefore) {
          if (artefact !== `${runDocumentPath(runId, '')}/OR.md` && !outputs.some(row => row.path === artefact)
              && artefactFileDigest(root, artefact) !== beforeDigest) throw recoveryError(runId);
        }
      },
    });
    committed = true;
    afterWrite("run");
    const recovered = recoverPendingRunStepLocked(root, runId, { sourceRevision: Boolean(history) });
    if (recovered.status !== "completed") throw recoveryError(runId);
    if (history || operationContext) afterWrite("retired");
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
        if (recovered.status === "rolled_back") { markControlMutationRollbackKnown(); throw error; }
      } catch (recoveryFailure) {
        if (recoveryFailure === error) throw error;
        throw recoveryError(runId);
      }
    }
    throw recoveryError(runId, committed ? nextRevisionId : undefined);
  }
}
