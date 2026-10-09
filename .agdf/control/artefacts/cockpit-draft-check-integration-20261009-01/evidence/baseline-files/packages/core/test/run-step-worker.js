import { readFileSync } from "node:fs";
import { parseRunState } from "../lib/control-state/run-state-parser.js";
import { recordRunStep } from "../lib/control-state/run-steps.js";
import { policyForRunContent } from "../lib/control-evaluation/run-step-policy.js";

const [root, runId] = process.argv.slice(2);
if (!root || !runId) throw new Error("run-step worker requires root and run id");
const state = `${root}/.agdf/control/runs/${runId}/RUN_STATE.md`;
for (let attempt = 0; attempt < 100; attempt += 1) {
  const revisionId = parseRunState(readFileSync(state, "utf8"), runId).meta.revision_id;
  const result = recordRunStep(root, { runId, revisionId, step: "ur", title: runId },
    { policy: policyForRunContent, date: "2026-09-29" });
  if (result.outcome === "recorded") process.exit(0);
  if (result.reason !== "run_write_locked") throw new Error(JSON.stringify(result));
  await new Promise((resolve) => setTimeout(resolve, 10));
}
throw new Error("run-step worker lock retry exhausted");
