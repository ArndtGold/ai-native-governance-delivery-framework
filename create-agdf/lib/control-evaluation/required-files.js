import { join } from "node:path";

export const doctorRequiredFiles = Object.freeze([
  join(".agdf", "control", "AGDF_RUN.md"),
  join(".agdf", "control", "MASTER_BACKLOG.md"),
  join(".agdf", "control", "SOT_REGISTRY.md"),
  join(".agdf", "control", "CONTEXT_GRAPH.md"),
  join(".agdf", "control", "AGENT_QUALITY_CONTRACTS.json"),
]);
