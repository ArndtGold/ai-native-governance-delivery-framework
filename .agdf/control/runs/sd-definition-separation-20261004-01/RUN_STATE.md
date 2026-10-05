# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: sd-definition-separation-20261004-01
- lifecycle: active
- revision: 14
- revision_id: b84489d8-b4eb-4bfe-9fbc-39ab8cec331c
- content_seal: sha256:bc9884fa0d25a178446b9b38858b2b19a6e41496f3f65019aff7ee91085ab1ee
- approval_seal: sha256:bf196f5a95c5be0bee90e433e262c13b06804cd14e52612d15787cb00b422fed
- updated_at: 2026-10-05T05:39:20.037Z
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Evidence recorded: .agdf/control/artefacts/sd-definition-separation-20261004-01/PAYLOAD_REVISION_PROPOSAL-01.md. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR. |
| What is explicitly forbidden right now? | claim QA pass; request UAT approval; release |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-04 · revision 2 · `.agdf/control/artefacts/sd-definition-separation-20261004-01/UR.md` sha256:3f807d76c7c9333c · presentation 963bdf33-860b-4ab6-953e-ef40990b9f39 sha256:6551c5ea72925cc924050b041b1a9f370682194ca9ee180c99efd0d4be710ecd |
| PRD | approved | `Approval: PRD` · 2026-10-04 · revision 6 · `.agdf/control/artefacts/sd-definition-separation-20261004-01/PRD.md` sha256:e9da69b12e642356 · presentation af3d7962-b647-419e-b2aa-bf8952736b9d sha256:ddd3f84c4dd3071bfeeee44dffc047bd71fc53e1702a6297b8be58e9047e52de |
| SD | approved | `Approval: SD` · 2026-10-04 · revision 8 · `.agdf/control/artefacts/sd-definition-separation-20261004-01/SD.md` sha256:28d93c6ff03cd1eb · presentation f33223b6-2793-4f78-b0ce-9bdef00c46dc sha256:f5500ca581457984b9d1da4d081bdd6e9cb81521b46fd7f8c5daaff4202ef363 |
| TP | approved | `Approval: TP` · 2026-10-04 · revision 10 · `.agdf/control/artefacts/sd-definition-separation-20261004-01/TP.md` sha256:b469a70a37aabcca · presentation 1931059b-ee29-4942-b01f-f57077b1953b sha256:4a85afafdaf26a470bf9d397b6564151d83d746cc0d9d1c457b98a2b987a7372 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/sd-definition-separation-20261004-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/sd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/sd-definition-separation-20261004-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/sd-definition-separation-20261004-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | .agdf/control/artefacts/sd-definition-separation-20261004-01/BROWNFIELD_ANALYSIS.md | done | Passed implementation preparation; baseline and protected independent paths recorded. |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Binding proof 6c964152-7a24-47b4-a6d9-74f0b7f91d7c | .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof 153fb88d-43d1-45a6-bb42-0603c610dda9 | .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD_SOURCE_MAPPING-02.json | done | Subordinate reviewed mapping evidence |
| Binding proof f67e3c54-8bb4-41c9-abdf-047cc5efecee | .agdf/control/artefacts/sd-definition-separation-20261004-01/SD_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |
| Binding proof d0c4c14c-70fd-4cd1-8d25-b883659aa0c4 | .agdf/control/artefacts/sd-definition-separation-20261004-01/TP_SOURCE_MAPPING-01.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: a named SD author and changed public CLI/MCP continuation require explicit compatibility and regression treatment; structured_slice is rejected because full_depth_impacts_absent fails, not because of file or owner counts.
- evidence: .agdf/control/artefacts/sd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-04 · revision 2 · `.agdf/control/artefacts/sd-definition-separation-20261004-01/UR.md` sha256:3f807d76c7c9333c · presentation 963bdf33-860b-4ab6-953e-ef40990b9f39 sha256:6551c5ea72925cc924050b041b1a9f370682194ca9ee180c99efd0d4be710ecd |
| PRD | derived_from | UR | binding 153fb88d-43d1-45a6-bb42-0603c610dda9; reviewed by Codex (cooperative PRD source review); .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD_SOURCE_MAPPING-02.json |
| SD | derived_from | PRD | binding f67e3c54-8bb4-41c9-abdf-047cc5efecee; reviewed by Codex (cooperative SD source review); .agdf/control/artefacts/sd-definition-separation-20261004-01/SD_SOURCE_MAPPING-01.json |
| TP | derived_from | SD | binding d0c4c14c-70fd-4cd1-8d25-b883659aa0c4; reviewed by Codex (cooperative TP source review); .agdf/control/artefacts/sd-definition-separation-20261004-01/TP_SOURCE_MAPPING-01.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/sd-definition-separation-20261004-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/sd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD_SOURCE_MAPPING-01.json | PRD derived_from UR; binding 6c964152-7a24-47b4-a6d9-74f0b7f91d7c; operation 4f4d07cb-5549-4be2-94a3-1f546f724ec7; 57ad2f6e-908e-4693-b5c8-3b26b13c6e92 -> f88380fe-1007-4c7d-bac1-1504d3172eb4 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/sd-definition-separation-20261004-01/PRD_SOURCE_MAPPING-02.json | PRD derived_from UR; binding 153fb88d-43d1-45a6-bb42-0603c610dda9; operation 5c630ab8-5967-418c-bd30-1e10db9e227c; f88380fe-1007-4c7d-bac1-1504d3172eb4 -> 86ba49d6-5307-4960-a913-cd380873f518 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/sd-definition-separation-20261004-01/SD_SOURCE_MAPPING-01.json | SD derived_from PRD; binding f67e3c54-8bb4-41c9-abdf-047cc5efecee; operation 869840d4-6de7-4198-8aa1-560a87938aa3; ef7f2b59-808e-443d-8dec-9af5d2a2f165 -> 5b7afd86-7233-486f-a766-466ca3a1ff48 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/sd-definition-separation-20261004-01/TP_SOURCE_MAPPING-01.json | TP derived_from SD; binding d0c4c14c-70fd-4cd1-8d25-b883659aa0c4; operation 3a3debb3-417f-469c-b9ce-c308ddcacc29; 4234c41c-6fe0-4276-92d5-6818d42e6dc9 -> 74a9da5a-3271-433d-8c44-faf0c350573d | reviewed cooperative mapping |
| .agdf/control/artefacts/sd-definition-separation-20261004-01/VALIDATION.md | scoped candidate verification | Focused SD tests passed; build and complete verification remain blocked by the unchanged Copilot payload budget; constraint clarification pending | direct |
| .agdf/control/artefacts/sd-definition-separation-20261004-01/PAYLOAD_REVISION_PROPOSAL-01.md | Codex; PAYLOAD_REVIEW-01.json and PAYLOAD_REVISION_ATTEMPT-01.json | Exact payload review; controlled UR-first revision proposal; rejected late revision; no baseline or gate changes | direct |

## Closeout

- next_allowed_action: Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 6c964152-7a24-47b4-a6d9-74f0b7f91d7c | sha256:b06dff1cbe6a7b622057d6ed4ca4b4072cf9877e33febf35fe8b2b9c70dd17bd | eyJiaW5kaW5nX2lkIjoiNmM5NjQxNTItN2EyNC00N2I0LWE2ZDktNzRmMGI3ZjkxZDdjIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmU0ODVkODZhODlkMTA1ZmNiYTI1MWFmM2I0NzhjM2JiYTFiYmM3ODc4ODg1Y2E3NzU0MjlkMWU3YmRkMDY3MzQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlBSRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiI0ZjRkMDdjYi01NTQ5LTRiZTItOTRhMy0xZjU0NmY3MjRlYzciLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjU3YWQyZjZlLTkwOGUtNDY5My1iNWM4LTNiMjZiMTNjNmU5MiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImY4ODM4MGZlLTEwMDctNGM3ZC1iYWMxLTE1MDRkMzE3MmViNCIsInJldmlzaW9uIjo1fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmIxYzNhMGE5ZmQwMWNmYmJlMDJlNWJmODAwMGM5ZTczMjk4Yzg1NTNiOWRjZmM3MWVjNjQxMWM3NTA2MjU5ODkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRF9TT1VSQ0VfTUFQUElORy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCAoY29vcGVyYXRpdmUgUFJEIHNvdXJjZSByZXZpZXcpIn0sInJ1bl9pZCI6InNkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6M2Y4MDdkNzZjN2M5MzMzY2Y0YWU2YjYxOTdjZTI2YjIxYjVmMjI5YmFjOTg1MjRkOGZmOTE1NjJmZGI5OTlkNiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9zZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEvVVIubWQiLCJ0eXBlIjoiVVIifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| 153fb88d-43d1-45a6-bb42-0603c610dda9 | sha256:07f208dae160685aa3ac67c258fe07c334d543b2c6084a5e5f1c5539600014c9 | eyJiaW5kaW5nX2lkIjoiMTUzZmI4OGQtNDNkMS00NWE2LWJiNDItMDYwM2M2MTBkZGE5IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmU5ZGE2OWIxMmU2NDIzNTYwMjE1NTQwODU0ZGYyY2E4NzgyNWJkMDVmZjEzMTJiODM3OWRjOTU5MTU0Y2M5YjAiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlBSRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiI1YzYzMGFiOC01OTY3LTQxOGMtYmQzMC0xZTEwZGI5ZTIyN2MiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImY4ODM4MGZlLTEwMDctNGM3ZC1iYWMxLTE1MDRkMzE3MmViNCIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6Ijg2YmE0OWQ2LTUzMDctNDk2MC1hOTEzLWNkMzgwODczZjUxOCIsInJldmlzaW9uIjo2fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiUFJEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJVUiJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmI2ZmQyZmRiNDU4ZWJmMzYyM2UyMGM2NDkzNmQ0Mjg5MWNmYzYzOWJjMjU3MGFmN2NhNmY2ZTg0OTgyZDg0ODUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRF9TT1VSQ0VfTUFQUElORy0wMi5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCAoY29vcGVyYXRpdmUgUFJEIHNvdXJjZSByZXZpZXcpIn0sInJ1bl9pZCI6InNkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6M2Y4MDdkNzZjN2M5MzMzY2Y0YWU2YjYxOTdjZTI2YjIxYjVmMjI5YmFjOTg1MjRkOGZmOTE1NjJmZGI5OTlkNiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9zZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEvVVIubWQiLCJ0eXBlIjoiVVIifSwic3VwZXJzZWRlcyI6IjZjOTY0MTUyLTdhMjQtNDdiNC1hNmQ5LTc0ZjBiN2Y5MWQ3YyIsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| f67e3c54-8bb4-41c9-abdf-047cc5efecee | sha256:0b5a9cdebb8dedb858332e84f1171627e299502285295e0b01895c39a68d70b5 | eyJiaW5kaW5nX2lkIjoiZjY3ZTNjNTQtOGJiNC00MWM5LWFiZGYtMDQ3Y2M1ZWZlY2VlIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjI4ZDkzYzZmZjAzY2QxZWI3MDk2ODg0NmQ3N2JkZjk1Y2E4NWU1MjI0MmZmYTc0ZWMxNjhjNjU4NGM2ODNjOGYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1NELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiU0QifSwib3BlcmF0aW9uIjp7ImlkIjoiODY5ODQwZDQtNmRlNy00MTk4LThhYTEtNTYwYTg3OTM4YWEzIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiJlZjdmMmI1OS04MDhlLTQ0M2QtOGRlYy05YWY1ZDJhMmYxNjUiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI1YjdhZmQ4Ni03MjMzLTQ4NmYtYTc2Ni00NjZjYTNhMWZmNDgiLCJyZXZpc2lvbiI6OH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlNEIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJQUkQifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjpjNDU0NmI1ODFiMmI3ZDU4Yzg2M2ExZTBiNWI1ZWZkNjdkMmI1Zjc1NGExMzYzZWFhZjY0YTBiYzYyNTVhYjRhIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3NkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRF9TT1VSQ0VfTUFQUElORy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCAoY29vcGVyYXRpdmUgU0Qgc291cmNlIHJldmlldykifSwicnVuX2lkIjoic2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjplOWRhNjliMTJlNjQyMzU2MDIxNTU0MDg1NGRmMmNhODc4MjViZDA1ZmYxMzEyYjgzNzlkYzk1OTE1NGNjOWIwIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3NkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9QUkQubWQiLCJ0eXBlIjoiUFJEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjphNWMxZGFlZTc4ODZmODFkMjdiMmI3NzE4NzE4ZmE3YTM4MjJiMjdhNGJjMWQwNTdmOTlhZjAxYmU3Njg4YTE5In0 |
| d0c4c14c-70fd-4cd1-8d25-b883659aa0c4 | sha256:bbbf9581bed39985bb22a72be108a3fab809ab1379b5c5772363028846ab18e9 | eyJiaW5kaW5nX2lkIjoiZDBjNGMxNGMtNzBmZC00Y2QxLThkMjUtYjg4MzY1OWFhMGM0IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmI0NjlhNzBhMzdhYWJjY2EzZTUwMjA1YjZjMDViZjY0OWUyYjVhOTJjMzI3Nzk4MTZhZDk2Zjk4YWI4NzBlZTciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1RQLm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiVFAifSwib3BlcmF0aW9uIjp7ImlkIjoiM2EzZGViYjMtNDE3Zi00NjljLWI5Y2UtYzMwOGRkY2FjYzI5IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI0MjM0YzQxYy02ZmUwLTQyNzYtOTJkNS02ODE4ZDQyZTZkYzkiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI3NGE5ZGE1YS0zMjcxLTQzM2QtOGM0NC1mYWYwYzM1MDU3M2QiLCJyZXZpc2lvbiI6MTB9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJUUCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiU0QifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjoyNGJhNDYwZDFjYTdhOWY1ZWM5YTdjYWUxZGYwNzdmNTQwNDQwOTQ2NDBlNWRkOTY4NGU1NWM2YmRkNDAzOTU1IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3NkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9UUF9TT1VSQ0VfTUFQUElORy0wMS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCAoY29vcGVyYXRpdmUgVFAgc291cmNlIHJldmlldykifSwicnVuX2lkIjoic2QtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjoyOGQ5M2M2ZmYwM2NkMWViNzA5Njg4NDZkNzdiZGY5NWNhODVlNTIyNDJmZmE3NGVjMTY4YzY1ODRjNjgzYzhmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3NkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRC5tZCIsInR5cGUiOiJTRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
