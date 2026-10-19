import { Worker } from "node:worker_threads";

const WORKER_URL = new URL("./worker-entry.js", import.meta.url);
const PHASES = new Set(['runtime_provenance', 'operation', 'result']);

export class DispatchExecutionError extends Error {
  constructor(code, dispatch = 'unknown') {
    super(code);
    this.name = "DispatchExecutionError";
    this.code = code;
    this.dispatch = dispatch;
  }
}

// Forwards Core lock ownership announcements from a dispatch thread to its executor.
// Used by worker-entry.js; posting is synchronous, and Node drains posted messages
// before it emits the worker's exit event.
export function ownedLockForwarder(send) {
  return ({ phase, lock_path: lockPath, token }) => send({ type: 'lock', phase, lock_path: lockPath, token });
}

export function createWorkerDispatchExecutor({
  surface, expectedVersion, commandGroups, timeoutMs = 10_000, WorkerClass = Worker,
  onEvent = () => {}, releaseOwnedLock = null,
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
        const worker = new WorkerClass(WORKER_URL, {
          workerData: { surface, expectedVersion, commandGroups, argumentsValue, toolName: toolName ?? null },
        });
        event('worker_start', started);
        const current = { worker, timer: null, cleanupSignal: null, cancel: () => finish(reject, new DispatchExecutionError("dispatch_cancelled")) };
        active = current;
        // Locks this worker announced and has not reported released. Its thread shares the
        // server PID, so stale-lock recovery would treat them as live forever.
        const held = new Map();
        const releaseHeldLocks = () => {
          if (!held.size) return;
          let released = 0;
          for (const [token, lockPath] of held) {
            try { if (releaseOwnedLock?.(lockPath, token) === 'released') released++; } catch {}
          }
          held.clear();
          try { onEvent({ phase: 'locks_released', elapsed_ms: performance.now() - started, count: released }); } catch {}
        };
        // Called only after actual exit or confirmed termination: the thread no longer runs.
        const release = () => { releaseHeldLocks(); if (active === current) active = null; };
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
          // Lock messages also arrive after settlement while the worker drains.
          if (message?.type === 'lock') {
            if (typeof message.token === 'string' && typeof message.lock_path === 'string') {
              if (message.phase === 'intent') held.set(message.token, message.lock_path);
              else if (message.phase === 'released') held.delete(message.token);
            }
            return;
          }
          if (settled) return;
          if (message?.type === 'phase') {
            if (PHASES.has(message.phase)) event(message.phase, started);
          } else if (message?.type === "result") finish(resolve, message.result);
          else finish(reject, new DispatchExecutionError(message?.code ?? "dispatch_worker_failed"));
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
