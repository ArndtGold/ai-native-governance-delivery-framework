# OR: Browser acceptance of “Run fortsetzen”

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

Two simultaneous clicks on the same Run produced one request, one work grant and one reply. On cancellation, the Companion kept the Run locked through a reload and made it available again when it received the matching end confirmation. The user accepted the browser result on 22 November 2026.

## Run
- run_id: run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d
- related_ur: .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/UR.md
- related_prd: .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/PRD.md
- related_sd: .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/SD.md
- related_tp: .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/TP.md
- related_qa_report: .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/UR.md |
| Brownfield Review | done | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/PRD.md |
| SD | approved | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/SD.md |
| TP | approved | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/TP.md |
| Brownfield Analysis | done | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/CD_TESTS.md |
| CR | done | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/CODE_REVIEW.md |
| QA | approved | .agdf/control/runs/run-a29d9bc0-5ca3-4fc4-bc13-73ef06f8827d/documents/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-11-22 · presentation b9693be5-8e05-40a4-83c3-4855fcde698a sha256:b4012fb0f6503069b69d7c0a57d38d0b1190731e4da7f7ae46565be76eff1c2c |

## Run Status Card

| Run status | Value |
|---|---|
| Status | Technical QA passed and browser UAT approved. |
| Current gate | OR |
| Allowed now | Record the delivery report. |
| Blocked by | None. |
| Missing approval | None. |
| Next step | File this report with the accepted browser evidence. |
| Quality outlook | No additional quality follow-up is required for the browser scope. |

## Delivered

| Item | Evidence |
|---|---|
| Pointer and keyboard activation at 360 CSS pixels, including stale selection and recovery | [Implementation and test results](CD_TESTS.md) |
| One successful claim across two browser views and across competing Companion and ordinary dispatch in either order | [Case records for the accepted candidate](../evidence/browser-continuation-after-interrupt-fix.json) |
| Inspection and reopening of a pending handoff, safe retry after a confirmed non-start, correlated cancellation and simulated candidate change | [Technical QA](QA_REPORT.md) |
| All five planned tasks and six acceptance criteria covered. Reviews verified reuse of the existing admission owner, SDK host and cockpit service. | [Plan coverage](TP_REVIEW.md), [code review](CODE_REVIEW.md) and [implementation review](CLEAN_IMPLEMENTATION_REVIEW.md) |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Native Desktop click qualification and a live receiving chat turn | The approved scope uses Chromium with a simulated SDK host and recipient. | Separate continuation qualification Run |
| Packaging, publication and version-control handoff | The acceptance covered the browser test result. | Delivery owner on explicit request |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| 27 passing Chromium tests, including 21 variants across 12 continuation scenarios | [Corrected case index](../evidence/browser-continuation-after-interrupt-fix.json) and [CD+Tests](CD_TESTS.md) | Visible behavior, actual SDK messages, fixture grants, reads and replies | direct |
| Both interrupt observations retained | [Original failure](../evidence/browser-continuation.json) and [corrected progression](../evidence/browser-continuation-after-interrupt-fix.json) | A matching Stop restores the action. Foreign events and ordinary competing dispatch leave the lock intact. | direct |
| 26 passing Core/MCP checks, 441 passing UI checks in the serial suite, successful typecheck and build | [QA report](QA_REPORT.md) | Shared admission, UI behavior and regression coverage | direct |
| Deliberate UAT approval on the presented revision | [Acceptance document](../control/presentations/b9693be5-8e05-40a4-83c3-4855fcde698a.document) and [Run state](../RUN_STATE.md) | Human acceptance of the browser result and its qualification limits | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Native host behavior and actual receipt in a Codex chat | warn | Retain the browser-only qualification when reusing these results. The separate continuation Run owns native evidence. |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| A parallel Reader test once missed the session-expiry notice. All 48 tests in that file passed in isolation and all 441 UI checks subsequently passed serially. | warn | Reader test maintainer can use the recorded observation if it recurs. |

The outstanding handoff retains the original admission record through uncertainty. A correlated end confirmation and existing mutation checks determine when the claim can be released. This is the intended behavior and requires no temporary fallback cleanup.

## Parent Reconciliation Handoff

Delivery Map returned `not_applicable`. No parent action is due.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: BROWNFIELD_ANALYSIS.md and CLEAN_IMPLEMENTATION_REVIEW.md
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The test harness observes the existing Core admission record and SDK transport. Ownership and authority boundaries are unchanged.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The evidence describes the tested browser candidate and its bounded fixtures. The Run documents preserve the scope for future reuse.
- memory_refs: CD_TESTS.md, QA_REPORT.md and ../evidence/browser-continuation-after-interrupt-fix.json

## Next Permissible Step

- next_allowed_action: File the accepted report to close this browser qualification Run.
- required_approval: none
- forbidden_until_then: Publishing or performing a version-control handoff requires a separate explicit request.

## AGDF Approval Summary (de; source=en)

- Die Nutzerabnahme für den Browser-Test ist erfasst. Zwei gleichzeitige Klicks auf „Run fortsetzen“ lösten genau einen Auftrag aus. Nach einem Abbruch wurde der Start wieder angeboten, sobald das Ende des ursprünglichen Versuchs bestätigt war.
- Alle zwölf Szenarien in Chromium bestanden. Empfänger und Lebenszyklusmeldungen waren simuliert. Die native Prüfung gehört zum separaten Run.
