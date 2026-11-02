# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: coding-agent-user-guide-de
- lifecycle: completed
- revision: 20
- revision_id: 6fe12f85-ce15-4936-92f3-1f20c5d71fac
- mode: structured_slice
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Create a concise German, task-oriented user guide for applying AGDF through coding agents without
duplicating normative runtime, installation or CLI sources of truth.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Existing `docs/00-07` explain the framework; installation and runtime references already have separate owners. |
| What is approved? | UR, PRD, TP, refreshed QA and renewed UAT are approved. |
| What is missing? | No delivery evidence is missing. Git delivery remains a separate explicit instruction. |
| What is the next allowed action? | Request explicit Git delivery instruction if commit, push or PR is wanted. |
| What is explicitly forbidden right now? | Commit, push, PR and release without explicit delivery instruction. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/coding-agent-user-guide-de/UR.md`; `.agdf/control/MASTER_BACKLOG.md`
- competing_scope_lines: none; the existing run-scoped implementation remains independently at UAT
- branch_workspace_evidence: The user explicitly requested starting a German guide for AGDF use in coding agents.
- branch_workspace_scope_effect: supports

## Run Status Card

| Run status | Value |
|---|---|
| Status | Complete; OR recorded |
| Current gate | OR |
| Allowed now | Produce delivery closeout only after explicit Git delivery instruction |
| Blocked by | none |
| Missing approval | none |
| Next step | Request explicit Git delivery instruction if desired |
| Quality outlook | Keep the README entry paths short while preserving one owner per rule class |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-12 |
| PRD | approved | `Approval: PRD` provided on 2026-07-12 |
| SD | approved | `Approval: SD` provided on 2026-07-12 |
| TP | approved | `Approval: TP` provided on 2026-07-12 |
| QA | approved | `Approval: QA` provided on 2026-07-12 for the refreshed QA Report |
| UAT | approved | `Approval: UAT` provided on 2026-07-12 for the README refinement revision |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/coding-agent-user-guide-de/UR.md | approved | `Approval: UR` provided on 2026-07-12 |
| Brownfield Review | .agdf/control/artefacts/coding-agent-user-guide-de/BROWNFIELD_REVIEW.md | done | Passed; selected `structured_slice` and PRD next |
| PRD | .agdf/control/artefacts/coding-agent-user-guide-de/PRD.md | approved | `Approval: PRD` provided on 2026-07-12 |
| SD | .agdf/control/artefacts/coding-agent-user-guide-de/SD.md | approved | `Approval: SD` provided on 2026-07-12 |
| TP | .agdf/control/artefacts/coding-agent-user-guide-de/TP.md | approved | `Approval: TP` provided on 2026-07-12 |
| Brownfield Analysis | .agdf/control/artefacts/coding-agent-user-guide-de/BROWNFIELD_ANALYSIS.md | done | Passed; minimal documentation-only path confirmed |
| TP Review | .agdf/control/artefacts/coding-agent-user-guide-de/TP_REVIEW.md | done | Refreshed 8/8 after README entry-path refinement |
| Clean Review | .agdf/control/artefacts/coding-agent-user-guide-de/CLEAN_IMPLEMENTATION_REVIEW.md | done | Pass; one bounded guide cluster and no parallel owner |
| Review | .agdf/control/artefacts/coding-agent-user-guide-de/CODE_REVIEW.md | done | Pass; no actionable finding in the README refinement |
| QA | .agdf/control/artefacts/coding-agent-user-guide-de/QA_REPORT.md | pass | Refreshed QA pass and `Approval: QA` provided on 2026-07-12 |
| OR | .agdf/control/artefacts/coding-agent-user-guide-de/OR.md | done | Full closeout recorded after renewed UAT approval |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Six maintained public chapters and navigation links require a compact content contract, while no runtime or application architecture changes are planned.
- evidence: `.agdf/control/artefacts/coding-agent-user-guide-de/BROWNFIELD_REVIEW.md`
- transparency_note: Use a compact PRD; skip SD unless the PRD introduces generation or website architecture work.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-12 |
| Brownfield Review | sizes | UR | Existing documentation owners inspected; `structured_slice` selected |
| PRD | derived_from | UR | Audience, guide structure, source boundaries and acceptance criteria |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-07-12 |
| SD | derived_from | PRD | Guide cluster, source boundaries and validation strategy |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-12 |
| TP | derived_from | SD | File set, validation strategy and review requirements |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-12 |
| Brownfield Analysis | verifies | TP | Passed; guide cluster and root link are the clean reuse path |
| TP Review | verifies | TP | Refreshed 8/8 after README entry-path refinement |
| Clean Review | verifies | implementation | Passed; no workaround or parallel-owner finding |
| Code Review | verifies | implementation | Passed; no actionable finding |
| QA_REPORT | tests | TP | Refreshed QA Report records 8/8 TP coverage, README link validation and runtime integrity evidence |
| QA Report (revision 17) | approved_by | `Approval: QA` | Exact approval provided on 2026-07-12; superseded by revision 18 refinement |
| Guide UAT (revision 17) | approved_by | `Approval: UAT` | Exact approval provided on 2026-07-12; superseded by revision 18 refinement |
| QA Report (revision 18) | approved_by | `Approval: QA` | Exact approval provided on 2026-07-12 |
| Guide UAT (revision 18) | approved_by | `Approval: UAT` | Exact approval provided on 2026-07-12 |
| OR | closes | delivery slice | `.agdf/control/artefacts/coding-agent-user-guide-de/OR.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Existing documentation ownership scan | `README.md`; `docs/`; `INSTALL.md`; package READMEs; plugin runtime/control sources | Documentation boundary | direct |
| User requested German-first coding-agent usage guidance | Conversation on 2026-07-12 | User need and language | direct |
| Guide Markdown render passes | `marked` render of all seven guide files on 2026-07-12 | Visible Markdown structure | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Explicit Git delivery instruction | permits commit, push or PR handoff | User explicitly requests the intended Git action |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Guide duplicates normative rules and drifts | warn | Approved PRD requires canonical links and prohibits duplicate rule tables |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Documentation structure is scope-local until Brownfield Review finds a reusable invariant.

## Closeout

- delivered: Guide cluster, root entry point, Banking-example reuse, terminology clarification, README entry-path refinement and OR.
- not_delivered: Commit, push, PR or release.
- verification_performed: Local Markdown links, runtime integrity, diff whitespace, documentation ownership review, refreshed QA pass/approval and renewed UAT approval.
- unverified: No in-scope delivery evidence; Git delivery was intentionally not requested.
- next_allowed_action: Request explicit Git delivery instruction if desired.
- quality_outlook: Prefer a small navigable guide over a second documentation system.
