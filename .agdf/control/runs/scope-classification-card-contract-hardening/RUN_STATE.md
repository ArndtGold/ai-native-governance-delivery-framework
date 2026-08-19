# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: scope-classification-card-contract-hardening
- lifecycle: active
- revision: 10
- revision_id: 7CD75A84-8D98-4AFF-8207-ADC444272DC0
- mode: structured_delivery
- current_gate: UAT
- decision: ready_for_approval
- owner: agent

## Objective

Align the Scope Classification Card implementation, tests and normative owners on one bounded,
plain-text, fail-closed contract without creating a second presentation owner.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA pass is approved. UAT evidence demonstrates the corrected repository and release-built package behavior while explicitly excluding installed-cache freshness and unobserved live-host rendering. |
| What is approved? | Exact `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP` and `Approval: QA`, each accepted after same-run, same-gate, revision and durable-artefact revalidation. |
| What is missing? | Exact `Approval: UAT` for the durable acceptance evidence. |
| What is the next allowed action? | Review UAT Evidence Revision 1 and provide exact `Approval: UAT`, request revision or decline. |
| What is explicitly forbidden right now? | OR/lifecycle closeout and all VCS/release/publication/install-cache actions before UAT approval. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-08-19 after revalidation of run `scope-classification-card-contract-hardening`, gate `UR`, revision 2 and the durable UR. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-08-19 after revalidation of run, gate, revision 4 and durable PRD. |
| SD | approved | Exact `Approval: SD` accepted on 2026-08-19 after revalidation of run, gate, revision 5 and durable SD. |
| TP | approved | Exact `Approval: TP` accepted on 2026-08-19 after revalidation of run, gate, revision 6 and durable TP. |
| QA | approved | Exact `Approval: QA` accepted on 2026-08-19 after revalidation of run, gate, revision 9 and durable passing QA report. |
| UAT | missing | UAT Evidence Revision 1 is ready with explicit installed-plugin and live-host limitations. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/scope-classification-card-contract-hardening/UR.md` | approved | Revision 1 approved on 2026-08-19; records the three confirmed contract gaps, bounded scope, non-goals and acceptance signals. |
| Brownfield Review | `.agdf/control/artefacts/scope-classification-card-contract-hardening/BROWNFIELD_REVIEW.md` | done | Brownfield routing selects `structured_slice` with complete depth facts and no full-depth trigger. |
| Verified Change |  | missing | Mode/Slice Decision not yet made. |
| PRD | `.agdf/control/artefacts/scope-classification-card-contract-hardening/PRD.md` | approved | Revision 1 approved on 2026-08-19; defines Quick Task-only activation, locale recovery, bounded plain-text input and negative evidence. |
| SD | `.agdf/control/artefacts/scope-classification-card-contract-hardening/SD.md` | approved | Revision 1 approved on 2026-08-19; reuses the existing renderer/locale/contract/sync owners and defines exact validation and evidence behavior. |
| TP | `.agdf/control/artefacts/scope-classification-card-contract-hardening/TP.md` | approved | Revision 1 approved on 2026-08-19; covers every SCH criterion with stable task IDs, negative evidence and a mandatory pre-implementation Brownfield stop. |
| Brownfield Analysis | `.agdf/control/artefacts/scope-classification-card-contract-hardening/BROWNFIELD_ANALYSIS.md` | done | `pass`; existing owners are sufficient, target source paths are clean and unrelated control changes do not overlap. |
| CD+Tests | `.agdf/control/artefacts/scope-classification-card-contract-hardening/CD_TESTS.md` | done | SCH-T1 through SCH-T7 complete; focused and full regressions pass with explicit repository-versus-host evidence boundary. |
| TP Review | `.agdf/control/artefacts/scope-classification-card-contract-hardening/TASK_PLAN_REVIEW.md` | done | `pass`; 7/7 tasks fully_done and all ten SCH criteria fulfilled. |
| Clean Review | `.agdf/control/artefacts/scope-classification-card-contract-hardening/CLEAN_IMPLEMENTATION_REVIEW.md` | done | `pass`; one existing-owner primary solution with no workaround, shim or parallel structure. |
| CR | `.agdf/control/artefacts/scope-classification-card-contract-hardening/CODE_REVIEW.md` | done | `pass`; no correctness, security, regression or maintainability finding remains. |
| QA | `.agdf/control/artefacts/scope-classification-card-contract-hardening/QA_REPORT.md` | pass | `qa-gate` pass approved on 2026-08-19; repository evidence is not presented as live-host UAT. |
| UAT Evidence | `.agdf/control/artefacts/scope-classification-card-contract-hardening/UAT_EVIDENCE.md` | ready_for_decision | Repository/release-built package behavior is evidenced; installed plugin freshness and live-host rendering remain explicitly unproven. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: `bounded_structured_slice` — one coherent, reversible contract correction across existing owners; Quick Task and Verified Change are ineligible because normative product behavior changes, while no full-depth trigger exists.
- evidence: `.agdf/control/artefacts/scope-classification-card-contract-hardening/BROWNFIELD_REVIEW.md`; approved UR; parent artefacts; renderer, locale registry and focused probes.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approved parent product and design contract | `.agdf/control/artefacts/agdf-scope-classification-card/PRD.md`; `SD.md` | Intended modes, plain-text bounds and locale behavior | authoritative |
| Current renderer | `create-agdf/lib/interaction-presentation.js` | Implemented validation and rendering behavior | direct code evidence |
| Focused probes | 2026-08-19 local Node execution | `verified_change`, Markdown/over-length input and incomplete-locale behavior | direct runtime evidence |
| Existing focused checks | `test:interaction-presentation`; Runtime Integrity | Current baseline remains green while gaps are untested or encoded | direct test evidence |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-08-19 after same-run, same-gate, revision 2 and durable-artefact revalidation. |
| Brownfield Review | sizes | UR | Complete post-UR existing-system evidence selects `structured_slice` and rejects compact/full-depth alternatives. |
| Brownfield Review | selects_mode | structured_slice | Complete Structured Depth Evidence with all seven bounded-slice checks `pass`. |
| UX Intent Definition | informs | PRD | Ready analysis defines activation, visible state, blockers, recovery and transitions for the medium-impact correction. |
| PRD | derived_from | UR | PRD Revision 1 implements the approved contract-hardening scope without adding a second presentation owner. |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-08-19 after same-run, same-gate, revision 4 and durable-artefact revalidation. |
| SD | derived_from | PRD | SD Revision 1 realizes every SCH criterion through existing owners, bounded validation and focused evidence. |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-08-19 after same-run, same-gate, revision 5 and durable-artefact revalidation. |
| TP | derived_from | SD | TP Revision 1 maps all ten SCH criteria to seven bounded tasks, explicit tests and one pre-implementation Brownfield stop. |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-08-19 after same-run, same-gate, revision 6 and durable-artefact revalidation. |
| Brownfield Analysis | validates | TP | Pre-implementation analysis passes: reuse path, target ownership, regression surface and dirty-worktree boundaries are explicit. |
| CD+Tests | implements | TP | SCH-T1 through SCH-T7 complete with focused and full regression evidence. |
| TP Review | verifies | TP | 7/7 tasks fully_done; all ten PRD criteria fulfilled. |
| Clean Review | verifies | SD | Existing owners retained with no workaround or parallel structure. |
| Code Review | verifies | CD+Tests | Actual diff reviewed; no open finding. |
| QA_REPORT | tests | TP | QA pass from 7/7 TP coverage, 10/10 UX fidelity, clean/code reviews, final full smoke and resolved Context Graph impact. |
| QA | approved_by | `Approval: QA` | Exact approval accepted on 2026-08-19 after same-run, same-gate, revision 9 and durable passing QA-report revalidation. |
| UAT Evidence | accepts | QA_REPORT | Acceptance candidate covers repository and release-built package behavior with installed-plugin and live-host limits disclosed. |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-NATIVE-INTERACTION-AUTHORITY` now records Quick Task-only activation and fail-closed invalid-input/registry recovery with passing renderer, eval, integrity, sync and smoke evidence.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Scope-card activation and fail-closed invalid-input recovery are reusable interaction-authority invariants.
- memory_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; child UR, Brownfield Review and future approved PRD.

## Closeout

- next_allowed_action: Review UAT Evidence Revision 1 and provide exact `Approval: UAT`, request revision or decline.
- quality_outlook: Preserve the single-owner renderer and correct only the confirmed contract-fidelity gaps.
