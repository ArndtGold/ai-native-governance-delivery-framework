# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: gate-check-recovery-command
- lifecycle: completed
- revision: 18
- revision_id: 8dbc3fc9-aed5-4f60-9b02-5957428f5218
- mode: structured_slice
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Ensure ambiguous-run recovery recommends only valid command options and that a selected,
artefact-ready user gate reaches the correct approval path without being misclassified as blocked
or invoking a native adapter whose transport cannot preserve the exact authorization value.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `gate-check` recommends `--all-active`, while CLI validation rejects that option for `gate-check` and emits a raw Node.js stack trace. After explicit selection, a durable approval-ready UR is still classified as `blocked`. Live Codex evidence confirms a separate capability boundary: `request_user_input` requires a visible `(Recommended)` suffix and exposes no separate canonical value, while AGDF metadata already classifies Codex as `decorated_label_only` with exact-text authorization. The capability helper correctly rejects that transport, but agent orchestration bypassed the failed preflight and invoked the tool directly, producing the forbidden `Approval: UR (Recommended)` option. PRD revision 2 now separates gate readiness from native eligibility and requires mechanical prevention of that bypass. |
| What is approved? | Exact approvals for UR, PRD, SD, TP, QA and UAT are recorded; UAT was revalidated against revision 17 on 2026-07-16. |
| What is missing? | No gate approval. Fresh installed-plugin verification remains useful before publication. |
| What is the next allowed action? | Offer a path-scoped commit that excludes unrelated dirty-worktree changes. |
| What is explicitly forbidden right now? | Commit, push, pull request, publication or release without explicit user instruction. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`; live CLI reproduction on 2026-07-15
- competing_scope_lines: Existing active runs concern native gate presentation, the broader human decision surface and maintenance closeout; none owns this newly confirmed command-specific recovery defect.

## Run Status Card

| Run status | Value |
|---|---|
| Status | completed |
| Current gate | OR |
| Allowed now | Review the OR and explicitly request the desired Git handoff |
| Blocked by | none |
| Missing approval | none |
| Next gate after approval | none |
| Allowed after approval | none; all user gates are complete |
| Next step | Offer a scoped commit without including unrelated dirty-worktree changes |
| Quality outlook | Fresh installed-plugin runtime verification is useful before publication; no further implementation change is required |

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
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-07-16 after revision-2 revalidation. |
| SD | derived_from | PRD | Draft Solution Design derives from approved PRD revision 2. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-16 after revalidation. |
| TP | derived_from | SD | Draft Task/Test Plan derives from approved Solution Design. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-16 after same-run, same-gate and revision-12 revalidation. |
| QA_REPORT | tests | TP | Full package smoke, focused readiness/recovery/capability tests, Runtime Integrity and selected doctor pass. |
| QA | approved_by | `Approval: QA` | Exact approval provided on 2026-07-16 after same-run, same-gate and revision-16 revalidation. |
| UAT | approved_by | `Approval: UAT` | Exact approval provided on 2026-07-16 after same-run, same-gate and revision-17 revalidation. |
| OR | evidenced_by | QA and UAT | Full closeout recorded after QA pass and exact user acceptance. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Ambiguous `gate-check` output recommends `--all-active`. | Live `node create-agdf/bin/create-agdf.js gate-check --json` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:1629` | Actual recovery defect | direct |
| `gate-check --all-active` is rejected with a raw stack trace. | Live `node create-agdf/bin/create-agdf.js gate-check --all-active` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:3026-3032` | Invalid recommendation and failure presentation | direct |
| Selected durable UR with only exact approval missing reports `interaction_kind: blocked` and `native_attempt_required: false`. | Live `gate-check --run gate-check-recovery-command --json` reproduction on 2026-07-15; `create-agdf/bin/create-agdf.js:2261-2288`; `2399-2408` | Approval-readiness classification contradiction | direct |
| No native tool invocation occurred because the agent accepted the contradictory blocked projection. | Current Codex task evidence on 2026-07-15; canonical `plugin/meta/agdf-runtime-contract.md` native interaction rules | Missing orchestration consistency guard and execution error | direct |
| Native PRD attempt returned `Approval: PRD (Recommended)` while the user reported no visible button or deliberate input. | Current Codex task evidence on 2026-07-15 | `attempted_not_applied` classification, evidence honesty and exact-value rejection | direct |
| A changed PRD revision did not receive a new first native attempt because the previous attempt was treated as a session-wide safety condition. | Current Codex task evidence on 2026-07-15 | Interaction-scoped retry boundary and orchestration correction | direct |
| Codex tool schema requires `(Recommended)` on the recommended option and exposes no separate canonical value field. | Callable `request_user_input` contract observed in the current Codex task on 2026-07-16 | Host transport is decorated-label-only for AGDF approval purposes | direct |
| AGDF capability metadata already declares Codex `decorated_label_only` with `authorizationPath: exact_text`. | `plugin/meta/agdf-plugin.definition.json` | Canonical surface capability and intended fallback | direct |
| Capability preflight rejects decorated-only transport and its focused test passes, but a direct agent tool call bypassed it. | `create-agdf/lib/interaction-presentation.js`; `create-agdf/scripts/interaction-presentation-test.js`; current Codex task evidence on 2026-07-16 | Enforcement gap between helper correctness and actual orchestration | direct |

## Next Allowed Action

- next_allowed_action: Offer a path-scoped commit without including unrelated dirty-worktree changes.
- forbidden_until_then: Commit, push, pull request, publication or release without explicit user instruction.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-15 after revalidation. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-07-16 after same-run, same-gate and revision-2 revalidation. |
| SD | approved | Exact `Approval: SD` provided on 2026-07-16 after same-run and same-gate revalidation. |
| TP | approved | Exact `Approval: TP` provided on 2026-07-16 after same-run, same-gate and revision-12 revalidation. |
| QA | approved | Exact `Approval: QA` provided on 2026-07-16 after same-run, same-gate and revision-16 revalidation. |
| UAT | approved | Exact `Approval: UAT` provided on 2026-07-16 after same-run, same-gate and revision-17 revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/gate-check-recovery-command/UR.md` | approved | Exact approval recorded after same-run, same-gate and revision revalidation. |
| Brownfield Review | `.agdf/control/artefacts/gate-check-recovery-command/BROWNFIELD_REVIEW.md` | done | Existing owners reused; structured slice selected. |
| PRD | `.agdf/control/artefacts/gate-check-recovery-command/PRD.md` | approved | Revision 2 approved after revalidation. |
| SD | `.agdf/control/artefacts/gate-check-recovery-command/SD.md` | approved | Approved design: one readiness owner, existing capability preflight, command-aware recovery and integrity enforcement. |
| TP | `.agdf/control/artefacts/gate-check-recovery-command/TP.md` | approved | Eight bounded tasks approved after same-run, same-gate and revision revalidation. |
| Brownfield Analysis | `.agdf/control/artefacts/gate-check-recovery-command/BROWNFIELD_ANALYSIS.md` | done | Pass decision: existing owners, reuse boundaries, dirty overlap, regression paths and Context Graph links verified before implementation. |
| CD+Tests | `.agdf/control/artefacts/gate-check-recovery-command/CD_TESTS.md` | done | Approved implementation tasks delivered; focused and aggregate validation pass. |
| TP Review | `.agdf/control/artefacts/gate-check-recovery-command/TP_REVIEW.md` | pass | 8/8 tasks fully_done with direct evidence; live host rendering reserved for UAT. |
| Clean Implementation Review | `.agdf/control/artefacts/gate-check-recovery-command/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Root causes fixed in existing owners without shim, retry or parallel SoT. |
| CR | `.agdf/control/artefacts/gate-check-recovery-command/CODE_REVIEW.md` | done | Pass decision: no correctness, regression, security or maintainability finding remains. |
| QA | `.agdf/control/artefacts/gate-check-recovery-command/QA_REPORT.md` | passed | qa-gate pass: TP coverage, Brownfield fit, solution integrity, Code Review and automated evidence are strong. |
| UAT | `.agdf/control/artefacts/gate-check-recovery-command/UAT_REPORT.md` | passed | Exact user acceptance recorded after same-run, same-gate and revision revalidation. |
| OR | `.agdf/control/artefacts/gate-check-recovery-command/OR.md` | done | OR-full records delivery scope, evidence, risks, Context Graph reconciliation and scoped Git handoff. |

## Missing Evidence

- Fresh installed-plugin execution after delivery remains useful release evidence because the active cache is still version 0.8.6.

## Risks

- A shared recovery string may affect `doctor`, `gate-check` and `delivery-map`; the fix must remain command-specific without duplicating selection policy.
- Readiness status and interaction projection are coupled across transition evaluation and status-card construction; the fix must retain one canonical evaluator rather than introduce parallel logic.
- A prompt-only override could hide executable drift or bypass a real blocker; consistency must be mechanically checked and remain fail-closed.
- Host adapter output can exist without user-visible presentation or deliberate input; it must not become approval evidence.
- A prior native failure must not become a permanent session-level disable; each fresh revalidated interaction owns its own one-attempt budget.
- Callability without exact or separate value transport must not become native eligibility; otherwise Codex can render a forbidden decorated approval option.
- Helper-level tests do not mechanically prevent direct tool invocation, so Runtime Contract and generated skill instructions must make the preflight non-bypassable in agent orchestration.
- Stacktrace cleanup must preserve non-zero exit behavior and machine-readable diagnostics.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md` multi-run resolver and native interaction authority entries
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Brownfield Analysis, QA and UAT confirm existing nodes own command resolution and native interaction authority; no duplicate policy node is required.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Reproduction and expected behavior are specific to this bounded defect.
- memory_refs: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`

## Prior Run Pointers

- `agdf-ux-next-round` previously improved ambiguous-run UX but is completed; this run records the newly confirmed invalid-command regression separately.
