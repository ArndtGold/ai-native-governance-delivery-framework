import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluatePrdReadiness } from "../lib/control-evaluation/prd-readiness.js";

// PRD approval requires a named owner and every before_prd decision resolved in one explicit table.
const root = mkdtempSync(join(tmpdir(), "agdf-prd-readiness-"));
const path = ".agdf/control/artefacts/run/PRD.md";
mkdirSync(join(root, ".agdf", "control", "artefacts", "run"), { recursive: true });
const runState = { artefacts: new Map([["PRD", { path }]]) };
const header = "| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n";
const readiness = (content) => {
  writeFileSync(join(root, path), content);
  return evaluatePrdReadiness(root, runState);
};
try {
  assert.deepEqual(evaluatePrdReadiness(root, { artefacts: new Map() }), { ready: false, open_decisions: ["PRD artefact is missing"] });
  assert.deepEqual(readiness("# PRD\n\nOwner: Ana\n"), { ready: false, open_decisions: ["Approval Decisions section is missing"] });
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n## Approval Decisions\n\n${header}`),
    { ready: false, open_decisions: ["Approval Decisions table is empty or malformed"] });

  const resolved = `## Approval Decisions\n\n${header}| Pricing tier | before_prd | resolved | Free tier only | Ana |\n| Cache store | later_sd | open | Decide in SD | Ben |\n`;
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n${resolved}`), { ready: true, open_decisions: [] });
  // The shipped template leaves Owner empty; the following heading must not count as the owner.
  assert.deepEqual(readiness(`# PRD\n\nOwner:\n\n## 1. Product Scope\nScope.\n\n${resolved}`),
    { ready: false, open_decisions: ["Named PRD owner"] });
  assert.deepEqual(readiness(`# PRD\n\nOwner: to confirm\n\n${resolved}`), { ready: false, open_decisions: ["Named PRD owner"] });

  const open = `## Approval Decisions\n\n${header}| Pricing tier | before_prd | open | <answer> | Ana |\n| Pricing tier | later_tp | open | Plan later | Ana |\n| Retention | later_sd | open | TBD | Ben |\n| Rollout | someday | open | x | Ana |\n`;
  assert.deepEqual(readiness(`# PRD\n\nOwner: Ana\n\n${open}`),
    { ready: false, open_decisions: ["Pricing tier", "Pricing tier", "Retention", "Rollout"] },
    "unresolved before_prd rows, duplicates, placeholder resolutions and unknown timings stay open");
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("PRD readiness tests passed");
