# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-human-decision-surface
- lifecycle: active
- revision: 1
- revision_id: 292014c0-2481-4fba-8f8a-04c23b80461f
- mode: structured_slice
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Translate AGDF's canonical control state into clear user decisions across primary status,
clarification, blocked and approval interactions without changing gate authority or machine output.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The existing approval-time Gate Transition Card is implemented and tested in `native-gate-buttons-live`; this new slice extends the boundary to primary status and blocked/clarification interactions. |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP` and revalidated exact `Approval: QA`. |
| What is missing? | Fresh candidate runtime evidence and deliberate `Approval: UAT`. |
| What is the next allowed action? | Install or reload the candidate plugin and execute the live UAT checklist. |
| What is explicitly forbidden right now? | UAT pass, release, commit, push and PR claims before live acceptance and exact UAT approval. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/agdf-human-decision-surface/UR.md`; `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`
- competing_scope_lines: `native-gate-buttons-live` is a related prior slice with declined UAT; it is not silently reopened or replaced.

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UAT |
| Allowed now | Prepare and execute live candidate acceptance checks |
| Blocked by | Fresh runtime evidence and user acceptance |
| Missing approval | `Approval: UAT` |
| Next step | Reload the candidate runtime and complete the UAT checklist |
| Quality outlook | Confirm native rendering, fallback parity, links and accessibility in the actual host |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Existing approval-time Decision Cards are already owned by the Runtime Contract and gate-check skill. This bounded slice extends the same presentation contract to primary status, clarification and blocked interactions across runtime guidance, CLI human output and generated surfaces.
- evidence: `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/native-gate-buttons-live/SD.md`; `.agdf/control/artefacts/native-gate-buttons-live/TP.md`; `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`.
- transparency_note: Quick Task is not appropriate because normative UX semantics and multiple generated surfaces are affected. Full structured delivery is not required before the PRD defines the exact presentation boundary.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-14 after UR persistence. |
| Brownfield Review | sizes | `structured_slice` | Existing Decision Card owner and related declined-UAT scope reviewed in `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`. |
| PRD | derived_from | UR | Approved PRD derives from the clarified UR and refreshed Brownfield Review. |
| PRD | approved_by | `Approval: PRD` | Deliberate native selection provided on 2026-07-14 after same-run/same-gate revalidation. |
| SD | derived_from | PRD | Approved SD derives from the approved human-decision-surface PRD. |
| SD | approved_by | `Approval: SD` | Deliberate native selection provided on 2026-07-14 after same-run/same-gate revalidation. |
| TP | derived_from | SD | Approved TP derives from the approved canonical presentation-contract SD. |
| TP | approved_by | `Approval: TP` | Deliberate native selection provided on 2026-07-14 after same-run/same-gate revalidation. |
| Brownfield Analysis | verifies | TP | Existing owners, reuse paths, compatibility boundary and regression coverage passed in `BROWNFIELD_ANALYSIS.md`. |
| CD+Tests | implements | TP | HDS-01 through HDS-14 implemented and verified in `CD_TESTS.md`; HDS-15 is the active review chain. |
| TP Review | verifies | TP | HDS-01 through HDS-15 are fully covered in `TP_REVIEW.md`. |
| Clean Implementation Review | verifies | CD+Tests | Primary solution reuses existing owners without a second SoT or gate evaluator. |
| CR | reviews | CD+Tests | Mandatory diff review passed after authority-copy, exact-approval, path-safety and locale-budget corrections. |
| QA_REPORT | tests | TP | QA pass is evidenced in `QA_REPORT.md`; exact QA approval was revalidated and recorded on 2026-07-15. |
| QA | approved_by | `Approval: QA` | Exact approval provided on 2026-07-15 after same-run/same-gate and report revalidation. |
| UAT Report | validates | QA | Live candidate checklist is prepared; fresh runtime evidence and user acceptance remain pending. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Existing product-style approval card is already implemented and tested. | `.agdf/control/artefacts/native-gate-buttons-live/SD.md`; `TP.md`; `UAT_REPORT.md` | Reuse boundary and prior UAT outcome | direct |
| Canonical runtime and skill prohibit raw internal keys in the approval-time primary surface. | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | Existing presentation contract | direct |
| CLI and generated-surface owners are identified. | `create-agdf/bin/create-agdf.js`; `plugin/scripts/check-runtime-integrity.mjs` | Implementation ownership and propagation | direct |
| Pre-implementation owner and reuse analysis passed. | `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_ANALYSIS.md` | CD+Tests readiness | direct |
| Full implementation and test bundle passed. | `.agdf/control/artefacts/agdf-human-decision-surface/CD_TESTS.md` | HDS-01 through HDS-14 | direct |
| Mandatory review chain passed. | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | HDS-15 and QA readiness | direct |
| QA gate passed from complete review and test evidence. | `.agdf/control/artefacts/agdf-human-decision-surface/QA_REPORT.md` | QA decision | direct |

## Next Allowed Action

- next_allowed_action: Install or reload the candidate plugin, execute `UAT_REPORT.md`, and request exact `Approval: UAT` only after live acceptance.
- forbidden_until_then: UAT pass, release, commit, push and PR claims before fresh live evidence and exact UAT approval.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Clarified exact `Approval: UR` provided on 2026-07-14. |
| PRD | approved | Deliberate native `Approval: PRD` selected on 2026-07-14 after same-run/same-gate revalidation. |
| SD | approved | Deliberate native `Approval: SD` selected on 2026-07-14 after same-run/same-gate revalidation. |
| TP | approved | Deliberate native `Approval: TP` selected on 2026-07-14 after same-run/same-gate revalidation. |
| QA | approved | Exact `Approval: QA` provided on 2026-07-15 and revalidated against the passing report. |
| UAT | pending | Fresh candidate runtime evidence and exact approval are missing. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-human-decision-surface/UR.md` | approved | Native-First, extensible localization and interaction invariants included. |
| Brownfield Review | `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md` | done | Existing Gate Transition Card owner reused; structured slice selected. |
| PRD | `.agdf/control/artefacts/agdf-human-decision-surface/PRD.md` | approved | Exact native approval recorded after revalidation. |
| SD | `.agdf/control/artefacts/agdf-human-decision-surface/SD.md` | approved | Exact native approval recorded after revalidation. |
| TP | `.agdf/control/artefacts/agdf-human-decision-surface/TP.md` | approved | Exact native approval recorded after revalidation. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_ANALYSIS.md` | done | Existing owner, reuse, compatibility and test paths verified; decision `pass`. |
| CD+Tests | `.agdf/control/artefacts/agdf-human-decision-surface/CD_TESTS.md` | done | HDS-01 through HDS-14 implemented; full package and integrity verification passed. |
| CR | `.agdf/control/artefacts/agdf-human-decision-surface/CODE_REVIEW.md` | done | Mandatory Code Review passed after review corrections. |
| QA | `.agdf/control/artefacts/agdf-human-decision-surface/QA_REPORT.md` | pass | QA gate decision passed and exact approval is recorded. |
| UAT Report | `.agdf/control/artefacts/agdf-human-decision-surface/UAT_REPORT.md` | pending | Live candidate checklist prepared; fresh runtime acceptance missing. |
