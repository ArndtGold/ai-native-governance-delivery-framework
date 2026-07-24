# QA Report: Community Health

Status: revise
Gate: QA
Gate approval: not_requested
Date: 2026-07-23
Decision owner: qa-gate

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise | 18/20 tasks fully done; only T17 and post-delivery T20 remain |
| Solution integrity | pass | Clean primary ownership model, no parallel policy/CLI/runtime structure |
| Code quality | pass | No Code Review finding; focused tests and reviewed safety boundaries pass |
| QA decision | revise | Open TPR-001 and TPR-002 evidence obligations prevent pass |

`qa-gate` is the sole decision owner. The unrelated regression blockers are resolved and the full smoke is green. The next permissible action is authenticated GitHub sign-in followed by T17 settings preflight/mutation/read-back; UAT remains forbidden.

## QA Gate

- decision: `revise`
- evidence:
  - approved UR, PRD, SD and TP;
  - passing pre-implementation Brownfield Analysis;
  - `CD_TEST_EVIDENCE.md`;
  - `CLEAN_IMPLEMENTATION_REVIEW.md`: pass;
  - `CODE_REVIEW.md`: pass;
  - `TASK_PLAN_REVIEW.md`: revise, 18/20 fully done;
  - focused community contracts and fourteen negative fixtures;
  - Runtime Integrity, package, CLI, Pages, Delivery Path Search, OpenCode and direct smoke/routing evidence.
- missing_evidence:
  - GitHub metadata/PVR/social-preview mutation and read-back;
  - default-branch Community Profile, Issue Form, PR template, CODEOWNERS and public-link recognition.
- risks:
  - host-visible behavior remains unproven;
  - the available browser lacks GitHub authentication, while the authenticated connector has no repository-settings mutation capability;
  - default-branch recognition cannot be proven without a later authorized delivery.
- required_next_step: Sign in to GitHub in the in-app browser, execute T17 with exact read-back, then rerun QA.
- impact_codes: none

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | Full regression now passes; host settings remain unchanged because the available browser is not authenticated | Sign in to GitHub in the in-app browser, then perform T17 settings changes and read-back |
| TPR-002 | evidence_gap | evidence_obligation | open | GH-04–GH-08 require authorized default-branch delivery | After later QA/UAT and VCS authorization, deliver and collect post-delivery observations |

QA does not reclassify either finding.

## Context Graph

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `create`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node records canonical public-policy owners, desired/effective host-state separation, security fallback, sole-maintainer authority and post-delivery exit criteria.

## UX Intent Decision

All repository-owned policy and routing modes have implemented, testable paths. Host-visible rows remain `partial` or `not_verifiable` exactly as recorded in `TASK_PLAN_REVIEW.md`; therefore QA pass is forbidden.
