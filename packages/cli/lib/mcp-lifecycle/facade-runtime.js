// Private child of the installed launcher. Public input remains MCP STDIO only.
import process from 'node:process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMcpGenerationPublisher } from './package.js';

export async function startFacadeRuntime({ input, channel, generationTransport, signals = process }) {
  const { runtime: expected, surface, cockpitDir, cockpitMode, pluginRoot, token, deadline_ns } = input;
  let handle, stopRequested = false;
  const stop = () => { stopRequested = true; if (handle) void handle.close(); };
  channel.on('message', message => { if (message?.kind === 'facade_stop' && message.token === token) stop(); });
  channel.on('disconnect', stop); signals.on('SIGINT', stop); signals.on('SIGTERM', stop);
  // The parent freshly claims the complete immutable image immediately before
  // creating this actual executable. These are expected identities, not a reused
  // observation. The SDK-free main/protocol load performs its own full fresh
  // inspection and binds that producer below, before any SDK import/service.
  const runtime = { ...expected, immutable: true };
  process.env.AGDF_DISPATCH_PLUGIN_ROOT = pluginRoot;
  const { runMcpServer } = await import(pathToFileURL(join(runtime.packageRoot, 'src/main.js')));
  handle = await runMcpServer({ surface, cockpitDir, cockpitMode, ownedPublication: runtime,
    generationTransport, ownedPublisher: createMcpGenerationPublisher(runtime, {
      publicationDeadline: performance.now() + Math.max(0, Number(BigInt(deadline_ns) - process.hrtime.bigint()) / 1e6),
    }), onClosed(result) {
      channel.send({ kind: 'facade_closed', token, confirmed: result?.confirmed === true }, () => channel.close());
    } });
  if (!handle) throw Error('AGDF_MCP_FACADE_START_UNCONFIRMED');
  if (stopRequested) await handle.close();

}
