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
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { doctorRequiredFiles } from "../control-evaluation/required-files.js";
import { parseRunState } from "./run-state-parser.js";
import { runPath } from "./run-state-reader.js";

export { discoverRuns, runPath } from "./run-state-reader.js";

function canonicalScaffoldRequired(root, path) {
  const error = new Error(
    `AGDF_CANONICAL_SCAFFOLD_REQUIRED: ${path}. Run init with the same explicit --dir before run-create.`,
  );
  error.code = "AGDF_CANONICAL_SCAFFOLD_REQUIRED";
  error.root = root;
  error.path = path;
  return error;
}

function directoryIdentity(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw Error("invalid directory");
  return Object.freeze({ path, realpath: realpathSync(path), dev: stats.dev, ino: stats.ino });
}

function regularFileSnapshot(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isFile()) throw Error("invalid file");
  return Object.freeze({ path, dev: stats.dev, ino: stats.ino, content: readFileSync(path) });
}

function assertCanonicalRunStore(root) {
  const directoryPaths = [
    root,
    join(root, ".agdf"),
    join(root, ".agdf", "control"),
    join(root, ".agdf", "control", "runs"),
  ];
  const directories = [];
  for (const path of directoryPaths) {
    try {
      directories.push(directoryIdentity(path));
    } catch (error) {
      if (error?.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED") throw error;
      throw canonicalScaffoldRequired(root, path);
    }
  }
  const requiredPaths = [...new Set([
    join(".agdf", "control", "config.json"),
    join(".agdf", "control", "README.md"),
    ...doctorRequiredFiles.filter((path) => !path.endsWith("AGDF_RUN.md")),
  ])];
  const files = [];
  for (const relativePath of requiredPaths) {
    const path = join(root, relativePath);
    try {
      files.push(regularFileSnapshot(path));
    } catch (error) {
      if (error?.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED") throw error;
      throw canonicalScaffoldRequired(root, path);
    }
  }
  return Object.freeze({
    root,
    path: directoryPaths.at(-1),
    directories: Object.freeze(directories),
    files: Object.freeze(files),
  });
}

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

const DEFAULT_BODY = `## Objective\n\nDescribe the trustworthy outcome.\n\n## Current Control State\n\n| Question | Answer |\n|---|---|\n| What is known? | New run created. |\n| What is approved? | Nothing yet. |\n| What is missing? | Durable UR and exact approval. |\n| What is the next allowed action? | Draft the UR. |\n| What is explicitly forbidden right now? | Later artefacts and implementation. |\n\n## Evidence\n\n| Evidence | Source | Covers | Strength |\n|---|---|---|---|\n| Run creation | run-create | Control initialization | direct |\n\n## Closeout\n\n- next_allowed_action: Draft the UR.\n- quality_outlook: Establish evidence before later gates.\n`;
export function renderRunState(id, body = DEFAULT_BODY, meta = {}) {
  return `# AGDF Run State\n\n## Run Meta\n\n- control_state_version: 2\n- run_id: ${id}\n- lifecycle: ${meta.lifecycle ?? "active"}\n- revision: 1\n- revision_id: ${randomUUID()}\n- mode: ${meta.mode ?? "structured_delivery"}\n- current_gate: ${meta.current_gate ?? "UR"}\n- decision: ${meta.decision ?? "in_progress"}\n- owner: ${meta.owner ?? "agent"}\n\n${body}`;
}
export function createRun(root, id, body = "", hooks = {}) {
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
  mkdirSync(stageDirectory);
  const stageIdentity = directoryIdentity(stageDirectory);
  let stagedFile;
  try {
    hooks.beforeWrite?.({ root, id, path: stagedPath });
    const rendered = renderRunState(id, body);
    stagedFile = writeNewRunState(stagedPath, rendered);
    hooks.beforePublish?.({ root, id, path, stageDirectory });
    if (!sameCanonicalRunStore(runStore)) {
      throw Error("AGDF_RUN_TARGET_DRIFT");
    }
    ensureStagedRunUnchanged(stageIdentity, stagedFile);
    if (existsSync(runDirectory)) throw Error("AGDF_RUN_COLLISION");
    renameSync(stageDirectory, runDirectory);
    return path;
  } catch (error) {
    cleanupRunStage(stageIdentity, stagedFile);
    throw error;
  }
}
