# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-human-decision-surface
- lifecycle: active
- revision: 14
- revision_id: 1475E839-A331-46C5-95FF-D8527AF3FB4F
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
| What is known? | Live feedback exposed three distinct gaps: generic visual-title dominance, native invocation without presentation evidence, and collapse of the mandatory Run Status Card plus Gate Transition Card sequence into one block. |
| What is approved? | UR revision 2, PRD revision 4, SD revision 3, TP revision 3 and QA Report revision 2 are exactly approved. |
| What is missing? | Fresh candidate-runtime evidence that the running agent emits Run Status Card, Gate Transition Card and then control/fallback in order; current UAT decision is `revise`. |
| What is the next allowed action? | Reload or reinstall the candidate runtime in a fresh session and repeat the end-to-end UAT sequence check. |
| What is explicitly forbidden right now? | `Approval: UAT`, UAT pass, release, commit, push and PR claims before the failed end-to-end sequence is corrected and retested. |

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
| Allowed now | Reload the candidate runtime and repeat the live end-to-end sequence check |
| Blocked by | Current UAT `revise`: native QA attempt skipped both required cards before the control |
| Missing approval | none while UAT evidence is failing |
| Next step | Fresh-session candidate UAT for `Run Status Card -> Gate Transition Card -> control/fallback` |
| Quality outlook | Enforce one immutable visible sequence: Run Status Card, Gate Transition Card, then control/fallback |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Existing approval-time Decision Cards are already owned by the Runtime Contract and gate-check skill. This bounded slice extends the same presentation contract to primary status, clarification and blocked interactions across runtime guidance, CLI human output and generated surfaces.
- evidence: `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/native-gate-buttons-live/SD.md`; `.agdf/control/artefacts/native-gate-buttons-live/TP.md`; `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`.
- transparency_note: Quick Task is not appropriate because normative UX semantics and multiple generated surfaces are affected. Full structured delivery is not required before the PRD defines the exact presentation boundary.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-15 for revision 2 after same-run, same-gate and revision revalidation. |
| Brownfield Review | sizes | `structured_slice` | Revision 2 confirms the existing Runtime Contract and gate-check skill own the immutable two-card-then-control sequence. |
| PRD | derived_from | UR | Revision 4 derives from approved UR revision 2, refreshed Brownfield Review and live UAT ordering evidence. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-07-15 for revision 4 after same-run, same-gate and revision revalidation. |
| SD | derived_from | PRD | Revision 3 derives from approved PRD revision 4 and designs an ordered two-card envelope before control or fallback. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-15 for revision 3 after same-run, same-gate and revision revalidation. |
| TP | derived_from | SD | Revision 3 derives from approved SD revision 3 and covers ordered two-card events, sequence preflight, native evidence and canonical values as HDS-16 through HDS-23. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-15 for revision 3 after same-run, same-gate and revision revalidation. |
| Brownfield Analysis | verifies | TP | Revision 2 passed: existing snapshot, locale, adapter metadata and integrity owners cover the approved implementation path. |
| CD+Tests | implements | TP | HDS-01 through HDS-14 implemented and verified in `CD_TESTS.md`; HDS-15 is the active review chain. |
| TP Review | verifies | TP | HDS-01 through HDS-15 are fully covered in `TP_REVIEW.md`. |
| Clean Implementation Review | verifies | CD+Tests | Primary solution reuses existing owners without a second SoT or gate evaluator. |
| CR | reviews | CD+Tests | Mandatory diff review passed after authority-copy, exact-approval, path-safety and locale-budget corrections. |
| QA_REPORT | tests | TP | Revision 2 passes from complete HDS-16 through HDS-23 evidence; exact QA approval is pending. |
| QA | approved_by | `Approval: QA` | Exact approval provided on 2026-07-15 for QA Report revision 2 after same-run, same-gate and report revalidation. |
| UAT Report | revises | PRD | Live feedback requires a mechanically enforced primary-heading hierarchy before refreshed downstream delivery. |

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
| User observed generic `AGDF-Status` as the visual primary title while the understandable gate title was ordinary text. | Current Codex task on 2026-07-15; revised `UAT_REPORT.md` | PRD visual hierarchy gap | direct |
| Native attempts returned structured answers while the user reported no visible button or deliberate choice. | Current Codex task on 2026-07-15; revised `UAT_REPORT.md` | Host-presentation evidence gap and `attempted_not_applied` behavior | direct |

## Next Allowed Action

- next_allowed_action: Reload or reinstall the candidate runtime in a fresh session and repeat the end-to-end UAT sequence check.
- forbidden_until_then: `Approval: UAT`, UAT pass, release, commit, push and PR claims before corrected fresh-session evidence.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided for revision 2 on 2026-07-15 after revalidation. |
| PRD | approved | Exact `Approval: PRD` provided for revision 4 on 2026-07-15 after revalidation. |
| SD | approved | Exact `Approval: SD` provided for revision 3 on 2026-07-15 after revalidation. |
| TP | approved | Exact `Approval: TP` provided for revision 3 on 2026-07-15 after revalidation. |
| QA | approved | Exact `Approval: QA` provided for QA Report revision 2 on 2026-07-15 after revalidation. |
| UAT | revise | Live visual-hierarchy finding reopened the chain at PRD. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-human-decision-surface/UR.md` | approved | Revision 2 makes the two-card-then-control sequence immutable and testable. |
| Brownfield Review | `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md` | done | Revision 2 reuses the existing Runtime Contract, gate-check and adapter owners; structured slice retained. |
| PRD | `.agdf/control/artefacts/agdf-human-decision-surface/PRD.md` | approved | Revision 4 mirrors the immutable order and adds mechanical sequence negatives. |
| SD | `.agdf/control/artefacts/agdf-human-decision-surface/SD.md` | approved | Revision 3 defines ordered card events, sequence preflight and no combined-card compatibility path. |
| TP | `.agdf/control/artefacts/agdf-human-decision-surface/TP.md` | approved | Revision 3 maps the approved order, evidence and canonical-value design to HDS-16 through HDS-23. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_ANALYSIS.md` | done | Revision 2 confirms the existing owner, reuse, compatibility and test paths; decision `pass`. |
| CD+Tests | `.agdf/control/artefacts/agdf-human-decision-surface/CD_TESTS.md` | done | Revision 2 implements HDS-16 through HDS-22; full package and integrity verification passed. |
| CR | `.agdf/control/artefacts/agdf-human-decision-surface/CODE_REVIEW.md` | done | Revision 2 mandatory review chain passed after title-owner and metadata-path corrections. |
| QA | `.agdf/control/artefacts/agdf-human-decision-surface/QA_REPORT.md` | pass | Revision 2 passes and exact QA approval is recorded. |
| UAT Report | `.agdf/control/artefacts/agdf-human-decision-surface/UAT_REPORT.md` | revise | Live visual hierarchy finding reopened the PRD. |
