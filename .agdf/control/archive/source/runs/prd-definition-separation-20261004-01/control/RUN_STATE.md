# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: prd-definition-separation-20261004-01
- lifecycle: active
- revision: 17
- revision_id: 0a26abd7-904d-4798-a884-71a8346fd1a0
- content_seal: sha256:63a27b9acc90108794e845c9477aafd2a9e967bcc4aa51f65b339a300141ad83
- approval_seal: sha256:22fd15c2ad42ea4b7d4754ecd028e0b317e8d17e39b3999f57c7679d03d9fa28
- updated_at: 2026-10-04T16:38:44.308Z
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
| What is missing? | Exact Approval: QA. |
| What is the next allowed action? | Run the QA gate, persist the QA report, and request exact approval: Approval: QA |
| What is explicitly forbidden right now? | request UAT approval; release; claim delivery readiness before QA approval and report evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-04 · revision 2 · `.agdf/control/artefacts/prd-definition-separation-20261004-01/UR.md` sha256:2cc1f95547942a59 · presentation 00801e36-06c6-4a71-b608-5a6edc7e5568 sha256:657dad13db9b18e4994d14ea9c41a26d02b9a6d37d4666253b4fbd890a47ea0a |
| PRD | approved | `Approval: PRD` · 2026-10-04 · revision 6 · `.agdf/control/artefacts/prd-definition-separation-20261004-01/PRD.md` sha256:8cb1d53750e2adb3 · presentation 19170a63-3103-42cd-b9f8-ea85ddd9be0c sha256:410b93a7ffd2370b8a5d7f6e2c4ca9e4f6cb244cac7ec6de4a04ea0ffbb9aaad |
| SD | approved | `Approval: SD` · 2026-10-04 · revision 8 · `.agdf/control/artefacts/prd-definition-separation-20261004-01/SD.md` sha256:11d91375cf2d3117 · presentation 2db3c604-6810-4038-9a6d-9939fa1ce425 sha256:0aa916edcf4cf3f72de549d940317cf7837bedefd75c63d86a5293fa54df2243 |
| TP | approved | `Approval: TP` · 2026-10-04 · revision 10 · `.agdf/control/artefacts/prd-definition-separation-20261004-01/TP.md` sha256:5d2d9d83961f5f0a · presentation 2ba510f8-b58a-4111-83f3-6e80c8a397af sha256:ff5124ec96587937fd5e574069f0efdce6ead14855453b890fa738acee69a8b9 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/prd-definition-separation-20261004-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/prd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/prd-definition-separation-20261004-01/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/prd-definition-separation-20261004-01/TP.md | approved | Reviewed source binding recorded atomically |
| Brownfield Analysis | .agdf/control/artefacts/prd-definition-separation-20261004-01/BROWNFIELD_ANALYSIS.md | done | Pre-implementation reuse and protected baseline reviewed |
| CD+Tests | .agdf/control/artefacts/prd-definition-separation-20261004-01/CD_TESTS.md | done | Approved implementation and candidate qualification completed. |
| CR | .agdf/control/artefacts/prd-definition-separation-20261004-01/CODE_REVIEW.md | done | Code Review pass recorded through canonical run-step. |
| QA | .agdf/control/artefacts/prd-definition-separation-20261004-01/QA_REPORT.md | pass | Reviewed source binding recorded atomically |
| Binding proof 053a584d-2f47-4e5d-bc1f-003dfff3c36a | .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD_MAPPING_REV4.json | done | Subordinate reviewed mapping evidence |
| Binding proof 75b815a2-0d48-4622-b0e2-5840b0118dc2 | .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD_MAPPING_REV5.json | done | Subordinate reviewed mapping evidence |
| Binding proof d65359fc-6731-4f5f-9920-0353e8c760d3 | .agdf/control/artefacts/prd-definition-separation-20261004-01/SD_MAPPING_REV7.json | done | Subordinate reviewed mapping evidence |
| Binding proof afc11e4a-5bc1-42ca-be1e-6e1b1c99d080 | .agdf/control/artefacts/prd-definition-separation-20261004-01/TP_MAPPING_REV9.json | done | Subordinate reviewed mapping evidence |
| Clean Implementation Review | .agdf/control/artefacts/prd-definition-separation-20261004-01/CLEAN_IMPLEMENTATION_REVIEW.md | done | Cooperative structural and architecture review pass. |
| TP Review | .agdf/control/artefacts/prd-definition-separation-20261004-01/TP_REVIEW.md | done | 8/8 approved tasks and 30 scenarios covered; no open finding. |
| Binding proof 9d13955e-9d73-4c07-b36f-d033797f42c1 | .agdf/control/artefacts/prd-definition-separation-20261004-01/QA_MAPPING_REV16.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: dedicated public PRD skill and shared dispatch consumer contract; structured_slice rejected because full_depth_impacts_absent fails
- evidence: .agdf/control/artefacts/prd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-04 · revision 2 · `.agdf/control/artefacts/prd-definition-separation-20261004-01/UR.md` sha256:2cc1f95547942a59 · presentation 00801e36-06c6-4a71-b608-5a6edc7e5568 sha256:657dad13db9b18e4994d14ea9c41a26d02b9a6d37d4666253b4fbd890a47ea0a |
| PRD | derived_from | UR | binding 75b815a2-0d48-4622-b0e2-5840b0118dc2; reviewed by Codex; cooperative editorial summary and unchanged-product mapping review; .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD_MAPPING_REV5.json |
| SD | derived_from | PRD | binding d65359fc-6731-4f5f-9920-0353e8c760d3; reviewed by Codex; cooperative design/source mapping review by the drafting instance; .agdf/control/artefacts/prd-definition-separation-20261004-01/SD_MAPPING_REV7.json |
| TP | derived_from | SD | binding afc11e4a-5bc1-42ca-be1e-6e1b1c99d080; reviewed by Codex; cooperative task/scenario/source mapping review by the drafting instance; .agdf/control/artefacts/prd-definition-separation-20261004-01/TP_MAPPING_REV9.json |
| QA_REPORT | tests | TP | binding 9d13955e-9d73-4c07-b36f-d033797f42c1; reviewed by Codex qa-gate; cooperative same-instance QA/source mapping, no independent human proof; .agdf/control/artefacts/prd-definition-separation-20261004-01/QA_MAPPING_REV16.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/prd-definition-separation-20261004-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/prd-definition-separation-20261004-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD_MAPPING_REV4.json | PRD derived_from UR; binding 053a584d-2f47-4e5d-bc1f-003dfff3c36a; operation 1e3f9173-2219-4f26-be54-5e1b889c1c3b; ca67beb2-6375-48da-a9f3-80fa8e6d55bc -> 5251dc67-bb7f-4b73-99e9-82a62fcc2b95 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/prd-definition-separation-20261004-01/PRD_MAPPING_REV5.json | PRD derived_from UR; binding 75b815a2-0d48-4622-b0e2-5840b0118dc2; operation d11b10e9-b804-49b7-9f94-6b681397a8d8; 5251dc67-bb7f-4b73-99e9-82a62fcc2b95 -> 947610b1-7705-4b96-87f1-1824b1e331af | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/prd-definition-separation-20261004-01/SD_MAPPING_REV7.json | SD derived_from PRD; binding d65359fc-6731-4f5f-9920-0353e8c760d3; operation bea6c9b8-d7e5-4d67-b57e-c8ff0b463795; 92d13dd6-c1ba-43d0-b64e-e5495f4ab8ca -> 8c1c7bdb-d6cb-4f79-8745-e000cee5ef26 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/prd-definition-separation-20261004-01/TP_MAPPING_REV9.json | TP derived_from SD; binding afc11e4a-5bc1-42ca-be1e-6e1b1c99d080; operation d93b6f5e-79f4-47a6-b2c5-1f394c69ceaa; 6a9bfb8f-da8e-4b84-aafe-c6c6c7b4bb8c -> 1f2dc6d1-0298-4251-a5a3-4b0e04539ac9 | reviewed cooperative mapping |
| Code Review | code-review | decision pass: .agdf/control/artefacts/prd-definition-separation-20261004-01/CODE_REVIEW.md | direct |
| Artefact source binding | .agdf/control/artefacts/prd-definition-separation-20261004-01/QA_MAPPING_REV16.json | QA_REPORT tests TP; binding 9d13955e-9d73-4c07-b36f-d033797f42c1; operation 18c8146f-2217-4a41-9c24-162545496dd7; e6bcb9d2-2bc0-4041-93a4-19dd2a496f6e -> 0a26abd7-904d-4798-a884-71a8346fd1a0 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Run the QA gate, persist the QA report, and request exact approval: Approval: QA
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 053a584d-2f47-4e5d-bc1f-003dfff3c36a | sha256:df064873abc77bacae713b4edf0ca1a4e7b59d9af100a450591093861e58ec24 | eyJiaW5kaW5nX2lkIjoiMDUzYTU4NGQtMmY0Ny00ZTVkLWJjMWYtMDAzZGZmZjNjMzZhIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmU2NDIxZTA5OWExOTVhZTgwOWIxNGNiYzUzODEzMzIwNTZhNGZmNGM5Y2Q5ZmRhZTdjZmU4N2I4ZmJlMGEwNjciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9QUkQubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJQUkQifSwib3BlcmF0aW9uIjp7ImlkIjoiMWUzZjkxNzMtMjIxOS00ZjI2LWJlNTQtNWUxYjg4OWMxYzNiIiwicHJldmlvdXNfcmV2aXNpb25faWQiOiJjYTY3YmViMi02Mzc1LTQ4ZGEtYTlmMy04MGZhOGU2ZDU1YmMiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI1MjUxZGM2Ny1iYjdmLTRiNzMtOTllOS04MmE2MmZjYzJiOTUiLCJyZXZpc2lvbiI6NX0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlBSRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiVVIifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1Njo4NDUzODEzYzFlNDRmNGFkOWZhMzdjYWVkNWIzODI4ZTI3MDMwMjcyZjlmMmU0MmVjNDIzNGY5NTA5Njk4ZWU5IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3ByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEvUFJEX01BUFBJTkdfUkVWNC5qc29uIiwicmV2aWV3ZXIiOiJDb2RleDsgY29vcGVyYXRpdmUgc2VtYW50aWMgbWFwcGluZyByZXZpZXcgYnkgdGhlIGRyYWZ0aW5nIGluc3RhbmNlIn0sInJ1bl9pZCI6InByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjJjYzFmOTU1NDc5NDJhNTllZjE2MDdkZDgyYTIwYWI5MWZmNDc3NDlkOWQwZDYxMmU3ZGE5Yzg5MDI4OWI3ZGQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| 75b815a2-0d48-4622-b0e2-5840b0118dc2 | sha256:baa181fb1fc5425761489d638e4599f702afc993fa15c687b0d1a8c03fd4cea4 | eyJiaW5kaW5nX2lkIjoiNzViODE1YTItMGQ0OC00NjIyLWIwZTItNTg0MGIwMTE4ZGMyIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjhjYjFkNTM3NTBlMmFkYjM1OGE2NGFhMWY3MTRjMzUwZGY3MjVkZDE2YzA2MDUxN2U1ZjhkZTQzNzhjNWE5MTUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9QUkQubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJQUkQifSwib3BlcmF0aW9uIjp7ImlkIjoiZDExYjEwZTktYjgwNC00OWI3LTlmOTQtNmI2ODEzOTdhOGQ4IiwicHJldmlvdXNfcmV2aXNpb25faWQiOiI1MjUxZGM2Ny1iYjdmLTRiNzMtOTllOS04MmE2MmZjYzJiOTUiLCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiI5NDc2MTBiMS03NzA1LTRiOTYtODdmMS0xODI0YjFlMzMxYWYiLCJyZXZpc2lvbiI6Nn0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlBSRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiVVIifSwicmV2aWV3Ijp7ImRpZ2VzdCI6InNoYTI1NjpmOWNkMWFjNzBjMzk1MTVkYzljNzYxZjVmZDg3ZjYzN2IwZGQyYTQ5YzRlYWFiZmI4YjYzN2VjNGNhYjM2MTNiIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3ByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEvUFJEX01BUFBJTkdfUkVWNS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleDsgY29vcGVyYXRpdmUgZWRpdG9yaWFsIHN1bW1hcnkgYW5kIHVuY2hhbmdlZC1wcm9kdWN0IG1hcHBpbmcgcmV2aWV3In0sInJ1bl9pZCI6InByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjJjYzFmOTU1NDc5NDJhNTllZjE2MDdkZDgyYTIwYWI5MWZmNDc3NDlkOWQwZDYxMmU3ZGE5Yzg5MDI4OWI3ZGQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjoiMDUzYTU4NGQtMmY0Ny00ZTVkLWJjMWYtMDAzZGZmZjNjMzZhIiwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| d65359fc-6731-4f5f-9920-0353e8c760d3 | sha256:c2518bef867e74b1b724ad5c4932b59c18a4dac35a6abea52ed9f4e431226581 | eyJiaW5kaW5nX2lkIjoiZDY1MzU5ZmMtNjczMS00ZjVmLTk5MjAtMDM1M2U4Yzc2MGQzIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjExZDkxMzc1Y2YyZDMxMTc5ZjRkODBmYzRlNDVhZjYwZGE0NTIxMTA5Njk4NGFhNzE2M2FmYTIzMGNmM2VjYjYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlNEIn0sIm9wZXJhdGlvbiI6eyJpZCI6ImJlYTZjOWI4LWQ3ZTUtNGQ2Ny1iNTdlLWM4ZmYwYjQ2Mzc5NSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiOTJkMTNkZDYtYzFiYS00M2QwLWI2NGUtZTU0OTVmNGFiOGNhIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiOGMxYzdiZGItZDZjYi00Zjc5LTg3NDUtZTAwMGNlZTVlZjI2IiwicmV2aXNpb24iOjh9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJTRCIsInJlbGF0aW9uc2hpcCI6ImRlcml2ZWRfZnJvbSIsInRvIjoiUFJEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6NWNmMDgwOWYzZjc1Njc1NjBlMzA4YjQyYWE3NGRmODE3MjIzNjAyNDM0NmNiMWJjNWUyZDU0Mzg0NDc2OWY0MCIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9wcmQtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1NEX01BUFBJTkdfUkVWNy5qc29uIiwicmV2aWV3ZXIiOiJDb2RleDsgY29vcGVyYXRpdmUgZGVzaWduL3NvdXJjZSBtYXBwaW5nIHJldmlldyBieSB0aGUgZHJhZnRpbmcgaW5zdGFuY2UifSwicnVuX2lkIjoicHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6OGNiMWQ1Mzc1MGUyYWRiMzU4YTY0YWExZjcxNGMzNTBkZjcyNWRkMTZjMDYwNTE3ZTVmOGRlNDM3OGM1YTkxNSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9wcmQtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1BSRC5tZCIsInR5cGUiOiJQUkQifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OmE1YzFkYWVlNzg4NmY4MWQyN2IyYjc3MTg3MThmYTdhMzgyMmIyN2E0YmMxZDA1N2Y5OWFmMDFiZTc2ODhhMTkifQ |
| afc11e4a-5bc1-42ca-be1e-6e1b1c99d080 | sha256:741866bb0457cbd5ef5f2a5cf254db98a650c6347195e47d76dd5d82b6e91b28 | eyJiaW5kaW5nX2lkIjoiYWZjMTFlNGEtNWJjMS00MmNhLWJlMWUtNmUxYjFjOTlkMDgwIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjVkMmQ5ZDgzOTYxZjVmMGEyYWZjMjhhZjk2MjI4ZTA5OGMxMWZiYzljNTg0OTliMjAzNzI5OTRmM2YyMzEzNjIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9UUC5tZCIsInN0YXR1cyI6ImRyYWZ0IiwidHlwZSI6IlRQIn0sIm9wZXJhdGlvbiI6eyJpZCI6ImQ5M2I2ZjVlLTc5ZjQtNDdhNi1iMmM1LTFmMzk0YzY5Y2VhYSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiNmE5YmZiOGYtZGE4ZS00Yjg0LWFhZmUtYzZjNmM3YjRiYjhjIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiMWYyZGM2ZDEtMDI5OC00MjUxLWE1YTMtNGIwZTA0NTM5YWM5IiwicmV2aXNpb24iOjEwfSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6OTVlNTMwYTcxMGZkMmJhMGFmYzJmZmM3MWQzZDRmYWE4YWQwODE3ZWE2NmRhODllZmNlZGYyNmEyOTE0MzA4YyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9wcmQtZGVmaW5pdGlvbi1zZXBhcmF0aW9uLTIwMjYxMDA0LTAxL1RQX01BUFBJTkdfUkVWOS5qc29uIiwicmV2aWV3ZXIiOiJDb2RleDsgY29vcGVyYXRpdmUgdGFzay9zY2VuYXJpby9zb3VyY2UgbWFwcGluZyByZXZpZXcgYnkgdGhlIGRyYWZ0aW5nIGluc3RhbmNlIn0sInJ1bl9pZCI6InByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjExZDkxMzc1Y2YyZDMxMTc5ZjRkODBmYzRlNDVhZjYwZGE0NTIxMTA5Njk4NGFhNzE2M2FmYTIzMGNmM2VjYjYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9TRC5tZCIsInR5cGUiOiJTRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
| 9d13955e-9d73-4c07-b36f-d033797f42c1 | sha256:b180e0240640445d514c8acbaf739b70fbfcbd87470236fae6c515daa3e3a772 | eyJiaW5kaW5nX2lkIjoiOWQxMzk1NWUtOWQ3My00YzA3LWIzNmYtZDAzMzc5N2Y0MmMxIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIzMDMyYjNjN2I3NmZmYzUxOTFiN2NkMzUzZTQwMWM5N2UzNTZkOWFhY2UzYTFmMjdiMzMzYTk3YTM4OTgyNjAiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9RQV9SRVBPUlQubWQiLCJzdGF0dXMiOiJwYXNzIiwidHlwZSI6IlFBX1JFUE9SVCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIxOGM4MTQ2Zi0yMjE3LTRhNDEtOWMyNC0xNjI1NDU0OTZkZDciLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImU2YmNiOWQyLTJiYzAtNDA0MS05M2E0LTE5ZGQyYTQ5NmY2ZSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjBhMjZhYmQ3LTkwNGQtNDc5OC1hODg0LTcxYTgzNDZmZDFhMCIsInJldmlzaW9uIjoxN30sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlFBX1JFUE9SVCIsInJlbGF0aW9uc2hpcCI6InRlc3RzIiwidG8iOiJUUCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjM2NmNhYjkxYzI4NDg0NTE3MWE0NGIyMjJlMWYzYTBiZDMxOWZmNTc4MjBiZjE5ZmFkYzY1ZjRlZmQ4ZTg4NWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9RQV9NQVBQSU5HX1JFVjE2Lmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IHFhLWdhdGU7IGNvb3BlcmF0aXZlIHNhbWUtaW5zdGFuY2UgUUEvc291cmNlIG1hcHBpbmcsIG5vIGluZGVwZW5kZW50IGh1bWFuIHByb29mIn0sInJ1bl9pZCI6InByZC1kZWZpbml0aW9uLXNlcGFyYXRpb24tMjAyNjEwMDQtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjVkMmQ5ZDgzOTYxZjVmMGEyYWZjMjhhZjk2MjI4ZTA5OGMxMWZiYzljNTg0OTliMjAzNzI5OTRmM2YyMzEzNjIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcHJkLWRlZmluaXRpb24tc2VwYXJhdGlvbi0yMDI2MTAwNC0wMS9UUC5tZCIsInR5cGUiOiJUUCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |
