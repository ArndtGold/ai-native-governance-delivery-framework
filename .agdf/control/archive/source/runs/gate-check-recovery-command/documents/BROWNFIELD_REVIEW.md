# Brownfield Review: Gate Recovery and Approval Readiness Consistency

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Date: 2026-07-15

## Run

- run_id: `gate-check-recovery-command`
- related_ur: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`
- reviewer: agent

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: PRD
- reuse_strategy: `extend_existing_cli_and_interaction_owners`

## Existing-System View

| Area | Existing owner | Current coverage | Reuse decision |
|---|---|---|---|
| Run-selection recovery | `create-agdf/bin/create-agdf.js::readRunState` and doctor findings | partially_done: ambiguous runs are structured and candidate runs are exposed, but the shared next step recommends an invalid flag for `gate-check` | extend command-aware recovery at the existing owner |
| Gate transition | `transitionDecisionForRunState()` | partially_done: gate order and missing approval are correct, but an artefact-ready approval is projected as `blocked` | correct the existing transition projection; no second evaluator |
| Interaction projection | `buildStatusCard()` | partially_done: derives `interaction_kind` and `native_attempt_required`, but only from `status === open` | align with the canonical ready-gate invariant |
| CLI error boundary | `main()` | partially_done: some command paths catch and print concise errors, while invalid shared options throw to the process | reuse one top-level concise CLI error boundary |
| Regression tests | `create-agdf/scripts/control-state-test.js` | partially_done: ambiguous selection and illegal `--all-active` are covered, but recovery text, raw stacktrace absence for the illegal option and selected ready-gate projection are not | extend existing subprocess fixtures |
| Canonical policy | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md` | fully_done: ready gate, blocked gate and native-attempt semantics are already normative | preserve; add mechanical drift detection rather than new policy |
| Cross-surface integrity | `plugin/scripts/check-runtime-integrity.mjs` | partially_done: contract and skill wording are checked, executable readiness parity is not | extend the existing integrity owner only if focused tests cannot prove the invariant sufficiently |

## Impact And Compatibility

- files/modules: bounded to existing CLI transition/recovery ownership, focused control-state tests and possibly the existing integrity checker.
- interfaces: no flag, JSON field, exact approval or run-selection precedence changes.
- persistence/migrations: none.
- backwards compatibility: existing field names and genuine blocked-state behavior remain unchanged; only incorrect values and invalid recovery copy are corrected.
- regression focus: ambiguous run, selected ready gate, missing durable artefact, stale gate, illegal option and concise stderr behavior.
- side effects: native eligibility becomes reachable where the canonical contract already requires it; visible host rendering remains host-owned and unproven by repository tests.

## Parallel-Structure And Drift Assessment

| Finding | Risk | Required action |
|---|---|---|
| Adding a second readiness evaluator in prompt text would compete with executable gate state. | block if introduced | Correct the existing transition/status projection and test contract parity. |
| A generic recovery string cannot accurately serve both selected-run and aggregate commands. | revise | Derive recovery from the invoked target while keeping run-selection policy centralized. |
| A new error renderer would duplicate existing concise catch paths. | revise | Establish one reusable top-level CLI error boundary in the existing entrypoint. |
| Treating native eligibility as proof of visible buttons would overstate host evidence. | warn | Preserve the existing presented/fallback evidence boundary. |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: The defect is bounded and reuses established owners, but it crosses CLI recovery, gate-state projection and native-interaction orchestration. It therefore exceeds the single-function Narrow Code-Fix boundary and affects normative runtime behavior, while remaining too small for full structured delivery.
- evidence: approved UR; `create-agdf/bin/create-agdf.js:1629,2247-2288,2396-2408,3023-3032`; `create-agdf/scripts/control-state-test.js:292-334`; Runtime Contract Native Interaction Contract; gate-check native-attempt rules.
- transparency_note: The PRD, SD and TP should remain intentionally compact and must not redesign buttons, flags, schemas or gate authority.

## Open Questions For PRD / SD

| Question | Owner | Gate |
|---|---|---|
| Which single predicate defines an artefact-ready user gate independently of the human status label? | PRD | PRD |
| How should command-aware recovery be produced without duplicating run-selection policy? | CLI transition design | SD |
| Should top-level concise error handling wrap all CLI targets or only pre-dispatch validation? | CLI entrypoint design | SD |
| Which focused fixture provides mechanical contract-to-executable parity without brittle Markdown matching? | Test design | TP |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing native interaction authority and ambiguous-run selection invariants
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The fix reinforces existing reusable invariants rather than creating a new policy node; final closeout should link the implementation evidence to the existing knowledge owner.

## Quality Contract Output

- decision: `pass`
- evidence: existing owners, direct live reproductions, focused test fixtures and canonical interaction rules are identified.
- missing_evidence: approved PRD/SD/TP and implementation/test results.
- risks: parallel readiness logic, overbroad error handling and overclaiming host-rendered controls.
- required_next_step: Draft the compact PRD and request exact `Approval: PRD`.
- impact_codes: none identified beyond existing repository contracts.

## Next Permissible Step

- next_allowed_action: Draft the compact PRD for this structured slice and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, implementation, QA, UAT and release claims.
