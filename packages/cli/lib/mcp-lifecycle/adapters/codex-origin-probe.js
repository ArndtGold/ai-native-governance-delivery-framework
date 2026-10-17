// Bounded read of Codex's own connection attribution. No model, hooks or config writes.
import { spawn } from 'node:child_process';
import { resolveHostCommand } from '../../host-command.js';

const target = process.argv[2];
const command = resolveHostCommand('codex', { env: process.env });
const child = spawn(command.executable, [...command.prefixArgs, 'app-server'], { cwd: target, env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'], shell: false, windowsHide: true });
let pending = '', received = 0, done = false;
const finish = result => {
  if (done) return;
  done = true; clearTimeout(timer); child.kill();
  process.stdout.write(JSON.stringify(result) + '\n');
};
const timer = setTimeout(() => finish({ status: 'unavailable' }), 12_000);
const send = message => child.stdin.write(JSON.stringify(message) + '\n');
child.on('error', () => finish({ status: 'unavailable' }));
child.on('exit', () => finish({ status: 'unavailable' }));
child.stderr.on('data', () => {});
child.stdin.on('error', () => finish({ status: 'unavailable' }));
child.stdout.on('data', chunk => {
  received += Buffer.byteLength(chunk);
  pending += String(chunk);
  if (received > 1024 * 1024) return finish({ status: 'unavailable' });
  let newline;
  while ((newline = pending.indexOf('\n')) !== -1) {
    const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
    let message; try { message = JSON.parse(line); } catch { continue; }
    if (message.id === 1) {
      if (message.error) return finish({ status: 'unavailable' });
      send({ method: 'initialized' });
      send({ id: 2, method: 'mcpServerStatus/list', params: { serverName: 'agdf-cockpit', detail: 'full' } });
    } else if (message.id === 2) {
      const rows = message.result?.data;
      if (message.error || !Array.isArray(rows) || rows.length > 256 || message.result.nextCursor)
        return finish({ status: 'unavailable' });
      finish({ status: 'observed', providers: rows.map(row => ({ server_id: row.name, plugin_id: row.pluginId ?? null })) });
    }
  }
});
send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'agdf_cockpit_origin', version: '1' },
  capabilities: { experimentalApi: true, requestAttestation: false } } });
