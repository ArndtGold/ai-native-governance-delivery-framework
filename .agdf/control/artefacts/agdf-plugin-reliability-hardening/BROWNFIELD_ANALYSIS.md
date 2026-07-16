# Brownfield Analysis: Dual-Layout Runtime-Integrity Implementation

Status: pass
Mode: pre_implementation_analysis
Date: 2026-07-16
Owner: agent
Approved TP: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/TP.md`

## Decision

- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: Brownfield Analysis satisfied; proceed to CD+Tests
- scope: AIRH-01 through AIRH-07 only
- evidence: approved UR/PRD/SD/TP; current source checker; current negative fixture owner;
  package smoke chain; clean implementation baseline outside this run's control artefacts
- missing_evidence: none before implementation

## Existing Owners And Reuse

- current_coverage: partially_done
- reuse_strategy: refactor
- primary_owner: `plugin/scripts/check-runtime-integrity.mjs`
- focused_test_owner: new `create-agdf/scripts/runtime-integrity-layout-test.js`
- aggregate_test_owner: `create-agdf/package.json`
- documentation_owner: `INSTALL.md` only if the environment override needs a maintainer-facing note

The existing checker remains the sole validator. Its assertion helpers, canonical definition parsing,
common invariant messages and negative source fixtures are reused. The implementation adds only a
layout-resolution boundary and conditional source-only validation; it does not fork or rewrite the
invariant catalogue.

## Minimal Clean Path

1. Resolve `{ mode, repoRoot, pluginRoot }` before constructing layout-dependent paths.
2. Keep every plugin-owned path rooted at `pluginRoot`.
3. Construct and assert repository-only paths only when `mode === "source"`.
4. Guard directory traversal after layout classification.
5. Stage the canonical plugin dynamically in a focused temporary-directory regression test.
6. Wire that test into the existing smoke chain and run the approved validation bundle.

## Regression And Compatibility Impact

- source behavior: must retain all existing checks and negative fixtures
- installed behavior: becomes newly supported without requiring repository-only files
- CLI/gates/persistence: no change
- release behavior: stronger evidence through the existing aggregate smoke invocation
- migrations: none
- side effects: read-only production path; temporary test directories only

## Parallel-Structure And Drift Check

- parallel_structure_risk: controlled; one canonical script remains authoritative
- source_of_truth_drift: none observed
- runtime_product_semantics_drift: none; this restores the already-stated diagnostic capability
- implementation_boundary: production/test paths listed in the approved TP plus this run's control
  artefacts

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: `CG-AGDF-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: link
- context_graph_gate_effect: warning until QA determines whether the installed-artifact invariant is
  reusable enough for a graph update

## Required Next Step

Implement AIRH-01 through AIRH-07, record CD+Tests evidence, then run the mandatory reviews before
QA. Escalate if any production path outside the approved boundary becomes necessary.
