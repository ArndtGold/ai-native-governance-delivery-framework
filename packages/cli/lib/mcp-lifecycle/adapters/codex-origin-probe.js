// Bounded discovery in a disposable project context. No model turn or config write.
import { spawn } from 'node:child_process';
import { isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveHostCommand } from '../../host-command.js';
import { CODEX_MCP_STARTUP_ARGS, independentCodexEnvironment } from '../../host-adapters/codex/mcp-startup.js';

export function codexStartupConfiguration(result) {
  const key = 'mcp_optional_startup_grace_ms', value = result?.config?.[key];
  const observed = Number.isSafeInteger(value) && value >= 0;
  const type = result?.origins?.[key]?.name?.type;
  const kind = ['user', 'project', 'system', 'sessionFlags', 'commandLine', 'profile', 'default'].includes(type) ? type : null;
  // Never return config/layers: they may contain credentials, commands or policy.
  return { status: observed ? 'observed' : 'unknown', wait_ms: observed ? value : null,
    origin: kind ? { kind } : null, reason: !observed ? 'setting_not_exposed' : !kind ? 'origin_not_exposed' : null };
}

export function observeCodexOrigins({ target, all = false, mode = 'catalog', env = process.env,
  command, spawnProcess = spawn, timeoutMs = 45_000, now = Date.now, configurationObserver = () => {} }) {
  if (typeof target !== 'string' || !isAbsolute(target)) return Promise.resolve({ status: 'unavailable', reason: 'target_invalid' });
  if (!['catalog', 'configuration'].includes(mode)) return Promise.resolve({ status: 'unavailable', reason: 'mode_invalid' });
  return new Promise(resolve => {
    let child, pending = '', received = 0, done = false, phase = 'initialize', threadId, closing, closeTimer, pollTimer, inventoryId = 3;
    const deadline = now() + timeoutMs;
    const finish = result => {
      if (done) return;
      done = true; clearTimeout(timer); clearTimeout(pollTimer);
      if (!child) { resolve(result); return; }
      if (child.exitCode != null || child.signalCode != null) {
        resolve(child.exitCode === 0 && child.signalCode === null ? result : { status: 'unavailable', reason: 'teardown_unconfirmed' }); return;
      }
      closing = result;
      const remaining = Math.min(2000, deadline - now());
      if (remaining <= 0) { child.kill(); resolve(result.status === 'observed' ? { status: 'unavailable', reason: 'teardown_unconfirmed' } : result); return; }
      closeTimer = setTimeout(() => { child.kill(); resolve({ status: 'unavailable', reason: 'teardown_unconfirmed' }); }, remaining);
      try { child.stdin.end(); } catch { clearTimeout(closeTimer); child.kill(); resolve({ status: 'unavailable', reason: 'teardown_unconfirmed' }); }
    };
    const timer = setTimeout(() => finish({ status: 'unavailable', reason: 'timeout' }), timeoutMs);
    const send = message => child.stdin.write(JSON.stringify(message) + '\n');
    try {
      const resolved = command ?? resolveHostCommand(env.CODEX_BIN || 'codex', { env });
      child = spawnProcess(resolved.executable, [...resolved.prefixArgs, ...(mode === 'catalog' ? CODEX_MCP_STARTUP_ARGS : []), 'app-server'], { cwd: target, env: independentCodexEnvironment(env),
        stdio: ['pipe', 'pipe', 'pipe'], shell: false, windowsHide: true });
      child.on('error', () => finish({ status: 'unavailable', reason: 'spawn_failed' }));
      child.on('exit', (code, signal) => {
        if (closing) { clearTimeout(closeTimer); resolve(code === 0 && !signal ? closing : { status: 'unavailable', reason: 'teardown_unconfirmed' }); }
        else finish({ status: 'unavailable', reason: 'process_exit' });
      });
      child.stderr.on('data', () => {});
      child.stdin.on('error', () => finish({ status: 'unavailable', reason: 'stdin_failed' }));
      child.stdout.on('data', chunk => {
        received += Buffer.byteLength(chunk); pending += String(chunk);
        if (received > 1024 * 1024) return finish({ status: 'unavailable', reason: 'response_limit' });
        let newline;
        while (!done && (newline = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
          let message; try { message = JSON.parse(line); } catch { continue; }
          if (phase === 'initialize' && message.id === 1) {
            if (message.error) return finish({ status: 'unavailable', reason: 'initialize_failed' });
            send({ method: 'initialized' });
            if (mode === 'configuration') {
              phase = 'configuration'; send({ id: 2, method: 'config/read', params: { includeLayers: true, cwd: target } });
              continue;
            }
            phase = 'project';
            // Cwd on the process alone does not scope mcpServerStatus/list.
            // The context is in-memory and receives no turn/start or user message.
            send({ id: 2, method: 'thread/start', params: { cwd: target, ephemeral: true } });
          } else if (phase === 'configuration' && message.id === 2) {
            // Private observer seam for the native harness's configured-model
            // attestation. Status still returns only its whitelisted wait facts.
            try { if (!message.error) configurationObserver(message.result); }
            catch { return finish({ status: 'unavailable', reason: 'configuration_observer_failed' }); }
            finish(message.error ? { status: 'unknown', wait_ms: null, origin: null, reason: 'config_read_unsupported' }
              : codexStartupConfiguration(message.result));
          } else if (phase === 'project' && message.id === 2) {
            const context = message.result;
            if (message.error || typeof context?.thread?.id !== 'string' || !context.thread.id
              || context.cwd !== target || context.thread.cwd !== target || context.thread.ephemeral !== true)
              return finish({ status: 'unavailable', reason: 'project_context_unconfirmed' });
            threadId = context.thread.id; phase = 'inventory';
            // The temporary context owns every connection it starts. A narrow
            // server filter can finish while another SDK is still handshaking;
            // collect the complete settled inventory before closing the host.
            send({ id: 3, method: 'mcpServerStatus/list', params: { threadId, detail: 'full' } });
          } else if (phase === 'inventory' && message.id === inventoryId) {
            const rows = message.result?.data;
            if (message.error || !Array.isArray(rows) || rows.length > 256 || message.result.nextCursor
              || rows.some(row => typeof row?.name !== 'string' || (row.pluginId != null && typeof row.pluginId !== 'string')))
              return finish({ status: 'unavailable', reason: 'inventory_unconfirmed' });
            if (rows.some(row => ['starting', 'connecting'].includes(row.runtimeStatus))) {
              pollTimer = setTimeout(() => send({ id: ++inventoryId, method: 'mcpServerStatus/list',
                params: { threadId, detail: 'full' } }), 100);
              continue;
            }
            finish({ status: 'observed', scope: { cwd: target, thread_id: threadId, ephemeral: true },
              providers: rows.filter(row => all || row.name === 'agdf-cockpit').map(row => ({ server_id: row.name, plugin_id: row.pluginId ?? null,
                runtime_status: row.runtimeStatus, tools: Object.keys(row.tools ?? {}) })) });
          }
        }
      });
      send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'agdf_cockpit_origin', version: '1' },
        capabilities: { experimentalApi: true, requestAttestation: false } } });
    } catch { finish({ status: 'unavailable', reason: 'launch_failed' }); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await observeCodexOrigins({ target: process.argv[2], all: process.argv[3] === '--all' });
  process.stdout.write(JSON.stringify(result) + '\n');
}
