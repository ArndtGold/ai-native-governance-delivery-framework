import { parentPort, workerData } from 'node:worker_threads';
import { createDoctorReader } from './doctor-reader.js';
const reader = createDoctorReader(workerData.root, { limits: workerData.limits });
parentPort.postMessage({ phase: 'read_worker_ready' });
parentPort.on('message', ({ id, operation, input }) => {
  try {
    const result = operation === 'doctor_open' ? reader.open(input) : operation === 'doctor_page' ? reader.page(input)
      : (() => { throw Object.assign(Error('resource_denied'), { code: 'resource_denied' }); })();
    parentPort.postMessage({ id, result });
  } catch (e) { parentPort.postMessage({ id, error: e.code ?? 'read_failed' }); }
});
