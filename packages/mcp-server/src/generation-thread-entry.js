// Genuine owner-hosted Worker; no public STDIO and no process impersonation.
import { parentPort, workerData } from 'node:worker_threads';
import { startGenerationRuntime } from './generation-runtime.js';
if (!parentPort) throw Error('generation_unavailable');
startGenerationRuntime({ epoch: workerData.epoch, generation: workerData.generation,
  channel: { on: (kind, listener) => parentPort.on(kind === 'disconnect' ? 'close' : kind,
    kind === 'message' ? wire => { try { listener(JSON.parse(wire)); } catch {} } : listener),
    send: value => parentPort.postMessage(JSON.stringify(value)), close: () => parentPort.close() } });
