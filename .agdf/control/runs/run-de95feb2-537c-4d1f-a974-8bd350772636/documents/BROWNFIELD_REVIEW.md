# Brownfield Review: Fix seven companion review findings before merge

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-de95feb2-537c-4d1f-a974-8bd350772636
- related_ur: .agdf/control/runs/run-de95feb2-537c-4d1f-a974-8bd350772636/documents/UR.md
- current_gate: Brownfield Review
- reviewer: Claude (agent)
- reviewed_at: 2026-11-10

## Objective

Size and route the approved UR: seven bounded defect fixes in the companion run view, the companion event journal and the Claude companion adapter on branch `feat/companion-core-run-view`, each with a test.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The fixes correct wrong output of existing companion surfaces (a toast showing a raw key, a wrong figure mood, a missing drift warning). No new surface, text semantics or interaction is introduced; the approved behaviour of the companion core run is restored.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Companion core run `run-d2818184-27fc-40ae-9195-70d080d3e926` (PRD AC-002, AC-003, AC-007, AC-008) | approved artefacts of that run; code comments citing SDD-001 to SDD-010 | `none` |
| Source of truth | Status card evaluator `packages/core/lib/control-evaluation/gate-check.js`; run inventory `packages/core/lib/control-state/run-inventory.js` | `packages/core/lib/companion/run-view.js` copies status card fields verbatim | `none` |
| Runtime path | `packages/core/lib/companion/{events,journal,figure-state,run-view}.js`; `packages/mcp-server/src/{server,generation-runtime}.js`; `plugins/agdf/host-templates/claude/companion/{notice,register,run-state}.mjs` | review of `git diff main...HEAD` on 2026-11-10 | `low` |
| UI / UX | Claude companion pane, status line and toasts; catalog `plugins/agdf/meta/agdf-interaction-locales.json` | `notice.mjs` `noticeText`, catalog `companion.notices` has no `unreadable` key | `low` |
| Persistence / data | Companion journal `companion/events.jsonl` below the plugin data root (notification channel, schema `companion-event/1`) | `packages/core/lib/companion/journal.js` | `low` |
| Tests / QA | `packages/core/test/companion-*-test.js`, `packages/cli/scripts/claude-companion-*.js`, `packages/mcp-server/test/companion-journal.test.js` | npm scripts `test:companion-run-view`, `test:claude-companion`, mcp-server `test:protocol` | `low` |
| Release / operations | Generated package assets `packages/cli/generated/`, `packages/cli/runtime/`; payload baseline, eval fingerprints, compatibility record | `scripts/sync-package-assets.js`; contract text change chain noted for edits under `plugins/agdf` | `low` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: Every fix stays inside the function that owns the defective behaviour (`observedRun`/`noticeText`, `fingerprint`, `snapshotFromRunView`, the journaling call sites, `deriveFigureState`, `needsEvaluation`, `successKind`/`reviewFacts`). No module boundary, external interface, schema version, data ownership or host contract changes; the journal stays a notification channel and the run view stays a read-only projection.
- architecture_evidence: `packages/core/lib/companion/figure-state.js`, `packages/core/lib/companion/run-view.js`, `packages/core/lib/companion/events.js`, `packages/core/lib/companion/journal.js`, `packages/mcp-server/src/server.js`, `packages/mcp-server/src/generation-runtime.js`, `plugins/agdf/host-templates/claude/companion/notice.mjs`, `plugins/agdf/host-templates/claude/companion/register.mjs`, `plugins/agdf/host-templates/claude/companion/run-state.mjs`
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The completed-run figure must follow the cockpit classification instead of a second rule | `projectCockpitAssessment` in `packages/core/lib/control-inspect/run-classification.js` | `warn` | Derive the blocked state from the copied status card fields already in the run-view entry; add no new evaluator |
| Recording kinds are listed in the command service and again in `successKind` | `packages/core/lib/control-state/run-command-service.js` line 284 | `warn` | Extend the existing `successKind` mapping only; no new event kind |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Seven local defect fixes with tests, restoring already approved behaviour. No new user capability, no policy, persistence format, architecture or release-critical change, and no new formal artefact is needed beyond this run's UR.
- evidence: Review findings of 2026-11-10 with file and line for each defect; approved UR of this run.
- transparency_note: Five of the seven findings are plausible, not reproduced. A test decides each; a finding that does not occur is closed as not applicable with that test. Finding 3 isolates only a single-run `timeout`; `source_changed` keeps the deliberate stale-view behaviour.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not_applicable
- decisive_full_depth_triggers: none
- rejected_alternative: structured_slice (no new product semantics or cross-owner coordination to plan)
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

- next_allowed_action: Implement the seven fixes with tests as Compact Delivery, then code review and closeout.
- forbidden_until_then: Commit, push, pull request or release actions; changes outside the seven findings.

## Quality Outlook

- quality_outlook: Good prospects. The defects are local and each has a clear owner function; the main risk is that changes under `plugins/agdf` require regenerating package assets and dependent baselines.
