import { Worker } from "node:worker_threads";

const WORKER_URL = new URL("./worker-entry.js", import.meta.url);

export class DispatchExecutionError extends Error {
  constructor(code) {
    super(code);
    this.name = "DispatchExecutionError";
    this.code = code;
  }
}

export function createWorkerDispatchExecutor({
  surface,
  expectedVersion,
  timeoutMs = 10_000,
  WorkerClass = Worker,
} = {}) {
  let active = null;

  async function terminateActive() {
    const current = active;
    if (!current) return;
    await current.cancel();
  }

  return Object.freeze({
    async execute(argumentsValue, { signal } = {}) {
      if (active) throw new DispatchExecutionError("dispatch_busy");
      if (signal?.aborted) throw new DispatchExecutionError("dispatch_cancelled");

      return new Promise((resolve, reject) => {
        let settled = false;
        const worker = new WorkerClass(WORKER_URL, {
          workerData: { surface, expectedVersion, argumentsValue },
        });

        const finish = async (callback, value) => {
          if (settled) return;
          settled = true;
          const current = active;
          active = null;
          if (current) {
            clearTimeout(current.timer);
            current.cleanupSignal?.();
          }
          await worker.terminate().catch(() => {});
          callback(value);
        };

        const cancel = () => finish(reject, new DispatchExecutionError("dispatch_cancelled"));
        const cleanupSignal = signal
          ? () => signal.removeEventListener("abort", cancel)
          : null;
        signal?.addEventListener("abort", cancel, { once: true });

        const timer = setTimeout(
          () => finish(reject, new DispatchExecutionError("dispatch_timeout")),
          timeoutMs,
        );
        active = {
          worker,
          timer,
          cleanupSignal,
          cancel: () => finish(reject, new DispatchExecutionError("dispatch_cancelled")),
        };

        worker.once("message", (message) => {
          if (message?.type === "result") finish(resolve, message.result);
          else finish(reject, new DispatchExecutionError(message?.code ?? "dispatch_worker_failed"));
        });
        worker.once("error", () => finish(reject, new DispatchExecutionError("dispatch_worker_failed")));
        worker.once("exit", () => {
          if (!settled) finish(reject, new DispatchExecutionError("dispatch_worker_failed"));
        });
      });
    },
    close: terminateActive,
    get active() {
      return Boolean(active);
    },
  });
}
