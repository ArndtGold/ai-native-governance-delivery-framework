# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: native-gate-buttons-live
- lifecycle: completed
- revision: 49
- revision_id: DDDC4F09-218B-4D90-B12C-E4D738225F84
- mode: structured_delivery
- current_gate: OR
- decision: decline
- owner: agent

## Objective

Deliver and live-verify native Codex and Claude Code gate-approval buttons without creating a custom UI or weakening AGDF approval authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Fresh qa-gate decision is pass: NGB-01 through NGB-17 are fully done, all mandatory reviews pass and full tests remain green after the CR fix. |
| What is approved? | UR, PRD, SD, revised TP and the fresh passing QA report are approved. |
| What is missing? | No closeout artefact; UAT was deliberately declined and no acceptance is claimed. |
| What is the next allowed action? | Close the declined scope as superseded by `agdf-human-decision-surface`; no further delivery step. |
| What is explicitly forbidden right now? | Treating the declined UAT as approval, release readiness or permission for VCS actions. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-14 after UR persistence. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-07-14 after the PRD was persisted. |
| SD | approved | Deliberate native `Approval: SD` selected on 2026-07-14 after the revised SD was persisted and revalidated. |
| TP | approved | Deliberate native `Approval: TP` selected on 2026-07-14 after the revised TP was persisted and revalidated. |
| QA | approved | Deliberate native `Approval: QA` selected on 2026-07-14 after the fresh passing report was persisted and revalidated. |
| UAT | decline | Deliberate native choice `Ablehnen` on 2026-07-14; no UAT approval persisted. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/native-gate-buttons-live/UR.md | approved | Exact approval recorded after artefact persistence. |
| Brownfield Review | .agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md | done | Reconciled for the explicitly selected run; PRD is approved and SD is the next gate. |
| PRD | .agdf/control/artefacts/native-gate-buttons-live/PRD.md | approved | Exact `Approval: PRD` provided on 2026-07-14. |
| SD | .agdf/control/artefacts/native-gate-buttons-live/SD.md | approved | Defines the three-part product-style transition card and forbids dashboard-style approval presentation; exact approval recorded after revalidation. |
| TP | .agdf/control/artefacts/native-gate-buttons-live/TP.md | approved | NGB-13 through NGB-18 cover the product-style card, compatibility boundary, deterministic i18n, negative tests and refreshed reviews; exact approval recorded after revalidation. |
| Brownfield Analysis | .agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_ANALYSIS.md | done | Fresh analysis passes for NGB-13 through NGB-17; existing owners, compatibility boundary and minimal clean path are confirmed. |
| CD+Tests | .agdf/control/artefacts/native-gate-buttons-live/CD_TESTS.md | done | NGB-13 through NGB-17 implemented; runtime integrity, negative fixtures, control-state and aggregate smoke pass. |
| TP Review | .agdf/control/artefacts/native-gate-buttons-live/TP_REVIEW.md | done | Per-task review covers NGB-01 through NGB-18; only expected downstream review/QA/UAT work remains partial. |
| Clean Implementation Review | .agdf/control/artefacts/native-gate-buttons-live/CLEAN_IMPLEMENTATION_REVIEW.md | pass | Canonical owners are extended cleanly; no workaround, shim, retry loop, custom renderer or parallel authority exists. |
| CR | .agdf/control/artefacts/native-gate-buttons-live/CODE_REVIEW.md | done | Mandatory diff review passes after resolving one maintainability finding; no actionable finding remains. |
| QA | .agdf/control/artefacts/native-gate-buttons-live/QA_REPORT.md | pass | Fresh qa-gate pass covers NGB-01 through NGB-17, all mandatory reviews and post-fix full tests; exact QA approval recorded after revalidation. |
| UAT | .agdf/control/artefacts/native-gate-buttons-live/UAT_REPORT.md | declined | User deliberately declined acceptance; TP workflow remains incomplete and delivery actions remain forbidden. |
| OR | .agdf/control/artefacts/native-gate-buttons-live/OR.md | revise | Declined UAT is preserved; the scope is superseded by `agdf-human-decision-surface`. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fresh Codex session after enabling the feature flag rendered the native `request_user_input` choices in Default mode. | Current Codex task conversation, 2026-07-14 | Live host capability and visible control | direct |
| Native probe returned `answers: {}`; no deliberate answer or AGDF approval was accepted. | Native `request_user_input` probe, 2026-07-14 | Deliberate-input boundary | direct |
| Codex manual documents Plan mode questions and plugin skills/hooks, not a plugin-callable normal-chat button API. | Fresh Codex manual, 2026-07-14 | Public host capability boundary | direct |
| `default_mode_request_user_input = true` is configured locally on Codex CLI 0.142.4. | `~/.codex/config.toml`; local CLI version check, 2026-07-14 | Host capability enablement | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-14 after artefact persistence. |
| Brownfield Review | sizes | structured_delivery | Fresh-session native probe resolves the prior host-capability block; see `BROWNFIELD_REVIEW.md`. |
| PRD | derived_from | UR | `.agdf/control/artefacts/native-gate-buttons-live/PRD.md` derives from `.agdf/control/artefacts/native-gate-buttons-live/UR.md`; exact `Approval: PRD` recorded on 2026-07-14. |
| SD | derived_from | PRD | `.agdf/control/artefacts/native-gate-buttons-live/SD.md` derives from the approved PRD; deliberate native `Approval: SD` was persisted after same-run/same-gate revalidation. |
| TP | derived_from | SD | `.agdf/control/artefacts/native-gate-buttons-live/TP.md` derives from the approved SD; deliberate native `Approval: TP` was persisted after same-run/same-gate revalidation. |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/native-gate-buttons-live/QA_REPORT.md` records QA `pass` against the approved TP and review evidence; exact `Approval: QA` is recorded. |
| UAT_REPORT | derived_from | QA_REPORT | `.agdf/control/artefacts/native-gate-buttons-live/UAT_REPORT.md` presents the user-facing acceptance checklist for native-first and locale behavior. |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: CD+Tests
- scope_reason: The fresh-session probe establishes the requested Codex host capability; the existing contract and adapter can be extended without a custom UI or second approval store.
- evidence: `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md`; native `request_user_input` probe; CLI 0.142.4 feature-flag verification.
- transparency_note: The probe was capability evidence only. Its empty answer set did not approve any gate; the approved TP and passed pre-implementation Brownfield Analysis now authorize only the bounded CD+Tests implementation step.

## Closeout

- next_allowed_action: No further delivery step. Continue any revised human-decision UX only through `agdf-human-decision-surface`.
- quality_outlook: Preserve the declined UAT as durable evidence and keep exact-text fallback authority intact in the successor run.
