import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { inspectStartupCompatibility, startupMaintenanceInvocation } from "../lib/control-maintenance/startup.js";
import { runControlMaintenance } from "../lib/control-maintenance/service.js";
import { renderStartupControlNotice } from "../lib/control-maintenance/presentation.js";
import { runtimeCheckCapabilityIdentity, fixedRuntimeCheckCommand } from "../lib/runtime-check-consent/contract.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { readFileSync, realpathSync } from "node:fs";
import { repository, addRun, treeDigest, git } from "./control-maintenance-fixtures.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const base = mkdtempSync(join(tmpdir(), "agdf-repository-startup-"));
try {
  const a = repository(base, "root A", { language: "de" }); addRun(a, "old"); git(a, "init", "-q");
  const nested = join(a, "nested"); mkdirSync(nested);
  const b = repository(base, "root B"); addRun(b, "current", { sealed: true }); git(b, "init", "-q");
  const sotPath = join(b, ".agdf/control/SOT_REGISTRY.md");
  writeFileSync(sotPath, readFileSync(sotPath, "utf8") + "\n| Fixture domain | A.md | active |\n| Fixture domain | B.md | active |\n");
  const beforeA = treeDigest(a), beforeB = treeDigest(b);
  const source = await runControlMaintenance(a);
  const launch = { target: a, executable: process.execPath, validator: "/owned/runtime.js", env: {}, deadline: 1000, now: () => 0 };
  let calls = 0;
  const compact = inspectStartupCompatibility({ ...launch, run: (exe, argv, opts) => {
    calls++; assert.equal(exe, process.execPath); assert.deepEqual(argv, [launch.validator, "control-maintenance", "--dir", a, "--json"]);
    assert.equal(opts.stdio[0], "ignore"); assert.equal(opts.timeout, 1000);
    return { status: 2, stdout: JSON.stringify(source) };
  } });
  assert.equal(calls, 1); assert.equal(compact.status, "migration_required");
  for (const child of [{ status: 0, stdout: "broken" }, { status: 1, stdout: JSON.stringify(source) }, { status: 0, stdout: JSON.stringify({ ...source, target: b }) }, { status: null, error: new Error("timeout") }]) {
    assert.equal(inspectStartupCompatibility({ ...launch, run: () => child }).inspection_state, "unavailable");
  }
  assert.equal(inspectStartupCompatibility({ ...launch, deadline: 0, run: () => { throw new Error("must abstain"); } }).status, "unavailable");
  assert.equal(inspectStartupCompatibility({ ...launch, run: () => { throw new Error("spawn failed"); } }).status, "unavailable");
  const large = structuredClone(source);
  large.compatibility.runs = Array.from({ length: 2048 }, (_, index) => ({ ...source.compatibility.runs[0], run_id: `legacy-${index}` }));
  large.compatibility.diagnostics = [{ code: "$(touch /tmp/should-never-execute) `literal diagnostic`" }];
  large.counts.migration = 2048;
  const largeFacts = inspectStartupCompatibility({ ...launch, run: () => ({ status: 2, stdout: JSON.stringify(large) }) });
  assert.equal(largeFacts.counts.migration, 2048);
  assert.ok(Buffer.byteLength(JSON.stringify(largeFacts)) < 600);
  assert.doesNotMatch(JSON.stringify(largeFacts), /legacy-|touch|literal diagnostic/u);
  assert.equal(startupMaintenanceInvocation({ ...compact, status: "current" }, launch), null);
  for (const language of ["en", "de", "fr-CA"]) {
    const facts = { ...compact, invocation: startupMaintenanceInvocation(compact, { ...launch, language }) };
    const notice = renderStartupControlNotice(facts, { language });
    assert.ok(notice.includes(a) && notice.includes("control-maintenance") && notice.includes("--guided"));
    assert.ok(Buffer.byteLength(notice) < 1600);
    assert.ok(!notice.includes("old: "));
  }
  const specialTarget = "/repo with ' quotes $() `data`";
  const special = { ...compact, target: specialTarget };
  special.invocation = startupMaintenanceInvocation(special, launch);
  assert.equal(special.invocation.argv[3], specialTarget);
  assert.ok(renderStartupControlNotice(special, { platform: "linux" }).includes(`'"'"'`));
  const windowsCopy = renderStartupControlNotice(special, { platform: "win32" });
  assert.ok(windowsCopy.includes("& '") && windowsCopy.includes("'' quotes"));

  const pluginRoot = resolve(repoRoot, "create-agdf/generated/plugins/agdf");
  const entrypoint = join(pluginRoot, "runtime/agdf-session-check.js");
  const data = join(base, "data"); mkdirSync(join(data, "runtime-checks"), { recursive: true });
  const definition = JSON.parse(readFileSync(join(pluginRoot, "meta/agdf-plugin.definition.json")));
  const manifest = JSON.parse(readFileSync(join(pluginRoot, "runtime/runtime-manifest.json")));
  const identity = runtimeCheckCapabilityIdentity({ capability: definition.automaticRuntimeChecks, surface: "codex",
    runtimeDigest: manifest.digest, sourceDigest: digestNormalizedPluginSource(pluginRoot, manifest.version), command: fixedRuntimeCheckCommand("codex", pluginRoot, process.platform) });
  const receipt = { schema_version: 1, owner: "create-agdf", capability_id: "automatic-runtime-checks", surface: "codex", requested_state: "enabled", capability_identity: identity };
  const launchHook = (cwd, requested = "enabled", capability = identity) => {
    writeFileSync(join(data, "runtime-checks/codex.json"), JSON.stringify({ ...receipt, requested_state: requested, capability_identity: capability }));
    const dataBefore = treeDigest(data);
    const child = spawnSync(process.execPath, [entrypoint], { cwd: b, input: JSON.stringify({ cwd }), encoding: "utf8", timeout: 15000,
      env: { ...process.env, AGDF_SURFACE: "codex", PLUGIN_ROOT: pluginRoot, CLAUDE_PLUGIN_ROOT: pluginRoot, AGDF_DATA_DIR: data } });
    assert.equal(child.status, 0, child.stderr);
    assert.equal(treeDigest(data), dataBefore, "startup reads consent without writing it or creating journals");
    const match = child.stdout.match(/AGDF runtime facts: (.+)/u);
    return match ? JSON.parse(match[1]) : null;
  };
  assert.equal(launchHook(nested, "manual"), null);
  assert.equal(launchHook(nested, "enabled", "stale"), null);
  const aFacts = launchHook(nested);
  assert.equal(aFacts.repository_control.target, realpathSync(a));
  assert.equal(aFacts.repository_control.status, "migration_required");
  assert.equal(aFacts.repository_control.counts.migration, 1);
  assert.ok(aFacts.repository_control.notice.includes("Migration"));
  assert.equal(aFacts.repository_control.invocation.argv[3], realpathSync(a));
  const bFacts = launchHook(b);
  assert.equal(bFacts.repository_control.target, realpathSync(b));
  assert.equal(bFacts.repository_control.status, "current");
  assert.ok(["block", "blocked"].includes(bFacts.automatic_check.status), "blocked delivery readiness remains separate from current control compatibility");
  assert.equal(bFacts.repository_control.invocation, undefined);
  assert.equal(launchHook(base).repository_control, undefined);
  // OpenCode's adapter supplies an explicit child cwd and ignores stdin.
  const openCodeIdentity = runtimeCheckCapabilityIdentity({ capability: definition.automaticRuntimeChecks, surface: "opencode",
    runtimeDigest: manifest.digest, sourceDigest: digestNormalizedPluginSource(pluginRoot, manifest.version), command: fixedRuntimeCheckCommand("opencode", pluginRoot, process.platform) });
  writeFileSync(join(data, "runtime-checks/opencode.json"), JSON.stringify({ ...receipt, surface: "opencode", capability_identity: openCodeIdentity }));
  const openCode = spawnSync(process.execPath, [entrypoint], { cwd: nested, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 15000,
    env: { ...process.env, AGDF_SURFACE: "opencode", PLUGIN_ROOT: pluginRoot, AGDF_DATA_DIR: data } });
  assert.equal(openCode.status, 0, openCode.stderr);
  const openCodeFacts = JSON.parse(openCode.stdout.match(/AGDF runtime facts: (.+)/u)[1]);
  assert.equal(openCodeFacts.repository_control.target, realpathSync(a));
  assert.equal(openCodeFacts.repository_control.status, "migration_required");
  assert.equal(treeDigest(a), beforeA); assert.equal(treeDigest(b), beforeB);
  console.log("Repository control bounded startup, consent and reentry tests passed.");
} finally { rmSync(base, { recursive: true, force: true }); }
