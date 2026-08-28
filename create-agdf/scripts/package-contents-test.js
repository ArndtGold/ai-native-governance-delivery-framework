import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const packOutput = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: packageRoot,
  encoding: "utf8",
  stdio: "pipe",
});
const reportStart = packOutput.search(/^\[/m);
assert.notEqual(reportStart, -1, "npm pack must emit a JSON report after prepack output");
const report = JSON.parse(packOutput.slice(reportStart));
const files = report[0]?.files?.map((entry) => entry.path) ?? [];
const packageManifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const required = [
  "generated/plugins/agdf/.codex-plugin/plugin.json",
  "generated/plugins/agdf/.claude-plugin/plugin.json",
  "generated/plugins/agdf/plugin.json",
  "generated/plugins/agdf/hooks/copilot-hooks.json",
  "generated/plugins/agdf/copilot-skills/agdf-gate-check/SKILL.md",
  "generated/plugins/agdf/copilot-skills/agdf-runtime-contract.md",
  "generated/plugins/agdf/copilot-skills/contracts/interaction.md",
  "generated/plugins/agdf/runtime/agdf-local.js",
  "generated/plugins/agdf/runtime/runtime-manifest.json",
  "generated/plugins/agdf/runtime/create-agdf/bin/agdf-validator.js",
  "generated/plugins/agdf/runtime/create-agdf/lib/runtime/validator-application.js",
  "generated/plugins/agdf/scripts/check-runtime-integrity.mjs",
  "generated/plugins/agdf/scripts/agent-skills-conformance.mjs",
  "generated/plugins/agdf/meta/agent-skills-conformance.json",
  "generated/plugins/agdf/skills/ux-intent-definition/SKILL.md",
  "generated/plugins/agdf/skills/ux-intent-definition/help.md",
  "generated/plugins/agdf/control/templates/artefacts/UX_INTENT_DEFINITION.md",
  "generated/submissions/openai/agdf/.codex-plugin/plugin.json",
  "generated/submissions/openai/agdf/submission/openai/inventory.json",
  "generated/submissions/openai/agdf/submission/openai/readiness.json",
  "generated/submissions/openai/agdf/submission/openai/readiness.md",
];
for (const path of required) {
  assert.equal(files.filter((candidate) => candidate === path).length, 1, `package must contain ${path} exactly once`);
}
assert.equal(new Set(files).size, files.length, "package file inventory must not contain duplicate paths");
for (const [name, target] of Object.entries(packageManifest.bin ?? {})) {
  assert.equal(files.includes(target.replace(/^\.\//, "")), true, `declared bin ${name} must exist in packed files`);
}
for (const [name, target] of Object.entries(packageManifest.exports ?? {})) {
  assert.equal(typeof target, "string", `export ${name} must be a direct string target`);
  assert.equal(files.includes(target.replace(/^\.\//, "")), true, `declared export ${name} must exist in packed files`);
}
assert.equal(files.some((path) => path.startsWith("plugin/runtime/")), false, "package must not leak a source plugin runtime path");
console.log(`Package contents tests passed (${files.length} files; complete release-built plugin present)`);
