import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { observeCodexHooks, parseCodexHookObservation } from "../lib/runtime-check-consent/codex-hooks.js";
import { codexRuntimeCheckEvidence, projectCodexHookObservation } from "../lib/runtime-check-consent/adapters.js";
import { runCli } from "../lib/cli/application.js";

const cwd = process.cwd();
const nativeHook = {
  key: "agdf@agdf:hooks/hooks.json:session_start:0:0", pluginId: "agdf@agdf",
  eventName: "sessionStart", source: "plugin", handlerType: "command",
  enabled: true, isManaged: false, currentHash: `sha256:${"a".repeat(64)}`, trustStatus: "trusted",
};
const response = (hooks = [nativeHook]) => ({ id: 2, result: { data: [{ cwd, hooks, errors: [], warnings: [] }] } });
const observed = parseCodexHookObservation(response(), cwd);
assert.equal(observed.status, "observed");
assert.equal(observed.hook.current_hash, nativeHook.currentHash);
for (const trustStatus of ["trusted", "managed", "modified", "untrusted"]) {
  assert.equal(parseCodexHookObservation(response([{ ...nativeHook, trustStatus, isManaged: trustStatus === "managed" }]), cwd).status, "observed");
}
for (const invalid of [null, {}, { result: { data: [null] } }, response([]), response([nativeHook, nativeHook]),
  response([{ ...nativeHook, pluginId: "unrelated@market" }]),
  response([{ ...nativeHook, trustStatus: "future-value" }]),
  response([{ ...nativeHook, trustStatus: "managed" }]),
  response([{ ...nativeHook, currentHash: "not-a-native-hash" }]),
  response([{ ...nativeHook, currentHash: { toString: null } }]),
  response([{ ...nativeHook, key: "" }]),
  response([{ ...nativeHook, enabled: "true" }]),
  response([{ ...nativeHook, source: "user" }]),
  { ...response(), error: { message: "failed" } },
  { result: { data: [{ cwd, hooks: [nativeHook], errors: ["failed"], warnings: [] }] } },
  { result: { data: [{ cwd, hooks: [nativeHook], errors: [], warnings: ["partial configuration"] }] } },
]) assert.equal(parseCodexHookObservation(invalid, cwd).status, "unavailable");
assert.equal(parseCodexHookObservation(response(), `${cwd}/another`).status, "unavailable");

const pending = { requested: "enabled", effective: "decision_required", reason: "host_permission_unverified" };
assert.equal(codexRuntimeCheckEvidence({ capabilityIdentity: "same", observedIdentity: "same", hookEnabled: true, reviewRequired: true }).status, "decision_required");
for (const trust_status of ["modified", "untrusted", "trusted", "managed"]) {
  const result = projectCodexHookObservation(pending, { ...observed, hook: { ...observed.hook, trust_status } });
  assert.equal(result.effective, "decision_required", "native trust metadata must never prove hook execution");
  assert.equal(result.verification, ["trusted", "managed"].includes(trust_status) ? "hook_trusted_session_unverified" : "hook_review_required");
  if (trust_status === "trusted") assert.doesNotMatch(result.next_action, /review and trust|Approve/);
}
assert.equal(projectCodexHookObservation(pending, { ...observed, hook: { ...observed.hook, enabled: false } }).verification, "hook_disabled");
assert.equal(projectCodexHookObservation(pending, { status: "unavailable" }).verification, "host_unverified");
for (const effective of ["manual", "renewal_required", "failed", "unavailable", "enabled"]) {
  const state = { ...pending, effective };
  assert.equal(projectCodexHookObservation(state, observed), state, "observation must preserve consent, failure and execution state owners");
}
assert.deepEqual(pending, { requested: "enabled", effective: "decision_required", reason: "host_permission_unverified" });

async function transportFixture(respond, options = {}) {
  const requests = [];
  let killed = false;
  const result = await observeCodexHooks({ cwd, executable: "fixture-codex", timeoutMs: 50, ...options,
    spawnProcess(executable, args, spawnOptions) {
      assert.equal(executable, "fixture-codex");
      assert.deepEqual(args, ["app-server"]);
      assert.equal(spawnOptions.shell, false);
      assert.equal(spawnOptions.cwd, cwd);
      const child = new EventEmitter();
      child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
      child.kill = () => { killed = true; return true; };
      child.stdin.on("data", (chunk) => {
        const request = JSON.parse(chunk.toString());
        requests.push(request);
        queueMicrotask(() => respond(request, child));
      });
      return child;
    },
  });
  assert.equal(killed, true);
  assert.ok(requests.every(({ method }) => ["initialize", "initialized", "hooks/list"].includes(method)), "observer has no mutation or task-start RPC");
  return { result, requests };
}
const success = await transportFixture((request, child) => {
  if (request.id === 1) child.stdout.write('{"id":1,"result":{}}\n');
  if (request.id === 2) {
    child.stdout.write('{"method":"notification"}\n');
    const text = `${JSON.stringify(response())}\n`;
    child.stdout.write(text.slice(0, 20)); child.stdout.write(text.slice(20));
  }
});
assert.deepEqual(success.result, observed);
assert.deepEqual(success.requests.map(({ method }) => method), ["initialize", "initialized", "hooks/list"]);
assert.deepEqual(success.requests[2].params, { cwds: [cwd] });
for (const failure of [
  (_request, child) => child.emit("error", new Error("spawn failed")),
  (_request, child) => child.emit("close", 1),
  (_request, child) => child.stdin.emit("error", new Error("pipe closed")),
  (_request, child) => child.stdout.write("malformed\n"),
  (_request, child) => child.stdout.write("null\n"),
  (_request, child) => child.stdout.write('{"id":1,"error":{"code":-32601}}\n'),
  (_request, child) => child.stdout.write("x".repeat(2048)),
  (_request, child) => child.stderr.write("x".repeat(2048)),
  () => {},
]) assert.equal((await transportFixture(failure, { maxOutputBytes: 1024 })).result.status, "unavailable");
assert.equal((await observeCodexHooks({ spawnProcess() { throw new Error("missing executable"); } })).status, "unavailable");
assert.equal((await transportFixture((request, child) => {
  child.stdout.write(request.id === 1 ? '{"id":1,"result":{}}\n' : '{"id":2,"error":{"code":-32601}}\n');
})).result.status, "unavailable");

// General status preserves its target/delivery action and reports hook guidance in runtime_checks.
const statusBase = {
  installation: { status: "healthy", surface: "codex" }, repository: { status: "unresolved" },
  delivery: { status: "unresolved" }, runtime_checks: pending,
  next_action: { kind: "action", text: "Select the intended repository." },
};
const output = [];
assert.equal(await runCli(["status", "--surface", "codex", "--json"], {
  io: { log: (value) => output.push(value) }, evaluateStatusOverview: () => statusBase,
  observeCodexHookTrust: async () => observed,
}), 0);
const status = JSON.parse(output[0]);
assert.equal(status.runtime_checks.verification, "hook_trusted_session_unverified");
assert.match(status.next_action.text, /^Select the intended repository\./);
assert.match(status.runtime_checks.next_action, /already trusted/);
assert.equal(statusBase.runtime_checks, pending);
console.log("Codex hook observation tests passed.");
