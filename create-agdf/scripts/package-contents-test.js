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
const pluginDefinition = JSON.parse(readFileSync(new URL("../../plugin/meta/agdf-plugin.definition.json", import.meta.url), "utf8"));
const required = [
  "generated/.opencode/AGDF.md",
  "generated/.opencode/agdf-agent-router.md",
  "generated/plugins/agdf/.codex-plugin/plugin.json",
  "generated/plugins/agdf/.claude-plugin/plugin.json",
  "generated/plugins/copilot/agdf/plugin.json",
  "generated/plugins/copilot/agdf/hooks/copilot-hooks.json",
  "generated/plugins/copilot/agdf/copilot-skills/agdf-gate-check/SKILL.md",
  "generated/plugins/copilot/agdf/copilot-skills/agdf-runtime-contract.md",
  "generated/plugins/copilot/agdf/copilot-skills/contracts/interaction.md",
  "generated/plugins/copilot/agdf/.agdf-payload-inventory.json",
  "generated/plugins/copilot/agdf/runtime/agdf-local.js",
  "generated/plugins/copilot/agdf/runtime/runtime-manifest.json",
  "generated/plugins/copilot/agdf/runtime/create-agdf/bin/agdf-validator.js",
  "generated/plugins/copilot/agdf/runtime/create-agdf/lib/runtime/validator-application.js",
  "generated/plugins/agdf/runtime/agdf-local.js",
  "generated/plugins/agdf/runtime/runtime-manifest.json",
  "generated/plugins/agdf/runtime/create-agdf/bin/agdf-validator.js",
  "generated/plugins/agdf/runtime/create-agdf/lib/runtime/validator-application.js",
  "generated/plugins/agdf/scripts/check-runtime-integrity.mjs",
  "generated/plugins/agdf/scripts/agent-skills-conformance.mjs",
  "generated/plugins/agdf/scripts/instruction-footprint.mjs",
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
for (const excluded of [
  "generated/plugins/agdf/plugin.json",
  "generated/plugins/agdf/hooks/copilot-hooks.json",
  "generated/plugins/agdf/copilot-skills/agdf-gate-check/SKILL.md",
]) assert.equal(files.includes(excluded), false, `shared plugin package must exclude Copilot-only path ${excluded}`);
assert.equal(new Set(files).size, files.length, "package file inventory must not contain duplicate paths");
assert.equal(packageManifest.files.includes("generated"), false, "package manifest must not include the unbounded generated tree");
assert.equal(
  files.some((path) => path.includes("/.agdf-build-") || path.includes("/agdf 2/") || path.startsWith("generated/submissions/openai/agdf 2/")),
  false,
  "package must exclude stale build directories and non-canonical OpenAI submission siblings",
);
assert.equal(
  files.filter((path) => path.startsWith("generated/submissions/openai/")).every((path) => path.startsWith("generated/submissions/openai/agdf/")),
  true,
  "only the canonical OpenAI submission directory may be packed",
);
const expectedContractNames = new Set(pluginDefinition.runtimeContract.modules.map((path) => path.slice("meta/contracts/".length)));
for (const path of files.filter((candidate) => candidate.startsWith("generated/.opencode/contracts/"))) {
  assert.equal(expectedContractNames.has(path.slice("generated/.opencode/contracts/".length)), true, `package must not contain unknown OpenCode contract ${path}`);
}
const expectedOpenCodeSkills = new Set(pluginDefinition.skillSet.map(({ slug }) => `${pluginDefinition.opencode.skillPrefix}${slug}`));
for (const path of files.filter((candidate) => candidate.startsWith("generated/.opencode/skills/"))) {
  const match = /^generated\/\.opencode\/skills\/([^/]+)\/SKILL\.md$/.exec(path);
  assert.ok(match && expectedOpenCodeSkills.has(match[1]), `package must not contain unknown OpenCode skill content ${path}`);
}
for (const retiredPath of [
  "generated/AGENTS.md",
  "generated/.github/copilot-instructions.md",
  "generated/.github/instructions/agdf-governance.instructions.md",
]) assert.equal(files.includes(retiredPath), false, `package must not contain retired Copilot repository projection ${retiredPath}`);
assert.equal(files.some((path) => path.startsWith("generated/.github/skills/")), false, "package must not contain retired Copilot repository skills");
for (const [name, target] of Object.entries(packageManifest.bin ?? {})) {
  assert.equal(files.includes(target.replace(/^\.\//, "")), true, `declared bin ${name} must exist in packed files`);
}
for (const [name, target] of Object.entries(packageManifest.exports ?? {})) {
  assert.equal(typeof target, "string", `export ${name} must be a direct string target`);
  assert.equal(files.includes(target.replace(/^\.\//, "")), true, `declared export ${name} must exist in packed files`);
}
assert.equal(files.some((path) => path.startsWith("plugin/runtime/")), false, "package must not leak a source plugin runtime path");
for (const host of ["codex", "claude", "copilot", "opencode"]) {
  assert.ok(files.includes(`lib/host-adapters/${host}/session-command.js`));
  for (const profile of ["generated/plugins/agdf", "generated/plugins/copilot/agdf"]) {
    assert.ok(files.includes(`${profile}/runtime/create-agdf/lib/host-adapters/${host}/session-command.js`));
  }
}
for (const host of ["codex", "claude", "copilot"]) assert.ok(files.includes(`lib/host-adapters/${host}/plugin.js`));
assert.equal(files.some(path => path.includes("/host-compatibility/") || path.startsWith("evals/")), false, "repository comparison tooling and observations must not ship");
for (const path of files.filter(path => path.includes("/runtime/create-agdf/lib/host-adapters/"))) {
  assert.ok(path.endsWith("/session-command.js"), `installed runtime must contain only pure command leaves: ${path}`);
}
console.log(`Package contents tests passed (${files.length} files; complete release-built plugin present)`);
