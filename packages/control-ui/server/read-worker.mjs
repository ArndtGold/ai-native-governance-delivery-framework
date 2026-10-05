import { parentPort, workerData } from 'node:worker_threads';
import { createCockpitReader } from '../../core/lib/control-inspect/cockpit.js';
const reader = createCockpitReader(workerData.root);
parentPort.on('message', ({ id, operation, selector, snapshot }) => {
  try {
    const result = operation === 'snapshot' ? reader.snapshot()
      : operation === 'run' ? reader.run(selector, snapshot)
      : operation === 'document' ? reader.document(selector, snapshot)
      : reader.freshness(snapshot);
    parentPort.postMessage({ id, result });
  } catch (error) { parentPort.postMessage({ id, error: error.code }); }
});
