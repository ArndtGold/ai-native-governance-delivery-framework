# QA Gate: Run-Recovery

Run: `restore-unsealed-active-run-records-20260929-01`
Revision evaluated: `18578282-44d3-4fb3-8092-dc5d5d9b63aa`
Decision: `revise`
Decision owner: `qa-gate` (sole Quality Readiness decision owner)

## Quality Readiness Projection

| Dimension | Evidence outcome |
|---|---|
| Plan coverage | `revise` — TP Review has three open normalized findings; three TP tasks remain partial. |
| Solution integrity | `pass` — Clean Implementation Review confirms reuse of the shared writer and no parallel authority. |
| Code quality | `pass` — Code Review found no code defects in the reviewed diff. |
| QA decision | `revise` — open design and evidence obligations prevent QA pass. |

## QA Gate

- decision: `revise`
- evidence:
  - Approved TP and implementation evidence: `TP.md`, `CD_TESTS.md`.
  - Brownfield fit: `BROWNFIELD_ANALYSIS.md`; recovery uses canonical resolver, path guards, gate policy and shared locked writer.
  - Code quality: `CR.md` is `pass`, with no code findings.
  - Solution integrity: `CLEAN_IMPLEMENTATION_REVIEW.md` is `pass`; no parallel writer or approval authority.
  - Plan coverage and normalized findings: `TP_REVIEW.md`; six tasks fully done, three partially done.
  - Local verification passed on macOS: `test:run-recovery`, `test:control-state`, `test:run-lock`, `test:run-step-transaction`, `test:run-revision`, `test:cli-gates`, `test:lifecycle`, `test:package-build`, and `test:payload-budget`.
  - Read-only inventory covered 23 named production Runs; all were unsealed, 19 had resolvable artefact paths, and no production Run State or artefact was changed.
- missing_evidence:
  - Authoritative external source and validator for exact-bound historical Approval provenance; no positive-provenance fixture.
  - Injected filesystem failures across journal/write boundaries, especially before atomic rename.
  - Linux and native Windows execution of the approved suites.
  - Four production runs need their listed artefact paths repaired or explicitly routed before preview.
- risks:
  - The recovery safely resets unproven approvals, but no old approval can currently be positively preserved.
  - Cross-platform locking, rename and filesystem behavior is unverified.
  - Post-implementation `doctor --all-active --json` still reports 86 aggregate findings (23 block, 1 revise, 62 warn); this run does not claim to fix them.
- required_next_step: Resolve `TPR-APPROVAL-SOURCE` through its SD route; complete the fault-injection and Linux/native Windows evidence obligations for `TPR-TRANSACTION-FAULTS` and `TPR-PLATFORM`; then repeat Task Plan Review and QA.
- impact_codes: `design_gap`, `evidence_gap`

## Normalized Review Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-APPROVAL-SOURCE | design_gap | SD | open | `TP_REVIEW.md`: no accepted external evidence source or verifier for positive exact-bound Approval preservation. | Define the authoritative evidence source and exact trust binding before implementing approval preservation. |
| TPR-TRANSACTION-FAULTS | evidence_gap | evidence_obligation | open | `TP_REVIEW.md`: current tests cover lock refusal, unknown phase and post-rename resume, but not injected filesystem failures across transaction boundaries. | Add and run injected filesystem fault tests across journal/write boundaries, proving no duplicate revision and unchanged non-selected bytes. |
| TPR-PLATFORM | evidence_gap | evidence_obligation | open | `TP_REVIEW.md`: Linux and native Windows suites were not run; Docker was unavailable and no Windows host was present. | Run the approved recovery suites on Linux and native Windows and attach their results. |

## Context Graph Impact

- Situation: The recovery implementation adds a bounded repair path for canonical unsealed run records.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Updated the existing node with implementation boundaries, passing local fixture evidence, and outstanding provenance, fault-injection, platform and production-path limits. No production Run State was applied.
