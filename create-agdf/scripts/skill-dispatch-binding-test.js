import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDispatchBinding, createRuntimeProbe, runtimeEnvironment, validateDispatchBinding } from "../lib/skill-dispatch/binding.js";
import { skillDispatchArgumentGrammar } from "../lib/cli/command-registry.js";
import { TASK_TARGET_SOURCES } from "../lib/task-target-resolution.js";
import { AGDFPlugin } from "../opencode-plugin.js";
import { createRun, renderRunState } from "../lib/control-state/index.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";

// Emulate a host following the supplied grammar, not a production enforcement layer.
// Actual hosts still own semantic target values and their process/shell transport.
function buildDispatchInvocation(binding, values) {
  validateDispatchBinding(binding);
  const flags = [...binding.arguments.matchAll(/--[a-z-]+/gu)].map((m) => m[0]);
  if (Object.keys(values).some((key) => !flags.includes(key))) throw new Error("invalid_dispatch_argument");
  if (Object.hasOwn(values, "--target-source") !== Object.hasOwn(values, "--primary-target")) throw new Error("paired_target_required");
  const args = [...binding.argv_prefix];
  for (const flag of flags) {
    if (!Object.hasOwn(values, flag)) continue;
    if (values[flag].startsWith("-")) throw new Error("invalid_dispatch_argument");
    args.push(flag, values[flag]);
  }
  return { executable: binding.executable, args, environment: binding.environment };
}

const identity = { owner: "request_activation_contract", policy_version: 1, guard_fingerprint: `sha256:${"a".repeat(64)}` };
const validator = fileURLToPath(new URL("../bin/agdf-validator.js", import.meta.url));
const packageVersion = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const options = { validator, surface: "opencode", expectedVersion: packageVersion, requestActivation: identity };
assert.deepEqual(runtimeEnvironment({ node: "22" }), {});
assert.deepEqual(runtimeEnvironment({ node: "22", electron: "40" }), { ELECTRON_RUN_AS_NODE: "1" });
assert.throws(() => runtimeEnvironment({}), /unsupported_runtime/);
let calls = 0;
let statVersion = 1;
const probe = createRuntimeProbe({
  stat: () => ({ isFile: () => true, dev: 1, ino: statVersion, size: 1, mtimeMs: 1, ctimeMs: 1 }),
  spawn: (exe, argv, opts) => {
    calls++;
    assert.equal(exe, process.execPath);
    assert.equal(opts.env.ELECTRON_RUN_AS_NODE, "1");
    assert.equal(opts.timeout, 1000);
    assert.equal(opts.maxBuffer, 4096);
    assert.equal(opts.shell, false);
    return { status: 0, stdout: 'AGDF_RUNTIME_OK:22', stderr: "nonfatal OS diagnostic" };
  },
});
const electron = { executable: process.execPath, versions: { node: "22", electron: "40" } };
const before = process.env.ELECTRON_RUN_AS_NODE;
assert.deepEqual(probe(electron).environment, { ELECTRON_RUN_AS_NODE: "1" });
probe(electron);
assert.equal(calls, 1, "reuse only same launch identity");
statVersion++;
probe(electron);
assert.equal(calls, 2, "changed executable identity is revalidated");
assert.equal(process.env.ELECTRON_RUN_AS_NODE, before, "parent environment unchanged");
const bootstrapBefore = process.env.NODE_OPTIONS;
try {
  process.env.NODE_OPTIONS = "--require=/must-not-execute.js";
  assert.throws(() => probe(electron), /runtime_bootstrap_environment_unsupported/);
  assert.equal(calls, 2, "unsafe bootstrap environment must not spawn even after a cached success");
} finally {
  if (bootstrapBefore === undefined) delete process.env.NODE_OPTIONS;
  else process.env.NODE_OPTIONS = bootstrapBefore;
}
for (const result of [{ status: 1 }, { status: 0, stdout: "wrong" }, { status: 0, stdout: "x".repeat(5000) }, { error: new Error("timeout"), status: null }]) {
  const failed = createRuntimeProbe({ spawn: () => result });
  assert.throws(() => failed(), /runtime_probe_failed/);
}
assert.throws(() => createRuntimeProbe()({ executable: "/missing/agdf-runtime", versions: process.versions }), /runtime_unavailable/);
const actualProbe = createRuntimeProbe();
assert.deepEqual(actualProbe().environment, {}, "actual Node launch verified");
for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  const binding = createDispatchBinding({ ...options, surface });
  assert.equal(binding.schema_version, "2");
  assert.equal(binding.arguments, skillDispatchArgumentGrammar());
  assert.match(binding.arguments, new RegExp(`<${TASK_TARGET_SOURCES.join("\\|")}>`, "u"));
  assert.doesNotMatch(binding.arguments, /<source>/u);
  assert.equal(binding.authorizes, false);
  assert.equal(binding.environment.ELECTRON_RUN_AS_NODE, undefined);
  validateDispatchBinding(binding);
  const args = { "--skill": "qa-gate", "--language": "de", "--working-directory": process.cwd() };
  const invocation = buildDispatchInvocation(binding, args);
  assert.ok(!invocation.args.includes("--primary-target"), "cwd never becomes target");
  const response = spawnSync(invocation.executable, invocation.args, { encoding: "utf8", env: { ...process.env, ...invocation.environment } });
  assert.equal(response.status, 2, "unresolved target retains the existing CLI exit code: " + response.stderr);
  const data = JSON.parse(response.stdout);
  assert.equal(data.outcome, "target_unresolved");
  assert.equal(data.contract_version, 1);
  assert.equal(data.control, null);
  assert.equal(data.authorizes, false);
  assert.equal(data.host_action.text, data.presentation.markdown);
  for (const patch of [{ schema_version: "1" }, { schema_version: "99" }, { environment: { NODE_OPTIONS: "bad" } }, { environment: { ELECTRON_RUN_AS_NODE: "0" } }, { arguments: "--cwd <path>" }, { authorizes: true }]) {
    assert.throws(() => validateDispatchBinding({ ...binding, ...patch }), /invalid_dispatch_binding/);
  }
  assert.throws(() => buildDispatchInvocation(binding, { ...args, "--cwd": process.cwd() }), /invalid_dispatch_argument/);
  assert.throws(() => buildDispatchInvocation(binding, { ...args, "--primary-target": process.cwd() }), /paired_target/);
  assert.throws(() => buildDispatchInvocation(binding, { ...args, "--skill": "--help" }), /invalid_dispatch_argument/);
  for (const source of TASK_TARGET_SOURCES) {
    const selected = buildDispatchInvocation(binding, { ...args, "--target-source": source, "--primary-target": process.cwd() });
    assert.equal(selected.args.at(-1), process.cwd());
    assert.equal(selected.args.at(-3), source);
  }
}
assert.throws(() => createDispatchBinding({ ...options, validator: "/not-present/agdf-local.js" }), /runtime_unavailable/);
const temp = realpathSync(mkdtempSync(join(tmpdir(), "agdf-binding-")));
try {
  const file = join(temp, "arguments Ω '$`;.js");
  writeFileSync(file, 'process.stdout.write(JSON.stringify({args:process.argv.slice(2),env:process.env.ELECTRON_RUN_AS_NODE??null}));');
  const binding = createDispatchBinding({ ...options, validator: file });
  const hostile = join(temp, "quote' $(touch SHOULD_NOT_EXIST); `false` Ω");
  const call = buildDispatchInvocation(binding, { "--skill": "qa-gate", "--language": "de", "--working-directory": hostile });
  const out = spawnSync(call.executable, call.args, { encoding: "utf8", env: { ...process.env, ...call.environment }, shell: false });
  assert.equal(JSON.parse(out.stdout).args.at(-1), hostile, "structured argv preserves metacharacters");
  const windowsData = String.raw`C:\Work space\O'Brien\$dollar\back\tick`;
  const quotedData = [hostile, windowsData, 'double"quote', '& | > < % ! ( )'];
  const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
  if (process.platform !== "win32") {
    const shellResult = spawnSync("/bin/sh", ["-c", [process.execPath, file, ...quotedData].map(quote).join(" ")], { cwd: temp, encoding: "utf8" });
    assert.equal(shellResult.status, 0, shellResult.stderr);
    assert.deepEqual(JSON.parse(shellResult.stdout).args, quotedData, "POSIX shell preserves all argument boundaries");
    const envResult = spawnSync("/bin/sh", ["-c", `ELECTRON_RUN_AS_NODE=1 ${[process.execPath, file].map(quote).join(" ")}`], { cwd: temp, encoding: "utf8" });
    assert.equal(envResult.status, 0, envResult.stderr);
    assert.equal(JSON.parse(envResult.stdout).env, "1", "POSIX environment applies to the child only");
    assert.equal(process.env.ELECTRON_RUN_AS_NODE, before);
    assert.equal(existsSync(join(temp, "SHOULD_NOT_EXIST")), false);
  }
  // PowerShell syntax is a platform-string fixture here, not native Windows evidence.
  const psQuote = (value) => `'${value.replaceAll("'", "''")}'`;
  for (const value of quotedData) assert.equal(psQuote(value).slice(1, -1).replaceAll("''", "'"), value);

  const active = join(temp, "active Ω project");
  mkdirSync(active);
  assert.equal(spawnSync("git", ["init", "-q", active]).status, 0);
  initializeCanonicalControl(active, generatedFilesForTarget("init", active, false, "en"));
  writeFileSync(join(active, ".agdf", "control", "config.json"), JSON.stringify({ artifact_language: "en", chat_language: "en", runtime_language: "en" }));
  createRun(active, "early-run");
  // A synthetic QA-input state proves transport and retained judgement, never a QA pass.
  const qaPath = createRun(active, "qa-input");
  const artifacts = [
    ["UR", "UR", "approved"], ["Brownfield Review", "BROWNFIELD_REVIEW", "done"],
    ["PRD", "PRD", "approved"], ["SD", "SD", "approved"], ["TP", "TP", "approved"],
    ["Brownfield Analysis", "BROWNFIELD_ANALYSIS", "done"], ["CD+Tests", "CD_TESTS", "done"], ["CR", "CODE_REVIEW", "done"],
  ];
  const qaArtifacts = join(active, ".agdf/control/artefacts/qa-input");
  mkdirSync(qaArtifacts, { recursive: true });
  for (const [, name] of artifacts) writeFileSync(join(qaArtifacts, `${name}.md`), `# ${name}\nSynthetic transport fixture, not delivery evidence.\n`);
  const qaBody = `## Objective\n\nSynthetic QA-input transport.\n\n## Approvals\n\n| Gate | Status | Evidence |\n|---|---|---|\n${["UR", "PRD", "SD", "TP"].map((gate) => `| ${gate} | approved | Approval: ${gate} |`).join("\n")}\n| QA | missing | |\n\n## Artefacts\n\n| Type | Path | Status | Notes |\n|---|---|---|---|\n${artifacts.map(([type, name, status]) => `| ${type} | .agdf/control/artefacts/qa-input/${name}.md | ${status} | fixture |`).join("\n")}\n\n## Mode/Slice Decision\n\n- decision: structured_delivery\n- required_next_gate: PRD\n- scope_reason: transport fixture\n- evidence: fixture\n\n## Closeout\n\n- next_allowed_action: Run QA.\n- quality_outlook: Not a QA decision.\n`;
  writeFileSync(qaPath, renderRunState("qa-input", qaBody, { current_gate: "QA" }));
  const contextOnly = join(temp, "context only");
  mkdirSync(contextOnly);
  assert.equal(spawnSync("git", ["init", "-q", contextOnly]).status, 0);
  const generated = fileURLToPath(new URL("../generated/", import.meta.url));
  let count = 0;
  for (const surface of ["codex", "claude", "copilot", "opencode"]) {
    let emitted;
    if (surface === "opencode") {
      const hooks = await AGDFPlugin({ directory: active }, { validatorPath: validator });
      const output = { system: [] };
      await hooks["experimental.chat.system.transform"]({}, output);
      emitted = output.system.join("\n");
      const unavailable = await AGDFPlugin({ directory: active }, { validatorPath: join(temp, "missing-runtime") });
      const failed = { system: [] };
      await unavailable["experimental.chat.system.transform"]({}, failed);
      assert.match(failed.system.join(""), /dispatcher_unavailable/);
      assert.doesNotMatch(failed.system.join(""), /AGDF dispatcher binding:/);
    } else {
      const runtime = join(generated, "plugins", ...(surface === "copilot" ? ["copilot"] : []), "agdf", "runtime");
      const session = spawnSync(process.execPath, [join(runtime, "agdf-session-check.js")], {
        encoding: "utf8", cwd: contextOnly,
        env: { ...process.env, AGDF_SURFACE: surface, AGDF_DATA_DIR: join(temp, "consent-disabled") },
      });
      assert.equal(session.status, 0, session.stderr);
      emitted = surface === "copilot" ? JSON.parse(session.stdout).additionalContext : session.stdout;
    }
    const line = emitted.split("\n").find((value) => value.startsWith("AGDF dispatcher binding: "));
    const supplied = validateDispatchBinding(JSON.parse(line.slice("AGDF dispatcher binding: ".length)));
    assert.equal(supplied.expected_version, packageVersion);
    for (const skill of ["gate-check", "qa-gate"]) {
      const invoke = (target, run) => {
        const values = { "--skill": skill, "--language": "de", "--working-directory": contextOnly,
          ...(target ? { "--target-source": "continued_target", "--primary-target": target } : {}),
          ...(run ? { "--run": run } : {}) };
        const call = buildDispatchInvocation(supplied, values);
        const response = spawnSync(call.executable, call.args, {
          encoding: "utf8", timeout: 2000, maxBuffer: 1024 * 1024,
          env: { ...process.env, ...call.environment, AGDF_RUN: "" },
        });
        assert.ifError(response.error);
        assert.ok([0, 2].includes(response.status), response.stderr);
        const result = JSON.parse(response.stdout);
        assert.equal(result.contract_version, 1);
        assert.equal(result.authorizes, false);
        if (result.presentation) assert.equal(result.host_action.text, result.presentation.markdown);
        count++;
        return result;
      };
      const absent = invoke();
      assert.equal(absent.outcome, "target_unresolved");
      assert.equal(absent.control, null);
      assert.equal(absent.timing.control_ms, 0);
      assert.equal(absent.terminal, true);
      const missing = invoke(contextOnly);
      assert.ok(missing.control, JSON.stringify(missing));
      assert.equal(missing.control.blocking_reason, "AGDF_CONTROL_FILE_MISSING");
      assert.equal(missing.outcome, skill === "gate-check" ? "control_result" : "skill_continuation");
      const early = invoke(active, "early-run");
      assert.ok(early.control, JSON.stringify(early));
      assert.equal(early.control.current_gate, "UR", "qa-gate does not skip an earlier gate");
      assert.equal(early.target.primary_target, active);
      const qaInput = invoke(active, "qa-input");
      assert.equal(qaInput.control.current_gate, "QA", JSON.stringify(qaInput));
      if (skill === "qa-gate") {
        assert.equal(qaInput.outcome, "skill_continuation");
        assert.equal(qaInput.continuation.run_id, "qa-input");
        assert.equal(qaInput.continuation.governance_target, active);
        assert.equal(qaInput.authorizes, false);
      }
      const ambiguousRoot = join(temp, `ambiguous-${surface}-${skill}`);
      mkdirSync(ambiguousRoot);
      assert.equal(spawnSync("git", ["init", "-q", ambiguousRoot]).status, 0);
      initializeCanonicalControl(ambiguousRoot, generatedFilesForTarget("init", ambiguousRoot, false, {
        artifact_language: "de", chat_language: "de", runtime_language: "en",
      }));
      createRun(ambiguousRoot, "one");
      createRun(ambiguousRoot, "two");
      const ambiguous = invoke(ambiguousRoot);
      assert.equal(ambiguous.outcome, skill === "gate-check" ? "control_result" : "skill_continuation", JSON.stringify(ambiguous));
      assert.equal(ambiguous.control.blocking_reason, "AGDF_ACTIVE_RUN_AMBIGUOUS");
      if (skill === "gate-check") {
        assert.equal(ambiguous.presentation.presentation_language, "de");
        assert.match(ambiguous.host_action.text, /Den gewünschten Run/);
        assert.doesNotMatch(ambiguous.host_action.text, /Repair the existing|Pass --run/);
      }
      assert.ok(!["one", "two"].includes(ambiguous.control.run_id ?? ambiguous.control.status_card?.run_id), "transport must not choose a run");
    }
  }
  assert.equal(count, 40);
  console.log("40 adapter-to-dispatch cases passed (generated SessionStart and source-composed OpenCode, not loaded-host evidence)");
} finally { rmSync(temp, { recursive: true, force: true }); }
console.log("Skill dispatch binding tests passed");
