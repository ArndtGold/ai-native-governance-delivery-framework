import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { win32 } from "node:path";
import process from "node:process";

// Host CLIs installed through npm on Windows are .cmd shims, which execFile cannot start (ENOENT for
// the bare name, EINVAL for the shim itself since CVE-2024-27980). Recognized npm shims start their
// target directly, so no argument passes through cmd.exe; any other shim fails closed.
const LAUNCHABLE_EXTENSIONS = new Set([".com", ".exe"]);
const SHIM_EXTENSIONS = new Set([".bat", ".cmd"]);
const SHIM_BOILERPLATE = new Set([
  "@echo off", "goto start", ":find_dp0", "set dp0=%~dp0", "exit /b", ":start", "setlocal", "call :find_dp0",
  "endlocal", "exit /b %errorlevel%",
  "if exist \"%dp0%\\node.exe\" (", "set \"_prog=%dp0%\\node.exe\"", ") else (", "set \"_prog=node\"",
  "set pathext=%pathext:;.js;=;%", ")",
]);
const LAUNCH_PREFIX = /^endlocal & goto #_undefined_# 2>nul \|\| title %comspec% & /i;
const DIRECT_LAUNCH = /^"%dp0%\\([^"%*]+)"\s+%\*$/i;
const NODE_LAUNCH = /^"%_prog%"\s+((?:[^\s"%*]+\s+)*?)"%dp0%\\([^"%*]+)"\s+%\*$/i;

function envValue(env, name) {
  const key = Object.keys(env).find((candidate) => candidate.toUpperCase() === name);
  return key === undefined ? undefined : env[key];
}

function isFile(path, fs) {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
}

function unsupportedShim(path) {
  const error = new Error(`AGDF_HOST_COMMAND_UNSUPPORTED_SHIM: ${path} is not a recognized npm command shim; AGDF does not start host commands through cmd.exe.`);
  error.code = "AGDF_HOST_COMMAND_UNSUPPORTED_SHIM";
  return error;
}

export function findWindowsCommand(command, { env = process.env, fs = { statSync }, extensions } = {}) {
  const candidates = extensions ?? (envValue(env, "PATHEXT") || ".COM;.EXE;.BAT;.CMD").split(";")
    .map((extension) => extension.trim().toLowerCase())
    .filter((extension) => LAUNCHABLE_EXTENSIONS.has(extension) || SHIM_EXTENSIONS.has(extension));
  const directories = (envValue(env, "PATH") || "").split(";")
    .map((directory) => directory.trim().replace(/^"(.*)"$/, "$1"))
    .filter((directory) => directory && win32.isAbsolute(directory));
  for (const directory of directories) {
    for (const extension of candidates) {
      const candidate = win32.join(directory, `${command}${extension}`);
      if (isFile(candidate, fs)) return candidate;
    }
  }
  return null;
}

export function parseNpmCmdShim(shimPath, content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
  const launches = lines.filter((line) => line.includes("%*"));
  if (launches.length !== 1 || lines.some((line) => !line.includes("%*") && !SHIM_BOILERPLATE.has(line.toLowerCase()))) return null;
  const directory = win32.dirname(shimPath);
  const launch = launches[0].replace(LAUNCH_PREFIX, "");
  const direct = launch.match(DIRECT_LAUNCH);
  if (direct) {
    return LAUNCHABLE_EXTENSIONS.has(win32.extname(direct[1]).toLowerCase())
      ? { executable: win32.resolve(directory, direct[1]), prefixArgs: [] }
      : null;
  }
  const viaNode = launch.match(NODE_LAUNCH);
  if (!viaNode || !lines.some((line) => line.toLowerCase() === "set \"_prog=node\"")) return null;
  return {
    node: win32.join(directory, "node.exe"),
    prefixArgs: [...viaNode[1].split(/\s+/).filter(Boolean), win32.resolve(directory, viaNode[2])],
  };
}

export function resolveHostCommand(command, {
  env = process.env, platform = process.platform, execPath = process.execPath, fs = { readFileSync, statSync },
} = {}) {
  const unresolved = { executable: command, prefixArgs: [] };
  if (platform !== "win32" || /[\\/]/.test(command) || win32.extname(command)) return unresolved;
  const found = findWindowsCommand(command, { env, fs });
  if (!found) return unresolved;
  if (LAUNCHABLE_EXTENSIONS.has(win32.extname(found).toLowerCase())) return { executable: found, prefixArgs: [] };
  const shim = parseNpmCmdShim(found, fs.readFileSync(found, "utf8"));
  if (!shim) throw unsupportedShim(found);
  if (shim.executable) return { executable: shim.executable, prefixArgs: [] };
  const node = isFile(shim.node, fs) ? shim.node
    : findWindowsCommand("node", { env, fs, extensions: [".com", ".exe"] }) ?? execPath;
  return { executable: node, prefixArgs: shim.prefixArgs };
}

export function execHostFileSync(command, args = [], options = {}) {
  const { executable, prefixArgs } = resolveHostCommand(command, { env: options.env ?? process.env });
  return execFileSync(executable, [...prefixArgs, ...args], options);
}
