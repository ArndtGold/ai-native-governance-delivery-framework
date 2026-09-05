import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fstatSync,
  fsyncSync,
  linkSync,
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
import { basename, dirname, isAbsolute, join } from "node:path";
import { parseRunState, RUN_ID_PATTERN } from "../control-state/run-state-parser.js";

const CONTROL_PREFIX = ".agdf/control/";
const LEGACY_LIVE_RUN = "AGDF_RUN.md";
const STAGE_PREFIX = ".control-stage-";
const STAGE_MARKER = ".agdf-canonical-init-stage.json";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class CanonicalInitError extends Error {
  constructor(code, path = "") {
    super(path ? `${code}: ${path}` : code);
    this.name = "CanonicalInitError";
    this.code = code;
    this.path = path;
  }
}

function normalizedPlan(files) {
  if (!Array.isArray(files) || files.length === 0) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_INVALID");
  const seen = new Set();
  return files.map((file) => {
    const path = String(file?.path ?? "").replaceAll("\\", "/");
    if (!path.startsWith(CONTROL_PREFIX) || isAbsolute(path) || path.includes("\0")) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_INVALID", path);
    }
    const relativePath = path.slice(CONTROL_PREFIX.length);
    const parts = relativePath.split("/");
    if (!relativePath || parts.some((part) => !part || part === "." || part === "..") || typeof file.content !== "string") {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_INVALID", path);
    }
    if (relativePath === LEGACY_LIVE_RUN) throw new CanonicalInitError("AGDF_CANONICAL_INIT_LEGACY_AUTHORITY_FORBIDDEN", path);
    if (relativePath === STAGE_MARKER || relativePath === "runs" || relativePath.startsWith("runs/")) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_INVALID", path);
    }
    if (seen.has(relativePath)) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_DUPLICATE", path);
    seen.add(relativePath);
    return Object.freeze({ ...file, path, relativePath, content: file.content });
  });
}

function directoryIdentity(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PATH_INVALID", path);
  return Object.freeze({ path, realpath: realpathSync(path), dev: stats.dev, ino: stats.ino });
}

function sameDirectory(identity, path = identity.path) {
  try {
    const current = directoryIdentity(path);
    return current.realpath === identity.realpath && current.dev === identity.dev && current.ino === identity.ino;
  } catch {
    return false;
  }
}

function sameDirectoryEntry(identity, path) {
  try {
    const stats = lstatSync(path);
    return !stats.isSymbolicLink()
      && stats.isDirectory()
      && stats.dev === identity.dev
      && stats.ino === identity.ino;
  } catch {
    return false;
  }
}

function regularFileIdentity(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_PATH_INVALID", path);
  }
  return Object.freeze({ path, dev: stats.dev, ino: stats.ino });
}

function sameRegularFile(identity, path = identity.path, expectedContent) {
  try {
    const current = regularFileIdentity(path);
    return current.dev === identity.dev
      && current.ino === identity.ino
      && (expectedContent === undefined || readFileSync(path, "utf8") === expectedContent);
  } catch {
    return false;
  }
}

function writeOwnedFile(path, content, ownership) {
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
    if (identity && sameRegularFile(identity, path)) {
      try {
        unlinkSync(path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") throw cleanupError;
      }
    }
    throw error;
  }
  closeSync(descriptor);
  if (!sameRegularFile(identity, path, content)) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", path);
  }
  const ownedFile = Object.freeze({ ...identity, content });
  ownership.files.push(ownedFile);
  return ownedFile;
}

function createOwnedDirectory(path, ownership) {
  mkdirSync(path);
  const identity = directoryIdentity(path);
  ownership.directories.push(identity);
  return identity;
}

function identityKey(identity) {
  return `${identity.path}\0${identity.dev}\0${identity.ino}`;
}

function sameOwnershipSnapshot(before, after) {
  const beforeDirectories = before.directories.map(identityKey).sort();
  const afterDirectories = after.directories.map(identityKey).sort();
  const beforeFiles = before.files.map(identityKey).sort();
  const afterFiles = after.files.map(identityKey).sort();
  return JSON.stringify(beforeDirectories) === JSON.stringify(afterDirectories)
    && JSON.stringify(beforeFiles) === JSON.stringify(afterFiles);
}

function cleanupOwnedTree(ownership) {
  let removed = true;
  for (const file of [...ownership.files].sort((left, right) => right.path.length - left.path.length)) {
    if (!sameRegularFile(file, file.path, file.content)) {
      if (existsSync(file.path)) removed = false;
      continue;
    }
    try {
      unlinkSync(file.path);
    } catch (error) {
      if (error.code !== "ENOENT") removed = false;
    }
  }
  for (const directory of [...ownership.directories].sort((left, right) => right.path.length - left.path.length)) {
    if (!sameDirectory(directory, directory.path)) {
      if (existsSync(directory.path)) removed = false;
      continue;
    }
    try {
      rmdirSync(directory.path);
    } catch (error) {
      if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error;
      if (error.code !== "ENOENT") removed = false;
    }
  }
  return removed;
}

function cleanupCreatedAgdf(createdAgdf, agdfIdentity, agdfPath) {
  if (!createdAgdf || !sameDirectory(agdfIdentity, agdfPath)) return;
  try {
    rmdirSync(agdfPath);
  } catch (error) {
    if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error;
  }
}

function allowedDirectories(plan) {
  const allowed = new Set(["", "runs"]);
  for (const file of plan) {
    const parts = file.relativePath.split("/");
    parts.pop();
    while (parts.length) {
      allowed.add(parts.join("/"));
      parts.pop();
    }
  }
  return allowed;
}

function inspectCanonicalRun(runPath, relativePath, runId) {
  if (!RUN_ID_PATTERN.test(runId)) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_UNKNOWN_PATH", relativePath);
  }

  const runStats = lstatSync(runPath);
  if (runStats.isSymbolicLink() || !runStats.isDirectory()) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_CONFLICT", relativePath);
  }

  const entries = readdirSync(runPath).sort();
  if (entries.length !== 1 || entries[0] !== "RUN_STATE.md") {
    const unexpected = entries.find((entry) => entry !== "RUN_STATE.md");
    throw new CanonicalInitError(
      unexpected ? "AGDF_CANONICAL_INIT_UNKNOWN_PATH" : "AGDF_CANONICAL_INIT_CONFLICT",
      unexpected ? `${relativePath}/${unexpected}` : relativePath,
    );
  }

  const statePath = join(runPath, "RUN_STATE.md");
  const stateRelativePath = `${relativePath}/RUN_STATE.md`;
  const stateStats = lstatSync(statePath);
  if (stateStats.isSymbolicLink() || !stateStats.isFile() || stateStats.nlink !== 1) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_CONFLICT", stateRelativePath);
  }

  const content = readFileSync(statePath, "utf8");
  if (!parseRunState(content, runId).valid) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_CONFLICT", stateRelativePath);
  }

  return Object.freeze({
    directory: Object.freeze({ path: relativePath, dev: runStats.dev, ino: runStats.ino }),
    state: Object.freeze({ path: stateRelativePath, dev: stateStats.dev, ino: stateStats.ino, content }),
  });
}

function inspectExistingControl(controlPath, plan) {
  const expected = new Map(plan.map((file) => [file.relativePath, file]));
  const allowedDirs = allowedDirectories(plan);
  const files = new Map();
  const directories = new Set([""]);
  const retainedRuns = [];
  const visit = (directory, prefix = "") => {
    for (const name of readdirSync(directory).sort()) {
      const relativePath = prefix ? `${prefix}/${name}` : name;
      const path = join(directory, name);
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) throw new CanonicalInitError("AGDF_CANONICAL_INIT_CONFLICT", relativePath);
      if (stats.isDirectory()) {
        if (prefix === "runs") {
          directories.add(relativePath);
          retainedRuns.push(inspectCanonicalRun(path, relativePath, name));
          continue;
        }
        if (!allowedDirs.has(relativePath)) throw new CanonicalInitError("AGDF_CANONICAL_INIT_UNKNOWN_PATH", relativePath);
        directories.add(relativePath);
        visit(path, relativePath);
        continue;
      }
      if (!stats.isFile() || !expected.has(relativePath)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_UNKNOWN_PATH", relativePath);
      }
      const content = readFileSync(path, "utf8");
      if (content !== expected.get(relativePath).content) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_CONTENT_CONFLICT", relativePath);
      }
      files.set(relativePath, content);
    }
  };
  visit(controlPath);
  return Object.freeze({
    files: Object.freeze([...files.keys()].sort()),
    directories: Object.freeze([...directories].sort()),
    retainedRuns: Object.freeze(retainedRuns.sort((left, right) => left.state.path.localeCompare(right.state.path))),
  });
}

function snapshotsEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function retainedRunsEqual(left, right) {
  return JSON.stringify(left.retainedRuns) === JSON.stringify(right.retainedRuns);
}

function planFingerprint(plan) {
  const serialized = JSON.stringify(plan.map((file) => [file.relativePath, file.content]));
  return createHash("sha256").update(serialized, "utf8").digest("hex");
}

function stageMarkerContent({ stageName, mode, plan, stagedPlan, rootIdentity, agdfIdentity }) {
  return `${JSON.stringify({
    schema_version: 1,
    owner: "agdf.canonical-init",
    stage_name: stageName,
    mode,
    target: {
      realpath: rootIdentity.realpath,
      dev: String(rootIdentity.dev),
      ino: String(rootIdentity.ino),
    },
    agdf: {
      realpath: agdfIdentity.realpath,
      dev: String(agdfIdentity.dev),
      ino: String(agdfIdentity.ino),
    },
    plan_fingerprint: planFingerprint(plan),
    staged_files: stagedPlan.map((file) => file.relativePath),
  }, null, 2)}\n`;
}

function newStageSpec(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity) {
  const stageName = basename(stagePath);
  return Object.freeze({
    stagePath,
    stageName,
    mode,
    plan,
    stagedPlan,
    markerContent: stageMarkerContent({ stageName, mode, plan, stagedPlan, rootIdentity, agdfIdentity }),
  });
}

function staleStageError(path) {
  return new CanonicalInitError("AGDF_CANONICAL_INIT_STALE_STAGE", path);
}

function readStageSpec(containerPath, plan, rootIdentity, agdfIdentity, published = false) {
  const markerPath = join(containerPath, STAGE_MARKER);
  let raw;
  let marker;
  try {
    regularFileIdentity(markerPath);
    raw = readFileSync(markerPath, "utf8");
    marker = JSON.parse(raw);
  } catch {
    throw staleStageError(containerPath);
  }
  const stageName = String(marker?.stage_name ?? "");
  const stageId = stageName.startsWith(STAGE_PREFIX) ? stageName.slice(STAGE_PREFIX.length) : "";
  if (!UUID_PATTERN.test(stageId) || (!published && basename(containerPath) !== stageName)) {
    throw staleStageError(containerPath);
  }
  if (!Array.isArray(marker?.staged_files) || !["new", "repair"].includes(marker?.mode)) {
    throw staleStageError(containerPath);
  }
  const planByPath = new Map(plan.map((file) => [file.relativePath, file]));
  const stagedPlan = [];
  const seen = new Set();
  for (const relativePath of marker.staged_files) {
    if (typeof relativePath !== "string" || seen.has(relativePath) || !planByPath.has(relativePath)) {
      throw staleStageError(containerPath);
    }
    seen.add(relativePath);
    stagedPlan.push(planByPath.get(relativePath));
  }
  const orderedSubset = plan.filter((file) => seen.has(file.relativePath));
  if (orderedSubset.some((file, index) => file !== stagedPlan[index])) throw staleStageError(containerPath);
  if (marker.mode === "new" && stagedPlan.length !== plan.length) throw staleStageError(containerPath);
  const spec = newStageSpec(join(dirname(containerPath), stageName), marker.mode, plan, stagedPlan, rootIdentity, agdfIdentity);
  if (raw !== spec.markerContent) throw staleStageError(containerPath);
  return spec;
}

function expectedStageDirectories(stagedPlan) {
  return [...allowedDirectories(stagedPlan)]
    .sort((left, right) => left.split("/").length - right.split("/").length || left.localeCompare(right));
}

function inspectOwnedStage(containerPath, spec, complete) {
  const expectedFiles = new Map([
    [STAGE_MARKER, spec.markerContent],
    ...spec.stagedPlan.map((file) => [file.relativePath, file.content]),
  ]);
  const expectedDirectories = new Set(expectedStageDirectories(spec.stagedPlan));
  const ownership = { files: [], directories: [directoryIdentity(containerPath)] };
  const seenFiles = new Set();
  const seenDirectories = new Set([""]);
  const visit = (directory, prefix = "") => {
    for (const name of readdirSync(directory).sort()) {
      const relativePath = prefix ? `${prefix}/${name}` : name;
      const path = join(directory, name);
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", path);
      if (stats.isDirectory()) {
        if (!expectedDirectories.has(relativePath)) throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", path);
        const identity = directoryIdentity(path);
        ownership.directories.push(identity);
        seenDirectories.add(relativePath);
        visit(path, relativePath);
        continue;
      }
      if (!stats.isFile() || !expectedFiles.has(relativePath)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", path);
      }
      const content = readFileSync(path, "utf8");
      if (content !== expectedFiles.get(relativePath)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", path);
      }
      ownership.files.push(Object.freeze({ ...regularFileIdentity(path), content }));
      seenFiles.add(relativePath);
    }
  };
  visit(containerPath);
  if (!seenFiles.has(STAGE_MARKER)) throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", containerPath);
  if (complete) {
    if ([...expectedFiles.keys()].some((path) => !seenFiles.has(path))
      || [...expectedDirectories].some((path) => !seenDirectories.has(path))) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", containerPath);
    }
  }
  return ownership;
}

function completeStage(containerPath, spec, ownership, hooks) {
  const seenDirectories = new Set(ownership.directories.map((identity) => {
    if (identity.path === containerPath) return "";
    return identity.path.slice(containerPath.length + 1).replaceAll("\\", "/");
  }));
  for (const relativePath of expectedStageDirectories(spec.stagedPlan)) {
    if (!relativePath || seenDirectories.has(relativePath)) continue;
    const path = join(containerPath, ...relativePath.split("/"));
    createOwnedDirectory(path, ownership);
    seenDirectories.add(relativePath);
  }
  const seenFiles = new Set(ownership.files.map((file) => {
    if (file.path === join(containerPath, STAGE_MARKER)) return STAGE_MARKER;
    return file.path.slice(containerPath.length + 1).replaceAll("\\", "/");
  }));
  for (const [index, file] of spec.stagedPlan.entries()) {
    if (seenFiles.has(file.relativePath)) continue;
    hooks.beforeWrite?.({ index, file, stagePath: containerPath });
    writeOwnedFile(join(containerPath, ...file.relativePath.split("/")), file.content, ownership);
  }
  return inspectOwnedStage(containerPath, spec, true);
}

function createStage(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity, hooks, ownership) {
  createOwnedDirectory(stagePath, ownership);
  const spec = newStageSpec(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity);
  writeOwnedFile(join(stagePath, STAGE_MARKER), spec.markerContent, ownership);
  return Object.freeze({ spec, ownership: completeStage(stagePath, spec, ownership, hooks) });
}

function staleStageNames(agdfPath) {
  return readdirSync(agdfPath).filter((name) => name.startsWith(STAGE_PREFIX)).sort();
}

function loadStaleStage(agdfPath, names, plan, rootIdentity, agdfIdentity) {
  if (names.length === 0) return null;
  if (names.length !== 1) throw staleStageError(join(agdfPath, names[0]));
  const stagePath = join(agdfPath, names[0]);
  try {
    const spec = readStageSpec(stagePath, plan, rootIdentity, agdfIdentity);
    const ownership = inspectOwnedStage(stagePath, spec, false);
    return Object.freeze({ stagePath, spec, ownership });
  } catch {
    throw staleStageError(stagePath);
  }
}

function removeCreatedDirectories(directories) {
  for (const directory of [...directories].sort((left, right) => right.path.length - left.path.length)) {
    if (!sameDirectory(directory, directory.path)) continue;
    try {
      rmdirSync(directory.path);
    } catch (error) {
      if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error;
    }
  }
}

function createdDirectoriesUnchanged(directories) {
  return directories.every((directory) => sameDirectory(directory, directory.path));
}

function result(status, plan, existing = new Set()) {
  return Object.freeze({
    schema_version: 1,
    operation: "canonical_init",
    status,
    authorizes: false,
    created_run: false,
    created_ur: false,
    created_gate_approval: false,
    files: Object.freeze(plan.map((file) => Object.freeze({
      path: file.path,
      content: file.content,
      action: existing.has(file.relativePath) ? "preserved_exact" : "created",
    }))),
  });
}

function resumePublishedControl(controlPath, plan, rootIdentity, agdfIdentity, hooks) {
  let spec;
  let before;
  try {
    spec = readStageSpec(controlPath, plan, rootIdentity, agdfIdentity, true);
    if (spec.mode !== "new") throw staleStageError(controlPath);
    before = inspectOwnedStage(controlPath, spec, true);
  } catch {
    throw staleStageError(controlPath);
  }
  hooks.beforeResumeCleanup?.({ controlPath, stageName: spec.stageName });
  const after = inspectOwnedStage(controlPath, spec, true);
  if (!sameOwnershipSnapshot(before, after)) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", controlPath);
  }
  const marker = after.files.find((file) => file.path === join(controlPath, STAGE_MARKER));
  if (!marker || !sameRegularFile(marker, marker.path, marker.content)) {
    throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", marker?.path ?? controlPath);
  }
  unlinkSync(marker.path);
  inspectExistingControl(controlPath, plan);
  return result("repaired", plan, new Set(plan.map((file) => file.relativePath)));
}

export function initializeCanonicalControl(targetDir, files, options = {}, hooks = {}) {
  if (options.force) throw new CanonicalInitError("AGDF_CANONICAL_INIT_FORCE_FORBIDDEN");
  const plan = normalizedPlan(files);
  const rootIdentity = directoryIdentity(targetDir);
  const agdfPath = join(targetDir, ".agdf");
  const controlPath = join(agdfPath, "control");
  let createdAgdf = false;
  if (!existsSync(agdfPath)) {
    mkdirSync(agdfPath);
    createdAgdf = true;
  }
  const agdfIdentity = directoryIdentity(agdfPath);
  const staleNames = staleStageNames(agdfPath);

  if (existsSync(controlPath) && existsSync(join(controlPath, STAGE_MARKER))) {
    if (staleNames.length > 0) throw staleStageError(join(agdfPath, staleNames[0]));
    return resumePublishedControl(controlPath, plan, rootIdentity, agdfIdentity, hooks);
  }

  const stale = loadStaleStage(agdfPath, staleNames, plan, rootIdentity, agdfIdentity);

  if (!existsSync(controlPath)) {
    if (stale && stale.spec.mode !== "new") throw staleStageError(stale.stagePath);
    const stagePath = stale?.stagePath ?? join(agdfPath, `${STAGE_PREFIX}${randomUUID()}`);
    let ownership = stale?.ownership ?? { files: [], directories: [] };
    try {
      let spec = stale?.spec;
      if (!spec) {
        const created = createStage(stagePath, "new", plan, plan, rootIdentity, agdfIdentity, hooks, ownership);
        spec = created.spec;
        ownership = created.ownership;
      } else {
        ownership = completeStage(stagePath, spec, ownership, hooks);
      }
      const beforePublish = inspectOwnedStage(stagePath, spec, true);
      hooks.beforePublish?.({ targetDir, controlPath, stagePath, mode: "new" });
      if (!sameDirectory(rootIdentity, targetDir)
        || !sameDirectory(agdfIdentity, agdfPath)
        || !sameDirectory(beforePublish.directories[0], stagePath)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT");
      }
      const afterPublish = inspectOwnedStage(stagePath, spec, true);
      if (!sameOwnershipSnapshot(beforePublish, afterPublish)
        || existsSync(controlPath)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT");
      }
      renameSync(stagePath, controlPath);
      hooks.afterPublish?.({ targetDir, controlPath, stagePath, mode: "new" });
      const markerPath = join(controlPath, STAGE_MARKER);
      const marker = afterPublish.files.find((file) => file.path === join(stagePath, STAGE_MARKER));
      if (!marker || !sameDirectoryEntry(afterPublish.directories[0], controlPath)
        || !sameRegularFile(marker, markerPath, marker.content)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", controlPath);
      }
      unlinkSync(markerPath);
      inspectExistingControl(controlPath, plan);
      return result("created", plan);
    } catch (error) {
      cleanupOwnedTree(ownership);
      cleanupCreatedAgdf(createdAgdf, agdfIdentity, agdfPath);
      throw error;
    }
  }

  if (stale && stale.spec.mode !== "repair") throw staleStageError(stale.stagePath);
  const controlIdentity = directoryIdentity(controlPath);
  const before = inspectExistingControl(controlPath, plan);
  const existing = new Set(before.files);
  const missing = plan.filter((file) => !existing.has(file.relativePath));
  const runsMissing = !before.directories.includes("runs");
  if (missing.length === 0 && !runsMissing && !stale) return result("unchanged", plan, existing);
  if (existing.size === 0) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PARTIAL_UNOWNED", ".agdf/control");
  if (stale) {
    const stagedPaths = new Set(stale.spec.stagedPlan.map((file) => file.relativePath));
    if (missing.some((file) => !stagedPaths.has(file.relativePath))) throw staleStageError(stale.stagePath);
  }

  const stagePath = stale?.stagePath ?? join(agdfPath, `${STAGE_PREFIX}${randomUUID()}`);
  let ownership = stale?.ownership ?? { files: [], directories: [] };
  const linked = [];
  const createdDirectories = [];
  try {
    let spec = stale?.spec;
    if (!spec) {
      const created = createStage(stagePath, "repair", plan, missing, rootIdentity, agdfIdentity, hooks, ownership);
      spec = created.spec;
      ownership = created.ownership;
    } else {
      ownership = completeStage(stagePath, spec, ownership, hooks);
    }
    const beforePublish = inspectOwnedStage(stagePath, spec, true);
    hooks.beforePublish?.({ targetDir, controlPath, stagePath, mode: "repair" });
    if (!sameDirectory(rootIdentity, targetDir)
      || !sameDirectory(agdfIdentity, agdfPath)
      || !sameDirectory(controlIdentity, controlPath)
      || !sameDirectory(beforePublish.directories[0], stagePath)) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT");
    }
    const afterPublish = inspectOwnedStage(stagePath, spec, true);
    let controlUnchanged = false;
    try {
      controlUnchanged = snapshotsEqual(before, inspectExistingControl(controlPath, plan));
    } catch {
      controlUnchanged = false;
    }
    if (!sameOwnershipSnapshot(beforePublish, afterPublish)
      || !controlUnchanged) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT");
    }
    if (runsMissing) {
      const runsPath = join(controlPath, "runs");
      createOwnedDirectory(runsPath, { files: [], directories: createdDirectories });
    }
    for (const [index, file] of missing.entries()) {
      const destination = join(controlPath, ...file.relativePath.split("/"));
      const stagedPath = join(stagePath, ...file.relativePath.split("/"));
      const ancestors = [];
      let parent = dirname(destination);
      while (parent !== controlPath && !existsSync(parent)) {
        ancestors.push(parent);
        parent = dirname(parent);
      }
      for (const directory of ancestors.reverse()) {
        createOwnedDirectory(directory, { files: [], directories: createdDirectories });
      }
      hooks.beforeLink?.({ index, file, destination });
      const stagedFile = afterPublish.files.find((candidate) => candidate.path === stagedPath);
      if (!stagedFile
        || !sameDirectory(rootIdentity, targetDir)
        || !sameDirectory(agdfIdentity, agdfPath)
        || !sameDirectory(controlIdentity, controlPath)
        || !createdDirectoriesUnchanged(createdDirectories)
        || !sameRegularFile(stagedFile, stagedPath, file.content)
        || existsSync(destination)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", file.path);
      }
      linkSync(stagedPath, destination);
      const linkedFile = Object.freeze({ ...regularFileIdentity(destination), content: file.content });
      linked.push(linkedFile);
      if (!sameRegularFile(stagedFile, destination, file.content)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", file.path);
      }
      hooks.afterLink?.({ index, file, destination, stagePath });
    }
    if (!createdDirectoriesUnchanged(createdDirectories)) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", controlPath);
    }
    const completedControl = inspectExistingControl(controlPath, plan);
    if (!retainedRunsEqual(before, completedControl)) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", join(controlPath, "runs"));
    }
    if (!cleanupOwnedTree(afterPublish)) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", stagePath);
    }
    return result("repaired", plan, existing);
  } catch (error) {
    for (const linkedFile of linked.reverse()) {
      if (!sameRegularFile(linkedFile, linkedFile.path, linkedFile.content)) continue;
      try {
        unlinkSync(linkedFile.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") throw cleanupError;
      }
    }
    removeCreatedDirectories(createdDirectories);
    cleanupOwnedTree(ownership);
    throw error;
  }
}
