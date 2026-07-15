# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: gate-check-recovery-command
- lifecycle: active
- revision: 9
- revision_id: C26EB8FC-DAA7-4E38-AD90-8F215AEC2925
- mode: structured_slice
- current_gate: PRD
- decision: in_progress
- owner: agent

## Objective

Ensure ambiguous-run recovery recommends only valid command options and that a selected,
artefact-ready user gate reaches the native approval path instead of being misclassified as blocked.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `gate-check` recommends `--all-active`, while CLI validation rejects that option for `gate-check` and emits a raw Node.js stack trace. After explicit selection, a durable approval-ready UR is still classified as `blocked`, suppressing the required native attempt before host invocation. The agent orchestration followed that contradictory projection instead of surfacing its conflict with the Runtime Contract. A later native PRD attempt returned a decorated answer even though the user saw no control and made no deliberate choice, proving invocation output is not presentation evidence. The next revision then incorrectly treated that one failure as a session-wide native-control disable instead of giving the newly revalidated interaction its own first attempt. |
| What is approved? | Exact `Approval: UR` was provided on 2026-07-15 after same-run, same-gate and revision-4 revalidation. |
| What is missing? | Exact `Approval: PRD`. |
| What is the next allowed action? | Review the persisted compact PRD and request exact approval. |
| What is explicitly forbidden right now? | SD, TP, implementation, QA and release claims before approved PRD. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`; live CLI reproduction on 2026-07-15
- competing_scope_lines: Existing active runs concern native gate presentation, the broader human decision surface and maintenance closeout; none owns this newly confirmed command-specific recovery defect.

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | PRD |
| Allowed now | Draft and refine the compact PRD; request exact PRD approval |
| Blocked by | Missing approved PRD |
| Missing approval | `Approval: PRD` |
| Next gate after approval | SD |
| Allowed after approval | Draft the compact Solution Design; implementation remains forbidden |
| Next step | Draft the PRD and request exact `Approval: PRD` |
| Quality outlook | Preserve command-specific recovery accuracy and add deterministic regression coverage |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: The bounded defect reuses established owners but crosses CLI recovery, gate-state projection and native-interaction orchestration, exceeding the single-function Narrow Code-Fix boundary without requiring full structured delivery.
- evidence: `.agdf/control/artefacts/gate-check-recovery-command/BROWNFIELD_REVIEW.md`; `create-agdf/bin/create-agdf.js`; `create-agdf/scripts/control-state-test.js`; canonical Runtime Contract and gate-check skill.
- transparency_note: Keep PRD, SD and TP compact; do not redesign buttons, flags, schemas or approval authority.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-15 after same-run, same-gate and revision-4 revalidation. |
| Brownfield Review | sizes | `structured_slice` | Existing owners, compatibility boundary and focused regression paths recorded in `BROWNFIELD_REVIEW.md`. |
| PRD | derived_from | UR | Draft PRD derives from the approved UR and recorded Brownfield Review. |
| PRD | approved_by | `Approval: PRD` | |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Ambiguous `gate-check` output recommends `--all-active`. | Live `node create-agdf/bin/create-agdf.js gate-check --json` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:1629` | Actual recovery defect | direct |
| `gate-check --all-active` is rejected with a raw stack trace. | Live `node create-agdf/bin/create-agdf.js gate-check --all-active` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:3026-3032` | Invalid recommendation and failure presentation | direct |
| Selected durable UR with only exact approval missing reports `interaction_kind: blocked` and `native_attempt_required: false`. | Live `gate-check --run gate-check-recovery-command --json` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:2261-2288`; `2399-2408` | Approval-readiness classification contradiction | direct |
| No native tool invocation occurred because the agent accepted the contradictory blocked projection. | Current Codex task evidence on 2026-07-15; canonical `plugin/meta/agdf-runtime-contract.md` native interaction rules | Missing orchestration consistency guard and execution error | direct |
| Native PRD attempt returned `Approval: PRD (Recommended)` while the user reported no visible button or deliberate input. | Current Codex task evidence on 2026-07-15 | `attempted_not_applied` classification, evidence honesty and exact-value rejection | direct |
| A changed PRD revision did not receive a new first native attempt because the previous attempt was treated as a session-wide safety condition. | Current Codex task evidence on 2026-07-15 | Interaction-scoped retry boundary and orchestration correction | direct |

## Next Allowed Action

- next_allowed_action: Review the persisted compact PRD and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation, QA and release claims before approved PRD.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-15 after revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/gate-check-recovery-command/UR.md` | approved | Exact approval recorded after same-run, same-gate and revision revalidation. |
| Brownfield Review | `.agdf/control/artefacts/gate-check-recovery-command/BROWNFIELD_REVIEW.md` | done | Existing owners reused; structured slice selected. |
| PRD | `.agdf/control/artefacts/gate-check-recovery-command/PRD.md` | draft | Compact state, recovery, compatibility and acceptance contract ready for review. |

## Missing Evidence

- Approved PRD and later SD/TP do not exist yet.
- No implementation or regression-test evidence exists yet.

## Risks

- A shared recovery string may affect `doctor`, `gate-check` and `delivery-map`; the fix must remain command-specific without duplicating selection policy.
- Readiness status and interaction projection are coupled across transition evaluation and status-card construction; the fix must retain one canonical evaluator rather than introduce parallel logic.
- A prompt-only override could hide executable drift or bypass a real blocker; consistency must be mechanically checked and remain fail-closed.
- Host adapter output can exist without user-visible presentation or deliberate input; it must not become approval evidence.
- A prior native failure must not become a permanent session-level disable; each fresh revalidated interaction owns its own one-attempt budget.
- Stacktrace cleanup must preserve non-zero exit behavior and machine-readable diagnostics.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The defect is bounded to an existing CLI recovery contract and does not yet establish reusable project knowledge.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Reproduction and expected behavior are specific to this bounded defect.
- memory_refs: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`

## Prior Run Pointers

- `agdf-ux-next-round` previously improved ambiguous-run UX but is completed; this run records the newly confirmed invalid-command regression separately.
