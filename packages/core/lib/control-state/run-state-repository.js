import { CURRENT_RUN_VERSION } from './run-identity.js';
import { canonicalRunDocument } from './run-state-document.js';
import { runDocumentPath, runHistoryPath } from './run-identity.js';
import { canonicalRunText, applyRunSeals, computeRunSeals } from './run-seal-compute.js';
import { createHash } from 'node:crypto';
import { hasSymlinkComponent } from './contained-file.js';
import {
  closeSync,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { renameSyncWithRetry } from "../fs-swap.js";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { assertCanonicalRunStore, canonicalScaffoldRequired, directoryIdentity, regularFileSnapshot } from "./run-store-inspection.js";
import { parseRunState } from "./run-state-parser.js";
import { runPath } from "./run-state-reader.js";
import { sealRunState } from "./run-seal-compute.js";
import { fsyncDirectory, withOwnedFileLock } from './run-state-writer.js';
import { readControlLayout, CURRENT_LAYOUT, withControlMutation, markControlMutationEffect, markControlMutationRollbackKnown } from './control-layout.js';

export { discoverRuns, runPath } from "./run-state-reader.js";


function sameDirectory(identity, path = identity.path) {
  try {
    const current = directoryIdentity(path);
    return current.realpath === identity.realpath
      && current.dev === identity.dev
      && current.ino === identity.ino;
  } catch {
    return false;
  }
}

function sameRegularFile(snapshot, path = snapshot.path, content = snapshot.content) {
  try {
    const current = regularFileSnapshot(path);
    return current.dev === snapshot.dev
      && current.ino === snapshot.ino
      && (content === undefined || current.content.equals(content));
  } catch {
    return false;
  }
}

function sameCanonicalRunStore(snapshot) {
  return snapshot.directories.every((identity) => sameDirectory(identity))
    && snapshot.files.every((file) => sameRegularFile(file));
}

function writeNewRunState(path, content) {
  let descriptor;
  let identity;
  try {
    descriptor = openSync(path, "wx");
    const stats = fstatSync(descriptor);
    identity = Object.freeze({ path, dev: stats.dev, ino: stats.ino });
    writeFileSync(descriptor, content, "utf8");
    fsyncSync(descriptor);
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    if (identity && sameRegularFile(identity, path, undefined)) {
      try {
        unlinkSync(path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") throw cleanupError;
      }
    }
    throw error;
  }
  closeSync(descriptor);
  const snapshot = Object.freeze({ ...identity, content: Buffer.from(content, "utf8") });
  if (!sameRegularFile(snapshot)) {
    throw Error("AGDF_RUN_STAGE_INVALID");
  }
  return snapshot;
}

function cleanupRunStage(stageIdentity, stagedFile) {
  if (stagedFile && sameRegularFile(stagedFile)) {
    try {
      unlinkSync(stagedFile.path);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (!sameDirectory(stageIdentity)) return;
  try {
    rmdirSync(stageIdentity.path);
  } catch (error) {
    if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error;
  }
}

function ensureStagedRunUnchanged(stageIdentity, stagedFile) {
  if (!sameDirectory(stageIdentity) || !sameRegularFile(stagedFile)) {
    throw Error("AGDF_RUN_STAGE_INVALID");
  }
}

function creationOutputs(id, outputs = []) {
  if (!Array.isArray(outputs) || outputs.length !== 0 && outputs.length !== 2) throw Error('AGDF_RUN_STAGE_INVALID');
  const expected = [runDocumentPath(id, 'UR.md'), runHistoryPath(id, 'planning/UR.md')];
  if (outputs.some((row, i) => row.path !== expected[i] || typeof row.content !== 'string'
    || Buffer.byteLength(row.content) > 131072) || outputs.length && outputs[0].content !== outputs[1].content)
    throw Error('AGDF_RUN_STAGE_INVALID');
  return outputs;
}
const outputDigests = outputs => new Map(outputs.map(row => [row.path,
  'sha256:' + createHash('sha256').update(canonicalRunText(row.content)).digest('hex')]));
function stageOutputPath(stage, id, path) {
  return join(stage, path.slice(`.agdf/control/runs/${id}/`.length));
}
function inspectCreationOutputs(stage, id, outputs, { partial = false } = {}) {
  const files = ['RUN_STATE.md', ...outputs.map(row => row.path.slice(`.agdf/control/runs/${id}/`.length))];
  const directories = new Set(files.flatMap(name => name.split('/').slice(0, -1).map((_, i, parts) => parts.slice(0, i + 1).join('/'))));
  const visit = (relative = '') => {
    for (const name of readdirSync(join(stage, relative))) {
      const path = [relative, name].filter(Boolean).join('/'), stat = lstatSync(join(stage, path));
      if (stat.isSymbolicLink()) throw Error('AGDF_RUN_STALE_STAGE');
      if (stat.isDirectory() && directories.has(path)) visit(path);
      else if (!stat.isFile() || !files.includes(path)) throw Error('AGDF_RUN_STALE_STAGE');
    }
  };
  visit();
  for (const row of outputs) {
    const path = stageOutputPath(stage, id, row.path);
    if (partial && !existsSync(path)) continue;
    const bytes = regularFileSnapshot(path).content, expected = Buffer.from(row.content);
    if (partial ? bytes.length > expected.length || !expected.subarray(0, bytes.length).equals(bytes) : !expected.equals(bytes))
      throw Error('AGDF_RUN_STALE_STAGE');
  }
}

function retireCreationOutputs(stage, id, outputs) {
  // Retire only exact known bytes. Unknown siblings keep the stage recoverable.
  inspectCreationOutputs(stage, id, outputs, { partial: true });
  for (const row of outputs) if (existsSync(stageOutputPath(stage, id, row.path))) unlinkSync(stageOutputPath(stage, id, row.path));
  const directories = [...new Set(outputs.flatMap(row => {
    const parts = row.path.slice(`.agdf/control/runs/${id}/`.length).split('/').slice(0, -1);
    return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
  }))].sort((a, b) => b.length - a.length);
  for (const path of directories) if (existsSync(join(stage, path))) rmdirSync(join(stage, path));
}

const DEFAULT_BODY = `## Objective

Describe the trustworthy outcome.

## Mode/Slice Decision

- scope_reason:
- evidence:

## Relationships

| From | Relationship | To | Evidence |
|---|---|---|---|

## Closeout

- quality_outlook:
`;
export function renderRunState(id, body = DEFAULT_BODY, meta = {}) {
  return canonicalRunDocument(`# AGDF Run State\n\n## Run Meta\n\n- control_state_version: ${meta.control_state_version ?? CURRENT_RUN_VERSION}\n- run_id: ${id}\n- lifecycle: ${meta.lifecycle ?? "active"}\n- revision: 1\n- revision_id: ${randomUUID()}\n- updated_at: ${meta.updated_at ?? new Date().toISOString()}\n- mode: ${meta.mode ?? "undecided"}\n- owner: ${meta.owner ?? "agent"}\n\n${body}`);
}
export function createRun(root, id, body = DEFAULT_BODY, hooks = {}) {
  // Directory publication remains the creation commit point. The independent
  // admission is retained through all staged output and durability checks.
  runPath(root, id);
  const store = assertCanonicalRunStore(root);
  return withOwnedFileLock(join(store.path, `.direct-create-${id}`), () => withControlMutation(root, { resource: `run.create:${id}` }, () => createRunAdmitted(root, id, body, hooks)));
}
function createRunAdmitted(root, id, body, hooks) {
  const outputs = creationOutputs(id, hooks.outputs);
  const path = runPath(root, id);
  const runStore = assertCanonicalRunStore(root);
  const runDirectory = dirname(path);
  const parent = dirname(runDirectory);
  if (parent !== runStore.path) throw canonicalScaffoldRequired(root, runStore.path);
  if (existsSync(runDirectory)) throw Error("AGDF_RUN_COLLISION");
  const stagePrefix = `.run-stage-${id}-`;
  const staleStage = readdirSync(runStore.path).find((name) => name.startsWith(stagePrefix));
  if (staleStage) throw Error(`AGDF_RUN_STALE_STAGE: ${join(runStore.path, staleStage)}`);
  const stageDirectory = join(runStore.path, `${stagePrefix}${randomUUID()}`);
  const stagedPath = join(stageDirectory, "RUN_STATE.md");
  markControlMutationEffect();
  mkdirSync(stageDirectory);
  const stageIdentity = directoryIdentity(stageDirectory);
  let stagedFile;
  try {
    hooks.beforeWrite?.({ root, id, path: stagedPath });
      readControlLayout(root);
      const initial = renderRunState(id, body);
      const prepared = hooks.prepare ? hooks.prepare(initial) : initial;
      const rendered = applyRunSeals(prepared, computeRunSeals(root, prepared, { artefactDigests: outputDigests(outputs) }));
    stagedFile = writeNewRunState(stagedPath, rendered);
    for (const row of outputs) {
      const file = stageOutputPath(stageDirectory, id, row.path);
      const relative = row.path.slice(`.agdf/control/runs/${id}/`.length);
      if (hasSymlinkComponent(stageDirectory, relative)) throw Error('AGDF_RUN_STAGE_INVALID');
      mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
      if (hasSymlinkComponent(stageDirectory, relative)) throw Error('AGDF_RUN_STAGE_INVALID');
      writeNewRunState(file, row.content);
      for (let directory = dirname(file); directory !== stageDirectory; directory = dirname(directory)) fsyncDirectory(directory);
      hooks.checkpoint?.(`handoff_output_${row.path.endsWith('history/planning/UR.md') ? 'snapshot' : 'UR.md'}`);
    }
    fsyncDirectory(stageDirectory);
    inspectCreationOutputs(stageDirectory, id, outputs);
    hooks.beforePublish?.({ root, id, path, stageDirectory });
    if (!sameCanonicalRunStore(runStore)) {
      throw Error("AGDF_RUN_TARGET_DRIFT");
    }
    ensureStagedRunUnchanged(stageIdentity, stagedFile);
    if (existsSync(runDirectory)) throw Error("AGDF_RUN_COLLISION");
    // Windows scanners briefly lock fresh files; the same bounded retry as the marketplace swap.
    renameSyncWithRetry(stageDirectory, runDirectory);
    fsyncDirectory(runStore.path);
    return path;
  } catch (error) {
    // Interrupted or partial owned outputs are retained for original-intent
    // recovery; ordinary creation without outputs keeps its existing rollback.
    if (outputs.length && existsSync(stageDirectory)) throw error;
    cleanupRunStage(stageIdentity, stagedFile);
    if (!existsSync(runDirectory) && !existsSync(stageDirectory)) markControlMutationRollbackKnown(`run.create:${id}`);
    throw error;
  }
}

// Recovery is confined to a single original creation identity under its store lock.
// The creation owner must verify the staged sealed receipt and exact request first.
export function recoverRunCreationStage(root, id, validate, { inspectOnly = false, discard = false, outputs: suppliedOutputs } = {}) {
  const outputs = creationOutputs(id, suppliedOutputs);
  const store = assertCanonicalRunStore(root, { historicalRead: inspectOnly }), destination = dirname(runPath(root, id));
  const stages = readdirSync(store.path).filter(name => name.startsWith(`.run-stage-${id}-`));
  if (!stages.length) return null;
  if (stages.length !== 1 || existsSync(destination)) throw Error('AGDF_RUN_STALE_STAGE');
  const directory = join(store.path, stages[0]), stage = directoryIdentity(directory);
  inspectCreationOutputs(directory, id, outputs, { partial: discard });
  const file = regularFileSnapshot(join(directory, 'RUN_STATE.md'));
  const receipt = validate(file.content.toString('utf8'), { staged: true, artefactDigests: outputDigests(outputs) });
  if (!sameCanonicalRunStore(store)) throw Error('AGDF_RUN_TARGET_DRIFT');
  ensureStagedRunUnchanged(stage, file);
  if (inspectOnly) return receipt;
  if (discard) {
    if (outputs.length) retireCreationOutputs(directory, id, outputs);
    cleanupRunStage(stage, file);
    if (existsSync(directory)) throw Error('AGDF_RUN_STALE_STAGE');
    fsyncDirectory(store.path);
    return receipt;
  }
  renameSyncWithRetry(directory, destination);
  fsyncDirectory(store.path);
  return receipt;
}
