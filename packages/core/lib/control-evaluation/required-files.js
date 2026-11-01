import { join } from "node:path";
import { readControlLayout, PLANNED_LAYOUT } from '../control-state/control-layout.js';

export const doctorRequiredFiles = Object.freeze([
  join(".agdf", "control", "AGDF_RUN.md"),
  join(".agdf", "control", "SOT_REGISTRY.md"),
  join(".agdf", "control", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
]);

export function requiredControlFiles(root) {
  return readControlLayout(root).layout === PLANNED_LAYOUT
    ? doctorRequiredFiles.filter(path => !path.endsWith('MASTER_BACKLOG.md')) : doctorRequiredFiles;
}
