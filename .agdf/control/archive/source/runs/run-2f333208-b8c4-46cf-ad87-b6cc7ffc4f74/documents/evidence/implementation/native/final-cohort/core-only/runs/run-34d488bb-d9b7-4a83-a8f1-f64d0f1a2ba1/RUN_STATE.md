# AGDF Run State

## Run Meta

- control_state_version: 3
- run_id: run-34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1
- lifecycle: active
- revision: 1
- revision_id: 2a79cbbd-708d-4d44-8e7f-74b822b55054
- content_seal: sha256:812739453f8aef6a3ecc5818fd214eea82f8617a96ce027726a1becf9c18b988
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-10-31T17:05:07.794Z
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Show the matching receipt path, with explicit absent and ambiguous results.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | New run created. |
| What is approved? | Nothing yet. |
| What is missing? | Durable UR and exact approval. |
| What is the next allowed action? | Draft the UR. |
| What is explicitly forbidden right now? | Later artefacts and implementation. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing |  |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/run-34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1/UR.md | draft |  |
| Brownfield Review |  | missing |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Planned UR Snapshot | .agdf/control/artefacts/run-34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1/PLANNED_UR.md | done |  |
| Planned UR Origin | .agdf/control/artefacts/run-34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1/PLANNED_ORIGIN.json | done |  |

## Mode/Slice Decision

- decision:
- required_next_gate:
- scope_reason:
- evidence:

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| Planned UR handoff | .agdf/control/planned/plan-92f42be5-fcb7-488a-ad8e-42ed96904d2f/UR.md | sha256:5c1894fff29b5ecbcda575027d8283c8f7752937ffaa79e98b63fa578ca432b6 | unapproved imported intent |

## Closeout

- next_allowed_action: Review the imported UR and request exact Approval: UR.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| 34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1 | sha256:2b9764cc9595ef754f2b1b5d0736199a139474ff215da0b8bea11b2b0a6e2648 | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMzFUMTc6MDU6MDcuNzk5WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6bnVsbCwicmVjb3JkIjp7Im9yaWdpbiI6eyJkaWdlc3QiOiJzaGEyNTY6YjAzNTBhNzAyNmU3MTYxMTk3M2JhMGE5MzgzYTUzMWUwZDdhNGZlYmFiMTcxZWM2NTE3NjJmMWYyOGMxNTQwZiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9ydW4tMzRkNDg4YmItZDliNy00YTgzLWE4ZjEtZjY0ZDBmMWEyYmExL1BMQU5ORURfT1JJR0lOLmpzb24ifSwicGxhbm5lZCI6eyJkaWdlc3QiOiJzaGEyNTY6NWMxODk0ZmZmMjliNWVjYmNkYTU3NTAyN2Q4MjgzYzhmNzc1MjkzN2ZmYWE3OWU5OGI2M2ZhNTc4Y2E0MzJiNiIsInBhdGgiOiIuYWdkZi9jb250cm9sL3BsYW5uZWQvcGxhbi05MmY0MmJlNS1mY2I3LTQ4OGEtYWQ4ZS00MmVkOTY5MDRkMmYvVVIubWQiLCJwbGFuX2lkIjoicGxhbi05MmY0MmJlNS1mY2I3LTQ4OGEtYWQ4ZS00MmVkOTY5MDRkMmYifSwic25hcHNob3QiOnsiZGlnZXN0Ijoic2hhMjU2OjVjMTg5NGZmZjI5YjVlY2JjZGE1NzUwMjdkODI4M2M4Zjc3NTI5MzdmZmFhNzllOThiNjNmYTU3OGNhNDMyYjYiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcnVuLTM0ZDQ4OGJiLWQ5YjctNGE4My1hOGYxLWY2NGQwZjFhMmJhMS9QTEFOTkVEX1VSLm1kIn0sInRpdGxlIjoiUmVjZWlwdCBsb29rdXAiLCJ1ciI6eyJkaWdlc3QiOiJzaGEyNTY6NWMxODk0ZmZmMjliNWVjYmNkYTU3NTAyN2Q4MjgzYzhmNzc1MjkzN2ZmYWE3OWU5OGI2M2ZhNTc4Y2E0MzJiNiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9ydW4tMzRkNDg4YmItZDliNy00YTgzLWE4ZjEtZjY0ZDBmMWEyYmExL1VSLm1kIn19LCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiIyYTc5Y2JiZC03MDhkLTRkNDQtOGU3Zi03NGI4MjJiNTUwNTQiLCJyZXZpc2lvbiI6MX0sImV4cGVjdGVkX3JldmlzaW9uX2lkIjpudWxsLCJpbnB1dF9yZXNvbHV0aW9uIjp7ImNvbmZpZ3VyYXRpb24iOnsiY29uZmlnX2RpZ2VzdCI6InNoYTI1NjoxNWE2ZTk1MmZiNzQ0OTFjNTZkYjZiODUxYzc0MTFhMWUxYzQyNzBlMTMyM2NmYzlkMDQ1NTMzYzJjNzZmMGUxIiwiY29udHJvbCI6ImFjdGl2ZSIsImNvbnRyb2xfbGF5b3V0IjoicGxhbm5lZC11cnMtdjEiLCJkZWZhdWx0c19kaWdlc3QiOiJzaGEyNTY6YzA0NWM1Mjk0ODQ0NmVlMGMwNzkwOTljNTNjMjNiNWNlMGQ0ODA0N2MxZWE5OWJjMDhjMGNiY2JlY2I4MGIzMyIsInJvb3QiOiIvcHJpdmF0ZS90bXAvYWdkZi1wbGFubmVkLW5hdGl2ZS1xdWFsaWZpY2F0aW9uL2ZpbmFsLWNvaG9ydC9jb3JlLW9ubHkiLCJzb3VyY2VzIjp7ImFydGlmYWN0X2xhbmd1YWdlIjp7ImRpZ2VzdCI6InNoYTI1NjoxNWE2ZTk1MmZiNzQ0OTFjNTZkYjZiODUxYzc0MTFhMWUxYzQyNzBlMTMyM2NmYzlkMDQ1NTMzYzJjNzZmMGUxIiwia2luZCI6InByb2plY3QiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9jb25maWcuanNvbiJ9LCJjaGF0X2xhbmd1YWdlIjp7ImtpbmQiOiJleHBsaWNpdCJ9LCJnYXRlX2NoZWNrX3ZhcmlhbnQiOnsiZGlnZXN0Ijoic2hhMjU2OmMwNDVjNTI5NDg0NDZlZTBjMDc5MDk5YzUzYzIzYjVjZTBkNDgwNDdjMWVhOTliYzA4YzBjYmNiZWNiODBiMzMiLCJraW5kIjoicGx1Z2luIiwicGF0aCI6Im1ldGEvYWdkZi1kZWZhdWx0cy5qc29uIn0sInByZXNlbnRhdGlvbl9yb3V0ZSI6eyJkaWdlc3QiOiJzaGEyNTY6YzA0NWM1Mjk0ODQ0NmVlMGMwNzkwOTljNTNjMjNiNWNlMGQ0ODA0N2MxZWE5OWJjMDhjMGNiY2JlY2I4MGIzMyIsImtpbmQiOiJwbHVnaW4iLCJwYXRoIjoibWV0YS9hZ2RmLWRlZmF1bHRzLmpzb24ifX0sInZhbHVlcyI6eyJhcnRpZmFjdF9sYW5ndWFnZSI6ImVuIiwiY2hhdF9sYW5ndWFnZSI6ImVuIiwiZ2F0ZV9jaGVja192YXJpYW50IjpudWxsLCJwcmVzZW50YXRpb25fcm91dGUiOiJtYXJrZG93biJ9fSwiZWZmZWN0aXZlX2RpZ2VzdCI6InNoYTI1NjoyYjk3NjRjYzk1OTVlZjc1NGYyYjFiNWQwNzM2MTk5YTEzOTQ3NGZmMjE1ZGEwYjhiZWExMWIyYjBhNmUyNjQ4IiwiZmllbGRzIjp7ImFzc3VyYW5jZSI6ImNvb3BlcmF0aXZlX2xvY2FsIiwic2NoZW1hX3ZlcnNpb24iOiIxIn0sImtpbmQiOiJydW4uY3JlYXRlX2Zyb21fcGxhbm5lZCIsImxvZ2ljYWxfZGlnZXN0Ijoic2hhMjU2OjU5ODE0MzNiYWM0MWJhOGExNDQzNDM1MDNhZTQ0ODI3ZmZhODEwM2U5NmNhNmM0OTY4NjQ0MThkN2RlMDJjNDYiLCJvcGVyYXRpb25faWQiOiIzNGQ0ODhiYi1kOWI3LTRhODMtYThmMS1mNjRkMGYxYTJiYTEiLCJyZWNvcmRfdmVyc2lvbiI6IjMiLCJzY2hlbWFfdmVyc2lvbiI6MX0sImtpbmQiOiJydW4uY3JlYXRlX2Zyb21fcGxhbm5lZCIsIm9wZXJhdGlvbl9pZCI6IjM0ZDQ4OGJiLWQ5YjctNGE4My1hOGYxLWY2NGQwZjFhMmJhMSIsInByb2R1Y2VyIjp7ImNvbnRyYWN0IjoicnVuLWNvbW1hbmQvMSIsInBhY2thZ2VfdmVyc2lvbiI6IjAuMjAuMiJ9LCJyZXF1ZXN0X2RpZ2VzdCI6InNoYTI1NjoyYjk3NjRjYzk1OTVlZjc1NGYyYjFiNWQwNzM2MTk5YTEzOTQ3NGZmMjE1ZGEwYjhiZWExMWIyYjBhNmUyNjQ4IiwicnVuX2lkIjoicnVuLTM0ZDQ4OGJiLWQ5YjctNGE4My1hOGYxLWY2NGQwZjFhMmJhMSIsInNjaGVtYV92ZXJzaW9uIjoicmVzb2x2ZWQvMSIsInRhcmdldF9pZCI6InNoYTI1NjphNzdiZWE3NWQyNGJmNDM0YWI2ZDA5YjFjMTFmMzk5ZDczODUzZDVhN2ExMDc4MmEyODQ4ZGE0ZGMwZTk0YTdmIn0 |
