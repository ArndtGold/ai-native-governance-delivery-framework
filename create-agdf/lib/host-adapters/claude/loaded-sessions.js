import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { claudeConfigDir } from "./plugin-mcp.js";

// Claude Code marks every session that loaded a plugin version with `.in_use/<pid>` in its cache.
// A running session keeps files of the AGDF marketplace and cache open; on Windows those handles
// can block or break an in-place update, so the installer reports live sessions before the swap.
export function loadedClaudeSessions({ env = process.env, isAlive = processAlive } = {}) {
  const pluginCache = join(claudeConfigDir(env), "plugins", "cache", "agdf", "agdf");
  if (!existsSync(pluginCache)) return [];
  const sessions = [];
  for (const version of safeList(pluginCache)) {
    for (const entry of safeList(join(pluginCache, version, ".in_use"))) {
      const pid = Number(entry);
      if (Number.isInteger(pid) && pid > 0 && pid !== process.pid && isAlive(pid)) sessions.push({ pid, version });
    }
  }
  return sessions;
}

export function loadedSessionEvidence(sessions) {
  if (sessions.length === 0) return [];
  return [`claude_sessions_with_agdf:${sessions.map((session) => session.pid).join(",")}`];
}

export function loadedSessionLockHint(error, sessions) {
  if (sessions.length === 0 || !["EPERM", "EBUSY", "EACCES"].includes(error?.code)) return error;
  error.message = `${error.message} Claude Code sessions with AGDF loaded are still running (pid ${sessions.map((session) => session.pid).join(", ")}); close them and run the installation again.`;
  error.evidence = { ...(error.evidence ?? {}), claude_sessions_with_agdf: sessions.map((session) => session.pid).join(",") };
  return error;
}

function safeList(path) {
  try { return readdirSync(path); } catch { return []; }
}

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}
