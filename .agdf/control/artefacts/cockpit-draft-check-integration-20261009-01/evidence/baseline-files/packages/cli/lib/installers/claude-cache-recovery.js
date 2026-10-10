import { existsSync, lstatSync, realpathSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { win32 } from "node:path";
import process from "node:process";

function result(status, reason, removedPath = null, evidence = []) {
  return Object.freeze({ status, reason, removed_path: removedPath, evidence });
}

function normalized(path) {
  return win32.resolve(path).toLowerCase();
}

function parseRenameOperands(text) {
  const matches = [...text.matchAll(/\brename\s+['"]([^'"]+)['"]\s*->\s*['"]([^'"]+)['"]/gi)];
  return matches.length === 1 ? matches[0].slice(1, 3) : null;
}

export function recoverClaudeCacheTemp({
  error,
  expectedVersion,
  platform = process.platform,
  env = process.env,
  home = homedir(),
  fs = { existsSync, lstatSync, realpathSync, rmSync },
} = {}) {
  const text = String(error?.message ?? error ?? "");
  if (platform !== "win32" || !/\bEPERM\b/i.test(text) || !/\brename\b/i.test(text)) {
    return result("not_applicable", "claude_cache_temp_recovery_not_applicable");
  }
  const operands = parseRenameOperands(text);
  if (!operands || typeof expectedVersion !== "string" || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(expectedVersion)) {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  const configRoot = win32.resolve(env.CLAUDE_CONFIG_DIR || win32.join(home, ".claude"));
  const namespace = win32.join(configRoot, "plugins", "cache", "agdf", "agdf");
  const absoluteOperands = operands.filter((path) => win32.isAbsolute(path));
  if (absoluteOperands.length !== 2
      || absoluteOperands.some((path) => normalized(win32.dirname(path)) !== normalized(namespace))) {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  const [candidate, destination] = absoluteOperands;
  if (!/^temp_local_[0-9A-Za-z._-]+$/.test(win32.basename(candidate))
      || !fs.existsSync(candidate)) {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  if (win32.basename(destination) !== expectedVersion || fs.existsSync(destination)) {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  let candidateStats;
  let realNamespace;
  let realCandidate;
  try {
    candidateStats = fs.lstatSync(candidate);
    realNamespace = fs.realpathSync(namespace);
    realCandidate = fs.realpathSync(candidate);
  } catch {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  if (!candidateStats.isDirectory() || candidateStats.isSymbolicLink()
      || normalized(win32.dirname(realCandidate)) !== normalized(realNamespace)
      || normalized(realCandidate) !== normalized(candidate)) {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  try {
    fs.rmSync(candidate, { recursive: true, force: false });
  } catch {
    return result("unsafe", "claude_cache_temp_recovery_unsafe");
  }
  return result(
    "recovered",
    "claude_cache_temp_recovery_bounded_retry",
    candidate,
    [`cache_entry:${win32.basename(candidate)}`, `target_version:${expectedVersion}`],
  );
}
