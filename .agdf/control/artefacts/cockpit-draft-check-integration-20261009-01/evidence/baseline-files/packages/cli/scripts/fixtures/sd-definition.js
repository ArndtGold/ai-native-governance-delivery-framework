import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { createPrdDefinitionTestRun, syntheticPrd } from "./prd-definition.js";
import { artefactFileDigest } from "../../../core/lib/control-state/run-seal.js";
import { resolveControlCommandTarget } from "../../../core/lib/control-state/approval-command-contract.js";

// Explicit synthetic authorizations in isolated fixtures, never live human approvals.
export function createSdDefinitionTestRun(root, validator, runId = "sd-authoring-test", env = process.env, options) {
  const f = createPrdDefinitionTestRun(root, validator, runId, env, options);
  writeFileSync(f.file("PRD.md"), syntheticPrd());
  assert.equal(f.record().value?.outcome, "recorded");
  const presentation = f.present(); assert.equal(presentation.value?.outcome, "prepared");
  assert.equal(f.approve("PRD", presentation.value.presentation_id).value?.outcome, options?.typedApprovals ? "accepted" : "approved");
  const recordSd = (update = false, mutate = () => {}) => {
    const proof = f.prefix + `sd-mapping-${randomUUID()}.json`, input = f.prefix + `sd-recording-${randomUUID()}.json`;
    const value = { schema_version: "1", target_id: resolveControlCommandTarget(root).target_id, run_id: runId,
      expected_revision_id: f.revision(), destination: { type: "SD", path: f.prefix + "SD.md", digest: artefactFileDigest(root, f.prefix + "SD.md"), status: "draft" },
      source: { type: "PRD", path: f.prefix + "PRD.md", digest: artefactFileDigest(root, f.prefix + "PRD.md") },
      relationship: { from: "SD", relationship: "derived_from", to: "PRD" },
      review: { reviewer: "synthetic SD test reviewer", path: proof, digest: "" }, update_draft: update };
    const { schema_version, target_id, run_id, relationship, destination, source } = value;
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, relationship, destination, source, reviewer: value.review.reviewer, reviewed: true }));
    value.review.digest = artefactFileDigest(root, proof); mutate(value);
    writeFileSync(join(root, input), JSON.stringify(value));
    return f.run("run-step", "--revision", f.revision(), "--step", "artefact", "--gate", "SD", "--evidence", input);
  };
  return { ...f, recordSd };
}

export const syntheticSd = (open = false) => `# SD: Synthetic saved filter
Status: draft
Gate: SD
Gate approval: open
Owner: Test design owner
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## Solution Overview
Reuse the existing user-owned filter store.

## Ownership And Source Of Truth
Existing filter service retains ownership; the approved PRD remains product authority.

## Architecture Decisions
- SDD-001: Reuse the existing filter service; rationale: retain user ownership; consequence: no shared filters.

## Acceptance Traceability
| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Existing store saves/restores owned filter values | Filter service and approved PRD owner | SDD-001 | Existing personal ownership retained |

## Design Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Store boundary | before_sd | ${open ? "open" : "resolved"} | ${open ? "Confirm existing store ownership" : "Existing filter service"} | Test design owner |

## AGDF Approval Summary (de; source=en)
- Lösung: Bestehenden persönlichen Filterspeicher wiederverwenden.
- Verantwortung: Filterservice und freigegebenes PRD.
- Entscheidungen: ${open ? "Die Speichergrenze ist offen." : "Bestehender Speicher mit persönlicher Eigentümerschaft."}
`;
