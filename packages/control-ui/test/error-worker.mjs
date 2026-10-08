import { parentPort } from 'node:worker_threads';
parentPort.on('message', () => { throw Error('internal-error-must-not-leak'); });
