# Task and Test Plan: Complete Approval Orientation

Status: approved
Gate: TP
Based on: `.agdf/control/artefacts/approval-orientation-completeness/SD.md`
Date: 2026-07-15
Owner: AGDF
Gate approval: `Approval: TP` selected deliberately through the native approval control on 2026-07-15 after same-run/same-gate revalidation.

## 1. Delivery Boundary

Implement the approved one-snapshot approval orientation using existing gate,
status, transition, locale and generated-surface owners. No task may introduce
a second evaluator, persistence model, host renderer or approval authority.

## 2. Tasks

| task_id | implementation | source paths | acceptance criteria | verification |
|---|---|---|---|---|
| AOC-01 | Add pure immutable approval-orientation snapshot composition with fixed sequence and `authorizes: false`. | `create-agdf/lib/interaction-presentation.js` | Ready input returns exactly `run_status_card`, `gate_transition_card`, `approval_interaction`; identity and six compact status fields are present; inputs are not mutated. | Focused unit assertions for shape, order, identity, immutability and authority-negative behavior. |
| AOC-02 | Derive the snapshot from the existing evaluated status card, human presentation, revision identity and post-approval transition without changing JSON compatibility. | `create-agdf/bin/create-agdf.js` | One selected ready run produces one non-enumerable human approval snapshot; existing JSON output remains deep-equal to the pre-change public shape except unrelated already-approved fields. | CLI/control-state fixture compares JSON keys and inspects internal presentation composition. |
| AOC-03 | Replace the normative one-card approval rule with the fixed two-card sequence and explicit responsibility boundaries. | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | Runtime and skill require compact Status Card → Transition Card → one question for all six user gates; cards render once for native and fallback; no diagnostic dashboard leakage. | Runtime-integrity positive checks and negative mutation fixtures for omission, reversal and one-card-only wording. |
| AOC-04 | Reuse or minimally extend canonical locale data for compact status and transition copy. | `plugin/meta/agdf-interaction-locales.json`; `create-agdf/lib/interaction-presentation.js` | English/German use one complete locale pack; language subtags and incomplete-pack behavior remain deterministic; no hard-coded localized template appears in helper/skill. | Locale registry, `de-AT`, unsupported/incomplete pack and length-budget tests. |
| AOC-05 | Cover every ready user gate and non-approval outcomes. | `create-agdf/scripts/interaction-presentation-test.js` | UR, PRD, SD, TP, QA and UAT snapshots preserve exact approval; revise, decline, cancel/no-response and native-attempt outcomes cannot authorize or repeat cards. | Focused table-driven tests for gates, outcomes and native/fallback parity. |
| AOC-06 | Fail closed for non-ready and stale state. | `create-agdf/scripts/control-state-test.js`; existing run-state fixtures | Ambiguous run, blocked state, missing artefact, mismatched approval/gate and stale revision expose no ready approval snapshot or native question; persistence remains unchanged. | Hermetic CLI fixtures and stale post-response assertions. |
| AOC-07 | Synchronize generated surfaces and protect canonical ownership. | `create-agdf/scripts/sync-package-assets.js`; `plugin/scripts/check-runtime-integrity.mjs`; generated plugin copies | All generated Runtime Contract and `gate-check` copies match canonical sources; no second card renderer/store/evaluator appears. | Asset sync, Runtime Integrity and negative-fixture suite. |
| AOC-08 | Run the complete regression and record evidence boundaries for review and QA. | package tests; Pages; `.agdf/control/artefacts/approval-orientation-completeness/CD_TESTS.md` | Focused and aggregate checks pass; live-host rendering is named as supporting UAT evidence only; no historical UAT is rewritten. | Interaction, control-state, routing, smoke, Pages check/build, doctor and `git diff --check`. |

## 3. Required Test Matrix

| Dimension | Cases |
|---|---|
| User gates | UR, PRD, SD, TP, QA, UAT |
| Locale | `en`, `de`, `de-AT`, unsupported locale, incomplete pack |
| Readiness | ready, blocked, ambiguous run, missing artefact, mismatched gate/approval, stale revision |
| Interaction | native presented, native unavailable, attempted-not-applied, exact-text fallback |
| Outcome | approve, revise, decline, cancel, no response, timeout, empty, invalid, stale |
| Compatibility | JSON public keys unchanged, generated copies aligned, existing status/detail output retained |

## 4. Review Requirements

After CD+Tests and before QA:

- Task Plan Review checks AOC-01 through AOC-08 individually.
- Clean Implementation Review verifies one helper/one owner and rejects parallel
  presentation state, copied locales, retry loops and host-specific gate policy.
- Code Review checks correctness, stale-state safety, compatibility,
  maintainability and regression coverage.
- QA Gate remains the sole final `pass | revise | block` decision owner.

## 5. Evidence Boundary

Repository tests prove deterministic composition, ordering, authority,
localization, fail-closed behavior and compatibility. They do not prove how
every host visually lays out the two cards or native controls. Any such claim
requires explicit live UAT evidence.

## 6. Approval

Exact `Approval: TP` was selected deliberately through the native approval
control on 2026-07-15 after same-run/same-gate revalidation. Pre-implementation
Brownfield Analysis is authorized; implementation starts only if it passes.
