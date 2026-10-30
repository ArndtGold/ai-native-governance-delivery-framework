# OR: Shared Core Run Inventory from Stored Run State

Gate: OR
Type: Orchestration Report
Report mode: `OR-full`
Status: `done`

## Run

- run_id: run-inventory-core-20261029-01
- related_ur: .agdf/control/artefacts/run-inventory-core-20261029-01/UR.md
- related_prd: .agdf/control/artefacts/run-inventory-core-20261029-01/PRD.md
- related_sd: .agdf/control/artefacts/run-inventory-core-20261029-01/SD.md
- related_tp: .agdf/control/artefacts/run-inventory-core-20261029-01/TP.md
- related_qa_report: .agdf/control/artefacts/run-inventory-core-20261029-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/run-inventory-core-20261029-01/UR.md` |
| Brownfield Review | done | `.agdf/control/artefacts/run-inventory-core-20261029-01/BROWNFIELD_REVIEW.md` |
| Mode/Slice Decision | done | structured_delivery, required next gate PRD |
| PRD | approved | .agdf/control/artefacts/run-inventory-core-20261029-01/PRD.md |
| SD | approved | .agdf/control/artefacts/run-inventory-core-20261029-01/SD.md |
| TP | approved | .agdf/control/artefacts/run-inventory-core-20261029-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/run-inventory-core-20261029-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/run-inventory-core-20261029-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/run-inventory-core-20261029-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/run-inventory-core-20261029-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-30 · revision 18 · presentation 1322cae3-8f38-4788-8fd5-64c265ef5fe6 sha256:e40f516add9632423d963ae57c7262384430e52e0e6f15e542d1fed5cc4c2d85 |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | completed after this OR |
| Current gate | OR |
| Allowed now | delivery closeout; commit, push and pull request only on explicit owner instruction |
| Blocked by | none |
| Missing approval | none |
| Next step | Owner decides on commit and pull request of branch `feat/run-inventory-core-20261029-01` |
| Quality outlook | Good: QA pass after independent Code Review and a real STDIO call that found and fixed two defects; limits are no native host session, Claude-only behavioral evaluation and pending pull-request CI |

## Delivered

| Item | Evidence |
|---|---|
| Pure inventory module `run-inventory.js`, reader `run-inventory-reader.js`, moved placeholder rule and run-ID title | `packages/core/test/run-inventory-test.js`; CODE_REVIEW.md verification |
| Doctor all-active inventory fields | `control-inspect-test.js`; `evidence/measurement.json` |
| Inspect operation `inventory`, presentation, MCP result classification, CLI command and surface-local validator | `control-inspect-test.js`, `active-run-inventory-test.js`, MCP server scripts, `evidence/inventory-stdio.json` |
| Route `control.inventory` in the request-activation contract, router and gate-check skill; evaluation cases, fingerprints and evaluator callback rule | `test:request-activation`; Claude behavioral evaluation 38 of 39 with both active-run cases passing |
| Handbook de/en, UI concept addendum, payload baseline, compatibility record, skill-eval fingerprints, Context Graph entry | `build:prepare`, `compatibility:record`, skill evals 113/113 |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Companion switch to a bundled copy (slice 2) | PRD non-goal | New run |
| Hub supplement 3 in the cockpit (slice 3), shorter display titles | PRD non-goal; long Objective titles observed at UAT | New run |
| Intake candidate list on the inventory | PRD non-goal, owner decision of 2026-10-29 | New run |
| Closing legacy runs that dominate "decision required" | Owner decision with `run-close` | Owner |
| Commit, push and pull request of the remaining working-tree changes | No VCS action without explicit instruction | Owner |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Suites on the tree before the review corrections | .agdf/control/artefacts/run-inventory-core-20261029-01/CD_TESTS.md | AC-001 to AC-014 | `direct` |
| Independent Code Review with corrections and final-tree verification | .agdf/control/artefacts/run-inventory-core-20261029-01/CODE_REVIEW.md | correctness, regression, final tree | `direct` |
| STDIO call through a separate MCP server process | .agdf/control/artefacts/run-inventory-core-20261029-01/evidence/inventory-stdio.json | AC-010, AC-013 | `direct` |
| Measurement on this repository | .agdf/control/artefacts/run-inventory-core-20261029-01/evidence/measurement.json | AC-013 | `direct` |
| TP Review and UX Intent Fidelity | .agdf/control/artefacts/run-inventory-core-20261029-01/TP_REVIEW.md | T-001 to T-009, AC-001 to AC-014 | `direct` |
| QA decision pass | .agdf/control/artefacts/run-inventory-core-20261029-01/QA_REPORT.md | technical quality | `direct` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Native host session with the installed package | `warn` | Observe in Claude Code and Codex during release qualification |
| Behavioral evaluation with Codex as evaluator | `warn` | Run when a Codex CLI is available |
| Full pull-request CI lanes | `warn` | Run in the pull request after the owner commits |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Attention classes rest on stored state; seals are not checked by the inventory | `warn` | Basis note on every entry; doctor and gate-check stay the integrity and live checks |
| 11 bytes headroom in the `agdf_inspect` definition | `warn` | Next inspect change factors the schema or decides the budget |
| Pre-existing behavioral failure of `en-explicit-agdf-help` with Claude | `warn` | Separate follow-up; fails identically on `main` |
| Native Claude CLI release evidence is stale after the contract text change | `warn` | Re-run `npm run native:claude-e2e` before the next release |

## Parent Reconciliation Handoff

- outcome: `not_applicable`
- target_run_id: none
- disposition: `not_applicable`
- evidence: no `OR reconciles_with parent_run` row in the Artefact Chain
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

- startable: `false`
- final_ready: `false`
- acceptance_ref: none
- evidence: not a programme run
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` node CG-RUN-SCOPED-CONTROL-STATE entry `run_inventory_20261030`

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The inventory as single run-list owner and the rule that every new inspect read needs an MCP result classification are reusable for later runs.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state

## Next Permissible Step

- next_allowed_action: Delivery closeout handoff; the owner decides on commit and pull request.
- required_approval: none
- forbidden_until_then: automatic commit, push, pull request or release.

## Approval

OR does not approve later gates. It records the next permissible step.
