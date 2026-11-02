# Code Review: acknowledged decision-view session retirement
- decision: revise

Run: core-mcp-flow-coherence-20261010-01
Revision at review: f64e45e9-d305-4292-920f-b517044abd78

## Reviewed scope
DecisionEntry.tsx and DecisionCard.tsx retain a live decision/read session after a matched durable approval receipt and successful SDK context/message handoff. The view has no further decision work, but releases its session only on host disposal or expiry. This review covers the existing T-009 bounded decision-session lifecycle and SDD-017 original-operation/retirement invariants. UR/PRD/SD/TP intent and the unchanged undecided-host-close obligation are retained. The prior CODE_REVIEW_REPORT_24.md remains evidence of the wider implementation review; it cannot prove this subsequent correction.

## Finding
The locally completed card unnecessarily retains its live decision/read session after the confirmed handoff. Releasing it through the existing close owner can remove that owned live work without closing the shared MCP server or inventing a second decision. The stored receipt and immutable presented document remain readable facts; unknown handoff/approval effects must not be treated as completed or automatically replayed. Late completion of an older view must not close a replacement view.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CARD30-RETIRE | implementation_gap | CD+Tests | open | DecisionEntry.tsx ends port.next after successful sendMessage without retiring the completed decision session; T-009 bounded lifecycle and SDD-017 retirement protection | Retire only the exact completed card session after matched saved approval and confirmed continuation handoff; retain passive receipt and exact immutable document reading, then verify ordering and failure/replacement paths. |

## Evidence limits
The user confirmed closing native-en-text presentation 65e5b35a-328f-46f8-a76a-286bf4e9e575 in Chat and sidebar. A subsequent read on the same producer PID 80080 at 2026-10-12T11:46:32Z returned decision_binding_changed, not session_expired; no automatic close request was logged. The installed widget-e1674d393867.js SHA256 e20bd46b39478a188953a66ea4e92dff59c342b7a38db952d8b20cd1e0fa43ca is byte-identical to the prior inspected widget and requests teardown without waiting before frame removal. This correction does not claim to repair that external undecided-view host path. Native qualification, iPad, permission-denial and matched corpus gaps remain open.

## Required next step
Correct and verify CARD30-RETIRE under the existing approved TP, then renew affected implementation/review evidence before QA.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing session, immutable presentation reader and SDK handoff owners retained.
