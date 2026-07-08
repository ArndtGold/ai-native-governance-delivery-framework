# AGDF Run State

## Run Meta

- run_id: run-status-card-quality-outlook
- started_at: 2026-07-08
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make AGDF run state easier to operate by exposing a compact Run Status Card and treating `quality_outlook` as the next meaningful quality-improvement signal beside the next permissible process step.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | AGDF now exposes a compact Run Status Card in gate-check and delivery-map JSON, and Runtime Contract/templates/docs describe `next_step` versus `quality_outlook`. |
| What is approved? | UR approved by exact user formula `Approval: UR` on 2026-07-08. |
| What is missing? | Commit handoff execution. |
| What is the next allowed action? | Commit the approved delivery slice as requested by the user. |
| What is explicitly forbidden right now? | Changing gate order, weakening approval rules, claiming QA/UAT/release readiness, or expanding beyond status-card/quality-outlook semantics. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

- status: pass
- allowed_now: commit the approved delivery slice as explicitly requested
- forbidden_now: push, PR, or release without explicit user instruction
- blocking_condition: none
- next_skill: agdf-delivery-closeout
- next_step: Commit the approved delivery slice as requested.
- quality_outlook: Keep the status card as an ergonomic projection, not a parallel source of gate truth.

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-08 |
| PRD | not_applicable | Brownfield Review selected `structured_slice` with no separate PRD required for this narrow runtime ergonomics change |
| SD | not_applicable | Existing CLI/runtime/template ownership is clear and no architecture redesign is needed |
| TP | not_applicable | Slice is implemented as a narrow governed change with smoke/runtime integrity checks |
| QA | approved | QA pass recorded for this slice after TP, clean implementation and code review evidence |
| UAT | approved | `Approval: UAT` provided in session on 2026-07-08 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/run-status-card-quality-outlook/UR.md | approved | Approved operational requirement |
| PRD |  | not_applicable | Structured slice does not need separate PRD depth |
| SD |  | not_applicable | No architecture redesign |
| TP |  | not_applicable | Narrow slice; evidence tracked in this run |
| Brownfield Review | .agdf/control/artefacts/run-status-card-quality-outlook/BROWNFIELD_REVIEW.md | done | Mode/Slice Decision recorded |
| Review | .agdf/control/artefacts/run-status-card-quality-outlook/REVIEWS.md | done | TP, clean implementation and code review passed |
| QA | .agdf/control/artefacts/run-status-card-quality-outlook/QA_REPORT.md | pass | QA pass for approved structured slice |
| OR | .agdf/control/artefacts/run-status-card-quality-outlook/OR.md | done | Closeout report recorded |

## Mode / Slice Decision

Set this after Brownfield Review. Do not assume the full gate chain before the existing-system impact is understood.
Quick Task execution or implementation is not allowed until this decision is visible with scope reason and evidence.

- decision: structured_slice
- required_next_gate: none
- scope_reason: The change affects AGDF runtime/CLI output semantics and templates, but is narrow, backwards-compatible, and constrained to status-card/quality-outlook visibility.
- evidence: Existing `delivery-map --json`, `gate-check --json`, `AGDF_RUN.md` and `OR.md` already expose next allowed action, findings, evidence, and quality outlook fields; the missing piece is a compact official status-card interface.
- transparency_note: PRD/SD/TP are intentionally skipped for this slice because the approved UR is narrow and Brownfield evidence identifies existing owners and validation paths.

## Artefact Chain

Keep the active work item traceable. A gate may open only when the previous gate has both exact approval and a durable or linked artefact.

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session and persisted in UR artefact |
| PRD | derived_from | UR | not_applicable: structured_slice explicitly skips PRD depth |
| SD | derived_from | PRD | not_applicable: no separate SD |
| TP | derived_from | SD | not_applicable: no separate TP |
| QA_REPORT | tests | TP | QA report links runtime integrity, smoke test and status-card JSON probe evidence |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Existing CLI gate/delivery outputs | create-agdf/bin/create-agdf.js | Current status and delivery-map ownership | direct |
| Existing runtime contract | plugin/meta/agdf-runtime-contract.md | Gate, delivery-map and quality-output semantics | direct |
| Existing control templates | plugin/control/templates/AGDF_RUN.md and plugin/control/templates/artefacts/OR.md | Current next action and quality outlook fields | direct |
| Runtime integrity validation | `node plugin/scripts/check-runtime-integrity.mjs` | Runtime contract, skills and control template consistency | direct |
| Smoke validation | `npm --prefix create-agdf run smoke-test -- --quiet` | CLI sync, smoke tests and routing render | direct |
| Gate and delivery-map probe | `node create-agdf/bin/create-agdf.js gate-check --json`; `node create-agdf/bin/create-agdf.js delivery-map --json` | Status card and quality outlook visible in JSON outputs | direct |
| TP Review | .agdf/control/artefacts/run-status-card-quality-outlook/REVIEWS.md | Approved slice coverage | direct |
| Clean Implementation Review | .agdf/control/artefacts/run-status-card-quality-outlook/REVIEWS.md | No fallback or parallel rule model retained | direct |
| Code Review | .agdf/control/artefacts/run-status-card-quality-outlook/REVIEWS.md | Diff-level review of CLI/runtime/template changes | direct |
| QA Report | .agdf/control/artefacts/run-status-card-quality-outlook/QA_REPORT.md | Final QA decision | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Status Card could duplicate gate-check or delivery-map semantics | warn | Keep it as a compact projection derived from existing state, not a second rule model |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: plugin/meta/agdf-runtime-contract.md; create-agdf/bin/create-agdf.js; plugin/control/templates/AGDF_RUN.md
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This run formalizes an operating interface for existing AGDF control state.

## Closeout

- delivered: Runtime Contract defines Run Status Card; CLI emits `status_card` and `quality_outlook`; AGDF_RUN/OR templates include Run Status Card; docs describe `next_step` vs `quality_outlook`; smoke/runtime checks pass; review and QA artefacts recorded.
- not_delivered: UAT approval, commit, push, PR and release.
- verification_performed: `node plugin/scripts/check-runtime-integrity.mjs`; `npm --prefix create-agdf run smoke-test -- --quiet`; local gate-check/delivery-map JSON probe.
- unverified: push, PR and release.
- next_allowed_action: Commit the approved delivery slice as requested by the user.
- quality_outlook: Keep the status card as an ergonomic projection, not a parallel source of gate truth.
