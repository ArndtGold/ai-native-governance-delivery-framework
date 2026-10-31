import { bindInputResolution, recordedInputResolution, resolutionRecordVersion, withInputResolution } from './input-resolution.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { ownerPlacement, assertOwnerPlacement, directoryPlacement, assertDirectoryPlacement } from '../owner-placement.js';
import { AsyncLocalStorage } from "node:async_hooks";
import { withOwnedFileLock, fsyncDirectory } from "./run-state-writer.js";
import { canonicalJson, digest, resolveControlCommandTarget } from "./approval-command-contract.js";
import { assertCanonicalRunStore } from "./run-store-inspection.js";
import { resolveLanguagePreference } from "../resources/language-preference.js";
import { canonicalInitPlan } from "../resources/canonical-init-plan.js";
import { pluginDefinition } from '../resources/context.js';
import { parseQualityContracts } from '../control-evaluation/shared.js';
import { canonicalRunText } from './run-seal.js';
import { verifyLegacyProjection } from './legacy-projection-reader.js';
import { pendingRunStepIds } from './run-step-pending.js';
import { assertMcpControlReadBoundary } from '../control-read-boundary.js';
const operationContext = new AsyncLocalStorage();
const TERMINAL_RECEIPT = ".agdf-canonical-init.json";
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { parseRunState, RUN_ID_PATTERN } from "./run-state-parser.js";
import { renameSyncWithRetry } from "../fs-swap.js";

const CONTROL_PREFIX = ".agdf/control/";
const LEGACY_LIVE_RUN = "AGDF_RUN.md";
const STAGE_PREFIX = ".control-stage-";
const STAGE_MARKER = ".agdf-canonical-init-stage.json";
const existsSync = path => { try { lstatSync(path); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };
const OPERATION_UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
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
    if (relativePath === STAGE_MARKER || relativePath === TERMINAL_RECEIPT || relativePath === "runs" || relativePath.startsWith("runs/")) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_INVALID", path);
    }
    if (seen.has(relativePath)) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PLAN_DUPLICATE", path);
    seen.add(relativePath);
    return Object.freeze({ ...file, path, relativePath, content: file.content });
  });
}

function directoryIdentity(path) {
  const stats = lstatSync(path, { bigint: true });
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
    const stats = lstatSync(path, { bigint: true });
    return !stats.isSymbolicLink()
      && stats.isDirectory()
      && stats.dev === identity.dev
      && stats.ino === identity.ino;
  } catch {
    return false;
  }
}

function regularFileIdentity(path) {
  const stats = lstatSync(path, { bigint: true });
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
    const stats = fstatSync(descriptor, { bigint: true });
    identity = Object.freeze({ path, dev: stats.dev, ino: stats.ino });
    if (typeof content === "function") content = content(identity);
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
      if (relativePath === TERMINAL_RECEIPT) {
        readInitializationReceipt(controlPath);
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

export function inspectCanonicalInitializationPlan() {
  const plan = normalizedPlan(canonicalInitPlan());
  return { version: pluginDefinition.version, plan_digest: 'sha256:' + planFingerprint(plan),
    file_count: plan.length, total_bytes: plan.reduce((sum, file) => sum + Buffer.byteLength(file.content), 0),
    language_policy: 'Default; explicit language binds its receipt plan_digest.' };
}

function stageMarkerContent({ stageName, mode, plan, stagedPlan, rootIdentity, agdfIdentity, schemaVersion, receipt }) {
  const operation = operationContext.getStore();
  return JSON.stringify(bindInputResolution({ schema_version: schemaVersion, ...(operation ? { operation } : {}),
    owner: 'agdf.canonical-init', stage_name: stageName, mode,
    target: schemaVersion === 3 ? directoryPlacement(rootIdentity.path) : {
      realpath: rootIdentity.realpath, dev: String(rootIdentity.dev), ino: String(rootIdentity.ino) },
    agdf: schemaVersion === 3 ? directoryPlacement(agdfIdentity.path) : {
      realpath: agdfIdentity.realpath, dev: String(agdfIdentity.dev), ino: String(agdfIdentity.ino) },
    ...(schemaVersion === 3 ? { control: receipt.control, receipt_digest: receipt.receipt_digest } : {}),
    plan_fingerprint: planFingerprint(plan), staged_files: stagedPlan.map(file => file.relativePath),
  }), null, 2) + '\n';
}
function newStageSpec(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity,
  { schemaVersion = operationContext.getStore() ? 3 : 1, receipt } = {}) {
  const stageName = basename(stagePath);
  return Object.freeze({ stagePath, stageName, mode, plan, stagedPlan, schemaVersion,
    markerContent: stageMarkerContent({ stageName, mode, plan, stagedPlan, rootIdentity, agdfIdentity, schemaVersion, receipt }) });
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
  if (!(operationContext.getStore() ? OPERATION_UUID_PATTERN : UUID_PATTERN).test(stageId) || (!published && basename(containerPath) !== stageName)) {
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
  if (![1, 2, 3].includes(resolutionRecordVersion(marker))) throw new CanonicalInitError('AGDF_CANONICAL_INIT_VERSION_UNSUPPORTED');
  let receipt;
  if (resolutionRecordVersion(marker) === 3) {
    receipt = readInitializationReceipt(containerPath, { prospective: !published });
    if (resolutionRecordVersion(receipt) !== 2 || canonicalJson(receipt.operation) !== canonicalJson(operationContext.getStore())) throw staleStageError(containerPath);
  }
  const spec = newStageSpec(join(dirname(containerPath), stageName), marker.mode, plan, stagedPlan, rootIdentity, agdfIdentity,
    { schemaVersion: resolutionRecordVersion(marker), receipt });
  if (raw !== spec.markerContent) {
    if ([1, 2].includes(resolutionRecordVersion(marker)) && raw === JSON.stringify(marker, null, 2) + '\n'
      && JSON.stringify({ ...marker, target: { ...marker.target, dev: String(rootIdentity.dev) },
        agdf: { ...marker.agdf, dev: String(agdfIdentity.dev) } }, null, 2) + '\n' === spec.markerContent)
      throw new CanonicalInitError('AGDF_CANONICAL_INIT_LEGACY_PLACEMENT_UNCONFIRMED', containerPath);
    throw staleStageError(containerPath);
  }
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
    ...(existsSync(join(containerPath, TERMINAL_RECEIPT)) ? [[TERMINAL_RECEIPT, validatedReceiptBytes(containerPath, { prospective: basename(containerPath) !== "control" })]] : []),
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
      // A resumed CLI repair may have published precisely this staged seed as
      // its second link. It is safe only at its exact canonical destination;
      // MCP setup, markers, receipts and arbitrary hardlinks remain single-link.
      const repairDestination = join(dirname(containerPath), 'control', relativePath);
      const publishedRepairLink = spec.mode === 'repair' && stats.nlink === 2
        && spec.stagedPlan.some(file => file.relativePath === relativePath)
        && existsSync(repairDestination) && realpathSync(repairDestination) === repairDestination
        && sameRegularFile(regularFileIdentity(path), repairDestination, expectedFiles.get(relativePath));
      if (!stats.isFile() || stats.nlink !== 1 && !publishedRepairLink || !expectedFiles.has(relativePath)
        || stats.size !== Buffer.byteLength(expectedFiles.get(relativePath))) {
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
  if (complete || spec.schemaVersion === 3) {
    if ([...expectedFiles.keys()].some((path) => !seenFiles.has(path))
      || [...expectedDirectories].some((path) => !seenDirectories.has(path))) {
      throw new CanonicalInitError("AGDF_CANONICAL_INIT_STAGE_INVALID", containerPath);
    }
  }
  return ownership;
}

function completeStage(containerPath, spec, ownership, hooks, validate = true) {
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
  return validate ? inspectOwnedStage(containerPath, spec, true) : ownership;
}

function createStage(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity, hooks, ownership) {
  createOwnedDirectory(stagePath, ownership);
  const operation = operationContext.getStore();
  const receipt = operation ? prepareInitializationReceipt(stagePath, operation, ownership, hooks) : undefined;
  const spec = newStageSpec(stagePath, mode, plan, stagedPlan, rootIdentity, agdfIdentity, { receipt });
  if (spec.schemaVersion === 3) {
    // Receipt and fixed seed bytes are private until the final atomic rename.
    completeStage(stagePath, spec, ownership, hooks, false);
    writeOwnedFile(join(stagePath, STAGE_MARKER), spec.markerContent, ownership);
    for (const entry of ownership.directories) fsyncDirectory(entry.path);
    fsyncDirectory(dirname(stagePath));
    return Object.freeze({ spec, ownership: inspectOwnedStage(stagePath, spec, true) });
  }
  writeOwnedFile(join(stagePath, STAGE_MARKER), spec.markerContent, ownership);
  fsyncDirectory(stagePath); fsyncDirectory(dirname(stagePath));
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
  } catch (error) {
    if (error.code === 'AGDF_CANONICAL_INIT_LEGACY_PLACEMENT_UNCONFIRMED') throw error;
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
  finishInitialization(controlPath, spec, marker, hooks);
  inspectExistingControl(controlPath, plan);
  return result("repaired", plan, new Set(plan.map((file) => file.relativePath)));
}

function initializeCanonicalControlLocked(targetDir, files, options = {}, hooks = {}) {
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
    const stagePath = stale?.stagePath ?? join(agdfPath, `${STAGE_PREFIX}${operationContext.getStore()?.operation_id ?? randomUUID()}`);
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
      for (const directory of afterPublish.directories) fsyncDirectory(directory.path);
      renameSyncWithRetry(stagePath, controlPath);
      fsyncDirectory(agdfPath); fsyncDirectory(controlPath);
      hooks.afterPublish?.({ targetDir, controlPath, stagePath, mode: "new" });
      const markerPath = join(controlPath, STAGE_MARKER);
      const marker = afterPublish.files.find((file) => file.path === join(stagePath, STAGE_MARKER));
      if (!marker || !sameDirectoryEntry(afterPublish.directories[0], controlPath)
        || !sameRegularFile(marker, markerPath, marker.content)) {
        throw new CanonicalInitError("AGDF_CANONICAL_INIT_TARGET_DRIFT", controlPath);
      }
      finishInitialization(controlPath, spec, { ...marker, path: markerPath }, hooks);
      inspectExistingControl(controlPath, plan);
      return result("created", plan);
    } catch (error) {
      if (!operationContext.getStore()?.preserve_stage) {
        cleanupOwnedTree(ownership);
        cleanupCreatedAgdf(createdAgdf, agdfIdentity, agdfPath);
      }
      throw error;
    }
  }

  if (stale && stale.spec.mode !== "repair") throw staleStageError(stale.stagePath);
  if (options.freshOnly) throw new CanonicalInitError("AGDF_CANONICAL_INIT_PARTIAL_UNOWNED");
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


function legacyReceiptBody(controlPath, operation) {
  const control = directoryIdentity(controlPath);
  return { schema_version: 1, owner: 'agdf.canonical-init', kind: 'project.initialize', operation,
    target_id: resolveControlCommandTarget(dirname(dirname(controlPath))).target_id,
    control: { realpath: control.realpath, dev: String(control.dev), ino: String(control.ino) },
    status: 'recorded', created_run: false, created_gate_approval: false };
}
function receiptBody(containerPath, operation) {
  const agdfPath = dirname(containerPath), target = dirname(agdfPath), controlPath = join(agdfPath, 'control');
  return bindInputResolution({ schema_version: 2, owner: 'agdf.canonical-init', kind: 'project.initialize', operation,
    target_id: resolveControlCommandTarget(target).target_id, target: directoryPlacement(target), agdf: directoryPlacement(agdfPath),
    control: ownerPlacement(containerPath, 'canonical-control', controlPath),
    status: 'recorded', created_run: false, created_gate_approval: false });
}
function prepareInitializationReceipt(stagePath, operation, ownership, hooks) {
  hooks.beforeProspectiveReceipt?.({ stagePath, operation });
  writeOwnedFile(join(stagePath, TERMINAL_RECEIPT), () => receiptBytes(receiptBody(stagePath, operation)), ownership);
  fsyncDirectory(stagePath);
  const receipt = readInitializationReceipt(stagePath, { prospective: true });
  hooks.afterProspectiveReceipt?.({ stagePath, operation });
  return receipt;
}
function receiptBytes(body) {
  const text = JSON.stringify({ ...body, receipt_digest: digest(canonicalJson(body)) }, null, 2) + '\n';
  if (Buffer.byteLength(text) > 16384) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
  return text;
}
function validatedReceiptBytes(controlPath, options) {
  readInitializationReceipt(controlPath, options);
  return readFileSync(join(controlPath, TERMINAL_RECEIPT), 'utf8');
}
export function readInitializationReceipt(controlPath, { prospective = false } = {}) {
  const path = join(controlPath, TERMINAL_RECEIPT), file = regularFileIdentity(path);
  if (lstatSync(path).size > 16384) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
  const bytes = readFileSync(path, 'utf8'), record = JSON.parse(bytes);
  if (![1, 2].includes(resolutionRecordVersion(record))) throw new CanonicalInitError('AGDF_CANONICAL_INIT_VERSION_UNSUPPORTED');
  const { receipt_digest, ...body } = record;
  const location = join(dirname(controlPath), 'control');
  if (resolutionRecordVersion(record) === 2) {
    if ((!prospective && controlPath !== location) || prospective && !basename(controlPath).startsWith(STAGE_PREFIX)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
    assertDirectoryPlacement(record.target, dirname(dirname(controlPath)));
    assertDirectoryPlacement(record.agdf, dirname(controlPath));
    assertOwnerPlacement(record.control, controlPath, 'canonical-control', location);
  }
  if (record.owner !== 'agdf.canonical-init' || record.kind !== 'project.initialize'
      || !validInitializationOperation(record.operation) || record.status !== 'recorded' || record.created_run !== false
      || record.created_gate_approval !== false || receipt_digest !== digest(canonicalJson(body))
      || record.target_id !== resolveControlCommandTarget(dirname(dirname(controlPath))).target_id
      || record.operation.target_id !== record.target_id
      || !sameRegularFile(file, path, bytes)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
  if (resolutionRecordVersion(record) === 1 && canonicalJson(record.control) !== canonicalJson(legacyReceiptBody(controlPath, record.operation).control))
    throw new CanonicalInitError('AGDF_CANONICAL_INIT_LEGACY_PLACEMENT_UNCONFIRMED', controlPath);
  return record;
}
function validInitializationOperation(op) {
  return op && Object.keys(op).sort().join() === 'language_preference,operation_id,plan_digest,preserve_stage,producer,request_digest,target_id'
    && OPERATION_UUID_PATTERN.test(op.operation_id) && /^sha256:[a-f0-9]{64}$/.test(op.request_digest)
    && /^sha256:[a-f0-9]{64}$/.test(op.plan_digest) && /^sha256:[a-f0-9]{64}$/.test(op.target_id)
    && (op.language_preference === null || op.language_preference && Object.keys(op.language_preference).sort().join() === 'artifact_language,chat_language,detected_locale,runtime_language,source'
      && Object.values(op.language_preference).every(value => typeof value === 'string' && value.length <= 256))
    && typeof op.producer === 'string' && op.producer.length <= 256 && typeof op.preserve_stage === 'boolean';
}
function finishInitialization(controlPath, spec, marker, hooks) {
  const operation = operationContext.getStore();
  if (operation && spec.schemaVersion === 3) {
    const receipt = readInitializationReceipt(controlPath);
    if (resolutionRecordVersion(receipt) !== 2 || canonicalJson(receipt.operation) !== canonicalJson(operation)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
    fsyncDirectory(controlPath); fsyncDirectory(dirname(controlPath));
    hooks.afterReceipt?.({ controlPath, operation });
  } else if (operation) {
    const path = join(controlPath, TERMINAL_RECEIPT), bytes = receiptBytes(legacyReceiptBody(controlPath, operation));
    if (existsSync(path)) {
      if (validatedReceiptBytes(controlPath) !== bytes) throw new CanonicalInitError('AGDF_CANONICAL_INIT_RECEIPT_INVALID');
    } else writeOwnedFile(path, bytes, { files: [], directories: [] });
    fsyncDirectory(controlPath); fsyncDirectory(dirname(controlPath));
    hooks.afterReceipt?.({ controlPath, operation });
  }
  // Hooks cannot change owned content before cleanup.
  inspectOwnedStage(controlPath, spec, true);
  hooks.beforeMarkerCleanup?.({ controlPath });
  inspectOwnedStage(controlPath, spec, true);
  if (!sameRegularFile(marker, marker.path, marker.content)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_TARGET_DRIFT');
  unlinkSync(marker.path); fsyncDirectory(controlPath); fsyncDirectory(dirname(controlPath));
}

// Shared CLI/MCP lock and publication owner.
export function initializeCanonicalControl(targetDir, files, options = {}, hooks = {}) {
  if (options.force) throw new CanonicalInitError('AGDF_CANONICAL_INIT_FORCE_FORBIDDEN');
  const requestedTarget = targetDir;
  // Preserve rejection of a linked target entry, then bind its canonical location
  // (including the system /var -> /private/var alias used by CLI temp fixtures).
  targetDir = directoryIdentity(targetDir).realpath;
  const root = directoryIdentity(targetDir), plan = normalizedPlan(files);
  const agdfPath = join(targetDir, '.agdf'); let created = false;
  try { mkdirSync(agdfPath); created = true; } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const agdf = directoryIdentity(agdfPath);
  try {
    return withOwnedFileLock(join(agdfPath, '.canonical-init'), () => {
      if (!sameDirectory(root) || !sameDirectory(agdf)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_TARGET_DRIFT');
      const controlPath = join(agdfPath, 'control');
      if (options.freshOnly && existsSync(controlPath) && !existsSync(join(controlPath, STAGE_MARKER))) {
        const state = inspectCanonicalProject(targetDir);
        if (state.status !== 'initialized') throw new CanonicalInitError(state.reason ?? 'AGDF_CANONICAL_INIT_CONFLICT');
        const old = state.receipt;
        if (old?.operation.operation_id === options.operation?.operation_id) {
          if (old.operation.request_digest !== options.operation.request_digest) throw new CanonicalInitError('AGDF_CANONICAL_INIT_IDENTITY_CONFLICT');
          return { ...result('unchanged', plan, new Set(plan.map(f => f.relativePath))), receipt: old, historical_effect: true };
        }
        return { ...result('unchanged', plan, new Set(plan.map(f => f.relativePath))), receipt: null };
      }
      let operation = options.operation;
      const stages = staleStageNames(agdfPath);
      const markerPath = existsSync(join(controlPath, STAGE_MARKER)) ? join(controlPath, STAGE_MARKER)
        : stages.length === 1 ? join(agdfPath, stages[0], STAGE_MARKER) : null;
      if (markerPath) {
        let stat; try { stat = lstatSync(markerPath); } catch { throw staleStageError(dirname(markerPath)); }
        if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 16384) throw staleStageError(markerPath);
        const marker = JSON.parse(readFileSync(markerPath, 'utf8'));
        if (![1, 2, 3].includes(resolutionRecordVersion(marker))) throw new CanonicalInitError('AGDF_CANONICAL_INIT_VERSION_UNSUPPORTED');
        if ([2, 3].includes(resolutionRecordVersion(marker))) {
          if (!validInitializationOperation(marker.operation)) throw staleStageError(markerPath);
          if (!operation && marker.operation.preserve_stage) throw new CanonicalInitError('AGDF_CANONICAL_INIT_ORIGINAL_OPERATION_REQUIRED');
          if (operation && canonicalJson(operation) !== canonicalJson(marker.operation)) throw new CanonicalInitError('AGDF_CANONICAL_INIT_IDENTITY_CONFLICT');
          operation ??= marker.operation;
        } else if (options.freshOnly) throw staleStageError(markerPath);
      } else if (!existsSync(controlPath)) {
        operation ??= { operation_id: randomUUID(), request_digest: digest(canonicalJson(plan)),
          target_id: resolveControlCommandTarget(targetDir).target_id, plan_digest: 'sha256:' + planFingerprint(plan), producer: 'canonical-init/2', preserve_stage: false, language_preference: null };
      }
      if (operation && (!validInitializationOperation(operation) || operation.target_id !== resolveControlCommandTarget(targetDir).target_id
          || operation.plan_digest !== 'sha256:' + planFingerprint(plan))) throw new CanonicalInitError('AGDF_CANONICAL_INIT_PLAN_DRIFT');
      const effect = operationContext.run(operation, () => initializeCanonicalControlLocked(targetDir, files, options, hooks));
      return { ...effect, ...(operation ? { receipt: readInitializationReceipt(controlPath) } : {}) };
    });
  } catch (error) {
    if (error instanceof CanonicalInitError && requestedTarget !== targetDir
      && (error.path === targetDir || error.path.startsWith(targetDir + '/'))) {
      throw new CanonicalInitError(error.code, requestedTarget + error.path.slice(targetDir.length));
    }
    throw error;
  } finally {
    if (created && sameDirectory(agdf)) { try { rmdirSync(agdfPath); } catch (error) { if (!['ENOTEMPTY', 'EEXIST', 'ENOENT'].includes(error.code)) throw error; } }
  }
}

export function inspectCanonicalProject(targetDir, { operationId } = {}) {
  const out = extra => ({ authorizes: false, created_run: false, created_gate_approval: false, ...extra });
  let receipt = null;
  try {
    const rootIdentity = directoryIdentity(targetDir);
    const agdfPath = join(targetDir, '.agdf'), controlPath = join(agdfPath, 'control');
    if (!existsSync(agdfPath)) return out({ status: 'absent', operation_status: 'unknown', reason: 'absence_is_not_proof_of_non_execution' });
    const agdfIdentity = directoryIdentity(agdfPath);
    const stages = staleStageNames(agdfPath);
    if (existsSync(controlPath)) directoryIdentity(controlPath);
    if (existsSync(join(controlPath, TERMINAL_RECEIPT))) receipt = readInitializationReceipt(controlPath);
    for (const name of stages) directoryIdentity(join(agdfPath, name));
    const publishedMarker = existsSync(join(controlPath, STAGE_MARKER));
    if (stages.length || publishedMarker) {
      const marker = publishedMarker ? join(controlPath, STAGE_MARKER) : stages.length === 1 ? join(agdfPath, stages[0], STAGE_MARKER) : null;
      if (!marker) throw staleStageError(agdfPath);
      const markerStat = lstatSync(marker);
      if (!markerStat.isFile() || markerStat.nlink !== 1 || markerStat.size > 16384) throw staleStageError(marker);
      const data = JSON.parse(readFileSync(marker, 'utf8'));
      if (![1, 2, 3].includes(resolutionRecordVersion(data))) throw new CanonicalInitError('AGDF_CANONICAL_INIT_VERSION_UNSUPPORTED');
      const owned = [2, 3].includes(resolutionRecordVersion(data)) && validInitializationOperation(data.operation)
        && data.operation.target_id === resolveControlCommandTarget(targetDir).target_id;
      if (!owned || operationId && data.operation.operation_id !== operationId) return out({ status: 'blocked', operation_status: 'unknown', reason: 'initialization_ownership_unconfirmed' });
      withInputResolution(recordedInputResolution(data), () => operationContext.run(data.operation, () => {
        const plan = normalizedPlan(canonicalInitPlan(data.operation.language_preference));
        const spec = readStageSpec(dirname(marker), plan, rootIdentity, agdfIdentity, publishedMarker);
        inspectOwnedStage(dirname(marker), spec, publishedMarker);
      }), true);
      return out({ status: 'pending', operation_status: publishedMarker && resolutionRecordVersion(data) === 3 ? 'recorded' : 'pending', reason: publishedMarker ? 'published_pending_finalization' : 'owned_stage_pending', operation: data.operation, receipt, input_resolution: recordedInputResolution(data) });
    }
    if (!existsSync(controlPath)) return out({ status: 'absent', operation_status: 'unknown', reason: 'absence_is_not_proof_of_non_execution' });
    assertMcpControlReadBoundary(targetDir);
    const store = assertCanonicalRunStore(targetDir);
    if (pendingRunStepIds(targetDir).length) throw Error('canonical_pending_run_operation');
    const projection = verifyLegacyProjection(targetDir);
    if (!['valid', 'absent'].includes(projection.status)) throw Error(projection.status);
    const config = JSON.parse(readFileSync(join(controlPath, 'config.json'), 'utf8'));
    if (!['artifact_language', 'chat_language', 'runtime_language'].every(k => typeof config[k] === 'string' && config[k].length <= 64)) throw Error('canonical_config_unsupported');
    for (const [name, title] of [['MASTER_BACKLOG.md', '# AGDF Master Backlog'], ['SOT_REGISTRY.md', '# AGDF Source-of-Truth Registry'], ['CONTEXT_GRAPH.md', '# AGDF Context Graph']]) {
      const path = join(controlPath, name);
      if (lstatSync(path).size > 1048576 || !canonicalRunText(readFileSync(path, 'utf8')).startsWith(title + '\n')) throw Error('canonical_structure_unsupported');
    }
    const quality = parseQualityContracts(readFileSync(join(controlPath, 'AGENT_QUALITY_CONTRACTS.json'), 'utf8'));
    if (quality.schema_version !== '1') throw Error('canonical_policy_unsupported');
    return out({ status: 'initialized', operation_status: operationId && receipt?.operation.operation_id === operationId ? 'recorded' : 'unknown',
      receipt, file_count: store.files.length, config });
  } catch (error) { return out({ status: 'blocked', operation_status: operationId && receipt?.operation.operation_id === operationId ? 'recorded' : 'unknown', receipt, reason: error.code ?? error.message }); }
}

export function initializeCanonicalProject(root, { operationId, requestDigest, targetId, language, producer = 'canonical-init/2' }, hooks = {}) {
  const observed = inspectCanonicalProject(root, { operationId });
  const original = observed.operation ?? observed.receipt?.operation;
  const languagePreference = original?.operation_id === operationId && original.request_digest === requestDigest
    ? original.language_preference : resolveLanguagePreference(language);
  const files = canonicalInitPlan(languagePreference), plan = normalizedPlan(files);
  const operation = { language_preference: languagePreference, operation_id: operationId, request_digest: requestDigest, target_id: targetId,
    plan_digest: 'sha256:' + planFingerprint(plan), producer, preserve_stage: true };
  assertInputConfigurationCurrent(root);
  const effect = initializeCanonicalControl(root, files, { freshOnly: true, operation }, hooks);
  return { status: effect.status === 'created' || effect.status === 'repaired' ? 'created' : 'unchanged', receipt: effect.receipt,
    historical_effect: effect.historical_effect === true, created_run: false, created_gate_approval: false, authorizes: false,
    file_count: files.length, plan_digest: operation.plan_digest };
}
