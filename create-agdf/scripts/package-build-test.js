import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./sync-package-assets.js", import.meta.url));
const packageRoot = dirname(dirname(scriptPath));
const repoRoot = dirname(packageRoot);
const sourcePluginRoot = join(repoRoot, "plugin");
const generatedPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const generatedCopilotPluginRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");

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

assert.equal(existsSync(join(sourcePluginRoot, "runtime")), false, "source plugin runtime must be absent before build");
const sourceBefore = digestDirectory(sourcePluginRoot);
execFileSync(process.execPath, [scriptPath], { stdio: "pipe" });
const first = digestDirectory(generatedPluginRoot);
const firstCopilot = digestDirectory(generatedCopilotPluginRoot);
execFileSync(process.execPath, [scriptPath], { stdio: "pipe" });
const second = digestDirectory(generatedPluginRoot);
const secondCopilot = digestDirectory(generatedCopilotPluginRoot);
assert.equal(second, first, "two complete plugin builds must be byte-identical");
assert.equal(secondCopilot, firstCopilot, "two Copilot profile builds must be byte-identical");
assert.equal(digestDirectory(sourcePluginRoot), sourceBefore, "package build must not modify source plugin bytes");
assert.equal(existsSync(join(sourcePluginRoot, "runtime")), false, "package build must not materialize source plugin runtime");
console.log("Package build tests passed (byte-identical complete builds; source untouched)");
