import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { assertReleaseEvidence, REQUIRED_STEPS } from "./release-evidence.mjs";
import { RELEASE_SCENARIOS, COMMON_STEPS } from './release-scenarios.mjs';
import { CLI_CASES } from './lib/release-policy.mjs';
import { mcpCalls } from './lib/codex-trace.mjs';
const invalidReply = { schema_version: '1', outcome: 'invalid_input', terminal: true, authorizes: false,
  runtime: { runtime_digest: 'a'.repeat(64) }, host_action: { text: 'Invalid directory.' } };
for (const result of [
  { structured_content: invalidReply, content: [{ text: 'diagnostic first' }] },
  { structuredContent: invalidReply, content: [{ text: 'diagnostic first' }] },
  { content: [{ text: JSON.stringify(invalidReply) }, { text: 'Additional human diagnostic.' }] },
]) {
  const [call] = mcpCalls([JSON.stringify({ item: { type: 'mcp_tool_call', id: 'native-error',
    tool: 'agdf_dispatch', server: 'agdf', pluginId: 'agdf@agdf', result } })]);
  assert.equal(call.outcome, 'invalid_input'); assert.equal(call.authorizes, false);
  assert.equal(call.terminal, true); assert.equal(call.runtime_digest, 'a'.repeat(64));
}
const policy = JSON.parse(readFileSync(new URL("./codex-release-policy.json", import.meta.url), "utf8"));
const options = { commit: "a".repeat(40), version: "0.14.5", policy };
const observations = policy.platforms.map(os => ({ kind: "agdf_codex_host_e2e", result: "pass",
  source: { commit: options.commit, dirty: false }, host: { os, version: policy.codex_version },
  agdf: { version: options.version }, requested_model: policy.model,
  steps: REQUIRED_STEPS.map(name => ({ name, status: "pass", evidence: {
    observed_models: [policy.model], calls: 1, plugin_id: "agdf@agdf", exec_status: 0,
    mcp_approval: { status: "configured" }, outcome: { dispatch: "control_result", failure_case: "invalid_input", skill_continuation: "skill_continuation" }[name],
    terminal: true, authorizes: false, contracts_verified: true,
    mcp_listed: false, config_mcp_section: false, plugin_cache: false, mcp_runtime: false } })) }));
assert.equal(assertReleaseEvidence(observations, options), true);
for (const version of ['0.20.0','0.21.0','1.0.0']) assert.throws(() => assertReleaseEvidence(observations, { ...options, version }), /legacy_evidence_not_release_grade/u);
const partitioned = observations.flatMap(row => RELEASE_SCENARIOS.map(scenario => ({ ...structuredClone(row), scenario,
  steps: structuredClone(row.steps.filter(step => COMMON_STEPS.includes(step.name) || step.name === scenario)) })));
assert.equal(assertReleaseEvidence(partitioned, options), true);
for (const mutate of [rows => rows.pop(), rows => rows.push(structuredClone(rows[0])),
  rows => rows[0].scenario = 'unknown', rows => delete rows[0].scenario,
  rows => rows[0].steps.pop(), rows => rows[0].steps.find(step => step.name === 'removal').status = 'fail',
  rows => rows[0].steps.find(step => step.name === 'dispatch').evidence.calls = 0]) {
  const damaged = structuredClone(partitioned); mutate(damaged);
  assert.throws(() => assertReleaseEvidence(damaged, options));
}
for (const mutate of [rows => rows.pop(), rows => rows[0].steps.pop(), rows => rows[0].steps[0].status = "fail",
  rows => rows[0].source.dirty = true, rows => rows[0].source.commit = "b".repeat(40),
  rows => rows[0].host.os = "win32", rows => rows[0].host.version = "unknown",
  rows => rows[0].requested_model = "different", rows => rows[0].steps.find(row => row.name === "dispatch").evidence.calls = 0,
  rows => rows[0].steps.find(row => row.name === "failure_case").evidence.exec_status = 1,
  rows => rows[0].steps.find(row => row.name === "removal").evidence.plugin_cache = true]) {
  const damaged = structuredClone(observations); mutate(damaged);
  assert.throws(() => assertReleaseEvidence(damaged, options));
}
assert.equal(existsSync(new URL("../../.github/workflows/publish-create-agdf.yml", import.meta.url)), false);
const publish = parse(readFileSync(new URL("../../.github/workflows/publish-agdf.yml", import.meta.url), "utf8"));
assert.deepEqual(publish.on.push.tags, ["agdf-v*"]);
assert.equal(publish.jobs["codex-e2e"], undefined);
assert.ok(publish.jobs.publish.needs.includes('release-evidence'));
assert.match(publish.jobs['release-evidence'].steps.at(-1).run, /validate .*--all-hosts/u);
assert.equal(publish.jobs["release-evidence"].uses, undefined);
const workflow = parse(readFileSync(new URL("../../.github/workflows/codex-release-e2e.yml", import.meta.url), "utf8"));
for (const job of [workflow.jobs.native, workflow.jobs.evidence, publish.jobs['release-evidence']]) {
  assert.equal(job.steps.find(step => step.uses?.startsWith('actions/checkout@'))?.with?.['fetch-depth'], 0,
    'candidate preparation validates historical release tags and needs full checkout history');
}
assert.deepEqual(workflow.jobs.native.strategy.matrix.include.map(row => row.platform), policy.platforms);
assert.deepEqual(workflow.jobs.native.strategy.matrix.platform, policy.platforms);
assert.deepEqual(workflow.jobs.native.strategy.matrix.scenario, CLI_CASES);
const probe = workflow.jobs.native.steps.find(step => step.name === 'Run real CLI lifecycle');
assert.match(probe.run, /--scenario "\$RELEASE_SCENARIO"/);
assert.equal(probe.env.RELEASE_SCENARIO, '${{ matrix.scenario }}');
assert.match(uploadName(), /matrix\.scenario/);
function uploadName() { return workflow.jobs.native.steps.find(row => row.uses?.startsWith('actions/upload-artifact@')).with.name; }
assert.ok(!workflow.on.pull_request && !workflow.on.pull_request_target);
assert.ok(!workflow.env && !workflow.jobs.native.env);
assert.equal(workflow.jobs.evidence.needs, "native");
const upload = workflow.jobs.native.steps.find(row => row.uses?.startsWith("actions/upload-artifact@"));
assert.deepEqual(upload.with.path.trim().split("\n").map(path => path.split("/").at(-1)), ["observation.json", "summary.txt", "release-records.json", "*-process.json", "*-primary.json"]);
console.log("Release gate: native matrix, publish dependency, credential/artifact boundaries and negative evidence tests passed.");
