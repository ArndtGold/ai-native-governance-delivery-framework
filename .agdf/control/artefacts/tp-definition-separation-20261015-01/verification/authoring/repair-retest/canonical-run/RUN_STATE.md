# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: tp-authoring-test
- lifecycle: active
- revision: 9
- revision_id: ab2a5710-c498-4d2e-8c25-399d2991a6b8
- content_seal: sha256:ea93cb47dba8eba8e421fc93c826a1a3ad9a2017ade84639c390fcb7177c2d63
- approval_seal: sha256:dac70d02865e8e00268658cb2c63b69fb1c03918d73575b43b61e31d816dbdea
- updated_at: 2026-10-15T08:46:34.328Z
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
| UR | approved | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 0a253879-ee3d-48a4-afc4-e4ee7b769ddd sha256:06163eeae4d943b03ff3e03ebc3b8334d3f1ebf663b6a8d956adc1da98683b62 |
| PRD | approved | `Approval: PRD` · 2026-10-15 · revision 5 · `.agdf/control/artefacts/tp-authoring-test/PRD.md` sha256:6885474fee584743 · presentation e256814d-defe-4d53-8145-4145d3bda72b sha256:683adc197b3f1e84e30d78ee3e6168bc2d545fe3e2198858f7c7646da2cafbb5 |
| SD | approved | `Approval: SD` · 2026-10-15 · revision 7 · `.agdf/control/artefacts/tp-authoring-test/SD.md` sha256:b1bfbd7fbada7776 · presentation 9c52c13b-742a-466b-a602-d9b1cd63b20d sha256:74ae68a646ec835375d87c92bd3f8e007ba5e41735242ff6f9d4fcebf99b4d74 |
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
| Binding proof 3a05df67-f342-4cd3-962c-95708cc7e31e | .agdf/control/artefacts/tp-authoring-test/mapping-0298abe3-d4f6-49d1-a7d3-b6034b92726a.json | done | Subordinate reviewed mapping evidence |
| Binding proof 5812b11a-fdb3-47ed-b067-367fb5e210e8 | .agdf/control/artefacts/tp-authoring-test/sd-mapping-aec14c9d-0996-4257-843b-d25bc10834b8.json | done | Subordinate reviewed mapping evidence |
| Binding proof 626ed7a7-8805-41ad-84f4-66d662204c90 | .agdf/control/artefacts/tp-authoring-test/forward-retest-mapping.json | done | Subordinate reviewed mapping evidence |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Synthetic public-contract test route, never live authorization
- evidence: .agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-15 · revision 2 · `.agdf/control/artefacts/tp-authoring-test/UR.md` sha256:ada74f10a4c17313 · presentation 0a253879-ee3d-48a4-afc4-e4ee7b769ddd sha256:06163eeae4d943b03ff3e03ebc3b8334d3f1ebf663b6a8d956adc1da98683b62 |
| PRD | derived_from | UR | binding 3a05df67-f342-4cd3-962c-95708cc7e31e; reviewed by synthetic test reviewer; .agdf/control/artefacts/tp-authoring-test/mapping-0298abe3-d4f6-49d1-a7d3-b6034b92726a.json |
| SD | derived_from | PRD | binding 5812b11a-fdb3-47ed-b067-367fb5e210e8; reviewed by synthetic SD test reviewer; .agdf/control/artefacts/tp-authoring-test/sd-mapping-aec14c9d-0996-4257-843b-d25bc10834b8.json |
| TP | derived_from | SD | binding 626ed7a7-8805-41ad-84f4-66d662204c90; reviewed by Codex independent TP repair-retest author; .agdf/control/artefacts/tp-authoring-test/forward-retest-mapping.json |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/tp-authoring-test/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/tp-authoring-test/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/mapping-0298abe3-d4f6-49d1-a7d3-b6034b92726a.json | PRD derived_from UR; binding 3a05df67-f342-4cd3-962c-95708cc7e31e; operation 69e88e2c-2519-464a-a8ce-20ace0e06afa; aea6110d-d843-4800-927a-8c52b8a72402 -> ab99e732-e42d-4ebd-afd2-0dff3ef86089 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/sd-mapping-aec14c9d-0996-4257-843b-d25bc10834b8.json | SD derived_from PRD; binding 5812b11a-fdb3-47ed-b067-367fb5e210e8; operation 79f802fc-b748-4b1e-a271-91b50182d508; d64cedd4-135b-4586-b851-25641a4dce32 -> 8bea3623-480a-4370-bfc0-652633dcc408 | reviewed cooperative mapping |
| Artefact source binding | .agdf/control/artefacts/tp-authoring-test/forward-retest-mapping.json | TP derived_from SD; binding 626ed7a7-8805-41ad-84f4-66d662204c90; operation ce1bed2b-794c-401b-b7a1-458a7f4dd7f4; 12ee1903-ebb8-4fa7-b909-92264ed2a070 -> ab2a5710-c498-4d2e-8c25-399d2991a6b8 | reviewed cooperative mapping |

## Closeout

- next_allowed_action: Draft or refine the Task/Test Plan; do not implement before TP is approved.
- quality_outlook:

## Artefact Bindings

- schema_version: 1

| binding_id | receipt_digest | receipt |
|---|---|---|
| 3a05df67-f342-4cd3-962c-95708cc7e31e | sha256:7f22f42bd9fb35b3891e865c8e2c95fab5c84e03efdd98e9017dad09b0f5416b | eyJiaW5kaW5nX2lkIjoiM2EwNWRmNjctZjM0Mi00Y2QzLTk2MmMtOTU3MDhjYzdlMzFlIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwic3RhdHVzIjoiZHJhZnQiLCJ0eXBlIjoiUFJEIn0sIm9wZXJhdGlvbiI6eyJpZCI6IjY5ZTg4ZTJjLTI1MTktNDY0YS1hOGNlLTIwYWNlMGUwNmFmYSIsInByZXZpb3VzX3JldmlzaW9uX2lkIjoiYWVhNjExMGQtZDg0My00ODAwLTkyN2EtOGM1MmI4YTcyNDAyIiwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiYWI5OWU3MzItZTQyZC00ZWJkLWFmZDItMGRmZjNlZjg2MDg5IiwicmV2aXNpb24iOjV9LCJvcmlnaW4iOiJyZXZpZXdlZF9tYXBwaW5nIiwicmVsYXRpb25zaGlwIjp7ImZyb20iOiJQUkQiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlVSIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6NmNlMDc0ZDZiMjlkM2RiMDVjNDBiNjhiMGUxYWMxZGI4NGNlYTM1Y2M5OTZjODViMGFhODI1ZjZiM2YyMzIyZSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9tYXBwaW5nLTAyOThhYmUzLWQ0ZjYtNDlkMS1hN2QzLWI2MDM0YjkyNzI2YS5qc29uIiwicmV2aWV3ZXIiOiJzeW50aGV0aWMgdGVzdCByZXZpZXdlciJ9LCJydW5faWQiOiJ0cC1hdXRob3JpbmctdGVzdCIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6YWRhNzRmMTBhNGMxNzMxMzRjZjIxNzUyY2ZjMGE3NjU1YzFlZmUwYTgwMTk2N2JiZDM2MWE2NWM5ZDk1NWU3YSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9VUi5tZCIsInR5cGUiOiJVUiJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6ZmVjMDc0NmFhOTgxZjkwNDA0MmMwMmE1NzU3OGM0YTU5MDZjY2VhNmIwOGJkMWFiNmU5ODk1YWYyODc1YzlhNCJ9 |
| 5812b11a-fdb3-47ed-b067-367fb5e210e8 | sha256:4d7d3bdee6906aa208219357579abbddec5ff06585a55de01b2b7134dcd9e43f | eyJiaW5kaW5nX2lkIjoiNTgxMmIxMWEtZmRiMy00N2VkLWIwNjctMzY3ZmI1ZTIxMGU4IiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OmIxYmZiZDdmYmFkYTc3NzYxZmY1YWM4OWJmZWI4ODk1YjQ3NjdhYzYyYzNiYjZmOWU3OTliOWZmYTZhNDgxODkiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvU0QubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJTRCJ9LCJvcGVyYXRpb24iOnsiaWQiOiI3OWY4MDJmYy1iNzQ4LTRiMWUtYTI3MS05MWI1MDE4MmQ1MDgiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6ImQ2NGNlZGQ0LTEzNWItNDU4Ni1iODUxLTI1NjQxYTRkY2UzMiIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjhiZWEzNjIzLTQ4MGEtNDM3MC1iZmMwLTY1MjYzM2RjYzQwOCIsInJldmlzaW9uIjo3fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiU0QiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlBSRCJ9LCJyZXZpZXciOnsiZGlnZXN0Ijoic2hhMjU2OjY1ZDRjZDRhYTllNDQwODljYzllZTE4NmQzYTE5MTA5OTc5Y2NlNGIyMzA1Njk5NDQxM2UyZmNjYTgzNjNhNzUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3Qvc2QtbWFwcGluZy1hZWMxNGM5ZC0wOTk2LTQyNTctODQzYi1kMjViYzEwODM0YjguanNvbiIsInJldmlld2VyIjoic3ludGhldGljIFNEIHRlc3QgcmV2aWV3ZXIifSwicnVuX2lkIjoidHAtYXV0aG9yaW5nLXRlc3QiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjY4ODU0NzRmZWU1ODQ3NDNiYWYxOWExOTY4ZDRlNDIxZGE1OTZiOTQzNjhlMGMzMjhhZjcxYTFkZTk0YjExYzIiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvUFJELm1kIiwidHlwZSI6IlBSRCJ9LCJzdXBlcnNlZGVzIjpudWxsLCJ0YXJnZXRfaWQiOiJzaGEyNTY6ZmVjMDc0NmFhOTgxZjkwNDA0MmMwMmE1NzU3OGM0YTU5MDZjY2VhNmIwOGJkMWFiNmU5ODk1YWYyODc1YzlhNCJ9 |
| 626ed7a7-8805-41ad-84f4-66d662204c90 | sha256:a2a93f22048a9a1948ffd6f91c809cae5947f8edf82d3aa9bc4fc1a2654a7b71 | eyJiaW5kaW5nX2lkIjoiNjI2ZWQ3YTctODgwNS00MWFkLTg0ZjQtNjZkNjYyMjA0YzkwIiwiZGVzdGluYXRpb24iOnsiZGlnZXN0Ijoic2hhMjU2OjBkZDhlOWI4YjIwZWQ5YTFmYTg5OTA5YTJjYWU0OTIwOWQ2NmE4ZGU1NjhkNjMzM2EzNWMxYjE2YTIzYzVlM2UiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvdHAtYXV0aG9yaW5nLXRlc3QvVFAubWQiLCJzdGF0dXMiOiJkcmFmdCIsInR5cGUiOiJUUCJ9LCJvcGVyYXRpb24iOnsiaWQiOiJjZTFiZWQyYi03OTRjLTQwMWItYjdhMS00NThhN2Y0ZGQ3ZjQiLCJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjEyZWUxOTAzLWViYjgtNGZhNy1iOTA5LTkyMjY0ZWQyYTA3MCIsInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImFiMmE1NzEwLWM0OTgtNGQyZS04YzI1LTM5OWQyOTkxYTZiOCIsInJldmlzaW9uIjo5fSwib3JpZ2luIjoicmV2aWV3ZWRfbWFwcGluZyIsInJlbGF0aW9uc2hpcCI6eyJmcm9tIjoiVFAiLCJyZWxhdGlvbnNoaXAiOiJkZXJpdmVkX2Zyb20iLCJ0byI6IlNEIn0sInJldmlldyI6eyJkaWdlc3QiOiJzaGEyNTY6NDczYWU4Y2U5M2Q5MzE2ZjkzYTViOTU3YzRlNzZmNTAxNmY5MWEzYTY1MmZjNTIyMmM4MDhjYmQwMmY5MDQ0MSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy90cC1hdXRob3JpbmctdGVzdC9mb3J3YXJkLXJldGVzdC1tYXBwaW5nLmpzb24iLCJyZXZpZXdlciI6IkNvZGV4IGluZGVwZW5kZW50IFRQIHJlcGFpci1yZXRlc3QgYXV0aG9yIn0sInJ1bl9pZCI6InRwLWF1dGhvcmluZy10ZXN0Iiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlIjp7ImRpZ2VzdCI6InNoYTI1NjpiMWJmYmQ3ZmJhZGE3Nzc2MWZmNWFjODliZmViODg5NWI0NzY3YWM2MmMzYmI2ZjllNzk5YjlmZmE2YTQ4MTg5IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3RwLWF1dGhvcmluZy10ZXN0L1NELm1kIiwidHlwZSI6IlNEIn0sInN1cGVyc2VkZXMiOm51bGwsInRhcmdldF9pZCI6InNoYTI1NjpmZWMwNzQ2YWE5ODFmOTA0MDQyYzAyYTU3NTc4YzRhNTkwNmNjZWE2YjA4YmQxYWI2ZTk4OTVhZjI4NzVjOWE0In0 |
