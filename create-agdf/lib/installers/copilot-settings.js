import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { renameSyncWithRetry } from "../fs-swap.js";

export function defaultCopilotSettingsPath({ env = process.env, home = homedir() } = {}) {
  return join(resolve(env.COPILOT_HOME || join(home, ".copilot")), "settings.json");
}

export function readCopilotSettings(path = defaultCopilotSettingsPath()) {
  if (!existsSync(path)) return { exists: false, settings: {} };
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("AGDF_COPILOT_SETTINGS_UNOWNED_PATH");
  try {
    const settings = JSON.parse(readFileSync(path, "utf8"));
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("not an object");
    if (settings.enabledPlugins !== undefined
        && (!settings.enabledPlugins || typeof settings.enabledPlugins !== "object" || Array.isArray(settings.enabledPlugins))) {
      throw new Error("enabledPlugins must be an object");
    }
    return { exists: true, settings };
  } catch (error) {
    throw new Error(`AGDF_COPILOT_SETTINGS_INVALID: ${error.message}`);
  }
}

function atomicSettingsWrite(path, settings) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.agdf-tmp-${process.pid}`;
  const backup = `${path}.agdf-backup-${process.pid}`;
  const hadPrevious = existsSync(path);
  const mode = hadPrevious ? lstatSync(path).mode & 0o777 : 0o600;
  writeFileSync(temp, `${JSON.stringify(settings, null, 2)}\n`, { encoding: "utf8", flag: "wx", mode });
  if (process.platform !== "win32") chmodSync(temp, mode);
  try {
    if (hadPrevious && process.platform === "win32") renameSyncWithRetry(path, backup);
    renameSyncWithRetry(temp, path);
    if (hadPrevious && process.platform === "win32") rmSync(backup, { force: true });
  } catch (error) {
    try { rmSync(temp, { force: true }); } catch {}
    if (hadPrevious && process.platform === "win32" && existsSync(backup) && !existsSync(path)) renameSyncWithRetry(backup, path);
    throw error;
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
      if (before.exists) atomicSettingsWrite(path, before.settings);
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
