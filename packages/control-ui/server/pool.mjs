import { Worker } from 'node:worker_threads';
import { READ_LIMITS, ControlReadError } from '../../core/lib/control-read/snapshot.js';

export class ReadWorkerPool {
  constructor(root, { timeout = READ_LIMITS.timeout, workerURL = new URL('./read-worker.mjs', import.meta.url) } = {}) {
    this.root = root; this.timeout = timeout; this.workerURL = workerURL;
    this.worker = null; this.active = null; this.waiting = null; this.closed = false; this.sequence = 0;
  }
  #spawn() {
    const env = { ...process.env }; delete env.AGDF_RUN_ID;
    const worker = new Worker(this.workerURL, { workerData: { root: this.root }, env, execArgv: [], resourceLimits: { maxOldGenerationSizeMb: 768 } });
    this.worker = worker;
    worker.on('message', ({ id, result, error }) => {
      if (this.worker !== worker || this.active?.id !== id) return;
      this.#finish(this.active, error ? new ControlReadError(error) : null, result);
    });
    worker.on('error', () => { if (this.worker === worker) this.#reset('read_failed'); });
    worker.on('exit', () => { if (this.worker === worker) this.#reset('read_failed'); });
  }
  #finish(job, error, result) {
    clearTimeout(job.timer); job.signal?.removeEventListener('abort', job.abort);
    if (this.active === job) this.active = null;
    if (this.waiting === job) this.waiting = null;
    error ? job.reject(error) : job.resolve(result);
    this.#pump();
  }
  #reset(code) {
    const worker = this.worker; this.worker = null;
    worker?.terminate();
    const current = this.active; this.active = null;
    if (current) this.#finish(current, new ControlReadError(code));
    else this.#pump();
  }
  #pump() {
    if (this.closed || this.active || !this.waiting) return;
    const job = this.waiting; this.waiting = null; this.active = job;
    if (!this.worker) this.#spawn();
    this.worker.postMessage({ id: job.id, ...job.request });
  }
  request(request, signal) {
    if (this.closed) return Promise.reject(new ControlReadError('read_failed'));
    if (this.active && this.waiting) return Promise.reject(new ControlReadError('busy'));
    if (signal?.aborted) return Promise.reject(new ControlReadError('cancelled'));
    return new Promise((resolve, reject) => {
      const job = { id: ++this.sequence, request, signal, resolve, reject };
      job.abort = () => {
        if (this.active === job) {
          // The bounded read finishes inside its deadline; retain the immutable view for other readers.
          job.reject(new ControlReadError('cancelled'));
        } else this.#finish(job, new ControlReadError('cancelled'));
      };
      job.timer = setTimeout(() => this.active === job ? this.#reset('timeout') : this.#finish(job, new ControlReadError('timeout')), this.timeout);
      signal?.addEventListener('abort', job.abort, { once: true });
      this.waiting = job; this.#pump();
    });
  }
  async close() {
    this.closed = true;
    for (const job of [this.active, this.waiting].filter(Boolean)) this.#finish(job, new ControlReadError('cancelled'));
    const worker = this.worker; this.worker = null; if (worker) await worker.terminate();
  }
}
