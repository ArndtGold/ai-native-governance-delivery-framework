#!/usr/bin/env node
import { runGuardedCohort, verifyGuardedWorker, recordGuardedSession } from './lib/codex-command-guard.mjs';
import { mcpCalls as capturedCodexCalls } from './lib/codex-trace.mjs';
// Host end-to-end check for AGDF under Codex with exactly one recorded tuple:
// host version, model, discovery, one agdf_dispatch call, one defined failure case and removal.
//
// Everything runs in an isolated CODEX_HOME and AGDF_DATA_DIR inside probe-results/. Outside CI,
// local auth.json may be copied for the sessions and deleted afterwards; CI requires an API key. Evidence is
// structured (`codex exec --json` items, session rollouts, CLI output), never model prose.
//
// Codex asks for approval before each MCP tool call and `codex exec` rejects unapproved calls. The check
// approves only agdf_dispatch through plugin-scoped policy, preserving the plugin-owned transport.
//
// Usage (repository root, macOS or Linux):
//   npm run native:codex-e2e -- --model gpt-6-luna
//   npm run native:codex-e2e -- --model <model> --keep
//   CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex npm run native:codex-e2e -- --model gpt-6-luna
// Result: probe-results/codex-host-e2e-<timestamp>/summary.txt and observation.json.
// The separately selected T7 command mode reuses the existing ChatGPT account
// with process-only configuration: no credential copy or plugin installation.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnHostSync } from "../../packages/cli/lib/host-command.js";
import { CODEX_MCP_STARTUP_ARGS, independentCodexEnvironment } from '../../packages/cli/lib/host-adapters/codex/mcp-startup.js';
import { CODEX_HOOK_STATES } from "../../packages/core/lib/interaction-catalog.js";
import { createProtocolRuntime } from '../../evals/mcp-ergonomics/lib/protocol-harness.js';
import { withStdioClient } from '../../packages/mcp-server/test/helpers.js';
import { buildTaskFixture, loadTaskSet, renderPrompt, evaluateSuccess, CODEX_COMMAND_TASK } from '../../evals/mcp-ergonomics/lib/native-tasks.js';
import { compareManifests, hashManifest, parseCodexT4Trace, strictT4DocumentFlow, parseCodexCommandTrace, strictCommandFlow, nativeSessionMetrics, CODEX_T4_FEATURES, assertCodexT4HostReady } from '../../evals/mcp-ergonomics/lib/native-run.js';
import { snapshotWorkspace, changedPaths, mutationViolations } from '../../evals/lib/skill-evals/workspace.js';
import { sanitizeTranscript } from '../../evals/mcp-ergonomics/lib/redaction.js';
import { CLI_CASES, releasePolicy, requiresFrozenTuple } from './lib/release-policy.mjs';
import { readCandidate, validateCandidate, jsonDigest } from './lib/release-candidate.mjs';
import { emitReleaseRecords } from './lib/release-observation.mjs';
import { installedIdentity, rootForVersion, releasedBaseline, installBaseline, makeOwnedStale } from './lib/release-lifecycle.mjs';

const SERVER = "agdf";
const TOOL = "agdf_dispatch";
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const model = option("--model", process.env.AGDF_E2E_MODEL || null);
if (!model) {
  console.error("AGDF_E2E_MODEL_REQUIRED: pass --model <model> or set AGDF_E2E_MODEL");
  process.exit(2);
}
if (args.includes('--command-task')) {
  const permitted = new Set(['--command-task', '--repetitions', '--model', '--reasoning-effort', '--dry-run', '--preflight-only']);
  for (let i = 0; i < args.length; i++) {
    if (!permitted.has(args[i])) throw Error('COMMAND_TASK_ARGUMENT_INVALID');
    if (!['--dry-run', '--preflight-only'].includes(args[i])) i++;
  }
  if (option('--command-task') !== 'T7' || option('--repetitions') !== '2' || option('--reasoning-effort') !== 'low' || model !== 'gpt-6.1-sol') throw Error('COMMAND_TASK_TUPLE_INVALID');
  const plan = { task: 'T7', sessions: 2, repetitions: 2, model, reasoning_effort: 'low', timeout_ms: 600000,
    additional_api_spend_authorized_usd: 0, auth: 'existing_chatgpt_account', credential_copy: false, plugin_install: false, executes: false };
  if (args.includes('--dry-run')) console.log(JSON.stringify(plan));
  else if (!process.env.AGDF_T7_GUARD_WORKER) {
    const candidate = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
    const result = await runGuardedCohort({ candidate, entry: fileURLToPath(import.meta.url), args });
    console.log(JSON.stringify({ cohort: result })); process.exitCode = result.exit_code;
  }
  else if (args.includes('--preflight-only')) { verifyGuardedWorker(resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')); await runFocusedTask(model, process.env.CODEX_BIN || 'codex', { commandTask: true, preflightOnly: true }); }
  else {
    verifyGuardedWorker(resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'));
    for (let repetition = 1; repetition <= 2; repetition++) {
      const report = await runFocusedTask(model, process.env.CODEX_BIN || 'codex', { commandTask: true, repetition });
      if (!report.infrastructure_ok) break;
    }
  }
  process.exit(process.exitCode ?? 0);
}
if (args.includes('--preflight-only')) throw Error('COMMAND_TASK_MODE_REQUIRED');
if (args.includes('--single-session')) {
  if (option('--task') !== 'T4' || args.includes('--scenario') || args.includes('--keep')) throw Error('SINGLE_T4_ARGUMENT_INVALID');
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify({ task: 'T4', sessions: 1, repetitions: 1, model, reasoning_effort: 'high', timeout_ms: 300000, additional_api_spend_usd: 0, auth: 'existing_chatgpt_account', features: CODEX_T4_FEATURES, executes: false }));
  } else await runFocusedTask(model, process.env.CODEX_BIN || 'codex');
  process.exit(process.exitCode ?? 0);
}
if (args.includes('--task') || args.includes('--dry-run')) throw Error('SINGLE_T4_MODE_REQUIRED');

const keep = args.includes("--keep");
const scenario = option('--scenario', null);
if (scenario !== null && !CLI_CASES.includes(scenario)) throw Error('Invalid release scenario');
const codex = process.env.CODEX_BIN || "codex";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const candidatePath = option('--candidate', null);
const candidate = candidatePath ? readCandidate(candidatePath) : null;
if (candidate) { validateCandidate(repo, candidate); if (!scenario) throw Error('RELEASE_SCENARIO_REQUIRED'); }
const tuplePath = option('--tuple', null);
// A mandatory Codex row is bound by its preflight-frozen tuple, as for Claude; pinned diagnostics are not.
if (candidate && requiresFrozenTuple(releasePolicy(repo), 'codex', process.platform) && !tuplePath) throw Error('CODEX_RELEASE_PREFLIGHT_REQUIRED');
const frozenTuple = tuplePath ? JSON.parse(readFileSync(tuplePath, 'utf8')) : null;
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const resultsRel = `probe-results/codex-host-e2e-${stamp}`;
const results = join(repo, resultsRel);
const work = join(results, "work-tmp");
const codexHome = join(work, "codex-home");
const dataRoot = join(work, "agdf-data");
const target = join(work, "target-repo");
for (const dir of [codexHome, dataRoot, target]) mkdirSync(dir, { recursive: true, mode: 0o700 });
// Own git root, so Codex does not load this repository's instructions into the session.
spawnSync("git", ["init", "-q"], { cwd: target });

// The AGDF CLI resolves `codex` from PATH; with CODEX_BIN the installer must use the same binary as the checks.
const env = { ...independentCodexEnvironment(process.env), CODEX_HOME: codexHome, AGDF_DATA_DIR: dataRoot,
  ...(isAbsolute(codex) ? { PATH: `${dirname(codex)}${delimiter}${process.env.PATH ?? ""}` } : {}) };
// Only model invocations receive an API key. Installers, builds and removal never inherit it.
const apiKey = env.CODEX_API_KEY;
delete env.CODEX_API_KEY;
delete env.OPENAI_API_KEY;
delete process.env.CODEX_API_KEY;
delete process.env.OPENAI_API_KEY;
const run = (command, argv, options = {}) => {
  const result = spawnHostSync(command, argv, { encoding: "utf8", env, cwd: target, timeout: 300000, maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error?.message ?? null };
};
// Paths appear raw, with forward slashes and JSON-escaped (doubled backslashes) in tool results.
const redact = (text) => [work, work.replaceAll("\\", "/"), work.replaceAll("\\", "\\\\")]
  .reduce((value, path) => value.replaceAll(path, "<WORK>"), String(text)).replaceAll(apiKey || "\0", "<REDACTED>");
const steps = [];
const step = (name, pass, evidence) => { steps.push({ name, status: pass ? "pass" : "fail", evidence }); return pass; };

// Collects structured MCP tool-call items for agdf_dispatch from `codex exec --json` output and the
// session rollouts; item shapes differ between those sources and Codex versions.
function rolloutsSince(startMs) {
  const files = [];
  const visit = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (name.endsWith(".jsonl") && stats.mtimeMs >= startMs) files.push(readFileSync(path, "utf8"));
    }
  };
  visit(join(codexHome, "sessions"));
  return files;
}

const prompt = (input) => `Call the MCP tool ${TOOL} from the ${SERVER} server exactly once with exactly these arguments and nothing else: ${JSON.stringify(input)}. `
  + "If the tool is deferred, use functions.exec to find mcp__agdf__agdf_dispatch in ALL_TOOLS and invoke it through tools.mcp__agdf__agdf_dispatch. "
  + "Tool discovery and this wrapper are allowed. Do not run shell commands or call unrelated tools. Follow the tool's terminal response instructions. For a nonterminal skill_continuation this is only a transport probe: consume continuation.runtime_contracts and reply CONTRACTS_RECEIVED without executing the review or recording any governance decision.";
const configPath = join(codexHome, "config.toml");
writeFileSync(configPath, 'approval_policy = "on-request"\nsandbox_mode = "workspace-write"\n');
const permissionPreserved = () => {
  const text = readFileSync(configPath, 'utf8');
  return /^approval_policy\s*=\s*"on-request"/mu.test(text) && /^sandbox_mode\s*=\s*"workspace-write"/mu.test(text);
};
let approvalPath = "installer_native_config_rpc";
const session = (input, label) => {
  const started = Date.now();
  const output = run(codex, ["exec", ...CODEX_MCP_STARTUP_ARGS, "--json", "--sandbox", "read-only", "--skip-git-repo-check", "-m", model,
    prompt(input)], { cwd: target, stdio: ["ignore", "pipe", "pipe"], env: { ...env, ...(apiKey ? { CODEX_API_KEY: apiKey } : {}) } });
  writeFileSync(join(results, `${label}-process.json`), JSON.stringify({ ...output, stdout: redact(output.stdout), stderr: redact(output.stderr) }, null, 2));
  const rollouts = rolloutsSince(started);
  writeFileSync(join(results, `${label}-primary.json`), redact(JSON.stringify({ status: output.status, stdout: output.stdout, rollouts })));
  const rolloutCalls = capturedCodexCalls(rollouts, redact);
  const models = new Set();
  for (const text of rollouts) for (const line of text.split("\n")) {
    try {
      const item = JSON.parse(line);
      if (item.type === "turn_context" && item.payload?.model) models.add(item.payload.model);
    } catch {}
  }
  return { output, observed_models: [...models], calls: rolloutCalls.length ? rolloutCalls : capturedCodexCalls([output.stdout], redact) };
};

const authSource = join(homedir(), ".codex", "auth.json");
const authCopy = join(codexHome, "auth.json");
const observation = { schema_version: 1, kind: "agdf_codex_host_e2e", recorded_at: new Date().toISOString(), requested_model: model,
  ...(scenario ? { scenario } : {}) };
const commit = run("git", ["rev-parse", "HEAD"], { cwd: repo });
const status = run("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain"], { cwd: repo });
observation.source = { commit: commit.status === 0 ? commit.stdout.trim() : null,
  dirty: status.status !== 0 || Boolean(status.stdout.trim()) };
let loadedIdentity = null, baseline = null;
writeFileSync(join(target, 'foreign-sentinel.txt'), 'preserve-native-test-state\n');
try {
  // 1. Host tuple
  const version = run(codex, ["--version"]);
  writeFileSync(join(results, 'host-process.json'), redact(JSON.stringify(version)));
  observation.host = { client: "codex-cli", version: version.stdout.trim().split(/\s+/).at(-1) || null, os: process.platform, arch: process.arch, node: process.version };
  step("host", version.status === 0, { version: observation.host.version });
  if (frozenTuple) {
    const actual = { host: 'codex', surface: 'cli', os: process.platform, arch: process.arch, version: observation.host.version, node: process.version, model };
    if (frozenTuple.candidate_id !== candidate?.candidate_id || frozenTuple.tuple_digest !== jsonDigest(actual)) throw Error('CODEX_PREFLIGHT_TUPLE_MISMATCH');
  }
  if (['upgrade', 'recovery'].includes(scenario)) {
    baseline = await releasedBaseline(join(work, 'baseline'));
    installBaseline(baseline.cli, 'codex', env, { cwd: target });
    baseline.identity = installedIdentity(rootForVersion(work, '0.14.5'), '0.14.5');
  }

  // 2. Install the current checkout through the AGDF CLI into the isolated host
  const install = run(process.execPath, [join(repo, "packages", "cli", "bin", "create-agdf.js"), "codex", "--accept-plugin-capabilities", "--json"]);
  let installReport = null;
  try { installReport = JSON.parse(install.stdout); } catch {}
  observation.agdf = { version: installReport?.plugin?.version?.installed ?? null };
  const hookVerification = installReport?.runtime_checks?.verification;
  const hookState = Object.hasOwn(CODEX_HOOK_STATES, hookVerification) ? CODEX_HOOK_STATES[hookVerification] : null;
  const hookPending = install.status === 1 && installReport?.result === "partial"
    && installReport?.effective_state === hookState?.state
    && installReport?.failure === null && hookState && installReport?.next_action?.code === hookState.action
    && installReport?.runtime_checks?.effective === "decision_required"
    && installReport?.runtime_checks?.mcp_approval?.status === "configured";
  step("install", (install.status === 0 && installReport?.result === "success") || hookPending,
    { result: installReport?.result ?? null, effective_state: installReport?.effective_state ?? null, stderr: redact(install.stderr).slice(0, 300) });
  step("installation_consent", installReport?.runtime_checks?.requested === "enabled"
    && installReport?.runtime_checks?.mcp_approval?.status === "configured", {
    requested: installReport?.runtime_checks?.requested ?? null,
    hook_verification: installReport?.runtime_checks?.verification ?? null,
    mcp_approval: installReport?.runtime_checks?.mcp_approval ?? null,
  });
  if (scenario === 'recovery') {
    makeOwnedStale(rootForVersion(work, candidate?.version ?? observation.agdf.version), candidate?.version ?? observation.agdf.version);
    const repaired = run(process.execPath, [join(repo, 'packages/cli/bin/create-agdf.js'), 'codex', '--accept-plugin-capabilities', '--json']);
    writeFileSync(join(results, 'repair-process.json'), redact(JSON.stringify(repaired, null, 2)));
    let repairReport; try { repairReport = JSON.parse(repaired.stdout); } catch {}
    step('repair', ['success', 'partial'].includes(repairReport?.result) && !repairReport?.failure, { exit_status: repaired.status });
  }

  // Prepare a real, isolated AGDF control target. A bare Git repository is intentionally not
  // sufficient for a positive dispatch result: it would correctly return target_content_mismatch.
  const cli = join(repo, "packages", "cli", "bin", "create-agdf.js");
  const controlInit = run(process.execPath, [cli, "init", "--dir", target, "--json"], { cwd: target });
  const controlRun = run(process.execPath, [cli, "run-create", "--dir", target, "--run", "codex-e2e", "--json"], { cwd: target });
  step("control_fixture", controlInit.status === 0 && controlRun.status === 0,
    { init_status: controlInit.status, run_create_status: controlRun.status, stderr: redact(`${controlInit.stderr}\n${controlRun.stderr}`).trim().slice(0, 300) });

  // 3. Discovery: the plugin server is listed and points at the plugin-local launcher
  const get = run(codex, ["mcp", "get", SERVER, "--json"], { cwd: target });
  let entry = null;
  try { entry = JSON.parse(get.stdout); } catch {}
  const launcherArgs = entry?.transport?.args ?? [];
  step("discovery", Boolean(entry?.enabled !== false && String(launcherArgs[0] ?? "").replaceAll("\\", "/").endsWith("/mcp/agdf-mcp-launch.js")
    && launcherArgs[1] === "--surface" && launcherArgs[2] === "codex"), { command: entry?.transport?.command ?? null, args: redact(JSON.stringify(launcherArgs)) });
  if (candidate) loadedIdentity = installedIdentity(dirname(dirname(launcherArgs[0])), candidate.version);

  // The installer owns the explicit tool consent; this test must not inject a replacement policy.

  const localAuth = !process.env.CI && existsSync(authSource);
  const hasAuth = Boolean(apiKey || localAuth);
  const prerequisitesPassed = steps.every(entry => entry.status === "pass");
  const canRunSessions = hasAuth && prerequisitesPassed;
  if (localAuth && !apiKey) { copyFileSync(authSource, authCopy); chmodSync(authCopy, 0o600); }

  // 4. One real agdf_dispatch call on an explicit target: a non-authorizing terminal control result
  observation.approval_path = hasAuth ? approvalPath : null;
  if (!scenario || scenario === 'dispatch') {
  const good = canRunSessions ? session({ skill_id: "gate-check", presentation_language: "de", working_directory: target,
    target_source: "explicit_target", primary_target: target, run_id: "codex-e2e" }, "dispatch") : null;
  const call = good?.calls?.at(-1);
  if (good && !call) approvalPath = "unknown";
  observation.approval_path = hasAuth ? approvalPath : null;
  // pluginId, where Codex records it, must name the AGDF plugin: the server came from the plugin declaration.
  step("dispatch", Boolean(good?.output.status === 0 && good.observed_models.length === 1 && good.observed_models[0] === model && good.calls.length === 1 && call?.outcome === "control_result" && call.terminal === true && call.authorizes === false
    && call.plugin_id === "agdf@agdf"),
    canRunSessions ? { approval_path: approvalPath, observed_models: good.observed_models, calls: good.calls.length, plugin_id: call?.plugin_id ?? null, outcome: call?.outcome ?? null, terminal: call?.terminal ?? null,
      authorizes: call?.authorizes ?? null, approval_blocked: call?.approval_blocked ?? null, host_action: call?.host_action ?? null,
      runtime_digest: call?.runtime_digest ?? null,
      exec_status: good.output.status, exec_stderr: redact(good.output.stderr).slice(0, 200) } : { skipped: hasAuth ? "prerequisite_failed" : "no ~/.codex/auth.json to copy" });

  }
  if (['upgrade', 'recovery'].includes(scenario)) {
    const checked = canRunSessions ? session({ skill_id: 'gate-check', presentation_language: 'de', working_directory: target,
      target_source: 'explicit_target', primary_target: target, run_id: 'codex-e2e' }, scenario) : null;
    const call = checked?.calls?.at(-1);
    const preserved = readFileSync(join(target, 'foreign-sentinel.txt'), 'utf8') === 'preserve-native-test-state\n';
    step(scenario, Boolean(checked?.output.status === 0 && checked.calls.length === 1 && call?.outcome === 'control_result'
      && call.authorizes === false && call.plugin_id === 'agdf@agdf' && preserved), {
      baseline: { version: baseline?.version, integrity: baseline?.integrity, source_digest: baseline?.identity?.source_digest }, repair: scenario === 'recovery' ? 'owned_stale_install' : null,
      permission_preserved: permissionPreserved(),
      preserved_foreign_state: preserved, calls: checked?.calls.length ?? 0, observed_models: checked?.observed_models ?? [],
      plugin_id: call?.plugin_id, runtime_digest: call?.runtime_digest, outcome: call?.outcome, authorizes: call?.authorizes,
      exec_status: checked?.output.status ?? null });
  }
  // 5. Defined failure: a relative working directory yields invalid_input, not a crash
  if (!scenario || scenario === 'failure_case') {
  const bad = canRunSessions ? session({ skill_id: "gate-check", presentation_language: "de", working_directory: "relative/dir" }, "failure_case") : null;
  const failure = bad?.calls?.at(-1);
  step("failure_case", Boolean(bad?.output.status === 0 && bad.observed_models.length === 1 && bad.observed_models[0] === model && bad.calls.length === 1 && failure?.outcome === "invalid_input" && failure.terminal === true && failure.authorizes === false && failure.plugin_id === "agdf@agdf"),
    canRunSessions ? { observed_models: bad.observed_models, plugin_id: failure?.plugin_id ?? null, calls: bad.calls.length, outcome: failure?.outcome ?? null, authorizes: failure?.authorizes ?? null, exec_status: bad.output.status, host_action: failure?.host_action ?? null } : { skipped: hasAuth ? "prerequisite_failed" : "authentication unavailable" });
  }
  // Regression: judgement skills must receive contracts even though this isolated host has no trusted hook.
  if (!scenario || scenario === 'skill_continuation') {
  const continued = canRunSessions ? session({ skill_id: "code-review", presentation_language: "de", working_directory: target,
    target_source: "explicit_target", primary_target: target, run_id: "codex-e2e" }, "skill_continuation") : null;
  const continuation = continued?.calls?.at(-1);
  step("skill_continuation", Boolean(continued?.output.status === 0 && continued.calls.length === 1
    && continued.observed_models.length === 1 && continued.observed_models[0] === model
    && continuation?.plugin_id === "agdf@agdf" && continuation.outcome === "skill_continuation"
    && continuation.terminal === false && continuation.authorizes === false && continuation.contracts_verified
    && JSON.stringify(continuation.contract_modules) === JSON.stringify(["quality", "context-graph"])),
    { observed_models: continued?.observed_models ?? [], calls: continued?.calls.length ?? 0,
      exec_status: continued?.output.status ?? null,
      plugin_id: continuation?.plugin_id ?? null, outcome: continuation?.outcome ?? null,
      authorizes: continuation?.authorizes ?? null, runtime_digest: continuation?.runtime_digest ?? null,
      contract_modules: continuation?.contract_modules ?? [], contracts_verified: continuation?.contracts_verified ?? false });
  }
  rmSync(authCopy, { force: true });
} catch {
  step("probe_error", false, { reason: "Unexpected probe failure; inspect local process reports. No credentials are included in release artifacts." });
} finally {
  rmSync(authCopy, { force: true });
  // 6. Removal: the documented AGDF uninstall runs `codex plugin remove` and removes the owned runtime.
  // Do not edit host configuration before removal: evidence must describe the real uninstall.
  const uninstall = run(process.execPath, [join(repo, "packages", "cli", "bin", "create-agdf.js"), "uninstall", "--surface", "codex", "--scope", "global", "--confirm", "--json"]);
  writeFileSync(join(results, "uninstall-process.json"), redact(JSON.stringify(uninstall, null, 2)));
  const after = run(codex, ["mcp", "list"], { cwd: target });
  writeFileSync(join(results, 'removal-process.json'), redact(JSON.stringify(after)));
  const config = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
  const leftovers = {
    mcp_listed: /^agdf\s/m.test(after.stdout),
    config_mcp_section: /\[mcp_servers\.agdf[\].]/.test(config),
    // The installer's tool approval (plugins."agdf@agdf"...approval_mode) must not survive removal.
    plugin_tool_policy: /^\s*\[plugins\."agdf@agdf"[\].]/m.test(config) || /agdf_dispatch[\s\S]*approval_mode/.test(config),
    plugin_cache: existsSync(join(codexHome, "plugins", "cache", "agdf", "agdf")),
    mcp_runtime: existsSync(join(dataRoot, "mcp", "codex-plugin")),
  };
  step("removal", uninstall.status === 0 && after.status === 0 && Object.values(leftovers).every((value) => value === false) && permissionPreserved(),
    { uninstall_status: uninstall.status, ...leftovers, kept_by_design: "agdf marketplace registration and directory",
      stderr: redact(uninstall.stderr).slice(0, 200) });
}

observation.steps = steps;
observation.result = steps.every((entry) => entry.status === "pass") ? "pass" : "fail";
writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
emitReleaseRecords({ observation, candidate, directory: results, host: 'codex', scenario, loadedIdentity });
const summary = [
  `AGDF Codex-Host-E2E (${observation.recorded_at})`,
  `Tupel: Codex ${observation.host?.version ?? "?"}, Modell ${observation.requested_model}, ${observation.host?.os}/${observation.host?.arch}, Node ${observation.host?.node}, AGDF ${observation.agdf?.version ?? "?"}`,
  `Freigabe agdf_dispatch: ${observation.approval_path ?? "nicht geprüft"}`,
  `ERGEBNIS: ${observation.result.toUpperCase()}`,
  ...steps.map((entry) => `  ${entry.status === "pass" ? "ok  " : "FAIL"} ${entry.name}: ${JSON.stringify(entry.evidence)}`),
].join("\n");
writeFileSync(join(results, "summary.txt"), `${summary}\n`);
// A failed native removal can leave executing or unconfirmed SDK bytes. Keep
// that isolated diagnostic profile intact; the auth copy was removed above.
if (!keep && !existsSync(join(dataRoot, 'mcp/codex-plugin'))) rmSync(work, { recursive: true, force: true });
console.log(summary);
console.log(`\nErgebnisse: ${resultsRel}/ (summary.txt, observation.json)`);
process.exitCode = observation.result === "pass" ? 0 : 1;

// One new mode of the existing host owner; the default multi-session probe above
// is unreachable from this path. No fixture identifier is inserted into the prompt.
async function runFocusedTask(requestedModel, executable, { commandTask = false, repetition = 1, preflightOnly = false } = {}) {
  const taskRepo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const outputDir = join(taskRepo, 'probe-results', `codex-${commandTask ? 't7' : 't4'}-${new Date().toISOString().replace(/[:.]/gu, '-')}-${repetition}`);
  const taskWork = join(outputDir, 'work-tmp'), taskHome = join(taskWork, 'codex-home');
  mkdirSync(taskHome, { recursive: true, mode: 0o700 });
  const authPath = join(taskHome, 'auth.json');
  const taskEnv = { ...process.env, CODEX_HOME: commandTask ? process.env.CODEX_HOME ?? join(homedir(), '.codex') : taskHome, AGDF_DATA_DIR: join(taskWork, 'agdf-data') };
  for (const key of ['CODEX_API_KEY', 'OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_ORG_ID']) delete taskEnv[key];
  let fixture, runtime, session, beforeFixture, expectedBytes;
  const personalHome = commandTask ? taskEnv.CODEX_HOME : join(homedir(), '.codex');
  const manifests = () => ({ repository_control: hashManifest(join(taskRepo, '.agdf/control')),
    personal_config: hashManifest(personalHome, { files: ['config.toml', 'plugins/installed_plugins.json', 'plugins/known_marketplaces.json'] }) });
  const beforePersonal = manifests();
  const report = { schema_version: '1', kind: commandTask ? 'agdf_codex_t7_commands' : 'agdf_codex_t4_single', requested_model: requestedModel,
    evidence_class: process.env.NODE_TEST_CONTEXT ? 'offline_mock_host' : preflightOnly ? 'native_host_preflight' : 'native_host_observation', executable,
    task: commandTask ? 'T7' : 'T4', variant: 'mcp_only', repetitions: commandTask ? 2 : 1, repetition, session_invocations: 0, timeout_ms: commandTask ? 600000 : 300000, reasoning_effort: commandTask ? 'low' : 'high',
    additional_api_spend_authorized_usd: 0, cost_usd: 'unavailable', auth: 'existing_chatgpt_account', complete: false };
  if (commandTask) report.isolation_manifests = { before: beforePersonal };
  let hostExecutable = executable, hostPrefix = [];
  const redactText = value => [outputDir, fixture?.root, runtime?.fixture.root, personalHome].filter(Boolean)
    .reduce((text, path) => text.replaceAll(path, '<ISOLATED_PATH>'), String(value));
  const cleanup = () => { rmSync(authPath, { force: true }); rmSync(taskWork, { recursive: true, force: true }); fixture?.dispose(); runtime?.dispose(); };
  const onSignal = () => { session?.kill('SIGKILL'); cleanup(); process.exit(130); };
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, onSignal);
  try {
    if (commandTask) {
      // The whole T7 worker cohort already inherits one combined OS profile.
      report.host_guard = verifyGuardedWorker(taskRepo).controls;
    }
    // No credential value is included in output. The fresh isolated login must
    // confirm account auth; API-key fallback is disabled in config and environment.
    const source = join(personalHome, 'auth.json');
    if (!commandTask && (process.env.CI || !existsSync(source))) throw Error('EXISTING_CHATGPT_AUTH_UNAVAILABLE');
    if (!commandTask) { copyFileSync(source, authPath); chmodSync(authPath, 0o600); }
    const command = (argv, options = {}) => spawnHostSync(hostExecutable, [...hostPrefix, ...argv], { encoding: 'utf8', env: taskEnv, timeout: 15000, maxBuffer: 4 * 1024 * 1024, ...options });
    const auth = command(['login', 'status']);
    if (auth.status !== 0 || !/Logged in using ChatGPT/iu.test(`${auth.stdout}${auth.stderr}`)) throw Error('EXISTING_CHATGPT_AUTH_UNAVAILABLE');
    report.host = { version: command(['--version']).stdout.trim(), platform: process.platform, arch: process.arch, node: process.version };
    if (commandTask && !/0\.163\.0(?:\s|$)/u.test(report.host.version)) throw Error('CODEX_VERSION_CHANGED');
    const task = commandTask ? CODEX_COMMAND_TASK : loadTaskSet().tasks.find(entry => entry.id === 'T4');
    fixture = buildTaskFixture(task); runtime = createProtocolRuntime();
    beforeFixture = snapshotWorkspace(fixture.root);
    const document = join(fixture.root, `.agdf/control/runs/${fixture.runId}/presentations/${fixture.presentationId}.document`);
    expectedBytes = commandTask ? null : readFileSync(document);
    const binding = { target_id: fixture.targetId, run_id: fixture.runId, gate: 'UR', expected_revision_id: fixture.revision(), presentation_id: fixture.presentationId };
    const serverArgs = [join(runtime.fixture.serverRoot, 'bin/agdf-mcp.js'), '--surface', 'codex'];
    await withStdioClient({ modern: true, command: process.execPath, args: serverArgs, cwd: fixture.root, env: taskEnv }, async client => {
      const { tools } = await client.listTools(), definition = tools.find(tool => tool.name === 'agdf_inspect');
      const bytes = Buffer.byteLength(JSON.stringify(definition));
      if (!definition?.outputSchema || bytes > 5000) throw Error('CANDIDATE_INSPECT_CONTRACT_INVALID');
      report.discovery = { inspect_definition_bytes: bytes, inspect_definition_digest: `sha256:${createHash('sha256').update(JSON.stringify(definition)).digest('hex')}`, protocol: client.getNegotiatedProtocolVersion() };
      if (commandTask) {
        report.discovery.commands = ['agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout'].map(name => {
          const tool = tools.find(value => value.name === name);
          if (!tool?.outputSchema || Object.values(tool.inputSchema.properties).some(field => !field.description)) throw Error('CANDIDATE_COMMAND_CONTRACT_INVALID');
          return { name, definition_bytes: Buffer.byteLength(JSON.stringify(tool)), digest: `sha256:${createHash('sha256').update(JSON.stringify(tool)).digest('hex')}` };
        });
      }
    });
    const tools = commandTask ? ['agdf_inspect', 'agdf_approve'] : ['agdf_inspect'];
    let config, configCheck, features, scopedArgs = [];
    if (commandTask) {
      const overrides = { model: requestedModel, model_reasoning_effort: 'low', model_provider: 'openai', forced_login_method: 'chatgpt', web_search: 'disabled', project_doc_max_bytes: 0,
        ...Object.fromEntries(Object.entries({ ...CODEX_T4_FEATURES, plugins: false, hooks: false }).map(([key, value]) => [`features.${key}`, value])),
        'mcp_servers.agdf.command': process.execPath, 'mcp_servers.agdf.args': serverArgs, 'mcp_servers.agdf.required': true, 'mcp_servers.agdf.enabled_tools': tools,
        ...Object.fromEntries(tools.map(tool => [`mcp_servers.agdf.tools.${tool}.approval_mode`, 'approve'])) };
      scopedArgs = Object.entries(overrides).flatMap(([key, value]) => ['-c', `${key}=${JSON.stringify(value)}`]);
      config = Object.entries(overrides).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join('\n');
      configCheck = command([...scopedArgs, 'mcp', 'get', 'agdf', '--json'], { cwd: fixture.root });
      features = command([...scopedArgs, 'features', 'list']);
    } else {
      config = `model = ${JSON.stringify(requestedModel)}\nmodel_reasoning_effort = "high"\nforced_login_method = "chatgpt"\nweb_search = "disabled"\n[features]\n${Object.entries(CODEX_T4_FEATURES).map(([key, value]) => `${key} = ${value}`).join("\n")}\n[mcp_servers.agdf]\ncommand = ${JSON.stringify(process.execPath)}\nargs = ${JSON.stringify(serverArgs)}\nrequired = true\nenabled_tools = ["agdf_inspect"]\n[mcp_servers.agdf.tools.agdf_inspect]\napproval_mode = "approve"\n`;
      writeFileSync(join(taskHome, 'config.toml'), config, { mode: 0o600 });
      configCheck = command(['mcp', 'get', 'agdf', '--json'], { cwd: fixture.root });
      features = command(['features', 'list']);
    }
    if (configCheck.status !== 0) throw Error('ISOLATED_MCP_CONFIG_INVALID');
    if (commandTask) {
      const effective = JSON.parse(configCheck.stdout);
      if (effective.enabled !== true || effective.transport?.command !== process.execPath
        || JSON.stringify(effective.transport.args) !== JSON.stringify(serverArgs)
        || JSON.stringify(effective.enabled_tools) !== JSON.stringify(tools)) throw Error('CANDIDATE_MCP_CONFIG_MISMATCH');
    }
    assertCodexT4HostReady(features);
    report.discovery.code_mode_host = 'enabled_by_verified_config';
    report.effective_context = { isolated_home: !commandTask, ignore_user_config: commandTask, existing_account_home: commandTask,
      credential_copy: !commandTask, installed_skills: 0, other_mcp_servers: 0, shell_tool: false, memories: false, multi_agent: false,
      approved_tools: tools, config_digest: createHash('sha256').update(config).digest('hex') };
    report.candidate = { git_head: spawnHostSync('git', ['rev-parse', 'HEAD'], { cwd: taskRepo, encoding: 'utf8' }).stdout.trim(),
      source_files: { ...hashManifest(join(taskRepo, 'packages/core/lib')), ...Object.fromEntries(Object.entries(hashManifest(join(taskRepo, 'packages/mcp-server/src'))).map(([key, value]) => [`mcp/${key}`, value])) },
      runtime_marker: JSON.parse(readFileSync(join(runtime.fixture.root, '.agdf-mcp-owned.json'), 'utf8')),
      verification_inputs: hashManifest(taskRepo, { files: ['scripts/native-probes/codex-host-e2e.mjs', 'evals/mcp-ergonomics/lib/native-run.js', 'packages/mcp-server/package.json', 'packages/mcp-server/package-lock.json'] }),
      protected_inputs: hashManifest(join(taskRepo, 'evals/mcp-ergonomics'), { files: ['tasks.v1.json', 'lib/fixtures.js', 'lib/native-tasks.js'] }) };
    writeFileSync(join(outputDir, 'effective-config.toml'), redactText(config));
    const finalPath = join(outputDir, 'final-message.txt');
    const argv = ['exec', ...(commandTask ? ['--ignore-user-config', ...scopedArgs] : []), '--json', '--sandbox', commandTask ? 'workspace-write' : 'read-only', '--skip-git-repo-check', '-m', requestedModel, '-o', finalPath, renderPrompt(task, fixture)];
    if (commandTask) {
      report.isolation_manifests.before_session = manifests();
      if (compareManifests(beforePersonal, report.isolation_manifests.before_session).length) throw Error('PROTECTED_SETTINGS_CHANGED_DURING_PREFLIGHT');
    }
    if (preflightOnly) { report.preflight_only = true; report.preflight_status = 'pass'; report.infrastructure_ok = true; return report; }
    // This is the only model invocation in this mode. It is never retried/resumed.
    if (commandTask) recordGuardedSession(taskRepo, 'attempted');
    ++report.session_invocations;
    const sessionStarted = performance.now();
    const output = await new Promise((resolveSession, rejectSession) => {
      const child = spawn(hostExecutable, [...hostPrefix, ...argv], { cwd: fixture.root, env: taskEnv, detached: !commandTask && process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
      const kill = signal => { try { if (!commandTask && process.platform !== 'win32') process.kill(-child.pid, signal); else child.kill(signal); } catch {} };
      let stdout = '', stderr = '', timedOut = false, bytes = 0;
      session = { kill };
      const timer = setTimeout(() => { timedOut = true; kill('SIGKILL'); }, report.timeout_ms);
      const collect = stream => data => { bytes += data.length; if (bytes > 64 * 1024 * 1024) kill('SIGKILL'); else if (stream === 'stdout') stdout += data; else stderr += data; };
      child.stdout.on('data', collect('stdout')); child.stderr.on('data', collect('stderr'));
      if (commandTask) child.once('spawn', () => recordGuardedSession(taskRepo, 'executed', child.pid));
      child.once('error', error => { clearTimeout(timer); rejectSession(error); });
      child.once('close', code => { clearTimeout(timer); session = null; resolveSession({ code, stdout, stderr, timedOut, output_limit: bytes > 64 * 1024 * 1024 }); });
    });
    const rollouts = [];
    const visit = directory => { if (existsSync(directory)) for (const name of readdirSync(directory)) { const file = join(directory, name); if (statSync(file).isDirectory()) visit(file); else if (name.endsWith('.jsonl') && (!commandTask || name.includes(sessionId))) rollouts.push(readFileSync(file, 'utf8')); } };
    const sessionId = commandTask ? output.stdout.split('\n').filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return {}; } }).find(event => event.type === 'thread.started')?.thread_id : null;
    if (commandTask && !/^[0-9a-f-]{36}$/u.test(sessionId ?? '')) throw Error('CODEX_SESSION_ID_UNAVAILABLE');
    visit(join(commandTask ? personalHome : taskHome, 'sessions'));
    const parsed = commandTask ? parseCodexCommandTrace(output.stdout, rollouts) : parseCodexT4Trace(output.stdout, rollouts);
    if (output.code !== 0 || output.timedOut || output.output_limit) parsed.trace_complete = false;
    const finalText = existsSync(finalPath) ? readFileSync(finalPath, 'utf8') : '';
    report.process = { exit: output.code, timeout: output.timedOut, output_limit: output.output_limit, stderr: redactText(output.stderr).slice(0, 1000) };
    report.original_predicate = evaluateSuccess({ task, fixture, parsed, mutationViolations: mutationViolations(changedPaths(beforeFixture, snapshotWorkspace(fixture.root)), task.allowed_paths) });
    report.strict = commandTask ? strictCommandFlow({ parsed, binding }) : strictT4DocumentFlow({ parsed, expectedBytes, binding, finalText });
    report.observed_models = parsed.observed_models; report.observed_efforts = parsed.observed_efforts; report.usage = parsed.usage;
    report.metrics = { calls: parsed.calls.length, invalid_calls: parsed.calls.filter(call => call.result.is_error).length,
      ...(commandTask ? { ...nativeSessionMetrics({ ...parsed, result: { usage: parsed.usage } }, [...runtime.roots, { path: fixture.root, token: '<FIXTURE>' }, { path: personalHome, token: '<HOME>' }]), wall_time_ms: Math.round(performance.now() - sessionStarted) } : {}) };
    if (commandTask) report.expected_binding = binding;
    else report.expected_document = { binding, bytes: expectedBytes.length, digest: `sha256:${createHash('sha256').update(expectedBytes).digest('hex')}` };
    report.trace_complete = parsed.trace_complete; report.detours = parsed.detours;
    report.complete = report.original_predicate.success && report.strict.success && parsed.observed_models.length === 1 && parsed.observed_models[0] === requestedModel && (!commandTask || parsed.observed_efforts.length === 1 && parsed.observed_efforts[0] === 'low');
    report.infrastructure_ok = parsed.trace_complete && !parsed.detours.length && parsed.observed_models.length === 1 && parsed.observed_models[0] === requestedModel && (!commandTask || parsed.observed_efforts.length === 1 && parsed.observed_efforts[0] === 'low');
    writeFileSync(join(outputDir, 'events.jsonl'), sanitizeTranscript(output.stdout, redactText));
    writeFileSync(join(outputDir, 'rollouts.jsonl'), sanitizeTranscript(rollouts.join('\n'), redactText));
    writeFileSync(finalPath, redactText(finalText));
    if (!report.complete) process.exitCode = 1;
  } catch (error) { report.error = redactText(error.message); process.exitCode = 1; }
  finally {
    cleanup();
    const afterPersonal = manifests();
    if (commandTask) report.isolation_manifests.after = afterPersonal;
    report.isolation = { changed: compareManifests(beforePersonal, afterPersonal), credential_copy_removed: !existsSync(authPath), temporary_roots_removed: !existsSync(taskWork) };
    if (report.isolation.changed.length || !report.isolation.credential_copy_removed || !report.isolation.temporary_roots_removed) { report.complete = false; report.infrastructure_ok = false; process.exitCode = 1; }
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.off(signal, onSignal);
    writeFileSync(join(outputDir, 'observation.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ report: join(outputDir, 'observation.json'), complete: report.complete, session_invocations: report.session_invocations, error: report.error ?? report.strict?.reason ?? null }));
    return report;
  }
}
