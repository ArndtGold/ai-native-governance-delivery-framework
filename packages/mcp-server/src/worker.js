import { Worker } from "node:worker_threads";

const WORKER_URL = new URL("./worker-entry.js", import.meta.url);
const PHASES = new Set(['runtime_provenance', 'operation', 'result']);

export class DispatchExecutionError extends Error {
  constructor(code, dispatch = 'unknown', field) {
    super(code);
    this.name = "DispatchExecutionError";
    this.code = code;
    this.dispatch = dispatch;
    this.facts = { code, dispatch, ...(field ? { field } : {}) };
  }
}

export function createWorkerDispatchExecutor({
  surface, expectedVersion, commandGroups, timeoutMs = 10_000, WorkerClass = Worker,
  onEvent = () => {},
} = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) throw Error('dispatch_deadline_invalid');
  let active = null;
  const event = (phase, started) => {
    try { onEvent({ phase, elapsed_ms: performance.now() - started }); } catch {}
  };
  return Object.freeze({
    async execute(argumentsValue, { signal, toolName } = {}) {
      if (active) throw new DispatchExecutionError("dispatch_busy", 'not_dispatched');
      if (signal?.aborted) throw new DispatchExecutionError("dispatch_cancelled", 'not_dispatched');
      return new Promise((resolve, reject) => {
        let settled = false, exited = false, completion;
        const started = performance.now(), deadline = started + timeoutMs;
        let worker;
        try { worker = new WorkerClass(WORKER_URL, {
          workerData: { surface, expectedVersion, commandGroups, argumentsValue, toolName: toolName ?? null },
        }); } catch { reject(new DispatchExecutionError('dispatch_worker_failed', 'not_dispatched')); return; }
        event('worker_start', started);
        const current = { worker, timer: null, cleanupSignal: null, cancel: () => finish(reject, new DispatchExecutionError("dispatch_cancelled")) };
        active = current;
        const release = () => { if (active === current) active = null; };
        const finish = (callback, value) => {
          if (settled) return completion;
          settled = true;
          clearTimeout(current.timer);
          current.cleanupSignal?.();
          event('termination', started);
          completion = (async () => {
            let confirmationTimer;
            // Confirmation consumes the remaining request budget; it cannot add another full deadline.
            const bounded = new Promise(done => {
              confirmationTimer = setTimeout(() => done(false), Math.max(0, deadline - performance.now()));
            });
            let ending;
            try { ending = Promise.resolve(worker.terminate()).then(() => { exited = true; release(); return true; }, () => false); }
            catch { ending = Promise.resolve(false); }
            const confirmed = exited || await Promise.race([ending, bounded]);
            clearTimeout(confirmationTimer);
            if (confirmed) {
              release(); event('terminated', started); callback(value);
            } else {
              // A late actual exit may release capacity; rejection alone never proves termination.
              event('termination_unconfirmed', started);
              reject(new DispatchExecutionError('dispatch_worker_termination_unconfirmed'));
            }
          })();
          return completion;
        };
        const cancel = () => finish(reject, new DispatchExecutionError("dispatch_cancelled"));
        if (signal) {
          current.cleanupSignal = () => signal.removeEventListener("abort", cancel);
          signal.addEventListener("abort", cancel, { once: true });
        }
        current.timer = setTimeout(() => finish(reject, new DispatchExecutionError("dispatch_timeout")), timeoutMs);
        worker.on("message", message => {
          if (settled) return;
          if (message?.type === 'phase') {
            if (PHASES.has(message.phase)) event(message.phase, started);
          } else if (message?.type === "result") finish(resolve, message.result);
          else if (message?.type === 'failure') finish(reject, new DispatchExecutionError(message.code, message.dispatch, message.field));
          else finish(reject, new DispatchExecutionError('dispatch_worker_failed'));
        });
        worker.once("error", () => finish(reject, new DispatchExecutionError("dispatch_worker_failed")));
        worker.once("exit", () => {
          exited = true;
          if (settled) release();
          else finish(reject, new DispatchExecutionError("dispatch_worker_failed"));
        });
        // Cover an abort racing listener installation.
        if (signal?.aborted) cancel();
      });
    },
    async close() { await active?.cancel(); },
    get active() { return Boolean(active); },
  });
}
