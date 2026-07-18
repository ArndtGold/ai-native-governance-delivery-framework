# QA Report: Lean Interaction Ownership and Local Validation

Status: revise
Gate: QA
Date: 2026-07-18
Decision owner: `qa-gate`

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | pass | 12/12 TP tasks `fully_done` |
| Solution integrity | revise | the source-runtime packaging assumption is superseded by the approved release-built distribution UR |
| Code quality | pass | actual-diff review has no meaningful open finding |
| QA decision | revise | runtime/package/installer evidence must be regenerated under `automatic-version-asset-sync` |

## QA Gate

- decision: revise
- evidence: approved TP; passing Brownfield Analysis; `CD_TESTS.md`; 12/12 TP Review; clean implementation pass; Code Review pass; aggregate create-agdf smoke; Runtime Integrity; 27/27 deterministic skill evals; local full-plugin and OpenCode wrapper execution.
- missing_evidence: release-built package layout, durable Codex/Claude marketplace migration and offline installed-runtime evidence required by the approved follow-up UR; direct authenticated host UAT remains later evidence.
- risks: host schemas can drift and Windows-native execution was not observed; exact-text fallback, path-safe argument vectors, deterministic fixtures and fail-closed availability mitigate repository risk.
- required_next_step: complete `automatic-version-asset-sync` through implementation and reviews, then rerun the affected runtime/package/installer QA evidence before requesting QA approval.
- impact_codes: `AGDF_QA_SUPERSEDED_ARCHITECTURE`

## Revision Addendum — 2026-07-18

The interaction ownership, Compact Delivery and OpenCode boundary evidence remains valid. Only the
Codex/Claude source-bundled runtime architecture and its dependent packaging/installer evidence is
superseded. No exact `Approval: QA` had been provided before this revision.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: reconciled
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: all three nodes were updated with the implemented ownership, Compact Delivery and local-validator decisions.
