# Brownfield Review: Hermetic control fixture for the MCP performance test

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: mcp-performance-hermetic-fixture-20261020-01
- related_ur: .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Claude (Opus 5.5) for owner Arndt Gold
- reviewed_at: 2026-10-20

## Objective

Size and route the approved UR: give `packages/mcp-server` `test:performance` a hermetic governance
target (run `agdf-mcp-dispatch-server` plus the control root files without `AGDF_RUN.md`), keep the
1500/1000 ms budgets, record the fixture size, and leave all other fixture consumers unchanged.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change is confined to test infrastructure in `packages/mcp-server/test`; no user-facing capability, decision, state, feedback or recovery behavior changes.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `packages/core`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/mcp-server/src` | No product file is in scope; the gate-check result for the target run is identical on full and hermetic control (analysis notes 2026-10-19). | `none` |
| Source of truth | SD AD-15 of run `agdf-mcp-dispatch-server` (budgets, "same fixture", record fixture size) | `.agdf/control/artefacts/agdf-mcp-dispatch-server/SD.md` lines 357-372 | `low` |
| Runtime path | MCP STDIO server and per-call worker | Unchanged; the test still spawns the owned runtime via `withStdioClient` and `fixture.args`. | `none` |
| UI / UX | none | Test-only change | `none` |
| Persistence / data | Repository `.agdf/control` | Read-only copy source; no control state is written or migrated. | `none` |
| Tests / QA | `packages/mcp-server/test/performance.test.js`, `packages/mcp-server/test/owned-runtime.js` | `createOwnedRuntimeFixture` copies `.agdf/control` wholesale (line 62); 13 other consumers in `packages/mcp-server/test`, `packages/control-ui/test/browser/decision-close-integration.spec.mjs`, `scripts/test-package-consumers.mjs`, `scripts/native-probes/core-mcp-decision.mjs` | `medium` |
| Release / operations | CI partition planning in `scripts/ci-plan.mjs` | The test keeps its command and partition; no workflow or plan change. | `none` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: The change adds an opt-in parameter to a test helper and uses it in one test. No module or owner boundary, external interface, data or source-of-truth ownership, compatibility, runtime/host contract or security/policy authority changes.
- architecture_evidence: `packages/mcp-server/test/owned-runtime.js` (test helper, not shipped: `packages/mcp-server/package.json` `files` lists only `bin`, `src`, `README.md`, `NOTICE`); `packages/mcp-server/test/performance.test.js`.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none; implementation follows the Compact Delivery path.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the existing fixture builder instead of a second fixture factory | `createOwnedRuntimeFixture` already assembles the owned runtime, dispatcher, SDK and provenance marker; only the control copy differs. | `none` | Extend it with an optional run selection; keep the default path byte-for-byte unchanged for the 13 other consumers. |
| No committed copy of control files | A static fixture would duplicate the target run's artefacts and drift from it. | `none` | Copy the selected run and root files from the repository at test time. |
| Legacy projection must be excluded | `.agdf/control/AGDF_RUN.md` projects run `legacy-profile-upgrade-recovery`; with that run absent, doctor reports `AGDF_LEGACY_PROJECTION_DRIFT` (`packages/core/lib/control-evaluation/doctor.js` lines 92-103). | `warn` | Exclude `AGDF_RUN.md` from the hermetic copy; the doctor treats an absent projection as valid when canonical runs exist. |
| Fixture-size evidence | SD AD-15 requires recording fixture size. | `none` | Add runs, files and bytes of the governance control to the evidence line. |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Compact Delivery. A bounded test-infrastructure change in `packages/mcp-server/test` (one opt-in fixture parameter and its use in the performance test) with no product semantics, architecture, policy, persistence, public interface or release impact. The owner already chose the option and the unchanged budgets.
- evidence: UR of this run; analysis notes `mcp-performance-test-flakiness-analysis.md` (2026-10-19) with STDIO A/B measurements and the identical gate-check result on hermetic control; `packages/mcp-server/test/owned-runtime.js`; `packages/mcp-server/test/performance.test.js`; `packages/mcp-server/package.json` (`files`).
- transparency_note: PRD, SD and TP are skipped because no product behavior or design decision is open; the budgets come from the existing SD AD-15 and stay unchanged. The diff spans a helper and its caller in two files, so the Narrow Code-Fix shortcut does not apply: CD+Tests evidence, Code Review, QA and OR remain required.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not applicable; Compact Delivery selected before Structured Depth.
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_slice` with PRD/SD/TP, rejected because no product, design or task-planning decision is open for a two-file test change.
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
| None; the fixture shape is fixed by the UR and the owner decision of 2026-10-19. | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` has no node for the MCP performance fixture; the change alters no curated ownership or source-of-truth relation.

## Next Permissible Step

- next_allowed_action: Implement the opt-in run selection in `createOwnedRuntimeFixture`, use it in `performance.test.js` with the fixture-size evidence, run the performance test repeatedly and the other fixture consumers' suites, then record CD+Tests and Code Review.
- forbidden_until_then: budget changes, product code changes, changes to other tests' fixtures, QA/OR claims.

## Quality Outlook

- quality_outlook: After this change, the remaining Windows dispatch cost (worker start, provenance digests, full-tree read boundary) is a product follow-up; CI must confirm the expected warm p95 reduction on Win22.
