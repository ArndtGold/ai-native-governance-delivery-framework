import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { parseRunState, RUN_ID_PATTERN } from "./run-state-parser.js";
export function runPath(root, id) {
  if (!RUN_ID_PATTERN.test(id)) throw Error(`invalid run_id: ${id}`);
  return join(root, ".agdf", "control", "runs", id, "RUN_STATE.md");
}
export function discoverRuns(root) {
  const dir = join(root, ".agdf", "control", "runs");
  if (!existsSync(dir)) return [];
  const rootStats = lstatSync(dir);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    return [invalidRun("<repository>", dir)];
  }
  return readdirSync(dir)
    .filter((x) => !x.startsWith("."))
    .sort()
    .map((id) => {
      const d = join(dir, id),
        path = join(d, "RUN_STATE.md");
      const directoryStats = lstatSync(d);
      if (
        !RUN_ID_PATTERN.test(id) ||
        directoryStats.isSymbolicLink() ||
        !directoryStats.isDirectory() ||
        !existsSync(path)
      )
        return invalidRun(id, path);

      const stateStats = lstatSync(path);
      if (stateStats.isSymbolicLink() || !stateStats.isFile()) {
        return invalidRun(id, path);
      }
      return {
        run_id: id,
        path,
        ...parseRunState(readFileSync(path, "utf8"), id),
      };
    });
}

function invalidRun(runId, path) {
  return {
    run_id: runId,
    path,
    valid: false,
    findings: [{ code: "AGDF_RUN_PATH_INVALID", path }],
  };
}
const DEFAULT_BODY = `## Objective\n\nDescribe the trustworthy outcome.\n\n## Current Control State\n\n| Question | Answer |\n|---|---|\n| What is known? | New run created. |\n| What is approved? | Nothing yet. |\n| What is missing? | Durable UR and exact approval. |\n| What is the next allowed action? | Draft the UR. |\n| What is explicitly forbidden right now? | Later artefacts and implementation. |\n\n## Evidence\n\n| Evidence | Source | Covers | Strength |\n|---|---|---|---|\n| Run creation | run-create | Control initialization | direct |\n\n## Closeout\n\n- next_allowed_action: Draft the UR.\n- quality_outlook: Establish evidence before later gates.\n`;
export function renderRunState(id, body = DEFAULT_BODY, meta = {}) {
  return `# AGDF Run State\n\n## Run Meta\n\n- control_state_version: 2\n- run_id: ${id}\n- lifecycle: ${meta.lifecycle ?? "active"}\n- revision: 1\n- revision_id: ${randomUUID()}\n- mode: ${meta.mode ?? "structured_delivery"}\n- current_gate: ${meta.current_gate ?? "UR"}\n- decision: ${meta.decision ?? "in_progress"}\n- owner: ${meta.owner ?? "agent"}\n\n${body}`;
}
export function createRun(root, id, body = "") {
  const path = runPath(root, id);
  if (existsSync(path)) throw Error("AGDF_RUN_COLLISION");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderRunState(id, body), { flag: "wx" });
  return path;
}
