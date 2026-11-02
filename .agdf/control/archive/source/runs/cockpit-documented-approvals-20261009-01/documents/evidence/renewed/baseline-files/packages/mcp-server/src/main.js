import * as dispatcherRuntime from "create-agdf/mcp-dispatch-runtime";
import { readFileSync } from "node:fs";
import process from "node:process";
import { createAgdfWorkerExecutor, serveAgdfStdio } from "./server.js";
import { loadCockpitResource } from './cockpit-resource.js';

export async function runMcpServer({ surface, cockpitDir, runtime, executor } = {}) {
  runtime ??= cockpitDir !== undefined ? await dispatcherRuntime.createMcpCockpitRuntime({ surface, cockpitDir }) : dispatcherRuntime.createMcpDispatchRuntime({ surface });
  const serverVersion = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
  if (runtime.trustedContext.expectedVersion !== serverVersion) {
    process.stderr.write("AGDF_MCP_VERSION_MISMATCH\n");
    process.exitCode = 1;
    return null;
  }
  if (runtime.trustedContext.provenanceStatus !== "matched") {
    process.stderr.write("AGDF_MCP_RUNTIME_PROVENANCE_INVALID\n");
    process.exitCode = 1;
    return null;
  }
  if (runtime.mode === 'cockpit') loadCockpitResource(runtime.ui);
  const dispatchExecutor = executor ?? (runtime.mode === 'cockpit' ? undefined : createAgdfWorkerExecutor(runtime));
  const handle = serveAgdfStdio({
    runtime,
    executor: dispatchExecutor,
    onerror(code) {
      process.stderr.write(`${code}\n`);
    },
  });
  const close = async () => {
    await handle.close();
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
  process.stdin.once("close", close);
  return handle;
}
