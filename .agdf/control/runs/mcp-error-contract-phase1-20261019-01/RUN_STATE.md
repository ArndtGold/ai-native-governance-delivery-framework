# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: mcp-error-contract-phase1-20261019-01
- lifecycle: active
- revision: 5
- revision_id: 946d17fd-9741-45f3-adc9-a19ceb9ce8dd
- content_seal: sha256:1bf2d9efb2a668d84433495de88b2cd2ea30449b0e9063439228d13abb1e291e
- approval_seal: sha256:a4901fc69abbbf5518f33bcb06b8ac97781fe7bc094289888e1df03a98feaeaf
- updated_at: 2026-10-19T14:00:24.692Z
- mode: structured_delivery
- current_gate: PRD
- decision: in_progress
- owner: agent

## Objective

Make actual AGDF MCP tool failures unambiguously recognizable and actionable. The agent and user must be able to understand what failed, what is known about its effects, and how to correct the request or obtain the missing prerequisite without bypassing governance. Check the approach against authoritative external sources before product and implementation decisions.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UX Intent Definition result recorded: ready. |
| What is approved? | Approval: UR |
| What is missing? | Exact Approval: PRD. |
| What is the next allowed action? | Draft or refine the PRD; do not implement before PRD, SD and TP are approved. |
| What is explicitly forbidden right now? | create SD; create TP; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-19 · revision 2 · `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md` sha256:ff970aa070047b04 · presentation c31d8ed8-0460-4bd1-b786-2d51b859a4c8 sha256:859a6472b3be8e829dedc11de94bc04838cd46a38c659ff93653eb5fa406893b |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |
| UX Intent Definition | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UX_INTENT_DEFINITION.md | done | Recorded exact internal result; operation 5e532386-9d8b-447f-9a7d-606f245eda52 |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: externally consumed MCP error signalling and recovery feedback change a compatibility-sensitive contract; structured_slice rejected because full_depth_impacts_absent fails on that evidenced boundary.
- evidence: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-19 · revision 2 · `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md` sha256:ff970aa070047b04 · presentation c31d8ed8-0460-4bd1-b786-2d51b859a4c8 sha256:859a6472b3be8e829dedc11de94bc04838cd46a38c659ff93653eb5fa406893b |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_delivery` | direct |
| UX Intent Definition | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UX_INTENT_DEFINITION.md | approved TP scope | bound cooperative result |

## Closeout

- next_allowed_action: Draft or refine the PRD; do not implement before PRD, SD and TP are approved.
- quality_outlook:

## Run Operations

- schema_version: 1

| operation_id | request_digest | receipt |
|---|---|---|
| 5e532386-9d8b-447f-9a7d-606f245eda52 | sha256:77f4a18eee5bab02a66bb983631bd1313a21b42da2dcca4ece9380b878b390ca | eyJhc3N1cmFuY2UiOnsiaW5kZXBlbmRlbnRfaHVtYW5fcHJvb2YiOiJ1bmF2YWlsYWJsZSIsImxhbmUiOiJjb29wZXJhdGl2ZV9sb2NhbCIsInJlcGx5X3Byb3ZlbmFuY2UiOiJjYWxsZXJfZm9yd2FyZGVkX2RlbGliZXJhdGVfcmVwbHkifSwiY3JlYXRlZF9hdCI6IjIwMjYtMTAtMTlUMTQ6MDA6MjQuNjE0WiIsImVmZmVjdCI6eyJwcmV2aW91c19yZXZpc2lvbl9pZCI6IjQ3ZDYwODk5LTQzOWEtNDg0Mi04MGVmLWNlZWUxODFmMzFlMSIsInJlY29yZCI6eyJjb3ZlcnMiOiJhcHByb3ZlZCBUUCBzY29wZSIsInNvdXJjZSI6eyJkaWdlc3QiOiJzaGEyNTY6OWM5M2M2ZTE2ZmRjNjFkN2YwYTQyNzMyZjcwZGQ5OWQxZDg4NzNkZDgxOTRjM2IwYTQzZmZhNDdhNTU2NzVhMiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9tY3AtZXJyb3ItY29udHJhY3QtcGhhc2UxLTIwMjYxMDE5LTAxL1VYX0lOVEVOVF9ERUZJTklUSU9OLm1kIn0sInNvdXJjZV9zZXRfZGlnZXN0Ijoic2hhMjU2OjY2Mjk1NTUyNTIwOTNmNDdjODRjZmU3NzQ4Mjc3MGVkMzkwMmUzZGExYmRmOTlhYmRjZmQxZDczNGEyOTI3MDciLCJzdGF0dXMiOiJkb25lIiwic3RlcCI6IlVYIEludGVudCBEZWZpbml0aW9uIn0sInJlc3VsdGluZ19yZXZpc2lvbl9pZCI6Ijk0NmQxN2ZkLTk3NDEtNDVmMy1hZGM5LWExOWNlYjljZThkZCIsInJldmlzaW9uIjo1fSwiZXhwZWN0ZWRfcmV2aXNpb25faWQiOiI0N2Q2MDg5OS00MzlhLTQ4NDItODBlZi1jZWVlMTgxZjMxZTEiLCJraW5kIjoic3RlcC5yZWNvcmQiLCJvcGVyYXRpb25faWQiOiI1ZTUzMjM4Ni05ZDhiLTQ0N2YtOWE3ZC02MDZmMjQ1ZWRhNTIiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVxdWVzdF9kaWdlc3QiOiJzaGEyNTY6NzdmNGExOGVlZTViYWIwMmE2NmJiOTgzNjMxYmQxMzEzYTIxYjQyZGEyZGNjYTRlY2U5MzgwYjg3OGIzOTBjYSIsInJ1bl9pZCI6Im1jcC1lcnJvci1jb250cmFjdC1waGFzZTEtMjAyNjEwMTktMDEiLCJzY2hlbWFfdmVyc2lvbiI6IjEiLCJ0YXJnZXRfaWQiOiJzaGEyNTY6YTVjMWRhZWU3ODg2ZjgxZDI3YjJiNzcxODcxOGZhN2EzODIyYjI3YTRiYzFkMDU3Zjk5YWYwMWJlNzY4OGExOSJ9 |

## Evidence Bindings

- schema_version: 1

| operation_id | binding |
|---|---|
| 5e532386-9d8b-447f-9a7d-606f245eda52 | eyJhY3Rpb24iOiJzdGVwLnJlY29yZCIsImFzc3VyYW5jZSI6eyJpbmRlcGVuZGVudF9odW1hbl9wcm9vZiI6InVuYXZhaWxhYmxlIiwibGFuZSI6ImNvb3BlcmF0aXZlX2xvY2FsIiwicmVwbHlfcHJvdmVuYW5jZSI6ImNhbGxlcl9mb3J3YXJkZWRfZGVsaWJlcmF0ZV9yZXBseSJ9LCJvcGVyYXRpb25faWQiOiI1ZTUzMjM4Ni05ZDhiLTQ0N2YtOWE3ZC02MDZmMjQ1ZWRhNTIiLCJwcm9kdWNlciI6eyJjb250cmFjdCI6InJ1bi1jb21tYW5kLzEiLCJwYWNrYWdlX3ZlcnNpb24iOiIwLjE0LjUifSwicmVwb3J0Ijp7ImRpZ2VzdCI6InNoYTI1Njo5YzkzYzZlMTZmZGM2MWQ3ZjBhNDI3MzJmNzBkZDk5ZDFkODg3M2RkODE5NGMzYjBhNDNmZmE0N2E1NTY3NWEyIiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcnJvci1jb250cmFjdC1waGFzZTEtMjAyNjEwMTktMDEvVVhfSU5URU5UX0RFRklOSVRJT04ubWQifSwicnVuX2lkIjoibWNwLWVycm9yLWNvbnRyYWN0LXBoYXNlMS0yMDI2MTAxOS0wMSIsInNjaGVtYV92ZXJzaW9uIjoiMSIsInNvdXJjZV9zZXRfZGlnZXN0Ijoic2hhMjU2OjY2Mjk1NTUyNTIwOTNmNDdjODRjZmU3NzQ4Mjc3MGVkMzkwMmUzZGExYmRmOTlhYmRjZmQxZDczNGEyOTI3MDciLCJzb3VyY2VzIjpbeyJkaWdlc3QiOiJzaGEyNTY6ZmY5NzBhYTA3MDA0N2IwNGEwZDIxNzRhMjc1OWJlZDk5NmRkNjIzMzZkMWRlYzUxYzMxODQ4MDQyZWNlYTlhZiIsInBhdGgiOiIuYWdkZi9jb250cm9sL2FydGVmYWN0cy9tY3AtZXJyb3ItY29udHJhY3QtcGhhc2UxLTIwMjYxMDE5LTAxL1VSLm1kIiwic3RhdHVzIjoiYXBwcm92ZWQiLCJ0eXBlIjoiVVIifSx7ImRpZ2VzdCI6InNoYTI1NjpjYzE0ZGRlNzQ0YzBiMjhhYTMyMTBjMjNhYjU4ZDI4YTdiNjNkZjRhM2NhYWFmMTAzZGI0NmNmYWMxMzk5ZDY0IiwicGF0aCI6Ii5hZ2RmL2NvbnRyb2wvYXJ0ZWZhY3RzL21jcC1lcnJvci1jb250cmFjdC1waGFzZTEtMjAyNjEwMTktMDEvQlJPV05GSUVMRF9SRVZJRVcubWQiLCJzdGF0dXMiOiJkb25lIiwidHlwZSI6IkJyb3duZmllbGQgUmV2aWV3In1dLCJzdGVwIjoiVVggSW50ZW50IERlZmluaXRpb24ifQ |
