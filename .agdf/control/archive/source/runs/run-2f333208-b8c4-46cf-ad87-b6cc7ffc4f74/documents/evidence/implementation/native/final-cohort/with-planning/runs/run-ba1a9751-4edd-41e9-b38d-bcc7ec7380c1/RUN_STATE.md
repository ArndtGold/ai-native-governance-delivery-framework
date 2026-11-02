# AGDF Run State

## Run Meta

- control_state_version: 3
- run_id: run-ba1a9751-4edd-41e9-b38d-bcc7ec7380c1
- lifecycle: active
- revision: 1
- revision_id: 17473c20-7ad2-4d23-b085-462680e0866f
- content_seal: sha256:b1c389902d00ee15bf091fd2541ea6c945205b0469ab5bfd65d31cc7a9838bd6
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-10-31T17:07:07.169Z
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Enable read-only exact-ID lookup of existing local evidence notes within this project.

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
| UR | .agdf/control/artefacts/run-ba1a9751-4edd-41e9-b38d-bcc7ec7380c1/UR.md | draft |  |
| Brownfield Review |  | missing |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| Planned UR Snapshot | .agdf/control/artefacts/run-ba1a9751-4edd-41e9-b38d-bcc7ec7380c1/PLANNED_UR.md | done |  |
| Planned UR Origin | .agdf/control/artefacts/run-ba1a9751-4edd-41e9-b38d-bcc7ec7380c1/PLANNED_ORIGIN.json | done |  |

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
| Planned UR handoff | .agdf/control/planned/plan-2d2eed01-526d-4aeb-9662-8ac55066b366/UR.md | sha256:ae7d529ed357a3d3cbedd2124aca8c1a6d15f9fc550ecf2648e7571eb885ab77 | unapproved imported intent |

## Closeout

- next_allowed_action: Review the imported UR and request exact Approval: UR.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| ba1a9751-4edd-41e9-b38d-bcc7ec7380c1 | sha256:531b1a5f708f62c5709698d3a96a940f87debafd460da5484fafe23786e498a8 | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMzFUMTc6MDc6MDcuMTc1WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6bnVsbCwicmVjb3JkIjp7Im9yaWdpbiI6eyJkaWdlc3QiOiJzaGEyNTY6MGI3MTYzM2RiOWE3ZjU3NTQ2ZWFiYzA4NTk3MWNhMzhhZTJjZGJhMjdmZDkzYmRhMDExMDBhMTg0OGQ1OGMwZSIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9ydW4tYmExYTk3NTEtNGVkZC00MWU5LWIzOGQtYmNjN2VjNzM4MGMxL1BMQU5ORURfT1JJR0lOLmpzb24ifSwicGxhbm5lZCI6eyJkaWdlc3QiOiJzaGEyNTY6YWU3ZDUyOWVkMzU3YTNkM2NiZWRkMjEyNGFjYThjMWE2ZDE1ZjlmYzU1MGVjZjI2NDhlNzU3MWViODg1YWI3NyIsInBhdGgiOiIuYWdkZi9jb250cm9sL3BsYW5uZWQvcGxhbi0yZDJlZWQwMS01MjZkLTRhZWItOTY2Mi04YWM1NTA2NmIzNjYvVVIubWQiLCJwbGFuX2lkIjoicGxhbi0yZDJlZWQwMS01MjZkLTRhZWItOTY2Mi04YWM1NTA2NmIzNjYifSwic25hcHNob3QiOnsiZGlnZXN0Ijoic2hhMjU2OmFlN2Q1MjllZDM1N2EzZDNjYmVkZDIxMjRhY2E4YzFhNmQxNWY5ZmM1NTBlY2YyNjQ4ZTc1NzFlYjg4NWFiNzciLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvcnVuLWJhMWE5NzUxLTRlZGQtNDFlOS1iMzhkLWJjYzdlYzczODBjMS9QTEFOTkVEX1VSLm1kIn0sInRpdGxlIjoiRXZpZGVuY2Ugbm90ZSBsb29rdXAiLCJ1ciI6eyJkaWdlc3QiOiJzaGEyNTY6YWU3ZDUyOWVkMzU3YTNkM2NiZWRkMjEyNGFjYThjMWE2ZDE1ZjlmYzU1MGVjZjI2NDhlNzU3MWViODg1YWI3NyIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9ydW4tYmExYTk3NTEtNGVkZC00MWU5LWIzOGQtYmNjN2VjNzM4MGMxL1VSLm1kIn19LCJyZXN1bHRpbmdfcmV2aXNpb25faWQiOiIxNzQ3M2MyMC03YWQyLTRkMjMtYjA4NS00NjI2ODBlMDg2NmYiLCJyZXZpc2lvbiI6MX0sImV4cGVjdGVkX3JldmlzaW9uX2lkIjpudWxsLCJpbnB1dF9yZXNvbHV0aW9uIjp7ImNvbmZpZ3VyYXRpb24iOnsiY29uZmlnX2RpZ2VzdCI6InNoYTI1NjoxNWE2ZTk1MmZiNzQ0OTFjNTZkYjZiODUxYzc0MTFhMWUxYzQyNzBlMTMyM2NmYzlkMDQ1NTMzYzJjNzZmMGUxIiwiY29udHJvbCI6ImFjdGl2ZSIsImNvbnRyb2xfbGF5b3V0IjoicGxhbm5lZC11cnMtdjEiLCJkZWZhdWx0c19kaWdlc3QiOiJzaGEyNTY6YzA0NWM1Mjk0ODQ0NmVlMGMwNzkwOTljNTNjMjNiNWNlMGQ0ODA0N2MxZWE5OWJjMDhjMGNiY2JlY2I4MGIzMyIsInJvb3QiOiIvcHJpdmF0ZS90bXAvYWdkZi1wbGFubmVkLW5hdGl2ZS1xdWFsaWZpY2F0aW9uL2ZpbmFsLWNvaG9ydC93aXRoLXBsYW5uaW5nIiwic291cmNlcyI6eyJhcnRpZmFjdF9sYW5ndWFnZSI6eyJkaWdlc3QiOiJzaGEyNTY6MTVhNmU5NTJmYjc0NDkxYzU2ZGI2Yjg1MWM3NDExYTFlMWM0MjcwZTEzMjNjZmM5ZDA0NTUzM2MyYzc2ZjBlMSIsImtpbmQiOiJwcm9qZWN0IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvY29uZmlnLmpzb24ifSwiY2hhdF9sYW5ndWFnZSI6eyJraW5kIjoiZXhwbGljaXQifSwiZ2F0ZV9jaGVja192YXJpYW50Ijp7ImRpZ2VzdCI6InNoYTI1NjpjMDQ1YzUyOTQ4NDQ2ZWUwYzA3OTA5OWM1M2MyM2I1Y2UwZDQ4MDQ3YzFlYTk5YmMwOGMwY2JjYmVjYjgwYjMzIiwia2luZCI6InBsdWdpbiIsInBhdGgiOiJtZXRhL2FnZGYtZGVmYXVsdHMuanNvbiJ9LCJwcmVzZW50YXRpb25fcm91dGUiOnsiZGlnZXN0Ijoic2hhMjU2OmMwNDVjNTI5NDg0NDZlZTBjMDc5MDk5YzUzYzIzYjVjZTBkNDgwNDdjMWVhOTliYzA4YzBjYmNiZWNiODBiMzMiLCJraW5kIjoicGx1Z2luIiwicGF0aCI6Im1ldGEvYWdkZi1kZWZhdWx0cy5qc29uIn19LCJ2YWx1ZXMiOnsiYXJ0aWZhY3RfbGFuZ3VhZ2UiOiJlbiIsImNoYXRfbGFuZ3VhZ2UiOiJlbiIsImdhdGVfY2hlY2tfdmFyaWFudCI6bnVsbCwicHJlc2VudGF0aW9uX3JvdXRlIjoibWFya2Rvd24ifX0sImVmZmVjdGl2ZV9kaWdlc3QiOiJzaGEyNTY6NTMxYjFhNWY3MDhmNjJjNTcwOTY5OGQzYTk2YTk0MGY4N2RlYmFmZDQ2MGRhNTQ4NGZhZmUyMzc4NmU0OThhOCIsImZpZWxkcyI6e30sImtpbmQiOiJydW4uY3JlYXRlX2Zyb21fcGxhbm5lZCIsImxvZ2ljYWxfZGlnZXN0Ijoic2hhMjU2OjUzMWIxYTVmNzA4ZjYyYzU3MDk2OThkM2E5NmE5NDBmODdkZWJhZmQ0NjBkYTU0ODRmYWZlMjM3ODZlNDk4YTgiLCJvcGVyYXRpb25faWQiOiJiYTFhOTc1MS00ZWRkLTQxZTktYjM4ZC1iY2M3ZWM3MzgwYzEiLCJyZWNvcmRfdmVyc2lvbiI6IjMiLCJzY2hlbWFfdmVyc2lvbiI6MX0sImtpbmQiOiJydW4uY3JlYXRlX2Zyb21fcGxhbm5lZCIsIm9wZXJhdGlvbl9pZCI6ImJhMWE5NzUxLTRlZGQtNDFlOS1iMzhkLWJjYzdlYzczODBjMSIsInByb2R1Y2VyIjp7ImNvbnRyYWN0IjoicnVuLWNvbW1hbmQvMSIsInBhY2thZ2VfdmVyc2lvbiI6IjAuMjAuMiJ9LCJyZXF1ZXN0X2RpZ2VzdCI6InNoYTI1Njo1MzFiMWE1ZjcwOGY2MmM1NzA5Njk4ZDNhOTZhOTQwZjg3ZGViYWZkNDYwZGE1NDg0ZmFmZTIzNzg2ZTQ5OGE4IiwicnVuX2lkIjoicnVuLWJhMWE5NzUxLTRlZGQtNDFlOS1iMzhkLWJjYzdlYzczODBjMSIsInNjaGVtYV92ZXJzaW9uIjoicmVzb2x2ZWQvMSIsInRhcmdldF9pZCI6InNoYTI1NjphZjNhNDdiZGUzZGNjN2NlZGRjYzkxMWMyYWY1MDhjYWYwOGI1YjE2YzY4NWVhMjJhMGQzNWQ0MWQyNzgxMTc0In0 |
