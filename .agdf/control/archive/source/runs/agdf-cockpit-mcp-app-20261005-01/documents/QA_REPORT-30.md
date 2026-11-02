# QA Gate 30

Run: agdf-cockpit-mcp-app-20261005-01
Assessed revision: 111 / 6c307ca1-1fb8-4a3a-ac1b-d295bf1b2c58
Date: 2026-10-07
Decision owner: qa-gate
Reviewer: Codex implementing agent; cooperative assessment, not independent assurance
Authorizes: false

## Quality Readiness (derived, non-authorizing)

| Evidence dimension | Source | Status |
|---|---|---|
| Plan coverage | TASK_PLAN_REVIEW-30.md | pass; 12/12 tasks fully_done |
| Solution integrity | CLEAN_IMPLEMENTATION_REVIEW-29.md | pass; reviewed source identities unchanged |
| Code quality | CODE_REVIEW-29.md | pass; repaired title/navigation defect resolved |
| QA decision | qa-gate, sole final decision owner | pass for approved Codex scope |

Decisive basis: required scoped tasks, applicable UX criteria, actual host handoff evidence and final rollback/reconnection are evidenced without an unresolved applicable finding. Next permitted step is a revision-bound human Approval: QA presentation.

## QA Gate

- decision: pass
- evidence: Approved UR/PRD/SD/TP exact hashes; pre-implementation BROWNFIELD_ANALYSIS_UR_TITLES-21.md; complete implementation/test chain 26-30; TASK_PLAN_REVIEW-30.md, CLEAN_IMPLEMENTATION_REVIEW-29.md and CODE_REVIEW-29.md; HOST_SESSION_HANDOFF-27.md and MODEL_RECEIPT-28.json; CLOSING_CHECKPOINT-29.md and exact final tuple verification; HOST_RECONNECTION-30.md and native-reconnection-evidence-30/verification.json; current architecture and existing graph-node reconciliation.
- missing_evidence: None preventing scoped QA pass. Human QA/UAT approval and regular OR closeout are not claimed and remain downstream.
- risks: Cooperative review; dated native handoff observations are not newly repeated final-module publications; browser qualification is 14 passing journeys plus the corrected isolated fifteenth, not a single final fifteen-case run. Native 30 is one light-host reading/recovery observation; both themes and responsive widths are separately qualified by browser evidence. No Claude/cross-host support, publication or release qualification is inferred.
- required_next_step: Present this QA report and the exact current Run/revision through canonical gate-check/run-present, requesting only Approval: QA.
- impact_codes: No additional repository impact code invented; applicable PRD criteria AC-001 through AC-010 and normalized review findings are evaluated below.

## Acceptance and visible evidence assessment

| PRD criterion | QA assessment | Evidence and boundary |
|---|---|---|
| AC-001 | fulfilled | Actual native entry/larger reading 27 and final reading/return 30; browser responsive/theme, keyboard/focus and fallback checks 26/29. |
| AC-002 | fulfilled | Core parity and strict identity/source tests; current native exact requested Run and fingerprint 30; saved work state stays separate from current control assessment. |
| AC-003 | fulfilled | Passive registered UR/PRD 27, final Run State source 30, document/provenance/closed-original/failure UI and HTTP cases. |
| AC-004 | fulfilled | Explicit maintained graph node in A 27; B PRD includes no graph node; graph negative/containment/empty-reference regressions 26. |
| AC-005 | fulfilled | Actual checked packets 27; fresh source/revision/size/currentness and packet-selection negative tests 26/29; no fallback represented as complete. |
| AC-006 | fulfilled | Distinct deliberate UR and PRD questions each authorized and sent once in native 27, actual separate model deliveries/answers 28. Host acknowledgement alone was not accepted as model delivery. |
| AC-007 | fulfilled | Session/generation/ownership tests, actual competing-publisher refusal, nonowner cleanup, acknowledged release/takeover 27 and actual model invalidations 28. |
| AC-008 | fulfilled | Explicit observed Transport closed history, unsupported/error/recovery tests; final actual fresh native recovery with loaded identity and source return 30. |
| AC-009 | fulfilled | Strict contained selectors/passive content, retained approval/transaction regressions, actual 3577-file handoff window 27 plus 3630-file current native reading window 30; agent bookkeeping excluded. |
| AC-010 | fulfilled | Exact owned registration/runtime removal/restoration 29; current loaded final module/style and reconnect 30; private build, default and Cockpit stdio eras, production HTTP/browser qualification; documented owner/synchronization/lazy-title limits. |

All eight applicable UX Intent Fidelity rows in TASK_PLAN_REVIEW-30.md are fulfilled with visible native/browser evidence. No missing upstream requirement/design/plan is inferred or silently repaired.

## Evidence strength and transfer

The final module changed only for the repaired shared Run-navigation path. Current UI controlled red/green and real production HTTP barrier reproduce and resolve its committed-title replacement race; final native 30 verifies loaded code, source access and exact return focus. Actual two-view publication and model evidence remain dated 27/28. These observations are retained for their unchanged adjacent receiving-view/controller/ownership/packet boundary, reviewed with source identities and current deterministic/stdio checks in 29 and rechecked in 30. They are not labelled fresh final-module handoff actions. This targeted complementary qualification is sufficient for the approved scope; automatically replaying already accepted questions would violate the TP. A future change to those boundaries would require new scoped evidence and deliberate question authorization.

Current qualification: 114/114 UI tests, TypeScript/build pass, six production HTTP cases, separate Cockpit/default protocol eras 2025-11-25 and 2026-07-28, and fifteen qualified browser journeys. The five initial sandbox socket-bind failures and original viewport-sensitive screenshot failure remain preserved; the full service run and corrected affected browser journey pass. Core and writer regressions are retained with their disclosed fixture corrections and exact boundaries in RENEWED_QUALIFICATION-26.md. A green build alone is not the QA basis.

## Normalized review findings consumed

| finding_id | gap_type | routing_target | gap_status | Evidence consumed | Assessment |
|---|---|---|---|---|---|
| CR29-TITLE-NAVIGATION | implementation_gap | CD+Tests | resolved | CODE_REVIEW-29.md; controlled red/green and real HTTP barrier; final native source/return 30 | Correction proved; no reclassification. |
| CR28-SCOPE | evidence_gap | evidence_obligation | resolved | CODE_REVIEW-29.md actual scoped diff/neighbour review and exact-source verification | Review scope proved; no reclassification. |
| R28-ROLLBACK | evidence_gap | evidence_obligation | resolved | TASK_PLAN_REVIEW-30.md; guarded actual rollback/restoration 29 and fresh loaded native reconnect 30 | Remaining lifecycle evidence fulfilled; no reclassification. |

Earlier reports 28/29 remain dated historical assessments; their open native-recovery statement is superseded by the specific current routed obligation and concrete evidence 30, not erased. No applicable open/invalid finding or partial task remains in the current scoped review set.

## Brownfield, documentation and knowledge

Core remains the control/capture evaluator; CLI owns runtime lifecycle; shared React owns presentation; the host owns acknowledgement. Named navigation uses the existing explicit Run capture owner without broadened budgets, blind retry or all-Run reads. No parallel evaluator, Backlog writer, persistence or approval authority is added. Separate status-writer/Pages deltas in the worktree are not silently claimed as Cockpit implementation.

The architecture document contains the reader/writer observation limits, lifecycle, lazy-title/cache/fallback boundaries and final reconnect evidence. The existing CG-MCP-DISPATCH-ADAPTER node is updated with checkpoint 30, preserves history and qualifies scope/host/temporal evidence. The protected lifecycle diagram and approved source hashes are unchanged.

- memory_target: context_graph
- memory_reason: Curate reusable verified bounded-view, exclusive-publication and owned runtime recovery facts with exact evidence boundaries.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER; docs/architecture/06-agdf-cockpit.md; HOST_RECONNECTION-30.md
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: HOST_RECONNECTION-30.md; TASK_PLAN_REVIEW-30.md; docs/architecture/06-agdf-cockpit.md

This QA decision is evidence-based readiness for the approved Codex scope. It is not human Approval: QA, Approval: UAT, OR, a commit, a push, a PR or release authorization.
