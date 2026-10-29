import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,mkdtempSync,readdirSync,realpathSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {planGlobalUninstall,applyLifecyclePlan} from '../../lib/lifecycle/operations.js';
import {ensurePluginMcpRuntime,inspectPluginMcpDataRoot} from '../../lib/mcp-lifecycle/plugin-runtime.js';

// One actual process/retention harness shared by full and focused startup checks.
export async function assertFacadeExit(mode, {pluginRoot,offlineNpm}) {
  const killed = mode === 'killed' || mode === 'startup-killed';
  // Windows forcibly terminates a child sent SIGTERM; its owner must still
  // close the SDK through the disconnected private channel and prove exit.
  const terminated = mode === 'terminated' || mode === 'startup-stop';
  const expectedSignal = killed ? 'SIGKILL' : terminated && process.platform === 'win32' ? 'SIGTERM' : null;
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-real-facade-exit-')));
  const dataRoot = join(work, 'data/mcp/codex-plugin');
  let child, stderr = '';
  try {
    const prepared = ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
    await new Promise((resolve, reject) => {
      let pending = '', ready = false;
      const timer = setTimeout(() => { child?.stdin.end(); child?.kill(); reject(Error('facade_test_deadline:' + stderr)); }, 10000);
      child = spawn(process.execPath, [join(pluginRoot, 'mcp/agdf-mcp-launch.js'), '--surface', 'codex', '--data', dataRoot],
        { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
      child.stderr.on('data', bytes => { stderr += bytes; }); child.stdin.on('error', () => {});
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', (code, signal) => { clearTimeout(timer);
        if (!ready || (expectedSignal ? signal !== expectedSignal : code !== 0)) reject(Error('facade_exit:' + stderr));
        else resolve();
      });
      const send = message => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');
      child.stdout.on('data', bytes => { pending += bytes; let at;
        while ((at = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, at); pending = pending.slice(at + 1); let reply;
          try { reply = JSON.parse(line); } catch { continue; }
          if (reply.id === 1 && reply.result) { send({ method: 'notifications/initialized' }); send({ id: 2, method: 'tools/list', params: {} }); }
          if (reply.id === 2 && reply.result?.tools?.some(tool => tool.name === 'agdf_dispatch')) {
            ready = true;
            // The facade inherits this stdin; keep it open after a launcher
            // kill so only the private channel, not MCP EOF, can close it.
            if (mode === 'killed') child.kill('SIGKILL');
            else if (mode === 'terminated') child.kill('SIGTERM');
            else child.stdin.end();
          }
        }
      });
      if (mode.startsWith('startup-')) {
        // Cancel as soon as the owner acquired its claim, before SDK initialize.
        // An OS signal forwarded to the bootstrapping facade would lose both
        // its cleanup proof and the child's claim; the private message queues.
        void (async () => {
          const claims = join(prepared.root, '.agdf-executable-claims');
          const deadline = performance.now() + 9000;
          while ((!existsSync(claims) || !readdirSync(claims).length) && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
          if (!existsSync(claims) || !readdirSync(claims).length) throw Error('startup_claim_not_observed');
          ready = true; child.kill(killed ? 'SIGKILL' : 'SIGTERM');
        })().catch(reject);
      } else send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'owned-exit-regression', version: '1' } } });
    });
    const deadline = performance.now() + 10000;
    while (inspectPluginMcpDataRoot(dataRoot) === 'protected' && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(inspectPluginMcpDataRoot(dataRoot), 'owned', `${process.platform}/${mode}: the direct owner must acknowledge and observe facade exit even after its host launcher is killed; ${stderr}`);
    const plan = planGlobalUninstall('codex', { env: { AGDF_DATA_DIR: join(work, 'data') } });
    assert.equal(applyLifecyclePlan(plan, { exec() {} }).status, 'success');
    assert.equal(existsSync(dataRoot), false, 'the production cleanup owner removes only the now-retirable runtime');
    console.log(`PASS real facade ${process.platform}/${mode}: confirmed exit, released claims and complete uninstall`);
  } finally {
    child?.stdin.end();
    if (!existsSync(dataRoot) || inspectPluginMcpDataRoot(dataRoot) === 'owned') rmSync(work, { recursive: true, force: true });
  }
}
