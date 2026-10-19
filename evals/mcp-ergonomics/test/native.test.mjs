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
