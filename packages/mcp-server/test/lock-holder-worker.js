// Test worker: forwards lock ownership with worker-entry.js's forwarder, then holds a run lock forever.
import { subscribe } from "node:diagnostics_channel";
import { parentPort, workerData } from "node:worker_threads";
import { OWNED_LOCK_CHANNEL, withOwnedFileLock } from "../../core/lib/control-state/run-state-writer.js";
import { ownedLockForwarder } from "../src/worker.js";

subscribe(OWNED_LOCK_CHANNEL, ownedLockForwarder(message => parentPort.postMessage(message)));
withOwnedFileLock(workerData.argumentsValue.path, () => {
  parentPort.postMessage({ type: "phase", phase: "operation" });
  for (;;) { /* A writer that never returns; only termination ends it. */ }
});
