# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: tp-authoring-test
- lifecycle: active
- revision: 9
- revision_id: e905d6a1-c36e-4a42-8061-5e30a73bf295
- content_seal: sha256:7704beb60bc479eba69ee4f48c8cc379c3e30c3993186d225c6c635f7a46c9a9
- approval_seal: sha256:121e878971812107af270351bf1d6febdb4a6ce69d88da95f57872c96836b5c4
- updated_at: 2026-10-15T09:52:40.510Z
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
| UR | approved | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation d0b90a8e-8d13-4c3c-8f1d-405a7cd04768 sha256:a7907c328451c8c838552a14559f63e52a0eeb5b253b02e9d65be8d9df4135df |
| PRD | approved | `Approval: PRD` · 2026-10-15 · revision 5 · `.agdf/control/artefacts/tp-authoring-test/PRD.md` sha256:6885474fee584743 · presentation 15379b1b-ce50-4ea7-b388-d33eb8cbdc89 sha256:aeadfea21a8c6bb271016629d97b8b6161e4cb5eb3678f18a0fe14a73e94d350 |
| SD | approved | `Approval: SD` · 2026-10-15 · revision 7 · `.agdf/control/artefacts/tp-authoring-test/SD.md` sha256:4891b8ea1b479401 · presentation 0cdd6627-9560-4730-9342-a21fcf28b48d sha256:8c31df6957a8cc7a6c4aff970643359bede53654affe3d1202b6aecf81ddd29f |
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
| Binding proof 3aab460e-5e9e-42b2-a361-9a3955e45547 | .agdf/control/artefacts/tp-authoring-test/mapping-1199ee39-16d0-463c-9d23-97f1a69cd5fc.json | done | Subordinate reviewed mapping evidence |
| Binding proof 5b3a5b4f-c3e7-427e-b84e-719be9f4487b | .agdf/control/artefacts/tp-authoring-test/sd-mapping-baa5e394-2875-458b-a0ec-9ed12179891e.json | done | Subordinate reviewed mapping evidence |
| Binding proof fa3aa597-054e-464c-8733-78d4563fee5e | .agdf/control/artefacts/tp-authoring-test/tp-clean-mapping-v2.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Synthetic public-contract test route, never live authorization
- evidence: .agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation d0b90a8e-8d13-4c3c-8f1d-405a7cd04768 sha256:a7907c328451c8c838552a14559f63e52a0eeb5b253b02e9d65be8d9df4135df |
| PRD | derived_from | UR | binding 3aab460e-5e9e-42b2-a361-9a3955e45547; reviewed by synthetic test reviewer; .agdf/control/artefacts/tp-authoring-test/mapping-1199ee39-16d0-463c-9d23-97f1a69cd5fc.json |
| SD | derived_from | PRD | binding 5b3a5b4f-c3e7-427e-b84e-719be9f4487b; reviewed by synthetic SD test reviewer; .agdf/control/artefacts/tp-authoring-test/sd-mapping-baa5e394-2875-458b-a0ec-9ed12179891e.json |
| TP | derived_from | SD | binding fa3aa597-054e-464c-8733-78d4563fee5e; reviewed by TP forward-test agent; .agdf/control/artefacts/tp-authoring-test/tp-clean-mapping-v2.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/tp-authoring-test/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/mapping-1199ee39-16d0-463c-9d23-97f1a69cd5fc.json | PRD derived_from UR; binding 3aab460e-5e9e-42b2-a361-9a3955e45547; operation df0b34ef-7ea1-45d8-8aca-32781624a5f5; e466c2a9-01f7-4376-9213-9b3c9df7c89b -> 4d3b4f34-7e24-4338-a972-9abebbb79d44 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/sd-mapping-baa5e394-2875-458b-a0ec-9ed12179891e.json | SD derived_from PRD; binding 5b3a5b4f-c3e7-427e-b84e-719be9f4487b; operation 1f9932b6-fc9d-49cb-a119-de708ac58061; 193c248f-4125-462b-9478-b96c4f917d02 -> 4effe6c9-ea2a-483e-9ace-d259f599cec8 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/tp-clean-mapping-v2.json | TP derived_from SD; binding fa3aa597-054e-464c-8733-78d4563fee5e; operation 757d91a6-e9d7-406b-a345-0f186677f8cd; 58cd8076-9a49-4d05-9525-7c116142e1e8 -> e905d6a1-c36e-4a42-8061-5e30a73bf295 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Draft or refine the Task/Test Plan; do not implement before TP is approved.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 3aab460e-5e9e-42b2-a361-9a3955e45547 | sha256:03ace112bc4e81a31ca1d15830274ce1c6209eeafd5c68a5611983b5a3e310e3 | eyJiaW5kaW5nX2lkIjoiM2FhYjQ2MGUtNWU5ZS00MmIyLWEzNjEtOWEzOTU1ZTQ1NTQ3IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6ImRmMGIzNGVmLTdlYTEtNDVkOC04YWNhLTMyNzgxNjI0YTVmNSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiZTQ2NmMyYTktMDFmNy00Mzc2LTkyMTMtOWIzYzlkZjdjODliIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiNGQzYjRmMzQtN2UyNC00MzM4LWE5NzItOWFiZWJiYjc5ZDQ0IiwicmV2aXNpb24iOjV9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6MDg5Y2YzY2MyZDc3ZTFhMjg4ZGZjYjAxOGYwYmM1ZTYwNGVjYTA0Y2Q2ZDE0NTY2MTZhZGM3YWU2YmFkNTk2NiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9tYXBwaW5nLTExOTllZTM5LTE2ZDAtNDYzYy05ZDIzLTk3ZjFhNjljZDVmYy5qc29uIiwicmV2aWV3ZXIiOiJzeW50aGV0aWMgdGVzdCByZXZpZXdlciJ9LCJydW5faWQiOiJ0cC1hdXRob3JpbmctdGVzdCIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YWRhNzRmMTBhNGMxNzMxMzRjZjIxNzUyY2ZjMGE3NjU1YzFlZmUwYTgwMTk2N2JiZDM2MWE2NWM5ZDk1NWU3YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTg3ODI3MzAxMGIyZTdlNjE1NDU3MDNiZTE5Mzk4NGIyMWZlOWRhYTg2ZTk3ZGM5ZGQ1ZWYzZWQ1NDU4M2UyNSJ9 |
| 5b3a5b4f-c3e7-427e-b84e-719be9f4487b | sha256:8514ab73f2435f6de40b78f8e7ae02cd317b5f8a2f75183e143a2b4ad1d84b4b | eyJiaW5kaW5nX2lkIjoiNWIzYTViNGYtYzNlNy00MjdlLWI4NGUtNzE5YmU5ZjQ0ODdiIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjQ4OTFiOGVhMWI0Nzk0MDEzNjE5MmE5Y2U0NGMyNzViNTkzMjFlYmQyNTAwZWU2NDk0ZTM5MjlhNTkzN2NlZWQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIxZjk5MzJiNi1mYzlkLTQ5Y2ItYTExOS1kZTcwOGFjNTgwNjEiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjE5M2MyNDhmLTQxMjUtNDYyYi05NDc4LWI5NmM0ZjkxN2QwMiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjRlZmZlNmM5LWVhMmEtNDgzZS05YWNlLWQyNTlmNTk5Y2VjOCIsInJldmlzaW9uIjo3fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiU0QiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlBSRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjRhZjJjY2IxMGI3N2EyNGExZTMxYjc1MTlkMzQ4OWZjNjk2YWFiMjdiN2QyMmFmMzA4ZDE1MzllOGMzZjdhNDQiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3Qvc2QtbWFwcGluZy1iYWE1ZTM5NC0yODc1LTQ1OGItYTBlYy05ZWQxMjE3OTg5MWUuanNvbiIsInJldmlld2VyIjoic3ludGhldGljIFNEIHRlc3QgcmV2aWV3ZXIifSwicnVuX2lkIjoidHAtYXV0aG9yaW5nLXRlc3QiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTg3ODI3MzAxMGIyZTdlNjE1NDU3MDNiZTE5Mzk4NGIyMWZlOWRhYTg2ZTk3ZGM5ZGQ1ZWYzZWQ1NDU4M2UyNSJ9 |
| fa3aa597-054e-464c-8733-78d4563fee5e | sha256:0db7ae250edecb68e95112a30525f336ee6ede89bff9c7997f5b379c420cc073 | eyJiaW5kaW5nX2lkIjoiZmEzYWE1OTctMDU0ZS00NjRjLTg3MzMtNzhkNDU2M2ZlZTVlIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2Ojk2NWYzNDBiNGIwYTY3MzJmZWFkZjhiZDUzOGRjNzRiM2IyODg0ZmMyYWViZTcxNjFlNjNkZmZjMDVhMWI0NWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiI3NTdkOTFhNi1lOWQ3LTQwNmItYTM0NS0wZjE4NjY3N2Y4Y2QiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjU4Y2Q4MDc2LTlhNDktNGQwNS05NTI1LTdjMTE2MTQyZTFlOCIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImU5MDVkNmExLWMzNmUtNGE0Mi04MDYxLTVlMzBhNzNiZjI5NSIsInJldmlzaW9uIjo5fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6ZjNmZTc1MGVhZjgzY2Q1OTY4NGJkNjJkOTM5YWY3YTFjNmY1ZDM2ZjM2Nzg1YWRjNTllMzcyY2VlMjU0MDZiMCIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC90cC1jbGVhbi1tYXBwaW5nLXYyLmpzb24iLCJyZXZpZXdlciI6IlRQIGZvcndhcmQtdGVzdCBhZ2VudCJ9LCJydW5faWQiOiJ0cC1hdXRob3JpbmctdGVzdCIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6NDg5MWI4ZWExYjQ3OTQwMTM2MTkyYTljZTQ0YzI3NWI1OTMyMWViZDI1MDBlZTY0OTRlMzkyOWE1OTM3Y2VlZCIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9TRC5tZCIsInR5cGUiOiJTRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTg3ODI3MzAxMGIyZTdlNjE1NDU3MDNiZTE5Mzk4NGIyMWZlOWRhYTg2ZTk3ZGM5ZGQ1ZWYzZWQ1NDU4M2UyNSJ9 |
