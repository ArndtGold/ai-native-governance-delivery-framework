// Shared Claude Code session mechanics for native probes and the MCP ergonomics evaluation.
// Everything runs in an isolated CLAUDE_CONFIG_DIR and AGDF_DATA_DIR; the real ~/.claude is only
// read to copy .credentials.json for a session, and the copy is always removed afterwards.
// Evidence is structured (stream-json events, CLI output), never model prose.
import { spawnHostSync } from '../../../packages/cli/lib/host-command.js';
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
export const CREATE_AGDF_BIN = join(repoRoot, "packages", "cli", "bin", "create-agdf.js");
export const AGDF_MCP_TOOL_PREFIX = "mcp__plugin_agdf_agdf__";

// Short names keep Windows paths under MAX_PATH: the plugin MCP runtime adds up to ~180 characters
// below <CLAUDE_CONFIG_DIR>/plugins/data/agdf-agdf.
export function createIsolatedClaudeHome(work, { homeName = "claude-home", dataName = "agdf-data" } = {}) {
  const claudeHome = join(work, homeName);
  const dataRoot = join(work, dataName);
  for (const dir of [claudeHome, dataRoot]) mkdirSync(dir, { recursive: true });
  return { claudeHome, dataRoot, env: { ...process.env, CLAUDE_CONFIG_DIR: claudeHome, AGDF_DATA_DIR: dataRoot } };
}

export function runCommand(command, argv, { env = process.env, cwd, timeout = 300000, input } = {}) {
  const result = spawnHostSync(command, argv, { encoding: "utf8", env, cwd, timeout, input, maxBuffer: 64 * 1024 * 1024, shell: false });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error?.message ?? null };
}

// Installs the current checkout's Claude plugin into the isolated home through the AGDF CLI.
export function installAgdfForClaude(env) {
  const install = runCommand(process.execPath, [CREATE_AGDF_BIN, "claude", "--json"], { env });
  let report = null;
  try { report = JSON.parse(install.stdout); } catch {}
  return { ...install, report };
}

export function credentialsSource() {
  return join(process.env.CLAUDE_CONFIG_DIR_SOURCE || join(homedir(), ".claude"), ".credentials.json");
}

// Signals that end the process without running finally blocks (SIGBREAK and SIGHUP on Windows: Ctrl+Break, closed console).
export const TERMINATION_SIGNALS = Object.freeze(["SIGINT", "SIGTERM", "SIGHUP", ...(process.platform === "win32" ? ["SIGBREAK"] : [])]);

// Runs fn with a credential copy inside the isolated home; the copy never survives the call,
// including an asynchronous fn, whose returned promise settles before the copy is removed, and a
// terminating signal: the copy is removed first, then the process ends unless the caller handles it.
// With CLAUDE_CODE_OAUTH_TOKEN (from `claude setup-token`) the sessions authenticate through the
// inherited environment and nothing is copied. A copied credential file can be refreshed inside the
// isolated home during a long run; the rotated refresh token then lives only in the removed copy.
export function withCopiedCredentials(claudeHome, fn) {
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) return fn({ available: true, mode: "oauth_token_env" });
  const source = credentialsSource();
  const copy = join(claudeHome, ".credentials.json");
  if (!existsSync(source)) return fn({ available: false });
  const onSignal = signal => {
    rmSync(copy, { force: true });
    if (process.listenerCount(signal) === 1) process.exit(130);
  };
  for (const signal of TERMINATION_SIGNALS) process.prependListener(signal, onSignal);
  const remove = () => {
    for (const signal of TERMINATION_SIGNALS) process.off(signal, onSignal);
    rmSync(copy, { force: true });
  };
  let result;
  try {
    copyFileSync(source, copy);
    result = fn({ available: true, mode: "credentials_copy" });
  } catch (error) {
    remove();
    throw error;
  }
  if (result && typeof result.then === "function") return Promise.resolve(result).finally(remove);
  remove();
  return result;
}

// `tools` limits the available built-in tools (--tools); MCP tools are unaffected. `allowedTools` only
// pre-approves tools and does not restrict them: read-only tools run without approval anyway.
export function claudeSessionArgs({ prompt, model, allowedTools = [], tools, disableSkills = false, disableHooks = false, maxBudgetUsd } = {}) {
  return ["-p", prompt, ...(model ? ["--model", model] : []), "--output-format", "stream-json", "--verbose",
    ...(allowedTools.length ? ["--allowedTools", allowedTools.join(",")] : []),
    ...(Array.isArray(tools) ? ["--tools", tools.join(",")] : []),
    ...(disableSkills ? ["--disable-slash-commands"] : []),
    ...(disableHooks ? ["--settings", JSON.stringify({ disableAllHooks: true })] : []),
    ...(Number.isFinite(maxBudgetUsd) ? ["--max-budget-usd", String(Math.max(0, maxBudgetUsd))] : [])];
}

export function runClaudeSession(options, { env, cwd, timeout = 600000 } = {}) {
  return runCommand("claude", claudeSessionArgs(options), { env, cwd, timeout });
}

// `claude mcp list` health check: one entry per server line ("<name>: <command> - <status>").
export function parseMcpList(stdout) {
  // Server names contain colons (plugin:agdf:agdf); the name ends at the first ": ".
  return String(stdout ?? "").split(/\r?\n/u).map(line => line.trim()).filter(line => /^\S.*?:\s+\S/u.test(line))
    .map(line => {
      const name = line.match(/^(\S.*?):\s+\S/u)[1];
      const connected = /\bConnected\b/u.test(line);
      const failed = /\bFailed\b|failed to connect/iu.test(line);
      return { name, status: connected ? "connected" : failed ? "failed" : "other", line };
    });
}

export function claudeMcpList(env, cwd) {
  const result = runCommand("claude", ["mcp", "list"], { env, cwd, timeout: 180000 });
  return { ...result, servers: parseMcpList(result.stdout) };
}

// Finds the installed plugin directory in <CLAUDE_CONFIG_DIR>/plugins/installed_plugins.json.
export function installedPluginRoot(installed, pluginId = "agdf@agdf") {
  let found = null;
  const visit = value => {
    if (found || !value || typeof value !== "object") return;
    if (typeof value.installPath === "string") { found = value.installPath; return; }
    for (const item of Object.values(value)) visit(item);
  };
  visit(installed?.plugins?.[pluginId]);
  return found;
}

// Starts the plugin MCP launcher once outside Claude Code (stdin closed) and returns its exit and the
// stable AGDF_* diagnostic codes it printed, to explain a failed connection without guessing.
export function probeAgdfMcpLauncher({ env, claudeHome, pluginRoot, timeout = 60000 }) {
  const dataRoot = join(claudeHome, "plugins", "data", "agdf-agdf");
  const started = Date.now();
  const result = runCommand(process.execPath, [join(pluginRoot, "mcp", "agdf-mcp-launch.js")],
    { env: { ...env, CLAUDE_PLUGIN_ROOT: pluginRoot, CLAUDE_PLUGIN_DATA: dataRoot }, timeout, input: "" });
  return { exit: result.status, error: result.error, elapsed_ms: Date.now() - started,
    codes: [...new Set(String(result.stderr).match(/AGDF_[A-Z_]+/gu) ?? [])], stderr: result.stderr };
}

// Replaces raw, forward-slash and JSON-escaped forms of the given paths.
// Every separator matches a forward slash or one or more backslashes (raw and JSON-escaped to any
// nesting depth); a drive prefix also matches its Git Bash form (C: and /c). Matching ignores case like
// Windows paths do. Longer roots go first.
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

export function createRedactor(entries) {
  const patterns = entries.filter(entry => entry.path).map(({ path, token }) => {
    const parts = String(path).split(/[\\/]+/u).map(escapeRegExp);
    const drive = /^([A-Za-z]):$/u.exec(parts[0] ?? "");
    if (drive) parts[0] = `(?:[${drive[1].toUpperCase()}${drive[1].toLowerCase()}]:|/[${drive[1].toUpperCase()}${drive[1].toLowerCase()}])`;
    return { length: String(path).length, token, pattern: new RegExp(parts.join("(?:\\\\+|/)"), "giu") };
  }).sort((left, right) => right.length - left.length);
  return text => patterns.reduce((value, { pattern, token }) => value.replace(pattern, () => token), String(text ?? ""));
}

// Claude delivers an error reply as one string: the machine report, then a human diagnostic.
// Keep only the report, or valid native invalid_input results cannot be decoded.
function machineReport(text) {
  const report = head => { try { const value = JSON.parse(head); return value?.schema_version && value?.outcome ? head : null; } catch { return null; } };
  if (report(text)) return text;
  for (let end = text.indexOf("}\n"); end !== -1; end = text.indexOf("}\n", end + 1)) {
    const head = report(text.slice(0, end + 1));
    if (head) return head;
  }
  return null;
}

function resultText(content) {
  const parts = Array.isArray(content) ? content.map(part => part?.text ?? "") : [String(content ?? "")];
  for (const part of parts) {
    const report = machineReport(part);
    if (report) return report;
  }
  return parts.join("");
}

// ToolSearch answers with tool_reference parts instead of text; keep the referenced tool names.
function resultReferences(content) {
  return Array.isArray(content) ? content.filter(part => /tool_reference/u.test(String(part?.type)))
    .map(part => part.tool_name ?? part.name ?? null).filter(Boolean) : [];
}

// Parses a `claude -p --output-format stream-json --verbose` transcript into structured evidence.
export function parseClaudeStream(stdout) {
  const events = String(stdout).split("\n").map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
  const init = events.find(event => event.type === "system" && event.subtype === "init") ?? null;
  const toolUses = [];
  const toolResults = new Map();
  for (const event of events) {
    for (const item of event.message?.content ?? []) {
      if (event.type === "assistant" && item.type === "tool_use") toolUses.push({ id: item.id, name: item.name, input: item.input });
      if (event.type === "user" && item.type === "tool_result") {
        toolResults.set(item.tool_use_id, { is_error: item.is_error === true, text: resultText(item.content), references: resultReferences(item.content) });
      }
    }
  }
  const calls = toolUses.map(use => ({ ...use, result: toolResults.get(use.id) ?? null }));
  const eventTypes = {};
  for (const event of events) {
    const key = event.subtype ? `${event.type}:${event.subtype}` : event.type;
    eventTypes[key] = (eventTypes[key] ?? 0) + 1;
  }
  return { init, calls, result: events.find(event => event.type === "result") ?? null, eventTypes, events };
}

// Parses lines of a native Claude Desktop Code session transcript (the app's session store, one event per
// line). It has no `system`/`init` event: each assistant message carries its model, and conversation events
// name their session and the `claude-desktop` entrypoint. Identity facts are reported, never defaulted.
export function parseClaudeDesktopTranscript(text) {
  const parsed = parseClaudeStream(text);
  const conversation = parsed.events.filter(event => event.type === "user" || event.type === "assistant");
  return {
    ...parsed,
    conversation_events: conversation.length,
    models: [...new Set(conversation.filter(event => event.type === "assistant").map(event => event.message?.model ?? null))],
    session_ids: [...new Set(parsed.events.filter(event => Object.hasOwn(event, "sessionId") || conversation.includes(event)).map(event => event.sessionId ?? null))],
    entrypoints: [...new Set(parsed.events.filter(event => Object.hasOwn(event, "entrypoint") || conversation.includes(event)).map(event => event.entrypoint ?? null))],
    sidechain: parsed.events.some(event => event.isSidechain === true),
  };
}

// The host E2E probe's view of one session: offered tool, server status and each call of `tool`
// with its parsed AGDF outcome. host_action is redacted before shortening so a cut path cannot escape.
export function summarizeToolSession(parsed, { tool, server, redact = text => String(text ?? "") }) {
  const init = parsed.init ?? {};
  const dispatches = parsed.calls.filter(call => call.name === tool).map(call => {
    const text = call.result?.text;
    let value = null;
    try { value = JSON.parse(text ?? ""); } catch {}
    return { input: call.input, outcome: value?.outcome ?? null, terminal: value?.terminal ?? null, authorizes: value?.authorizes ?? null,
      host_action: redact(value?.host_action?.text ?? text ?? "").slice(0, 160) };
  });
  return {
    model: init.model ?? null,
    server: (init.mcp_servers ?? []).find(entry => entry.name === server) ?? null,
    toolOffered: (init.tools ?? []).includes(tool),
    dispatches,
    result: parsed.result,
  };
}
