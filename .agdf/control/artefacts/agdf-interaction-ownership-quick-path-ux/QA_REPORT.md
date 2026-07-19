# QA Report: Lean Interaction Ownership and Local Validation

Status: pass
Gate: QA
Date: 2026-07-19
Decision owner: `qa-gate`
Gate approval: exact `Approval: QA` accepted on 2026-07-19 after selected-run, same-gate,
revision and durable-report revalidation.

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | pass | 12/12 TP tasks `fully_done` |
| Solution integrity | pass | release-built runtime distribution is UAT-approved and the QA revision preserves one installer/validator owner |
| Code quality | pass | actual-diff review has no remaining finding after preflight/status corrections |
| QA decision | pass | all superseded evidence is replaced and the three reproduced OpenCode findings have direct regressions |

## QA Gate

- decision: pass
- evidence: approved TP; refreshed Brownfield Analysis; 12/12 TP Review; clean implementation and Code Review pass; UAT-approved release-built distribution; full `create-agdf` and `@agdf/cli` smoke; Runtime Integrity positive/negative; 27/27 deterministic skill evals; byte-identical builds; 218-file package; warning-free OpenCode wrapper fixture; missing/default/explicit permission fixtures; ownership collision fixture; `git diff --check`.
- missing_evidence: installation of a future released package into the authenticated OpenCode host and native Windows execution remain UAT evidence, not repository QA proof.
- risks: OpenCode config schema and Node module resolution may evolve; canonical metadata, status validation, ownership preflight and empty-stderr regression evidence fail closed around current behavior.
- required_next_step: QA approval is accepted; review the prepared UAT evidence for the refreshed global OpenCode installation scope.
- impact_codes: `AGDF_QA_OPENCODE_INSTALLER_REVISION_PASS`; `AGDF_QA_SUPERSEDED_ARCHITECTURE_RESOLVED`

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
