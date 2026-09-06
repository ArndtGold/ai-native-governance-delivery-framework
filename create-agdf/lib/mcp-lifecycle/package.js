import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import {
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "../runtime/plugin-provenance.js";
import { defaultNpmInstallRoot, npmInvocation } from "../installers/npm-invocation.js";
import { renameSyncWithRetry } from "../fs-swap.js";

const OWNER = "create-agdf:mcp-runtime";
const MARKER = ".agdf-mcp-owned.json";

export function mcpRuntimeDataRoot({ dataRoot, scope, target, surface } = {}) {
  if (!dataRoot || !["project", "user"].includes(scope)
      || !["codex", "claude", "opencode"].includes(surface)) {
    throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID");
  }
  const base = join(resolve(dataRoot), "mcp", scope);
  if (scope === "user") return join(base, surface);
  if (!target) throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID");
  let canonicalTarget;
  try { canonicalTarget = realpathSync(resolve(target)); } catch { throw new Error("AGDF_MCP_RUNTIME_PATH_INVALID"); }
  const targetDigest = createHash("sha256").update(canonicalTarget).digest("hex");
  return join(base, targetDigest, surface);
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
    const valid = marker.schema_version === 1
      && typeof marker.node_executable === "string"
      && isAbsolute(marker.node_executable)
      && manifest.name === "@agdf/mcp-server"
      && manifest.version === expectedVersion
      && manifest.dependencies?.["create-agdf"] === expectedVersion
      && manifest.dependencies?.["@modelcontextprotocol/server"] === "2.0.0"
      && manifest.engines?.node === ">=20"
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
    });
  } catch {
    return Object.freeze({ status: "mismatch", root, entrypoint: null, digest: null });
  }
}

export function prepareMcpServerPackage({
  dataRoot,
  expectedVersion,
  execPath = process.execPath,
  nodeVersion = process.versions.node,
  exec = execFileSync,
  npmOptions = {},
} = {}) {
  if (!dataRoot || !expectedVersion) throw new Error("AGDF_MCP_PACKAGE_INPUT_INVALID");
  if (nodeMajor(nodeVersion) < 20) throw new Error("AGDF_MCP_NODE_UNSUPPORTED");
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
    const invocation = npmInvocation([
      "install", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=dev", "--save-exact",
      `@agdf/mcp-server@${expectedVersion}`,
    ], { execPath, ...npmOptions });
    exec(invocation.executable, invocation.args, { cwd: stage, stdio: "pipe" });
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
        || manifest.engines?.node !== ">=20"
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
    const serverDigest = digestDirectory(packageRoot);
    const dispatcherDigest = digestMcpDispatcherPackage(dispatcherRoot);
    const sdkDigest = digestMcpSdkRuntime(stage);
    writeFileSync(join(stage, MARKER), `${JSON.stringify({
      schema_version: 1,
      owner: OWNER,
      version: expectedVersion,
      server_digest: serverDigest,
      dispatcher_digest: dispatcherDigest,
      sdk_digest: sdkDigest,
      node_executable: execPath,
      references: [],
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
        if (!committed && existsSync(stableRoot)) rmSync(stableRoot, { recursive: true, force: true });
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
      if (!existsSync(runtime.root) || existsSync(retiredRoot)) {
        throw new Error("AGDF_MCP_RUNTIME_RETIRE_INVALID");
      }
      renameSyncWithRetry(runtime.root, retiredRoot);
      applied = true;
    },
    commit() {
      if (!applied) return;
      try { rmSync(retiredRoot, { recursive: true, force: true }); } catch {}
      applied = false;
    },
    rollback() {
      if (!applied) return;
      if (!existsSync(retiredRoot) || existsSync(runtime.root)) {
        throw new Error("AGDF_MCP_RUNTIME_RETIRE_ROLLBACK_FAILED");
      }
      renameSyncWithRetry(retiredRoot, runtime.root);
      applied = false;
    },
  });
}

export const mcpPackageConstants = Object.freeze({ owner: OWNER, marker: MARKER });
