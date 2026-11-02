# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: deterministic-agent-ux
- lifecycle: completed
- revision: 18
- revision_id: 2592aa37-0b6c-4604-8b62-71e37d8c74fe
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make AGDF's agent-native interaction model immediately understandable across Codex, Claude Code,
OpenCode and GitHub Copilot, and reduce model-dependent approval-format drift through one
deterministic, render-ready presentation path without changing gate authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | DAU-01 through DAU-10 and all mandatory reviews pass. UAT accepted the delivered behavior with the disclosed live-surface limits retained. |
| What is approved? | UR revision 2, PRD revision 3, SD revision 3, TP revision 1, QA pass report and UAT are approved. |
| What is missing? | No required delivery artefact or user approval. Authenticated live Claude Code, OpenCode and GitHub Copilot observations remain intentionally unverified. |
| What is the next allowed action? | No further delivery step. A separately requested delivery handoff may prepare VCS actions without executing them automatically. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, publish or release; unverified live-host behavior must not be claimed. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted for revision 2 on 2026-07-17 after durable artefact and selected-run revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted for revision 3 on 2026-07-17 after selected-run, same-gate and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted for revision 3 on 2026-07-17 after selected-run, same-gate and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted for revision 1 on 2026-07-17 after selected-run, same-gate and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted for the pass report on 2026-07-17 after selected-run, same-gate, revision and durable-report revalidation. |
| UAT | approved | Exact `Approval: UAT` received on 2026-07-17 after selected-run, same-gate, revision and durable-evidence revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/deterministic-agent-ux/UR.md` | approved | Revision 2 with Copilot scope approved on 2026-07-17. |
| Brownfield Review | `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md` | done | Revision 2 confirms Copilot's generated instruction/skill owners, exact-text transport and `structured_slice` path. |
| Verified Change | `.agdf/control/artefacts/deterministic-agent-ux/VERIFIED_CHANGE.md` | missing | Eligibility not assessed. |
| PRD | `.agdf/control/artefacts/deterministic-agent-ux/PRD.md` | approved | Revision 3 approved on 2026-07-17 with the neutral five-field decision contract. |
| SD | `.agdf/control/artefacts/deterministic-agent-ux/SD.md` | approved | Revision 3 approved on 2026-07-17 with the neutral five-field Card Design Contract. |
| TP | `.agdf/control/artefacts/deterministic-agent-ux/TP.md` | approved | Revision 1 approved on 2026-07-17. |
| Brownfield Analysis | `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation analysis passes; existing owners, wrapper boundary, risks and test path are verified. |
| CD+Tests | `.agdf/control/artefacts/deterministic-agent-ux/CD_TESTS.md` | done | DAU-01 through DAU-10 delivered; focused and aggregate repository verification passes. |
| Task Plan Review | `.agdf/control/artefacts/deterministic-agent-ux/TASK_PLAN_REVIEW.md` | done | Pass; 10/10 tasks fully done. |
| Clean Implementation Review | `.agdf/control/artefacts/deterministic-agent-ux/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Pass; canonical owners reused and no parallel structure remains. |
| CR | `.agdf/control/artefacts/deterministic-agent-ux/CODE_REVIEW.md` | done | Pass; no remaining correctness, compatibility, security or maintainability finding. |
| QA | `.agdf/control/artefacts/deterministic-agent-ux/QA_REPORT.md` | passed | QA pass decision approved on 2026-07-17 after fresh gate revalidation. |
| UAT Evidence | `.agdf/control/artefacts/deterministic-agent-ux/UAT_EVIDENCE.md` | accepted | Exact UAT approval accepts the delivered behavior while the disclosed live-host limitations remain explicit. |
| OR | `.agdf/control/artefacts/deterministic-agent-ux/OR.md` | pass | All delivery gates are complete; VCS and release actions remain separately user-controlled. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Copilot adds a generated repository instruction/skill consumer and exact-text transport, not a new authority or plugin runtime. The slice still affects normative guidance, executable projection code, public documentation and generated surfaces, so a compact structured slice remains proportionate.
- evidence: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md`; `plugin/meta/agdf-plugin.definition.json`; `create-agdf/scripts/sync-package-assets.js`; generated `.github/skills/**` and `.github/copilot-instructions.md`.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Claude Code UX assessment | User-provided feedback on 2026-07-17 | Apparent parallel UX surfaces, `npx` latency, model-formatting burden | direct observation |
| Existing ownership contract | `plugin/meta/contracts/control-scaffold.md` | Agent-native primary path and CLI-validator boundary | direct repository evidence |
| Existing interaction implementation | `create-agdf/lib/interaction-presentation.js`; `create-agdf/lib/control-evaluation/gate-check.js` | Snapshot validation and current projection boundary | direct repository evidence |
| Prior UX runs | completed `approval-orientation-completeness`, `agdf-human-decision-surface`, `agdf-ux-next-round`, `installer-output-parity` | Existing decisions and non-duplication boundary | durable repository evidence |
| Code Deliverables and Tests | `.agdf/control/artefacts/deterministic-agent-ux/CD_TESTS.md` | DAU-01 through DAU-10, focused and aggregate verification, live-evidence boundary | strong direct evidence |
| Mandatory reviews | `TASK_PLAN_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md`; `QA_REPORT.md` | Plan coverage, solution integrity, actual diff review and QA pass decision | strong durable evidence |
| UAT evidence | `.agdf/control/artefacts/deterministic-agent-ux/UAT_EVIDENCE.md` | Live Codex interaction, repository conformance and disclosed unverified surfaces | direct bounded evidence |

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR revision 1 | approved_by | `Approval: UR` | superseded | Exact approval accepted on 2026-07-17 before GitHub Copilot became a full target surface. |
| UR revision 2 | revises | UR revision 1 | approved | Adds GitHub Copilot as a full consumer of the canonical projection and fallback semantics. |
| UR revision 2 | approved_by | `Approval: UR` | approved | Exact approval accepted on 2026-07-17 after same-run, same-gate and durable-artefact revalidation. |
| UR | approved_by | `Approval: UR` | approved | Canonical current-UR relationship for approved revision 2. |
| Brownfield Review revision 1 | sizes | UR revision 1 | superseded | Must be refreshed against the expanded surface scope after revised UR approval. |
| PRD revision 1 | derived_from | UR revision 1 | draft | Non-authorizing draft; must be aligned after revised UR approval and Brownfield refresh. |
| Brownfield Review | sizes | UR | done | Revision 2 confirms Copilot's existing generated owners, exact-text transport and unchanged `structured_slice` decision. |
| PRD revision 2 | derived_from | UR | superseded | Approved historical product contract before the five-field decision-surface correction. |
| PRD revision 2 | approved_by | `Approval: PRD` | superseded | Exact approval accepted on 2026-07-17 for revision 2 only. |
| PRD revision 3 | revises | PRD revision 2 | approved | Aligns the product contract with the reviewed neutral five-field decision surface and recovery branch. |
| PRD revision 3 | approved_by | `Approval: PRD` | approved | Exact approval accepted on 2026-07-17 after same-run, same-gate and durable-artefact revalidation. |
| PRD | derived_from | UR | approved | Canonical current PRD relationship for approved revision 3. |
| SD | derived_from | PRD | approved | Revision 3 is aligned with approved PRD revision 3. |
| SD revision 3 | approved_by | `Approval: SD` | approved | Exact approval accepted on 2026-07-17 after same-run, same-gate and durable-artefact revalidation. |
| TP | derived_from | SD | approved | Revision 1 maps the approved design to ten ordered tasks, verification and review constraints. |
| TP revision 1 | approved_by | `Approval: TP` | approved | Exact approval accepted on 2026-07-17 after same-run, same-gate and durable-artefact revalidation. |
| Brownfield Analysis | verifies | TP revision 1 | done | Decision `pass`; canonical owners, reuse boundaries, wrapper path, regressions and Context Graph links are confirmed. |
| CD+Tests | implements_and_tests | TP revision 1 | done | DAU-01 through DAU-10 delivered; aggregate package smoke, Runtime Integrity, wrapper smoke, doctor and whitespace checks pass. |
| Task Plan Review | verifies | TP revision 1 | done | Pass; 10/10 tasks fully done with live-host evidence explicitly deferred to UAT. |
| Clean Implementation Review | verifies | CD+Tests | done | Pass; canonical owners reused, bounded exact-text recovery retained, no parallel structure. |
| Code Review | reviews | CD+Tests | done | Pass; review-time findings were resolved and no meaningful finding remains. |
| QA_REPORT | tests | TP | passed | `.agdf/control/artefacts/deterministic-agent-ux/QA_REPORT.md`; `qa-gate` decision pass with separate approval evidence in the following relationship. |
| QA Report | approved_by | `Approval: QA` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-report revalidation. |
| UAT Evidence | validates | QA Report | accepted | Live Codex behavior and repository conformance are accepted with unverified native and cross-host behavior kept explicit. |
| UAT Evidence | accepted_by | `Approval: UAT` | approved | Exact approval accepted on 2026-07-17 after selected-run, same-gate, revision and durable-evidence revalidation. |
| OR | closes | UAT Evidence | pass | Full closeout records delivered scope, retained limits and the separate VCS/release authority boundary. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md`

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Run-specific sizing is stored in the Brownfield Review; reusable invariants already have existing Context Graph owners.
- memory_refs: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md`

## Closeout

- next_allowed_action: No further delivery step. A separately requested delivery handoff may prepare VCS actions; it must not execute them automatically.
- quality_outlook: Preserve the truthful distinction between deterministic repository conformance and unverified host-visible behavior.
