# AGDF Run State

## Run Meta

- run_id: fresh-request-control-state-docs
- started_at: 2026-07-09
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Clarify user-facing documentation for the difference between a normal fresh request and repository-owned durable AGDF control state.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Runtime Contract and gate-check already define the fresh-request/default-UR and durable-control boundary. |
| What is approved? | UR approved by exact user formula on 2026-07-09; Brownfield Review selected quick_task. |
| What is missing? | No scope evidence is missing. |
| What is the next allowed action? | Offer commit handoff; do not execute it automatically. |
| What is explicitly forbidden right now? | CLI behavior changes, new gate logic, unrelated OpenCode/frontmatter work, automatic commit/push/PR. |

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
| Quality outlook | Keep Runtime Contract normative and explain the practical boundary once in user docs |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-09 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/fresh-request-control-state-docs/UR.md | approved | Documentation clarification scope |
| Brownfield Review | .agdf/control/artefacts/fresh-request-control-state-docs/BROWNFIELD_REVIEW.md | done | Quick task; documentation-only |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: The bounded change clarifies existing user documentation and does not alter Runtime Contract, gate logic, CLI behavior, persistence or architecture.
- evidence: Runtime Contract and gate-check already define the behavior; README, INSTALL and create-agdf README are the affected user docs.
- transparency_note: PRD/SD/TP are intentionally skipped because the approved scope is documentation-only and follows existing source-of-truth rules.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session and persisted in UR |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/fresh-request-control-state-docs/BROWNFIELD_REVIEW.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Runtime Contract | plugin/meta/agdf-runtime-contract.md | Normative fresh-request and durable-control rule | direct |
| Gate-check skill | plugin/skills/gate-check/SKILL.md | Operational next action for missing/incomplete control state | direct |
| User docs | README.md; INSTALL.md; create-agdf/README.md | Affected explanation surface | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Documentation may duplicate runtime rules | warn | Explain the user-facing distinction while keeping Runtime Contract normative |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This explains an existing operating-model boundary without changing rules.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: approved UR and completed Brownfield Review for `fresh-request-control-state-docs`
- competing_scope_lines: none
- branch_workspace_evidence: control artefacts and documentation diff reviewed
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The clarification belongs to this documentation scope.
- memory_refs: .agdf/control/artefacts/fresh-request-control-state-docs/

## Closeout

- delivered: UR, Brownfield Review, documentation clarification and focused review.
- not_delivered: Commit, push, PR and release.
- verification_performed: Source-of-truth inspected; README, INSTALL and create-agdf README reviewed; AGDF code review returned no findings.
- unverified: downstream reader comprehension until adoption.
- next_allowed_action: Offer commit handoff; do not execute it automatically.
- quality_outlook: Keep user explanation clear without creating a second runtime rule model.
