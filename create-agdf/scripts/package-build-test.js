import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./sync-package-assets.js", import.meta.url));
const packageRoot = dirname(dirname(scriptPath));
const repoRoot = dirname(packageRoot);
const sourcePluginRoot = join(repoRoot, "plugin");
const generatedPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const generatedCopilotPluginRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const generatedOpenCodeRoot = join(packageRoot, "generated", ".opencode");
const generatedOpenCodeConfig = join(packageRoot, "generated", "opencode.json");
const generatedPublicPluginRoot = join(packageRoot, "generated", "submissions", "openai", "agdf");
const staleGeneratedPaths = [
  join(packageRoot, "generated", ".agdf", "control", "stale-owned-control.txt"),
  join(generatedOpenCodeRoot, "contracts", "stale-owned-contract.md"),
  join(generatedOpenCodeRoot, "skills", "agdf-gate-check", "stale-owned-skill.txt"),
];

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

function assertLfOnly(root) {
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) {
        assert.equal(readFileSync(path).includes(Buffer.from("\r\n")), false, `${relative(root, path)} must use LF line endings`);
      }
    }
  }
  visit(root);
}

function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function generatedDigestSnapshot() {
  return {
    shared: digestDirectory(generatedPluginRoot),
    copilot: digestDirectory(generatedCopilotPluginRoot),
    opencode: digestDirectory(generatedOpenCodeRoot),
    opencode_config: digestFile(generatedOpenCodeConfig),
    public_plugin: digestDirectory(generatedPublicPluginRoot),
  };
}

assert.equal(existsSync(join(sourcePluginRoot, "runtime")), false, "source plugin runtime must be absent before build");
const sourceBefore = digestDirectory(sourcePluginRoot);
for (const path of staleGeneratedPaths) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "stale generated fixture\n", "utf8");
}
execFileSync(process.execPath, [scriptPath], { stdio: "pipe" });
for (const path of staleGeneratedPaths) assert.equal(existsSync(path), false, `package sync must remove stale owned output ${path}`);
assertLfOnly(generatedPluginRoot);
assertLfOnly(generatedCopilotPluginRoot);
assertLfOnly(generatedOpenCodeRoot);
assertLfOnly(generatedPublicPluginRoot);
assert.equal(readFileSync(generatedOpenCodeConfig).includes(Buffer.from("\r\n")), false, "generated/opencode.json must use LF line endings");
const first = generatedDigestSnapshot();
execFileSync(process.execPath, [scriptPath], { stdio: "pipe" });
const second = generatedDigestSnapshot();
assert.deepEqual(second, first, "two complete builds must be byte-identical across shared, Copilot, OpenCode, config and public-plugin outputs");
assert.equal(digestDirectory(sourcePluginRoot), sourceBefore, "package build must not modify source plugin bytes");
assert.equal(existsSync(join(sourcePluginRoot, "runtime")), false, "package build must not materialize source plugin runtime");
console.log("Package build tests passed (all generated profiles byte-identical across complete builds; source untouched)");
