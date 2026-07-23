# QA Report: OpenCode Surface Hardening and Evaluator Parity

Status: revise
Gate: QA
Date: 2026-07-23

## Quality Readiness

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | revise | 9/10 tasks fully done; OHP-10 partial |
| Solution integrity | pass | Clean Implementation Review |
| Code quality | pass | Code Review |
| QA decision | revise | `qa-gate` is sole decision owner; authenticated live evaluator evidence is missing |

## QA Gate

- decision: revise
- evidence: Approved TP; Brownfield Analysis pass; deterministic tests and full smoke pass; source
  Runtime Integrity pass; Pages check/build pass; installed SDK/status probe and real OpenCode
  Primary-Agent preflight pass; zero repository mutation observed.
- missing_evidence: One authenticated, bounded OpenCode evaluator invocation that returns a
  contract-valid evaluation. The available host returned HTTP 401 `No provider available`.
- risks: Claiming live OpenCode `tool_enforced` availability from fixtures or preflight alone would
  violate the approved evidence boundary. The implementation already fails closed and does not make
  that claim.
- required_next_step: Configure an authenticated OpenCode provider and rerun the bounded live
  evaluator probe, then rerun `agdf:qa-gate`.
- impact_codes: none
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: No Context Graph or SoT ownership change is required.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | HTTP 401 prevented live contract-valid evaluator output | Configure an authenticated OpenCode provider and rerun the bounded evaluator probe |

