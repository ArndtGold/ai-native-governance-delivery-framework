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
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "#agdf-core/runtime/plugin-provenance.js";
import { defaultNpmInstallRoot, npmInvocation } from "../npm-invocation.js";
import { renameSyncWithRetry } from "#agdf-core/fs-swap.js";
import { fsyncDirectory, withOwnedFileLock } from '#agdf-core/control-state/run-state-writer.js';

const OWNER = "create-agdf:mcp-runtime";
const MARKER = ".agdf-mcp-owned.json";
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

export function acquireMcpExecutableClaim(runtime, { ownerEpoch = randomUUID(), generation = 1 } = {}) {
  const root = resolve(runtime.root);
  if (runtime.status !== 'matched' || !Number.isSafeInteger(generation) || generation < 1
    || !/^[0-9a-f-]{36}$/u.test(ownerEpoch)) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
  return withOwnedFileLock(join(dirname(root), '.agdf-publication'), () => {
    if (realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    const fresh = inspectMcpServerPackage({ dataRoot: dirname(root), expectedVersion: runtime.version });
    if (fresh.status !== 'matched' || fresh.digest !== runtime.digest || fresh.dispatcherDigest !== runtime.dispatcherDigest
      || fresh.sdkDigest !== runtime.sdkDigest) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
    const marker = readJson(runtime.markerPath, 'AGDF_MCP_RUNTIME_MARKER_INVALID');
    if (marker.owner !== OWNER || marker.executable_retention !== 'claimed_immutable'
      || marker.server_digest !== runtime.digest || marker.dispatcher_digest !== runtime.dispatcherDigest
      || marker.sdk_digest !== runtime.sdkDigest) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
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
    const releaseConfirmed = () => withOwnedFileLock(join(dirname(root), '.agdf-publication'), () => {
      if (!lstatSync(path).isSymbolicLink() && readFileSync(path, 'utf8') === body) { unlinkSync(path); fsyncDirectory(dir); }
    });
    return Object.freeze({ token, owner_epoch: ownerEpoch, generation,
      bindOwnedChild(child, { confirmedEnd = () => true } = {}) {
        if (bound || !(child instanceof ChildProcess)) throw Error('AGDF_MCP_EXECUTABLE_CLAIM_INVALID');
        bound = true;
        child.once('exit', () => { try { if (confirmedEnd() === true) releaseConfirmed(); } catch {} });
        child.once('error', () => { if (child.pid === undefined) { try { releaseConfirmed(); } catch {} } });
      },
    });
  });
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

// Retirement checks the same verified package after its owned atomic rename.
// It must not accidentally inspect a new package at the former version path.
function inspectPackageRoot(root, expectedVersion) {
  const markerPath = join(root, MARKER);
  if (!existsSync(root)) return Object.freeze({ status: "absent", root, entrypoint: null, digest: null });
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink() || !existsSync(markerPath)) {
    return Object.freeze({ status: "foreign", root, entrypoint: null, digest: null });
  }
  try {
    const marker = readJson(markerPath, "AGDF_MCP_RUNTIME_MARKER_INVALID");
    const packageRoot = join(root, "node_modules", "@agdf", "mcp-server");
    const dispatcherRoot = join(root, "node_modules", "create-agdf");
    const sdkServerRoot = join(root, "node_modules", "@modelcontextprotocol", "server");
    const sdkCoreRoot = join(root, "node_modules", "@modelcontextprotocol", "core");
    const sdkClientRoot = join(root, "node_modules", "@modelcontextprotocol", "client");
    const sdkV1Root = join(root, "node_modules", "@modelcontextprotocol", "sdk");
    const manifestPath = join(packageRoot, "package.json");
    const dispatcherManifestPath = join(dispatcherRoot, "package.json");
    if (marker.owner !== OWNER || marker.version !== expectedVersion
        || !existsSync(manifestPath) || !existsSync(dispatcherManifestPath)) {
      return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
    }
    for (const ownedRoot of [packageRoot, dispatcherRoot, sdkServerRoot, sdkCoreRoot]) {
      if (!existsSync(ownedRoot) || !lstatSync(ownedRoot).isDirectory() || lstatSync(ownedRoot).isSymbolicLink()) {
        return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
      }
    }
    const manifest = readJson(manifestPath, "AGDF_MCP_SERVER_MANIFEST_INVALID");
    const dispatcherManifest = readJson(dispatcherManifestPath, "AGDF_MCP_DISPATCHER_MANIFEST_INVALID");
    const sdkServerManifest = readJson(join(sdkServerRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    const sdkCoreManifest = readJson(join(sdkCoreRoot, "package.json"), "AGDF_MCP_SDK_MANIFEST_INVALID");
    const entrypoint = join(packageRoot, "bin", "agdf-mcp.js");
    const serverDigest = digestDirectory(packageRoot);
    const dispatcherDigest = digestMcpDispatcherPackage(dispatcherRoot);
    const sdkDigest = digestMcpSdkRuntime(root);
    const valid = [1, 2].includes(marker.schema_version)
      && typeof marker.node_executable === "string"
      && isAbsolute(marker.node_executable)
      && manifest.name === "@agdf/mcp-server"
      && manifest.version === expectedVersion
      && manifest.dependencies?.["create-agdf"] === expectedVersion
      && manifest.dependencies?.["@modelcontextprotocol/server"] === "2.0.0"
      && manifest.engines?.node === ">=22"
      && dispatcherManifest.name === "create-agdf"
      && dispatcherManifest.version === expectedVersion
      && sdkServerManifest.name === "@modelcontextprotocol/server"
      && sdkServerManifest.version === "2.0.0"
      && sdkCoreManifest.name === "@modelcontextprotocol/core"
      && sdkCoreManifest.version === "2.0.0"
      && !existsSync(sdkClientRoot)
      && !existsSync(sdkV1Root)
      && existsSync(entrypoint)
      && lstatSync(entrypoint).isFile()
      && !lstatSync(entrypoint).isSymbolicLink()
      && marker.server_digest === serverDigest
      && marker.dispatcher_digest === dispatcherDigest
      && marker.sdk_digest === sdkDigest;
    return Object.freeze({
      status: valid ? "matched" : "mismatch",
      version: expectedVersion,
      root,
      packageRoot,
      dispatcherRoot,
      markerPath,
      entrypoint: valid ? entrypoint : null,
      digest: serverDigest,
      dispatcherDigest,
      sdkDigest,
      nodeExecutable: typeof marker.node_executable === "string" ? marker.node_executable : null,
      references: Object.freeze(Array.isArray(marker.references) ? marker.references : []),
      markerSchemaVersion: marker.schema_version,
      sdkVerification: typeof marker.sdk_verification === "string" ? marker.sdk_verification : null,
    });
  } catch {
    return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
  }
}

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
} = {}) {
  if (!dataRoot || !expectedVersion || typeof packageSpec !== "string" || !packageSpec.trim()
      || (dispatcherPackageSpec !== null && (typeof dispatcherPackageSpec !== "string" || !dispatcherPackageSpec.trim()))) {
    throw new Error("AGDF_MCP_PACKAGE_INPUT_INVALID");
  }
  if (nodeMajor(nodeVersion) < 22) throw new Error("AGDF_MCP_NODE_UNSUPPORTED");
  const existing = inspectMcpServerPackage({ dataRoot, expectedVersion });
  if (existing.status === "matched") {
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
    const install = (specs) => {
      const invocation = npmInvocation([
        "install", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=dev", "--save-exact", ...specs,
      ], { execPath, ...npmOptions });
      try { exec(invocation.executable, invocation.args, { cwd: stage, stdio: "pipe" }); }
      catch { throw new Error("AGDF_MCP_PACKAGE_ACQUISITION_FAILED"); }
    };
    // Installs exactly the stage's package-lock.json; npm verifies every tarball against its integrity.
    const installLocked = () => {
      const invocation = npmInvocation(["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=dev"], { execPath, ...npmOptions });
      try { exec(invocation.executable, invocation.args, { cwd: stage, stdio: "pipe" }); }
      catch { throw new Error("AGDF_MCP_PACKAGE_ACQUISITION_FAILED"); }
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
    renameSyncWithRetry(stage, stableRoot);
    movedToStable = true;
    const installed = inspectMcpServerPackage({ dataRoot, expectedVersion });
    if (installed.status !== "matched") throw new Error("AGDF_MCP_SERVER_VERIFICATION_FAILED");
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
      writeMarkerAtomically(runtime.markerPath, after);
      applied = true;
    },
    commit() { applied = false; },
    rollback() {
      if (!applied) return;
      writeMarkerAtomically(runtime.markerPath, before);
      applied = false;
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
export function createMcpGenerationPublisher(base) {
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
    acquire: (runtime, ownership) => acquireMcpExecutableClaim(runtime, ownership),
  });
}
