import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";
import { MCP_DISPATCHER_RUNTIME_ENTRIES } from "../../create-agdf/lib/runtime/plugin-provenance.js";
import { DispatchExecutionError, createWorkerDispatchExecutor } from "../src/worker.js";

const sourceRoot = new URL("../src/", import.meta.url);
const sources = readdirSync(sourceRoot)
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(new URL(name, sourceRoot), "utf8"))
  .join("\n");
for (const prohibited of [
  "node:child_process", "node:net", "node:http", "node:https", "node:http2",
  "node:tls", "node:dgram", "node:dns", "writeFile", "rename(", "unlink(", "rm(", "fetch(",
]) {
  assert.equal(sources.includes(prohibited), false, `reachable server source includes prohibited capability: ${prohibited}`);
}
assert.equal(sources.includes("McpServer.connect(new StdioServerTransport"), false);
assert.match(sources, /serveStdio\(/);

const repositoryRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const visited = new Map();
function localImport(from, specifier) {
  if (specifier === "create-agdf/mcp-dispatch-runtime") {
    return resolve(repositoryRoot, "create-agdf/lib/mcp-dispatch-runtime.js");
  }
  if (!specifier.startsWith(".")) return null;
  const candidate = resolve(dirname(from), specifier);
  return extname(candidate) ? candidate : `${candidate}.js`;
}
function visit(path) {
  if (visited.has(path)) return;
  const content = readFileSync(path, "utf8");
  visited.set(path, content);
  for (const match of content.matchAll(importPattern)) {
    const imported = localImport(path, match[1]);
    if (imported && existsSync(imported)) visit(imported);
  }
}
for (const name of readdirSync(sourceRoot).filter((value) => value.endsWith(".js"))) {
  visit(fileURLToPath(new URL(name, sourceRoot)));
}
for (const [path, content] of visited) {
  for (const prohibited of [
    "node:child_process", "node:net", "node:http", "node:https", "node:http2",
    "node:tls", "node:dgram", "node:dns", "writeFileSync", "createWriteStream",
    "renameSync", "unlinkSync", "rmSync", "rmdirSync", "mkdirSync", "openSync",
    "fsyncSync", "fetch(",
  ]) {
    assert.equal(content.includes(prohibited), false, `reachable module ${path} includes ${prohibited}`);
  }
  const dispatcherRoot = resolve(repositoryRoot, "create-agdf");
  if (path.startsWith(`${dispatcherRoot}/`)) {
    const packagePath = relative(dispatcherRoot, path).replaceAll("\\", "/");
    assert.ok(
      MCP_DISPATCHER_RUNTIME_ENTRIES.some((entry) => packagePath === entry || packagePath.startsWith(`${entry}/`)),
      `reachable dispatcher module is outside the provenance digest: ${packagePath}`,
    );
  }
}
assert.ok([...visited].some(([path]) => path.endsWith("create-agdf/lib/skill-dispatch/service.js")));

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
  symlinkSync(outside, join(escapedTarget, ".agdf", "control", "escape.md"));
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
  assert.equal(rejected.target.reason_code, "target_content_mismatch");
} finally {
  rmSync(fakeRepository, { recursive: true, force: true });
}

console.log("AGDF MCP isolation, timeout, cancellation and static safety tests passed.");
