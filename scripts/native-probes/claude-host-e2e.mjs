#!/usr/bin/env node
// Host end-to-end check for AGDF under Claude Code with exactly one recorded tuple:
// host version, model, discovery, one agdf_dispatch call, one defined failure case and removal.
//
// Everything runs in an isolated CLAUDE_CONFIG_DIR and AGDF_DATA_DIR inside probe-results/; the real
// ~/.claude is only read to copy .credentials.json for the two short sessions, and the copy is
// deleted afterwards. Evidence is structured (stream-json events, CLI output), never model prose.
// Isolation, install, credentials, stream parsing and redaction live in lib/claude-session.mjs.
//
// Usage (repository root, from a terminal outside a packaged Claude Desktop app):
//   npm run native:claude-e2e
//   npm run native:claude-e2e -- --model claude-sonnet-5 --keep
// Result: probe-results/claude-host-e2e-<timestamp>/summary.txt and observation.json.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { createIsolatedClaudeHome, createRedactor, installAgdfForClaude, parseClaudeStream, repoRoot as repo,
  runClaudeSession, runCommand, summarizeToolSession, withCopiedCredentials } from "./lib/claude-session.mjs";

const TOOL = "mcp__plugin_agdf_agdf__agdf_dispatch";
const SERVER = "plugin:agdf:agdf";
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const model = option("--model", process.env.AGDF_E2E_MODEL || "claude-sonnet-5");
const keep = args.includes("--keep");

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const resultsRel = `probe-results/claude-host-e2e-${stamp}`;
const results = join(repo, resultsRel);
const work = join(results, "work-tmp");
const target = join(work, "target-repo");
const { claudeHome, env } = createIsolatedClaudeHome(work);
mkdirSync(target, { recursive: true });
runCommand("git", ["init", "-q"], { cwd: target });

const run = (command, argv, options = {}) => runCommand(command, argv, { env, ...options });
// Paths appear raw, with forward slashes and JSON-escaped (doubled backslashes) in tool results.
const redact = createRedactor([{ path: work, token: "<WORK>" }]);
const steps = [];
const step = (name, pass, evidence) => { steps.push({ name, status: pass ? "pass" : "fail", evidence }); return pass; };
const parseSession = stdout => summarizeToolSession(parseClaudeStream(stdout), { tool: TOOL, server: SERVER, redact });

const prompt = (input) => `Call the MCP tool ${TOOL} exactly once with exactly these arguments and nothing else: ${JSON.stringify(input)}. `
  + "Do not call any other tool. After the call, reply with the single word DONE.";

const observation = { schema_version: 1, kind: "agdf_claude_host_e2e", recorded_at: new Date().toISOString(), requested_model: model };
// 1. Host tuple
const version = run("claude", ["--version"]);
observation.host = { client: "claude-code-cli", version: version.stdout.trim().split(/\s+/)[0] || null, os: process.platform, arch: process.arch, node: process.version };
step("host", version.status === 0, { version: observation.host.version });

// 2. Install the current checkout through the AGDF CLI into the isolated host
const install = installAgdfForClaude(env);
const installReport = install.report;
observation.agdf = { version: installReport?.plugin?.version?.installed ?? null };
step("install", install.status === 0 && installReport?.result === "success",
  { result: installReport?.result ?? null, effective_state: installReport?.effective_state ?? null, stderr: redact(install.stderr).slice(0, 300) });

// 3. Discovery through the host's own MCP health check
const list = run("claude", ["mcp", "list"], { cwd: target });
const line = list.stdout.split("\n").find((entry) => entry.startsWith(`${SERVER}:`)) ?? "";
step("discovery", /Connected/.test(line), { mcp_list: redact(line).trim() });

withCopiedCredentials(claudeHome, ({ available: hasCredentials }) => {
  const session = (input) => runClaudeSession({ prompt: prompt(input), model, allowedTools: [TOOL] }, { env, cwd: target, timeout: 300000 });

  // 4. One real agdf_dispatch call on an explicit target: a non-authorizing terminal control result
  const good = hasCredentials ? parseSession(session({ skill_id: "gate-check", presentation_language: "de", working_directory: target,
    target_source: "explicit_target", primary_target: target }).stdout) : null;
  observation.model = good?.model ?? null;
  const call = good?.dispatches?.[0];
  step("dispatch", Boolean(good?.toolOffered && good.dispatches.length === 1 && call.outcome === "control_result"
    && call.terminal === true && call.authorizes === false),
  hasCredentials ? { model: good.model, server_status: good.server?.status ?? null, tool_offered: good.toolOffered, calls: good.dispatches.length,
    outcome: call?.outcome ?? null, terminal: call?.terminal ?? null, authorizes: call?.authorizes ?? null, host_action: call?.host_action ?? null }
    : { skipped: "no transferable ~/.claude/.credentials.json" });

  // 5. Defined failure: a relative working directory yields invalid_input, not a crash
  const bad = hasCredentials ? parseSession(session({ skill_id: "gate-check", presentation_language: "de", working_directory: "relative/dir" }).stdout) : null;
  const failure = bad?.dispatches?.[0];
  step("failure_case", Boolean(failure && failure.outcome === "invalid_input" && failure.terminal === true && failure.authorizes === false),
    hasCredentials ? { calls: bad.dispatches.length, outcome: failure?.outcome ?? null, host_action: failure?.host_action ?? null }
      : { skipped: "no transferable ~/.claude/.credentials.json" });
});

// 6. Removal through the host alone must leave no AGDF MCP, data, permission or registration traces
const uninstall = run("claude", ["plugin", "uninstall", "agdf@agdf"]);
const after = run("claude", ["mcp", "list"], { cwd: target });
const readJson = (path) => { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return {}; } };
const settings = readJson(join(claudeHome, "settings.json"));
const state = readJson(join(claudeHome, ".claude.json"));
const installed = readJson(join(claudeHome, "plugins", "installed_plugins.json"));
const leftovers = {
  mcp_listed: after.stdout.includes(SERVER),
  plugin_data: existsSync(join(claudeHome, "plugins", "data", "agdf-agdf")),
  enabled: Boolean(settings.enabledPlugins?.["agdf@agdf"]),
  permission_rules: (settings.permissions?.allow ?? []).filter((rule) => rule.includes("agdf-session-check")).length,
  user_mcp: Boolean(state.mcpServers?.agdf),
  installed_entry: Boolean(installed.plugins?.["agdf@agdf"]),
};
step("removal", uninstall.status === 0 && Object.values(leftovers).every((value) => value === false || value === 0),
  { ...leftovers, kept_by_design: "agdf marketplace registration" });

observation.steps = steps;
observation.result = steps.every((entry) => entry.status === "pass") ? "pass" : "fail";
writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
const summary = [
  `AGDF Claude-Host-E2E (${observation.recorded_at})`,
  `Tupel: Claude Code ${observation.host?.version ?? "?"}, Modell ${observation.model ?? observation.requested_model}, ${observation.host?.os}/${observation.host?.arch}, Node ${observation.host?.node}, AGDF ${observation.agdf?.version ?? "?"}`,
  `ERGEBNIS: ${observation.result.toUpperCase()}`,
  ...steps.map((entry) => `  ${entry.status === "pass" ? "ok  " : "FAIL"} ${entry.name}: ${JSON.stringify(entry.evidence)}`),
].join("\n");
writeFileSync(join(results, "summary.txt"), `${summary}\n`);
if (!keep && work.includes(`${join("probe-results", "claude-host-e2e-")}`)) rmSync(work, { recursive: true, force: true });
console.log(summary);
console.log(`\nErgebnisse: ${resultsRel}/ (summary.txt, observation.json)`);
process.exitCode = observation.result === "pass" ? 0 : 1;
