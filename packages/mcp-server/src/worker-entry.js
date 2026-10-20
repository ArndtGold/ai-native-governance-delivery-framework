import { parentPort, workerData } from "node:worker_threads";
import { createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";

function send(message) {
  parentPort?.postMessage(message);
}

let runtime, phase = 'setup';
try {
  send({ type: 'phase', phase: 'runtime_provenance' });
  runtime = createMcpDispatchRuntime({ surface: workerData.surface, ...(workerData.commandGroups !== undefined ? { commandGroups: workerData.commandGroups } : {}) });
  if (runtime.trustedContext.provenanceStatus !== "matched") {
    send({ type: "failure", code: "runtime_provenance_invalid", dispatch: "not_dispatched" });
  } else if (runtime.trustedContext.expectedVersion !== workerData.expectedVersion) {
    send({ type: "failure", code: "runtime_version_mismatch", dispatch: "not_dispatched" });
  } else {
    const tool = workerData.toolName ? runtime.tool(workerData.toolName) : runtime.tool(runtime.definition.name);
    if (!tool) {
      send({ type: "failure", code: "dispatch_worker_failed", dispatch: "not_dispatched" });
    } else {
      phase = 'parse';
      const parsed = tool.parse(workerData.argumentsValue);
      phase = 'execute';
      send({ type: 'phase', phase: 'operation' });
      const result = await tool.execute(parsed);
      send({ type: 'phase', phase: 'result' });
      send({ type: "result", result });
    }
  }
} catch (error) {
  const facts = runtime?.normalizeFailure(error, { phase }) ?? { code: 'dispatch_worker_failed', dispatch: 'not_dispatched' };
  send({ type: 'failure', ...facts });
}
