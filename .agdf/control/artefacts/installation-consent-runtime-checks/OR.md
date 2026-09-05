# Orchestration Report: Codex Hook Observation Correction

Run: `installation-consent-runtime-checks`
Date: 2026-09-05

## OR

- gate: `QA`; UR Revision 2, PRD Revision 2, SD Revision 3 and TP Revision 2 remain approved
- report_mode: `OR-full`, bounded correction under IRC-07/10/14/16
- artefact: `.agdf/control/artefacts/installation-consent-runtime-checks/OR.md`
- status: `revise`, as decided by `qa-gate` in QA Report Revision 10
- delivered: native Codex `hooks/list` observation, review precedence in the existing consent
  adapter, existing CLI/lifecycle integration and regression tests; trusted hooks no longer
  receive a redundant approval instruction; documentation and evidence updated
- intentionally_not_delivered: hook-command changes, automatic trust writes, permission bypass,
  installation into the live plugin, QA/UAT approval, commit, push, publication or release
- evidence: focused consent/transport, CLI and lifecycle tests; both local Codex binaries report
  the same enabled trusted hook through the implemented observer; final aggregate result in
  `CD_TESTS.md`; source and live-host evidence kept separate
- missing_approvals: QA and UAT remain missing; no new approval is requested while QA is revise
- plan_coverage: bounded repository correction evidenced; installed rendering in IRC-10 and the
  pre-existing host-matrix obligations remain partial under `TPR-01`
- brownfield_fit: pass, Revision 3; existing consent and lifecycle owners reused
- solution_integrity: pass; Code Review pass; `IRC-CODEX-01` resolved
- missing_evidence: revised installed installer rendering, fresh Codex enabled/change/disable
  cycle, native Windows, rendered public candidate and remaining conflict/rollback cases
- risks: native API and host configurations may differ; unsupported or ambiguous metadata stays
  unverified. The source of the old stale trust hash was not recovered. A plugin cache-root change
  alone did not alter the native hash in the tested versions
- retained_fallbacks: explicit native `/hooks` inspection when the observer is unavailable;
  exit condition is successful native observation and the separately required fresh-session proof
- documentation_impact: `INSTALL.md`, `create-agdf/README.md`, correction evidence and reviews
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: existing nodes now describe native observation versus fresh execution,
  redundant-review prevention and unchanged trust/receipt ownership
- delivery_closeout: not the next step while the required QA evidence remains open
- quality_outlook: use native evidence for recovery advice; preserve real review on changed hooks
- required_next_step: obtain the remaining direct-host evidence under `TPR-01`, beginning with a
  fresh Codex task that demonstrates the trusted session hook actually supplied its context

## Evaluated Coordination

Copied from the selected-run Delivery Map, without inferring parentage:

```json
{
  "parent_reconciliation": {
    "outcome": "not_applicable",
    "target_run_id": "",
    "disposition": "not_applicable",
    "evidence": "",
    "missing_evidence": "none",
    "next_action": "none"
  },
  "programme_aggregation": {
    "applicable": false,
    "startable": false,
    "final_ready": false,
    "acceptance_ref": "",
    "evidence": [],
    "missing_evidence": [],
    "next_action": "none"
  }
}
```
