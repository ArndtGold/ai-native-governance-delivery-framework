import { Worker } from 'node:worker_threads';
import { ChildProcess, execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  unlinkSync,
  openSync, closeSync, fsyncSync,
} from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import {
  MCP_RUNTIME_OWNER as OWNER,
  MCP_RUNTIME_MARKER as MARKER,
  inspectOwnedMcpRuntimeRoot as inspectPackageRoot,
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "#agdf-core/runtime/plugin-provenance.js";
import { defaultNpmInstallRoot, npmInvocation } from "../npm-invocation.js";
import { renameSyncWithRetry } from "#agdf-core/fs-swap.js";
import { fsyncDirectory, withOwnedFileLock } from '#agdf-core/owned-file-lock.js';

const CLAIMS = '.agdf-executable-claims';

// Claims are package-local retention evidence, never a PID liveness ledger.
// An absent legacy marker, malformed record or uncertain owner retains bytes.
export function mcpRuntimeRetirementState(root) {
  try {
    if (lstatSync(root).isSymbolicLink() || realpathSync(root) !== resolve(root)) return 'retained';
    const marker = readJson(join(root, MARKER), 'AGDF_MCP_RUNTIME_MARKER_INVALID');
    if (marker.owner !== OWNER || marker.executable_retention !== 'claimed_immutable') return 'retained';
    if (inspectPackageRoot(root, marker.version).status !== 'matched'
      || readdirSync(root).some(name => !['package.json', 'package-lock.json', 'node_modules', MARKER, CLAIMS].includes(name))) return 'retained';
    const dir = join(root, CLAIMS);
    if (!existsSync(dir)) return 'eligible';
    if (lstatSync(dir).isSymbolicLink() || !lstatSync(dir).isDirectory() || readdirSync(dir).length) return 'retained';
    return 'eligible';
  } catch { return 'retained'; }
}

const CLAIM_WAIT_MS = 5_550;
const CLAIM_POLL_MS = 150;

export function acquireMcpExecutableClaim(runtime, { ownerEpoch = randomUUID(), generation = 1,
  publicationDeadline = Infinity, clock = () => performance.now(),
  wait = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) } = {}) {
  const root = resolve(runtime.root);
  if (runtime.status !== 'matched' || !Number.isSafeInteger(generation) || generation < 1
    || !/^[0-9a-f-]{36}$/u.test(ownerEpoch)) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
  const publication = join(dirname(root), '.agdf-publication');
  const started = clock();
  if (!Number.isFinite(started) || typeof publicationDeadline !== 'number' || Number.isNaN(publicationDeadline)) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
  const deadline = Math.min(started + CLAIM_WAIT_MS, publicationDeadline);
  if (publicationDeadline <= started) throw Error('AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED');
  const attempt = () => withOwnedFileLock(publication, () => {
    if (realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    const fresh = inspectMcpServerPackage({ dataRoot: dirname(root), expectedVersion: runtime.version });
    if (fresh.status !== 'matched' || fresh.digest !== runtime.digest || fresh.dispatcherDigest !== runtime.dispatcherDigest
      || fresh.sdkDigest !== runtime.sdkDigest || fresh.markerPath !== runtime.markerPath) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    const marker = readJson(runtime.markerPath, 'AGDF_MCP_RUNTIME_MARKER_INVALID');
    if (marker.owner !== OWNER || marker.executable_retention !== 'claimed_immutable'
      || marker.server_digest !== runtime.digest || marker.dispatcher_digest !== runtime.dispatcherDigest
      || marker.sdk_digest !== runtime.sdkDigest) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    if (clock() >= publicationDeadline) throw Error('AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED');
    const dir = join(root, CLAIMS);
    if (existsSync(dir) && lstatSync(dir).isSymbolicLink()) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    mkdirSync(dir, { recursive: true });
    if (lstatSync(dir).isSymbolicLink() || realpathSync(dir) !== dir) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    const token = randomUUID(), path = join(dir, `${token}.json`);
    const body = JSON.stringify({ schema_version: 1, owner: OWNER, token, owner_epoch: ownerEpoch, generation,
      root, server_digest: runtime.digest, dispatcher_digest: runtime.dispatcherDigest, sdk_digest: runtime.sdkDigest });
    const fd = openSync(path, 'wx', 0o600);
    try { writeFileSync(fd, body); fsyncSync(fd); } finally { closeSync(fd); }
    fsyncDirectory(dir);
    let bound = false;
    const releaseConfirmed = () => {
      const deadline = clock() + CLAIM_WAIT_MS;
      for (;;) {
        try {
          return withOwnedFileLock(publication, () => {
            if (!lstatSync(path).isSymbolicLink() && readFileSync(path, 'utf8') === body) { unlinkSync(path); fsyncDirectory(dir); }
          });
        } catch (error) {
          // Concurrent facades retire the same publication. A short, verified
          // live-owner lock must not turn a confirmed child exit into a leaked
          // claim. Unknown/dead ownership still retains all evidence unchanged.
          if (error?.message !== 'AGDF_RUN_WRITE_LOCKED' || error.lock_path !== `${publication}.lock`
            || error.lock_owner_status !== 'live' || clock() >= deadline) throw error;
          wait(Math.min(CLAIM_POLL_MS, Math.max(0, deadline - clock())));
        }
      }
    };
    // Reuse this actual, lock-bound inspection in the supervising owner. It
    // is an observation from this acquisition, never caller-supplied trust.
    return Object.freeze({ token, owner_epoch: ownerEpoch, generation, verifiedRuntime: fresh,
      bindOwnedWorker(worker, { confirmedEnd = () => false } = {}) {
        if (bound || !(worker instanceof Worker) || worker.threadId <= 0) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
        bound = true;
        worker.once('exit', code => { try { if (code === 0 && confirmedEnd() === true) releaseConfirmed(); } catch {} });
      },
      bindOwnedChild(child, { confirmedEnd = () => true } = {}) {
        if (bound || !(child instanceof ChildProcess)) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
        bound = true;
        child.once('exit', () => { try { if (confirmedEnd() === true) releaseConfirmed(); } catch {} });
        child.once('error', () => { if (child.pid === undefined) { try { releaseConfirmed(); } catch {} } });
      },
    });
  });
  let contended = false;
  for (;;) {
    if (contended && clock() >= deadline) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED');
    try { return attempt(); }
    catch (error) {
      if (error?.message !== 'AGDF_RUN_WRITE_LOCKED' || error.lock_path !== `${publication}.lock`) throw error;
      if (error.lock_owner_status !== 'live') throw Error('AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED');
      contended = true;
      const remaining = deadline - clock();
      if (remaining <= 0) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED');
      wait(Math.min(CLAIM_POLL_MS, remaining));
    }
  }
}

export function mcpRuntimeDataRoot({ dataRoot, scope, target } = {}) {
  if (!dataRoot || !["project", "user"].includes(scope)) {
    throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID");
  }
  const base = join(resolve(dataRoot), "mcp", scope);
  if (scope === "user") return base;
  if (!target) throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID");
  let canonicalTarget;
  try { canonicalTarget = realpathSync(resolve(target)); } catch { throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID"); }
  const targetDigest = createHash("sha256").update(canonicalTarget).digest("hex");
  return join(base, targetDigest);
}

export function mcpLegacyRuntimeDataRoot({ dataRoot, scope, target, surface } = {}) {
  if (!dataRoot || !["project", "user"].includes(scope)
      || !["codex", "claude", "opencode", "copilot"].includes(surface)) {
    throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID");
  }
  const shared = mcpRuntimeDataRoot({ dataRoot, scope, target });
  return join(shared, surface);
}

function readJson(path, code) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(code);
  }
}

function nodeMajor(version = process.versions.node) {
  return Number.parseInt(String(version).split(".")[0], 10);
}

export function inspectMcpServerPackage({ dataRoot, expectedVersion } = {}) {
  const root = defaultNpmInstallRoot(resolve(dataRoot), expectedVersion);
  return inspectPackageRoot(root, expectedVersion);
}

export function inspectMcpExecutableRoot({ root, expectedVersion } = {}) {
  if (!isAbsolute(root ?? '') || realpathSync(root) !== root) throw Error('AGDF_MCP_RUNTIME_PATH_INVALID');
  return inspectPackageRoot(root, expectedVersion);
}

// Retirement checks the same verified package after its owned atomic rename.
// It must not accidentally inspect a new package at the former version path.

// Names of all packages installed under root/node_modules, scoped included; npm's dot entries
// (.bin, .package-lock.json) are bookkeeping, not packages.
function installedPackageNames(root) {
  const modules = join(root, "node_modules");
  const names = [];
  for (const name of readdirSync(modules)) {
    if (name.startsWith(".")) continue;
    if (name.startsWith("@")) {
      for (const scoped of readdirSync(join(modules, name))) if (!scoped.startsWith(".")) names.push(`${name}/${scoped}`);
    } else {
      names.push(name);
    }
  }
  return names.sort();
}

// The plugin ships the server and dispatcher itself; everything else in the stage must be the locked SDK.
const PLUGIN_SHIPPED_PACKAGES = Object.freeze(["@agdf/mcp-server", "create-agdf"]);

function verifyStageSdk({ stage, expectedSdk }) {
  const locked = Array.isArray(expectedSdk.packages) ? expectedSdk.packages : [];
  const expectedNames = [...locked.map((entry) => entry.name), ...PLUGIN_SHIPPED_PACKAGES].sort();
  const versionsMatch = locked.every((entry) => {
    try { return readJson(join(stage, "node_modules", entry.name, "package.json"), "").version === entry.version; }
    catch { return false; }
  });
  if (!locked.length || JSON.stringify(installedPackageNames(stage)) !== JSON.stringify(expectedNames) || !versionsMatch) {
    throw new Error("AGDF_MCP_SDK_PACKAGE_SET_MISMATCH");
  }
  if (typeof expectedSdk.sdk_digest !== "string" || digestMcpSdkRuntime(stage) !== expectedSdk.sdk_digest) {
    throw new Error("AGDF_MCP_SDK_DIGEST_MISMATCH");
  }
}

export function prepareMcpServerPackage(options = {}) {
  if (!options.dataRoot) throw Error('AGDF_MCP_PACKAGE_INPUT_INVALID');
  if (existsSync(resolve(options.dataRoot)) && lstatSync(resolve(options.dataRoot)).isSymbolicLink()) throw Error('AGDF_MCP_RUNTIME_UNOWNED');
  mkdirSync(resolve(options.dataRoot), { recursive: true });
  return withOwnedFileLock(join(resolve(options.dataRoot), '.agdf-publication'), () => preparePackageLocked(options));
}

function preparePackageLocked({
  dataRoot,
  expectedVersion,
  execPath = process.execPath,
  nodeVersion = process.versions.node,
  exec = execFileSync,
  npmOptions = {},
  packageSpec = `@agdf/mcp-server@${expectedVersion}`,
  dispatcherPackageSpec = null,
  // Fills stage/node_modules; the plugin-local runtime installs only the SDK from npm and copies the
  // server and dispatcher it ships. Validation, digests and the owned marker stay shared.
  acquire = null,
  // { packages: [{ name, version }], sdk_digest }: the exact SDK tree a stage must contain before it is
  // committed. Omitted by the registered MCP path, which keeps its previous checks.
  expectedSdk = null,
  // Recorded in the marker as sdk_verification when set ("verified" | "unverified_override").
  sdkVerification = null,
  immutable = false,
  publicationDeadline = Infinity,
} = {}) {
  if (!dataRoot || !expectedVersion || typeof packageSpec !== "string" || !packageSpec.trim()
      || (dispatcherPackageSpec !== null && (typeof dispatcherPackageSpec !== "string" || !dispatcherPackageSpec.trim()))) {
    throw new Error("AGDF_MCP_PACKAGE_INPUT_INVALID");
  }
  if (nodeMajor(nodeVersion) < 22) throw new Error("AGDF_MCP_NODE_UNSUPPORTED");
  if (typeof publicationDeadline !== 'number' || Number.isNaN(publicationDeadline)) throw Error('AGDF_MCP_PACKAGE_INPUT_INVALID');
  const remainingBudget = () => {
    const remaining = publicationDeadline - performance.now();
    if (remaining <= 0) throw Error('AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED');
    return remaining;
  };
  remainingBudget();
  const existing = inspectMcpServerPackage({ dataRoot, expectedVersion });
  if (existing.status === "matched") {
    remainingBudget();
    return Object.freeze({ ...existing, changed: false, commit() {}, rollback() {} });
  }
  if (existing.status !== "absent") throw new Error("AGDF_MCP_RUNTIME_UNOWNED");

  const installRoot = resolve(dataRoot);
  mkdirSync(installRoot, { recursive: true });
  const stage = mkdtempSync(join(installRoot, `.stage-${expectedVersion}-`));
  const stableRoot = defaultNpmInstallRoot(resolve(dataRoot), expectedVersion);
  let movedToStable = false;
  try {
    writeFileSync(join(stage, "package.json"), `${JSON.stringify({ private: true }, null, 2)}\n`, "utf8");
    const acquireWithBudget = invocation => {
      const remaining = remainingBudget();
      try { exec(invocation.executable, invocation.args, { cwd: stage, stdio: 'pipe',
        ...(Number.isFinite(remaining) ? { timeout: Math.max(1, Math.floor(remaining)), killSignal: 'SIGKILL' } : {}) }); }
      catch (error) {
        if (Number.isFinite(remaining) && error?.code === 'ETIMEDOUT') throw Error('AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED');
        remainingBudget(); throw Error('AGDF_MCP_PACKAGE_ACQUISITION_FAILED');
      }
      remainingBudget();
    };
    const install = (specs) => {
      const invocation = npmInvocation([
        "install", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=dev", "--save-exact", ...specs,
      ], { execPath, ...npmOptions });
      acquireWithBudget(invocation);
    };
    // Installs exactly the stage's package-lock.json; npm verifies every tarball against its integrity.
    const installLocked = () => {
      const invocation = npmInvocation(["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=dev"], { execPath, ...npmOptions });
      acquireWithBudget(invocation);
    };
    if (acquire) acquire({ stage, install, installLocked });
    else install([packageSpec, ...(dispatcherPackageSpec ? [dispatcherPackageSpec] : [])]);
    const packageRoot = join(stage, "node_modules", "@agdf", "mcp-server");
    const dispatcherRoot = join(stage, "node_modules", "create-agdf");
    const sdkServerRoot = join(stage, "node_modules", "@modelcontextprotocol", "server");
    const sdkCoreRoot = join(stage, "node_modules", "@modelcontextprotocol", "core");
    const sdkClientRoot = join(stage, "node_modules", "@modelcontextprotocol", "client");
    const sdkV1Root = join(stage, "node_modules", "@modelcontextprotocol", "sdk");
    const manifest = readJson(join(packageRoot, "package.json"), "AGDF_MCP_SERVER_MANIFEST_INVALID");
    const dispatcherManifest = readJson(join(dispatcherRoot, "package.json"), "AGDF_MCP_DISPATCHER_MANIFEST_INVALID");
    const sdkServerManifest = readJson(join(sdkServerRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    const sdkCoreManifest = readJson(join(sdkCoreRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    if (manifest.name !== "@agdf/mcp-server"
        || manifest.version !== expectedVersion
        || manifest.dependencies?.["create-agdf"] !== expectedVersion
        || manifest.dependencies?.["@modelcontextprotocol/server"] !== "2.0.0"
        || manifest.engines?.node !== ">=22"
        || dispatcherManifest.name !== "create-agdf"
        || dispatcherManifest.version !== expectedVersion
        || sdkServerManifest.name !== "@modelcontextprotocol/server"
        || sdkServerManifest.version !== "2.0.0"
        || sdkCoreManifest.name !== "@modelcontextprotocol/core"
        || sdkCoreManifest.version !== "2.0.0"
        || existsSync(sdkClientRoot)
        || existsSync(sdkV1Root)) {
      throw new Error("AGDF_MCP_SERVER_VERSION_MISMATCH");
    }
    const entrypoint = join(packageRoot, "bin", "agdf-mcp.js");
    if (!existsSync(entrypoint) || !lstatSync(entrypoint).isFile() || lstatSync(entrypoint).isSymbolicLink()) {
      throw new Error("AGDF_MCP_SERVER_ENTRYPOINT_INVALID");
    }
    // The exact package set is checked before any digest walks the tree.
    if (expectedSdk) verifyStageSdk({ stage, expectedSdk });
    const serverDigest = digestDirectory(packageRoot);
    const dispatcherDigest = digestMcpDispatcherPackage(dispatcherRoot);
    const sdkDigest = digestMcpSdkRuntime(stage);
    writeFileSync(join(stage, MARKER), `${JSON.stringify({
      schema_version: 2,
      owner: OWNER,
      version: expectedVersion,
      server_digest: serverDigest,
      dispatcher_digest: dispatcherDigest,
      sdk_digest: sdkDigest,
      ...(sdkVerification ? { sdk_verification: sdkVerification } : {}),
      node_executable: execPath,
      references: [],
      ...(immutable ? { executable_retention: 'claimed_immutable' } : {}),
    }, null, 2)}\n`, "utf8");
    remainingBudget();
    renameSyncWithRetry(stage, stableRoot);
    movedToStable = true;
    const installed = inspectMcpServerPackage({ dataRoot, expectedVersion });
    if (installed.status !== "matched") throw new Error("AGDF_MCP_SERVER_VERIFICATION_FAILED");
    remainingBudget();
    let committed = false;
    return Object.freeze({
      ...installed,
      changed: true,
      commit() { committed = true; },
      rollback() {
        if (!committed && existsSync(stableRoot)) withOwnedFileLock(join(installRoot, '.agdf-publication'), () => {
          if (immutable && mcpRuntimeRetirementState(stableRoot) !== 'eligible') throw Error('AGDF_MCP_RUNTIME_RETAINED');
          rmSync(stableRoot, { recursive: true, force: true });
        });
      },
    });
  } catch (error) {
    if (existsSync(stage)) rmSync(stage, { recursive: true, force: true });
    if (movedToStable && existsSync(stableRoot)) rmSync(stableRoot, { recursive: true, force: true });
    throw error;
  }
}

export function updateMcpRuntimeReferences(runtime, references) {
  const transaction = createMcpRuntimeReferenceTransaction(runtime, references);
  transaction.apply();
  transaction.commit();
}

function writeMarkerAtomically(markerPath, content) {
  const temporary = join(dirname(markerPath), `.${Date.now()}-${process.pid}-agdf-mcp-marker.tmp`);
  writeFileSync(temporary, content, "utf8");
  try {
    renameSyncWithRetry(temporary, markerPath);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function createMcpRuntimeReferenceTransaction(runtime, references) {
  const marker = readJson(runtime.markerPath, "AGDF_MCP_RUNTIME_MARKER_INVALID");
  const before = readFileSync(runtime.markerPath, "utf8");
  const after = `${JSON.stringify({ ...marker, references }, null, 2)}\n`;
  let applied = false;
  return Object.freeze({
    apply() {
      withOwnedFileLock(join(dirname(runtime.root), '.agdf-publication'), () => {
        if (readFileSync(runtime.markerPath, 'utf8') !== before) throw Error('AGDF_MCP_RUNTIME_REFERENCE_CHANGED');
        writeMarkerAtomically(runtime.markerPath, after);
        applied = true;
      });
    },
    commit() { applied = false; },
    rollback() {
      if (!applied) return;
      withOwnedFileLock(join(dirname(runtime.root), '.agdf-publication'), () => {
        if (readFileSync(runtime.markerPath, 'utf8') !== after) throw Error('AGDF_MCP_RUNTIME_REFERENCE_CHANGED');
        writeMarkerAtomically(runtime.markerPath, before);
        applied = false;
      });
    },
  });
}

export function createMcpRuntimeRetirementTransaction(runtime) {
  const retiredRoot = join(dirname(runtime.root), `.${runtime.version}.retired-${Date.now()}-${process.pid}`);
  let applied = false;
  return Object.freeze({
    retiredRoot,
    apply() {
      withOwnedFileLock(join(dirname(runtime.root), '.agdf-publication'), () => {
        if (mcpRuntimeRetirementState(runtime.root) !== 'eligible') throw Error('AGDF_MCP_RUNTIME_RETAINED');
        if (!existsSync(runtime.root) || existsSync(retiredRoot)) throw new Error("AGDF_MCP_RUNTIME_RETIRE_INVALID");
        renameSyncWithRetry(runtime.root, retiredRoot); applied = true;
      });
    },
    commit() {
      if (!applied) return;
      withOwnedFileLock(join(dirname(runtime.root), '.agdf-publication'), () => {
        if (mcpRuntimeRetirementState(retiredRoot) !== 'eligible') throw Error('AGDF_MCP_RUNTIME_RETAINED');
        rmSync(retiredRoot, { recursive: true, force: true }); applied = false;
      });
    },
    rollback() {
      if (!applied) return;
      withOwnedFileLock(join(dirname(runtime.root), '.agdf-publication'), () => {
        if (!existsSync(retiredRoot) || existsSync(runtime.root)) {
          throw new Error("AGDF_MCP_RUNTIME_RETIRE_ROLLBACK_FAILED");
        }
        renameSyncWithRetry(retiredRoot, runtime.root);
        applied = false;
      });
    },
  });
}

export const mcpPackageConstants = Object.freeze({ owner: OWNER, marker: MARKER });

// Package selectors are resolved only by the existing publisher. The serving
// facade supplies its own verified publication root; inputs never select paths.
export function createMcpGenerationPublisher(base, { publicationDeadline = Infinity } = {}) {
  const canonical = realpathSync(base.publisher_root);
  if (canonical !== base.publisher_root || !base.immutable) throw Error('runtime_publication_unowned');
  return Object.freeze({
    initial: base,
    resolve(candidate) {
      const keys = ['schema_version', 'publication_id', 'version', 'server_digest', 'dispatcher_digest', 'sdk_digest'];
      if (!candidate || Object.keys(candidate).sort().join() !== keys.sort().join()
        || candidate.schema_version !== '1' || !/^[0-9a-f]{64}$/u.test(candidate.publication_id ?? '')
        || candidate.version !== base.version) throw Error('runtime_candidate_manifest_invalid');
      const dataRoot = join(canonical, 'generations', candidate.publication_id);
      for (const path of [canonical, join(canonical, 'generations'), dataRoot]) {
        if (lstatSync(path).isSymbolicLink() || realpathSync(path) !== path) throw Error('runtime_candidate_unowned');
      }
      const runtime = inspectMcpServerPackage({ dataRoot, expectedVersion: base.version });
      if (runtime.status !== 'matched' || runtime.digest !== candidate.server_digest
        || runtime.dispatcherDigest !== candidate.dispatcher_digest || runtime.sdkDigest !== candidate.sdk_digest
        || runtime.sdkVerification !== 'verified') throw Error('runtime_candidate_digest_mismatch');
      return Object.freeze({ ...runtime, immutable: true, publication_id: candidate.publication_id, publisher_root: canonical });
    },
    acquire: (runtime, ownership) => acquireMcpExecutableClaim(runtime, { ...ownership,
      ...(runtime === base ? { publicationDeadline } : {}) }),
  });
}
