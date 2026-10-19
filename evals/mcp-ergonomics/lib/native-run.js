// Native layer (SDD-006 to SDD-011): rounds over model x variant x task cells under a cost cap,
// per-session metrics from stream-json, variant verification and isolation manifests.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, sep } from "node:path";
import { estimateTokens, byteLength, normalizeText } from "./normalize.js";
import { classifyNativeCall, isAgdfMcpCall, isAgdfShellCall, normalizeToolName } from "./native-tasks.js";
import { isSdkInputValidationText } from "./classify.js";

export const AGDF_MCP_TOOLS = Object.freeze(["agdf_dispatch", "agdf_inspect", "agdf_prepare", "agdf_record", "agdf_approve", "agdf_revise", "agdf_closeout"]);
// SD SDD-007: with_skills = AGDF MCP tools, Skill, Read and the shell (Bash, and PowerShell as its
// Windows counterpart in Claude Code); mcp_only = AGDF MCP tools and Read only.
export const VARIANT_TOOLS = Object.freeze({
  with_skills: Object.freeze([...AGDF_MCP_TOOLS.map(name => `mcp__plugin_agdf_agdf__${name}`), "Skill", "Read", "Bash", "PowerShell"]),
  mcp_only: Object.freeze([...AGDF_MCP_TOOLS.map(name => `mcp__plugin_agdf_agdf__${name}`), "Read"]),
});
// VARIANT_TOOLS only pre-approves; Claude Code still offers every built-in tool and runs read-only ones
// (Glob, Grep, read-only shell commands) without approval. --tools enforces the built-in set; MCP tools
// are unaffected. ToolSearch stays so Claude Code loads MCP tools on demand as in normal use.
export const VARIANT_BUILTIN_TOOLS = Object.freeze({
  with_skills: Object.freeze(["Skill", "Read", "Bash", "PowerShell", "ToolSearch"]),
  mcp_only: Object.freeze(["Read", "ToolSearch"]),
});
const AGDF_SERVER = "plugin:agdf:agdf";
const GUARD_MARKER = "AGDF-REQUEST-ACTIVATION-GUARD";

// Round r visits every cell before round r + 1 (SDD-009); models alternate inside a task and variant.
export function planCells({ tasks, models, variants, repetitions }) {
  const cells = [];
  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    for (const task of tasks) for (const variant of variants) for (const model of models) cells.push({ repetition, task: task.id, variant, model });
  }
  return cells;
}

// Sequential execution with a cumulative cost check before each session and the remaining
// budget passed to the session. runCell(cell, { maxBudgetUsd }) returns a session record; a session
// with unknown cost is charged the budget it was given, and a runner error aborts only its cell.
export async function runSchedule(cells, { capUsd, runCell }) {
  const sessions = [];
  let consumed = 0;
  for (const cell of cells) {
    if (consumed >= capUsd) {
      sessions.push({ ...cell, status: "aborted", reason: "cost_cap_reached", cost_usd: 0 });
      continue;
    }
    const maxBudgetUsd = Math.round((capUsd - consumed) * 1e6) / 1e6;
    let record;
    try { record = await runCell(cell, { maxBudgetUsd }); }
    catch (error) { record = { status: "aborted", reason: `runner_error: ${String(error?.message ?? error).slice(0, 200)}`, cost_usd: "unavailable", success: null }; }
    const known = Number.isFinite(record.cost_usd);
    // A session that never started (status aborted before any cost) reports cost 0 and stays 0.
    consumed += known ? record.cost_usd : maxBudgetUsd;
    sessions.push({ ...cell, ...record, ...(known ? {} : { charged_usd: maxBudgetUsd }) });
  }
  return { sessions, consumed_usd: Math.round(consumed * 1e6) / 1e6, cap_usd: capUsd, cap_reached: consumed >= capUsd };
}

// What the session actually loaded: AGDF MCP server status, AGDF skill entries and hook output.
export function variantDiagnostics(parsed) {
  const init = parsed.init ?? {};
  const server = (init.mcp_servers ?? []).find(entry => entry.name === AGDF_SERVER);
  const skills = [...(init.skills ?? []), ...(init.slash_commands ?? [])].filter(entry => /agdf/iu.test(String(entry?.name ?? entry)));
  return { mcp_status: server?.status ?? "absent", agdf_skill_entries: skills.length,
    hook_guard: parsed.events.some(event => JSON.stringify(event).includes(GUARD_MARKER)),
    other_mcp_servers: (init.mcp_servers ?? []).filter(entry => entry.name !== AGDF_SERVER).length,
    builtin_tools: (init.tools ?? []).filter(name => !String(name).startsWith("mcp__")).sort() };
}

// `pending` at init is normal: Claude Code connects MCP servers in the background and loads their tools
// on demand (ToolSearch waits for connecting servers). Only a failed or missing server disqualifies.
const USABLE_MCP_STATUS = Object.freeze(["connected", "pending"]);

export function verifyVariant(parsed, variant) {
  const { mcp_status: status, agdf_skill_entries: skills, hook_guard: guard, other_mcp_servers: others, builtin_tools: builtins } = variantDiagnostics(parsed);
  if (!USABLE_MCP_STATUS.includes(status)) return { ok: false, reason: `AGDF MCP server not usable (${status})` };
  if (others) return { ok: false, reason: `${others} other MCP servers present` };
  const extra = builtins.filter(name => !VARIANT_BUILTIN_TOOLS[variant].includes(name));
  if (extra.length) return { ok: false, reason: `built-in tools outside the variant: ${extra.join(",")}` };
  if (variant === "mcp_only" && (skills || guard)) return { ok: false, reason: `AGDF skills ${skills} or hook guard ${guard} present` };
  if (variant === "with_skills" && !skills) return { ok: false, reason: "AGDF skills absent" };
  return { ok: true };
}

// Why a finished session is no measurement, or null when it is one: the variant was not verified, the
// session left no result event, or it ended in an error such as failed authentication.
export function sessionDisposition(parsed, variant, { processError = null, redact = value => value } = {}) {
  const verified = verifyVariant(parsed, variant);
  if (!verified.ok) return { status: "not_measured", reason: verified.reason };
  if (!parsed.result) return { status: "aborted", reason: processError ?? "no result event" };
  if (parsed.result.is_error === true) {
    return { status: "aborted", reason: `session_error: ${redact(String(parsed.result.result ?? parsed.result.subtype ?? "")).slice(0, 160)}` };
  }
  return null;
}

export function nativeSessionMetrics(parsed, roots = []) {
  const toolCalls = {};
  const responseTokens = {};
  let invalid = 0, isError = 0, agdfFailure = 0, shell = 0;
  for (const call of parsed.calls) {
    const name = normalizeToolName(call.name);
    toolCalls[name] = (toolCalls[name] ?? 0) + 1;
    const text = normalizeText(call.result?.text ?? "", roots);
    responseTokens[name] = (responseTokens[name] ?? 0) + estimateTokens(byteLength(text));
    if (call.result?.is_error) {
      isError += 1;
      if (isSdkInputValidationText(call.result.text)) invalid += 1;
    }
    if (isAgdfShellCall(call)) shell += 1;
    if ((isAgdfMcpCall(call) || isAgdfShellCall(call)) && classifyNativeCall(call).class === "agdf_failure") agdfFailure += 1;
  }
  const discovered = new Set(parsed.calls.flatMap(call => call.result?.references ?? [])
    .filter(name => isAgdfMcpCall({ name })).map(normalizeToolName));
  const usage = parsed.result?.usage;
  const totalTokens = usage ? ["input_tokens", "output_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"]
    .reduce((sum, key) => sum + (Number(usage[key]) || 0), 0) : "unavailable";
  return {
    tool_calls: toolCalls,
    invalid_argument_calls: invalid,
    is_error_results: isError,
    agdf_failure_results: agdfFailure,
    agdf_shell_calls: shell,
    agdf_tools_discovered: [...discovered].sort(),
    response_tokens: responseTokens,
    total_tokens: totalTokens,
    permission_denials: Array.isArray(parsed.result?.permission_denials) ? parsed.result.permission_denials.length : "unavailable",
    denied_tools: Array.isArray(parsed.result?.permission_denials)
      ? [...new Set(parsed.result.permission_denials.map(entry => normalizeToolName(entry?.tool_name ?? entry?.name ?? "unknown")))].sort() : [],
    cost_usd: Number.isFinite(parsed.result?.total_cost_usd) ? parsed.result.total_cost_usd : "unavailable",
    wall_time_ms: Number.isFinite(parsed.result?.duration_ms) ? parsed.result.duration_ms : "unavailable",
    num_turns: parsed.result?.num_turns ?? null,
    model_reported: parsed.init?.model ?? null,
  };
}

// SHA-256 manifest of a tree or of single files; missing entries are recorded as absent.
export function hashManifest(root, { files } = {}) {
  const manifest = {};
  const add = path => {
    const rel = relative(root, path).split(sep).join("/");
    const stat = lstatSync(path);
    if (stat.isDirectory()) { for (const name of readdirSync(path).sort()) add(join(path, name)); return; }
    manifest[rel] = stat.isFile() ? createHash("sha256").update(readFileSync(path)).digest("hex") : `other:${stat.mode}`;
  };
  if (files) for (const file of files) { const path = join(root, file); if (existsSync(path)) add(path); else manifest[file] = "absent"; }
  else if (existsSync(root)) add(root);
  return manifest;
}

// Measured on 2026-10-16: the prepared plugin MCP runtime reaches 180 characters below the Claude
// plugin data root; Windows MAX_PATH (260) therefore allows a data root of at most 79 characters.
export const MAX_PLUGIN_DATA_ROOT_CHARS = 79;

export function pluginDataRootBudget(claudeHome, platform = process.platform) {
  const length = join(claudeHome, "plugins", "data", "agdf-agdf").length;
  return { length, max: MAX_PLUGIN_DATA_ROOT_CHARS, ok: platform !== "win32" || length <= MAX_PLUGIN_DATA_ROOT_CHARS };
}

export const CLAUDE_CONFIG_SUBSET = Object.freeze(["settings.json", "settings.local.json", "plugins/installed_plugins.json", "plugins/known_marketplaces.json"]);

export function isolationManifests(repoRoot, { claudeHome = join(homedir(), ".claude") } = {}) {
  return {
    repository_control: hashManifest(join(repoRoot, ".agdf", "control")),
    claude_config_subset: hashManifest(claudeHome, { files: CLAUDE_CONFIG_SUBSET }),
  };
}

export function compareManifests(before, after) {
  const changed = [];
  for (const area of Object.keys(before)) {
    const keys = new Set([...Object.keys(before[area]), ...Object.keys(after[area] ?? {})]);
    for (const key of keys) if (before[area][key] !== after[area]?.[key]) changed.push(`${area}:${key}`);
  }
  return changed.sort();
}
