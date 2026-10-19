import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { byteLength, estimateTokens, measureResult, median, normalizeText, percentile } from "../lib/normalize.js";
import { classifyCall, countClasses, SDK_INPUT_VALIDATION_PREFIX } from "../lib/classify.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

test("normalization replaces every root form and zeroes *_ms values", () => {
  const root = "C:\\Temp\\agdf-fixture-abc";
  const text = JSON.stringify({ a: root, b: root.replaceAll("\\", "/"), timing: { total_ms: 1234.567, input_ms: 3 }, keep_ms_text: "x_ms" });
  const normalized = normalizeText(text, [{ path: root, token: "<FIXTURE>" }]);
  assert.ok(!normalized.includes("agdf-fixture-abc"));
  assert.equal((normalized.match(/<FIXTURE>/gu) ?? []).length, 2);
  assert.match(normalized, /"total_ms":0/u);
  assert.match(normalized, /"input_ms":0/u);
  assert.match(normalized, /"keep_ms_text":"x_ms"/u);
  // A markdown table cell escapes the path once more before JSON encoding (D-SEM-UNRESOLVED-TARGET).
  const table = JSON.stringify({ text: `| Arbeitsordner | ${root.replaceAll("\\", "\\\\")} |` });
  assert.equal(normalizeText(table, [{ path: root, token: "<FIXTURE>" }]), JSON.stringify({ text: "| Arbeitsordner | <FIXTURE> |" }));
});

test("normalized bytes are independent of root length and timing digits", () => {
  const sample = (root, ms) => ({ content: [{ type: "text", text: JSON.stringify({ path: root, total_ms: ms }) }], structuredContent: { path: root } });
  const left = measureResult(sample("C:\\a\\fixture-1", 1.5), [{ path: "C:\\a\\fixture-1", token: "<F>" }]);
  const right = measureResult(sample("D:\\much\\longer\\fixture-path", 12345.678), [{ path: "D:\\much\\longer\\fixture-path", token: "<F>" }]);
  assert.deepEqual({ ...left, text_bytes_raw: 0 }, { ...right, text_bytes_raw: 0 });
  assert.notEqual(left.text_bytes_raw, right.text_bytes_raw);
});

test("token estimate rule and summary statistics", () => {
  assert.equal(estimateTokens(0), 0);
  assert.equal(estimateTokens(1), 1);
  assert.equal(estimateTokens(8), 2);
  assert.equal(estimateTokens(9), 3);
  assert.equal(byteLength("ä"), 2);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(percentile([1, 2, 3, 4, 5], 0.95), 5);
  assert.equal(median([]), null);
});

test("classification follows the written rule order", () => {
  const text = value => ({ content: [{ type: "text", text: value }] });
  assert.equal(classifyCall({ protocol_error: { code: -32602, message: "Tool x not found" } }).class, "protocol_error");
  assert.equal(classifyCall({ result: { ...text(`${SDK_INPUT_VALIDATION_PREFIX} Invalid arguments for tool agdf_inspect: ...`), isError: true } }).class, "sdk_validation");
  const failure = classifyCall({ result: { ...text("{}"), structuredContent: { outcome: "invalid_input" } } });
  assert.deepEqual([failure.class, failure.failure_without_isError], ["agdf_failure", true]);
  const flagged = classifyCall({ result: { ...text("{}"), structuredContent: { outcome: "rejected" }, isError: true } });
  assert.deepEqual([flagged.class, flagged.failure_without_isError], ["agdf_failure", false]);
  assert.equal(classifyCall({ result: { ...text(JSON.stringify({ outcome: "effect_unknown" })) } }).class, "agdf_failure");
  assert.equal(classifyCall({ result: { ...text("Output validation error: x"), isError: true } }).class, "tool_error_other");
  const cockpit = classifyCall({ result: { ...text("{}"), structuredContent: { state: "blocked", code: "resource_denied" } } });
  assert.deepEqual([cockpit.class, cockpit.outcome, cockpit.failure_without_isError], ["agdf_failure", "blocked:resource_denied", true]);
  assert.equal(classifyCall({ result: { ...text("{}"), structuredContent: { state: "available", code: null } } }).class, "ok");
  assert.equal(classifyCall({ result: { ...text("{}"), structuredContent: { outcome: "control_result" } } }).class, "ok");
  const counts = countClasses([failure, flagged, { class: "ok", failure_without_isError: false }]);
  assert.deepEqual([counts.agdf_failure, counts.ok, counts.failure_without_isError, counts.total], [2, 1, 1, 3]);
});

test("the pinned SDK input-validation text matches the installed MCP server SDK", () => {
  const dist = join(repoRoot, "packages", "mcp-server", "node_modules", "@modelcontextprotocol", "server", "dist");
  const sources = readdirSync(dist).filter(name => name.endsWith(".mjs")).map(name => readFileSync(join(dist, name), "utf8"));
  assert.ok(sources.some(source => source.includes("`Input validation error: Invalid arguments for tool ${")),
    "the SDK input-validation text changed; update classify.js and METRICS.md");
  assert.equal(SDK_INPUT_VALIDATION_PREFIX, "Input validation error:");
});

test("a failing fixture build leaves no temporary directory behind", async () => {
  const { tmpdir } = await import("node:os");
  const { runProtocolMatrix } = await import("../lib/protocol-run.js");
  const leftovers = () => readdirSync(tmpdir()).filter(name => /^agdf-mcp-ergonomics-(?:f2|scratch)-/u.test(name)).sort();
  const before = leftovers();
  const matrix = { executions_per_call: 1, calls: [{ id: "X-1", tool: "agdf_inspect", fixture: "F2" }, { id: "X-2", tool: "agdf_inspect", fixture: "F9" }] };
  await assert.rejects(runProtocolMatrix({ roots: [] }, { matrix }), /unknown fixture: F9/u);
  assert.deepEqual(leftovers(), before);
});
