import { subscribe } from "node:diagnostics_channel";
import { parentPort, workerData } from "node:worker_threads";
import { OWNED_LOCK_CHANNEL, createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";
import { ownedLockForwarder } from "./worker.js";

function send(message) {
  parentPort?.postMessage(message);
}

// Forward lock ownership synchronously. If this thread is terminated while it holds
// a run lock, the executor releases exactly that lock after the thread has exited.
subscribe(OWNED_LOCK_CHANNEL, ownedLockForwarder(send));

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
