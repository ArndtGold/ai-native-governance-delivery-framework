import { spawn } from "node:child_process";
import process from "node:process";
import { isAbsolute } from "node:path";
import { resolveHostCommand } from "../host-command.js";

const KEY = 'plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode';
const policy = config => config?.plugins?.["agdf@agdf"]?.mcp_servers?.agdf;

// Only the documented plugin-scoped tool policy is written by Codex itself. No hook trust hashes,
// global approvals, sandbox settings, server commands or other plugins are changed here.
export function approveCodexDispatcher({ env = process.env, cwd = process.cwd(),
  executable = env.CODEX_BIN || "codex", spawnProcess = spawn, timeoutMs = 15000,
  resolveCommand = resolveHostCommand } = {}) {
  return new Promise(resolve => {
    let child, timer, pending = "", bytes = 0, settled = false, phase = 1;
    let writeAttempted = false, userFile;
    const finish = (status, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child?.stdin?.end(); child?.kill(); } catch {}
      resolve({ status, reason, tool: "agdf_dispatch", policy_key: KEY,
        write_attempted: writeAttempted, verification: status === "configured" ? "config_readback" : "unverified" });
    };
    const send = (method, params) => {
      try { child.stdin.write(`${JSON.stringify({ id: phase, method, params })}\n`); }
      catch { finish("failed", "transport_failed"); }
    };
    const read = () => send("config/read", { includeLayers: true, cwd });
    const blocked = config => {
      const plugin = config?.plugins?.["agdf@agdf"];
      const server = policy(config);
      return plugin?.enabled === false || server?.enabled === false
        || server?.tools?.agdf_dispatch?.enabled === false
        || (Array.isArray(server?.enabled_tools) && !server.enabled_tools.includes("agdf_dispatch"))
        || server?.disabled_tools?.includes("agdf_dispatch");
    };
    try {
      const command = resolveCommand(executable, { env });
      child = spawnProcess(command.executable, [...command.prefixArgs, "app-server"], { cwd, env, stdio: ["pipe", "pipe", "pipe"], shell: false, windowsHide: true });
      timer = setTimeout(() => finish("failed", writeAttempted ? "write_outcome_unverified" : "timeout"), timeoutMs);
      child.on("error", () => finish("failed", "transport_failed"));
      child.on("close", () => finish("failed", "transport_closed"));
      child.stdin.on("error", () => finish("failed", "transport_failed"));
      const count = chunk => { bytes += Buffer.byteLength(chunk); if (bytes > 4 * 1024 * 1024) finish("failed", "output_limit"); };
      child.stderr.on("data", count);
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", chunk => {
        if (settled) return;
        count(chunk);
        pending += chunk;
        let newline;
        while (!settled && (newline = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
          let message;
          try { message = JSON.parse(line); } catch { finish("failed", "invalid_response"); break; }
          if (!message || typeof message !== "object") { finish("failed", "invalid_response"); break; }
          if (message.id !== phase) continue;
          if (message.error || !message.result) { finish("failed", "host_rejected"); break; }
          if (phase === 1) {
            child.stdin.write(`${JSON.stringify({ method: "initialized" })}\n`);
            phase = 2; read();
          } else if (phase === 2 || phase === 4) {
            const config = message.result.config;
            if (!config || typeof config !== "object" || Array.isArray(config)) { finish("failed", "invalid_config_readback"); break; }
            // A project/profile override is not evidence of global installation consent.
            const users = Array.isArray(message.result.layers)
              ? message.result.layers.filter(layer => layer?.name?.type === "user" && !layer.name.profile) : [];
            const user = users?.length === 1 ? users[0] : null;
            if (!user || user.disabledReason || typeof user.name.file !== "string" || !isAbsolute(user.name.file)
                || typeof user.version !== "string" || !user.version || !user.config || typeof user.config !== "object"
                || Array.isArray(user.config) || (userFile && userFile !== user.name.file)) {
              finish("failed", "user_config_unverified"); break;
            }
            userFile = user.name.file;
            if (blocked(config) || blocked(user.config)) { finish("blocked", "existing_disable_preserved"); break; }
            if (policy(config)?.tools?.agdf_dispatch?.approval_mode === "approve"
                && policy(user.config)?.tools?.agdf_dispatch?.approval_mode === "approve") {
              finish("configured", "none"); break;
            }
            if (phase === 4) { finish("failed", "policy_not_effective"); break; }
            phase = 3; writeAttempted = true;
            send("config/value/write", { keyPath: KEY, value: "approve", mergeStrategy: "replace",
              filePath: userFile, expectedVersion: user.version });
          } else if (phase === 3) {
            phase = 4; read();
          }
        }
      });
      send("initialize", { clientInfo: { name: "agdf_plugin_consent", version: "1" }, capabilities: { experimentalApi: true } });
    } catch { finish("failed", "transport_failed"); }
  });
}
