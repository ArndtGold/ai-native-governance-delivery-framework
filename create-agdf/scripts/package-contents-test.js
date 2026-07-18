import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const report = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: packageRoot,
  encoding: "utf8",
  stdio: "pipe",
}));
const files = report[0]?.files?.map((entry) => entry.path) ?? [];
const required = [
  "generated/plugins/agdf/.codex-plugin/plugin.json",
  "generated/plugins/agdf/.claude-plugin/plugin.json",
  "generated/plugins/agdf/runtime/agdf-local.js",
  "generated/plugins/agdf/runtime/runtime-manifest.json",
  "generated/plugins/agdf/runtime/create-agdf/bin/agdf-validator.js",
  "generated/plugins/agdf/runtime/create-agdf/lib/runtime/validator-application.js",
  "generated/plugins/agdf/scripts/check-runtime-integrity.mjs",
];
for (const path of required) {
  assert.equal(files.filter((candidate) => candidate === path).length, 1, `package must contain ${path} exactly once`);
}
assert.equal(new Set(files).size, files.length, "package file inventory must not contain duplicate paths");
assert.equal(files.some((path) => path.startsWith("plugin/runtime/")), false, "package must not leak a source plugin runtime path");
console.log(`Package contents tests passed (${files.length} files; complete release-built plugin present)`);
