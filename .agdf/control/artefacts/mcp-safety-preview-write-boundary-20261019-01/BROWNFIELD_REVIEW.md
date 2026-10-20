# Brownfield Review: Declare the preview snapshot writer in the MCP safety write boundary

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: mcp-safety-preview-write-boundary-20261019-01
- related_ur: .agdf/control/artefacts/mcp-safety-preview-write-boundary-20261019-01/UR.md (Approval: UR, revision 3)
- current_gate: Brownfield Review
- reviewer: Claude Code (agent), cooperative local review
- reviewed_at: 2026-10-19

## Objective

Size and route the approved UR: the MCP server safety test does not declare `preview-snapshot.js`, a Core writer added by PR #23 and reachable from the MCP server, so `test:safety` fails locally and in the MCP partitions of the "AGDF Guardrails" CI on `main` (a66a14ca) and PR #22.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Only a repository test changes; no user-facing surface, text or interaction.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none affected | The UR changes no command, result, gate or approval rule | `none` |
| Source of truth | `packages/mcp-server/test/safety.test.js` (`continuationWriteOwners`, `assertWriteBoundary`, structural checks for `snapshot.js` and `run-presentation.js`) | Lines 77-88 declare six Core write owners and the boundary check; lines 122-127 assert the open flags of the two reviewed readers | `low` |
| Runtime path | `packages/core/lib/control-state/preview-snapshot.js` (`publishPreviewSnapshot`); `run-presentation.js` | `preview-snapshot.js` line 52 opens with `O_WRONLY \| O_CREAT \| O_EXCL \| O_NOFOLLOW`, mode 0600, line 59 writes and fsyncs; `run-presentation.js` line 15 imports it and line 123 calls it while publishing a presentation | `none` (unchanged) |
| UI / UX | none | No UI file in scope | `none` |
| Persistence / data | none | No control file, receipt or schema change | `none` |
| Tests / QA | `test:safety` in the mcp-server suite, run by CI through the CLI smoke suite (`test:mcp-server`) | CI run 39255054874 on `main` fails in MCP · Win22 3of5, MCP · Linux22 2of3 and MCP · Linux24 2of3 at this assertion; a full scan of the reachable graph (121 modules) and of the read-only graph (89 modules) finds no other module beyond its declared boundary | `low` |
| Release / operations | Copilot payload baseline, eval fingerprints, host-compatibility evidence | Test files under `packages/mcp-server/test/` are not in the Copilot payload; compatibility evidence may fingerprint the test source | `low` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: The change declares an existing writer in a test-owned review list and adds an assertion about its existing open flags. No module, import, interface, data path or runtime behaviour changes. The security boundary of the code itself is unchanged; the test catches up with code that PR #23 already merged.
- architecture_evidence: `safety.test.js` lines 77-127; `preview-snapshot.js` lines 1, 43-61; `run-presentation.js` lines 15 and 123; CG-MCP-DISPATCH-ADAPTER invariant "no generic filesystem mutation enters the reachable server graph" (an exclusive create of a run-local snapshot is not a generic mutation, like the declared presentation publishing).
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: Quick Task Execution changes `safety.test.js`; Code Review checks that the declaration is exact and the assertion fails on a weakened open.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: a Core writer reachable from the MCP server is not declared | `assertWriteBoundary` fails for `runtime/core/lib/control-state/preview-snapshot.js` | `revise` | Declare exactly `writeFileSync`, `openSync`, `fsyncSync` in `continuationWriteOwners` |
| risk: a declaration could later cover an overwrite | the symbol scan checks names, not flags | `warn` | Assert exactly one `openSync` call with `O_CREAT`, `O_EXCL` and `O_NOFOLLOW`, like the existing reader assertions |
| risk: a second list of write owners | the read-only graph reuses `continuationWriteOwners` as `readDescriptors` | `none` | Extend the one existing map; no new list |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: compact_test_declaration. One test file, an exact declaration of an already merged writer plus one structural assertion, no product semantics, no runtime, architecture, policy, persistence or contract change.
- evidence: this review; UR revision 3; the CI failure and the graph scan in the Existing-System View.
- transparency_note: Compact Delivery: implementation, the mcp-server suite and the verification checks, a mandatory Code Review, then a compact closeout. No PRD, SD or TP.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: compact_test_declaration
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_slice` — no acceptance criteria or design decision beyond the approved UR remain open; the UR already names the exact declaration and assertion.
- missing_or_conflicting_facts: none
- depth_evidence_refs: Existing-System View; Architecture Impact.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | Compact path selected before Structured Depth. |
| authority_boundary | `not_applicable` | Compact path selected before Structured Depth. |
| owner_consumer_coordination | `not_applicable` | Compact path selected before Structured Depth. |
| full_depth_impacts_absent | `not_applicable` | Compact path selected before Structured Depth. |
| migration_propagation_bounded | `not_applicable` | Compact path selected before Structured Depth. |
| failure_recovery_local | `not_applicable` | Compact path selected before Structured Depth. |
| independently_acceptable | `not_applicable` | Compact path selected before Structured Depth. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| No open product or design question; the UR fixes the declaration and the assertion | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Closeout adds one entry to the existing node that the reviewed write boundary now declares the preview snapshot writer with exclusive-create assertion.

## Next Permissible Step

- next_allowed_action: Quick Task Execution: change `packages/mcp-server/test/safety.test.js` within the approved UR scope and run the checks.
- forbidden_until_then: Changes outside `safety.test.js`, other write-boundary declarations, and QA or release claims without evidence.

## Quality Outlook

- quality_outlook: Low risk: the change only declares and constrains an existing writer. The residual risk is that a later CI partition shows a further, unrelated failure; it is reported, not absorbed into this scope.
