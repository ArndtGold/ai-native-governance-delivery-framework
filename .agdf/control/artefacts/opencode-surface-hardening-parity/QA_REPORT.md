# QA Report: OpenCode Surface Hardening and Evaluator Parity

Status: revise
Gate: QA
Revision: 2
Date: 2026-07-23

## Quality Readiness

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | revise | 10/11 tasks fully done; only OHP-10 live evidence is partial |
| Solution integrity | pass | Clean Implementation Review |
| Code quality | pass | Code Review |
| QA decision | revise | `qa-gate` is sole decision owner; authenticated live evaluator evidence is missing |

## QA Gate

- decision: revise
- evidence: Approved TP; Brownfield Analysis pass; deterministic tests and full smoke pass; source
  Runtime Integrity pass; package checks pass; installed host/SDK status is matching at 1.18.3;
  OHP-11 alignment/no-op/failure/lifecycle matrix passes; real OpenCode Primary-Agent preflight and
  zero repository mutation evidence remain valid.
- missing_evidence: One authenticated, bounded OpenCode evaluator invocation that returns a
  contract-valid evaluation. The available host returned HTTP 401 `No provider available`.
- risks: Claiming live OpenCode `tool_enforced` availability from fixtures or preflight alone would
  violate the approved evidence boundary. The implementation already fails closed and does not make
  that claim.
- required_next_step: Configure an authenticated OpenCode provider and rerun the bounded live
  evaluator probe, then rerun `agdf:qa-gate`.
- impact_codes: none
- context_graph_impact: update_existing_node
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing Delivery Path Search node now records OpenCode's conditional
  enforcement invariant and the still-unproven live tool-enforced claim.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | HTTP 401 prevented live contract-valid evaluator output | Configure an authenticated OpenCode provider and rerun the bounded evaluator probe |
