# AGDF Run State

## Run Meta

- run_id: opencode-compact-gate-output
- started_at: 2026-07-09
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Reduce noisy AGDF CLI output in interactive OpenCode use by adding compact gate/status reporting and clearer OpenCode guidance while preserving full JSON evidence output.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `gate-check --json` emits a full report and already contains a compact `status_card`. OpenCode displays shell output prominently. |
| What is approved? | UR approved by exact user formula on 2026-07-09; Brownfield Review selected quick_task. |
| What is missing? | No implementation or validation evidence is missing for the approved quick task. |
| What is the next allowed action? | Offer commit handoff; do not execute it automatically. |
| What is explicitly forbidden right now? | Release, publish, commit, push or PR without explicit user request. |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Completed |
| Current gate | OR closeout |
| Allowed now | Commit handoff offer |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit handoff |
| Quality outlook | Keep compact output as a projection, not a second source of truth |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-09 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/opencode-compact-gate-output/UR.md | approved | OpenCode compact output scope |
| Brownfield Review | .agdf/control/artefacts/opencode-compact-gate-output/BROWNFIELD_REVIEW.md | done | Quick task; bounded CLI/output guidance change |
| OR | .agdf/control/artefacts/opencode-compact-gate-output/OR.md | completed | Quick task closeout |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: The approved scope is a small output-mode and OpenCode guidance change using an existing `status_card` data structure. It preserves full JSON behavior and does not alter gate semantics.
- evidence: The existing CLI already computes `status_card`; affected files and validation surfaces are known.
- transparency_note: PRD, SD and TP are intentionally skipped because they would add ceremony without reducing risk for this bounded CLI/output guidance change.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session and persisted in UR |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/opencode-compact-gate-output/BROWNFIELD_REVIEW.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| CLI source | create-agdf/bin/create-agdf.js | Gate-check output modes and status card data | direct |
| OpenCode hook source | create-agdf/opencode-plugin.js | Runtime reminder wording | direct |
| Generated asset source | create-agdf/scripts/sync-package-assets.js | OpenCode repository instructions | direct |
| Smoke tests | create-agdf/scripts/smoke-test.js | Verification surface for compact output behavior | direct |
| User docs | README.md; INSTALL.md; create-agdf/README.md | Affected explanation surface | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Compact output could become a second status model | warn | Render from existing `status_card` only |
| Full JSON compatibility could regress | warn | Preserve `--json` behavior and smoke-test it |
| OpenCode guidance may still encourage noisy raw JSON | warn | Update hook reminders and generated instructions |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPENCODE-VISIBILITY
- context_graph_required_action: link closeout to existing OpenCode visibility context
- context_graph_gate_effect: none
- context_graph_evidence: This refines the interactive reporting layer without changing AGDF gate rules.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: approved UR and completed Brownfield Review for `opencode-compact-gate-output`
- competing_scope_lines: none
- branch_workspace_evidence: control artefacts reviewed and gate-check pending after update
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: OpenCode compact output decisions belong to this implementation scope.
- memory_refs: .agdf/control/artefacts/opencode-compact-gate-output/

## Closeout

- delivered: UR, Brownfield Review, implementation, generated assets, documentation updates, smoke validation, runtime integrity validation, wrapper smoke validation and OR-lite.
- not_delivered: Commit, push, PR, release and publish.
- verification_performed: `gate-check --status-card` direct probe; `npm --prefix create-agdf run smoke-test`; `node plugin/scripts/check-runtime-integrity.mjs`; `npm --prefix agdf run smoke-test`.
- unverified: A real restarted OpenCode TUI session following the new guidance.
- next_allowed_action: Offer commit handoff; do not execute it automatically.
- quality_outlook: Keep compact output as a projection of the existing status card, not a second source of truth.
