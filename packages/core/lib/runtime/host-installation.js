import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { INSTALLATION_PROVENANCE_FILE } from "./plugin-provenance.js";

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

function installationDigests(root) {
  const marker = readJson(join(root, INSTALLATION_PROVENANCE_FILE));
  return marker?.owner === "create-agdf"
    && /^[a-f0-9]{64}$/.test(marker.source_digest ?? "")
    && /^[a-f0-9]{64}$/.test(marker.runtime_digest ?? "")
    ? { source_digest: marker.source_digest, runtime_digest: marker.runtime_digest }
    : null;
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

// Claude Code loads plugins of local directory marketplaces in place, while installed_plugins.json
// records the cached copy written at install time. Both carry the installation provenance of the same
// install; different digests mean the session runs another AGDF state than the one installed last.
// Only the registered in-place root is compared, never a copy or a development checkout of the plugin.
export function inspectClaudeHostInstallationDrift({
  pluginRoot,
  pluginId = "agdf@agdf",
  env = process.env,
  home = homedir(),
  platform = process.platform,
} = {}) {
  const loaded = installationDigests(pluginRoot);
  if (!loaded) return { status: "not_applicable" };
  const configRoot = resolve(env.CLAUDE_CONFIG_DIR || join(home, ".claude"));
  const inPlaceRoot = registeredInPlaceRoot(configRoot, pluginId);
  if (!inPlaceRoot || !sameFileSystemEntry(inPlaceRoot, pluginRoot)) return { status: "not_applicable" };
  const entries = readJson(join(configRoot, "plugins", "installed_plugins.json"))?.plugins?.[pluginId];
  const installed = (Array.isArray(entries) ? entries : [])
    .filter((entry) => typeof entry?.installPath === "string" && isAbsolute(entry.installPath))
    .map((entry) => ({ scope: entry.scope, root: entry.installPath, digests: installationDigests(entry.installPath) }))
    .filter((entry) => entry.digests);
  if (!installed.length) return { status: "unknown" };
  if (installed.some(({ digests }) => digests.source_digest === loaded.source_digest
      && digests.runtime_digest === loaded.runtime_digest)) {
    return { status: "matched" };
  }
  const reference = installed.find((entry) => entry.scope === "user") ?? installed[0];
  const packagedCopy = packagedAppCopies(pluginRoot, { env, platform })
    .find((copy) => sameFileSystemEntry(copy.path, pluginRoot));
  return {
    status: "drift",
    loaded_root: pluginRoot,
    loaded_source_digest: loaded.source_digest,
    loaded_runtime_digest: loaded.runtime_digest,
    installed_root: reference.root,
    installed_source_digest: reference.digests.source_digest,
    installed_runtime_digest: reference.digests.runtime_digest,
    ...(packagedCopy ? { packaged_app_copy: packagedCopy.package } : {}),
  };
}
