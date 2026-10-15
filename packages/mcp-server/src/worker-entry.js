import { parentPort, workerData } from "node:worker_threads";
import { createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";

function send(message) {
  parentPort?.postMessage(message);
}

try {
  send({ type: 'phase', phase: 'runtime_provenance' });
  const runtime = createMcpDispatchRuntime({ surface: workerData.surface, ...(workerData.commandGroups !== undefined ? { commandGroups: workerData.commandGroups } : {}) });
  if (runtime.trustedContext.provenanceStatus !== "matched") {
    send({ type: "failure", code: "runtime_provenance_invalid" });
  } else if (runtime.trustedContext.expectedVersion !== workerData.expectedVersion) {
    send({ type: "failure", code: "runtime_version_mismatch" });
  } else {
    const tool = workerData.toolName ? runtime.tool(workerData.toolName) : runtime.tool(runtime.definition.name);
    if (!tool) {
      send({ type: "failure", code: "dispatch_worker_failed" });
    } else {
      send({ type: 'phase', phase: 'operation' });
      const result = tool.execute(tool.parse(workerData.argumentsValue));
      send({ type: 'phase', phase: 'result' });
      send({ type: "result", result });
    }
  }
} catch {
  send({ type: "failure", code: "dispatch_worker_failed" });
}
