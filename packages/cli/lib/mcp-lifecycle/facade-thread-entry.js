import { parentPort, workerData } from 'node:worker_threads';
import { createOwnerClient } from './owner-client.js';
import { startFacadeRuntime } from './facade-runtime.js';
if (!parentPort) throw Error('AGDF_MCP_FACADE_INPUT_INVALID');
const client = createOwnerClient(parentPort, workerData.binding);
await startFacadeRuntime({ input: workerData.input, generationTransport: client,
  channel: { ...client.lifecycle, close() {
    // Node's Worker stdin retains its internal port until readable EOF. The SDK
    // has stopped reading after close; drain the owner's final EOF naturally.
    process.stdin.resume(); client.lifecycle.close();
  } } });
