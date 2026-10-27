import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildFixture, CLI } from "../lib/fixtures.js";
import { evaluateSuccess, loadTaskSet, normalizeToolName, SUCCESS_TYPES } from "../lib/native-tasks.js";
import { AGDF_MCP_TOOLS, nativeSessionMetrics, planCells, runSchedule, VARIANT_BUILTIN_TOOLS, VARIANT_TOOLS, verifyVariant } from "../lib/native-run.js";

const INSPECT = "mcp__plugin_agdf_agdf__agdf_inspect";
const call = (name, result, input = {}) => ({ id: name, name, input, result });
const parsedOf = (calls, extra = {}) => ({ calls, init: {}, result: null, events: [], ...extra });

function tempRun(content) {
  const root = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-test-"));
  mkdirSync(join(root, ".agdf/control/runs/demo-run-01"), { recursive: true });
  writeFileSync(join(root, ".agdf/control/runs/demo-run-01/RUN_STATE.md"), content);
  return root;
}

test("task set v1 holds the approved decisions and six complete tasks (SCN-008)", () => {
  const set = loadTaskSet();
  assert.deepEqual(set.tasks.map(task => task.id), ["T1", "T2", "T3", "T4", "T5", "T6"]);
  assert.deepEqual(set.models, ["claude-opus-5-5", "claude-sonnet-5-5"]);
  assert.deepEqual(set.variants, ["with_skills", "mcp_only"]);
  assert.equal(set.repetitions, 2);
  assert.equal(set.cost_cap_usd, 25);
  for (const task of set.tasks) {
    assert.ok(["F1", "F2", "F3", "F4", "F2_STALE"].includes(task.fixture), task.id);
    assert.ok(task.prompt.trim().length > 10, task.id);
    assert.ok(Array.isArray(task.allowed_paths), task.id);
    assert.ok(SUCCESS_TYPES.includes(task.success.type), task.id);
  }
});

test("read-bound predicate passes on a successful bound read and fails otherwise (SCN-009)", () => {
  const task = { success: { type: "agdf_read_bound", run_id: "demo-run-01" } };
  const ok = call(INSPECT, { is_error: false, text: JSON.stringify({ outcome: "inspect_result", report: { run_id: "demo-run-01" } }) });
  const failed = call(INSPECT, { is_error: false, text: JSON.stringify({ outcome: "invalid_input", run_id: "demo-run-01" }) });
  assert.equal(evaluateSuccess({ task, fixture: {}, parsed: parsedOf([ok]), mutationViolations: [] }).success, true);
  assert.equal(evaluateSuccess({ task, fixture: {}, parsed: parsedOf([failed]), mutationViolations: [] }).success, false);
  assert.equal(evaluateSuccess({ task, fixture: {}, parsed: parsedOf([ok]), mutationViolations: ["src/x.js"] }).success, false);
  const shell = call("Bash", { is_error: false, text: '{"current_gate":"PRD","run_id":"demo-run-01"}' }, { command: "node agdf-local.js gate-check --run demo-run-01" });
  assert.equal(evaluateSuccess({ task, fixture: {}, parsed: parsedOf([shell]), mutationViolations: [] }).success, true);
});

test("new-run, document-page and stale-write predicates (SCN-009)", () => {
  const root = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-test-"));
  try {
    const task = { success: { type: "single_new_run_at_ur" } };
    assert.equal(evaluateSuccess({ task, fixture: { root }, parsed: parsedOf([]), mutationViolations: [] }).success, false);
    mkdirSync(join(root, ".agdf/control/runs/new-run"), { recursive: true });
    writeFileSync(join(root, ".agdf/control/runs/new-run/RUN_STATE.md"), "- current_gate: UR\n");
    assert.equal(evaluateSuccess({ task, fixture: { root }, parsed: parsedOf([]), mutationViolations: [] }).success, true);
  } finally { rmSync(root, { recursive: true, force: true }); }

  const fixture = { presentationId: "p-1", documentBytes: 70000 };
  const page = (start, complete) => call(INSPECT, { is_error: false, text: JSON.stringify({ outcome: "inspect_result",
    report: { presentation_id: "p-1", byte_start: start, complete } }) });
  const pages = { success: { type: "all_document_pages" } };
  assert.equal(evaluateSuccess({ task: pages, fixture, parsed: parsedOf([page(0, false), page(32768, false), page(65536, true)]), mutationViolations: [] }).success, true);
  assert.equal(evaluateSuccess({ task: pages, fixture, parsed: parsedOf([page(0, false), page(32768, false)]), mutationViolations: [] }).success, false);

  // T6 per TP: the stale write is rejected and at most one evidence record follows.
  const stale = "11111111-1111-4111-8111-111111111111", current = "22222222-2222-4222-8222-222222222222";
  const staleTask = { success: { type: "stale_write_guarded", run_id: "demo-run-01" } };
  const evidence = { kind: "step.record", payload: { step: "evidence", source: { path: "x", digest: "sha256:0" }, reason: "Smoke-Test bestanden", covers: "AC-001" } };
  const record = (revision, result) => call("mcp__plugin_agdf_agdf__agdf_record", { is_error: false, text: JSON.stringify(result) }, { expected_revision_id: revision, command: evidence });
  const rejectedStale = record(stale, { outcome: "rejected", reason: "stale_revision" });
  const accepted = record(current, { outcome: "accepted" });
  const guarded = calls => evaluateSuccess({ task: staleTask, fixture: { staleRevisionId: stale }, parsed: parsedOf(calls), mutationViolations: [] });
  assert.equal(guarded([rejectedStale, accepted]).success, true);
  assert.equal(guarded([rejectedStale]).success, true);
  assert.match(guarded([]).reason, /no write with the stale revision/u);
  assert.match(guarded([record(stale, { outcome: "rejected", reason: "source_missing" })]).reason, /no write with the stale revision/u);
  assert.match(guarded([record(stale, { outcome: "accepted" })]).reason, /stale revision was accepted/u);
  assert.match(guarded([rejectedStale, accepted, accepted]).reason, /duplicate evidence records: 2/u);
  const shellStale = call("Bash", { is_error: true, text: JSON.stringify({ outcome: "rejected", reason: "stale_revision" }) },
    { command: `node agdf-local.js run-step --dir . --run demo-run-01 --revision ${stale} --step evidence --evidence x` });
  assert.equal(guarded([shellStale]).success, true);
  const brokenRoot = tempRun("- current_gate: UR\n");
  try { rmSync(join(brokenRoot, ".agdf/control/runs/demo-run-01/RUN_STATE.md"));
    assert.match(evaluateSuccess({ task: { success: { type: "single_new_run_at_ur" } }, fixture: { root: brokenRoot }, parsed: parsedOf([]), mutationViolations: [] }).reason, /no readable RUN_STATE/u);
  } finally { rmSync(brokenRoot, { recursive: true, force: true }); }
});

test("approval predicate on a real presented fixture (SCN-009)", () => {
  const fixture = buildFixture("F3");
  try {
    const task = { success: { type: "single_ur_approval", run_id: "demo-run-01" } };
    assert.equal(evaluateSuccess({ task, fixture, parsed: parsedOf([]), mutationViolations: [] }).success, false);
    const approved = spawnSync(process.execPath, [CLI, "run-approve", "--dir", fixture.root, "--json", "--run", "demo-run-01", "--gate", "UR",
      "--revision", fixture.revision(), "--presentation", fixture.presentationId, "--response", "Approval: UR"], { encoding: "utf8" });
    assert.equal(JSON.parse(approved.stdout).outcome, "approved", approved.stderr);
    assert.equal(evaluateSuccess({ task, fixture, parsed: parsedOf([]), mutationViolations: [] }).success, true);
  } finally { fixture.dispose(); }
});

test("cells run round 1 before round 2 and the schedule stops at the cap (SCN-024)", async () => {
  const cells = planCells({ tasks: [{ id: "T1" }, { id: "T2" }], models: ["a", "b"], variants: ["with_skills", "mcp_only"], repetitions: 2 });
  assert.equal(cells.length, 16);
  assert.ok(cells.slice(0, 8).every(cell => cell.repetition === 1) && cells.slice(8).every(cell => cell.repetition === 2));
  assert.deepEqual(cells.slice(0, 2).map(cell => cell.model), ["a", "b"]);
  const budgets = [];
  const result = await runSchedule(cells, { capUsd: 1, runCell: async (_cell, { maxBudgetUsd }) => { budgets.push(maxBudgetUsd); return { status: "measured", cost_usd: 0.4 }; } });
  assert.deepEqual(budgets, [1, 0.6, 0.2]);
  assert.equal(result.sessions.filter(session => session.status === "measured").length, 3);
  assert.ok(result.sessions.slice(3).every(session => session.status === "aborted" && session.reason === "cost_cap_reached"));
  assert.equal(result.cap_reached, true);
  assert.equal(result.consumed_usd, 1.2);
  // An unknown cost is charged with the budget the session had, so the cap stops the run.
  const unknown = await runSchedule(cells.slice(0, 3), { capUsd: 1, runCell: async cell =>
    cell === cells[0] ? { status: "measured", cost_usd: 0.25 } : { status: "aborted", cost_usd: "unavailable" } });
  assert.deepEqual(unknown.sessions.map(session => session.charged_usd ?? null), [null, 0.75, null]);
  assert.equal(unknown.sessions[2].reason, "cost_cap_reached");
  assert.equal(unknown.cap_reached, true);
  // An error escaping runCell is recorded on its cell, not thrown out of the schedule; its cost is unknown.
  const errors = await runSchedule(cells.slice(0, 2), { capUsd: 1, runCell: async () => { throw new Error("fixture failed"); } });
  assert.match(errors.sessions[0].reason, /^runner_error: fixture failed/u);
  assert.equal(errors.sessions.length, 2);
});

test("variant verification and session metrics", () => {
  const connected = { mcp_servers: [{ name: "plugin:agdf:agdf", status: "connected" }] };
  assert.equal(verifyVariant(parsedOf([], { init: { ...connected, skills: [] } }), "mcp_only").ok, true);
  assert.equal(verifyVariant(parsedOf([], { init: { ...connected, skills: ["agdf:gate-check"] } }), "mcp_only").ok, false);
  assert.equal(verifyVariant(parsedOf([], { init: { ...connected, skills: [] }, events: [{ text: "AGDF-REQUEST-ACTIVATION-GUARD" }] }), "mcp_only").ok, false);
  assert.equal(verifyVariant(parsedOf([], { init: { ...connected, skills: ["agdf:gate-check"] } }), "with_skills").ok, true);
  assert.equal(verifyVariant(parsedOf([], { init: { mcp_servers: [] } }), "with_skills").ok, false);
  const pending = { mcp_servers: [{ name: "plugin:agdf:agdf", status: "pending" }], skills: [] };
  assert.equal(verifyVariant(parsedOf([], { init: pending }), "mcp_only").ok, true);
  assert.equal(verifyVariant(parsedOf([], { init: { mcp_servers: [{ name: "plugin:agdf:agdf", status: "failed" }] } }), "mcp_only").ok, false);
  const discovered = nativeSessionMetrics(parsedOf([call("ToolSearch", { is_error: false, text: "",
    references: ["mcp__plugin_agdf_agdf__agdf_inspect", "mcp__plugin_agdf_agdf__agdf_dispatch", "WebFetch"] })]));
  assert.deepEqual(discovered.agdf_tools_discovered, ["agdf_dispatch", "agdf_inspect"]);
  assert.equal(normalizeToolName("mcp__plugin_agdf_agdf-cockpit__agdf_cockpit"), "agdf_cockpit");
  const metrics = nativeSessionMetrics(parsedOf([
    call(INSPECT, { is_error: true, text: "Input validation error: Invalid arguments for tool agdf_inspect: x" }),
    call(INSPECT, { is_error: false, text: JSON.stringify({ outcome: "invalid_input" }) }),
    call("Bash", { is_error: false, text: "ok" }, { command: "node agdf-local.js doctor" }),
  ], { result: { total_cost_usd: 0.5, duration_ms: 1000, num_turns: 3, usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 20, cache_creation_input_tokens: 0 } } }));
  assert.deepEqual(metrics.tool_calls, { agdf_inspect: 2, Bash: 1 });
  assert.equal(metrics.invalid_argument_calls, 1);
  assert.equal(metrics.is_error_results, 1);
  assert.equal(metrics.agdf_failure_results, 1);
  assert.equal(metrics.agdf_shell_calls, 1);
  assert.equal(metrics.total_tokens, 35);
  assert.equal(metrics.cost_usd, 0.5);
  assert.equal(nativeSessionMetrics(parsedOf([])).cost_usd, "unavailable");
});

test("variant allowlists follow SD SDD-007", () => {
  const agdf = AGDF_MCP_TOOLS.map(name => `mcp__plugin_agdf_agdf__${name}`);
  assert.deepEqual(VARIANT_TOOLS.with_skills, [...agdf, "Skill", "Read", "Bash", "PowerShell"]);
  assert.deepEqual(VARIANT_TOOLS.mcp_only, [...agdf, "Read"]);
  assert.ok(Object.values(VARIANT_TOOLS).flat().every(tool => !tool.includes("(")), "no command-scoped rules");
  assert.deepEqual(VARIANT_BUILTIN_TOOLS.with_skills, ["Skill", "Read", "Bash", "PowerShell", "ToolSearch"]);
  assert.deepEqual(VARIANT_BUILTIN_TOOLS.mcp_only, ["Read", "ToolSearch"]);
});

test("variant verification rejects foreign MCP servers and built-in tools outside the variant", () => {
  const init = extra => ({ mcp_servers: [{ name: "plugin:agdf:agdf", status: "connected" }], skills: [], tools: ["Read", "ToolSearch", INSPECT], ...extra });
  assert.equal(verifyVariant(parsedOf([], { init: init() }), "mcp_only").ok, true);
  assert.match(verifyVariant(parsedOf([], { init: init({ tools: ["Read", "Glob", INSPECT] }) }), "mcp_only").reason, /outside the variant: Glob/u);
  assert.match(verifyVariant(parsedOf([], { init: init({ mcp_servers: [{ name: "plugin:agdf:agdf", status: "connected" }, { name: "x", status: "connected" }] }) }), "mcp_only").reason,
    /1 other MCP servers/u);
  assert.equal(verifyVariant(parsedOf([], { init: init({ skills: ["agdf:gate-check"], tools: ["Skill", "Read", "PowerShell", "ToolSearch"] }) }), "with_skills").ok, true);
});

test("PowerShell AGDF calls count as shell calls and permission denials are counted", () => {
  const metrics = nativeSessionMetrics(parsedOf([
    call("PowerShell", { is_error: false, text: "ok" }, { command: "& node C:/x/agdf-local.js gate-check --json" }),
    call("PowerShell", { is_error: false, text: "ok" }, { command: "Get-ChildItem" }),
  ], { result: { permission_denials: [{ tool_name: "Write" }, { tool_name: "mcp__plugin_agdf_agdf__agdf_record" }, { tool_name: "Write" }] } }));
  assert.equal(metrics.agdf_shell_calls, 1);
  assert.equal(metrics.permission_denials, 3);
  assert.deepEqual(metrics.denied_tools, ["Write", "agdf_record"]);
  assert.equal(nativeSessionMetrics(parsedOf([])).permission_denials, "unavailable");
});

test("plugin data root budget keeps the MCP runtime under Windows MAX_PATH", async () => {
  const { pluginDataRootBudget, MAX_PLUGIN_DATA_ROOT_CHARS } = await import("../lib/native-run.js");
  assert.equal(MAX_PLUGIN_DATA_ROOT_CHARS, 79);
  assert.equal(pluginDataRootBudget("C:\\Users\\someone\\AppData\\Local\\Temp\\agdf-ne-abcdef\\c", "win32").ok, true);
  const deep = pluginDataRootBudget("C:\\Workspace\\ai-native-governance-delivery-framework\\probe-results\\mcp-ergonomics-20261016\\native-work-20261016-111625\\claude-home", "win32");
  assert.equal(deep.ok, false);
  assert.equal(pluginDataRootBudget("/tmp/a/very/long/path/that/is/fine/on/posix/systems/without/max-path/limits/at/all", "linux").ok, true);
});

test("tasks.v1.json stays valid JSON with the documented prompt placeholders", () => {
  const raw = readFileSync(new URL("../tasks.v1.json", import.meta.url), "utf8");
  assert.match(raw, /\$\{presentation_id\}/u);
  assert.match(raw, /\$\{stale_revision_id\}/u);
});

test("the native runner's dry run plans cells with their task ids", () => {
  const runner = new URL("../../scripts/run-mcp-ergonomics-native.js", import.meta.url);
  const result = spawnSync(process.execPath, [runner.pathname.replace(/^\/([A-Za-z]:)/u, "$1"), "--dry-run", "--tasks", "T1,T6", "--repetitions", "1"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.cells, 8);
  assert.deepEqual([...new Set(plan.order.map(cell => cell.task))], ["T1", "T6"]);
});

test("sessions that end in an error or without result are no measurement", async () => {
  const { sessionDisposition } = await import("../lib/native-run.js");
  const init = { mcp_servers: [{ name: "plugin:agdf:agdf", status: "connected" }], skills: [], tools: ["Read", "ToolSearch"] };
  const authFailure = parsedOf([], { init, result: { subtype: "success", is_error: true, total_cost_usd: 0,
    result: "Failed to authenticate: OAuth session expired and could not be refreshed" } });
  assert.deepEqual(sessionDisposition(authFailure, "mcp_only"),
    { status: "aborted", reason: "session_error: Failed to authenticate: OAuth session expired and could not be refreshed" });
  assert.deepEqual(sessionDisposition(parsedOf([], { init }), "mcp_only", { processError: "spawnSync claude ETIMEDOUT" }),
    { status: "aborted", reason: "spawnSync claude ETIMEDOUT" });
  assert.equal(sessionDisposition(parsedOf([], { init: { ...init, tools: ["Read", "Glob"] } }), "mcp_only").status, "not_measured");
  assert.equal(sessionDisposition(parsedOf([], { init, result: { subtype: "success", is_error: false } }), "mcp_only"), null);
});

test("a native run without token needs the explicit credential-copy opt-in and stops before any side effect", () => {
  const runner = new URL("../../scripts/run-mcp-ergonomics-native.js", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");
  const env = { ...process.env };
  delete env.CLAUDE_CODE_OAUTH_TOKEN;
  const result = spawnSync(process.execPath, [runner, "--tasks", "T1", "--repetitions", "1", "--out", join(tmpdir(), "agdf-ne-optin-never-written.json")], { encoding: "utf8", env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CLAUDE_CODE_OAUTH_TOKEN is not set/u);
  assert.match(result.stderr, /--credentials-copy/u);
});

test('strict T4 proof rejects omissions, duplication, substitution, cursor changes and missing user delivery', async () => {
  const { strictT4DocumentFlow } = await import('../lib/native-run.js');
  const { createHash } = await import('node:crypto');
  const expectedBytes = Buffer.from('First page\n🙂\nLast page\n');
  const digest = `sha256:${createHash('sha256').update(expectedBytes).digest('hex')}`;
  const binding = { run_id: 'demo-run-01', gate: 'UR', target_id: `sha256:${'1'.repeat(64)}`, expected_revision_id: '00000000-0000-4000-8000-000000000001', presentation_id: '00000000-0000-4000-8000-000000000002' };
  const discovery = { input: { operation: 'operation-contract', module: 'agdf_prepare/presentation.prepare' }, result: { text: JSON.stringify({ report: { presentation_catalog: { state: 'unique', complete_scan: true, total_candidates: 1, candidates: [{ presentation_id: binding.presentation_id, content_digest: digest, read_arguments: binding }] } } }) } };
  const page = (start, end, cursor, next) => ({ input: { operation: 'presentation-document', ...binding, ...(cursor ? { cursor } : {}) }, result: { text: JSON.stringify({ report: { available: true, ...binding, revision_id: binding.expected_revision_id, presentation_id: binding.presentation_id, content_digest: digest, content: expectedBytes.subarray(start, end).toString('utf8'), byte_start: start, byte_end: end, total_bytes: expectedBytes.length, complete: end === expectedBytes.length, next_cursor: next ?? null } }) } });
  const pages = [page(0, 11, undefined, 'token'), page(11, expectedBytes.length, 'token')];
  const run = (calls = [discovery, ...pages], options = {}) => strictT4DocumentFlow({ parsed: { calls, trace_complete: true, detours: [], ...options }, expectedBytes, binding, finalText: expectedBytes.toString('utf8') });
  assert.equal(run().success, true);
  for (const calls of [[...pages], [discovery, pages[1]], [discovery, pages[1], pages[0]], [discovery, pages[0], pages[0], pages[1]]]) assert.equal(run(calls).success, false);
  const bad = structuredClone(pages[1]); bad.input.cursor = 'foreign'; assert.equal(run([discovery, pages[0], bad]).success, false);
  const corrupt = structuredClone(pages[1]), result = JSON.parse(corrupt.result.text); result.report.content = result.report.content.replace('Last', 'Lost'); corrupt.result.text = JSON.stringify(result);
  assert.equal(run([discovery, pages[0], corrupt]).success, false);
  assert.equal(run(undefined, { detours: ['Read'] }).success, false);
  assert.equal(run(undefined, { trace_complete: false }).success, false);
  assert.equal(strictT4DocumentFlow({ parsed: { calls: [discovery, ...pages], trace_complete: true, detours: [] }, expectedBytes, binding, finalText: 'Document retrieved.' }).reason, 'complete_user_delivery_unproven');
});

test('Codex trace audit includes failed detours and incomplete calls, preserving original task predicate', async () => {
  const { parseCodexT4Trace } = await import('../lib/native-run.js');
  const event = { type: 'item.completed', item: { id: 'read-1', type: 'mcp_tool_call', status: 'completed', server: 'agdf', tool: 'agdf_inspect', arguments: { operation: 'presentation-document' }, result: { content: [{ type: 'text', text: '{"report":{"available":false}}' }] } } };
  const lines = [event, { type: 'turn.completed', usage: { input_tokens: 12, output_tokens: 3 } }].map(v => JSON.stringify(v)).join('\n');
  const parsed = parseCodexT4Trace(lines);
  assert.equal(parsed.trace_complete, true); assert.equal(parsed.calls.length, 1);
  assert.deepEqual(parsed.usage, { input_tokens: 12, output_tokens: 3 });
  const detour = JSON.stringify({ type: 'response_item', payload: { type: 'function_call', name: 'functions.exec_command', arguments: '{"cmd":"cat .agdf/control/runs/demo-run-01/RUN_STATE.md"}' } });
  assert.deepEqual(parseCodexT4Trace(lines, [detour]).detours, ['functions.exec_command']);
  const planning = JSON.stringify({ type: 'response_item', payload: { type: 'function_call', name: 'functions.update_plan', arguments: '{}' } });
  assert.deepEqual(parseCodexT4Trace(lines, [planning]).detours, [], 'planning is not a filesystem or shell detour');
  assert.equal(parseCodexT4Trace(lines + '\n{broken').trace_complete, false);
  const rejected = structuredClone(event); rejected.item.status = 'failed'; rejected.item.result = { isError: true, content: [{ type: 'text', text: 'Input validation error: missing run_id' }] };
  const recovered = parseCodexT4Trace(JSON.stringify(rejected) + '\n' + JSON.stringify({ type: 'turn.completed' }));
  assert.equal(recovered.trace_complete, true); assert.equal(recovered.calls[0].result.is_error, true);
  assert.match(recovered.calls[0].result.text, /missing run_id/);
  const pending = structuredClone(event); pending.item.status = 'in_progress';
  assert.equal(parseCodexT4Trace(JSON.stringify(pending) + '\n' + JSON.stringify({ type: 'turn.completed' })).trace_complete, false);
});

test('single Codex T4 planning cannot enter the default multi-session host probe', () => {
  const script = new URL('../../../scripts/native-probes/codex-host-e2e.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, '$1');
  const result = spawnSync(process.execPath, [script, '--model', 'fixture-model', '--task', 'T4', '--single-session', '--dry-run'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.sessions, 1); assert.equal(plan.features.code_mode_host, true); assert.equal(plan.features.shell_tool, false); assert.equal(plan.executes, false); assert.equal(plan.additional_api_spend_usd, 0);
  const invalid = spawnSync(process.execPath, [script, '--model', 'fixture-model', '--task', 'T3', '--single-session', '--dry-run'], { encoding: 'utf8' });
  assert.notEqual(invalid.status, 0); assert.match(invalid.stderr, /SINGLE_T4_ARGUMENT_INVALID/);
});

test('code-mode discovery and inspect wrappers are audited without permitting shell, files or evaluation', async () => {
  const { pureInspectWrapper, parseCodexT4Trace } = await import('../lib/native-run.js');
  const discovery = 'const matches = ALL_TOOLS.filter(x => /run|UR|artifact/i.test(x.name + " " + x.description)); text(matches);';
  assert.equal(pureInspectWrapper(discovery), true);
  assert.equal(pureInspectWrapper('const r = await tools.mcp__agdf__agdf_inspect({operation:"gate-check"}); text(r);'), true);
  for (const code of ['text(await tools.exec_command({cmd:"cat .agdf/control/runs/demo-run-01/RUN_STATE.md"}));',
    'const t=tools; const f=t.exec_command; text(await f({cmd:"cat control"}));',
    'const f=tools.mcp__agdf__agdf_inspect; text(await f({operation:"doctor"}));',
    'const k="constructor"; const F=text[k]; const run=F("return process"); text(run().env);',
    'text(process.env);', 'const f = await import("node:fs"); text(f);', 'text(eval("1"));', 'text(({}).constructor);']) assert.equal(pureInspectWrapper(code), false, code);
  const rollout = [
    { type: 'event_msg', payload: { type: 'item_completed', item: { type: 'UserMessage', id: 'user', content: [] } } },
    { type: 'response_item', payload: { type: 'custom_tool_call', name: 'exec', call_id: 'discovery', input: discovery } },
    { type: 'event_msg', payload: { type: 'item_completed', item: { type: 'Reasoning', id: 'reasoning' } } },
    { type: 'event_msg', payload: { type: 'item_completed', item: { type: 'AgentMessage', id: 'answer', content: [] } } },
  ].map(value => JSON.stringify(value)).join('\n');
  const stdout = JSON.stringify({ type: 'turn.completed', usage: {} });
  const audited = parseCodexT4Trace(stdout, [rollout]);
  assert.equal(audited.trace_complete, true); assert.deepEqual(audited.detours, []); assert.equal(audited.wrappers, 1);
  const failedHost = JSON.stringify({ type: 'item.completed', item: { id: 'host', type: 'error', message: 'Code Mode is unavailable because code-mode host is disabled.' } });
  assert.equal(parseCodexT4Trace(failedHost + '\n' + stdout, [rollout]).trace_complete, false);
});


test('single Codex T4 rejects a disabled or unobservable code-mode host before model execution', async () => {
  const { assertCodexT4HostReady } = await import('../lib/native-run.js');
  assert.doesNotThrow(() => assertCodexT4HostReady({ status: 0, stdout: 'code_mode_host stable true\n' }));
  assert.doesNotThrow(() => assertCodexT4HostReady({ status: 0, stdout: 'code_mode_host under development true\n' }));
  for (const result of [{ status: 1, stdout: 'code_mode_host stable true\n' },
    { status: 0, stdout: 'code_mode_host stable false\n' }, { status: 0, stdout: 'code_mode stable true\n' },
    { status: 0, stdout: '' }]) assert.throws(() => assertCodexT4HostReady(result), /CODE_MODE_HOST_UNAVAILABLE/);
});

test('Codex dual telemetry reconciles invocations without losing repeats, failures or contradictory evidence', async () => {
  const { parseCodexT4Trace, pureInspectWrapper } = await import('../lib/native-run.js');
  const item = { id: 'item_1', type: 'mcp_tool_call', server: 'agdf', tool: 'agdf_inspect',
    arguments: { operation: 'presentation-document', module: 'literal-data-key' }, status: 'completed',
    result: { content: [{ type: 'text', text: '{"report":{"content":"same bytes"}}' }] } };
  const stdout = (...items) => [...items.map(item => ({ type: 'item.completed', item })), { type: 'turn.completed' }].map(JSON.stringify).join('\n');
  const rollout = (...items) => items.map(item => JSON.stringify({ type: 'event_msg', payload: { item } })).join('\n');
  const mirrored = { ...structuredClone(item), id: 'exec-different-id', type: 'McpToolCall' };
  const result = parseCodexT4Trace(stdout(item), [rollout(mirrored)]);
  assert.equal(result.trace_complete, true); assert.equal(result.calls.length, 1);
  const repeated = parseCodexT4Trace(stdout(item, { ...item, id: 'item_2' }), [rollout(mirrored, { ...mirrored, id: 'exec-repeat' })]);
  assert.equal(repeated.trace_complete, true); assert.equal(repeated.calls.length, 2, 'real duplicate pages are not deduplicated');
  assert.equal(parseCodexT4Trace(stdout(item), [rollout()]).trace_complete, false, 'missing mirror is not silently ignored');
  assert.equal(parseCodexT4Trace(stdout(item), [rollout({ ...mirrored, arguments: { operation: 'doctor' } })]).trace_complete, false);
  const conflict = structuredClone(mirrored); conflict.result.content[0].text = '{"report":{"content":"changed bytes"}}';
  assert.equal(parseCodexT4Trace(stdout(item), [rollout(conflict)]).trace_complete, false);
  const conflictingFlag = structuredClone(mirrored); conflictingFlag.result.isError = true;
  assert.equal(parseCodexT4Trace(stdout(item), [rollout(conflictingFlag)]).trace_complete, false);
  const truncated = structuredClone(mirrored); truncated.result.content[0].text = '{"report":';
  assert.equal(parseCodexT4Trace(stdout(item), [rollout(truncated)]).trace_complete, true, 'complete exec result covers its same ordered invocation');
  assert.equal(parseCodexT4Trace(stdout({ ...item, result: truncated.result }), [rollout(truncated)]).trace_complete, false);
  const failed = { ...item, status: 'failed', result: { content: [{ type: 'text', text: 'Input validation error' }] } };
  const failure = parseCodexT4Trace(stdout(failed), [rollout({ ...failed, id: 'exec-failure', result: { ...failed.result, isError: true } })]);
  assert.equal(failure.trace_complete, true); assert.equal(failure.calls[0].result.is_error, true);
  assert.equal(parseCodexT4Trace(stdout(failed), [rollout({ ...failed, id: 'conflict', result: { ...failed.result, isError: false } })]).trace_complete, false);
  assert.equal(pureInspectWrapper('const r = await tools.mcp__agdf__agdf_inspect({operation:"operation-contract",module:"agdf_prepare/presentation.prepare"}); text(r);'), true);
  assert.equal(pureInspectWrapper('text(module.exports);'), false);
});

test('empty host catalog discovery cannot supply bindings or admit resource reads', async () => {
  const { parseCodexT4Trace, pureInspectWrapper } = await import('../lib/native-run.js');
  const listing = { id: 'metadata', type: 'mcp_tool_call', server: 'codex', tool: 'list_mcp_resources', arguments: {}, status: 'completed', result: { content: [{ type: 'text', text: '{"resources":[]}' }] } };
  const parse = item => parseCodexT4Trace([JSON.stringify({type:'item.completed',item}), JSON.stringify({type:'turn.completed'})].join('\n'));
  assert.deepEqual(parse(listing).detours, []); assert.equal(parse(listing).calls.length, 0); assert.equal(parse(listing).metadata_discovery.length, 1);
  const supplied = structuredClone(listing); supplied.result.content[0].text = '{"resources":[{"uri":"file:///control","presentation_id":"hidden"}]}';
  assert.deepEqual(parse(supplied).detours, ['unverified_resource_metadata']);
  assert.deepEqual(parse({ ...listing, arguments: { server: 'foreign' } }).detours, ['unverified_resource_metadata']);
  assert.equal(pureInspectWrapper('text(await tools.list_mcp_resources({}));'), true);
  assert.equal(pureInspectWrapper('text(await tools.read_mcp_resource({uri:"file:///control"}));'), false);
  assert.deepEqual(parse({ ...listing, tool: 'read_mcp_resource' }).detours, ['read_mcp_resource']);
});

test('Codex command qualification retains T4 boundaries and requires prior MCP bindings and one original approval', async () => {
  const { parseCodexCommandTrace, parseCodexT4Trace, strictCommandFlow, pureInspectWrapper } = await import('../lib/native-run.js');
  const binding = { target_id: 'sha256:' + 'a'.repeat(64), run_id: 'demo-run-01', expected_revision_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', presentation_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' };
  const input = { target_id: binding.target_id, run_id: binding.run_id, expected_revision_id: binding.expected_revision_id,
    operation_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: binding.presentation_id, response: 'Approval: UR' } } };
  const item = (id, tool, args, result) => ({ type: 'item.completed', item: { id, type: 'mcp_tool_call', server: 'agdf', tool, arguments: args, status: 'completed', result: { structuredContent: result } } });
  const read = item('read', 'agdf_inspect', { operation: 'operation-contract' }, { outcome: 'inspect_result', report: { binding } });
  const write = item('write', 'agdf_approve', input, { outcome: 'accepted', operation_id: input.operation_id, receipt: {} });
  const trace = rows => [...rows, { type: 'turn_context', payload: { model: 'gpt-6.1-sol', effort: 'low' } }, { type: 'turn.completed', usage: { input_tokens: 42, output_tokens: 7 } }].map(value => JSON.stringify(value)).join('\n');
  const parsed = parseCodexCommandTrace(trace([read, write]));
  assert.equal(strictCommandFlow({ parsed, binding }).success, true);
  const sdkRejected = { name: 'mcp__plugin_agdf_agdf__agdf_inspect', input: {}, result: { is_error: true, text: 'Input validation error: missing operation' } };
  assert.equal(strictCommandFlow({ parsed: { ...parsed, calls: [sdkRejected, ...parsed.calls] }, binding }).success, true, 'observed SDK rejections remain counted and may be corrected');
  assert.equal(strictCommandFlow({ parsed: { ...parsed, calls: [{ ...sdkRejected, result: { is_error: true, text: 'unreadable executor failure' } }, ...parsed.calls] }, binding }).reason, 'unreadable_domain_result');
  assert.deepEqual(parsed.observed_efforts, ['low']);
  assert.equal(strictCommandFlow({ parsed: parseCodexCommandTrace(trace([write])), binding }).reason, 'bindings_not_retrieved_through_mcp');
  assert.equal(strictCommandFlow({ parsed: parseCodexCommandTrace(trace([read, write, { ...write, item: { ...write.item, id: 'duplicate' } }])), binding }).reason, 'expected_one_approval');
  const wrong = structuredClone(write); wrong.item.arguments.command.payload.presentation_id = 'foreign';
  assert.equal(strictCommandFlow({ parsed: parseCodexCommandTrace(trace([read, wrong])), binding }).success, false);
  assert.ok(parseCodexT4Trace(trace([read, write])).detours.includes('agdf_approve'), 'T4 does not gain a writer');
  assert.equal(pureInspectWrapper('text(await tools.mcp__agdf__agdf_approve({}));'), false);
  const promiseWrapper = 'text(await tools.mcp__agdf__agdf_inspect({...load("b"),operation:"operation-contract",module:"agdf_prepare/presentation.prepare"}).then(r=>r.structuredContent||r));';
  assert.equal(pureInspectWrapper(promiseWrapper), true, 'observed local Promise projection is not a tool detour');
  assert.equal(pureInspectWrapper('text(await tools.mcp__agdf__agdf_inspect({}).then(r=>process.exit(1)));'), false);
  const shell = item('shell', 'exec_command', {}, {});
  assert.equal(strictCommandFlow({ parsed: parseCodexCommandTrace(trace([read, write, shell])), binding }).success, false);
});
