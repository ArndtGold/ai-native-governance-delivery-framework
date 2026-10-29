import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
// Exercise the same assembled package whose transitive graph is scanned below.
// A same-version npm copy can retain obsolete generated resources after a rebuild.
import { createMcpDispatchRuntime } from "../../../dist/npm/create-agdf/lib/mcp-dispatch-runtime.js";
import { MCP_DISPATCHER_RUNTIME_ENTRIES } from "../../core/lib/runtime/plugin-provenance.js";
import { DispatchExecutionError, createWorkerDispatchExecutor } from "../src/worker.js";
import { tryLinkFile } from "../../../scripts/support/symlinks.js";

const sourceRoot = new URL("../src/", import.meta.url);
const sources = readdirSync(sourceRoot)
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(new URL(name, sourceRoot), "utf8"))
  .join("\n");
for (const prohibited of [
  "node:net", "node:http", "node:https", "node:http2",
  "node:tls", "node:dgram", "node:dns", "writeFile", "rename(", "unlink(", "rm(", "fetch(",
]) {
  assert.equal(sources.includes(prohibited), false, `reachable server source includes prohibited capability: ${prohibited}`);
}
// The approved facade owns only direct private children. No other server module
// gains a process capability, arbitrary execution, process discovery or kill.
for (const name of readdirSync(sourceRoot).filter(name => name.endsWith('.js'))) {
  const content = readFileSync(new URL(name, sourceRoot), 'utf8');
  if (name === 'generation.js') {
    assert.match(content, /import \{ fork \} from 'node:child_process'/u);
    assert.match(content, /Fork\(join\(packageInfo\.packageRoot, 'src\/generation-entry\.js'\)/u);
    assert.match(content, /stdio: \['ignore', 'ignore', 'ignore', 'ipc'\]/u);
    for (const prohibited of ['.kill(', 'process.kill(', 'exec(', 'execFile(', 'spawn(', 'pgrep']) assert.equal(content.includes(prohibited), false, prohibited);
    assert.doesNotMatch(content, /\bps\b/u);
  } else assert.equal(content.includes('node:child_process'), false, name);
}
assert.equal(sources.includes("McpServer.connect(new StdioServerTransport"), false);
assert.match(sources, /serveStdio\(/);

const repositoryRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const visited = new Map();
function localImport(from, specifier) {
  if (specifier === "create-agdf/mcp-dispatch-runtime") {
    return resolve(repositoryRoot, "dist/npm/create-agdf/lib/mcp-dispatch-runtime.js");
  }
  if (specifier === "#agdf-core") return resolve(repositoryRoot, "dist/npm/create-agdf/runtime/core/lib/index.js");
  if (specifier.startsWith("#agdf-core/")) return resolve(repositoryRoot, "dist/npm/create-agdf/runtime/core/lib", specifier.slice("#agdf-core/".length));
  if (!specifier.startsWith(".")) return null;
  const candidate = resolve(dirname(from), specifier);
  return extname(candidate) ? candidate : `${candidate}.js`;
}
function visit(path, graph = visited) {
  if (graph.has(path)) return;
  const content = readFileSync(path, "utf8");
  graph.set(path, content);
  for (const match of content.matchAll(importPattern)) {
    const imported = localImport(path, match[1]);
    if (imported && existsSync(imported)) visit(imported, graph);
  }
}
for (const name of readdirSync(sourceRoot).filter((value) => value.endsWith(".js"))) {
  visit(fileURLToPath(new URL(name, sourceRoot)));
}
const dispatcherRoot = resolve(repositoryRoot, "dist/npm/create-agdf");
const writeSymbols = ["writeFileSync", "createWriteStream", "renameSync", "unlinkSync", "rmSync",
  "rmdirSync", "mkdirSync", "openSync", "fsyncSync", "linkSync"];
// Bound continuation composes the existing writer; the MCP adapter adds no write owner.
const continuationWriteOwners = new Map([
  // Existing immutable preview publication owner; no new writer is introduced
  // by the error projector. Reads use its bounded read/validation functions.
  ["runtime/core/lib/control-state/preview-snapshot.js", ["writeFileSync", "openSync", "fsyncSync"]],
  ["runtime/core/lib/control-state/run-state-writer.js", ["writeFileSync", "renameSync", "unlinkSync", "openSync", "fsyncSync", "linkSync"]],
  ["runtime/core/lib/fs-swap.js", ["renameSync"]],
  ["runtime/core/lib/control-read/snapshot.js", ["openSync"]],
  ["runtime/core/lib/control-state/run-presentation.js", ["writeFileSync", "mkdirSync", "openSync", "fsyncSync"]],
  ["runtime/core/lib/control-state/preview-snapshot.js", ["writeFileSync", "openSync", "fsyncSync"]],
  ["runtime/core/lib/control-state/run-step-transaction.js", ["renameSync", "unlinkSync", "rmSync", "mkdirSync"]],
  ["runtime/core/lib/control-state/run-owned-outputs.js", ["unlinkSync"]],
  // Closure previews: only the preview directory is created here; each preview file is
  // published through run-state-writer atomicWrite under its exclusive owned-file lock.
  ["runtime/core/lib/control-state/run-closure.js", ["mkdirSync"]],
]);
function assertWriteBoundary(packagePath, content, owners = continuationWriteOwners) {
  assert.deepEqual(writeSymbols.filter(symbol => new RegExp(`\\b${symbol === 'renameSync' ? 'renameSync(?:WithRetry)?' : symbol}\\b`, 'u').test(content)), owners.get(packagePath) ?? [],
    `module ${packagePath} exceeds its declared filesystem write boundary`);
}
for (const [path, content] of visited) {
  for (const prohibited of [
    "node:net", "node:http", "node:https", "node:http2",
    "node:tls", "node:dgram", "node:dns", "fetch(",
  ]) {
    assert.equal(content.includes(prohibited), false, `reachable module ${path} includes ${prohibited}`);
  }
  assert.equal(content.includes('node:child_process') && path !== fileURLToPath(new URL('generation.js', sourceRoot)), false,
    `No transitive module may acquire arbitrary process capability: ${path}`);
  const packagePath = relative(dispatcherRoot, path).replaceAll("\\", "/");
  assertWriteBoundary(packagePath, content);
  if (path.startsWith(`${dispatcherRoot}${sep}`)) {
    assert.ok(
      MCP_DISPATCHER_RUNTIME_ENTRIES.some((entry) => packagePath === entry || packagePath.startsWith(`${entry}/`)),
      `reachable dispatcher module is outside the provenance digest: ${packagePath}`,
    );
  }
}
assert.ok([...visited].some(([path]) => path.replaceAll("\\", "/").endsWith("create-agdf/runtime/core/lib/skill-dispatch/service.js")));
assert.ok([...visited].some(([path]) => path.replaceAll("\\", "/").endsWith("create-agdf/runtime/core/lib/control-inspect/service.js")), "the read tool is part of the scanned reachable surface");
for (const owner of continuationWriteOwners.keys()) assert.ok(visited.has(resolve(dispatcherRoot, owner)));
const readOnlyGraph = new Map();
for (const owner of ["skill-dispatch/service.js", "control-inspect/service.js"]) {
  visit(resolve(dispatcherRoot, "runtime/core/lib", owner), readOnlyGraph);
}
// Inspect imports the shared immutable presentation reader and pending-journal
// observation from these same Core owner modules. Import reachability is not
// function authority: the closed read route never invokes their publish/recovery
// functions. Keep a finite reviewed symbol boundary, plus actual no-write tests.
const readDescriptors = continuationWriteOwners;
for (const [path, content] of readOnlyGraph) {
  assertWriteBoundary(relative(dispatcherRoot, path).replaceAll("\\", "/"), content, readDescriptors);
}
const snapshotSource = readOnlyGraph.get(resolve(dispatcherRoot, 'runtime/core/lib/control-read/snapshot.js'));
assert.match(snapshotSource, /fs\.openSync\(path, fs\.constants\.O_RDONLY \| \(fs\.constants\.O_NOFOLLOW/);
assert.equal((snapshotSource.match(/fs\.openSync\(/g) ?? []).length, 1, 'The bounded snapshot may open only the checked read-only descriptor.');
const presentationReader = readOnlyGraph.get(resolve(dispatcherRoot, 'runtime/core/lib/control-state/run-presentation.js'));
assert.match(presentationReader, /openSync\(path, constants\.O_RDONLY \| \(constants\.O_NOFOLLOW/u);
// Presentation publishing creates each preview snapshot file through one exclusive,
// non-following open, so it cannot open over or through an existing file.
function assertExclusiveCreate(content) {
  assert.equal((content.match(/\bopenSync\(/gu) ?? []).length, 1, 'The preview snapshot writer may open only its exclusive-create descriptor.');
  assert.match(content, /openSync\([^;]*constants\.O_CREAT \| constants\.O_EXCL \| \(constants\.O_NOFOLLOW \?\? 0\)/u);
}
assertExclusiveCreate(visited.get(resolve(dispatcherRoot, 'runtime/core/lib/control-state/preview-snapshot.js')));
const exclusiveOpen = 'openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0), 0o600)';
assertExclusiveCreate(exclusiveOpen);
assert.throws(() => assertExclusiveCreate(exclusiveOpen.replace(' | constants.O_EXCL', '')), assert.AssertionError);
assert.throws(() => assertExclusiveCreate(exclusiveOpen.replace(' | (constants.O_NOFOLLOW ?? 0)', '')), assert.AssertionError);
assert.throws(() => assertExclusiveCreate(`${exclusiveOpen}; openSync(path, constants.O_RDONLY)`), assert.AssertionError);
assert.throws(() => assertWriteBoundary("runtime/core/lib/unexpected-writer.js", "writeFileSync()"), /write boundary/);
assert.throws(() => assertWriteBoundary("runtime/core/lib/fs-swap.js", "renameSync(); mkdirSync()"), /write boundary/);
assert.throws(() => assertWriteBoundary("runtime/core/lib/fs-swap.js", "renameSync()", new Map()), /write boundary/);

class SilentWorker extends EventEmitter {
  constructor() {
    super();
    this.terminated = false;
  }
  async terminate() {
    this.terminated = true;
  }
}

const busyExecutor = createWorkerDispatchExecutor({
  surface: "codex", expectedVersion: "0.14.5", timeoutMs: 1_000, WorkerClass: SilentWorker,
});
const activeCall = busyExecutor.execute({});
await assert.rejects(
  busyExecutor.execute({}),
  (error) => error instanceof DispatchExecutionError && error.code === "dispatch_busy",
);
await busyExecutor.close();
await assert.rejects(activeCall, (error) => error.code === "dispatch_cancelled");

const timeoutExecutor = createWorkerDispatchExecutor({
  surface: "codex", expectedVersion: "0.14.5", timeoutMs: 5, WorkerClass: SilentWorker,
});
await assert.rejects(
  timeoutExecutor.execute({}),
  (error) => error instanceof DispatchExecutionError && error.code === "dispatch_timeout",
);
assert.equal(timeoutExecutor.active, false);

const cancelExecutor = createWorkerDispatchExecutor({
  surface: "codex", expectedVersion: "0.14.5", timeoutMs: 1_000, WorkerClass: SilentWorker,
});
const controller = new AbortController();
const cancelled = cancelExecutor.execute({}, { signal: controller.signal });
controller.abort();
await assert.rejects(cancelled, (error) => error.code === "dispatch_cancelled");
assert.equal(cancelExecutor.active, false);

const preCancelled = new AbortController();
preCancelled.abort();
const preCancelledExecutor = createWorkerDispatchExecutor({
  surface: "codex",
  expectedVersion: "0.14.5",
  WorkerClass: class MustNotStart {
    constructor() { throw new Error("pre-cancelled calls must not start a worker"); }
  },
});
await assert.rejects(
  preCancelledExecutor.execute({}, { signal: preCancelled.signal }),
  (error) => error.code === "dispatch_cancelled",
);
assert.equal(preCancelledExecutor.active, false);

// Capacity protects the old Worker until its actual termination confirmation, including failed/hung cleanup.
for (const mode of ['delayed', 'rejected', 'hung']) {
  let instance;
  class DrainingWorker extends EventEmitter {
    constructor() { super(); instance = this; }
    terminate() {
      if (mode === 'rejected') return Promise.reject(Error('PRIVATE_TERMINATION_SECRET'));
      return new Promise(resolve => { this.confirm = resolve; });
    }
  }
  const phases = [];
  const draining = createWorkerDispatchExecutor({ WorkerClass: DrainingWorker, timeoutMs: 40, onEvent: event => phases.push(event.phase) });
  const result = draining.execute({ private: 'PRIVATE_PAYLOAD_SECRET' });
  instance.emit('message', { type: 'phase', phase: 'PRIVATE_PHASE_SECRET' });
  instance.emit('message', { type: 'phase', phase: 'operation' });
  instance.emit('message', { type: 'result', result: 'done' });
  assert.equal(draining.active, true);
  await assert.rejects(draining.execute({}), error => error.code === 'dispatch_busy' && error.dispatch === 'not_dispatched');
  if (mode === 'delayed') {
    instance.confirm(0); assert.equal(await result, 'done'); assert.equal(draining.active, false);
  } else {
    await assert.rejects(result, error => error.code === 'dispatch_worker_termination_unconfirmed' && error.dispatch === 'unknown');
    assert.equal(draining.active, true);
    await draining.close(); assert.equal(draining.active, true);
    instance.emit('exit', 0); assert.equal(draining.active, false);
  }
  assert.equal(JSON.stringify(phases).includes('PRIVATE_'), false);
}

const runtime = createMcpDispatchRuntime({ surface: "codex" });
const sanitized = runtime.failure("dispatch_worker_failed");
assert.equal(JSON.stringify(sanitized).includes("secret"), false);
assert.deepEqual(sanitized.diagnostics, [{ code: "dispatch_worker_failed" }]);
assert.equal(sanitized.authorizes, false);

const escapedTarget = mkdtempSync(join(tmpdir(), "agdf-mcp-read-boundary-"));
const outsideRoot = mkdtempSync(join(tmpdir(), "agdf-mcp-outside-"));
try {
  mkdirSync(join(escapedTarget, ".git"));
  writeFileSync(join(escapedTarget, ".git", "HEAD"), "ref: refs/heads/main\n", "utf8");
  mkdirSync(join(escapedTarget, ".agdf", "control"), { recursive: true });
  const outside = join(outsideRoot, "outside-secret.txt");
  writeFileSync(outside, "MCP_BOUNDARY_SECRET");
  if (tryLinkFile(outside, join(escapedTarget, ".agdf", "control", "escape.md"), "mcp-safety-test")) {
    const inspectTool = runtime.tool("agdf_inspect");
    const guardedInspect = inspectTool.execute(inspectTool.parse({
      operation: "doctor",
      presentation_language: "en",
      working_directory: escapedTarget,
      target_source: "explicit_target",
      primary_target: escapedTarget,
    }));
    assert.equal(guardedInspect.outcome, "evaluator_error");
    assert.deepEqual(guardedInspect.diagnostics, [{ code: "inspect_control_evaluation_failed" }]);
    assert.equal(JSON.stringify(guardedInspect).includes("MCP_BOUNDARY_SECRET"), false);
    const guarded = runtime.execute(runtime.parse({
      skill_id: "gate-check",
      presentation_language: "en",
      working_directory: escapedTarget,
      target_source: "explicit_target",
      primary_target: escapedTarget,
    }));
    assert.equal(guarded.outcome, "evaluator_error");
    assert.deepEqual(guarded.diagnostics, [{ code: "dispatch_control_evaluation_failed" }]);
    assert.equal(JSON.stringify(guarded).includes("MCP_BOUNDARY_SECRET"), false);
  }
} finally {
  rmSync(escapedTarget, { recursive: true, force: true });
  rmSync(outsideRoot, { recursive: true, force: true });
}

const fakeRepository = mkdtempSync(join(tmpdir(), "agdf-mcp-fake-repository-"));
try {
  mkdirSync(join(fakeRepository, ".git"));
  const rejected = runtime.execute(runtime.parse({
    skill_id: "gate-check",
    presentation_language: "en",
    working_directory: fakeRepository,
    target_source: "explicit_target",
    primary_target: fakeRepository,
  }));
  assert.equal(rejected.outcome, "target_unresolved");
  assert.equal(rejected.target.reason_code, "target_not_in_repository");
} finally {
  rmSync(fakeRepository, { recursive: true, force: true });
}

// Typed worker facts retain only known causes/fields. An exit after handoff
// cannot prove rollback, while a constructor failure never handed off work.
class ParseRejectedWorker extends EventEmitter {
  constructor() { super(); queueMicrotask(() => this.emit('message', { type: 'failure', code: 'dispatch_input_invalid', dispatch: 'not_dispatched', field: 'run_id' })); }
  async terminate() {}
}
const parseRejected = createWorkerDispatchExecutor({ WorkerClass: ParseRejectedWorker });
await assert.rejects(parseRejected.execute({}), error => {
  assert.deepEqual(runtime.normalizeFailure(error), { code: 'dispatch_input_invalid', dispatch: 'not_dispatched', field: 'run_id' }); return true;
});
class UnexpectedExitWorker extends EventEmitter {
  constructor() { super(); queueMicrotask(() => this.emit('exit', 1)); }
  async terminate() {}
}
await assert.rejects(createWorkerDispatchExecutor({ WorkerClass: UnexpectedExitWorker }).execute({}), error => {
  assert.deepEqual(runtime.normalizeFailure(error), { code: 'dispatch_worker_failed', dispatch: 'unknown' }); return true;
});
class SetupRejectedWorker { constructor() { throw Error('PRIVATE_SETUP_DETAIL'); } }
await assert.rejects(createWorkerDispatchExecutor({ WorkerClass: SetupRejectedWorker }).execute({}), error => {
  assert.deepEqual(runtime.normalizeFailure(error), { code: 'dispatch_worker_failed', dispatch: 'not_dispatched' });
  assert.ok(!JSON.stringify(error).includes('PRIVATE_SETUP')); return true;
});
assert.deepEqual(runtime.normalizeFailure({ code: 'resource_denied', message: 'PRIVATE_EXCEPTION' }), { code: 'dispatch_worker_failed', dispatch: 'unknown' });

console.log("AGDF MCP isolation, timeout, cancellation and static safety tests passed.");
