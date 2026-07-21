# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-scope-classification-card
- lifecycle: active
- revision: 1
- revision_id: 84a3e9be-b468-4477-b8fa-f92ccaa51820
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Make fresh-scope gate classification a canonical, deterministic, code-owned compact presentation so
ungated scope decisions (Quick Task, Trivial Change Boundary) are always visible and challengeable
across models and hosts, without becoming a gate and without adding ceremony to lightweight paths.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Fresh ungated scopes have no canonical classification presentation; ready user gates have deterministic code-owned presentations (`status_presentation`, `approval_presentation`). On 2026-07-21 in this repository an agent began `evals/**` edits without visible classification; only user challenges surfaced an ad-hoc rendering. |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD` and `Approval: TP`, each accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP`, `Approval: QA` and `Approval: UAT`, each accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| What is missing? | Orchestration Report (OR) as the mandatory closeout for this relevant run. |
| What is the next allowed action? | Produce the OR; prepare VCS handoff only when separately requested. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, release — VCS actions require separate explicit user instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_REVIEW.md` 2026-07-21; `delivery_context: brownfield`, `ui_ux_impact: medium`, `ux_intent_definition_required: yes`. |
| Mode/Slice Decision | structured_slice | Recorded in the same internal operation with scope reason and evidence; next gate PRD. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| OR | done | `.agdf/control/artefacts/agdf-scope-classification-card/OR.md` 2026-07-21; OR-lite, all gates approved, delivery closeout ready. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-scope-classification-card/UR.md` | approved | Revision 1, approved 2026-07-21; scope, non-goals and acceptance signals for the canonical classification card. |
| Brownfield Review | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_REVIEW.md` | done | 2026-07-21; Mode/Slice Decision `structured_slice`, next gate PRD; `ui_ux_impact: medium`, UX intent definition required. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-scope-classification-card/UX_INTENT_DEFINITION.md` | ready | 2026-07-21; non-authorizing analytical PRD input: intent, three working modes, state authority vs. presentation ownership, activation/blockers/recovery/transitions, 8 proposed PRD acceptance criteria, 3 routed product questions. |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-scope-classification-card/PRD.md` | approved | Approved 2026-07-21; compact chat-only card, always rendered for fresh ungated scopes, criteria SCC-1…SCC-8. |
| SD | `.agdf/control/artefacts/agdf-scope-classification-card/SD.md` | approved | Approved 2026-07-21; renderer placement, input contract, activation boundary, evidence strategy fixed. |
| TP | `.agdf/control/artefacts/agdf-scope-classification-card/TP.md` | approved | Approved 2026-07-21; tasks T1–T9, UX Intent Fidelity all `fulfilled`, evidence plan fixed. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_ANALYSIS.md` | done | 2026-07-21; `pre_implementation_analysis`, decision `pass`, next CD+Tests. |
| CD+Tests |  | done | T1–T9 implemented 2026-07-21: renderer, locale section (en/de), contract section, skill section, integrity assertions, unit tests, 3 eval cases, sync, Pages — all green. |
| CR | `.agdf/control/artefacts/agdf-scope-classification-card/CODE_REVIEW.md` | done | 2026-07-21; decision `pass`, no findings. |
| TP Review | `.agdf/control/artefacts/agdf-scope-classification-card/TP_REVIEW.md` | done | 2026-07-21; 9/9 fully_done, UX Fidelity 8/8 fulfilled, no open findings. |
| OR | `.agdf/control/artefacts/agdf-scope-classification-card/OR.md` | done | 2026-07-21; OR-lite, delivery closeout ready. |
| QA | `.agdf/control/artefacts/agdf-scope-classification-card/QA_REPORT.md` | pass | Approved 2026-07-21; decision `pass`, TP 9/9, UX Fidelity 8/8. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: New user-facing presentation semantics across several canonical owners rule out `quick_task`/`verified_change`; bounded to one additive projection plus consumption and assertions, so full `structured_delivery` is disproportionate.
- evidence: `.agdf/control/artefacts/agdf-scope-classification-card/BROWNFIELD_REVIEW.md` (2026-07-21); presentation owner export inventory; locale registry structure; green eval/integrity runs.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Session observation 2026-07-21: edits started without visible classification; ad-hoc table only after two user challenges | this repository, delivery session | problem reality | direct |
| Deterministic presentation owners exist for gated runs | `plugin/meta/contracts/interaction.md`; `create-agdf/lib/interaction-presentation.js` | reuse path | direct |
| Ungated scope output is agent-authored, no code-owned projection | `plugin/skills/gate-check/SKILL.md` output section | gap definition | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Session observation 2026-07-21 | Edits started without visible classification; only user challenges surfaced an ad-hoc rendering (UR §1). |
| UR | scoped_by | Non-Goals section of UR | Excludes new gates, approval values, transition-model changes, persistence and VCS actions. |
| Brownfield Review | sizes | UR | Sized to `structured_slice`; routed evaluation-location and orientation-overlap questions to PRD/SD. |
| Brownfield Review | selects_mode | structured_slice | Bounded additive projection across several canonical owners; evidence in `BROWNFIELD_REVIEW.md`. |
| UX Intent Definition | informs | PRD | `ready` 2026-07-21; intent, working modes, authority split and proposed criteria flow into PRD sections 2–5. |
| PRD | derived_from | UR | PRD §1–§5 realizes the approved UR scope with the three routed product decisions and criteria SCC-1…SCC-8. |
| SD | derived_from | PRD | SD §1–§6 places the approved PRD scope onto the existing presentation owner with a validated input contract. |
| PRD | decides | Routed product questions | Reach (always render), format (chat-only), depth (compact summary) decided in PRD §1 from UX Intent Definition open questions. |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | realizes | PRD | SD §1–§3 map PRD scope onto the existing presentation owner with a validated input contract; evaluation-location question answered as agent-evaluated + code-rendered (small slice). |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | TP §1 maps SD §3 architecture decisions and §6 evidence strategy onto tasks T1–T9 with UX Intent Fidelity. |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| QA_REPORT | tests | TP | QA report verifies TP 9/9 tasks with UX Intent Fidelity SCC-1…SCC-8 all fulfilled. |

## Closeout

- next_allowed_action: Produce the OR; VCS handoff only on separate explicit user instruction.
- quality_outlook: Keep the presentation owner singular; proportionality of the card is the primary design risk.
