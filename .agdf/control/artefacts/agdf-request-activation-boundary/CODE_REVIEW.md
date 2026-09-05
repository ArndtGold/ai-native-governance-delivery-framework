# Code Review: AGDF Request Activation Boundary

Status: pass
Decision: pass
Revision: 3
Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Based on: approved TP Revision 3, final implementation diff and passed full smoke

## Code Review

- decision: `pass`
- findings: none remaining in the reviewed final diff.
- evidence:
  - Historical pre-correction CLI reproduction: initial `init` succeeded, `run-create --run
    active-demo` succeeded, and repeated `init` exited `1` with
    `AGDF_CANONICAL_INIT_UNKNOWN_PATH: runs/active-demo`.
  - The corrected canonical-init suite now tests exact-match retry, repair, invalid structures,
    Symlinks, Hardlinks, ownership bypass and concurrent content or identity drift.
  - Final public CLI reproduction exits `0` with `outcome: unchanged`, `changes: []` and byte-identical
    run state. The focused suite and final full smoke pass.
- resolved_findings: The earlier Codex, Claude Code and GitHub Copilot post-activation routing gap is
  resolved by the validator-relative `route_source_after_activation` binding and its package, layout,
  footprint and composed-profile checks. `RAB-CR-01` is resolved by accepting only valid canonical
  run records as separately snapshot-bound state, preserving them byte-for-byte and rejecting any
  invalid structure or concurrent drift.
- security: Run IDs, parsed state, single-file structure, Symlinks, Hardlinks, Ownership-only state
  and content/identity drift are tested fail-closed. Rollback removes only identity- and byte-matched
  repair files and preserves concurrent run changes. No overwrite or data loss was observed.
- compatibility: Public `init -> run-create -> init` now exits 0 with unchanged run bytes. Focused,
  lifecycle, package, integrity and full smoke suites pass.
- missing_evidence: Fresh install/readback/restart observations for all four hosts remain unavailable
  under `RAB-TPR-01`; the four external composed-profile executions remain unavailable under
  `RAB-TPR-02`. Neither gap explains or supersedes `RAB-CR-01`.
- risks: Installed-host instruction loading and model behavior remain separate, unavailable evidence;
  no concrete code defect remains in the reviewed scope.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- required_next_step: Obtain separate authorization for external model-profile transfer and each
  host lifecycle change, then complete both evidence obligations and rerun QA without inferring host
  parity from repository evidence.

## Reproduction

```bash
tmp="$(mktemp -d)"
node create-agdf/bin/create-agdf.js init --dir "$tmp" --json
node create-agdf/bin/create-agdf.js run-create --dir "$tmp" --run active-demo
node create-agdf/bin/create-agdf.js init --dir "$tmp" --json
```

Historical result before correction: exit `1`, `AGDF_CANONICAL_INIT_UNKNOWN_PATH: runs/active-demo`.
Final result: exit `0`, `outcome: unchanged`, `changes: []`, with byte-identical run state.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| `RAB-CR-01` | implementation_gap | CD+Tests | resolved | Strict valid-run preservation, final retained-run drift comparison, focused security matrix, independent re-review, public CLI reproduction and final full smoke pass. | none |
