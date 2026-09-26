import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { approveCodexDispatcher } from "../lib/runtime-check-consent/codex-plugin-consent.js";
import { parseArgs } from "../lib/cli/parse-args.js";
import { validateCommandOptions } from "../lib/cli/command-registry.js";
import { resolveHostCommand } from "../lib/host-command.js";

const configWith = server => ({ plugins: { "agdf@agdf": { enabled: true, mcp_servers: { agdf: server } } } });
async function fixture(config, { reject = false, noReadback = false, silent = false,
  userConfig = config, layers, keepEffective = false, launch = {} } = {}) {
  const requests = [];
  let killed = false;
  const result = await approveCodexDispatcher({ timeoutMs: 100, ...launch, spawnProcess(executable, args, options) {
    assert.deepEqual(args, launch.expectedArgs ?? ["app-server"]);
    if (launch.expectedExecutable) assert.equal(executable, launch.expectedExecutable);
    assert.equal(options.shell, false);
    const child = new EventEmitter();
    child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
    child.kill = () => { killed = true; };
    child.stdin.on("data", bytes => {
      const request = JSON.parse(String(bytes)); requests.push(request);
      if (silent || request.method === "initialized") return;
      let result = {};
      if (request.method === "config/read") {
        assert.equal(request.params.includeLayers, true);
        result = { config, layers: layers ?? [{ name: { type: "user", file: "/tmp/consent/config.toml" }, version: "v1", config: userConfig }] };
      }
      if (request.method === "config/value/write") {
        assert.equal(request.params.keyPath, 'plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode');
        assert.equal(request.params.value, "approve");
        assert.equal(request.params.filePath, "/tmp/consent/config.toml");
        assert.equal(request.params.expectedVersion, "v1");
        if (!noReadback) {
          userConfig = configWith({ tools: { agdf_dispatch: { approval_mode: "approve" } } });
          if (!keepEffective) config = userConfig;
        }
      }
      queueMicrotask(() => child.stdout.write(JSON.stringify(reject && request.method === "config/value/write"
        ? { id: request.id, error: { code: -1 } } : { id: request.id, result }) + "\n"));
    });
    return child;
  } });
  assert.equal(killed, true);
  return { result, writes: requests.filter(r => r.method === "config/value/write"), requests };
}
const enabled = await fixture(configWith({}));
assert.equal(enabled.result.status, "configured");
assert.equal(enabled.writes.length, 1);
assert.ok(enabled.requests.every(r => !JSON.stringify(r).includes("hooks")));
const existing = await fixture(configWith({ tools: { agdf_dispatch: { approval_mode: "approve" } } }));
assert.equal(existing.result.status, "configured");
assert.equal(existing.writes.length, 0);
const projectOnly = await fixture(configWith({ tools: { agdf_dispatch: { approval_mode: "approve" } } }), { userConfig: {} });
assert.equal(projectOnly.result.status, "configured");
assert.equal(projectOnly.writes.length, 1, "project approval must not skip the user write");
const falseReadback = await fixture(configWith({ tools: { agdf_dispatch: { approval_mode: "approve" } } }), { userConfig: {}, noReadback: true });
assert.equal(falseReadback.result.status, "failed", "merged approval must not mask failed user readback");
assert.equal((await fixture(configWith({ tools: { agdf_dispatch: { approval_mode: "prompt" } } }), { keepEffective: true })).result.reason, "policy_not_effective");
for (const layers of [[], {}, [{ name: { type: "user", profile: "work", file: "/tmp/work.config.toml" }, config: {}, version: "v1" }]]) {
  const invalid = await fixture({}, { layers });
  assert.equal(invalid.result.reason, "user_config_unverified");
  assert.equal(invalid.writes.length, 0);
}
const userDisabled = await fixture(configWith({}), { userConfig: configWith({ enabled: false }) });
assert.equal(userDisabled.result.status, "blocked");
assert.equal(userDisabled.writes.length, 0);
const windows = await fixture({}, { launch: {
  executable: "codex",
  resolveCommand(command) {
    return resolveHostCommand(command, { platform: "win32", env: { PATH: "C:\\bin", PATHEXT: ".CMD" },
      execPath: "C:\\node.exe", fs: {
        statSync: path => ({ isFile: () => path === "C:\\bin\\codex.cmd" }),
        readFileSync: () => '@echo off\nSET "_prog=node"\n"%_prog%" "%dp0%\\node_modules\\codex.js" %*',
      } });
  },
  expectedExecutable: "C:\\node.exe",
  expectedArgs: ["C:\\bin\\node_modules\\codex.js", "app-server"],
} });
assert.equal(windows.result.status, "configured");
const unsupported = await approveCodexDispatcher({ resolveCommand() { throw new Error("unsupported shim"); }, spawnProcess() { assert.fail("must not spawn"); } });
assert.equal(unsupported.status, "failed");
for (const server of [{ enabled: false }, { enabled_tools: [] }, { disabled_tools: ["agdf_dispatch"] }, { tools: { agdf_dispatch: { enabled: false } } }]) {
  const blocked = await fixture(configWith(server));
  assert.equal(blocked.result.status, "blocked"); assert.equal(blocked.writes.length, 0);
}
const disabled = configWith({}); disabled.plugins["agdf@agdf"].enabled = false;
assert.equal((await fixture(disabled)).result.status, "blocked");
assert.equal((await fixture(configWith({}), { reject: true })).result.reason, "host_rejected");
assert.equal((await fixture(configWith({}), { noReadback: true })).result.reason, "policy_not_effective");
assert.equal((await fixture({}, { silent: true })).result.reason, "timeout");
const parsed = parseArgs(["codex", "--accept-plugin-capabilities"]);
assert.equal(parsed.options.acceptPluginCapabilities, true);
assert.doesNotThrow(() => validateCommandOptions(parsed.options));
for (const target of ["claude", "status", "uninstall"]) assert.throws(() => validateCommandOptions({ target, acceptPluginCapabilities: true }));
for (const runtimeChecksDecision of ["manual", "cancel"]) assert.throws(() => validateCommandOptions({ target: "codex", acceptPluginCapabilities: true, runtimeChecksDecision }));
console.log("Codex plugin consent: exact tool policy, readback, disable preservation, failures and input validation passed.");
