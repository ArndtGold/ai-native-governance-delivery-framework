import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";
import { renameSyncWithRetry } from "../fs-swap.js";

const COPILOT_PLUGIN_SELECTOR = "agdf@agdf";
const COPILOT_LOCAL_SETTINGS = join(".github", "copilot", "settings.local.json");
const COPILOT_SHARED_SETTINGS = join(".github", "copilot", "settings.json");

export function defaultCopilotSettingsPath({ env = process.env, home = homedir() } = {}) {
  return join(resolve(env.COPILOT_HOME || join(home, ".copilot")), "settings.json");
}

export function readCopilotSettings(path = defaultCopilotSettingsPath()) {
  if (!existsSync(path)) return { exists: false, settings: {}, content: null };
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("AGDF_COPILOT_SETTINGS_UNOWNED_PATH");
  try {
    const content = readFileSync(path, "utf8");
    const settings = JSON.parse(content);
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("not an object");
    if (settings.enabledPlugins !== undefined
        && (!settings.enabledPlugins || typeof settings.enabledPlugins !== "object" || Array.isArray(settings.enabledPlugins))) {
      throw new Error("enabledPlugins must be an object");
    }
    return { exists: true, settings, content };
  } catch (error) {
    throw new Error(`AGDF_COPILOT_SETTINGS_INVALID: ${error.message}`);
  }
}

function atomicContentWrite(path, content, dependencies = {}) {
  const makeDirectory = dependencies.mkdir ?? mkdirSync;
  const write = dependencies.write ?? writeFileSync;
  const rename = dependencies.rename ?? renameSyncWithRetry;
  const remove = dependencies.remove ?? rmSync;
  const changeMode = dependencies.chmod ?? chmodSync;
  const exists = dependencies.exists ?? existsSync;
  const stat = dependencies.lstat ?? lstatSync;
  makeDirectory(dirname(path), { recursive: true });
  const temp = `${path}.agdf-tmp-${process.pid}`;
  const backup = `${path}.agdf-backup-${process.pid}`;
  const hadPrevious = exists(path);
  const mode = hadPrevious ? stat(path).mode & 0o777 : 0o600;
  write(temp, content, { encoding: "utf8", flag: "wx", mode });
  if (process.platform !== "win32") changeMode(temp, mode);
  try {
    if (hadPrevious && process.platform === "win32") rename(path, backup);
    rename(temp, path);
    if (hadPrevious && process.platform === "win32") remove(backup, { force: true });
  } catch (error) {
    try { remove(temp, { force: true }); } catch {}
    if (hadPrevious && process.platform === "win32" && exists(backup) && !exists(path)) rename(backup, path);
    throw error;
  }
}

export function atomicSettingsWrite(path, settings, dependencies = {}) {
  atomicContentWrite(path, `${JSON.stringify(settings, null, 2)}\n`, dependencies);
}

export function repositoryCopilotSettingsPath(targetDir, { shared = false } = {}) {
  const root = resolve(targetDir);
  if (!existsSync(root) || lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory()) {
    throw new Error(`AGDF_COPILOT_REPOSITORY_UNOWNED_PATH: ${root}`);
  }
  const path = resolve(root, shared ? COPILOT_SHARED_SETTINGS : COPILOT_LOCAL_SETTINGS);
  const fromRoot = relative(root, path);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
    throw new Error("AGDF_COPILOT_REPOSITORY_SETTINGS_OUTSIDE_ROOT");
  }
  for (const candidate of [root, join(root, ".github"), join(root, ".github", "copilot")]) {
    if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) {
      throw new Error(`AGDF_COPILOT_SETTINGS_UNOWNED_PATH: ${candidate}`);
    }
    if (existsSync(candidate) && !lstatSync(candidate).isDirectory()) {
      throw new Error(`AGDF_COPILOT_SETTINGS_UNOWNED_PATH: ${candidate}`);
    }
  }
  if (existsSync(path) && (lstatSync(path).isSymbolicLink() || !lstatSync(path).isFile())) {
    throw new Error(`AGDF_COPILOT_SETTINGS_UNOWNED_PATH: ${path}`);
  }
  return path;
}

export function assertCopilotLocalSettingsIgnored(targetDir, { exec = execFileSync } = {}) {
  const root = resolve(targetDir);
  try {
    exec("git", ["check-ignore", "--quiet", "--", COPILOT_LOCAL_SETTINGS], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error("AGDF_COPILOT_GIT_UNAVAILABLE: install Git and retry personal disable, or use --shared deliberately.");
    }
    if (error?.status === 1) {
      throw new Error(`AGDF_COPILOT_LOCAL_SETTINGS_NOT_IGNORED: add ${COPILOT_LOCAL_SETTINGS} to an effective Git ignore source and retry, or use --shared deliberately.`);
    }
    throw new Error(`AGDF_COPILOT_GIT_IGNORE_UNVERIFIED: ${error?.message || "Git could not verify the repository ignore state."}`);
  }
  return { status: "ignored", path: COPILOT_LOCAL_SETTINGS };
}

export function planCopilotRepositoryDisable({ targetDir, shared = false, exec = execFileSync }) {
  const root = resolve(targetDir);
  const path = repositoryCopilotSettingsPath(root, { shared });
  if (!shared) assertCopilotLocalSettingsIgnored(root, { exec });
  const before = readCopilotSettings(path);
  const current = before.settings.enabledPlugins?.[COPILOT_PLUGIN_SELECTOR];
  if (current !== undefined && typeof current !== "boolean") {
    throw new Error(`AGDF_COPILOT_SETTINGS_AMBIGUOUS_PLUGIN_STATE: ${path}`);
  }
  const next = structuredClone(before.settings);
  next.enabledPlugins = { ...(next.enabledPlugins ?? {}), [COPILOT_PLUGIN_SELECTOR]: false };
  return Object.freeze({
    path,
    root,
    shared,
    audience: shared ? "shared" : "personal",
    selector: COPILOT_PLUGIN_SELECTOR,
    before: Object.freeze({ exists: before.exists, settings: structuredClone(before.settings), content: before.content }),
    settings: Object.freeze(next),
    changed: current !== false,
  });
}

export function applyCopilotRepositoryDisable(mutation, dependencies = {}) {
  if (!mutation?.path || mutation.selector !== COPILOT_PLUGIN_SELECTOR || mutation.settings?.enabledPlugins?.[COPILOT_PLUGIN_SELECTOR] !== false) {
    throw new Error("AGDF_COPILOT_SETTINGS_MUTATION_INVALID");
  }
  const read = dependencies.read ?? readCopilotSettings;
  const write = dependencies.writeSettings ?? ((path, settings) => atomicSettingsWrite(path, settings, dependencies));
  const writeContent = dependencies.writeContent ?? ((path, content) => atomicContentWrite(path, content, dependencies));
  const remove = dependencies.remove ?? rmSync;
  const resolvedPath = repositoryCopilotSettingsPath(mutation.root, { shared: mutation.shared });
  if (resolvedPath !== mutation.path) throw new Error("AGDF_COPILOT_SETTINGS_MUTATION_PATH_MISMATCH");
  const current = read(mutation.path);
  if (current.exists !== mutation.before.exists || (current.exists && current.content !== mutation.before.content)) {
    throw new Error(`AGDF_COPILOT_SETTINGS_CHANGED_DURING_APPLY: ${mutation.path}`);
  }
  if (!mutation.changed) return { status: "unchanged", path: mutation.path };
  try {
    write(mutation.path, mutation.settings);
    const verified = read(mutation.path);
    if (verified.settings.enabledPlugins?.[COPILOT_PLUGIN_SELECTOR] !== false) {
      throw new Error("AGDF_COPILOT_SETTINGS_VERIFICATION_FAILED");
    }
    return { status: "written", path: mutation.path };
  } catch (error) {
    try {
      if (mutation.before.exists) writeContent(mutation.path, mutation.before.content);
      else remove(mutation.path, { force: true });
    } catch (rollbackError) {
      error.rollbackError = rollbackError;
    }
    throw error;
  }
}

export function verifyCopilotRepositoryDisabled(targetDir, { shared = false } = {}) {
  try {
    const path = repositoryCopilotSettingsPath(targetDir, { shared });
    if (!existsSync(path)) return { status: "failed", evidence: [`missing:${path}`] };
    const state = readCopilotSettings(path);
    return state.settings.enabledPlugins?.[COPILOT_PLUGIN_SELECTOR] === false
      ? { status: "healthy", evidence: [`${path}:${COPILOT_PLUGIN_SELECTOR}:enabled=false`, `audience:${shared ? "shared" : "personal"}`] }
      : { status: "failed", evidence: [`postcondition_failed:${path}:${COPILOT_PLUGIN_SELECTOR}`] };
  } catch (error) {
    return { status: "failed", evidence: [`verification_failed:${resolve(targetDir)}:${error.message}`] };
  }
}

export function configureCopilotDeclarativePlugin({ path = defaultCopilotSettingsPath(), pluginRoot }) {
  if (typeof pluginRoot !== "string" || !pluginRoot.trim() || !isAbsolute(pluginRoot)) {
    throw new Error("AGDF_COPILOT_PLUGIN_SPEC_INVALID");
  }
  const spec = resolve(pluginRoot);
  if (!existsSync(spec) || !lstatSync(spec).isDirectory() || lstatSync(spec).isSymbolicLink()) {
    throw new Error("AGDF_COPILOT_PLUGIN_SPEC_UNAVAILABLE");
  }
  const before = readCopilotSettings(path);
  const next = structuredClone(before.settings);
  next.enabledPlugins = { ...(next.enabledPlugins ?? {}), [spec]: true };
  atomicSettingsWrite(path, next);
  const verified = readCopilotSettings(path);
  if (verified.settings.enabledPlugins?.[spec] !== true) throw new Error("AGDF_COPILOT_SETTINGS_VERIFICATION_FAILED");
  return {
    status: "configured_pending_restart",
    reason: "host_activation_unverified",
    path,
    spec,
    rollback() {
      if (before.exists) atomicContentWrite(path, before.content);
      else rmSync(path, { force: true });
    },
  };
}

export function revokeCopilotDeclarativePlugin({ path = defaultCopilotSettingsPath(), pluginRoot }) {
  const before = readCopilotSettings(path);
  if (!before.exists) return { status: "not_configured", path };
  const spec = resolve(pluginRoot);
  const next = structuredClone(before.settings);
  if (next.enabledPlugins && Object.hasOwn(next.enabledPlugins, spec)) {
    delete next.enabledPlugins[spec];
    if (Object.keys(next.enabledPlugins).length === 0) delete next.enabledPlugins;
    atomicSettingsWrite(path, next);
  }
  return { status: "removed", path, spec };
}
