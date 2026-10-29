import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { aggregateNative, compareNative, compareProtocol, compareToolCaptures } from "../lib/aggregate.js";
import { claudeProjectSlug, redactionViolations, sanitizeTranscript } from "../lib/redaction.js";
import { loadMatrix, resolveTemplate } from "../lib/protocol-run.js";
import { promote } from "../../scripts/compare-mcp-ergonomics.js";
import { RUN_COMMAND_GROUPS } from '../../../packages/core/lib/control-state/run-command-contract.js';

const row = (id, bytes, extra = {}) => ({ id, tool: "agdf_inspect", call_class: "valid", class: "ok", outcome: "inspect_result", is_error: false,
  failure_without_isError: false, text_bytes: bytes, structured_bytes: bytes, est_tokens: Math.ceil(bytes / 4), latency_ms: { median: 1, p95: 2, samples: [1] }, ...extra });
const protocol = calls => ({ schema_version: "1", matrix_version: "v1", executions_per_call: 5, calls,
  tools: { agdf: { names: ["agdf_inspect"], total_definition_bytes: 10, metrics: [{ tool: "agdf_inspect", definition_bytes: 10, params_total: 1, params_documented: 0,
    documented_share: 0, description_chars: 5, has_output_schema: true, has_title: false, annotations: { readOnlyHint: true } }] } },
  summary: { classes: { ok: calls.length, sdk_validation: 0, agdf_failure: 0, tool_error_other: 0, protocol_error: 0, failure_without_isError: 0, total: calls.length } },
  provenance: { agdf_version: "0.14.5", git_commit: "abc", server_digest: "s", dispatcher_digest: "d", sdk_digest: "k", platform: "win32-x64", node: "v22", protocol: "2026-07-28", recorded_at: "2026-10-16T00:00:00Z" } });

test("protocol compare is exact for non-timing metrics and ignores latency (SCN-005)", () => {
  const base = protocol([row("I-1", 100)]);
  assert.equal(compareProtocol(base, protocol([row("I-1", 100, { latency_ms: { median: 99, p95: 99, samples: [99] } })])).status, "unchanged");
  const changed = compareProtocol(base, protocol([row("I-1", 101)]));
  assert.equal(changed.status, "changed");
  assert.deepEqual(changed.differences.map(entry => entry.field), ["text_bytes", "structured_bytes", "est_tokens"]);
  assert.equal(compareProtocol(base, protocol([])).status, "changed");
  // Per-tool metrics count even when the total definition bytes stay the same.
  const flipped = protocol([row("I-1", 100)]);
  flipped.tools.agdf.metrics[0] = { ...flipped.tools.agdf.metrics[0], annotations: { readOnlyHint: false }, has_title: true };
  assert.deepEqual(compareProtocol(base, flipped).differences.map(entry => entry.field), ["has_title", "annotations"]);
  const missingTool = protocol([row("I-1", 100)]);
  missingTool.tools.agdf.metrics = [];
  assert.deepEqual(compareProtocol(base, missingTool).differences.map(entry => entry.field), ["presence"]);
});

test("native compare uses the recorded range and marks missing cells", () => {
  const sessions = values => values.map((cost, index) => ({ model: "m", variant: "mcp_only", task: "T1", repetition: index + 1, status: "measured", success: true,
    tool_calls: { agdf_inspect: 2 }, invalid_argument_calls: 0, is_error_results: 0, agdf_failure_results: 0, agdf_shell_calls: 0, response_tokens: { agdf_inspect: 10 },
    total_tokens: 100, cost_usd: cost, wall_time_ms: 1000 }));
  const base = aggregateNative(sessions([0.2, 0.4]));
  assert.deepEqual(base["m|mcp_only|T1"].metrics.cost_usd, { values: [0.2, 0.4], min: 0.2, max: 0.4 });
  assert.equal(compareNative(base, aggregateNative(sessions([0.3]))).status, "unchanged");
  assert.equal(compareNative(base, aggregateNative(sessions([0.9]))).status, "changed");
  assert.ok(compareNative(base, {}).not_comparable > 0);
  // Nothing comparable is no evidence of "unchanged".
  assert.equal(compareNative(base, {}).status, "incomplete");
  assert.equal(compareNative({}, {}).status, "incomplete");
  assert.equal(compareNative(base, aggregateNative(sessions([0.3]).map(session => ({ ...session, status: "aborted" })))).status, "incomplete");
});

test("re-evaluation changes only transcript-determined verdicts and refuses transcripts with evidence writes", async () => {
  const { reevaluate } = await import("../../scripts/reevaluate-mcp-ergonomics-native.js");
  const stream = events => events.map(event => JSON.stringify(event)).join("\n");
  const inspectOnly = stream([{ type: "assistant", message: { content: [{ type: "tool_use", id: "a", name: "mcp__plugin_agdf_agdf__agdf_inspect", input: {} }] } }]);
  const withWrite = stream([{ type: "assistant", message: { content: [{ type: "tool_use", id: "b", name: "mcp__plugin_agdf_agdf__agdf_record", input: {} }] } }]);
  const session = (task, transcript) => ({ model: "m", variant: "mcp_only", task, repetition: 1, status: "measured", success: true, transcript });
  const native = { schedule: { sessions: [session("T6", "t6"), session("T1", "t1")] } };
  const result = reevaluate(native, { tasks: ["T6"], read: path => ({ t6: inspectOnly, t1: inspectOnly })[path] });
  assert.deepEqual(result.schedule.sessions.map(entry => entry.success), [false, true]);
  assert.equal(result.reevaluation.changes.length, 1);
  assert.throws(() => reevaluate(native, { tasks: ["T6"], read: () => withWrite }), /re-run instead/u);
});

test("the report states a failed or empty native run instead of claiming full measurement", async () => {
  const { assembleBaseline, renderReport } = await import("../lib/report.js");
  const findingsMap = JSON.parse(readFileSync(new URL("../findings-map.v1.json", import.meta.url), "utf8"));
  const config = { models: ["m"], variants: ["mcp_only"], tasks: ["T1"], repetitions: 2, cap_usd: 25 };
  const failed = renderReport(assembleBaseline({ protocol: protocol([row("I-1", 100)]), native: { config, error: "install failed", isolation: { ok: true, changed: [] } }, findingsMap }));
  assert.match(failed, /The native run failed: install failed/u);
  assert.doesNotMatch(failed, /All planned sessions were measured/u);
  assert.match(failed, /cost cap 25 USD/u);
  const partial = { config, isolation: { ok: true, changed: [] }, schedule: { consumed_usd: 0.1, cap_usd: 25, cap_reached: false,
    sessions: [{ model: "m", variant: "mcp_only", task: "T1", repetition: 1, status: "measured", success: true, cost_usd: 0.1,
      mcp_check: { connected: true, attempts: [{ status: "connected", ms: 10 }], launcher_probe: { stderr: "free text" } } }] } };
  const baseline = assembleBaseline({ protocol: protocol([row("I-1", 100)]), native: partial, findingsMap });
  assert.match(renderReport(baseline), /1 of 2 planned sessions were recorded and measured/u);
  assert.deepEqual(baseline.native.sessions[0].mcp_check, { connected: true, attempts: [{ status: "connected", ms: 10 }] });
});

test("tool captures must be byte-identical (SCN-023)", () => {
  const capture = definition => ({ servers: { agdf: { names: ["agdf_inspect"], definitions: { agdf_inspect: definition } } } });
  assert.equal(compareToolCaptures(capture("{}"), capture("{}")).identical, true);
  assert.deepEqual(compareToolCaptures(capture("{}"), capture('{"x":1}')).differences, ["agdf:agdf_inspect"]);
});

test("redaction check fails closed on local paths and credential patterns (SCN-015/016)", () => {
  assert.deepEqual(redactionViolations('{"a":"<FIXTURE>/x","b":"safe"}'), []);
  assert.ok(redactionViolations("C:\\Users\\someone\\file").includes("windows_absolute_path"));
  assert.ok(redactionViolations('"path":"C:\\\\Temp\\\\x"').includes("windows_absolute_path"));
  assert.ok(redactionViolations("/Users/someone/x").includes("posix_home_path"));
  assert.ok(redactionViolations('{"accessToken":"x"}').includes("credential_field"));
  assert.ok(redactionViolations("sk-ant-abcdefghijkl").includes("anthropic_key"));
  // Shapes free-text fields can carry (review findings).
  assert.ok(redactionViolations(JSON.stringify(JSON.stringify({ diag: "D:\\agents\\x" }))).includes("windows_absolute_path"));
  assert.ok(redactionViolations('"cd /c/Workspace/repo && ls"').includes("git_bash_drive_path"));
  assert.ok(redactionViolations("mkdtemp /tmp/agdf-x failed").includes("posix_temp_path"));
  assert.ok(redactionViolations("/var/folders/ab/T/x").includes("posix_temp_path"));
  assert.ok(redactionViolations('"\\\\\\\\server\\\\share"').includes("unc_path"));
  assert.ok(redactionViolations("owner jane.doe@example.org").includes("email_address"));
  assert.ok(redactionViolations('{"mcp__claude_ai_Example__search":1}').includes("connector_name"));
  assert.ok(redactionViolations("server claude.ai Example Org").includes("connector_name"));
  // The promoted baseline and report stay clean.
  for (const file of ["baseline.json", "REPORT.md"]) {
    assert.deepEqual(redactionViolations(readFileSync(new URL(`../baselines/2026-10-16-win32-x64/${file}`, import.meta.url), "utf8")), [], file);
  }
});

test("transcripts lose connector names and tool prefixes but keep AGDF servers", () => {
  const init = { type: "system", subtype: "init", mcp_servers: [{ name: "plugin:agdf:agdf", status: "connected" }, { name: "claude.ai Example Org", status: "connected" }],
    tools: ["mcp__plugin_agdf_agdf__agdf_inspect", "mcp__claude_ai_Example_Org__search"], cwd: "C:\\fx\\repo" };
  const stdout = [JSON.stringify(init), JSON.stringify({ type: "user", text: "see mcp__claude_ai_Example_Org__search" })].join("\n");
  // JSON.stringify escapes the backslash, so the transcript holds C:\\fx.
  const text = sanitizeTranscript(stdout, value => value.replaceAll("C:\\\\fx", "<FIXTURE>"));
  assert.doesNotMatch(text, /Example/u);
  assert.match(text, /mcp__<CONNECTOR-1>__search/u);
  assert.match(text, /"name":"<CONNECTOR-1>"/u);
  assert.match(text, /plugin:agdf:agdf/u);
  assert.match(text, /<FIXTURE>/u);
  assert.equal(claudeProjectSlug("C:\\Users\\a.b\\x_y"), "C--Users-a-b-x-y");
  assert.equal(sanitizeTranscript("Owner: Jane Example", undefined, { identities: ["Jane Example"] }), "Owner: <IDENTITY>");
  assert.equal(sanitizeTranscript(text), text, "cleaning twice changes nothing");
});

test("promote writes baseline and report only for clean input (SCN-016, SCN-021/022)", () => {
  const out = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-promote-"));
  try {
    const clean = promote({ protocol: protocol([row("I-1", 100)]), native: null, out });
    assert.equal(clean.promoted, true);
    const report = readFileSync(join(out, "REPORT.md"), "utf8");
    for (const id of ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12"]) assert.match(report, new RegExp(`\\| ${id} \\|`, "u"));
    const baseline = JSON.parse(readFileSync(join(out, "baseline.json"), "utf8"));
    for (const field of ["agdf_version", "git_commit", "server_digest", "dispatcher_digest", "sdk_digest", "platform", "node", "recorded_at"]) {
      assert.ok(baseline.provenance.protocol[field], field);
    }
    const withTranscript = promote({ protocol: protocol([row("I-1", 100)]), native: { complete: true, config: { models: ["m"], variants: ["mcp_only"], repetitions: 1 },
      schedule: { sessions: [{ model: "m", variant: "mcp_only", task: "T1", repetition: 1, status: "measured", success: true, cost_usd: 0.1,
        transcript: "probe-results/x/native-transcripts/1-T1-mcp_only-m.jsonl", stderr: "x" }] } }, out });
    assert.equal(withTranscript.promoted, true);
    const stored = readFileSync(join(out, "baseline.json"), "utf8");
    assert.doesNotMatch(stored, /transcript|probe-results/u);
    const dirty = promote({ protocol: protocol([row("I-1", 100)]), native: { schedule: { sessions: [] }, error: "failed at C:\\Users\\someone\\x", config: { models: [], variants: [], repetitions: 2 } }, out });
    assert.equal(dirty.promoted, false);
    assert.ok(dirty.violations.includes("windows_absolute_path"));
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("findings map covers the twelve review findings with a metric or a reason (SCN-021)", () => {
  const map = JSON.parse(readFileSync(new URL("../findings-map.v1.json", import.meta.url), "utf8"));
  assert.deepEqual(map.findings.map(entry => entry.id), ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12"]);
  for (const entry of map.findings) assert.ok(entry.metrics.length || entry.not_measurable, entry.id);
});

test("call matrix covers valid, schema-invalid and semantic calls for every canonical MCP command group (SCN-001)", () => {
  const matrix = loadMatrix();
  const tools = ['agdf_dispatch', 'agdf_inspect', ...Object.keys(RUN_COMMAND_GROUPS)];
  for (const tool of tools) {
    const classes = new Set(matrix.calls.filter(entry => entry.tool === tool).map(entry => entry.call_class));
    assert.deepEqual([...classes].sort(), ["schema_invalid", "semantic_failure", "valid"], tool);
  }
  assert.ok(matrix.calls.some(entry => entry.server === "cockpit_without_ui") && matrix.calls.some(entry => entry.server === "cockpit_with_ui"));
  assert.equal(new Set(matrix.calls.map(entry => entry.id)).size, matrix.calls.length);
  assert.equal(resolveTemplate({ a: "${root}", b: "x-${run_id}" }, { root: "R", run_id: "r1" }).b, "x-r1");
  assert.throws(() => resolveTemplate("${missing}", {}), /placeholder unavailable/u);
});
