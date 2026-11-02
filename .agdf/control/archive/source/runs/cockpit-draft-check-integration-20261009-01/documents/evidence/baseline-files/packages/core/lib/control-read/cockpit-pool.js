import { Worker } from 'node:worker_threads';
import { READ_LIMITS, ControlReadError } from './snapshot.js';

export class ReadWorkerPool {
  constructor(root, { timeout = READ_LIMITS.timeout, workerURL = new URL('./cockpit-worker.js', import.meta.url),
    limits, maxOldGenerationSizeMb = 768 } = {}) {
    this.root = root; this.timeout = timeout; this.workerURL = workerURL;
    this.limits = limits; this.maxOldGenerationSizeMb = maxOldGenerationSizeMb;
    this.retiring = null; this.scope = null; this.changed = null; this.changeWaiter = null;
    this.worker = null; this.active = null; this.waiting = null; this.closed = false; this.sequence = 0;
  }
  #spawn() {
    const env = { ...process.env }; delete env.AGDF_RUN_ID;
    const worker = new Worker(this.workerURL, { workerData: { root: this.root, limits: this.limits }, env, execArgv: [],
      resourceLimits: { maxOldGenerationSizeMb: this.maxOldGenerationSizeMb } });
    this.worker = worker;
    worker.on('message', ({ id, result, error, changed }) => {
      if (this.worker !== worker) return;
      if (changed) {
        if (changed === this.scope?.snapshot_id) { this.changed = changed; this.changeWaiter?.finish(true); }
        return;
      }
      if (this.worker !== worker || this.active?.id !== id) return;
      if (!error && result?.snapshot_id && ['snapshot', 'run', 'backlog_titles', 'document', 'context'].includes(this.active.request.operation)) {
        this.scope = { ...result, data: null }; this.changed = null;
        this.changeWaiter?.reject(new ControlReadError('cancelled'));
      }
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
    this.scope = null; this.changed = null; this.changeWaiter?.reject(new ControlReadError(code));
    const worker = this.worker; this.worker = null;
    const retirement = Promise.resolve().then(() => worker?.terminate());
    this.retiring = retirement;
    void retirement.then(() => {
      if (this.retiring === retirement) { this.retiring = null; this.#pump(); }
    }, () => {
      // A failed teardown must not create another worker in the same slot.
      this.closed = true;
      if (this.waiting) this.#finish(this.waiting, new ControlReadError('read_failed'));
    });
    const current = this.active; this.active = null;
    if (current) this.#finish(current, new ControlReadError(code));
    else this.#pump();
  }
  #pump() {
    if (this.closed || this.retiring || this.active || !this.waiting) return;
    const job = this.waiting; this.waiting = null; this.active = job;
    try {
      if (!this.worker) this.#spawn();
      this.worker.postMessage({ id: job.id, ...job.request });
    } catch { this.#reset('read_failed'); }
  }
  request(request, signal) {
    if (this.closed) return Promise.reject(new ControlReadError('read_failed'));
    if (this.waiting) return Promise.reject(new ControlReadError('busy'));
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
  waitForChange(snapshot, signal, timeout = 8000) {
    if (this.closed || !snapshot || snapshot !== this.scope?.snapshot_id) return Promise.reject(new ControlReadError('resource_denied'));
    if (signal?.aborted) return Promise.reject(new ControlReadError('cancelled'));
    if (this.changeWaiter) return Promise.reject(new ControlReadError('busy'));
    const scope = this.scope;
    const envelope = changed => ({ ...scope, state: 'available', code: null, retryable: false, data: { changed }, authorizes: false });
    if (this.changed === snapshot) return Promise.resolve(envelope(true));
    return new Promise((resolve, reject) => {
      let timer;
      const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); if (this.changeWaiter === waiter) this.changeWaiter = null; };
      const waiter = { finish: changed => { cleanup(); resolve(envelope(changed)); }, reject: error => { cleanup(); reject(error); } };
      const abort = () => waiter.reject(new ControlReadError('cancelled'));
      this.changeWaiter = waiter;
      timer = setTimeout(() => waiter.finish(false), timeout);
      timer.unref?.(); signal?.addEventListener('abort', abort, { once: true });
    });
  }
  async close() {
    this.changeWaiter?.reject(new ControlReadError('cancelled'));
    this.closed = true;
    for (const job of [this.active, this.waiting].filter(Boolean)) this.#finish(job, new ControlReadError('cancelled'));
    const worker = this.worker; this.worker = null;
    await Promise.all([this.retiring, worker?.terminate()]);
  }
}
