import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { generatedRoot, packageRoot, pluginDefinition } from "../cli/runtime-context.js";

const MARKETPLACE_ID = "agdf";
const OWNERSHIP_FILE = ".agdf-owned.json";
const LEGACY_REPOSITORY = "arndtgold/ai-native-governance-delivery-framework";

function pathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function digestDirectory(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid: ${error.message}`);
  }
}

export function defaultAgdfDataRoot({ env = process.env, platform = process.platform, home = homedir() } = {}) {
  if (env.AGDF_DATA_DIR) return resolve(env.AGDF_DATA_DIR);
  if (platform === "darwin") return join(home, "Library", "Application Support", "agdf");
  if (platform === "win32") return join(env.LOCALAPPDATA || env.APPDATA || join(home, "AppData", "Local"), "agdf");
  return join(env.XDG_DATA_HOME || join(home, ".local", "share"), "agdf");
}

export function localMarketplaceRoot(options = {}) {
  return join(defaultAgdfDataRoot(options), "marketplaces", MARKETPLACE_ID);
}

function ownership(root, { allowBuilding = false } = {}) {
  if (!existsSync(join(root, OWNERSHIP_FILE))) {
    throw new Error(`Refusing marketplace path without AGDF ownership marker: ${root}`);
  }
  const marker = readJson(join(root, OWNERSHIP_FILE), "AGDF marketplace ownership marker");
  if (marker.schema_version !== 1 || marker.owner !== "create-agdf" || marker.marketplace_id !== MARKETPLACE_ID) {
    throw new Error(`Refusing marketplace path with invalid AGDF ownership marker: ${root}`);
  }
  if (marker.staging_state !== "ready" && !(allowBuilding && marker.staging_state === "building")) {
    throw new Error(`Refusing marketplace path with invalid AGDF staging state: ${root}`);
  }
  return marker;
}

function removeOwnedRoot(root, parent, options = {}) {
  if (!existsSync(root)) return;
  if (!pathInside(parent, root) || dirname(root) !== parent) throw new Error(`Refusing unsafe marketplace cleanup path: ${root}`);
  ownership(root, options);
  rmSync(root, { recursive: true, force: true });
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function codexMarketplace(definition = pluginDefinition) {
  return {
    name: MARKETPLACE_ID,
    interface: { displayName: definition.displayName },
    plugins: [{
      name: definition.id,
      source: { source: "local", path: "./plugins/agdf" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: definition.category,
    }],
  };
}

function claudeMarketplace(definition = pluginDefinition) {
  return {
    name: MARKETPLACE_ID,
    owner: { name: definition.displayName, email: "" },
    metadata: { description: definition.description },
    plugins: [{
      name: definition.id,
      source: "./plugins/agdf",
      description: definition.claudeDescription || definition.longDescription,
      category: definition.category,
    }],
  };
}

function validateBuiltPlugin(pluginRoot, expectedVersion) {
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"), "built plugin definition");
  const runtime = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"), "built runtime manifest");
  for (const required of [
    join(pluginRoot, ".codex-plugin", "plugin.json"),
    join(pluginRoot, ".claude-plugin", "plugin.json"),
    join(pluginRoot, "runtime", "agdf-local.js"),
    join(pluginRoot, "scripts", "check-runtime-integrity.mjs"),
  ]) {
    if (!existsSync(required)) throw new Error(`Built plugin is incomplete: ${required}`);
  }
  if (definition.version !== expectedVersion || runtime.version !== expectedVersion) {
    throw new Error(`Built plugin version mismatch: expected ${expectedVersion}, definition ${definition.version}, runtime ${runtime.version}`);
  }
  if (!/^[a-f0-9]{64}$/.test(runtime.digest ?? "")) throw new Error("Built plugin runtime digest is invalid.");
  if (digestDirectory(join(pluginRoot, "runtime", "create-agdf")) !== runtime.digest) {
    throw new Error("Built plugin runtime digest does not match its payload.");
  }
  return definition;
}

function validateMarketplaceRoot(root, definition = pluginDefinition) {
  const codex = readJson(join(root, ".agents", "plugins", "marketplace.json"), "Codex local marketplace manifest");
  const claude = readJson(join(root, ".claude-plugin", "marketplace.json"), "Claude local marketplace manifest");
  if (JSON.stringify(codex) !== JSON.stringify(codexMarketplace(definition))) {
    throw new Error(`Codex local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  if (JSON.stringify(claude) !== JSON.stringify(claudeMarketplace(definition))) {
    throw new Error(`Claude local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
}

function recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot) {
  const parent = dirname(stableRoot);
  if (existsSync(backupRoot)) {
    ownership(backupRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
    if (existsSync(stableRoot)) {
      ownership(stableRoot);
      renameSync(stableRoot, failedRoot);
    }
    renameSync(backupRoot, stableRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
  }
  if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
  if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
}

export function prepareLocalMarketplace({
  dataRoot = defaultAgdfDataRoot(),
  builtPluginRoot = join(generatedRoot, "plugins", "agdf"),
  expectedVersion = pluginDefinition.version,
} = {}) {
  dataRoot = resolve(dataRoot);
  builtPluginRoot = resolve(builtPluginRoot);
  const stableRoot = join(dataRoot, "marketplaces", MARKETPLACE_ID);
  const parent = dirname(stableRoot);
  const stageRoot = `${stableRoot}.stage`;
  const backupRoot = `${stableRoot}.backup`;
  const failedRoot = `${stableRoot}.failed`;
  if (!pathInside(dataRoot, stableRoot) || dirname(stableRoot) !== parent) throw new Error(`Unsafe AGDF marketplace root: ${stableRoot}`);
  const targetDefinition = validateBuiltPlugin(builtPluginRoot, expectedVersion);
  mkdirSync(parent, { recursive: true });
  recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot);

  const existing = existsSync(stableRoot) ? ownership(stableRoot) : null;
  if (existing) {
    const existingPluginRoot = join(stableRoot, "plugins", MARKETPLACE_ID);
    const existingDefinition = validateBuiltPlugin(existingPluginRoot, existing.version);
    validateMarketplaceRoot(stableRoot, existingDefinition);
    if (digestDirectory(existingPluginRoot) !== existing.plugin_digest) {
      throw new Error(`Refusing tampered AGDF marketplace root: ${stableRoot}`);
    }
  }
  mkdirSync(stageRoot, { recursive: false });
  try {
    writeJson(join(stageRoot, OWNERSHIP_FILE), {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
      version: expectedVersion,
      plugin_digest: null,
      source_package_version: readJson(join(packageRoot, "package.json"), "create-agdf package manifest").version,
      staging_state: "building",
    });
    const stagedPluginRoot = join(stageRoot, "plugins", MARKETPLACE_ID);
    cpSync(builtPluginRoot, stagedPluginRoot, { recursive: true });
    validateBuiltPlugin(stagedPluginRoot, expectedVersion);
    writeJson(join(stageRoot, ".agents", "plugins", "marketplace.json"), codexMarketplace(targetDefinition));
    writeJson(join(stageRoot, ".claude-plugin", "marketplace.json"), claudeMarketplace(targetDefinition));
    validateMarketplaceRoot(stageRoot, targetDefinition);
    const pluginDigest = digestDirectory(stagedPluginRoot);
    const marker = {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
      version: expectedVersion,
      plugin_digest: pluginDigest,
      source_package_version: readJson(join(packageRoot, "package.json"), "create-agdf package manifest").version,
      staging_state: "ready",
    };
    writeJson(join(stageRoot, OWNERSHIP_FILE), marker);

    if (existing?.version === expectedVersion && existing?.plugin_digest === pluginDigest) {
      removeOwnedRoot(stageRoot, parent);
      return Object.freeze({
        root: stableRoot,
        pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
        version: expectedVersion,
        digest: pluginDigest,
        changed: false,
        commit() {},
        rollback() {},
      });
    }

    if (existsSync(stableRoot)) renameSync(stableRoot, backupRoot);
    try {
      renameSync(stageRoot, stableRoot);
    } catch (error) {
      if (existsSync(backupRoot) && !existsSync(stableRoot)) renameSync(backupRoot, stableRoot);
      throw error;
    }
    let closed = false;
    return Object.freeze({
      root: stableRoot,
      pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
      version: expectedVersion,
      digest: pluginDigest,
      changed: true,
      commit() {
        if (closed) return;
        if (existsSync(backupRoot)) removeOwnedRoot(backupRoot, parent);
        closed = true;
      },
      rollback() {
        if (closed) return;
        if (existsSync(backupRoot)) {
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
          if (existsSync(stableRoot)) renameSync(stableRoot, failedRoot);
          renameSync(backupRoot, stableRoot);
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
        } else if (existsSync(stableRoot)) {
          removeOwnedRoot(stableRoot, parent);
        }
        closed = true;
      },
    });
  } catch (error) {
    if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
    throw error;
  }
}

function normalizedLegacySource(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase()
    .replace(/^git\+/, "")
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/^github:/, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
}

function sourceForEntry(entry) {
  const source = entry?.marketplaceSource?.source
    ?? entry?.source?.source
    ?? (entry?.source === "directory" ? entry?.path : undefined)
    ?? (entry?.source === "github" ? entry?.repo : undefined)
    ?? entry?.repo
    ?? entry?.path
    ?? entry?.source
    ?? entry?.url
    ?? "";
  return typeof source === "string" ? source : "";
}

export function classifyMarketplaceList(surface, output, stableRoot) {
  let parsed;
  try {
    parsed = typeof output === "string" ? JSON.parse(output) : output;
  } catch {
    return { state: "unknown", source: "", reason: "invalid_json" };
  }
  const entries = surface === "codex" ? parsed?.marketplaces : parsed;
  if (!Array.isArray(entries)) return { state: "unknown", source: "", reason: "invalid_shape" };
  const matches = entries.filter((entry) => entry?.name === MARKETPLACE_ID);
  if (matches.length === 0) return { state: "absent", source: "" };
  if (matches.length !== 1) return { state: "unknown", source: "", reason: "duplicate_name" };
  const entry = matches[0];
  const source = sourceForEntry(entry);
  const sourceType = entry?.marketplaceSource?.sourceType ?? entry?.source?.sourceType ?? "";
  if ((sourceType === "local" || isAbsolute(source)) && resolve(source) === resolve(stableRoot)) {
    return { state: "owned_local_current", source };
  }
  if (normalizedLegacySource(source) === LEGACY_REPOSITORY) return { state: "legacy_github", source };
  return { state: "conflict", source, reason: source ? "foreign_source" : "source_missing" };
}

export const localMarketplaceConstants = Object.freeze({
  id: MARKETPLACE_ID,
  ownershipFile: OWNERSHIP_FILE,
  legacyRepository: LEGACY_REPOSITORY,
});
