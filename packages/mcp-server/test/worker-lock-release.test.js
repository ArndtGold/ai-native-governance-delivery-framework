// Run write locks of an abandoned dispatch worker (run core-approval-lock-defects-20261017-01, D3).
// The worker shares the server PID, so only the executor can prove that its thread exited.
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { createWorkerDispatchExecutor } from "../src/worker.js";
import { releaseAbandonedOwnedLock, withOwnedFileLock } from "../../core/lib/control-state/run-state-writer.js";

const lockMessage = (phase, lockPath, token) => ({ type: "lock", phase, lock_path: lockPath, token });
let instance;
class HeldWorker extends EventEmitter {
  constructor() { super(); instance = this; }
  terminate() { return new Promise(resolve => { this.confirm = resolve; }); }
}
const recorder = () => { const calls = []; return { calls, release: (lockPath, token) => { calls.push([lockPath, token]); return "released"; } }; };

// Timeout, unconfirmed termination, then the late actual exit releases only unreleased locks.
{
  const { calls, release } = recorder(), events = [];
  const executor = createWorkerDispatchExecutor({ timeoutMs: 20, WorkerClass: HeldWorker, releaseOwnedLock: release, onEvent: event => events.push(event) });
  const result = executor.execute({});
  const run = randomUUID(), backlog = randomUUID();
  instance.emit("message", lockMessage("intent", "/t/RUN_STATE.md.lock", run));
  instance.emit("message", lockMessage("intent", "/t/MASTER_BACKLOG.md.lock", backlog));
  instance.emit("message", lockMessage("released", "/t/MASTER_BACKLOG.md.lock", backlog));
  instance.emit("message", { type: "lock", phase: "intent" }); // malformed: ignored, never a failure
  await assert.rejects(result, error => error.code === "dispatch_worker_termination_unconfirmed" && error.dispatch === "unknown");
  assert.deepEqual(calls, [], "No lock is touched while the thread may still run.");
  assert.equal(executor.active, true);
  instance.emit("exit", 1);
  assert.deepEqual(calls, [["/t/RUN_STATE.md.lock", run]], "After the actual exit exactly the unreleased own lock is released.");
  assert.equal(executor.active, false);
  assert.deepEqual(events.filter(event => event.phase === "locks_released").map(event => event.count), [1]);
}

// A worker that never exits keeps its lock and the executor capacity.
{
  const { calls, release } = recorder();
  const executor = createWorkerDispatchExecutor({ timeoutMs: 20, WorkerClass: HeldWorker, releaseOwnedLock: release });
  const result = executor.execute({});
  instance.emit("message", lockMessage("intent", "/t/RUN_STATE.md.lock", randomUUID()));
  await assert.rejects(result, error => error.code === "dispatch_worker_termination_unconfirmed");
  await executor.close();
  assert.deepEqual(calls, []); assert.equal(executor.active, true);
  await assert.rejects(executor.execute({}), error => error.code === "dispatch_busy" && error.dispatch === "not_dispatched");
}

// Normal completion: released messages, including ones drained after settlement, need no release.
{
  const { calls, release } = recorder();
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: HeldWorker, releaseOwnedLock: release });
  const result = executor.execute({});
  const first = randomUUID(), second = randomUUID();
  instance.emit("message", lockMessage("intent", "/t/RUN_STATE.md.lock", first));
  instance.emit("message", lockMessage("released", "/t/RUN_STATE.md.lock", first));
  instance.emit("message", lockMessage("intent", "/t/MASTER_BACKLOG.md.lock", second));
  instance.emit("message", { type: "result", result: "done" });
  instance.emit("message", lockMessage("released", "/t/MASTER_BACKLOG.md.lock", second));
  instance.confirm(0);
  assert.equal(await result, "done");
  assert.deepEqual(calls, []); assert.equal(executor.active, false);
}

// A failing release function never strands executor capacity.
{
  const executor = createWorkerDispatchExecutor({ timeoutMs: 1_000, WorkerClass: HeldWorker, releaseOwnedLock: () => { throw Error("PRIVATE_RELEASE_FAILURE"); } });
  const result = executor.execute({});
  instance.emit("message", lockMessage("intent", "/t/RUN_STATE.md.lock", randomUUID()));
  instance.emit("message", { type: "result", result: "done" });
  instance.confirm(0);
  assert.equal(await result, "done");
  assert.equal(executor.active, false);
}

// A real worker thread terminated while it holds a run lock leaves no lock behind.
const root = mkdtempSync(join(tmpdir(), "agdf-worker-lock-"));
try {
  const path = join(root, "RUN_STATE.md"), lock = `${path}.lock`;
  writeFileSync(path, "fixture\n");
  class LockHolder extends Worker {
    constructor(_url, options) { super(new URL("./lock-holder-worker.js", import.meta.url), options); }
  }
  const phases = [];
  const executor = createWorkerDispatchExecutor({ timeoutMs: 4_000, WorkerClass: LockHolder, releaseOwnedLock: releaseAbandonedOwnedLock,
    onEvent: event => phases.push(event.phase) });
  await assert.rejects(executor.execute({ path }), error => ["dispatch_timeout", "dispatch_worker_termination_unconfirmed"].includes(error.code));
  assert.ok(phases.includes("operation"), "The worker acquired the lock before it was abandoned.");
  for (let attempt = 0; executor.active && attempt < 200; attempt++) await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(executor.active, false, "The terminated thread actually exited.");
  assert.equal(existsSync(lock), false, "The abandoned worker's lock was released.");
  assert.equal(withOwnedFileLock(path, () => readFileSync(path, "utf8")), "fixture\n", "The next write is not refused with run_write_locked.");

  // A lock of the same process with a token the worker never announced stays untouched.
  const foreign = { schema_version: 1, pid: process.pid, token: randomUUID(), started_at: "2026-10-17T00:00:00.000Z" };
  writeFileSync(lock, `${JSON.stringify(foreign)}\n`);
  const second = createWorkerDispatchExecutor({ timeoutMs: 1_500, WorkerClass: LockHolder, releaseOwnedLock: releaseAbandonedOwnedLock });
  await assert.rejects(second.execute({ path }));
  for (let attempt = 0; second.active && attempt < 200; attempt++) await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(JSON.parse(readFileSync(lock, "utf8")).token, foreign.token, "A live writer's lock is never removed.");
} finally { rmSync(root, { recursive: true, force: true }); }

// Every production executor is created with the Core release function (bin and owned generation child).
for (const entry of ["main.js", "generation-entry.js"]) {
  const source = readFileSync(new URL(`../src/${entry}`, import.meta.url), "utf8");
  const calls = source.match(/createAgdfWorkerExecutor\([^;]*/gu) ?? [];
  assert.ok(calls.length > 0 && calls.every(call => call.includes("releaseOwnedLock")), `${entry} passes releaseOwnedLock to every worker executor`);
}

console.log("Abandoned-worker lock release passed: unconfirmed and late exit, hung worker, drained messages, release failure, real terminated thread and foreign lock.");
