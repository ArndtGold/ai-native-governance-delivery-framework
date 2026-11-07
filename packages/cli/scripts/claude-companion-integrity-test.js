import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fixture, treeBytes } from "../../core/test/control-cockpit-fixtures.js";
import { validateCopilotPayload } from "../../../scripts/public-plugin/copilot-profile.js";
import { validatePortableProfile } from "../../../scripts/public-plugin/validator.js";
import { processCalls } from "./companion-host-spelling.js";

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

// Companion core SDD-010 / SCN-022: the generated companion imports only its own modules, keeps no Core
// bridge or text file of its own, starts no process but the runtime's read-only run view, and the
// runtime it names answers that command without touching the control state.
const companionRoot = join(generated, "companion");
// The call finder sees what a text match missed: `spawn`, spacing before the parenthesis, and comments.
assert.deepEqual(processCalls("$.process.spawn({ argv: [] }); $.process.run (argv); // processes.run(x)\n"), ["$.process.spawn", "$.process.run"]);
const companionFiles = readdirSync(companionRoot);
for (const stale of ["core.mjs", "locales.json"]) assert.ok(!companionFiles.includes(stale), `the generated companion carries no ${stale}`);
for (const name of companionFiles.filter(file => file.endsWith(".mjs"))) {
  const source = readFileSync(join(companionRoot, name), "utf8");
  for (const [, specifier] of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/gu)) {
    assert.match(specifier, /^\.\/[a-z-]+\.mjs$/u, `${name} imports only companion modules, not ${specifier}`);
    assert.ok(companionFiles.includes(specifier.slice(2)), `${name} imports an existing companion module`);
  }
  assert.doesNotMatch(source, /\bimport\s*\(/u, `${name} uses no dynamic import`);
  // The host demands `$.process.run(...)` at the call site, so register.mjs holds the one wrapper that
  // the single run-view call of run-state.mjs goes through (T-013 finding F1); no module spawns (SDD-010).
  // Parsed, so comments cannot fake a call and `spawn` or spacing cannot hide one (delta review 2026-11-07).
  const expectedCalls = { "register.mjs": ["$.process.run"], "run-state.mjs": ["processes.run"] };
  assert.deepEqual(processCalls(source), expectedCalls[name] ?? [], `${name} process calls`);
}
{
  const { runViewArgv, snapshotFromRunView } = await import(pathToFileURL(join(companionRoot, "run-state.mjs")).href);
  const probe = fixture();
  try {
    const before = treeBytes(probe.root);
    const argv = runViewArgv({ pluginRoot: generated, root: probe.root, language: "de", runIds: ["fixture-completed"] });
    assert.deepEqual([argv[0], argv[2]], ["node", "run-view"]);
    assert.ok(existsSync(argv[1]), "the companion names the generated runtime entry");
    const ran = spawnSync(process.execPath, argv.slice(1), { encoding: "utf8", timeout: 60_000 });
    assert.equal(ran.status, 0, ran.stderr);
    const snapshot = snapshotFromRunView(ran.stdout, { now: 1 });
    assert.deepEqual([snapshot.status, snapshot.runs.map(run => run.id).sort()], ["ok", ["fixture-a", "fixture-completed"]]);
    assert.ok(snapshot.runs.every(run => run.figure?.mood), "every run carries the Core figure");
    assert.deepEqual(treeBytes(probe.root), before, "the run view leaves the project byte-identical");
  } finally {
    probe.close();
  }
}

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
    // Follow-up SCN-024: the notice module the adapter imports is part of the checked file set.
    ["notice module missing", root => rmSync(join(root, "companion", "notice.mjs")), /Claude companion file notice\.mjs/u],
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
