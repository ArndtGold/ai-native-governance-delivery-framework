#!/usr/bin/env node
// Reads Codex's own hook metadata (app-server `hooks/list`) for one plugin, so the native probes do not
// depend on a manually counted /hooks listing. Read-only: it never starts a task, runs a hook or
// changes trust. The codex binary and CODEX_HOME come from the environment of the caller.
//
// Usage: node codex-hooks-list.mjs <cwd> <pluginId> [codex-binary]
// Output: one JSON line {status, count, hooks:[{event, trust, enabled, source, handler}]}
import { spawn } from "node:child_process";
import process from "node:process";

const [cwd, pluginId, executable = process.env.CODEX_BIN || "codex"] = process.argv.slice(2);
if (!cwd || !pluginId) {
  console.log(JSON.stringify({ status: "usage", message: "node codex-hooks-list.mjs <cwd> <pluginId> [codex-binary]" }));
  process.exit(2);
}

const finish = (result) => { console.log(JSON.stringify(result)); process.exit(0); };
const child = spawn(executable, ["app-server"], { cwd, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
const timer = setTimeout(() => { child.kill(); finish({ status: "timeout" }); }, 20000);
child.on("error", (error) => { clearTimeout(timer); finish({ status: "unavailable", message: error.message }); });
const send = (message) => child.stdin.write(`${JSON.stringify(message)}\n`);
let pending = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  pending += chunk;
  let newline;
  while ((newline = pending.indexOf("\n")) !== -1) {
    const line = pending.slice(0, newline);
    pending = pending.slice(newline + 1);
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    if (message.id === 1) {
      if (message.error) { clearTimeout(timer); child.kill(); finish({ status: "initialize_failed", message: message.error.message ?? null }); }
      send({ method: "initialized" });
      send({ id: 2, method: "hooks/list", params: { cwds: [cwd] } });
    } else if (message.id === 2) {
      clearTimeout(timer);
      child.kill();
      if (message.error) finish({ status: "hooks_list_failed", message: message.error.message ?? null });
      const entries = Array.isArray(message.result?.data) ? message.result.data : [];
      const hooks = entries.flatMap((entry) => (Array.isArray(entry.hooks) ? entry.hooks : []))
        .filter((hook) => hook?.pluginId === pluginId)
        .map((hook) => ({ event: hook.eventName, trust: hook.trustStatus, enabled: hook.enabled, source: hook.source, handler: hook.handlerType }));
      const errors = entries.flatMap((entry) => (Array.isArray(entry.errors) ? entry.errors : []));
      finish({ status: "observed", count: hooks.length, hooks, ...(errors.length ? { errors } : {}) });
    }
  }
});
send({ id: 1, method: "initialize", params: {
  clientInfo: { name: "agdf_native_probe", version: "1" },
  capabilities: { experimentalApi: true, requestAttestation: false },
} });
