// Private child of the installed launcher. Public input remains MCP STDIO only.
import process from 'node:process';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectMcpServerPackage, createMcpGenerationPublisher } from './package.js';

if (!process.send || !process.argv[2] || process.argv[2].length > 65536) throw Error('AGDF_MCP_FACADE_INPUT_INVALID');
const { runtime: expected, surface, cockpitDir, cockpitMode, pluginRoot, token, deadline_ns } = JSON.parse(process.argv[2]);
let handle, stopRequested = false;
const stop = () => { stopRequested = true; if (handle) void handle.close(); };
process.on('message', message => { if (message?.kind === 'facade_stop' && message.token === token) stop(); });
process.on('disconnect', stop); process.on('SIGINT', stop); process.on('SIGTERM', stop);
const actual = inspectMcpServerPackage({ dataRoot: dirname(expected.root), expectedVersion: expected.version });
if (actual.status !== 'matched' || actual.root !== expected.root || actual.digest !== expected.digest
  || actual.dispatcherDigest !== expected.dispatcherDigest || actual.sdkDigest !== expected.sdkDigest) throw Error('AGDF_MCP_FACADE_IDENTITY_INVALID');
const runtime = { ...actual, immutable: true, publication_id: expected.publication_id, publisher_root: expected.publisher_root };
process.env.AGDF_DISPATCH_PLUGIN_ROOT = pluginRoot;
const { runMcpServer } = await import(pathToFileURL(join(runtime.packageRoot, 'src/main.js')));
handle = await runMcpServer({ surface, cockpitDir, cockpitMode, ownedPublication: runtime,
  ownedPublisher: createMcpGenerationPublisher(runtime, {
    publicationDeadline: performance.now() + Math.max(0, Number(BigInt(deadline_ns) - process.hrtime.bigint()) / 1e6),
  }), onClosed(result) {
    process.send?.({ kind: 'facade_closed', token, confirmed: result?.confirmed === true }, () => process.disconnect());
  } });
if (!handle) throw Error('AGDF_MCP_FACADE_START_UNCONFIRMED');
if (stopRequested) await handle.close();
