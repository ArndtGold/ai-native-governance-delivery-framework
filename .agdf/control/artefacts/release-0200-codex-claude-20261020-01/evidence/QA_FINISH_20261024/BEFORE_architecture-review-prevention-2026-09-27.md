# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: architecture-review-prevention-2026-09-27
- lifecycle: active
- revision: 21
- revision_id: 64ad08ec-825c-42bf-a2a4-62779ec5e636
- content_seal: sha256:c9c2614ad9d6decdb3fdbcce562d6ee11d6df753d97b797e0f43a6123412633e
- approval_seal: sha256:dff2c429dd60f2516b26bee3ea715c139e593b44ade35d797f7c6c773a443c79
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: agent

## Objective

Make architecture risks and trade-offs visible before implementation so the smallest durable solution fits the existing system and avoids preventable technical debt.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Evidence recorded: Final source and package checks pass; seven Codex model cases current; direct four-host Brownfield acceptance remains open. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR. |
| What is explicitly forbidden right now? | claim QA pass; request UAT approval; release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-27 · revision 2 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md` sha256:981fceeb73238947 · presentation 9b8d8ef0-a910-4cdc-b6ee-a5485eace972 sha256:e4b0a66d0ca0abb894b5c176babca3ff45c0a311fdc9f79e3709bb315a7ac4c5 |
| PRD | approved | `Approval: PRD` · 2026-09-28 · revision 11 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/PRD.md` sha256:8ebc3a31ec124af9 · presentation 489fb782-e671-44a6-af7c-d111287c6008 sha256:e1ba74b148062fb7b86ec1eb99fe66051ea329c4507476a93012f94a306df266 |
| SD | approved | `Approval: SD` · 2026-09-28 · revision 14 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/SD.md` sha256:4127fe0700fa658b · presentation 97e5f912-6f28-4896-96ea-75c47e05df58 sha256:f2ad733727f79c550dc9f43efd5760b4487a33f4b6df4fc46f3138e96a7456aa |
| TP | approved | `Approval: TP` · 2026-09-28 · revision 17 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/TP.md` sha256:b0b9229719183307 · presentation 15f57cb9-01f4-4a25-987f-514bfb783dca sha256:092cc20daa432f82ce007bd98d9cac14b3a99d739ac4b25dc5378f63f87b065c |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_REVIEW.md` | done |  |
| PRD | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/PRD.md` | approved |  |
| Verified Change |  | missing |  |
| SD | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/SD.md` | approved | Derived from approved PRD revision 11 |
| TP | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/TP.md` | approved | Derived from approved PRD revision 11 and SD revision 14 |
| Brownfield Analysis | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_ANALYSIS.md` | done | Approved TP scope T1-T7; decision `pass` |
| CD+Tests | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/CD_TESTS.md` | draft | T1-T5 source/package work complete; T6 host acceptance and T7 formal reviews open |
| CR |  | missing |  |
| QA |  | missing |  |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: the UR changes normative pre-implementation review policy; shared plugin source requires coordinated cross-host acceptance, so the bounded-slice criteria do not pass.
- evidence: .agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_REVIEW.md; plugin/skills/brownfield-analysis/SKILL.md; plugin/meta/contracts/gate-transition.md; plugin/meta/contracts/modes.md; create-agdf/scripts/sync-package-assets.js; create-agdf/package.json

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-27 · revision 2 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md` sha256:981fceeb73238947 · presentation 9b8d8ef0-a910-4cdc-b6ee-a5485eace972 sha256:e4b0a66d0ca0abb894b5c176babca3ff45c0a311fdc9f79e3709bb315a7ac4c5 |
| PRD | derived_from | UR | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/PRD.md` |
| PRD | derived_from | Brownfield Review | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_REVIEW.md` |
| SD | derived_from | PRD | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/SD.md` derives from approved PRD revision 11 |
| TP | derived_from | SD | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/TP.md` derives from approved SD revision 14 |
| Brownfield Analysis | verifies | TP | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_ANALYSIS.md` |
| CD+Tests | implements | TP | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/CD_TESTS.md` (draft; host evidence incomplete) |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| PRD draft | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/PRD.md` | scope, acceptance criteria, non-goals, roles and evidence plan | direct |
| SD draft | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/SD.md` | architecture decisions AD-01 to AD-04 and PRD criteria AC-ARCH-01 to AC-ARCH-07 | direct |
| TP draft | `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/TP.md` | tasks T1 to T7, verification plan and four-host acceptance ownership | direct |
| Superseded PRD approval | `Approval: PRD` · 2026-09-28 · revision 6 · `.agdf/control/artefacts/architecture-review-prevention-2026-09-27/PRD.md` sha256:ea84fcb59ea79509 · presentation 40f63b08-c534-44bd-ac6c-9eab19b014dc sha256:a5085388b3dfe457260366dac6ae7eec2d1fd14d4b16ff819e254a74b19e1724 | Prior PRD revision only; renewed Approval: PRD required | direct |
| Brownfield Analysis pass for approved TP | .agdf/control/artefacts/architecture-review-prevention-2026-09-27/BROWNFIELD_ANALYSIS.md | T1-T7 reuse path, policy owners and regression risks | direct |
| CD+Tests partial: source and package checks pass; four-host acceptance remains open | .agdf/control/artefacts/architecture-review-prevention-2026-09-27/CD_TESTS.md | TP T1-T7 and AC-ARCH-01 through AC-ARCH-07 evidence limits | direct |
| Final source and package checks pass; seven Codex model cases current; direct four-host Brownfield acceptance remains open | .agdf/control/artefacts/architecture-review-prevention-2026-09-27/CD_TESTS.md | TP T1-T5 complete, T6 partial, T7 open; AC-ARCH-06 unverified across all hosts | direct |

## Closeout

- next_allowed_action: Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.
- quality_outlook:
