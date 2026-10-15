# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: tp-authoring-test
- lifecycle: active
- revision: 9
- revision_id: de332fd7-f1a8-4269-858f-2a455a0a026f
- content_seal: sha256:8a7f4a6ad40750cfceb8adc795cf710f87d3d8d50859a7a9aeb3854865c98883
- approval_seal: sha256:898cb9cd6831e7986b35a5cc8e82497c412cc2abd04de648725ffb0a6d290df3
- updated_at: 2026-10-15T08:41:00.644Z
- mode: structured_delivery
- current_gate: TP
- decision: in_progress
- owner: agent

## Objective

An operator can save and restore one named filter.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | TP artefact and reviewed source binding recorded together. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD |
| What is missing? | Exact Approval: TP. |
| What is the next allowed action? | Draft or refine the Task/Test Plan; do not implement before TP is approved. |
| What is explicitly forbidden right now? | implement code; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 338298ee-a37a-4e41-9a12-50d6867bc299 sha256:1aa72fce7121c99dbb95c42b1e9fb87b2803d829a80ce615304fdea5ff1c935c |
| PRD | approved | `Approval: PRD` · 2026-10-15 · revision 5 · `.agdf/control/artefacts/tp-authoring-test/PRD.md` sha256:6885474fee584743 · presentation f51b41ff-e20a-47f7-926c-c8806fc57ffd sha256:271b8a1cf5fcc5eb1178baa5b68cced8d23bc131941ea49a20855574027c77b8 |
| SD | approved | `Approval: SD` · 2026-10-15 · revision 7 · `.agdf/control/artefacts/tp-authoring-test/SD.md` sha256:b1bfbd7fbada7776 · presentation 2b76df56-5693-4d9a-bd61-e5ea4214e199 sha256:3aa4a17767a9ffcc7e3dedc2de3b7b054f9fd4ddeb821a33c1569389de79314a |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/tp-authoring-test/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | .agdf/control/artefacts/tp-authoring-test/PRD.md | approved | Reviewed source binding recorded atomically |
| SD | .agdf/control/artefacts/tp-authoring-test/SD.md | approved | Reviewed source binding recorded atomically |
| TP | .agdf/control/artefacts/tp-authoring-test/TP.md | draft | Reviewed source binding recorded atomically |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Binding proof d9a4006f-efef-4f00-b175-1c75a468c48d | .agdf/control/artefacts/tp-authoring-test/mapping-3220f809-b235-4310-a23b-229d2fb14191.json | done | Subordinate reviewed mapping evidence |
| Binding proof 8b9f4ff0-4fe2-4be2-b30b-6a62651f5576 | .agdf/control/artefacts/tp-authoring-test/sd-mapping-8f6120aa-105b-4399-9923-40d6c971b67a.json | done | Subordinate reviewed mapping evidence |
| Binding proof b86878f4-06bd-49ec-b725-fae82bbdaac1 | .agdf/control/artefacts/tp-authoring-test/forward-test-mapping.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Synthetic public-contract test route, never live authorization
- evidence: .agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 338298ee-a37a-4e41-9a12-50d6867bc299 sha256:1aa72fce7121c99dbb95c42b1e9fb87b2803d829a80ce615304fdea5ff1c935c |
| PRD | derived_from | UR | binding d9a4006f-efef-4f00-b175-1c75a468c48d; reviewed by synthetic test reviewer; .agdf/control/artefacts/tp-authoring-test/mapping-3220f809-b235-4310-a23b-229d2fb14191.json |
| SD | derived_from | PRD | binding 8b9f4ff0-4fe2-4be2-b30b-6a62651f5576; reviewed by synthetic SD test reviewer; .agdf/control/artefacts/tp-authoring-test/sd-mapping-8f6120aa-105b-4399-9923-40d6c971b67a.json |
| TP | derived_from | SD | binding b86878f4-06bd-49ec-b725-fae82bbdaac1; reviewed by Codex independent TP forward-test author; .agdf/control/artefacts/tp-authoring-test/forward-test-mapping.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/tp-authoring-test/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/mapping-3220f809-b235-4310-a23b-229d2fb14191.json | PRD derived_from UR; binding d9a4006f-efef-4f00-b175-1c75a468c48d; operation 040899c3-aa07-45d1-be88-45a26ac88e85; dbae5fe2-e36a-4adc-991e-239e180ed9cf -> 2b89708f-8615-4cef-ab23-d0fa6b74278b | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/sd-mapping-8f6120aa-105b-4399-9923-40d6c971b67a.json | SD derived_from PRD; binding 8b9f4ff0-4fe2-4be2-b30b-6a62651f5576; operation c04cb3aa-dd5c-4286-b0fb-f217c8468f77; 353669be-29d7-49b4-bd21-3a12e0b2f581 -> 4418cfe5-3687-45db-9178-e85489dc7fce | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/forward-test-mapping.json | TP derived_from SD; binding b86878f4-06bd-49ec-b725-fae82bbdaac1; operation 371d6a0c-bfc4-4694-b399-d06692b4db8b; 51df7ca1-5fc4-483f-9fb7-038be21a1d8f -> de332fd7-f1a8-4269-858f-2a455a0a026f | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Draft or refine the Task/Test Plan; do not implement before TP is approved.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| d9a4006f-efef-4f00-b175-1c75a468c48d | sha256:308e3aa59a8fede74fc32e5f6310e2cd6646164524227235e9b96ad279636fa1 | eyJiaW5kaW5nX2lkIjoiZDlhNDAwNmYtZWZlZi00ZjAwLWIxNzUtMWM3NWE0NjhjNDhkIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjA0MDg5OWMzLWFhMDctNDVkMS1iZTg4LTQ1YTI2YWM4OGU4NSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiZGJhZTVmZTItZTM2YS00YWRjLTk5MWUtMjM5ZTE4MGVkOWNmIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiMmI4OTcwOGYtODYxNS00Y2VmLWFiMjMtZDBmYTZiNzQyNzhiIiwicmV2aXNpb24iOjV9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6MTY0ZWMwZTZiZjQ0MTk0NDlmN2EwMDg1YmQxNzVmOTg1YWUxZjUxMGU3MGY4ZTRlNWE5OWJkMDVmZDI5ZDNmYyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9tYXBwaW5nLTMyMjBmODA5LWIyMzUtNDMxMC1hMjNiLTIyOWQyZmIxNDE5MS5qc29uIiwicmV2aWV3ZXIiOiJzeW50aGV0aWMgdGVzdCByZXZpZXdlciJ9LCJydW5faWQiOiJ0cC1hdXRob3JpbmctdGVzdCIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YWRhNzRmMTBhNGMxNzMxMzRjZjIxNzUyY2ZjMGE3NjU1YzFlZmUwYTgwMTk2N2JiZDM2MWE2NWM5ZDk1NWU3YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YzU0M2EyYWI4MzNjZjlmMWZiOTY5NmI0N2EzODAzMjEzZDVmNTYwMjJiZTY5ZjY0MWEwNDE5ODI5Nzc1Y2JiOSJ9 |
| 8b9f4ff0-4fe2-4be2-b30b-6a62651f5576 | sha256:1de9afba4415c56684e7abc6910e16c07b1a09a50a0a0ea2c51b563c3e22b229 | eyJiaW5kaW5nX2lkIjoiOGI5ZjRmZjAtNGZlMi00YmUyLWIzMGItNmE2MjY1MWY1NTc2IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIxYmZiZDdmYmFkYTc3NzYxZmY1YWM4OWJmZWI4ODk1YjQ3NjdhYzYyYzNiYjZmOWU3OTliOWZmYTZhNDgxODkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJjMDRjYjNhYS1kZDVjLTQyODYtYjBmYi1mMjE3Yzg0NjhmNzciLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjM1MzY2OWJlLTI5ZDctNDliNC1iZDIxLTNhMTJlMGIyZjU4MSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjQ0MThjZmU1LTM2ODctNDVkYi05MTc4LWU4NTQ4OWRjN2ZjZSIsInJldmlzaW9uIjo3fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiU0QiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlBSRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmRjYjk2MTUwOWY1Njk0NTljYmI1ZTg5NTdmODhmNzZiYTEyMzc3MjQyYmRhNWQ3NDU1NjUxMzA1MWFhNjliNmIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3Qvc2QtbWFwcGluZy04ZjYxMjBhYS0xMDViLTQzOTktOTkyMy00MGQ2Yzk3MWI2N2EuanNvbiIsInJldmlld2VyIjoic3ludGhldGljIFNEIHRlc3QgcmV2aWV3ZXIifSwicnVuX2lkIjoidHAtYXV0aG9yaW5nLXRlc3QiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YzU0M2EyYWI4MzNjZjlmMWZiOTY5NmI0N2EzODAzMjEzZDVmNTYwMjJiZTY5ZjY0MWEwNDE5ODI5Nzc1Y2JiOSJ9 |
| b86878f4-06bd-49ec-b725-fae82bbdaac1 | sha256:197d77cac25454126ae2450418b513eb2aacb149e646c97ded57d6f7ef6cc9b7 | eyJiaW5kaW5nX2lkIjoiYjg2ODc4ZjQtMDZiZC00OWVjLWI3MjUtZmFlODJiYmRhYWMxIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIxMzBhNTg4NGI3MzVhN2I4NjQ1ZDhjMTY3ZTc3OGUzNTQyNjE1NzZiMzYxMDU3ZTk5YzdlMjhjOTQ0ZTUxMTciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIzNzFkNmEwYy1iZmM0LTQ2OTQtYjM5OS1kMDY2OTJiNGRiOGIiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjUxZGY3Y2ExLTVmYzQtNDgzZi05ZmI3LTAzOGJlMjFhMWQ4ZiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImRlMzMyZmQ3LWYxYTgtNDI2OS04NThmLTJhNDU1YTBhMDI2ZiIsInJldmlzaW9uIjo5fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6MDE5ODNjNjlkYzdkMDU4NDM2MzJjNzRhZDRiMzliMzRkNTY0N2MxNmU4YWVlMjJjYTFjYTQyNmFlYWQ5Yzk0YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9mb3J3YXJkLXRlc3QtbWFwcGluZy5qc29uIiwicmV2aWV3ZXIiOiJDb2RleCBpbmRlcGVuZGVudCBUUCBmb3J3YXJkLXRlc3QgYXV0aG9yIn0sInJ1bl9pZCI6InRwLWF1dGhvcmluZy10ZXN0Iiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpiMWJmYmQ3ZmJhZGE3Nzc2MWZmNWFjODliZmViODg5NWI0NzY3YWM2MmMzYmI2ZjllNzk5YjlmZmE2YTQ4MTg5IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3RwLWF1dGhvcmluZy10ZXN0L1NELm1kIiwidHlwZSI6IlNEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjpjNTQzYTJhYjgzM2NmOWYxZmI5Njk2YjQ3YTM4MDMyMTNkNWY1NjAyMmJlNjlmNjQxYTA0MTk4Mjk3NzVjYmI5In0 |
