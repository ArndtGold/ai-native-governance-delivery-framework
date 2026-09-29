import { spawn } from "node:child_process";
import process from "node:process";
import { isAbsolute } from "node:path";
import { resolveHostCommand } from "../host-command.js";

export const CODEX_DISPATCH_POLICY_KEY = 'plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode';
const KEY = CODEX_DISPATCH_POLICY_KEY;
const policy = config => config?.plugins?.["agdf@agdf"]?.mcp_servers?.agdf;

const approvalMode = config => policy(config)?.tools?.agdf_dispatch?.approval_mode;
const blocked = config => {
  const plugin = config?.plugins?.["agdf@agdf"];
  const server = policy(config);
  return plugin?.enabled === false || server?.enabled === false
    || server?.tools?.agdf_dispatch?.enabled === false
    || (Array.isArray(server?.enabled_tools) && !server.enabled_tools.includes("agdf_dispatch"))
    || server?.disabled_tools?.includes("agdf_dispatch");
};

// Only the documented plugin-scoped tool policy is written by Codex itself. No hook trust hashes,
// global approvals, sandbox settings, server commands or other plugins are changed here.
export function approveCodexDispatcher(options = {}) {
  return updateUserToolPolicy(options, {
    success: "configured",
    decide(config, userConfig, phase) {
      if (blocked(config) || blocked(userConfig)) return { finish: ["blocked", "existing_disable_preserved"] };
      if (approvalMode(config) === "approve" && approvalMode(userConfig) === "approve") return { finish: ["configured", "none"] };
      if (phase === 4) return { finish: ["failed", "policy_not_effective"] };
      return { write: "approve" };
    },
  });
}

// Uninstall counterpart: removes only the approval AGDF wrote, through the same native API, and
// reports a key Codex keeps as retained instead of claiming a clean removal.
export function revokeCodexDispatcher(options = {}) {
  return updateUserToolPolicy(options, {
    success: "removed",
    decide(_config, userConfig, phase) {
      if (approvalMode(userConfig) === undefined) return { finish: [phase === 2 ? "absent" : "removed", "none"] };
      if (phase === 4) return { finish: ["retained", "policy_not_removed"] };
      return { write: null };
    },
  });
}

function updateUserToolPolicy({ env = process.env, cwd = process.cwd(),
  executable = env.CODEX_BIN || "codex", spawnProcess = spawn, timeoutMs = 15000,
  resolveCommand = resolveHostCommand } = {}, { success, decide }) {
  return new Promise(resolve => {
    let child, timer, pending = "", bytes = 0, settled = false, phase = 1;
    let writeAttempted = false, userFile;
    const finish = (status, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child?.stdin?.end(); child?.kill(); } catch {}
      resolve({ status, reason, tool: "agdf_dispatch", policy_key: KEY, config_file: userFile,
        write_attempted: writeAttempted,
        verification: [success, "absent"].includes(status) ? "config_readback" : "unverified" });
    };
    const send = (method, params) => {
      try { child.stdin.write(`${JSON.stringify({ id: phase, method, params })}\n`); }
      catch { finish("failed", "transport_failed"); }
    };
    const read = () => send("config/read", { includeLayers: true, cwd });
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
            const decision = decide(config, user.config, phase);
            if (decision.finish) { finish(...decision.finish); break; }
            phase = 3; writeAttempted = true;
            send("config/value/write", { keyPath: KEY, value: decision.write, mergeStrategy: "replace",
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
