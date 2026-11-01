import { Worker } from "node:worker_threads";

const WORKER_URL = new URL("./worker-entry.js", import.meta.url);
const PHASES = new Set(['runtime_provenance', 'operation', 'result']);

export class DispatchExecutionError extends Error {
  constructor(code, dispatch = 'unknown', field, { cause_code, worker_phase } = {}) {
    super(code);
    this.name = "DispatchExecutionError";
    this.code = code;
    this.dispatch = dispatch;
    this.facts = { code, dispatch, ...(field ? { field } : {}),
      ...(cause_code ? { cause_code } : {}), ...(worker_phase ? { worker_phase } : {}) };
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
  // The request budget includes both execution and confirmed worker shutdown.
  // Reserve up to one second instead of beginning shutdown at the deadline.
  const terminationReserveMs = Math.min(1_000, Math.max(1, Math.floor(timeoutMs / 4)));
  let active = null;
  let closed = false;
  const waiting = [];
  const rejectWaiting = error => { for (const job of waiting.splice(0)) { job.cleanup(); job.reject(error); } };
  const drain = () => {
    if (active || closed || !waiting.length) return;
    const job = waiting.shift(); job.cleanup();
    execute(job.argumentsValue, { ...job.options, deadline: job.deadline }).then(job.resolve, job.reject).finally(drain);
  };
  const event = (phase, started) => {
    try { onEvent({ phase, elapsed_ms: performance.now() - started }); } catch {}
  };
  const execute = async (argumentsValue, { signal, toolName, trusted, deadline: queuedDeadline } = {}) => {
      if (active) throw new DispatchExecutionError("dispatch_busy", 'not_dispatched');
      if (signal?.aborted) throw new DispatchExecutionError("dispatch_cancelled", 'not_dispatched');
      return new Promise((resolve, reject) => {
        let settled = false, exited = false, completion, workerPhase = 'worker_start';
        let confirmExit;
        const actualExit = new Promise(resolve => { confirmExit = resolve; });
        const started = performance.now(), deadline = queuedDeadline ?? started + timeoutMs;
        const budget = deadline - started;
        if (budget <= 0) { reject(new DispatchExecutionError('dispatch_timeout', 'not_dispatched')); return; }
        let worker;
        try { worker = new WorkerClass(WORKER_URL, {
          workerData: { surface, expectedVersion, commandGroups, argumentsValue, toolName: toolName ?? null, materialGrants: trusted?.materialGrants, inputContext: trusted?.inputContext },
        }); } catch { reject(new DispatchExecutionError('dispatch_worker_failed', 'not_dispatched')); return; }
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
        const release = () => { releaseHeldLocks(); if (active === current) { active = null; queueMicrotask(drain); } };
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
            try { ending = exited ? actualExit : Promise.resolve(worker.terminate()).then(() => {
              exited = true; release(); return true;
            }, () => actualExit); }
            catch { ending = actualExit; }
            const confirmed = exited || await Promise.race([ending, actualExit, bounded]);
            clearTimeout(confirmationTimer);
            if (confirmed) {
              release(); event('terminated', started); callback(value);
            } else {
              // A late actual exit may release capacity; rejection alone never proves termination.
              event('termination_unconfirmed', started);
              current.unconfirmed = true;
              rejectWaiting(new DispatchExecutionError('dispatch_busy', 'not_dispatched'));
              reject(new DispatchExecutionError('dispatch_worker_termination_unconfirmed', 'unknown', undefined, {
                ...(callback === reject && value instanceof DispatchExecutionError ? { cause_code: value.code } : {}),
                worker_phase: workerPhase,
              }));
            }
          })();
          return completion;
        };
        const cancel = () => finish(reject, new DispatchExecutionError("dispatch_cancelled"));
        if (signal) {
          current.cleanupSignal = () => signal.removeEventListener("abort", cancel);
          signal.addEventListener("abort", cancel, { once: true });
        }
        current.timer = setTimeout(() => finish(reject, new DispatchExecutionError("dispatch_timeout")),
          budget - Math.min(terminationReserveMs, Math.max(1, Math.floor(budget / 4))));
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
            if (PHASES.has(message.phase)) { workerPhase = message.phase; event(message.phase, started); }
          } else if (message?.type === "result") { workerPhase = 'result'; finish(resolve, message.result); }
          else if (message?.type === 'failure') finish(reject, new DispatchExecutionError(message.code, message.dispatch, message.field));
          else finish(reject, new DispatchExecutionError('dispatch_worker_failed'));
        });
        worker.once("error", () => finish(reject, new DispatchExecutionError("dispatch_worker_failed")));
        worker.once("exit", () => {
          exited = true;
          confirmExit(true);
          if (settled) release();
          else finish(reject, new DispatchExecutionError("dispatch_worker_failed"));
        });
        // Cover an abort racing listener installation.
        if (signal?.aborted) cancel();
      });
    };
  return Object.freeze({
    execute(argumentsValue, options = {}) {
      if (closed) return Promise.reject(new DispatchExecutionError(active ? 'dispatch_busy' : 'dispatch_cancelled', 'not_dispatched'));
      if (options.signal?.aborted) return Promise.reject(new DispatchExecutionError('dispatch_cancelled', 'not_dispatched'));
      const deadline = performance.now() + timeoutMs;
      if (!active && !waiting.length) return execute(argumentsValue, { ...options, deadline });
      // Only immutable Inspect requests wait. Commands still report contention;
      // no write is replayed, parallelized or admitted after unknown termination.
      if (options.toolName !== 'agdf_inspect' || active?.unconfirmed)
        return Promise.reject(new DispatchExecutionError('dispatch_busy', 'not_dispatched'));
      if (waiting.length >= 8) return Promise.reject(new DispatchExecutionError('resource_limit', 'not_dispatched'));
      return new Promise((resolve, reject) => {
        const job = { argumentsValue, options, deadline, resolve, reject };
        const remove = error => {
          const index = waiting.indexOf(job);
          if (index < 0) return;
          waiting.splice(index, 1); job.cleanup(); reject(error);
        };
        const abort = () => remove(new DispatchExecutionError('dispatch_cancelled', 'not_dispatched'));
        const timer = setTimeout(() => remove(new DispatchExecutionError('dispatch_timeout', 'not_dispatched')), timeoutMs);
        job.cleanup = () => { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); };
        waiting.push(job); options.signal?.addEventListener('abort', abort, { once: true });
        if (options.signal?.aborted) abort();
      });
    },
    async close() { closed = true; rejectWaiting(new DispatchExecutionError('dispatch_cancelled', 'not_dispatched')); await active?.cancel(); },
    get active() { return Boolean(active); },
  });
}

export function createAgdfWorkerExecutor(runtime, options = {}) {
  return createWorkerDispatchExecutor({
    surface: runtime.trustedContext.surface,
    expectedVersion: runtime.trustedContext.expectedVersion,
    commandGroups: runtime.trustedContext.commandGroups,
    ...options,
  });
}
