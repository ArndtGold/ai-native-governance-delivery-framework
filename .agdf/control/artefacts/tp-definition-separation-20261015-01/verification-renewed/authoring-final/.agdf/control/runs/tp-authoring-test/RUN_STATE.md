# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: tp-authoring-test
- lifecycle: active
- revision: 10
- revision_id: b7086dfa-baf6-4b7a-b2a9-f5d82d8762dd
- content_seal: sha256:71634191facb44b8d180b4d4f46f6358a2f2feaebed5d3348f17f4ade9b208fc
- approval_seal: sha256:f06e7dc029890faa801c5387df2f114cc48cee0dd878cc348b91dd2b5169ce90
- updated_at: 2026-10-15T09:35:46.569Z
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
| UR | approved | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 78456ce5-8663-4d6b-8eca-e3f88b562f9f sha256:784077c3835c4966a9c50318d83a5195e2a3bd4facd993b2369c5cafc50a2d55 |
| PRD | approved | `Approval: PRD` · 2026-10-15 · revision 5 · `.agdf/control/artefacts/tp-authoring-test/PRD.md` sha256:6885474fee584743 · presentation 9e485abd-c283-49c7-b699-bac565bec0a8 sha256:9fc19d34af8fe9a917c23c504f75686ac9e971daca1d97eadbdf8d8e63c2280f |
| SD | approved | `Approval: SD` · 2026-10-15 · revision 7 · `.agdf/control/artefacts/tp-authoring-test/SD.md` sha256:b1bfbd7fbada7776 · presentation c85f38e9-f55f-4923-9627-53eaa133cd8b sha256:1d9b340cac047ba1c153bb4354d60fc2daf14adf30521e6d017ef78a57b56d9d |
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
| Binding proof ecf565d5-beab-4aaa-b58a-31668a7b99fa | .agdf/control/artefacts/tp-authoring-test/mapping-4b548c64-860c-4f14-bc2e-4f0761f29632.json | done | Subordinate reviewed mapping evidence |
| Binding proof b1b7030d-52df-473b-803c-e73b6b08e2a9 | .agdf/control/artefacts/tp-authoring-test/sd-mapping-87d4393b-3dbb-4737-8609-af3ca0da81cc.json | done | Subordinate reviewed mapping evidence |
| Binding proof 5a792288-b0ee-4929-b33f-0bd05d15923b | .agdf/control/artefacts/tp-authoring-test/tp-forward-test/derivation-review.json | done | Subordinate reviewed mapping evidence |
| Binding proof fc33adc6-b449-4e9b-a54e-fa7ec3ca033d | .agdf/control/artefacts/tp-authoring-test/tp-forward-test-revision/derivation-review.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Synthetic public-contract test route, never live authorization
- evidence: .agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 78456ce5-8663-4d6b-8eca-e3f88b562f9f sha256:784077c3835c4966a9c50318d83a5195e2a3bd4facd993b2369c5cafc50a2d55 |
| PRD | derived_from | UR | binding ecf565d5-beab-4aaa-b58a-31668a7b99fa; reviewed by synthetic test reviewer; .agdf/control/artefacts/tp-authoring-test/mapping-4b548c64-860c-4f14-bc2e-4f0761f29632.json |
| SD | derived_from | PRD | binding b1b7030d-52df-473b-803c-e73b6b08e2a9; reviewed by synthetic SD test reviewer; .agdf/control/artefacts/tp-authoring-test/sd-mapping-87d4393b-3dbb-4737-8609-af3ca0da81cc.json |
| TP | derived_from | SD | binding fc33adc6-b449-4e9b-a54e-fa7ec3ca033d; reviewed by TP forward-test revision agent (cooperative semantic review; not human approval); .agdf/control/artefacts/tp-authoring-test/tp-forward-test-revision/derivation-review.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/tp-authoring-test/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/mapping-4b548c64-860c-4f14-bc2e-4f0761f29632.json | PRD derived_from UR; binding ecf565d5-beab-4aaa-b58a-31668a7b99fa; operation 7a1aba7b-f0cf-48b0-bedd-7ba11ab7346f; 7d926820-97ee-49d1-9690-28a2d4d2416d -> b6186429-c25a-4635-b7f7-b56e4d36ea7d | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/sd-mapping-87d4393b-3dbb-4737-8609-af3ca0da81cc.json | SD derived_from PRD; binding b1b7030d-52df-473b-803c-e73b6b08e2a9; operation 0ce665f7-f6c7-4840-bbcb-31593a22a79e; 0a7290b9-17ca-4218-b656-4036ccd6879e -> d069f49f-6b56-4bda-870a-d395e67fb3a2 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/tp-forward-test/derivation-review.json | TP derived_from SD; binding 5a792288-b0ee-4929-b33f-0bd05d15923b; operation 3eb2fc19-ed1b-41fb-af22-a365e08ee4de; 1bdab45b-fd65-4a40-b6e0-d2226293891d -> f6504d55-033d-4441-9d8c-be8d0ba75a90 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/tp-forward-test-revision/derivation-review.json | TP derived_from SD; binding fc33adc6-b449-4e9b-a54e-fa7ec3ca033d; operation 14fcbad3-a993-4cdb-a7a0-db6694039ca9; f6504d55-033d-4441-9d8c-be8d0ba75a90 -> b7086dfa-baf6-4b7a-b2a9-f5d82d8762dd | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Draft or refine the Task/Test Plan; do not implement before TP is approved.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| ecf565d5-beab-4aaa-b58a-31668a7b99fa | sha256:3719f4de6a575e3796e20675f326a0b2c6a0a941734eec030affee38d2189265 | eyJiaW5kaW5nX2lkIjoiZWNmNTY1ZDUtYmVhYi00YWFhLWI1OGEtMzE2NjhhN2I5OWZhIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjdhMWFiYTdiLWYwY2YtNDhiMC1iZWRkLTdiYTExYWI3MzQ2ZiIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiN2Q5MjY4MjAtOTdlZS00OWQxLTk2OTAtMjhhMmQ0ZDI0MTZkIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYjYxODY0MjktYzI1YS00NjM1LWI3ZjctYjU2ZTRkMzZlYTdkIiwicmV2aXNpb24iOjV9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6OGZjYTJkNWVkNDc4MTE0ZDYzNjc2YmJjZjE1YjZhYTNjYWIzNzIyMDBkZTZmNTM5YzliYWE2NjE1YjE3OTNiYyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9tYXBwaW5nLTRiNTQ4YzY0LTg2MGMtNGYxNC1iYzJlLTRmMDc2MWYyOTYzMi5qc29uIiwicmV2aWV3ZXIiOiJzeW50aGV0aWMgdGVzdCByZXZpZXdlciJ9LCJydW5faWQiOiJ0cC1hdXRob3JpbmctdGVzdCIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YWRhNzRmMTBhNGMxNzMxMzRjZjIxNzUyY2ZjMGE3NjU1YzFlZmUwYTgwMTk2N2JiZDM2MWE2NWM5ZDk1NWU3YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6OGQzNGY5NDU4NDVhNjhkNGY4M2I4NThhNzllM2E4NzFjNTJkOTEyNDgxN2UyMzdhNjQ1YzAxZmUxNWEzNzJlNCJ9 |
| b1b7030d-52df-473b-803c-e73b6b08e2a9 | sha256:94ab3d57110e4c7b3edb03957b2db45829dfcdc9f349a438319cc97bdc394c3a | eyJiaW5kaW5nX2lkIjoiYjFiNzAzMGQtNTJkZi00NzNiLTgwM2MtZTczYjZiMDhlMmE5IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIxYmZiZDdmYmFkYTc3NzYxZmY1YWM4OWJmZWI4ODk1YjQ3NjdhYzYyYzNiYjZmOWU3OTliOWZmYTZhNDgxODkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIwY2U2NjVmNy1mNmM3LTQ4NDAtYmJjYi0zMTU5M2EyMmE3OWUiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjBhNzI5MGI5LTE3Y2EtNDIxOC1iNjU2LTQwMzZjY2Q2ODc5ZSIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImQwNjlmNDlmLTZiNTYtNGJkYS04NzBhLWQzOTVlNjdmYjNhMiIsInJldmlzaW9uIjo3fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiU0QiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlBSRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OmI4Y2U0ZWIxNDYwYzlkOTNiM2ZhNzExNGE2YjkwN2FmMzJiYzlmZWUyMDViN2FmNDU0N2ZmMzk1NTdkZGYyNzEiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3Qvc2QtbWFwcGluZy04N2Q0MzkzYi0zZGJiLTQ3MzctODYwOS1hZjNjYTBkYTgxY2MuanNvbiIsInJldmlld2VyIjoic3ludGhldGljIFNEIHRlc3QgcmV2aWV3ZXIifSwicnVuX2lkIjoidHAtYXV0aG9yaW5nLXRlc3QiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6OGQzNGY5NDU4NDVhNjhkNGY4M2I4NThhNzllM2E4NzFjNTJkOTEyNDgxN2UyMzdhNjQ1YzAxZmUxNWEzNzJlNCJ9 |
| 5a792288-b0ee-4929-b33f-0bd05d15923b | sha256:32c1de28afd28c100f6270712f9ee35eda59205e642c32177394f6537c3efcfc | eyJiaW5kaW5nX2lkIjoiNWE3OTIyODgtYjBlZS00OTI5LWIzM2YtMGJkMDVkMTU5MjNiIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmVmMjEyNjU2NzBlYTEzY2E1MzAzZmI5NDBkYTgwMGI2MmRhZjU5NjJmMjRmZjQ2ZDRiZDc5OWU0MTllODFhN2EiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIzZWIyZmMxOS1lZDFiLTQxZmItYWYyMi1hMzY1ZTA4ZWU0ZGUiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjFiZGFiNDViLWZkNjUtNGE0MC1iNmUwLWQyMjI2MjkzODkxZCIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImY2NTA0ZDU1LTAzM2QtNDQ0MS05ZDhjLWJlOGQwYmE3NWE5MCIsInJldmlzaW9uIjo5fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6Y2Y4ZDE1OGI4ZDY4ODlhMjQ0YjgyNDgwZWRhNjU1MDZlYjE4OWJhNTNiMjgzYTgyZjU1NjljNWViMzUxYmU5MSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC90cC1mb3J3YXJkLXRlc3QvZGVyaXZhdGlvbi1yZXZpZXcuanNvbiIsInJldmlld2VyIjoiVFAgZm9yd2FyZC10ZXN0IGFnZW50IChjb29wZXJhdGl2ZSBzZW1hbnRpYyByZXZpZXc7IG5vdCBodW1hbiBhcHByb3ZhbCkifSwicnVuX2lkIjoidHAtYXV0aG9yaW5nLXRlc3QiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OmIxYmZiZDdmYmFkYTc3NzYxZmY1YWM4OWJmZWI4ODk1YjQ3NjdhYzYyYzNiYjZmOWU3OTliOWZmYTZhNDgxODkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvU0QubWQiLCJ0eXBlIjoiU0QifSwic3VwZXJzZWRlcyI6bnVsbCwidGFyZ2V0X2lkIjoic2hhMjU2OjhkMzRmOTQ1ODQ1YTY4ZDRmODNiODU4YTc5ZTNhODcxYzUyZDkxMjQ4MTdlMjM3YTY0NWMwMWZlMTVhMzcyZTQifQ |
| fc33adc6-b449-4e9b-a54e-fa7ec3ca033d | sha256:7647742be59c7df5b5b7bb21df9e31d6bc92003084a61bd499cb27304f008391 | eyJiaW5kaW5nX2lkIjoiZmMzM2FkYzYtYjQ0OS00ZTliLWE1NGUtZmE3ZWMzY2EwMzNkIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmQxN2M5MWE3MThkZGYyYTM1ZDJjNmU5MGUyMDhhNjM5Y2E0ZTFiMGM2NTU2Mjg5N2M5YmJkZDI2ODc1OTVjMDIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiIxNGZjYmFkMy1hOTkzLTRjZGItYTdhMC1kYjY2OTQwMzljYTkiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImY2NTA0ZDU1LTAzM2QtNDQ0MS05ZDhjLWJlOGQwYmE3NWE5MCIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImI3MDg2ZGZhLWJhZjYtNGI3YS1iMmE5LWY1ZDgyZDg3NjJkZCIsInJldmlzaW9uIjoxMH0sIm9yaWdpbiI6InJldmlld2VkX21hcHBpbmciLCJyZWxhdGlvbnNoaXAiOnsiZnJvbSI6IlRQIiwicmVsYXRpb25zaGlwIjoiZGVyaXZlZF9mcm9tIiwidG8iOiJTRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjdlNmY2YjJjMjJkYWU0M2VjZTBjZGM4ZGRlZWY0ODk4MTQ3NWIwMmY2ZmVlMzQ5ZDRlNjZhZDI4Y2ZmZGYxNzciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvdHAtZm9yd2FyZC10ZXN0LXJldmlzaW9uL2Rlcml2YXRpb24tcmV2aWV3Lmpzb24iLCJyZXZpZXdlciI6IlRQIGZvcndhcmQtdGVzdCByZXZpc2lvbiBhZ2VudCAoY29vcGVyYXRpdmUgc2VtYW50aWMgcmV2aWV3OyBub3QgaHVtYW4gYXBwcm92YWwpIn0sInJ1bl9pZCI6InRwLWF1dGhvcmluZy10ZXN0Iiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpiMWJmYmQ3ZmJhZGE3Nzc2MWZmNWFjODliZmViODg5NWI0NzY3YWM2MmMzYmI2ZjllNzk5YjlmZmE2YTQ4MTg5IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3RwLWF1dGhvcmluZy10ZXN0L1NELm1kIiwidHlwZSI6IlNEIn0sInN1cGVyc2VkZXMiOiI1YTc5MjI4OC1iMGVlLTQ5MjktYjMzZi0wYmQwNWQxNTkyM2IiLCJ0YXJnZXRfaWQiOiJzaGEyNTY6OGQzNGY5NDU4NDVhNjhkNGY4M2I4NThhNzllM2E4NzFjNTJkOTEyNDgxN2UyMzdhNjQ1YzAxZmUxNWEzNzJlNCJ9 |
