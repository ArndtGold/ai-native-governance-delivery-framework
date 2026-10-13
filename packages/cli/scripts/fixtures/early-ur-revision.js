import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createSdDefinitionTestRun, syntheticSd } from "./sd-definition.js";
import { sourceRevisionTestProposal } from "./late-source-revision.js";
import { parseControlState, parseRunState } from "../../../core/lib/control-state/run-state-parser.js";
import { internalStepArtefacts } from "../../../core/lib/control-evaluation/run-state.js";

// Synthetic decisions in an isolated fixture only; no live approval is copied.
export function createEarlyUrRevisionTestRun(root, cli, runId = "early-ur-revision-test", env = process.env) {
  const f = createSdDefinitionTestRun(root, cli, runId, env, { typedApprovals: true });
  writeFileSync(f.file("SD.md"), syntheticSd());
  assert.equal(f.recordSd().value?.outcome, "recorded");
  // Include an outstanding exact SD presentation in the archived closure.
  assert.equal(f.present("SD").value?.outcome, "prepared");
  const readState = () => parseRunState(readFileSync(f.state, "utf8"), runId);
  const control = () => parseControlState(readState().content, { userGates: ["UR", "PRD", "SD", "TP", "QA", "UAT"], internalSteps: [...internalStepArtefacts] });
  const fixture = { ...f, readState, control };
  return { ...fixture, proposal: (gate = "UR", analyses = "reassess") => sourceRevisionTestProposal(root, fixture, gate, analyses) };
}
