import { writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

// Byte-level templates of the .cmd shims npm (cmd-shim 8) writes for every global bin on Windows.
const HEAD = "@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n";

export function npmDirectCmdShim(target) {
  return `${HEAD}"%dp0%\\${target}"   %*\r\n`;
}

export function npmNodeCmdShim(target, args = "") {
  return `${HEAD}\r\nIF EXIST "%dp0%\\node.exe" (\r\n  SET "_prog=%dp0%\\node.exe"\r\n) ELSE (\r\n  SET "_prog=node"\r\n  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" ${args} "%dp0%\\${target}" %*\r\n`;
}

// Like npm, pair an extensionless node script with a .cmd shim on Windows. Returns the path a caller
// passes as an explicit executable: the shim on Windows, the script itself elsewhere.
export function withWindowsCmdShim(directory, name, { platform = process.platform } = {}) {
  if (platform !== "win32") return join(directory, name);
  const shim = join(directory, `${name}.cmd`);
  writeFileSync(shim, npmNodeCmdShim(name));
  return shim;
}
