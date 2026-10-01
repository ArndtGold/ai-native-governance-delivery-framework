import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { RUN_ID_PATTERN } from "./run-state-parser.js";

export function pendingRunStepPath(root, runId) {
  if (!RUN_ID_PATTERN.test(runId)) throw new Error("AGDF_RUN_STATE_INVALID");
  return join(root, ".agdf", "control", "runs", runId, "RUN_STEP_PENDING.json");
}

export function pendingRunStepIds(root) {
  const directory = join(root, ".agdf", "control", "runs");
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((id) => RUN_ID_PATTERN.test(id)
    && existsSync(pendingRunStepPath(root, id)));
}
