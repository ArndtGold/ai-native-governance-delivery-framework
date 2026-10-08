import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { reopenPrdRevision } from "../lib/control-state/run-revision.js";
import { sealRunState } from "../lib/control-state/run-seal.js";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { writeRun } from "../lib/control-state/run-state-writer.js";

// run-revise is the one bounded path that removes a recorded approval: PRD, at SD, before any
// later artefact is linked or approved. Everything else must be rejected without a write.
const cli = join(import.meta.dirname, "..", "..", "cli", "bin", "create-agdf.js");
const root = mkdtempSync(join(tmpdir(), "agdf-run-revision-"));
const runId = "prd-revision";
const statePath = join(root, ".agdf", "control", "runs", runId, "RUN_STATE.md");
const artefacts = join(root, ".agdf", "control", "artefacts", runId);

function fixture({ currentGate = "SD", prd = "approved", sdLinked = false } = {}) {
  execFileSync(process.execPath, [cli, "run-create", "--dir", root, "--run", runId], { stdio: "pipe" });
  writeFileSync(statePath, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${runId}
- lifecycle: active
- revision: 1
- revision_id: 33333333-3333-4333-8333-000000000001
- mode: structured_delivery
- current_gate: ${currentGate}
- decision: in_progress
- owner: test

## Objective

PRD revision fixture.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | ${prd} | ${prd === "approved" ? "Approval: PRD" : ""} |
| SD | missing | |
| TP | missing | |
| QA | missing | |
| UAT | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/${runId}/UR.md | approved | ready |
| Brownfield Review | .agdf/control/artefacts/${runId}/BROWNFIELD_REVIEW.md | done | ready |
| PRD | .agdf/control/artefacts/${runId}/PRD.md | ${prd} | ready |
${sdLinked ? `| SD | .agdf/control/artefacts/${runId}/SD.md | draft | ready |\n` : ""}
## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: PRD revision fixture.
- evidence: fixture

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | Approval: UR | approved | fixture |
| PRD | derived_from | UR | ${prd} | fixture |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fixture | test | PRD | direct |

## Next Allowed Action

- next_allowed_action: Draft the SD.
`);
  writeFileSync(statePath, sealRunState(root, readFileSync(statePath, "utf8")));
  return "33333333-3333-4333-8333-000000000001";
}

try {
  execFileSync("git", ["init", "-q", root]);
  execFileSync(process.execPath, [cli, "init", "--dir", root], { stdio: "pipe" });
  rmSync(join(root, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  mkdirSync(artefacts, { recursive: true });
  for (const name of ["UR.md", "BROWNFIELD_REVIEW.md", "PRD.md", "SD.md"]) writeFileSync(join(artefacts, name), `# ${name}\n`);
  const reset = () => rmSync(join(root, ".agdf", "control", "runs", runId), { recursive: true, force: true });

  const revision = fixture();
  assert.equal(reopenPrdRevision(root, { runId, revisionId: "33333333-3333-4333-8333-000000000009" }).reason, "stale_revision");
  const reopened = reopenPrdRevision(root, { runId, revisionId: revision });
  assert.equal(reopened.outcome, "reopened", JSON.stringify(reopened));
  assert.equal(reopened.gate, "PRD");
  assert.notEqual(reopened.revision_id, revision);
  const state = readFileSync(statePath, "utf8");
  assert.match(state, /^\| PRD \| missing \| +\|/mu, "the PRD approval is removed");
  assert.match(state, /^\| UR \| approved \| Approval: UR \|/mu, "the UR approval stays");
  assert.match(state, /^- current_gate: PRD$/mu);
  assert.match(state, /Superseded PRD approval \| Approval: PRD/u, "the superseded approval is kept as history");
  assert.equal(reopenPrdRevision(root, { runId, revisionId: reopened.revision_id }).reason, "prd_revision_boundary_invalid",
    "a PRD without approval cannot be reopened again");

  reset();
  const linked = fixture({ sdLinked: true });
  const before = readFileSync(statePath, "utf8");
  assert.equal(reopenPrdRevision(root, { runId, revisionId: linked }).reason, "prd_revision_boundary_invalid",
    "a linked SD closes the PRD revision window");
  assert.equal(readFileSync(statePath, "utf8"), before, "a rejected revision writes nothing");

  reset();
  const tampered = fixture();
  writeFileSync(join(artefacts, "PRD.md"), "# PRD changed outside run-update\n");
  assert.equal(reopenPrdRevision(root, { runId, revisionId: tampered }).reason, "seal_invalid",
    "an artefact edited outside the run commands blocks the revision");

  for (const missing of ["content_seal", "approval_seal", "both"]) {
    reset();
    const revisionId = fixture();
    const valid = readFileSync(statePath, "utf8");
    const stripped = valid.split("\n").filter((line) => !(
      (missing === "both" || missing === "content_seal") && line.startsWith("- content_seal:")
      || (missing === "both" || missing === "approval_seal") && line.startsWith("- approval_seal:")
    )).join("\n");
    writeFileSync(statePath, stripped);
    assert.equal(recordRunRevision(root, { runId, revisionId }).reason, "seal_invalid", missing);
    assert.throws(() => writeRun(statePath, stripped, revisionId), /AGDF_RUN_SEAL_INVALID/, missing);
    assert.equal(readFileSync(statePath, "utf8"), stripped, missing);
  }

  // run-update after a hand-recorded internal step refreshes the derived control fields when the
  // evaluated gate moved; same-gate run-specific text and completed runs stay as authored.
  const stepRun = "internal-step";
  const stepPath = join(root, ".agdf", "control", "runs", stepRun, "RUN_STATE.md");
  const stepArtefacts = join(root, ".agdf", "control", "artefacts", stepRun);
  mkdirSync(stepArtefacts, { recursive: true });
  for (const name of ["UR.md", "BROWNFIELD_REVIEW.md", "PRD.md", "SD.md", "TP.md", "BROWNFIELD_ANALYSIS.md"]) writeFileSync(join(stepArtefacts, name), `# ${name}\n`);
  const BROWNFIELD_NEXT = "Run Brownfield Analysis for the approved TP scope before CD+Tests.";
  const CD_TESTS_NEXT = "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.";
  const stepFixture = ({ lifecycle = "active", gate = "Brownfield Analysis", next = BROWNFIELD_NEXT, analysis = "missing" } = {}) => {
    rmSync(join(root, ".agdf", "control", "runs", stepRun), { recursive: true, force: true });
    execFileSync(process.execPath, [cli, "run-create", "--dir", root, "--run", stepRun], { stdio: "pipe" });
    const a = (name) => `.agdf/control/artefacts/${stepRun}/${name}`;
    writeFileSync(stepPath, sealRunState(root, `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: ${stepRun}
- lifecycle: ${lifecycle}
- revision: 1
- revision_id: 33333333-3333-4333-8333-000000000101
- mode: structured_delivery
- current_gate: ${gate}
- decision: in_progress
- owner: test

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval recorded for TP; current gate is ${gate}. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | ${next} |
| What is explicitly forbidden right now? | implement before Brownfield evidence supports the approved TP path |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | missing | |
| UAT | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | ${a("UR.md")} | approved | |
| Brownfield Review | ${a("BROWNFIELD_REVIEW.md")} | done | |
| PRD | ${a("PRD.md")} | approved | |
| SD | ${a("SD.md")} | approved | |
| TP | ${a("TP.md")} | approved | |
| Brownfield Analysis |  | ${analysis} | |
| CD+Tests |  | missing | |
| CR |  | missing | |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Internal-step refresh fixture.
- evidence: fixture

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | exact approval |
| PRD | derived_from | UR | linked |
| SD | derived_from | PRD | linked |
| TP | derived_from | SD | linked |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fixture | test | TP | direct |

## Closeout

- next_allowed_action: ${next}
`));
    return "33333333-3333-4333-8333-000000000101";
  };
  const markAnalysisDone = () => writeFileSync(stepPath, readFileSync(stepPath, "utf8").replace("| Brownfield Analysis |  | missing | |",
    `| Brownfield Analysis | .agdf/control/artefacts/${stepRun}/BROWNFIELD_ANALYSIS.md | done | pre_implementation_analysis; decision pass |`));
  const field = (name) => readFileSync(stepPath, "utf8").match(new RegExp(`^- ${name}: (.*)$`, "mu"))?.[1];
  const row = (question) => readFileSync(stepPath, "utf8").match(new RegExp(`^\\| ${question.replace("?", "\\?")} \\| (.*) \\|$`, "mu"))?.[1];

  let stepRevision = stepFixture();
  markAnalysisDone();
  const refreshed = recordRunRevision(root, { runId: stepRun, revisionId: stepRevision });
  assert.equal(refreshed.outcome, "updated", JSON.stringify(refreshed));
  assert.equal(field("current_gate"), "CD+Tests", "the moved gate is refreshed");
  assert.equal(field("next_allowed_action"), CD_TESTS_NEXT, "the evaluated next step is stored");
  assert.equal(row("What is the next allowed action?"), CD_TESTS_NEXT);
  assert.equal(row("What is missing?"), "No approval is pending.");
  assert.equal(row("What is approved?"), "Approval: UR, Approval: PRD, Approval: SD, Approval: TP");
  assert.match(row("What is explicitly forbidden right now?"), /claim QA pass/u);
  assert.equal(row("What is known?"), "Approval recorded for TP; current gate is Brownfield Analysis.", "narrative stays as authored");
  const cliReport = (command) => JSON.parse(spawnSync(process.execPath, [cli, command, "--dir", root, "--run", stepRun, "--json"], { encoding: "utf8" }).stdout);
  const refreshedReport = cliReport("gate-check");
  assert.equal(refreshedReport.current_gate, "CD+Tests");
  assert.equal(refreshedReport.next_allowed_action, CD_TESTS_NEXT);
  const refreshedDoctor = cliReport("doctor");
  assert.equal(refreshedDoctor.findings.filter((finding) => /SEAL|APPROVAL|BINDING/u.test(finding.code)).length, 0,
    `the refreshed run keeps valid seals and approvals: ${JSON.stringify(refreshedDoctor.findings)}`);

  // Same gate: run-specific text survives byte-identical.
  const pending = "Choose whether the open host scenario stays in this TP.";
  stepRevision = stepFixture({ gate: "CD+Tests", next: pending, analysis: "done" });
  writeFileSync(stepPath, readFileSync(stepPath, "utf8").replace("| Fixture | test | TP | direct |", "| Fixture | test | TP | direct |\n| Note | test | CD+Tests | direct |"));
  const sameGateBefore = readFileSync(stepPath, "utf8");
  assert.equal(recordRunRevision(root, { runId: stepRun, revisionId: stepRevision }).outcome, "updated");
  assert.equal(field("next_allowed_action"), pending, "same-gate run-specific text is kept");
  assert.equal(field("current_gate"), "CD+Tests");
  assert.equal(row("What is the next allowed action?"), sameGateBefore.match(/^\| What is the next allowed action\? \| (.*) \|$/mu)[1]);

  // Backward move after retracted evidence: the stored gate and text stay as authored (fail closed).
  const retracted = "Draft or refine the current artefact.";
  stepRevision = stepFixture({ gate: "QA", next: retracted });
  markAnalysisDone();
  assert.equal(recordRunRevision(root, { runId: stepRun, revisionId: stepRevision }).outcome, "updated");
  assert.equal(field("current_gate"), "QA", "a backward move is not refreshed");
  assert.equal(field("next_allowed_action"), retracted);

  // Completed run: nothing is refreshed.
  const closeout = "No run work remains; VCS actions require a separate explicit instruction.";
  stepRevision = stepFixture({ lifecycle: "completed", gate: "OR", next: closeout });
  markAnalysisDone();
  assert.equal(recordRunRevision(root, { runId: stepRun, revisionId: stepRevision }).outcome, "updated");
  assert.equal(field("current_gate"), "OR", "a completed run keeps its stored gate");
  assert.equal(field("next_allowed_action"), closeout);

  // An approval edit is still rejected without a write.
  stepRevision = stepFixture();
  markAnalysisDone();
  writeFileSync(stepPath, readFileSync(stepPath, "utf8").replace("| QA | missing | |", "| QA | approved | Approval: QA |"));
  const tamperedApproval = readFileSync(stepPath, "utf8");
  assert.equal(recordRunRevision(root, { runId: stepRun, revisionId: stepRevision }).reason, "approvals_unrecorded");
  assert.equal(readFileSync(stepPath, "utf8"), tamperedApproval, "a rejected run-update writes nothing");
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("run-revise tests passed");
