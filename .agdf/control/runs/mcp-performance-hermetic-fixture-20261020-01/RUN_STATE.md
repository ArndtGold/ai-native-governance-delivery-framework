# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: mcp-performance-hermetic-fixture-20261020-01
- lifecycle: completed
- revision: 8
- revision_id: 43663195-6962-4bcc-91d3-c6a74024d6bc
- content_seal: sha256:6db8e0471184580701021d69019fa8e9dd6cf8ad0e28bfc16ed9a51e44ba701a
- approval_seal: sha256:e70c6fbce0d45d12d9cc7c1cf63137c418f7ad1f3680211aa8ec59d06304a219
- updated_at: 2026-10-20T06:18:55.360Z
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

The MCP performance test measures the approved budgets on a fixed, recorded fixture that does not grow with the repository's run history and does not depend on unrelated runs, so that its result reflects the dispatch path and runner variance only. The budgets stay unchanged.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Quick task delivered; OR-lite at `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/OR.md`. |
| What is approved? | Approval: UR |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Run completed; prepare a VCS handoff only when explicitly requested. |
| What is explicitly forbidden right now? | repeat completed Run work; perform VCS or release actions automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-20 · revision 2 · `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md` sha256:333adea870ce5545 · presentation 6bc59ab9-4a33-4393-8b87-015171d080aa sha256:f84c0ee9607f2c3a29d49abd9ab9348fb730cf56042b34b8e1a9e7c48d86288b |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR | .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/CODE_REVIEW.md | done | Bound actual Code Review result |
| QA |  | missing |  |
| OR | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/OR.md` | done |  |

## Mode/Slice Decision

- decision: quick_task
- required_next_gate: Quick Task Execution
- scope_reason: Compact Delivery: bounded test-infrastructure change in packages/mcp-server/test (opt-in run selection in createOwnedRuntimeFixture, used by performance.test.js with fixture-size evidence); no product semantics, architecture, policy, persistence, public interface or release impact; owner chose the option and unchanged budgets on 2026-10-19.
- evidence: .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-20 · revision 2 · `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md` sha256:333adea870ce5545 · presentation 6bc59ab9-4a33-4393-8b87-015171d080aa sha256:f84c0ee9607f2c3a29d49abd9ab9348fb730cf56042b34b8e1a9e7c48d86288b |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `quick_task` | direct |
| CD+Tests: hermetic fixture implemented; new test.performance passes 7/7 locally (warm p95 662-849 ms); A/B previous full-control test failed 2/3; result equivalence and default-path consumer suites pass | .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/CD_TESTS.md; .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/evidence/PERFORMANCE_EVIDENCE.json | UR acceptance signals 1-5 | direct |
| Code Review | .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/CODE_REVIEW.md | decision pass: Code Review of owned-runtime.js and performance.test.js diff plus independent reviewer; CR-01 and CR-02 resolved; default path, budgets and assertions unchanged | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/CODE_REVIEW_SOURCE-01.md | direct |
| OR-lite | `.agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/OR.md` | quick task closeout | direct |

## Closeout

- next_allowed_action: Run completed; prepare a VCS handoff only when explicitly requested.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| db1c4a31-4107-4b02-ae18-f66172d46d64 | sha256:36e158dc30eebe5528861920c1ac7a27b3d882782ea51aec726c9dd4405aad89 | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMjBUMDY6MTg6MzAuMTM0WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjViZDYzM2U3LTNiMzgtNDNjOC05MmUyLTdmYmZkNjcxZWNhZSIsInJlY29yZCI6eyJjb3ZlcnMiOiJzZWxlY3RlZCBSdW4gc2NvcGUiLCJzb3VyY2UiOnsiZGlnZXN0Ijoic2hhMjU2OjQ3MzFmMWYwOTdmMTQ5ODJhNDgzNjg4Y2MxYzM2MDUxZDlmMGNmY2ViOGUwY2I4NTI4YjRjNjFmZDc3ZDliNjUiLCJwYXRoIjoiLmFnZGYvY29udHJvbC9hcnRlZmFjdHMvbWNwLXBlcmZvcm1hbmNlLWhlcm1ldGljLWZpeHR1cmUtMjAyNjEwMjAtMDEvQ09ERV9SRVZJRVcubWQifSwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6MWUzYWQ1ZWY5YWM1MTFiNTFhYmI3ZTlhZmQzNWViZDc0NDk5M2YyZjk5NDc2Y2ZmMzhlMzZjYzc4YWQ5MDhmMyIsInN0YXR1cyI6ImRvbmUiLCJzdGVwIjoicmV2aWV3In0sInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6IjJmOWJhZjBlLTlmYWYtNGI5Yi1iNWNjLThiMzEzYTI2MzU1OSIsInJldmlzaW9uIjo3fSwiZXhwZWN0ZWRfcmV2aXNpb25faWQiOiI1YmQ2MzNlNy0zYjM4LTQzYzgtOTJlMi03ZmJmZDY3MWVjYWUiLCJraW5kIjoic3RlcC5yZWNvcmQiLCJvcGVyYXRpb25faWQiOiJkYjFjNGEzMS00MTA3LTRiMDItYWUxOC1mNjYxNzJkNDZkNjQiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVxdWVzdF9kaWdlc3QiOiJzaGEyNTY6MzZlMTU4ZGMzMGVlYmU1NTI4ODYxOTIwYzFhYzdhMjdiM2Q4ODI3ODJlYTUxYWVjNzI2YzlkZDQ0MDVhYWQ4OSIsInJ1bl9pZCI6Im1jcC1wZXJmb3JtYW5jZS1oZXJtZXRpYy1maXh0dXJlLTIwMjYxMDIwLTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwidGFyZ2V0X2lkIjoic2hhMjU2OjBiMzcxMmNmMzhiZDE2YjkyZjgxZTE4ZjlmYWM3ZjI5OGE3NTZkM2Q0OWI5YjI2OGFkMzBhNTIzMzI4ZjI4YmYifQ |

## Evidence Bindings

- schema_version: 1

| operation_id | binding |
|---|---|
| db1c4a31-4107-4b02-ae18-f66172d46d64 | eyJhY3Rpb24iOiJzdGVwLnJlY29yZCIsImFzc3VyYW5jZSI6eyJpbmRlcGVuZGVudF9odW1hbl9wcm9vZiI6InVuYXZhaWxhYmxlIiwibGFuZSI6ImNvb3BlcmF0aXZlX2xvY2FsIiwicmVwbHlfcHJvdmVuYW5jZSI6ImNhbGxlcl9mb3J3YXJkZWRfZGVsaWJlcmF0ZV9yZXBseSJ9LCJvcGVyYXRpb25faWQiOiJkYjFjNGEzMS00MTA3LTRiMDItYWUxOC1mNjYxNzJkNDZkNjQiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVwb3J0Ijp7ImRpZ2VzdCI6InNoYTI1Njo0NzMxZjFmMDk3ZjE0OTgyYTQ4MzY4OGNjMWMzNjA1MWQ5ZjBjZmNlYjhlMGNiODUyOGI0YzYxZmQ3N2Q5YjY1IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1wZXJmb3JtYW5jZS1oZXJtZXRpYy1maXh0dXJlLTIwMjYxMDIwLTAxL0NPREVfUkVWSUVXLm1kIn0sInJ1bl9pZCI6Im1jcC1wZXJmb3JtYW5jZS1oZXJtZXRpYy1maXh0dXJlLTIwMjYxMDIwLTAxIiwic2NoZW1hX3ZlcnNpb24iOiIxIiwic291cmNlX3NldF9kaWdlc3QiOiJzaGEyNTY6MWUzYWQ1ZWY5YWM1MTFiNTFhYmI3ZTlhZmQzNWViZDc0NDk5M2YyZjk5NDc2Y2ZmMzhlMzZjYzc4YWQ5MDhmMyIsInNvdXJjZXMiOlt7ImRpZ2VzdCI6InNoYTI1NjozMzNhZGVhODcwY2U1NTQ1MjI0NzlhMjU0MGJkMTQ1OTE5MTZkODQ0ZTZlYzI5MzY0MGI2ZDE5YmE4ZDJlNmFhIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1wZXJmb3JtYW5jZS1oZXJtZXRpYy1maXh0dXJlLTIwMjYxMDIwLTAxL1VSLm1kIiwic3RhdHVzIjoiYXBwcm92ZWQiLCJ0eXBlIjoiVVIifSx7ImRpZ2VzdCI6bnVsbCwicGF0aCI6IiIsInN0YXR1cyI6Im1pc3NpbmciLCJ0eXBlIjoiUFJEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlNEIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IlRQIn0seyJkaWdlc3QiOm51bGwsInBhdGgiOiIiLCJzdGF0dXMiOiJtaXNzaW5nIiwidHlwZSI6IkNEK1Rlc3RzIn1dLCJzdGVwIjoicmV2aWV3In0 |
