# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-actionable-card-ux-20260928-01
- lifecycle: active
- revision: 19
- revision_id: d7251ca4-23c5-4cbc-81c9-d37df21dbcad
- content_seal: sha256:d24005e63651e8b25fb869cb84c3d8be8a290664f3f905d4c1c494dd871c3340
- approval_seal: sha256:3ce3fb6e0e81978c9656833983410543a03bbaa3d15366c48decd2e7b549f174
- mode: structured_slice
- current_gate: CD+Tests
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | TP revision 13 and pre-implementation Brownfield Analysis are approved/passed; implementation and repository checks pass. Fresh-host evidence is not available for the tested revision. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | AC-006 direct fresh-session evidence from Codex, Claude, Copilot and OpenCode using the tested revision; no user-gate approval is pending. |
| What is the next allowed action? | Choose whether AC-006 stays open under this TP or a separate host-provisioning scope update starts. Host changes are not authorized by this TP. |
| What is explicitly forbidden right now? | claim QA pass; request UAT approval; release; install, update, activate, trust or restart host plugins |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-28 · revision 2 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UR.md` sha256:629b1270faec17d6 · presentation e76c20d3-59f4-4f1e-b48a-9399c40d2425 sha256:94aac7de4c9c506afc15c8c5df374860223437ac35a247111af7fa206ee7c1ce |
| PRD | approved | `Approval: PRD` · 2026-09-28 · revision 8 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/PRD.md` sha256:440fb34e8fbbe6fd · presentation d51f08c0-eaec-44a5-9538-abd5988155e3 sha256:4eabb8d8a7e3ab9b404567cb0b1821414175360aff02ec44f9b4c24fb69f261c |
| SD | approved | `Approval: SD` · 2026-09-28 · revision 10 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/SD.md` sha256:e81c94b92810aa2c · presentation 130ac2ee-8bae-4119-a2dc-dc2d93a9d442 sha256:380af0cbcd1cd7303711d7f551d08978460059e4b0fcd51a7924fac44bdfb8a9 |
| TP | approved | `Approval: TP` · 2026-09-28 · revision 13 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/TP.md` sha256:39262167de3cbd51 · presentation 43799fda-14f6-42cc-a697-8ebc2564368f sha256:d8c04e880c0b9d1e4161251ecfbdfdf5758abeebfdf225136f942649c011af61 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/PRD.md` | approved | criteria-chain-v1 |
| SD | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/SD.md` | approved | criteria-chain-v1; maps AC-001–AC-008 exactly once |
| TP | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/TP.md` | approved | criteria-chain-v1; maps AC-001–AC-008 and SDD-001–SDD-004 through six tasks and twelve verification scenarios |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_ANALYSIS.md` | done | `pre_implementation_analysis` pass against approved TP revision 13; canonical owners and reuse path confirmed; direct host evidence remains open per AC-006 |
| CD+Tests | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/CD_TESTS.md` | ready | Repository implementation and regression checks passed; AC-006 fresh-host sessions remain unverified and block gate completion |
| CR |  | missing |  |
| QA |  | missing |  |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: one cohesive change to existing target, setup and status cards; same canonical renderer and state authority; no schema, persistence, migration, adapter or coordinated-release change. User selected host-neutral actor label Ich arbeite weiter for four hosts.
- evidence: Approved UR plus ready UX_INTENT_DEFINITION.md; interaction.md and task-target-resolution.md identify the canonical owners; gate-check.js and operational-localization-test.js evidence the fallback defect; all seven bounded-slice checks are documented in BROWNFIELD_REVIEW.md.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-28 · revision 2 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UR.md` sha256:629b1270faec17d6 · presentation e76c20d3-59f4-4f1e-b48a-9399c40d2425 sha256:94aac7de4c9c506afc15c8c5df374860223437ac35a247111af7fa206ee7c1ce |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/PRD.md` · criteria-chain-v1 |
| SD | derived_from | PRD | approved PRD revision 8 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/PRD.md` sha256:440fb34e8fbbe6fdc5a74ed83971bba4f5f0ec23b99e5051c9b438d2e165fa67 · `Approval: PRD` revision 8 · presentation d51f08c0-eaec-44a5-9538-abd5988155e3 |
| TP | derived_from | SD | Approved SD revision 10 · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/SD.md` sha256:e81c94b92810aa2c945d4ccec1ee9015dd7560c1f297e1d16d5dce1b92dedd04 · `Approval: SD` revision 10 · presentation 130ac2ee-8bae-4119-a2dc-dc2d93a9d442 · TP draft `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/TP.md` sha256:39262167de3cbd516be8c0cb215bf560ba2ab6496dc1518b6c712936c887074f |
| Brownfield Analysis | verifies | TP revision 13 | Pass · `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_ANALYSIS.md` sha256:b34053a2e5e1f398870422fce871f847a688e797eb3892b3de05a1adeb542ac6 · six approved tasks and existing renderer/state/test owners confirmed |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| UX Intent Definition | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/UX_INTENT_DEFINITION.md` | actor, action, recovery and visible-state intent; ready | direct |
| PRD draft | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/PRD.md` | product scope, eight stable acceptance criteria including blocker cause/details/recovery, waiting-vs-blocked distinction, approval-summary language/completeness, and resolved approval decisions | direct |
| Blocker-card gap | `gate-check` status presentation at PRD revision 5 | `AGDF_PRD_DECISIONS_OPEN` shown without the concrete unresolved items; captured as AC-007 | direct |
| Approval-card language and completeness gap | German `run-present` for PRD revision 6, presentation `b08fadd5-ca24-480a-a1be-1a88431ecbc7`; `create-agdf/lib/control-state/run-presentation-render.js`; `create-agdf/scripts/control-state-test.js` | `presentation_language` was `de`, but the summary retained English PRD excerpts and showed only one acceptance item; the test asserts preservation. Captured as AC-005 and AC-008. | direct |
| SD draft | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/SD.md` | Four binding design decisions; ownership/data-flow design; all eight PRD criteria mapped exactly once; localized-summary and compatibility strategy | direct |
| TP draft | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/TP.md` | Six ordered implementation/verification tasks; all eight criteria and four design decisions mapped to twelve stable scenarios with expected results and evidence sources; verification remains planned, not executed | direct |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/BROWNFIELD_ANALYSIS.md` | `pass`; confirms canonical renderer/state owners, reuse, regression impact and minimal implementation sequence for approved TP revision 13; AC-006 host output remains unverified | direct |
| TP approval-summary truncation | German `run-present` for TP revision 13; presentation `43799fda-14f6-42cc-a697-8ebc2564368f`; `create-agdf/lib/control-state/run-presentation-render.js` | Current TP card clips the task summary with an ellipsis; captured as a regression case for the approved complete-summary outcome | direct |
| CD+Tests | `.agdf/control/artefacts/agdf-actionable-card-ux-20260928-01/CD_TESTS.md` | targeted card, state, locale, package and runtime-integrity checks pass; installed host revisions are stale or unavailable, so AC-006 remains open and no gate advance is claimed | direct |

## Closeout

- next_allowed_action: Choose whether AC-006 stays open under this TP or a separate host-provisioning scope update starts. Host changes are not authorized by this TP.
- quality_outlook: Implement only approved TP tasks, run their planned checks and keep each host's fresh-session evidence separate; do not claim QA or release readiness.
