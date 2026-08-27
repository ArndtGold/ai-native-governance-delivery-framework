import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { renameSyncWithRetry } from "../fs-swap.js";
import { applyClaudeExactRule, revokeClaudeExactRule } from "./adapters.js";

export function defaultClaudeSettingsPath({ env = process.env, home = homedir() } = {}) {
  return join(resolve(env.CLAUDE_CONFIG_DIR || join(home, ".claude")), "settings.json");
}

export function readClaudeSettings(path = defaultClaudeSettingsPath()) {
  if (!existsSync(path)) return { exists: false, settings: {} };
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("AGDF_CLAUDE_SETTINGS_UNOWNED_PATH");
  try {
    const settings = JSON.parse(readFileSync(path, "utf8"));
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("not an object");
    return { exists: true, settings };
  } catch (error) {
    throw new Error(`AGDF_CLAUDE_SETTINGS_INVALID: ${error.message}`);
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

export function configureClaudeExactRuntimeRule({ path = defaultClaudeSettingsPath(), rule }) {
  const before = readClaudeSettings(path);
  const permissions = before.settings.permissions ?? {};
  const applied = applyClaudeExactRule(before.settings, {
    rule,
    deny: Array.isArray(permissions.deny) ? permissions.deny : [],
    ask: Array.isArray(permissions.ask) ? permissions.ask : [],
  });
  if (applied.status !== "configured") return { ...applied, path, rollback() {} };
  atomicSettingsWrite(path, applied.settings);
  return {
    status: "configured",
    reason: "host_permission_unverified",
    path,
    rollback() {
      if (before.exists) atomicSettingsWrite(path, before.settings);
      else rmSync(path, { force: true });
    },
  };
}

export function revokeClaudeRuntimeRule({ path = defaultClaudeSettingsPath(), rule }) {
  const before = readClaudeSettings(path);
  if (!before.exists) return { status: "manual", reason: "configuration_missing", path };
  const next = revokeClaudeExactRule(before.settings, rule);
  atomicSettingsWrite(path, next);
  return { status: "manual", reason: "consent_not_provided", path };
}
