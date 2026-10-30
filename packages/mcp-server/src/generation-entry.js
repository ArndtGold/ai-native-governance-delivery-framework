// Explicit process adapter retained for undeclared/direct runtimes.
import process from 'node:process';
import { startGenerationRuntime } from './generation-runtime.js';
startGenerationRuntime({ epoch: process.argv[2], generation: Number(process.argv[3]), channel: { on: (...args) => process.on(...args), send: value => process.send?.(value), close: () => process.disconnect() } });
