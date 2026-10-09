import { parentPort } from 'node:worker_threads';
parentPort.on('message', request => setTimeout(() => parentPort.postMessage({ id: request.id, result: { operation: request.operation } }), 100));
