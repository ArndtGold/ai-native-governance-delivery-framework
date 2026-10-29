// Explicit process adapter retained for historical owned packages.
import process from 'node:process';
import { startFacadeRuntime } from './facade-runtime.js';
if (!process.send || !process.argv[2] || process.argv[2].length > 65536) throw Error('AGDF_MCP_FACADE_INPUT_INVALID');
await startFacadeRuntime({ input: JSON.parse(process.argv[2]), channel: { on: (...args) => process.on(...args), send: (...args) => process.send(...args), close: () => process.disconnect() } });
