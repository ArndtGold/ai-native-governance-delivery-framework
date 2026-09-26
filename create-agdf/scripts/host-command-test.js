import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, win32 } from "node:path";
import process from "node:process";
import { execHostFileSync, findWindowsCommand, parseNpmCmdShim, resolveHostCommand, spawnHostSync } from "../lib/host-command.js";
import { npmDirectCmdShim as directShim, npmNodeCmdShim as nodeShim } from "./support/npm-cmd-shim.js";

const legacyNodeShim = (target) => `@ECHO off\r\nSETLOCAL\r\nCALL :find_dp0\r\n\r\nIF EXIST "%dp0%\\node.exe" (\r\n  SET "_prog=%dp0%\\node.exe"\r\n) ELSE (\r\n  SET "_prog=node"\r\n  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n)\r\n\r\n"%_prog%"  "%dp0%\\${target}" %*\r\nENDLOCAL\r\nEXIT /b %errorlevel%\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n`;

function fakeFs(files) {
  return {
    statSync(path) {
      if (!Object.hasOwn(files, path)) throw Object.assign(new Error(`ENOENT: ${path}`), { code: "ENOENT" });
      return { isFile: () => true };
    },
    readFileSync(path) {
      return files[path];
    },
  };
}

function resolveWith(command, files, env = { Path: "C:\\a;C:\\b" }, options = {}) {
  return resolveHostCommand(command, { platform: "win32", env, fs: fakeFs(files), execPath: "C:\\agdf\\node.exe", ...options });
}

// Non-Windows hosts and explicit paths or extensions keep the caller's command unchanged.
assert.deepEqual(resolveHostCommand("claude", { platform: "linux", env: { PATH: "/usr/bin" }, fs: fakeFs({}) }), { executable: "claude", prefixArgs: [] });
for (const command of ["npm.cmd", "C:\\tools\\claude.exe", "./claude", "bin/claude"]) {
  assert.deepEqual(resolveWith(command, { "C:\\a\\claude.exe": "" }), { executable: command, prefixArgs: [] }, command);
}

// Resolution follows cmd.exe: PATH order first, then PATHEXT order, extensionless and relative entries ignored.
assert.deepEqual(resolveWith("claude", { "C:\\b\\claude.exe": "" }), { executable: "C:\\b\\claude.exe", prefixArgs: [] });
assert.deepEqual(resolveWith("claude", { "C:\\a\\claude.exe": "", "C:\\a\\claude.cmd": directShim("other.exe") }).executable, "C:\\a\\claude.exe");
assert.deepEqual(resolveWith("tool", { "C:\\a\\tool.cmd": directShim("node_modules\\tool\\bin\\tool.exe"), "C:\\b\\tool.exe": "" }).executable,
  "C:\\a\\node_modules\\tool\\bin\\tool.exe");
assert.deepEqual(resolveWith("tool", { "C:\\a\\tool": "#!/bin/sh", "C:\\b\\tool.exe": "" }).executable, "C:\\b\\tool.exe");
assert.equal(findWindowsCommand("tool", { env: { PATH: ".;relative\\bin;\"C:\\quoted dir\"" }, fs: fakeFs({ "tool.exe": "", "C:\\quoted dir\\tool.exe": "" }) }),
  "C:\\quoted dir\\tool.exe");
assert.equal(findWindowsCommand("tool", { env: { PATH: "C:\\a", PATHEXT: ".JS;.PS1;.EXE" }, fs: fakeFs({ "C:\\a\\tool.js": "", "C:\\a\\tool.exe": "" }) }),
  "C:\\a\\tool.exe");
assert.deepEqual(resolveWith("codex", {}), { executable: "codex", prefixArgs: [] }, "an unavailable host keeps the ENOENT path");
assert.equal(resolveWith("tool", { "C:\\a\\tool.exe": "", "C:\\b\\tool.exe": "" }, { Path: "C:\\a", PATH: "C:\\b" }).executable, "C:\\b\\tool.exe",
  "duplicate PATH keys must resolve like Node's spawn, which uses the lexicographically first key");

// Recognized npm cmd-shim templates start their target directly.
assert.deepEqual(resolveWith("opencode", { "C:\\a\\opencode.cmd": directShim("node_modules\\opencode-ai\\bin\\opencode.exe") }),
  { executable: "C:\\a\\node_modules\\opencode-ai\\bin\\opencode.exe", prefixArgs: [] });
const codexShim = nodeShim("node_modules\\@openai\\codex\\bin\\codex.js");
assert.deepEqual(resolveWith("codex", { "C:\\a\\codex.cmd": codexShim, "C:\\a\\node.exe": "" }),
  { executable: "C:\\a\\node.exe", prefixArgs: ["C:\\a\\node_modules\\@openai\\codex\\bin\\codex.js"] });
assert.deepEqual(resolveWith("codex", { "C:\\a\\codex.cmd": codexShim, "C:\\b\\node.exe": "" }),
  { executable: "C:\\b\\node.exe", prefixArgs: ["C:\\a\\node_modules\\@openai\\codex\\bin\\codex.js"] });
assert.deepEqual(resolveWith("codex", { "C:\\a\\codex.cmd": codexShim }),
  { executable: "C:\\agdf\\node.exe", prefixArgs: ["C:\\a\\node_modules\\@openai\\codex\\bin\\codex.js"] });
assert.deepEqual(parseNpmCmdShim("C:\\a\\tool.cmd", nodeShim("node_modules\\tool\\cli.js", "--no-warnings")).prefixArgs,
  ["--no-warnings", "C:\\a\\node_modules\\tool\\cli.js"]);
assert.deepEqual(parseNpmCmdShim("C:\\a\\tool.cmd", legacyNodeShim("node_modules\\tool\\cli.js")).prefixArgs, ["C:\\a\\node_modules\\tool\\cli.js"]);
assert.deepEqual(parseNpmCmdShim("C:\\a\\tool.bat", directShim("..\\pkg\\tool.exe")), { executable: "C:\\pkg\\tool.exe", prefixArgs: [] });
assert.deepEqual(resolveWith("C:\\opt\\opencode.cmd", { "C:\\opt\\opencode.cmd": directShim("node_modules\\opencode-ai\\bin\\opencode.exe") }),
  { executable: "C:\\opt\\node_modules\\opencode-ai\\bin\\opencode.exe", prefixArgs: [] }, "an explicit shim path is resolved like a PATH match");
assert.throws(() => resolveWith("C:\\opt\\missing.cmd", {}), (error) => error.code === "ENOENT", "a missing explicit shim reports ENOENT");

// Anything that is not exactly an npm shim fails closed instead of running through cmd.exe.
for (const [label, content] of [
  ["arbitrary batch", "@echo off\r\ncall \"%~dp0\\run.bat\" %*\r\n"],
  ["injected command", codexShim.replace("SETLOCAL\r\n", "SETLOCAL\r\ncurl https://example.invalid\r\n")],
  ["non-executable direct target", directShim("node_modules\\tool\\cli.js")],
  ["second launch line", `${directShim("tool.exe")}"%dp0%\\other.exe" %*\r\n`],
  ["foreign interpreter", codexShim.replaceAll("node.exe", "sh.exe").replace("SET \"_prog=node\"", "SET \"_prog=sh\"")],
  ["percent in target", directShim("%TEMP%\\tool.exe")],
]) {
  assert.throws(() => resolveWith("tool", { "C:\\a\\tool.cmd": content }), (error) => error.code === "AGDF_HOST_COMMAND_UNSUPPORTED_SHIM"
    && error.message.includes("C:\\a\\tool.cmd"), label);
}

if (process.platform === "win32") {
  const root = mkdtempSync(join(tmpdir(), "agdf-host-command-"));
  try {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toUpperCase() !== "PATH"));
    env.Path = `${root};${process.env.PATH}`;
    const hostile = ["plain", "with space", "a&b|c", "%PATH%", "quote\"inside", "caret^", "(paren)", "!bang!", ""];
    mkdirSync(join(root, "node_modules", "probe"), { recursive: true });
    writeFileSync(join(root, "node_modules", "probe", "cli.js"), "process.stdout.write(JSON.stringify(process.argv.slice(2)));\n");
    writeFileSync(join(root, "probe.cmd"), nodeShim("node_modules\\probe\\cli.js"));
    assert.deepEqual(JSON.parse(execHostFileSync("probe", hostile, { env, encoding: "utf8" })), hostile,
      "arguments must reach a node shim target verbatim");
    const nodeTarget = win32.relative(root, process.execPath);
    if (!win32.isAbsolute(nodeTarget)) {
      writeFileSync(join(root, "direct.cmd"), directShim(nodeTarget));
      const echoArgv = "process.stdout.write(JSON.stringify(process.argv.slice(1)))";
      assert.deepEqual(JSON.parse(execHostFileSync("direct", ["-e", echoArgv, ...hostile], { env, encoding: "utf8" })), hostile,
        "arguments must reach a native shim target verbatim");
    }
    const marker = join(root, "executed.txt");
    writeFileSync(join(root, "bad.cmd"), `@echo off\r\necho executed > "${marker}"\r\n`);
    assert.throws(() => execHostFileSync("bad", [], { env }), (error) => error.code === "AGDF_HOST_COMMAND_UNSUPPORTED_SHIM");
    assert.equal(spawnHostSync("bad", [], { env }).error?.code, "AGDF_HOST_COMMAND_UNSUPPORTED_SHIM", "spawnHostSync reports instead of throwing");
    assert.equal(existsSync(marker), false, "an unsupported shim must never run");
    const spawned = spawnHostSync(join(root, "probe.cmd"), hostile, { env, encoding: "utf8" });
    assert.equal(spawned.status, 0, spawned.stderr);
    assert.deepEqual(JSON.parse(spawned.stdout), hostile, "an explicit shim path must reach its target verbatim");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
} else {
  console.log(`[host-command-test] SKIPPED live Windows shim assertions on ${process.platform}`);
}

console.log("Host command tests passed");
