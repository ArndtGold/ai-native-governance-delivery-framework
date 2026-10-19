// Protocol layer of the MCP ergonomics evaluation (evals/mcp-ergonomics/METRICS.md).
//   node evals/scripts/run-mcp-ergonomics-protocol.js [--out <file>] [--capture-tools <file>]
// Requires a current build (npm run build). --capture-tools writes only the normalized tools/list
// capture (TP T-002 / T-013); otherwise the full call matrix runs and writes protocol.json.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createProtocolRuntime, repoRoot, UI_CAPABILITIES, withAgdfClient } from "../mcp-ergonomics/lib/protocol-harness.js";
import { loadMatrix, protocolProvenance, runProtocolMatrix } from "../mcp-ergonomics/lib/protocol-run.js";
import { captureToolList, listAllTools } from "../mcp-ergonomics/lib/tools-list.js";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

export async function captureTools(runtime) {
  const empty = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-cockpit-"));
  try {
    const capture = {};
    await withAgdfClient(runtime, {}, async client => { capture.agdf = captureToolList(await listAllTools(client), runtime.roots); });
    await withAgdfClient(runtime, { cockpitDir: empty }, async client => {
      capture.agdf_cockpit_without_ui = captureToolList(await listAllTools(client), runtime.roots);
    });
    await withAgdfClient(runtime, { cockpitDir: empty, capabilities: UI_CAPABILITIES }, async client => {
      capture.agdf_cockpit_with_ui = captureToolList(await listAllTools(client), runtime.roots);
    });
    return capture;
  } finally { rmSync(empty, { recursive: true, force: true }); }
}

function write(target, value) {
  const path = resolve(repoRoot, target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return path;
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const runtime = createProtocolRuntime();
  try {
    const captureTarget = option("--capture-tools");
    if (captureTarget) {
      const capture = { schema_version: "1", kind: "agdf_mcp_tools_list_capture", surface: "claude", servers: await captureTools(runtime) };
      write(captureTarget, capture);
      process.stdout.write(`${JSON.stringify(Object.fromEntries(Object.entries(capture.servers).map(([name, value]) => [name, { tools: value.names, total_definition_bytes: value.total_definition_bytes }])), null, 2)}\n`);
    } else {
      const stamp = new Date().toISOString().replace(/[-:]/gu, "").replace(/\..+/u, "").replace("T", "-");
      const target = option("--out") ?? `probe-results/mcp-ergonomics-${stamp}/protocol.json`;
      const matrix = loadMatrix();
      const tools = await captureTools(runtime);
      const { rows, summary } = await runProtocolMatrix(runtime, { matrix });
      const output = { schema_version: "1", kind: "agdf_mcp_ergonomics_protocol", matrix_version: matrix.matrix_version,
        executions_per_call: matrix.executions_per_call, provenance: protocolProvenance(runtime),
        tools: Object.fromEntries(Object.entries(tools).map(([name, value]) => [name, { names: value.names, total_definition_bytes: value.total_definition_bytes, metrics: value.metrics }])),
        calls: rows, summary };
      const path = write(target, output);
      process.stdout.write(`${JSON.stringify({ written: path, calls: rows.length, classes: summary.classes }, null, 2)}\n`);
    }
  } finally { runtime.dispose(); }
}
