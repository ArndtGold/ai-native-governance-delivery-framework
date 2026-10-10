import { spawn } from "node:child_process";
import process from "node:process";

const HASH = /^sha256:[a-f0-9]{64}$/;
const TRUST = new Set(["managed", "trusted", "modified", "untrusted"]);
const unavailable = () => ({ status: "unavailable" });

// Native metadata is permission evidence only. This client never starts a task,
// executes a hook, calculates a replacement trust hash or writes host settings.
export function parseCodexHookObservation(response, cwd) {
  const entries = response?.result?.data;
  if (response?.error || !Array.isArray(entries) || entries.length !== 1) return unavailable();
  const entry = entries[0];
  if (!entry || entry.cwd !== cwd || !Array.isArray(entry.hooks)
      || !Array.isArray(entry.errors) || entry.errors.length
      || !Array.isArray(entry.warnings) || entry.warnings.length) return unavailable();
  const hooks = entry.hooks.filter((hook) => hook?.pluginId === "agdf@agdf"
    && hook.eventName === "sessionStart");
  if (hooks.length !== 1) return unavailable();
  const hook = hooks[0];
  if (hook.source !== "plugin" || hook.handlerType !== "command"
      || typeof hook.enabled !== "boolean" || typeof hook.key !== "string" || !hook.key.trim()
      || typeof hook.currentHash !== "string" || !HASH.test(hook.currentHash) || !TRUST.has(hook.trustStatus)
      || (hook.trustStatus === "managed" && hook.isManaged !== true)) return unavailable();
  return {
    status: "observed",
    hook: { key: hook.key, enabled: hook.enabled, current_hash: hook.currentHash,
      trust_status: hook.trustStatus },
  };
}

export function observeCodexHooks({ cwd = process.cwd(), executable = "codex",
  env = process.env, spawnProcess = spawn, timeoutMs = 5000, maxOutputBytes = 1024 * 1024 } = {}) {
  return new Promise((resolve) => {
    let child;
    let timer;
    let settled = false;
    let phase = "initialize";
    let pending = "";
    let outputBytes = 0;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child?.stdin?.end(); } catch { /* Transport may already be closed. */ }
      try { child?.kill(); } catch { /* Process may already have exited. */ }
      resolve(result);
    };
    const send = (message) => {
      if (settled) return;
      try { child.stdin.write(`${JSON.stringify(message)}\n`); }
      catch { finish(unavailable()); }
    };
    try {
      child = spawnProcess(executable, ["app-server"], {
        cwd, env, stdio: ["pipe", "pipe", "pipe"], shell: false, windowsHide: true,
      });
      timer = setTimeout(() => finish(unavailable()), timeoutMs);
      child.on("error", () => finish(unavailable()));
      child.on("close", () => finish(unavailable()));
      child.stdin.on("error", () => finish(unavailable()));
      const countOutput = (chunk) => {
        outputBytes += Buffer.byteLength(chunk);
        if (outputBytes > maxOutputBytes) finish(unavailable());
      };
      child.stderr.on("data", countOutput);
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        countOutput(chunk);
        if (settled) return;
        pending += chunk;
        let newline;
        while (!settled && (newline = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, newline);
          pending = pending.slice(newline + 1);
          let message;
          try { message = JSON.parse(line); }
          catch { finish(unavailable()); break; }
          if (!message || typeof message !== "object") { finish(unavailable()); break; }
          if (phase === "initialize" && message.id === 1) {
            if (message.error || !message.result) { finish(unavailable()); break; }
            phase = "hooks";
            send({ method: "initialized" });
            send({ id: 2, method: "hooks/list", params: { cwds: [cwd] } });
          } else if (phase === "hooks" && message.id === 2) {
            finish(parseCodexHookObservation(message, cwd));
          }
        }
      });
      send({ id: 1, method: "initialize", params: {
        clientInfo: { name: "agdf_runtime_check_observer", version: "1" },
        capabilities: { experimentalApi: true, requestAttestation: false },
      } });
    } catch { finish(unavailable()); }
  });
}
