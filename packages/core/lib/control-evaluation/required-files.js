import { join } from 'node:path';
export const doctorRequiredFiles = Object.freeze([
  join('.agdf', 'control', 'SOT_REGISTRY.md'),
  join('.agdf', 'control', 'CONTEXT_GRAPH.md'),
  join('.agdf', 'control', 'AGENT_QUALITY_CONTRACTS.json'),
]);
// The single current model has one fixed inventory. Layout diagnosis belongs to
// the caller, including projects where canonical control is still absent.
export function requiredControlFiles() {
  return doctorRequiredFiles;
}
