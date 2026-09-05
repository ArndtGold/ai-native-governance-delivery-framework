import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setup as codexFixture } from "./fixtures/host-compatibility/codex.js";
import { setup as claudeFixture } from "./fixtures/host-compatibility/claude.js";
import { createCopilotFixture } from "./fixtures/host-compatibility/copilot.js";
import { setup as openCodeFixture } from "./fixtures/host-compatibility/opencode.js";
import { observePlugin, expectedSkills } from "./fixtures/host-compatibility/discovery.js";
import { pluginDefinition, interactionLocales } from "../lib/cli/runtime-context.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { buildCopilotPayloadInventory } from "../lib/public-plugin/copilot-profile.js";
import { prepareInstallConsent } from "../lib/runtime-check-consent/service.js";
import { projectCodexHookObservation } from "../lib/runtime-check-consent/adapters.js";
import { createDispatchBinding } from "../lib/skill-dispatch/binding.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { createRun } from "../lib/control-state/index.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";
import { proofState, HOSTS, SCENARIOS } from "../../scripts/host-compatibility/contract.mjs";
export { SCENARIOS } from "../../scripts/host-compatibility/contract.mjs";
const fixtureFactories = { codex: codexFixture, claude: claudeFixture, copilot: createCopilotFixture, opencode: openCodeFixture };
const json = path => JSON.parse(readFileSync(path, "utf8"));
const payload = (root, host) => observePlugin(root, host);
const identity = root => ({ canonical_version: pluginDefinition.version, source_digest: digestNormalizedPluginSource(root, pluginDefinition.version), runtime_digest: json(join(root, "runtime/runtime-manifest.json")).digest });

function changedPayload(built, destination, host) {
  cpSync(built, destination, { recursive: true });
  const skill = join(destination, host === "copilot" ? "copilot-skills/agdf-gate-check/SKILL.md" : "skills/gate-check/SKILL.md");
  writeFileSync(skill, readFileSync(skill, "utf8") + `\nHost compatibility changed-content fixture ${destination.split(/[/\\]/).at(-1)}.\n`);
  if (host === "copilot") {
    const inventory = json(join(destination, ".agdf-payload-inventory.json"));
    buildCopilotPayloadInventory({ profileRoot: destination, version: pluginDefinition.version, baseline: inventory.baseline,
      mappings: inventory.entries.map(entry => ({ ...entry, sourceDigest: entry.source_digest })) });
  }
  return destination;
}

function discoveryFacts(observed) {
  return { payload_digest: observed.digest, expected_skills: expectedSkills, exposed_skills: observed.skills.filter(skill => skill.enabled).map(skill => ({ name: skill.name, enabled: true, payload_digest: observed.digest })) };
}

function canonicalResult(result) {
  return { outcome: result.outcome, terminal: result.terminal, authorizes: result.authorizes, contract_version: result.contract_version,
    target: result.target?.primary_target ?? null, gate: result.control?.current_gate ?? null, status: result.control?.status ?? null,
    continuation: result.continuation?.skill_id ?? null };
}

export function environment(host, condition = "normal") {
  return { host, variant: "simulated", host_version: null, os: process.platform, target_os: null, path: "primary/fixture", permission: "fixture-isolated", trust: "simulated", activation: "fixture", runtime_version: process.version, sdk_version: null, model: null, fixture_version: "1", condition };
}

// Shared grading is independent of the host stimulus, including expected negative outcomes.
export function assertScenario(observation, expectedState) {
  assert.equal(proofState(observation), expectedState, `${observation.environment.host}/${observation.scenario}`);
}

export async function runCompatibilitySuite({ onDiagnostic = () => {} } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agdf-host-compatibility-")));
  const observations = [];
  const active = join(root, "active"); mkdirSync(active);
  assert.equal(spawnSync("git", ["init", "-q", active]).status, 0);
  initializeCanonicalControl(active, generatedFilesForTarget("init", active, false, "en"));
  createRun(active, "fixture-run");
  const validator = fileURLToPath(new URL("../bin/agdf-validator.js", import.meta.url));
  const dispatch = createSkillDispatchService({ env: {} });
  const record = (host, scenario, claim, expected, facts, expectedState, extra = {}) => {
    const observation = { schema_version: 1, id: `${host}.${scenario}`, scenario, claim, mechanism: claim === "callable" ? "canonical_dispatch" : "host_lifecycle",
      lane: "deterministic_adapter", method: "isolated_production_fixture", environment: environment(host, scenario),
      expected, observed: { ...expected, source_digest: facts.payload_digest ?? facts.recovered_digest ?? expected.source_digest }, facts, original: { result: facts.original_result ?? expectedState, evidence_class: "repository_fixture" },
      observed_at: new Date().toISOString(), ...extra };
    try { assertScenario(observation, expectedState); observation.conformance = { expected: expectedState, passed: true }; }
    catch (error) { observation.conformance = { expected: expectedState, passed: false, diagnostic: error.message }; }
    observations.push(observation);
  };
  try {
    for (const host of HOSTS) {
      const base = join(root, host); mkdirSync(base);
      const built = fileURLToPath(new URL(host === "copilot" ? "../generated/plugins/copilot/agdf" : "../generated/plugins/agdf", import.meta.url));
      const expected = identity(built);
      let fixture;
      try {
        fixture = fixtureFactories[host](base, built);
        const install = source => fixture.install(source);
        const cache = () => host === "copilot" ? join(fixture.checkout, "plugins/agdf") : fixture.cache;
        const staged = () => host === "copilot" ? join(base, "data/marketplaces/copilot/agdf/plugins/agdf") : fixture.stagedRoot();
        const foreign = join(base, "foreign.txt"); writeFileSync(foreign, "foreign-owned");
        const first = install(built);
        const initial = payload(cache(), host);
        record(host, "installed", "installed", expected, { payload_present: existsSync(cache()), payload_digest: initial.digest, original_result: first.verificationStatus ?? "installed" }, "demonstrated");
        record(host, "discovered", "discovered", expected, discoveryFacts(initial), "demonstrated");
        const missingSkill = join(cache(), host === "copilot" ? "copilot-skills/agdf-gate-check/SKILL.md" : "skills/gate-check/SKILL.md");
        const skillBytes = readFileSync(missingSkill); rmSync(missingSkill);
        record(host, "discovery-missing", "discovered", expected, discoveryFacts(payload(cache(), host)), "failed");
        writeFileSync(missingSkill, skillBytes);
        writeFileSync(missingSkill, Buffer.concat([skillBytes, Buffer.from("\nWrong cached bytes.\n")]));
        record(host, "discovery-wrong-payload", "discovered", expected, discoveryFacts(payload(cache(), host)), "failed");
        writeFileSync(missingSkill, skillBytes);
        const binding = createDispatchBinding({ validator, surface: host, expectedVersion: pluginDefinition.version,
          requestActivation: { owner: "request_activation_contract", policy_version: 1, guard_fingerprint: `sha256:${"a".repeat(64)}` } });
        for (const scenario of ["callable", "target-unresolved", "missing-approval", "invalid-input"]) {
          const skillId = scenario === "invalid-input" ? "invalid-fixture-skill" : scenario === "missing-approval" ? "qa-gate" : "gate-check";
          const target = scenario === "target-unresolved" ? {} : { targetSource: "explicit_target", primaryTarget: active, runId: "fixture-run" };
          const input = { skillId, skillSet: pluginDefinition.skillSet, interactionLocales, surface: host, presentationLanguage: "en", expectedVersion: pluginDefinition.version, workingDirectory: active, ...target };
          const expectedResult = dispatch(input);
          const args = [...binding.argv_prefix, "--skill", skillId, "--language", "en", "--working-directory", active,
            ...(target.primaryTarget ? ["--target-source", "explicit_target", "--primary-target", active, "--run", "fixture-run"] : [])];
          const child = spawnSync(binding.executable, args, { encoding: "utf8", timeout: 10000, maxBuffer: 1024 * 1024,
            env: { ...process.env, ...binding.environment, AGDF_SURFACE: host, AGDF_RUN: "" } });
          const actual = child.stdout?.trim() ? JSON.parse(child.stdout) : null;
          if (actual?.terminal) assert.equal(actual.continuation, null, "a terminal response cannot carry a continuation");
          const matches = actual !== null && JSON.stringify(canonicalResult(actual)) === JSON.stringify(canonicalResult(expectedResult));
          record(host, scenario, "callable", expected, { invocation: { observed: child.error === undefined && [0, 2].includes(child.status), contract_version: actual?.contract_version,
            binding_version: binding.schema_version, canonical_result: matches, post_terminal_actions: actual?.terminal && actual?.continuation ? 1 : 0 }, canonical: { ...canonicalResult(actual ?? {}), target: actual?.target?.primary_target ? "fixture-target" : null }, original_result: actual?.outcome ?? "execution_failed" }, "demonstrated");
        }
        const changed = changedPayload(built, join(base, "changed"), host);
        const updatedIdentity = identity(changed);
        install(changed);
        record(host, "updated", "updated", updatedIdentity, { previous_digest: expected.source_digest, update_observed: true, payload_digest: payload(cache(), host).digest }, "demonstrated");
        rmSync(cache(), { recursive: true, force: true }); cpSync(built, cache(), { recursive: true });
        record(host, "update-stale", "updated", updatedIdentity, { previous_digest: expected.source_digest, update_observed: true, payload_digest: payload(cache(), host).digest }, "failed");
        install(changed);
        const next = changedPayload(changed, join(base, "next"), host); const nextIdentity = identity(next);
        const permissionFingerprint = () => createHash("sha256").update(JSON.stringify(
          host === "copilot" ? json(fixture.settingsPath) : fixture.permissionState(),
        )).digest("hex");
        const permissionBefore = permissionFingerprint();
        if (host === "copilot") fixture.state.failSkills = true; else fixture.state.failInstall = true;
        let failure;
        try { install(next); } catch (error) { failure = error; }
        assert.ok(failure, "the failure stimulus must actually interrupt installation");
        if (host === "copilot") fixture.state.failSkills = false;
        else fixture.state.failInstall = false;
        // OpenCode recovers through its existing retry; it does not promise transaction rollback.
        if (host === "opencode") install(next);
        const recoveryRoot = host === "copilot" ? cache() : staged();
        const remainingFacts = () => ({ recovered_digest: payload(recoveryRoot, host).digest,
          foreign_preserved: readFileSync(foreign, "utf8") === "foreign-owned",
          permission_before: permissionBefore, permission_after: permissionFingerprint(),
          permission_preserved: permissionFingerprint() === permissionBefore });
        const recovery = { failure_observed: Boolean(failure), recovery_observed: Boolean(failure), previous_digest: updatedIdentity.source_digest,
          ...remainingFacts(), unresolved: [], original_result: failure?.phase ?? "failure_missing" };
        record(host, "recoverable", "recoverable", nextIdentity, recovery, "demonstrated");
        // Fail another recovery attempt. Preserve the original failure and the unresolved step.
        if (host === "copilot") { fixture.state.failSkills = true; fixture.state.recovering = false; fixture.state.failRecovery = true; }
        else { fixture.state.failInstall = true; fixture.state.failRollback = true; }
        let partial;
        try { install(next); } catch (error) { partial = error; }
        assert.ok(partial, "the partial recovery stimulus must actually fail");
        if (host === "copilot") assert.ok(partial.evidence?.marketplace_plugin_recovery, "native recovery really failed");
        else if (host !== "opencode") assert.ok(partial.evidence?.rollback?.some(entry => entry.status === "failed"), "filesystem rollback really failed");
        else { assert.throws(() => install(next), /injected interrupted package operation/); }
        record(host, "recovery-partial", "recoverable", nextIdentity, { ...recovery, ...remainingFacts(), failure_observed: Boolean(partial), recovery_observed: false,
          unresolved: partial ? ["injected_recovery_failure"] : [], failures: [{ phase: partial.phase ?? "plugin_operation", status: "failed" }, { phase: "recovery", status: "failed" }], original_result: partial?.phase ?? "failure_missing" }, "failed");
        const callsBefore = fixture.state.calls.length;
        const manual = prepareInstallConsent(host, { runtimeChecksDecision: "manual" });
        const cancel = prepareInstallConsent(host, { runtimeChecksDecision: "cancel" });
        assert.equal(manual.decision, "manual"); assert.equal(cancel.decision, "cancel"); assert.equal(fixture.state.calls.length, callsBefore);
        record(host, "manual-checks", "automatic_checks", expected, { check_executed: false, check_result_observed: false, authorized: false, original_result: manual.decision }, "failed");
        const trust = projectCodexHookObservation({ requested: "enabled", effective: "decision_required" }, { status: "observed", hook: { enabled: true, trust_status: "trusted" } });
        record(host, "trusted-unexecuted", "automatic_checks", expected, { check_executed: false, check_result_observed: false, authorized: true, original_result: host === "codex" ? trust.verification : "trust_is_not_execution" }, "failed");
      } catch (error) {
        onDiagnostic({ host, error });
        for (const scenario of SCENARIOS.filter(name => !observations.some(o => o.environment.host === host && o.scenario === name))) {
          record(host, scenario, "installed", expected, {}, "demonstrated", { original: { result: "fixture_failed", evidence_class: "repository_fixture" },
            failure: "fixture_execution_failed", conformance: { expected: "demonstrated", passed: false } });
        }
      }
    }
    return observations;
  } finally { rmSync(root, { recursive: true, force: true }); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = await runCompatibilitySuite({ onDiagnostic: ({ host, error }) => console.error(host, error) });
  console.log(JSON.stringify({ evaluated: results.length, failed: results.filter(o => !o.conformance.passed) }, null, 2));
  if (results.length !== HOSTS.length * SCENARIOS.length || results.some(o => !o.conformance.passed)) process.exitCode = 1;
}
