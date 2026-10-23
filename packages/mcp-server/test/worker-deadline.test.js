import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { createWorkerDispatchExecutor } from '../src/worker.js';

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
