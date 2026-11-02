import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { createWorkerDispatchExecutor } from '../src/worker.js';

test('parallel Inspect reads wait for confirmed worker exit instead of dispatch_busy', async () => {
  let live = 0, maximum = 0, launches = 0;
  class ReadingWorker extends EventEmitter {
    constructor(_, { workerData }) {
      super(); launches++; maximum = Math.max(maximum, ++live);
      setTimeout(() => this.emit('message', { type: 'result', result: workerData.argumentsValue }), 5);
    }
    async terminate() { await new Promise(resolve => setTimeout(resolve, 5)); live--; }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: ReadingWorker });
  const results = await Promise.all([1, 2, 3].map(id => executor.execute({ id }, { toolName: 'agdf_inspect' })));
  assert.deepEqual(results, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.equal(maximum, 1); assert.equal(live, 0); assert.equal(launches, 3);
  await executor.close();
});

test('read queue is bounded, cancellable and closed without launching waiting work', async () => {
  let launches = 0;
  class HeldWorker extends EventEmitter {
    constructor() { super(); launches++; }
    terminate() { return Promise.resolve(); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: HeldWorker });
  const first = executor.execute({}, { toolName: 'agdf_inspect' }).catch(error => error);
  const controller = new AbortController();
  const queued = Array.from({ length: 8 }, (_, i) => executor.execute({ i }, { toolName: 'agdf_inspect',
    ...(i === 0 ? { signal: controller.signal } : {}) }).catch(error => error));
  await assert.rejects(executor.execute({}, { toolName: 'agdf_inspect' }), error => error.code === 'resource_limit' && error.dispatch === 'not_dispatched');
  await assert.rejects(executor.execute({}, { toolName: 'agdf_record' }), error => error.code === 'dispatch_busy' && error.dispatch === 'not_dispatched');
  controller.abort();
  assert.equal((await queued[0]).code, 'dispatch_cancelled');
  await executor.close();
  assert.equal((await first).code, 'dispatch_cancelled');
  for (const result of await Promise.all(queued)) { assert.equal(result.code, 'dispatch_cancelled'); assert.equal(result.dispatch, 'not_dispatched'); }
  assert.equal(launches, 1); assert.equal(executor.active, false);
});

test('waiting time consumes the original read deadline', async () => {
  let launches = 0;
  class ReadingWorker extends EventEmitter {
    constructor(_, { workerData }) {
      super(); launches++;
      this.timer = setTimeout(() => this.emit('message', { type: 'result', result: true }), workerData.argumentsValue.delay);
    }
    terminate() { clearTimeout(this.timer); return Promise.resolve(); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 400, WorkerClass: ReadingWorker });
  const first = executor.execute({ delay: 250 }, { toolName: 'agdf_inspect' });
  const second = executor.execute({ delay: 200 }, { toolName: 'agdf_inspect' });
  const failed = assert.rejects(second, error => error.code === 'dispatch_timeout');
  assert.equal(await first, true); await failed;
  assert.equal(launches, 2); assert.equal(executor.active, false);
  await executor.close();
});

test('unknown worker termination refuses queued reads until a real exit releases capacity', async () => {
  let worker, launches = 0;
  class UnknownWorker extends EventEmitter {
    constructor() { super(); worker = this; launches++; }
    terminate() { return new Promise(() => {}); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 100, WorkerClass: UnknownWorker });
  const first = executor.execute({}, { toolName: 'agdf_inspect' }).catch(error => error);
  worker.emit('message', { type: 'result', result: true });
  await new Promise(resolve => setTimeout(resolve, 10));
  const queued = executor.execute({}, { toolName: 'agdf_inspect' }).catch(error => error);
  assert.equal((await first).code, 'dispatch_worker_termination_unconfirmed');
  const denied = await queued;
  assert.equal(denied.code, 'dispatch_busy'); assert.equal(denied.dispatch, 'not_dispatched');
  assert.equal(launches, 1); assert.equal(executor.active, true);
  await assert.rejects(executor.execute({}, { toolName: 'agdf_inspect' }), error => error.code === 'dispatch_busy');
  worker.emit('exit', 1);
  assert.equal(executor.active, false);
  await executor.close();
});

test('timeout leaves time for asynchronous termination within the original deadline', async () => {
  class SlowTerminationWorker extends EventEmitter {
    terminate() { return new Promise(resolve => setTimeout(resolve, 25)); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: SlowTerminationWorker });
  await assert.rejects(executor.execute({}), error => error.code === 'dispatch_timeout');
  assert.equal(executor.active, false, 'Confirmed termination releases capacity before reporting the timeout.');
});

test('an actual exit confirms cancellation even when terminate rejects', async () => {
  let worker;
  class RejectedTerminationWorker extends EventEmitter {
    constructor() { super(); worker = this; }
    terminate() {
      setTimeout(() => this.emit('exit', 1), 25);
      return Promise.reject(Error('PRIVATE_TERMINATION_FAILURE'));
    }
  }
  const controller = new AbortController();
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: RejectedTerminationWorker });
  const result = executor.execute({}, { signal: controller.signal });
  worker.emit('message', { type: 'phase', phase: 'operation' });
  controller.abort();
  assert.equal(executor.active, true);
  await assert.rejects(executor.execute({}), error => error.code === 'dispatch_busy');
  await assert.rejects(result, error => error.code === 'dispatch_cancelled');
  assert.equal(executor.active, false);
});

test('unconfirmed termination retains the typed timeout and last safe phase', async () => {
  let worker;
  class HungWorker extends EventEmitter {
    constructor() { super(); worker = this; }
    terminate() { return new Promise(() => {}); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 100, WorkerClass: HungWorker });
  const result = executor.execute({ private: 'PRIVATE_PAYLOAD' });
  worker.emit('message', { type: 'phase', phase: 'operation' });
  worker.emit('message', { type: 'phase', phase: 'PRIVATE_PHASE' });
  await assert.rejects(result, error => {
    assert.deepEqual(error.facts, { code: 'dispatch_worker_termination_unconfirmed', dispatch: 'unknown',
      cause_code: 'dispatch_timeout', worker_phase: 'operation' });
    assert.ok(!JSON.stringify(error).includes('PRIVATE'));
    return true;
  });
  assert.equal(executor.active, true);
  await executor.close();
  assert.equal(executor.active, true, 'A rejected request cannot release a worker that may still run.');
  await assert.rejects(executor.execute({}), error => error.code === 'dispatch_busy');
  worker.emit('exit', 1);
  assert.equal(executor.active, false);
});

test('failed result cleanup never treats result content as a typed failure cause', async () => {
  let worker;
  class HungWorker extends EventEmitter {
    constructor() { super(); worker = this; }
    terminate() { throw Error('PRIVATE_TERMINATION_FAILURE'); }
  }
  const executor = createWorkerDispatchExecutor({ timeoutMs: 100, WorkerClass: HungWorker });
  const result = executor.execute({});
  worker.emit('message', { type: 'result', result: { code: 'PRIVATE_RESULT', facts: { code: 'dispatch_timeout' } } });
  await assert.rejects(result, error => {
    assert.deepEqual(error.facts, { code: 'dispatch_worker_termination_unconfirmed', dispatch: 'unknown', worker_phase: 'result' });
    assert.ok(!JSON.stringify(error).includes('PRIVATE'));
    return true;
  });
  assert.equal(executor.active, true);
  worker.emit('exit', 1);
  assert.equal(executor.active, false);
});
