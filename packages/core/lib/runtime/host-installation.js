import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { INSTALLATION_PROVENANCE_FILE } from "./plugin-provenance.js";

const DIGEST = /^[a-f0-9]{64}$/;
export const CLAUDE_INSTALLATION_RECORD_FILE = "installation.json";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function outsideOf(root, candidate) {
  const path = relative(root, candidate);
  return !path || path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);
}

function validDigests(value) {
  return Boolean(value) && DIGEST.test(value.source_digest ?? "") && DIGEST.test(value.runtime_digest ?? "");
}

// MSIX-packaged hosts such as Claude Desktop redirect %LOCALAPPDATA% writes of the app and of every
// process it starts into a private per-package store, and serve that copy first afterwards. The copy
// shadows the real path for processes inside the package only, so one AGDF location can hold two states.
export function packagedAppCopies(path, { env = process.env, platform = process.platform } = {}) {
  if (platform !== "win32" || !env.LOCALAPPDATA) return [];
  const localAppData = resolve(env.LOCALAPPDATA);
  const packagesRoot = join(localAppData, "Packages");
  const target = resolve(path);
  if (outsideOf(localAppData, target) || !outsideOf(packagesRoot, target)) return [];
  let packages;
  try { packages = readdirSync(packagesRoot).sort(); } catch { return []; }
  const location = relative(localAppData, target);
  return packages
    .map((name) => Object.freeze({ package: name, path: join(packagesRoot, name, "LocalCache", "Local", location) }))
    .filter((copy) => existsSync(copy.path));
}

// Inside a package the logical path and its private copy open the same file system entry.
export function sameFileSystemEntry(left, right) {
  try {
    const a = statSync(left, { bigint: true });
    const b = statSync(right, { bigint: true });
    return a.ino !== 0n && a.dev === b.dev && a.ino === b.ino;
  } catch {
    return false;
  }
}

// A process inside a package cannot see its own redirection, but the redirected file shows up in that
// package's store. A fresh probe therefore detects the package even before any AGDF copy exists there.
export function detectPackagedAppProcess({
  env = process.env,
  platform = process.platform,
  fs = { writeFileSync, rmSync, readdirSync, existsSync },
  randomId = randomUUID,
} = {}) {
  if (platform !== "win32" || !env.LOCALAPPDATA) return Object.freeze({ status: "not_applicable" });
  const localAppData = resolve(env.LOCALAPPDATA);
  const packagesRoot = join(localAppData, "Packages");
  const probeName = `.agdf-package-probe-${randomId()}`;
  const probe = join(localAppData, probeName);
  try {
    fs.writeFileSync(probe, "", { flag: "wx" });
  } catch (error) {
    return Object.freeze({ status: "unavailable", reason: error?.code || "probe_write_failed" });
  }
  try {
    let packages;
    try { packages = fs.readdirSync(packagesRoot).sort(); } catch { packages = []; }
    const hit = packages.find((name) => fs.existsSync(join(packagesRoot, name, "LocalCache", "Local", probeName)));
    return Object.freeze(hit ? { status: "inside_package", package: hit } : { status: "passed" });
  } finally {
    try { fs.rmSync(probe, { force: true }); } catch { /* the probe is empty and uniquely named */ }
  }
}

export function readInstallationDigests(root) {
  const marker = readJson(join(root, INSTALLATION_PROVENANCE_FILE));
  return marker?.owner === "create-agdf" && validDigests(marker)
    ? { source_digest: marker.source_digest, runtime_digest: marker.runtime_digest }
    : null;
}

// One comparison serves installer verification and the SessionStart drift notice.
export function compareInstallationProvenance(expected, observed) {
  if (!validDigests(expected) || !validDigests(observed)) return "unknown";
  return expected.source_digest === observed.source_digest && expected.runtime_digest === observed.runtime_digest
    ? "matched"
    : "mismatch";
}

// Claude Code names a plugin's data directory after its id with every character outside [A-Za-z0-9_-]
// replaced by "-" (the same rule as claudePluginDataRoot in the CLI MCP lifecycle). Packaged apps do not
// virtualize this directory, so every process sees the record of the last install.
export function claudeInstallationRecordPath({ env = process.env, home = homedir(), pluginId = "agdf@agdf" } = {}) {
  const configRoot = resolve(env.CLAUDE_CONFIG_DIR || join(home, ".claude"));
  return join(configRoot, "plugins", "data", pluginId.replace(/[^A-Za-z0-9_-]/g, "-"), CLAUDE_INSTALLATION_RECORD_FILE);
}

export function readClaudeInstallationRecord(options = {}) {
  const record = readJson(claudeInstallationRecordPath(options));
  return record?.schema_version === 1 && record.owner === "create-agdf"
    && record.plugin_id === (options.pluginId ?? "agdf@agdf") && validDigests(record)
    && typeof record.plugin_root === "string" && isAbsolute(record.plugin_root)
    ? record
    : null;
}

export function writeClaudeInstallationRecord({
  pluginRoot,
  marketplaceRoot,
  sourceDigest,
  runtimeDigest,
  pluginId = "agdf@agdf",
  env = process.env,
  home = homedir(),
  now = () => new Date().toISOString(),
  fs = { mkdirSync, writeFileSync, renameSync, rmSync },
} = {}) {
  const record = {
    schema_version: 1,
    owner: "create-agdf",
    plugin_id: pluginId,
    plugin_root: pluginRoot,
    marketplace_root: marketplaceRoot,
    source_digest: sourceDigest,
    runtime_digest: runtimeDigest,
    installed_at: now(),
  };
  if (!validDigests(record) || typeof pluginRoot !== "string" || !isAbsolute(pluginRoot)) {
    throw new Error("AGDF installation record requires an absolute plugin root and valid digests.");
  }
  const path = claudeInstallationRecordPath({ env, home, pluginId });
  const staged = `${path}.${process.pid}.tmp`;
  fs.mkdirSync(dirname(path), { recursive: true });
  try {
    fs.writeFileSync(staged, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    fs.renameSync(staged, path);
  } catch (error) {
    try { fs.rmSync(staged, { force: true }); } catch { /* keep the original failure */ }
    throw error;
  }
  return path;
}

// A record that no longer describes the last install would make every session report drift; after a
// failed write the installer removes it, so sessions report an unknown state instead.
export function removeClaudeInstallationRecord({ env = process.env, home = homedir(), pluginId = "agdf@agdf", fs = { rmSync } } = {}) {
  fs.rmSync(claudeInstallationRecordPath({ env, home, pluginId }), { force: true });
}

function registeredInPlaceRoot(configRoot, pluginId) {
  const [plugin, marketplace] = pluginId.split("@");
  const registration = readJson(join(configRoot, "plugins", "known_marketplaces.json"))?.[marketplace];
  const location = registration?.installLocation;
  if (registration?.source?.source !== "directory" || typeof location !== "string" || !isAbsolute(location)) return null;
  const source = readJson(join(location, ".claude-plugin", "marketplace.json"))?.plugins
    ?.find((entry) => entry?.name === plugin)?.source;
  return typeof source === "string" && source.startsWith("./") ? resolve(location, source) : null;
}

// Claude Code loads plugins of local directory marketplaces in place. The installer records what it
// committed in the plugin data root; different digests mean the session runs another AGDF state than
// the one installed last. Only the registered in-place root is compared, never a copy or a development
// checkout of the plugin, and an install without record stays unknown rather than drifting.
export function inspectClaudeHostInstallationDrift({
  pluginRoot,
  pluginId = "agdf@agdf",
  env = process.env,
  home = homedir(),
  platform = process.platform,
} = {}) {
  const loaded = readInstallationDigests(pluginRoot);
  if (!loaded) return { status: "not_applicable" };
  const configRoot = resolve(env.CLAUDE_CONFIG_DIR || join(home, ".claude"));
  const inPlaceRoot = registeredInPlaceRoot(configRoot, pluginId);
  if (!inPlaceRoot || !sameFileSystemEntry(inPlaceRoot, pluginRoot)) return { status: "not_applicable" };
  const installed = readClaudeInstallationRecord({ env, home, pluginId });
  if (!installed) return { status: "unknown" };
  if (compareInstallationProvenance(installed, loaded) === "matched") return { status: "matched" };
  const packagedCopy = packagedAppCopies(pluginRoot, { env, platform })
    .find((copy) => sameFileSystemEntry(copy.path, pluginRoot));
  return {
    status: "drift",
    loaded_root: pluginRoot,
    loaded_source_digest: loaded.source_digest,
    loaded_runtime_digest: loaded.runtime_digest,
    installed_root: installed.plugin_root,
    installed_source_digest: installed.source_digest,
    installed_runtime_digest: installed.runtime_digest,
    ...(packagedCopy ? { packaged_app_copy: packagedCopy.package } : {}),
  };
}
