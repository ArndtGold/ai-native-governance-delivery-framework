import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { evaluateOpenCodeHostSdk, printOpenCodeStatus } from "../lib/installers/opencode.js";
import {
  OPENCODE_DENY_PERMISSIONS,
  openCodeEvaluator,
  openCodePermissionEnvironment,
  parseOpenCodeEvaluatorOutput,
  preflightOpenCodeEvaluator,
} from "../lib/delivery-path-search/evaluators/opencode.js";
import { enforcementForSurface } from "../lib/delivery-path-search/surfaces/capabilities.js";
import { runDeliveryPathSearch } from "../lib/delivery-path-search/search-engine.js";
import { executeDeliveryPathSearch } from "../lib/cli/delivery-path-search-command.js";

const temp = mkdtempSync(join(tmpdir(), "agdf-opencode-hardening-"));
try {
  const sdkRoot = join(temp, "node_modules", "@opencode-ai", "plugin");
  mkdirSync(join(sdkRoot, "dist"), { recursive: true });
  writeFileSync(join(sdkRoot, "package.json"), JSON.stringify({
    name: "@opencode-ai/plugin",
    version: "1.17.11",
    types: "dist/index.d.ts",
  }));
  writeFileSync(join(sdkRoot, "dist", "index.d.ts"), 'export type Hooks = { "experimental.chat.system.transform": unknown; "experimental.session.compacting": unknown; };\n');
  const resolver = (file, args) => {
    if (file === process.execPath) return join(sdkRoot, "dist", "index.js");
    if (args[0] === "--version") return "1.18.3\n";
    throw new Error(`unexpected probe: ${file} ${args.join(" ")}`);
  };
  const supported = evaluateOpenCodeHostSdk(temp, { execFileSync: resolver, openCodeBin: "fixture-opencode" });
  assert.equal(supported.experimental_hooks.aggregate, "declared_supported");
  assert.equal(supported.experimental_hooks.evidence_level, "sdk_declaration");
  assert.equal(supported.experimental_hooks.live_invocation_observed, false);
  assert.equal(supported.host_sdk_version.status, "divergent");
  assert.equal(supported.host_sdk_version.policy, "warn_only");
  const human = [];
  printOpenCodeStatus({
    status: "configured",
    global_config: { path: "fixture", plugin_configured: true },
    package: { loadable: true, installed_version: "0.11.3", expected_version: "0.11.3", version_status: "current" },
    host: supported.host,
    plugin_sdk: supported.plugin_sdk,
    host_sdk_version: supported.host_sdk_version,
    experimental_hooks: supported.experimental_hooks,
    global_native_surface: { complete: true, path: "skills", skill_count: 10, expected_skill_count: 10, contract_count: 7, expected_contract_count: 7, local_validator: {} },
    session: { active: false, version: "" },
    repository_activation: "inactive",
    repository_control: { path: ".agdf/control/config.json", diagnostic: "missing" },
    repository_surface: { present: false, gate_check_skill: false, gate_check_agent: false, legacy_present: false },
    visible_entrypoint: "none",
    findings: [],
    next_step: "none",
  }, false, { log(line) { human.push(line); } });
  assert.ok(human.some((line) => line.includes("Host/SDK version: divergent (warn_only)")));
  assert.ok(human.some((line) => line.includes("sdk_declaration; live invocation not observed")));

  writeFileSync(join(sdkRoot, "dist", "index.d.ts"), 'export type Hooks = { "experimental.chat.system.transform": unknown; };\n');
  const missing = evaluateOpenCodeHostSdk(temp, { execFileSync: resolver, openCodeBin: "fixture-opencode" });
  assert.equal(missing.experimental_hooks.aggregate, "degraded");
  assert.equal(missing.experimental_hooks.hooks.find((hook) => hook.name === "experimental.session.compacting").state, "declared_missing");
  writeFileSync(join(sdkRoot, "dist", "index.d.ts"), "export type Hooks = {};\n");
  const bothMissing = evaluateOpenCodeHostSdk(temp, { execFileSync: resolver, openCodeBin: "fixture-opencode" });
  assert.deepEqual(bothMissing.experimental_hooks.hooks.map((hook) => hook.state), ["declared_missing", "declared_missing"]);

  const uninspectable = evaluateOpenCodeHostSdk(temp, {
    execFileSync(file, args) {
      if (file === process.execPath) throw Object.assign(new Error("not found"), { code: "MODULE_NOT_FOUND" });
      if (args[0] === "--version") return "1.18.3\n";
      throw new Error("unexpected");
    },
    openCodeBin: "fixture-opencode",
  });
  assert.equal(uninspectable.experimental_hooks.aggregate, "uninspectable");
  assert.equal(uninspectable.host_sdk_version.status, "unknown");

  const env = openCodePermissionEnvironment({ SAFE: "1" });
  assert.equal(env.SAFE, "1");
  assert.deepEqual(JSON.parse(env.OPENCODE_PERMISSION), OPENCODE_DENY_PERMISSIONS);
  assert.equal(JSON.parse(env.OPENCODE_PERMISSION).read, "deny");

  const permissionRows = [
    { permission: "*", action: "allow", pattern: "*" },
    ...Object.keys(OPENCODE_DENY_PERMISSIONS).map((permission) => ({ permission, action: "deny", pattern: "*" })),
  ];
  const agentList = `agdf-evaluator (primary)\n  ${JSON.stringify(permissionRows, null, 2).replaceAll("\n", "\n  ")}\nbuild (primary)\n  []\n`;
  const passed = preflightOpenCodeEvaluator({
    cwd: temp,
    openCodeBin: "fixture-opencode",
    execFileSync(_file, args, options) {
      assert.equal(JSON.parse(options.env.OPENCODE_PERMISSION)["*"], "deny");
      if (args[0] === "--version") return "1.18.3\n";
      if (args[0] === "run") return "--pure --agent --format --dir\n";
      if (args[0] === "agent") return agentList;
      throw new Error("unexpected");
    },
  });
  assert.equal(passed.status, "passed");
  assert.equal(enforcementForSurface("opencode", passed.evidence, { preflight: passed }).level, "tool_enforced");
  assert.equal(enforcementForSurface("opencode", ["untrusted evidence"]).level, "instruction_only");
  assert.equal(enforcementForSurface("opencode", [...passed.evidence], { preflight: passed }).level, "instruction_only");

  const unsafeRows = [{ permission: "*", action: "allow", pattern: "*" }];
  const unsafe = preflightOpenCodeEvaluator({
    cwd: temp,
    openCodeBin: "fixture-opencode",
    execFileSync(_file, args) {
      if (args[0] === "--version") return "1.18.3\n";
      if (args[0] === "run") return "--pure --agent --format --dir\n";
      return `agdf-evaluator (primary)\n  ${JSON.stringify(unsafeRows, null, 2).replaceAll("\n", "\n  ")}\n`;
    },
  });
  assert.equal(unsafe.code, "opencode_evaluator_permissions_unsafe");
  const incompatible = preflightOpenCodeEvaluator({
    cwd: temp,
    openCodeBin: "fixture-opencode",
    execFileSync(_file, args) {
      if (args[0] === "--version") return "1.18.3\n";
      if (args[0] === "run") return "--pure --agent --format --dir\n";
      return agentList.replace("agdf-evaluator (primary)", "agdf-evaluator (subagent)");
    },
  });
  assert.equal(incompatible.code, "opencode_evaluator_agent_incompatible");
  let repeatProbes = 0;
  for (let invocation = 0; invocation < 2; invocation += 1) {
    assert.equal(preflightOpenCodeEvaluator({
      cwd: temp,
      openCodeBin: "fixture-opencode",
      execFileSync(_file, args) {
        repeatProbes += 1;
        if (args[0] === "--version") return "1.18.3\n";
        if (args[0] === "run") return "--pure --agent --format --dir\n";
        return agentList;
      },
    }).status, "passed");
  }
  assert.equal(repeatProbes, 6, "each invocation must independently run all three preflight probes");

  const evaluation = {
    contract_version: "1",
    candidate_id: "safe",
    scope_fit: 5,
    gate_readiness: 5,
    risk_reduction: 4,
    evidence_gain: 5,
    testability: 5,
    reversibility: 5,
    cost: 1,
    uncertainty: 1,
    rationale: "Bounded evaluation under deny permissions.",
    risks: [],
    assumptions: [],
    child_actions: [],
  };
  const raw = `${JSON.stringify({ type: "text", part: { type: "text", text: JSON.stringify(evaluation) } })}\n`;
  assert.deepEqual(parseOpenCodeEvaluatorOutput(raw), evaluation);
  assert.throws(() => parseOpenCodeEvaluatorOutput('{"type":"step_start"}\n'), /no text event/);
  assert.throws(() => parseOpenCodeEvaluatorOutput(`${raw}${raw}`), /exactly one final payload/);
  assert.throws(
    () => parseOpenCodeEvaluatorOutput('{"type":"error","error":{"data":{"statusCode":401,"message":"No provider available"}}}\n'),
    (error) => error.code === "OPENCODE_EVALUATOR_AUTHENTICATION_FAILED",
  );

  const fakeBin = join(temp, "fake-opencode");
  writeFileSync(fakeBin, `#!/usr/bin/env node
if (process.argv.includes("--auto")) process.exit(9);
const prompt = process.argv.at(-1);
const id = /Candidate id: ([^\\n]+)/.exec(prompt)?.[1] || "unknown";
const result = { contract_version: "1", candidate_id: id, scope_fit: 5, gate_readiness: 5, risk_reduction: 4, evidence_gain: 5, testability: 5, reversibility: 5, cost: 1, uncertainty: 1, rationale: "Bounded fixture evaluation.", risks: [], assumptions: [], child_actions: [] };
process.stdout.write(JSON.stringify({ type: "text", part: { type: "text", text: JSON.stringify(result) } }) + "\\n");
`);
  chmodSync(fakeBin, 0o755);
  const adapter = openCodeEvaluator({ cwd: temp, openCodeBin: fakeBin, preflight: passed });
  const input = {
    contract_version: "1",
    scope_key: "fixture",
    objective: "Choose safely",
    current_gate: "CD+Tests",
    allowed_actions: ["inspect"],
    forbidden_actions: ["release"],
    evidence_refs: [],
    risks: [],
    enforcement: enforcementForSurface("opencode", passed.evidence, { preflight: passed }),
    budgets: { max_candidates: 1, max_depth: 1, max_evaluations: 1, max_duration_ms: 5000, max_cost_units: 5, stability_window: 1 },
  };
  const result = await runDeliveryPathSearch(input, adapter, {
    candidates: [{ id: "safe", action: "inspect", expected_evidence: [], tests: [], assumptions: [], depth: 0 }],
  });
  assert.equal(result.status, "recommendation");
  assert.equal(result.enforcement.level, "tool_enforced");
  assert.equal(result.evaluator.name, "opencode");

  let searchCalls = 0;
  let persistenceCalls = 0;
  const quiet = { log() {}, error() {} };
  const unavailable = await executeDeliveryPathSearch({
    surface: "opencode", dir: temp, runId: "fixture", json: true, persist: true,
  }, quiet, {
    preflightOpenCodeEvaluator: () => ({ surface: "opencode", status: "failed", code: "opencode_agent_unavailable", detail: "missing", evidence: [] }),
    runDeliveryPathSearch: async () => { searchCalls += 1; },
    persistSearchResult: () => { persistenceCalls += 1; },
  });
  assert.equal(unavailable.status, "evaluator_unavailable");
  assert.equal(unavailable.executable_evaluator.attempted, false);
  assert.equal(unavailable.enforcement.level, "instruction_only");
  assert.equal(searchCalls, 0);
  assert.equal(persistenceCalls, 0);

  const fatal = new Error("authentication failed");
  fatal.code = "OPENCODE_EVALUATOR_AUTHENTICATION_FAILED";
  fatal.fatalEvaluator = true;
  const transportFailure = await executeDeliveryPathSearch({
    surface: "opencode", dir: temp, runId: "fixture", json: true, persist: true,
  }, quiet, {
    preflightOpenCodeEvaluator: () => passed,
    searchInputFromControl: () => input,
    openCodeEvaluator: () => ({ name: "opencode", metadata: { name: "opencode" }, async evaluate() {} }),
    runDeliveryPathSearch: async () => { throw fatal; },
    persistSearchResult: () => { persistenceCalls += 1; },
  });
  assert.equal(transportFailure.status, "evaluator_unavailable");
  assert.equal(transportFailure.executable_evaluator.attempted, true);
  assert.equal(transportFailure.executable_evaluator.failure_code, fatal.code);
  assert.equal(persistenceCalls, 0);

  const noEvaluation = await executeDeliveryPathSearch({
    surface: "opencode", dir: temp, runId: "fixture", json: true,
  }, quiet, {
    preflightOpenCodeEvaluator: () => passed,
    searchInputFromControl: () => input,
    openCodeEvaluator: () => ({ name: "opencode", metadata: { name: "opencode" }, async evaluate() {} }),
    runDeliveryPathSearch: async () => ({
      status: "no_safe_recommendation",
      recommendation: null,
      enforcement: input.enforcement,
      budgets: { evaluations: 0 },
      stopping_reason: "candidate_queue_exhausted",
      next_gate_action: "Run canonical AGDF gate-check; search does not grant permission.",
    }),
  });
  assert.equal(noEvaluation.enforcement.level, "instruction_only", "preflight alone must not yield a final tool_enforced claim");

  const mutation = new Error("repository mutation detected");
  mutation.code = "OPENCODE_EVALUATOR_MUTATION_DETECTED";
  mutation.fatalEvaluator = true;
  const mutationFailure = await executeDeliveryPathSearch({
    surface: "opencode", dir: temp, runId: "fixture", json: true,
  }, quiet, {
    preflightOpenCodeEvaluator: () => passed,
    searchInputFromControl: () => input,
    openCodeEvaluator: () => ({ name: "opencode", metadata: { name: "opencode" }, async evaluate() {} }),
    runDeliveryPathSearch: async () => { throw mutation; },
  });
  assert.equal(mutationFailure.status, "evaluator_error");
  assert.equal(mutationFailure.stopping_reason, "opencode_mutation_detected");
  assert.doesNotMatch(mutationFailure.next_action, /instruction-only/);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("OpenCode hardening tests passed.");
