// Bounded discovery in a disposable project context. No model turn or config write.
import { spawn } from 'node:child_process';
import { isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveHostCommand } from '../../host-command.js';

export function observeCodexOrigins({ target, all = false, command, spawnProcess = spawn, timeoutMs = 45_000 }) {
  if (typeof target !== 'string' || !isAbsolute(target)) return Promise.resolve({ status: 'unavailable', reason: 'target_invalid' });
  return new Promise(resolve => {
    let child, pending = '', received = 0, done = false, phase = 'initialize', threadId;
    const finish = result => {
      if (done) return;
      done = true; clearTimeout(timer); child?.kill(); resolve(result);
    };
    const timer = setTimeout(() => finish({ status: 'unavailable', reason: 'timeout' }), timeoutMs);
    const send = message => child.stdin.write(JSON.stringify(message) + '\n');
    try {
      const resolved = command ?? resolveHostCommand('codex', { env: process.env });
      child = spawnProcess(resolved.executable, [...resolved.prefixArgs, 'app-server'], { cwd: target, env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'], shell: false, windowsHide: true });
      child.on('error', () => finish({ status: 'unavailable', reason: 'spawn_failed' }));
      child.on('exit', () => finish({ status: 'unavailable', reason: 'process_exit' }));
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
            phase = 'project'; send({ method: 'initialized' });
            // Cwd on the process alone does not scope mcpServerStatus/list.
            // The context is in-memory and receives no turn/start or user message.
            send({ id: 2, method: 'thread/start', params: { cwd: target, ephemeral: true } });
          } else if (phase === 'project' && message.id === 2) {
            const context = message.result;
            if (message.error || typeof context?.thread?.id !== 'string' || !context.thread.id
              || context.cwd !== target || context.thread.cwd !== target || context.thread.ephemeral !== true)
              return finish({ status: 'unavailable', reason: 'project_context_unconfirmed' });
            threadId = context.thread.id; phase = 'inventory';
            send({ id: 3, method: 'mcpServerStatus/list', params: { threadId, detail: 'full', ...(all ? {} : { serverName: 'agdf-cockpit' }) } });
          } else if (phase === 'inventory' && message.id === 3) {
            const rows = message.result?.data;
            if (message.error || !Array.isArray(rows) || rows.length > 256 || message.result.nextCursor
              || rows.some(row => typeof row?.name !== 'string' || (row.pluginId != null && typeof row.pluginId !== 'string')))
              return finish({ status: 'unavailable', reason: 'inventory_unconfirmed' });
            finish({ status: 'observed', scope: { cwd: target, thread_id: threadId, ephemeral: true },
              providers: rows.map(row => ({ server_id: row.name, plugin_id: row.pluginId ?? null,
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
