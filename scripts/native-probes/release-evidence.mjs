import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RELEASE_SCENARIOS, COMMON_STEPS } from './release-scenarios.mjs';

export const REQUIRED_STEPS = Object.freeze(["host", "install", "installation_consent", "control_fixture",
  "discovery", "dispatch", "failure_case", "skill_continuation", "removal"]);

export function assertReleaseEvidence(observations, { commit, version, policy }) {
  assert.match(commit, /^[a-f0-9]{40}$/);
  const partitioned = observations.some(row => row.scenario !== undefined);
  const expected = policy.platforms.flatMap(os => partitioned ? RELEASE_SCENARIOS.map(scenario => `${os}:${scenario}`) : [os]).sort();
  assert.deepEqual(observations.map(row => partitioned ? `${row.host?.os}:${row.scenario}` : row.host?.os).sort(), expected,
    'all native platform/scenario pairs exactly once; no missing, duplicate or mixed evidence');
  for (const observation of observations) {
    assert.equal(observation.kind, "agdf_codex_host_e2e");
    assert.equal(observation.result, "pass");
    assert.equal(observation.source?.commit, commit, "evidence must match this release commit");
    assert.equal(observation.source?.dirty, false, "dirty worktree evidence cannot release");
    assert.equal(observation.agdf?.version, version);
    assert.equal(observation.host.version, policy.codex_version);
    assert.equal(observation.requested_model, policy.model);
    const required = partitioned ? [...COMMON_STEPS, observation.scenario] : [...REQUIRED_STEPS];
    assert.deepEqual(observation.steps.map(row => row.name).sort(), required.sort());
    for (const step of observation.steps) assert.equal(step.status, "pass", step.name);
    const evidenceFor = name => observation.steps.find(row => row.name === name).evidence;
    assert.equal(evidenceFor("installation_consent").mcp_approval?.status, "configured");
    if (!partitioned || observation.scenario === 'dispatch') {
    assert.equal(evidenceFor("dispatch").outcome, "control_result");
    assert.equal(evidenceFor("dispatch").terminal, true);
    assert.equal(evidenceFor("dispatch").authorizes, false);
    }
    if (!partitioned || observation.scenario === 'failure_case') {
    assert.equal(evidenceFor("failure_case").outcome, "invalid_input");
    }
    if (!partitioned || observation.scenario === 'skill_continuation') {
    assert.equal(evidenceFor("skill_continuation").outcome, "skill_continuation");
    assert.equal(evidenceFor("skill_continuation").contracts_verified, true);
    }
    for (const key of ["mcp_listed", "config_mcp_section", "plugin_cache", "mcp_runtime"]) {
      assert.equal(evidenceFor("removal")[key], false);
    }
    for (const name of partitioned ? [observation.scenario] : RELEASE_SCENARIOS) {
      const evidence = observation.steps.find(row => row.name === name).evidence;
      assert.deepEqual(evidence.observed_models, [policy.model]);
      assert.equal(evidence.calls, 1);
      assert.equal(evidence.plugin_id, "agdf@agdf");
      assert.equal(evidence.exec_status, 0);
    }
  }
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const policy = JSON.parse(readFileSync(new URL("./codex-release-policy.json", import.meta.url), "utf8"));
  const version = JSON.parse(readFileSync(new URL("../../packages/cli/package.json", import.meta.url), "utf8")).version;
  const args = process.argv.slice(2);
  const files = args[0] === "--directory" && args.length === 2
    ? readdirSync(args[1], { recursive: true }).filter(path => /(?:^|[\\/])observation\.json$/.test(path)).map(path => join(args[1], path)) : args;
  assertReleaseEvidence(files.map(path => JSON.parse(readFileSync(path, "utf8"))),
    { commit: process.env.GITHUB_SHA, version, policy });
  console.log("Release evidence: exact commit, version, model and native Linux/Windows lifecycle verified.");
}
