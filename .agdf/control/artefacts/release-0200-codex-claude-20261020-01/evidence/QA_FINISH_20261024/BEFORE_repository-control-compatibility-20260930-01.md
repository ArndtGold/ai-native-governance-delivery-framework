# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: repository-control-compatibility-20260930-01
- lifecycle: active
- revision: 22
- revision_id: adf6c70b-3a5b-46d1-ab01-7d01e7f0124f
- content_seal: sha256:663eac4d10b80b697e355a21477e57de170fc678aad0a9f03ad2cbeb5a7b1bf3
- approval_seal: sha256:eef8656d73ab3beaa214201fa0071871f99ea2fd9529329b9de44fd1c5eb4811
- updated_at: 2026-09-30T14:11:51.592Z
- mode: structured_delivery
- current_gate: QA
- decision: pass
- owner: Arndt Gold

## Objective

Inspect compatibility for each selected repository and provide direct, reviewed migration and repair through the installed runtime without reinstalling the plugin.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Matching installed candidate, actual PTY maintenance and four automatic native SessionStart cases passed; TP-E01 resolved; QA pass. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Exact human Approval: QA and later UAT are absent. No implementation/QA-scope evidence gap remains. |
| What is the next allowed action? | Run the QA gate, persist the QA report, and request exact approval: Approval: QA |
| What is explicitly forbidden right now? | request UAT approval; release; claim delivery readiness before QA approval and report evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-30 · revision 2 · `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UR.md` sha256:70a964a99691c61e · presentation 10154771-108b-49cc-9d39-b251e5f75acd sha256:b1b2f2f9fe80b745c5fcbd4a959c1353108a26e8861a41086aeb52c9edcaa92e |
| PRD | approved | `Approval: PRD` · 2026-09-30 · revision 7 · `.agdf/control/artefacts/repository-control-compatibility-20260930-01/PRD.md` sha256:7713dbd509635e04 · presentation 1ed3f937-5695-4949-9ae0-8fd86e21324f sha256:a4b619d002d6488e760a9d592193905adc96d051ca0387d7fc0fb6a74e9a984f |
| SD | approved | `Approval: SD` · 2026-09-30 · revision 10 · `.agdf/control/artefacts/repository-control-compatibility-20260930-01/SD.md` sha256:fc4df832163a74de · presentation b81e1ffd-5e8f-4bcb-b9b7-e14dd91769a6 sha256:668ec80a532ff06c3c2866265072771dffa251439b5887316e4817a954936577 |
| TP | approved | `Approval: TP` · 2026-09-30 · revision 12 · `.agdf/control/artefacts/repository-control-compatibility-20260930-01/TP.md` sha256:681fc16a6a96dc67 · presentation 06d9911b-7366-4c34-893e-01ecda8ddf98 sha256:1b24ab7b31d3f501a83dd7be8259c41de08c2bf4185bb0f21d1f1701a32c9900 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/PRD.md` | approved | 12 stable acceptance criteria; product decisions resolved; SD/TP choices remain downstream |
| SD | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/SD.md` | approved | Shared maintenance owner, explicit-root CLI, consent-bound startup facts; 12 criteria mapped once to 7 stable design decisions. |
| TP | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/TP.md` | approved | 9 tasks, 30 scenarios; complete criterion/design traceability, execution environments and permission/evidence prerequisites. |
| Brownfield Analysis | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_ANALYSIS.md` | done | pre_implementation_analysis: pass; approved TP ownership and regression path verified; baseline captured. |
| CD+Tests | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CD_TESTS.md` | done | 29 automated suites, installed PTY maintenance and four actual native SessionStart cases passed. |
| CR | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CODE_REVIEW.md` | done | Code Review pass; two source findings resolved; installed-host evidence remains separate. |
| QA | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/QA_REPORT.md` | pass | All applicable criteria/UX rows fulfilled; TP-E01 resolved by actual native events; human approval pending. |
| UX Intent Definition | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UX_INTENT_DEFINITION.md` | ready | Analytical PRD input; no approval authority |
| TP Review | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/TASK_PLAN_REVIEW.md` | pass | All nine tasks fully done; native startup and installed operations separately evidenced. |
| Clean Implementation Review | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CLEAN_IMPLEMENTATION_REVIEW.md` | done | Clean Review pass; single shared maintenance owner, exact dependency/payload review. |
| Codex Live Observation | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CODEX_LIVE_OBSERVATION.md` | done | Exact installed candidate; actual PTY operations and four automatic native fresh-session events passed. |
| Installed Live Evidence | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/LIVE_EVIDENCE.json` | done | Installed identity/context/transcript hashes; agent-operated fixture choices, not human gate approval. |
| Native Session Observation | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/NATIVE_SESSION_OBSERVATION.md` | done | Four fresh ephemeral Codex app-server sessions; enabled trusted hook; correct migration/repair/current/absent context. |
| Native Session Evidence | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/NATIVE_SESSION_EVIDENCE.json` | done | Native raw events, distinct session IDs, candidate binding and unchanged root/receipt hashes. |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: direct repository maintenance extends the delivered runtime/CLI contract and actionable startup facts; structured_slice rejected because full_depth_impacts_absent fails.
- evidence: .agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-30 · revision 2 · `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UR.md` sha256:70a964a99691c61e · presentation 10154771-108b-49cc-9d39-b251e5f75acd sha256:b1b2f2f9fe80b745c5fcbd4a959c1353108a26e8861a41086aeb52c9edcaa92e |
| UX Intent Definition | informs | PRD | Ready non-authorizing input; product acceptance belongs only to the approved PRD. |
| PRD | derived_from | UR | Approved UR scope: repository-specific compatibility checks, direct migration and repair, and choices 1/2/3 without reinstallation. |
| PRD | informed_by | Brownfield Review | Completed review selects full structured delivery for the externally consumed runtime/CLI contract and identifies existing canonical owners. |
| SD | derived_from | PRD | Approved PRD revision 7 / presentation 1ed3f937-5695-4949-9ae0-8fd86e21324f; AC-001 through AC-012 realized in Acceptance Traceability without changing product acceptance. |
| TP | derived_from | SD | Approved SD revision 10 / presentation b81e1ffd-5e8f-4bcb-b9b7-e14dd91769a6; maps AC-001 through AC-012 and each associated SDD decision to stable tasks/scenarios. |
| CD+Tests | derived_from | TP | Approved TP tasks and 30 scenarios evidenced through source/package, installed PTY and actual native SessionStart lanes. |
| CR | verifies | CD+Tests | Scoped diff, 29 suites, canonical body parity; no remaining source defect. |
| QA | evaluates | CD+Tests and CR | Completed plan/source/clean reviews and actual native installed lane; QA pass, no human approval. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| PRD and UX intent | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/PRD.md`; `.agdf/control/artefacts/repository-control-compatibility-20260930-01/UX_INTENT_DEFINITION.md` | Repository states, choices, safety, 12 stable criteria and resolved product decisions | direct source analysis; not implementation or live-host evidence |
| SD draft | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/SD.md` | Canonical ownership, command grammar, result/facts, migration/repair flow, package and consent compatibility | source-grounded design; no implementation or live-host claim |
| TP draft | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/TP.md` | Task ordering, source preservation, direct/startup integration, boundary regressions, profile validation and separate fresh Codex lane | source-grounded plan; all scenario results are expected, not executed |
| Brownfield Analysis | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/BROWNFIELD_ANALYSIS.md` | Approved TP preparation, reuse and baseline | source inspection; no live-host claim |
| Automated implementation evidence | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/AUTOMATED_EVIDENCE.json` | Source/generated fixtures and scoped source digests | direct; not fresh installed host |
| Fresh host evidence gap | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/HOST_EVIDENCE_GAP.md` | T-008 / SCN-028 through SCN-030 | explicit missing observation |
| Code Review | code-review | decision pass: .agdf/control/artefacts/repository-control-compatibility-20260930-01/CODE_REVIEW.md | direct |
| TP and Clean reviews | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/TASK_PLAN_REVIEW.md`; `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CLEAN_IMPLEMENTATION_REVIEW.md` | Plan and structural readiness | direct source/fixture evidence; one open host evidence obligation |
| QA revise | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/QA_REPORT.md` | Quality Readiness; TP-E01 missing fresh host | bounded formal QA decision; no human approval |
| Installed live follow-up | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/CODEX_LIVE_OBSERVATION.md`; `.agdf/control/artefacts/repository-control-compatibility-20260930-01/LIVE_EVIDENCE.json` | T-008 / actual cache startup and direct PTY maintenance | direct installed behavior; native automatic isolated-root session still missing |
| QA installed live reevaluation | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/QA_REPORT.md` | Passed installed behavior; native fresh-session boundary | bounded revise; no human QA approval |
| Native fresh-session follow-up | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/NATIVE_SESSION_OBSERVATION.md`; `.agdf/control/artefacts/repository-control-compatibility-20260930-01/NATIVE_SESSION_EVIDENCE.json` | SCN-028/029; four native roots; TP-E01 resolved | direct automatic host event/model-context evidence; no human UAT |
| QA native reevaluation | `.agdf/control/artefacts/repository-control-compatibility-20260930-01/QA_REPORT.md` | Quality Readiness pass within approved scope | formal QA decision; exact human approval pending |

## Closeout

- next_allowed_action: Run the QA gate, persist the QA report, and request exact approval: Approval: QA
- quality_outlook:

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Direct repository maintenance adds a distinct primary recovery action and actionable startup compatibility state.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/repository-control-compatibility-20260930-01/UX_INTENT_DEFINITION.md
