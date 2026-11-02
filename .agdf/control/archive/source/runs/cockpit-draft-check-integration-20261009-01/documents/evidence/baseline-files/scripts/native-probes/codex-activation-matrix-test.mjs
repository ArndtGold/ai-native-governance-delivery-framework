import assert from "node:assert/strict";
import test from "node:test";
import { CASES, executeMatrix, grade, parseOptions, parseTranscript, selectRepeatJobs } from "./codex-activation-matrix.mjs";

test("adaptive mode starts with ten cases and repeats only selected or deviant first runs", () => {
  const options = parseOptions([]);
  assert.equal(options.mode, "adaptive");
  assert.equal(options.runs, null);
  const first = CASES.map((testCase) => ({ case_id: testCase.id, run: 1, ok: true, session_completed: true }));
  assert.equal(selectRepeatJobs(CASES, first).jobs.length, 0);

  first.find((row) => row.case_id === "D1").ok = false;
  const selected = selectRepeatJobs(CASES, first, ["D1", "A3"]);
  assert.deepEqual(selected.jobs.map((job) => `${job.testCase.id}-${job.index}`), ["A3-2", "A3-3", "D1-2", "D1-3"]);
  assert.deepEqual(selected.triggersByCase.D1, ["preselected_boundary", "first_run_deviation"]);
  assert.deepEqual(selected.triggersByCase.A3, ["preselected_boundary"]);
  assert.deepEqual(selected.triggersByCase.A1, []);
});

test("the actual scheduler completes all first runs before conditional repeats", async () => {
  const calls = [];
  const runCase = async (testCase, index) => {
    calls.push(`${testCase.id}-${index}`);
    await Promise.resolve();
    return { case_id: testCase.id, run: index, ok: !(testCase.id === "D1" && index === 1), session_completed: true };
  };
  const normal = await executeMatrix(CASES, { mode: "adaptive", concurrency: 3, repeatCases: [] },
    async (testCase, index) => ({ case_id: testCase.id, run: index, ok: true, session_completed: true }));
  assert.equal(normal.observations.length, 10);

  const result = await executeMatrix(CASES, { mode: "adaptive", concurrency: 3, repeatCases: ["A3"] }, runCase);
  assert.equal(result.observations.length, 14);
  assert.deepEqual(calls.slice(0, 10), CASES.map((testCase) => `${testCase.id}-1`));
  assert.deepEqual(calls.slice(10), ["A3-2", "A3-3", "D1-2", "D1-3"]);
  assert.deepEqual(result.triggersByCase.D1, ["first_run_deviation"]);

  const fixed = await executeMatrix(CASES, { mode: "fixed", runs: 3, concurrency: 2, repeatCases: [] }, runCase);
  assert.equal(fixed.observations.length, 30);
  assert.deepEqual(fixed.triggersByCase.D1, []);
});

test("fixed mode and boundary IDs are validated before host setup", () => {
  assert.deepEqual(parseOptions(["--runs", "3"]).mode, "fixed");
  assert.deepEqual(parseOptions(["--repeat-case", "A3", "--repeat-case", "A3"]).repeatCases, ["A3"]);
  assert.throws(() => parseOptions(["--repeat-case", "unknown"]), /Unknown --repeat-case ID/);
  assert.throws(() => parseOptions(["--runs", "3", "--repeat-case", "A3"]), /cannot be combined/);
  assert.throws(() => parseOptions(["--runs", "0"]), /--runs must/);
});

test("expected target_unresolved remains a separate target-binding observation", () => {
  const testCase = CASES.find((row) => row.id === "D1");
  const scored = grade(testCase, { calls: [{ tool: "agdf_dispatch", target_state: "unresolved" }] }, []);
  assert.deepEqual(scored, { activated: true, codeChanged: false, ok: true });
  const selected = selectRepeatJobs([testCase], [{ case_id: "D1", ok: scored.ok, session_completed: true }]);
  assert.deepEqual(selected.jobs, []);
});

test("JSONL parsing separates cached input and counts completed search calls once", () => {
  const lines = [
    { type: "item.started", item: { id: "item_1", type: "command_execution", command: "/bin/bash -lc 'rg --files && cat README.md'" } },
    { type: "item.completed", item: { id: "item_1", type: "command_execution", command: "/bin/bash -lc 'rg --files && cat README.md'" } },
    { type: "item.completed", item: { id: "item_1", type: "command_execution", command: "/bin/bash -lc 'rg --files && cat README.md'" } },
    { type: "item.completed", item: { id: "item_2", type: "command_execution", command: "/bin/bash -lc 'git status --short'" } },
    { type: "item.completed", item: { id: "item_3", type: "file_search" } },
    { type: "turn.completed", usage: { input_tokens: 100, cached_input_tokens: 80, output_tokens: 9 } },
  ];
  const result = parseTranscript(lines.map((line) => JSON.stringify(line)).join("\n"));
  assert.deepEqual(result.usage, { input_tokens: 100, cached_input_tokens: 80, non_cached_input_tokens: 20, output_tokens: 9 });
  assert.deepEqual(result.search, { file_search_calls: 1, shell_search_calls: 1, file_read_calls: 1 });
});

test("unavailable usage or search telemetry remains unknown", () => {
  const result = parseTranscript(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 20, output_tokens: 2 } }));
  assert.deepEqual(result.usage, { input_tokens: 20, cached_input_tokens: null, non_cached_input_tokens: null, output_tokens: 2 });
  assert.deepEqual(result.search, { file_search_calls: null, shell_search_calls: null, file_read_calls: null });
  const invalid = parseTranscript(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 2, cached_input_tokens: 3, output_tokens: 1 } }));
  assert.equal(invalid.usage.non_cached_input_tokens, null);
});
