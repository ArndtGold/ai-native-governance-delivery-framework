// Native layer (SDD-006 to SDD-011): rounds over model x variant x task cells under a cost cap,
// per-session metrics from stream-json, variant verification and isolation manifests.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, sep } from "node:path";
import { estimateTokens, byteLength, normalizeText } from "./normalize.js";
import { classifyNativeCall, isAgdfMcpCall, isAgdfShellCall, normalizeToolName } from "./native-tasks.js";
import { isSdkInputValidationText } from "./classify.js";
import { parse as parseJavaScript } from 'acorn';

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

export const CODEX_T4_FEATURES = Object.freeze({ shell_tool: false, memories: false, multi_agent: false,
  apps: false, code_mode: false, code_mode_host: true, skip_host_skill_discovery: true });

export function assertCodexT4HostReady(result) {
  if (result.status !== 0 || !/^code_mode_host\s+.+?\s+true$/mu.test(result.stdout ?? '')) throw Error('CODE_MODE_HOST_UNAVAILABLE');
}

// Audit the code-mode wrapper, without evaluating model code. Only metadata,
// local computation and the existing inspect tool may supply data in this task.
export function pureInspectWrapper(code, earlierBindings = new Set(), allowedTools = ['agdf_inspect']) {
  let tree;
  try { tree = parseJavaScript(code, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true }); } catch { return false; }
  const globals = new Set(['ALL_TOOLS', 'tools', 'text', 'notify', 'store', 'load', 'JSON', 'Object', 'Promise', 'String', 'undefined']);
  const forbidden = new Set(['constructor', 'prototype', '__proto__', 'globalThis', 'process', 'require', 'eval', 'Function', 'window', 'self', 'module', 'exports']);
  const locals = new Set(earlierBindings), nodes = [];
  const collect = (node, parent, key) => {
    if (!node || typeof node !== 'object' || !node.type) return;
    nodes.push({ node, parent, key });
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') locals.add(node.id.name);
    if (['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type)) for (const param of node.params) if (param.type === 'Identifier') locals.add(param.name);
    for (const [k, value] of Object.entries(node)) if (Array.isArray(value)) for (const child of value) collect(child, node, k); else collect(value, node, k);
  };
  collect(tree);
  const types = new Set(['Program', 'VariableDeclaration', 'VariableDeclarator', 'Identifier', 'Literal', 'ExpressionStatement', 'CallExpression', 'MemberExpression',
    'ArrowFunctionExpression', 'FunctionExpression', 'BinaryExpression', 'LogicalExpression', 'AwaitExpression', 'ObjectExpression', 'Property', 'ArrayExpression',
    'TemplateLiteral', 'TemplateElement', 'UnaryExpression', 'ConditionalExpression', 'BlockStatement', 'ReturnStatement', 'ChainExpression', 'SpreadElement',
    'IfStatement', 'WhileStatement', 'ForOfStatement', 'AssignmentExpression', 'UpdateExpression', 'BreakStatement']);
  const methods = new Set(['filter', 'find', 'map', 'includes', 'endsWith', 'startsWith', 'test', 'join', 'slice', 'split', 'push', 'parse', 'stringify', 'keys', 'values', 'entries', 'fromEntries', 'all', 'resolve', 'then']);
  const memberName = node => node?.computed ? node.property?.type === 'Literal' ? node.property.value : null : node?.property?.name;
  const admittedTool = name => allowedTools.some(tool => name === `mcp__agdf__${tool}` || name === `mcp__plugin_agdf_agdf__${tool}`) || ['list_mcp_resources', 'list_mcp_resource_templates'].includes(name);
  for (const { node, parent, key } of nodes) {
    if (!types.has(node.type)) return false;
    const dataKey = parent?.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand;
    if (node.type === 'Identifier' && !dataKey && forbidden.has(node.name)) return false;
    if (node.type === 'Identifier' && !dataKey
      && !(parent?.type === 'MemberExpression' && key === 'property' && !parent.computed) && !globals.has(node.name) && !locals.has(node.name)) return false;
    if (node.type === 'Identifier' && node.name === 'tools' && (parent?.type !== 'MemberExpression' || key !== 'object')) return false;
    if (node.type === 'MemberExpression' && node.computed && node.property.type !== 'Literal') return false;
    if (node.type === 'MemberExpression' && node.object?.name === 'tools' && (parent?.type !== 'CallExpression' || key !== 'callee')) return false;
    if (node.type === 'MemberExpression' && (forbidden.has(memberName(node)) || node.object?.name === 'tools'
      && !admittedTool(memberName(node)))) return false;
    if (node.type === 'CallExpression') {
      if (node.callee.type === 'Identifier') {
        if (!['text', 'notify', 'store', 'load', 'String'].includes(node.callee.name) && !locals.has(node.callee.name)) return false;
      } else if (node.callee.type !== 'MemberExpression' || !(methods.has(memberName(node.callee))
        || admittedTool(memberName(node.callee)))) return false;
    }
    if (node.type === 'VariableDeclarator' && (node.id.type !== 'Identifier' || globals.has(node.id.name))) return false;
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier' && globals.has(node.left.name)) return false;
  }
  for (const name of locals) earlierBindings.add(name);
  return true;
}

// Supplemental qualification only. The original task/predicate/baseline stay unchanged.
export function parseCodexT4Trace(jsonl, rolloutTexts = [], allowedTools = ['agdf_inspect']) {
  const efforts = new Set();
  const streams = [], detours = [], models = new Set(), wrapperBindings = new Set(), wrappers = new Set(), warnings = [];
  let complete = false, valid = true, usage = null;
  for (const [index, text] of [jsonl, ...rolloutTexts].entries()) {
    const items = new Map(); streams.push(items);
    for (const line of text.split('\n').filter(line => line.trim())) {
    let event;
    try { event = JSON.parse(line); } catch { valid = false; continue; }
    if (index === 0 && event.type === 'turn.completed') { complete = true; usage = event.usage ?? null; }
    if (index === 0 && ['turn.failed', 'error'].includes(event.type)) valid = false;
    if (event.type === 'turn_context' && event.payload?.model) models.add(event.payload.model);
    if (event.type === 'turn_context' && (event.payload?.effort ?? event.payload?.reasoning_effort)) efforts.add(event.payload.effort ?? event.payload.reasoning_effort);
    const payload = event.payload;
    if (event.type === 'response_item' && ['function_call', 'custom_tool_call'].includes(payload?.type)) {
      if (['exec', 'functions.exec'].includes(payload.name)) {
        if (!pureInspectWrapper(payload.input ?? payload.arguments ?? '', wrapperBindings, allowedTools)) detours.push('unverified_code_mode_wrapper');
        wrappers.add(payload.call_id ?? payload.id);
      } else if (!allowedTools.some(tool => payload.name === `mcp__agdf__${tool}` || payload.name === `mcp__plugin_agdf_agdf__${tool}`)
        && !/^(?:functions\.)?(?:update_plan|tool_search)$/u.test(payload.name ?? '')) detours.push(payload.name ?? 'unknown_function');
    }
    const item = event.item ?? payload?.item;
    if (!item) continue;
    const type = item.type?.replace(/([a-z0-9])([A-Z])/gu, '$1_$2').toLowerCase();
    if (type === 'error') { warnings.push(item.message ?? 'host_error'); if (!/^Under-development features enabled:/u.test(item.message ?? '')) valid = false; continue; }
    if (type === 'mcp_tool_call') {
      if (!item.id) { valid = false; continue; }
      if (['completed', 'failed'].includes(item.status) || !['completed', 'failed'].includes(items.get(item.id)?.status)) items.set(item.id, item);
    } else if (!['reasoning', 'user_message', 'agent_message', 'plan_update', 'todo_list', 'tool_search'].includes(type)) detours.push(item.type ?? 'unknown_item');
    }
  }
  // Exec JSON and rollouts name the same invocations differently. Reconcile the
  // ordered invocation sequences, never deduplicate by arguments or page bytes:
  // two real identical calls must remain two calls and fail a repeated-page audit.
  const ordered = streams.map(stream => [...stream.values()]);
  const canonical = value => JSON.stringify(value, function (key, child) {
    return child && typeof child === 'object' && !Array.isArray(child) ? Object.fromEntries(Object.keys(child).sort().map(name => [name, child[name]])) : child;
  });
  const signature = item => { const call = item.invocation ?? item; return canonical([call.server ?? 'agdf', call.tool, call.arguments, item.status]); };
  const primary = ordered[0].length ? ordered[0] : ordered.slice(1).find(stream => stream.length) ?? [];
  for (const stream of ordered.slice(1)) if (primary.length && (stream.length !== primary.length || stream.some((item, i) => signature(item) !== signature(primary[i])))) valid = false;
  const decode = item => {
    let result = item.result ?? item.output;
    if (typeof result === 'string') result = JSON.parse(result);
    const isError = result?.isError === true || result?.is_error === true || Boolean(item.error) || item.status === 'failed';
    if (item.status === 'failed' && (result?.isError === false || result?.is_error === false)) throw Error('conflicting_tool_status');
    let text = result?.content?.filter(p => p.type === 'text').map(p => p.text).join('') ?? item.error?.message ?? '';
    const structured = result?.structuredContent ?? result?.structured_content;
    if (structured) text = JSON.stringify(structured);
    if (!isError) {
      let parsed = JSON.parse(text);
      // Rollouts may serialize a CallToolResult as text; exec JSON unwraps it.
      if (Array.isArray(parsed.content) && !parsed.report) {
        parsed = parsed.structuredContent ?? parsed.structured_content ?? JSON.parse(parsed.content.filter(p => p.type === 'text').map(p => p.text).join(''));
        text = JSON.stringify(parsed);
      }
    }
    return { text, is_error: isError };
  };
  const calls = [];
  const metadataDiscovery = [];
  for (const [position, item] of primary.entries()) {
    const invocation = item.invocation ?? item;
    let input = invocation.arguments;
    try {
      if (typeof input === 'string') input = JSON.parse(input);
      if (!input || !['completed', 'failed'].includes(item.status)) valid = false;
      let result, successfulValue;
      for (const stream of [primary, ...ordered.filter(stream => stream !== primary)]) {
        if (!stream[position] || signature(stream[position]) !== signature(item)) continue;
        const observation = stream[position], raw = observation.result ?? observation.output;
        if (observation.status === 'failed' && (raw?.isError === false || raw?.is_error === false)) valid = false;
        try {
          const decoded = decode(observation);
          if (result && result.is_error !== decoded.is_error) valid = false;
          result ??= decoded;
          if (!decoded.is_error) {
            const value = canonical(JSON.parse(decoded.text));
            if (successfulValue !== undefined && successfulValue !== value) valid = false;
            successfulValue = value;
          }
        } catch {}
      }
      if (!result) { valid = false; continue; }
      // Empty host metadata listings supply no binding or document content. They
      // are discovery, not filesystem/resource reads; actual read helpers fail.
      const metadataKey = { list_mcp_resources: 'resources', list_mcp_resource_templates: 'resourceTemplates' }[invocation.tool];
      if (invocation.server === 'codex' && metadataKey) {
        const data = JSON.parse(result.text);
        if (item.status !== 'completed' || result.is_error || Object.keys(input).length || Object.keys(data).length !== 1 || !Array.isArray(data[metadataKey]) || data[metadataKey].length) detours.push('unverified_resource_metadata');
        metadataDiscovery.push({ tool: invocation.tool, empty: data[metadataKey]?.length === 0 });
        continue;
      }
      if (!allowedTools.includes(invocation.tool) || invocation.server && !['agdf', 'plugin:agdf:agdf'].includes(invocation.server)) detours.push(invocation.tool ?? 'unknown_mcp');
      calls.push({ id: item.id, name: `mcp__plugin_agdf_agdf__${invocation.tool}`, input, result });
    } catch { valid = false; }
  }
  return { calls, detours, trace_complete: complete && valid, observed_models: [...models], observed_efforts: [...efforts], usage, wrappers: wrappers.size, warnings, metadata_discovery: metadataDiscovery };
}

export const parseCodexCommandTrace = (jsonl, rollouts = []) => parseCodexT4Trace(jsonl, rollouts, ['agdf_inspect', 'agdf_approve']);
export function strictCommandFlow({ parsed, binding }) {
  const fail = reason => ({ check: 'strict_t7_command_flow_v1', success: false, reason });
  if (!parsed.trace_complete || parsed.detours.length) return fail('incomplete_trace_or_forbidden_detour');
  const observed = new Set(); let approved = 0;
  const values = value => {
    if (typeof value === 'string') observed.add(value);
    else if (value && typeof value === 'object') for (const child of Object.values(value)) values(child);
  };
  for (const call of parsed.calls) {
    let result;
    try { result = JSON.parse(call.result.text); }
    catch {
      // SDK argument rejection precedes execution and is intentionally plain
      // text. Retain/count it without turning a corrected call into a detour.
      if (call.result.is_error && isSdkInputValidationText(call.result.text)) continue;
      return fail('unreadable_domain_result');
    }
    if (call.name.endsWith('__agdf_inspect') && !call.result.is_error && result.outcome === 'inspect_result') values(result);
    if (call.name.endsWith('__agdf_approve') && ['accepted', 'already_applied'].includes(result.outcome)) {
      const input = call.input;
      if (!['target_id', 'run_id', 'expected_revision_id', 'presentation_id'].every(key => observed.has(binding[key]))) return fail('bindings_not_retrieved_through_mcp');
      if (call.result.is_error || result.outcome !== 'accepted' || input.target_id !== binding.target_id || input.run_id !== binding.run_id
        || input.expected_revision_id !== binding.expected_revision_id || input.command?.kind !== 'approval.record'
        || input.command.payload.gate !== 'UR' || input.command.payload.presentation_id !== binding.presentation_id
        || input.command.payload.response !== 'Approval: UR' || result.operation_id !== input.operation_id
        || !result.receipt) return fail('wrong_approval_binding_or_replay');
      approved++;
    }
  }
  return approved === 1 ? { check: 'strict_t7_command_flow_v1', success: true, approvals: approved } : fail('expected_one_approval');
}

export function strictT4DocumentFlow({ parsed, expectedBytes, binding, finalText }) {
  const fail = reason => ({ check: 'strict_t4_document_flow_v1', success: false, reason });
  if (!parsed.trace_complete || parsed.detours.length) return fail('incomplete_trace_or_forbidden_detour');
  let discovered = false, offset = 0, nextCursor, complete = false, pages = 0;
  const chunks = [], expectedDigest = `sha256:${createHash('sha256').update(expectedBytes).digest('hex')}`;
  for (const call of parsed.calls) {
    if (call.result.is_error) continue;
    const result = JSON.parse(call.result.text), report = result?.report, input = call.input;
    if (input?.operation === 'operation-contract' && input.module === 'agdf_prepare/presentation.prepare') {
      const catalog = report?.presentation_catalog, candidate = catalog?.candidates?.[0];
      if (!call.result.is_error && catalog?.state === 'unique' && catalog.complete_scan && catalog.total_candidates === 1 && catalog.candidates.length === 1
        && candidate.presentation_id === binding.presentation_id && candidate.content_digest === expectedDigest
        && Object.entries(binding).every(([key, value]) => candidate.read_arguments?.[key] === value)) discovered = true;
    }
    if (input?.operation !== 'presentation-document' || call.result.is_error) continue;
    if (!discovered || complete || !Object.entries(binding).every(([key, value]) => input[key] === value)
      || input.cursor !== nextCursor || !report?.available || typeof report.content !== 'string'
      || report.presentation_id !== binding.presentation_id || report.target_id !== binding.target_id || report.run_id !== binding.run_id
      || report.gate !== binding.gate || report.revision_id !== binding.expected_revision_id || report.content_digest !== expectedDigest
      || report.byte_start !== offset || report.total_bytes !== expectedBytes.length) return fail('page_binding_order_or_discovery');
    const bytes = Buffer.from(report.content, 'utf8');
    if (bytes.length === 0 || report.byte_end !== offset + bytes.length || !expectedBytes.subarray(offset, report.byte_end).equals(bytes)) return fail('page_bytes_mismatch');
    offset = report.byte_end; complete = report.complete === true; nextCursor = report.next_cursor ?? undefined;
    if (complete !== (offset === expectedBytes.length) || complete !== (nextCursor === undefined)) return fail('invalid_completion');
    chunks.push(bytes); ++pages;
  }
  if (!complete || !Buffer.concat(chunks).equals(expectedBytes)) return fail('document_incomplete');
  if (typeof finalText !== 'string' || !finalText.includes(expectedBytes.toString('utf8'))) return fail('complete_user_delivery_unproven');
  return { check: 'strict_t4_document_flow_v1', success: true, pages, bytes: offset, content_digest: expectedDigest, no_detours: true, complete_user_delivery: true };
}
