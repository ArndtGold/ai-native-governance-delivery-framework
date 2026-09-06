import { parentPort, workerData } from "node:worker_threads";
import { createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";

function send(message) {
  parentPort?.postMessage(message);
}

try {
  const runtime = createMcpDispatchRuntime({ surface: workerData.surface });
  if (runtime.trustedContext.provenanceStatus !== "matched") {
    send({ type: "failure", code: "runtime_provenance_invalid" });
  } else if (runtime.trustedContext.expectedVersion !== workerData.expectedVersion) {
    send({ type: "failure", code: "runtime_version_mismatch" });
  } else {
    const input = runtime.parse(workerData.argumentsValue);
    send({ type: "result", result: runtime.execute(input) });
  }
} catch {
  send({ type: "failure", code: "dispatch_worker_failed" });
}
