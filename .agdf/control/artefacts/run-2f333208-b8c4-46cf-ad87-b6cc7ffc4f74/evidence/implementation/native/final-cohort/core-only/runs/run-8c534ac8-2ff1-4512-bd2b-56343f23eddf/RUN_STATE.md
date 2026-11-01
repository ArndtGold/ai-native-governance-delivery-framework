# AGDF Run State

## Run Meta

- control_state_version: 3
- run_id: run-8c534ac8-2ff1-4512-bd2b-56343f23eddf
- lifecycle: active
- revision: 1
- revision_id: 40ae896b-b590-490a-a05f-8b117dd2e5c1
- content_seal: sha256:45501fb4a6b9de0397e0e0f1c489075481a0878d5dc2fb87d49fb353897fbbaa
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-10-31T17:05:16.661Z
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Direct Core creation check

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
| UR |  | missing |  |
| Brownfield Review |  | missing |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |

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

## Closeout

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| 8c534ac8-2ff1-4512-bd2b-56343f23eddf | sha256:142839d583f6023afacc1ea78626c1a98190f07385019a2c40d785d7414bc8e0 | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMzFUMTc6MDU6MTYuNjYyWiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6bnVsbCwicmVjb3JkIjp7InRpdGxlIjoiRGlyZWN0IENvcmUgY3JlYXRpb24gY2hlY2sifSwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiNDBhZTg5NmItYjU5MC00OTBhLWEwNWYtOGIxMTdkZDJlNWMxIiwicmV2aXNpb24iOjF9LCJleHBlY3RlZF9yZXZpc2lvbl9pZCI6bnVsbCwiaW5wdXRfcmVzb2x1dGlvbiI6eyJjb25maWd1cmF0aW9uIjp7ImNvbmZpZ19kaWdlc3QiOiJzaGEyNTY6MTVhNmU5NTJmYjc0NDkxYzU2ZGI2Yjg1MWM3NDExYTFlMWM0MjcwZTEzMjNjZmM5ZDA0NTUzM2MyYzc2ZjBlMSIsImNvbnRyb2wiOiJhY3RpdmUiLCJjb250cm9sX2xheW91dCI6InBsYW5uZWQtdXJzLXYxIiwiZGVmYXVsdHNfZGlnZXN0Ijoic2hhMjU2OmMwNDVjNTI5NDg0NDZlZTBjMDc5MDk5YzUzYzIzYjVjZTBkNDgwNDdjMWVhOTliYzA4YzBjYmNiZWNiODBiMzMiLCJyb290IjoiL3ByaXZhdGUvdG1wL2FnZGYtcGxhbm5lZC1uYXRpdmUtcXVhbGlmaWNhdGlvbi9maW5hbC1jb2hvcnQvY29yZS1vbmx5Iiwic291cmNlcyI6eyJhcnRpZmFjdF9sYW5ndWFnZSI6eyJkaWdlc3QiOiJzaGEyNTY6MTVhNmU5NTJmYjc0NDkxYzU2ZGI2Yjg1MWM3NDExYTFlMWM0MjcwZTEzMjNjZmM5ZDA0NTUzM2MyYzc2ZjBlMSIsImtpbmQiOiJwcm9qZWN0IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvY29uZmlnLmpzb24ifSwiY2hhdF9sYW5ndWFnZSI6eyJraW5kIjoiZXhwbGljaXQifSwiZ2F0ZV9jaGVja192YXJpYW50Ijp7ImRpZ2VzdCI6InNoYTI1NjpjMDQ1YzUyOTQ4NDQ2ZWUwYzA3OTA5OWM1M2MyM2I1Y2UwZDQ4MDQ3YzFlYTk5YmMwOGMwY2JjYmVjYjgwYjMzIiwia2luZCI6InBsdWdpbiIsInBhdGgiOiJtZXRhL2FnZGYtZGVmYXVsdHMuanNvbiJ9LCJwcmVzZW50YXRpb25fcm91dGUiOnsiZGlnZXN0Ijoic2hhMjU2OmMwNDVjNTI5NDg0NDZlZTBjMDc5MDk5YzUzYzIzYjVjZTBkNDgwNDdjMWVhOTliYzA4YzBjYmNiZWNiODBiMzMiLCJraW5kIjoicGx1Z2luIiwicGF0aCI6Im1ldGEvYWdkZi1kZWZhdWx0cy5qc29uIn19LCJ2YWx1ZXMiOnsiYXJ0aWZhY3RfbGFuZ3VhZ2UiOiJlbiIsImNoYXRfbGFuZ3VhZ2UiOiJlbiIsImdhdGVfY2hlY2tfdmFyaWFudCI6bnVsbCwicHJlc2VudGF0aW9uX3JvdXRlIjoibWFya2Rvd24ifX0sImVmZmVjdGl2ZV9kaWdlc3QiOiJzaGEyNTY6MTQyODM5ZDU4M2Y2MDIzYWZhY2MxZWE3ODYyNmMxYTk4MTkwZjA3Mzg1MDE5YTJjNDBkNzg1ZDc0MTRiYzhlMCIsImZpZWxkcyI6eyJhc3N1cmFuY2UiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInNjaGVtYV92ZXJzaW9uIjoiMSJ9LCJraW5kIjoicnVuLmNyZWF0ZSIsImxvZ2ljYWxfZGlnZXN0Ijoic2hhMjU2OjlmZGIzODM3M2E5YTQwYjA1MGIzNzFkNDljMjYyYWEyMDY0MWM5MWM1ZDk5ZjVkNjYyZDMwMWE4MGNmM2YxNDgiLCJvcGVyYXRpb25faWQiOiI4YzUzNGFjOC0yZmYxLTQ1MTItYmQyYi01NjM0M2YyM2VkZGYiLCJyZWNvcmRfdmVyc2lvbiI6IjIiLCJzY2hlbWFfdmVyc2lvbiI6MX0sImtpbmQiOiJydW4uY3JlYXRlIiwib3BlcmF0aW9uX2lkIjoiOGM1MzRhYzgtMmZmMS00NTEyLWJkMmItNTYzNDNmMjNlZGRmIiwicHJvZHVjZXIiOnsiY29udHJhY3QiOiJydW4tY29tbWFuZC8xIiwicGFja2FnZV92ZXJzaW9uIjoiMC4yMC4yIn0sInJlcXVlc3RfZGlnZXN0Ijoic2hhMjU2OjE0MjgzOWQ1ODNmNjAyM2FmYWNjMWVhNzg2MjZjMWE5ODE5MGYwNzM4NTAxOWEyYzQwZDc4NWQ3NDE0YmM4ZTAiLCJydW5faWQiOiJydW4tOGM1MzRhYzgtMmZmMS00NTEyLWJkMmItNTYzNDNmMjNlZGRmIiwic2NoZW1hX3ZlcnNpb24iOiJyZXNvbHZlZC8xIiwidGFyZ2V0X2lkIjoic2hhMjU2OmE3N2JlYTc1ZDI0YmY0MzRhYjZkMDliMWMxMWYzOTlkNzM4NTNkNWE3YTEwNzgyYTI4NDhkYTRkYzBlOTRhN2YifQ |
