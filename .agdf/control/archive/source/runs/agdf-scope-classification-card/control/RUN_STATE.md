# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-scope-classification-card
- lifecycle: completed
- revision: 2
- revision_id: 6364D490-F7E5-45B3-9EBE-9090590F44D6
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make fresh-scope gate classification a canonical, deterministic, code-owned compact presentation so ungated scope decisions are visible and challengeable across models and hosts without becoming a gate or adding ceremony to lightweight paths.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The parent scope and its separately approved corrective child are implemented, reviewed, QA-approved and UAT-accepted. OR-full records pass, and Context Graph reconciliation is resolved. |
| What is approved? | Exact parent `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP`, `Approval: QA` and `Approval: UAT`, all accepted on 2026-07-21; the corrective child has its own complete approval chain dated 2026-08-19. |
| What is missing? | Nothing within the approved parent scope. Installed-plugin freshness and live-host exactly-once behavior remain disclosed non-claims. |
| What is the next allowed action? | No parent run work remains; any VCS, release, publication, deployment or plugin reinstall requires a separate explicit user instruction. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, release, publication, deployment or installed-plugin cache mutation. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_REVIEW.md`; `structured_slice`, `ui_ux_impact: medium`. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| OR | done | OR-full `pass`; parent reconciled with completed corrective child; lifecycle completed without VCS, release or install-cache action. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-scope-classification-card/UR.md` | approved | Revision 1 approved 2026-07-21. |
| Brownfield Review | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_REVIEW.md` | done | Mode `structured_slice`; UX intent required. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-scope-classification-card/UX_INTENT_DEFINITION.md` | ready | Intent, working modes, authority split and eight criteria informed PRD. |
| Verified Change |  | missing | Not selected; structured slice was the approved path. |
| PRD | `.agdf/control/artefacts/agdf-scope-classification-card/PRD.md` | approved | SCC-1 through SCC-8 approved 2026-07-21. |
| SD | `.agdf/control/artefacts/agdf-scope-classification-card/SD.md` | approved | Existing presentation owner and evidence strategy approved. |
| TP | `.agdf/control/artefacts/agdf-scope-classification-card/TP.md` | approved | Original tasks T1 through T9 approved. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation decision `pass`. |
| CD+Tests |  | done | Original T1 through T9 complete; corrective child hardens the retained implementation. |
| CR | `.agdf/control/artefacts/agdf-scope-classification-card/CODE_REVIEW.md` | done | Parent review pass; child reviews also pass with no open finding. |
| TP Review | `.agdf/control/artefacts/agdf-scope-classification-card/TP_REVIEW.md` | done | Original 9/9 fully_done; corrective child 7/7 fully_done. |
| QA | `.agdf/control/artefacts/agdf-scope-classification-card/QA_REPORT.md` | pass | Parent QA approved; corrective child QA approved with current regression evidence. |
| OR | `.agdf/control/artefacts/agdf-scope-classification-card/OR.md` | pass | OR-full reconciles the parent with the completed corrective child and closes the lifecycle. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: New user-facing presentation semantics across canonical owners ruled out compact paths; the bounded additive projection did not require full Structured Delivery depth.
- evidence: parent Brownfield Review; presentation-owner inventory; locale registry; passing eval and integrity evidence.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Original parent approval and artefact chain | parent UR through UAT and OR | intended feature and original acceptance | authoritative |
| Corrective-child OR-full | `.agdf/control/artefacts/scope-classification-card-contract-hardening/OR.md` | retained solution hardening and current limitations | authoritative |
| Final repository checks | child CD+Tests, reviews and QA | 54/54 evals, smoke, Runtime Integrity and sync | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact parent approval accepted 2026-07-21. |
| Brownfield Review | sizes | UR | Selected `structured_slice` and routed UX questions. |
| UX Intent Definition | informs | PRD | Intent and eight criteria flow into the approved PRD. |
| PRD | derived_from | UR | Approved SCC-1 through SCC-8 realize the parent scope. |
| PRD | approved_by | `Approval: PRD` | Exact parent approval accepted 2026-07-21. |
| SD | derived_from | PRD | Existing presentation owner realizes approved behavior. |
| SD | approved_by | `Approval: SD` | Exact parent approval accepted 2026-07-21. |
| TP | derived_from | SD | Tasks T1 through T9 implement the approved design. |
| TP | approved_by | `Approval: TP` | Exact parent approval accepted 2026-07-21. |
| QA_REPORT | tests | TP | Parent QA verifies 9/9 tasks and 8/8 UX-fidelity criteria. |
| QA | approved_by | `Approval: QA` | Exact parent approval accepted 2026-07-21. |
| UAT | approved_by | `Approval: UAT` | Exact parent approval accepted 2026-07-21. |
| Corrective child OR | hardens | Parent implementation | Child OR-full passes with 7/7 tasks, 54/54 evals and resolved Context Graph reconciliation. |
| Parent OR | reconciles | Parent and corrective child | OR-full records the retained final solution, limitations and completed lifecycle. |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: the corrective child records Quick Task-only activation and fail-closed invalid-input/registry recovery with final test, eval, integrity, sync and smoke proof.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Scope-card activation and fail-closed recovery are reusable interaction-authority invariants.
- memory_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; canonical Interaction Contract; parent and corrective-child ORs.

## Closeout

- next_allowed_action: No parent run work remains; any VCS, release, publication, deployment or plugin reinstall requires a separate explicit user instruction.
- quality_outlook: Retain the single-owner renderer and the corrective child's bounded fail-closed contract; no further in-scope remediation is required.
