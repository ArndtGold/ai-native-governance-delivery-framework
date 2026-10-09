# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cockpit-active-backlog-core-ui-20261008-01
- lifecycle: active
- revision: 22
- revision_id: 4731876d-0586-4607-ab84-073e4f0244c8
- content_seal: sha256:fc577bb163f84a9d1bb41a521319b9d6ab66385c75496a1824161e23968d64c6
- approval_seal: sha256:5190d7e06db155a586f18bc8f5b1b6b374123cc5a2ecdb0bf0c24c1e60083db4
- updated_at: 2026-10-08T16:38:41.109Z
- mode: structured_slice
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Provide one authoritative Core list policy and a readable read-only Cockpit list: active compact preview, newest stored row first, stable source-field search, clear completeness and exact Run navigation.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Code Review decision `pass`. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report. |
| What is explicitly forbidden right now? | request QA approval; request UAT approval; release; claim delivery readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-08 · revision 3 · `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UR.md` sha256:c410e0ef3ed2f73c · presentation 34c2ba96-73b9-4534-8ec8-ad885abbca1a sha256:90a28299ef27c3bfa621422fa0202e76e304c35d913f295b29416eccd7fed769 |
| PRD | approved | `Approval: PRD` · 2026-10-08 · revision 8 · `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/PRD.md` sha256:6429b4510339c81a · presentation f3549e9d-8032-4cfa-b537-e6eb0fb82a3e sha256:38ae70648aae60ecd8fbf83645fdf0ecef4026425d042550ae069b14025a0c20 |
| SD | approved | `Approval: SD` · 2026-10-08 · revision 10 · `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/SD.md` sha256:9317a3741998af99 · presentation 69624f58-c633-4755-8a0b-97956c2109d7 sha256:d3149d07e731c35baa4c6ccb11e1155acd59b408db11bae674c757811a0eb37f |
| TP | approved | `Approval: TP` · 2026-10-08 · revision 12 · `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP.md` sha256:b3cd38526653d1fc · presentation c5cc67c7-df7b-470c-87db-fd256453804b sha256:7f0122d9913dce57d147a3136fa8073c883eff4be51965585ba89f40ea7c93f1 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_ANALYSIS.md | done | Pre-implementation analysis pass; exact approved TP and clean code baseline |
| CD+Tests | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/CD_TESTS_RESPONSIVE-03.md | done | Three-entry preview and responsive expanded scrolling qualified; native T-007 remains partial |
| CR |  | done | Code Review pass |
| QA | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_REPORT.md | revise | Current responsive evidence and sole-owner revise decision: QA_RESPONSIVE_ADDENDUM-03.md |
| Binding proof 61615dea-f36b-4bcc-88a9-5d5f9efadfea | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/PRD_SOURCE_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 1b5fe111-560f-4d4f-b2d1-67443e978a3c | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/SD_SOURCE_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 57e42785-59ca-4266-ab0e-825bcf224caf | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP_SOURCE_REVIEW-01.json | done | Subordinate reviewed mapping evidence |
| TP Review | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP_REVIEW_RESPONSIVE-03.md | revise | 7/8 tasks fully done; fresh new-build native evidence remains open |
| Clean Implementation Review | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/CLEAN_IMPLEMENTATION_REVIEW_RESPONSIVE-03.md | done | Existing Core/App owners; CSS layout and bounded scroll viewport; no parallel state |
| Binding proof 6383868c-9c90-4759-bea9-8efab2e26218 | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_SOURCE_REVIEW-01.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: one reversible read-only cockpit selection/search outcome; compact paths fail product/ownership conditions; no full-depth trigger, so structured_delivery is rejected.
- evidence: .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_REVIEW.md#structured-depth-evidence

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-08 · revision 3 · `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UR.md` sha256:c410e0ef3ed2f73c · presentation 34c2ba96-73b9-4534-8ec8-ad885abbca1a sha256:90a28299ef27c3bfa621422fa0202e76e304c35d913f295b29416eccd7fed769 |
| PRD | derived_from | UR | binding 61615dea-f36b-4bcc-88a9-5d5f9efadfea; reviewed by Codex; .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/PRD_SOURCE_REVIEW-01.json |
| SD | derived_from | PRD | binding 1b5fe111-560f-4d4f-b2d1-67443e978a3c; reviewed by Codex; .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/SD_SOURCE_REVIEW-01.json |
| TP | derived_from | SD | binding 57e42785-59ca-4266-ab0e-825bcf224caf; reviewed by Codex; .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP_SOURCE_REVIEW-01.json |
| QA_REPORT | tests | TP | binding 6383868c-9c90-4759-bea9-8efab2e26218; reviewed by Codex; .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_SOURCE_REVIEW-01.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| Required UX Intent Definition is ready; Brownfield routing result updated without changing approved UR or scope. | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UX_INTENT_DEFINITION.md | Primary intent, working modes, authority, activation, blockers, recovery and proposed PRD criteria | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/PRD_SOURCE_REVIEW-01.json | PRD derived_from UR; binding 61615dea-f36b-4bcc-88a9-5d5f9efadfea; operation 16692446-ec02-409d-95f4-b84403a870ff; 00a85fb8-37b5-4a20-addd-282c5e0982db -> ceb266f5-678f-43af-8e76-2d38b0311958 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/SD_SOURCE_REVIEW-01.json | SD derived_from PRD; binding 1b5fe111-560f-4d4f-b2d1-67443e978a3c; operation 6cd959e8-e97b-4787-95ea-db7c6775a2de; 2b5c7867-39e7-4d72-9ca4-2986eb400e55 -> 417d327b-750f-41ad-bb12-02e0647bf3f2 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/TP_SOURCE_REVIEW-01.json | TP derived_from SD; binding 57e42785-59ca-4266-ab0e-825bcf224caf; operation 8c51ddf5-7d96-4cde-8648-27ce26b26649; 33d9838e-6107-4c19-9925-86b566196796 -> bdefd432-23c9-419c-9e69-78355225fa0f | reviewed cooperative mapping |
| Implementation preparation | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_ANALYSIS.md | T-001; source digest and baseline checks | direct |
| Cockpit core | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_CORE.md | Approved TP scenario evidence and actual command results | direct with declared limits |
| Cockpit ui | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_UI.md | Approved TP scenario evidence and actual command results | direct with declared limits |
| Cockpit build | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_BUILD.md | Approved TP scenario evidence and actual command results | direct with declared limits |
| Cockpit regression | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_REGRESSION.md | Approved TP scenario evidence and actual command results | direct with declared limits |
| Cockpit rendered | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_RENDERED.md | Approved TP scenario evidence and actual command results | direct with declared limits |
| Cockpit native | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_NATIVE.md | Open T-007 SCN-010/014/024 obligation | direct with declared limits |
| Final verification | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/CD_TESTS.md | 63 Core, 7 service, 129 component, 20 browser cases pass; final builds and matching stdio protocol suites pass; CR-001 focus collision resolved | direct with native limit |
| Code Review | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/CR.md | decision pass: Reviewed actual Core/UI diff; CR-001 focus collision resolved, final tests pass; native TPR-001 remains open for QA | direct |
| Artefact source binding | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_SOURCE_REVIEW-01.json | QA_REPORT tests TP; binding 6383868c-9c90-4759-bea9-8efab2e26218; operation dc6892da-0fec-4f8d-9b4f-4d3f64d1d20d; 4dacd11f-dac6-4e7d-b116-f47f531e4d5c -> 7b0525f4-4806-4a0b-8c95-b3d3b54f99ea | reviewed cooperative mapping |
| Fresh native module/style match; expanded journeys and two 3831-file no-write windows pass; user reports inline preview/search pass; compact capture/expansion and full served HTML identity remain open; QA revise | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_NATIVE_ADDENDUM-02.md | T-007; SCN-010/014/024 partial; EVIDENCE_NATIVE_RESTART-02.md and raw evidence/ | direct |
| Responsive cockpit follow-up | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/EVIDENCE_RESPONSIVE-03.md | 130 component, 7 service, 20 browser cases; final builds and both protocol suites pass for new resource; local connection configured, native reconnect unverified | direct with native limit |
| Responsive QA update | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/QA_RESPONSIVE_ADDENDUM-03.md | qa-gate decision revise; TPR-001 remains open for the replacement resource | direct |
| Code Review | .agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/CR_RESPONSIVE-03.md | decision pass: Reviewed responsive three-entry/scroll layout; 130 component, 7 service, 20 browser cases and final protocol qualification pass; CR-002 corrected; native TPR-001 open | direct |

## Closeout

- next_allowed_action: Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do not request Approval: QA from a revise report.
- quality_outlook: Plan coverage revise (7/8 tasks; T-007 open); solution integrity pass; code quality pass; QA revise (sole owner qa-gate). Native observations from the old resource are not transferred to the new build.

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 61615dea-f36b-4bcc-88a9-5d5f9efadfea | sha256:f3e0a541901ff1f53b1b3f9aef4f70bd78c4f4eb398e8f21736c8dcc3965e87f | eyJiaW5kaW5nX2lkIjoiNjE2MTVkZWEtZjM2Yi00YmNjLTg4YTktNWQ1ZjllZmFkZmVhIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY0MjliNDUxMDMzOWM4MWE5MDAxOTQyNTgzMTdmYTk5YWQ1MWEyMTI4N2Y5YWJkNmVjYzZjZTlhZDBlOWMzNjIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1BSRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlBSRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIxNjY5MjQ0Ni1lYzAyLTQwOWQtOTVmNC1iODQ0MDNhODcwZmYiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjAwYTg1ZmI4LTM3YjUtNGEyMC1hZGRkLTI4MmM1ZTA5ODJkYiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImNlYjI2NmY1LTY3OGYtNDNhZi04ZTc2LTJkMzhiMDMxMTk1OCIsInJldmlzaW9uIjo4fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjdlOGQzMTkzYTliMDhkZmYzYzk2NGViNmZkMTBiMzFlNzg1ZmQxOWUxY2NmYTJlYmMzNTk2NTQ3OTJhN2VmN2QiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1BSRF9TT1VSQ0VfUkVWSUVXLTAxLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4In0sInJ1bl9pZCI6ImNvY2twaXQtYWN0aXZlLWJhY2tsb2ctY29yZS11aS0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YzQxMGUwZWYzZWQyZjczY2JiYzRjMDM3NTAyMWNkNjkyZjdhZjRmOTBmZDI4NjU3MDg0MzAxZGQ1NDkwODBiMSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWFjdGl2ZS1iYWNrbG9nLWNvcmUtdWktMjAyNjEwMDgtMDEvVVIubWQiLCJ0eXBlIjoiVVIifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 1b5fe111-560f-4d4f-b2d1-67443e978a3c | sha256:50c750c8e0f0dcbad4380c6d9260c815b12230d58a7184a43c378c3032bdeddc | eyJiaW5kaW5nX2lkIjoiMWI1ZmUxMTEtNTYwZi00ZDRmLWIyZDEtNjc0NDNlOTc4YTNjIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjkzMTdhMzc0MTk5OGFmOTk2MWQ0MDcxMWQwNDY3ZDAyYjFmOWI2YzJkNzgzOGI3YTMyZmFkMGEwMTFjZWE1MjkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1NELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiU0QifSwib3BlcmF0aW9uIjp7ImlkIjoiNmNkOTU5ZTgtZTk3Yi00Nzg3LTk1ZWEtZGI3YzY3NzVhMmRlIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiIyYjVjNzg2Ny0zOWU3LTRkNzItOWNhNC0yOTg2ZWI0MDBlNTUiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI0MTdkMzI3Yi03NTBmLTQxYWQtYmIxMi0wMmUwNjQ3YmYzZjIiLCJyZXZpc2lvbiI6MTB9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJTRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiUFJEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6MWM4ODJhZTA5N2Y4YWVlODEzNDFjNmJmOWIyNGQwZTVmZTYwYjJiZGY3Y2U4Mzg5YzA5NzZjZmUwMzA3NTA0MSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWFjdGl2ZS1iYWNrbG9nLWNvcmUtdWktMjAyNjEwMDgtMDEvU0RfU09VUkNFX1JFVklFVy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCJ9LCJydW5faWQiOiJjb2NrcGl0LWFjdGl2ZS1iYWNrbG9nLWNvcmUtdWktMjAyNjEwMDgtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjY0MjliNDUxMDMzOWM4MWE5MDAxOTQyNTgzMTdmYTk5YWQ1MWEyMTI4N2Y5YWJkNmVjYzZjZTlhZDBlOWMzNjIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1BSRC5tZCIsInR5cGUiOiJQUkQifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 57e42785-59ca-4266-ab0e-825bcf224caf | sha256:4a68047767b7569e5bdcfa5c56d7300c57ff63fcc4553561352b84b9474ebbc0 | eyJiaW5kaW5nX2lkIjoiNTdlNDI3ODUtNTljYS00MjY2LWFiMGUtODI1YmNmMjI0Y2FmIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIzY2QzODUyNjY1M2QxZmNiNGQwNTZmOWRhMTdkZDgzMjcxMTQwZWYzNzE3ZjVkNDM4YTYyMmQxMDJmOTFiODciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1RQLm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiVFAifSwib3BlcmF0aW9uIjp7ImlkIjoiOGM1MWRkZjUtN2Q5Ni00Y2RlLTg2NDgtMjdjZTI2YjI2NjQ5IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiIzM2Q5ODM4ZS02MTA3LTRjMTktOTkyNS04NmI1NjYxOTY3OTYiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiJiZGVmZDQzMi0yM2M5LTQxOWMtOWU2OS03ODM1NTIyNWZhMGYiLCJyZXZpc2lvbiI6MTJ9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJUUCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiU0QifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjpjNTk0ZTFmMDFiOTY1N2QzYzBhN2E0NGU0MTcxNmIwNDhjYjY4NzhmNTM0N2M5NTI2NDMzNGFmOWU0NjU1ZDI2IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2NvY2twaXQtYWN0aXZlLWJhY2tsb2ctY29yZS11aS0yMDI2MTAwOC0wMS9UUF9TT1VSQ0VfUkVWSUVXLTAxLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4In0sInJ1bl9pZCI6ImNvY2twaXQtYWN0aXZlLWJhY2tsb2ctY29yZS11aS0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6OTMxN2EzNzQxOTk4YWY5OTYxZDQwNzExZDA0NjdkMDJiMWY5YjZjMmQ3ODM4YjdhMzJmYWQwYTAxMWNlYTUyOSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWFjdGl2ZS1iYWNrbG9nLWNvcmUtdWktMjAyNjEwMDgtMDEvU0QubWQiLCJ0eXBlIjoiU0QifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 6383868c-9c90-4759-bea9-8efab2e26218 | sha256:a12186fe3d26800e73b4a26bb0dae68cbec3be59137a6a11b3350ffd1374e3e5 | eyJiaW5kaW5nX2lkIjoiNjM4Mzg2OGMtOWM5MC00NzU5LWJlYTktOGVmYWIyZTI2MjE4IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmFhY2U1ZTc5M2Y2YjU5MmZjMmM3NGM4NjhiYzk2MWU1M2Y0YWFjNmE4ZGE1ZDE5MWZiYmQ0MDBiN2FmNDQ2ODgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvY29ja3BpdC1hY3RpdmUtYmFja2xvZy1jb3JlLXVpLTIwMjYxMDA4LTAxL1FBX1JFUE9SVC5tZCIsInN0YXR1cyI6InJldmlzZSIsInR5cGUiOiJRQV9SRVBPUlQifSwib3BlcmF0aW9uIjp7ImlkIjoiZGM2ODkyZGEtMGZlYy00ZjhkLTliNGYtNGQzZjY0ZDFkMjBkIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI0ZGFjZDExZi1kYWM2LTRlN2QtYjExNi1mNDdmNTMxZTRkNWMiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI3YjA1MjVmNC00ODA2LTRhMGItOGM5NS1iM2QzYjU0Zjk5ZWEiLCJyZXZpc2lvbiI6MTh9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJRQV9SRVBPUlQiLCJyZWxhdGlvbnNoaXAiOiJ0ZXN0cyIsInRvIjoiVFAifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoyOWE0NTBjYWUzMTA0YjdlOGUzMTk1NTY4NzFlZGM0NjdkMzg2OTBlOGYwNTE2NDYwMGFlNzU0MGE4ZWIzNzY4IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL2NvY2twaXQtYWN0aXZlLWJhY2tsb2ctY29yZS11aS0yMDI2MTAwOC0wMS9RQV9TT1VSQ0VfUkVWSUVXLTAxLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4In0sInJ1bl9pZCI6ImNvY2twaXQtYWN0aXZlLWJhY2tsb2ctY29yZS11aS0yMDI2MTAwOC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YjNjZDM4NTI2NjUzZDFmY2I0ZDA1NmY5ZGExN2RkODMyNzExNDBlZjM3MTdmNWQ0MzhhNjIyZDEwMmY5MWI4NyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9jb2NrcGl0LWFjdGl2ZS1iYWNrbG9nLWNvcmUtdWktMjAyNjEwMDgtMDEvVFAubWQiLCJ0eXBlIjoiVFAifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| TPR-001 native qualification | AC-004/005/008 partial for new UI resource; QA cannot pass | Reconnect final named connection and complete fresh actual compact/expanded display and app-only path/byte qualification |
