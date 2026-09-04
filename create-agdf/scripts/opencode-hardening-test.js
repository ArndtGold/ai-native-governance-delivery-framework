import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { AGDFPlugin } from "../opencode-plugin.js";
import { alignOpenCodePluginSdk, evaluateOpenCodeHostSdk, printOpenCodeStatus } from "../lib/installers/opencode.js";
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

  function writeSdk(version, declaration = 'export type Hooks = { "experimental.chat.system.transform": unknown; "experimental.session.compacting": unknown; };\n') {
    writeFileSync(join(sdkRoot, "package.json"), JSON.stringify({
      name: "@opencode-ai/plugin",
      version,
      types: "dist/index.d.ts",
    }));
    writeFileSync(join(sdkRoot, "dist", "index.d.ts"), declaration);
  }

  function alignmentRunner({ hostVersion = "1.18.3", registry = "available", install = "success", postVersion = "1.18.3", postDeclaration } = {}) {
    const calls = [];
    const run = (file, args) => {
      calls.push([file, [...args]]);
      if (file === process.execPath) return JSON.stringify({
        resolvedPath: join(sdkRoot, "dist", "index.js"),
        manifestPath: join(sdkRoot, "package.json"),
      });
      if (file === "fixture-opencode" && args[0] === "--version") {
        if (hostVersion === "uninspectable") throw new Error("host unavailable");
        return `${hostVersion}\n`;
      }
      if (args[0] === "view") {
        if (registry === "unavailable") {
          const error = new Error("No matching version");
          error.stderr = "npm ERR! code ETARGET";
          throw error;
        }
        if (registry === "failed") throw new Error("registry offline");
        return JSON.stringify(hostVersion);
      }
      if (args[0] === "install") {
        if (install === "failed") throw new Error("install failed");
        writeSdk(postVersion, postDeclaration);
        return "";
      }
      throw new Error(`unexpected alignment call: ${file} ${args.join(" ")}`);
    };
    return { calls, run };
  }

  writeSdk("1.18.3");
  const matchingRunner = alignmentRunner();
  const matchingAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: matchingRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(matchingAlignment.status, "already_matching");
  assert.equal(matchingAlignment.attempted, false);
  assert.equal(matchingRunner.calls.some(([, args]) => args[0] === "view" || args[0] === "install"), false);

  writeSdk("1.17.11");
  const alignedRunner = alignmentRunner();
  const aligned = alignOpenCodePluginSdk(temp, {
    execFileSync: alignedRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(aligned.status, "aligned");
  assert.equal(aligned.previous_version, "1.17.11");
  assert.equal(aligned.target_version, "1.18.3");
  assert.equal(aligned.installed_version, "1.18.3");
  const alignmentInstallArgs = alignedRunner.calls.find(([, args]) => args[0] === "install")?.[1] ?? [];
  for (const expected of ["--save-exact", "--ignore-scripts", "--no-audit", "--no-fund"]) {
    assert.ok(alignmentInstallArgs.includes(expected));
  }
  assert.equal(alignmentInstallArgs.at(-1), "@opencode-ai/plugin@1.18.3");
  assert.equal(alignmentInstallArgs.some((arg) => arg === "latest" || arg.includes("^") || arg.includes("~")), false);

  writeSdk("1.17.11");
  const unavailableRunner = alignmentRunner({ registry: "unavailable" });
  const unavailableAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: unavailableRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(unavailableAlignment.status, "unavailable");
  assert.equal(unavailableAlignment.installed_version, "1.17.11");
  assert.equal(unavailableRunner.calls.some(([, args]) => args[0] === "install"), false);

  writeSdk("1.17.11");
  const hostMissingRunner = alignmentRunner({ hostVersion: "uninspectable" });
  const hostMissingAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: hostMissingRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(hostMissingAlignment.status, "not_attempted");
  assert.equal(hostMissingRunner.calls.some(([, args]) => args[0] === "view" || args[0] === "install"), false);

  rmSync(join(sdkRoot, "package.json"));
  const sdkMissingRunner = alignmentRunner();
  const sdkMissingAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: sdkMissingRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(sdkMissingAlignment.status, "not_attempted");
  assert.equal(sdkMissingRunner.calls.some(([, args]) => args[0] === "view" || args[0] === "install"), false);

  writeSdk("1.17.11");
  const invalidHostRunner = alignmentRunner({ hostVersion: "OpenCode 1.18.3" });
  const invalidHostAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: invalidHostRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(invalidHostAlignment.status, "not_attempted");
  assert.equal(invalidHostAlignment.target_version, null);

  writeSdk("1.17.11");
  const failedRunner = alignmentRunner({ install: "failed" });
  const failedAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: failedRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(failedAlignment.status, "failed");
  assert.equal(failedAlignment.installed_version, "1.17.11");
  assert.match(failedAlignment.error, /install failed/);

  writeSdk("1.17.11");
  const registryFailedRunner = alignmentRunner({ registry: "failed" });
  const registryFailedAlignment = alignOpenCodePluginSdk(temp, {
    execFileSync: registryFailedRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(registryFailedAlignment.status, "failed");
  assert.equal(registryFailedAlignment.attempted, false);
  assert.match(registryFailedAlignment.error, /registry offline/);

  writeSdk("1.17.11");
  const versionMismatchRunner = alignmentRunner({ postVersion: "1.17.11" });
  const versionMismatch = alignOpenCodePluginSdk(temp, {
    execFileSync: versionMismatchRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(versionMismatch.status, "verification_failed");
  assert.equal(versionMismatch.installed_version, "1.17.11");
  assert.match(versionMismatch.error, /Observed plugin SDK 1\.17\.11/);

  writeSdk("1.17.11");
  const verificationRunner = alignmentRunner({ postVersion: "1.18.3", postDeclaration: "export type Hooks = {};\n" });
  const verificationFailed = alignOpenCodePluginSdk(temp, {
    execFileSync: verificationRunner.run,
    openCodeBin: "fixture-opencode",
  });
  assert.equal(verificationFailed.status, "verification_failed");
  assert.equal(verificationFailed.installed_version, "1.18.3");
  assert.match(verificationFailed.error, /does not declare/);

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
    searchInputFromControl: () => input,
    runDeliveryPathSearch: async () => { searchCalls += 1; },
    persistSearchResult: () => { persistenceCalls += 1; },
  });
  assert.equal(unavailable.status, "evaluator_unavailable");
  assert.equal(unavailable.scope_key, "fixture");
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
      status: "evaluator_error",
      outcome_phase: "evaluation",
      recommendation: null,
      enforcement: input.enforcement,
      budgets: { evaluations: 0 },
      provenance: { evaluation_attempts: 1, valid_evaluations: 0, invalid_evaluations: 1 },
      stopping_reason: "evaluator_error",
      next_gate_action: "Run canonical AGDF gate-check; search does not grant permission.",
    }),
  });
  assert.equal(noEvaluation.status, "evaluator_error");
  assert.equal(noEvaluation.provenance.valid_evaluations, 0);
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

  const pluginTemp = mkdtempSync(join(tmpdir(), "agdf-plugin-honesty-"));
  try {
    const logs = [];
    const toasts = [];
    const makeClient = (withToast = true) => ({
      app: { async log(input) { logs.push(input.body ?? input); } },
      tui: withToast ? { async showToast({ body }) { toasts.push(body); } } : undefined,
    });
    const automaticRuntimeCheck = () => ({
      requested: "enabled",
      effective: "enabled",
      reason: "none",
      verification: "host_observed",
      ran: true,
      output: "AGDF active.\n\nAGDF automatic runtime check: status=pass findings=0.",
    });

    const inactiveDir = join(pluginTemp, "inactive");
    mkdirSync(inactiveDir, { recursive: true });
    const inactivePlugin = await AGDFPlugin({ directory: inactiveDir, client: makeClient() }, { executeAutomaticRuntimeCheck: automaticRuntimeCheck });
    logs.length = 0;
    toasts.length = 0;
    await inactivePlugin.event({ event: { type: "session.created" } });
    assert.ok(logs.some((l) => l.level === "info" && l.message.includes("without durable control")), "inactive session must log");
    assert.ok(logs.some((l) => l.extra?.automatic_runtime_check?.effective === "enabled"), "session log must expose automatic runtime-check evidence");
    assert.ok(toasts.some((t) => t.message.includes("No valid") && t.variant === "warning"), "inactive session must toast");

    const activeDir = join(pluginTemp, "active");
    mkdirSync(join(activeDir, ".agdf", "control"), { recursive: true });
    writeFileSync(join(activeDir, ".agdf", "control", "config.json"), JSON.stringify({ artifact_language: "en", chat_language: "en", runtime_language: "en" }));
    const activePlugin = await AGDFPlugin({ directory: activeDir, client: makeClient() }, { executeAutomaticRuntimeCheck: automaticRuntimeCheck });
    logs.length = 0;
    toasts.length = 0;
    await activePlugin.event({ event: { type: "session.created" } });
    assert.ok(logs.some((l) => l.level === "info" && l.message.includes("active through durable control")), "active session must log");
    assert.equal(toasts.length, 0, "active session must not toast");
    const systemOutput = { system: [] };
    await activePlugin["experimental.chat.system.transform"]({}, systemOutput);
    assert.ok(systemOutput.system.some((entry) => entry.includes("AGDF Runtime Reminder")), "active guidance must be injected");
    assert.ok(systemOutput.system.some((entry) => entry.includes("AGDF automatic runtime check: status=pass")), "successful automatic runtime-check output must be injected");
    assert.ok(systemOutput.system.some((entry) => entry.includes("AGDF dispatcher binding:") && entry.includes('"skill-dispatch","--json","--surface","opencode"')), "active guidance must expose the exact dispatcher binding");
    assert.ok(systemOutput.system.some((entry) => entry.includes("Obey result.host_action exactly") && entry.includes('"pre_dispatch_output":"none"') && entry.includes('"terminal_output":"host_action.text_verbatim_only"') && entry.includes("output host_action.text byte-for-byte")), "active guidance must bind terminal dispatcher transfer");
    assert.ok(systemOutput.system.some((entry) => entry.includes('"ordinary_conversation":"ignore_agdf_context"') && entry.includes('"runtime_mention":"only_when_user_requests_agdf"')), "active guidance must not activate AGDF from binding presence alone");

    const inactiveSystemOutput = { system: [] };
    await inactivePlugin["experimental.chat.system.transform"]({}, inactiveSystemOutput);
    assert.ok(inactiveSystemOutput.system.some((entry) => entry.includes("No executable AGDF dispatcher binding is available") && entry.includes("Do not request shell permission for AGDF commands")), "inactive guidance must withhold executable dispatch");
    assert.ok(inactiveSystemOutput.system.every((entry) => !entry.includes('"skill-dispatch","--json","--surface","opencode"')), "inactive guidance must not expose the executable binding");

    const noToastClient = makeClient(false);
    const noToastPlugin = await AGDFPlugin({ directory: inactiveDir, client: noToastClient }, { executeAutomaticRuntimeCheck: automaticRuntimeCheck });
    logs.length = 0;
    await noToastPlugin.event({ event: { type: "session.created" } });
    assert.ok(logs.some((l) => l.level === "info"), "inactive session must still log when TUI is unavailable");

    const throwingClient = {
      app: { async log(input) { logs.push(input.body ?? input); } },
      tui: { async showToast() { throw new Error("TUI unavailable"); } },
    };
    const throwingPlugin = await AGDFPlugin({ directory: inactiveDir, client: throwingClient }, { executeAutomaticRuntimeCheck: automaticRuntimeCheck });
    logs.length = 0;
    await assert.doesNotReject(async () => { await throwingPlugin.event({ event: { type: "session.created" } }); }, "session.created must not reject when showToast throws");
    assert.ok(logs.some((l) => l.level === "info"), "session.created must still log when showToast throws");

    const nonSessionPlugin = await AGDFPlugin({ directory: inactiveDir, client: makeClient() }, { executeAutomaticRuntimeCheck: automaticRuntimeCheck });
    logs.length = 0;
    toasts.length = 0;
    await nonSessionPlugin.event({ event: { type: "session.idle" } });
    assert.equal(logs.length, 0, "non-session.created events must not log");
    assert.equal(toasts.length, 0, "non-session.created events must not toast");
  } finally {
    rmSync(pluginTemp, { recursive: true, force: true });
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("OpenCode hardening tests passed.");
