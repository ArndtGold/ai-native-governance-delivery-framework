# QA Report: Cross-surface Executable Skill Dispatcher

Revision: 10
Date: 2026-09-04
Decision: `revise`
Run: `cross-surface-executable-skill-dispatcher`

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise | TP Review records 8/10 fully done and TP-09 plus TP-10 partially done. |
| Solution integrity | pass | Clean Review confirms one orchestration facade with no parallel governance owner or runtime-search fallback. |
| Code quality | pass | Code Review Revision 8 passes after the inactive global-skill and audit-free installer corrections. |
| QA decision | revise | The OpenCode repository correction passes locally, but its fresh inactive/active host behavior, newest Copilot correction and the remaining matrix lack evidence. |

Decision owner: `qa-gate`.

## QA Gate

- decision: `revise`
- evidence: Approved TP and passing Brownfield Analysis; TP-01 through TP-08 implemented; full
  smoke, release preparation, package, lifecycle, Runtime Integrity, interaction presentation,
  83/83 deterministic skill evals and mandatory code/clean reviews pass.
- missing_evidence: CSED-HOST-04 proves that neutral state and machine policies removed task/approval
  questions and pre-dispatch prose, but Copilot still mentions AGDF unprompted and merges the table
  header. The newest silent-context, runtime-mention policy and exact `host_action.text` pass
  repository tests but are not loaded-host evidence. OpenCode CSED-HOST-05 exposed the inactive
  binding defect; the repository correction now withholds that binding and passes focused tests.
- risks: The corrected inactive OpenCode path and actual Desktop Helper execution are not yet host
  proven. The audit-free installer also needs one clean user-host rerun. Remaining hosts and native
  Windows behavior remain unproven.
- required_next_step: Install and retest OpenCode in the inactive repository. It must stop without a
  shell request and point to `opencode-repo`; test execution later only in an explicitly activated
  repository, then complete TP-09.
- impact_codes: `evidence_gap`

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-QA-01 | evidence_gap | evidence_obligation | open | TP-09 is partial: Copilot promptness and OpenCode permission safety are evidenced, while corrected inactive OpenCode behavior, activated-repository execution, newest Copilot output, remaining hosts and native Windows are absent | Install and retest inactive OpenCode without a shell request, then test execution only in an explicitly activated repository and complete the matrix. |
| CSED-QA-05 | implementation_gap | implementation | resolved | CSED-HOST-07 proved the static global skill reconstructed a package runtime after inactive adapter guidance withheld the binding; generated global skills now require both the explicit active declaration and exact plugin binding, forbid runtime search/path inference/shell recovery, and pass release, smoke and Runtime Integrity | Verify inactive early return and activated execution as part of CSED-QA-01. |
| CSED-QA-06 | implementation_gap | implementation | resolved | The silent local OpenCode package install entered npm audit and appeared hung; the primary install now uses `--ignore-scripts --no-audit --no-fund`, its smoke fixture enforces those flags and the complete smoke passes | Perform one clean local installation rerun and record its terminal success as part of CSED-QA-01. |
| CSED-QA-02 | implementation_gap | implementation | resolved | Copilot reconstructed terminal prose, expanded one recovery action and conflated primary target with run/evidence selection; `host_action` and the shared binding now require exact transfer and stop without duplicating skill rules; focused and full smoke tests pass | Verify the resolved repository correction in a freshly loaded Copilot session as part of CSED-QA-01. |
| CSED-QA-03 | implementation_gap | implementation | resolved | A byte-matched retest exposed contradictory `AGDF active.` context; SessionStart now uses neutral runtime availability, intent-gates target requests and publishes `activation_trigger`, `pre_dispatch_output` and `terminal_output`; focused projection, integrity and release tests pass | Verify the newest correction in a freshly loaded Copilot session as part of CSED-QA-01. |
| CSED-QA-04 | implementation_gap | implementation | resolved | CSED-HOST-04 still echoed runtime availability and reconstructed the header; SessionStart is now silent for ordinary chat, runtime mention requires an AGDF request and terminal Markdown is embedded in `host_action.text` for byte-for-byte transfer | Verify the newest correction in a freshly loaded Copilot session as part of CSED-QA-01. |

## Context Graph Impact

- context_graph_impact: `updated`
- context_graph_refs: `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The new orchestration owner is linked to, but does not replace, target and interaction authority.

## Authority Boundary

This `revise` decision grants no approval, UAT, installation, restart, commit, push, PR or release
authority. No `Approval: QA` is requested while CSED-QA-01 remains open.
