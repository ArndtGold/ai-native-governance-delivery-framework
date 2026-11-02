# Brownfield Review: Skip file-symlink negative checks where Windows refuses symlinks

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: symlink-test-robustness-20261015-01
- related_ur: .agdf/control/artefacts/symlink-test-robustness-20261015-01/UR.md
- current_gate: UR (recorded while the UR card is ready)
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-15

## Objective

Route the narrow test-robustness change for four file-symlink fixtures.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Only test fixtures change; no user-facing capability, state or recovery behaviour changes.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none touched | test files only | none |
| Source of truth | `scripts/support/symlinks.js` `tryLinkFile` | used by agent-skills-conformance, proportionality and mcp-server safety tests | low |
| Runtime path | none touched | no product code changes | none |
| UI / UX | none | — | none |
| Persistence / data | none | — | none |
| Tests / QA | four test files | `compact-continuation-test.js:50`, `decision-qualification-test.js:32`, `artifact-readiness-test.js:47`, `presentation-document-test.js:71` | low |
| Release / operations | smoke-test chain unchanged | `packages/cli/package.json` | none |

## Architecture Impact

- architecture_relevance: architecture-not-applicable
- architecture_impact: none
- architecture_reason: Only test fixtures adopt an existing shared helper; no module, interface, data, compatibility, runtime or policy boundary changes.
- architecture_evidence: the four file-symlink sites listed above and `scripts/support/symlinks.js`.
- architecture_missing_evidence: none
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the existing `tryLinkFile` instead of local try/catch copies | `scripts/support/symlinks.js` | none | Use the helper at all four sites. |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Narrow test-only change reusing an existing helper; no product semantics, architecture, policy, persistence or contract impact. Code Review remains mandatory because test code is executable code.
- evidence: .agdf/control/artefacts/symlink-test-robustness-20261015-01/BROWNFIELD_REVIEW.md
- transparency_note: PRD, SD and TP are skipped because the approved UR fully defines the change; CR and OR-lite still apply.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: not_applicable
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none
- rejected_alternative: structured_slice, because no structured depth is needed for a test-only helper adoption.
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | not_applicable | compact path selected |
| authority_boundary | not_applicable | compact path selected |
| owner_consumer_coordination | not_applicable | compact path selected |
| full_depth_impacts_absent | not_applicable | compact path selected |
| migration_propagation_bounded | not_applicable | compact path selected |
| failure_recovery_local | not_applicable | compact path selected |
| independently_acceptable | not_applicable | compact path selected |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | warn |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: test-only change.

## Next Permissible Step

- next_allowed_action: After `Approval: UR`, implement the four guarded sites, run the four suites, then mandatory CR and OR-lite.
- forbidden_until_then: implementation before `Approval: UR`.

## Quality Outlook

- quality_outlook: Deterministic; the skip path is visible in test output and the symlink path stays covered where symlinks are allowed.
