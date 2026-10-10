import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createSdDefinitionTestRun, syntheticSd } from "./sd-definition.js";
import { artefactFileDigest } from "../../../core/lib/control-state/run-seal.js";
import { parseControlState, parseRunState } from "../../../core/lib/control-state/run-state-parser.js";
import { upsertTableRow } from "../../../core/lib/control-state/run-state-edits.js";
import { resolveControlCommandTarget } from "../../../core/lib/control-state/approval-command-contract.js";
import { SOURCE_GATES } from "../../../core/lib/control-state/run-source-revisions.js";
import { relationshipForGate } from "../../../core/lib/control-evaluation/delivery-relationships.js";

export const syntheticTp = () => `# TP: Synthetic saved filter
Traceability contract: criteria-chain-v1

## Task List
| task_id | task |
|---|---|
| T-001 | Save and restore the user-owned filter using the existing store. |

## Verification Traceability
| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Restored values match saved values | Synthetic fixture observed result |
`;

// Every positive approval is a new synthetic reply through canonical services/commands.
// No production Run, approval or source is copied or revised by this fixture.
export function createLateSourceRevisionTestRun(root, validator, runId = "late-source-test", env = process.env, { tpEncoding = "lf" } = {}) {
  const f = createSdDefinitionTestRun(root, validator, runId, env, { typedApprovals: true });
  const state = () => parseRunState(readFileSync(f.state, "utf8"), runId);
  const control = () => parseControlState(state().content, { userGates: ["UR", "PRD", "SD", "TP", "QA", "UAT"], internalSteps: ["Brownfield Review", "UX Intent Definition", "Brownfield Analysis", "CD+Tests", "CR"] });
  const recordSource = gate => {
    const relation = relationshipForGate(gate), proof = f.prefix + `review-${randomUUID()}.json`, evidence = f.prefix + `record-${randomUUID()}.json`;
    const command = { schema_version: "1", target_id: resolveControlCommandTarget(root).target_id, run_id: runId,
      expected_revision_id: f.revision(), destination: { type: gate, path: f.prefix + `${gate}.md`, digest: artefactFileDigest(root, f.prefix + `${gate}.md`), status: "draft" },
      source: { type: relation.to, path: f.prefix + `${relation.to}.md`, digest: artefactFileDigest(root, f.prefix + `${relation.to}.md`) },
      relationship: { from: relation.from, relationship: relation.relationship, to: relation.to },
      review: { reviewer: "synthetic source revision reviewer", path: proof, digest: "" }, update_draft: false };
    const { schema_version, target_id, run_id, destination, source, relationship } = command;
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
    command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, evidence), JSON.stringify(command));
    const result = f.run("run-step", "--revision", f.revision(), "--step", "artefact", "--gate", gate, "--evidence", evidence);
    assert.equal(result.value?.outcome, "recorded", result.text); return result.value;
  };
  const approveSource = gate => {
    const prepared = f.present(gate); assert.equal(prepared.value?.outcome, "prepared", prepared.text);
    const approval = f.approve(gate, prepared.value.presentation_id); assert.equal(approval.value?.outcome, "accepted", approval.text);
    return { prepared: prepared.value, approval: approval.value };
  };
  const prepareImplementation = () => {
    writeFileSync(f.file("BROWNFIELD_ANALYSIS.md"), "# Brownfield Analysis\nSynthetic current approved-TP preparation; existing filter store and tests reused.\n");
    writeFileSync(f.state, upsertTableRow(state().content, "Artefacts", 0, "Brownfield Analysis", ["Brownfield Analysis", f.prefix + "BROWNFIELD_ANALYSIS.md", "done", "Synthetic fixture preparation"]));
    const updated = f.run("run-update", "--revision", f.revision()); assert.equal(updated.value?.outcome, "updated", updated.text);
    const recorded = f.run("run-step", "--revision", f.revision(), "--step", "evidence", "--evidence", "Synthetic current preparation observed", "--source", f.prefix + "BROWNFIELD_ANALYSIS.md");
    assert.equal(recorded.value?.outcome, "recorded", recorded.text);
  };
  writeFileSync(f.file("SD.md"), syntheticSd()); recordSource("SD"); approveSource("SD");
  writeFileSync(f.file("TP.md"), tpEncoding === "crlf_bom" ? "\ufeff" + syntheticTp().replace(/\n/gu, "\r\n") : syntheticTp());
  recordSource("TP"); approveSource("TP"); prepareImplementation();
  const proposal = (sourceGate, analyses = "retain", operationId = randomUUID()) => {
    const c = control();
    const sources = SOURCE_GATES.map(type => ({ type, path: c.artefacts.get(type).path, digest: artefactFileDigest(root, c.artefacts.get(type).path) }));
    const value = { schema_version: "1", target_id: resolveControlCommandTarget(root).target_id, run_id: runId,
      expected_revision_id: f.revision(), operation_id: operationId, source_gate: sourceGate,
      reason: "Synthetic reviewed source revision test", intended_change: "Revise the selected source while preserving reviewed upstream intent",
      sources, impact_assessment: { reviewer: "synthetic impact owner", earliest_source: sourceGate,
        upstream: sources.slice(0, SOURCE_GATES.indexOf(sourceGate)).map(row => ({ ...row, rationale: "Exact source remains applicable to this fixture change" })),
        analyses: ["Brownfield Review", "UX Intent Definition"].filter(type => c.artefacts.get(type)?.path).map(type => ({ type,
          disposition: sourceGate === "UR" ? "reassess" : analyses, path: c.artefacts.get(type).path, digest: artefactFileDigest(root, c.artefacts.get(type).path),
          reason: "Synthetic reviewed applicability assessment under unchanged or renewed UR" })),
        implementation_evidence: "Retain code/tests; reassess fulfillment and run fresh preparation/checks for renewed TP", unresolved: [] } };
    const evidence = f.prefix + `proposal-${operationId}.json`; writeFileSync(join(root, evidence), JSON.stringify(value));
    return { input: { runId, revisionId: f.revision(), operationId, sourceGate, evidence }, value };
  };
  return { ...f, readState: state, control, recordSource, approveSource, prepareImplementation, proposal };
}
