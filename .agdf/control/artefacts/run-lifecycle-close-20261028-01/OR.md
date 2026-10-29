# OR: Close Active Runs as Superseded or Abandoned

Gate: OR
Type: Orchestration Report
Report mode: `OR-full`
Status: `done`

## Run

- run_id: run-lifecycle-close-20261028-01
- related_ur: .agdf/control/artefacts/run-lifecycle-close-20261028-01/UR.md
- related_prd: .agdf/control/artefacts/run-lifecycle-close-20261028-01/PRD.md
- related_sd: .agdf/control/artefacts/run-lifecycle-close-20261028-01/SD.md
- related_tp: .agdf/control/artefacts/run-lifecycle-close-20261028-01/TP.md
- related_qa_report: .agdf/control/artefacts/run-lifecycle-close-20261028-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/run-lifecycle-close-20261028-01/UR.md` |
| Brownfield Review | done | `.agdf/control/artefacts/run-lifecycle-close-20261028-01/BROWNFIELD_REVIEW.md` |
| Mode/Slice Decision | done | structured_delivery, required next gate PRD |
| PRD | approved | .agdf/control/artefacts/run-lifecycle-close-20261028-01/PRD.md |
| SD | approved | .agdf/control/artefacts/run-lifecycle-close-20261028-01/SD.md |
| TP | approved | .agdf/control/artefacts/run-lifecycle-close-20261028-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/run-lifecycle-close-20261028-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/run-lifecycle-close-20261028-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/run-lifecycle-close-20261028-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/run-lifecycle-close-20261028-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-29 · revision 22 · presentation 81851339-053d-4302-a4e2-ceced37c7ef2 sha256:97204c3d60cbdd72d77de478d7fc6e59958de8e4fbdc52176cf59160cdd418ba |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | completed after this OR |
| Current gate | OR |
| Allowed now | delivery closeout; commit, push and pull request only on explicit owner instruction |
| Blocked by | none |
| Missing approval | none |
| Next step | Owner decides on commit and pull request of branch `feat/run-lifecycle-close` |
| Quality outlook | Good: QA pass after independent Code Review with seven corrected findings; limits are single-host native evidence and pending pull-request CI |

## Delivered

| Item | Evidence |
|---|---|
| Run closure preview and apply in Core (`run-closure.js`) with Git identity helper (`git-identity.js`) | CD_TESTS.md; `packages/core/test/run-closure-test.js`, `git-identity-test.js` |
| Receipt kind `lifecycle_close.record`, journal and backlog move through the run-step path | CD_TESTS.md; closure, replay, crash-recovery and backlog tests |
| Ended-run guard in the run writers, early entry checks and continuation check | `run-lifecycle-guard-test.js`; `evidence/scn-012-before.txt`, `evidence/scn-012-after.txt` |
| Readers: gate policy `closed`, summary `run_ended`, cockpit `ended`, control-ui rendering | guard, cockpit and control-ui tests |
| MCP `agdf_closeout` kinds `closure.preview`/`closure.apply`; CLI `run-close` | MCP server suite, `run-close-test.js`, `evidence/scn-019-native-observation.md` |
| Contracts, CLI and MCP READMEs, handbook de/en; payload baseline, compatibility snapshot, eval fingerprints | community-health, `build:prepare`, `compatibility:check`, `eval:skills` |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Closing any real run of this repository, including the 23 legacy runs | Non-goal; owner decision after delivery | Owner, using `run-close` |
| Shared run inventory, hub supplement 3, backlog role change | Separate follow-up runs per discussion of 2026-10-28 | New runs |
| Chat decision card for closures | Not in this slice (PRD decision) | Later run if wanted |
| Commit, push and pull request | No VCS action without explicit instruction | Owner |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Targeted and regression suites on the final tree | .agdf/control/artefacts/run-lifecycle-close-20261028-01/CD_TESTS.md | AC-001 to AC-015 | `direct` |
| Independent Code Review with corrections | .agdf/control/artefacts/run-lifecycle-close-20261028-01/CODE_REVIEW.md | correctness, security, regression | `direct` |
| TP Review and UX Intent Fidelity | .agdf/control/artefacts/run-lifecycle-close-20261028-01/TP_REVIEW.md | T-001 to T-009, AC-001 to AC-015 | `direct` |
| Native MCP observation in Claude Code Desktop | .agdf/control/artefacts/run-lifecycle-close-20261028-01/evidence/scn-019-native-observation.md | AC-013, AC-010 | `direct` |
| QA decision pass | .agdf/control/artefacts/run-lifecycle-close-20261028-01/QA_REPORT.md | technical quality | `direct` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Native observation on Codex, Copilot and OpenCode | `warn` | Observe on those hosts in a later release qualification |
| Full pull-request CI lanes (Linux, macOS, full verify) | `warn` | Run in the pull request after the owner commits |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| About 100 bytes headroom in the MCP command tool budget | `warn` | Next schema change shortens text or decides on the budget |
| Older AGDF runtimes fail closed on the new receipt kind | `warn` | Use the same or newer AGDF on all hosts of a repository |
| A writer of the preview file could change it after review | `warn` | Digest prefix in preview and result makes it visible; same cooperative limit as approvals |
| SD SDD-08 text names XDG before `~/.gitconfig`; code follows Git precedence | `warn` | Recorded in CODE_REVIEW.md as CR-F05 |

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
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` node CG-RUN-SCOPED-CONTROL-STATE entry `run_closure_20261029`

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The closure transition, receipt kind and ended-run guard are reusable control-state rules for later runs.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state

## Next Permissible Step

- next_allowed_action: Delivery closeout handoff; the owner decides on commit and pull request.
- required_approval: none
- forbidden_until_then: automatic commit, push, pull request or release.

## Approval

OR does not approve later gates. It records the next permissible step.
