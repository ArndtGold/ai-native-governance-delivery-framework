# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: symlink-test-robustness-20261015-01
- lifecycle: completed
- revision: 7
- revision_id: ecea5bd4-dad7-4c70-a829-198e1ba2d763
- content_seal: sha256:219536d8afeafeb2006a930d12b906fc4934c569ed45fae56c2273a62ce836cd
- approval_seal: sha256:fd91cdac2c9262d3d6f15cdf92054fb285d9407a4eb0feb55ca20d0c113d46fb
- updated_at: 2026-10-15T16:21:01.884Z
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

The four suites run to completion on Windows hosts without symlink privilege, skip only the assertions that need a file symlink with a visible notice, and keep those assertions where symlinks are available.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Quick task delivered; OR-lite at `.agdf/control/artefacts/symlink-test-robustness-20261015-01/OR.md`. |
| What is approved? | Approval: UR |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Run completed; prepare a VCS handoff only when explicitly requested. |
| What is explicitly forbidden right now? | repeat completed Run work; perform VCS or release actions automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-15 · revision 3 · `.agdf/control/artefacts/symlink-test-robustness-20261015-01/UR.md` sha256:4c942ab1ccc84c49 · presentation 9cb493de-ddcb-44e6-b872-d39cb33324f5 sha256:b9f0cbf31418e276f8747512b92cc199a93ba9c47efb2b2b81271869fd059b43 |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR | .agdf/control/artefacts/symlink-test-robustness-20261015-01/CODE_REVIEW.md | done | Bound actual Code Review result |
| QA |  | missing |  |
| OR | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/OR.md` | done |  |

## Mode/Slice Decision

- decision: quick_task
- required_next_gate: Quick Task Execution
- scope_reason: Narrow test-only adoption of the existing tryLinkFile helper at four file-symlink sites; no product, architecture, policy, persistence or contract impact; CR and OR-lite remain.
- evidence: .agdf/control/artefacts/symlink-test-robustness-20261015-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-15 · revision 3 · `.agdf/control/artefacts/symlink-test-robustness-20261015-01/UR.md` sha256:4c942ab1ccc84c49 · presentation 9cb493de-ddcb-44e6-b872-d39cb33324f5 sha256:b9f0cbf31418e276f8747512b92cc199a93ba9c47efb2b2b81271869fd059b43 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `quick_task` | direct |
| .agdf/control/artefacts/symlink-test-robustness-20261015-01/CD_TESTS.md | agent | quick task implementation and checks | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/symlink-test-robustness-20261015-01/CODE_REVIEW.md | direct |
| OR-lite | `.agdf/control/artefacts/symlink-test-robustness-20261015-01/OR.md` | quick task closeout | direct |

## Closeout

- next_allowed_action: Run completed; prepare a VCS handoff only when explicitly requested.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| 4110cfd3-e3bb-4f3a-9311-95824116b870 | sha256:7ddbfd963183eb83e34747cd68cbc619adcd192efde4592dc812d213624af671 | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMTVUMTY6MjA6MzUuMzc1WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6Ijk5ZmRmODU4LWQ3NjgtNGQwNC1hNWE2LTRjNWMxMzc3ZDRjOSIsInJlY29yZCI6eyJjb3ZlcnMiOiJxdWljayB0YXNrIGltcGxlbWVudGF0aW9uIGFuZCBjaGVja3MiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjNhMmY2ZjgwYTIzNWQwMTI5MGFlNTc5NzAzNjMxOWFmMDUyN2EzMzcyM2MxN2NlNjY1MDU4ZTk1M2YxZDQ4YTgiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc3ltbGluay10ZXN0LXJvYnVzdG5lc3MtMjAyNjEwMTUtMDEvQ0RfVEVTVFMubWQifSwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6NTM4YTkwMDU1YzQ4ZTdhZWFkMzkwY2Y0ZmQ4M2ZkZmQ1YTI5OTBhMzM0M2E3Yzk5NTBjYzlhMjgyMWMwZjBmOSIsInN0YXR1cyI6ImRvbmUiLCJzdGVwIjoiZXZpZGVuY2UifSwicmVzdWx0aW5nX3JldmlzaW9uX2lkIjoiNDNkZjA1NmItNjAxZC00YjUzLThiNzktZDU2ZGNjNzZmY2NjIiwicmV2aXNpb24iOjV9LCJleHBlY3RlZF9yZXZpc2lvbl9pZCI6Ijk5ZmRmODU4LWQ3NjgtNGQwNC1hNWE2LTRjNWMxMzc3ZDRjOSIsImtpbmQiOiJzdGVwLnJlY29yZCIsIm9wZXJhdGlvbl9pZCI6IjQxMTBjZmQzLWUzYmItNGYzYS05MzExLTk1ODI0MTE2Yjg3MCIsInByb2R1Y2VyIjp7ImNvbnRyYWN0IjoicnVuLWNvbW1hbmQvMSIsInBhY2thZ2VfdmVyc2lvbiI6IjAuMTQuNSJ9LCJyZXF1ZXN0X2RpZ2VzdCI6InNoYTI1Njo3ZGRiZmQ5NjMxODNlYjgzZTM0NzQ3Y2Q2OGNiYzYxOWFkY2QxOTJlZmRlNDU5MmRjODEyZDIxMzYyNGFmNjcxIiwicnVuX2lkIjoic3ltbGluay10ZXN0LXJvYnVzdG5lc3MtMjAyNjEwMTUtMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YWZiMzE4NzNlZmE5MWQ4OTJiOTA0NjYzMTI2OGQ3OWYxYzhjYjQzYWEzOTJjMGVmNWU0ZDJmZDUwMDI5M2YxMCJ9 |
| 5a413940-d50d-4938-a1d3-f8ee14fb9710 | sha256:1d84bc1c29c5e2b0bd21737e7b83a0b7de1c328df2eba335759abdebd5b4479f | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMTVUMTY6MjA6NDcuMTU5WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjQzZGYwNTZiLTYwMWQtNGI1My04Yjc5LWQ1NmRjYzc2ZmNjYyIsInJlY29yZCI6eyJjb3ZlcnMiOiJzZWxlY3RlZCBSdW4gc2NvcGUiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjIxNTU4MDViZThmZmU4NDAwYmMyZTM0YjkyNDk3OWE5NDI2NTE3YTk5NmVjY2VjNGI3NWQ0ZTI2Yzc3ZjA1YWMiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvc3ltbGluay10ZXN0LXJvYnVzdG5lc3MtMjAyNjEwMTUtMDEvQ09ERV9SRVZJRVcubWQifSwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6MmQ2MWRhNzZhNzFmNWQyMjI5MGU0NmQwNGI2MzNhNjc0YTJjZjVhOTYxNTFmY2UzMmNkYzZlZmQ4MTM1ZjY1NiIsInN0YXR1cyI6ImRvbmUiLCJzdGVwIjoicmV2aWV3In0sInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6ImIyY2I5Njk1LTE2YTgtNDFmMC05ZjM2LWE5OGQ3OTVhMjU3YSIsInJldmlzaW9uIjo2fSwiZXhwZWN0ZWRfcmV2aXNpb25faWQiOiI0M2RmMDU2Yi02MDFkLTRiNTMtOGI3OS1kNTZkY2M3NmZjY2MiLCJraW5kIjoic3RlcC5yZWNvcmQiLCJvcGVyYXRpb25faWQiOiI1YTQxMzk0MC1kNTBkLTQ5MzgtYTFkMy1mOGVlMTRmYjk3MTAiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVxdWVzdF9kaWdlc3QiOiJzaGEyNTY6MWQ4NGJjMWMyOWM1ZTJiMGJkMjE3MzdlN2I4M2EwYjdkZTFjMzI4ZGYyZWJhMzM1NzU5YWJkZWJkNWI0NDc5ZiIsInJ1bl9pZCI6InN5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwidGFyZ2V0X2lkIjoic2hhMjU2OmFmYjMxODczZWZhOTFkODkyYjkwNDY2MzEyNjhkNzlmMWM4Y2I0M2FhMzkyYzBlZjVlNGQyZmQ1MDAyOTNmMTAifQ |

## Evidence Bindings

- schema_version: 1

| operation_id | binding |
|---|---|
| 4110cfd3-e3bb-4f3a-9311-95824116b870 | eyJhY3Rpb24iOiJzdGVwLnJlY29yZCIsImFzc3VyYW5jZSI6eyJpbmRlcGVuZGVudF9odW1hbl9wcm9vZiI6InVuYXZhaWxhYmxlIiwibGFuZSI6ImNvb3BlcmF0aXZlX2xvY2FsIiwicmVwbHlfcHJvdmVuYW5jZSI6ImNhbGxlcl9mb3J3YXJkZWRfZGVsaWJlcmF0ZV9yZXBseSJ9LCJvcGVyYXRpb25faWQiOiI0MTEwY2ZkMy1lM2JiLTRmM2EtOTMxMS05NTgyNDExNmI4NzAiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVwb3J0Ijp7ImRpZ2VzdCI6InNoYTI1NjozYTJmNmY4MGEyMzVkMDEyOTBhZTU3OTcwMzYzMTlhZjA1MjdhMzM3MjNjMTdjZTY2NTA1OGU5NTNmMWQ0OGE4IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3N5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxL0NEX1RFU1RTLm1kIn0sInJ1bl9pZCI6InN5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6NTM4YTkwMDU1YzQ4ZTdhZWFkMzkwY2Y0ZmQ4M2ZkZmQ1YTI5OTBhMzM0M2E3Yzk5NTBjYzlhMjgyMWMwZjBmOSIsInNvdXJjZXMiOlt7ImRpZ2VzdCI6InNoYTI1Njo0Yzk0MmFiMWNjYzg0YzQ5NDdkNmEyNjZjYmE3MWIzYzhjNjJkMmZkOGQ4M2NjNjQwZjFkNDBlZjU2NzJhZWJmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3N5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxL1VSLm1kIiwic3RhdHVzIjoiYXBwcm92ZWQiLCJ0eXBlIjoiVVIifSx7ImRpZ2VzdCI6bnVsbCwicGF0aCI6IiIsInN0YXR1cyI6Im1pc3NpbmciLCJ0eXBlIjoiUFJEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlNEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlRQIn1dLCJzdGVwIjoiZXZpZGVuY2UifQ |
| 5a413940-d50d-4938-a1d3-f8ee14fb9710 | eyJhY3Rpb24iOiJzdGVwLnJlY29yZCIsImFzc3VyYW5jZSI6eyJpbmRlcGVuZGVudF9odW1hbl9wcm9vZiI6InVuYXZhaWxhYmxlIiwibGFuZSI6ImNvb3BlcmF0aXZlX2xvY2FsIiwicmVwbHlfcHJvdmVuYW5jZSI6ImNhbGxlcl9mb3J3YXJkZWRfZGVsaWJlcmF0ZV9yZXBseSJ9LCJvcGVyYXRpb25faWQiOiI1YTQxMzk0MC1kNTBkLTQ5MzgtYTFkMy1mOGVlMTRmYjk3MTAiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVwb3J0Ijp7ImRpZ2VzdCI6InNoYTI1NjoyMTU1ODA1YmU4ZmZlODQwMGJjMmUzNGI5MjQ5NzlhOTQyNjUxN2E5OTZlY2NlYzRiNzVkNGUyNmM3N2YwNWFjIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3N5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxL0NPREVfUkVWSUVXLm1kIn0sInJ1bl9pZCI6InN5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6MmQ2MWRhNzZhNzFmNWQyMjI5MGU0NmQwNGI2MzNhNjc0YTJjZjVhOTYxNTFmY2UzMmNkYzZlZmQ4MTM1ZjY1NiIsInNvdXJjZXMiOlt7ImRpZ2VzdCI6InNoYTI1Njo0Yzk0MmFiMWNjYzg0YzQ5NDdkNmEyNjZjYmE3MWIzYzhjNjJkMmZkOGQ4M2NjNjQwZjFkNDBlZjU2NzJhZWJmIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL3N5bWxpbmstdGVzdC1yb2J1c3RuZXNzLTIwMjYxMDE1LTAxL1VSLm1kIiwic3RhdHVzIjoiYXBwcm92ZWQiLCJ0eXBlIjoiVVIifSx7ImRpZ2VzdCI6bnVsbCwicGF0aCI6IiIsInN0YXR1cyI6Im1pc3NpbmciLCJ0eXBlIjoiUFJEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlNEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlRQIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IkNEK1Rlc3RzIn1dLCJzdGVwIjoicmV2aWV3In0 |
