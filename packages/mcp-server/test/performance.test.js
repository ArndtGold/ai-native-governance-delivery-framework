import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { cpus, loadavg } from 'node:os';
import { pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient } from "./helpers.js";

const RUNS = 20;
const RUN_ID = "agdf-mcp-dispatch-server";
const p95 = (samples) => [...samples].sort((left, right) => left - right)[Math.ceil(samples.length * 0.95) - 1];
const milliseconds = (started) => Number(process.hrtime.bigint() - started) / 1_000_000;
// The budgets are measured on a fixed control, not on the repository's growing run history (SD AD-15).
const fixture = createOwnedRuntimeFixture({ controlRuns: [RUN_ID], pluginSourceRoot: process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT ?? pluginRoot });
const control = join(fixture.governanceTarget, ".agdf", "control");
const resolvedArguments = Object.freeze({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: fixture.governanceTarget,
  target_source: "current_repository",
  primary_target: fixture.governanceTarget,
  run_id: RUN_ID,
});
const cold = [];
const warm = [];
const coldPhases = [];
const cpuTimes = () => cpus().reduce((sum, cpu) => ({ idle: sum.idle + cpu.times.idle,
  total: sum.total + Object.values(cpu.times).reduce((a, b) => a + b, 0) }), { idle: 0, total: 0 });
try {
  assert.deepEqual(readdirSync(join(control, "runs")), [RUN_ID]);
  assert.deepEqual(readdirSync(join(control, "artefacts")), [RUN_ID]);
  assert.equal(existsSync(join(control, "AGDF_RUN.md")), false);
  const controlFiles = readdirSync(control, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  const controlBytes = controlFiles.reduce((total, entry) => total + statSync(join(entry.parentPath, entry.name)).size, 0);
  for (let index = 0; index < RUNS; index += 1) {
    const cpuBefore = cpuTimes(), loadBefore = loadavg();
    const started = process.hrtime.bigint();
    await withStdioClient(fixture, async (client) => {
      const initializedMs = milliseconds(started);
      const result = await client.listTools();
      assert.deepEqual(result.tools.map((tool) => tool.name), ["agdf_dispatch", "agdf_inspect", "agdf_project", "agdf_run", "agdf_prepare", "agdf_record", "agdf_approve", "agdf_revise", "agdf_closeout"]);
      cold.push(milliseconds(started));
      const cpuAfter = cpuTimes();
      coldPhases.push({ sample: index + 1, initialization_ms: initializedMs,
        tools_list_ms: cold.at(-1) - initializedMs, load_before: loadBefore, load_after: loadavg(),
        system_cpu_idle_percent: 100 * (cpuAfter.idle - cpuBefore.idle) / (cpuAfter.total - cpuBefore.total) });
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
    fixture: {
      control: "hermetic",
      control_runs: [RUN_ID],
      control_files: controlFiles.length,
      control_bytes: controlBytes,
    },
    cold_tools_list_ms: cold.map((value) => Math.round(value * 1000) / 1000),
    cold_p95_ms: Math.round(p95(cold) * 1000) / 1000,
    cold_phases: coldPhases,
    warm_dispatch_ms: warm.map((value) => Math.round(value * 1000) / 1000),
    warm_p95_ms: Math.round(p95(warm) * 1000) / 1000,
  };
  console.log(JSON.stringify(evidence));
  assert.ok(p95(cold) <= 1_500, `cold tools/list p95 exceeded 1500 ms: ${p95(cold)}`);
  assert.ok(p95(warm) <= 1_000, `warm dispatch p95 exceeded 1000 ms: ${p95(warm)}`);
} finally {
  fixture.dispose();
}
