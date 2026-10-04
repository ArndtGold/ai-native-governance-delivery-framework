# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-intermediate-status-card-reduction-20261002-01
- lifecycle: active
- revision: 22
- revision_id: bab6c8c2-6b4f-4cb0-9d51-c8b185ef01e7
- content_seal: sha256:accd81a7db7551cd675d72a3477071e64a2f61c40b3807d860e768ac3af03cee
- approval_seal: sha256:d7cd16fea822b45440c914db298bc9a56cd0f329ef24e0e6b26e5f769daca804
- updated_at: 2026-10-03T14:21:27.474Z
- mode: structured_delivery
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA artefact and reviewed source binding recorded together. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report. |
| What is explicitly forbidden right now? | request QA approval; request UAT approval; release; claim delivery readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` sha256:6a8256dc7008418a · presentation 64424942-d080-486f-a42f-63916aaaa071 sha256:86b144d38e2a3947af97db9192086eb17181b2d0c752a2d08289ec4f592aeab3 |
| PRD | approved | `Approval: PRD` · 2026-10-02 · revision 10 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` sha256:7fb12689ba373280 · presentation 8565db75-00f0-4cb0-b7e6-7341c237d66e sha256:9a242c49a41ab1d771944e6258569f049a65887389ca5ca4fd692d03ff8b2733 |
| SD | approved | `Approval: SD` · 2026-10-03 · revision 13 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` sha256:8cf5bba39274d39a · presentation faced45f-3855-4f23-9370-c9197e1a9a80 sha256:e6e7605b5736a02ca42c8b3a8c77cbd4419b5c50f1401cf432488022340b50fa |
| TP | approved | `Approval: TP` · 2026-10-03 · revision 15 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` sha256:14ee4988b4e42ab4 · presentation f23c19e0-bbf8-4f3a-a185-520a357effd8 sha256:d9d13607bda246cc8620ec5abc2728d9574c7cd6208b0cc774cb0ebece704b63 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` | approved | Derived from approved UR and completed Brownfield/UX analysis; criteria-chain-v1 |
| SD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` | approved | Derived from approved PRD Revision 2; criteria-chain-v1; SDD-001 through SDD-006 |
| TP | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` | approved | criteria-chain-v1; T-001 through T-006 and SCN-001 through SCN-025; baseline prerequisite before production edits |
| Brownfield Analysis | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_ANALYSIS.md | done | pre_implementation_analysis; reuse/owners/regression path verified; TP T-001 positive baseline remains required before production edits |
| CD+Tests | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/IMPLEMENTATION_EVIDENCE.md | done | Source implementation and scoped tests pass; actual Codex comparison remains an open T-006 evidence obligation, no QA pass |
| CR |  | done | Code Review pass |
| QA | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/QA_REPORT.md | revise | Reviewed source binding recorded atomically |
| TP Review | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP_REVIEW.md | revise | T-006 partially_done: actual Codex paired observation missing; HOST-001 evidence_gap; prevents QA pass |
| Clean Implementation Review | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/CLEAN_IMPLEMENTATION_REVIEW.md | pass | Canonical owners retained; no duplicate policy, cache, gate or approval owner |
| Binding proof 657d2369-b325-4e89-8e22-b2d65a668a7f | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/evidence/qa-reviewed-mapping.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: normative interaction/output policy changes; structured_slice rejected because the full-depth policy trigger applies; Quick Task and Verified Change ineligible
- evidence: .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-02 · revision 3 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` sha256:6a8256dc7008418a · presentation 64424942-d080-486f-a42f-63916aaaa071 sha256:86b144d38e2a3947af97db9192086eb17181b2d0c752a2d08289ec4f592aeab3 |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/RELATIONSHIP_EVIDENCE.md`: exact current source/destination digests, preparation binding and reviewed intent mapping; Revision 2 remains draft |
| SD | derived_from | PRD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/SD.md` sections 2–7 map every approved PRD criterion exactly once to owners and SDD decisions; source PRD Revision 2 sha256:7fb12689ba373280448c5826458e12d0d967d7eeb98fb4a4cfd595ac0c76d3d0; this design remains draft |
| TP | derived_from | SD | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/TP.md` Task List and Verification Traceability map all nine PRD criteria and six approved SD decisions to tasks/scenarios/evidence; source SD sha256:8cf5bba39274d39a833d3676e3317eea223ac44b1c4d3602c84a44fd0d4e506a; plan remains draft |
| QA_REPORT | tests | TP | binding 657d2369-b325-4e89-8e22-b2d65a668a7f; reviewed by Codex qa-gate review in current implementation session; .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/evidence/qa-reviewed-mapping.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Superseded PRD approval | `Approval: PRD` · 2026-10-02 · revision 7 · `.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/PRD.md` sha256:fb805a3915959337 · presentation 35bf6abf-9bc7-4d21-9fcf-ff9d9d376b42 sha256:ac49ed802493ad81b17e861e3f46486c5ceaa1a17cd7280d74f5ab3b06571217 | Prior PRD revision only; renewed Approval: PRD required | direct |
| Implementation-preparation Brownfield Analysis | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BROWNFIELD_ANALYSIS.md | Existing owners, reuse, compatibility and regression/test path; baseline prerequisite retained | direct |
| T-001 positive source baseline | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/BASELINE.md | Frozen W-01: one redundant card, 754 characters, unchanged permission/control; actual host lane remains open | direct source emission |
| Code Review | code-review | decision pass: .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/CODE_REVIEW.md | direct |
| Artefact source binding | .agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/evidence/qa-reviewed-mapping.json | QA_REPORT tests TP; binding 657d2369-b325-4e89-8e22-b2d65a668a7f; operation 0f58e6ea-3494-4cad-9df8-74b9fed1e104; 2e9f0456-2e95-4630-aefc-10346c45aae7 -> bab6c8c2-6b4f-4cb0-9d51-c8b185ef01e7 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 657d2369-b325-4e89-8e22-b2d65a668a7f | sha256:d6e85fc0c9ecc8a7557d537a9b81db3a510cf7a4b95735e8719679b2745211e8 | eyJiaW5kaW5nX2lkIjoiNjU3ZDIzNjktYjMyNS00ZTg5LThlMjItYjJkNjVhNjY4YTdmIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjdiYzg4MjljMDBmMzI2NmZjNWY5OTdkYTVhYTE0ZTMyOTU2ZjM5MWRhYjFkMGY0MGY5YTM2Y2NlNWNhZWU4NjIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1pbnRlcm1lZGlhdGUtc3RhdHVzLWNhcmQtcmVkdWN0aW9uLTIwMjYxMDAyLTAxL1FBX1JFUE9SVC5tZCIsInN0YXR1cyI6InJldmlzZSIsInR5cGUiOiJRQV9SRVBPUlQifSwib3BlcmF0aW9uIjp7ImlkIjoiMGY1OGU2ZWEtMzQ5NC00Y2FkLTlkZjgtNzRiOWZlZDFlMTA0IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiIyZTlmMDQ1Ni0yZTk1LTQ2MzAtYWVmYy0xMDM0NmM0NWFhZTciLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJiYWI2YzhjMi02YjRmLTRjYjAtOWQ1MS1jOGIxODVlZjAxZTciLCJyZXZpc2lvbiI6MjJ9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJRQV9SRVBPUlQiLCJyZWxhdGlvbnNoaXAiOiJ0ZXN0cyIsInRvIjoiVFAifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoyMGRhOGIyMTIwN2U2YWFlNWMzZDg5NmQ1MTY1NTlhZmExYjJkMGU4MmQ3MDkzYjlmZWQzODFkZjQ4NjFiMTkxIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2FnZGYtaW50ZXJtZWRpYXRlLXN0YXR1cy1jYXJkLXJlZHVjdGlvbi0yMDI2MTAwMi0wMS9ldmlkZW5jZS9xYS1yZXZpZXdlZC1tYXBwaW5nLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IHFhLWdhdGUgcmV2aWV3IGluIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gc2Vzc2lvbiJ9LCJydW5faWQiOiJhZ2RmLWludGVybWVkaWF0ZS1zdGF0dXMtY2FyZC1yZWR1Y3Rpb24tMjAyNjEwMDItMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjE0ZWU0OTg4YjRlNDJhYjQyODNiZDZjNzEzMWYwNmU2MWRlYzk0YzM0NTk1NzNkZDQzYzNjODRkMzk4NjcwMmUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvYWdkZi1pbnRlcm1lZGlhdGUtc3RhdHVzLWNhcmQtcmVkdWN0aW9uLTIwMjYxMDAyLTAxL1RQLm1kIiwidHlwZSI6IlRQIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
