import assert from "node:assert/strict";
import { evaluateSdDecisionContent, SD_DECISIONS_CONTRACT } from "../lib/control-evaluation/sd-readiness.js";

const table = "## Design Decisions\n\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n";
const row = "| Cache owner | before_sd | resolved | Existing cache service | Ana |\n";
const ready = `${SD_DECISIONS_CONTRACT}\n\n${table}${row}`;
assert.equal(evaluateSdDecisionContent(ready).ready, true);
assert.equal(evaluateSdDecisionContent(ready.replaceAll("\n", "\r\n")).ready, true);
assert.equal(evaluateSdDecisionContent("# Existing SD\nArchitecture rationale.").contract, "legacy");
assert.equal(evaluateSdDecisionContent(ready + "| Test execution | later_tp | open | Choose runner in TP | Ben |\n").ready, true);
for (const content of [
  ready.replace(SD_DECISIONS_CONTRACT, ""), ready.replace("sd-decisions-v1", "sd-decisions-v2"),
  ready + `\n${SD_DECISIONS_CONTRACT}`, `${SD_DECISIONS_CONTRACT}\n`, ready + `\n${table}${row}`,
  `${SD_DECISIONS_CONTRACT}\n${table}`, ready.replace("before_sd | resolved", "before_sd | open"),
  ready.replace("before_sd | resolved", "before_sd | deferred"), ready + row,
  ready.replace("before_sd", "later_sd"), ready.replace("resolved", "approved"),
  ready.replace("Existing cache service", "TBD"), ready.replace("Ana", ""),
  ready.replace("Resolution | Owner", "Owner | Resolution"), ready.replace(" Ana |", " Ana | extra |"),
  ready.replace(" Ana |", " Ana"), ready.replace("|---|---|---|---|---|", "| invalid separator |"),
  ready + "| Test execution | later_tp | open | | Ben |\n",
]) assert.equal(evaluateSdDecisionContent(content).ready, false, content);
console.log("SD declared-decision readiness: resolved/open/malformed/legacy boundaries passed.");
