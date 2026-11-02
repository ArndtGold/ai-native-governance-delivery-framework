# Brownfield Review: Truthful quick-task closeout status

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: quick-task-closeout-status-20261002-01
- related_ur: [UR.md](UR.md) (Approval: UR recorded)
- current_gate: Brownfield Review
- reviewer: Agent (Claude Code)
- reviewed_at: 2026-10-02

## Objective

Size and route the approved UR: suppress the Quality Readiness projection for `quick_task` runs,
localize the projection's next-action line, and set `next_skill` to `none` once the OR is done.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Status-card text after closeout changes (a misleading block disappears, one line is localized); no decision, approval, working mode or recovery semantics change.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `quality.md` §Quality Readiness Projection | projection is defined over TP Review, Clean Review, CR and QA, which the `quick_task` route does not produce | `low` |
| Source of truth | `packages/core/lib/control-evaluation/gate-check.js` | `qualityReadinessForRunState` (line 254) builds the projection whenever any review row exists; `nextSkillByGate.OR = "release-or"` (line 27) ignores OR status | `low` |
| Runtime path | `packages/core/lib/skill-dispatch/service.js` | `routeNextSkill` (line ~428) follows `status_card.next_skill`; the post-UAT branch (line ~399) separately guards `orArtefact?.status !== "done"` | `low` |
| UI / UX | `printGateCheckStatusCard` in gate-check.js; `localizedOperationalValue` in `interaction-presentation.js` | the readiness next-action line prints raw `report.next_allowed_action` | `low` |
| Persistence / data | none | projection is derived and non-persistent; RUN_STATE untouched | `none` |
| Tests / QA | `packages/cli/scripts/skill-dispatch-test.js` (post-UAT closeout, already-closed case), `packages/core/test/interaction-presentation-test.js`, `test:operational-localization` | structured OR continuation and localization are covered | `low` |
| Release / operations | none | no packaging or host contract change; payload budget must hold | `none` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: Two derivation fixes inside the existing gate-check owner plus reuse of the existing operational-value localization; no module, external interface, data, compatibility, runtime or authority boundary changes. `next_skill` keeps its field and allowed values (`none` is already used for Quick Task Execution and CD+Tests).
- architecture_evidence: `gate-check.js` lines 13-28, 235, 254-274, 687-701; `service.js` gate_route and routeNextSkill.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the existing operational-value localization for the readiness next action instead of a new translation table | `localizedOperationalValue` already maps `next_allowed_action` texts for the status card | `none` | Strategy `extend`: expose a small localizing helper from `interaction-presentation.js` |
| Keep the post-UAT `release-or` branch untouched | `service.js` post_uat_closeout branch with its own OR-status guard | `none` | Only change `next_skill` derivation when OR is `done` |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Narrow local correctness fix of two derived status values in the existing gate-check owner; no new product semantics beyond the approved UR, no architecture, policy, persistence or contract expansion.
- evidence: gate-check.js (nextSkillByGate, qualityReadinessForRunState, printGateCheckStatusCard), service.js routing, existing tests listed above; live-run observation of run `add-subtract` on 2026-10-02.
- transparency_note: PRD/SD/TP are skipped because scope and acceptance are fully stated in the UR; Code Review stays mandatory and closeout uses OR-lite.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: none
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_slice` (no open product or design decision; the contract already defines the projection's four review dimensions)
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | Quick path selected |
| authority_boundary | `not_applicable` | Quick path selected |
| owner_consumer_coordination | `not_applicable` | Quick path selected |
| full_depth_impacts_absent | `not_applicable` | Quick path selected |
| migration_propagation_bounded | `not_applicable` | Quick path selected |
| failure_recovery_local | `not_applicable` | Quick path selected |
| independently_acceptable | `not_applicable` | Quick path selected |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Should `verified_change` also suppress the projection? It has no CR row today, so the projection never renders there; no change needed now. | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Correctness fix of derived presentation values; no new reusable decision or invariant beyond the existing contract.

## Next Permissible Step

- next_allowed_action: Quick Task Execution: implement the three fixes with regression tests, run affected suites, record evidence, Code Review, OR-lite.
- forbidden_until_then: scope expansion (Quick Task terminal stop, init, CONTEXT_GRAPH example node), PRD/SD/TP by ritual, QA or release claims without evidence.

## Quality Outlook

- quality_outlook: After this fix, the next small-path friction is the terminal stop at Quick Task Execution.
