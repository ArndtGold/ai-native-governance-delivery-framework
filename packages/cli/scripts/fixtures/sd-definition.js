import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createPrdDefinitionTestRun, syntheticPrd } from './prd-definition.js';

// Current CLI commands; all authorization here is synthetic and disposable.
export function createSdDefinitionTestRun(root, validator, runId = 'sd-authoring-test', env = process.env, options) {
  const f = createPrdDefinitionTestRun(root, validator, runId, env, options);
  writeFileSync(f.file('PRD.md'), syntheticPrd());
  const recorded = f.record(); assert.equal(recorded.value?.outcome, 'accepted', recorded.text);
  const presentation = f.present(); assert.equal(presentation.value?.outcome, 'accepted', presentation.text);
  const approved = f.approve('PRD', presentation.value.family_result.presentation_id);
  assert.equal(approved.value?.outcome, 'accepted', approved.text);
  return { ...f, recordSd: (update = false, mutate) => f.recordGate('SD', update, mutate) };
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
