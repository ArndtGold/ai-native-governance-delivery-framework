import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCopilotPayload } from "../../../scripts/public-plugin/copilot-profile.js";
import { ensurePluginMcpRuntime } from '../lib/mcp-lifecycle/plugin-runtime.js';
import { offlineNpm } from '../../../scripts/support/plugin-mcp-fixture.js';
import { withStdioClient } from '../../mcp-server/test/helpers.js';
import { initializeCanonicalControl } from '../lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../lib/scaffold/plan.js';
import { createRun } from '../../core/lib/control-state/run-state-repository.js';

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(dirname(packageRoot));
const generatedRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const definition = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json"), "utf8"));
const baseline = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", "meta", "copilot-payload-baseline.json"), "utf8"));
const expectedSkills = definition.skillSet.map(({ slug }) => slug);
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-copilot-profile-"));
const sha256 = (content) => createHash("sha256").update(content).digest("hex");

function inventory(root) {
  return JSON.parse(readFileSync(join(root, ".agdf-payload-inventory.json"), "utf8"));
}

function writeInventory(root, value) {
  writeFileSync(join(root, ".agdf-payload-inventory.json"), `${JSON.stringify(value, null, 2)}\n`);
}

function validate(root, options = {}) {
  return validateCopilotPayload({
    profileRoot: root,
    repoRoot,
    expectedVersion: definition.version,
    expectedSkills,
    baseline,
    ...options,
  });
}

function fixture(name, action) {
  const root = join(fixtureRoot, name);
  cpSync(generatedRoot, root, { recursive: true });
  action(root);
}

try {
  const first = validate(generatedRoot);
  const inventoryEntries = inventory(generatedRoot).entries;
  for (const name of ["UR.md", "PRD.md", "SD.md", "TP.md", "UX_INTENT_DEFINITION.md",
    "BROWNFIELD_REVIEW.md", "VERIFIED_CHANGE.md", "QA_REPORT.md", "OR.md"]) {
    const destination = `control/templates/artefacts/${name}`;
    const source = `plugins/agdf/control/templates/artefacts/${name}`;
    assert.equal(readFileSync(join(generatedRoot, destination), "utf8"), readFileSync(join(repoRoot, source), "utf8"),
      `Copilot payload must ship the canonical ${name} template`);
    const bound = inventoryEntries.filter((entry) => entry.destination === destination);
    assert.equal(bound.length, 1, `Copilot inventory must contain ${name} exactly once`);
    assert.equal(bound[0].source, source, `Copilot inventory must bind ${name} to its canonical source`);
  }
  for (const module of ['control-inspect/cockpit.js', 'control-inspect/cockpit-contract.js', 'control-inspect/cockpit-session.js', 'control-inspect/cockpit-context.js',
    'control-read/cockpit-worker.js', 'control-inspect/decision-session.js', 'control-state/decision-action-service.js', 'control-state/decision-action-contract.js', 'interaction-catalog.d.ts']) {
    assert.equal(existsSync(join(generatedRoot, 'runtime/create-agdf/runtime/core/lib', module)), false,
      'private Codex cockpit read closure must stay outside the default Copilot payload');
  }
  const runtime = await import(new URL('../generated/plugins/copilot/agdf/runtime/create-agdf/lib/mcp-dispatch-runtime.js', import.meta.url));
  const protocol = await import(new URL('../generated/plugins/copilot/agdf/runtime/create-agdf/lib/mcp-protocol-runtime.js', import.meta.url));
  const front = protocol.createMcpTransportRuntime({ surface: 'copilot' });
  const dispatcher = runtime.createMcpDispatchRuntime({ surface:'copilot' });
  assert.deepEqual(front.tools.map(tool => tool.definition), dispatcher.tools.map(tool => tool.definition),
    'the actual reduced headless front shares full canonical contracts without optional private UI imports');
  assert.deepEqual(dispatcher.tools.map(tool => tool.name), ['agdf_dispatch', 'agdf_inspect', 'agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout']);
  await dispatcher.close();
  await assert.rejects(runtime.createMcpCockpitRuntime({ surface:'copilot', cockpitDir:fixtureRoot }), /AGDF_COCKPIT_TARGET_INVALID/);
  for (const module of ['control-read/cockpit-pool.js', 'control-read/doctor-worker.js']) {
    const destination = `runtime/create-agdf/runtime/core/lib/${module}`;
    const entry = inventoryEntries.find(entry => entry.destination === destination);
    assert.equal(entry?.owner, 'scripts/sync-plugin-runtime.js');
    assert.equal(entry.rule, 'generated_exact_runtime');
    assert.equal(entry.digest, sha256(readFileSync(join(repoRoot, 'packages/core/lib', module))),
      'the shared diagnostic worker closure must retain exact canonical Core bytes under its existing projection owner');
  }
  // Exercise the actual reduced Copilot payload/launcher and owned provenance,
  // not a substituted full CLI or a native-host qualification claim.
  const diagnosis = join(fixtureRoot, 'doctor-target'), dataRoot = join(fixtureRoot, 'mcp-data');
  mkdirSync(join(diagnosis, '.git'), { recursive: true });
  writeFileSync(join(diagnosis, '.git/HEAD'), 'ref: refs/heads/main\n');
  initializeCanonicalControl(diagnosis, generatedFilesForTarget('init', diagnosis, false, 'en'));
  createRun(diagnosis, 'copilot-diagnostic');
  const prepared = ensurePluginMcpRuntime({ pluginRoot: generatedRoot, dataRoot, exec: offlineNpm });
  await withStdioClient({ root: prepared.root, command: process.execPath,
    args: [join(generatedRoot, 'mcp/agdf-mcp-launch.js'), '--surface', 'copilot', '--data', dataRoot] }, async client => {
    for (const scope of [{ run_id: 'copilot-diagnostic' }, { all_active: true }]) {
      const result = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'en',
        working_directory: diagnosis, primary_target: diagnosis, target_source: 'explicit_target', ...scope } });
      assert.equal(result.isError, undefined, JSON.stringify(result));
      assert.equal(result.structuredContent.report.available, true, JSON.stringify(result));
      assert.equal(result.structuredContent.report.completeness, 'complete');
    }
  });
  for (const max_bytes of [null, NaN, Infinity, -1, "9999999"]) {
    assert.throws(() => validate(generatedRoot, { baseline: { ...baseline, max_bytes } }), /BASELINE_INVALID/);
  }
  const second = validate(generatedRoot);
  assert.equal(second.inventoryDigest, first.inventoryDigest, "unchanged Copilot payload inventory must be deterministic");
  const hooks = JSON.parse(readFileSync(join(generatedRoot, "com.github.copilot", "hooks", "hooks.json"), "utf8"));
  assert.deepEqual(Object.keys(hooks.hooks), ["sessionStart"], "Copilot profile must expose only the existing sessionStart hook");
  assert.equal(hooks.hooks.sessionStart.length, 1, "Copilot profile must expose one passive sessionStart command");
  assert.equal(JSON.stringify(hooks).includes("tool.execute.before"), false, "Copilot profile must not add a prompt or pre-tool classifier hook");
  const canonicalContract = readFileSync(join(repoRoot, "plugins", "agdf", "meta", "contracts", "request-activation.md"), "utf8");
  const fingerprint = /- `guard_fingerprint`: `(sha256:[0-9a-f]{64})`/.exec(canonicalContract)?.[1];
  assert.ok(fingerprint, "canonical Request Activation fingerprint must be available");
  for (const slug of expectedSkills) {
    const skillPath = join(generatedRoot, "skills", `${definition.copilot.skillPrefix}${slug}`, "SKILL.md");
    const skill = readFileSync(skillPath, "utf8");
    assert.equal((skill.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->/g) ?? []).length, 1, `${slug} must contain one Request Activation Guard`);
    assert.equal((skill.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->/g) ?? []).length, 1, `${slug} must contain one complete Request Activation Guard`);
    assert.ok(skill.includes(`- \`guard_fingerprint\`: \`${fingerprint}\``), `${slug} must carry the canonical Request Activation fingerprint`);
  }

  fixture("unmapped", (root) => {
    writeFileSync(join(root, "unexpected.txt"), "not inventoried\n");
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_UNMAPPED/);
  });
  fixture("missing", (root) => {
    unlinkSync(join(root, "plugin.json"));
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_MISSING/);
  });
  fixture("digest", (root) => {
    writeFileSync(join(root, "plugin.json"), "{}\n");
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_DIGEST_MISMATCH/);
    assert.throws(() => validate(root, { checkBudget: false }), /AGDF_COPILOT_PAYLOAD_DIGEST_MISMATCH/);
  });
  fixture("stale-source", (root) => {
    const value = inventory(root);
    const entry = value.entries.find((candidate) => candidate.source);
    entry.source_digest = "0".repeat(64);
    writeInventory(root, value);
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_STALE_SOURCE/);
  });
  fixture("duplicate", (root) => {
    const value = inventory(root);
    value.entries.push({ ...value.entries[0] });
    writeInventory(root, value);
    assert.throws(() => validate(root), /AGDF_COPILOT_PAYLOAD_DUPLICATE_DESTINATION/);
  });
  fixture("excluded", (root) => {
    const path = join(root, ".codex-plugin", "plugin.json");
    mkdirSync(dirname(path), { recursive: true });
    const content = Buffer.from("{}\n");
    writeFileSync(path, content);
    const value = inventory(root);
    value.entries.push({
      destination: ".codex-plugin/plugin.json",
      component: "forbidden-test-fixture",
      owner: "test",
      rule: "forbidden",
      requirement: "negative-fixture",
      digest: sha256(content),
      bytes: content.byteLength,
    });
    value.stats.files += 1;
    value.stats.bytes += content.byteLength;
    writeInventory(root, value);
    assert.throws(() => validate(root, { baseline: { ...baseline, max_files: baseline.max_files + 1 } }), /AGDF_COPILOT_PAYLOAD_EXCLUDED_SURFACE/);
  });
  assert.throws(
    () => validate(generatedRoot, { baseline: { max_files: first.stats.files, max_bytes: first.stats.bytes - 1 } }),
    /AGDF_COPILOT_PAYLOAD_GROWTH/,
  );
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Copilot profile tests passed (inventory, drift, exclusions and growth fail closed)");
