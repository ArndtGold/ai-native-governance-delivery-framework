# QA Report: Lean Interaction Ownership and Local Validation

Status: pass
Gate: QA
Date: 2026-07-19
Decision owner: `qa-gate`
Gate approval: exact `Approval: QA` accepted on 2026-07-19 after selected-run, same-gate,
revision-20 and durable-report revalidation. The earlier revision-17 approval remains historical.

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | pass | 12/12 TP tasks remain `fully_done`; UAT revision maps to LIR-01/02/11/12 |
| Solution integrity | pass | one status data owner and one Markdown presentation owner; no skill/CLI template remains |
| Code quality | pass | actual-diff review corrected escaping, fail-closed output and compatibility findings |
| QA decision | pass | deterministic operational status behavior has direct focused and aggregate evidence |

## QA Gate

- decision: pass
- evidence: approved TP; UAT-revision Brownfield addendum; refreshed 12/12 TP Review; clean implementation and actual-diff Code Review pass; deterministic operational renderer and CLI parity fixtures; full `create-agdf` and `@agdf/cli` smoke; Runtime Integrity positive/negative; 27/27 deterministic skill evals; byte-identical builds; 218-file package; `git diff --check`.
- missing_evidence: installation of a future released package into the authenticated OpenCode host and native Windows execution remain UAT evidence, not repository QA proof.
- risks: unreleased installed agents do not expose `status_presentation`; source and generated package evidence must not be described as live-host proof.
- required_next_step: QA approval is accepted; review the refreshed UAT evidence.
- impact_codes: `AGDF_QA_OPERATIONAL_STATUS_PRESENTATION_PASS`; `AGDF_QA_AGENT_RECONSTRUCTION_REMOVED`

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

## UAT Revision Decision — Deterministic Operational Status Presentation — 2026-07-19

- decision: pass
- decisive_reason: operational status chat rendering is now code-owned, compact and fail-closed while
  the full audit JSON and the separate approval-time projection retain their existing roles.
- missing_evidence: released installed-host consumption remains UAT evidence and does not block
  repository QA.
- excluded_scope: the unrelated `README.md` documentation edit remains outside this QA revision.
- required_next_step: QA approval is accepted; review the refreshed UAT evidence.
