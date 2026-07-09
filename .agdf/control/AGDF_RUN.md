# AGDF Run State

## Run Meta

- run_id: master-backlog-human-readable
- started_at: 2026-07-09
- mode: structured_delivery
- current_gate: OR
- decision: uat_approved
- owner: agent

## Objective

Make the AGDF Master Backlog compact and human-readable with relative Markdown links while preserving stable CLI output and legacy backlog compatibility.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The canonical template owns the Markdown format; the CLI currently parses fixed table cells and returns raw values. |
| What is approved? | UR, PRD, SD, TP and UAT approved by exact user formulas on 2026-07-09; QA passed. |
| What is missing? | No gate evidence is missing. |
| What is the next allowed action? | Offer the prepared commit; do not execute it automatically. |
| What is explicitly forbidden right now? | Automatic commit, push, PR or release. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | UAT approved |
| Current gate | OR closeout |
| Allowed now | Commit handoff offer |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer the prepared commit |
| Quality outlook | Preserve one canonical backlog model and normalize presentation at explicit boundaries |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-09 |
| PRD | approved | `Approval: PRD` provided in session on 2026-07-09 |
| SD | approved | `Approval: SD` provided in session on 2026-07-09 |
| TP | approved | `Approval: TP` provided in session on 2026-07-09 |
| QA | passed | `.agdf/control/artefacts/master-backlog-human-readable/QA_REPORT.md` |
| UAT | approved | `Approval: UAT` provided in session on 2026-07-09 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/master-backlog-human-readable/UR.md | approved | Human-readable backlog scope |
| Brownfield Review | .agdf/control/artefacts/master-backlog-human-readable/BROWNFIELD_REVIEW.md | done | Structured slice; PRD required |
| PRD | .agdf/control/artefacts/master-backlog-human-readable/PRD.md | approved | Compact table and compatibility contract |
| SD | .agdf/control/artefacts/master-backlog-human-readable/SD.md | approved | Header-driven compatibility design |
| TP | .agdf/control/artefacts/master-backlog-human-readable/TP.md | approved | Implementation and evidence plan |
| Review | .agdf/control/artefacts/master-backlog-human-readable/REVIEWS.md | done | TP, clean and code reviews passed |
| QA | .agdf/control/artefacts/master-backlog-human-readable/QA_REPORT.md | passed | QA pass recorded |
| OR | .agdf/control/artefacts/master-backlog-human-readable/OR.md | done | QA-passed closeout |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: The bounded change affects durable Markdown, CLI parsing, skill behavior and generated surfaces.
- evidence: Canonical template, parser, sync path and regression tests already exist and can be extended.
- transparency_note: PRD depth should stay small and define only table shape, status mapping, link normalization and compatibility.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session and persisted in UR |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/master-backlog-human-readable/BROWNFIELD_REVIEW.md` |
| PRD | derived_from | UR | `.agdf/control/artefacts/master-backlog-human-readable/PRD.md` |
| SD | derived_from | PRD | `.agdf/control/artefacts/master-backlog-human-readable/SD.md` |
| TP | derived_from | SD | `.agdf/control/artefacts/master-backlog-human-readable/TP.md` |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/master-backlog-human-readable/QA_REPORT.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Canonical backlog template | plugin/control/templates/MASTER_BACKLOG.md | Markdown owner | direct |
| CLI backlog parser | create-agdf/bin/create-agdf.js | Fixed-cell parsing and raw value exposure | direct |
| Package asset sync | create-agdf/scripts/sync-package-assets.js | Generated surfaces | direct |
| Runtime integrity checks | plugin/scripts/check-runtime-integrity.mjs | Cross-surface consistency | direct |
| CLI smoke tests | create-agdf/scripts/smoke-test.js | Backlog and JSON regression coverage | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Compact Artefacts cell wraps at narrow widths | warn | Links remain readable and no governed data is hidden |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This is a presentation and parser refinement of existing durable control.

## Source And Scope State

- normative_instruction_source: `plugin/control/templates/MASTER_BACKLOG.md`; `plugin/meta/agdf-runtime-contract.md`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: approved UR and completed Brownfield Review for `master-backlog-human-readable`
- competing_scope_lines: none
- branch_workspace_evidence: control artefacts only; implementation has not started
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Table shape and compatibility decisions belong to this delivery scope.
- memory_refs: .agdf/control/artefacts/master-backlog-human-readable/

## Closeout

- delivered: T1–T7, tests, mandatory reviews, QA pass, OR and UAT approval.
- not_delivered: Commit, push, PR and release.
- verification_performed: runtime integrity, create-agdf smoke/routing, live delivery-map and diff check.
- unverified: downstream consumer readability until first generated adoption.
- next_allowed_action: Offer the prepared commit; do not execute it automatically.
- quality_outlook: Keep human presentation and machine normalization explicit and centrally owned.
