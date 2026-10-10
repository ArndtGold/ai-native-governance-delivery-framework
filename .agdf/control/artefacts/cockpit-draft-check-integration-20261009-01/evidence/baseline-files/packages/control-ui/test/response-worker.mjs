import { parentPort } from 'node:worker_threads';
parentPort.on('message', ({ id, selector }) => parentPort.postMessage({ id, result: { content: 'a'.repeat(Number(selector.slice(8))) } }));
