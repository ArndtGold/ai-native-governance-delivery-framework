// Stable launcher-side owner; it loads no immutable SDK code itself. Loss of
// its host parent requests orderly shutdown, never deletion of active bytes.
import process from 'node:process';
import { EventEmitter } from 'node:events';
import { acquireMcpExecutableClaim } from './package.js';
import { supervisePluginMcpFacade } from './plugin-runtime.js';
import { superviseThreadMcpFacade } from './thread-owner.js';

if (!process.send || !process.connected || !process.argv[2] || process.argv[2].length > 65536) throw Error('AGDF_MCP_FACADE_INPUT_INVALID');
const input = JSON.parse(process.argv[2]);
const signals = new EventEmitter();
let stopRequested = false, supervising = false, releaseWaiting;
const stop = () => { stopRequested = true; releaseWaiting?.(null); if (supervising) signals.emit('SIGTERM'); };
process.on('disconnect', stop); process.on('SIGINT', stop); process.on('SIGTERM', stop);
process.on('message', message => { if (message?.kind === 'owner_stop' && message.token === input.token) stop(); });
try {
  const expected = input.await_runtime === true ? await new Promise((resolve, reject) => {
    const remaining = Math.max(0, Number(BigInt(input.deadline_ns) - process.hrtime.bigint()) / 1e6);
    const timer = setTimeout(() => finish(null, Error('AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED')), remaining);
    const start = message => { if (message?.kind === 'owner_start' && message.token === input.token) finish(message.runtime); };
    const finish = (runtime, error) => {
      clearTimeout(timer); process.off('message', start); releaseWaiting = undefined;
      if (error) reject(error); else resolve(runtime);
    };
    releaseWaiting = finish; process.on('message', start);
    if (stopRequested) finish(null);
    else process.send({ kind: 'owner_ready', token: input.token });
  }) : input.runtime;
  if (expected) {
    const publicationDeadline = performance.now() + Math.max(0, Number(BigInt(input.deadline_ns) - process.hrtime.bigint()) / 1e6);
    // Claim acquisition performs the full current server/dispatcher/SDK inspection
    // under the publication lock. Continue with its canonical observed paths.
    const claim = acquireMcpExecutableClaim(expected, { publicationDeadline });
    const runtime = { ...claim.verifiedRuntime, immutable: true, publication_id: expected.publication_id, publisher_root: expected.publisher_root };
    // Both SDK-free adapters load during owner bootstrap. There is no await
    // between the fresh lock-bound claim and actual executable Worker creation.
    const supervise = runtime.executionModel === 'owner_threads_v1' ? superviseThreadMcpFacade : supervisePluginMcpFacade;
    const ended = supervise({ ...input, runtime, env: process.env, claim, signals, deadlineNs: input.deadline_ns });
    supervising = true;
    if (stopRequested) signals.emit('SIGTERM');
    await ended;
  }
  if (process.connected) process.send({ kind: 'owner_closed', token: input.token, confirmed: true }, () => process.disconnect());
} catch (error) {
  process.exitCode = 1;
  const code = ['AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED', 'AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED',
    'AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED', 'AGDF_MCP_EXECUTABLE_CLAIM_INVALID'].includes(error?.message)
    ? error.message : 'AGDF_MCP_PLUGIN_RUNTIME_FAILED';
  if (process.connected) process.send({ kind: 'owner_failed', token: input.token, code }, () => process.disconnect());
}
