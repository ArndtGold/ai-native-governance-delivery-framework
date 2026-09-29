import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recordRunRevision } from "../lib/control-state/run-recording.js";
import { reopenPrdRevision } from "../lib/control-state/run-revision.js";

// run-revise is the one bounded path that removes a recorded approval: PRD, at SD, before any
// later artefact is linked or approved. Everything else must be rejected without a write.
const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
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
  const sealed = recordRunRevision(root, { runId, revisionId: "33333333-3333-4333-8333-000000000001" });
  assert.equal(sealed.outcome, "updated", JSON.stringify(sealed));
  return sealed.revision_id;
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
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("run-revise tests passed");
