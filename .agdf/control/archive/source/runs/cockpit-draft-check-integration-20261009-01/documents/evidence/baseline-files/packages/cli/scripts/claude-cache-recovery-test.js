import assert from "node:assert/strict";
import { win32 } from "node:path";
import { recoverClaudeCacheTemp } from "../lib/installers/claude-cache-recovery.js";

const home = "C:\\Users\\test";
const namespace = win32.join(home, ".claude", "plugins", "cache", "agdf", "agdf");
const candidate = win32.join(namespace, "temp_local_1234");
const destination = win32.join(namespace, "0.14.3");
const message = `EPERM: operation not permitted, rename '${candidate}' -> '${destination}'`;

function fakeFs({
  existing = [candidate],
  directory = true,
  symbolicLink = false,
  namespacePath = namespace,
  realNamespace = namespace,
  realCandidate = candidate,
} = {}) {
  const removed = [];
  return {
    removed,
    existsSync(path) { return existing.includes(path); },
    lstatSync() {
      return {
        isDirectory: () => directory,
        isSymbolicLink: () => symbolicLink,
      };
    },
    realpathSync(path) { return path === namespacePath ? realNamespace : realCandidate; },
    rmSync(path, options) { removed.push([path, options]); },
  };
}

{
  const fs = fakeFs();
  const recovered = recoverClaudeCacheTemp({
    error: new Error(message),
    expectedVersion: "0.14.3",
    platform: "win32",
    home,
    env: {},
    fs,
  });
  assert.equal(recovered.status, "recovered");
  assert.equal(recovered.removed_path, candidate);
  assert.deepEqual(fs.removed, [[candidate, { recursive: true, force: false }]]);
}

for (const fixture of [
  { label: "non-Windows", platform: "linux", message },
  { label: "non-EPERM", platform: "win32", message: message.replace("EPERM", "EACCES") },
  { label: "missing rename", platform: "win32", message: `EPERM: ${candidate}` },
  { label: "relative operand", platform: "win32", message: `EPERM rename 'temp_local_1234' -> '${destination}'` },
  { label: "outside namespace", platform: "win32", message: `EPERM rename 'C:\\temp_local_1234' -> '${destination}'` },
  { label: "wrong destination", platform: "win32", message: `EPERM rename '${candidate}' -> '${win32.join(namespace, "0.14.2")}'` },
  { label: "reversed operands", platform: "win32", message: `EPERM rename '${destination}' -> '${candidate}'` },
  { label: "ambiguous rename", platform: "win32", message: `${message}\n${message}` },
]) {
  const fs = fakeFs();
  const outcome = recoverClaudeCacheTemp({
    error: new Error(fixture.message),
    expectedVersion: "0.14.3",
    platform: fixture.platform,
    home,
    env: {},
    fs,
  });
  assert.notEqual(outcome.status, "recovered", fixture.label);
  assert.deepEqual(fs.removed, [], fixture.label);
}

{
  const fs = fakeFs();
  fs.rmSync = () => { throw Object.assign(new Error("locked"), { code: "EPERM" }); };
  const outcome = recoverClaudeCacheTemp({
    error: new Error(message),
    expectedVersion: "0.14.3",
    platform: "win32",
    home,
    env: {},
    fs,
  });
  assert.equal(outcome.status, "unsafe");
}

for (const [label, options] of [
  ["missing candidate", { existing: [] }],
  ["destination already exists", { existing: [candidate, destination] }],
  ["file candidate", { directory: false }],
  ["symbolic link", { symbolicLink: true }],
  ["junction escape", { realCandidate: "C:\\outside\\temp_local_1234" }],
  ["namespace escape", { realNamespace: "C:\\outside\\agdf" }],
]) {
  const fs = fakeFs(options);
  const outcome = recoverClaudeCacheTemp({
    error: new Error(message),
    expectedVersion: "0.14.3",
    platform: "win32",
    home,
    env: {},
    fs,
  });
  assert.equal(outcome.status, "unsafe", label);
  assert.deepEqual(fs.removed, [], label);
}

{
  const customRoot = "D:\\Claude";
  const customNamespace = win32.join(customRoot, "plugins", "cache", "agdf", "agdf");
  const customCandidate = win32.join(customNamespace, "temp_local_safe");
  const fs = fakeFs({
    existing: [customCandidate],
    namespacePath: customNamespace,
    realNamespace: customNamespace,
    realCandidate: customCandidate,
  });
  const outcome = recoverClaudeCacheTemp({
    error: new Error(`EPERM rename '${customCandidate}' -> '${win32.join(customNamespace, "0.14.3")}'`),
    expectedVersion: "0.14.3",
    platform: "win32",
    home,
    env: { CLAUDE_CONFIG_DIR: customRoot },
    fs,
  });
  assert.equal(outcome.status, "recovered");
}

console.log("Claude cache recovery tests passed");
