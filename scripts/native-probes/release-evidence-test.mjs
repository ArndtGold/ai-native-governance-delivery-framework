import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { assertReleaseEvidence, REQUIRED_STEPS } from "./release-evidence.mjs";
const policy = JSON.parse(readFileSync(new URL("./codex-release-policy.json", import.meta.url), "utf8"));
const options = { commit: "a".repeat(40), version: "1.0.0", policy };
const observations = policy.platforms.map(os => ({ kind: "agdf_codex_host_e2e", result: "pass",
  source: { commit: options.commit, dirty: false }, host: { os, version: policy.codex_version },
  agdf: { version: options.version }, requested_model: policy.model,
  steps: REQUIRED_STEPS.map(name => ({ name, status: "pass", evidence: {
    observed_models: [policy.model], calls: 1, plugin_id: "agdf@agdf", exec_status: 0,
    mcp_approval: { status: "configured" }, outcome: { dispatch: "control_result", failure_case: "invalid_input", skill_continuation: "skill_continuation" }[name],
    terminal: true, authorizes: false, contracts_verified: true,
    mcp_listed: false, config_mcp_section: false, plugin_cache: false, mcp_runtime: false } })) }));
assert.equal(assertReleaseEvidence(observations, options), true);
for (const mutate of [rows => rows.pop(), rows => rows[0].steps.pop(), rows => rows[0].steps[0].status = "fail",
  rows => rows[0].source.dirty = true, rows => rows[0].source.commit = "b".repeat(40),
  rows => rows[0].host.os = "win32", rows => rows[0].host.version = "unknown",
  rows => rows[0].requested_model = "different", rows => rows[0].steps.find(row => row.name === "dispatch").evidence.calls = 0,
  rows => rows[0].steps.find(row => row.name === "failure_case").evidence.exec_status = 1,
  rows => rows[0].steps.find(row => row.name === "removal").evidence.plugin_cache = true]) {
  const damaged = structuredClone(observations); mutate(damaged);
  assert.throws(() => assertReleaseEvidence(damaged, options));
}
for (const file of ["publish-agdf.yml", "publish-create-agdf.yml"]) {
  const workflow = parse(readFileSync(new URL(`../../.github/workflows/${file}`, import.meta.url), "utf8"));
  assert.ok(workflow.jobs.publish.needs.includes("codex-e2e"));
  assert.equal(workflow.jobs["codex-e2e"].uses, "./.github/workflows/codex-release-e2e.yml");
}
const workflow = parse(readFileSync(new URL("../../.github/workflows/codex-release-e2e.yml", import.meta.url), "utf8"));
assert.deepEqual(workflow.jobs.native.strategy.matrix.include.map(row => row.platform), policy.platforms);
assert.ok(!workflow.on.pull_request && !workflow.on.pull_request_target);
assert.ok(!workflow.env && !workflow.jobs.native.env);
assert.equal(workflow.jobs.evidence.needs, "native");
const upload = workflow.jobs.native.steps.find(row => row.uses?.startsWith("actions/upload-artifact@"));
assert.deepEqual(upload.with.path.trim().split("\n").map(path => path.split("/").at(-1)), ["observation.json", "summary.txt"]);
console.log("Release gate: native matrix, publish dependency, credential/artifact boundaries and negative evidence tests passed.");
