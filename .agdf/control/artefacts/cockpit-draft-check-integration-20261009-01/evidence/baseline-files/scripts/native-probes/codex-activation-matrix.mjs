#!/usr/bin/env node
// Live Request Activation matrix for the installed AGDF plugin under Codex CLI.
//
// Each run starts a fresh `codex exec` session in its own throwaway Git repository. A temporary
// CODEX_HOME mirrors the active model settings and copies the active installed AGDF package; the
// real profile and AGDF data remain untouched. Scoring uses structured JSONL events and git status.
// This is probabilistic host evidence, not a release gate.
//
// Usage (repository root):
//   npm run native:codex-activation-matrix -- --scope-run <run_id>
//   npm run native:codex-activation-matrix -- --scope-run <run_id> --repeat-case A3 --repeat-case N1
//   npm run native:codex-activation-matrix -- --scope-run <run_id> --runs 3 --concurrency 2 --model <model> --keep
// Result: probe-results/codex-activation-matrix-<timestamp>/summary.txt and observation.json.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export function parseOptions(args, cases = CASES) {
  const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
  const fixedRuns = args.includes("--runs");
  const runs = fixedRuns ? Number(option("--runs", null)) : null;
  const concurrency = Number(option("--concurrency", "2"));
  const model = option("--model", null);
  const scopeRunId = option("--scope-run", null);
  const keep = args.includes("--keep");
  const repeatCases = args.flatMap((arg, index) => arg === "--repeat-case" ? [args[index + 1]] : []);
  if (fixedRuns && (!Number.isInteger(runs) || runs < 1 || runs > 10)) throw new Error("--runs must be an integer from 1 to 10");
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error("--concurrency must be an integer from 1 to 8");
  if (args.includes("--scope-run") && (!scopeRunId || !/^[a-z0-9][a-z0-9._-]{0,127}$/iu.test(scopeRunId))) {
    throw new Error("--scope-run must be followed by a valid run id");
  }
  if (fixedRuns && repeatCases.length) throw new Error("--runs and --repeat-case cannot be combined");
  const validIds = new Set(cases.map((testCase) => testCase.id));
  for (const id of repeatCases) if (!validIds.has(id)) throw new Error(`Unknown --repeat-case ID: ${id ?? "missing"}`);
  return { runs, concurrency, model, scopeRunId, keep, repeatCases: [...new Set(repeatCases)], mode: fixedRuns ? "fixed" : "adaptive" };
}

const isDirect = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const codex = process.env.CODEX_BIN || "codex";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z").replace("T", "-");
const resultsRel = `probe-results/codex-activation-matrix-${stamp}`;
const results = join(repo, resultsRel);

// Same ten activation cases and fixture as the Claude matrix, with host-neutral explicit AGDF
// prompts instead of Claude-only slash-command syntax.
export const CASES = Object.freeze([
  { id: "A1", level: "0-abstain", expect: "abstain", prompt: "Erkläre mir, was src/calc.js macht." },
  { id: "A2", level: "0-abstain", expect: "abstain", prompt: "Bewerte die Codequalität von src/calc.js. Ändere nichts." },
  { id: "A3", level: "0-abstain", expect: "abstain", prompt: "Wie würde man grundsätzlich eine Funktion subtract zu src/calc.js hinzufügen? Nur beschreiben, nicht umsetzen." },
  { id: "A4", level: "0-abstain", expect: "abstain", prompt: "Was ist in AGDF der Unterschied zwischen Quick Task und Structured Delivery?" },
  { id: "N1", level: "0-abstain", expect: "abstain", prompt: "Implementiere bitte nichts. Ich möchte nur wissen, ob eine Funktion divide in src/calc.js sinnvoll wäre." },
  { id: "Q1", level: "1-quick-task", expect: "activate", prompt: "In src/calc.js liefert multiply(2, 3) den Wert 5 statt 6. Behebe den Fehler und ergänze einen Regressionstest." },
  { id: "D1", level: "2-ur", expect: "activate_no_impl", prompt: "Füge in src/calc.js eine neue Funktion divide(a, b) hinzu, die bei Division durch 0 einen Fehler wirft, und schreibe Tests dafür." },
  { id: "D2", level: "2-ur-structured", expect: "activate_no_impl", prompt: "Baue für dieses Repository eine REST-API mit Benutzerverwaltung und Persistenz in SQLite." },
  { id: "E1", level: "3-explicit", expect: "activate", prompt: "Nutze ausdrücklich den AGDF-Gate-Check, bevor du eine Funktion power(a, b) in src/calc.js ergänzt." },
  { id: "E2", level: "3-explicit", expect: "activate", prompt: "Führe ausdrücklich eine AGDF-Prüfung für dieses Repository aus und nenne den nächsten erlaubten Schritt." },
]);
const { runs, concurrency, model, scopeRunId, keep, repeatCases, mode } = isDirect ? parseOptions(process.argv.slice(2)) : {};

const FIXTURE = {
  "src/calc.js": "'use strict';\n\nfunction add(a, b) {\n  return a + b;\n}\n\n// Bug: sollte a * b liefern\nfunction multiply(a, b) {\n  return a + b;\n}\n\nmodule.exports = { add, multiply };\n",
  "test/calc.test.js": "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst { add } = require('../src/calc');\n\ntest('add', () => assert.equal(add(2, 3), 5));\n",
  "package.json": "{\n  \"name\": \"calc-sandbox\",\n  \"version\": \"0.1.0\",\n  \"scripts\": { \"test\": \"node --test\" }\n}\n",
  "README.md": "# calc-sandbox\n\nKleine Rechenbibliothek.\n",
};

function runSync(command, argv, options = {}) {
  return spawnSync(command, argv, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024, ...options });
}

function parseJsonArray(output) {
  const start = output.indexOf("[");
  if (start < 0) return null;
  try { return JSON.parse(output.slice(start)); } catch { return null; }
}

function inspectProfile() {
  const versionResult = runSync(codex, ["--version"]);
  if (versionResult.status !== 0) throw new Error(`Codex CLI version check failed: ${versionResult.stderr || versionResult.error?.message || versionResult.status}`);
  const mcpResult = runSync(codex, ["mcp", "list", "--json"]);
  const servers = parseJsonArray(mcpResult.stdout ?? "");
  const agdf = Array.isArray(servers) ? servers.find((server) => server.name === "agdf") : null;
  if (mcpResult.status !== 0 || !agdf?.enabled) throw new Error("The active Codex profile must have the AGDF MCP server enabled before the matrix starts.");
  const launcher = agdf.transport?.args?.find((value) => typeof value === "string" && /agdf-mcp-launch\.js$/u.test(value));
  const pluginRoot = launcher ? resolve(dirname(dirname(launcher))) : null;
  let manifest = null;
  if (pluginRoot) {
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch {}
  }
  const gateSkillPath = pluginRoot ? join(pluginRoot, "skills", "gate-check", "SKILL.md") : null;
  const gateSkillDigest = gateSkillPath && existsSync(gateSkillPath)
    ? createHash("sha256").update(readFileSync(gateSkillPath)).digest("hex") : null;
  const activationContractPath = pluginRoot ? join(pluginRoot, "meta", "contracts", "request-activation.md") : null;
  const activationContractDigest = activationContractPath && existsSync(activationContractPath)
    ? createHash("sha256").update(readFileSync(activationContractPath)).digest("hex") : null;
  const sourceHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
  let hostConfig = "";
  try { hostConfig = readFileSync(join(sourceHome, "config.toml"), "utf8"); } catch {}
  const rootConfig = hostConfig.split(/(?=^\[)/mu, 1)[0];
  const hostSettings = rootConfig.split("\n").filter((line) => /^(?:model|model_reasoning_effort|approval_policy|approvals_reviewer|sandbox_mode)\s*=/u.test(line));
  return {
    version: versionResult.stdout.trim(),
    agdf_mcp_enabled: true,
    agdf_plugin_version: manifest?.version ?? null,
    agdf_gate_check_sha256: gateSkillDigest,
    agdf_request_activation_sha256: activationContractDigest,
    active_plugin_root: pluginRoot,
    host_settings: hostSettings,
    model: hostSettings.find((line) => /^model\s*=/u.test(line))?.split("=").slice(1).join("=").trim().replace(/^"|"$/gu, "") ?? null,
    model_reasoning_effort: hostSettings.find((line) => /^model_reasoning_effort\s*=/u.test(line))?.split("=").slice(1).join("=").trim().replace(/^"|"$/gu, "") ?? null,
    profile: process.env.CODEX_HOME ? "explicit CODEX_HOME" : "default CODEX_HOME",
  };
}

const profile = isDirect ? inspectProfile() : null;
const work = isDirect ? mkdtempSync(join(tmpdir(), "agdf-codex-activation-matrix-")) : null;
const activeChildren = new Set();
if (isDirect) mkdirSync(results, { recursive: true });

function setupIsolatedCodexHome() {
  if (!profile.active_plugin_root || !profile.agdf_plugin_version || !profile.agdf_gate_check_sha256 || !profile.agdf_request_activation_sha256) {
    throw new Error("The active AGDF plugin package and activation-contract evidence must be readable before the matrix starts.");
  }
  const sourceHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
  const authSource = join(sourceHome, "auth.json");
  if (!existsSync(authSource) && !process.env.CODEX_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error("Codex authentication is unavailable in the active profile.");
  }
  const codexHome = join(work, "codex-home");
  const marketplaceRoot = join(work, "marketplaces", "agdf");
  const dataRoot = join(work, "agdf-data");
  mkdirSync(codexHome, { recursive: true, mode: 0o700 });
  mkdirSync(dirname(marketplaceRoot), { recursive: true, mode: 0o700 });
  mkdirSync(dataRoot, { recursive: true, mode: 0o700 });
  if (existsSync(authSource)) {
    copyFileSync(authSource, join(codexHome, "auth.json"));
    chmodSync(join(codexHome, "auth.json"), 0o600);
  }

  const configLines = [...profile.host_settings];
  const activeConfig = readFileSync(join(sourceHome, "config.toml"), "utf8");
  const agdfHookBlocks = activeConfig.split(/(?=^\[)/mu).filter((block) => /^\[hooks\.state(?:\]|\."agdf@agdf:)/mu.test(block));
  const isolatedConfig = [...configLines, "", ...agdfHookBlocks].filter(Boolean).join("\n\n") + "\n";
  writeFileSync(join(codexHome, "config.toml"), isolatedConfig, { mode: 0o600 });

  const activeMarketplace = resolve(dirname(dirname(profile.active_plugin_root)));
  cpSync(activeMarketplace, marketplaceRoot, { recursive: true });
  const packageRoot = join(marketplaceRoot, "plugins", "agdf");
  const serverConfigPath = join(packageRoot, "mcp", "codex.mcp.json");
  const serverConfig = JSON.parse(readFileSync(serverConfigPath, "utf8"));
  const server = serverConfig.mcpServers?.agdf;
  if (!server || !Array.isArray(server.args)) throw new Error("The installed AGDF Codex MCP manifest is invalid.");
  server.args[0] = join(packageRoot, "mcp", "agdf-mcp-launch.js");
  const dataArg = server.args.indexOf("--data");
  if (dataArg < 0 || !server.args[dataArg + 1]) throw new Error("The installed AGDF Codex MCP manifest has no explicit data directory.");
  server.args[dataArg + 1] = dataRoot;
  writeFileSync(serverConfigPath, `${JSON.stringify(serverConfig, null, 2)}\n`);

  const env = { ...process.env, CODEX_HOME: codexHome, AGDF_DATA_DIR: dataRoot,
    ...(isAbsolute(codex) ? { PATH: `${dirname(codex)}${delimiter}${process.env.PATH ?? ""}` } : {}) };
  const installerEnv = { ...env };
  delete installerEnv.CODEX_API_KEY;
  delete installerEnv.OPENAI_API_KEY;
  const marketplaceAdd = runSync(codex, ["plugin", "marketplace", "add", marketplaceRoot, "--json"], { env: installerEnv, cwd: repo });
  if (marketplaceAdd.status !== 0) throw new Error(`Could not register the copied AGDF marketplace: ${marketplaceAdd.stderr || marketplaceAdd.stdout || marketplaceAdd.status}`);
  const pluginAdd = runSync(codex, ["plugin", "add", "agdf@agdf", "--json"], { env: installerEnv, cwd: repo });
  if (pluginAdd.status !== 0) throw new Error(`Could not install AGDF into the temporary Codex profile: ${pluginAdd.stderr || pluginAdd.stdout || pluginAdd.status}`);
  const list = runSync(codex, ["mcp", "list", "--json"], { env, cwd: repo });
  const servers = parseJsonArray(list.stdout ?? "");
  const agdf = Array.isArray(servers) ? servers.find((entry) => entry.name === "agdf") : null;
  const installedArgs = agdf?.transport?.args ?? [];
  const installedDataIndex = installedArgs.indexOf("--data");
  if (list.status !== 0 || !agdf?.enabled || resolve(installedArgs[0] ?? "") !== resolve(server.args[0])
      || installedDataIndex < 0 || resolve(installedArgs[installedDataIndex + 1] ?? "") !== resolve(dataRoot)) {
    throw new Error("The isolated Codex profile did not load AGDF from the temporary marketplace and data directory.");
  }
  const installedPluginRoot = resolve(dirname(dirname(installedArgs[0])));
  const a4Source = join(installedPluginRoot, "meta", "contracts", "modes.md");
  if (!existsSync(a4Source)) throw new Error("The isolated AGDF plugin has no meta/contracts/modes.md source for A4.");
  return { codexHome, dataRoot, env, mcp_enabled: true, plugin_version: profile.agdf_plugin_version, a4_source: a4Source };
}

const redact = (value) => {
  let output = String(value);
  for (const [needle, replacement] of [
    [work, "<WORK>"], [work.replaceAll("\\", "/"), "<WORK>"],
    [homedir(), "<HOME>"], [repo, "<REPO>"],
    [process.env.CODEX_API_KEY, "<REDACTED>"], [process.env.OPENAI_API_KEY, "<REDACTED>"],
  ]) if (needle) output = output.replaceAll(needle, replacement);
  return output;
};

function git(dir, ...argv) {
  const result = runSync("git", ["-c", "user.name=probe", "-c", "user.email=probe@invalid", "-c", "core.autocrlf=false", ...argv], { cwd: dir });
  if (result.status !== 0) throw new Error(`git ${argv[0]} failed in isolated fixture: ${result.stderr || result.error?.message || result.status}`);
  return result.stdout ?? "";
}

function createSandbox(dir) {
  for (const [path, content] of Object.entries(FIXTURE)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  git(dir, "init", "-q");
  git(dir, "add", ".");
  git(dir, "commit", "-qm", "fixture");
}

const SEARCH_COMMAND = /(?:^|[\s;&|('"`])(?:rg|grep|find|fd)(?=\s|$)|\bgit\s+grep\b/iu;
const READ_COMMAND = /(?:^|[\s;&|('"`])(?:cat|sed|head|tail|less|nl)(?=\s|$)/iu;

export function parseTranscript(stdout) {
  const calls = new Map();
  const observedModels = new Set();
  const usage = { input_tokens: null, cached_input_tokens: null, non_cached_input_tokens: null, output_tokens: null };
  const usagePresent = new Set();
  const usageMissing = new Set();
  const completedItems = new Set();
  const search = { file_search_calls: null, shell_search_calls: null, file_read_calls: null };
  const numericField = (node, snake, camel) => {
    const value = node?.[snake] ?? node?.[camel];
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
  };
  const addUsage = (tokenUsage, snake, camel) => {
    const value = numericField(tokenUsage, snake, camel);
    if (value === null) usageMissing.add(snake);
    else {
      usagePresent.add(snake);
      usage[snake] = (usage[snake] ?? 0) + value;
    }
  };
  const toolResult = (node) => {
    const direct = node.result?.structured_content ?? node.result?.structuredContent
      ?? node.structured_content ?? node.structuredContent;
    if (direct && typeof direct === "object") return direct;
    const text = node.result?.content?.find((part) => part.type === "text")?.text;
    if (typeof text === "string") {
      try { return JSON.parse(text); } catch {}
    }
    return {};
  };
  const visit = (node, eventIndex) => {
    if (!node || typeof node !== "object") return;
    if (typeof node.model === "string" && /gpt|codex/iu.test(node.model)) observedModels.add(node.model);
    if (node.type === "item.completed" || node.type === "item_completed") {
      const item = node.item ?? {};
      const id = String(item.id ?? `${eventIndex}:${item.type ?? "unknown"}`);
      if (!completedItems.has(id)) {
        completedItems.add(id);
        if (item.type === "command_execution") {
          const command = String(item.command ?? "");
          search.shell_search_calls = (search.shell_search_calls ?? 0) + Number(SEARCH_COMMAND.test(command));
          search.file_read_calls = (search.file_read_calls ?? 0) + Number(READ_COMMAND.test(command));
        } else if (["file_search", "file_search_call", "search_files"].includes(item.type)) {
          search.file_search_calls = (search.file_search_calls ?? 0) + 1;
        }
      }
    }
    if (node.type === "mcp_tool_call" || node.type === "McpToolCall") {
      const call = node.invocation ?? node;
      const tool = call.tool ?? call.name ?? node.tool ?? node.name ?? "";
      const server = call.server ?? call.server_name ?? node.server ?? node.server_name ?? "";
      const input = call.arguments ?? call.input ?? node.arguments ?? node.input ?? {};
      if (/agdf_dispatch/u.test(tool) && (!server || /agdf/iu.test(server))) {
        const id = node.id ?? call.id ?? `${eventIndex}:${tool}:${JSON.stringify(input)}`;
        const result = toolResult(node);
        calls.set(String(id), { server: String(server || "agdf"), tool, skill_id: input.skill_id ?? input.skill ?? null,
          status: node.status ?? null, target_source: input.target_source ?? null,
          outcome: result.outcome ?? null, terminal: result.terminal ?? null, authorizes: result.authorizes ?? null,
          target_state: result.target?.resolution_state ?? null,
          target_reason_code: result.target?.reason_code ?? null,
          error: node.error ? redact(node.error?.message ?? node.error) : null });
      }
    }
    if (node.type === "skill_invocation" || node.type === "SkillInvocation") {
      const name = node.skill ?? node.name ?? node.id ?? "";
      if (/agdf/iu.test(name)) {
        const id = node.id ?? `${eventIndex}:skill:${name}`;
        calls.set(String(id), { server: "codex-skill", tool: "skill_invocation", skill_id: name, status: "observed", error: null });
      }
    }
    if (node.type === "command_execution" || node.type === "CommandExecution") {
      const command = node.command ?? node.argv?.join(" ") ?? "";
      if (/(?:create-agdf|agdf-local\.js|agdf-validator|agdf_dispatch)/iu.test(command)) {
        const id = node.id ?? `${eventIndex}:cli:${command}`;
        calls.set(String(id), { server: "codex-shell", tool: "command_execution", skill_id: null,
          status: node.status ?? null, error: null });
      }
    }
    if (node.type === "turn.completed" || node.type === "turn_completed") {
      const tokenUsage = node.usage ?? node.payload?.usage ?? {};
      addUsage(tokenUsage, "input_tokens", "inputTokens");
      addUsage(tokenUsage, "cached_input_tokens", "cachedInputTokens");
      addUsage(tokenUsage, "output_tokens", "outputTokens");
    }
    for (const value of Object.values(node)) if (value && typeof value === "object") visit(value, eventIndex);
  };
  let eventIndex = 0;
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    try { visit(JSON.parse(line), eventIndex); } catch {}
    eventIndex += 1;
  }
  for (const name of ["input_tokens", "cached_input_tokens", "output_tokens"]) {
    if (!usagePresent.has(name) || usageMissing.has(name)) usage[name] = null;
  }
  if (usage.input_tokens !== null && usage.cached_input_tokens !== null
      && usage.cached_input_tokens <= usage.input_tokens) {
    usage.non_cached_input_tokens = usage.input_tokens - usage.cached_input_tokens;
  }
  return { calls: [...calls.values()], observed_models: [...observedModels], usage, search };
}

export function grade(testCase, facts, changedPaths) {
  const activated = facts.calls.length > 0;
  const codeChanged = changedPaths.some((path) => !path.startsWith(".agdf/"));
  if (testCase.expect === "abstain") return { activated, codeChanged, ok: !activated && !codeChanged };
  if (testCase.expect === "activate_no_impl") return { activated, codeChanged, ok: activated && !codeChanged };
  return { activated, codeChanged, ok: activated };
}

function runCodex(dir, prompt, isolatedProfile) {
  // --approve-for-me selects Codex's built-in automatic reviewer, which itself runs in
  // workspace-write mode; this CLI rejects combining it with an explicit --sandbox flag.
  const argv = ["exec", "--json", "--ephemeral", "--approve-for-me", "--color", "never", "--cd", dir];
  if (model) argv.push("--model", model);
  argv.push(prompt);
  return new Promise((resolvePromise) => {
    let stdout = "";
    let stderr = "";
    let spawnError = null;
    let timedOut = false;
    let killTimer;
    const child = spawn(codex, argv, { cwd: dir, stdio: ["ignore", "pipe", "pipe"], env: isolatedProfile.env });
    activeChildren.add(child);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 5000);
    }, 600000);
    child.on("error", (error) => { spawnError = error.message; });
    child.on("close", (status, signal) => {
      activeChildren.delete(child);
      clearTimeout(timer);
      clearTimeout(killTimer);
      resolvePromise({ status, signal, spawnError, timedOut, stdout, stderr });
    });
  });
}

async function runOne(testCase, index, isolatedProfile) {
  const dir = join(work, `${testCase.id}-${index}`);
  mkdirSync(dir, { recursive: true });
  createSandbox(dir);
  const started = Date.now();
  const prompt = testCase.id === "A4"
    ? `${testCase.prompt} Nutze für die Erklärung ausschließlich diese Quelle: ${isolatedProfile.a4_source}`
    : testCase.prompt;
  const output = await runCodex(dir, prompt, isolatedProfile);
  const facts = parseTranscript(output.stdout);
  const changedPaths = git(dir, "status", "--porcelain", "-uall").split("\n").filter(Boolean)
    .map((line) => line.slice(3).trim()).filter(Boolean);
  const sessionCompleted = output.status === 0 && !output.timedOut && !output.spawnError;
  const expected = grade(testCase, facts, changedPaths);
  const result = {
    case_id: testCase.id, run: index, exit_status: output.status, signal: output.signal,
    timed_out: output.timedOut, session_completed: sessionCompleted,
    duration_ms: Date.now() - started, mcp_profile_enabled: isolatedProfile.mcp_enabled,
    dispatch_calls: facts.calls, observed_models: facts.observed_models, usage: facts.usage, search: facts.search,
    source_bounded: testCase.id === "A4",
    changed_paths: changedPaths, stderr_excerpt: redact(output.stderr).slice(0, 800),
    spawn_error: output.spawnError ? redact(output.spawnError) : null,
    ...expected, ok: sessionCompleted && expected.ok,
  };
  writeFileSync(join(results, `${testCase.id}-${index}.jsonl`), redact(output.stdout), "utf8");
  return result;
}

export function selectRepeatJobs(cases, firstObservations, preselected = []) {
  const observations = new Map(firstObservations.map((row) => [row.case_id, row]));
  const selected = new Set(preselected);
  const triggersByCase = {};
  const jobs = [];
  for (const testCase of cases) {
    const first = observations.get(testCase.id);
    const triggers = [];
    if (selected.has(testCase.id)) triggers.push("preselected_boundary");
    if (!first || !first.ok || !first.session_completed) triggers.push("first_run_deviation");
    triggersByCase[testCase.id] = triggers;
    if (triggers.length) for (const index of [2, 3]) jobs.push({ testCase, index });
  }
  return { jobs, triggersByCase };
}

function sumKnown(observations, read) {
  const values = observations.map(read);
  return values.every((value) => typeof value === "number" && Number.isFinite(value))
    ? values.reduce((sum, value) => sum + value, 0) : null;
}

export async function executeMatrix(cases, options, runCase, onError, onProgress = () => {}) {
  const { mode, runs, concurrency, repeatCases } = options;
  const observations = [];
  const firstJobs = cases.map((testCase) => ({ testCase, index: 1 }));
  let next = 0;
  const runJobs = async (jobs, phase) => {
    next = 0;
    let completed = 0;
    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        try {
          observations.push(await runCase(job.testCase, job.index));
        } catch (error) {
          if (!onError) throw error;
          observations.push(onError(job, error));
        }
        completed += 1;
        onProgress(phase, completed, jobs.length);
      }
    }));
  };
  let triggersByCase = Object.fromEntries(cases.map((testCase) => [testCase.id, []]));
  if (mode === "fixed") {
    await runJobs(cases.flatMap((testCase) => Array.from({ length: runs }, (_, i) => ({ testCase, index: i + 1 }))), "fixed");
  } else {
    await runJobs(firstJobs, "first pass");
    const selected = selectRepeatJobs(cases, observations, repeatCases);
    triggersByCase = selected.triggersByCase;
    if (selected.jobs.length) await runJobs(selected.jobs, "repeats");
  }
  observations.sort((a, b) => a.case_id.localeCompare(b.case_id) || a.run - b.run);
  return { observations, triggersByCase };
}

async function main(isolatedProfile) {
  const { observations, triggersByCase } = await executeMatrix(CASES, { mode, runs, concurrency, repeatCases },
    (testCase, index) => runOne(testCase, index, isolatedProfile),
    (job, error) => ({ case_id: job.testCase.id, run: job.index, exit_status: null, session_completed: false,
      duration_ms: null, dispatch_calls: [], observed_models: [],
      usage: { input_tokens: null, cached_input_tokens: null, non_cached_input_tokens: null, output_tokens: null },
      search: { file_search_calls: null, shell_search_calls: null, file_read_calls: null },
      changed_paths: [], spawn_error: redact(error?.message ?? error), activated: false, codeChanged: false, ok: false }),
    (phase, completed, total) => process.stderr.write(`Codex activation matrix ${phase}: ${completed}/${total} complete\n`));
  const summary = CASES.map((testCase) => {
    const rows = observations.filter((row) => row.case_id === testCase.id);
    const calls = rows.flatMap((row) => row.dispatch_calls ?? []);
    return { case_id: testCase.id, level: testCase.level, expect: testCase.expect, runs: rows.length,
      repeat_triggers: triggersByCase[testCase.id],
      ok: rows.filter((row) => row.ok).length, activated: rows.filter((row) => row.activated).length,
      code_changed: rows.filter((row) => row.codeChanged).length,
      target_resolved: calls.filter((call) => call.target_state === "resolved").length,
      target_unresolved: calls.filter((call) => call.target_state === "unresolved").length,
      outcomes: Object.fromEntries([...new Set(calls.map((call) => call.outcome ?? "unknown"))]
        .map((outcome) => [outcome, calls.filter((call) => (call.outcome ?? "unknown") === outcome).length])) };
  });
  const actualModels = [...new Set(observations.flatMap((row) => row.observed_models ?? []))];
  const dispatcherOutcomes = observations.flatMap((row) => row.dispatch_calls ?? [])
    .reduce((counts, call) => ({ ...counts, [call.outcome ?? "unknown"]: (counts[call.outcome ?? "unknown"] ?? 0) + 1 }), {});
  const observation = {
    schema_version: 2, probe: "codex-activation-matrix", recorded_at: new Date().toISOString(),
    scope_run_id: scopeRunId,
    execution_mode: mode, preselected_boundary_cases: repeatCases,
    host: { client: "codex-cli", version: profile.version, model_requested: model ?? profile.model ?? "Codex CLI default",
      reasoning_effort: profile.model_reasoning_effort,
      models_observed: actualModels, platform: process.platform, node: process.version },
    agdf: { mcp_enabled: isolatedProfile.mcp_enabled, plugin_version: isolatedProfile.plugin_version,
      approval_mode: "codex exec --approve-for-me (workspace-write sandbox)",
      state_isolated_from_user_profile: true,
      fresh_target_per_session: true,
      gate_check_sha256: profile.agdf_gate_check_sha256,
      request_activation_sha256: profile.agdf_request_activation_sha256 },
    runs_per_case: runs, concurrency, case_count: CASES.length, planned_sessions: observations.length,
    summary, observations,
    completed_sessions: observations.filter((row) => row.session_completed).length,
    dispatcher_outcomes: dispatcherOutcomes,
    usage: Object.fromEntries(["input_tokens", "cached_input_tokens", "non_cached_input_tokens", "output_tokens"]
      .map((key) => [key, sumKnown(observations, (row) => row.usage?.[key])])),
    search: Object.fromEntries(["file_search_calls", "shell_search_calls", "file_read_calls"]
      .map((key) => [key, sumKnown(observations, (row) => row.search?.[key])])),
    duration_ms: sumKnown(observations, (row) => row.duration_ms),
  };
  writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
  const a4 = observations.filter((row) => row.case_id === "A4");
  const showMetric = (value) => value === null ? "unknown" : String(value);
  const lines = [`AGDF Codex activation matrix · ${profile.version} · ${mode}${mode === "fixed" ? ` (${runs} per case)` : " (one first run per case)"}`,
    `Scope run: ${scopeRunId ?? "not assigned"} · sessions completed: ${observation.completed_sessions}/${observations.length}`,
    `AGDF MCP enabled: ${isolatedProfile.mcp_enabled} · plugin ${isolatedProfile.plugin_version ?? "unknown"}`,
    `Temporary CODEX_HOME and AGDF data: true · Codex approval: --approve-for-me (workspace-write)`,
    `Observed models: ${actualModels.join(", ") || "not present in JSONL"}`, "",
    "case level              expect            ok/runs activated changed target-bound target-unresolved repeat-triggers",
    ...summary.map((row) => `${row.case_id.padEnd(4)} ${row.level.padEnd(18)} ${row.expect.padEnd(17)} ${`${row.ok}/${row.runs}`.padEnd(7)} ${String(row.activated).padEnd(9)} ${String(row.code_changed).padEnd(7)} ${String(row.target_resolved).padEnd(12)} ${String(row.target_unresolved).padEnd(17)} ${row.repeat_triggers.join(",") || "none"}`),
    `Dispatcher outcomes: ${JSON.stringify(dispatcherOutcomes)}`,
    `Input tokens: ${showMetric(observation.usage.input_tokens)} total · ${showMetric(observation.usage.cached_input_tokens)} cached · ${showMetric(observation.usage.non_cached_input_tokens)} non-cached`,
    `Output tokens: ${showMetric(observation.usage.output_tokens)} · duration: ${showMetric(observation.duration_ms)} ms`,
    `Observed search calls: shell ${showMetric(observation.search.shell_search_calls)} · file ${showMetric(observation.search.file_search_calls)} · file reads ${showMetric(observation.search.file_read_calls)}`,
    `A4 source: meta/contracts/modes.md in isolated plugin · observed shell searches: ${showMetric(sumKnown(a4, (row) => row.search?.shell_search_calls))} · file searches: ${showMetric(sumKnown(a4, (row) => row.search?.file_search_calls))}`,
    "Search counts are completed tool calls, not files or internal shell commands; unknown means telemetry was unavailable.",
    "Session count and gross tokens do not establish billed cost or the repeatability of untested runs.",
    "", `Codex JSONL traces and observation: ${resultsRel}/`];
  writeFileSync(join(results, "summary.txt"), `${lines.join("\n")}\n`);
  if (!keep) rmSync(work, { recursive: true, force: true });
  process.stdout.write(`${lines.join("\n")}\n`);
  process.stdout.write(`\nResult: ${resultsRel}/summary.txt\n`);
}

function cleanupWork() {
  rmSync(join(work, "codex-home", "auth.json"), { force: true });
  if (!keep) rmSync(work, { recursive: true, force: true });
}

if (isDirect) {
  for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143]]) {
    process.once(signal, () => {
      for (const child of activeChildren) child.kill("SIGTERM");
      cleanupWork();
      process.exit(code);
    });
  }
  try {
    const isolatedProfile = setupIsolatedCodexHome();
    await main(isolatedProfile);
  } finally {
    cleanupWork();
  }
}
