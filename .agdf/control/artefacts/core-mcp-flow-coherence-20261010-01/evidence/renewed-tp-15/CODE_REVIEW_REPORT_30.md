# Code Review: completed decision-card session retirement
- decision: pass

Run: core-mcp-flow-coherence-20261010-01
Scope: actual additional diff in DecisionEntry, DecisionCard, their meaningful component/SDK/assembled-Core tests and shared localized warning/catalog. CODE_REVIEW_REPORT_24.md retains the wider earlier review; this report renews the affected lifecycle/reader/result dimension, not native qualification.

## Findings and assessment
CARD30-RETIRE is corrected. Retirement starts only after the original matched saved receipt and fresh exact route have enabled the locally deliberate handoff, and the host acknowledges both internal context and visible message. The exact old session is invalidated before closing; promise coalescing prevents repeated close/revival from old bootstrap or teardown. A replacement is independent of late completion. Unknown handoff remains once-only and active until normal retirement/expiry rather than falsely claiming success. A failed close cannot rewrite a durable approval or a successful handoff into an unknown business result. No process killing, shared-server shutdown, new session authority or alternate approval writer was introduced.

The retained passive card preserves confirmed status beyond old session expiry. Historical document access delegates the existing immutable reader with exact selectors and digest, bounded complete pagination and repeated-cursor/foreign/incomplete-result rejection. It does not use mutable current artefacts or restore the old decision session. Retained Core formal non-approval operations are unchanged. Closed UI state never supplies current gate permission.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CARD30-RETIRE | implementation_gap | CD+Tests | resolved | post-approval-retirement-30/VERIFICATION.json: 226 components, 14 built SDK cases and actual assembled-Core closed:true/session_expired with independent view and immutable document retained | Retain exact correction evidence and collect fresh native evidence before QA. |

## Evidence strength and remaining obligations
Typecheck, 8 UI-service tests, catalog validation, 2 assembled-Core SDK browser integrations and build:prepare also pass. Actual source hashes and preserved exchanges are recorded in VERIFICATION.json. Protected original staged index and all 5808 foreign control files remain unchanged. Copilot still has 232 files and the exact reviewed 2092379-byte bound, with no headroom. These source/automated/protocol results do not repair or certify the external native undecided-close path. Native/iPad/permission/corpus gaps remain open; the renewed candidate is not loaded by the current connection. No QA, UAT or production-installation success is inferred.

## Required next step
Collect native evidence for the registered exact post-approval-retirement candidate and preserve all remaining TP evidence gaps for qa-gate.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing source/operation owners retained; no context graph change.
