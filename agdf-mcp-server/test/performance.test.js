import assert from "node:assert/strict";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient } from "./helpers.js";

const RUNS = 20;
const p95 = (samples) => [...samples].sort((left, right) => left - right)[Math.ceil(samples.length * 0.95) - 1];
const milliseconds = (started) => Number(process.hrtime.bigint() - started) / 1_000_000;
const fixture = createOwnedRuntimeFixture();
const resolvedArguments = Object.freeze({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: fixture.governanceTarget,
  target_source: "current_repository",
  primary_target: fixture.governanceTarget,
  run_id: "agdf-mcp-dispatch-server",
});
const cold = [];
const warm = [];
try {
  for (let index = 0; index < RUNS; index += 1) {
    const started = process.hrtime.bigint();
    await withStdioClient(fixture, async (client) => {
      const result = await client.listTools();
      assert.deepEqual(result.tools.map((tool) => tool.name), ["agdf_dispatch"]);
      cold.push(milliseconds(started));
    });
  }

  await withStdioClient(fixture, async (client) => {
    for (let index = 0; index < RUNS; index += 1) {
      const started = process.hrtime.bigint();
      const result = await client.callTool({ name: "agdf_dispatch", arguments: resolvedArguments });
      warm.push(milliseconds(started));
      assert.equal(result.structuredContent.outcome, "control_result");
      assert.ok(Buffer.byteLength(result.content[0].text, "utf8") <= 1024 * 1024);
    }
  });

  const evidence = {
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    runs: RUNS,
    cold_tools_list_ms: cold.map((value) => Math.round(value * 1000) / 1000),
    cold_p95_ms: Math.round(p95(cold) * 1000) / 1000,
    warm_dispatch_ms: warm.map((value) => Math.round(value * 1000) / 1000),
    warm_p95_ms: Math.round(p95(warm) * 1000) / 1000,
  };
  console.log(JSON.stringify(evidence));
  assert.ok(p95(cold) <= 1_500, `cold tools/list p95 exceeded 1500 ms: ${p95(cold)}`);
  assert.ok(p95(warm) <= 1_000, `warm dispatch p95 exceeded 1000 ms: ${p95(warm)}`);
} finally {
  fixture.dispose();
}
