# QA Gate

- decision: revise
- run_id: late-source-revision-20261005-01
- decision_owner: qa-gate, sole final Quality Readiness owner
- reviewer: Codex (cooperative QA, same implementing assistant)
- candidate: CANDIDATE_OPERATIONAL_FINAL.json
- candidate_digest: sha256:4dd0402573b30ad645be7c0d1fbd2f1a1df73e176b4b126c8ca09d24e9e383bb
- evidence: approved TP.md; BROWNFIELD_ANALYSIS.md; CD_TESTS.md; CODE_REVIEW.md; ARCHITECTURE_REVIEW.md; TASK_PLAN_REVIEW.md; DERIVATION_REVIEW.md; FINAL_SHARED_VERIFICATION.json; GENERATED_OPERATIONAL_FINAL_RECONCILIATION.json; PROTECTED_PATHS_OPERATIONAL_FINAL.json; PERFORMANCE.json; CONTEXT_GRAPH_RECONCILIATION.md
- missing_evidence: exact candidate Ubuntu Node22 repository, Windows Node22 runtime and Ubuntu Node24 runtime lanes required by TP and current agdf-guardrails matrix
- risks: unobserved OS/Node-specific filesystem, lock, installer/shim and runtime behavior; same author/reviewer assurance; optional installed native-model behavior unverified
- required_next_step: Obtain all three required CI observations bound to the exact final candidate and resubmit QA assessment
- impact_codes: no additional run-specific registry codes declared

## Quality Readiness

| dimension | evidence owner | outcome |
|---|---|---|
| Plan coverage | task-plan-review | revise: 9/10 tasks fully_done; T-008 required platform evidence incomplete |
| Solution integrity | clean-implementation-review | pass within reviewed source and observed local behavior |
| Code quality | code-review | pass within reviewed final actual capability diff; fixed findings resolved |
| QA decision | qa-gate (sole decision owner) | revise because required matrix evidence is missing |

The full unchanged shared plan passed all 20 stages on darwin-x64 Node22.22.3. Normal workspace
build and compatibility check passed. Every inventoried canonical source and generated package
byte matches the fully tested isolated candidate. Exact payload 200 files / 1686414 bytes,
no reserve, and protected derived updates match the final deliberate scoped decision.
This is strong local proof, not proof of required other OS/Node lanes or a GitHub green build.

All eleven acceptance criteria, eight SDD decisions, ten tasks and 29 scenarios were assessed
in Task Plan Review. AC-011 remains partial through T-008's platform qualification obligation.
Applicable UX rows are fulfilled by actual packaged en/de/fr-CA output and stdio MCP parity,
not key presence or code alone. Code Review CR-001/CR-002 are resolved with actual regression
outputs and the final full plan. TP Review TPR-001 is consumed unchanged below; it prevents pass.
The TP does not assign P0/P1 labels, so mandatory coverage is not downgraded by missing labels.

Source ownership, Brownfield fit, immutable proof history, scope attribution and approved source
bytes are preserved. Knowledge was curated into the existing Context Graph node without creating
a new SoT. The original design Run and its no-growth TP remain separate and unchanged.
No production source revision, native installed-host verification, independent human review,
VCS action, installation, UAT or release is implied by this report. Positive fixture approvals
are explicitly synthetic, deterministic replay observations are not fresh model execution.

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | TASK_PLAN_REVIEW.md: required .github/workflows/agdf-guardrails.yml Ubuntu22 repository / Windows22 runtime / Ubuntu24 runtime observations absent for final exact candidate | Obtain all three required CI observations bound to the exact final candidate before QA reassessment |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: CONTEXT_GRAPH_RECONCILIATION.md; existing late_source_revision_extension_2026_10_05
- memory_target: context_graph
- memory_reason: Reusable source-revision proof/recovery invariant and observed platform limits
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state

This revise report is not ready for Approval: QA. QA must be reassessed with the missing exact
candidate observations before any QA pass or QA approval request. The next step names an evidence
obligation; it does not authorize commit/push/workflow launch, which the approved TP excludes.
