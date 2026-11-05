# Brownfield Review: Report pre-dispatch MCP command failures as not dispatched

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-8ede6acb-e0ce-4072-907a-aedad626635c
- related_ur: .agdf/control/runs/run-8ede6acb-e0ce-4072-907a-aedad626635c/documents/UR.md (approved, sha256:99306653dc8999bf79919f2e6cb5a236588e10f9e9f8d7eff2a7b9d0948c3f29)
- current_gate: Brownfield Review
- reviewer: Claude (cooperative agent review for Arndt Gold)
- reviewed_at: 2026-11-05

## Objective

Size and route the approved UR: failures raised while an MCP write tool prepares its dispatch (material grants, input context) must be reported as `rejected` / `dispatch: not_dispatched` with their typed reason instead of `effect_unknown` / `dispatch_worker_failed`.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: The change only corrects the machine-readable outcome, reason and recovery text of an MCP tool error; no screen, panel, card or interaction changes.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `packages/core/lib/mcp-tool-errors.js` (`agdf-tool-result/1`) and `RUN_COMMAND_RESULT_SCHEMA` in `packages/core/lib/control-state/run-command-schema.js` | `executionFacts` (mcp-tool-errors.js:40-46) defines `not_dispatched` for parse/setup failures; `stale_revision` (refresh_binding) and `material_transfer_expired` / `material_binding_mismatch` are already classified codes; `failure()` in `packages/cli/lib/mcp-protocol-runtime.js:282` maps `not_dispatched` to `outcome: rejected` | `none` |
| Source of truth | Material store `grants()` in `packages/core/lib/control-state/run-material.js:174-187` | Throws plain `Error('stale_revision' / 'material_transfer_expired' / 'material_binding_mismatch')` before any command runs | `none` |
| Runtime path | `prepareDispatch` in `packages/cli/lib/mcp-dispatch-runtime.js:79`, called from `packages/mcp-server/src/server.js:137` (facade) and `packages/mcp-server/src/generation-runtime.js:74` (installed generation path) | Both call sites evaluate `prepareDispatch` while their failure phase is already `execute`; `normalizeFailure` (mcp-protocol-runtime.js:65-73) returns typed `error.facts` first, otherwise `executionFacts` yields `dispatch_worker_failed` / `unknown`. generation-runtime.js:82 then adds the operation to its `unknown` set, which protects the generation from shutdown until operation-status confirms it | `low` |
| UI / UX | none | Tool error text only | `none` |
| Persistence / data | none | `grants()` and `inputContextFor()` only read; no control file is written before the dispatch | `none` |
| Tests / QA | `packages/mcp-server/test/tool-errors.test.js` (owned stdio runtime, isError projection), `packages/mcp-server/test/material-recovery.test.js` | No existing test reuses a consumed material reference through the MCP tool path; reproduced on 2026-11-05 in a native Claude CLI probe and directly in Core (`material_transfer_expired`, `stale_revision` thrown from `grants()`) | `low` |
| Release / operations | Generated runtime plugin copies `packages/cli/lib`; `plugins/agdf/meta/copilot-payload-baseline.json`; `docs/compatibility/*` | Deterministic tooling exists (`npm run build:prepare`, payload budget re-record, `npm run compatibility:record`) | `low` |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: The fix stays inside one producer function (`prepareDispatch`) of the existing MCP dispatch runtime adapter. It attaches typed execution facts that the existing error contract already accepts, so both existing call sites produce the already-specified `not_dispatched` result. No module owner, external interface field, result schema, error code, persistence, host contract or authority boundary changes.
- architecture_evidence: `packages/cli/lib/mcp-dispatch-runtime.js:79`; `packages/cli/lib/mcp-protocol-runtime.js:65-73`; `packages/core/lib/mcp-tool-errors.js:32-46`; `packages/mcp-server/src/server.js:131-138`; `packages/mcp-server/src/generation-runtime.js:66-83`.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: none beyond this run's implementation and Code Review.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Reuse the existing typed `facts` channel of `normalizeFailure` instead of adding a new error class or phase | mcp-protocol-runtime.js:66 returns `error.facts` when `validExecutionFacts` accepts them; mcp-tool-errors.js:32-38 | `none` | Throw `Object.assign(Error(code), { facts: { code, dispatch: 'not_dispatched' } })` from `prepareDispatch` |
| Alternative: correct the phase at both call sites (server.js and generation-runtime.js) | Two packages and the facade/generation boundary would change for the same effect; no other `prepareDispatch` producer exists (repository search 2026-11-05) | `warn` | Rejected for this slice; a code comment at `prepareDispatch` records that its failures are pre-dispatch |
| No parallel error vocabulary | Codes stay the material store's existing classified codes; unknown preparation errors map to the existing `dispatch_worker_failed` with `not_dispatched` | `none` | Keep the mapping inside `prepareDispatch` |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Compact Delivery of a narrow defect fix. One function in `packages/cli/lib/mcp-dispatch-runtime.js` makes pre-dispatch failures conform to the existing `agdf-tool-result/1` error contract; a regression test exercises the real MCP tool path. No new product semantics, schema field, error code, gate, approval formula or CLI flag. Derived artefacts (generated runtime copies, Copilot payload baseline, compatibility record) are propagated by existing deterministic tooling.
- evidence: approved UR (sha256:99306653…); 2026-11-05 Claude CLI probe (ignored `probe-results/cli-mcp-20261105/record.jsonl`, `revise-draft.jsonl`); Core reproduction of `grants()` throwing `stale_revision` and `material_transfer_expired`; code references in Existing-System View.
- transparency_note: PRD, SD and TP are skipped because the expected behavior is already specified by the existing error contract and the UR acceptance signals are directly testable. Code Review, test evidence and OR closeout remain required.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `not_applicable`
- primary_reason_code: not_applicable (compact path selected before Structured Depth)
- decisive_full_depth_triggers: none. External contract trigger checked: the published result schema, outcome values and error codes stay unchanged; the fix makes the implementation emit the outcome the contract already prescribes for a non-dispatched command.
- rejected_alternative: `structured_slice` (no full-depth trigger and no open product decision; PRD/SD/TP depth would add no decision value); `verified_change` (intended for bounded user-visible changes with a VERIFIED_CHANGE.md eligibility record; this is an internal defect fix with derived payload and compatibility evidence).
- missing_or_conflicting_facts: none
- depth_evidence_refs: this review; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `not_applicable` | Compact path selected |
| authority_boundary | `not_applicable` | Compact path selected |
| owner_consumer_coordination | `not_applicable` | Compact path selected |
| full_depth_impacts_absent | `not_applicable` | Compact path selected |
| migration_propagation_bounded | `not_applicable` | Compact path selected |
| failure_recovery_local | `not_applicable` | Compact path selected |
| independently_acceptable | `not_applicable` | Compact path selected |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none (current `.agdf/control/CONTEXT_GRAPH.md` has no MCP dispatch node; earlier MCP nodes are archived)
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The fix restores existing contract behavior and introduces no new long-lived decision or SoT.

## Next Permissible Step

- next_allowed_action: Compact implementation of the `prepareDispatch` fix with a regression test through the MCP tool path, then propagate derived artefacts, run the affected suites, Code Review and OR closeout.
- forbidden_until_then: changes outside `prepareDispatch` except the regression test and deterministic derived artefacts; changes to the material store, Core command classification, result schema or error codes.

## Quality Outlook

- quality_outlook: Separate findings from the 2026-11-05 review stay open outside this run: `material_binding_invalid` reported as `effect_unknown` for a no-mutation `source_revision.preview`, silent base64 corruption in model-driven material transport, 61 KB `continue_delivery` responses, `doctor` revise without findings for projects without active runs, and the stale native E2E failure-case expectation.
