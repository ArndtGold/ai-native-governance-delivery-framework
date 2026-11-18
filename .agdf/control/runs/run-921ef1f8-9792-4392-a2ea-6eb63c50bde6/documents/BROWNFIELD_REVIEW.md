# Brownfield Review: Status card path marks only one current gate

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-921ef1f8-9792-4392-a2ea-6eb63c50bde6
- related_ur: .agdf/control/runs/run-921ef1f8-9792-4392-a2ea-6eb63c50bde6/documents/UR.md
- current_gate: Brownfield Review
- reviewer: Claude (agent)
- reviewed_at: 2026-11-11

## Objective

Size and route the approved UR: one rule in `buildBreadcrumbPath` so that the status card path never shows two current entries, with a test.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The path of the status card changes only in a state where it showed two current marks; the route entry is then open. No new surface, text or interaction.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Status card path, `BREADCRUMB_PATH_TEMPLATES` and `buildBreadcrumbPath` | `packages/core/lib/control-evaluation/gate-check.js` lines 143 to 183 | `low` |
| Source of truth | Gate policy and approvals; the path only projects them | `transitionDecisionForRunState`, `gateApprovalStatus` | `none` |
| Runtime path | `buildStatusCard` used by gate-check, the run view and the Markdown status card | `packages/core/lib/control-evaluation/gate-check.js`, `packages/core/lib/companion/run-view.js` | `low` |
| UI / UX | Companion gate bar draws the path states as given | `plugins/agdf/host-templates/claude/companion/gate-bar.mjs` | `low` |
| Persistence / data | none | The path is computed, never stored | `none` |
| Tests / QA | Golden test of the status card; companion run view tests | `packages/core/test/status-card-golden-test.js`, `packages/core/test/companion-run-view-test.js` | `low` |
| Release / operations | Copilot payload baseline and compatibility evidence follow Core changes | `plugins/agdf/meta/copilot-payload-baseline.json`, `docs/compatibility/evidence/` | `low` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: The change stays inside `buildBreadcrumbPath`, a pure projection of the already evaluated current gate and approvals. No module boundary, interface, schema or stored data changes.
- architecture_evidence: `packages/core/lib/control-evaluation/gate-check.js`
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The fix must stay in the one path owner; the companion gate bar must not add its own correction | `gate-bar.mjs` maps the card's states and derives none | `warn` | Change only `buildBreadcrumbPath` |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: One local display rule with a test; no new capability, policy, persistence or architecture change.
- evidence: Reproduction with `buildStatusCard` on 2026-11-11 (`UR:current Compact Delivery:current`); approved UR of this run.
- transparency_note: The golden fixtures contain no case with two current entries, so the golden file is expected to stay unchanged; the test decides.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none
- rejected_alternative: verified_change (a test is added, so the compact path with review fits)
- missing_or_conflicting_facts: none
- depth_evidence_refs: none

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | compact path selected |
| authority_boundary | `not_applicable` | compact path selected |
| owner_consumer_coordination | `not_applicable` | compact path selected |
| full_depth_impacts_absent | `not_applicable` | compact path selected |
| migration_propagation_bounded | `not_applicable` | compact path selected |
| failure_recovery_local | `not_applicable` | compact path selected |
| independently_acceptable | `not_applicable` | compact path selected |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: No node, owner or source-of-truth relation changes.

## Next Permissible Step

- next_allowed_action: Implement the rule with its test as Compact Delivery, then code review and closeout.
- forbidden_until_then: Commit, push, pull request or release actions; changes outside the path rule.

## Quality Outlook

- quality_outlook: Good prospects. The change is a few lines in one pure function with a direct reproduction; the remaining effort is the payload baseline and the compatibility evidence.
