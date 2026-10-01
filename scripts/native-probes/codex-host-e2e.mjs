#!/usr/bin/env node
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
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnHostSync } from "../../packages/cli/lib/host-command.js";
import { CODEX_HOOK_STATES } from "../../packages/core/lib/interaction-catalog.js";

const SERVER = "agdf";
const TOOL = "agdf_dispatch";
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const model = option("--model", process.env.AGDF_E2E_MODEL || null);
if (!model) {
  console.error("AGDF_E2E_MODEL_REQUIRED: pass --model <model> or set AGDF_E2E_MODEL");
  process.exit(2);
}
const keep = args.includes("--keep");
const codex = process.env.CODEX_BIN || "codex";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
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
const env = { ...process.env, CODEX_HOME: codexHome, AGDF_DATA_DIR: dataRoot,
  ...(isAbsolute(codex) ? { PATH: `${dirname(codex)}${delimiter}${process.env.PATH ?? ""}` } : {}) };
// Only model invocations receive an API key. Installers, builds and removal never inherit it.
const apiKey = env.CODEX_API_KEY;
delete env.CODEX_API_KEY;
delete env.OPENAI_API_KEY;
delete process.env.CODEX_API_KEY;
delete process.env.OPENAI_API_KEY;
const run = (command, argv, options = {}) => {
  const result = spawnHostSync(command, argv, { encoding: "utf8", env, timeout: 300000, maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error?.message ?? null };
};
// Paths appear raw, with forward slashes and JSON-escaped (doubled backslashes) in tool results.
const redact = (text) => [work, work.replaceAll("\\", "/"), work.replaceAll("\\", "\\\\")]
  .reduce((value, path) => value.replaceAll(path, "<WORK>"), String(text)).replaceAll(apiKey || "\0", "<REDACTED>");
const steps = [];
const step = (name, pass, evidence) => { steps.push({ name, status: pass ? "pass" : "fail", evidence }); return pass; };

// Collects structured MCP tool-call items for agdf_dispatch from `codex exec --json` output and the
// session rollouts; item shapes differ between those sources and Codex versions.
function mcpCalls(texts) {
  const calls = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    const item = node.item ?? node.payload?.item;
    if (item && ["mcp_tool_call", "McpToolCall"].includes(item.type)) {
      const call = item.invocation ?? item;
      if (call.tool === TOOL && (!call.server || call.server === SERVER)) {
        const result = item.result ?? item.output ?? null;
        const text = typeof result === "string" ? result
          : Array.isArray(result?.content) ? result.content.map((part) => part.text ?? "").join("")
            : result?.structured_content ? JSON.stringify(result.structured_content) : "";
        const error = item.error?.message ?? (typeof item.error === "string" ? item.error : null);
        calls.push({ id: item.id ?? null, status: item.status ?? null, pluginId: item.pluginId ?? call.pluginId ?? null, text, error });
      }
    }
  };
  for (const text of texts) for (const line of text.split("\n")) { try { visit(JSON.parse(line)); } catch {} }
  // The same call can appear as started and completed and in exec output and rollout: keep the last per id.
  const byId = new Map();
  for (const call of calls) byId.set(call.id ?? `${byId.size}`, call);
  return [...byId.values()].map((call) => {
    let parsed = null;
    try { parsed = JSON.parse(call.text); } catch {}
    const contracts = parsed?.continuation?.runtime_contracts;
    return { status: call.status, plugin_id: call.pluginId, outcome: parsed?.outcome ?? null, terminal: parsed?.terminal ?? null, authorizes: parsed?.authorizes ?? null,
      contract_modules: Array.isArray(contracts) ? contracts.map(c => c.module) : [],
      contracts_verified: Array.isArray(contracts) && contracts.length > 0 && contracts.every(c => typeof c.content === "string" && c.content.length > 0 && createHash("sha256").update(c.content).digest("hex") === c.sha256),
      host_action: redact(parsed?.host_action?.text ?? call.error ?? call.text).slice(0, 160),
      approval_blocked: /requires approval/i.test(`${call.error ?? ""} ${call.text}`) };
  });
}

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
let approvalPath = "installer_native_config_rpc";
const session = (input, label) => {
  const started = Date.now();
  const output = run(codex, ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check", "-m", model,
    prompt(input)], { cwd: target, stdio: ["ignore", "pipe", "pipe"], env: { ...env, ...(apiKey ? { CODEX_API_KEY: apiKey } : {}) } });
  writeFileSync(join(results, `${label}-process.json`), JSON.stringify({ ...output, stdout: redact(output.stdout), stderr: redact(output.stderr) }, null, 2));
  const rollouts = rolloutsSince(started);
  const rolloutCalls = mcpCalls(rollouts);
  const models = new Set();
  for (const text of rollouts) for (const line of text.split("\n")) {
    try {
      const item = JSON.parse(line);
      if (item.type === "turn_context" && item.payload?.model) models.add(item.payload.model);
    } catch {}
  }
  return { output, observed_models: [...models], calls: rolloutCalls.length ? rolloutCalls : mcpCalls([output.stdout]) };
};

const authSource = join(homedir(), ".codex", "auth.json");
const authCopy = join(codexHome, "auth.json");
const observation = { schema_version: 1, kind: "agdf_codex_host_e2e", recorded_at: new Date().toISOString(), requested_model: model };
const commit = run("git", ["rev-parse", "HEAD"], { cwd: repo });
const status = run("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain"], { cwd: repo });
observation.source = { commit: commit.status === 0 ? commit.stdout.trim() : null,
  dirty: status.status !== 0 || Boolean(status.stdout.trim()) };
try {
  // 1. Host tuple
  const version = run(codex, ["--version"]);
  observation.host = { client: "codex-cli", version: version.stdout.trim().split(/\s+/).at(-1) || null, os: process.platform, arch: process.arch, node: process.version };
  step("host", version.status === 0, { version: observation.host.version });

  // 2. Install the current checkout through the AGDF CLI into the isolated host
  const install = run(process.execPath, [join(repo, "create-agdf", "bin", "create-agdf.js"), "codex", "--accept-plugin-capabilities", "--json"]);
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

  // Prepare a real, isolated AGDF control target. A bare Git repository is intentionally not
  // sufficient for a positive dispatch result: it would correctly return target_content_mismatch.
  const cli = join(repo, "create-agdf", "bin", "create-agdf.js");
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

  // The installer owns the explicit tool consent; this test must not inject a replacement policy.

  const localAuth = !process.env.CI && existsSync(authSource);
  const hasAuth = Boolean(apiKey || localAuth);
  const prerequisitesPassed = steps.every(entry => entry.status === "pass");
  const canRunSessions = hasAuth && prerequisitesPassed;
  if (localAuth && !apiKey) { copyFileSync(authSource, authCopy); chmodSync(authCopy, 0o600); }

  // 4. One real agdf_dispatch call on an explicit target: a non-authorizing terminal control result
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
      exec_status: good.output.status, exec_stderr: redact(good.output.stderr).slice(0, 200) } : { skipped: hasAuth ? "prerequisite_failed" : "no ~/.codex/auth.json to copy" });

  // 5. Defined failure: a relative working directory yields invalid_input, not a crash
  const bad = canRunSessions ? session({ skill_id: "gate-check", presentation_language: "de", working_directory: "relative/dir" }, "failure") : null;
  const failure = bad?.calls?.at(-1);
  step("failure_case", Boolean(bad?.output.status === 0 && bad.observed_models.length === 1 && bad.observed_models[0] === model && bad.calls.length === 1 && failure?.outcome === "invalid_input" && failure.terminal === true && failure.authorizes === false && failure.plugin_id === "agdf@agdf"),
    canRunSessions ? { observed_models: bad.observed_models, plugin_id: failure?.plugin_id ?? null, calls: bad.calls.length, outcome: failure?.outcome ?? null, exec_status: bad.output.status, host_action: failure?.host_action ?? null } : { skipped: hasAuth ? "prerequisite_failed" : "authentication unavailable" });
  // Regression: judgement skills must receive contracts even though this isolated host has no trusted hook.
  const continued = canRunSessions ? session({ skill_id: "code-review", presentation_language: "de", working_directory: target,
    target_source: "explicit_target", primary_target: target, run_id: "codex-e2e" }, "continuation") : null;
  const continuation = continued?.calls?.at(-1);
  step("skill_continuation", Boolean(continued?.output.status === 0 && continued.calls.length === 1
    && continued.observed_models.length === 1 && continued.observed_models[0] === model
    && continuation?.plugin_id === "agdf@agdf" && continuation.outcome === "skill_continuation"
    && continuation.terminal === false && continuation.authorizes === false && continuation.contracts_verified
    && JSON.stringify(continuation.contract_modules) === JSON.stringify(["quality", "context-graph"])),
    { observed_models: continued?.observed_models ?? [], calls: continued?.calls.length ?? 0,
      exec_status: continued?.output.status ?? null,
      plugin_id: continuation?.plugin_id ?? null, outcome: continuation?.outcome ?? null,
      contract_modules: continuation?.contract_modules ?? [], contracts_verified: continuation?.contracts_verified ?? false });
  rmSync(authCopy, { force: true });

  // 6. Removal: the documented AGDF uninstall runs `codex plugin remove` and removes the owned runtime.
  // Do not edit host configuration before removal: evidence must describe the real uninstall.
  const uninstall = run(process.execPath, [join(repo, "create-agdf", "bin", "create-agdf.js"), "uninstall", "--surface", "codex", "--scope", "global", "--confirm", "--json"]);
  writeFileSync(join(results, "uninstall-process.json"), redact(JSON.stringify(uninstall, null, 2)));
  const after = run(codex, ["mcp", "list"], { cwd: target });
  const config = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
  const leftovers = {
    mcp_listed: /^agdf\s/m.test(after.stdout),
    config_mcp_section: /\[mcp_servers\.agdf[\].]/.test(config),
    // The installer's tool approval (plugins."agdf@agdf"...approval_mode) must not survive removal.
    plugin_tool_policy: /^\s*\[plugins\."agdf@agdf"[\].]/m.test(config) || /agdf_dispatch[\s\S]*approval_mode/.test(config),
    plugin_cache: existsSync(join(codexHome, "plugins", "cache", "agdf", "agdf")),
    mcp_runtime: existsSync(join(dataRoot, "mcp", "codex-plugin")),
  };
  step("removal", uninstall.status === 0 && after.status === 0 && Object.values(leftovers).every((value) => value === false),
    { uninstall_status: uninstall.status, ...leftovers, kept_by_design: "agdf marketplace registration and directory",
      stderr: redact(uninstall.stderr).slice(0, 200) });
} catch {
  step("probe_error", false, { reason: "Unexpected probe failure; inspect local process reports. No credentials are included in release artifacts." });
} finally {
  rmSync(authCopy, { force: true });
}

observation.steps = steps;
observation.result = steps.every((entry) => entry.status === "pass") ? "pass" : "fail";
writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
const summary = [
  `AGDF Codex-Host-E2E (${observation.recorded_at})`,
  `Tupel: Codex ${observation.host?.version ?? "?"}, Modell ${observation.requested_model}, ${observation.host?.os}/${observation.host?.arch}, Node ${observation.host?.node}, AGDF ${observation.agdf?.version ?? "?"}`,
  `Freigabe agdf_dispatch: ${observation.approval_path ?? "nicht geprüft"}`,
  `ERGEBNIS: ${observation.result.toUpperCase()}`,
  ...steps.map((entry) => `  ${entry.status === "pass" ? "ok  " : "FAIL"} ${entry.name}: ${JSON.stringify(entry.evidence)}`),
].join("\n");
writeFileSync(join(results, "summary.txt"), `${summary}\n`);
if (!keep) rmSync(work, { recursive: true, force: true });
console.log(summary);
console.log(`\nErgebnisse: ${resultsRel}/ (summary.txt, observation.json)`);
process.exitCode = observation.result === "pass" ? 0 : 1;
