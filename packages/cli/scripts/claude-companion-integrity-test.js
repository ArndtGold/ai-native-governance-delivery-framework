import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCopilotPayload } from "../../../scripts/public-plugin/copilot-profile.js";
import { validatePortableProfile } from "../../../scripts/public-plugin/validator.js";

// The generated runtime plugin carries the Claude companion only where SDD-01 and SDD-02 allow it
// (T-006; SCN-015, SCN-016): every deviation fails the integrity check, the portable runtime validator
// or the Copilot payload check. Runs after `node scripts/sync-package-assets.js`.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const generated = join(repoRoot, "packages", "cli", "generated", "plugins", "agdf");
const copilotGenerated = join(repoRoot, "packages", "cli", "generated", "plugins", "copilot", "agdf");
assert.ok(existsSync(join(generated, "companion", "register.mjs")), "generated runtime plugin with companion required: run node scripts/sync-package-assets.js");
assert.ok(!existsSync(join(copilotGenerated, "companion")), "the generated Copilot profile must not contain the companion");
const json = path => JSON.parse(readFileSync(path, "utf8"));
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const edit = (path, change) => { const value = json(path); change(value); save(path, value); };
const failuresOf = root => {
  const run = spawnSync(process.execPath, [join(root, "scripts", "check-runtime-integrity.mjs")],
    { encoding: "utf8", env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: root } });
  return { status: run.status, failures: `${run.stdout}${run.stderr}`.split(/\r?\n/u).filter(line => line.startsWith("- ")) };
};

// Short names: the copied MCP runtime is deep, and Windows paths stay below MAX_PATH.
const work = mkdtempSync(join(tmpdir(), "agdf-ci-"));
try {
  const copy = name => { const root = join(work, name); cpSync(generated, root, { recursive: true }); return root; };
  // A copy outside the package cannot resolve its own runtime digest; that baseline line is
  // independent of the companion, so each mutation must add its own failure on top of it.
  const baseline = failuresOf(copy("baseline")).failures;
  assert.ok(baseline.every(line => /surface-local runtime must pass exact-version digest resolution/u.test(line)), JSON.stringify(baseline));
  const claudeManifest = root => join(root, ".claude-plugin", "plugin.json");
  for (const [index, [name, mutate, expected]] of [
    ["runtime manifest without the companion", root => edit(claudeManifest(root), manifest => { delete manifest.hooks; }), /declare the companion only in the runtime profile/u],
    ["runtime manifest pointing at the shared hooks", root => edit(claudeManifest(root), manifest => { manifest.hooks = "./hooks/hooks.json"; }), /declare the companion only in the runtime profile/u],
    ["companion module missing", root => rmSync(join(root, "companion", "register.mjs")), /Claude companion file register\.mjs/u],
    ["descriptor redirected", root => save(join(root, "companion", "companion.json"), { schema_version: 1, hooks: "./companion/other.json" }), /descriptor must declare exactly/u],
    ["companion hooks with a second module", root => save(join(root, "companion", "hooks.json"), { modules: ["./register.mjs", "./extra.mjs"] }), /hooks must load only/u],
    ["Codex manifest referencing the companion", root => edit(join(root, ".codex-plugin", "plugin.json"), manifest => { manifest.companion = "./companion/hooks.json"; }), /Codex plugin manifest must not reference/u],
    ["shared hooks referencing the companion", root => edit(join(root, "hooks", "hooks.json"), hooks => { hooks.companion = true; }), /shared plugin hooks must not reference/u],
    ["shared definition referencing the companion", root => edit(join(root, "meta", "agdf-plugin.definition.json"), definition => { definition.claude.hooks = "./companion/hooks.json"; }), /shared AGDF plugin definition must not reference/u],
  ].entries()) {
    const root = copy(`m${index}`);
    mutate(root);
    const result = failuresOf(root);
    assert.notEqual(result.status, 0, `${name}: integrity must fail`);
    const added = result.failures.filter(line => !baseline.includes(line));
    assert.ok(added.some(line => expected.test(line)), `${name}: expected failure, got ${JSON.stringify(added)}`);
  }

  // The portable runtime validator enforces the descriptor-driven Claude manifest projection.
  const portable = copy("portable");
  validatePortableProfile(portable, { profile: "runtime" });
  edit(claudeManifest(portable), manifest => { delete manifest.hooks; });
  assert.throws(() => validatePortableProfile(portable, { profile: "runtime" }), /runtime Claude manifest differs from canonical projection/u);
  rmSync(join(portable, "companion"), { recursive: true });
  assert.throws(() => validatePortableProfile(portable, { profile: "runtime" }), /Claude companion descriptor/u);

  // The Copilot payload rejects any companion file, unmapped or mapped.
  const copilot = join(work, "copilot");
  cpSync(copilotGenerated, copilot, { recursive: true });
  cpSync(join(generated, "companion"), join(copilot, "companion"), { recursive: true });
  const definition = json(join(repoRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json"));
  const check = () => validateCopilotPayload({ profileRoot: copilot, repoRoot, expectedVersion: definition.version,
    expectedSkills: definition.skillSet.map(skill => skill.slug), baseline: json(join(repoRoot, "plugins", "agdf", "meta", "copilot-payload-baseline.json")), checkBudget: false });
  assert.throws(check, /AGDF_COPILOT_PAYLOAD_UNMAPPED: companion\//u);
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log("Claude companion integrity tests passed");
