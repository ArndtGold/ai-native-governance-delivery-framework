// Stable launcher-side owner; it loads no immutable SDK code itself. Loss of
// its host parent requests orderly shutdown, never deletion of active bytes.
import process from 'node:process';
import { dirname } from 'node:path';
import { EventEmitter } from 'node:events';
import { inspectMcpServerPackage, acquireMcpExecutableClaim } from './package.js';
import { supervisePluginMcpFacade } from './plugin-runtime.js';

if (!process.send || !process.connected || !process.argv[2] || process.argv[2].length > 65536) throw Error('AGDF_MCP_FACADE_INPUT_INVALID');
const input = JSON.parse(process.argv[2]), expected = input.runtime;
const signals = new EventEmitter();
let stopRequested = false, supervising = false;
const stop = () => { stopRequested = true; if (supervising) signals.emit('SIGTERM'); };
process.on('disconnect', stop); process.on('SIGINT', stop); process.on('SIGTERM', stop);
process.on('message', message => { if (message?.kind === 'owner_stop' && message.token === input.token) stop(); });
try {
  const actual = inspectMcpServerPackage({ dataRoot: dirname(expected.root), expectedVersion: expected.version });
  if (actual.status !== 'matched' || actual.root !== expected.root || actual.digest !== expected.digest
    || actual.dispatcherDigest !== expected.dispatcherDigest || actual.sdkDigest !== expected.sdkDigest) throw Error('AGDF_MCP_FACADE_IDENTITY_INVALID');
  const runtime = { ...actual, immutable: true, publication_id: expected.publication_id, publisher_root: expected.publisher_root };
  const publicationDeadline = performance.now() + Math.max(0, Number(BigInt(input.deadline_ns) - process.hrtime.bigint()) / 1e6);
  const claim = acquireMcpExecutableClaim(runtime, { publicationDeadline });
  const ended = supervisePluginMcpFacade({ ...input, runtime, env: process.env, claim, signals, deadlineNs: input.deadline_ns });
  supervising = true;
  if (stopRequested) signals.emit('SIGTERM');
  await ended;
  if (process.connected) process.send({ kind: 'owner_closed', token: input.token, confirmed: true }, () => process.disconnect());
} catch (error) {
  process.exitCode = 1;
  const code = ['AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED', 'AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED',
    'AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED', 'AGDF_MCP_EXECUTABLE_CLAIM_INVALID'].includes(error?.message)
    ? error.message : 'AGDF_MCP_PLUGIN_RUNTIME_FAILED';
  if (process.connected) process.send({ kind: 'owner_failed', token: input.token, code }, () => process.disconnect());
}
