# Brownfield Review: Guard Windows symlink EPERM in install-control-repair test

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: install-repair-symlink-eperm-20261008-01
- related_ur: `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/UR.md`
- current_gate: UR (card ready)
- reviewer: Claude Code implementing agent (cooperative review, not independent proof)
- reviewed_at: 2026-10-08

## Objective

Size and route a test-only guard for two Windows symlink cases in `packages/cli/scripts/install-control-repair-test.js`.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Test harness only. No user-facing capability, state, feedback or recovery behavior changes.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | Test-only change | `none` |
| Source of truth | `packages/cli/scripts/install-control-repair-test.js` | Unguarded `symlinkSync` at about lines 289 and 299 | `low` |
| Runtime path | Production repair logic (`repairInstallationControl`, `inspectControlRepair`) | Not touched | `none` |
| UI / UX | none | none | `none` |
| Persistence / data | none | Temporary fixture repositories only | `none` |
| Tests / QA | `test:install-control-repair`, part of `smoke-test` | EPERM abort observed on Windows on 2026-10-08 | `low` |
| Release / operations | none | No payload change: test scripts are not part of the plugin runtime | `none` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: The change touches one test file. No module, interface, data, host or policy boundary is affected.
- architecture_evidence: `packages/cli/scripts/install-control-repair-test.js:287-302`.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the existing inline guard pattern (`win32` plus `EPERM`, logged SKIPPED) | `control-command-test.js:289-295`, `control-cockpit-fixtures.js` `symlinkOrSkip`, Context Graph CG-RUN-SCOPED-CONTROL-STATE invariant | `none` | Apply the same pattern locally. Do not create a new shared helper. |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Narrow local test-harness fix in one file with no new product semantics and no architecture, policy, persistence or contract impact. The evidence is sufficient for a small implementation plus the affected suite and Code Review.
- evidence: this review
- transparency_note: PRD, SD and TP would add ceremony without decision value. Code Review stays mandatory, and the closeout is OR-lite.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_slice`, because no PRD, SD or TP decision is needed.
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | quick_task |
| authority_boundary | `not_applicable` | quick_task |
| owner_consumer_coordination | `not_applicable` | quick_task |
| full_depth_impacts_absent | `not_applicable` | quick_task |
| migration_propagation_bounded | `not_applicable` | quick_task |
| failure_recovery_local | `not_applicable` | quick_task |
| independently_acceptable | `not_applicable` | quick_task |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE (existing invariant applied; no update needed)
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The fix applies the documented invariant without changing it.

## Next Permissible Step

- next_allowed_action: After `Approval: UR`, apply the guard as a Quick Task, run the suite, then Code Review and OR-lite closeout.
- forbidden_until_then: implementation.

## Quality Outlook

- quality_outlook: Low risk. The guard must stay limited to `win32` plus `EPERM` so that real failures still surface.
