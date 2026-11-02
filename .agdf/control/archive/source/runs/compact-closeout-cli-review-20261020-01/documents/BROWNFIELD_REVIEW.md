# Brownfield Review: Compact closeout after a CLI-recorded Code Review

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: compact-closeout-cli-review-20261020-01
- related_ur: .agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Claude (Opus 5.5) for owner Arndt Gold
- reviewed_at: 2026-10-20

## Objective

Size and route the approved UR: the dispatcher's compact closeout continuation must accept a `done`
Code Review that the CLI review step recorded without a registered path, while registered sources keep
their fail-closed binding.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The fix replaces an internal evaluator error with the already defined `release-or` closeout continuation; no new user-facing capability, decision, state type or recovery semantics is introduced.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Compact Delivery closeout (`modes.md`, `release-or`) | The CLI closeout writer (`run-steps.js` `closeout` branch) requires only CR status `done`; `control-state-test.js` closes a Quick Task after a review recorded without `--source`. | `low` |
| Source of truth | `compactContinuation` in `packages/core/lib/skill-dispatch/compact-continuation.js` | `else if (closeout) read('CR')` reads `state.artefacts.get('CR')?.path`; the CLI review step writes `["CR", "", status, ...]` (`run-steps.js` review branch). | `low` |
| Runtime path | `createSkillDispatchService` (`skill-dispatch/service.js`) maps any `compactContinuation` throw to `control_evaluation_failed`. | `service.js` `runDispatchStage(DISPATCH_RECOVERY.control_evaluation_failed, () => compactContinuation(...))` | `low` |
| UI / UX | none | No rendering change | `none` |
| Persistence / data | Run state and seals | No writer changes; the continuation is read-only. | `none` |
| Tests / QA | `packages/cli/scripts/compact-continuation-test.js`, `packages/core/test/quick-closeout-command-test.js`, `packages/core/test/control-state-test.js`, `packages/core/test/run-step-transaction-test.js` | Fail-closed cases for missing or symlinked registered sources already exist and must keep passing. | `medium` |
| Release / operations | AGDF release | Reaches users only with the next release; no release action in this run. | `none` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: One read-only translation function changes which sources it binds for the compact closeout. No module or owner boundary, external interface, persisted data, compatibility contract, runtime/host contract or authority boundary changes; the closeout writers and gate policy stay as they are.
- architecture_evidence: `packages/core/lib/skill-dispatch/compact-continuation.js`; `packages/core/lib/control-state/run-steps.js` (review and closeout branches); `packages/core/lib/control-evaluation/gate-policy.js` decides `record_closeout` independently of the CR path.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none; implementation follows the Compact Delivery path.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Fix in the reader, not the CLI writer | The UR excludes changing the CLI review step; registering free-text `--source` values as artefact paths would add a second registration owner next to the MCP `step.record` owned-output path. | `none` | Bind the CR source only when a path is registered; otherwise omit it from `source_artifacts`. |
| Keep fail-closed source binding | `compact-continuation-test.js` expects `evaluator_error` for a missing or symlinked registered source. | `none` | Distinguish "no registered path" from "registered path invalid"; the second still throws. |
| Tampering with an empty path | `run-seal-compute.js`: `content_seal` covers the run state text and every listed artefact; `doctor.js` reports `AGDF_RUN_SEAL_MISMATCH`/`AGDF_RUN_SEAL_INVALID`; `compactContinuation` returns nothing unless `blocking_reason` is `none`. | `none` | No extra guard needed; cover with the existing seal behaviour. |
| Closeout writers need no CR source | `run-steps.js` CLI closeout checks CR `status === "done"` only. | `none` | No writer change. |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Compact Delivery under the Narrow Code-Fix Criterion. The production change is confined to `compactContinuation` in one file and restores internal correctness of the already approved Compact Delivery closeout for the documented CLI review lane; a new regression test exercises it; no PRD, SD, TP, gate name, approval formula or documented CLI flag or output field changes.
- evidence: UR of this run; `packages/core/lib/skill-dispatch/compact-continuation.js`; `packages/core/lib/control-state/run-steps.js`; `packages/core/test/control-state-test.js` (CLI review without source, CLI closeout); incident in run `mcp-performance-hermetic-fixture-20261020-01`.
- transparency_note: PRD, SD and TP are skipped because no product, design or plan decision is open. Code Review stays mandatory; doctor and the directly affected suites must pass unchanged.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not applicable; Compact Delivery selected before Structured Depth.
- decisive_full_depth_triggers: none
- rejected_alternative: changing the CLI review step to register `--source` as the CR path, rejected because it changes a documented CLI behaviour and adds a second registration owner.
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review; the run's UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | Compact Delivery selected. |
| authority_boundary | `not_applicable` | Compact Delivery selected. |
| owner_consumer_coordination | `not_applicable` | Compact Delivery selected. |
| full_depth_impacts_absent | `not_applicable` | Compact Delivery selected. |
| migration_propagation_bounded | `not_applicable` | Compact Delivery selected. |
| failure_recovery_local | `not_applicable` | Compact Delivery selected. |
| independently_acceptable | `not_applicable` | Compact Delivery selected. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| None; the boundary between an unregistered and an invalid registered CR is fixed by the UR. | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` holds no node for compact continuation source binding; ownership is unchanged.

## Next Permissible Step

- next_allowed_action: Add the failing regressions (actual CLI lane in `quick-closeout-command-test.js`, unregistered vs broken registered CR in `compact-continuation-test.js`), change `compactContinuation`, run the affected suites, record CD+Tests evidence and Code Review, then OR-lite.
- forbidden_until_then: changes to the CLI review step, gate policy, closeout writers, seals or MCP paths; QA/OR claims.

## Quality Outlook

- quality_outlook: The recovery text for compact continuation failures stays generic; a later run could name the failed source in the dispatcher diagnostic.
